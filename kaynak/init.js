/* ===== Başlangıç ===== */
(async function init() {
  await Store.open();
  await Sync.load();
  const saved = await Store.get('state');
  if (saved) S = merge(DEFAULT_STATE(), saved);
  S.workout.exercises.forEach(e => { e.p = normMuscles(e.p); e.s = normMuscles(e.s).filter(k => !e.p.includes(k)); });
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  if (S.workout.active) route = { tab: 'sport', page: 'session', arg: null }, navStack = [{ tab: 'sport', page: 'sport' }];
  render();
  if (hasLock()) showLock();
  Sync.run();
  setInterval(() => { if (!document.hidden) Sync.run(); }, 60000);
  addEventListener('online', () => Sync.run());
  addEventListener('offline', () => Sync.paint());
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); Store.set('state', S); }
    else if (hasLock() && Date.now() - hiddenAt > 60000 && !document.querySelector('.lock')) showLock();
    if (!document.hidden) { render(); Sync.run(); }
  });
  try {
    const inFrame = window.self !== window.top;
    if ('serviceWorker' in navigator && !inFrame && location.protocol === 'https:') navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => { r.update(); document.addEventListener('visibilitychange', () => { if (!document.hidden) r.update(); }); }).catch(() => {});
      let reloaded = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || document.querySelector('.sheet.show') || S.workout.active) return; reloaded = true; location.reload(); });
  } catch (e) {}
})();
