const CACHE_NAME = 'gestion-vehiculos-cache-v2';

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

    if (isApiRequest) {
        // Para la API: Estrategia "Network First" (Primero Red)
        // Intentamos ir a internet para tener los datos más recientes.
        // Si falla (ej. estamos offline), devolvemos la versión que tengamos en caché.
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Si la respuesta es buena, la guardamos/actualizamos en la caché
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si la petición falla (offline), buscamos en la caché
                    return caches.match(event.request);
                })
        );
    } else {
        // Para archivos estáticos (HTML, CSS, JS, Imágenes): Estrategia "Cache First"
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request).then(
                        (response) => {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        }
                    );
                })
        );
    }
});
