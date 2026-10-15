import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  const cleanBase = base.replace(/\/+$/, "");
  const prefix = cleanBase ? `${cleanBase}/` : "/";
  const cacheName = "tatva-v1";

  const script = `const CACHE_NAME = "${cacheName}";
const PRECACHE_ASSETS = [
  "${prefix}",
  "${prefix}manifest.webmanifest",
  "${prefix}favicon.png",
  "${prefix}daily-quotes.json",
  "${prefix}icons/icon-192.png",
  "${prefix}icons/icon-512.png",
  "${prefix}icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
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
          const cached = await caches.match(request);
          if (cached) return cached;

          const rootFallback = await caches.match("${prefix}");
          if (rootFallback) return rootFallback;

          return new Response("Offline — Tatva available once online.", {
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  const isStaticAsset =
    url.origin.includes("fonts.googleapis.com") ||
    url.origin.includes("fonts.gstatic.com") ||
    url.pathname.startsWith("${prefix}_astro/") ||
    url.pathname.startsWith("${prefix}icons/") ||
    url.pathname.startsWith("${prefix}media/") ||
    url.pathname.startsWith("${prefix}api/") ||
    url.pathname.endsWith("daily-quotes.json");

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
`;

  return new Response(script, {
    headers: { "Content-Type": "application/javascript; charset=utf-8" },
  });
};
