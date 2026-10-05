const CACHE = 'salat-reminder-v2';
const ASSETS = ['/', '/styles.css', '/app.js', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(r => r || caches.match('/'))));
});

self.addEventListener('push', (event) => {
  let data = { title: '⏰ حان وقت الصلاة', body: 'افتح التطبيق لمعرفة الصلاة الحالية', url: '/' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'prayer-time',
    renotify: true,
    requireInteraction: true,
    vibrate: [600, 250, 600, 250, 900],
    data: { url: data.url || '/', prayer: data.prayer },
    actions: [{ action: 'open', title: 'فتح المنبّه' }]
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const prayer = event.notification.data?.prayer || '';
  const baseUrl = event.notification.data?.url || '/';
  const target = new URL(baseUrl, self.location.origin);
  if (prayer) target.searchParams.set('alarm', prayer);
  target.searchParams.set('from', 'notification');
  target.searchParams.set('ts', Date.now().toString());

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        try {
          client.postMessage({ type: 'OPEN_PRAYER_ALARM', prayer });
          await client.navigate(target.href);
        } catch (_) {}
        return client.focus();
      }
    }
    return clients.openWindow(target.href);
  })());
});
