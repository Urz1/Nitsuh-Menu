// Offline PWA Service Worker for Digital Menu
const CACHE_NAME = 'digital-menu-cache-v3';
const OFFLINE_URLS = [
  '/',
  '/nitsuh',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Navigation requests: Network-first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone).catch(() => {}));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = (await caches.match('/nitsuh')) || (await caches.match('/addis'));
          return fallback || (await caches.match('/'));
        })
    );
    return;
  }

  // Cloudinary Dish Images & Static Assets (Images, Fonts, CSS, JS):
  // Cache-first with background revalidation
  const isCloudinaryImage = url.hostname === 'res.cloudinary.com';
  const isStaticAsset =
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    isCloudinaryImage;

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache immediately, update cache in background
          fetch(event.request)
            .then((networkResponse) => {
              if (
                networkResponse &&
                (networkResponse.status === 200 || networkResponse.type === 'opaque')
              ) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone).catch(() => {}));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache: fetch from network and cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              (networkResponse.status === 200 || networkResponse.type === 'opaque')
            ) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone).catch(() => {}));
            }
            return networkResponse;
          });
      })
    );
  }
});
