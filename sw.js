/* Same-origin, aggregate-only shell caching. Does not cache uploaded reports or third-party QR images. */
const CACHE="service-excellence-shell-v28";
const SHELL=["./","./index.html","./src/styles.css?v=16","./src/data.js","./src/app.js?v=28","./src/guide.js?v=28","./src/guide-voice.js?v=28","./src/guide-speech.js?v=28","./src/guide.css?v=28","./src/reader.js","./src/reader.css","./assets/guide.svg","./assets/guide-portrait.svg","./assets/icon.svg","./assets/icon-192.png","./assets/icon-512.png","./assets/mohw-official-logo.png","./assets/mohw-official-icon-192.png","./assets/mohw-official-icon-512.png","./assets/service-excellence-banner.png" ,"./assets/video/guide-welcome-poster.jpg","./manifest.webmanifest"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key.startsWith("service-excellence-shell-")).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 if(/\.(?:pdf|mp4|webm)$/i.test(url.pathname))return;
 if(req.mode==="navigate"){event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy));}return res;}).catch(()=>caches.match("./index.html")));return;}
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req)));
});