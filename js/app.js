/* ===== Application Entry Point ===== */

const App = {
    _currentWeek: 1,
    _currentDay: 1,
    _saveDebounced: null,
    _swipeDir: null,

    init() {
        // Multi-user migration (once)
        Storage.migrateToMultiUser();

        // Load program for current user
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            this._loadProgramForUser(currentUser);
            // Restore Supabase sync for supa_ users
            this._initSupaSync(currentUser.id);
        } else {
            // Legacy fallback: try loading stored program directly
            const storedProgram = Storage.getProgram();
            if (storedProgram) {
                PROGRAM = storedProgram;
            }
        }

        this._saveDebounced = debounce((week, day, exId, setIdx, field, value) => {
            Storage.updateSetValue(week, day, exId, setIdx, field, parseFloat(value) || 0);
        }, 300);

        // Route handling
        window.addEventListener('hashchange', () => this.route());

        // Global event delegation
        document.getElementById('app').addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('app').addEventListener('input', (e) => this.handleInput(e));
        document.getElementById('app').addEventListener('focus', (e) => this.handleFocus(e), true);

        // Swipe navigation: left/right weeks + right-swipe to go back from day view
        this._initSwipeNav();

        // Pull-to-refresh
        this._initPullToRefresh();

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
        // Background sync
        SupaSync.syncOnLogin(supaUserId, 'wt_data_' + userId).catch(function(e) {
            console.error('Init sync error:', e);
        });
    },

    _initSwipeNav() {
        let startX = 0, startY = 0;
        let dragging = false, locked = false;
        let isWeekView = false, isDayView = false, isSettingsView = false, isMenuSubPage = false;
        let swipingLeft = false;
        let companion = null;
        let isDayBack = false;
        let savedScrollY = 0;

        const W = () => window.innerWidth;

        const removeCompanion = () => {
            if (companion) { companion.remove(); companion = null; }
        };

        const unlockScroll = () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        };

        const createCompanion = (targetWeek) => {
            const c = document.createElement('div');
            c.className = 'nav-companion';
            c.innerHTML = UI._weekCardsHTML(targetWeek);
            const container = document.querySelector('.slide-container');
            if (container) container.appendChild(c);
            return c;
        };

        const createBackCompanion = (weekNum) => {
            const c = document.createElement('div');
            c.className = 'back-companion';
            c.innerHTML = UI._weekViewHTML(weekNum);
            document.body.appendChild(c);
            return c;
        };

        const createMenuCompanion = () => {
            const c = document.createElement('div');
            c.className = 'back-companion';
            c.innerHTML = UI._menuHTML();
            document.body.appendChild(c);
            return c;
        };

        document.addEventListener('touchstart', (e) => {
            isWeekView = !!location.hash.match(/^#\/week\/\d+$/);
            isDayView = !!location.hash.match(/^#\/week\/\d+\/day\/\d+$/);
            isMenuSubPage = location.hash === '#/settings' || location.hash === '#/guide' || location.hash === '#/calculator';
            isSettingsView = location.hash === '#/menu' || isMenuSubPage;
            if (!isWeekView && !isDayView && !isSettingsView) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dragging = false;
            locked = false;
            isDayBack = false;
            removeCompanion();
            // Pre-create menu companion on touchstart so DOM is ready before animation
            if (isMenuSubPage) {
                companion = createMenuCompanion();
                companion.style.transform = `translateX(${-W()}px)`;
            }
            if (isWeekView) {
                const el = document.querySelector('.week-slide');
                if (el) el.style.transition = 'none';
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isWeekView && !isDayView && !isSettingsView) return;
            if (locked) return;
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;

            if (!dragging) {
                if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
                if (Math.abs(dy) > Math.abs(dx)) { locked = true; return; }
                if ((isDayView || isSettingsView) && dx < 0) { locked = true; return; }
                dragging = true;
                swipingLeft = dx < 0;
                savedScrollY = window.scrollY;
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';

                if (isWeekView) {
                    const targetWeek = swipingLeft
                        ? (this._currentWeek === getTotalWeeks() ? 1 : this._currentWeek + 1)
                        : (this._currentWeek === 1 ? getTotalWeeks() : this._currentWeek - 1);
                    companion = createCompanion(targetWeek);
                    companion.style.transition = 'none';
                    companion.style.transform = `translateX(${swipingLeft ? W() : -W()}px)`;
                } else if (isDayView || isSettingsView) {
                    // Day/Settings back-swipe: full-screen companion + move entire #app
                    isDayBack = true;
                    if (!isMenuSubPage) {
                        companion = createBackCompanion(this._currentWeek);
                    }
                    // Position companion (pre-created for menu sub-pages, just created for day/menu)
                    if (companion) {
                        companion.style.transition = 'none';
                        companion.style.transform = `translateX(${-0.28 * W()}px)`;
                    }
                    const app = document.getElementById('app');
                    // Fix #app in place so overflow:hidden doesn't cause scroll jump
                    app.style.position = 'fixed';
                    app.style.top = `-${savedScrollY}px`;
                    app.style.left = '0';
                    app.style.right = '0';
                    app.classList.add('swiping-back');
                    app.style.transition = 'none';
                }
            }

            // Lock to horizontal axis — prevent vertical scroll during swipe
            if (dragging) {
                e.preventDefault();
                window.scrollTo(0, savedScrollY);
            }

            if (isDayBack) {
                document.getElementById('app').style.transform = `translateX(${dx}px)`;
                if (companion) {
                    companion.style.transform = `translateX(${-0.28 * W() + 0.28 * dx}px)`;
                }
            } else {
                const front = document.querySelector('.week-slide');
                if (front) front.style.transform = `translateX(${dx}px)`;
                if (companion) {
                    companion.style.transform = `translateX(${(swipingLeft ? W() : -W()) + dx}px)`;
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!isWeekView && !isDayView && !isSettingsView) return;
            // Clean up pre-created companion if touch wasn't a horizontal swipe
            if (!dragging && !isDayBack && companion) removeCompanion();
            const dx = e.changedTouches[0].clientX - startX;
            const snap = 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            const commit = 'transform 0.18s cubic-bezier(0.4, 0, 0.6, 1)';

            // === Day back-swipe ===
            if (isDayBack) {
                const app = document.getElementById('app');
                if (!dragging || dx < 60) {
                    // Snap back
                    app.style.transition = snap;
                    app.style.transform = 'translateX(0)';
                    if (companion) {
                        companion.style.transition = snap;
                        companion.style.transform = `translateX(${-0.28 * W()}px)`;
                    }
                    setTimeout(() => {
                        removeCompanion();
                        unlockScroll();
                        app.style.transition = 'none';
                        app.style.transform = '';
                        app.style.position = '';
                        app.style.top = '';
                        app.style.left = '';
                        app.style.right = '';
                        app.classList.remove('swiping-back');
                        window.scrollTo(0, savedScrollY);
                    }, 230);
                    return;
                }
                // Commit: slide entire day view off
                app.style.transition = commit;
                app.style.transform = `translateX(${W() + 20}px)`;
                if (companion) {
                    companion.style.transition = commit;
                    companion.style.transform = 'translateX(0)';
                }
                const swipeTarget = isMenuSubPage ? '#/menu' : `#/week/${this._currentWeek}`;
                setTimeout(() => {
                    app.classList.add('no-animate');
                    history.replaceState(null, '', swipeTarget);
                    // Render while #app is still off-screen (position:fixed + translated)
                    if (isMenuSubPage) {
                        UI.renderMenu();
                    } else {
                        UI.renderWeek(this._currentWeek);
                    }
                    // Reset #app to normal position (companion still covers it)
                    app.style.transition = 'none';
                    app.style.transform = '';
                    app.style.position = '';
                    app.style.top = '';
                    app.style.left = '';
                    app.style.right = '';
                    app.classList.remove('swiping-back');
                    unlockScroll();
                    // Remove companion instantly — #app already has correct content
                    removeCompanion();
                    window.scrollTo(0, 0);
                    // Keep no-animate on — route() will remove it on next navigation
                }, 220);
                return;
            }

            // === Week swipe ===
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

            if (front) {
                front.style.transition = commit;
                front.style.transform = `translateX(${swipingLeft ? '-110%' : '110%'})`;
            }
            if (companion) {
                companion.style.transition = commit;
                companion.style.transform = 'translateX(0)';
            }

            const week = this._currentWeek;
            const next = swipingLeft
                ? (week === getTotalWeeks() ? 1 : week + 1)
                : (week === 1 ? getTotalWeeks() : week - 1);
            setTimeout(() => {
                unlockScroll();
                location.hash = `#/week/${next}`;
                requestAnimationFrame(removeCompanion);
            }, 190);
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

            // Snap back from top pull
            if (active) {
                const m = app.style.transform.match(/translateY\((.+?)px\)/);
                if (m) snapBack(parseFloat(m[1]));
            }
            if (indicator) {
                if (ready) {
                    indicator.classList.add('spinning');
                    location.reload();
                    return;
                }
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

    _loadProgramForUser(user) {
        var storedProgram = Storage.getProgram();
        if (storedProgram) {
            PROGRAM = storedProgram;
            // Update built-in program only if same athlete and newer version
            var builtin = BUILTIN_PROGRAMS[user.programId];
            if (builtin) {
                var latestProgram = builtin.getProgram();
                var sameAthlete = latestProgram && storedProgram.athlete
                    && latestProgram.athlete === storedProgram.athlete;
                if (sameAthlete && latestProgram.version
                    && (!storedProgram.version || storedProgram.version < latestProgram.version)) {
                    PROGRAM = latestProgram;
                    Storage.saveProgram(latestProgram, false);
                }
            }
        } else {
            // No stored program — load from built-in
            var builtin = BUILTIN_PROGRAMS[user.programId];
            if (builtin) {
                PROGRAM = builtin.getProgram();
                if (PROGRAM) Storage.saveProgram(PROGRAM, false);
            }
        }
    },

    switchUser(userId) {
        Storage.setCurrentUser(userId);
        PROGRAM = null;
        var user = Storage.getCurrentUser();
        if (user) this._loadProgramForUser(user);
        location.hash = '';
        this.route();
    },

    login(loginStr, passwordStr) {
        // 1. Try hardcoded ACCOUNTS (existing users — unchanged)
        var account = ACCOUNTS.find(function(a) {
            return a.login === loginStr && a.password === passwordStr;
        });
        if (account) {
            var users = Storage.getUsers();
            var existing = users.find(function(u) { return u.id === account.id; });
            if (!existing) {
                Storage.createUser(account.id, account.name, account.programId);
            }
            this.switchUser(account.id);
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
        location.hash = '#/login';
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

    route() {
        document.getElementById('app').classList.remove('no-animate');
        window.scrollTo(0, 0);
        const hash = location.hash || '';

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

        // If no current user → login
        if (!Storage.getCurrentUserId()) {
            location.hash = '#/login';
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

        // Day view: #/week/{n}/day/{n}
        const dayMatch = hash.match(/^#\/week\/(\d+)\/day\/(\d+)$/);
        if (dayMatch) {
            this._currentWeek = parseInt(dayMatch[1]);
            this._currentDay = parseInt(dayMatch[2]);
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
            if (this.login(loginVal, passVal)) return;
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

        // Go to registration
        if (target.id === 'btn-register' || target.closest('#btn-register')) {
            location.hash = '#/register';
            return;
        }

        // Registration: submit
        if (target.id === 'reg-submit' || target.closest('#reg-submit')) {
            Builder.handleRegister();
            return;
        }

        // Registration: go back to login
        if (target.id === 'btn-go-login' || target.closest('#btn-go-login')) {
            location.hash = '#/login';
            return;
        }

        // Logout
        if (target.id === 'btn-logout' || target.closest('#btn-logout')) {
            this.logout();
            return;
        }

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
            Storage.saveProgram(null, false);
            PROGRAM = null;
            UI.renderSetup();
            return;
        }

        // Day editor: add exercise
        if (target.id === 'editor-add-exercise' || target.closest('#editor-add-exercise')) {
            Builder.showExercisePicker();
            return;
        }

        // Day editor: save
        if (target.id === 'editor-save' || target.closest('#editor-save')) {
            Builder.saveDayEdits();
            return;
        }

        // Day editor: move up
        if (target.classList.contains('editor-move-up') || target.closest('.editor-move-up')) {
            var btn = target.classList.contains('editor-move-up') ? target : target.closest('.editor-move-up');
            Builder.moveExercise(parseInt(btn.dataset.idx), -1);
            return;
        }

        // Day editor: move down
        if (target.classList.contains('editor-move-down') || target.closest('.editor-move-down')) {
            var btn = target.classList.contains('editor-move-down') ? target : target.closest('.editor-move-down');
            Builder.moveExercise(parseInt(btn.dataset.idx), 1);
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
            var app = document.getElementById('app');
            app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
            app.style.transform = 'translateX(40px)';
            app.style.opacity = '0';
            setTimeout(function() {
                app.style.transition = 'none';
                app.style.transform = '';
                app.style.opacity = '';
                window.scrollTo(0, 0);
                if (Storage.isSetup()) {
                    location.hash = '#/week/' + App._currentWeek + '/day/' + (Builder._editingDay ? Builder._editingDay.dayNum : App._currentDay);
                } else {
                    location.hash = '#/setup';
                }
                Builder._editingDay = null;
            }, 190);
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
            Storage.saveSettings({ cycleType, startDate, weightUnit, timerDuration });
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

        // Settings: edit equipment name
        if (target.matches('.eq-edit-btn') || target.closest('.eq-edit-btn')) {
            const btn = target.matches('.eq-edit-btn') ? target : target.closest('.eq-edit-btn');
            const eqId = btn.dataset.eqId;
            const eq = Storage.getEquipmentById(eqId);
            if (eq) {
                const newName = prompt('Новое название:', eq.name);
                if (newName && newName.trim()) {
                    Storage.renameEquipment(eqId, newName.trim());
                    UI.renderSettings();
                }
            }
            return;
        }

        // Settings: remove equipment
        if (target.matches('.eq-remove-btn') || target.closest('.eq-remove-btn')) {
            const btn = target.matches('.eq-remove-btn') ? target : target.closest('.eq-remove-btn');
            const eqId = btn.dataset.eqId;
            if (eqId) {
                Storage.removeEquipment(eqId);
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

        // Equipment button — show equipment picker
        if (target.matches('.equipment-btn') || target.closest('.equipment-btn')) {
            const btn = target.matches('.equipment-btn') ? target : target.closest('.equipment-btn');
            const exId = btn.dataset.exercise;
            UI.showEquipmentModal(exId);
            return;
        }

        // Substitution button — open substitution picker
        if (target.matches('.substitute-btn') || target.closest('.substitute-btn')) {
            const btn = target.matches('.substitute-btn') ? target : target.closest('.substitute-btn');
            const exId = btn.dataset.exercise;
            UI.showSubstitutionModal(exId);
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

        // Equipment modal — select option
        if (target.matches('.eq-option') || target.closest('.eq-option')) {
            const opt = target.matches('.eq-option') ? target : target.closest('.eq-option');
            const eqId = opt.dataset.eqId;
            const exId = opt.dataset.exercise;
            Storage.setExerciseEquipment(exId, eqId || null);
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Equipment modal — add new
        if (target.id === 'eq-add-btn' || target.closest('#eq-add-btn')) {
            const input = document.getElementById('eq-new-name');
            const name = input ? input.value.trim() : '';
            if (!name) return;
            const modal = document.getElementById('equipment-modal');
            const exId = modal ? modal._exerciseId : null;
            const newId = Storage.addEquipment(name);
            if (exId) {
                Storage.setExerciseEquipment(exId, newId);
                UI.hideEquipmentModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return;
        }

        // Equipment modal — close on overlay
        if (target.id === 'equipment-modal') {
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
            const weight = parseFloat(weightInput.value) || parseFloat(weightInput.placeholder) || 0;
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
                RestTimer.start();
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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
