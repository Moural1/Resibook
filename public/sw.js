/* Resibook service worker.
   - Arquivos estáticos do Next (com hash) e ícones: cache-first.
   - Páginas de referência sem dados pessoais (ACLS, calculadoras, ECG):
     network-first, guardadas para abrir sem internet.
   - Demais páginas: sempre da rede; sem internet, mostra /offline.html.
   Nunca guarda respostas de API, nem páginas de pacientes ou de conta. */
const VERSION = "resibook-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";
const OFFLINE_PAGES = ["/acls", "/calculadoras", "/ecg-guiado"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/resibook-icon.svg"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "resibook:clear-pages") {
    event.waitUntil(caches.delete(PAGES_CACHE));
  }
});

function isOfflinePage(pathname) {
  return OFFLINE_PAGES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:svg|png|webp|jpg|jpeg|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  if (request.mode !== "navigate") return;

  if (isOfflinePage(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(url.pathname, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(url.pathname).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
});
