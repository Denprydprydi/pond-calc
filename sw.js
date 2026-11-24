const cachePrefix = 'pond-calc:' + self.registration.scope + ':'
const cacheName = cachePrefix + 'v1'
const appFiles = [
  './', './index.html', './manifest.json',
  './icon-180.png', './icon-192.png', './icon-512.png'
].map(path => new URL(path, self.registration.scope).href)

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(appFiles)))
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName)
      return cache.match(appFiles[0])
    }))
  } else if (appFiles.includes(request.url)) {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName)
      return cache.match(request)
    }))
  }
})
