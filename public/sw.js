const CACHE_NAME = `phaser-musk-sci-cache-v2025.10.21.08.25`;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return Promise.resolve(); // Không cache trước nữa
        })
    );
});

self.addEventListener("fetch", (event) => {
    // Chỉ xử lý các request HTTP/HTTPS, bỏ qua chrome-extension và các scheme khác
    if (
        event.request.url.startsWith("chrome-extension://") ||
        event.request.url.startsWith("chrome://") ||
        event.request.url.startsWith("moz-extension://") ||
        event.request.url.startsWith("safari-extension://") ||
        event.request.url.includes("api")
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest)
                .then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    // Không cache bất kỳ tài nguyên nào
                    return response;
                })
                .catch((error) => {
                    console.warn("Fetch failed:", error);
                    // Trả về response từ cache nếu có, hoặc trả về error
                    return caches
                        .match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            throw error;
                        });
                });
        })
    );
});

self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
