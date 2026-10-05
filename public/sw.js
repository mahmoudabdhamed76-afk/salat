const CACHE = 'salat-reminder-v8-gold';
const AUDIO_CACHE = 'salat-audio-v1';
const ASSETS = ['/', '/styles.css', '/kids.css', '/companion.css', '/motion.css', '/companion.js', '/fonts/plex-arabic-400.woff2', '/fonts/plex-arabic-500.woff2', '/fonts/plex-arabic-600.woff2', '/fonts/plex-arabic-700.woff2', '/fonts/plex-latin-400.woff2', '/fonts/plex-latin-600.woff2', '/fonts/plex-latin-700.woff2', '/utils.js', '/hadith.js', '/kids.js', '/app.js', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE && key !== AUDIO_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Network first (fresh app), but give up after a few seconds on a weak connection.
function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(request).then(res => { clearTimeout(timer); resolve(res); }, err => { clearTimeout(timer); reject(err); });
  });
}

// Adhan audio: cache first, and answer Range requests from the cached file (iOS needs 206).
async function audioResponse(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const key = new URL(request.url).pathname;
  let res = await cache.match(key);
  if (!res) {
    try {
      const full = await fetch(key);
      if (!full.ok) return full;
      await cache.put(key, full.clone());
      res = full;
    } catch {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  }
  const range = request.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const total = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  let start = m[1] ? Number(m[1]) : 0;
  let end = m[2] ? Number(m[2]) : total - 1;
  if (!m[1] && m[2]) { start = Math.max(0, total - Number(m[2])); end = total - 1; }
  end = Math.min(end, total - 1);
  if (start >= total || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(audioResponse(event.request));
    return;
  }
  event.respondWith((async () => {
    try {
      const res = await fetchWithTimeout(event.request, 4000);
      if (res.ok && url.search === '') {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return res;
    } catch {
      const cached = await caches.match(event.request, { ignoreSearch: event.request.mode === 'navigate' });
      if (cached) return cached;
      if (event.request.mode === 'navigate') return caches.match('/');
      return Response.error();
    }
  })());
});

self.addEventListener('push', (event) => {
  let data = { title: '⏰ حان وقت الصلاة', body: 'افتح التطبيق لمعرفة الصلاة الحالية', url: '/' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

  if (data.kind === 'reminder') {
    event.waitUntil(self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'prayer-reminder',
      vibrate: [200, 120, 200],
      data: { url: '/', kind: 'reminder' }
    }));
    return;
  }

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
  if (event.notification.data?.kind === 'reminder') {
    event.waitUntil((async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      const client = allClients.find(c => 'focus' in c);
      return client ? client.focus() : clients.openWindow('/');
    })());
    return;
  }
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
