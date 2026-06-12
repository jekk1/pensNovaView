const CACHE_NAME = 'pensnova-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Push notification handler (aktif setelah backend dikonfigurasi)
self.addEventListener('push', (event) => {
    if (! event.data) return;
    try {
        const payload = event.data.json();
        const title = payload.title || 'PENSNOVA';
        const options = {
            body: payload.body || '',
            icon: '/images/pensnova-logo.png',
            badge: '/images/pensnova-logo.png',
            tag: payload.tag || 'pensnova',
            data: payload.url || '/',
            vibrate: [200, 100, 200],
            requireInteraction: true,
        };
        event.waitUntil(self.registration.showNotification(title, options));
    } catch {
        // Fallback: plain text
        event.waitUntil(
            self.registration.showNotification('PENSNOVA', {
                body: event.data.text(),
                icon: '/images/pensnova-logo.png',
            })
        );
    }
});

// Click notification → buka URL terkait
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(url);
        })
    );
});
