/* Français au collège — travail hors ligne (iPads du collège, réseau fragile)
   Réseau d'abord (le site reste à jour), copie locale si le réseau manque. Les appels à la base ne sont jamais gardés. */
const VERSION = "fr-2026-11-10a";
const FICHIERS = [
  "./", "index.html", "config.js", "manifest.webmanifest",
  "assets/style.css", "assets/moteur.js", "assets/backend.js", "assets/app.js",
  "assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2", "assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2", "assets/fonts/atkinson-hyperlegible-latin-400-italic.woff2",
  "assets/icones/icone-192.png", "assets/icones/icone-180.png",
  "contenu/catalogue.js", "contenu/phrases.js", "contenu/conjugaison-formes.js", "contenu/notions-grammaire.js", "contenu/notions-conjugaison.js",
  "contenu/notions-orthographe.js", "contenu/notions-lexique.js", "contenu/lectures.js", "contenu/ecrits.js",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(FICHIERS.map((f) => c.add(new Request(f, { cache: "reload" })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("fr-") && k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;     // base de données, IA : jamais en cache
  e.respondWith(
    fetch(r).then((rep) => {
      if (rep.ok && rep.type === "basic") { const copie = rep.clone(); caches.open(VERSION).then((c) => c.put(r, copie)).catch(() => {}); }
      return rep;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then((x) => x || (r.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
