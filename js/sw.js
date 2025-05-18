/**
 * Enhanced Service Worker
 * Provides robust offline support, advanced caching strategies, and performance optimizations
 * for the Cyberpunk OS application.
 */

// ===== Configuration =====
const CONFIG = {
  // Cache names with versioning
  caches: {
    static: 'cyberpunk-os-static-v1',
    dynamic: 'cyberpunk-os-dynamic-v1',
    assets: 'cyberpunk-os-assets-v1',
    api: 'cyberpunk-os-api-v1'
  },
  
  // Cache expiration (in milliseconds)
  expiration: {
    api: 24 * 60 * 60 * 1000, // 24 hours
    dynamic: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  // Maximum cache size
  maxCacheSize: {
    dynamic: 50, // Maximum number of items in dynamic cache
    assets: 100  // Maximum number of items in assets cache
  },
  
  // Debug mode
  debug: false
};

// Assets to cache on install (critical app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/glitch-effects.css',
  '/js/boot-sequence.js',
  '/js/consolidated.js',
  '/js/utils.js',
  '/js/window-state-manager.js',
  '/js/asset-loader.js',
  '/js/accessibility.js',
  '/js/mobile-enhancements.js',
  '/js/virtual-filesystem.js',
  '/js/clock-manager.js',
  '/js/workers/clock-worker.js',
  '/js/apps/file-explorer.js',
  '/js/apps/terminal.js',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Additional assets to cache after install (non-critical)
const SECONDARY_ASSETS = [
  '/fonts/vt323-regular.woff2',
  '/fonts/press-start-2p.woff2',
  '/sounds/boot.mp3',
  '/sounds/click.mp3',
  '/images/background.jpg'
];

// ===== Utility Functions =====

// Logger with debug mode support
const log = (message, type = 'info') => {
  if (CONFIG.debug || type === 'error') {
    const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '🔧';
    console[type](`[ServiceWorker] ${emoji} ${message}`);
  }
};

// Cache management utilities
const cacheUtils = {
  // Add items to a specific cache
  async addToCache(cacheName, items) {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(items);
      log(`Added ${items.length} items to ${cacheName}`);
    } catch (error) {
      log(`Failed to add items to ${cacheName}: ${error}`, 'error');
    }
  },
  
  // Trim cache to maximum size
  async trimCache(cacheName, maxItems) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      if (keys.length > maxItems) {
        log(`Trimming ${cacheName} (${keys.length} items, max: ${maxItems})`, 'warn');
        for (let i = 0; i < keys.length - maxItems; i++) {
          await cache.delete(keys[i]);
        }
      }
    } catch (error) {
      log(`Failed to trim ${cacheName}: ${error}`, 'error');
    }
  },
  
  // Delete expired items from cache
  async deleteExpiredItems(cacheName, maxAge) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const now = Date.now();
      
      let expiredCount = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const cachedTime = response.headers.get('sw-cache-timestamp');
          if (cachedTime && (now - parseInt(cachedTime)) > maxAge) {
            await cache.delete(request);
            expiredCount++;
          }
        }
      }
      
      if (expiredCount > 0) {
        log(`Removed ${expiredCount} expired items from ${cacheName}`);
      }
    } catch (error) {
      log(`Failed to delete expired items from ${cacheName}: ${error}`, 'error');
    }
  },
  
  // Add timestamp to response
  addTimestamp(response) {
    if (!response || !response.body) return response;
    
    const headers = new Headers(response.headers);
    headers.set('sw-cache-timestamp', Date.now().toString());
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }
};

// Network utilities
const networkUtils = {
  // Check if a URL is an API request
  isApiRequest(url) {
    return url.includes('/api/');
  },
  
  // Check if a URL is a static asset
  isStaticAsset(url) {
    const staticExtensions = ['.css', '.js', '.html', '.json', '.ico', '.png', '.jpg', '.svg', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => url.endsWith(ext));
  },
  
  // Check if a URL is a media asset
  isMediaAsset(url) {
    const mediaExtensions = ['.mp3', '.mp4', '.webm', '.ogg', '.wav'];
    return mediaExtensions.some(ext => url.endsWith(ext));
  },
  
  // Check if a request should be cached
  shouldCache(request) {
    // Skip non-GET requests
    if (request.method !== 'GET') return false;
    
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return false;
    
    // Skip analytics and tracking requests
    if (url.pathname.includes('/analytics/') || url.pathname.includes('/tracking/')) return false;
    
    return true;
  },
  
  // Network-first strategy with timeout
  async networkFirstWithTimeout(request, cacheName, timeout = 3000) {
    return new Promise(async (resolve) => {
      let timeoutId;
      
      // Set timeout for network request
      const timeoutPromise = new Promise(resolveTimeout => {
        timeoutId = setTimeout(async () => {
          log(`Network request timeout for ${request.url}`, 'warn');
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            log(`Serving from cache: ${request.url}`);
            resolveTimeout(cachedResponse);
          } else {
            log(`No cached version available for ${request.url}`, 'warn');
            resolveTimeout(new Response('Network request timed out', { 
              status: 408, 
              headers: { 'Content-Type': 'text/plain' } 
            }));
          }
        }, timeout);
      });
      
      // Try network first
      try {
        const networkPromise = fetch(request).then(async response => {
          clearTimeout(timeoutId);
          
          // Cache successful responses
          if (response.ok) {
            const clonedResponse = response.clone();
            const cache = await caches.open(cacheName);
            await cache.put(request, cacheUtils.addTimestamp(clonedResponse));
            log(`Cached network response: ${request.url}`);
          }
          
          return response;
        });
        
        // Race network request against timeout
        resolve(Promise.race([networkPromise, timeoutPromise]));
      } catch (error) {
        clearTimeout(timeoutId);
        log(`Network error for ${request.url}: ${error}`, 'error');
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          log(`Serving from cache after network error: ${request.url}`);
          resolve(cachedResponse);
        } else {
          log(`No cached version available after network error for ${request.url}`, 'error');
          resolve(new Response('Network error and no cached version available', { 
            status: 503, 
            headers: { 'Content-Type': 'text/plain' } 
          }));
        }
      }
    });
  }
};

// ===== Event Handlers =====

// Install event - precache critical assets
self.addEventListener('install', event => {
  log('Installing Service Worker');
  
  event.waitUntil(
    (async () => {
      try {
        // Cache critical app shell assets
        await cacheUtils.addToCache(CONFIG.caches.static, PRECACHE_ASSETS);
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
        log('Service Worker installed successfully');
      } catch (error) {
        log(`Installation failed: ${error}`, 'error');
      }
    })()
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  log('Activating Service Worker');
  
  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        
        // Valid cache names from config
        const validCacheNames = Object.values(CONFIG.caches);
        
        // Delete old caches
        await Promise.all(
          cacheNames
            .filter(cacheName => !validCacheNames.includes(cacheName))
            .map(cacheName => {
              log(`Removing old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
        
        // Cache secondary assets in the background
        cacheUtils.addToCache(CONFIG.caches.assets, SECONDARY_ASSETS)
          .catch(error => log(`Failed to cache secondary assets: ${error}`, 'error'));
        
        // Claim all clients
        await self.clients.claim();
        log('Service Worker activated and claimed clients');
      } catch (error) {
        log(`Activation failed: ${error}`, 'error');
      }
    })()
  );
});

// Fetch event - handle different caching strategies based on request type
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip non-cacheable requests
  if (!networkUtils.shouldCache(request)) {
    return;
  }
  
  // Choose caching strategy based on request type
  if (networkUtils.isApiRequest(request.url)) {
    // API requests: Network-first with fallback to cache
    event.respondWith(
      networkUtils.networkFirstWithTimeout(request, CONFIG.caches.api, 5000)
    );
  } else if (networkUtils.isMediaAsset(request.url)) {
    // Media assets: Cache-first for performance
    event.respondWith(
      (async () => {
        try {
          // Try cache first
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            log(`Serving media from cache: ${request.url}`);
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          const networkResponse = await fetch(request);
          
          // Cache the response if successful
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            const cache = await caches.open(CONFIG.caches.assets);
            await cache.put(request, cacheUtils.addTimestamp(clonedResponse));
            
            // Trim cache if needed
            cacheUtils.trimCache(CONFIG.caches.assets, CONFIG.maxCacheSize.assets);
            
            log(`Cached media asset: ${request.url}`);
          }
          
          return networkResponse;
        } catch (error) {
          log(`Failed to fetch media asset: ${request.url}`, 'error');
          return new Response('Failed to fetch media asset', { 
            status: 503, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        }
      })()
    );
  } else if (networkUtils.isStaticAsset(request.url)) {
    // Static assets: Cache-first with network fallback
    event.respondWith(
      (async () => {
        try {
          // Try cache first
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            log(`Serving static asset from cache: ${request.url}`);
            
            // Update cache in the background (stale-while-revalidate)
            fetch(request)
              .then(async networkResponse => {
                if (networkResponse.ok) {
                  const cache = await caches.open(CONFIG.caches.static);
                  await cache.put(request, cacheUtils.addTimestamp(networkResponse));
                  log(`Updated cached static asset: ${request.url}`);
                }
              })
              .catch(error => log(`Background fetch failed for ${request.url}: ${error}`, 'warn'));
            
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          const networkResponse = await fetch(request);
          
          // Cache the response if successful
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            const cache = await caches.open(CONFIG.caches.static);
            await cache.put(request, cacheUtils.addTimestamp(clonedResponse));
            log(`Cached static asset: ${request.url}`);
          }
          
          return networkResponse;
        } catch (error) {
          log(`Failed to fetch static asset: ${request.url}`, 'error');
          return new Response('Failed to fetch static asset', { 
            status: 503, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        }
      })()
    );
  } else {
    // Other requests: Network-first with cache fallback
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(request);
          
          // Cache the response if successful
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            const cache = await caches.open(CONFIG.caches.dynamic);
            await cache.put(request, cacheUtils.addTimestamp(clonedResponse));
            
            // Trim cache if needed
            cacheUtils.trimCache(CONFIG.caches.dynamic, CONFIG.maxCacheSize.dynamic);
            
            log(`Cached dynamic content: ${request.url}`);
          }
          
          return networkResponse;
        } catch (error) {
          log(`Network request failed for ${request.url}: ${error}`, 'warn');
          
          // Fallback to cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            log(`Serving from cache after network failure: ${request.url}`);
            return cachedResponse;
          }
          
          // If not in cache, try to serve the offline page
          const offlineResponse = await caches.match('/offline.html');
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Last resort: generic error response
          return new Response('You are offline and the requested resource is not cached', { 
            status: 503, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        }
      })()
    );
  }
});

// Message event - handle messages from clients
self.addEventListener('message', event => {
  log(`Message received: ${JSON.stringify(event.data)}`);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  } else if (event.data.action === 'clearCache') {
    event.waitUntil(
      (async () => {
        try {
          if (event.data.cacheName) {
            // Clear specific cache
            await caches.delete(event.data.cacheName);
            log(`Cleared cache: ${event.data.cacheName}`);
          } else {
            // Clear all caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            log('Cleared all caches');
          }
          
          // Notify client
          if (event.source) {
            event.source.postMessage({
              action: 'cacheCleared',
              success: true
            });
          }
        } catch (error) {
          log(`Failed to clear cache: ${error}`, 'error');
          
          // Notify client of failure
          if (event.source) {
            event.source.postMessage({
              action: 'cacheCleared',
              success: false,
              error: error.message
            });
          }
        }
      })()
    );
  } else if (event.data.action === 'precacheAssets') {
    // Precache additional assets on demand
    event.waitUntil(
      (async () => {
        try {
          if (event.data.assets && Array.isArray(event.data.assets)) {
            await cacheUtils.addToCache(CONFIG.caches.assets, event.data.assets);
            
            // Notify client
            if (event.source) {
              event.source.postMessage({
                action: 'assetsPrecached',
                success: true
              });
            }
          }
        } catch (error) {
          log(`Failed to precache assets: ${error}`, 'error');
          
          // Notify client of failure
          if (event.source) {
            event.source.postMessage({
              action: 'assetsPrecached',
              success: false,
              error: error.message
            });
          }
        }
      })()
    );
  } else if (event.data.action === 'setDebugMode') {
    CONFIG.debug = !!event.data.enabled;
    log(`Debug mode ${CONFIG.debug ? 'enabled' : 'disabled'}`);
    
    // Notify client
    if (event.source) {
      event.source.postMessage({
        action: 'debugModeSet',
        enabled: CONFIG.debug
      });
    }
  }
});

// Periodic cache maintenance
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cache-maintenance') {
    log('Performing periodic cache maintenance');
    
    event.waitUntil(
      (async () => {
        try {
          // Delete expired items from API cache
          await cacheUtils.deleteExpiredItems(CONFIG.caches.api, CONFIG.expiration.api);
          
          // Delete expired items from dynamic cache
          await cacheUtils.deleteExpiredItems(CONFIG.caches.dynamic, CONFIG.expiration.dynamic);
          
          // Trim caches to maximum size
          await cacheUtils.trimCache(CONFIG.caches.dynamic, CONFIG.maxCacheSize.dynamic);
          await cacheUtils.trimCache(CONFIG.caches.assets, CONFIG.maxCacheSize.assets);
          
          log('Cache maintenance completed');
        } catch (error) {
          log(`Cache maintenance failed: ${error}`, 'error');
        }
      })()
    );
  }
});

// Push notification event
self.addEventListener('push', event => {
  log('Push notification received');
  
  if (!event.data) {
    log('No data in push event', 'warn');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      vibrate: data.vibrate || [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Cyberpunk OS', options)
    );
  } catch (error) {
    log(`Failed to process push notification: ${error}`, 'error');
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  log('Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      try {
        const url = event.notification.data.url || '/';
        const windowClients = await self.clients.matchAll({ type: 'window' });
        
        // Try to find an open window and navigate to the URL
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            await client.focus();
            return;
          }
        }
        
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          await self.clients.openWindow(url);
        }
      } catch (error) {
        log(`Failed to handle notification click: ${error}`, 'error');
      }
    })()
  );
});

// Log successful registration
log('Service Worker registered');