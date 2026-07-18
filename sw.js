// Minimal service worker: network-first (the app is realtime — never serve stale
// votes), cache fallback so the shell opens offline. Presence of a fetch handler
// is also what makes Android offer "Add to Home Screen" as a real install.
const CACHE = 'family-days-v4';   // v4: tabs (Familientage / Date Nights), sorted pool, Buchen on days

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['.', 'manifest.json', 'icon.svg'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && e.request.url.startsWith(self.location.origin)) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
