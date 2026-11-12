/* ===== Yardımcılar ===== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseD(k); d.setDate(d.getDate() + n); return dkey(d); };
const today = () => dkey();
const fmtDate = (k, o = { day: 'numeric', month: 'long' }) => k ? parseD(k).toLocaleDateString('tr-TR', o) : '';
const fmtMoney = n => (Number(n) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₺';
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const r1 = n => Math.round(n * 10) / 10;
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const WD = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const WD_LONG = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const stars = n => { n = Math.round(n || 0); let s = ''; for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>'; return `<span class="stars">${s}</span>`; };

/* ===== Veri ===== */
const DEFAULT_STATE = () => ({
  v: 1,
  settings: { name: '', theme: 'auto', accent: '#6C63FF', pin: '', rest: 90, bookGoal: 12 },
  moods: {}, journal: [], habits: [], todos: [], notes: [], courses: [], goals: [], dates: [],
  outfits: { items: [], combos: [] }, shopping: [], books: [], movies: [],
  workout: { exercises: [], days: [], logs: [], active: null, exPhotos: {} },
  diet: { targets: { kcal: 2200, p: 140, c: 240, f: 70, water: 2500 }, foods: [], log: {}, water: {}, weight: [], plan: [] }
});
let S = DEFAULT_STATE();

const Store = {
  db: null,
  open() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('ben-app', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; res(true); };
        r.onerror = () => res(false);
      } catch (e) { res(false); }
    });
  },
  get(k) {
    return new Promise(res => {
      if (!this.db) { try { res(JSON.parse(localStorage.getItem(k))); } catch (e) { res(null); } return; }
      try { const q = this.db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); } catch (e) { res(null); }
    });
  },
  set(k, v) {
    return new Promise(res => {
      if (!this.db) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} res(); return; }
      try { const tx = this.db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); }
    });
  }
};
let saveT;
function save() {
  Meta.dirty = true; Meta.updatedAt = Date.now();
  clearTimeout(saveT); saveT = setTimeout(() => { Store.set('state', S); Store.set('meta', Meta); }, 250);
  Sync.schedule();
}
function merge(def, val) {
  if (Array.isArray(def)) return Array.isArray(val) ? val : def;
  if (def && typeof def === 'object') {
    const o = { ...def };
    if (val && typeof val === 'object') for (const k in val) o[k] = k in def ? merge(def[k], val[k]) : val[k];
    return o;
  }
  return val === undefined ? def : val;
}

/* ===== Arayüz parçaları ===== */
function toast(msg) {
  let t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 1800);
}
let sheetStack = [];
function openSheet({ title = '', body = '', left = 'Kapat', right = '', onRight = null, full = false, onClose = null }) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  const sh = document.createElement('div'); sh.className = 'sheet' + (full ? ' full' : '');
  sh.innerHTML = `<div class="sheet-h"><button data-l>${esc(left)}</button><div class="ttl">${esc(title)}</div><button data-r class="b">${esc(right)}</button></div><div class="sheet-b">${body}</div>`;
  document.body.append(bg, sh);
  requestAnimationFrame(() => { bg.classList.add('show'); sh.classList.add('show'); });
  const obj = { bg, sh, onClose, close: () => closeSheet(obj) };
  sh.querySelector('[data-l]').onclick = () => closeSheet(obj);
  sh.querySelector('[data-r]').onclick = () => { if (onRight) { if (onRight(sh) !== false) closeSheet(obj); } };
  bg.onclick = () => closeSheet(obj);
  sheetStack.push(obj);
  return obj;
}
function closeSheet(obj) {
  obj = obj || sheetStack[sheetStack.length - 1]; if (!obj) return;
  sheetStack = sheetStack.filter(x => x !== obj);
  obj.bg.classList.remove('show'); obj.sh.classList.remove('show');
  setTimeout(() => { obj.bg.remove(); obj.sh.remove(); }, 260);
  if (obj.onClose) obj.onClose();
  if (!sheetStack.length && Sync.pendingRender) { Sync.pendingRender = false; setTimeout(render, 280); }
}
function confirmSheet(msg, yes, label = 'Sil') {
  const s = openSheet({ title: 'Emin misin?', body: `<p style="text-align:center;margin:8px 0 18px">${esc(msg)}</p><button class="btn danger full" id="cy">${esc(label)}</button>` });
  s.sh.querySelector('#cy').onclick = () => { closeSheet(s); yes(); };
}

/* Fotoğraf küçültme */
function pickImage(cb, max = 700) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', .78));
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  };
  inp.click();
}

/* ===== Genel kayıt düzenleyici (şemaya göre form) ===== */
function fieldHTML(f, v) {
  const id = 'f_' + f.k;
  let inp;
  switch (f.type) {
    case 'textarea': inp = `<textarea id="${id}" placeholder="${esc(f.ph || '')}" rows="${f.rows || 4}">${esc(v ?? '')}</textarea>`; break;
    case 'select': inp = `<select id="${id}">${f.options.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(v ?? f.def ?? '') === String(val) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`; break;
    case 'stars': inp = `<div class="star-pick" id="${id}" data-v="${v || 0}">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" class="${i <= (v || 0) ? 'on' : ''}">★</button>`).join('')}</div>`; break;
    case 'toggle': inp = `<div class="seg" id="${id}" data-v="${v ? 1 : 0}"><button type="button" data-t="0" class="${!v ? 'on' : ''}">${esc(f.off || 'Hayır')}</button><button type="button" data-t="1" class="${v ? 'on' : ''}">${esc(f.on || 'Evet')}</button></div>`; break;
    case 'days': inp = `<div class="chips" id="${id}" style="flex-wrap:wrap">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="chip ${(v || []).includes(d) ? 'on' : ''}" data-d="${d}">${WD[d]}</button>`).join('')}</div>`; break;
    default: inp = `<input id="${id}" type="${f.type || 'text'}" ${f.type === 'number' ? 'inputmode="decimal" step="any"' : ''} placeholder="${esc(f.ph || '')}" value="${esc(v ?? (f.def ?? ''))}">`;
  }
  return `<div class="field"><label>${esc(f.label)}</label>${inp}</div>`;
}
function wireFields(root) {
  root.querySelectorAll('.star-pick').forEach(el => el.querySelectorAll('button').forEach(b => b.onclick = () => {
    const s = +b.dataset.s; const cur = +el.dataset.v; const nv = cur === s ? 0 : s; el.dataset.v = nv;
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.s <= nv));
  }));
  root.querySelectorAll('.seg[data-v]').forEach(el => el.querySelectorAll('button').forEach(b => b.onclick = () => {
    el.dataset.v = b.dataset.t; el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  }));
  root.querySelectorAll('.chips[id^=f_]').forEach(el => el.querySelectorAll('button').forEach(b => b.onclick = () => b.classList.toggle('on')));
}
function readFields(root, fields) {
  const o = {};
  for (const f of fields) {
    const el = root.querySelector('#f_' + f.k); if (!el) continue;
    if (f.type === 'stars') o[f.k] = +el.dataset.v;
    else if (f.type === 'toggle') o[f.k] = el.dataset.v === '1';
    else if (f.type === 'days') o[f.k] = [...el.querySelectorAll('.on')].map(b => +b.dataset.d);
    else if (f.type === 'number') o[f.k] = el.value === '' ? '' : num(el.value);
    else o[f.k] = el.value.trim();
  }
  return o;
}
/* list: dizi, item: mevcut kayıt veya null */
function editRecord({ title, list, item, fields, required, defaults = {}, after }) {
  const isNew = !item; const cur = item || { ...defaults };
  const body = fields.map(f => fieldHTML(f, cur[f.k])).join('') + (isNew ? '' : `<button class="btn danger full" id="del" style="margin-top:8px">Sil</button>`);
  const s = openSheet({
    title: (isNew ? 'Yeni ' : '') + title, body, left: 'Vazgeç', right: 'Kaydet',
    onRight: sh => {
      const v = readFields(sh, fields);
      if (required && !v[required]) { toast('Lütfen ' + fields.find(f => f.k === required).label.toLowerCase() + ' gir'); return false; }
      if (isNew) list.unshift({ id: uid(), created: Date.now(), ...defaults, ...v }); else Object.assign(item, v, { updated: Date.now() });
      save(); after ? after() : render();
    }
  });
  wireFields(s.sh);
  const d = s.sh.querySelector('#del');
  if (d) d.onclick = () => confirmSheet('Bu kayıt silinecek.', () => { const i = list.indexOf(item); if (i > -1) list.splice(i, 1); closeSheet(s); save(); after ? after() : render(); });
  setTimeout(() => { const first = s.sh.querySelector('input,textarea'); if (first && isNew && window.innerWidth > 700) first.focus(); }, 300);
}

/* ===== Yönlendirme ===== */
const Pages = {};
let route = { tab: 'today', page: 'today', arg: null };
let navStack = [];
function go(page, arg = null, push = true) {
  if (push) navStack.push({ ...route });
  route = { ...route, page, arg };
  render(); window.scrollTo(0, 0);
}
function goBack() { route = navStack.pop() || { tab: route.tab, page: route.tab, arg: null }; render(); }
function setTab(t) { navStack = []; route = { tab: t, page: t, arg: null }; render(); window.scrollTo(0, 0); }
const TABS = [['today', '🏠', 'Bugün'], ['sport', '🏋️', 'Spor'], ['diet', '🥗', 'Diyet'], ['todos', '✅', 'Yapılacak'], ['more', '✨', 'Daha fazla']];
function header(title, sub = '', right = '') {
  const back = navStack.length ? `<button class="back" onclick="goBack()">‹ Geri</button>` : '';
  return `${back}<div class="top"><div class="grow"><div class="sub">${sub}</div><h1>${title}</h1></div>${right}</div>`;
}
function render() {
  applyTheme();
  const p = Pages[route.page] || Pages.today;
  $('#app').innerHTML = p(route.arg);
  $('#tabs').innerHTML = `<div class="in">${TABS.map(([k, i, l]) => `<button class="${route.tab === k ? 'on' : ''}" onclick="setTab('${k}')"><span class="i">${i}</span>${l}</button>`).join('')}</div>`;
  wireFields($('#app'));
  if (p.after) p.after(route.arg);
}

/* ===== Tema ===== */
function applyTheme() {
  const t = S.settings.theme; const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const a = S.settings.accent || '#6C63FF';
  const r = document.documentElement.style;
  r.setProperty('--accent', a); r.setProperty('--accent-2', shade(a, 30)); r.setProperty('--accent-soft', hexA(a, .14));
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#0B0B0F' : '#F2F2F7';
}
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function shade(h, p) { const n = parseInt(h.slice(1), 16); const f = c => Math.min(255, Math.round(c + (255 - c) * p / 100)); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(x => pad(x.toString(16))).join(''); }
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => render());

/* ===== Kilit ===== */
function showLock(onOk) {
  let entered = '';
  const el = document.createElement('div'); el.className = 'lock';
  const draw = () => {
    el.innerHTML = `<div style="font-size:44px">🔒</div><div class="b">Şifreni gir</div><div class="pin-dots">${[0, 1, 2, 3].map(i => `<i class="${i < entered.length ? 'on' : ''}"></i>`).join('')}</div>
    <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button data-k="${k}">${k}</button>`).join('')}</div>`;
    el.querySelectorAll('button').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === '⌫') entered = entered.slice(0, -1); else if (entered.length < 4) entered += k;
      if (entered.length === 4) {
        if (entered === S.settings.pin) { el.remove(); onOk && onOk(); return; }
        entered = ''; draw(); el.querySelector('.pin-dots').classList.add('shake'); return;
      }
      draw();
    });
  };
  draw(); document.body.append(el);
}
