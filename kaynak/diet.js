/* ===== Besinler (100 g için yaklaşık değerler) ===== */
const F = (id, name, kcal, p, c, f, unit = null) => ({ id: 'f_' + id, name, kcal, p, c, f, unit, builtin: true });
const BUILTIN_FOODS = [
  F('egg', 'Yumurta', 143, 12.6, 0.7, 9.5, { n: 'adet', g: 55 }),
  F('eggw', 'Yumurta beyazı', 52, 10.9, 0.7, 0.2, { n: 'adet', g: 33 }),
  F('chick', 'Tavuk göğsü (pişmiş)', 165, 31, 0, 3.6),
  F('chthigh', 'Tavuk but (pişmiş, derisiz)', 209, 26, 0, 10.9),
  F('turkey', 'Hindi füme', 104, 17, 4, 2, { n: 'dilim', g: 15 }),
  F('mince', 'Dana kıyma (pişmiş, %15 yağ)', 250, 26, 0, 15),
  F('steak', 'Dana biftek (pişmiş)', 250, 26, 0, 15),
  F('kofte', 'Köfte (ızgara)', 240, 18, 6, 16, { n: 'adet', g: 30 }),
  F('tuna', 'Ton balığı (suda)', 116, 26, 0, 0.8, { n: 'kutu', g: 120 }),
  F('salmon', 'Somon (pişmiş)', 206, 22, 0, 12),
  F('rice', 'Pirinç pilavı', 150, 2.8, 30, 2.5, { n: 'porsiyon', g: 150 }),
  F('ricep', 'Pirinç (haşlanmış, sade)', 130, 2.7, 28, 0.3),
  F('bulgur', 'Bulgur pilavı', 110, 3.2, 21, 1.8, { n: 'porsiyon', g: 150 }),
  F('pasta', 'Makarna (haşlanmış)', 158, 5.8, 31, 0.9, { n: 'porsiyon', g: 180 }),
  F('oats', 'Yulaf ezmesi', 379, 13, 68, 6.5, { n: 'yemek kaşığı', g: 10 }),
  F('wbread', 'Tam buğday ekmeği', 247, 13, 41, 3.4, { n: 'dilim', g: 30 }),
  F('bread', 'Beyaz ekmek', 265, 9, 49, 3.2, { n: 'dilim', g: 30 }),
  F('lavas', 'Lavaş', 275, 9, 55, 1.5, { n: 'adet', g: 70 }),
  F('potato', 'Patates (haşlanmış)', 87, 1.9, 20, 0.1),
  F('sweetp', 'Tatlı patates (fırın)', 90, 2, 21, 0.2),
  F('lentil', 'Mercimek çorbası', 60, 3.5, 9, 1.2, { n: 'kase', g: 250 }),
  F('chickpea', 'Nohut (haşlanmış)', 164, 8.9, 27, 2.6),
  F('beans', 'Kuru fasulye yemeği', 120, 7, 17, 3, { n: 'porsiyon', g: 200 }),
  F('milk', 'Süt (tam yağlı)', 61, 3.2, 4.8, 3.3, { n: 'bardak', g: 200 }),
  F('milkl', 'Süt (yarım yağlı)', 46, 3.3, 4.8, 1.5, { n: 'bardak', g: 200 }),
  F('yog', 'Yoğurt (tam yağlı)', 61, 3.5, 4.7, 3.3, { n: 'kase', g: 150 }),
  F('skyr', 'Süzme yoğurt', 97, 9, 3.6, 5, { n: 'kase', g: 150 }),
  F('ayran', 'Ayran', 36, 1.7, 2.6, 1.9, { n: 'bardak', g: 200 }),
  F('feta', 'Beyaz peynir', 264, 14, 4, 21, { n: 'dilim', g: 30 }),
  F('kasar', 'Kaşar peyniri', 350, 25, 1.5, 27, { n: 'dilim', g: 20 }),
  F('lor', 'Lor peyniri', 98, 11, 3.4, 4.3),
  F('olive', 'Zeytin (siyah)', 115, 0.8, 6, 10.7, { n: 'adet', g: 4 }),
  F('oil', 'Zeytinyağı', 884, 0, 0, 100, { n: 'yemek kaşığı', g: 13 }),
  F('butter', 'Tereyağı', 717, 0.9, 0.1, 81, { n: 'tatlı kaşığı', g: 5 }),
  F('pb', 'Fıstık ezmesi', 588, 25, 20, 50, { n: 'yemek kaşığı', g: 16 }),
  F('almond', 'Badem', 579, 21, 22, 50, { n: 'avuç', g: 25 }),
  F('walnut', 'Ceviz', 654, 15, 14, 65, { n: 'adet', g: 5 }),
  F('honey', 'Bal', 304, 0.3, 82, 0, { n: 'tatlı kaşığı', g: 7 }),
  F('banana', 'Muz', 89, 1.1, 23, 0.3, { n: 'adet', g: 120 }),
  F('apple', 'Elma', 52, 0.3, 14, 0.2, { n: 'adet', g: 180 }),
  F('orange', 'Portakal', 47, 0.9, 12, 0.1, { n: 'adet', g: 150 }),
  F('dates', 'Hurma', 282, 2.5, 75, 0.4, { n: 'adet', g: 8 }),
  F('tomato', 'Domates', 18, 0.9, 3.9, 0.2, { n: 'adet', g: 120 }),
  F('cucum', 'Salatalık', 15, 0.7, 3.6, 0.1, { n: 'adet', g: 150 }),
  F('salad', 'Yeşil salata (soslu)', 70, 1.5, 5, 5, { n: 'kase', g: 150 }),
  F('broc', 'Brokoli', 34, 2.8, 7, 0.4),
  F('avo', 'Avokado', 160, 2, 8.5, 14.7, { n: 'adet', g: 150 }),
  F('whey', 'Whey protein tozu', 390, 78, 8, 6, { n: 'ölçek', g: 30 }),
  F('ricecake', 'Pirinç patlağı', 387, 8, 81, 3, { n: 'adet', g: 9 }),
  F('dchoc', 'Bitter çikolata (%70)', 598, 7.8, 46, 43, { n: 'kare', g: 10 }),
  F('cola', 'Kola', 42, 0, 10.6, 0, { n: 'kutu', g: 330 }),
  F('tea', 'Çay (şekersiz)', 1, 0, 0.2, 0, { n: 'bardak', g: 100 }),
  F('sugar', 'Şeker', 387, 0, 100, 0, { n: 'küp', g: 3 }),
];
const MEALS = [['b', 'Kahvaltı', '🌅'], ['l', 'Öğle', '☀️'], ['d', 'Akşam', '🌙'], ['s', 'Ara öğün', '🍎']];
const allFoods = () => [...S.diet.foods, ...BUILTIN_FOODS];
const foodById = id => allFoods().find(f => f.id === id);
const macrosOf = e => { const k = e.g / 100; return { kcal: e.per.kcal * k, p: e.per.p * k, c: e.per.c * k, f: e.per.f * k }; };
function dayTotals(k) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  (S.diet.log[k] || []).forEach(e => { const m = macrosOf(e); for (const x in t) t[x] += m[x]; });
  return t;
}
let dietDay = null;

function ring(val, max, color, size = 118, sw = 12) {
  const r = (size - sw) / 2, C = 2 * Math.PI * r, p = Math.min(1, max ? val / max : 0);
  return `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--card-2)" stroke-width="${sw}" fill="none"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/></svg>`;
}
function macroBar(lbl, v, t, col) {
  return `<div class="macro"><div class="row between"><span class="b">${lbl}</span><span class="muted">${Math.round(v)} / ${t} g</span></div><div class="bar"><i style="width:${Math.min(100, t ? v / t * 100 : 0)}%;background:${col}"></i></div></div>`;
}
const MC = { p: '#FF6B8A', c: '#FFB020', f: '#4DA3FF' };

Pages.diet = () => {
  const k = dietDay || today(); const T = S.diet.targets; const t = dayTotals(k);
  const left = T.kcal - t.kcal;
  const water = S.diet.water[k] || 0; const glasses = Math.max(8, Math.ceil(T.water / 250));
  const log = S.diet.log[k] || [];
  const meals = MEALS.map(([m, name, ic]) => {
    const es = log.filter(e => e.meal === m); const kc = es.reduce((a, e) => a + macrosOf(e).kcal, 0);
    return `<div class="card tight"><div class="row between" style="padding:12px 16px 6px"><div class="b">${ic} ${name}</div><div class="row"><span class="small muted">${Math.round(kc)} kcal</span><button class="btn ghost sm" onclick="addFood('${k}','${m}')">+ Ekle</button></div></div>
      ${es.map(e => { const mm = macrosOf(e); return `<div class="list-item" onclick="editLogEntry('${k}','${e.id}')" style="cursor:pointer;padding:9px 16px"><div class="grow"><div class="small b ellip">${esc(e.name)}</div><div class="tiny muted">${e.qty ? `${r1(e.qty)} ${esc(e.unitName)} · ` : ''}${Math.round(e.g)} g · P ${r1(mm.p)} · K ${r1(mm.c)} · Y ${r1(mm.f)}</div></div><span class="small b">${Math.round(mm.kcal)}</span></div>`; }).join('')}</div>`;
  }).join('');
  const w = S.diet.weight; const lastW = w.length ? w[w.length - 1] : null;
  const isToday = k === today();
  return header('Diyet', `<button onclick="dietDay=addDays('${k}',-1);render()" style="color:var(--accent);font-weight:700">‹</button> ${isToday ? 'Bugün' : fmtDate(k, { weekday: 'long', day: 'numeric', month: 'long' })} <button onclick="dietDay=addDays('${k}',1);render()" style="color:var(--accent);font-weight:700">›</button>`, `<button class="icon-btn" onclick="editTargets()">⚙︎</button>`) + `
  <div class="card"><div class="ring-wrap"><div class="ring">${ring(t.kcal, T.kcal, left < 0 ? 'var(--bad)' : 'var(--accent)')}<div class="c"><b>${Math.round(Math.abs(left))}</b><span class="tiny muted">${left < 0 ? 'kcal fazla' : 'kcal kaldı'}</span></div></div>
    <div class="grow"><div class="small muted" style="margin-bottom:4px">${Math.round(t.kcal)} / ${T.kcal} kcal</div>${macroBar('Protein', t.p, T.p, MC.p)}${macroBar('Karbonhidrat', t.c, T.c, MC.c)}${macroBar('Yağ', t.f, T.f, MC.f)}</div></div></div>
  <div class="row" style="margin-bottom:12px"><button class="btn ghost grow sm" onclick="applyPlan('${k}')">📋 Diyet planını bu güne ekle</button><button class="btn plain sm" onclick="go('dietplan')">Planı düzenle</button></div>
  ${meals}
  <div class="card"><div class="row between"><h3 style="margin:0">💧 Su</h3><span class="small b">${(water / 1000).toLocaleString('tr-TR')} / ${(T.water / 1000).toLocaleString('tr-TR')} L</span></div>
    <div class="water" style="margin-top:10px">${Array.from({ length: glasses }, (_, i) => `<i class="${i < water / 250 ? 'on' : ''}" onclick="setWater('${k}',${i})"></i>`).join('')}</div><div class="tiny muted" style="margin-top:6px">Her bardak 250 ml — dokunarak işaretle</div></div>
  <div class="card"><div class="row between"><h3 style="margin:0">⚖️ Kilo</h3><button class="btn ghost sm" onclick="addWeight()">+ Tartıl</button></div>
    ${lastW ? `<div class="kpi" style="margin:8px 0 4px">${lastW.kg} kg <span class="small muted">${fmtDate(lastW.date)}</span>${w.length > 1 ? ` <span class="small" style="color:${lastW.kg - w[0].kg <= 0 ? 'var(--ok)' : 'var(--warn)'}">${lastW.kg - w[0].kg > 0 ? '+' : ''}${r1(lastW.kg - w[0].kg)} kg</span>` : ''}</div>` : ''}
    ${lineChart(w.slice(-20).map(x => ({ x: fmtDate(x.date, { day: 'numeric', month: 'short' }), y: x.kg })), { color: '#30C26B' })}</div>
  <div class="card"><h3>Son 7 gün (kcal)</h3>${weekBars()}</div>`;
};
function weekBars() {
  const T = S.diet.targets.kcal; const ds = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
  const vals = ds.map(d => dayTotals(d).kcal); const mx = Math.max(T * 1.2, ...vals);
  return `<div style="display:flex;align-items:flex-end;gap:8px;height:120px;position:relative">
    <div style="position:absolute;left:0;right:0;bottom:${T / mx * 96 + 22}px;border-top:1.5px dashed var(--muted);opacity:.5"></div>
    ${ds.map((d, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;height:100%"><div style="width:100%;max-width:30px;border-radius:7px;background:${vals[i] > T ? 'var(--warn)' : 'var(--accent)'};height:${Math.max(3, vals[i] / mx * 96)}px;opacity:${vals[i] ? 1 : .2}"></div><span class="tiny muted">${WD[parseD(d).getDay()]}</span></div>`).join('')}</div>`;
}
function setWater(k, i) { const cur = S.diet.water[k] || 0; const nv = (i + 1) * 250; S.diet.water[k] = cur === nv ? i * 250 : nv; save(); render(); }
function addWeight() {
  const last = S.diet.weight[S.diet.weight.length - 1];
  const s = openSheet({
    title: 'Kilo gir', left: 'Vazgeç', right: 'Kaydet',
    body: `<div class="field"><label>Kilo (kg)</label><input id="wk" inputmode="decimal" value="${last ? last.kg : ''}"></div><div class="field"><label>Tarih</label><input id="wd" type="date" value="${today()}"></div>
    ${S.diet.weight.length ? `<div class="card tight">${[...S.diet.weight].reverse().slice(0, 10).map(w => `<div class="list-item"><div class="grow">${fmtDate(w.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div><b>${w.kg} kg</b><button class="muted" data-del="${w.date}">✕</button></div>`).join('')}</div>` : ''}`,
    onRight: sh => {
      const kg = num(sh.querySelector('#wk').value); const date = sh.querySelector('#wd').value || today(); if (!kg) { toast('Kilo gir'); return false; }
      S.diet.weight = S.diet.weight.filter(w => w.date !== date); S.diet.weight.push({ date, kg }); S.diet.weight.sort((a, b) => a.date < b.date ? -1 : 1); save(); render();
    }
  });
  s.sh.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.diet.weight = S.diet.weight.filter(w => w.date !== b.dataset.del); save(); b.closest('.list-item').remove(); render(); });
}
function editTargets() {
  const T = S.diet.targets; const lastW = S.diet.weight.length ? S.diet.weight[S.diet.weight.length - 1].kg : '';
  const s = openSheet({
    title: 'Günlük hedefler', left: 'Vazgeç', right: 'Kaydet',
    body: `<div class="field"><label>Kalori (kcal)</label><input id="tk" inputmode="numeric" value="${T.kcal}"></div>
    <div class="grid3"><div class="field"><label>Protein (g)</label><input id="tp" inputmode="numeric" value="${T.p}"></div><div class="field"><label>Karb. (g)</label><input id="tc" inputmode="numeric" value="${T.c}"></div><div class="field"><label>Yağ (g)</label><input id="tf" inputmode="numeric" value="${T.f}"></div></div>
    <div class="small muted" id="tsum" style="margin:-4px 0 12px"></div>
    <div class="field"><label>Su (ml)</label><input id="tw" inputmode="numeric" value="${T.water}"></div>
    <div class="card"><h3>Makroları kaloriye göre dağıt</h3><div class="small muted" style="margin-bottom:8px">Protein kilona göre (g/kg), yağ kalorinin %25'i, kalanı karbonhidrat.</div>
      <div class="grid2"><div class="field"><label>Kilon (kg)</label><input id="ck" inputmode="decimal" value="${lastW}"></div><div class="field"><label>Protein g/kg</label><input id="cp" inputmode="decimal" value="2"></div></div>
      <button class="btn plain full sm" id="calc">Hesapla</button></div>
    <div class="tiny muted">Hedefleri bir diyetisyen veya antrenörle belirlemen en doğrusu; buradaki hesap sadece kolaylık için.</div>`,
    onRight: sh => { Object.assign(T, { kcal: num(sh.querySelector('#tk').value) || 2000, p: num(sh.querySelector('#tp').value), c: num(sh.querySelector('#tc').value), f: num(sh.querySelector('#tf').value), water: num(sh.querySelector('#tw').value) || 2500 }); save(); render(); }
  });
  const sum = () => { const p = num(s.sh.querySelector('#tp').value), c = num(s.sh.querySelector('#tc').value), f = num(s.sh.querySelector('#tf').value); s.sh.querySelector('#tsum').textContent = `Makroların toplamı: ${Math.round(p * 4 + c * 4 + f * 9)} kcal`; };
  s.sh.querySelectorAll('#tp,#tc,#tf').forEach(i => i.oninput = sum); sum();
  s.sh.querySelector('#calc').onclick = () => {
    const kc = num(s.sh.querySelector('#tk').value), kg = num(s.sh.querySelector('#ck').value), gk = num(s.sh.querySelector('#cp').value);
    if (!kc || !kg) { toast('Kalori ve kilo gir'); return; }
    const p = Math.round(kg * gk), f = Math.round(kc * .25 / 9), c = Math.max(0, Math.round((kc - p * 4 - f * 9) / 4));
    s.sh.querySelector('#tp').value = p; s.sh.querySelector('#tf').value = f; s.sh.querySelector('#tc').value = c; sum();
  };
}

/* Besin ekleme */
function addFood(k, meal, target = null) {
  // target: plan dizisi; null ise günlük kayıt
  let q = '';
  const s = openSheet({ title: 'Besin ekle · ' + MEALS.find(m => m[0] === meal)[1], left: 'Bitti', body: `<input id="fq" placeholder="Besin ara…" style="margin-bottom:10px"><div class="row" style="margin-bottom:10px"><button class="btn ghost sm grow" id="fnew">+ Yeni besin</button><button class="btn plain sm grow" id="fquick">⚡ Hızlı kalori ekle</button></div><div class="card tight" id="fl"></div>` });
  const draw = () => {
    const ql = q.toLocaleLowerCase('tr');
    const recentIds = [...new Set(Object.values(S.diet.log).flat().slice(-60).reverse().map(e => e.foodId).filter(Boolean))];
    let list = allFoods().filter(f => !ql || f.name.toLocaleLowerCase('tr').includes(ql));
    if (!ql) list.sort((a, b) => { const ia = recentIds.indexOf(a.id), ib = recentIds.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
    s.sh.querySelector('#fl').innerHTML = list.map(f => `<div class="list-item" data-id="${f.id}" style="cursor:pointer;padding:10px 16px"><div class="grow"><div class="small b">${esc(f.name)}${recentIds.includes(f.id) && !ql ? ' <span class="tag">son</span>' : ''}</div><div class="tiny muted">100 g: ${f.kcal} kcal · P ${f.p} · K ${f.c} · Y ${f.f}${f.unit ? ` · 1 ${f.unit.n} ≈ ${f.unit.g} g` : ''}</div></div><span style="color:var(--accent);font-size:22px">＋</span></div>`).join('') || '<div class="empty">Bulunamadı — "Yeni besin" ile ekle</div>';
    s.sh.querySelectorAll('#fl [data-id]').forEach(el => el.onclick = () => amountSheet(foodById(el.dataset.id), k, meal, target));
  };
  s.sh.querySelector('#fq').oninput = e => { q = e.target.value; draw(); };
  s.sh.querySelector('#fnew').onclick = () => editFood(null, f => amountSheet(f, k, meal, target));
  s.sh.querySelector('#fquick').onclick = () => quickAdd(k, meal, target);
  draw();
}
function pushEntry(k, e, target) { if (target) target.push(e); else (S.diet.log[k] = S.diet.log[k] || []).push(e); save(); render(); }
function amountSheet(f, k, meal, target, entry = null) {
  const hasU = !!f.unit; let mode = entry ? (entry.qty ? 'u' : 'g') : (hasU ? 'u' : 'g');
  const s = openSheet({
    title: f.name, left: 'Vazgeç', right: entry ? 'Kaydet' : 'Ekle',
    body: `${hasU ? `<div class="seg" id="am"><button data-m="u" class="${mode === 'u' ? 'on' : ''}">${esc(f.unit.n)}</button><button data-m="g" class="${mode === 'g' ? 'on' : ''}">gram</button></div>` : ''}
    <div class="field"><label id="al">Miktar</label><input id="aq" inputmode="decimal" value="${entry ? (entry.qty || entry.g) : (hasU ? 1 : 100)}"></div>
    <div class="card" id="ap"></div>`,
    onRight: sh => {
      const v = num(sh.querySelector('#aq').value); if (!v) { toast('Miktar gir'); return false; }
      const g = mode === 'u' ? v * f.unit.g : v;
      const e = { id: entry?.id || uid(), meal, foodId: f.id, name: f.name, g, per: { kcal: f.kcal, p: f.p, c: f.c, f: f.f }, qty: mode === 'u' ? v : 0, unitName: mode === 'u' ? f.unit.n : '' };
      if (entry) { Object.assign(entry, e); save(); render(); } else { pushEntry(k, e, target); toast(f.name + ' eklendi'); }
    }
  });
  const upd = () => {
    const v = num(s.sh.querySelector('#aq').value); const g = mode === 'u' ? v * f.unit.g : v; const x = g / 100;
    s.sh.querySelector('#al').textContent = mode === 'u' ? `Kaç ${f.unit.n}? (1 ${f.unit.n} ≈ ${f.unit.g} g)` : 'Gram';
    s.sh.querySelector('#ap').innerHTML = `<div class="row between"><div><div class="kpi">${Math.round(f.kcal * x)}</div><div class="tiny muted">kcal · ${Math.round(g)} g</div></div><div class="small" style="text-align:right"><div><b style="color:${MC.p}">P</b> ${r1(f.p * x)} g</div><div><b style="color:${MC.c}">K</b> ${r1(f.c * x)} g</div><div><b style="color:${MC.f}">Y</b> ${r1(f.f * x)} g</div></div></div>`;
  };
  s.sh.querySelector('#aq').oninput = upd;
  s.sh.querySelectorAll('#am button').forEach(b => b.onclick = () => {
    const v = num(s.sh.querySelector('#aq').value); const nm = b.dataset.m; if (nm === mode) return;
    s.sh.querySelector('#aq').value = nm === 'g' ? Math.round(v * f.unit.g) : r1(v / f.unit.g); mode = nm;
    s.sh.querySelectorAll('#am button').forEach(x => x.classList.toggle('on', x === b)); upd();
  });
  upd();
}
function quickAdd(k, meal, target) {
  const s = openSheet({
    title: 'Hızlı ekle', left: 'Vazgeç', right: 'Ekle',
    body: `<div class="field"><label>Ne yedin?</label><input id="qn" placeholder="ör. Dışarıda lahmacun"></div><div class="grid2"><div class="field"><label>Kalori</label><input id="qk" inputmode="numeric"></div><div class="field"><label>Protein (g)</label><input id="qp" inputmode="decimal"></div><div class="field"><label>Karb. (g)</label><input id="qc" inputmode="decimal"></div><div class="field"><label>Yağ (g)</label><input id="qf" inputmode="decimal"></div></div>`,
    onRight: sh => { const g = id => num(sh.querySelector(id).value); if (!g('#qk')) { toast('Kalori gir'); return false; } pushEntry(k, { id: uid(), meal, name: sh.querySelector('#qn').value.trim() || 'Hızlı ekleme', g: 100, per: { kcal: g('#qk'), p: g('#qp'), c: g('#qc'), f: g('#qf') }, qty: 0, unitName: '' }, target); }
  });
}
function editFood(id, cb) {
  const f = id ? S.diet.foods.find(x => x.id === id) : null;
  const s = openSheet({
    title: f ? 'Besini düzenle' : 'Yeni besin', left: 'Vazgeç', right: 'Kaydet',
    body: `<div class="field"><label>Besin adı</label><input id="nn" value="${esc(f?.name || '')}"></div><div class="small muted" style="margin:-4px 0 10px">Değerler 100 gram içindir (paket üstündeki tablodan bakabilirsin).</div>
    <div class="grid2"><div class="field"><label>Kalori</label><input id="nk" inputmode="decimal" value="${f?.kcal ?? ''}"></div><div class="field"><label>Protein (g)</label><input id="np" inputmode="decimal" value="${f?.p ?? ''}"></div><div class="field"><label>Karb. (g)</label><input id="nc" inputmode="decimal" value="${f?.c ?? ''}"></div><div class="field"><label>Yağ (g)</label><input id="nf" inputmode="decimal" value="${f?.f ?? ''}"></div></div>
    <div class="grid2"><div class="field"><label>Porsiyon adı (isteğe bağlı)</label><input id="nu" placeholder="ör. adet, kase" value="${esc(f?.unit?.n || '')}"></div><div class="field"><label>1 porsiyon kaç gram?</label><input id="ng" inputmode="decimal" value="${f?.unit?.g || ''}"></div></div>
    ${f ? '<button class="btn danger full" id="nd">Besini sil</button>' : ''}`,
    onRight: sh => {
      const g = id => num(sh.querySelector(id).value); const name = sh.querySelector('#nn').value.trim(); if (!name) { toast('Besin adı gir'); return false; }
      const un = sh.querySelector('#nu').value.trim(), ug = g('#ng');
      let o = f; if (!o) { o = { id: uid() }; S.diet.foods.unshift(o); }
      Object.assign(o, { name, kcal: g('#nk'), p: g('#np'), c: g('#nc'), f: g('#nf'), unit: un && ug ? { n: un, g: ug } : null }); save(); render(); cb && cb(o);
    }
  });
  const d = s.sh.querySelector('#nd'); if (d) d.onclick = () => { S.diet.foods.splice(S.diet.foods.indexOf(f), 1); save(); closeSheet(s); render(); };
}
function editLogEntry(k, id, target = null) {
  const list = target || S.diet.log[k]; const e = list.find(x => x.id === id);
  const f = (e.foodId && foodById(e.foodId)) || null;
  if (f) {
    amountSheet(f, k, e.meal, target, e);
    const s = sheetStack[sheetStack.length - 1];
    const b = document.createElement('button'); b.className = 'btn danger full'; b.textContent = 'Sil';
    b.onclick = () => { list.splice(list.indexOf(e), 1); save(); closeSheet(s); render(); }; s.sh.querySelector('.sheet-b').append(b);
  } else confirmSheet(`"${e.name}" silinsin mi?`, () => { list.splice(list.indexOf(e), 1); save(); render(); });
}
function applyPlan(k) {
  if (!S.diet.plan.length) { toast('Önce diyet planını oluştur'); go('dietplan'); return; }
  (S.diet.log[k] = S.diet.log[k] || []).push(...S.diet.plan.map(e => ({ ...e, id: uid() }))); save(); render(); toast('Plan eklendi — yemediklerini silebilirsin');
}

Pages.dietplan = () => {
  const P = S.diet.plan; const t = { kcal: 0, p: 0, c: 0, f: 0 }; P.forEach(e => { const m = macrosOf(e); for (const x in t) t[x] += m[x]; });
  const T = S.diet.targets;
  return header('Diyet planım', 'Her gün uyguladığın öğün planı') + `
  <div class="card"><div class="row between"><div><div class="kpi">${Math.round(t.kcal)}</div><div class="tiny muted">kcal / hedef ${T.kcal}</div></div><div class="small" style="text-align:right"><div><b style="color:${MC.p}">P</b> ${Math.round(t.p)} / ${T.p} g</div><div><b style="color:${MC.c}">K</b> ${Math.round(t.c)} / ${T.c} g</div><div><b style="color:${MC.f}">Y</b> ${Math.round(t.f)} / ${T.f} g</div></div></div></div>
  ${MEALS.map(([m, name, ic]) => { const es = P.filter(e => e.meal === m); return `<div class="card tight"><div class="row between" style="padding:12px 16px 6px"><div class="b">${ic} ${name}</div><button class="btn ghost sm" onclick="addFood(null,'${m}',S.diet.plan)">+ Ekle</button></div>${es.map(e => { const mm = macrosOf(e); return `<div class="list-item" style="padding:9px 16px;cursor:pointer" onclick="editLogEntry(null,'${e.id}',S.diet.plan)"><div class="grow"><div class="small b">${esc(e.name)}</div><div class="tiny muted">${e.qty ? r1(e.qty) + ' ' + esc(e.unitName) + ' · ' : ''}${Math.round(e.g)} g · P ${r1(mm.p)} · K ${r1(mm.c)} · Y ${r1(mm.f)}</div></div><span class="small b">${Math.round(mm.kcal)}</span></div>`; }).join('')}</div>`; }).join('')}
  <div class="small muted" style="text-align:center">Diyet sayfasındaki "Diyet planını bu güne ekle" ile tek dokunuşta güne aktarılır.</div>`;
};
