/* ===== Takvime ekleme (.ics + Google Takvim) ===== */
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const icsEsc = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const ymd = k => k.replace(/-/g, '');
function icsStamp() { const d = new Date(); return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); }
/* ev: {uid,title,date,time?,yearly?,alarms:[dakika önce], note?} — tüm gün olaylarında alarmlar 09:00'a göre */
function buildICS(evs) {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ben//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const ev of evs) {
    L.push('BEGIN:VEVENT', `UID:${ev.uid}@ben-app`, `DTSTAMP:${icsStamp()}`, `SUMMARY:${icsEsc(ev.title)}`);
    if (ev.time) {
      const [h, m] = ev.time.split(':').map(Number); const st = `${ymd(ev.date)}T${pad(h)}${pad(m)}00`;
      const e = new Date(parseD(ev.date)); e.setHours(h, m + 30); const en = `${dkey(e).replace(/-/g, '')}T${pad(e.getHours())}${pad(e.getMinutes())}00`;
      L.push(`DTSTART:${st}`, `DTEND:${en}`);
    } else {
      L.push(`DTSTART;VALUE=DATE:${ymd(ev.date)}`, `DTEND;VALUE=DATE:${ymd(addDays(ev.date, 1))}`, 'TRANSP:TRANSPARENT');
    }
    if (ev.yearly) L.push('RRULE:FREQ=YEARLY');
    if (ev.note) L.push(`DESCRIPTION:${icsEsc(ev.note)}`);
    for (const a of ev.alarms || []) {
      let trig;
      if (ev.time) trig = `-PT${a}M`;
      else { const mins = 9 * 60 - a; trig = mins >= 0 ? `PT${mins}M` : `-PT${-mins}M`; } // tüm gün: o gün 09:00'dan a dk önce
      L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(ev.title)}`, `TRIGGER:${trig}`, 'END:VALARM');
    }
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}
function gcalURL(ev) {
  let dates;
  if (ev.time) { const [h, m] = ev.time.split(':').map(Number); const e = new Date(parseD(ev.date)); e.setHours(h, m + 30); dates = `${ymd(ev.date)}T${pad(h)}${pad(m)}00/${dkey(e).replace(/-/g, '')}T${pad(e.getHours())}${pad(e.getMinutes())}00`; }
  else dates = `${ymd(ev.date)}/${ymd(addDays(ev.date, 1))}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: ev.title, dates, ctz: 'Europe/Istanbul', details: ev.note || '' });
  if (ev.yearly) q.set('recur', 'RRULE:FREQ=YEARLY');
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}
function openICS(ics, name = 'ben.ics') {
  if (isIOS()) { location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics); return; }
  try {
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Dosya indirildi — bildirimden açıp takvime ekle');
  } catch (e) { toast('Takvim dosyası açılamadı'); }
}
const REMIND_T = [['0', 'Tam zamanında'], ['15', '15 dakika önce'], ['30', '30 dakika önce'], ['60', '1 saat önce'], ['180', '3 saat önce'], ['1440', '1 gün önce']];
const REMIND_D = [['0', 'Sadece o gün 09:00'], ['1440', '1 gün önce + o gün 09:00'], ['2880', '2 gün önce + o gün 09:00'], ['10080', '1 hafta önce + o gün 09:00']];
const todoEvent = t => ({ uid: 'todo-' + t.id, title: '✅ ' + t.text, date: t.due, time: t.time || '', note: t.note, alarms: [+(t.remind ?? (t.time ? 15 : 0))] });
function dateEvent(d) {
  const n = nextOcc(d); const al = [0]; if (d.remind && d.remind !== '0') al.unshift(+d.remind);
  return { uid: 'date-' + d.id, title: (d.emoji ? d.emoji + ' ' : '') + d.title, date: n?.date || d.date, yearly: !!d.yearly, note: d.note, alarms: [...new Set(al)] };
}
/* Takvime ekle sayfası */
function calendarSheet(evs, onDone, title = 'Takvime ekle') {
  const many = evs.length > 1;
  const s = openSheet({
    title, body: `<p class="small" style="margin-top:0">${many ? `<b>${evs.length} kayıt</b>` : `<b>${esc(evs[0].title)}</b>`} hatırlatmasıyla birlikte takvimine eklenecek. Bildirimi telefonunun takvimi verir — uygulama kapalı olsa bile.</p>
    ${!many ? `<div class="card small"><div>📅 ${fmtDate(evs[0].date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${evs[0].time ? ' · ' + esc(evs[0].time) : ' · tüm gün'}${evs[0].yearly ? ' · her yıl' : ''}</div></div>` : ''}
    <button class="btn full" id="c_ics" style="margin-bottom:8px">📱 ${isIOS() ? 'iPhone Takvimi\'ne ekle' : 'Telefonun takvimine ekle'}</button>
    ${!many ? `<a class="btn plain full" id="c_g" href="${esc(gcalURL(evs[0]))}" target="_blank" rel="noopener" style="text-decoration:none;margin-bottom:8px">Google Takvim'de aç</a>` : ''}
    <p class="tiny muted">${isIOS() ? 'Açılan ekranda "Tümünü ekle" / "Takvime ekle"ye bas.' : 'İnen dosyayı açıp takvim uygulamanı seç. Google Takvim kullanıyorsan ikinci düğme daha kolay.'} Aynı kaydı iki kez eklersen takvimde çift görünebilir.</p>`
  });
  const done = () => { onDone && onDone(); save(); setTimeout(render, 300); };
  s.sh.querySelector('#c_ics').onclick = () => { openICS(buildICS(evs), many ? 'ben-takvim.ics' : 'ben.ics'); done(); closeSheet(s); };
  const g = s.sh.querySelector('#c_g'); if (g) g.onclick = () => { done(); setTimeout(() => closeSheet(s), 200); };
}
function calTodo(id) {
  const t = S.todos.find(x => x.id === id); if (!t) return;
  if (!t.due) { toast('Önce göreve bir tarih ver'); return; }
  calendarSheet([todoEvent(t)], () => { t.cal = true; });
}
function calDate(id) {
  const d = S.dates.find(x => x.id === id); if (!d || !d.date) { toast('Önce bir tarih seç'); return; }
  calendarSheet([dateEvent(d)], () => { d.cal = true; });
}
function calAll(kind) {
  const k = today();
  if (kind === 'todos') {
    const L = S.todos.filter(t => !t.done && t.due && t.due >= k && !t.cal);
    if (!L.length) { toast('Takvime eklenmemiş tarihli görev yok'); return; }
    calendarSheet(L.map(todoEvent), () => L.forEach(t => t.cal = true), 'Görevleri takvime ekle');
  } else {
    const L = S.dates.filter(d => d.date && !d.cal && (d.yearly || d.date >= k));
    if (!L.length) { toast('Takvime eklenmemiş tarih yok'); return; }
    calendarSheet(L.map(dateEvent), () => L.forEach(d => d.cal = true), 'Tarihleri takvime ekle');
  }
}
