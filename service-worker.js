const cacheName = 'pdfpointer-cache';
const filestoCache = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './assets/mergedContent.json',
    './assets/icon.png',
    './translationItems/licenses.json',
    './themeCreator/colorScript.js',
    './themeCreator/create.html',
    './canvas2svg.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@700&family=Work+Sans&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.min.js',
    './assets/FirstClip.mp4',
    './assets/SecondClip.mp4',
    './assets/ThirdClip.mp4',
    './assets/FirstZoomOption.mp4',
    './assets/SecondZoomOption.mp4',
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