const CACHE_NAME = 'inova-ar-offline-v1';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/mediapipe/hand_landmarker.task',
  '/mediapipe/wasm/vision_wasm_internal.js',
  '/mediapipe/wasm/vision_wasm_internal.wasm',
  '/mediapipe/wasm/vision_wasm_nosimd_internal.js',
  '/mediapipe/wasm/vision_wasm_nosimd_internal.wasm',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline AR MediaPipe assets...');
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }
        // Cache mediapipe models or wasm files dynamically
        if (event.request.url.includes('/mediapipe/')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

