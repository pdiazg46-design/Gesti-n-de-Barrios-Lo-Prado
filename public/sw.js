// Service Worker minimalista indispensable para que Chrome evalúe la Web como PWA instalable

const CACHE_NAME = 'barrio-seguro-pwa-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Para considerarse PWA real exigida por Chromium, debe haber al menos un escuchador de event fetch vacío o activo.
    // Ignoramos el cacheado agresivo porque Barrio Seguro tiene data en vivo, solo dejamos pasar la red.
    return;
});
