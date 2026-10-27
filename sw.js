/* Service worker: guarda la app y el viaje para usarlos sin internet. */
const VERSION = "20261027174841";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "data/agency.json", "data/maps/mundo.json", "data/maps/tanzania-norte.json", "data/maps/turkiye.json", "data/panel/fbd3e0805cf28949ad684b29fc003018.json", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "img/aeropuerto.jpg", "img/antalya.jpg", "img/crucero-mar.jpg", "img/cuerno-de-oro.jpg", "img/logo-original.jpg", "img/portada-viaje.jpg", "img/rixos-tersane.jpg", "img/tz/a-bufalo.jpg", "img/tz/a-cebra.jpg", "img/tz/a-elefante.jpg", "img/tz/a-grulla.jpg", "img/tz/a-guepardo.jpg", "img/tz/a-hiena.jpg", "img/tz/a-hipopotamo.jpg", "img/tz/a-jirafa.jpg", "img/tz/a-leon.jpg", "img/tz/a-leopardo.jpg", "img/tz/a-nu.jpg", "img/tz/a-rinoceronte.jpg", "img/tz/camp.jpg", "img/tz/jeep.jpg", "img/tz/karatu.jpg", "img/tz/kilimanjaro.jpg", "img/tz/lodge.jpg", "img/tz/manyara.jpg", "img/tz/mapa-satelite.jpg", "img/tz/ngorongoro.jpg", "img/tz/portada.jpg", "img/tz/regreso.jpg", "img/tz/serengeti-leones.jpg", "img/tz/serengeti.jpg", "img/tz/tarangire.jpg", "img/tz/tienda.jpg", "img/ventanilla.jpg"];
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
  if (url.pathname.includes("/web/")) return; // la web de la agencia no se guarda en la caché de la app
  const isData = url.origin === location.origin && url.pathname.includes("/data/");
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  if (isData || req.mode === "navigate") {
    // Red primero (datos frescos si hay cobertura), caché si no hay internet.
    e.respondWith(fetch(req, { cache: "no-cache" }).then((r) => { if (r.ok) { const cp = r.clone(); caches.open("rt-" + VERSION).then((c) => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open("rt-" + VERSION).then((c) => c.put(req, cp)); } return r; })));
});
