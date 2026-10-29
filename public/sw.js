// Offline PWA Service Worker for Nitsuh Cafe & Restaurant Digital Menu
const CACHE_VERSION = 'nitsuh-pwa-v7';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

const PRECACHE_URLS = [
  '/',
  '/nitsuh',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/screenshots/screenshot-desktop.png',
  '/screenshots/screenshot-mobile.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Precache failed for some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Bypass dev HMR, Turbopack, and WebSocket requests
  if (
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('__turbopack__') ||
    event.request.headers.get('Upgrade') === 'websocket'
  ) {
    return;
  }

  // 2. Navigation requests: Network-first, fallback to cache for offline support
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clone).catch(() => {}));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          if (fallback) return fallback;
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nitsuh Menu Offline</title><style>body{font-family:sans-serif;background:#FAF6F0;color:#2E2623;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h1{color:#C11221;font-size:1.5rem}p{color:#6E635F}</style></head><body><div><h1>Nitsuh Cafe & Restaurant</h1><p>You are currently offline. Please reconnect to view live updates or explore cached items.</p><button onclick="window.location.reload()" style="background:#C11221;color:#fff;border:none;padding:10px 20px;border-radius:20px;font-weight:bold;cursor:pointer;">Retry Connection</button></div></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 3. Cloudinary and food dish photos: Stale-While-Revalidate with images cache
  if (url.hostname === 'res.cloudinary.com' || url.hostname === 'images.unsplash.com') {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(event.request, networkRes.clone()).catch(() => {});
            }
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. Next.js static bundles, fonts, local icons: Cache-first with network background revalidation
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/images/'))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background
          fetch(event.request)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, networkRes).catch(() => {}));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone).catch(() => {}));
          }
          return networkRes;
        });
      })
    );
  }
});
