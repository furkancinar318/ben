const C='ben-0253725b',IMG='ben-img-v1';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','data/ex.e04e7010.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==IMG).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return; const u=new URL(r.url); if(u.origin!==location.origin)return;
  if(u.pathname.includes('/img/')){ // fotoğraflar: kalıcı önbellek, önce önbellekten
    e.respondWith(caches.open(IMG).then(c=>c.match(r).then(x=>x||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}))));return;
  }
  if(u.pathname.includes('/data/')){ // hareket verisi: adı içerikten türediği için değişmez
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;})));return;
  }
  // sayfa: her zaman sunucudan taze al, internet yoksa önbellekten
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))));
});
