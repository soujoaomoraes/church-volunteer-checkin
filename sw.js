/**
 * Service Worker - PWA Cache and Offline Support
 * Sistema de Check-in/Check-out de Voluntários - Igreja Central
 */

const CACHE_NAME = 'church-volunteer-v1.0.0';
const DATA_CACHE_NAME = 'church-volunteer-data-v1.0.0';

// Files to cache for offline functionality
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/config.js',
    '/js/utils.js',
    '/js/validation.js',
    '/js/api.js',
    '/js/ui.js',
    '/js/checkin.js',
    '/js/checkout.js',
    '/public/manifest.json',
    '/public/favicon.ico',
    '/public/placeholder.svg'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
    /\/api\/volunteers/,
    /\/api\/stats/,
    /\/api\/test/
];

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Pre-caching offline page');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
    );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

/**
 * Fetch event - Serve cached content when offline
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle static assets
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }

    // Handle navigation requests (HTML pages)
    if (isNavigationRequest(request)) {
        event.respondWith(handleNavigationRequest(request));
        return;
    }
});

/**
 * Check if request is for API
 * @param {Request} request - Fetch request
 * @returns {boolean} Is API request
 */
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') || 
           url.hostname.includes('script.google.com') ||
           API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Check if request is for static asset
 * @param {Request} request - Fetch request
 * @returns {boolean} Is static asset
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/css/') ||
           url.pathname.startsWith('/js/') ||
           url.pathname.startsWith('/public/') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.ico') ||
           url.pathname.endsWith('.svg') ||
           url.pathname.endsWith('.png') ||
           url.pathname.endsWith('.jpg') ||
           url.pathname.endsWith('.json');
}

/**
 * Check if request is navigation request
 * @param {Request} request - Fetch request
 * @returns {boolean} Is navigation request
 */
function isNavigationRequest(request) {
    return request.mode === 'navigate' || 
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

/**
 * Handle API requests with network-first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function handleAPIRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // If successful, cache the response for GET requests
        if (networkResponse.ok && request.method === 'GET') {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[ServiceWorker] Network request failed, trying cache', error);
        
        // If network fails, try cache for GET requests
        if (request.method === 'GET') {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
        }
        
        // For POST requests (check-in/check-out), store in IndexedDB for later sync
        if (request.method === 'POST') {
            await storeOfflineRequest(request);
            
            // Return success response to avoid breaking the UI
            return new Response(JSON.stringify({
                success: true,
                offline: true,
                message: 'Dados salvos localmente. Serão enviados quando voltar online.'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Return offline response for other failed requests
        return new Response(JSON.stringify({
            success: false,
            offline: true,
            message: 'Sem conexão com a internet'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle static assets with cache-first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function handleStaticAsset(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[ServiceWorker] Static asset request failed', error);
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return placeholder for missing assets
        if (request.url.includes('.svg') || request.url.includes('.png') || request.url.includes('.jpg')) {
            return caches.match('/public/placeholder.svg');
        }
        
        throw error;
    }
}

/**
 * Handle navigation requests
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        return networkResponse;
        
    } catch (error) {
        console.log('[ServiceWorker] Navigation request failed, serving cached index', error);
        
        // Serve cached index.html for offline navigation
        const cachedResponse = await caches.match('/index.html');
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Store offline request for later synchronization
 * @param {Request} request - Failed request
 */
async function storeOfflineRequest(request) {
    try {
        const requestData = {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: await request.text(),
            timestamp: Date.now()
        };
        
        // Store in IndexedDB
        const db = await openOfflineDB();
        const transaction = db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        await store.add(requestData);
        
        console.log('[ServiceWorker] Stored offline request', requestData);
        
    } catch (error) {
        console.error('[ServiceWorker] Failed to store offline request', error);
    }
}

/**
 * Open IndexedDB for offline storage
 * @returns {Promise<IDBDatabase>} Database instance
 */
function openOfflineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ChurchVolunteerOffline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create requests store
            if (!db.objectStoreNames.contains('requests')) {
                const store = db.createObjectStore('requests', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

/**
 * Background sync event - Sync offline data when online
 */
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(syncOfflineRequests());
    }
});

/**
 * Sync offline requests when back online
 */
async function syncOfflineRequests() {
    try {
        const db = await openOfflineDB();
        const transaction = db.transaction(['requests'], 'readonly');
        const store = transaction.objectStore('requests');
        const requests = await getAllFromStore(store);
        
        console.log('[ServiceWorker] Syncing', requests.length, 'offline requests');
        
        for (const requestData of requests) {
            try {
                const response = await fetch(requestData.url, {
                    method: requestData.method,
                    headers: requestData.headers,
                    body: requestData.body
                });
                
                if (response.ok) {
                    // Remove successfully synced request
                    await removeFromOfflineDB(requestData.id);
                    console.log('[ServiceWorker] Synced offline request', requestData.id);
                }
                
            } catch (error) {
                console.error('[ServiceWorker] Failed to sync request', requestData.id, error);
            }
        }
        
        // Notify clients about sync completion
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                synced: requests.length
            });
        });
        
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed', error);
    }
}

/**
 * Get all records from IndexedDB store
 * @param {IDBObjectStore} store - Object store
 * @returns {Promise<Array>} All records
 */
function getAllFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

/**
 * Remove record from offline database
 * @param {number} id - Record ID
 */
async function removeFromOfflineDB(id) {
    try {
        const db = await openOfflineDB();
        const transaction = db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        await store.delete(id);
    } catch (error) {
        console.error('[ServiceWorker] Failed to remove offline request', error);
    }
}

/**
 * Message event - Handle messages from main thread
 */
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SYNC_NOW') {
        syncOfflineRequests();
    }
});

/**
 * Push event - Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received', event);
    
    // This is a placeholder for future push notification support
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'Nova notificação',
            icon: '/public/favicon.ico',
            badge: '/public/favicon.ico',
            tag: 'church-volunteer',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir App'
                },
                {
                    action: 'close',
                    title: 'Fechar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Sistema de Voluntários', options)
        );
    }
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification click', event);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[ServiceWorker] Service Worker loaded');
