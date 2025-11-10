// NUCLEAR RESET - Service Worker Self-Destruct Mode
const CACHE_VERSION = '20251110-NUCLEAR';

console.log('🔥 NUCLEAR RESET: Service Worker in self-destruct mode');

// Immediately unregister this service worker on install
self.addEventListener('install', (event) => {
  console.log('🔥 NUCLEAR: Unregistering service worker...');
  event.waitUntil(
    // Delete ALL caches
    caches.keys().then((cacheNames) => {
      console.log('🔥 NUCLEAR: Deleting all caches:', cacheNames);
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      console.log('🔥 NUCLEAR: All caches deleted');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// On activate, unregister immediately
self.addEventListener('activate', (event) => {
  console.log('🔥 NUCLEAR: Activating self-destruct...');
  event.waitUntil(
    self.registration.unregister().then(() => {
      console.log('🔥 NUCLEAR: Service worker unregistered successfully');
      // Notify all clients to reload
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_NUCLEAR_RESET', action: 'reload' });
        });
      });
    })
  );
  self.clients.claim();
});

// NUCLEAR RESET: Fetch handler - pass through all requests without caching
self.addEventListener('fetch', (event) => {
  console.log('🔥 NUCLEAR: Fetch passthrough for:', event.request.url);
  // Don't cache anything - just fetch directly from network
  event.respondWith(fetch(event.request));
});
