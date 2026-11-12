/* ===== Başlangıç ===== */
(async function init() {
  await Store.open();
  await Sync.load();
  const saved = await Store.get('state');
  if (saved) S = merge(DEFAULT_STATE(), saved);
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  if (S.workout.active) route = { tab: 'sport', page: 'session', arg: null }, navStack = [{ tab: 'sport', page: 'sport' }];
  render();
  if (S.settings.pin) showLock();
  Sync.run();
  setInterval(() => { if (!document.hidden) Sync.run(); }, 60000);
  addEventListener('online', () => Sync.run());
  addEventListener('offline', () => Sync.paint());
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); Store.set('state', S); }
    else if (S.settings.pin && Date.now() - hiddenAt > 60000 && !document.querySelector('.lock')) showLock();
    if (!document.hidden) { render(); Sync.run(); }
  });
  try {
    const inFrame = window.self !== window.top;
    if ('serviceWorker' in navigator && !inFrame && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  } catch (e) {}
})();
