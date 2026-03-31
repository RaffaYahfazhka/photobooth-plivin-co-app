const CACHE_NAME = 'plivin-cache-v1';

const PRECACHE_URLS = [
    '/',
    '/dashboard',
    '/offline',
];

// Install: pre-cache essential pages
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Supabase API requests (always network)
    if (url.hostname.includes('supabase')) return;

    // For navigation requests: network-first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache a copy for offline
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((cached) => {
                        return cached || caches.match('/offline');
                    });
                })
        );
        return;
    }

    // For static assets (JS, CSS, images): cache-first
    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/)
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }
});
