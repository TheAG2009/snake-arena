const CACHE_NAME = 'ag-snake-v2.4';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './assets/sounds/eat.wav',
    './assets/sounds/hit.wav',
    './assets/sounds/bgm.mp3'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
