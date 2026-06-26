/* 想山享山 PWA service worker */
const CACHE = "xiangshan-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./favicon-32.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(SHELL)).then(()=> self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});
self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);

  // 跨網域（Firebase / gstatic 等）一律走網路，不攔截
  if(url.origin !== self.location.origin) return;

  // 頁面導覽：網路優先，離線時回退快取（確保部署更新看得到）
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put("./index.html", copy));
        return res;
      }).catch(()=> caches.match("./index.html"))
    );
    return;
  }

  // 其他同網域靜態資源：快取優先
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=> c.put(req, copy));
      return res;
    }).catch(()=> hit))
  );
});
