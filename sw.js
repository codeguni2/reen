/**
 * Reen Business Centre — Low-Bandwidth Service Worker
 * - NetworkFirst for HTML navigations (serves fresh copy when online, cached shell when offline)
 * - CacheFirst with bounded size for same-origin CSS, JS, and compressed WebP/JPG/SVG media
 */

const SHELL_CACHE = 'reen-shell-v1';
const ASSET_CACHE = 'reen-assets-v1';
const MAX_ASSET_ENTRIES = 45;

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './assets/images/favicon.svg',
  './assets/images/reen-hero-storefront-sm.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await Promise.all(keys.slice(0, keys.length - maxItems).map((k) => cache.delete(k)));
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // NetworkFirst for HTML navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // CacheFirst for same-origin static assets (CSS, JS, images)
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(ASSET_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(ASSET_CACHE, MAX_ASSET_ENTRIES);
            });
          }
          return response;
        });
      })
    );
  }
});
