const CACHE='songcode-player-v8',VERSION='v=20260904-6',ASSETS=['./','./index.html','./style.css','./play/','./play/index.html','./play/app.js','./create/','./create/index.html','./create/style.css','./create/app.js','./create/vendor/qrcode.min.js'].map(path=>`${path}?${VERSION}`);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request))) });
