const CACHE_NAME = 'tatva-v1';
const PRECACHE_ASSETS = [
  '/tatva/',
  '/tatva/manifest.webmanifest',
  '/tatva/favicon.png',
  '/tatva/daily-quotes.json',
  '/tatva/icons/icon-192.png',
  '/tatva/icons/icon-512.png',
  '/tatva/icons/apple-touch-icon.png',
];

// Install: pre-cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Try cached version of requested URL
          const cached = await caches.match(request);
          if (cached) return cached;

          // Fallback to cached root sanctuary
          const rootFallback = await caches.match('/tatva/');
          if (rootFallback) return rootFallback;

          return new Response('Offline — तत्त्व विचार पुनः ऑनलाइन आने पर उपलब्ध होंगे।', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // 2. Google Fonts & Static Assets (_astro bundles, icons, media/authors, audio, daily quotes, API micro-endpoints)
  const isStaticAsset =
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    url.pathname.startsWith('/tatva/_astro/') ||
    url.pathname.startsWith('/tatva/icons/') ||
    url.pathname.startsWith('/tatva/media/') ||
    url.pathname.startsWith('/tatva/api/') ||
    url.pathname.endsWith('daily-quotes.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
