/* ===== Kas yükü sabitleri ===== */
const REC_H = { chest_up: 72, chest_mid: 72, chest_low: 72, lats: 72, quads: 72, hams: 72, glutes: 72, lowback: 72, traps_mid: 60 }; // diğerleri 48 saat
const FULL_SETS = 8; // bir kas için ~8 efektif set = tam yorgunluk
function exThumb(ex) {
  if (!ex) return '<div class="ex-thumb"></div>';
  const ph = exPhoto(ex);
  if (ph) return `<div class="ex-thumb"><img src="${ph}" alt=""></div>`;
  const v = {}; ex.s.forEach(k => v[k] = .5); ex.p.forEach(k => v[k] = 1);
  const BACK = ['lats', 'triceps', 'lowback', 'glutes', 'hams', 'rdelt', 'traps_up', 'traps_mid'], LOW = ['quads', 'hams', 'glutes', 'calves', 'adductors'];
  const back = ex.p.filter(k => BACK.includes(k)).length > ex.p.filter(k => !BACK.includes(k) && !['calves', 'sdelt', 'forearm'].includes(k)).length;
  const low = ex.p.every(k => LOW.includes(k));
  const vb = low ? (back ? VB.lowerB : VB.lowerF) : (back ? VB.upperB : VB.upperF);
  return `<div class="ex-thumb">${bodySVG(v, { mode: 'hi', labels: false, vb })}</div>`;
}
function levelLabel(v) { if (v < .01) return '—'; if (v < .3) return 'Hafif'; if (v < .6) return 'Orta'; if (v < .85) return 'Yüksek'; return 'Çok yüksek'; }
function muscleBars(vals, unit = '') {
  const arr = Object.entries(vals).filter(([, v]) => v > .005).sort((a, b) => b[1] - a[1]);
  if (!arr.length) return '<div class="muted small" style="text-align:center;padding:6px">Henüz kas yükü yok</div>';
  return arr.map(([k, v]) => `<div class="mrow"><span class="n">${MUSCLES[k]}</span><div class="bar"><i style="width:${Math.round(Math.min(1, v) * 100)}%;background:${heat(v)}"></i></div><span class="v">${levelLabel(v)} · %${Math.round(Math.min(1, v) * 100)}</span></div>`).join('');
}
const LEGEND = `<div class="legend"><span><i style="background:${heat(.15)}"></i>Hafif</span><span><i style="background:${heat(.5)}"></i>Orta</span><span><i style="background:${heat(.75)}"></i>Yüksek</span><span><i style="background:${heat(1)}"></i>Çok yüksek</span></div>`;

/* ===== Hareket kütüphanesi ===== */
const E = (id, name, p, s = [], cat = '') => ({ id: 'b_' + id, name, p, s, cat, builtin: true });
const BUILTIN_EX = [
  E('bench', 'Bench Press', ['chest_mid'], ['chest_up', 'chest_low', 'fdelt', 'triceps'], 'Göğüs'),
  E('dbpress', 'Dumbbell Bench Press', ['chest_mid'], ['chest_up', 'chest_low', 'fdelt', 'triceps'], 'Göğüs'),
  E('incbb', 'Incline Bench Press', ['chest_up'], ['fdelt', 'triceps', 'chest_mid'], 'Göğüs'),
  E('incdb', 'Incline Dumbbell Press', ['chest_up'], ['fdelt', 'triceps', 'chest_mid'], 'Göğüs'),
  E('incfly', 'Incline Dumbbell Fly', ['chest_up'], ['fdelt'], 'Göğüs'),
  E('lowhigh', 'Low-to-High Cable Fly', ['chest_up'], ['fdelt', 'chest_mid'], 'Göğüs'),
  E('decline', 'Decline Bench Press', ['chest_low'], ['chest_mid', 'triceps'], 'Göğüs'),
  E('fly', 'Dumbbell Fly', ['chest_mid'], ['chest_up', 'chest_low', 'fdelt'], 'Göğüs'),
  E('pecdeck', 'Pec Deck (Makine Fly)', ['chest_mid'], ['fdelt'], 'Göğüs'),
  E('cross', 'Cable Crossover (yukarıdan aşağı)', ['chest_low'], ['chest_mid'], 'Göğüs'),
  E('chpress', 'Chest Press Makine', ['chest_mid'], ['chest_low', 'fdelt', 'triceps'], 'Göğüs'),
  E('pushup', 'Şınav', ['chest_mid'], ['chest_low', 'triceps', 'fdelt', 'abs_up'], 'Göğüs'),
  E('dips', 'Dips', ['chest_low', 'triceps'], ['fdelt', 'chest_mid'], 'Göğüs'),
  E('pullup', 'Barfiks', ['lats'], ['biceps', 'rdelt', 'forearm', 'traps_mid'], 'Sırt'),
  E('latpd', 'Lat Pulldown', ['lats'], ['biceps', 'rdelt', 'traps_mid'], 'Sırt'),
  E('bbrow', 'Barbell Row', ['lats', 'traps_mid'], ['rdelt', 'biceps', 'lowback'], 'Sırt'),
  E('cabrow', 'Seated Cable Row', ['traps_mid', 'lats'], ['biceps', 'rdelt'], 'Sırt'),
  E('dbrow', 'Tek Kol Dumbbell Row', ['lats'], ['traps_mid', 'rdelt', 'biceps'], 'Sırt'),
  E('tbar', 'T-Bar Row', ['traps_mid', 'lats'], ['rdelt', 'biceps', 'lowback'], 'Sırt'),
  E('pullover', 'Straight-Arm Pulldown', ['lats'], ['triceps', 'serratus'], 'Sırt'),
  E('dead', 'Deadlift', ['lowback', 'glutes', 'hams'], ['traps_up', 'forearm', 'quads', 'lats'], 'Sırt'),
  E('hyper', 'Hyperextension', ['lowback'], ['glutes', 'hams'], 'Sırt'),
  E('shrug', 'Shrug', ['traps_up'], ['forearm'], 'Sırt'),
  E('facepull', 'Face Pull', ['rdelt'], ['traps_mid', 'sdelt'], 'Omuz'),
  E('ohp', 'Overhead Press', ['fdelt'], ['sdelt', 'triceps', 'traps_up', 'chest_up'], 'Omuz'),
  E('dbsp', 'Dumbbell Shoulder Press', ['fdelt'], ['sdelt', 'triceps'], 'Omuz'),
  E('arnold', 'Arnold Press', ['fdelt', 'sdelt'], ['triceps'], 'Omuz'),
  E('lat', 'Lateral Raise', ['sdelt'], ['traps_up'], 'Omuz'),
  E('cablelat', 'Cable Lateral Raise', ['sdelt'], [], 'Omuz'),
  E('front', 'Front Raise', ['fdelt'], ['sdelt', 'chest_up'], 'Omuz'),
  E('revfly', 'Reverse Fly', ['rdelt'], ['traps_mid'], 'Omuz'),
  E('uprow', 'Upright Row', ['sdelt', 'traps_up'], ['biceps'], 'Omuz'),
  E('bbcurl', 'Barbell Curl', ['biceps'], ['forearm'], 'Kol'),
  E('dbcurl', 'Dumbbell Curl', ['biceps'], ['forearm'], 'Kol'),
  E('hammer', 'Hammer Curl', ['biceps', 'forearm'], [], 'Kol'),
  E('preacher', 'Preacher Curl', ['biceps'], [], 'Kol'),
  E('cabcurl', 'Cable Curl', ['biceps'], ['forearm'], 'Kol'),
  E('pushdown', 'Triceps Pushdown', ['triceps'], [], 'Kol'),
  E('skull', 'Skull Crusher', ['triceps'], [], 'Kol'),
  E('ohext', 'Overhead Triceps Extension', ['triceps'], [], 'Kol'),
  E('cgbench', 'Close-Grip Bench Press', ['triceps'], ['chest_mid', 'fdelt'], 'Kol'),
  E('wrist', 'Wrist Curl', ['forearm'], [], 'Kol'),
  E('squat', 'Squat', ['quads', 'glutes'], ['hams', 'lowback', 'adductors'], 'Bacak'),
  E('front_sq', 'Front Squat', ['quads'], ['glutes', 'abs_up'], 'Bacak'),
  E('hack', 'Hack Squat', ['quads'], ['glutes'], 'Bacak'),
  E('legpress', 'Leg Press', ['quads', 'glutes'], ['hams', 'adductors'], 'Bacak'),
  E('legext', 'Leg Extension', ['quads'], [], 'Bacak'),
  E('legcurl', 'Leg Curl', ['hams'], ['calves'], 'Bacak'),
  E('rdl', 'Romanian Deadlift', ['hams', 'glutes'], ['lowback', 'forearm'], 'Bacak'),
  E('lunge', 'Lunge', ['quads', 'glutes'], ['hams', 'adductors'], 'Bacak'),
  E('bulgar', 'Bulgarian Split Squat', ['quads', 'glutes'], ['hams', 'adductors'], 'Bacak'),
  E('hipthrust', 'Hip Thrust', ['glutes'], ['hams'], 'Bacak'),
  E('adduct', 'Adductor Makine', ['adductors'], [], 'Bacak'),
  E('abduct', 'Abductor Makine', ['glutes'], [], 'Bacak'),
  E('calf', 'Calf Raise (Ayakta)', ['calves'], [], 'Bacak'),
  E('seatcalf', 'Calf Raise (Oturarak)', ['calves'], [], 'Bacak'),
  E('crunch', 'Crunch', ['abs_up'], [], 'Karın'),
  E('cabcrunch', 'Cable Crunch', ['abs_up'], ['abs_low', 'obliques'], 'Karın'),
  E('plank', 'Plank', ['abs_up', 'abs_low'], ['obliques', 'lowback'], 'Karın'),
  E('legraise', 'Leg Raise', ['abs_low'], ['abs_up', 'obliques'], 'Karın'),
  E('revcrunch', 'Reverse Crunch', ['abs_low'], ['abs_up'], 'Karın'),
  E('twist', 'Russian Twist', ['obliques'], ['abs_up'], 'Karın'),
  E('woodchop', 'Cable Woodchop', ['obliques'], ['abs_up', 'serratus'], 'Karın'),
  E('abwheel', 'Ab Wheel', ['abs_up', 'abs_low'], ['lats', 'obliques', 'serratus'], 'Karın'),
];
const EX_CATS = ['Göğüs', 'Sırt', 'Omuz', 'Kol', 'Bacak', 'Karın', 'Kendi'];
const allEx = () => [...BUILTIN_EX, ...S.workout.exercises];
const exById = id => BUILTIN_EX.find(e => e.id === id) || S.workout.exercises.find(e => e.id === id);
const exPhoto = ex => ex.builtin ? (S.workout.exPhotos || {})[ex.id] : ex.img;

/* ===== Yük ve toparlanma hesapları ===== */
function dayLoad(items) {
  const m = {};
  for (const it of items) {
    const ex = exById(it.exId); if (!ex) continue;
    const n = it.sets !== undefined ? (+it.sets || 0) : (it.sets_arr || []).length;
    ex.p.forEach(k => m[k] = (m[k] || 0) + n);
    ex.s.forEach(k => m[k] = (m[k] || 0) + n * .5);
  }
  const out = {}; for (const k in m) out[k] = m[k] / FULL_SETS; return out;
}
function recovery() {
  const now = Date.now(); const m = {};
  for (const lg of S.workout.logs) {
    const h = (now - lg.ts) / 36e5; if (h > 80 || h < 0) continue;
    for (const en of lg.entries) {
      const ex = exById(en.exId); if (!ex) continue;
      const n = en.sets.length;
      const add = (k, w) => { const dec = Math.max(0, 1 - h / (REC_H[k] || 48)); m[k] = (m[k] || 0) + n * w * dec / FULL_SETS; };
      ex.p.forEach(k => add(k, 1)); ex.s.forEach(k => add(k, .5));
    }
  }
  return m;
}
function lastPerf(exId) {
  for (let i = S.workout.logs.length - 1; i >= 0; i--) {
    const en = S.workout.logs[i].entries.find(e => e.exId === exId);
    if (en) return { log: S.workout.logs[i], sets: en.sets };
  }
  return null;
}
function exHistory(exId) {
  const pts = [];
  for (const lg of S.workout.logs) {
    const en = lg.entries.find(e => e.exId === exId); if (!en || !en.sets.length) continue;
    const best = Math.max(...en.sets.map(s => num(s.w)));
    const e1rm = Math.max(...en.sets.map(s => num(s.w) * (1 + num(s.r) / 30)));
    const vol = en.sets.reduce((a, s) => a + num(s.w) * num(s.r), 0);
    pts.push({ date: lg.date, best, e1rm, vol, sets: en.sets });
  }
  return pts;
}

/* ===== Basit çizgi grafik ===== */
function lineChart(pts, { unit = '', color = 'var(--accent)', h = 150 } = {}) {
  if (pts.length < 1) return '<div class="muted small" style="text-align:center;padding:18px">Grafik için veri yok</div>';
  const W = 320, H = h, P = 26;
  const ys = pts.map(p => p.y); let mn = Math.min(...ys), mx = Math.max(...ys);
  if (mn === mx) { mn -= 1; mx += 1; }
  const pad = (mx - mn) * .15; mn -= pad; mx += pad;
  const X = i => pts.length === 1 ? W / 2 : P + i * (W - P - 10) / (pts.length - 1);
  const Y = v => 10 + (H - 34) * (1 - (v - mn) / (mx - mn));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${d}L${X(pts.length - 1).toFixed(1)},${H - 24}L${X(0).toFixed(1)},${H - 24}Z`;
  const step = Math.ceil(pts.length / 5);
  const lbl = pts.map((p, i) => (i % step === 0 || i === pts.length - 1) ? `<text x="${X(i)}" y="${H - 8}" font-size="9.5" text-anchor="middle" fill="var(--muted)">${esc(p.x)}</text>` : '').join('');
  const dots = pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3" fill="${color}"/>`).join('');
  const grid = [mn + pad, (mn + mx) / 2, mx - pad].map(v => `<line x1="${P}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${P - 4}" y="${Y(v) + 3}" font-size="9" text-anchor="end" fill="var(--muted)">${r1(v)}</text>`).join('');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}">${grid}<path d="${area}" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${lbl}</svg></div>`;
}

/* ===== Sayfalar: Spor ===== */
Pages.sport = () => {
  const W = S.workout; const rec = recovery();
  const todayWd = new Date().getDay();
  const active = W.active ? `<div class="hero" onclick="go('session')" style="cursor:pointer"><div class="muted small b">DEVAM EDEN ANTRENMAN</div><div class="row between"><div class="kpi">${esc(W.active.name)}</div><span style="font-size:26px">›</span></div><div class="small muted">${W.active.entries.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0)} set tamamlandı</div></div>` : '';
  const days = W.days.length ? W.days.map(d => {
    const load = dayLoad(d.items);
    const top = Object.entries(load).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => `<span class="tag">${MUSCLES[k]}</span>`).join('');
    const isToday = (d.wd || []).includes(todayWd);
    return `<div class="list-item" onclick="go('day','${d.id}')" style="cursor:pointer"><div class="ex-thumb mini">${bodySVG(load, { labels: false, vb: VB.bothNoLabel })}</div><div class="grow"><div class="t">${esc(d.name)} ${isToday ? '<span class="tag" style="background:var(--ok);color:#fff">Bugün</span>' : ''}</div><div class="small muted">${(d.wd || []).map(x => WD[x]).join(', ') || 'Gün seçilmedi'} · ${d.items.length} hareket</div><div style="margin-top:5px">${top}</div></div><span class="muted">›</span></div>`;
  }).join('') : `<div class="empty"><div class="e">📋</div>Henüz program yok.<br>Hazır programını gün gün ekleyebilirsin.</div>`;
  const weekLogs = W.logs.filter(l => daysBetween(l.date, today()) < 7).length;
  return header('Spor', 'Bu hafta ' + weekLogs + ' antrenman') + active + `
  <div class="card"><h3>Şu anki kas yorgunluğu</h3><div class="body-map" style="max-width:380px;margin:0 auto">${bodySVG(rec)}</div>${LEGEND}
    <div class="small muted" style="text-align:center;margin-top:8px">Son antrenmanlarına göre hesaplanır; kaslar 2–3 günde toparlanır.</div></div>
  <div class="card tight"><div class="row between" style="padding:12px 16px 4px"><h3 style="margin:0">Programım</h3><button class="btn ghost sm" onclick="editDay()">+ Gün ekle</button></div>${days}</div>
  <div class="grid2">
    <button class="tile" onclick="startSession(null)"><span class="ic">⚡</span><span class="nm">Serbest antrenman</span><span class="ds">Programsız başla</span></button>
    <button class="tile" onclick="go('whist')"><span class="ic">📈</span><span class="nm">Geçmiş</span><span class="ds">${W.logs.length} antrenman</span></button>
    <button class="tile" onclick="go('exlib')"><span class="ic">📚</span><span class="nm">Hareketler</span><span class="ds">${allEx().length} hareket · rekorlar</span></button>
    <button class="tile" onclick="go('records')"><span class="ic">🏆</span><span class="nm">Rekorlarım</span><span class="ds">En iyi ağırlıklar</span></button>
  </div>`;
};

function editDay(id) {
  const d = id ? S.workout.days.find(x => x.id === id) : null;
  editRecord({
    title: 'Antrenman günü', list: S.workout.days, item: d, required: 'name', defaults: { items: [] },
    fields: [{ k: 'name', label: 'Gün adı', ph: 'ör. Göğüs + Arka kol' }, { k: 'wd', label: 'Hangi günler?', type: 'days' }, { k: 'note', label: 'Not', type: 'textarea', rows: 2 }],
    after: () => { if (d && !S.workout.days.includes(d)) { navStack = []; route = { tab: 'sport', page: 'sport' }; } render(); }
  });
}

Pages.day = id => {
  const d = S.workout.days.find(x => x.id === id); if (!d) return Pages.sport();
  const load = dayLoad(d.items);
  const totalSets = d.items.reduce((a, i) => a + (+i.sets || 0), 0);
  const items = d.items.length ? d.items.map((it, i) => {
    const ex = exById(it.exId); if (!ex) return '';
    const lp = lastPerf(ex.id);
    const last = lp ? `Son: ${lp.sets.map(s => `${s.w || 0}×${s.r || 0}`).slice(0, 4).join(', ')}` : 'Henüz yapılmadı';
    return `<div class="ex-item"><div onclick="go('ex','${ex.id}')" style="cursor:pointer">${exThumb(ex)}</div><div class="grow" onclick="editItem('${d.id}',${i})" style="cursor:pointer"><div class="b ellip">${esc(ex.name)}</div><div class="small"><b style="color:var(--accent)">${it.sets} set × ${esc(it.reps)}</b>${it.note ? ' · ' + esc(it.note) : ''}</div><div class="tiny muted ellip">${last}</div></div>
    <div style="display:flex;flex-direction:column;gap:4px"><button class="muted" onclick="moveItem('${d.id}',${i},-1)" ${i === 0 ? 'style="opacity:.25"' : ''}>▲</button><button class="muted" onclick="moveItem('${d.id}',${i},1)" ${i === d.items.length - 1 ? 'style="opacity:.25"' : ''}>▼</button></div></div>`;
  }).join('') : '<div class="empty"><div class="e">➕</div>Bu güne hareket ekle</div>';
  return header(esc(d.name), (d.wd || []).map(x => WD_LONG[x]).join(', ') || 'Antrenman günü', `<button class="icon-btn" onclick="editDay('${d.id}')">✎</button>`) + `
  <button class="btn full" onclick="startSession('${d.id}')" style="margin-bottom:12px">▶ Antrenmana başla</button>
  <div class="card tight">${items}<div style="padding:10px 14px"><button class="btn ghost full" onclick="pickExercise(ex=>addToDay('${d.id}',ex))">+ Hareket ekle</button></div></div>
  <div class="card"><h3>Çalışan kaslar · olası yorgunluk</h3>
    <div class="body-map" style="max-width:380px;margin:0 auto">${bodySVG(load)}</div>${LEGEND}
    <div class="hr"></div>${muscleBars(load)}
    <div class="tiny muted" style="margin-top:8px">Toplam ${totalSets} set. Hesap: ana kas 1 set, yardımcı kas yarım set sayılır; ~${FULL_SETS} set tam yorgunluk kabul edilir. Hareket ekleyip çıkardıkça güncellenir.</div></div>
  ${d.note ? `<div class="card"><h3>Not</h3>${esc(d.note)}</div>` : ''}`;
};
function addToDay(dayId, ex) {
  const d = S.workout.days.find(x => x.id === dayId);
  d.items.push({ exId: ex.id, sets: 3, reps: '10' }); save(); render(); toast(ex.name + ' eklendi');
}
function moveItem(dayId, i, dir) {
  const d = S.workout.days.find(x => x.id === dayId); const j = i + dir;
  if (j < 0 || j >= d.items.length) return;
  [d.items[i], d.items[j]] = [d.items[j], d.items[i]]; save(); render();
}
function editItem(dayId, i) {
  const d = S.workout.days.find(x => x.id === dayId); const it = d.items[i]; const ex = exById(it.exId);
  const s = openSheet({
    title: ex.name, left: 'Vazgeç', right: 'Kaydet',
    body: `<div class="grid2"><div class="field"><label>Set sayısı</label><input id="es" type="number" inputmode="numeric" value="${it.sets}"></div><div class="field"><label>Tekrar</label><input id="er" value="${esc(it.reps)}" placeholder="ör. 8-12"></div></div>
      <div class="field"><label>Not</label><input id="en" value="${esc(it.note || '')}" placeholder="ör. son set drop set"></div>
      <button class="btn plain full" id="eex" style="margin-bottom:8px">Hareket detayları ve geçmişi</button>
      <button class="btn danger full" id="edel">Programdan çıkar</button>`,
    onRight: sh => { it.sets = Math.max(1, Math.round(num(sh.querySelector('#es').value)) || 1); it.reps = sh.querySelector('#er').value.trim() || '10'; it.note = sh.querySelector('#en').value.trim(); save(); render(); }
  });
  s.sh.querySelector('#edel').onclick = () => { d.items.splice(i, 1); save(); closeSheet(s); render(); };
  s.sh.querySelector('#eex').onclick = () => { closeSheet(s); go('ex', ex.id); };
}

/* Hareket seçici */
function pickExercise(onPick) {
  let q = '', cat = '';
  const s = openSheet({ title: 'Hareket seç', body: `<input id="pq" placeholder="Ara… (ör. squat, curl)" style="margin-bottom:10px"><div class="chips" id="pc"></div><div class="card tight" id="pl"></div><button class="btn ghost full" id="pn">+ Yeni hareket oluştur</button>`, left: 'Bitti' });
  const draw = () => {
    s.sh.querySelector('#pc').innerHTML = ['', ...EX_CATS].map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${c}">${c || 'Tümü'}</button>`).join('');
    s.sh.querySelectorAll('#pc button').forEach(b => b.onclick = () => { cat = b.dataset.c; draw(); });
    const ql = q.toLocaleLowerCase('tr');
    const list = allEx().filter(e => (!cat || (cat === 'Kendi' ? !e.builtin : e.cat === cat)) && (!ql || e.name.toLocaleLowerCase('tr').includes(ql) || e.p.some(k => MUSCLES[k].toLocaleLowerCase('tr').includes(ql))));
    s.sh.querySelector('#pl').innerHTML = list.length ? list.map(e => `<div class="ex-item" data-id="${e.id}" style="cursor:pointer">${exThumb(e)}<div class="grow"><div class="b">${esc(e.name)}</div><div class="tiny muted">${e.p.map(k => MUSCLES[k]).join(', ')}${e.s.length ? ' · ' + e.s.map(k => MUSCLES[k]).join(', ') : ''}</div></div><span style="color:var(--accent);font-size:22px">＋</span></div>`).join('') : '<div class="empty">Bulunamadı</div>';
    s.sh.querySelectorAll('#pl [data-id]').forEach(el => el.onclick = () => { onPick(exById(el.dataset.id)); el.style.background = 'var(--accent-soft)'; });
  };
  s.sh.querySelector('#pq').oninput = e => { q = e.target.value; draw(); };
  s.sh.querySelector('#pn').onclick = () => editExercise(null, ex => { onPick(ex); draw(); });
  draw();
}
function editExercise(id, cb) {
  const ex = id ? S.workout.exercises.find(e => e.id === id) : null;
  const st = {}; if (ex) { ex.p.forEach(k => st[k] = 'p'); ex.s.forEach(k => st[k] = 's'); }
  let img = ex?.img || '';
  const s = openSheet({
    title: ex ? 'Hareketi düzenle' : 'Yeni hareket', left: 'Vazgeç', right: 'Kaydet',
    body: `<div class="field"><label>Hareket adı</label><input id="xn" value="${esc(ex?.name || '')}" placeholder="ör. Smith Machine Squat"></div>
    <div class="field"><label>Çalışan kaslar — 1 dokunuş: ana kas, 2: yardımcı kas</label><div class="chips" id="xm" style="flex-wrap:wrap"></div></div>
    <div class="body-map" id="xb" style="max-width:260px;margin:0 auto 12px"></div>
    <div class="field"><label>Fotoğraf (isteğe bağlı)</label><div class="row"><div id="xi"></div><button class="btn plain sm" id="xp">Fotoğraf seç</button></div></div>
    ${ex ? '<button class="btn danger full" id="xd">Hareketi sil</button>' : ''}`,
    onRight: sh => {
      const name = sh.querySelector('#xn').value.trim(); if (!name) { toast('Hareket adı gir'); return false; }
      const p = Object.keys(st).filter(k => st[k] === 'p'), s2 = Object.keys(st).filter(k => st[k] === 's');
      if (!p.length) { toast('En az bir ana kas seç'); return false; }
      let o = ex; if (!o) { o = { id: uid(), cat: 'Kendi' }; S.workout.exercises.push(o); }
      Object.assign(o, { name, p, s: s2, img }); save(); render(); cb && cb(o);
    }
  });
  const draw = () => {
    s.sh.querySelector('#xm').innerHTML = Object.keys(MUSCLES).map(k => `<button class="chip ${st[k] || ''}" data-k="${k}">${st[k] === 'p' ? '● ' : st[k] === 's' ? '○ ' : ''}${MUSCLES[k]}</button>`).join('');
    s.sh.querySelectorAll('#xm button').forEach(b => b.onclick = () => { const k = b.dataset.k; st[k] = !st[k] ? 'p' : st[k] === 'p' ? 's' : undefined; if (!st[k]) delete st[k]; draw(); });
    const v = {}; for (const k in st) v[k] = st[k] === 'p' ? 1 : .5;
    s.sh.querySelector('#xb').innerHTML = bodySVG(v, { mode: 'hi' });
    s.sh.querySelector('#xi').innerHTML = img ? `<img src="${img}" style="width:54px;height:66px;object-fit:cover;border-radius:10px">` : '';
  };
  s.sh.querySelector('#xp').onclick = () => pickImage(d => { img = d; draw(); });
  const del = s.sh.querySelector('#xd');
  if (del) del.onclick = () => confirmSheet('Hareket silinecek (geçmiş kayıtların kalır).', () => { S.workout.exercises.splice(S.workout.exercises.indexOf(ex), 1); S.workout.days.forEach(d => d.items = d.items.filter(i => i.exId !== ex.id)); closeSheet(s); save(); goBack(); });
  draw();
}

Pages.exlib = () => {
  const groups = EX_CATS.map(c => {
    const l = allEx().filter(e => c === 'Kendi' ? !e.builtin : e.cat === c); if (!l.length) return '';
    return `<div class="card tight"><h3 style="padding:12px 16px 0">${c}</h3>${l.map(e => `<div class="ex-item" onclick="go('ex','${e.id}')" style="cursor:pointer">${exThumb(e)}<div class="grow"><div class="b">${esc(e.name)}</div><div class="tiny muted">${e.p.map(k => MUSCLES[k]).join(', ')}</div></div><span class="muted">›</span></div>`).join('')}</div>`;
  }).join('');
  return header('Hareketler', allEx().length + ' hareket', `<button class="icon-btn" onclick="editExercise(null)">＋</button>`) + groups;
};

Pages.ex = id => {
  const ex = exById(id); if (!ex) return Pages.exlib();
  const v = {}; ex.s.forEach(k => v[k] = .5); ex.p.forEach(k => v[k] = 1);
  const h = exHistory(id); const ph = exPhoto(ex);
  const pr = h.length ? Math.max(...h.map(p => p.best)) : 0;
  const e1 = h.length ? Math.max(...h.map(p => p.e1rm)) : 0;
  return header(esc(ex.name), ex.builtin ? ex.cat : 'Kendi hareketin', !ex.builtin ? `<button class="icon-btn" onclick="editExercise('${ex.id}')">✎</button>` : '') + `
  <div class="card"><div class="row" style="align-items:flex-start"><div class="body-map grow">${bodySVG(v, { mode: 'hi' })}</div>${ph ? `<img src="${ph}" style="width:42%;border-radius:14px;object-fit:cover;aspect-ratio:3/4">` : ''}</div>
    <div style="margin-top:10px">${ex.p.map(k => `<span class="chip p" style="display:inline-block;margin:0 6px 6px 0">${MUSCLES[k]}</span>`).join('')}${ex.s.map(k => `<span class="chip s" style="display:inline-block;margin:0 6px 6px 0">${MUSCLES[k]}</span>`).join('')}</div>
    <div class="tiny muted">Koyu: ana kas · Açık: yardımcı kas</div>
    <button class="btn plain sm" style="margin-top:10px" onclick="setExPhoto('${ex.id}')">📷 ${ph ? 'Fotoğrafı değiştir' : 'Kendi fotoğrafını / formunu ekle'}</button></div>
  <div class="grid2"><div class="card"><div class="small muted">En iyi ağırlık</div><div class="kpi">${pr ? r1(pr) + ' kg' : '—'}</div></div><div class="card"><div class="small muted">Tahmini 1 tekrar max</div><div class="kpi">${e1 ? r1(e1) + ' kg' : '—'}</div></div></div>
  <div class="card"><h3>Ağırlık gelişimi</h3>${lineChart(h.map(p => ({ x: fmtDate(p.date, { day: 'numeric', month: 'short' }), y: p.best })), { unit: 'kg' })}</div>
  <div class="card tight"><h3 style="padding:12px 16px 0">Son seanslar</h3>${h.length ? h.slice(-8).reverse().map(p => `<div class="list-item"><div class="grow"><div class="b small">${fmtDate(p.date, { day: 'numeric', month: 'long', weekday: 'short' })}</div><div class="small muted">${p.sets.map(s => `${s.w || 0} kg × ${s.r || 0}`).join(' · ')}</div></div><div class="small b">${Math.round(p.vol)} kg</div></div>`).join('') : '<div class="empty">Henüz kayıt yok</div>'}</div>`;
};
function setExPhoto(id) {
  const ex = exById(id);
  pickImage(d => { if (ex.builtin) { S.workout.exPhotos = S.workout.exPhotos || {}; S.workout.exPhotos[id] = d; } else ex.img = d; save(); render(); });
}

Pages.records = () => {
  const rows = allEx().map(e => { const h = exHistory(e.id); if (!h.length) return null; const best = h.reduce((a, p) => p.best > a.best ? p : a, h[0]); return { e, best }; }).filter(Boolean).sort((a, b) => b.best.best - a.best.best);
  return header('Rekorlarım', 'Her hareketteki en iyi ağırlık') + `<div class="card tight">${rows.length ? rows.map(({ e, best }) => `<div class="ex-item" onclick="go('ex','${e.id}')" style="cursor:pointer">${exThumb(e)}<div class="grow"><div class="b">${esc(e.name)}</div><div class="tiny muted">${fmtDate(best.date)}</div></div><div class="kpi" style="font-size:20px">${r1(best.best)} <span class="small muted">kg</span></div></div>`).join('') : '<div class="empty"><div class="e">🏆</div>Antrenman kaydettikçe rekorların burada görünür</div>'}</div>`;
};

Pages.whist = () => {
  const L = [...S.workout.logs].reverse();
  return header('Geçmiş', S.workout.logs.length + ' antrenman') + `<div class="card tight">${L.length ? L.map(l => {
    const sets = l.entries.reduce((a, e) => a + e.sets.length, 0);
    const vol = l.entries.reduce((a, e) => a + e.sets.reduce((b, s) => b + num(s.w) * num(s.r), 0), 0);
    return `<div class="list-item" onclick="showLog('${l.id}')" style="cursor:pointer"><div class="ex-thumb mini">${bodySVG(dayLoad(l.entries.map(e => ({ exId: e.exId, sets: e.sets.length }))), { labels: false, vb: VB.bothNoLabel })}</div><div class="grow"><div class="t">${esc(l.name)}</div><div class="small muted">${fmtDate(l.date, { weekday: 'long', day: 'numeric', month: 'long' })}</div><div class="tiny muted">${l.entries.length} hareket · ${sets} set · ${Math.round(vol).toLocaleString('tr-TR')} kg hacim${l.min ? ' · ' + l.min + ' dk' : ''}</div></div><span class="muted">›</span></div>`;
  }).join('') : '<div class="empty"><div class="e">📈</div>Henüz antrenman kaydı yok</div>'}</div>`;
};
function showLog(id) {
  const l = S.workout.logs.find(x => x.id === id);
  const load = dayLoad(l.entries.map(e => ({ exId: e.exId, sets: e.sets.length })));
  const s = openSheet({
    title: l.name, body: `<div class="muted small" style="text-align:center;margin-bottom:10px">${fmtDate(l.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <div class="card"><div class="body-map" style="max-width:280px;margin:0 auto">${bodySVG(load)}</div></div>
    <div class="card tight">${l.entries.map(e => { const ex = exById(e.exId); return `<div class="list-item"><div class="grow"><div class="b">${esc(ex?.name || 'Silinmiş hareket')}</div><div class="small muted">${e.sets.map(s => `${s.w || 0} kg × ${s.r || 0}`).join(' · ')}</div></div></div>`; }).join('')}</div>
    ${l.note ? `<div class="card">${esc(l.note)}</div>` : ''}
    <button class="btn danger full" id="ld">Kaydı sil</button>`
  });
  s.sh.querySelector('#ld').onclick = () => confirmSheet('Antrenman kaydı silinecek.', () => { S.workout.logs.splice(S.workout.logs.indexOf(l), 1); save(); closeSheet(s); render(); });
}

/* ===== Antrenman oturumu ===== */
function startSession(dayId) {
  const W = S.workout;
  const begin = () => {
    const d = dayId ? W.days.find(x => x.id === dayId) : null;
    W.active = {
      dayId, name: d ? d.name : 'Serbest antrenman', start: Date.now(),
      entries: d ? d.items.map(it => newEntry(it.exId, +it.sets || 3, it.reps)) : []
    };
    save(); navStack = [{ tab: 'sport', page: 'sport' }]; route = { tab: 'sport', page: 'session' }; render(); window.scrollTo(0, 0);
  };
  if (W.active) confirmSheet('Devam eden bir antrenman var. Onu silip yenisine başlansın mı?', begin, 'Yeniden başla'); else begin();
}
function newEntry(exId, n = 3, reps = '10') {
  const lp = lastPerf(exId); const rr = String(reps).match(/\d+/g); const target = rr ? rr[rr.length - 1] : '';
  const sets = []; for (let i = 0; i < n; i++) { const prev = lp?.sets[i] || lp?.sets[lp.sets.length - 1]; sets.push({ w: prev ? prev.w : '', r: prev ? prev.r : target, done: false }); }
  return { exId, reps, sets };
}
Pages.session = () => {
  const A = S.workout.active; if (!A) { route.page = 'sport'; return Pages.sport(); }
  const doneSets = A.entries.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const totalSets = A.entries.reduce((a, e) => a + e.sets.length, 0);
  const ents = A.entries.map((e, ei) => {
    const ex = exById(e.exId); const lp = lastPerf(e.exId);
    return `<div class="card"><div class="row" style="margin-bottom:6px"><div onclick="go('ex','${e.exId}')" style="cursor:pointer">${exThumb(ex)}</div><div class="grow"><div class="b">${esc(ex?.name || '?')}</div><div class="tiny muted">Hedef: ${esc(e.reps || '-')} tekrar${lp ? ` · Son (${fmtDate(lp.log.date, { day: 'numeric', month: 'short' })}): ${lp.sets.map(s => `${s.w || 0}×${s.r || 0}`).join(', ')}` : ''}</div></div><button class="muted" style="font-size:20px;padding:4px" onclick="entryMenu(${ei})">⋯</button></div>
      <div class="set-row tiny muted b"><span class="no">SET</span><span style="text-align:center">KG</span><span style="text-align:center">TEKRAR</span><span></span></div>
      ${e.sets.map((s, si) => `<div class="set-row ${s.done ? 'ok' : ''}" id="sr_${ei}_${si}"><span class="no">${si + 1}</span><input inputmode="decimal" value="${esc(s.w)}" placeholder="0" oninput="setVal(${ei},${si},'w',this.value)"><input inputmode="numeric" value="${esc(s.r)}" placeholder="0" oninput="setVal(${ei},${si},'r',this.value)"><button class="chk" onclick="toggleSet(${ei},${si})">✓</button></div>`).join('')}
      <div class="row" style="margin-top:8px"><button class="btn plain sm grow" onclick="addSet(${ei})">+ Set ekle</button>${e.sets.length > 1 ? `<button class="btn plain sm" onclick="delSet(${ei})">− Set</button>` : ''}</div></div>`;
  }).join('');
  const live = dayLoad(A.entries.map(e => ({ exId: e.exId, sets: e.sets.filter(s => s.done).length })));
  return header(esc(A.name), `<span id="elapsed">${elapsed(A.start)}</span> · ${doneSets}/${totalSets} set`) + `
  <div class="bar" style="margin:-6px 0 14px"><i style="width:${totalSets ? doneSets / totalSets * 100 : 0}%;background:var(--ok)"></i></div>
  ${ents || '<div class="empty"><div class="e">🏋️</div>Hareket ekleyerek başla</div>'}
  <button class="btn ghost full" style="margin-bottom:12px" onclick="pickExercise(ex=>{S.workout.active.entries.push(newEntry(ex.id));save();render();})">+ Hareket ekle</button>
  <div class="card"><h3>Bu antrenmanda çalışan kaslar</h3><div class="body-map" style="max-width:280px;margin:0 auto">${bodySVG(live)}</div>${muscleBars(live)}</div>
  <div class="field"><label>Antrenman notu</label><textarea rows="2" oninput="S.workout.active.note=this.value;save()" placeholder="Nasıl hissettin?">${esc(A.note || '')}</textarea></div>
  <button class="btn full" style="background:var(--ok);margin-bottom:10px" onclick="finishSession()">✓ Antrenmanı bitir</button>
  <button class="btn danger full" onclick="confirmSheet('Bu antrenman kaydedilmeden silinecek.',()=>{S.workout.active=null;save();setTab('sport')},'İptal et')">Antrenmanı iptal et</button>`;
};
Pages.session.after = () => { clearInterval(window._el); window._el = setInterval(() => { const e = $('#elapsed'); if (e && S.workout.active) e.textContent = elapsed(S.workout.active.start); else clearInterval(window._el); }, 1000); };
function elapsed(t) { const s = Math.floor((Date.now() - t) / 1000); const h = Math.floor(s / 3600); return (h ? h + ':' : '') + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }
function setVal(ei, si, k, v) { S.workout.active.entries[ei].sets[si][k] = v.replace(',', '.'); save(); }
function toggleSet(ei, si) {
  const s = S.workout.active.entries[ei].sets[si]; s.done = !s.done; save();
  if (s.done) { const nxt = S.workout.active.entries[ei].sets[si + 1]; if (nxt && nxt.w === '' && s.w !== '') nxt.w = s.w; startRest(); }
  render();
}
function addSet(ei) { const e = S.workout.active.entries[ei]; const l = e.sets[e.sets.length - 1]; e.sets.push({ w: l ? l.w : '', r: l ? l.r : '', done: false }); save(); render(); }
function delSet(ei) { S.workout.active.entries[ei].sets.pop(); save(); render(); }
function entryMenu(ei) {
  const A = S.workout.active; const ex = exById(A.entries[ei].exId);
  const s = openSheet({ title: ex?.name || '', body: `<button class="btn plain full" id="m1" style="margin-bottom:8px">▲ Yukarı taşı</button><button class="btn plain full" id="m2" style="margin-bottom:8px">▼ Aşağı taşı</button><button class="btn danger full" id="m3">Bu antrenmandan çıkar</button>` });
  const mv = d => { const j = ei + d; if (j < 0 || j >= A.entries.length) return; [A.entries[ei], A.entries[j]] = [A.entries[j], A.entries[ei]]; save(); closeSheet(s); render(); };
  s.sh.querySelector('#m1').onclick = () => mv(-1); s.sh.querySelector('#m2').onclick = () => mv(1);
  s.sh.querySelector('#m3').onclick = () => { A.entries.splice(ei, 1); save(); closeSheet(s); render(); };
}
function finishSession() {
  const A = S.workout.active;
  const entries = A.entries.map(e => ({ exId: e.exId, sets: e.sets.filter(s => s.done).map(s => ({ w: num(s.w), r: num(s.r) })) })).filter(e => e.sets.length);
  if (!entries.length) { toast('Önce en az bir seti ✓ ile işaretle'); return; }
  const prs = [];
  entries.forEach(e => { const h = exHistory(e.exId); const prev = h.length ? Math.max(...h.map(p => p.best)) : 0; const best = Math.max(...e.sets.map(s => s.w)); if (h.length && best > prev) prs.push(exById(e.exId)?.name); });
  S.workout.logs.push({ id: uid(), ts: Date.now(), date: today(), dayId: A.dayId, name: A.name, entries, note: A.note || '', min: Math.round((Date.now() - A.start) / 60000) });
  S.workout.active = null; stopRest(); save(); setTab('sport');
  toast(prs.length ? '🏆 Yeni rekor: ' + prs.join(', ') : '💪 Antrenman kaydedildi');
}

/* Dinlenme sayacı */
let restEnd = 0, restInt;
function startRest(sec) {
  sec = sec || S.settings.rest || 90; restEnd = Date.now() + sec * 1000;
  let el = $('#timer'); if (!el) { el = document.createElement('div'); el.id = 'timer'; el.className = 'timer'; document.body.append(el); }
  const draw = () => {
    const left = Math.max(0, Math.round((restEnd - Date.now()) / 1000));
    el.innerHTML = `<span>⏱</span><div class="grow"><div class="tiny" style="opacity:.7">Dinlenme</div><div class="tm">${Math.floor(left / 60)}:${pad(left % 60)}</div></div><button onclick="restEnd-=15000">−15</button><button onclick="restEnd+=15000">+15</button><button onclick="stopRest()">✕</button>`;
    if (left <= 0) { beep(); stopRest(); toast('⏰ Dinlenme bitti, sıradaki set!'); }
  };
  clearInterval(restInt); draw(); restInt = setInterval(draw, 500);
}
function stopRest() { clearInterval(restInt); const el = $('#timer'); if (el) el.remove(); }
function beep() {
  try { const c = new (window.AudioContext || window.webkitAudioContext)(); [0, .25, .5].forEach(t => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + .15); }); } catch (e) {}
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
}
