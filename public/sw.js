const CACHE_NAME = "nest-cache-v1";

// these are the core files we want to save to the phone instantly
const CORE_ASSETS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

// 1. INSTALLATION: cache the core app shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }),
  );
});

// 2. ACTIVATION: clean up old caches if we update the app
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// 3. THE INTERCEPTOR: how we handle network requests
self.addEventListener("fetch", (event) => {
  // Ignore API calls to Supabase or Google Auth
  if (
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("google.com") ||
    event.request.method !== "GET"
  ) {
    return; // let the browser handle these normally
  }

  // For everything else (HTML, CSS, Fonts, Images):
  // Stale-While-Revalidate Strategy
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // fetch the freshest version in the background
        const fetchedResponse = fetch(event.request)
          .then((networkResponse) => {
            // save the new version to the cache for next time
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            // if we are offline and it fails, just return nothing
          });

        // immediately return the cached version if we have it,
        // otherwise wait for the network version
        return cachedResponse || fetchedResponse;
      });
    }),
  );
});
