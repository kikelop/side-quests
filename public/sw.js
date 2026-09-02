// Side Quests service worker. The app is meant to open with no network:
// the three routes and the manifest are precached, hashed build assets are
// cached on first use, everything else is network-first with a cache fallback.
const CACHE = "side-quests-v1";
const PRECACHE = ["/", "/explore", "/list", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Leave cross-origin requests (fonts, etc.) to the browser.
  if (url.origin !== self.location.origin) return;

  const immutable = url.pathname.startsWith("/_next/static/") || /\.(png|ico|svg|woff2?)$/.test(url.pathname);
  event.respondWith(immutable ? cacheFirst(request) : networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && request.mode === "navigate") {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline on a route we never cached: serve the Today page shell.
    if (request.mode === "navigate") {
      const shell = await caches.match("/");
      if (shell) return shell;
    }
    throw new Error("offline");
  }
}
