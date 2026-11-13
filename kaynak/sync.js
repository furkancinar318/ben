/* ===== Şifreli senkronizasyon (Supabase) ===== */
// Supabase projesi oluşturulunca buraya yazılır; boşsa Ayarlar'dan girilebilir.
const APP_CONFIG = { supabaseUrl: 'https://omieemczsuqstuehcrtu.supabase.co', supabaseKey: 'sb_publishable_C8y1wMv8qvFrXAhGX4F8Ew_uTFhzpB9' };

const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function zip(u8, dir) {
  const st = new Blob([u8]).stream().pipeThrough(dir ? new CompressionStream('gzip') : new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(st).arrayBuffer());
}
async function deriveKey(pass, saltB64) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(saltB64), iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptState(obj, key) {
  let bytes = new TextEncoder().encode(JSON.stringify(obj)); let z = false;
  if (window.CompressionStream) { bytes = await zip(bytes, true); z = true; }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  return { data: (z ? 'z:' : 'r:') + b64(ct), iv: b64(iv) };
}
async function decryptState(row, key) {
  let pt = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(row.iv) }, key, unb64(row.data.slice(2))));
  if (row.data.startsWith('z:')) pt = await zip(pt, false);
  return JSON.parse(new TextDecoder().decode(pt));
}

let Meta = { baseRev: 0, dirty: false, updatedAt: 0 };
const Sync = {
  cfg: null, key: null, busy: false, again: false, err: '', last: 0, timer: null,
  async load() {
    this.cfg = await Store.get('sync');
    try { this.key = await Store.get('synckey'); if (this.key && !(this.key instanceof CryptoKey)) this.key = null; } catch (e) { this.key = null; }
    Meta = { ...Meta, ...(await Store.get('meta') || {}) };
  },
  url() { return (this.cfg?.url || APP_CONFIG.supabaseUrl || '').replace(/\/+$/, ''); },
  apikey() { return this.cfg?.key || APP_CONFIG.supabaseKey; },
  on() { return !!(this.cfg && this.cfg.refresh && this.key); },
  saveCfg() { return Store.set('sync', this.cfg); },
  async auth(path, body) {
    const r = await fetch(this.url() + '/auth/v1/' + path, { method: 'POST', headers: { apikey: this.apikey(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(trErr(j.error_description || j.msg || j.message || j.error || ('Hata ' + r.status)));
    return j;
  },
  async setSession(j) {
    this.cfg = { ...(this.cfg || {}), access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user?.id || this.cfg?.uid, email: j.user?.email || this.cfg?.email };
    await this.saveCfg();
  },
  async token() {
    if (this.cfg.exp - Date.now() > 60000) return;
    await this.setSession(await this.auth('token?grant_type=refresh_token', { refresh_token: this.cfg.refresh }));
  },
  async api(path, opts = {}) {
    await this.token();
    const r = await fetch(this.url() + '/rest/v1/' + path, { ...opts, headers: { apikey: this.apikey(), Authorization: 'Bearer ' + this.cfg.access, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    const t = await r.text();
    if (!r.ok) { let m = t; try { m = JSON.parse(t).message || t; } catch (e) {} throw new Error(trErr(m.slice(0, 160) || 'Hata ' + r.status)); }
    return t ? JSON.parse(t) : null;
  },
  remote(cols = 'rev,updated_at,salt') { return this.api(`vault?select=${cols}&user_id=eq.${this.cfg.uid}`).then(r => r[0] || null); },
  async push(expectRev) {
    const enc = await encryptState(S, this.key);
    const now = new Date().toISOString();
    let rows;
    if (expectRev == null) rows = await this.api('vault', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ user_id: this.cfg.uid, ...enc, salt: this.cfg.salt, rev: 1, updated_at: now }) });
    else rows = await this.api(`vault?user_id=eq.${this.cfg.uid}&rev=eq.${expectRev}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...enc, rev: expectRev + 1, updated_at: now }) });
    if (!rows || !rows.length) return false; // başka cihaz araya girdi
    Meta.baseRev = rows[0].rev; Meta.dirty = false; await Store.set('meta', Meta); return true;
  },
  async applyRemote(row) {
    const data = await decryptState(row, this.key);
    S = merge(DEFAULT_STATE(), data); await Store.set('state', S);
    Meta.baseRev = row.rev; Meta.dirty = false; Meta.updatedAt = Date.parse(row.updated_at); await Store.set('meta', Meta);
    if (await Store.get('clearlock')) { // kilit şifresi unutulup cihaz sıfırlandıysa eski kilidi geri getirme
      await Store.set('clearlock', null);
      if (S.settings.lock || S.settings.pin) { S.settings.lock = null; S.settings.pin = ''; save(); toast('Uygulama kilidi kaldırıldı; Ayarlar\'dan yenisini koyabilirsin'); }
    }
    const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (!sheetStack.length && !typing) render(); else this.pendingRender = true;
  },
  async run() {
    if (!this.on() || !navigator.onLine) return;
    if (this.busy) { this.again = true; return; }
    this.busy = true; this.err = '';
    try {
      for (let tries = 0; tries < 3; tries++) {
        const r = await this.remote();
        if (!r) { if (await this.push(null)) break; continue; }
        if (r.rev === Meta.baseRev) { if (!Meta.dirty || await this.push(r.rev)) break; continue; }
        // Bulutta daha yeni sürüm var
        const full = await this.remote('*');
        if (Meta.dirty) {
          const remoteT = Date.parse(full.updated_at);
          if (Meta.updatedAt > remoteT) { // bu cihaz daha yeni: buluttakini yedekle, bizimkini yükle
            try { await Store.set('conflict', { at: Date.now(), from: 'bulut', state: await decryptState(full, this.key) }); } catch (e) {}
            if (await this.push(full.rev)) break; continue;
          }
          await Store.set('conflict', { at: Date.now(), from: 'bu cihaz', state: JSON.parse(JSON.stringify(S)) });
          toast('Başka cihazdaki daha yeni değişiklikler alındı');
        }
        await this.applyRemote(full); break;
      }
      this.last = Date.now();
    } catch (e) { this.err = e.message || String(e); }
    this.busy = false; this.paint();
    if (this.again) { this.again = false; this.run(); }
  },
  schedule(ms = 2500) { if (!this.on()) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), ms); },
  paint() { const el = $('#syncstat'); if (el) el.innerHTML = syncStatusHTML(); if (this.pendingRender && !sheetStack.length) { this.pendingRender = false; } },
  async signOut() { this.cfg = { url: this.cfg?.url, key: this.cfg?.key }; this.key = null; await this.saveCfg(); await Store.set('synckey', null); Meta.baseRev = 0; await Store.set('meta', Meta); }
};
function trErr(m) {
  const map = [[/Invalid login credentials/i, 'E-posta veya şifre hatalı'], [/Email not confirmed/i, 'E-posta adresin henüz onaylanmadı — gelen kutundaki bağlantıya tıkla'], [/User already registered/i, 'Bu e-posta ile zaten hesap var, giriş yap'], [/Password should be at least/i, 'Şifre en az 6 karakter olmalı'], [/Failed to fetch|NetworkError|Load failed/i, 'Sunucuya ulaşılamadı (internet veya adres hatalı)'], [/relation .*vault.* does not exist|Could not find the table/i, 'Supabase\'de "vault" tablosu yok — kurulum SQL\'ini çalıştır'], [/rate limit/i, 'Çok fazla deneme, biraz bekle']];
  for (const [r, t] of map) if (r.test(m)) return t; return m;
}
function syncStatusHTML() {
  if (!Sync.on()) return '<span class="muted">Kapalı — veriler sadece bu cihazda</span>';
  if (Sync.busy) return '<span style="color:var(--accent)">⟳ Eşitleniyor…</span>';
  if (Sync.err) return `<span style="color:var(--bad)">⚠︎ ${esc(Sync.err)}</span>`;
  if (!navigator.onLine) return '<span class="muted">İnternet yok — bağlanınca eşitlenecek</span>';
  if (Meta.dirty) return '<span class="muted">Değişiklikler gönderilecek…</span>';
  return `<span style="color:var(--ok)">✓ Eşitlendi${Sync.last ? ' · ' + new Date(Sync.last).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>`;
}
function hasLocalData() {
  return S.journal.length + S.todos.length + S.notes.length + S.workout.days.length + S.workout.logs.length + S.books.length + S.movies.length + S.shopping.length + S.habits.length + Object.keys(S.diet.log).length > 0;
}

/* Kurulum ekranları */
function syncSetup(welcome = false) {
  const s = openSheet({
    title: welcome ? 'Hoş geldin 👋' : 'Hesabına giriş yap', left: welcome ? 'Sonra' : 'Vazgeç', full: welcome,
    onClose: welcome ? () => { if (!Sync.on()) { S.settings.skipLogin = true; save(); } } : null,
    body: `${welcome ? '<div style="text-align:center;font-size:54px;margin:10px 0">🔐</div>' : ''}<p class="small muted" style="margin-top:0">Telefon, tablet ve bilgisayarında aynı hesapla giriş yap; verilerin hepsinde aynı olsun. Veriler cihazından çıkmadan önce şifrelenir — sunucu dahil kimse okuyamaz.</p>
    ${APP_CONFIG.supabaseUrl ? '' : `<div class="field"><label>Supabase proje adresi (URL)</label><input id="su" placeholder="https://xxxx.supabase.co" value="${esc(Sync.cfg?.url || '')}" autocapitalize="off"></div><div class="field"><label>Supabase anon (public) key</label><input id="sk" value="${esc(Sync.cfg?.key || '')}" autocapitalize="off"></div>`}
    <div class="field"><label>E-posta</label><input id="se" type="email" autocomplete="username" value="${esc(Sync.cfg?.email || '')}" autocapitalize="off"></div>
    <div class="field"><label>Hesap şifresi</label><input id="sp" type="password" autocomplete="current-password"></div>
    <button class="btn full" id="sin" style="margin-bottom:8px">Giriş yap</button><button class="btn plain full" id="sup">Yeni hesap oluştur</button><div class="small" id="smsg" style="margin-top:12px;text-align:center"></div>${welcome ? '<p class="tiny muted" style="text-align:center;margin-top:18px">"Sonra" dersen uygulamayı sadece bu cihazda kullanırsın; istediğin zaman Ayarlar → Senkronizasyon\'dan giriş yapabilirsin.</p>' : ''}`
  });
  const msg = (t, bad) => { const m = s.sh.querySelector('#smsg'); m.textContent = t; m.style.color = bad ? 'var(--bad)' : 'var(--muted)'; };
  const go2 = async kind => {
    const u = s.sh.querySelector('#su'), k = s.sh.querySelector('#sk');
    Sync.cfg = { ...(Sync.cfg || {}), url: u ? u.value.trim() : Sync.cfg?.url, key: k ? k.value.trim() : Sync.cfg?.key };
    const email = s.sh.querySelector('#se').value.trim(), password = s.sh.querySelector('#sp').value;
    if (!Sync.url() || !Sync.apikey()) return msg('Supabase adresi ve anahtarı gerekli', true);
    if (!email || !password) return msg('E-posta ve şifre gir', true);
    msg('Bekle…');
    try {
      if (kind === 'up') {
        const j = await Sync.auth('signup?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email, password });
        if (!j.access_token) { Sync.cfg.email = email; await Sync.saveCfg(); return msg('Hesap oluşturuldu! ✉️ E-postana gelen onay bağlantısına bas — uygulama açılıp kaldığın yerden devam eder. (Gelmezse spam klasörüne bak.)'); }
        await Sync.setSession(j);
      } else await Sync.setSession(await Sync.auth('token?grant_type=password', { email, password }));
      S.settings.skipLogin = false; s.onClose = null; closeSheet(s); passSetup();
    } catch (e) { msg(e.message, true); }
  };
  s.sh.querySelector('#sin').onclick = () => go2('in');
  s.sh.querySelector('#sup').onclick = () => go2('up');
}
async function passSetup() {
  let row = null;
  try { row = await Sync.remote('*'); } catch (e) { toast(e.message); return; }
  const isNew = !row;
  const s = openSheet({
    title: isNew ? 'Şifreleme şifresi belirle' : 'Şifreleme şifren', left: 'Vazgeç',
    body: isNew ? `<p class="small">Bu şifre verilerini kilitler. Hesap şifrenden <b>farklı</b> olsun, en az 8 karakter.</p>
      <div class="card" style="background:rgba(255,176,32,.12)"><b>⚠︎ Önemli:</b> <span class="small">Bu şifreyi unutursan verilerin <b>hiçbir şekilde kurtarılamaz</b> — biz de, Supabase de açamaz. Bir yere not et.</span></div>
      <div class="field"><label>Şifreleme şifresi</label><input id="k1" type="password" autocomplete="new-password"></div><div class="field"><label>Tekrar</label><input id="k2" type="password" autocomplete="new-password"></div><button class="btn full" id="kgo">Şifrele ve yükle</button><div class="small" id="kmsg" style="margin-top:10px;text-align:center"></div>`
      : `<p class="small">Bu hesapta şifrelenmiş veriler var. Açmak için diğer cihazda belirlediğin <b>şifreleme şifresini</b> gir.</p><div class="field"><label>Şifreleme şifresi</label><input id="k1" type="password"></div><button class="btn full" id="kgo">Kilidi aç</button><div class="small" id="kmsg" style="margin-top:10px;text-align:center"></div>`
  });
  const msg = (t, bad) => { const m = s.sh.querySelector('#kmsg'); m.textContent = t; m.style.color = bad ? 'var(--bad)' : 'var(--muted)'; };
  s.sh.querySelector('#kgo').onclick = async () => {
    const p1 = s.sh.querySelector('#k1').value;
    if (isNew) {
      if (p1.length < 8) return msg('En az 8 karakter olmalı', true);
      if (p1 !== s.sh.querySelector('#k2').value) return msg('Şifreler aynı değil', true);
      msg('Şifreleniyor…');
      Sync.cfg.salt = b64(crypto.getRandomValues(new Uint8Array(16))); await Sync.saveCfg();
      Sync.key = await deriveKey(p1, Sync.cfg.salt);
      try { await Store.set('synckey', Sync.key); } catch (e) {}
      Meta.baseRev = 0; Meta.dirty = true;
      try { await Sync.push(null); } catch (e) { return msg(e.message, true); }
      closeSheet(s); render(); toast('☁︎ Senkronizasyon açıldı');
    } else {
      msg('Kontrol ediliyor…');
      const key = await deriveKey(p1, row.salt);
      let data; try { data = await decryptState(row, key); } catch (e) { return msg('Şifre yanlış', true); }
      Sync.key = key; Sync.cfg.salt = row.salt; await Sync.saveCfg();
      try { await Store.set('synckey', key); } catch (e) {}
      closeSheet(s);
      const useCloud = async () => { await Store.set('conflict', { at: Date.now(), from: 'bu cihaz', state: JSON.parse(JSON.stringify(S)) }); await Sync.applyRemote(row); render(); toast('☁︎ Veriler buluttan alındı'); };
      if (!hasLocalData()) return useCloud();
      const c = openSheet({ title: 'Hangi veriler kalsın?', body: `<p class="small">Bu cihazda da veri var. Hangisini kullanalım? (Diğeri Ayarlar'da "Eski sürümü geri yükle" ile geri alınabilir.)</p><button class="btn full" id="c1" style="margin-bottom:8px">☁︎ Buluttakini kullan (önerilen)</button><button class="btn plain full" id="c2">📱 Bu cihazdakini buluta yükle</button>` });
      c.sh.querySelector('#c1').onclick = () => { closeSheet(c); useCloud(); };
      c.sh.querySelector('#c2').onclick = async () => { closeSheet(c); await Store.set('conflict', { at: Date.now(), from: 'bulut', state: data }); try { await Sync.push(row.rev); render(); toast('☁︎ Bu cihazdaki veriler yüklendi'); } catch (e) { toast(e.message); } };
    }
  };
}
async function restoreConflict() {
  const c = await Store.get('conflict'); if (!c) { toast('Eski sürüm yok'); return; }
  confirmSheet(`${new Date(c.at).toLocaleString('tr-TR')} tarihinde ayrılan "${c.from}" sürümü geri yüklensin mi? Şu anki veriler onunla değişir.`, async () => {
    const cur = JSON.parse(JSON.stringify(S)); S = merge(DEFAULT_STATE(), c.state); await Store.set('conflict', { at: Date.now(), from: 'geri yüklemeden önceki', state: cur }); save(); render(); toast('Geri yüklendi');
  }, 'Geri yükle');
}
function syncCard() {
  return `<div class="card"><h3>☁︎ Cihazlar arası senkronizasyon</h3><div class="small" id="syncstat" style="margin-bottom:10px">${syncStatusHTML()}</div>
  ${Sync.on() ? `<div class="small muted" style="margin-bottom:10px">${esc(Sync.cfg.email || '')} · uçtan uca şifreli 🔒</div><div class="row"><button class="btn plain sm grow" onclick="Sync.run()">Şimdi eşitle</button><button class="btn plain sm grow" onclick="confirmSheet('Bu cihazda oturum kapanacak; veriler bu cihazda kalır ama artık eşitlenmez.',async()=>{await Sync.signOut();render()},'Çıkış yap')">Çıkış yap</button></div>
  <button class="btn plain sm full" style="margin-top:8px" onclick="restoreConflict()">Eski sürümü geri yükle</button>`
  : `<button class="btn full" onclick="${Sync.cfg?.refresh ? 'passSetup()' : 'syncSetup()'}">Senkronizasyonu aç</button>`}</div>`;
}

/* E-posta onay bağlantısından dönüş: #access_token=...&refresh_token=... */
async function handleAuthRedirect() {
  const h = location.hash; if (!h.includes('access_token=')) return false;
  const p = new URLSearchParams(h.slice(1)); history.replaceState(null, '', location.pathname);
  if (p.get('error_description')) { toast(p.get('error_description')); return false; }
  try {
    Sync.cfg = { ...(Sync.cfg || {}) };
    await Sync.setSession({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: +p.get('expires_in') || 3600 });
    const u = await fetch(Sync.url() + '/auth/v1/user', { headers: { apikey: Sync.apikey(), Authorization: 'Bearer ' + Sync.cfg.access } }).then(r => r.json());
    Sync.cfg.uid = u.id; Sync.cfg.email = u.email; await Sync.saveCfg();
    toast('✓ E-posta onaylandı'); passSetup(); return true;
  } catch (e) { toast('Giriş tamamlanamadı: ' + e.message); return false; }
}
