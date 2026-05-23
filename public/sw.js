// ── Monlingo Service Worker ──────────────────────────────────────────────────
const CACHE = 'monlingo-v2'
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon.svg']

// ── Instalação: pré-carrega assets estáticos ──────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
  self.skipWaiting()
})

// ── Ativação: limpa caches antigos ────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: cache-first para estáticos, network-first para API ────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  // Não intercepta Firebase, APIs externas, ou chamadas POST
  if (
    e.request.method !== 'GET' ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.pathname.startsWith('/api/')
  ) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => cached)
      return cached ?? network
    })
  )
})

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Monlingo 🇫🇷', {
      body:    data.body  ?? 'Não perca sua sequência! Estude francês hoje.',
      icon:    '/icon.svg',
      badge:   '/icon.svg',
      tag:     'streak-reminder',
      renotify: false,
      data:    { url: '/' },
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(clients.openWindow(e.notification.data?.url ?? '/'))
})
