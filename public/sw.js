/* Ame & Vie — service worker : rend l'application installable et garde l'interface disponible hors connexion.
 * L'API (/api) et les fichiers des documents ne sont JAMAIS mis en cache (données personnelles et contenus payants). */
const CACHE = 'ameetvie-v1';
const COQUILLE = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return; // réseau uniquement
  // Pages : réseau d'abord, sinon la dernière version connue
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copie = r.clone(); caches.open(CACHE).then((c) => c.put('/', copie)); return r; }).catch(() => caches.match('/')));
    return;
  }
  // Fichiers du site (scripts, styles, polices, images) : cache d'abord, mis à jour en arrière-plan
  if (/^\/(assets|images|icons)\//.test(url.pathname)) {
    e.respondWith(caches.match(req).then((enCache) => {
      const reseau = fetch(req).then((r) => { if (r.ok) { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(req, copie)); } return r; }).catch(() => enCache);
      return enCache || reseau;
    }));
  }
});
