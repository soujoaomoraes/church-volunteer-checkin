const CACHE_NAME = 'church-volunteer-checkin-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/api.js',
  '/js/app.js',
  '/js/checkin.js',
  '/js/checkout.js',
  '/js/config.js',
  '/js/ui.js',
  '/js/utils.js',
  '/js/validation.js',
  '/assets/icons/favicon.ico',
  '/assets/images/placeholder.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Só intercepta requisições GET
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});