const CACHE_NAME = 'gestion-vehiculos-cache-v4';

// Archivos que queremos guardar en caché al instalar
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Evento de instalación: Guarda los recursos básicos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Evento de activación: Limpia cachés antiguas
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Evento fetch: Intercepta las peticiones de red
self.addEventListener('fetch', (event) => {
    // Solo interceptamos peticiones GET
    if (event.request.method !== 'GET') return;

    // Ignorar peticiones que no sean HTTP/HTTPS (ej. WebSockets o extensiones)
    if (!event.request.url.startsWith('http')) return;

    // Ignorar peticiones internas de Vite en desarrollo para evitar errores de WebSocket (HMR)
    if (event.request.url.includes('/@vite/') || event.request.url.includes('/@react-refresh')) return;

    const isApiRequest = event.request.url.includes('gestion-vehiculos-backend.vercel.app') || event.request.url.includes('/api/');

    // Los bundles JS/CSS con hash cambian en cada build → usar Network First
    const isHashedAsset = event.request.url.includes('/assets/');

    if (isApiRequest || isHashedAsset) {
        // Estrategia "Network First" para API y bundles hasheados
        // Siempre intentar la red primero para obtener la versión más reciente
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // Para otros archivos estáticos (imágenes, fuentes, etc.): Estrategia "Network First" también
        // para evitar servir HTML cacheado con referencias a bundles antiguos
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
});
