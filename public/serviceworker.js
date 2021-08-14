const FILES_TO_CACHE = [
    "/",
    "/index.html",
    '/index.js',
    "/style.css",
    "/manifest.webmanifest",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
  ];
  
  const CACHE_NAME = "static-cache";
  const DATA_CACHE_NAME = "data-cache";
  
  // install
  self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Pre-cached successful");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  // fetch
  self.addEventListener("fetch", function(evt) {
    // cache successful requests
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If response good, clone & store in cache
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // take from cache when no internet connection
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
  
    // if the request is not for the API, serve static assets using "offline-first" approach
    evt.respondWith(
      caches.match(evt.request).then(function(response) {
        return response || fetch(evt.request);
      })
    );
  });
  