// Hospital Stats PWA Service Worker
// Provides offline functionality and app-like experience

const CACHE_NAME = 'hospital-stats-v1';
const STATIC_CACHE = 'hospital-stats-static-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/components/cards.css',
  '/css/components/buttons.css',
  '/css/components/forms.css',
  '/css/components/lists.css',
  '/css/layout/header.css',
  '/css/layout/layout.css',
  '/css/pages/dashboard.css',
  '/js/app.js',
  '/js/auth/auth.js',
  '/js/storage/storage.js',
  '/js/sync/sync.js',
  '/js/patient/patient-form.js',
  '/js/patient/patient-crud.js',
  '/js/patient/patient-list.js',
  '/js/ui/components.js',
  '/js/ui/views.js',
  '/js/ui/router.js',
  '/js/utils/state.js',
  '/js/utils/constants.js',
  '/js/utils/config.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch(error => {
        console.error('[SW] Failed to cache static files:', error);
        // Don't fail the install if some files can't be cached
        return Promise.resolve();
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache opaque responses or errors
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it can only be consumed once
            const responseToCache = response.clone();
            
            // Cache successful responses
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('[SW] Network request failed:', event.request.url, error);
            
            // Return a custom offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other resources, just fail gracefully
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle background sync for data synchronization
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Send message to main thread to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BACKGROUND_SYNC' });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded');