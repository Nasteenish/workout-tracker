/* ===== Global Message Notifications ===== */
import { Social } from './social.js';
import { SocialUI } from './social-ui.js';
import { esc } from './utils.js';

export const MessageNotifications = {
    _pollTimer: null,
    _lastKnownCount: 0,

    init() {
        if (!Social) return;
        var self = this;
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        Social.subscribeToGlobalMessages(function(msg) {
            if (SocialUI._chatConvId === msg.conversation_id) return;
            self._onNewMessage(msg.text);
        });
        Promise.all([
            Social.getUnreadMessageCount(),
            Social.getUnreadNotificationCount()
        ]).then(function(r) {
            self._lastKnownCount = r[0] || 0;
            SocialUI._tabBarMsgCount = r[0] || 0;
            SocialUI._tabBarNotifCount = r[1] || 0;
            SocialUI._updateTabBadge();
        }).catch(function() {});
        this._pollTimer = setInterval(function() {
            Promise.all([
                Social.getUnreadMessageCount(),
                Social.getUnreadNotificationCount()
            ]).then(function(r) {
                var count = r[0] || 0;
                var notifCount = r[1] || 0;
                if (count > self._lastKnownCount) {
                    self._onNewMessage(null);
                }
                self._lastKnownCount = count;
                SocialUI._tabBarMsgCount = count;
                SocialUI._tabBarNotifCount = notifCount;
                SocialUI._updateTabBadge();
                if (count > 0) {
                    document.querySelectorAll('.msg-badge').forEach(function(el) { el.textContent = count; });
                    if (!document.querySelector('.msg-badge')) {
                        document.querySelectorAll('#btn-messages').forEach(function(btn) {
                            var span = document.createElement('span');
                            span.className = 'msg-badge';
                            span.textContent = count;
                            btn.appendChild(span);
                        });
                    }
                } else {
                    document.querySelectorAll('.msg-badge').forEach(function(el) { el.remove(); });
                }
            }).catch(function() {});
        }, 15000);
        if (navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('message', function(e) {
                if (e.data && e.data.type === 'OPEN_MESSAGES') {
                    location.hash = '#/messages';
                }
            });
        }
    },

    _onNewMessage(text) {
        SocialUI._tabBarMsgCount = (SocialUI._tabBarMsgCount || 0) + 1;
        var count = SocialUI._tabBarMsgCount;
        this._lastKnownCount = count;
        SocialUI._updateTabBadge();
        document.querySelectorAll('.msg-badge').forEach(function(el) { el.textContent = count; });
        if (!document.querySelector('.msg-badge')) {
            document.querySelectorAll('#btn-messages').forEach(function(btn) {
                var span = document.createElement('span');
                span.className = 'msg-badge';
                span.textContent = count;
                btn.appendChild(span);
            });
        }
        var preview = text ? text.substring(0, 100) : 'Вам написали';
        if (document.visibilityState === 'visible') {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            var toast = document.createElement('div');
            toast.className = 'msg-toast';
            toast.innerHTML = '<b>Новое сообщение</b><br>' + esc(preview);
            toast.onclick = function() { toast.remove(); location.hash = '#/messages'; };
            document.body.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 4000);
        } else if (navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(function(reg) {
                if (reg.active) {
                    reg.active.postMessage({ type: 'SHOW_MSG_NOTIFICATION', title: 'Новое сообщение', body: preview });
                }
            });
        }
    }
};
