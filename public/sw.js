const CACHE_NAME = 'it-infra-v1';
const PRECACHE_URLS = [
  '/logoImg.png',
  '/banner.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache images and static assets, not API calls or HTML
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    // For navigation, always go to network (SPA handles routing)
    event.respondWith(fetch(event.request).catch(() => caches.match('/logoImg.png')));
    return;
  }

  // Skip caching for API requests
  if (url.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
