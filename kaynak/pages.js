/* ===== Ruh hali ===== */
const MOODS = [[1, '😣', 'Kötü', '#FF4D5E'], [2, '😕', 'Pek iyi değil', '#FF9F43'], [3, '😐', 'İdare eder', '#FFC93C'], [4, '🙂', 'İyi', '#7BD389'], [5, '😄', 'Harika', '#30C26B']];
function setMood(k, v) { if (S.moods[k] === v) delete S.moods[k]; else S.moods[k] = v; save(); render(); }
function moodPicker(k) { return `<div class="moods">${MOODS.map(([v, e]) => `<button class="${S.moods[k] === v ? 'on' : ''}" onclick="setMood('${k}',${v})">${e}</button>`).join('')}</div>`; }

/* ===== Bugün ===== */
Pages.today = () => {
  const k = today(); const h = new Date().getHours(); const wd = new Date().getDay();
  const greet = h < 5 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : h < 22 ? 'İyi akşamlar' : 'İyi geceler';
  const nm = S.settings.name;
  // spor
  const W = S.workout; const tDay = W.days.find(d => (d.wd || []).includes(wd)); const doneToday = W.logs.find(l => l.date === k);
  let sport;
  if (W.active) sport = `<div class="row"><div class="grow"><div class="b">${esc(W.active.name)}</div><div class="small muted">Devam eden antrenman</div></div><button class="btn sm" onclick="setTab('sport');go('session')">Devam et</button></div>`;
  else if (doneToday) sport = `<div class="row"><span style="font-size:28px">✅</span><div class="grow"><div class="b">${esc(doneToday.name)} tamamlandı</div><div class="small muted">${doneToday.entries.reduce((a, e) => a + e.sets.length, 0)} set · ${doneToday.min || 0} dk</div></div></div>`;
  else if (tDay) sport = `<div class="row"><div class="ex-thumb mini">${bodySVG(dayLoad(tDay.items), { labels: false, vb: VB.bothNoLabel })}</div><div class="grow"><div class="b">${esc(tDay.name)}</div><div class="small muted">${tDay.items.length} hareket</div></div><button class="btn sm" onclick="startSession('${tDay.id}')">Başla</button></div>`;
  else sport = `<div class="row"><span style="font-size:26px">😌</span><div class="grow"><div class="b">Bugün dinlenme günü</div><div class="small muted">${W.days.length ? 'Programında bugüne gün atanmamış' : 'Spor programını ekleyince burada görünür'}</div></div></div>`;
  // diyet
  const T = S.diet.targets, t = dayTotals(k), water = S.diet.water[k] || 0;
  // alışkanlık
  const habits = S.habits.map(hb => `<button class="row" style="width:100%;padding:7px 0;text-align:left" onclick="toggleHabit('${hb.id}','${k}')"><span class="check ${hb.log?.[k] ? 'on' : ''}">${hb.log?.[k] ? '✓' : ''}</span><span class="grow b">${esc(hb.icon || '')} ${esc(hb.name)}</span><span class="small muted">🔥 ${streak(hb)}</span></button>`).join('');
  // görevler
  const tds = S.todos.filter(x => !x.done && x.due && x.due <= k).slice(0, 6);
  const todos = tds.map(x => todoRow(x)).join('');
  // kurs
  const crs = S.courses.filter(c => (c.days || []).includes(wd) && (!c.end || c.end >= k) && (!c.start || c.start <= k));
  // önemli tarihler
  const up = S.dates.map(d => ({ d, n: nextOcc(d) })).filter(x => x.n && x.n.left >= 0 && x.n.left <= 30).sort((a, b) => a.n.left - b.n.left).slice(0, 3);
  // geçen yıl bugün
  const ago = S.journal.find(j => j.date === addDays(k, -365) || (j.date && j.date.slice(5) === k.slice(5) && j.date < k));
  const shopLeft = S.shopping.filter(x => !x.bought);
  return `<div class="top"><div class="grow"><div class="sub">${fmtDate(k, { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>${greet}${nm ? ',<br>' + esc(nm) : ''} 👋</h1></div><button class="icon-btn" onclick="go('settings')">⚙︎</button></div>
  ${!nm ? `<div class="card" onclick="go('settings')" style="cursor:pointer"><div class="row"><span style="font-size:26px">👤</span><div class="grow"><div class="b">Seni tanıyalım</div><div class="small muted">Ayarlardan adını ve uygulama rengini seç</div></div><span class="muted">›</span></div></div>` : ''}
  <div class="card"><h3>Bugün nasıl hissediyorsun?</h3>${moodPicker(k)}</div>
  <div class="card"><h3>🏋️ Spor</h3>${sport}</div>
  <div class="card" onclick="setTab('diet')" style="cursor:pointer"><h3>🥗 Beslenme</h3><div class="row"><div class="ring" style="width:64px;height:64px">${ring(t.kcal, T.kcal, 'var(--accent)', 64, 8)}<div class="c"><b style="font-size:13px">%${Math.round(T.kcal ? t.kcal / T.kcal * 100 : 0)}</b></div></div>
    <div class="grow small"><div class="b">${Math.round(t.kcal)} / ${T.kcal} kcal</div><div class="muted">Protein ${Math.round(t.p)}/${T.p} g · Su ${(water / 1000).toLocaleString('tr-TR')} L</div></div><span class="muted">›</span></div></div>
  ${S.habits.length ? `<div class="card"><h3>Alışkanlıklar</h3>${habits}</div>` : ''}
  <div class="card ${tds.length ? 'tight' : ''}">${tds.length ? `<h3 style="padding:12px 16px 0">✅ Bugünün işleri</h3>${todos}` : `<div class="row" onclick="setTab('todos')" style="cursor:pointer"><span style="font-size:24px">✅</span><div class="grow"><div class="b">Bugün için iş yok</div><div class="small muted">Yapılacaklara ekle</div></div><span class="muted">›</span></div>`}</div>
  ${crs.length ? `<div class="card"><h3>🎓 Bugünkü dersler</h3>${crs.map(c => `<div class="row" style="padding:4px 0"><div class="grow b">${esc(c.name)}</div><span class="b" style="color:var(--accent)">${esc(c.time || '')}</span></div>`).join('')}</div>` : ''}
  ${up.length ? `<div class="card"><h3>📅 Yaklaşan tarihler</h3>${up.map(({ d, n }) => `<div class="row" style="padding:4px 0"><span style="font-size:20px">${esc(d.emoji || '🎉')}</span><div class="grow b">${esc(d.title)}</div><span class="small ${n.left <= 3 ? 'b' : 'muted'}" style="${n.left <= 3 ? 'color:var(--accent)' : ''}">${n.left === 0 ? 'Bugün!' : n.left + ' gün'}</span></div>`).join('')}</div>` : ''}
  ${shopLeft.length ? `<div class="card" onclick="go('shopping')" style="cursor:pointer"><div class="row"><span style="font-size:24px">🛒</span><div class="grow"><div class="b">${shopLeft.length} ürün alınacak</div><div class="small muted">Toplam ${fmtMoney(shopLeft.reduce((a, x) => a + num(x.price) * (num(x.qty) || 1), 0))}</div></div><span class="muted">›</span></div></div>` : ''}
  ${ago ? `<div class="card" onclick="go('journal')" style="cursor:pointer"><h3>💭 Geçmişte bugün · ${fmtDate(ago.date, { year: 'numeric', month: 'long', day: 'numeric' })}</h3><div class="small" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(ago.text)}</div></div>` : ''}
  <button class="btn ghost full" onclick="editJournal(null)">✍️ Bugünü günlüğe yaz</button>`;
};

/* ===== Alışkanlıklar ===== */
function toggleHabit(id, k) { const h = S.habits.find(x => x.id === id); h.log = h.log || {}; if (h.log[k]) delete h.log[k]; else h.log[k] = true; save(); render(); }
function streak(h) { let k = today(), n = 0; if (!h.log?.[k]) k = addDays(k, -1); while (h.log?.[k]) { n++; k = addDays(k, -1); } return n; }
const HABIT_F = [{ k: 'icon', label: 'Simge (emoji)', ph: '💧' }, { k: 'name', label: 'Alışkanlık', ph: 'ör. 10 sayfa kitap oku' }];
Pages.habits = () => header('Alışkanlıklar', 'Her gün küçük adımlar', `<button class="icon-btn" onclick="editRecord({title:'alışkanlık',list:S.habits,item:null,fields:HABIT_F,required:'name',defaults:{log:{}}})">＋</button>`) +
  (S.habits.length ? S.habits.map(h => {
    const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13));
    const month = Object.keys(h.log || {}).filter(d => d.slice(0, 7) === today().slice(0, 7)).length;
    return `<div class="card"><div class="row"><button class="check ${h.log?.[today()] ? 'on' : ''}" onclick="toggleHabit('${h.id}','${today()}')">${h.log?.[today()] ? '✓' : ''}</button><div class="grow" onclick="editRecord({title:'alışkanlık',list:S.habits,item:S.habits.find(x=>x.id==='${h.id}'),fields:HABIT_F,required:'name'})" style="cursor:pointer"><div class="b">${esc(h.icon || '')} ${esc(h.name)}</div><div class="small muted">🔥 ${streak(h)} gün seri · bu ay ${month} gün</div></div></div>
    <div class="dots" style="margin-top:10px;justify-content:space-between">${days.map(d => `<i class="${h.log?.[d] ? 'on' : ''}" onclick="toggleHabit('${h.id}','${d}')" title="${d}" style="width:16px;height:16px;cursor:pointer"></i>`).join('')}</div><div class="tiny muted" style="margin-top:4px">Son 14 gün — geçmiş günleri de işaretleyebilirsin</div></div>`;
  }).join('') : `<div class="card empty"><div class="e">🔥</div>Su içmek, kitap okumak, erken kalkmak…<br>Takip etmek istediğin ilk alışkanlığı ekle.</div>`);

/* ===== Yapılacaklar ===== */
const TODO_F = [{ k: 'text', label: 'Görev', ph: 'Ne yapılacak?' }, { k: 'due', label: 'Tarih', type: 'date' }, { k: 'prio', label: 'Öncelik', type: 'select', options: [['0', 'Normal'], ['1', 'Önemli'], ['2', 'Acil']] }, { k: 'note', label: 'Not', type: 'textarea', rows: 3 }];
function todoRow(x) {
  const k = today(); const late = x.due && x.due < k && !x.done;
  const pr = x.prio === '2' ? '<span class="tag" style="background:rgba(255,77,94,.15);color:var(--bad)">Acil</span>' : x.prio === '1' ? '<span class="tag" style="background:rgba(255,176,32,.15);color:#D98E00">Önemli</span>' : '';
  return `<div class="list-item ${x.done ? 'done' : ''}"><button class="check ${x.done ? 'on' : ''}" onclick="toggleTodo('${x.id}')">${x.done ? '✓' : ''}</button><div class="grow" onclick="editRecord({title:'görev',list:S.todos,item:S.todos.find(t=>t.id==='${x.id}'),fields:TODO_F,required:'text'})" style="cursor:pointer"><div class="t">${esc(x.text)}</div><div class="tiny ${late ? '' : 'muted'}" style="${late ? 'color:var(--bad)' : ''}">${pr}${x.due ? (x.due === k ? 'Bugün' : x.due === addDays(k, 1) ? 'Yarın' : fmtDate(x.due, { day: 'numeric', month: 'short', weekday: 'short' })) : ''}${x.note ? ' · 📝' : ''}</div></div></div>`;
}
function toggleTodo(id) { const t = S.todos.find(x => x.id === id); t.done = !t.done; t.doneAt = t.done ? Date.now() : null; save(); render(); }
function quickTodo(inp) {
  const v = inp.value.trim(); if (!v) return;
  S.todos.unshift({ id: uid(), text: v, due: S._todoDue || '', prio: '0', created: Date.now() }); inp.value = ''; save(); render();
  setTimeout(() => { const i = $('#qt'); i && i.focus(); }, 30);
}
let showDone = false;
Pages.todos = () => {
  const k = today(); const open = S.todos.filter(x => !x.done);
  const sortF = (a, b) => (b.prio || 0) - (a.prio || 0) || (a.due || 'z').localeCompare(b.due || 'z');
  const groups = [
    ['⚠️ Gecikmiş', open.filter(x => x.due && x.due < k)],
    ['📌 Bugün', open.filter(x => x.due === k)],
    ['🗓 Yakında', open.filter(x => x.due && x.due > k)],
    ['📥 Tarihsiz', open.filter(x => !x.due)]
  ].filter(g => g[1].length);
  const done = S.todos.filter(x => x.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  return header('Yapılacaklar', open.length + ' açık görev') + `
  <div class="card" style="padding:10px"><form onsubmit="event.preventDefault();quickTodo(this.q)" class="row"><input id="qt" name="q" placeholder="Yeni görev ekle…" autocomplete="off"><button class="btn sm" type="submit">Ekle</button></form>
    <div class="chips" style="margin:10px 0 0">${[['', 'Tarihsiz'], [k, 'Bugün'], [addDays(k, 1), 'Yarın']].map(([v, l]) => `<button class="chip ${(S._todoDue || '') === v ? 'on' : ''}" onclick="S._todoDue='${v}';render()">${l}</button>`).join('')}<button class="chip" onclick="editRecord({title:'görev',list:S.todos,item:null,fields:TODO_F,required:'text',defaults:{prio:'0'}})">Ayrıntılı…</button></div></div>
  ${groups.length ? groups.map(([t, l]) => `<div class="card tight"><h3 style="padding:12px 16px 0">${t}</h3>${l.sort(sortF).map(todoRow).join('')}</div>`).join('') : '<div class="card empty"><div class="e">🎉</div>Hiç açık görevin yok</div>'}
  ${done.length ? `<button class="btn plain full" onclick="showDone=!showDone;render()" style="margin-bottom:12px">${showDone ? 'Tamamlananları gizle' : `Tamamlananlar (${done.length})`}</button>${showDone ? `<div class="card tight">${done.slice(0, 50).map(todoRow).join('')}</div><button class="btn danger full sm" onclick="confirmSheet('Tamamlanan tüm görevler silinecek.',()=>{S.todos=S.todos.filter(x=>!x.done);save();render()})">Tamamlananları temizle</button>` : ''}` : ''}`;
};

/* ===== Daha fazla ===== */
const MORE = [
  ['journal', '📔', 'Günlük', () => S.journal.length + ' yazı'], ['notes', '📝', 'Notlar', () => S.notes.length + ' not'],
  ['habits', '🔥', 'Alışkanlıklar', () => S.habits.length + ' alışkanlık'], ['goals', '🎯', 'Hedefler', () => S.goals.length + ' hedef'],
  ['courses', '🎓', 'Kurslar', () => S.courses.length + ' kurs'], ['outfits', '👕', 'Kombinler', () => S.outfits.combos.length + ' kombin · ' + S.outfits.items.length + ' parça'],
  ['shopping', '🛒', 'Alınacaklar', () => S.shopping.filter(x => !x.bought).length + ' ürün'], ['books', '📚', 'Kitaplar', () => S.books.filter(b => b.status === 'done').length + ' okundu'],
  ['movies', '🎬', 'Film & Dizi', () => S.movies.filter(b => b.status === 'done').length + ' izlendi'], ['dates', '📅', 'Önemli tarihler', () => S.dates.length + ' tarih'],
  ['dietplan', '📋', 'Diyet planı', () => S.diet.plan.length + ' besin'], ['settings', '⚙️', 'Ayarlar', () => 'Tema, şifre, yedek'],
];
Pages.more = () => header('Daha fazla', 'Hayatının geri kalanı') + `<div class="grid2">${MORE.map(([p, i, n, d]) => `<button class="tile" onclick="go('${p}')"><span class="ic">${i}</span><span class="nm">${n}</span><span class="ds">${d()}</span></button>`).join('')}</div>`;

/* ===== Günlük ===== */
let calMonth = null;
function editJournal(id) {
  const j = id ? S.journal.find(x => x.id === id) : null;
  const k = j?.date || today(); const existing = !j && S.journal.find(x => x.date === k);
  if (existing) return editJournal(existing.id);
  const s = openSheet({
    title: j ? fmtDate(k, { day: 'numeric', month: 'long' }) : 'Bugün', left: 'Vazgeç', right: 'Kaydet',
    body: `<div class="field"><label>Tarih</label><input type="date" id="jd" value="${k}"></div>
    <div class="field"><label>Ruh halin</label><div class="moods" id="jm">${MOODS.map(([v, e]) => `<button type="button" data-v="${v}" class="${S.moods[k] === v ? 'on' : ''}">${e}</button>`).join('')}</div></div>
    <div class="field"><label>Neler oldu?</label><textarea id="jt" rows="9" placeholder="Bugün neler yaşadın, ne hissettin, neye minnettarsın?">${esc(j?.text || '')}</textarea></div>
    <div class="field"><label>Etiketler (virgülle)</label><input id="jg" value="${esc((j?.tags || []).join(', '))}" placeholder="iş, aile, spor"></div>
    ${j ? '<button class="btn danger full" id="jdel">Sil</button>' : ''}`,
    onRight: sh => {
      const text = sh.querySelector('#jt').value.trim(); const date = sh.querySelector('#jd').value || today();
      const mood = +(sh.querySelector('#jm .on')?.dataset.v || 0);
      if (mood) S.moods[date] = mood;
      if (!text) { if (!mood) { toast('Bir şeyler yaz'); return false; } save(); render(); return; }
      const tags = sh.querySelector('#jg').value.split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean);
      if (j) Object.assign(j, { text, date, tags }); else S.journal.push({ id: uid(), date, text, tags, created: Date.now() });
      S.journal.sort((a, b) => a.date < b.date ? 1 : -1); save(); render();
    }
  });
  s.sh.querySelectorAll('#jm button').forEach(b => b.onclick = () => s.sh.querySelectorAll('#jm button').forEach(x => x.classList.toggle('on', x === b && !x.classList.contains('on'))));
  const d = s.sh.querySelector('#jdel'); if (d) d.onclick = () => confirmSheet('Günlük yazısı silinecek.', () => { S.journal.splice(S.journal.indexOf(j), 1); closeSheet(s); save(); render(); });
}
let jq = '';
Pages.journal = () => {
  const m = calMonth || today().slice(0, 7); const [y, mo] = m.split('-').map(Number);
  const first = new Date(y, mo - 1, 1); const nd = new Date(y, mo, 0).getDate(); const off = (first.getDay() + 6) % 7;
  const cells = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => `<div class="h">${d}</div>`).join('') + '<div style="background:none"></div>'.repeat(off) +
    Array.from({ length: nd }, (_, i) => { const k = `${m}-${pad(i + 1)}`; const md = MOODS.find(x => x[0] === S.moods[k]); const has = S.journal.some(j => j.date === k); return `<div style="${md ? `background:${md[3]};color:#fff` : ''};${k === today() ? 'outline:2px solid var(--accent)' : ''};cursor:pointer" onclick="openDay('${k}')">${has ? '•' : ''}${i + 1}</div>`; }).join('');
  const mvals = Object.entries(S.moods).filter(([k]) => k.startsWith(m)).map(([, v]) => v);
  const avg = mvals.length ? mvals.reduce((a, b) => a + b, 0) / mvals.length : 0;
  const prev = `${mo === 1 ? y - 1 : y}-${pad(mo === 1 ? 12 : mo - 1)}`, next = `${mo === 12 ? y + 1 : y}-${pad(mo === 12 ? 1 : mo + 1)}`;
  const ql = jq.toLocaleLowerCase('tr');
  const list = S.journal.filter(j => !ql || j.text.toLocaleLowerCase('tr').includes(ql) || (j.tags || []).some(t => t.toLocaleLowerCase('tr').includes(ql)));
  return header('Günlük', S.journal.length + ' yazı', `<button class="icon-btn" onclick="editJournal(null)">✎</button>`) + `
  <div class="card"><div class="row between" style="margin-bottom:10px"><button onclick="calMonth='${prev}';render()" class="b" style="color:var(--accent);font-size:20px">‹</button><div class="b">${first.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</div><button onclick="calMonth='${next}';render()" class="b" style="color:var(--accent);font-size:20px">›</button></div>
    <div class="cal">${cells}</div>
    <div class="row between small" style="margin-top:10px"><span class="muted">Ay ortalaması</span><b>${avg ? MOODS[Math.round(avg) - 1][1] + ' ' + MOODS[Math.round(avg) - 1][2] : '—'}</b></div>
    <div class="legend">${MOODS.map(([, e, , c]) => `<span><i style="background:${c}"></i>${e}</span>`).join('')}</div></div>
  <input placeholder="Günlükte ara…" value="${esc(jq)}" oninput="jq=this.value;clearTimeout(window._jq);window._jq=setTimeout(()=>{render();const i=document.querySelector('#jqi');if(i){i.focus();i.setSelectionRange(99,99)}},350)" id="jqi" style="margin-bottom:12px">
  ${list.length ? list.map(j => { const md = MOODS.find(x => x[0] === S.moods[j.date]); return `<div class="card" onclick="editJournal('${j.id}')" style="cursor:pointer"><div class="row between" style="margin-bottom:6px"><div class="b">${fmtDate(j.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><span style="font-size:22px">${md ? md[1] : ''}</span></div><div class="small" style="display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap">${esc(j.text)}</div>${(j.tags || []).length ? `<div style="margin-top:8px">${j.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}</div>`; }).join('') : `<div class="card empty"><div class="e">📔</div>${jq ? 'Sonuç yok' : 'İlk günlük yazını yaz'}</div>`}`;
};
function openDay(k) { const j = S.journal.find(x => x.date === k); if (j) editJournal(j.id); else { const tmp = { id: uid(), date: k, text: '', tags: [] }; S.journal.push(tmp); editJournal(tmp.id); S.journal.splice(S.journal.indexOf(tmp), 1); } }

/* ===== Notlar ===== */
const NOTE_F = [{ k: 'title', label: 'Başlık' }, { k: 'body', label: 'Not', type: 'textarea', rows: 12 }, { k: 'folder', label: 'Klasör', ph: 'ör. Fikirler' }, { k: 'pinned', label: 'Sabitle', type: 'toggle' }];
let nq = '', nf = '';
Pages.notes = () => {
  const folders = [...new Set(S.notes.map(n => n.folder).filter(Boolean))];
  const ql = nq.toLocaleLowerCase('tr');
  const list = S.notes.filter(n => (!nf || n.folder === nf) && (!ql || (n.title + ' ' + n.body).toLocaleLowerCase('tr').includes(ql))).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updated || b.created) - (a.updated || a.created));
  return header('Notlar', S.notes.length + ' not') + `
  <input id="nqi" placeholder="Notlarda ara…" value="${esc(nq)}" oninput="nq=this.value;clearTimeout(window._nq);window._nq=setTimeout(()=>{render();const i=document.querySelector('#nqi');i.focus();i.setSelectionRange(99,99)},350)" style="margin-bottom:10px">
  ${folders.length ? `<div class="chips">${['', ...folders].map(f => `<button class="chip ${nf === f ? 'on' : ''}" onclick="nf='${esc(f)}';render()">${f ? '📁 ' + esc(f) : 'Tümü'}</button>`).join('')}</div>` : ''}
  ${list.length ? `<div class="grid2">${list.map(n => `<div class="card" style="margin:0;cursor:pointer;min-height:110px" onclick="editRecord({title:'not',list:S.notes,item:S.notes.find(x=>x.id==='${n.id}'),fields:NOTE_F})"><div class="b small" style="margin-bottom:4px">${n.pinned ? '📌 ' : ''}${esc(n.title || 'Başlıksız')}</div><div class="tiny muted" style="display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap">${esc(n.body)}</div>${n.folder ? `<div class="tiny" style="margin-top:6px;color:var(--accent)">📁 ${esc(n.folder)}</div>` : ''}</div>`).join('')}</div>` : '<div class="card empty"><div class="e">📝</div>Not yok</div>'}
  <button class="fab" onclick="editRecord({title:'not',list:S.notes,item:null,fields:NOTE_F,defaults:{folder:nf}})">+</button>`;
};

/* ===== Hedefler ===== */
const GOAL_F = [{ k: 'title', label: 'Hedef', ph: 'ör. 1000 km koş' }, { k: 'target', label: 'Hedef değer', type: 'number' }, { k: 'cur', label: 'Şu anki', type: 'number', def: 0 }, { k: 'unit', label: 'Birim', ph: 'km, kitap, ₺…' }, { k: 'step', label: 'Her dokunuşta artış', type: 'number', def: 1 }, { k: 'deadline', label: 'Son tarih', type: 'date' }];
function goalStep(id, d) { const g = S.goals.find(x => x.id === id); g.cur = Math.max(0, r1(num(g.cur) + d * (num(g.step) || 1))); save(); render(); if (num(g.cur) >= num(g.target) && d > 0) toast('🎉 Hedefe ulaştın!'); }
Pages.goals = () => header('Hedefler', '', `<button class="icon-btn" onclick="editRecord({title:'hedef',list:S.goals,item:null,fields:GOAL_F,required:'title',defaults:{cur:0,step:1}})">＋</button>`) +
  (S.goals.length ? S.goals.map(g => { const p = num(g.target) ? Math.min(1, num(g.cur) / num(g.target)) : 0; const left = g.deadline ? daysBetween(today(), g.deadline) : null; return `<div class="card"><div class="row between"><div class="grow" style="cursor:pointer" onclick="editRecord({title:'hedef',list:S.goals,item:S.goals.find(x=>x.id==='${g.id}'),fields:GOAL_F,required:'title'})"><div class="b">${p >= 1 ? '🏆 ' : ''}${esc(g.title)}</div><div class="small muted">${r1(num(g.cur))} / ${r1(num(g.target))} ${esc(g.unit || '')}${left !== null ? ` · ${left >= 0 ? left + ' gün kaldı' : 'süre doldu'}` : ''}</div></div><button class="icon-btn" onclick="goalStep('${g.id}',-1)">−</button><button class="icon-btn" onclick="goalStep('${g.id}',1)">+</button></div><div class="bar" style="margin-top:10px"><i style="width:${p * 100}%;${p >= 1 ? 'background:var(--ok)' : ''}"></i></div><div class="tiny muted" style="margin-top:4px">%${Math.round(p * 100)}</div></div>`; }).join('') : '<div class="card empty"><div class="e">🎯</div>Büyük hedeflerini ekle, ilerledikçe işaretle</div>');

/* ===== Kurslar ===== */
const COURSE_F = [{ k: 'name', label: 'Kurs adı', ph: 'ör. İngilizce B2' }, { k: 'place', label: 'Kurum / eğitmen' }, { k: 'days', label: 'Ders günleri', type: 'days' }, { k: 'time', label: 'Saat', type: 'time' }, { k: 'start', label: 'Başlangıç', type: 'date' }, { k: 'end', label: 'Bitiş', type: 'date' }, { k: 'fee', label: 'Ücret (₺)', type: 'number' }, { k: 'paid', label: 'Ödeme durumu', type: 'toggle', off: 'Ödenmedi', on: 'Ödendi' }, { k: 'contact', label: 'İletişim / adres / link' }, { k: 'notes', label: 'Notlar (ödevler, konular…)', type: 'textarea', rows: 5 }];
Pages.courses = () => {
  const k = today();
  return header('Kurslar', '', `<button class="icon-btn" onclick="editRecord({title:'kurs',list:S.courses,item:null,fields:COURSE_F,required:'name'})">＋</button>`) +
    (S.courses.length ? S.courses.map(c => {
      const active = (!c.end || c.end >= k); const prog = c.start && c.end ? Math.min(1, Math.max(0, daysBetween(c.start, k) / Math.max(1, daysBetween(c.start, c.end)))) : null;
      let nextL = ''; if (active && (c.days || []).length) { for (let i = 0; i < 8; i++) { const d = addDays(k, i); if (c.days.includes(parseD(d).getDay()) && (!c.start || d >= c.start)) { nextL = i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : WD_LONG[parseD(d).getDay()]; break; } } }
      return `<div class="card" style="cursor:pointer;${active ? '' : 'opacity:.6'}" onclick="editRecord({title:'kurs',list:S.courses,item:S.courses.find(x=>x.id==='${c.id}'),fields:COURSE_F,required:'name'})">
      <div class="row between"><div class="b" style="font-size:17px">${esc(c.name)}</div>${c.fee ? `<span class="tag" style="${c.paid ? 'background:rgba(48,194,107,.15);color:var(--ok)' : 'background:rgba(255,77,94,.12);color:var(--bad)'}">${fmtMoney(c.fee)} · ${c.paid ? 'Ödendi' : 'Ödenmedi'}</span>` : ''}</div>
      ${c.place ? `<div class="small muted">${esc(c.place)}</div>` : ''}
      <div class="small" style="margin-top:6px">🗓 ${(c.days || []).map(d => WD[d]).join(', ') || '—'} ${c.time ? '· ⏰ ' + esc(c.time) : ''}${nextL ? ` · <b style="color:var(--accent)">Sıradaki: ${nextL}</b>` : ''}</div>
      ${c.start || c.end ? `<div class="tiny muted" style="margin-top:4px">${fmtDate(c.start)} → ${fmtDate(c.end) || '…'}${active ? '' : ' · Bitti'}</div>` : ''}
      ${prog !== null ? `<div class="bar" style="margin-top:6px;height:5px"><i style="width:${prog * 100}%"></i></div>` : ''}
      ${c.notes ? `<div class="small" style="margin-top:8px;white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(c.notes)}</div>` : ''}
      ${c.contact ? `<div class="tiny muted" style="margin-top:6px">📍 ${esc(c.contact)}</div>` : ''}</div>`;
    }).join('') : '<div class="card empty"><div class="e">🎓</div>Gittiğin kursları, ders saatlerini ve ödemeleri burada tut</div>');
};

/* ===== Kombinler ===== */
const OUT_CATS = ['Üst', 'Alt', 'Elbise', 'Dış giyim', 'Ayakkabı', 'Aksesuar'];
let outTab = 'combos', outCat = '';
function addClothing() {
  pickImage(img => {
    const s = openSheet({
      title: 'Yeni parça', left: 'Vazgeç', right: 'Kaydet',
      body: `<img src="${img}" style="width:50%;display:block;margin:0 auto 12px;border-radius:14px">${fieldHTML({ k: 'name', label: 'Adı', ph: 'ör. Lacivert gömlek' })}${fieldHTML({ k: 'cat', label: 'Kategori', type: 'select', options: OUT_CATS }, outCat || 'Üst')}${fieldHTML({ k: 'color', label: 'Renk' })}`,
      onRight: sh => { const v = readFields(sh, [{ k: 'name' }, { k: 'cat' }, { k: 'color' }]); S.outfits.items.unshift({ id: uid(), img, ...v }); save(); render(); }
    });
  }, 600);
}
function editClothing(id) {
  const it = S.outfits.items.find(x => x.id === id);
  const s = openSheet({
    title: it.name || 'Parça', left: 'Vazgeç', right: 'Kaydet',
    body: `<img src="${it.img}" style="width:60%;display:block;margin:0 auto 12px;border-radius:14px">${fieldHTML({ k: 'name', label: 'Adı' }, it.name)}${fieldHTML({ k: 'cat', label: 'Kategori', type: 'select', options: OUT_CATS }, it.cat)}${fieldHTML({ k: 'color', label: 'Renk' }, it.color)}<button class="btn danger full" id="cd">Sil</button>`,
    onRight: sh => { Object.assign(it, readFields(sh, [{ k: 'name' }, { k: 'cat' }, { k: 'color' }])); save(); render(); }
  });
  s.sh.querySelector('#cd').onclick = () => confirmSheet('Parça silinecek (kombinlerden de çıkar).', () => { S.outfits.items.splice(S.outfits.items.indexOf(it), 1); S.outfits.combos.forEach(c => c.items = c.items.filter(i => i !== id)); closeSheet(s); save(); render(); });
}
function editCombo(id) {
  const c = id ? S.outfits.combos.find(x => x.id === id) : null; const sel = new Set(c?.items || []);
  if (!S.outfits.items.length) { toast('Önce kıyafet fotoğrafı ekle'); outTab = 'items'; render(); return; }
  const s = openSheet({
    title: c ? 'Kombini düzenle' : 'Yeni kombin', left: 'Vazgeç', right: 'Kaydet', full: true,
    body: `${fieldHTML({ k: 'name', label: 'Kombin adı', ph: 'ör. Ofis — Pazartesi' }, c?.name)}${fieldHTML({ k: 'season', label: 'Mevsim', type: 'select', options: ['Her mevsim', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış'] }, c?.season)}${fieldHTML({ k: 'occasion', label: 'Nerede giyilir?', ph: 'iş, düğün, günlük…' }, c?.occasion)}
    <div class="field"><label>Parçaları seç</label></div>${OUT_CATS.map(cat => { const l = S.outfits.items.filter(i => i.cat === cat); return l.length ? `<div class="small b muted" style="margin:6px 2px">${cat}</div><div class="photo-grid" style="margin-bottom:10px">${l.map(i => `<div class="ph ${sel.has(i.id) ? 'sel' : ''}" data-id="${i.id}"><img src="${i.img}"><div class="lb">${esc(i.name || '')}</div></div>`).join('')}</div>` : ''; }).join('')}
    ${c ? '<button class="btn danger full" id="kd">Kombini sil</button>' : ''}`,
    onRight: sh => {
      const v = readFields(sh, [{ k: 'name' }, { k: 'season' }, { k: 'occasion' }]); if (!sel.size) { toast('En az bir parça seç'); return false; }
      if (c) Object.assign(c, v, { items: [...sel] }); else S.outfits.combos.unshift({ id: uid(), ...v, items: [...sel], created: Date.now() }); save(); render();
    }
  });
  s.sh.querySelectorAll('.ph[data-id]').forEach(el => el.onclick = () => { const i = el.dataset.id; sel.has(i) ? sel.delete(i) : sel.add(i); el.classList.toggle('sel'); });
  const d = s.sh.querySelector('#kd'); if (d) d.onclick = () => confirmSheet('Kombin silinecek.', () => { S.outfits.combos.splice(S.outfits.combos.indexOf(c), 1); closeSheet(s); save(); render(); });
}
function wearCombo(id) { const c = S.outfits.combos.find(x => x.id === id); c.worn = c.worn || []; c.worn.push(today()); save(); render(); toast('Bugün giyildi olarak işaretlendi'); }
Pages.outfits = () => {
  const O = S.outfits; const byId = id => O.items.find(i => i.id === id);
  const combos = O.combos.length ? O.combos.map(c => { const its = c.items.map(byId).filter(Boolean); return `<div class="card"><div class="collage" onclick="editCombo('${c.id}')" style="cursor:pointer;grid-template-columns:repeat(${Math.min(4, Math.max(2, its.length))},1fr)">${its.slice(0, 4).map(i => `<img src="${i.img}">`).join('')}</div><div class="row between"><div class="grow"><div class="b">${esc(c.name || 'Kombin')}</div><div class="tiny muted">${esc(c.season || '')}${c.occasion ? ' · ' + esc(c.occasion) : ''}${c.worn?.length ? ` · son giyilme ${fmtDate(c.worn[c.worn.length - 1], { day: 'numeric', month: 'short' })} (${c.worn.length}×)` : ''}</div></div><button class="btn ghost sm" onclick="wearCombo('${c.id}')">Bugün giydim</button></div></div>`; }).join('') : '<div class="card empty"><div class="e">👔</div>Kıyafetlerinin fotoğrafını ekle, sonra kombin oluştur</div>';
  const items = O.items.filter(i => !outCat || i.cat === outCat);
  return header('Kombinler', O.items.length + ' parça · ' + O.combos.length + ' kombin') + `
  <div class="seg"><button class="${outTab === 'combos' ? 'on' : ''}" onclick="outTab='combos';render()">Kombinler</button><button class="${outTab === 'items' ? 'on' : ''}" onclick="outTab='items';render()">Gardırop</button></div>
  ${outTab === 'combos' ? combos + `<button class="fab" onclick="editCombo()">+</button>` : `<div class="chips">${['', ...OUT_CATS].map(c => `<button class="chip ${outCat === c ? 'on' : ''}" onclick="outCat='${c}';render()">${c || 'Tümü'}</button>`).join('')}</div>
  ${items.length ? `<div class="photo-grid">${items.map(i => `<div class="ph" onclick="editClothing('${i.id}')" style="cursor:pointer"><img src="${i.img}"><div class="lb">${esc(i.name || i.cat)}</div></div>`).join('')}</div>` : '<div class="card empty"><div class="e">📸</div>Kıyafet fotoğrafı ekle</div>'}
  <button class="fab" onclick="addClothing()">+</button>`}`;
};

/* ===== Alınacaklar ===== */
const SHOP_CATS = ['Market', 'Giyim', 'Elektronik', 'Ev', 'Kişisel bakım', 'Spor', 'Hediye', 'Diğer'];
const SHOP_F = [{ k: 'name', label: 'Ürün' }, { k: 'price', label: 'Fiyat (₺)', type: 'number' }, { k: 'qty', label: 'Adet', type: 'number', def: 1 }, { k: 'cat', label: 'Kategori', type: 'select', options: SHOP_CATS }, { k: 'where', label: 'Nereden / link' }, { k: 'note', label: 'Not', type: 'textarea', rows: 2 }];
let shopCat = '';
function toggleBuy(id) { const x = S.shopping.find(s => s.id === id); x.bought = !x.bought; x.boughtAt = x.bought ? today() : null; save(); render(); }
function quickShop(f) {
  const n = f.n.value.trim(); if (!n) return;
  S.shopping.unshift({ id: uid(), name: n, price: num(f.p.value) || '', qty: 1, cat: shopCat || 'Market', created: Date.now() }); save(); render();
  setTimeout(() => $('#sn')?.focus(), 30);
}
Pages.shopping = () => {
  const L = S.shopping.filter(x => !shopCat || x.cat === shopCat);
  const tot = x => num(x.price) * (num(x.qty) || 1);
  const open = L.filter(x => !x.bought), got = L.filter(x => x.bought);
  const sumO = open.reduce((a, x) => a + tot(x), 0), sumG = got.reduce((a, x) => a + tot(x), 0);
  const row = x => `<div class="list-item ${x.bought ? 'done' : ''}"><button class="check ${x.bought ? 'on' : ''}" onclick="toggleBuy('${x.id}')">${x.bought ? '✓' : ''}</button><div class="grow" style="cursor:pointer" onclick="editRecord({title:'ürün',list:S.shopping,item:S.shopping.find(s=>s.id==='${x.id}'),fields:SHOP_F,required:'name'})"><div class="t">${esc(x.name)}</div><div class="tiny muted">${esc(x.cat || '')}${num(x.qty) > 1 ? ' · ' + x.qty + ' adet × ' + fmtMoney(x.price) : ''}${x.where ? ' · ' + esc(x.where) : ''}</div></div><div class="b small">${x.price !== '' && x.price !== undefined ? fmtMoney(tot(x)) : '—'}</div></div>`;
  return header('Alınacaklar', '') + `
  <div class="hero"><div class="row between"><div><div class="small muted">Alınacak toplam</div><div class="kpi">${fmtMoney(sumO)}</div></div><div style="text-align:right"><div class="small muted">Harcanan</div><div class="b">${fmtMoney(sumG)}</div></div></div><div class="small muted" style="margin-top:4px">${open.length} ürün kaldı · ${got.length} alındı</div></div>
  <div class="card" style="padding:10px"><form class="row" onsubmit="event.preventDefault();quickShop(this)"><input id="sn" name="n" placeholder="Ürün adı" autocomplete="off"><input name="p" inputmode="decimal" placeholder="₺" style="width:90px;flex:none"><button class="btn sm">Ekle</button></form></div>
  <div class="chips">${['', ...SHOP_CATS].map(c => `<button class="chip ${shopCat === c ? 'on' : ''}" onclick="shopCat='${c}';render()">${c || 'Tümü'}</button>`).join('')}</div>
  ${open.length ? `<div class="card tight">${open.map(row).join('')}</div>` : '<div class="card empty"><div class="e">🛍</div>Listede ürün yok</div>'}
  ${got.length ? `<div class="card tight"><div class="row between" style="padding:12px 16px 0"><h3 style="margin:0">Alındı</h3><button class="small" style="color:var(--bad)" onclick="confirmSheet('Alınanlar listeden silinecek.',()=>{S.shopping=S.shopping.filter(x=>!x.bought||(shopCat&&x.cat!==shopCat));save();render()},'Temizle')">Temizle</button></div>${got.map(row).join('')}</div>` : ''}`;
};

/* ===== Kitaplar ===== */
const BOOK_F = [{ k: 'title', label: 'Kitap adı' }, { k: 'author', label: 'Yazar' }, { k: 'status', label: 'Durum', type: 'select', options: [['todo', 'Okunacak'], ['reading', 'Okunuyor'], ['done', 'Okundu']] }, { k: 'rating', label: 'Puanın', type: 'stars' }, { k: 'pages', label: 'Sayfa sayısı', type: 'number' }, { k: 'finished', label: 'Bitirme tarihi', type: 'date' }, { k: 'note', label: 'Yorum / alıntılar', type: 'textarea', rows: 5 }];
let bookTab = 'reading';
function bookSave(list) { list.forEach(b => { if (b.status === 'done' && !b.finished) b.finished = today(); }); save(); render(); }
Pages.books = () => {
  const yr = String(new Date().getFullYear()); const doneY = S.books.filter(b => b.status === 'done' && (b.finished || '').startsWith(yr)).length; const goal = S.settings.bookGoal || 12;
  const L = S.books.filter(b => b.status === bookTab).sort((a, b) => bookTab === 'done' ? (b.finished || '').localeCompare(a.finished || '') : 0);
  const cnt = s => S.books.filter(b => b.status === s).length;
  return header('Kitaplar', '') + `
  <div class="card"><div class="row between"><div><div class="small muted">${yr} okuma hedefi</div><div class="kpi">${doneY} / ${goal}</div></div><button class="btn plain sm" onclick="setBookGoal()">Hedefi değiştir</button></div><div class="bar" style="margin-top:10px"><i style="width:${Math.min(100, doneY / goal * 100)}%"></i></div></div>
  <div class="seg">${[['reading', 'Okunuyor'], ['todo', 'Okunacak'], ['done', 'Okundu']].map(([k, l]) => `<button class="${bookTab === k ? 'on' : ''}" onclick="bookTab='${k}';render()">${l} (${cnt(k)})</button>`).join('')}</div>
  ${L.length ? `<div class="card tight">${L.map(b => `<div class="list-item" style="cursor:pointer" onclick="editRecord({title:'kitap',list:S.books,item:S.books.find(x=>x.id==='${b.id}'),fields:BOOK_F,required:'title',after:()=>bookSave(S.books)})"><div style="width:40px;height:56px;border-radius:6px;background:linear-gradient(135deg,${hexA(S.settings.accent, .9)},${hexA(S.settings.accent, .5)});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;flex:none">${esc((b.title || '?')[0].toUpperCase())}</div><div class="grow"><div class="t">${esc(b.title)}</div><div class="small muted">${esc(b.author || '')}</div>${b.status === 'done' ? `<div>${stars(b.rating)} <span class="tiny muted">${fmtDate(b.finished, { month: 'short', year: 'numeric' })}</span></div>` : b.pages ? `<div class="tiny muted">${b.pages} sayfa</div>` : ''}</div></div>`).join('')}</div>` : `<div class="card empty"><div class="e">📚</div>Bu listede kitap yok</div>`}
  <button class="fab" onclick="editRecord({title:'kitap',list:S.books,item:null,fields:BOOK_F,required:'title',defaults:{status:bookTab},after:()=>bookSave(S.books)})">+</button>`;
};
function setBookGoal() { const s = openSheet({ title: 'Yıllık hedef', left: 'Vazgeç', right: 'Kaydet', body: `<div class="field"><label>Bu yıl kaç kitap?</label><input id="bg" inputmode="numeric" value="${S.settings.bookGoal || 12}"></div>`, onRight: sh => { S.settings.bookGoal = Math.max(1, num(sh.querySelector('#bg').value)); save(); render(); } }); }

/* ===== Filmler ===== */
const MOVIE_F = [{ k: 'title', label: 'Adı' }, { k: 'type', label: 'Tür', type: 'select', options: ['Film', 'Dizi', 'Belgesel', 'Anime'] }, { k: 'status', label: 'Durum', type: 'select', options: [['todo', 'İzlenecek'], ['watching', 'İzleniyor'], ['done', 'İzlendi']] }, { k: 'rating', label: 'Puanın', type: 'stars' }, { k: 'genre', label: 'Kategori', ph: 'dram, bilim kurgu…' }, { k: 'year', label: 'Yıl', type: 'number' }, { k: 'platform', label: 'Nerede?', ph: 'Netflix, sinema…' }, { k: 'watched', label: 'İzleme tarihi', type: 'date' }, { k: 'note', label: 'Yorum', type: 'textarea', rows: 4 }];
let movieTab = 'todo', movieType = '';
function movieSave() { S.movies.forEach(m => { if (m.status === 'done' && !m.watched) m.watched = today(); }); save(); render(); }
Pages.movies = () => {
  const cnt = s => S.movies.filter(b => b.status === s && (!movieType || b.type === movieType)).length;
  const L = S.movies.filter(m => m.status === movieTab && (!movieType || m.type === movieType)).sort((a, b) => movieTab === 'done' ? (b.watched || '').localeCompare(a.watched || '') : 0);
  const ic = { Film: '🎬', Dizi: '📺', Belgesel: '🌍', Anime: '🌸' };
  const avg = (() => { const r = S.movies.filter(m => m.rating); return r.length ? r1(r.reduce((a, m) => a + m.rating, 0) / r.length) : 0; })();
  return header('Film & Dizi', `${S.movies.filter(m => m.status === 'done').length} izlendi${avg ? ' · ortalama puanın ' + avg + '★' : ''}`) + `
  <div class="seg">${[['todo', 'İzlenecek'], ['watching', 'İzleniyor'], ['done', 'İzlendi']].map(([k, l]) => `<button class="${movieTab === k ? 'on' : ''}" onclick="movieTab='${k}';render()">${l} (${cnt(k)})</button>`).join('')}</div>
  <div class="chips">${['', 'Film', 'Dizi', 'Belgesel', 'Anime'].map(t => `<button class="chip ${movieType === t ? 'on' : ''}" onclick="movieType='${t}';render()">${t ? ic[t] + ' ' + t : 'Hepsi'}</button>`).join('')}</div>
  ${L.length ? `<div class="card tight">${L.map(m => `<div class="list-item" style="cursor:pointer" onclick="editRecord({title:'kayıt',list:S.movies,item:S.movies.find(x=>x.id==='${m.id}'),fields:MOVIE_F,required:'title',after:movieSave})"><span style="font-size:26px">${ic[m.type] || '🎬'}</span><div class="grow"><div class="t">${esc(m.title)} ${m.year ? `<span class="muted small">(${m.year})</span>` : ''}</div><div class="tiny muted">${[m.genre, m.platform].filter(Boolean).map(esc).join(' · ')}</div>${m.status === 'done' ? `<div>${stars(m.rating)}</div>` : ''}</div></div>`).join('')}</div>` : '<div class="card empty"><div class="e">🍿</div>Bu listede bir şey yok</div>'}
  <button class="fab" onclick="editRecord({title:'film / dizi',list:S.movies,item:null,fields:MOVIE_F,required:'title',defaults:{status:movieTab,type:movieType||'Film'},after:movieSave})">+</button>`;
};

/* ===== Önemli tarihler ===== */
const DATE_F = [{ k: 'emoji', label: 'Simge', ph: '🎂' }, { k: 'title', label: 'Ne?', ph: 'ör. Annemin doğum günü' }, { k: 'date', label: 'Tarih', type: 'date' }, { k: 'yearly', label: 'Her yıl tekrarlar mı?', type: 'toggle', on: 'Her yıl', off: 'Tek sefer' }, { k: 'note', label: 'Not (hediye fikri vs.)', type: 'textarea', rows: 3 }];
function nextOcc(d) {
  if (!d.date) return null; const k = today();
  if (!d.yearly) return { date: d.date, left: daysBetween(k, d.date), years: 0 };
  const [y, m, dd] = d.date.split('-'); let ny = +k.slice(0, 4); let nk = `${ny}-${m}-${dd}`; if (nk < k) { ny++; nk = `${ny}-${m}-${dd}`; }
  return { date: nk, left: daysBetween(k, nk), years: ny - +y };
}
Pages.dates = () => {
  const L = S.dates.map(d => ({ d, n: nextOcc(d) })).sort((a, b) => (a.n?.left ?? 9e9) < 0 ? 1 : (b.n?.left ?? 9e9) < 0 ? -1 : (a.n?.left ?? 9e9) - (b.n?.left ?? 9e9));
  return header('Önemli tarihler', '', `<button class="icon-btn" onclick="editRecord({title:'tarih',list:S.dates,item:null,fields:DATE_F,required:'title',defaults:{yearly:true}})">＋</button>`) +
    (L.length ? `<div class="card tight">${L.map(({ d, n }) => `<div class="list-item" style="cursor:pointer" onclick="editRecord({title:'tarih',list:S.dates,item:S.dates.find(x=>x.id==='${d.id}'),fields:DATE_F,required:'title'})"><span style="font-size:28px">${esc(d.emoji || '📅')}</span><div class="grow"><div class="t">${esc(d.title)}</div><div class="tiny muted">${n ? fmtDate(n.date, { day: 'numeric', month: 'long', weekday: 'long' }) : 'Tarih yok'}${n?.years > 0 ? ` · ${n.years}. yıl` : ''}</div></div>${n ? `<div style="text-align:right"><div class="b" style="${n.left <= 7 && n.left >= 0 ? 'color:var(--accent)' : ''}">${n.left === 0 ? 'Bugün 🎉' : n.left < 0 ? 'Geçti' : n.left}</div>${n.left > 0 ? '<div class="tiny muted">gün</div>' : ''}</div>` : ''}</div>`).join('')}</div>` : '<div class="card empty"><div class="e">🎂</div>Doğum günleri, yıldönümleri, önemli günler…</div>');
};

/* ===== Ayarlar ===== */
const ACCENTS = ['#6C63FF', '#FF5C8A', '#FF8A3D', '#16B78A', '#2E8BFF', '#111114', '#A855F7', '#E11D48'];
function exportData() {
  const data = JSON.stringify(S); const name = `ben-yedek-${today()}.json`;
  try {
    const blob = new Blob([data], { type: 'application/json' });
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Yedek' }).catch(() => {}); S.settings.lastBackup = today(); save(); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
    S.settings.lastBackup = today(); save(); toast('Yedek indirildi'); render();
  } catch (e) { toast('İndirilemedi — kopyalamayı dene'); }
}
function copyData() { navigator.clipboard.writeText(JSON.stringify(S)).then(() => { S.settings.lastBackup = today(); save(); toast('Yedek panoya kopyalandı'); render(); }, () => toast('Kopyalanamadı')); }
function importData() {
  const s = openSheet({ title: 'Yedekten geri yükle', body: `<p class="small muted">Yedek dosyasını seç ya da kopyaladığın yedek metnini yapıştır. <b>Mevcut verilerin yerine geçer.</b></p><button class="btn plain full" id="if" style="margin-bottom:10px">📁 Dosya seç</button><textarea id="it" rows="6" placeholder="Yedek metnini buraya yapıştır…"></textarea><button class="btn full" id="ig" style="margin-top:10px">Geri yükle</button>` });
  const apply = txt => { try { const o = JSON.parse(txt); if (!o || !o.settings) throw 0; S = merge(DEFAULT_STATE(), o); save(); closeSheet(s); render(); toast('Veriler geri yüklendi'); } catch (e) { toast('Geçersiz yedek'); } };
  s.sh.querySelector('#if').onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => { const r = new FileReader(); r.onload = () => apply(r.result); r.readAsText(i.files[0]); }; i.click(); };
  s.sh.querySelector('#ig').onclick = () => apply(s.sh.querySelector('#it').value);
}
function setPin() {
  const s = openSheet({ title: hasLock() ? 'Şifreyi değiştir' : 'Şifre koy', left: 'Vazgeç', right: 'Kaydet',
    body: `<p class="small muted" style="margin-top:0">4–20 karakter; harf, rakam ve işaret kullanabilirsin. Büyük-küçük harf fark eder.</p>
    <div class="field"><label>Yeni şifre</label><input id="p1" type="password" maxlength="20" autocomplete="new-password"></div>
    <div class="field"><label>Tekrar</label><input id="p2" type="password" maxlength="20" autocomplete="new-password"></div>
    <div class="small" id="pstr" style="margin:-4px 0 12px"></div>
    ${hasLock() ? '<button class="btn danger full" id="p0">Şifreyi kaldır</button>' : ''}`,
    onRight: sh => {
      const p1 = sh.querySelector('#p1').value, p2 = sh.querySelector('#p2').value;
      if (p1.length < 4 || p1.length > 20) { toast('Şifre 4–20 karakter olmalı'); return false; }
      if (p1 !== p2) { toast('Şifreler aynı değil'); return false; }
      setLockPass(p1).then(() => { render(); toast('🔒 Şifre kondu'); });
    } });
  const str = s.sh.querySelector('#pstr');
  s.sh.querySelector('#p1').oninput = e => {
    const v = e.target.value; let sc = 0; if (v.length >= 8) sc++; if (/[a-zçğıöşü]/.test(v) && /[A-ZÇĞİÖŞÜ]/.test(v)) sc++; if (/\d/.test(v)) sc++; if (/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(v)) sc++;
    str.innerHTML = v ? `Güç: <b style="color:${['var(--bad)', 'var(--bad)', 'var(--warn)', 'var(--ok)', 'var(--ok)'][sc]}">${['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'][sc]}</b> · ${v.length}/20` : '';
  };
  const z = s.sh.querySelector('#p0'); if (z) z.onclick = () => { setLockPass(''); closeSheet(s); render(); toast('Şifre kaldırıldı'); };
}
Pages.settings = () => {
  const st = S.settings; const lb = st.lastBackup ? daysBetween(st.lastBackup, today()) : null;
  const used = (() => { try { return (JSON.stringify(S).length / 1048576).toFixed(1); } catch (e) { return '?'; } })();
  return header('Ayarlar', '') + `
  <div class="card"><h3>Profil</h3><div class="field"><label>Adın</label><input value="${esc(st.name)}" onchange="S.settings.name=this.value.trim();save()" placeholder="Sana nasıl hitap edeyim?"></div></div>
  <div class="card"><h3>Görünüm</h3><div class="seg">${[['auto', 'Otomatik'], ['light', 'Açık'], ['dark', 'Koyu']].map(([k, l]) => `<button class="${st.theme === k ? 'on' : ''}" onclick="S.settings.theme='${k}';save();render()">${l}</button>`).join('')}</div>
    <div class="small muted" style="margin-bottom:8px">Renk</div><div class="swatches">${ACCENTS.map(c => `<button style="background:${c}" class="${st.accent === c ? 'on' : ''}" onclick="S.settings.accent='${c}';save();render()"></button>`).join('')}</div></div>
  <div class="card"><h3>Gizlilik</h3><div class="row between"><div><div class="b">Uygulama şifresi</div><div class="small muted">${hasLock() ? 'Açık — her açılışta ve 1 dk sonra sorulur' : 'Kapalı'}</div></div><button class="btn plain sm" onclick="setPin()">${hasLock() ? 'Değiştir' : 'Şifre koy'}</button></div></div>
  <div class="card"><h3>Spor</h3><div class="row between"><div class="b">Setler arası dinlenme</div><select style="width:auto" onchange="S.settings.rest=+this.value;save()">${[45, 60, 90, 120, 150, 180, 240].map(v => `<option value="${v}" ${st.rest === v ? 'selected' : ''}>${v < 60 ? v + ' sn' : (v / 60).toLocaleString('tr-TR') + ' dk'}</option>`).join('')}</select></div></div>
  ${syncCard()}
  <div class="card"><h3>Yedekleme</h3><div class="small muted" style="margin-bottom:10px">${Sync.on() ? `Verilerin şifreli olarak bulutta da duruyor (${used} MB). Yine de ara sıra ek yedek alıp iCloud Drive'a kaydetmek iyi olur.` : `Tüm verilerin sadece bu cihazda duruyor (${used} MB). Kaybolmasın diye ara sıra yedek al ve iCloud Drive'a kaydet — ya da senkronizasyonu aç.`}<br><b style="color:${lb === null || lb > 7 ? 'var(--warn)' : 'var(--ok)'}">${lb === null ? 'Henüz hiç yedek alınmadı' : lb === 0 ? 'Son yedek: bugün' : 'Son yedek: ' + lb + ' gün önce'}</b></div>
    <button class="btn full" onclick="exportData()" style="margin-bottom:8px">⬇︎ Yedeği kaydet</button><div class="row"><button class="btn plain sm grow" onclick="copyData()">Kopyala</button><button class="btn plain sm grow" onclick="importData()">Geri yükle</button></div></div>
  <div class="card"><h3>Ana ekrana ekleme</h3><div class="small">Safari'de bu sayfayı aç → alttaki <b>Paylaş</b> (□↑) → <b>Ana Ekrana Ekle</b>. Böylece uygulama gibi tam ekran açılır ve internetsiz çalışır.</div></div>
  <button class="btn danger full" onclick="confirmSheet('TÜM verilerin kalıcı olarak silinecek (senkronizasyon açıksa diğer cihazlarından da). Önce yedek almanı öneririm.',()=>{S=DEFAULT_STATE();save();setTab('today')},'Hepsini sil')">Tüm verileri sil</button>
  <div class="tiny muted" style="text-align:center;margin-top:14px">Sürüm 1.0 · Kişisel uygulaman</div>`;
};
