const CACHE_NAME = 'workout-tracker-v564';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './css/variables.css',
    './css/base.css',
    './css/auth.css',
    './css/week-view.css',
    './css/day-view.css',
    './css/settings.css',
    './css/components.css',
    './css/timer.css',
    './css/builder.css',
    './css/celebration.css',
    './css/social.css',
    './css/chat.css',
    './css/animations.css',
    './js/main.js',
    './js/app.js',
    './js/data.js',
    './js/mikhail_data.js',
    './js/mikhail2_data.js',
    './js/users.js',
    './js/exercises_db.js',
    './js/builder.js',
    './js/celebration.js',
    './js/cropper.js',
    './js/pull-refresh.js',
    './js/scroll-lock.js',
    './js/supabase-sync.js',
    './js/storage.js',
    './js/migrations.js',
    './js/social.js',
    './js/social-ui.js',
    './js/swipe-nav.js',
    './js/workout-timer.js',
    './js/workout-ui.js',
    './js/equipment-manager.js',
    './js/message-notifications.js',
    './js/profile-manager.js',
    './js/ui.js',
    './js/timer.js',
    './js/data-attrs.js',
    './js/utils.js',
    './js/app-state.js',
    './js/program-utils.js',
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
        if (_timerTimeout) clearTimeout(_timerTimeout);
        if (_timerResolve) { _timerResolve(); _timerResolve = null; }

        event.waitUntil(new Promise(resolve => {
            _timerResolve = resolve;
            _timerTimeout = setTimeout(() => {
                _timerTimeout = null;
                _timerResolve = null;
                // Only show push notification if no visible client (app in background)
                self.clients.matchAll({ type: 'window', includeUncontrolled: false }).then(windowClients => {
                    const hasVisible = windowClients.some(c => c.visibilityState === 'visible');
                    if (!hasVisible) {
                        return self.registration.showNotification('Пора!', {
                            body: 'Отдых завершён',
                            icon: './icons/icon-192.png',
                            tag: 'rest-timer',
                            renotify: true,
                            vibrate: [200, 80, 200, 80, 400]
                        });
                    }
                }).then(resolve).catch(resolve);
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
            })
        );
    }

    if (type === 'SHOW_MSG_NOTIFICATION') {
        event.waitUntil(
            self.registration.showNotification(event.data.title || 'Новое сообщение', {
                body: event.data.body || 'Вам написали',
                icon: './icons/icon-192.png',
                tag: 'new-message',
                renotify: true,
                vibrate: [200, 80, 200]
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
    var url = event.notification.tag === 'new-message' ? '/#/messages' : '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(list => {
            if (list.length > 0) {
                list[0].focus();
                if (event.notification.tag === 'new-message') {
                    list[0].postMessage({ type: 'OPEN_MESSAGES' });
                }
                return;
            }
            return clients.openWindow(url);
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
