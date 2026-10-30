/* Motor TXT Universal: recursos publicos para uso sin conexion.
 * Nunca almacena archivos TXT privados ni mensajes escritos por el usuario. */
'use strict';
const CACHE_NAME = 'motor-txt-offline-v4';
const CACHE_PREFIXES = ['motor-txt-offline-', 'motor-txt-web-'];
const OFFLINE_FILES = [
  './', './index.html', './enhancements.js', './quality.js', './offline.js',
  './motor_idiomas.js', './manifest.webmanifest', './icon.svg',
  './icon-192.png', './icon-512.png', './docs/index.html',
  './docs/SIN_CONEXION.md'
];
const FILE_URLS = OFFLINE_FILES.map(path => new URL(path, self.registration.scope).href);
const knownFile = url => FILE_URLS.includes(new URL(url).origin + new URL(url).pathname);

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(FILE_URLS.map(url => new Request(url, {cache:'reload'})));
  return offlineStatus();
}
async function offlineStatus() {
  const cache = await caches.open(CACHE_NAME);
  const missing = [];
  for (const url of FILE_URLS) {
    const item = await cache.match(url, {ignoreSearch:true});
    if (!item || !item.ok) missing.push(new URL(url).pathname);
  }
  return {ok:missing.length === 0, ready:missing.length === 0, cached:FILE_URLS.length - missing.length,
          total:FILE_URLS.length, missing, version:CACHE_NAME};
}
self.addEventListener('install', event => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async() => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME &&
      CACHE_PREFIXES.some(prefix => key.startsWith(prefix))).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  const port = event.ports && event.ports[0];
  if (!port || !event.data || !['GET_OFFLINE_STATUS','CACHE_FOR_OFFLINE'].includes(event.data.type)) return;
  const promise = event.data.type === 'CACHE_FOR_OFFLINE' ? precache() : offlineStatus();
  event.waitUntil(promise.then(status => port.postMessage(status)).catch(error => {
    port.postMessage({ok:false, ready:false, error:String(error && error.message || error)});
  }));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin ||
      !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  // Solo se guardan los recursos publicos del proyecto en una lista permitida.
  const isKnown = knownFile(url.href);
  const isNavigation = request.mode === 'navigate';
  if (!isKnown && !isNavigation) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, {ignoreSearch:true});
    if (cached) {
      // Respuesta inmediata incluso con Wi-Fi desconectado. Se actualiza en segundo plano.
      event.waitUntil(fetch(request).then(response => {
        if (response.ok && isKnown) return cache.put(new Request(url.origin + url.pathname), response.clone());
      }).catch(() => {}));
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && isKnown) {
        event.waitUntil(cache.put(new Request(url.origin + url.pathname), response.clone()));
      }
      return response;
    } catch (_) {
      if (isNavigation) {
        // Nunca redirigir paginas de documentacion a un TXT arbitrario.
        if (url.pathname.endsWith('/docs/') || url.pathname.endsWith('/docs/index.html')) {
          const docs = await cache.match(new URL('./docs/index.html', self.registration.scope).href);
          if (docs) return docs;
        }
        const shell = await cache.match(new URL('./index.html', self.registration.scope).href);
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
