// Build: 2025-12-04T10:52:00
const CACHE_NAME = "wellsmart-v3";
const RUNTIME_CACHE = "wellsmart-runtime-v2";
const STATIC_ASSETS = ["/", "/index.html", "/favicon.ico"];

// Install: Cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[Service Worker] Some assets failed to cache:", err);
        // Don't fail install if static assets are missing
        return Promise.resolve();
      });
    })
  );
  // Don't skipWaiting here - wait for user confirmation via message
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Claim all clients
  );
});

// Fetch: Implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip WebSocket upgrades and external requests
  if (url.protocol === "ws:" || url.protocol === "wss:") {
    return;
  }

  // Strategy 1: Network-first for HTML (app shell)
  if (request.destination === "document" || url.pathname === "/") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || !response.ok) {
            return response;
          }
          // Clone immediately - use one for cache, one for return
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("[Service Worker] Serving from cache:", url.pathname);
              return cachedResponse;
            }
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Strategy 2: Stale-while-revalidate for JS/CSS (optimal for Next.js)
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (!response || !response.ok) {
              return response;
            }
            // Clone and cache, return original
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            console.warn("[Service Worker] Failed to fetch:", url.pathname);
            if (cachedResponse) {
              return cachedResponse;
            }
            throw new Error("Failed to fetch");
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy 3: Cache-first for fonts, images
  if (request.destination === "font" || request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }
            // Clone and cache, return original
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            console.warn(
              "[Service Worker] Failed to fetch asset:",
              url.pathname
            );
            return undefined;
          });
      })
    );
    return;
  }

  // Default: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || !response.ok) {
          return response;
        }
        // Clone and cache, return original
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          throw new Error("Network request failed and no cache available");
        });
      })
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
