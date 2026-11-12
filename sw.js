const C='ben-v8';const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const isPage=r.mode==='navigate'||/\.(html|js|webmanifest)$/.test(new URL(r.url).pathname)||new URL(r.url).pathname.endsWith('/');
  if(isPage){ // sayfa: her zaman sunucudan taze al, internet yoksa önbellekten
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))));
  } else { // fotoğraf vb: önce önbellek
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;})));
  }
});
