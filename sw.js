/* Service worker: guarda la app y el viaje para usarlos sin internet. */
const VERSION = "20261026113056";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "data/agency.json", "data/maps/turkiye.json", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "img/aeropuerto.jpg", "img/antalya.jpg", "img/cuerno-de-oro.jpg", "img/logo-original.jpg", "img/rixos-tersane.jpg", "img/ventanilla.jpg"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("core-" + VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isData = url.origin === location.origin && url.pathname.includes("/data/");
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  if (isData || req.mode === "navigate") {
    // Red primero (datos frescos si hay cobertura), caché si no hay internet.
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open("rt-" + VERSION).then((c) => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open("rt-" + VERSION).then((c) => c.put(req, cp)); } return r; })));
});
