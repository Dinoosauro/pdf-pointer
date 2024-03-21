const cacheName = 'pdfpointer-cache';
const filestoCache = [
    './',
    './index.html',
    './logo.png',
    './manifest.json',
    './assets/__vite-browser-external.js',
    './assets/index.css',
    './assets/index.js',
    './assets/path2d-polyfill.min.js',
];
let language = navigator.language || navigator.userLanguage;
if (language.indexOf("it") !== -1) filestoCache.push('./translationItems/it.json')
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filestoCache))
    );
});
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.url.indexOf("updatecode") !== -1) return fetch(req); else event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
    try {
        const networkResponse = await fetch(req);
        const cache = await caches.open('pdfpointer-cache');
        await cache.delete(req);
        await cache.put(req, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(req);
        return cachedResponse;
    }
}