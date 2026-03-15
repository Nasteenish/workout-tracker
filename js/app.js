/* ===== Application Entry Point ===== */

const App = {
    _currentWeek: 1,
    _currentDay: 1,
    _saveDebounced: null,
    _swipeDir: null,
    _workoutTimerInterval: null,
    _pendingMigration: null,
    _pendingCheckinWorkout: null,
    _croppedAvatarBlob: null,
    _pageCache: {},

    init() {
        // One-time: remove Precor Seated Leg Curl from D1E2 (test data)
        if (!localStorage.getItem('_fix_precor_d1e2')) {
            var allUsers = Storage.getUsers ? Storage.getUsers() : [];
            for (var i = 0; i < allUsers.length; i++) {
                var key = 'wt_data_' + allUsers[i].id;
                try {
                    var d = JSON.parse(localStorage.getItem(key) || '{}');
                    if (d.exerciseEquipment && d.exerciseEquipment.D1E2) {
                        var eq = d.equipment || [];
                        var eqObj = eq.find(function(e) { return e.id === d.exerciseEquipment.D1E2; });
                        if (eqObj && eqObj.name && eqObj.name.toLowerCase().indexOf('precor') !== -1) {
                            delete d.exerciseEquipment.D1E2;
                            localStorage.setItem(key, JSON.stringify(d));
                        }
                    }
                } catch(e) {}
            }
            localStorage.setItem('_fix_precor_d1e2', '1');
        }

        // Multi-user migration (once)
        Storage.migrateToMultiUser();

        // Load program for current user
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            // Check if hardcoded user needs migration to Supabase Auth
            var acct = typeof ACCOUNTS !== 'undefined' ? ACCOUNTS.find(function(a) { return a.id === currentUser.id; }) : null;
            if (acct) {
                // Sync name
                if (acct.name !== currentUser.name) {
                    var users = Storage.getUsers();
                    var u = users.find(function(x) { return x.id === currentUser.id; });
                    if (u) { u.name = acct.name; Storage._saveUsers(users); }
                }
                // Load program but redirect to migration
                this._loadProgramForUser(currentUser);
                this._pendingMigration = acct;
                location.hash = '#/migrate';
            } else {
                this._loadProgramForUser(currentUser);
                this._initSupaSync(currentUser.id);
                this._initGlobalMessageSub();
            }
        } else {
            // Legacy fallback: try loading stored program directly
            const storedProgram = Storage.getProgram();
            if (storedProgram) {
                PROGRAM = storedProgram;
            }
        }

        this._saveDebounced = debounce((week, day, exId, setIdx, field, value) => {
            Storage.updateSetValue(week, day, exId, setIdx, field, parseFloat(String(value).replace(',', '.')) || 0);
        }, 300);

        // Route handling
        window.addEventListener('hashchange', () => this.route());

        // Global event delegation
        document.getElementById('app').addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('app').addEventListener('input', (e) => this.handleInput(e));
        document.getElementById('app').addEventListener('focus', (e) => this.handleFocus(e), true);
        document.getElementById('app').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'chat-input') {
                e.preventDefault();
                var sendBtn = document.getElementById('btn-send-message');
                if (sendBtn) sendBtn.click();
            }
        });

        // File input change handlers (delegated)
        document.getElementById('app').addEventListener('change', (e) => {
            if (e.target.id === 'avatar-file-input' && e.target.files[0]) {
                var avatarFile = e.target.files[0];
                e.target.value = '';
                AvatarCropper.open(avatarFile).then(function(blob) {
                    if (!blob) return;
                    App._croppedAvatarBlob = blob;
                    var preview = document.getElementById('edit-avatar-preview');
                    if (preview) {
                        var url = URL.createObjectURL(blob);
                        if (preview.tagName === 'IMG') {
                            preview.src = url;
                        } else {
                            preview.outerHTML = '<img class="edit-avatar" id="edit-avatar-preview" src="' + url + '" alt="">';
                        }
                    }
                });
            }
            if (e.target.id === 'checkin-photo-input' && e.target.files) {
                var files = Array.from(e.target.files);
                var total = this._checkinPhotos.length + files.length;
                if (total > 3) { alert('Максимум 3 фото/видео'); return; }
                this._checkinPhotos = this._checkinPhotos.concat(files);
                var grid = document.getElementById('checkin-photos-grid');
                if (grid) {
                    files.forEach(function(f) {
                        var url = URL.createObjectURL(f);
                        var isVid = f.type && f.type.startsWith('video/');
                        var media = isVid
                            ? '<video src="' + url + '" muted playsinline style="width:100%;height:100%;object-fit:cover"></video>'
                            : '<img src="' + url + '" alt="">';
                        grid.insertAdjacentHTML('beforeend', '<div class="checkin-photo-thumb">' + media + '</div>');
                    });
                }
            }
        });

        // Swipe navigation: left/right weeks + right-swipe to go back from day view
        this._initSwipeNav();

        // Pull-to-refresh
        this._initPullToRefresh();

        // Rollback equipment from previous session if no sets were completed
        Storage.checkPendingEquipmentRollback();

        // Init rest timer
        RestTimer.init();

        // Initial route
        this.route();
    },

    // Initialize Supabase sync for supa_ users
    _initSupaSync(userId) {
        if (!userId || userId.indexOf('supa_') !== 0) return;
        if (typeof SupaSync === 'undefined') return;
        var supaUserId = localStorage.getItem('wt_supa_' + userId);
        if (!supaUserId) return;
        SupaSync._currentSupaUserId = supaUserId;
        SupaSync._currentStorageKey = 'wt_data_' + userId;
        // Background sync — re-render after merge to avoid stale UI
        var self = this;
        SupaSync.syncOnLogin(supaUserId, 'wt_data_' + userId).then(function() {
            // Rollback equipment after sync (sync may overwrite a pre-sync rollback)
            Storage.checkPendingEquipmentRollback();
            // Remove stuck Precor from D1E2/D5E6 (siblings) AFTER rollback
            try {
                Storage._invalidateCache();
                var dd = Storage._load();
                if (dd && dd.exerciseEquipment) {
                    var precorId = 'eq_1773590725238';
                    var changed = false;
                    for (var k in dd.exerciseEquipment) {
                        if (dd.exerciseEquipment[k] === precorId) {
                            delete dd.exerciseEquipment[k];
                            changed = true;
                        }
                    }
                    if (changed) {
                        Storage._save();
                        SupaSync.pushData(supaUserId, dd, '').catch(function(){});
                    }
                }
            } catch(e) {}
            self.route();
        }).catch(function(e) {
            console.error('Init sync error:', e);
        });
    },

    // Global message notifications: realtime + polling fallback
    _msgPollTimer: null,
    _lastKnownMsgCount: 0,

    _initGlobalMessageSub() {
        if (typeof Social === 'undefined') return;
        var self = this;
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        // Try Realtime subscription (instant, but may not connect)
        Social.subscribeToGlobalMessages(function(msg) {
            if (SocialUI._chatConvId === msg.conversation_id) return;
            self._onNewMessage(msg.text);
        });
        // Polling fallback — every 15s check unread count
        Social.getUnreadMessageCount().then(function(c) { self._lastKnownMsgCount = c || 0; });
        this._msgPollTimer = setInterval(function() {
            Social.getUnreadMessageCount().then(function(count) {
                count = count || 0;
                if (count > self._lastKnownMsgCount) {
                    self._onNewMessage(null);
                }
                self._lastKnownMsgCount = count;
                SocialUI._tabBarMsgCount = count;
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
        // Listen for SW notification click
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
        this._lastKnownMsgCount = count;
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
            toast.innerHTML = '<b>Новое сообщение</b><br>' + preview;
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
    },

    // Config-based swipe: add new routes in _getSwipeConfig only
    _getSwipeConfig(hash) {
        // Week carousel (horizontal left/right)
        if (/^#\/week\/\d+$/.test(hash)) return { mode: 'carousel' };
        // Back-swipe pages: { mode:'back', target, companion, dayNum?, onCommit? }
        if (/^#\/week\/\d+\/day\/\d+$/.test(hash))
            return { mode: 'back', target: '#/week/' + this._currentWeek, companion: 'week' };
        if (hash === '#/menu')
            return { mode: 'back', target: '#/week/' + this._currentWeek, companion: 'week' };
        if (hash === '#/settings' || hash === '#/guide' || hash === '#/calculator')
            return { mode: 'back', target: '#/menu', companion: 'menu', preCreate: true };
        var edMatch = hash.match(/^#\/edit\/day\/(\d+)$/);
        if (edMatch) {
            var dn = Builder._editingDay ? Builder._editingDay.dayNum : parseInt(edMatch[1]);
            return { mode: 'back', target: '#/week/' + this._currentWeek + '/day/' + dn, companion: 'day', dayNum: dn, onCommit: function() { Builder._editingDay = null; } };
        }
        if (/^#\/history\/.+$/.test(hash))
            return { mode: 'back', target: '#/week/' + this._currentWeek + '/day/' + this._currentDay, companion: 'day', dayNum: this._currentDay };
        // Social tab carousel (swipe between Лента ↔ Профиль)
        if (hash === '#/feed')
            return { mode: 'tabs', left: '#/week/' + this._currentWeek, right: '#/profile' };
        if (hash === '#/profile')
            return { mode: 'tabs', left: '#/feed', right: null };
        // Social back-swipe pages
        if (hash === '#/profile/edit')
            return { mode: 'back', target: '#/profile', companion: 'none' };
        if (hash === '#/checkin' || /^#\/checkin\/.+$/.test(hash))
            return { mode: 'back', target: '#/profile', companion: 'none' };
        if (hash === '#/discover')
            return { mode: 'back', target: '#/feed', companion: 'none' };
        if (hash === '#/notifications')
            return { mode: 'back', target: '#/feed', companion: 'none' };
        if (hash === '#/messages')
            return { mode: 'back', target: '#/feed', companion: 'none' };
        if (/^#\/messages\/.+$/.test(hash))
            return { mode: 'back', target: '#/messages', companion: 'none' };
        if (/^#\/u\/.+$/.test(hash))
            return { mode: 'back', target: '#/discover', companion: 'none' };
        if (/^#\/(followers|following)\/.+$/.test(hash))
            return { mode: 'back', target: '#/profile', companion: 'none' };
        // Onboarding back-swipe
        if (hash === '#/onboarding/2')
            return { mode: 'back', target: '#/onboarding/1', companion: 'none' };
        if (hash === '#/onboarding/3')
            return { mode: 'back', target: '#/onboarding/2', companion: 'none' };
        if (hash === '#/onboarding/3a')
            return { mode: 'back', target: '#/onboarding/2', companion: 'none' };
        if (hash === '#/onboarding/3t')
            return { mode: 'back', target: '#/onboarding/2', companion: 'none' };
        if (hash === '#/onboarding/4')
            return { mode: 'back', target: '#/onboarding/3a', companion: 'none' };
        if (hash === '#/onboarding/5')
            return { mode: 'back', target: '#/onboarding/4', companion: 'none' };
        return null;
    },

    _initSwipeNav() {
        let startX = 0, startY = 0;
        let dragging = false, locked = false;
        let swipingLeft = false;
        let companion = null;
        let isBack = false;
        let isTabSwipe = false;
        let tabTarget = null;
        let savedScrollY = 0;
        let cfg = null;

        const W = () => window.innerWidth;
        const removeCompanion = () => { if (companion) { companion.remove(); companion = null; } };
        const unlockScroll = () => { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; };
        const resetApp = (app) => {
            app.style.transition = 'none'; app.style.transform = '';
            app.style.position = ''; app.style.top = ''; app.style.left = ''; app.style.right = '';
            app.classList.remove('swiping-back');
        };

        const createCarouselCompanion = (targetWeek) => {
            const c = document.createElement('div');
            c.className = 'nav-companion';
            c.innerHTML = UI._weekCardsHTML(targetWeek);
            const container = document.querySelector('.slide-container');
            if (container) container.appendChild(c);
            return c;
        };

        const createBackCompanion = (type, dayNum, targetHash) => {
            const c = document.createElement('div');
            c.className = 'back-companion';
            if (type === 'week') c.innerHTML = UI._weekViewHTML(this._currentWeek);
            else if (type === 'menu') c.innerHTML = UI._menuHTML();
            else if (type === 'day') c.innerHTML = UI._dayViewHTML(this._currentWeek, dayNum || this._currentDay);
            else if (targetHash && this._pageCache[targetHash]) c.innerHTML = this._pageCache[targetHash];
            document.body.appendChild(c);
            return c;
        };

        document.addEventListener('touchstart', (e) => {
            // Ignore touches inside modal overlays (equipment, gym, etc.)
            if (e.target.closest('.modal-overlay')) { cfg = null; return; }
            cfg = this._getSwipeConfig(location.hash);
            if (!cfg) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dragging = false; locked = false; isBack = false; isTabSwipe = false; tabTarget = null;
            removeCompanion();
            if (cfg.preCreate) {
                companion = createBackCompanion(cfg.companion, cfg.dayNum, cfg.target);
                if (companion) companion.style.transform = `translateX(${-W()}px)`;
            }
            if (cfg.mode === 'carousel') {
                const el = document.querySelector('.week-slide');
                if (el) el.style.transition = 'none';
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!cfg) return;
            if (locked) return;
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;

            if (!dragging) {
                if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
                if (Math.abs(dy) > Math.abs(dx)) { locked = true; return; }
                if (cfg.mode === 'back' && dx < 0) { locked = true; return; }
                if (cfg.mode === 'tabs' && dx < 0 && !cfg.right) { locked = true; return; }
                if (cfg.mode === 'tabs' && dx > 0 && !cfg.left) { locked = true; return; }
                dragging = true;
                swipingLeft = dx < 0;
                savedScrollY = window.scrollY;
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';

                if (cfg.mode === 'tabs') {
                    tabTarget = swipingLeft ? cfg.right : cfg.left;
                    isTabSwipe = true;
                } else if (cfg.mode === 'carousel') {
                    const targetWeek = swipingLeft
                        ? (this._currentWeek === getTotalWeeks() ? 1 : this._currentWeek + 1)
                        : (this._currentWeek === 1 ? getTotalWeeks() : this._currentWeek - 1);
                    companion = createCarouselCompanion(targetWeek);
                    companion.style.transition = 'none';
                    companion.style.transform = `translateX(${swipingLeft ? W() : -W()}px)`;
                } else {
                    isBack = true;
                    if (!cfg.preCreate) {
                        companion = createBackCompanion(cfg.companion, cfg.dayNum, cfg.target);
                    }
                    if (companion) {
                        companion.style.transition = 'none';
                        companion.style.transform = `translateX(${-0.28 * W()}px)`;
                    }
                    const app = document.getElementById('app');
                    app.style.position = 'fixed';
                    var bodyPad = parseInt(getComputedStyle(document.body).paddingTop) || 0;
                    app.style.top = `${bodyPad - savedScrollY}px`;
                    app.style.left = '0'; app.style.right = '0';
                    app.classList.add('swiping-back');
                    app.style.transition = 'none';
                }
            }

            if (dragging) { e.preventDefault(); window.scrollTo(0, savedScrollY); }

            if (isTabSwipe) {
                // No visual drag — just track gesture
            } else if (isBack) {
                document.getElementById('app').style.transform = `translateX(${dx}px)`;
                if (companion) companion.style.transform = `translateX(${-0.28 * W() + 0.28 * dx}px)`;
            } else {
                const front = document.querySelector('.week-slide');
                if (front) front.style.transform = `translateX(${dx}px)`;
                if (companion) companion.style.transform = `translateX(${(swipingLeft ? W() : -W()) + dx}px)`;
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!cfg) return;
            if (!dragging && !isBack && !isTabSwipe) { if (companion) removeCompanion(); return; }
            const dx = e.changedTouches[0].clientX - startX;
            const snap = 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            const commit = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)';

            // === Tab swipe (feed ↔ profile): instant navigation ===
            if (isTabSwipe) {
                unlockScroll();
                if (!dragging || Math.abs(dx) < 60) return;
                location.hash = tabTarget;
                return;
            }

            // === Back-swipe ===
            if (isBack) {
                const app = document.getElementById('app');
                if (!dragging || dx < 60) {
                    app.style.transition = snap;
                    app.style.transform = 'translateX(0)';
                    if (companion) { companion.style.transition = snap; companion.style.transform = `translateX(${-0.28 * W()}px)`; }
                    setTimeout(() => { removeCompanion(); unlockScroll(); resetApp(app); window.scrollTo(0, savedScrollY); }, 230);
                    return;
                }
                app.style.transition = commit;
                app.style.transform = `translateX(${W() + 20}px)`;
                if (companion) { companion.style.transition = commit; companion.style.transform = 'translateX(0)'; }
                const target = cfg.target;
                const onCommit = cfg.onCommit;
                setTimeout(() => {
                    if (onCommit) onCommit();
                    history.replaceState(null, '', target);
                    app.classList.add('no-animate');
                    this._isBackSwipe = true;
                    this.route(true);
                    this._isBackSwipe = false;
                    resetApp(app);
                    unlockScroll();
                    removeCompanion();
                    window.scrollTo(0, 0);
                }, 270);
                return;
            }

            // === Week carousel ===
            const front = document.querySelector('.week-slide');
            if (!dragging || Math.abs(dx) < 60) {
                if (front) { front.style.transition = snap; front.style.transform = 'translateX(0)'; }
                if (companion) {
                    companion.style.transition = snap;
                    companion.style.transform = `translateX(${swipingLeft ? W() : -W()}px)`;
                    setTimeout(() => { removeCompanion(); unlockScroll(); }, 230);
                }
                unlockScroll();
                return;
            }
            if (front) { front.style.transition = commit; front.style.transform = `translateX(${swipingLeft ? '-110%' : '110%'})`; }
            if (companion) { companion.style.transition = commit; companion.style.transform = 'translateX(0)'; }
            const next = swipingLeft
                ? (this._currentWeek === getTotalWeeks() ? 1 : this._currentWeek + 1)
                : (this._currentWeek === 1 ? getTotalWeeks() : this._currentWeek - 1);
            setTimeout(() => { unlockScroll(); location.hash = `#/week/${next}`; requestAnimationFrame(removeCompanion); }, 190);
        }, { passive: true });
    },

    _initPullToRefresh() {
        let startY = 0;
        let pulling = false;
        let ready = false;
        const threshold = 80;
        let indicator = null;

        const DUMBBELL_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="1" y="9" width="3" height="6" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="7" width="3" height="10" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="7" width="3" height="10" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="20" y="9" width="3" height="6" rx="1" stroke="currentColor" stroke-width="1.8"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

        let active = false;
        let bottomActive = false;
        let pullLocked = false;
        let startX_pull = 0;
        const app = document.getElementById('app');

        const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

        const snapBack = (fromY) => {
            if (Math.abs(fromY) < 1) { app.style.transition = ''; app.style.transform = ''; return; }

            // Nudge scroll to 1px so iOS Safari doesn't engage native top-bounce
            if (fromY > 0 && window.scrollY < 1) window.scrollTo(0, 1);

            app.style.transition = 'none';
            const t0 = performance.now();
            const dur = 500;
            const tick = (now) => {
                const p = Math.min((now - t0) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const y = fromY * (1 - ease);
                if (p < 1 && Math.abs(y) > 0.3) {
                    app.style.transform = `translateY(${y.toFixed(1)}px)`;
                    requestAnimationFrame(tick);
                } else {
                    app.style.transition = '';
                    app.style.transform = '';
                }
            };
            requestAnimationFrame(tick);
        };

        document.addEventListener('touchstart', (e) => {
            // Ignore touches during slot drag-and-drop
            if (window._slotDragging) {
                pullLocked = true;
                return;
            }
            // Ignore touches inside modal overlays
            if (e.target.closest('.modal-overlay')) {
                pullLocked = true;
                return;
            }
            // Ignore touches on the rest timer bar
            const timerBar = document.getElementById('rest-timer-bar');
            if (timerBar && (timerBar === e.target || timerBar.contains(e.target))) {
                pullLocked = true;
                return;
            }
            startY = e.touches[0].clientY;
            startX_pull = e.touches[0].clientX;
            pulling = window.scrollY <= 2;
            pullLocked = false;
            ready = false;
            active = false;
            bottomActive = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (pullLocked || window._slotDragging) return;
            if (!pulling && !atBottom()) return;
            const dy = e.touches[0].clientY - startY;
            const dx = e.touches[0].clientX - startX_pull;

            // Direction lock: if horizontal, stop pull handling
            if (!active && !bottomActive && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
                pullLocked = true;
                pulling = false;
                return;
            }

            // Pull down from top
            if (pulling) {
                if (window.scrollY > 2) { pulling = false; active = false; return; }
                if (dy > 10) {
                    e.preventDefault();
                    if (!app.classList.contains('swiping-back')) {
                        if (!active) { active = true; app.style.transition = 'none'; }
                        app.style.transform = `translateY(${Math.min((dy - 10) * 0.35, 55)}px)`;
                    }
                    if (!indicator) {
                        indicator = document.createElement('div');
                        indicator.id = 'pull-indicator';
                        indicator.innerHTML = DUMBBELL_SVG;
                        document.body.appendChild(indicator);
                    }
                    if (ready) return;
                    const progress = Math.min(dy / threshold, 1);
                    indicator.style.opacity = progress;
                    indicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg)`;
                    if (progress >= 1) {
                        ready = true;
                        indicator.style.transform = '';
                        indicator.classList.add('spinning');
                    }
                }
            }

            // Pull up from bottom
            if (atBottom() && dy < -10 && !active) {
                e.preventDefault();
                if (!app.classList.contains('swiping-back')) {
                    if (!bottomActive) { bottomActive = true; app.style.transition = 'none'; }
                    app.style.transform = `translateY(${Math.max((dy + 10) * 0.35, -55)}px)`;
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            // Snap back from bottom pull
            if (bottomActive) {
                const m = app.style.transform.match(/translateY\((.+?)px\)/);
                if (m) snapBack(parseFloat(m[1]));
            }

            // Pull-to-refresh triggered: CSS snap-back then re-render
            if (indicator && ready) {
                var indRef = indicator;
                setTimeout(function() { indRef.remove(); }, 500);
                indicator = null;
                // CSS transition snap (smoother than rAF when followed by DOM update)
                app.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                app.style.transform = 'translateY(0)';
                // Re-render AFTER snap completes to avoid jank
                setTimeout(function() {
                    app.style.transition = '';
                    app.style.transform = '';
                    app.classList.add('no-animate');
                    App.route(true);
                }, 260);
                pulling = false; ready = false; active = false; bottomActive = false;
                return;
            }

            // Snap back from top pull (no refresh)
            if (active) {
                const m = app.style.transform.match(/translateY\((.+?)px\)/);
                if (m) snapBack(parseFloat(m[1]));
            }
            if (indicator) {
                const cur = indicator.style.transform || 'translateX(-50%)';
                indicator.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                indicator.style.opacity = '0';
                indicator.style.transform = cur + ' scale(0.5)';
                const ref = indicator;
                setTimeout(() => { ref.remove(); }, 310);
                indicator = null;
            }
            pulling = false;
            ready = false;
            active = false;
            bottomActive = false;
        });
    },

    _addWeekToCustomProgram() {
        if (!PROGRAM) return;
        if (PROGRAM.totalWeeks >= 16) {
            alert('Максимум 16 недель');
            return;
        }
        if (!confirm(`Добавить неделю ${PROGRAM.totalWeeks + 1}?`)) return;
        PROGRAM.totalWeeks = (PROGRAM.totalWeeks || 1) + 1;
        Storage.saveProgram(PROGRAM, false);
        location.hash = `#/week/${PROGRAM.totalWeeks}`;
    },

    _removeWeekFromCustomProgram() {
        if (!PROGRAM || PROGRAM.totalWeeks <= 1) return;
        if (!confirm(`Удалить неделю ${PROGRAM.totalWeeks}? Данные этой недели будут потеряны.`)) return;
        var removedWeek = PROGRAM.totalWeeks;
        PROGRAM.totalWeeks -= 1;
        Storage.saveProgram(PROGRAM, false);
        Storage.clearWeekLog(removedWeek);
        location.hash = `#/week/${PROGRAM.totalWeeks}`;
    },

    _handleEditorBack() {
        var app = document.getElementById('app');
        app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
        app.style.transform = 'translateX(40px)';
        app.style.opacity = '0';
        var dayNum = Builder._editingDay ? Builder._editingDay.dayNum : App._currentDay;
        var weekNum = App._currentWeek;
        setTimeout(function() {
            app.style.transition = 'none';
            app.style.transform = '';
            app.style.opacity = '';
            window.scrollTo(0, 0);
            Builder._editingDay = null;
            if (Storage.isSetup()) {
                var target = '#/week/' + weekNum + '/day/' + dayNum;
                if (location.hash === target) {
                    App.route();
                } else {
                    location.hash = target;
                }
            } else {
                location.hash = '#/setup';
            }
        }, 190);
    },

    _addDayToCustomProgram() {
        if (!PROGRAM) return;
        var numDays = getTotalDays();
        if (numDays >= 7) {
            alert('Все 7 дней заняты тренировками');
            return;
        }
        if (!confirm('Убрать день отдыха и добавить тренировку?')) return;
        var newDayNum = numDays + 1;
        PROGRAM.dayTemplates[newDayNum] = {
            title: 'Day ' + newDayNum,
            titleRu: 'День ' + newDayNum,
            exerciseGroups: []
        };
        // Regenerate slots for new day count (always 7 total)
        var slots = UI._generateDefaultSlots(newDayNum, 7);
        Storage.saveWeekSlots(slots);
        Storage.saveProgram(PROGRAM, false);
        UI.renderWeek(this._currentWeek);
    },

    _removeDayFromCustomProgram() {
        if (!PROGRAM) return;
        var numDays = getTotalDays();
        if (numDays <= 1) return;
        if (!confirm('Удалить день ' + numDays + '? На его место встанет день отдыха.')) return;
        delete PROGRAM.dayTemplates[numDays];
        // Regenerate slots for new day count (always 7 total)
        var slots = UI._generateDefaultSlots(numDays - 1, 7);
        Storage.saveWeekSlots(slots);
        Storage.saveProgram(PROGRAM, false);
        UI.renderWeek(this._currentWeek);
    },

    _loadProgramForUser(user) {
        var storedProgram = Storage.getProgram();
        if (storedProgram) {
            PROGRAM = storedProgram;
            // Migrate to custom if not yet migrated
            if (!PROGRAM.isCustom) {
                PROGRAM.isCustom = true;
                Storage.saveProgram(PROGRAM, false);
            }
            // No longer auto-update from built-in — program is user's own
        } else {
            // No stored program — load from built-in template
            var builtin = BUILTIN_PROGRAMS[user.programId];
            if (builtin) {
                PROGRAM = JSON.parse(JSON.stringify(builtin.getProgram()));
                PROGRAM.isCustom = true;
                if (PROGRAM) Storage.saveProgram(PROGRAM, false);
            }
        }
    },

    switchUser(userId, pushHistory) {
        Storage.setCurrentUser(userId);
        PROGRAM = null;
        var user = Storage.getCurrentUser();
        if (user) this._loadProgramForUser(user);
        if (pushHistory) {
            location.hash = '';
        } else {
            history.replaceState(null, '', window.location.pathname);
        }
        this.route();
    },

    login(loginStr, passwordStr) {
        // 1. Try hardcoded ACCOUNTS → redirect to migration
        var account = ACCOUNTS.find(function(a) {
            return a.login === loginStr && a.password === passwordStr;
        });
        if (account) {
            // Check if already migrated
            var migratedTo = localStorage.getItem('wt_migrated_' + account.id);
            if (migratedTo) {
                return 'migrated'; // Tell caller to show "use email" message
            }
            // Ensure user profile exists (for data copy)
            var users = Storage.getUsers();
            var existing = users.find(function(u) { return u.id === account.id; });
            if (!existing) {
                Storage.createUser(account.id, account.name, account.programId);
            }
            // Redirect to migration screen
            this._pendingMigration = account;
            location.hash = '#/migrate';
            return true;
        }

        // 2. Try local self-registered users (by login or email)
        var selfUser = Storage.loginSelfRegistered(loginStr, passwordStr);
        if (selfUser) {
            this.switchUser(selfUser.id);
            this._initSupaSync(selfUser.id);
            return true;
        }

        return false;
    },

    // Async login via Supabase (for email+password)
    loginSupabase(email, password) {
        var self = this;
        var errEl = document.getElementById('login-error');
        var btn = document.getElementById('login-submit');
        if (btn) { btn.disabled = true; btn.textContent = 'ВХОД...'; }

        return SupaSync.signIn(email, password).then(function(data) {
            if (!data || !data.user) throw new Error('Ошибка входа');
            var supaUserId = data.user.id;
            var localId = 'supa_' + supaUserId;

            // Check if local profile exists
            var users = Storage.getUsers();
            var existing = users.find(function(u) { return u.id === localId; });
            if (!existing) {
                var login = data.user.user_metadata && data.user.user_metadata.login || email.split('@')[0];
                Storage.createSelfRegisteredUser(login, login, '', email, localId);
                localStorage.setItem('wt_supa_' + localId, supaUserId);
            }

            // Set up sync
            SupaSync._currentSupaUserId = supaUserId;
            SupaSync._currentStorageKey = 'wt_data_' + localId;

            self.switchUser(localId);

            // Sync data from cloud
            SupaSync.syncOnLogin(supaUserId, 'wt_data_' + localId).then(function() {
                // Reload data after sync
                Storage._invalidateCache();
                var user = Storage.getCurrentUser();
                if (user) self._loadProgramForUser(user);
                self.route();
            }).catch(function() {});

            return true;
        }).catch(function(err) {
            if (errEl) {
                errEl.textContent = err.message || 'Неверный email или пароль';
                errEl.style.display = 'block';
            }
            if (btn) { btn.disabled = false; btn.textContent = 'ВОЙТИ'; }
            return false;
        });
    },

    logout() {
        Storage.logout();
        PROGRAM = null;
        this._pendingMigration = null;
        location.hash = '#/login';
    },

    // Migrate hardcoded account to Supabase Auth
    _handleMigration() {
        var account = this._pendingMigration;
        if (!account) return;

        var email = (document.getElementById('migrate-email').value || '').trim().toLowerCase();
        var password = (document.getElementById('migrate-password').value || '').trim();
        var errEl = document.getElementById('migrate-error');
        var btn = document.getElementById('migrate-submit');

        if (!email || !email.includes('@')) {
            errEl.textContent = 'Введите корректный email';
            errEl.style.display = 'block';
            return;
        }
        if (password.length < 6) {
            errEl.textContent = 'Пароль минимум 6 символов';
            errEl.style.display = 'block';
            return;
        }

        if (btn) { btn.disabled = true; btn.textContent = 'ОБНОВЛЕНИЕ...'; }
        errEl.style.display = 'none';

        var self = this;
        SupaSync.signUp(email, password, account.login).then(function(data) {
            if (!data || !data.user) throw new Error('Не удалось создать аккаунт');

            var supaUserId = data.user.id;
            var newLocalId = 'supa_' + supaUserId;

            // 1. Copy workout data from old key to new key
            var oldData = localStorage.getItem('wt_data_' + account.id);
            if (oldData) {
                localStorage.setItem('wt_data_' + newLocalId, oldData);
            }

            // 2. Create new user profile
            Storage.createSelfRegisteredUser(account.name, account.login, '', email, newLocalId);

            // 3. Store Supabase mapping
            localStorage.setItem('wt_supa_' + newLocalId, supaUserId);

            // 4. Mark old account as migrated
            localStorage.setItem('wt_migrated_' + account.id, newLocalId);

            // 5. Set up sync
            SupaSync._currentSupaUserId = supaUserId;
            SupaSync._currentStorageKey = 'wt_data_' + newLocalId;

            // 6. Switch to new user
            self._pendingMigration = null;
            self.switchUser(newLocalId);

            // 7. Auto-create social profile so user appears in discover
            try {
                Social.upsertProfile({ username: account.login, display_name: account.name }).catch(function() {});
            } catch (e) {}

            // 8. Push data to cloud (backup)
            if (oldData) {
                try {
                    SupaSync.pushData(supaUserId, JSON.parse(oldData), account.login).catch(function() {});
                } catch (e) {}
            }
        }).catch(function(err) {
            errEl.textContent = err.message || 'Ошибка обновления';
            errEl.style.display = 'block';
            if (btn) { btn.disabled = false; btn.textContent = 'ОБНОВИТЬ'; }
        });
    },

    // ===== SOCIAL METHODS =====

    _saveProfile() {
        var btn = document.getElementById('btn-profile-save');
        if (btn) { btn.disabled = true; btn.textContent = 'Сохранение...'; }

        var data = {
            display_name: (document.getElementById('edit-display-name').value || '').trim(),
            username: (document.getElementById('edit-username').value || '').trim().toLowerCase(),
            bio: (document.getElementById('edit-bio').value || '').trim(),
            gender: document.getElementById('edit-gender') ? document.getElementById('edit-gender').value : '',
            is_athlete: document.getElementById('edit-is-athlete').checked,
            is_pro: document.getElementById('edit-is-pro') ? document.getElementById('edit-is-pro').checked : false,
            category: document.getElementById('edit-category') ? document.getElementById('edit-category').value : '',
            coach: document.getElementById('edit-coach') ? document.getElementById('edit-coach').value.trim() : '',
            phase: document.getElementById('edit-phase') ? document.getElementById('edit-phase').value : ''
        };

        if (!data.username || data.username.length < 2) {
            alert('Username минимум 2 символа');
            if (btn) { btn.disabled = false; btn.textContent = 'Сохранить'; }
            return;
        }

        // Upload avatar if cropped
        var avatarPromise = App._croppedAvatarBlob
            ? Social.uploadAvatar(App._croppedAvatarBlob)
            : Promise.resolve(null);

        avatarPromise.then(function(avatarUrl) {
            if (avatarUrl) data.avatar_url = avatarUrl;
            App._croppedAvatarBlob = null;
            return Social.upsertProfile(data);
        }).then(function() {
            location.hash = '#/profile';
        }).catch(function(err) {
            alert(err.message || 'Ошибка сохранения');
            if (btn) { btn.disabled = false; btn.textContent = 'Сохранить'; }
        });
    },

    _checkinPhotos: [],

    _submitCheckin() {
        var btn = document.getElementById('btn-checkin-submit');
        var errEl = document.getElementById('checkin-error');
        if (btn) { btn.disabled = true; btn.textContent = 'ПУБЛИКАЦИЯ...'; }
        if (errEl) errEl.style.display = 'none';

        // Photo required
        if (!this._checkinPhotos || this._checkinPhotos.length === 0) {
            if (errEl) { errEl.textContent = 'Добавьте хотя бы одно фото или видео'; errEl.style.display = 'block'; }
            if (btn) { btn.disabled = false; btn.textContent = 'ОПУБЛИКОВАТЬ'; }
            return;
        }

        var weightEl = document.getElementById('checkin-weight');
        var weight = weightEl ? (parseFloat(weightEl.value) || null) : null;
        var note = (document.getElementById('checkin-note').value || '').trim();
        var measurements = {};

        var workoutDataEl = document.getElementById('checkin-workout-data');
        var workoutSummary = null;
        if (workoutDataEl) {
            try { workoutSummary = JSON.parse(workoutDataEl.value); } catch (e) {}
        }

        // Upload photos first
        var photoPromises = this._checkinPhotos.map(function(file) {
            return Social.uploadCheckinPhoto(file);
        });

        var self = this;
        Promise.all(photoPromises).then(function(photoUrls) {
            var data = {
                weight: weight,
                note: note,
                measurements: Object.keys(measurements).length > 0 ? measurements : {},
                photos: photoUrls.filter(Boolean),
                workout_summary: workoutSummary
            };
            return Social.createCheckin(data);
        }).then(function(checkin) {
            // Tag users if any
            var taggedUsers = self._checkinTaggedUsers || [];
            if (taggedUsers.length && checkin && checkin.id) {
                var tagIds = taggedUsers.map(function(u) { return u.user_id; });
                Social.tagUsers(checkin.id, tagIds).catch(function() {});
            }
            self._checkinPhotos = [];
            self._checkinTaggedUsers = [];
            location.hash = '#/profile';
        }).catch(function(err) {
            if (errEl) { errEl.textContent = err.message || 'Ошибка публикации'; errEl.style.display = 'block'; }
            if (btn) { btn.disabled = false; btn.textContent = 'ОПУБЛИКОВАТЬ'; }
        });
    },

    _showNotificationPrompt() {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'default') return;
        if (localStorage.getItem('_wt_notif_asked')) return;

        // Show once per device
        localStorage.setItem('_wt_notif_asked', '1');

        var overlay = document.createElement('div');
        overlay.className = 'notif-prompt-overlay';
        overlay.innerHTML =
            '<div class="notif-prompt">' +
                '<div class="notif-prompt-icon"><svg viewBox="0 0 36 36" fill="white"><path d="M18 3a2 2 0 0 0-2 2v1.07A9 9 0 0 0 9 15v6.5L6.5 25a1 1 0 0 0 .5 1.5h10a3 3 0 0 0 6 0h10a1 1 0 0 0 .5-1.5L31 21.5V15a9 9 0 0 0-7-8.93V5a2 2 0 0 0-2-2h-4zm0 30a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z"/></svg></div>' +
                '<div class="notif-prompt-title">Включить уведомления?</div>' +
                '<div class="notif-prompt-text">Вы получите сигнал когда отдых между подходами закончится</div>' +
                '<button class="btn-primary" id="notif-allow">Разрешить</button>' +
                '<button class="notif-skip" id="notif-skip">Не сейчас</button>' +
            '</div>';
        document.body.appendChild(overlay);

        requestAnimationFrame(function() {
            overlay.classList.add('visible');
        });

        var dismiss = function() {
            overlay.classList.remove('visible');
            setTimeout(function() { overlay.remove(); }, 300);
        };

        document.getElementById('notif-allow').addEventListener('click', function() {
            Notification.requestPermission();
            dismiss();
        });
        document.getElementById('notif-skip').addEventListener('click', dismiss);
    },

    startSetup() {
        const cycleBtn = document.querySelector('.cycle-toggle button.active');
        const cycleType = cycleBtn ? parseInt(cycleBtn.dataset.cycle) : 7;
        const dateInput = document.getElementById('start-date');
        const startDate = dateInput ? dateInput.value : formatDateISO(new Date());
        Storage.saveSettings({ cycleType, startDate });
        location.hash = '#/week/1';
    },

    importProgram(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const error = validateProgram(data);
                    if (error) { reject(error); return; }
                    const hadProgram = PROGRAM !== null;
                    Storage.saveProgram(data, hadProgram);
                    PROGRAM = data;
                    resolve();
                } catch (err) {
                    reject('Неверный JSON файл');
                }
            };
            reader.onerror = () => reject('Ошибка чтения файла');
            reader.readAsText(file);
        });
    },

    route(skipAnimation) {
        // Cache current page HTML before navigating away
        var prevHash = this._lastRouteHash || '';
        if (prevHash) {
            var appEl = document.getElementById('app');
            if (appEl && appEl.innerHTML) this._pageCache[prevHash] = appEl.innerHTML;
        }
        if (!skipAnimation) document.getElementById('app').classList.remove('no-animate');
        window.scrollTo(0, 0);
        const hash = location.hash || '';
        this._lastRouteHash = hash;
        // Clear checkin workout data when leaving checkin page
        if (hash !== '#/checkin') this._activeCheckinWorkout = null;

        // Login screen
        if (hash === '#/login') {
            UI.renderLogin();
            return;
        }

        // Registration screen
        if (hash === '#/register') {
            Builder.renderRegister();
            return;
        }

        // Migration screen (hardcoded → Supabase)
        if (hash === '#/migrate') {
            if (this._pendingMigration) {
                Builder.renderMigration(this._pendingMigration);
            } else {
                location.hash = '#/login';
            }
            return;
        }

        // Onboarding screens
        if (hash.startsWith('#/onboarding/')) {
            var step = hash.split('/')[2];
            if (step === '1') { Builder.renderOnboarding1(); return; }
            if (step === '2') { Builder.renderOnboarding2(); return; }
            if (step === '3') { Builder.renderOnboarding3casual(); return; }
            if (step === '3a') { Builder.renderOnboarding3athlete(); return; }
            if (step === '3t') { Builder.renderOnboarding3trainer(); return; }
            if (step === '4') { Builder.renderOnboarding4(); return; }
            if (step === '5') { Builder.renderOnboarding5(); return; }
        }

        // If no current user → login (replace, keep history clean)
        if (!Storage.getCurrentUserId()) {
            history.replaceState(null, '', '#/login');
            UI.renderLogin();
            return;
        }

        // Check if onboarding needed (gender not set)
        if (!this._onboardingChecked && Social._hasSupaAuth()) {
            this._onboardingChecked = true;
            var self = this;
            Social.getMyProfile().then(function(p) {
                if (p && !p.gender && !location.hash.startsWith('#/onboarding')) {
                    Builder._onboardingData = Builder._onboardingData || {};
                    history.replaceState(null, '', '#/onboarding/1');
                    self.route();
                }
            }).catch(function() {});
        }

        // Social routes (need user, no program required)
        var _bs = this._isBackSwipe;
        if (hash === '#/feed') { SocialUI.renderFeed(_bs); return; }
        if (hash === '#/profile') { SocialUI.renderProfile(null, _bs); return; }
        if (hash === '#/profile/edit') { SocialUI.renderProfileEdit(); return; }
        if (hash === '#/checkin') {
            // Keep prefill data alive for P2R re-renders; only clear when leaving page
            if (this._pendingCheckinWorkout) this._activeCheckinWorkout = this._pendingCheckinWorkout;
            this._pendingCheckinWorkout = null;
            SocialUI.renderCheckinForm(this._activeCheckinWorkout);
            return;
        }
        if (hash === '#/discover') { SocialUI.renderDiscover(_bs); return; }
        if (hash === '#/notifications') { SocialUI.renderNotifications(); return; }
        if (hash === '#/messages') { Social.unsubscribeMessages(); if (SocialUI._chatViewportCleanup) { SocialUI._chatViewportCleanup(); SocialUI._chatViewportCleanup = null; } SocialUI.renderMessages(); return; }
        var dmMatch = hash.match(/^#\/messages\/(.+)$/);
        if (dmMatch) { SocialUI.renderConversation(null, dmMatch[1]); return; }
        var checkinDetailMatch = hash.match(/^#\/checkin\/(.+)$/);
        if (checkinDetailMatch) { SocialUI.renderCheckinDetail(checkinDetailMatch[1]); return; }
        var followListMatch = hash.match(/^#\/(followers|following)\/(.+)$/);
        if (followListMatch) { SocialUI.renderFollowList(followListMatch[2], followListMatch[1]); return; }
        var usernameMatch = hash.match(/^#\/u\/(.+)$/);
        if (usernameMatch) {
            Social.getProfileByUsername(decodeURIComponent(usernameMatch[1])).then(function(p) {
                if (p) SocialUI.renderProfile(p.user_id);
                else document.getElementById('app').innerHTML = '<div class="social-screen"><div class="social-empty">Профиль не найден</div></div>';
            });
            return;
        }

        // Builder wizard (needs user, no program required)
        if (hash === '#/builder/step1') {
            Builder.renderWizardStep1();
            return;
        }
        if (hash === '#/builder/step2') {
            Builder.renderWizardStep2();
            return;
        }

        // Day editor (needs user + program)
        var editDayMatch = hash.match(/^#\/edit\/day\/(\d+)$/);
        if (editDayMatch) {
            Builder.renderDayEditor(parseInt(editDayMatch[1]));
            return;
        }

        // Program check: no program loaded → go to setup
        if (!PROGRAM && hash !== '#/setup') {
            location.hash = '#/setup';
            return;
        }

        // Setup check
        if (!Storage.isSetup() && hash !== '#/setup') {
            location.hash = '#/setup';
            return;
        }

        if (hash === '#/setup' || hash === '') {
            if (!PROGRAM || !Storage.isSetup()) {
                UI.renderSetup();
                return;
            }
            // Redirect to current progress week
            const progress = getProgressWeek();
            location.hash = `#/week/${progress.week}`;
            return;
        }

        if (hash === '#/menu') {
            UI.renderMenu();
            return;
        }

        if (hash === '#/settings') {
            UI.renderSettings();
            return;
        }

        if (hash === '#/guide') {
            UI.renderGuide();
            return;
        }

        if (hash === '#/calculator') {
            UI.renderCalculator();
            return;
        }

        // History view: #/history/{exerciseId}
        const historyMatch = hash.match(/^#\/history\/(.+)$/);
        if (historyMatch) {
            UI.renderHistory(decodeURIComponent(historyMatch[1]));
            return;
        }

        // Rollback equipment if leaving day view without completed sets
        if (this._inDayView) {
            Storage.rollbackEquipmentIfNoSets();
            this._inDayView = false;
        }

        // Day view: #/week/{n}/day/{n}
        const dayMatch = hash.match(/^#\/week\/(\d+)\/day\/(\d+)$/);
        if (dayMatch) {
            this._currentWeek = parseInt(dayMatch[1]);
            this._currentDay = parseInt(dayMatch[2]);
            Storage.snapshotEquipment(this._currentWeek, this._currentDay);
            this._inDayView = true;
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Week view: #/week/{n}
        const weekMatch = hash.match(/^#\/week\/(\d+)$/);
        if (weekMatch) {
            this._currentWeek = parseInt(weekMatch[1]);
            this._swipeDir = null;
            UI.renderWeek(this._currentWeek);
            this._showNotificationPrompt();
            return;
        }

        // Default: go to current progress week
        if (Storage.isSetup()) {
            const progress = getProgressWeek();
            location.hash = `#/week/${progress.week}`;
        } else {
            location.hash = '#/setup';
        }
    },

    handleClick(e) {
        const target = e.target;


        // Login form submit
        if (target.id === 'login-submit' || target.closest('#login-submit')) {
            var loginInput = document.getElementById('login-input');
            var passInput = document.getElementById('password-input');
            var loginVal = loginInput ? loginInput.value.trim() : '';
            var passVal = passInput ? passInput.value.trim() : '';
            if (!loginVal || !passVal) return;
            // Try local login first (hardcoded + local self-registered)
            var loginResult = this.login(loginVal, passVal);
            if (loginResult === 'migrated') {
                var err = document.getElementById('login-error');
                if (err) {
                    err.textContent = 'Аккаунт обновлён. Войдите через email и пароль.';
                    err.style.display = 'block';
                }
                return;
            }
            if (loginResult === true) return;
            // Try Supabase login (email + password)
            if (typeof SupaSync !== 'undefined' && loginVal.includes('@')) {
                this.loginSupabase(loginVal, passVal);
                return;
            }
            var err = document.getElementById('login-error');
            if (err) {
                err.textContent = 'Неверный логин или пароль';
                err.style.display = 'block';
            }
            return;
        }

        // Password visibility toggle
        var togBtn = target.closest('.password-toggle');
        if (togBtn) {
            var inp = document.getElementById(togBtn.dataset.target);
            if (inp) {
                var show = inp.type === 'password';
                inp.type = show ? 'text' : 'password';
                togBtn.querySelector('.eye-icon').style.display = show ? 'none' : '';
                togBtn.querySelector('.eye-off-icon').style.display = show ? '' : 'none';
            }
            return;
        }

        // Migration: submit
        if (target.id === 'migrate-submit' || target.closest('#migrate-submit')) {
            this._handleMigration();
            return;
        }

        // Go to registration (replace login in history)
        if (target.id === 'btn-register' || target.closest('#btn-register')) {
            history.replaceState(null, '', '#/register');
            this.route();
            return;
        }

        // Registration: submit
        if (target.id === 'reg-submit' || target.closest('#reg-submit')) {
            Builder.handleRegister();
            return;
        }

        // Registration: go back to login (replace, don't push)
        if (target.id === 'btn-go-login' || target.closest('#btn-go-login')) {
            history.replaceState(null, '', '#/login');
            this.route();
            return;
        }

        // Onboarding: gender
        var genderBtn = target.closest('.onboard-gender-btn');
        if (genderBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.gender = genderBtn.dataset.gender;
            location.hash = '#/onboarding/2';
            return;
        }

        // Onboarding: role selection
        var roleBtn = target.closest('.onboard-role-btn');
        if (roleBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.role = roleBtn.dataset.role;
            if (roleBtn.dataset.role === 'casual') location.hash = '#/onboarding/3';
            else if (roleBtn.dataset.role === 'athlete') location.hash = '#/onboarding/3a';
            else if (roleBtn.dataset.role === 'trainer') location.hash = '#/onboarding/3t';
            return;
        }

        // Onboarding: goal (casual)
        var goalBtn = target.closest('.onboard-goal-btn');
        if (goalBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.goal = goalBtn.dataset.goal;
            Builder._finishOnboarding();
            return;
        }

        // Onboarding: pro/amateur (athlete)
        var proBtn = target.closest('.onboard-pro-btn');
        if (proBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.is_pro = proBtn.dataset.pro === 'true';
            location.hash = '#/onboarding/4';
            return;
        }

        // Onboarding: category (athlete)
        var catBtn = target.closest('.onboard-category-btn');
        if (catBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.category = catBtn.dataset.category;
            location.hash = '#/onboarding/5';
            return;
        }

        // Onboarding: phase (athlete)
        var phaseBtn = target.closest('.onboard-phase-btn');
        if (phaseBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.phase = phaseBtn.dataset.phase;
            Builder._finishOnboarding();
            return;
        }

        // Onboarding: client count (trainer)
        var clientsBtn = target.closest('.onboard-clients-btn');
        if (clientsBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.client_count = clientsBtn.dataset.clients;
            Builder._finishOnboarding();
            return;
        }

        // Logout
        if (target.id === 'btn-logout' || target.closest('#btn-logout')) {
            this.logout();
            return;
        }

        // ===== SOCIAL CLICK HANDLERS =====

        // Profile edit button
        if (target.id === 'btn-profile-edit' || target.closest('#btn-profile-edit')) {
            location.hash = '#/profile/edit';
            return;
        }

        // New checkin button
        if (target.id === 'btn-new-checkin' || target.closest('#btn-new-checkin')) {
            location.hash = '#/checkin';
            return;
        }

        // Profile grid item click → detail
        var gridItem = target.closest('.profile-feed-item');
        if (gridItem) {
            var cid = gridItem.dataset.checkin;
            if (cid) location.hash = '#/checkin/' + cid;
            return;
        }

        // Profile post-type tab filter
        if (target.classList.contains('profile-tab')) {
            var allTabs = document.querySelectorAll('.profile-tab');
            allTabs.forEach(function(t) { t.classList.remove('active'); });
            target.classList.add('active');
            var tab = target.dataset.tab;
            var allPosts = SocialUI._profileAllCheckins || [];
            var filtered;
            if (tab === 'workouts') filtered = allPosts.filter(function(c) { return !!c.workout_summary; });
            else if (tab === 'checkins') filtered = allPosts.filter(function(c) { return !c.workout_summary; });
            else filtered = allPosts;
            var gridEl = document.getElementById('profile-posts-grid');
            if (gridEl) {
                var loadBtn = gridEl.querySelector('.btn-load-more');
                gridEl.innerHTML = filtered.length ? SocialUI._renderProfileFeed(filtered) : '<div class="social-empty">Нет публикаций</div>';
                if (loadBtn) gridEl.appendChild(loadBtn);
            }
            return;
        }

        // Profile save
        if (target.id === 'btn-profile-save' || target.closest('#btn-profile-save')) {
            this._saveProfile();
            return;
        }

        // Profile back
        if (target.id === 'btn-profile-back' || target.closest('#btn-profile-back')) {
            location.hash = '#/profile';
            return;
        }

        // Avatar file input
        if (target.id === 'avatar-file-input' || target.closest('#avatar-file-input')) {
            // handled by change event below
        }

        // Athlete toggle
        if (target.id === 'edit-is-athlete') {
            var fields = document.getElementById('edit-athlete-fields');
            if (fields) fields.style.display = target.checked ? '' : 'none';
            return;
        }

        // Follow/unfollow
        if (target.id === 'btn-follow' || target.closest('#btn-follow')) {
            var btn = target.id === 'btn-follow' ? target : target.closest('#btn-follow');
            var userId = btn.dataset.user;
            if (!userId) return;
            btn.disabled = true;
            if (btn.classList.contains('following')) {
                Social.unfollow(userId).then(function() {
                    btn.classList.remove('following');
                    btn.textContent = 'Подписаться';
                    btn.disabled = false;
                }).catch(function(e) { btn.disabled = false; alert('Ошибка: ' + e.message); });
            } else {
                Social.follow(userId).then(function(ok) {
                    if (ok) {
                        btn.classList.add('following');
                        btn.textContent = 'Отписаться';
                    }
                    btn.disabled = false;
                }).catch(function(e) { btn.disabled = false; alert('Ошибка: ' + e.message); });
            }
            return;
        }

        // Follow (small btn in discover)
        if (target.classList.contains('btn-follow-sm')) {
            var userId = target.dataset.user;
            if (!userId) return;
            target.disabled = true;
            Social.follow(userId).then(function(ok) {
                if (ok) {
                    target.textContent = 'Подписан';
                    target.classList.add('followed');
                } else {
                    target.disabled = false;
                }
            }).catch(function(e) { target.disabled = false; alert('Ошибка: ' + e.message); });
            return;
        }

        // Discover navigation
        if (target.id === 'btn-discover' || target.closest('#btn-discover') || target.id === 'btn-discover-empty' || target.closest('#btn-discover-empty')) {
            location.hash = '#/discover';
            return;
        }

        // Discover back
        if (target.id === 'btn-discover-back' || target.closest('#btn-discover-back')) {
            location.hash = '#/feed';
            return;
        }

        // Follow list back
        if (target.id === 'btn-followlist-back' || target.closest('#btn-followlist-back')) {
            history.back();
            return;
        }

        // Discover search
        if (target.id === 'btn-discover-search' || target.closest('#btn-discover-search')) {
            var query = (document.getElementById('discover-search-input').value || '').trim();
            if (!query) return;
            var resultsEl = document.getElementById('discover-results');
            if (resultsEl) resultsEl.innerHTML = '<div class="social-loading">Поиск...</div>';
            Promise.all([Social.searchUsers(query), Social.getMyFollowingIds()]).then(function(r) {
                if (resultsEl) resultsEl.innerHTML = SocialUI._renderUserList(r[0], Social._getSupaUserId(), r[1]);
            });
            return;
        }

        // Discover user click → profile
        var discoverUser = target.closest('.discover-user');
        if (discoverUser && !target.classList.contains('btn-follow-sm')) {
            var userId = discoverUser.querySelector('.btn-follow-sm');
            if (userId) {
                var uid = userId.dataset.user;
                var username = discoverUser.querySelector('.discover-user-username');
                if (username) {
                    location.hash = '#/u/' + username.textContent.replace('@', '');
                }
            }
            return;
        }

        // Notifications button
        if (target.id === 'btn-notifications' || target.closest('#btn-notifications')) {
            location.hash = '#/notifications';
            return;
        }

        // Messages button (feed header)
        if (target.id === 'btn-messages' || target.closest('#btn-messages')) {
            location.hash = '#/messages';
            return;
        }

        // Messages back
        if (target.id === 'btn-messages-back' || target.closest('#btn-messages-back')) {
            history.back();
            return;
        }

        // Chat back
        if (target.id === 'btn-chat-back' || target.closest('#btn-chat-back')) {
            Social.unsubscribeMessages();
            if (SocialUI._chatViewportCleanup) { SocialUI._chatViewportCleanup(); SocialUI._chatViewportCleanup = null; }
            history.back();
            return;
        }

        // Conversation item click
        var convItem = target.closest('.conversation-item');
        if (convItem) {
            var userId = convItem.dataset.user;
            if (userId) location.hash = '#/messages/' + userId;
            return;
        }

        // Send message
        if (target.id === 'btn-send-message' || target.closest('#btn-send-message')) {
            var inp = document.getElementById('chat-input');
            var text = inp ? inp.value.trim() : '';
            if (!text || !SocialUI._chatConvId) return;
            inp.value = '';
            // Optimistic render
            var chatEl = document.getElementById('chat-messages');
            if (chatEl) {
                var time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                chatEl.insertAdjacentHTML('beforeend', '<div class="chat-bubble mine">' + text + '<div class="chat-bubble-time">' + time + '</div></div>');
                chatEl.scrollTop = chatEl.scrollHeight;
            }
            Social.sendMessage(SocialUI._chatConvId, text).catch(function() {});
            return;
        }

        // DM button on other user's profile
        if (target.id === 'btn-dm' || target.closest('#btn-dm')) {
            var btn = target.id === 'btn-dm' ? target : target.closest('#btn-dm');
            var userId = btn.dataset.user;
            if (userId) location.hash = '#/messages/' + userId;
            return;
        }

        // Notification back
        if (target.id === 'btn-notif-back' || target.closest('#btn-notif-back')) {
            history.back();
            return;
        }

        // Like button (feed cards and detail)
        var likeBtn = target.closest('.like-btn');
        if (likeBtn) {
            var checkinId = likeBtn.dataset.checkin;
            if (!checkinId) return;
            // Optimistic UI
            var wasActive = likeBtn.classList.contains('active');
            likeBtn.classList.toggle('active');
            var countEl = likeBtn.querySelector('.like-count');
            var currentCount = parseInt(countEl.textContent) || 0;
            countEl.textContent = wasActive ? (currentCount > 1 ? currentCount - 1 : '') : (currentCount + 1);
            // API call
            Social.toggleLike(checkinId).catch(function() {
                // Rollback on error
                likeBtn.classList.toggle('active');
                countEl.textContent = currentCount > 0 ? currentCount : '';
            });
            return;
        }

        // Comment icon button → scroll to or navigate to comments
        var commentBtnIcon = target.closest('.comment-btn-icon');
        if (commentBtnIcon) {
            var checkinId = commentBtnIcon.dataset.checkin;
            var commentInput = document.getElementById('comment-input');
            if (commentInput) {
                commentInput.focus();
            } else if (checkinId) {
                location.hash = '#/checkin/' + checkinId;
            }
            return;
        }

        // Comment author profile link
        var profileLink = target.closest('.comment-profile-link');
        if (profileLink && !target.closest('.comment-reply-btn') && !target.closest('.comment-like-btn')) {
            var username = profileLink.dataset.username;
            if (username) location.hash = '#/u/' + username;
            return;
        }

        // Reply to comment
        var replyBtn = target.closest('.comment-reply-btn');
        if (replyBtn) {
            var username = replyBtn.dataset.username;
            var commentId = replyBtn.dataset.commentid;
            var input = document.getElementById('comment-input');
            if (input && username) {
                App._replyToCommentId = commentId || null;
                input.value = '@' + username + ' ';
                input.focus();
                // Show reply indicator
                var indicator = document.getElementById('reply-indicator');
                var nameEl = document.getElementById('reply-indicator-name');
                if (indicator && nameEl) {
                    nameEl.textContent = username;
                    indicator.style.display = 'flex';
                }
            }
            return;
        }

        // Cancel reply
        if (target.id === 'btn-reply-cancel' || target.closest('#btn-reply-cancel')) {
            App._replyToCommentId = null;
            var indicator = document.getElementById('reply-indicator');
            if (indicator) indicator.style.display = 'none';
            var input = document.getElementById('comment-input');
            if (input) { input.value = ''; input.focus(); }
            return;
        }

        // Comment like
        var commentLikeBtn = target.closest('.comment-like-btn');
        if (commentLikeBtn) {
            var commentId = commentLikeBtn.dataset.comment;
            if (!commentId) return;
            var wasActive = commentLikeBtn.classList.contains('active');
            commentLikeBtn.classList.toggle('active');
            var countEl = commentLikeBtn.querySelector('.comment-like-count');
            var cur = parseInt(countEl.textContent) || 0;
            countEl.textContent = wasActive ? (cur > 1 ? cur - 1 : '') : (cur + 1);
            Social.toggleCommentLike(commentId).catch(function() {
                commentLikeBtn.classList.toggle('active');
                countEl.textContent = cur > 0 ? cur : '';
            });
            return;
        }

        // Tag user button in checkin form
        if (target.id === 'btn-tag-user' || target.closest('#btn-tag-user')) {
            if (!App._checkinTaggedUsers) App._checkinTaggedUsers = [];
            SocialUI.renderTagSearch(function(user) {
                // Check if already tagged
                var already = App._checkinTaggedUsers.some(function(u) { return u.user_id === user.user_id; });
                if (already) return;
                App._checkinTaggedUsers.push(user);
                var container = document.getElementById('checkin-tagged-users');
                if (container) {
                    var tag = document.createElement('span');
                    tag.className = 'tagged-user-chip';
                    tag.dataset.uid = user.user_id;
                    tag.innerHTML = '@' + user.username + ' <button class="tagged-user-remove">&times;</button>';
                    container.appendChild(tag);
                }
            });
            return;
        }

        // Remove tagged user chip
        var removeTag = target.closest('.tagged-user-remove');
        if (removeTag) {
            var chip = removeTag.closest('.tagged-user-chip');
            if (chip && App._checkinTaggedUsers) {
                App._checkinTaggedUsers = App._checkinTaggedUsers.filter(function(u) { return u.user_id !== chip.dataset.uid; });
                chip.remove();
            }
            return;
        }

        // Checkin card click → detail (with double-tap detection)
        var checkinCard = target.closest('.checkin-card');
        if (checkinCard && !checkinCard.classList.contains('checkin-full') && !target.closest('.like-btn') && !target.closest('.comment-btn-icon')) {
            var checkinId = checkinCard.dataset.checkin;
            if (!checkinId) return;

            // Double-tap detection
            var now = Date.now();
            var lastTap = checkinCard._lastTap || 0;
            checkinCard._lastTap = now;

            if (now - lastTap < 300) {
                // Double tap → like + animation
                clearTimeout(checkinCard._tapTimer);
                var likeBtnInCard = checkinCard.querySelector('.like-btn');
                if (likeBtnInCard && !likeBtnInCard.classList.contains('active')) {
                    likeBtnInCard.click();
                }
                // Show heart animation
                var anim = document.createElement('div');
                anim.className = 'double-tap-heart';
                anim.innerHTML = SocialUI._likeIconSVG;
                checkinCard.style.position = 'relative';
                checkinCard.appendChild(anim);
                setTimeout(function() { anim.remove(); }, 900);
                return;
            }

            // Single tap → navigate after delay
            checkinCard._tapTimer = setTimeout(function() {
                location.hash = '#/checkin/' + checkinId;
            }, 300);
            return;
        }

        // Checkin back
        if (target.id === 'btn-checkin-back' || target.closest('#btn-checkin-back')) {
            location.hash = '#/profile';
            return;
        }

        // Checkin detail back
        if (target.id === 'btn-checkin-detail-back' || target.closest('#btn-checkin-detail-back')) {
            history.back();
            return;
        }

        // Delete checkin
        if (target.id === 'btn-delete-checkin' || target.closest('#btn-delete-checkin')) {
            var delBtn = target.closest('#btn-delete-checkin') || target;
            var cid = delBtn.dataset.checkin;
            if (cid && confirm('Удалить этот чекин?')) {
                Social.deleteCheckin(cid).then(function() {
                    location.hash = '#/profile';
                }).catch(function(err) {
                    alert('Ошибка: ' + err.message);
                });
            }
            return;
        }

        // Checkin submit
        if (target.id === 'btn-checkin-submit' || target.closest('#btn-checkin-submit')) {
            this._submitCheckin();
            return;
        }

        // Checkin photo input trigger
        if (target.closest('.checkin-add-photo')) {
            // Let label handle file input click
        }

        // Legacy reaction button (removed, now using like-btn)

        // Send comment
        if (target.id === 'btn-send-comment' || target.closest('#btn-send-comment')) {
            var btn = target.id === 'btn-send-comment' ? target : target.closest('#btn-send-comment');
            var checkinId = btn.dataset.checkin;
            var input = document.getElementById('comment-input');
            var text = input ? input.value.trim() : '';
            if (!text || !checkinId) return;
            btn.disabled = true;
            var parentId = App._replyToCommentId || null;
            App._replyToCommentId = null;
            Social.addComment(checkinId, text, parentId).then(function() {
                SocialUI.renderCheckinDetail(checkinId);
            }).catch(function() { btn.disabled = false; });
            return;
        }

        // Delete comment
        var deleteCommentBtn = target.closest('.comment-delete');
        if (deleteCommentBtn) {
            var commentId = deleteCommentBtn.dataset.comment;
            if (commentId && confirm('Удалить комментарий?')) {
                Social.deleteComment(commentId).then(function() {
                    // Find parent checkin and refresh
                    var sendBtn = document.getElementById('btn-send-comment');
                    if (sendBtn) SocialUI.renderCheckinDetail(sendBtn.dataset.checkin);
                });
            }
            return;
        }

        // Load more (feed)
        if (target.id === 'btn-load-more-feed' || target.closest('#btn-load-more-feed')) {
            target.disabled = true;
            target.textContent = 'Загрузка...';
            Social.getFeed(SocialUI._feedCursor).then(function(more) {
                SocialUI._feedCursor = more.length >= 20 ? more[more.length - 1].created_at : null;
                var ids = more.map(function(c) { return c.id; });
                return Promise.all([Promise.resolve(more), Social.getLikesForCheckins(ids), Social.getTagsForCheckins(ids)]);
            }).then(function(results) {
                var more = results[0], likes = results[1], tags = results[2];
                var btn = document.getElementById('btn-load-more-feed');
                if (btn) {
                    btn.insertAdjacentHTML('beforebegin', SocialUI._renderCheckinCards(more, likes, tags));
                    if (!SocialUI._feedCursor) btn.remove();
                    else { btn.disabled = false; btn.textContent = 'Загрузить ещё'; }
                }
            });
            return;
        }

        // Load more (profile)
        if (target.id === 'btn-load-more-profile' || target.closest('#btn-load-more-profile')) {
            var btn = target.id === 'btn-load-more-profile' ? target : target.closest('#btn-load-more-profile');
            var userId = btn.dataset.user;
            btn.disabled = true;
            btn.textContent = 'Загрузка...';
            Social.getUserCheckins(userId, SocialUI._profileCheckinsCursor).then(function(more) {
                SocialUI._profileCheckinsCursor = more.length >= 20 ? more[more.length - 1].created_at : null;
                SocialUI._profileAllCheckins = (SocialUI._profileAllCheckins || []).concat(more);
                var gridEl = document.querySelector('.profile-grid');
                if (gridEl) {
                    gridEl.insertAdjacentHTML('beforeend', SocialUI._renderProfileFeed(more, true));
                }
                if (!SocialUI._profileCheckinsCursor) btn.remove();
                else { btn.disabled = false; btn.textContent = 'Загрузить ещё'; }
            });
            return;
        }

        // Checkin author click → profile
        var checkinAuthor = target.closest('.checkin-author[data-username]');
        if (checkinAuthor) {
            var username = checkinAuthor.dataset.username;
            if (username) location.hash = '#/u/' + username;
            return;
        }

        // ===== END SOCIAL HANDLERS =====

        // Setup: import program from file
        if (target.id === 'setup-import-program' || target.closest('#setup-import-program')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                this.importProgram(file).then(() => {
                    UI.renderSetup();
                }).catch(err => {
                    const status = document.getElementById('program-status');
                    if (status) status.innerHTML = `<span style="color:#FF2D55">${err}</span>`;
                });
            };
            input.click();
            return;
        }

        // Setup: create program (builder)
        if (target.id === 'setup-create-program' || target.closest('#setup-create-program')) {
            location.hash = '#/builder/step1';
            return;
        }

        // Builder wizard: toggle buttons (weeks/days)
        if (target.matches('.builder-toggle button')) {
            var btns = target.parentElement.querySelectorAll('button');
            btns.forEach(function(b) { b.classList.remove('active'); });
            target.classList.add('active');
            return;
        }

        // Builder wizard: step1 → step2
        if (target.id === 'builder-next' || target.closest('#builder-next')) {
            Builder.saveStep1();
            location.hash = '#/builder/step2';
            return;
        }

        // Builder wizard: back from step1 → setup
        if (target.id === 'builder-back-setup' || target.closest('#builder-back-setup')) {
            location.hash = '#/setup';
            return;
        }

        // Builder wizard: back from step2 → step1
        if (target.id === 'builder-back-step1' || target.closest('#builder-back-step1')) {
            // Save day names to config
            if (Builder._config) {
                var dayInputs = document.querySelectorAll('.builder-day-name');
                var names = [];
                dayInputs.forEach(function(inp) { names.push(inp.value.trim()); });
                Builder._config.dayNames = names;
            }
            location.hash = '#/builder/step1';
            return;
        }

        // Builder wizard: create program
        if (target.id === 'builder-create' || target.closest('#builder-create')) {
            Builder.createProgram();
            location.hash = '#/setup';
            return;
        }

        // Setup summary: back to initial setup
        if (target.id === 'setup-back-builder' || target.closest('#setup-back-builder')) {
            // Go back to builder step2 (day names), preserving the program config
            if (Builder._config) {
                location.hash = '#/builder/step2';
            } else {
                // Reconstruct config from existing program
                var numDays = getTotalDays();
                var dayNames = [];
                for (var d = 1; d <= numDays; d++) {
                    var tmpl = PROGRAM && PROGRAM.dayTemplates[d];
                    dayNames.push(tmpl ? (tmpl.titleRu || tmpl.title || '') : '');
                }
                Builder._config = {
                    title: PROGRAM ? (PROGRAM.title || '') : '',
                    totalWeeks: PROGRAM ? (PROGRAM.totalWeeks || 4) : 4,
                    numDays: numDays,
                    dayNames: dayNames
                };
                location.hash = '#/builder/step2';
            }
            return;
        }

        // Day editor: add exercise
        if (target.id === 'editor-add-exercise' || target.closest('#editor-add-exercise')) {
            Builder.showExercisePicker();
            return;
        }

        // Day editor: delete exercise
        if (target.classList.contains('editor-delete') || target.closest('.editor-delete')) {
            var btn = target.classList.contains('editor-delete') ? target : target.closest('.editor-delete');
            Builder.deleteExercise(parseInt(btn.dataset.idx));
            return;
        }

        // Day editor: back
        if (target.id === 'btn-back-editor' || target.closest('#btn-back-editor')) {
            this._handleEditorBack();
            return;
        }

        // Empty day: add exercise → open editor + picker directly
        if (target.id === 'btn-add-exercise-empty' || target.closest('#btn-add-exercise-empty')) {
            Builder.renderDayEditor(this._currentDay);
            Builder.showExercisePicker();
            return;
        }

        // Edit day (pencil on training day view)
        if (target.id === 'btn-edit-day' || target.closest('#btn-edit-day')) {
            location.hash = '#/edit/day/' + this._currentDay;
            return;
        }

        // Setup: use default program
        if (target.id === 'setup-use-default' || target.closest('#setup-use-default')) {
            if (typeof DEFAULT_PROGRAM !== 'undefined') {
                Storage.saveProgram(DEFAULT_PROGRAM, false);
                PROGRAM = DEFAULT_PROGRAM;
                UI.renderSetup();
            }
            return;
        }

        // Setup: cycle toggle
        if (target.matches('.cycle-toggle button')) {
            const buttons = target.parentElement.querySelectorAll('button');
            buttons.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            return;
        }

        // Setup: start button
        if (target.id === 'setup-start') {
            this.startSetup();
            return;
        }

        // Week navigation
        if (target.id === 'prev-week' || target.closest('#prev-week')) {
            location.hash = `#/week/${this._currentWeek === 1 ? getTotalWeeks() : this._currentWeek - 1}`;
            return;
        }
        if (target.id === 'next-week' || target.closest('#next-week')) {
            location.hash = `#/week/${this._currentWeek === getTotalWeeks() ? 1 : this._currentWeek + 1}`;
            return;
        }
        // Add/remove day for custom programs
        if (target.id === 'btn-add-day' || target.closest('#btn-add-day')) {
            this._addDayToCustomProgram();
            return;
        }
        if (target.id === 'btn-remove-day' || target.closest('#btn-remove-day')) {
            this._removeDayFromCustomProgram();
            return;
        }
        // Add week button for custom programs
        if (target.id === 'btn-add-week' || target.closest('#btn-add-week')) {
            this._addWeekToCustomProgram();
            return;
        }
        // Remove week button for custom programs
        if (target.id === 'btn-remove-week' || target.closest('#btn-remove-week')) {
            this._removeWeekFromCustomProgram();
            return;
        }

        // Back button — smooth exit animation
        if (target.id === 'btn-back' || target.closest('#btn-back')) {
            const app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                location.hash = `#/week/${this._currentWeek}`;
            }, 190);
            return;
        }

        // Back from history — smooth exit
        if (target.id === 'btn-back-history' || target.closest('#btn-back-history')) {
            const app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                location.hash = `#/week/${this._currentWeek}/day/${this._currentDay}`;
            }, 190);
            return;
        }

        // Menu (was Settings)
        if (target.id === 'btn-settings' || target.closest('#btn-settings')) {
            location.hash = '#/menu';
            return;
        }

        // Back from menu — smooth exit to week view
        if (target.id === 'btn-back-menu' || target.closest('#btn-back-menu')) {
            const app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                location.hash = `#/week/${this._currentWeek}`;
            }, 190);
            return;
        }

        // Back from settings — smooth exit to menu
        if (target.id === 'btn-back-settings' || target.closest('#btn-back-settings')) {
            const app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                location.hash = '#/menu';
            }, 190);
            return;
        }

        // Back from calculator — smooth exit to menu
        if (target.id === 'btn-back-calc' || target.closest('#btn-back-calc')) {
            const app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                location.hash = '#/menu';
            }, 190);
            return;
        }

        // Back from guide — smooth exit to menu
        if (target.id === 'btn-back-guide' || target.closest('#btn-back-guide')) {
            const app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(() => {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                location.hash = '#/menu';
            }, 190);
            return;
        }

        // Settings: timer min/sec steppers
        if (['td-min-minus','td-min-plus','td-sec-minus','td-sec-plus'].includes(target.id)) {
            const minEl = document.getElementById('td-min-val');
            const secEl = document.getElementById('td-sec-val');
            if (!minEl || !secEl) return;
            let mins = parseInt(minEl.textContent) || 0;
            let secs = parseInt(secEl.textContent) || 0;
            if (target.id === 'td-min-minus') mins = Math.max(0, mins - 1);
            if (target.id === 'td-min-plus') mins = Math.min(99, mins + 1);
            if (target.id === 'td-sec-minus') secs = secs === 0 ? 55 : secs - 5;
            if (target.id === 'td-sec-plus') secs = secs >= 55 ? 0 : secs + 5;
            if (mins === 0 && secs === 0) { secs = 5; }
            minEl.textContent = mins;
            secEl.textContent = String(secs).padStart(2, '0');
            return;
        }

        // Save settings
        if (target.id === 'settings-save') {
            const cycleBtn = document.querySelector('.cycle-toggle button.active[data-cycle]');
            const cycleType = cycleBtn ? parseInt(cycleBtn.dataset.cycle) : 7;
            const startDate = document.getElementById('settings-start-date').value;
            const unitBtn = document.querySelector('.cycle-toggle button.active[data-unit]');
            const weightUnit = unitBtn ? unitBtn.dataset.unit : 'kg';
            const mins = parseInt(document.getElementById('td-min-val')?.textContent) || 0;
            const secs = parseInt(document.getElementById('td-sec-val')?.textContent) || 0;
            const timerDuration = Math.max(30, mins * 60 + secs);
            const langBtn = document.querySelector('.cycle-toggle button.active[data-lang]');
            const exerciseLang = langBtn ? langBtn.dataset.lang : 'ru';
            Storage.saveSettings({ cycleType, startDate, weightUnit, timerDuration, exerciseLang });
            RestTimer.setDefaultDuration(timerDuration);
            location.hash = `#/week/${this._currentWeek}`;
            return;
        }

        // Settings: add equipment
        if (target.id === 'settings-eq-add' || target.closest('#settings-eq-add')) {
            const input = document.getElementById('settings-eq-name');
            const name = input ? input.value.trim() : '';
            if (!name) return;
            Storage.addEquipment(name);
            UI.renderSettings();
            return;
        }

        // Settings: edit equipment name (inline)
        if (target.matches('.eq-edit-btn') || target.closest('.eq-edit-btn')) {
            const btn = target.matches('.eq-edit-btn') ? target : target.closest('.eq-edit-btn');
            const eqId = btn.dataset.eqId;
            if (!eqId) return;
            var item = btn.closest('.settings-eq-item');
            var span = item ? item.querySelector('span') : null;
            if (!span || span.querySelector('input')) return;
            var oldName = span.textContent.trim();
            // Disable all remove buttons while editing
            document.querySelectorAll('.eq-remove-btn, .gym-remove-btn').forEach(function(b) { b.disabled = true; b.style.opacity = '0.3'; });
            span.innerHTML = '<input type="text" class="eq-inline-edit" value="' + oldName.replace(/"/g, '&quot;') + '">';
            var inp = span.querySelector('input');
            inp.focus(); inp.select();
            var saved = false;
            var save = function() {
                if (saved) return; saved = true;
                var v = inp.value.trim();
                if (v && v !== oldName) { Storage.renameEquipment(eqId, v); }
                UI.renderSettings();
            };
            inp.addEventListener('blur', function() { setTimeout(save, 100); });
            inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); save(); } });
            return;
        }

        // Settings: remove equipment
        if (target.matches('.eq-remove-btn') || target.closest('.eq-remove-btn')) {
            const btn = target.matches('.eq-remove-btn') ? target : target.closest('.eq-remove-btn');
            if (btn.disabled) return;
            const eqId = btn.dataset.eqId;
            if (eqId) {
                Storage.removeEquipment(eqId);
                UI.renderSettings();
            }
            return;
        }

        // Settings: add gym
        if (target.id === 'settings-gym-add' || target.closest('#settings-gym-add')) {
            var input = document.getElementById('settings-gym-name');
            var name = input ? input.value.trim() : '';
            if (!name) return;
            Storage.addGym(name);
            UI.renderSettings();
            return;
        }

        // Settings: edit gym name (inline)
        if (target.matches('.gym-edit-btn') || target.closest('.gym-edit-btn')) {
            var btn = target.matches('.gym-edit-btn') ? target : target.closest('.gym-edit-btn');
            var gymId = btn.dataset.gymId;
            if (!gymId) return;
            var item = btn.closest('.settings-eq-item');
            var span = item ? item.querySelector('span') : null;
            if (!span || span.querySelector('input')) return;
            var oldName = span.textContent.trim();
            document.querySelectorAll('.eq-remove-btn, .gym-remove-btn').forEach(function(b) { b.disabled = true; b.style.opacity = '0.3'; });
            span.innerHTML = '<input type="text" class="eq-inline-edit" value="' + oldName.replace(/"/g, '&quot;') + '">';
            var inp = span.querySelector('input');
            inp.focus(); inp.select();
            var saved = false;
            var save = function() {
                if (saved) return; saved = true;
                var v = inp.value.trim();
                if (v && v !== oldName) { Storage.renameGym(gymId, v); }
                UI.renderSettings();
            };
            inp.addEventListener('blur', function() { setTimeout(save, 100); });
            inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); save(); } });
            return;
        }

        // Settings: remove gym
        if (target.matches('.gym-remove-btn') || target.closest('.gym-remove-btn')) {
            var btn = target.matches('.gym-remove-btn') ? target : target.closest('.gym-remove-btn');
            if (btn.disabled) return;
            var gymId = btn.dataset.gymId;
            if (gymId && confirm('Удалить зал?')) {
                Storage.removeGym(gymId);
                UI.renderSettings();
            }
            return;
        }

        // Reset data
        if (target.id === 'btn-reset') {
            if (confirm('Вы уверены? Все данные будут удалены.')) {
                Storage.clearAll();
                location.hash = '#/setup';
            }
            return;
        }

        // Unit cycle button — cycle kg → lbs → plates per exercise
        if (target.matches('.unit-cycle-btn')) {
            const exId = target.dataset.exercise;
            const units = ['kg', 'lbs', 'plates'];
            const labels = { kg: 'кг', lbs: 'lbs', plates: 'пл' };
            const current = Storage.getExerciseUnit(exId) || Storage.getWeightUnit();
            const next = units[(units.indexOf(current) + 1) % units.length];
            Storage.setExerciseUnit(exId, next);
            const nextLabel = labels[next];
            document.querySelectorAll(`.unit-cycle-btn[data-exercise="${exId}"]`).forEach(b => {
                b.textContent = nextLabel;
            });
            document.querySelectorAll(`.set-prev-unit[data-exercise="${exId}"]`).forEach(s => {
                s.textContent = nextLabel;
            });
            return;
        }

        // Start workout timer — show gym modal first
        if (target.id === 'btn-start-workout') {
            var self = this;
            UI.showGymModal(function(gymId) {
                var gymKey = 'wt_gym_' + self._currentWeek + '_' + self._currentDay;
                sessionStorage.setItem(gymKey, gymId || '');
                if (gymId) {
                    Storage.touchGym(gymId);
                    if (Storage.gymHasEquipmentMap(gymId)) {
                        Storage.applyGymEquipment(gymId);
                    } else {
                        // First time at this gym — auto-save current equipment
                        Storage.initGymFromCurrentEquipment(gymId);
                    }
                    self.startWorkoutTimer();
                    UI.renderDay(self._currentWeek, self._currentDay);
                } else {
                    self.startWorkoutTimer();
                    UI.renderDay(self._currentWeek, self._currentDay);
                }
            });
            return;
        }

        if (target.id === 'btn-pause-workout') {
            this.pauseWorkoutTimer();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        if (target.id === 'btn-resume-workout') {
            this.unpauseWorkoutTimer();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        if (target.id === 'btn-cancel-workout') {
            this.cancelWorkoutTimer();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Add set button
        if (target.matches('.add-set-btn') || target.closest('.add-set-btn')) {
            const btn = target.matches('.add-set-btn') ? target : target.closest('.add-set-btn');
            const exId = btn.dataset.exercise;
            this._addSet(exId);
            return;
        }

        // Remove set button
        if (target.matches('.remove-set-btn') || target.closest('.remove-set-btn')) {
            const btn = target.matches('.remove-set-btn') ? target : target.closest('.remove-set-btn');
            const exId = btn.dataset.exercise;
            this._removeSet(exId);
            return;
        }

        // Exercise name tap — no-op (names are standardized from Hevy DB)

        // Equipment button — show equipment picker
        if (target.matches('.equipment-btn') || target.closest('.equipment-btn')) {
            const btn = target.matches('.equipment-btn') ? target : target.closest('.equipment-btn');
            const exId = btn.dataset.exercise;
            UI.showEquipmentModal(exId, btn.dataset.exname || '', btn.dataset.exnameRu || '');
            return;
        }


        // Substitution modal — select exercise from list (must be before eq-option handler)
        if (target.matches('.sub-option') || target.closest('.sub-option')) {
            const opt = target.matches('.sub-option') ? target : target.closest('.sub-option');
            const exId = opt.dataset.targetExercise;
            const subName = opt.dataset.subName;
            Storage.setSubstitution(exId, subName);
            UI.hideSubstitutionModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Substitution modal — add custom name
        if (target.id === 'sub-add-custom-btn' || target.closest('#sub-add-custom-btn')) {
            const input = document.getElementById('sub-custom-name');
            const name = input ? input.value.trim() : '';
            if (!name) return;
            const modal = document.getElementById('substitution-modal');
            const exId = modal ? modal._exerciseId : null;
            if (exId) {
                Storage.setSubstitution(exId, name);
                UI.hideSubstitutionModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return;
        }

        // Substitution modal — revert to original
        if (target.matches('.sub-revert-btn') || target.closest('.sub-revert-btn')) {
            const btn = target.matches('.sub-revert-btn') ? target : target.closest('.sub-revert-btn');
            const exId = btn.dataset.exercise;
            Storage.removeSubstitution(exId);
            UI.hideSubstitutionModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Substitution modal — close button or overlay
        if (target.id === 'sub-close-btn' || target.closest('#sub-close-btn') || target.id === 'substitution-modal') {
            UI.hideSubstitutionModal();
            return;
        }

        // Gym modal — select gym
        if ((target.matches('.eq-option[data-gym-id]') || target.closest('.eq-option[data-gym-id]')) && target.closest('#gym-modal')) {
            var opt = target.matches('.eq-option[data-gym-id]') ? target : target.closest('.eq-option[data-gym-id]');
            var gymId = opt.dataset.gymId || null;
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            UI.hideGymModal();
            if (onSelect) onSelect(gymId);
            return;
        }

        // Gym modal — select shared gym suggestion
        if (target.closest('.gym-shared-item')) {
            var item = target.closest('.gym-shared-item');
            var sharedName = item.dataset.name;
            var sharedCity = item.dataset.city || '';
            if (sharedName) {
                var newId = Storage.addGym(sharedName, null, null, sharedCity);
                var modal = document.getElementById('gym-modal');
                var onSelect = modal ? modal._onSelect : null;
                UI.hideGymModal();
                if (onSelect) onSelect(newId);
            }
            return;
        }

        // Gym modal — add new gym
        if (target.id === 'gym-add-btn' || target.closest('#gym-add-btn')) {
            var input = document.getElementById('gym-new-name');
            var name = input ? input.value.trim() : '';
            if (!name) return;
            // Show city prompt
            var prompt = document.getElementById('gym-city-prompt');
            if (prompt) {
                prompt.style.display = 'flex';
                var cityInput = document.getElementById('gym-new-city');
                if (cityInput) { cityInput.value = ''; cityInput.focus(); }
            }
            return;
        }

        // Gym modal — confirm city and save
        if (target.id === 'gym-city-ok' || target.closest('#gym-city-ok')) {
            var input = document.getElementById('gym-new-name');
            var cityInput = document.getElementById('gym-new-city');
            var name = input ? input.value.trim() : '';
            var city = cityInput ? cityInput.value.trim() : '';
            if (!name) return;
            var newId = Storage.addGym(name, App._lastGeoPos ? App._lastGeoPos.lat : null, App._lastGeoPos ? App._lastGeoPos.lng : null, city);
            // Save to shared database
            if (typeof Social !== 'undefined' && city) {
                Social.addSharedGym(name, city).catch(function() {});
            }
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            UI.hideGymModal();
            if (onSelect) onSelect(newId);
            return;
        }

        // Gym modal — close on overlay
        if (target.id === 'gym-modal') {
            UI.hideGymModal();
            return;
        }

        // Gym geo suggestion — Yes
        if (target.id === 'gym-geo-yes') {
            var gymId = target.dataset.gymId;
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            UI.hideGymModal();
            if (onSelect) onSelect(gymId);
            return;
        }

        // Gym geo suggestion — No
        if (target.id === 'gym-geo-no') {
            var el = document.getElementById('gym-geo-suggestion');
            if (el) el.style.display = 'none';
            return;
        }

        // Gym link prompt — Yes (link current equipment to gym)
        if (target.id === 'gym-link-yes') {
            var gymId = target.dataset.gymId;
            Storage.initGymFromCurrentEquipment(gymId);
            UI.hideGymModal();
            this.startWorkoutTimer();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Gym link prompt — No (skip linking)
        if (target.id === 'gym-link-no') {
            var gymId = target.dataset.gymId;
            UI.hideGymModal();
            this.startWorkoutTimer();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Choice modal: select option (must be before eq-option handler)
        if (target.matches('.eq-option[data-choice-key]') || target.closest('.eq-option[data-choice-key]')) {
            const opt = target.matches('.eq-option[data-choice-key]') ? target : target.closest('.eq-option[data-choice-key]');
            const choiceKey = opt.dataset.choiceKey;
            const exerciseId = opt.dataset.exerciseId;
            Storage.saveChoice(choiceKey, exerciseId);
            UI.hideChoiceModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — ignore clicks on inputs
        if (target.closest('#equipment-modal') && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            return;
        }

        // Equipment modal — select option
        if (target.matches('.eq-option') || target.closest('.eq-option')) {
            const opt = target.matches('.eq-option') ? target : target.closest('.eq-option');
            const eqId = opt.dataset.eqId;
            const exId = opt.dataset.exercise;
            Storage.setExerciseEquipment(exId, eqId || null);
            var activeGym = this._getActiveGymId();
            if (activeGym && eqId) Storage.setGymExerciseEquipment(activeGym, exId, eqId);
            // Share to gym_equipment
            if (eqId) this._shareToGymEquipment(exId, Storage.getEquipmentById(eqId));
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — add new custom
        if (target.id === 'eq-add-btn' || target.closest('#eq-add-btn')) {
            const input = document.getElementById('eq-new-name');
            const name = input ? input.value.trim() : '';
            if (!name) return;
            const modal = document.getElementById('equipment-modal');
            const exId = modal ? modal._exerciseId : null;
            const muscleGroup = modal ? modal._muscleGroup : null;
            const newId = Storage.addEquipment(name);
            if (typeof Social !== 'undefined' && muscleGroup && muscleGroup !== 'all') {
                Social.addSharedEquipment(name, muscleGroup).catch(function() {});
            }
            if (exId) {
                Storage.setExerciseEquipment(exId, newId);
                var activeGym = this._getActiveGymId();
                if (activeGym) Storage.setGymExerciseEquipment(activeGym, exId, newId);
                this._shareToGymEquipment(exId, { name: name });
                UI.hideEquipmentModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return;
        }

        // Equipment modal — click search result (catalog or shared)
        if (target.closest('.eq-search-item')) {
            var item = target.closest('.eq-search-item');
            var eqName = item.dataset.name;
            var catalogId = item.dataset.catalogId ? parseInt(item.dataset.catalogId) : null;
            if (!eqName) return;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var muscleGroup = modal ? modal._muscleGroup : null;
            var eqImageUrl2 = item.dataset.image || null;
            var newId = Storage.addEquipment(eqName, undefined, eqImageUrl2);
            if (typeof Social !== 'undefined' && muscleGroup && muscleGroup !== 'all') {
                Social.addSharedEquipment(eqName, muscleGroup).catch(function() {});
            }
            if (exId) {
                Storage.setExerciseEquipment(exId, newId);
                var activeGym = this._getActiveGymId();
                if (activeGym) Storage.setGymExerciseEquipment(activeGym, exId, newId);
                this._shareToGymEquipment(exId, { name: eqName, catalogId: catalogId });
            }
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — click gym equipment item
        if (target.closest('.eq-gym-item')) {
            var item = target.closest('.eq-gym-item');
            var eqName = item.dataset.name;
            if (!eqName) return;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var newId = Storage.addEquipment(eqName);
            if (exId) {
                Storage.setExerciseEquipment(exId, newId);
                var activeGym = this._getActiveGymId();
                if (activeGym) Storage.setGymExerciseEquipment(activeGym, exId, newId);
            }
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — brand click → show brand equipment
        if (target.closest('.eq-brand-item')) {
            var brandItem = target.closest('.eq-brand-item');
            var brand = brandItem.dataset.brand;
            var extype = brandItem.dataset.extype || null;
            if (brand) this._loadBrandEquipment(brand, extype);
            return;
        }

        // Equipment modal — back to brands
        if (target.id === 'eq-brand-back' || target.closest('#eq-brand-back')) {
            this._eqBackToBrands();
            return;
        }

        // Equipment modal — select from catalog
        if (target.closest('.eq-catalog-item')) {
            var catItem = target.closest('.eq-catalog-item');
            var eqName = catItem.dataset.name;
            var catalogId = catItem.dataset.catalogId ? parseInt(catItem.dataset.catalogId) : null;
            if (!eqName) return;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var eqImageUrl = catItem.dataset.image || null;
            var newId = Storage.addEquipment(eqName, undefined, eqImageUrl);
            if (exId) {
                Storage.setExerciseEquipment(exId, newId);
                Storage.linkEquipmentToExercise(exId, newId);
                var activeGym = this._getActiveGymId();
                if (activeGym) Storage.setGymExerciseEquipment(activeGym, exId, newId);
                this._shareToGymEquipment(exId, { name: eqName, catalogId: catalogId });
            }
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — remove current equipment
        if (target.id === 'eq-remove-btn' || target.closest('#eq-remove-btn')) {
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            if (exId) {
                Storage.removeExerciseEquipment(exId);
                var row = document.getElementById('eq-current-row');
                if (row) row.remove();
            }
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — close on overlay or X button
        if (target.id === 'eq-close' || target.closest('#eq-close')) {
            UI.hideEquipmentModal();
            return;
        }
        if (target.id === 'equipment-modal') {
            // Ignore phantom overlay clicks from iOS input focus (within 600ms)
            var modal = document.getElementById('equipment-modal');
            if (modal && modal._inputFocusedAt && (Date.now() - modal._inputFocusedAt < 600)) return;
            UI.hideEquipmentModal();
            return;
        }

        // Complete button
        if (target.matches('.complete-btn') || target.closest('.complete-btn')) {
            const btn = target.matches('.complete-btn') ? target : target.closest('.complete-btn');
            const exId = btn.dataset.exercise;
            const setIdx = parseInt(btn.dataset.set);
            const eqId = Storage.getExerciseEquipment(exId);

            // Get current input values
            const row = btn.closest('.set-row');
            const weightInput = row.querySelector('.weight-input');
            const repsInput = row.querySelector('.reps-input');
            const weight = parseFloat(String(weightInput.value).replace(',', '.')) || parseFloat(String(weightInput.placeholder).replace(',', '.')) || 0;
            const reps = parseInt(repsInput.value) || parseInt(repsInput.placeholder) || 0;

            const existing = Storage.getSetLog(this._currentWeek, this._currentDay, exId, setIdx);
            if (existing && existing.completed) {
                // Uncomplete
                Storage.toggleSetComplete(this._currentWeek, this._currentDay, exId, setIdx, eqId);
                btn.classList.remove('completed');
                row.classList.remove('done');
                btn.innerHTML = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18.5" stroke="rgba(157,141,245,0.4)" stroke-width="1.5"/></svg>';
            } else {
                // Complete with values
                if (weight > 0) {
                    weightInput.value = weight;
                }
                if (reps > 0) {
                    repsInput.value = reps;
                }
                Storage.saveSetLog(this._currentWeek, this._currentDay, exId, setIdx, weight, reps, eqId);
                // Passive gym-equipment learning
                var activeGym = this._getActiveGymId();
                if (activeGym && eqId) {
                    Storage.setGymExerciseEquipment(activeGym, exId, eqId);
                    this._shareToGymEquipment(exId, Storage.getEquipmentById(eqId));
                }

                // Explicitly save all drop set / segment values from DOM
                row.querySelectorAll('.seg-weight-input[data-seg]').forEach(inp => {
                    var si = parseInt(inp.dataset.seg);
                    if (si > 0 && inp.value) Storage.saveSegWeight(this._currentWeek, this._currentDay, exId, setIdx, si, inp.value);
                });
                row.querySelectorAll('.seg-reps-input[data-seg]').forEach(inp => {
                    var si = parseInt(inp.dataset.seg);
                    if (si > 0 && inp.value) Storage.saveSegReps(this._currentWeek, this._currentDay, exId, setIdx, si, inp.value);
                });

                btn.classList.add('completed');
                const gid = `cg-${exId}-${setIdx}`;
                btn.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#${gid})"/><g transform="translate(11,11)"><path d="M4 9l3.5 3.5L14 5.5" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
                btn.classList.add('pop');
                btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
                row.classList.add('done');

                // Check if workout is 100% complete — show finish button
                var progress = getCompletedSets(this._currentWeek, this._currentDay);
                if (progress.total > 0 && progress.completed >= progress.total) {
                    this._showFinishButton();
                } else {
                    RestTimer.start(row);
                }
            }
            return;
        }

        // Choose one: tap exercise name to open selector
        if (target.matches('.exercise-name-chooser') || target.closest('.exercise-name-chooser')) {
            const el = target.matches('.exercise-name-chooser') ? target : target.closest('.exercise-name-chooser');
            UI.showChoiceModal(el.dataset.choiceKey);
            return;
        }

        // Choice modal: close on overlay
        if (target.id === 'choice-modal') {
            UI.hideChoiceModal();
            return;
        }

        // History button
        if (target.matches('.history-btn') || target.closest('.history-btn')) {
            const btn = target.matches('.history-btn') ? target : target.closest('.history-btn');
            const exId = btn.dataset.exercise;
            location.hash = `#/history/${encodeURIComponent(exId)}`;
            return;
        }

        // Export
        if (target.id === 'btn-export') {
            const data = Storage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workout-data-${formatDateISO(new Date())}.json`;
            a.click();
            URL.revokeObjectURL(url);
            return;
        }

        // Import
        if (target.id === 'btn-import') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (Storage.importData(e.target.result)) {
                        alert('Данные импортированы!');
                        this.route();
                    } else {
                        alert('Ошибка импорта файла');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
            return;
        }

    },

    handleInput(e) {
        const target = e.target;

        // Weight input
        if (target.matches('.weight-input')) {
            const exId = target.dataset.exercise;
            const setIdx = parseInt(target.dataset.set);
            this._saveDebounced(this._currentWeek, this._currentDay, exId, setIdx, 'weight', target.value);
            return;
        }

        // Reps input
        if (target.matches('.reps-input')) {
            const exId = target.dataset.exercise;
            const setIdx = parseInt(target.dataset.set);
            this._saveDebounced(this._currentWeek, this._currentDay, exId, setIdx, 'reps', target.value);
            return;
        }

        // Extra segment reps (seg > 0)
        if (target.matches('.seg-reps-input') && parseInt(target.dataset.seg) > 0) {
            const exId = target.dataset.exercise;
            const setIdx = parseInt(target.dataset.set);
            const segIdx = parseInt(target.dataset.seg);
            Storage.saveSegReps(this._currentWeek, this._currentDay, exId, setIdx, segIdx, target.value);
            return;
        }

        // Extra segment weight (seg > 0)
        if (target.matches('.seg-weight-input') && parseInt(target.dataset.seg) > 0) {
            const exId = target.dataset.exercise;
            const setIdx = parseInt(target.dataset.set);
            const segIdx = parseInt(target.dataset.seg);
            Storage.saveSegWeight(this._currentWeek, this._currentDay, exId, setIdx, segIdx, target.value);
            return;
        }

        // Equipment search
        if (target.id === 'eq-search') {
            var query = target.value.trim();
            this._searchEquipment(query);
            return;
        }

        // Gym modal — filter shared gyms as user types
        if (target.id === 'gym-new-name') {
            var query = target.value.trim().toLowerCase();
            this._renderSharedGyms(query);
            return;
        }

    },

    handleFocus(e) {
        const target = e.target;

        // Move cursor to end so backspace works naturally
        if (target.matches('.weight-input') || target.matches('.reps-input') ||
            target.matches('.seg-reps-input') || target.matches('.seg-weight-input')) {
            requestAnimationFrame(() => {
                const len = target.value.length;
                target.setSelectionRange(len, len);
            });
        }
    },

    _findExerciseInProgram(exerciseId) {
        if (!PROGRAM) return null;
        for (var dNum in PROGRAM.dayTemplates) {
            var groups = PROGRAM.dayTemplates[dNum].exerciseGroups || [];
            for (var g = 0; g < groups.length; g++) {
                var gr = groups[g];
                if (gr.exercise && gr.exercise.id === exerciseId) return gr.exercise;
                if (gr.exercises) {
                    for (var j = 0; j < gr.exercises.length; j++) {
                        if (gr.exercises[j].id === exerciseId) return gr.exercises[j];
                    }
                }
                if (gr.options) {
                    for (var o = 0; o < gr.options.length; o++) {
                        if (gr.options[o].id === exerciseId) return gr.options[o];
                    }
                }
            }
        }
        return null;
    },

    _addSet(exerciseId) {
        var ex = this._findExerciseInProgram(exerciseId);
        if (!ex) return;
        var lastSet = ex.sets[ex.sets.length - 1] || { type: 'H', rpe: '8', techniques: [] };
        ex.sets.push({ type: lastSet.type, rpe: lastSet.rpe, techniques: lastSet.techniques ? lastSet.techniques.slice() : [] });
        Storage.saveProgram(PROGRAM, false);
        UI.renderDay(this._currentWeek, this._currentDay);
    },

    _removeSet(exerciseId) {
        var ex = this._findExerciseInProgram(exerciseId);
        if (!ex || ex.sets.length <= 1) return;
        ex.sets.pop();
        Storage.saveProgram(PROGRAM, false);
        UI.renderDay(this._currentWeek, this._currentDay);
    },


    _showFinishButton() {
        if (document.getElementById('finish-workout-btn')) return;
        var container = document.querySelector('.day-slide');
        if (!container) return;
        var btn = document.createElement('button');
        btn.id = 'finish-workout-btn';
        btn.className = 'btn-finish-workout';
        btn.textContent = 'ЗАВЕРШИТЬ ТРЕНИРОВКУ';
        container.appendChild(btn);
        setTimeout(function() { btn.classList.add('visible'); }, 50);
        var self = this;
        btn.addEventListener('click', function() {
            btn.remove();
            var elapsed = self._stopWorkoutTimer();
            Celebration.show(elapsed, self._currentWeek, self._currentDay);
        });
    },

    // Workout session timer
    _getTimerKey() {
        return 'wt_timer_' + this._currentWeek + '_' + this._currentDay;
    },

    _getPauseKey() {
        return this._getTimerKey() + '_paused';
    },

    startWorkoutTimer() {
        var key = this._getTimerKey();
        if (sessionStorage.getItem(key)) return; // already running
        sessionStorage.setItem(key, String(Date.now()));
        sessionStorage.removeItem(this._getPauseKey());
        this._startTimerDisplay();
    },

    pauseWorkoutTimer() {
        var pauseKey = this._getPauseKey();
        if (sessionStorage.getItem(pauseKey)) return; // already paused
        sessionStorage.setItem(pauseKey, String(Date.now()));
        if (this._workoutTimerInterval) {
            clearInterval(this._workoutTimerInterval);
            this._workoutTimerInterval = null;
        }
    },

    unpauseWorkoutTimer() {
        var key = this._getTimerKey();
        var pauseKey = this._getPauseKey();
        var pausedAt = parseInt(sessionStorage.getItem(pauseKey));
        if (!pausedAt) return;
        var startTime = parseInt(sessionStorage.getItem(key));
        if (startTime) {
            // Shift start forward by pause duration so elapsed stays correct
            var pauseDuration = Date.now() - pausedAt;
            sessionStorage.setItem(key, String(startTime + pauseDuration));
        }
        sessionStorage.removeItem(pauseKey);
        this._startTimerDisplay();
    },

    cancelWorkoutTimer() {
        if (this._workoutTimerInterval) {
            clearInterval(this._workoutTimerInterval);
            this._workoutTimerInterval = null;
        }
        sessionStorage.removeItem(this._getTimerKey());
        sessionStorage.removeItem(this._getPauseKey());
        sessionStorage.removeItem('wt_gym_' + this._currentWeek + '_' + this._currentDay);
    },

    _startTimerDisplay() {
        var self = this;
        if (this._workoutTimerInterval) clearInterval(this._workoutTimerInterval);
        var key = this._getTimerKey();
        var startTime = parseInt(sessionStorage.getItem(key));
        if (!startTime) return;
        this._updateTimerUI(startTime);
        this._workoutTimerInterval = setInterval(function() {
            self._updateTimerUI(startTime);
        }, 1000);
    },

    _updateTimerUI(startTime) {
        var el = document.getElementById('workout-timer');
        if (!el) return;
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        var h = Math.floor(elapsed / 3600);
        var m = Math.floor((elapsed % 3600) / 60);
        var s = elapsed % 60;
        el.textContent = (h > 0 ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },

    _stopWorkoutTimer() {
        var key = this._getTimerKey();
        var pauseKey = this._getPauseKey();
        var startTime = parseInt(sessionStorage.getItem(key));
        if (this._workoutTimerInterval) {
            clearInterval(this._workoutTimerInterval);
            this._workoutTimerInterval = null;
        }
        // Account for pause time
        var pausedAt = parseInt(sessionStorage.getItem(pauseKey));
        sessionStorage.removeItem(key);
        sessionStorage.removeItem(pauseKey);
        // Don't remove gym key here — needed for Celebration._pendingShare
        if (!startTime) return null;
        var end = pausedAt || Date.now();
        return Math.floor((end - startTime) / 1000);
    },

    isWorkoutTimerRunning() {
        return !!sessionStorage.getItem(this._getTimerKey());
    },

    isWorkoutTimerPaused() {
        return this.isWorkoutTimerRunning() && !!sessionStorage.getItem(this._getPauseKey());
    },

    _getTimerElapsed() {
        var startTime = parseInt(sessionStorage.getItem(this._getTimerKey()));
        if (!startTime) return 0;
        var pausedAt = parseInt(sessionStorage.getItem(this._getPauseKey()));
        var end = pausedAt || Date.now();
        return Math.floor((end - startTime) / 1000);
    },

    resumeWorkoutTimer() {
        if (this.isWorkoutTimerRunning() && !this.isWorkoutTimerPaused()) {
            this._startTimerDisplay();
        }
    },

    // ===== Gym helpers =====

    _lastGeoPos: null,

    _showGymLinkPrompt(gymId, gymName) {
        var prompt = document.getElementById('gym-link-prompt');
        if (!prompt) {
            // Modal already closed, just start
            this.startWorkoutTimer();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }
        prompt.style.display = 'block';
        prompt.innerHTML = '<div class="gym-geo-card">'
            + '<span>Привязать оборудование к <b>' + gymName + '</b>?</span>'
            + '<div class="gym-geo-btns">'
            + '<button class="gym-geo-yes" id="gym-link-yes" data-gym-id="' + gymId + '">Да</button>'
            + '<button class="gym-geo-no" id="gym-link-no" data-gym-id="' + gymId + '">Нет</button>'
            + '</div></div>';
    },

    _sharedGymsCache: null,
    _sharedEquipmentCache: null,

    _loadSharedGyms() {
        if (typeof Social === 'undefined') return;
        var self = this;
        Social.searchSharedGyms('').then(function(gyms) {
            self._sharedGymsCache = gyms || [];
            self._renderSharedGyms('');
        }).catch(function() {});
    },

    _renderSharedGyms(query) {
        var resultsDiv = document.getElementById('gym-shared-results');
        if (!resultsDiv) return;
        var gyms = this._sharedGymsCache || [];
        var myGyms = Storage.getGyms();
        var myNames = {};
        for (var i = 0; i < myGyms.length; i++) myNames[myGyms[i].name.toLowerCase()] = true;
        var filtered = gyms.filter(function(g) { return !myNames[g.name.toLowerCase()]; });
        if (!filtered.length) { resultsDiv.innerHTML = ''; return; }
        var html = '<div class="gym-shared-label">Залы из базы:</div>';
        for (var i = 0; i < filtered.length; i++) {
            html += '<div class="gym-shared-item" data-name="' + filtered[i].name.replace(/"/g, '&quot;') + '" data-city="' + (filtered[i].city || '').replace(/"/g, '&quot;') + '">'
                + '<span class="gym-shared-name">' + filtered[i].name + '</span>'
                + '<span class="gym-shared-city">' + (filtered[i].city || '') + '</span>'
                + '</div>';
        }
        resultsDiv.innerHTML = html;
    },

    _loadEquipmentBrands(exerciseId) {
        if (typeof Social === 'undefined') return;
        var modal = document.getElementById('equipment-modal');
        if (!modal) return;
        var exName = modal._exerciseName || '';
        var exNameRu = modal._exerciseNameRu || '';
        var exType = exName ? this._getExerciseType(exName) : null;
        var isFreeWeight = this._isFreeWeightExercise(exName, exNameRu);
        modal._exerciseType = exType;
        modal._isFreeWeight = isFreeWeight;

        // Load gym equipment for this exercise (from gym_equipment table)
        var activeGymId = this._getActiveGymId();
        var gym = activeGymId ? Storage.getGymById(activeGymId) : null;
        var gymPromise = (gym && gym.city && exName)
            ? Social.getGymEquipmentForExercise(gym.name, gym.city, exName)
            : Promise.resolve([]);

        // Skip machine catalog for free weight exercises (barbell, dumbbell, etc.)
        var brandsPromise = isFreeWeight ? Promise.resolve([]) : Social.getCatalogBrands(exType);

        Promise.all([gymPromise, brandsPromise]).then(function(results) {
            var gymItems = results[0] || [];
            var brands = results[1] || [];
            if (!document.getElementById('equipment-modal')) return;

            // Render gym section
            var gymSection = document.getElementById('eq-gym-section');
            if (gymSection && gymItems.length > 0) {
                var gymHtml = '<div class="eq-section-label">В этом зале:</div>';
                for (var i = 0; i < gymItems.length; i++) {
                    gymHtml += '<div class="eq-gym-item" data-name="' + gymItems[i].replace(/"/g, '&quot;') + '">'
                        + '<span class="eq-shared-name">' + gymItems[i] + '</span>'
                        + '</div>';
                }
                gymSection.innerHTML = gymHtml;
            }

            // Render brands
            var brandsSection = document.getElementById('eq-brands-section');
            if (brandsSection) {
                if (brands.length > 0) {
                    var bHtml = '<div class="eq-section-label">Каталог:</div>';
                    var et = exType || '';
                    for (var i = 0; i < brands.length; i++) {
                        bHtml += '<div class="eq-brand-item" data-brand="' + brands[i].replace(/"/g, '&quot;') + '" data-extype="' + et + '">'
                            + '<span class="eq-brand-name">' + brands[i] + '</span>'
                            + '<span class="eq-brand-arrow">\u203A</span>'
                            + '</div>';
                    }
                    brandsSection.innerHTML = bHtml;
                } else {
                    brandsSection.innerHTML = '';
                }
            }
        }).catch(function() {});
    },

    _loadBrandEquipment(brand, exerciseType) {
        var modal = document.getElementById('equipment-modal');
        if (!modal) return;
        var exType = exerciseType || modal._exerciseType || null;

        // Show brand content, hide main
        var mainContent = document.getElementById('eq-main-content');
        var brandContent = document.getElementById('eq-brand-content');
        var addRow = document.getElementById('eq-add-row');
        var searchRow = modal.querySelector('.eq-search-row');
        if (mainContent) mainContent.style.display = 'none';
        if (brandContent) brandContent.style.display = '';
        if (addRow) addRow.style.display = 'none';
        if (searchRow) searchRow.style.display = 'none';

        // Fix brand list height: disable modal scroll, let brand-content scroll
        var eqModal = modal.querySelector('.equipment-modal');
        if (eqModal) {
            eqModal.style.maxHeight = '90vh';
            eqModal.style.minHeight = '0';
            eqModal.style.overflow = 'hidden';
        }
        if (brandContent) {
            brandContent.style.overflowY = 'auto';
            brandContent.style.webkitOverflowScrolling = 'touch';
            brandContent.style.flex = '1';
            brandContent.style.minHeight = '0';
        }

        var brandList = document.getElementById('eq-brand-list');
        if (brandList) brandList.innerHTML = '<div class="eq-section-label">Загрузка...</div>';

        // Update header
        var header = modal.querySelector('.eq-modal-header h3');
        if (header) header.textContent = brand;

        Social.getCatalogByBrandAndType(brand, exType).then(function(items) {
            if (!document.getElementById('equipment-modal')) return;
            var div = document.getElementById('eq-brand-list');
            if (!div) return;
            if (!items || !items.length) {
                div.innerHTML = '<div class="eq-section-label">Нет тренажёров для этого упражнения</div>';
                return;
            }
            var html = '';
            for (var i = 0; i < items.length; i++) {
                var c = items[i];
                var fullName = brand + ' ' + c.name;
                var eqImgHtml = c.image_url ? '<img class="ex-thumb" src="' + c.image_url + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '';
                html += '<div class="eq-catalog-item" data-name="' + fullName.replace(/"/g, '&quot;') + '" data-catalog-id="' + c.id + '"' + (c.image_url ? ' data-image="' + c.image_url.replace(/"/g, '&quot;') + '"' : '') + '>'
                    + eqImgHtml
                    + '<span class="eq-shared-name">' + c.name + '</span>'
                    + (c.model ? '<span class="eq-catalog-model">' + c.model + '</span>' : '')
                    + '</div>';
            }
            div.innerHTML = html;
        }).catch(function() {
            var div = document.getElementById('eq-brand-list');
            if (div) div.innerHTML = '<div class="eq-section-label">Ошибка загрузки</div>';
        });
    },

    _eqBackToBrands() {
        var modal = document.getElementById('equipment-modal');
        if (!modal) return;
        var mainContent = document.getElementById('eq-main-content');
        var brandContent = document.getElementById('eq-brand-content');
        var addRow = document.getElementById('eq-add-row');
        var searchRow = modal.querySelector('.eq-search-row');
        if (mainContent) mainContent.style.display = '';
        if (brandContent) brandContent.style.display = 'none';
        if (addRow) addRow.style.display = '';
        if (searchRow) searchRow.style.display = '';
        // Restore modal size
        var eqModal = modal.querySelector('.equipment-modal');
        if (eqModal) {
            eqModal.style.maxHeight = '';
            eqModal.style.minHeight = '';
            eqModal.style.overflow = '';
        }
        if (brandContent) {
            brandContent.style.overflowY = '';
            brandContent.style.webkitOverflowScrolling = '';
            brandContent.style.flex = '';
            brandContent.style.minHeight = '';
        }
        var header = modal.querySelector('.eq-modal-header h3');
        if (header) header.textContent = 'Оборудование';
    },

    // Exercise name → equipment exercise_type in catalog
    _exerciseTypeMap: {
        // Chest
        'chest press': 'chest_press', 'iso-lateral chest press': 'chest_press',
        'incline chest press': 'incline_press',
        'decline bench press': 'decline_press',
        'bench press': 'bench', 'incline bench press': 'incline_press',
        'floor press': 'bench', 'hex press': 'bench',
        'chest fly': 'chest_fly', 'butterfly': 'chest_fly', 'chest dip': 'chest_dip',
        'cable crossover': 'chest_fly', 'single arm cable crossover': 'chest_fly',
        'pullover': 'pullover',
        // Back
        'lat pulldown': 'lat_pulldown', 'pull up': 'lat_pulldown', 'chin up': 'lat_pulldown',
        'seated row': 'seated_row', 'seated cable row': 'seated_row',
        'iso-lateral row': 'seated_row', 'iso-lateral high row': 'seated_row',
        'iso-lateral low row': 'seated_row', 'low row': 'seated_row',
        'cable row': 'seated_row', 'single arm cable row': 'seated_row',
        'bent over row': 'seated_row', 't bar row': 'seated_row',
        'supported bar rows': 'seated_row', 'chest supported incline row': 'seated_row',
        'back extension': 'back_extension', 'hyperextension': 'back_extension',
        'deadlift': 'deadlift', 'romanian deadlift': 'deadlift', 'straight leg deadlift': 'deadlift',
        // Legs
        'leg press': 'leg_press', 'leg press horizontal': 'leg_press', 'single leg press': 'leg_press',
        'leg extension': 'leg_extension', 'single leg extensions': 'leg_extension',
        'leg curl': 'leg_curl', 'lying leg curl': 'lying_leg_curl', 'seated leg curl': 'seated_leg_curl',
        'hip abduction': 'hip_abduction',
        'hip adduction': 'hip_adduction',
        'glute kickback': 'glute_kickback', 'rear kick': 'glute_kickback',
        'hip thrust': 'hip_thrust', 'glute bridge': 'hip_thrust',
        'hack squat': 'squat', 'squat': 'squat', 'belt squat': 'squat',
        'pendulum squat': 'squat', 'bulgarian split squat': 'squat',
        'calf raise': 'calf', 'calf extension': 'calf', 'calf press': 'calf',
        'standing calf raise': 'calf', 'seated calf raise': 'calf',
        'tibial raises': 'calf', 'tibial raise': 'calf',
        'medium gluteus on low pulley': 'hip_abduction', 'cable hip abduction': 'hip_abduction',
        // Shoulders
        'shoulder press': 'shoulder_press', 'overhead press': 'shoulder_press',
        'lateral raise': 'lateral_raise',
        'rear delt': 'rear_delt', 'rear delt reverse fly': 'rear_delt', 'face pull': 'rear_delt',
        // Arms
        'bicep curl': 'bicep_curl', 'hammer curl': 'bicep_curl', 'concentration curl': 'bicep_curl',
        'preacher curl': 'preacher_curl',
        'triceps extension': 'tricep_extension', 'triceps pushdown': 'tricep_extension',
        'skull crusher': 'tricep_extension',
        'triceps dip': 'tricep_dip', 'seated dip machine': 'chest_dip',
        // Core
        'crunch': 'crunch', 'sit up': 'crunch',
        'torso rotation': 'torso_rotation',
        'hanging knee raise': 'crunch', 'leg raise': 'crunch',
    },

    // Returns equipment modifier from parenthetical: barbell, dumbbell, machine, cable, etc.
    _getEquipmentModifier(exerciseName) {
        var m = exerciseName.match(/\(([^)]+)\)/);
        if (!m) return null;
        return m[1].toLowerCase().trim();
    },

    // Returns true if exercise uses free weights / bodyweight (no machine catalog needed)
    _isFreeWeightExercise(exerciseEnName, exerciseRuName) {
        // Check English name
        var mod = this._getEquipmentModifier(exerciseEnName || '');
        if (mod) {
            var freeTypes = ['barbell', 'dumbbell', 'bodyweight', 'band', 'resistance band', 'kettlebell', 'plate', 'ez bar', 'trap bar'];
            for (var i = 0; i < freeTypes.length; i++) {
                if (mod === freeTypes[i]) return true;
            }
        }
        // Check Russian name
        var modRu = this._getEquipmentModifier(exerciseRuName || '');
        if (modRu) {
            var freeRu = ['со штангой', 'с гантелями', 'с гантелью', 'с гирей', 'с резиной', 'с диском', 'с собственным весом', 'штанга', 'гантели'];
            for (var i = 0; i < freeRu.length; i++) {
                if (modRu === freeRu[i]) return true;
            }
        }
        return false;
    },

    _getExerciseType(exerciseName) {
        var nameLower = exerciseName.toLowerCase();
        // Equipment type from parenthetical: (Smith Machine), (Machine), (Cable) etc.
        if (nameLower.indexOf('(smith machine)') !== -1) return 'smith_machine';
        var core = exerciseName.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        // Try exact match first, then progressively shorter
        if (this._exerciseTypeMap[core]) return this._exerciseTypeMap[core];
        // Try without modifiers
        var mods = ['iso-lateral ', 'single leg ', 'single arm ', 'one arm ', 'standing ', 'seated ', 'lying ', 'prone ', 'kneeling ', 'close grip ', 'wide grip ', 'feet up '];
        var stripped = core;
        for (var i = 0; i < mods.length; i++) stripped = stripped.replace(mods[i], '');
        stripped = stripped.replace(/\s+/g, ' ').trim();
        if (this._exerciseTypeMap[stripped]) return this._exerciseTypeMap[stripped];
        // Try last resort: check if any key is contained in the core
        for (var key in this._exerciseTypeMap) {
            if (core.indexOf(key) !== -1) return this._exerciseTypeMap[key];
        }
        return null;
    },

    _eqSearchTimer: null,

    _searchEquipment(query) {
        var resultsDiv = document.getElementById('eq-search-results');
        if (!resultsDiv) return;
        if (!query || query.length < 2) { resultsDiv.innerHTML = ''; return; }
        var ql = query.toLowerCase();

        // Instant: show local equipment matches
        var html = '';
        var seen = {};
        var myEq = Storage.getEquipmentList();
        for (var i = 0; i < myEq.length; i++) {
            if (myEq[i].name.toLowerCase().indexOf(ql) !== -1) {
                var k = myEq[i].name.toLowerCase().trim();
                if (seen[k]) continue;
                seen[k] = true;
                html += '<div class="eq-search-item" data-name="' + myEq[i].name.replace(/"/g, '&quot;') + '">'
                    + '<span class="eq-shared-name">' + myEq[i].name + '</span></div>';
            }
        }
        resultsDiv.innerHTML = html || '<div class="eq-search-empty">Поиск...</div>';

        // Debounced: live query catalog + shared
        clearTimeout(this._eqSearchTimer);
        var modal = document.getElementById('equipment-modal');
        var muscleGroup = modal ? modal._muscleGroup : 'all';
        var self = this;

        var isFreeWeight = modal ? modal._isFreeWeight : false;
        this._eqSearchTimer = setTimeout(function() {
            if (typeof Social === 'undefined') return;
            var promises = [
                isFreeWeight ? Promise.resolve([]) : Social.searchCatalog(query, muscleGroup !== 'all' ? muscleGroup : null),
                Social.searchSharedEquipment(query, muscleGroup !== 'all' ? muscleGroup : null)
            ];
            Promise.all(promises).then(function(results) {
                var catalog = results[0] || [];
                var shared = results[1] || [];
                // Check if search query is still the same
                var input = document.getElementById('eq-search');
                if (!input || input.value.trim() !== query) return;
                var div = document.getElementById('eq-search-results');
                if (!div) return;

                var html2 = '';
                var seen2 = {};
                // Re-add local matches (deduplicated)
                for (var i = 0; i < myEq.length; i++) {
                    if (myEq[i].name.toLowerCase().indexOf(ql) !== -1) {
                        var lk = myEq[i].name.toLowerCase().trim();
                        if (seen2[lk]) continue;
                        seen2[lk] = true;
                        html2 += '<div class="eq-search-item" data-name="' + myEq[i].name.replace(/"/g, '&quot;') + '">'
                            + '<span class="eq-shared-name">' + myEq[i].name + '</span></div>';
                    }
                }
                // Catalog results
                for (var i = 0; i < catalog.length; i++) {
                    var c = catalog[i];
                    var cName = (c.brand ? c.brand + ' ' : '') + c.name;
                    var k = cName.toLowerCase();
                    if (seen2[k]) continue;
                    seen2[k] = true;
                    var sImgHtml = c.image_url ? '<img class="ex-thumb" src="' + c.image_url + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '';
                    html2 += '<div class="eq-search-item" data-name="' + cName.replace(/"/g, '&quot;') + '" data-catalog-id="' + c.id + '"' + (c.image_url ? ' data-image="' + c.image_url.replace(/"/g, '&quot;') + '"' : '') + '>'
                        + sImgHtml
                        + '<span class="eq-shared-name">' + cName + '</span>'
                        + (c.model ? '<span class="eq-catalog-model">' + c.model + '</span>' : '')
                        + '</div>';
                }
                // Shared results
                for (var i = 0; i < shared.length; i++) {
                    var k = shared[i].name.toLowerCase();
                    if (seen2[k]) continue;
                    seen2[k] = true;
                    html2 += '<div class="eq-search-item" data-name="' + shared[i].name.replace(/"/g, '&quot;') + '">'
                        + '<span class="eq-shared-name">' + shared[i].name + '</span></div>';
                }
                if (!html2) html2 = '<div class="eq-search-empty">Ничего не найдено</div>';
                div.innerHTML = html2;
            }).catch(function() {});
        }, 300);
    },

    _shareToGymEquipment(exerciseId, equipment) {
        if (typeof Social === 'undefined' || !equipment || !equipment.name) return;
        var activeGymId = this._getActiveGymId();
        if (!activeGymId) return;
        var gym = Storage.getGymById(activeGymId);
        if (!gym || !gym.city) return;
        // Get exercise name from modal or from program data
        var exerciseName = '';
        var modal = document.getElementById('equipment-modal');
        if (modal && modal._exerciseName) {
            exerciseName = modal._exerciseName;
        } else {
            var exInfo = this._findExerciseInProgram(exerciseId);
            if (exInfo) exerciseName = exInfo.name || exInfo.nameEn || '';
        }
        if (!exerciseName) return;
        Social.addGymEquipment(gym.name, gym.city, exerciseName, equipment.name, equipment.catalogId || null).catch(function() {});
    },

    _suggestNearbyGym() {
        if (!navigator.geolocation) return;
        var gyms = Storage.getGyms().filter(function(g) { return g.lat && g.lng; });
        if (!gyms.length) return;

        navigator.geolocation.getCurrentPosition(
            function(pos) {
                App._lastGeoPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                var nearest = null, minDist = Infinity;
                for (var i = 0; i < gyms.length; i++) {
                    var d = App._haversineDistance(pos.coords.latitude, pos.coords.longitude, gyms[i].lat, gyms[i].lng);
                    if (d < minDist) { minDist = d; nearest = gyms[i]; }
                }
                if (nearest && minDist < 500) {
                    var suggestion = document.getElementById('gym-geo-suggestion');
                    if (suggestion) {
                        suggestion.style.display = 'block';
                        suggestion.innerHTML = '<div class="gym-geo-card">'
                            + '<span>Ты в <b>' + nearest.name + '</b>?</span>'
                            + '<div class="gym-geo-btns">'
                            + '<button class="gym-geo-yes" id="gym-geo-yes" data-gym-id="' + nearest.id + '">Да</button>'
                            + '<button class="gym-geo-no" id="gym-geo-no">Нет</button>'
                            + '</div></div>';
                    }
                }
            },
            function() {},
            { timeout: 5000, maximumAge: 60000 }
        );
    },

    _haversineDistance(lat1, lon1, lat2, lon2) {
        var R = 6371000;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    _getActiveGymId() {
        if (!this._currentWeek || !this._currentDay) return null;
        return sessionStorage.getItem('wt_gym_' + this._currentWeek + '_' + this._currentDay) || null;
    }
};

/* ===== Workout Complete Celebration ===== */
const Celebration = {
    _colors: ['#9D8DF5', '#B5F22A', '#FF6D28', '#30D4C8', '#FF2D55', '#C3FF3C', '#4A96FF', '#fff'],
    _shapes: ['circle', 'star', 'square', 'diamond'],
    _phrases: [
        'Отличная работа!',
        'Ты — машина!',
        'Мощная тренировка!',
        'Так держать!',
        'Огонь!'
    ],

    show(elapsedSec, weekNum, dayNum) {
        if (document.querySelector('.celebration-overlay')) return;

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 150]);

        var phrase = this._phrases[Math.floor(Math.random() * this._phrases.length)];
        var timeText = '';
        if (elapsedSec && elapsedSec > 0) {
            var h = Math.floor(elapsedSec / 3600);
            var m = Math.floor((elapsedSec % 3600) / 60);
            if (h > 0) {
                timeText = '<p class="celeb-time">' + h + ' ч ' + m + ' мин</p>';
            } else {
                timeText = '<p class="celeb-time">' + m + ' мин</p>';
            }
        }

        // Share button (only for Supabase-authenticated users)
        var shareBtn = '';
        if (typeof Social !== 'undefined' && Social._hasSupaAuth()) {
            shareBtn = '<button class="celeb-share-btn" id="celeb-share">ПОДЕЛИТЬСЯ</button>';
        }

        var overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        overlay.innerHTML = '<div class="celebration-text">' +
            '<div class="celeb-icon-ring"><svg width="72" height="72" viewBox="0 0 72 72"><defs><linearGradient id="cg-done" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="36" cy="36" r="36" fill="url(#cg-done)"/><path d="M22 36l9 9 19-19" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
            '<p class="celeb-title">' + phrase + '</p>' +
            '<p class="celeb-sub">Тренировка завершена</p>' +
            timeText +
            shareBtn +
            '</div>';
        document.body.appendChild(overlay);

        this._launchConfetti();

        // Build workout summary for sharing
        if (weekNum && dayNum && typeof Social !== 'undefined' && Social._hasSupaAuth()) {
            var workout = resolveWorkout(weekNum, dayNum);
            var exercises = [];
            var totalSets = 0;
            // Build detailed exercise data with logged sets
            var buildExDetail = function(ex) {
                var name = exName(ex);
                var numSets = ex.sets ? ex.sets.length : 0;
                totalSets += numSets;
                var loggedSets = [];
                for (var si = 0; si < numSets; si++) {
                    var sl = Storage.getSetLog(weekNum, dayNum, ex.id, si);
                    if (sl && sl.completed) {
                        var setInfo = { weight: sl.weight || 0, reps: sl.reps || 0, unit: sl.unit || 'kg' };
                        if (sl.equipmentId) {
                            var eq = Storage.getEquipmentById(sl.equipmentId);
                            if (eq) setInfo.equipment = eq.name;
                        }
                        loggedSets.push(setInfo);
                    }
                }
                exercises.push({ name: name, sets: numSets, logged: loggedSets });
            };
            if (workout && workout.exerciseGroups) {
                workout.exerciseGroups.forEach(function(g) {
                    if (g.type === 'single' && g.exercise) {
                        buildExDetail(g.exercise);
                    } else if (g.type === 'superset' && g.exercises) {
                        g.exercises.forEach(function(item) {
                            buildExDetail(item.exercise || item);
                        });
                    } else if (g.type === 'choose_one' && g.exercises) {
                        var chosen = typeof getChosenExercise === 'function' ? getChosenExercise(g) : g.exercises[0];
                        if (chosen) buildExDetail(chosen);
                    }
                });
            }
            var dayTitle = workout ? (workout.titleRu || workout.title || '') : '';
            // Extract primary muscle group tag from title
            var muscleGroup = '';
            var t = dayTitle.toLowerCase();
            if (t.indexOf('ягодиц') !== -1 || t.indexOf('glute') !== -1) muscleGroup = 'Ягодицы';
            if (t.indexOf('бедр') !== -1 || t.indexOf('квадри') !== -1 || t.indexOf('ног') !== -1 || t.indexOf('leg') !== -1) muscleGroup = muscleGroup ? 'Ноги' : 'Ноги';
            if ((t.indexOf('ягодиц') !== -1) && (t.indexOf('бедр') !== -1 || t.indexOf('квадри') !== -1)) muscleGroup = 'Ноги и ягодицы';
            if (t.indexOf('спин') !== -1 || t.indexOf('back') !== -1) muscleGroup = 'Спина';
            if (t.indexOf('груд') !== -1 || t.indexOf('chest') !== -1) muscleGroup = 'Грудь';
            if (t.indexOf('плеч') !== -1 || t.indexOf('дельт') !== -1 || t.indexOf('shoulder') !== -1) muscleGroup = muscleGroup || 'Плечи';
            if (t.indexOf('бицепс') !== -1 || t.indexOf('трицепс') !== -1 || t.indexOf('рук') !== -1 || t.indexOf('arm') !== -1) muscleGroup = muscleGroup || 'Руки';
            if (!muscleGroup && dayTitle) muscleGroup = dayTitle;
            var gymName = '';
            var celebGymId = sessionStorage.getItem('wt_gym_' + weekNum + '_' + dayNum);
            if (celebGymId) {
                var celebGym = Storage.getGymById(celebGymId);
                if (celebGym) gymName = celebGym.name;
            }
            this._pendingShare = {
                week: weekNum, day: dayNum, title: dayTitle,
                muscle_group: muscleGroup,
                exercises: exercises, total_sets: totalSets,
                duration_sec: elapsedSec || 0,
                gym_name: gymName || undefined
            };
            // Clean up gym session key
            sessionStorage.removeItem('wt_gym_' + weekNum + '_' + dayNum);
        }

        var self = this;
        var closed = false;
        function close(e) {
            if (e && e.target && e.target.id === 'celeb-share') return;
            if (closed) return;
            closed = true;
            overlay.classList.add('hiding');
            setTimeout(function() { overlay.remove(); }, 400);
        }

        // Share button handler
        var shareBtnEl = overlay.querySelector('#celeb-share');
        if (shareBtnEl) {
            shareBtnEl.addEventListener('click', function(e) {
                e.stopPropagation();
                if (self._pendingShare) {
                    App._pendingCheckinWorkout = self._pendingShare;
                    self._pendingShare = null;
                }
                closed = true;
                overlay.classList.add('hiding');
                setTimeout(function() {
                    overlay.remove();
                    location.hash = '#/checkin';
                }, 300);
            });
        }

        overlay.addEventListener('click', close);
        setTimeout(close, 6000);
    },

    _launchConfetti() {
        var self = this;
        var total = 60;
        for (var i = 0; i < total; i++) {
            setTimeout(function() { self._createConfetti(); }, i * 40);
        }
    },

    _createConfetti() {
        var color = this._colors[Math.floor(Math.random() * this._colors.length)];
        var size = 6 + Math.random() * 6;
        var isRect = Math.random() > 0.4;

        var el = document.createElement('div');
        el.className = 'firework-particle';
        el.style.left = (5 + Math.random() * 90) + 'vw';
        el.style.top = '-20px';
        el.style.width = (isRect ? size * 0.6 : size) + 'px';
        el.style.height = (isRect ? size * 1.6 : size) + 'px';
        el.style.borderRadius = isRect ? '2px' : '50%';
        el.style.background = color;
        document.body.appendChild(el);

        var swayAmp = 40 + Math.random() * 80;
        var swayFreq = 2 + Math.random() * 3;
        var fallSpeed = 1.5 + Math.random() * 2;
        var rotSpeed = (Math.random() - 0.5) * 720;
        var duration = 2500 + Math.random() * 1500;
        var startDelay = Math.random() * 0.15;

        var start = performance.now();
        var screenH = window.innerHeight;
        function animate(now) {
            var t = Math.min((now - start) / duration, 1);
            if (t < startDelay) { requestAnimationFrame(animate); return; }
            var p = (t - startDelay) / (1 - startDelay);
            var y = p * (screenH + 40);
            var x = Math.sin(p * swayFreq * Math.PI) * swayAmp;
            var rot = rotSpeed * p;
            var opacity = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
            el.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + 'deg)';
            el.style.opacity = opacity;
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                el.remove();
            }
        }
        requestAnimationFrame(animate);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
