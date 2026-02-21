const CACHE_NAME = 'workout-tracker-v138';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/data.js',
    './js/storage.js',
    './js/ui.js',
    './js/timer.js',
    './js/utils.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ===== Rest Timer Background Notification =====
let _timerTimeout = null;
let _timerResolve = null;

self.addEventListener('message', event => {
    const { type, duration } = event.data || {};

    if (type === 'START_TIMER') {
        // Cancel previous timer
        if (_timerTimeout) clearTimeout(_timerTimeout);
        if (_timerResolve) { _timerResolve(); _timerResolve = null; }

        // waitUntil keeps the SW alive until the timer fires
        event.waitUntil(new Promise(resolve => {
            _timerResolve = resolve;
            _timerTimeout = setTimeout(() => {
                _timerTimeout = null;
                _timerResolve = null;
                self.registration.showNotification('Пора!', {
                    body: 'Отдых завершён',
                    icon: './icons/icon-192.png',
                    tag: 'rest-timer',
                    vibrate: [200, 80, 200, 80, 400]
                }).then(resolve).catch(resolve);
            }, duration);
        }));
    }

    if (type === 'STOP_TIMER') {
        if (_timerTimeout) clearTimeout(_timerTimeout);
        _timerTimeout = null;
        if (_timerResolve) { _timerResolve(); _timerResolve = null; }
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(list => {
            if (list.length > 0) return list[0].focus();
            return clients.openWindow('/');
        })
    );
});

// Network-first: always try fresh files, fall back to cache for offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Update cache with fresh response
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
