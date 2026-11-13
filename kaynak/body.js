/* ===== Anatomik vücut haritası ===== */
const MUSCLES = {
  chest_up: 'Üst göğüs', chest_mid: 'Orta göğüs', chest_low: 'Alt göğüs',
  fdelt: 'Ön omuz', sdelt: 'Yan omuz', rdelt: 'Arka omuz',
  biceps: 'Biceps', triceps: 'Triceps', forearm: 'Ön kol',
  abs_up: 'Üst karın', abs_low: 'Alt karın', obliques: 'Yan karın', serratus: 'Serratus',
  neck: 'Boyun', traps_up: 'Üst trapez', traps_mid: 'Orta sırt', lats: 'Kanat (lat)', lowback: 'Bel',
  glutes: 'Kalça', quads: 'Ön bacak', hams: 'Arka bacak', adductors: 'İç bacak', calves: 'Baldır'
};
const OLD_MUSCLE = { chest: 'chest_mid', traps: 'traps_up', abs: 'abs_up' };
const normMuscles = arr => [...new Set((arr || []).map(k => OLD_MUSCLE[k] || k).filter(k => MUSCLES[k]))];

/* Noktalardan yumuşak kapalı eğri (Catmull-Rom → Bezier) */
function smoothPath(pts, t = 1) {
  const n = pts.length; const f = v => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * t, p1[1] + (p2[1] - p0[1]) / 6 * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * t, p2[1] - (p3[1] - p1[1]) / 6 * t];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}
/* Gövdenin sol yarısı (x ≤ 100); sağ yarı aynalanır */
const SIL = [[100, 12], [88, 16], [81, 34], [83, 52], [89, 62], [89, 76], [76, 84], [60, 88], [47, 95], [39, 110], [36, 130], [34, 155], [32, 178],
  [28, 196], [25, 220], [26, 245], [28, 258], [24, 272], [27, 290], [34, 296], [40, 288], [42, 270], [44, 256], [50, 232], [54, 205], [56, 186],
  [58, 160], [61, 138], [63, 150], [64, 180], [67, 212], [66, 232], [62, 252], [60, 280], [61, 320], [64, 355], [66, 378], [63, 400],
  [64, 430], [68, 458], [70, 474], [62, 486], [66, 494], [88, 494], [92, 484], [89, 470], [92, 440], [95, 405], [94, 380], [96, 350], [99, 300], [100, 276]];
const SIL_D = (() => { const L = SIL, R = [...SIL].reverse().map(([x, y]) => [200 - x, y]); return smoothPath([...L, ...R.slice(1, -1)], .9); })();
const HEAD_D = smoothPath([[100, 8], [86, 13], [80, 30], [82, 50], [90, 62], [100, 66], [110, 62], [118, 50], [120, 30], [114, 13]]);

/* Kas şekilleri: [kas, görünüm(f/b), noktalar] — sol yarı */
const MSHAPES = [
  // ÖN
  ['neck', 'f', [[93.5, 62], [99.5, 63], [99.5, 87], [96, 86], [94, 76]]],
  ['traps_up', 'f', [[90, 70], [76, 84], [86, 87], [93, 82]]],
  ['chest_up', 'f', [[99.5, 92], [86, 89], [72, 91], [62, 98], [60, 108], [80, 110], [99.5, 111]]],
  ['chest_mid', 'f', [[99.5, 113], [80, 112], [59, 110], [57, 122], [62, 131], [82, 132], [99.5, 130]]],
  ['chest_low', 'f', [[99.5, 132], [82, 134], [63, 133], [67, 143], [79, 151], [93, 153], [99.5, 149]]],
  ['fdelt', 'f', [[70, 92], [60, 89], [50, 96], [47, 110], [50, 124], [57, 122], [64, 108], [66, 99]]],
  ['sdelt', 'f', [[56, 89], [46, 95], [40, 109], [40, 124], [46, 126], [48, 110], [52, 97]]],
  ['biceps', 'f', [[50, 128], [57, 128], [59, 145], [57, 166], [52, 180], [45, 178], [42, 158], [44, 138]]],
  ['forearm', 'f', [[45, 184], [54, 190], [52, 212], [46, 238], [39, 252], [31, 250], [29, 228], [33, 202], [38, 188]]],
  ['serratus', 'f', [[62, 134], [68, 140], [71, 152], [69, 163], [65, 160], [63, 146]]],
  ['obliques', 'f', [[73, 154], [84, 157], [85, 180], [84, 208], [78, 228], [69, 231], [67, 208], [67, 180], [70, 164]]],
  ['abs_up', 'f', [[87, 156], [98.5, 156], [98.5, 171], [87, 172]]],
  ['abs_up', 'f', [[87, 174], [98.5, 173], [98.5, 188], [87, 189]]],
  ['abs_low', 'f', [[87, 191], [98.5, 190], [98.5, 205], [87, 206]]],
  ['abs_low', 'f', [[87, 208], [98.5, 207], [98.5, 242], [94, 238], [88, 226]]],
  ['quads', 'f', [[63, 258], [76, 266], [79, 300], [78, 340], [73, 368], [65, 362], [61, 330], [60, 290]]],
  ['quads', 'f', [[79, 262], [93, 266], [94, 300], [91, 336], [85, 360], [80, 350], [79, 310], [77, 280]]],
  ['quads', 'f', [[90, 334], [95, 344], [95, 366], [89, 374], [83, 366], [86, 350]]],
  ['adductors', 'f', [[93, 268], [99, 276], [98.5, 300], [95, 324], [91, 312], [92, 290]]],
  ['calves', 'f', [[66, 392], [71, 388], [74, 410], [73, 440], [68, 448], [65, 425]]],
  ['calves', 'f', [[91, 392], [95, 398], [94, 425], [90, 446], [87, 430], [88, 410]]],
  // ARKA
  ['neck', 'b', [[93, 49], [99.5, 49], [99.5, 60.5], [93, 64.5], [91.5, 56]]],
  ['traps_up', 'b', [[99.5, 62], [92, 66], [88, 78], [76, 85], [64, 90], [80, 94], [99.5, 96]]],
  ['traps_mid', 'b', [[99.5, 98], [82, 96], [68, 98], [72, 108], [84, 122], [94, 140], [99.5, 160]]],
  ['rdelt', 'b', [[66, 92], [55, 92], [47, 100], [45, 114], [52, 120], [62, 114], [68, 102]]],
  ['sdelt', 'b', [[56, 89], [46, 95], [40, 109], [40, 124], [45, 120], [48, 104]]],
  ['triceps', 'b', [[46, 124], [56, 122], [59, 140], [58, 162], [54, 180], [46, 180], [41, 160], [42, 138]]],
  ['forearm', 'b', [[45, 184], [54, 190], [52, 212], [46, 238], [39, 252], [31, 250], [29, 228], [33, 202], [38, 188]]],
  ['lats', 'b', [[66, 112], [76, 116], [86, 128], [94, 150], [96, 178], [90, 196], [80, 204], [71, 190], [66, 160], [63, 132]]],
  ['lowback', 'b', [[91, 166], [99, 172], [99, 236], [92, 238], [87, 222], [88, 196]]],
  ['obliques', 'b', [[68, 194], [79, 208], [84, 226], [70, 232], [66, 214]]],
  ['glutes', 'b', [[99.5, 242], [86, 238], [72, 242], [64, 256], [64, 276], [72, 290], [86, 294], [99.5, 290]]],
  ['hams', 'b', [[62, 292], [80, 296], [81, 330], [78, 370], [70, 368], [63, 340], [61, 312]]],
  ['hams', 'b', [[82, 296], [98, 294], [98, 320], [95, 352], [88, 374], [81, 368], [81, 330]]],
  ['adductors', 'b', [[96, 296], [99.5, 298], [99.5, 318], [96, 330]]],
  ['calves', 'b', [[65, 388], [79, 384], [82, 410], [80, 438], [72, 448], [64, 425]]],
  ['calves', 'b', [[82, 384], [95, 388], [96, 420], [91, 446], [83, 438], [81, 410]]],
];
const MPATHS = MSHAPES.map(([k, v, p]) => [k, v, smoothPath(p)]);
/* Kas lifi çizgileri (görünüş için) */
const FIBERS = [
  ['f', 'M99,101 Q84,99 66,101'], ['f', 'M99,121 Q82,120 61,121'], ['f', 'M99,141 Q86,142 70,139'],
  ['f', 'M56,100 Q52,112 52,122'], ['f', 'M51,140 Q51,158 49,174'], ['f', 'M40,200 Q36,222 34,244'],
  ['f', 'M70,280 Q70,320 69,355'], ['f', 'M86,280 Q86,315 84,345'],
  ['b', 'M99,110 Q86,112 76,104'], ['b', 'M74,140 Q80,165 86,192'], ['b', 'M50,140 Q50,158 49,174'],
  ['b', 'M80,250 Q76,270 80,288'], ['b', 'M71,310 Q72,340 72,360'], ['b', 'M89,310 Q89,340 88,362'], ['b', 'M74,400 Q75,420 74,436'], ['b', 'M88,400 Q88,420 87,436']
];

function heat(v) { const h = 140 - 140 * Math.min(1, v); return `hsl(${h},78%,${52 + (1 - v) * 4}%)`; }
/* vals: {kas: 0..1}; mode: heat | hi; vb: özel görünüm alanı */
function bodySVG(vals = {}, { mode = 'heat', labels = true, vb = null, click = false } = {}) {
  const fill = v => {
    if (!v || v < 0.01) return 'var(--muscle-off)';
    if (mode === 'hi') return v >= 1 ? 'var(--accent)' : 'var(--accent-2)';
    return heat(v);
  };
  const fig = (view, ox) => {
    const mir = `translate(${ox + 200},0) scale(-1,1)`;
    let m = '';
    for (const [k, v, d] of MPATHS) if (v === view) { const c = fill(vals[k]); m += `<path d="${d}" fill="${c}"${click ? ` data-m="${k}" style="cursor:pointer"` : ''}/>`; }
    const fib = FIBERS.filter(f => f[0] === view).map(f => `<path d="${f[1]}"/>`).join('');
    const half = `<g class="mus" stroke="var(--body-line)" stroke-width="1.3" stroke-linejoin="round">${m}</g><g fill="none" stroke="rgba(0,0,0,.13)" stroke-width=".7">${fib}</g>`;
    return `<g><path d="${SIL_D}" transform="translate(${ox},0)" fill="var(--body)"/><path d="${HEAD_D}" transform="translate(${ox},0)" fill="var(--body)"/>
      <g transform="translate(${ox},0)">${half}</g><g transform="${mir}">${half}</g></g>`;
  };
  const H = labels ? 520 : 500;
  const lab = labels ? `<text x="100" y="516" text-anchor="middle" font-size="15" fill="var(--muted)" font-weight="700">ÖN</text><text x="320" y="516" text-anchor="middle" font-size="15" fill="var(--muted)" font-weight="700">ARKA</text>` : '';
  return `<svg ${click ? 'class="clickmap" ' : ''}viewBox="${vb || `0 0 420 ${H}`}" xmlns="http://www.w3.org/2000/svg">${fig('f', 0)}${fig('b', 220)}${lab}</svg>`;
}
/* Küçük resimler için kırpma alanları */
const VB = { upperF: '20 55 160 205', upperB: '240 55 160 205', lowerF: '45 235 110 265', lowerB: '265 235 110 265', fullF: '15 0 170 500', bothNoLabel: '0 0 420 500' };

/* Dokunulabilir harita: data-m taşıyan kasa tıklanınca cb(kas) */
function wireBodyClicks(root, cb) {
  root.querySelectorAll('svg.clickmap').forEach(svg => svg.addEventListener('click', e => { const m = e.target.closest('[data-m]'); if (m) cb(m.dataset.m); }));
}
function muscleFilterHTML(sel) {
  const v = sel ? { [sel]: 1 } : {};
  return `<div class="body-map" style="max-width:270px;margin:0 auto">${bodySVG(v, { mode: 'hi', click: true })}</div>
  <div class="chips" style="margin:10px 0 0">${Object.entries(MUSCLES).map(([k, n]) => `<button class="chip ${sel === k ? 'on' : ''}" data-mc="${k}">${n}</button>`).join('')}</div>`;
}
function wireMuscleFilter(root, cb) {
  wireBodyClicks(root, cb);
  root.querySelectorAll('[data-mc]').forEach(b => b.onclick = () => cb(b.dataset.mc));
  const on = root.querySelector('[data-mc].on'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
}
