/* ===== Application Entry Point ===== */
import { Storage } from './storage.js';
import { SupaSync, supa } from './supabase-sync.js';
import { Social } from './social.js';
import { UI } from './ui.js';
import { SocialUI } from './social-ui.js';
import { Builder } from './builder.js';
import { RestTimer } from './timer.js';
import { Celebration } from './celebration.js';
import { SwipeNav } from './swipe-nav.js';
import { PullRefresh } from './pull-refresh.js';
import { EquipmentManager } from './equipment-manager.js';
import { WorkoutUI } from './workout-ui.js';
import { MessageNotifications } from './message-notifications.js';
import { ProfileManager } from './profile-manager.js';
import { AvatarCropper } from './cropper.js';
import { Migrations } from './migrations.js';
import { ACCOUNTS, BUILTIN_PROGRAMS } from './users.js';
import { lockBodyScroll, unlockBodyScroll } from './scroll-lock.js';
import { debounce, formatDateISO, validateProgram, esc, parseWeight, parseReps } from './utils.js';
import { getTotalDays, getProgressWeek } from './program-utils.js';
import { WORKOUT, EQ, SETTINGS, read, readInt } from './data-attrs.js';
import { AppState } from './app-state.js';

export const App = {
    _currentWeek: 1,
    _currentDay: 1,
    _saveDebounced: null,
    _swipeDir: null,
    _pendingMigration: null,
    _pendingCheckinWorkout: null,
    _pageCache: {},
    _scrollCache: {},

    _restoreScroll() {
        window.scrollTo(0, this._pendingScroll || 0);
        this._pendingScroll = 0;
    },

    invalidatePageCache(hashOrPrefix) {
        if (!hashOrPrefix) { this._pageCache = {}; this._scrollCache = {}; AppState.pageCache = this._pageCache; return; }
        for (var key in this._pageCache) {
            if (key === hashOrPrefix || key.startsWith(hashOrPrefix + '/')) {
                delete this._pageCache[key];
                delete this._scrollCache[key];
            }
        }
    },

    init() {
        // Disable browser's auto scroll restoration — we manage it ourselves
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

        // Continuously track scroll position for current page
        var self = this;
        window.addEventListener('scroll', function() {
            var h = self._lastRouteHash;
            if (h) self._scrollCache[h] = window.scrollY;
        }, { passive: true });

        // Wire storage callbacks before any data loading
        Storage._migrateFn = (data) => Migrations.migrateExerciseNames(data);

        // Run one-time data migrations (see js/migrations.js)
        Migrations.run();

        // Multi-user migration (once)
        Storage.migrateToMultiUser();

        // Load program for current user
        const currentUser = Storage.getCurrentUser();
        if (currentUser) {
            // Check if hardcoded user needs migration to Supabase Auth
            var acct = ACCOUNTS ? ACCOUNTS.find(function(a) { return a.id === currentUser.id; }) : null;
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
                MessageNotifications.init();
            }
        } else {
            // Legacy fallback: try loading stored program directly
            const storedProgram = Storage.getStoredProgram();
            if (storedProgram) {
                Storage.setProgram(storedProgram);
            }
        }

        this._saveDebounced = debounce((week, day, exId, setIdx, field, value) => {
            Storage.updateSetValue(week, day, exId, setIdx, field, field === 'reps' ? parseReps(value) : parseWeight(value));
        }, 300);
        AppState.saveDebounced = this._saveDebounced;
        AppState.pageCache = this._pageCache;

        // Wire callbacks for decoupled modules
        UI._onClick = (e) => this.handleClick(e);
        UI._onInput = (e) => this.handleInput(e);
        Celebration._onShareCheckin = (data) => { this._pendingCheckinWorkout = data; };
        SupaSync._onSyncWarning = (msg) => this._showSyncWarning(msg);
        Storage._onSave = () => SupaSync.onLocalSave();
        EquipmentManager._onRenderDay = (w, d) => UI.renderDay(w, d);
        EquipmentManager._onRenderSettings = () => UI.renderSettings();
        WorkoutUI._onInvalidateCache = (hash) => this.invalidatePageCache(hash);
        WorkoutUI._onRoute = () => this.route();
        Builder._onRoute = () => this.route();
        Builder._onSwitchUser = (id, flag) => this.switchUser(id, flag);
        Builder._onEditorBack = () => this._handleEditorBack();
        Builder._onOnboardingChecked = () => { this._onboardingChecked = true; };
        Builder._onImportProgram = (file) => this.importProgram(file);
        Builder._onStartSetup = () => this.startSetup();
        Builder._onInvalidateCache = () => this.invalidatePageCache();
        Builder._onRenderSetup = () => UI.renderSetup();
        Builder._onSetEditorNavigating = (v) => { this._editorNavigating = v; };
        Builder._onAddDay = () => this._addDayToCustomProgram();
        Builder._onRemoveDay = () => this._removeDayFromCustomProgram();
        Builder._onAddWeek = () => this._addWeekToCustomProgram();
        Builder._onRemoveWeek = () => this._removeWeekFromCustomProgram();

        // Route handling
        window.addEventListener('hashchange', () => {
            if (this._swipeLock) return;
            if (this._isBackSwipe) {
                clearTimeout(this._backSwipeFallbackTimer);
                this._isBackSwipe = false;
                // Unlock scroll BEFORE route() so scrollTo() works inside _restoreScroll()
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                // Reset app position/transform, but keep hidden via opacity
                var appEl = document.getElementById('app');
                appEl.style.opacity = '0';
                if (this._pendingSwipeCleanup) {
                    this._pendingSwipeCleanup();
                    this._pendingSwipeCleanup = null;
                }
                this.route(true);
                appEl.style.opacity = '';
                return;
            }
            this.route();
        });

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
                    ProfileManager.croppedAvatarBlob = blob;
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
                var total = ProfileManager.checkinPhotos.length + files.length;
                if (total > 3) { alert('Максимум 3 фото/видео'); return; }
                ProfileManager.checkinPhotos = ProfileManager.checkinPhotos.concat(files);
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

        // Swipe navigation: left/right weeks + right-swipe to go back (js/swipe-nav.js)
        SwipeNav.init(this);

        // Pull-to-refresh (js/pull-refresh.js)
        PullRefresh.init(() => this.route(true));

        // Clear any stale equipment snapshot from previous session
        localStorage.removeItem('_wt_eq_snapshot');

        // Init rest timer
        RestTimer.init();

        // Initial route
        this.route();
    },

    // Initialize Supabase sync for supa_ users
    _initSupaSync(userId) {
        if (!userId || userId.indexOf('supa_') !== 0) return;
        if (!SupaSync) return;
        var supaUserId = localStorage.getItem('wt_supa_' + userId);
        if (!supaUserId) return;
        SupaSync._currentSupaUserId = supaUserId;
        SupaSync._currentStorageKey = 'wt_data_' + userId;
        var self = this;
        // Validate Supabase session before syncing
        this._ensureSupaSession().then(function(sessionOk) {
            if (!sessionOk) {
                console.warn('Supabase session expired — sync disabled until re-login');
                self._showSyncWarning('Сессия истекла. Войдите заново для синхронизации.');
                return;
            }
            // Background sync — re-render after merge to avoid stale UI
            return SupaSync.syncOnLogin(supaUserId, 'wt_data_' + userId);
        }).then(function(result) {
            if (result === undefined) return; // session was expired, skip post-sync
            localStorage.removeItem('_wt_eq_snapshot');
            // Remove stuck Precor equipment — only local, no immediate push
            try {
                Storage._invalidateCache();
                var dd = Storage._load();
                if (dd && dd.exerciseEquipment) {
                    var precorId = 'eq_1773590725238';
                    for (var k in dd.exerciseEquipment) {
                        if (dd.exerciseEquipment[k] === precorId) {
                            delete dd.exerciseEquipment[k];
                        }
                    }
                    Storage._save();
                }
            } catch(e) {}
            // Clean orphaned log entries after sync (choose_one phantoms + corrupted _gym)
            Migrations.cleanOrphanedLogEntries();
            // Load shared gyms cache + migrate local gyms
            EquipmentManager.initGymCache();
            self.route();
        }).catch(function(e) {
            console.error('Init sync error:', e);
        });
    },




    // Swipe config delegated to SwipeNav.getConfig() in js/swipe-nav.js
    _getSwipeConfig(hash) {
        return SwipeNav.getConfig(hash, this);
    },

    _addWeekToCustomProgram() {
        var p = Storage.getProgram();
        if (!p) return;
        if (p.totalWeeks >= 16) {
            alert('Максимум 16 недель');
            return;
        }
        if (!confirm(`Добавить неделю ${p.totalWeeks + 1}?`)) return;
        p.totalWeeks = (p.totalWeeks || 1) + 1;
        Storage.saveProgram(p, false);
        this.invalidatePageCache();
        location.hash = `#/week/${p.totalWeeks}`;
    },

    _removeWeekFromCustomProgram() {
        var p = Storage.getProgram();
        if (!p || p.totalWeeks <= 1) return;
        if (!confirm(`Удалить неделю ${p.totalWeeks}? Данные этой недели будут потеряны.`)) return;
        var removedWeek = p.totalWeeks;
        p.totalWeeks -= 1;
        Storage.saveProgram(p, false);
        Storage.clearWeekLog(removedWeek);
        this.invalidatePageCache();
        location.hash = `#/week/${p.totalWeeks}`;
    },

    _handleEditorBack() {
        this._navigateBack(null, () => { Builder._editingDay = null; });
    },

    _addDayToCustomProgram() {
        var p = Storage.getProgram();
        if (!p) return;
        var numDays = getTotalDays();
        if (numDays >= 7) {
            alert('Все 7 дней заняты тренировками');
            return;
        }
        if (!confirm('Убрать день отдыха и добавить тренировку?')) return;
        var newDayNum = numDays + 1;
        p.dayTemplates[newDayNum] = {
            title: 'Day ' + newDayNum,
            titleRu: 'День ' + newDayNum,
            exerciseGroups: []
        };
        // Regenerate slots for new day count (always 7 total)
        var slots = UI._generateDefaultSlots(newDayNum, 7);
        Storage.saveWeekSlots(slots);
        Storage.saveProgram(p, false);
        this.invalidatePageCache();
        UI.renderWeek(this._currentWeek);
    },

    _removeDayFromCustomProgram() {
        var p = Storage.getProgram();
        if (!p) return;
        var numDays = getTotalDays();
        if (numDays <= 1) return;
        if (!confirm('Удалить день ' + numDays + '? На его место встанет день отдыха.')) return;
        delete p.dayTemplates[numDays];
        // Regenerate slots for new day count (always 7 total)
        var slots = UI._generateDefaultSlots(numDays - 1, 7);
        Storage.saveWeekSlots(slots);
        Storage.saveProgram(p, false);
        this.invalidatePageCache();
        UI.renderWeek(this._currentWeek);
    },

    _loadProgramForUser(user) {
        var storedProgram = Storage.getStoredProgram();
        if (storedProgram) {
            Storage.setProgram(storedProgram);
            // Migrate to custom if not yet migrated
            var p = Storage.getProgram();
            if (!p.isCustom) {
                p.isCustom = true;
                Storage.saveProgram(p, false);
            }
            // No longer auto-update from built-in — program is user's own
        } else {
            // No stored program — load from built-in template
            var programId = user.programId;
            // Fallback: if user has no programId, check if they were migrated from a hardcoded account
            if (!programId && typeof ACCOUNTS !== 'undefined') {
                for (var i = 0; i < ACCOUNTS.length; i++) {
                    if (localStorage.getItem('wt_migrated_' + ACCOUNTS[i].id) === user.id) {
                        programId = ACCOUNTS[i].programId;
                        break;
                    }
                }
                // Fallback 2: match by username (for devices missing wt_migrated_ flag)
                if (!programId && user.login) {
                    for (var j = 0; j < ACCOUNTS.length; j++) {
                        if (ACCOUNTS[j].login === user.login) {
                            programId = ACCOUNTS[j].programId;
                            break;
                        }
                    }
                }
            }
            var builtin = BUILTIN_PROGRAMS[programId];
            if (builtin) {
                var prog = JSON.parse(JSON.stringify(builtin.getProgram()));
                prog.isCustom = true;
                Storage.setProgram(prog);
                Storage.saveProgram(prog, false);
            }
        }
    },

    switchUser(userId, pushHistory) {
        Storage.setCurrentUser(userId);
        Storage.setProgram(null);
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
            // Cache email for future login-by-username
            localStorage.setItem('wt_email_' + localId, email);

            // Set up sync
            SupaSync._currentSupaUserId = supaUserId;
            SupaSync._currentStorageKey = 'wt_data_' + localId;
            SupaSync._pushFailCount = 0;
            self._hideSyncWarning();

            // Set current user so Storage reads/writes the right key
            Storage.setCurrentUser(localId);

            // Ensure email is stored in profiles for cross-device login by username
            try {
                Social.upsertProfile({ email: email }).catch(function() {});
            } catch (e) {}

            // Sync data from cloud BEFORE rendering UI (so program is available)
            return SupaSync.syncOnLogin(supaUserId, 'wt_data_' + localId).then(function() {
                Storage._invalidateCache();
                Migrations.cleanOrphanedLogEntries();
                var user = Storage.getCurrentUser();
                if (user) self._loadProgramForUser(user);
                // Now render — program should be loaded from cloud data
                history.replaceState(null, '', window.location.pathname);
                self.route();
            }).catch(function(syncErr) {
                console.error('Sync after login failed:', syncErr);
                // Still render even if sync failed — user can use local data
                var user = Storage.getCurrentUser();
                if (user) self._loadProgramForUser(user);
                history.replaceState(null, '', window.location.pathname);
                self.route();
            });
        }).catch(function(err) {
            if (errEl) {
                errEl.textContent = err.message || 'Неверный email или пароль';
                errEl.style.display = 'block';
            }
            if (btn) { btn.disabled = false; btn.textContent = 'ВОЙТИ'; }
            return false;
        });
    },

    // Login by username — look up email, then sign in via Supabase
    async _loginByUsername(username, password) {
        var errEl = document.getElementById('login-error');
        var btn = document.getElementById('login-submit');
        if (btn) { btn.disabled = true; btn.textContent = 'ВХОД...'; }
        try {
            if (!supa) throw new Error('Supabase не загружен');
            // Look up user_id and email from profiles table
            var result = await supa.from('profiles').select('user_id, email').eq('username', username).single();
            if (result.error || !result.data) {
                throw new Error('Пользователь не найден');
            }
            var userId = result.data.user_id;
            var email = result.data.email;

            // 1. Try email from profiles table (stored during registration)
            if (email) {
                await this.loginSupabase(email, password);
                return;
            }

            // 2. Try locally cached email (same device)
            var cachedEmail = localStorage.getItem('wt_email_supa_' + userId);
            if (!cachedEmail) {
                var users = Storage.getUsers();
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id === 'supa_' + userId && users[i].email) {
                        cachedEmail = users[i].email;
                        break;
                    }
                }
            }
            if (cachedEmail) {
                await this.loginSupabase(cachedEmail, password);
                return;
            }

            // 3. Try looking up email from user_data table
            var udResult = await supa.from('user_data').select('data').eq('user_id', userId).single();
            if (udResult.data && udResult.data.data) {
                // The data blob may contain user info from the users array
                // But more reliably, use Supabase auth metadata
            }

            // No email found — tell user to use email
            throw new Error('Войдите через email, а не логин');
        } catch (e) {
            if (errEl) {
                errEl.textContent = e.message || 'Неверный логин или пароль';
                errEl.style.display = 'block';
            }
            if (btn) { btn.disabled = false; btn.textContent = 'ВОЙТИ'; }
        }
    },

    // Ensure Supabase session is valid, try to refresh if expired
    async _ensureSupaSession() {
        if (!supa) return false;
        try {
            var result = await supa.auth.getSession();
            if (result.data && result.data.session) return true;
            // Session expired — Supabase SDK auto-refreshes, but if that failed too:
            var refresh = await supa.auth.refreshSession();
            if (refresh.data && refresh.data.session) return true;
            return false;
        } catch (e) {
            console.error('Session check failed:', e);
            return false;
        }
    },

    // Show sync warning banner
    _showSyncWarning(msg) {
        // Remove existing warning
        var existing = document.getElementById('sync-warning');
        if (existing) existing.remove();
        var banner = document.createElement('div');
        banner.id = 'sync-warning';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#ff6b35;color:#fff;padding:10px 16px;font-size:13px;text-align:center;cursor:pointer;';
        banner.textContent = msg;
        banner.onclick = function() {
            banner.remove();
            App.logout();
        };
        document.body.appendChild(banner);
    },

    // Hide sync warning
    _hideSyncWarning() {
        var el = document.getElementById('sync-warning');
        if (el) el.remove();
    },

    logout() {
        this._hideSyncWarning();
        Storage.logout();
        Storage.setProgram(null);
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

            // 2. Create new user profile (preserve programId for built-in program loading)
            Storage.createSelfRegisteredUser(account.name, account.login, '', email, newLocalId, account.programId);

            // 3. Store Supabase mapping
            localStorage.setItem('wt_supa_' + newLocalId, supaUserId);

            // 4. Mark old account as migrated + store email for login hint
            localStorage.setItem('wt_migrated_' + account.id, newLocalId);
            localStorage.setItem('wt_email_' + newLocalId, email);

            // 5. Set up sync
            SupaSync._currentSupaUserId = supaUserId;
            SupaSync._currentStorageKey = 'wt_data_' + newLocalId;

            // 6. Switch to new user
            self._pendingMigration = null;
            self.switchUser(newLocalId);

            // 7. Auto-create social profile so user appears in discover (include email for cross-device login)
            try {
                Social.upsertProfile({ username: account.login, display_name: account.name, email: email }).catch(function() {});
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
        const cycleType = cycleBtn ? readInt(cycleBtn, SETTINGS.CYCLE) : 7;
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
                    const hadProgram = Storage.getProgram() !== null;
                    Storage.saveProgram(data, hadProgram);
                    Storage.setProgram(data);
                    App.invalidatePageCache(); // Program changed
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
        // Cache current page HTML + scroll position before navigating away
        var prevHash = this._lastRouteHash || '';
        if (prevHash) {
            var appEl = document.getElementById('app');
            if (appEl && appEl.innerHTML) this._pageCache[prevHash] = appEl.innerHTML;
            this._scrollCache[prevHash] = window.scrollY;
        }
        // Safety: clear any stuck swipe/pull styles that break position:fixed for tab bar
        var routeAppEl = document.getElementById('app');
        routeAppEl.style.transform = '';
        routeAppEl.style.position = '';
        routeAppEl.style.top = '';
        routeAppEl.style.left = '';
        routeAppEl.style.right = '';
        routeAppEl.classList.remove('swiping-back');
        if (!skipAnimation) routeAppEl.classList.remove('no-animate');
        const hash = location.hash || '';
        this._pendingScroll = this._scrollCache[hash] || 0;
        // Skip scroll-to-top when returning from day view — scrollIntoView will position later
        if (!this._inDayView) {
            window.scrollTo(0, 0);
        }
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

        // Check if onboarding needed (gender not set in profile)
        // Skip if already checked, or if onboarding was completed before (persisted flag)
        var currentLocalId = Storage.getCurrentUserId();
        var onboardingDoneKey = 'wt_onboarding_done_' + currentLocalId;
        if (!this._onboardingChecked && Social._hasSupaAuth() && !localStorage.getItem(onboardingDoneKey)) {
            this._onboardingChecked = true;
            var self = this;
            Social.getMyProfile().then(function(p) {
                if (!p) return; // profile query failed or doesn't exist — don't force onboarding
                if (p.gender) {
                    // Profile is complete — mark as done so we never re-check
                    localStorage.setItem(onboardingDoneKey, '1');
                    return;
                }
                if (!location.hash.startsWith('#/onboarding')) {
                    Builder._onboardingData = Builder._onboardingData || {};
                    history.replaceState(null, '', '#/onboarding/1');
                    self.route();
                }
            }).catch(function() {
                // Network error — don't force onboarding, just skip
            });
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
            if (!this._editorNavigating) {
                // Got here via browser back/forward — skip past this entry
                history.back();
                return;
            }
            this._editorNavigating = false;
            Builder.renderDayEditor(parseInt(editDayMatch[1]));
            return;
        }

        // Program check: no program loaded → go to setup
        if (!Storage.getProgram() && hash !== '#/setup') {
            location.hash = '#/setup';
            return;
        }

        // Setup check
        if (!Storage.isSetup() && hash !== '#/setup') {
            location.hash = '#/setup';
            return;
        }

        if (hash === '#/setup' || hash === '') {
            if (!Storage.getProgram() || !Storage.isSetup()) {
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

        if (this._inDayView) {
            this._inDayView = false;
            this._returnFromDay = this._currentDay;
        }

        // Day view: #/week/{n}/day/{n}
        const dayMatch = hash.match(/^#\/week\/(\d+)\/day\/(\d+)$/);
        if (dayMatch) {
            this._currentWeek = parseInt(dayMatch[1]);
            this._currentDay = parseInt(dayMatch[2]);
            AppState.currentWeek = this._currentWeek;
            AppState.currentDay = this._currentDay;
            this._inDayView = true;
            UI.renderDay(this._currentWeek, this._currentDay);
            return;
        }

        // Week view: #/week/{n}
        const weekMatch = hash.match(/^#\/week\/(\d+)$/);
        if (weekMatch) {
            this._currentWeek = parseInt(weekMatch[1]);
            AppState.currentWeek = this._currentWeek;
            this._swipeDir = null;
            // When returning from day view, restore cached HTML + scroll in one frame to avoid flash
            if (this._returnFromDay && this._pageCache[hash]) {
                document.getElementById('app').innerHTML = this._pageCache[hash];
                window.scrollTo(0, this._scrollCache[hash] || 0);
                UI._initSlotDragDrop(this._currentWeek);
                this._returnFromDay = null;
            } else {
                UI.renderWeek(this._currentWeek);
                if (this._returnFromDay) {
                    var dayCard = document.querySelector('a.day-card[href*="day/' + this._returnFromDay + '"]');
                    if (dayCard) dayCard.scrollIntoView({ block: 'center', behavior: 'instant' });
                    this._returnFromDay = null;
                } else {
                    this._restoreScroll();
                }
            }
            if (this._pendingFadeIn) {
                document.getElementById('app').style.opacity = '';
                this._pendingFadeIn = false;
            }
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

        // Auth (login, register, migrate, logout)
        if (this._handleAuthClick(target)) return;

        // Onboarding + Builder + Program management
        if (Builder.handleClick(target)) return;

        // Social (profiles, feed, checkins, chat, notifications)
        if (SocialUI.handleClick(target)) return;

        // Navigation (back buttons with animation)
        if (this._handleNavigationClick(target)) return;

        // Settings
        if (this._handleSettingsClick(target)) return;

        // Modals (substitution, gym, choice, equipment) — order matters internally
        if (WorkoutUI.handleModalClick(target, this._currentWeek, this._currentDay)) return;

        // Workout day (unit cycle, timer, sets, complete, history, export)
        if (WorkoutUI.handleClick(target, this._currentWeek, this._currentDay)) return;
    },

    // ===== Delegated auth click handlers =====
    _handleAuthClick(target) {
        // Login form submit
        if (target.closest('#login-submit')) {
            var loginInput = document.getElementById('login-input');
            var passInput = document.getElementById('password-input');
            var loginVal = loginInput ? loginInput.value.trim() : '';
            var passVal = passInput ? passInput.value.trim() : '';
            if (!loginVal || !passVal) return true;
            var loginResult = App.login(loginVal, passVal);
            if (loginResult === 'migrated') {
                var migratedAcct = ACCOUNTS ? ACCOUNTS.find(function(a) { return a.login === loginVal; }) : null;
                var migratedTo = migratedAcct ? localStorage.getItem('wt_migrated_' + migratedAcct.id) : null;
                var emailHint = migratedTo ? localStorage.getItem('wt_email_' + migratedTo) : null;
                var err = document.getElementById('login-error');
                if (err) {
                    err.textContent = emailHint
                        ? 'Войдите через email: ' + emailHint
                        : 'Аккаунт обновлён. Войдите через email и пароль.';
                    err.style.display = 'block';
                }
                return true;
            }
            if (loginResult === true) return true;
            if (SupaSync) {
                if (loginVal.includes('@')) {
                    App.loginSupabase(loginVal, passVal);
                } else {
                    App._loginByUsername(loginVal, passVal);
                }
                return true;
            }
            var err = document.getElementById('login-error');
            if (err) {
                err.textContent = 'Неверный логин или пароль';
                err.style.display = 'block';
            }
            return true;
        }

        // Password visibility toggle
        var togBtn = target.closest('.password-toggle');
        if (togBtn) {
            var inp = document.getElementById(read(togBtn, SETTINGS.TARGET));
            if (inp) {
                var show = inp.type === 'password';
                inp.type = show ? 'text' : 'password';
                togBtn.querySelector('.eye-icon').style.display = show ? 'none' : '';
                togBtn.querySelector('.eye-off-icon').style.display = show ? '' : 'none';
            }
            return true;
        }

        // Migration: submit
        if (target.closest('#migrate-submit')) {
            App._handleMigration();
            return true;
        }

        // Go to registration
        if (target.closest('#btn-register')) {
            history.replaceState(null, '', '#/register');
            App.route();
            return true;
        }

        // Registration: submit
        if (target.closest('#reg-submit')) {
            Builder.handleRegister();
            return true;
        }

        // Registration: go back to login
        if (target.closest('#btn-go-login')) {
            history.replaceState(null, '', '#/login');
            App.route();
            return true;
        }

        // Logout (menu + setup screen)
        if (target.closest('#btn-logout') || target.closest('#setup-logout')) {
            App.logout();
            return true;
        }

        return false;
    },

    // ===== Delegated settings click handlers =====
    _handleSettingsClick(target) {
        // Timer min/sec steppers
        if (['td-min-minus','td-min-plus','td-sec-minus','td-sec-plus'].includes(target.id)) {
            const minEl = document.getElementById('td-min-val');
            const secEl = document.getElementById('td-sec-val');
            if (!minEl || !secEl) return true;
            let mins = parseInt(minEl.textContent) || 0;
            let secs = parseInt(secEl.textContent) || 0;
            if (target.id === 'td-min-minus') mins = Math.max(0, mins - 1);
            if (target.id === 'td-min-plus') mins = Math.min(99, mins + 1);
            if (target.id === 'td-sec-minus') secs = secs === 0 ? 55 : secs - 5;
            if (target.id === 'td-sec-plus') secs = secs >= 55 ? 0 : secs + 5;
            if (mins === 0 && secs === 0) { secs = 5; }
            minEl.textContent = mins;
            secEl.textContent = String(secs).padStart(2, '0');
            return true;
        }

        // Save settings
        if (target.id === 'settings-save') {
            const cycleBtn = document.querySelector('.cycle-toggle button.active[' + SETTINGS.CYCLE + ']');
            const cycleType = cycleBtn ? readInt(cycleBtn, SETTINGS.CYCLE) : 7;
            const startDate = document.getElementById('settings-start-date').value;
            const unitBtn = document.querySelector('.cycle-toggle button.active[' + SETTINGS.UNIT + ']');
            const weightUnit = unitBtn ? read(unitBtn, SETTINGS.UNIT) : 'kg';
            const mins = parseInt(document.getElementById('td-min-val')?.textContent) || 0;
            const secs = parseInt(document.getElementById('td-sec-val')?.textContent) || 0;
            const timerDuration = Math.max(30, mins * 60 + secs);
            const langBtn = document.querySelector('.cycle-toggle button.active[' + SETTINGS.LANG + ']');
            const exerciseLang = langBtn ? read(langBtn, SETTINGS.LANG) : 'ru';
            Storage.saveSettings({ cycleType, startDate, weightUnit, timerDuration, exerciseLang });
            RestTimer.setDefaultDuration(timerDuration);
            this.invalidatePageCache(); // Settings affect all pages
            location.hash = `#/week/${App._currentWeek}`;
            return true;
        }

        // Add equipment
        if (target.closest('#settings-eq-add')) {
            const input = document.getElementById('settings-eq-name');
            const name = input ? input.value.trim() : '';
            if (!name) return true;
            Storage.addEquipment(name);
            UI.renderSettings();
            return true;
        }

        // Edit equipment name (inline)
        {const btn = target.closest('.eq-edit-btn');
        if (btn) {
            const eqId = read(btn, EQ.ID);
            if (!eqId) return true;
            var item = btn.closest('.settings-eq-item');
            var span = item ? item.querySelector('span') : null;
            if (!span || span.querySelector('input')) return true;
            var oldName = span.textContent.trim();
            document.querySelectorAll('.eq-remove-btn, .gym-remove-btn').forEach(function(b) { b.disabled = true; b.style.opacity = '0.3'; });
            span.innerHTML = '<input type="text" class="eq-inline-edit" value="' + esc(oldName) + '">';
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
            return true;
        }}

        // Remove equipment
        {const btn = target.closest('.eq-remove-btn');
        if (btn) {
            if (btn.disabled) return true;
            const eqId = read(btn, EQ.ID);
            if (eqId) {
                Storage.removeEquipment(eqId);
                UI.renderSettings();
            }
            return true;
        }}

        // Remove gym
        {var gymBtn = target.closest('.gym-remove-btn');
        if (gymBtn) {
            if (gymBtn.disabled) return true;
            var gymId = read(gymBtn, EQ.GYM_ID);
            if (gymId && confirm('Убрать зал из списка?')) {
                Storage.removeGym(gymId);
                UI.renderSettings();
            }
            return true;
        }}

        // Reset data
        if (target.id === 'btn-reset') {
            if (confirm('Вы уверены? Все данные будут удалены.')) {
                Storage.clearAll();
                location.hash = '#/setup';
            }
            return true;
        }

        return false;
    },


    // ===== Animated back-navigation helper =====
    _navigateBack(hash, beforeNav) {
        const app = document.getElementById('app');
        app.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
        app.style.transform = 'translateX(40px)';
        app.style.opacity = '0';
        setTimeout(() => {
            app.style.transition = 'none';
            app.style.transform = '';
            // Keep opacity=0 — restore only after DOM + scroll are ready
            if (beforeNav) beforeNav();
            if (hash === null) {
                this._pendingFadeIn = true;
                history.back();
            } else {
                // pushState doesn't fire hashchange — lets us run route() synchronously
                history.pushState(null, '', hash);
                this.route();
                app.style.opacity = '';
            }
        }, 190);
    },

    // ===== Delegated navigation click handlers =====
    _handleNavigationClick(target) {
        if (target.closest('#btn-back')) {
            this._navigateBack(`#/week/${this._currentWeek}`);
            return true;
        }
        if (target.closest('#btn-back-history')) {
            this._navigateBack(`#/week/${this._currentWeek}/day/${this._currentDay}`);
            return true;
        }
        if (target.closest('#btn-settings')) {
            location.hash = '#/menu';
            return true;
        }
        if (target.closest('#btn-back-menu')) {
            this._navigateBack(`#/week/${this._currentWeek}`);
            return true;
        }
        if (target.closest('#btn-back-settings')) {
            this._navigateBack('#/menu');
            return true;
        }
        if (target.closest('#btn-back-calc')) {
            this._navigateBack('#/menu');
            return true;
        }
        if (target.closest('#btn-back-guide')) {
            this._navigateBack('#/menu');
            return true;
        }
        return false;
    },




    handleInput(e) {
        if (WorkoutUI.handleInput(e.target, this._currentWeek, this._currentDay, this._saveDebounced)) return;
    },

    handleFocus(e) {
        if (WorkoutUI.handleFocus(e.target)) return;
    },



};

// Celebration moved to js/celebration.js
