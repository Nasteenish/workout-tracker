const CACHE_NAME = 'workout-tracker-v160';
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

// Helper: report back to page for diagnostics
function diagReport(msg) {
    self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'DIAG', msg: msg }));
    });
}

// ===== Rest Timer Background Notification =====
let _timerTimeout = null;
let _timerResolve = null;

self.addEventListener('message', event => {
    const { type, duration } = event.data || {};

    diagReport('SW got: ' + type);

    if (type === 'START_TIMER') {
        if (_timerTimeout) clearTimeout(_timerTimeout);
        if (_timerResolve) { _timerResolve(); _timerResolve = null; }

        event.waitUntil(new Promise(resolve => {
            _timerResolve = resolve;
            _timerTimeout = setTimeout(() => {
                _timerTimeout = null;
                _timerResolve = null;
                diagReport('SW timer fired, calling showNotification...');
                self.registration.showNotification('Пора!', {
                    body: 'Отдых завершён',
                    icon: './icons/icon-192.png',
                    tag: 'rest-timer',
                    renotify: true,
                    vibrate: [200, 80, 200, 80, 400]
                }).then(() => {
                    diagReport('showNotification OK (timer)');
                    resolve();
                }).catch(err => {
                    diagReport('showNotification ERROR (timer): ' + err.message);
                    resolve();
                });
            }, duration);
        }));
    }

    if (type === 'SHOW_NOTIFICATION') {
        event.waitUntil(
            self.registration.showNotification('Пора!', {
                body: 'Отдых завершён',
                icon: './icons/icon-192.png',
                tag: 'rest-timer',
                renotify: true,
                vibrate: [200, 80, 200, 80, 400]
            }).then(() => {
                diagReport('showNotification OK (SHOW)');
            }).catch(err => {
                diagReport('showNotification ERROR (SHOW): ' + err.message);
            })
        );
    }

    if (type === 'TEST_NOTIFICATION') {
        event.waitUntil(
            self.registration.showNotification('Тест!', {
                body: 'SW уведомление работает',
                icon: './icons/icon-192.png',
                tag: 'test-notif'
            }).then(() => {
                diagReport('showNotification OK (TEST)');
            }).catch(err => {
                diagReport('showNotification ERROR (TEST): ' + err.message);
            })
        );
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
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
