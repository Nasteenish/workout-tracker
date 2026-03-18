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
import { WorkoutTimer } from './workout-timer.js';
import { EquipmentManager } from './equipment-manager.js';
import { MessageNotifications } from './message-notifications.js';
import { ProfileManager } from './profile-manager.js';
import { AvatarCropper } from './cropper.js';
import { Migrations } from './migrations.js';
import { ACCOUNTS, BUILTIN_PROGRAMS } from './users.js';
import { DEFAULT_PROGRAM } from './data.js';
import { lockBodyScroll, unlockBodyScroll } from './scroll-lock.js';
import { debounce, getTotalDays, formatDateISO, validateProgram, getProgressWeek, getTotalWeeks, esc, getCompletedSets, findExerciseInProgram, parseWeight, parseReps } from './utils.js';
import { WORKOUT, BUILDER, EQ, SOCIAL, SETTINGS, ONBOARDING, read, readInt } from './data-attrs.js';

export const App = {
    _currentWeek: 1,
    _currentDay: 1,
    _saveDebounced: null,
    _swipeDir: null,
    _pendingMigration: null,
    _pendingCheckinWorkout: null,
    _pageCache: {},

    invalidatePageCache(hashOrPrefix) {
        if (!hashOrPrefix) { this._pageCache = {}; return; }
        for (var key in this._pageCache) {
            if (key === hashOrPrefix || key.startsWith(hashOrPrefix + '/'))
                delete this._pageCache[key];
        }
    },

    init() {
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

        // Route handling
        window.addEventListener('hashchange', () => {
            if (this._swipeLock) return;
            if (this._isBackSwipe) {
                clearTimeout(this._backSwipeFallbackTimer);
                this._isBackSwipe = false;
                this.route(true);
                if (this._pendingSwipeCleanup) {
                    this._pendingSwipeCleanup();
                    this._pendingSwipeCleanup = null;
                }
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
            // Rollback equipment after sync (sync may overwrite a pre-sync rollback)
            Storage.checkPendingEquipmentRollback();
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

            self.switchUser(localId);

            // Sync data from cloud
            SupaSync.syncOnLogin(supaUserId, 'wt_data_' + localId).then(function() {
                // Reload data after sync
                Storage._invalidateCache();
                Migrations.cleanOrphanedLogEntries();
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

    // Login by username — look up email from profiles, then sign in via Supabase
    async _loginByUsername(username, password) {
        var errEl = document.getElementById('login-error');
        var btn = document.getElementById('login-submit');
        if (btn) { btn.disabled = true; btn.textContent = 'ВХОД...'; }
        try {
            if (!supa) throw new Error('Supabase не загружен');
            var result = await supa.from('profiles').select('user_id').eq('username', username).single();
            if (result.error || !result.data) {
                // Try the username as-is with Supabase (in case it's an email without @... unlikely but safe)
                throw new Error('Пользователь не найден');
            }
            // Got user_id, now get their email from auth
            // We can't query auth directly, but we can try signing in with email
            // Look up email from auth users via admin... no, we're client-side.
            // Instead, query profiles or look for stored email mapping
            // Fallback: try to get user email from Supabase auth metadata
            var userId = result.data.user_id;
            // Check if we have a local email cached
            var cachedEmail = null;
            var users = Storage.getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === 'supa_' + userId && users[i].email) {
                    cachedEmail = users[i].email;
                    break;
                }
            }
            if (cachedEmail) {
                await this.loginSupabase(cachedEmail, password);
                return;
            }
            // No cached email — tell user to use email
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

        // Auth (login, register, migrate, logout)
        if (this._handleAuthClick(target)) return;

        // Onboarding + Builder + Program management
        if (this._handleBuilderClick(target)) return;

        // Social (profiles, feed, checkins, chat, notifications)
        if (this._handleSocialClick(target)) return;

        // Navigation (back buttons with animation)
        if (this._handleNavigationClick(target)) return;

        // Settings
        if (this._handleSettingsClick(target)) return;

        // Modals (substitution, gym, choice, equipment) — order matters internally
        if (this._handleModalClick(target)) return;

        // Workout day (unit cycle, timer, sets, complete, history, export)
        if (this._handleWorkoutClick(target)) return;
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
        if (target.closest('.eq-edit-btn')) {
            const btn = target.closest('.eq-edit-btn');
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
        }

        // Remove equipment
        if (target.closest('.eq-remove-btn')) {
            const btn = target.closest('.eq-remove-btn');
            if (btn.disabled) return true;
            const eqId = read(btn, EQ.ID);
            if (eqId) {
                Storage.removeEquipment(eqId);
                UI.renderSettings();
            }
            return true;
        }

        // Remove gym
        if (target.closest('.gym-remove-btn')) {
            var btn = target.closest('.gym-remove-btn');
            if (btn.disabled) return true;
            var gymId = read(btn, EQ.GYM_ID);
            if (gymId && confirm('Убрать зал из списка?')) {
                Storage.removeGym(gymId);
                UI.renderSettings();
            }
            return true;
        }

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

    // ===== Delegated workout click handlers =====
    _handleWorkoutClick(target) {
        // Unit cycle button
        if (target.matches('.unit-cycle-btn')) {
            const exId = read(target, WORKOUT.EXERCISE);
            const units = ['kg', 'lbs', 'plates'];
            const labels = { kg: 'кг', lbs: 'lbs', plates: 'пл' };
            const current = Storage.getExerciseUnit(exId) || Storage.getWeightUnit();
            const next = units[(units.indexOf(current) + 1) % units.length];
            Storage.setExerciseUnit(exId, next);
            const nextLabel = labels[next];
            document.querySelectorAll('.unit-cycle-btn[' + WORKOUT.EXERCISE + '="' + exId + '"]').forEach(b => {
                b.textContent = nextLabel;
            });
            document.querySelectorAll('.set-prev-unit[' + WORKOUT.EXERCISE + '="' + exId + '"]').forEach(s => {
                s.textContent = nextLabel;
            });
            return true;
        }

        // Start workout timer
        if (target.id === 'btn-start-workout') {
            UI.showGymModal(function(gymId) {
                Storage.saveWorkoutGym(App._currentWeek, App._currentDay, gymId || null);
                if (gymId) {
                    Storage.touchGym(gymId);
                    if (Storage.gymHasEquipmentMap(gymId)) {
                        Storage.applyGymEquipment(gymId);
                    } else {
                        Storage.initGymFromCurrentEquipment(gymId);
                    }
                    WorkoutTimer.start(App._currentWeek, App._currentDay);
                    UI.renderDay(App._currentWeek, App._currentDay);
                } else {
                    WorkoutTimer.start(App._currentWeek, App._currentDay);
                    UI.renderDay(App._currentWeek, App._currentDay);
                }
            });
            return true;
        }

        if (target.id === 'btn-pause-workout') {
            WorkoutTimer.pause(App._currentWeek, App._currentDay);
            UI.renderDay(App._currentWeek, App._currentDay);
            return true;
        }

        if (target.id === 'btn-resume-workout') {
            WorkoutTimer.unpause(App._currentWeek, App._currentDay);
            UI.renderDay(App._currentWeek, App._currentDay);
            return true;
        }

        if (target.id === 'btn-cancel-workout') {
            WorkoutTimer.cancel(App._currentWeek, App._currentDay);
            UI.renderDay(App._currentWeek, App._currentDay);
            return true;
        }

        // Add set button
        if (target.closest('.add-set-btn')) {
            const btn = target.closest('.add-set-btn');
            const exId = read(btn, WORKOUT.EXERCISE);
            App._addSet(exId);
            return true;
        }

        // Remove set button
        if (target.closest('.remove-set-btn')) {
            const btn = target.closest('.remove-set-btn');
            const exId = read(btn, WORKOUT.EXERCISE);
            App._removeSet(exId);
            return true;
        }

        // Equipment button
        if (target.closest('.equipment-btn')) {
            const btn = target.closest('.equipment-btn');
            const exId = read(btn, WORKOUT.EXERCISE);
            UI.showEquipmentModal(exId, read(btn, WORKOUT.EX_NAME) || '', read(btn, WORKOUT.EX_NAME_RU) || '');
            return true;
        }

        // Complete button
        if (target.closest('.complete-btn')) {
            const btn = target.closest('.complete-btn');
            const exId = read(btn, WORKOUT.EXERCISE);
            const setIdx = readInt(btn, WORKOUT.SET);
            const eqId = Storage.getExerciseEquipment(exId);

            const row = btn.closest('.set-row');
            const weightInput = row.querySelector('.weight-input');
            const repsInput = row.querySelector('.reps-input');
            const weight = parseWeight(weightInput.value) || parseWeight(weightInput.placeholder);
            const reps = parseReps(repsInput.value) || parseReps(repsInput.placeholder);

            const existing = Storage.getSetLog(App._currentWeek, App._currentDay, exId, setIdx);
            if (existing && existing.completed) {
                Storage.toggleSetComplete(App._currentWeek, App._currentDay, exId, setIdx, eqId);
                btn.classList.remove('completed');
                row.classList.remove('done');
                btn.innerHTML = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18.5" stroke="rgba(157,141,245,0.4)" stroke-width="1.5"/></svg>';
            } else {
                if (weight > 0) {
                    weightInput.value = weight;
                }
                if (reps > 0) {
                    repsInput.value = reps;
                }
                Storage.saveSetLog(App._currentWeek, App._currentDay, exId, setIdx, weight, reps, eqId);
                var activeGym = EquipmentManager.getActiveGymId(App._currentWeek, App._currentDay);
                if (activeGym && eqId) {
                    Storage.setGymExerciseEquipment(activeGym, exId, eqId);
                    EquipmentManager.shareToGymEquipment(exId, Storage.getEquipmentById(eqId), App._currentWeek, App._currentDay);
                }

                row.querySelectorAll('.seg-weight-input[' + WORKOUT.SEG + ']').forEach(inp => {
                    var si = readInt(inp, WORKOUT.SEG);
                    if (si > 0 && inp.value) Storage.saveSegWeight(App._currentWeek, App._currentDay, exId, setIdx, si, inp.value);
                });
                row.querySelectorAll('.seg-reps-input[' + WORKOUT.SEG + ']').forEach(inp => {
                    var si = readInt(inp, WORKOUT.SEG);
                    if (si > 0 && inp.value) Storage.saveSegReps(App._currentWeek, App._currentDay, exId, setIdx, si, inp.value);
                });

                btn.classList.add('completed');
                const gid = `cg-${exId}-${setIdx}`;
                btn.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#${gid})"/><g transform="translate(11,11)"><path d="M4 9l3.5 3.5L14 5.5" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
                btn.classList.add('pop');
                btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
                row.classList.add('done');

                var progress = getCompletedSets(App._currentWeek, App._currentDay);
                if (progress.total > 0 && progress.completed >= progress.total) {
                    App._showFinishButton();
                } else {
                    RestTimer.start(row);
                }
            }
            // Invalidate week cache (progress changed)
            this.invalidatePageCache('#/week/' + this._currentWeek);
            return true;
        }

        // Choose one: tap exercise name to open selector
        if (target.closest('.exercise-name-chooser')) {
            const el = target.closest('.exercise-name-chooser');
            UI.showChoiceModal(read(el, WORKOUT.CHOICE_KEY));
            return true;
        }

        // Choice modal: close on overlay
        if (target.id === 'choice-modal') {
            UI.hideChoiceModal();
            return true;
        }

        // History button
        if (target.closest('.history-btn')) {
            const btn = target.closest('.history-btn');
            const exId = read(btn, WORKOUT.EXERCISE);
            location.hash = `#/history/${encodeURIComponent(exId)}`;
            return true;
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
            return true;
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
                        App.route();
                    } else {
                        alert('Ошибка импорта файла');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
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
            app.style.opacity = '';
            window.scrollTo(0, 0);
            if (beforeNav) beforeNav();
            if (hash === null) history.back();
            else location.hash = hash;
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

    // ===== Delegated builder/onboarding/setup click handlers =====
    _handleBuilderClick(target) {
        // Onboarding: gender
        var genderBtn = target.closest('.onboard-gender-btn');
        if (genderBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.gender = read(genderBtn, ONBOARDING.GENDER);
            location.hash = '#/onboarding/2';
            return true;
        }

        // Onboarding: role selection
        var roleBtn = target.closest('.onboard-role-btn');
        if (roleBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.role = read(roleBtn, ONBOARDING.ROLE);
            if (read(roleBtn, ONBOARDING.ROLE) === 'casual') location.hash = '#/onboarding/3';
            else if (read(roleBtn, ONBOARDING.ROLE) === 'athlete') location.hash = '#/onboarding/3a';
            else if (read(roleBtn, ONBOARDING.ROLE) === 'trainer') location.hash = '#/onboarding/3t';
            return true;
        }

        // Onboarding: goal (casual)
        var goalBtn = target.closest('.onboard-goal-btn');
        if (goalBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.goal = read(goalBtn, ONBOARDING.GOAL);
            Builder._finishOnboarding();
            return true;
        }

        // Onboarding: pro/amateur (athlete)
        var proBtn = target.closest('.onboard-pro-btn');
        if (proBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.is_pro = read(proBtn, ONBOARDING.PRO) === 'true';
            location.hash = '#/onboarding/4';
            return true;
        }

        // Onboarding: category (athlete)
        var catBtn = target.closest('.onboard-category-btn');
        if (catBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.category = read(catBtn, ONBOARDING.CATEGORY);
            location.hash = '#/onboarding/5';
            return true;
        }

        // Onboarding: phase (athlete)
        var phaseBtn = target.closest('.onboard-phase-btn');
        if (phaseBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.phase = read(phaseBtn, ONBOARDING.PHASE);
            Builder._finishOnboarding();
            return true;
        }

        // Onboarding: client count (trainer)
        var clientsBtn = target.closest('.onboard-clients-btn');
        if (clientsBtn) {
            if (!Builder._onboardingData) Builder._onboardingData = {};
            Builder._onboardingData.client_count = read(clientsBtn, ONBOARDING.CLIENTS);
            Builder._finishOnboarding();
            return true;
        }

        // Setup: import program from file
        if (target.closest('#setup-import-program')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                App.importProgram(file).then(() => {
                    UI.renderSetup();
                }).catch(err => {
                    const status = document.getElementById('program-status');
                    if (status) status.innerHTML = `<span style="color:#FF2D55">${err}</span>`;
                });
            };
            input.click();
            return true;
        }

        // Setup: create program (builder)
        if (target.closest('#setup-create-program')) {
            location.hash = '#/builder/step1';
            return true;
        }

        // Builder wizard: toggle buttons (weeks/days)
        if (target.matches('.builder-toggle button')) {
            var btns = target.parentElement.querySelectorAll('button');
            btns.forEach(function(b) { b.classList.remove('active'); });
            target.classList.add('active');
            return true;
        }

        // Builder wizard: step1 → step2
        if (target.closest('#builder-next')) {
            Builder.saveStep1();
            location.hash = '#/builder/step2';
            return true;
        }

        // Builder wizard: back from step1 → setup
        if (target.closest('#builder-back-setup')) {
            location.hash = '#/setup';
            return true;
        }

        // Builder wizard: back from step2 → step1
        if (target.closest('#builder-back-step1')) {
            // Save day names to config
            if (Builder._config) {
                var dayInputs = document.querySelectorAll('.builder-day-name');
                var names = [];
                dayInputs.forEach(function(inp) { names.push(inp.value.trim()); });
                Builder._config.dayNames = names;
            }
            location.hash = '#/builder/step1';
            return true;
        }

        // Builder wizard: create program
        if (target.closest('#builder-create')) {
            Builder.createProgram();
            location.hash = '#/setup';
            return true;
        }

        // Setup summary: back to initial setup
        if (target.closest('#setup-back-builder')) {
            if (Builder._config) {
                location.hash = '#/builder/step2';
            } else {
                var numDays = getTotalDays();
                var dayNames = [];
                var _p = Storage.getProgram();
                for (var d = 1; d <= numDays; d++) {
                    var tmpl = _p && _p.dayTemplates[d];
                    dayNames.push(tmpl ? (tmpl.titleRu || tmpl.title || '') : '');
                }
                Builder._config = {
                    title: _p ? (_p.title || '') : '',
                    totalWeeks: _p ? (_p.totalWeeks || 4) : 4,
                    numDays: numDays,
                    dayNames: dayNames
                };
                location.hash = '#/builder/step2';
            }
            return true;
        }

        // Day editor: add exercise
        if (target.closest('#editor-add-exercise')) {
            Builder.showExercisePicker();
            return true;
        }

        // Day editor: delete exercise
        if (target.closest('.editor-delete')) {
            var btn = target.closest('.editor-delete');
            Builder.deleteExercise(readInt(btn, BUILDER.IDX));
            return true;
        }

        // Day editor: back
        // btn-back-editor handled by direct listener in Builder.renderDayEditor

        // Empty day: add exercise → open editor + picker directly
        if (target.closest('#btn-add-exercise-empty')) {
            Builder.renderDayEditor(App._currentDay);
            Builder.showExercisePicker();
            return true;
        }

        // Edit day (pencil on training day view)
        if (target.closest('#btn-edit-day')) {
            App._editorNavigating = true;
            location.hash = '#/edit/day/' + App._currentDay;
            return true;
        }

        // Setup: back to onboarding
        if (target.closest('#setup-back-onboarding')) {
            Builder._onboardingData = {};
            location.hash = '#/onboarding/1';
            return true;
        }

        // Setup: use default program
        if (target.closest('#setup-use-default')) {
            if (DEFAULT_PROGRAM) {
                Storage.saveProgram(DEFAULT_PROGRAM, false);
                Storage.setProgram(DEFAULT_PROGRAM);
                this.invalidatePageCache(); // Program changed
                UI.renderSetup();
            }
            return true;
        }

        // Setup: cycle toggle
        if (target.matches('.cycle-toggle button')) {
            const buttons = target.parentElement.querySelectorAll('button');
            buttons.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            return true;
        }

        // Setup: start button
        if (target.id === 'setup-start') {
            App.startSetup();
            return true;
        }

        // Week navigation
        if (target.closest('#prev-week')) {
            location.hash = `#/week/${App._currentWeek === 1 ? getTotalWeeks() : App._currentWeek - 1}`;
            return true;
        }
        if (target.closest('#next-week')) {
            location.hash = `#/week/${App._currentWeek === getTotalWeeks() ? 1 : App._currentWeek + 1}`;
            return true;
        }
        // Add/remove day for custom programs
        if (target.closest('#btn-add-day')) {
            App._addDayToCustomProgram();
            return true;
        }
        if (target.closest('#btn-remove-day')) {
            App._removeDayFromCustomProgram();
            return true;
        }
        // Add week button for custom programs
        if (target.closest('#btn-add-week')) {
            App._addWeekToCustomProgram();
            return true;
        }
        // Remove week button for custom programs
        if (target.closest('#btn-remove-week')) {
            App._removeWeekFromCustomProgram();
            return true;
        }

        return false;
    },

    // ===== Delegated modal click handlers (substitution, gym, choice, equipment) =====
    _bindEquipment(exId, eqId, shareInfo) {
        Storage.setExerciseEquipment(exId, eqId);
        var activeGym = EquipmentManager.getActiveGymId(this._currentWeek, this._currentDay);
        if (activeGym) Storage.setGymExerciseEquipment(activeGym, exId, eqId);
        if (shareInfo) EquipmentManager.shareToGymEquipment(exId, shareInfo, this._currentWeek, this._currentDay);
        UI.hideEquipmentModal();
        // Invalidate day cache (equipment changed)
        this.invalidatePageCache('#/week/' + this._currentWeek + '/day/' + this._currentDay);
        UI.renderDay(this._currentWeek, this._currentDay);
    },

    _handleModalClick(target) {
        // Substitution modal — select exercise from list (must be before eq-option handler)
        if (target.closest('.sub-option')) {
            const opt = target.closest('.sub-option');
            const exId = read(opt, WORKOUT.TARGET_EXERCISE);
            const subName = read(opt, WORKOUT.SUB_NAME);
            Storage.setSubstitution(exId, subName);
            UI.hideSubstitutionModal();
            this.invalidatePageCache('#/week/' + this._currentWeek + '/day/' + this._currentDay);
            UI.renderDay(this._currentWeek, this._currentDay);
            return true;
        }

        // Substitution modal — add custom name
        if (target.closest('#sub-add-custom-btn')) {
            const input = document.getElementById('sub-custom-name');
            const name = input ? input.value.trim() : '';
            if (!name) return true;
            const modal = document.getElementById('substitution-modal');
            const exId = modal ? modal._exerciseId : null;
            if (exId) {
                Storage.setSubstitution(exId, name);
                UI.hideSubstitutionModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return true;
        }

        // Substitution modal — revert to original
        if (target.closest('.sub-revert-btn')) {
            const btn = target.closest('.sub-revert-btn');
            const exId = read(btn, WORKOUT.EXERCISE);
            Storage.removeSubstitution(exId);
            UI.hideSubstitutionModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return true;
        }

        // Substitution modal — close button or overlay
        if (target.closest('#sub-close-btn') || target.id === 'substitution-modal') {
            UI.hideSubstitutionModal();
            return true;
        }

        // Gym modal — select gym
        if ((target.closest('.eq-option[' + EQ.GYM_ID + ']')) && target.closest('#gym-modal')) {
            var opt = target.closest('.eq-option[' + EQ.GYM_ID + ']');
            var gymId = read(opt, EQ.GYM_ID) || null;
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            UI.hideGymModal();
            if (onSelect) onSelect(gymId);
            return true;
        }

        // Gym modal — select shared gym from search results
        if (target.closest('.gym-shared-item')) {
            var item = target.closest('.gym-shared-item');
            var sharedId = read(item, EQ.GYM_SHARED_ID);
            if (sharedId) {
                Storage.addMyGym(sharedId);
                var modal = document.getElementById('gym-modal');
                var onSelect = modal ? modal._onSelect : null;
                UI.hideGymModal();
                if (onSelect) onSelect(sharedId);
            }
            return true;
        }

        // Gym modal — add new gym
        if (target.closest('#gym-add-btn')) {
            var input = document.getElementById('gym-new-name');
            var name = input ? input.value.trim() : '';
            if (!name) return true;
            // Show city prompt
            var prompt = document.getElementById('gym-city-prompt');
            if (prompt) {
                prompt.style.display = 'flex';
                var cityInput = document.getElementById('gym-new-city');
                if (cityInput) { cityInput.value = ''; cityInput.focus(); }
            }
            return true;
        }

        // Gym modal — confirm city and save (creates in Supabase shared_gyms)
        if (target.closest('#gym-city-ok')) {
            var input = document.getElementById('gym-new-name');
            var cityInput = document.getElementById('gym-new-city');
            var name = input ? input.value.trim() : '';
            var city = cityInput ? cityInput.value.trim() : '';
            if (!name) return true;
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            // Create gym in Supabase, then add locally
            if (Social) {
                Social.addSharedGym(name, city).then(function(shared) {
                    if (shared && shared.id) {
                        // Add to gym cache
                        Storage._gymCache.push(shared);
                        Storage.addMyGym(shared.id);
                        UI.hideGymModal();
                        if (onSelect) onSelect(shared.id);
                    }
                }).catch(function(e) {
                    console.error('Failed to create gym:', e);
                    alert('Не удалось создать зал. Проверь интернет.');
                });
            }
            return true;
        }

        // Gym modal — close on overlay
        if (target.id === 'gym-modal') {
            UI.hideGymModal();
            return true;
        }

        // Gym geo suggestion — Yes
        if (target.id === 'gym-geo-yes') {
            var gymId = read(target, EQ.GYM_ID);
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            UI.hideGymModal();
            if (onSelect) onSelect(gymId);
            return true;
        }

        // Gym geo suggestion — No
        if (target.id === 'gym-geo-no') {
            var el = document.getElementById('gym-geo-suggestion');
            if (el) el.style.display = 'none';
            return true;
        }

        // Gym link prompt — Yes (link current equipment to gym)
        if (target.id === 'gym-link-yes') {
            var gymId = read(target, EQ.GYM_ID);
            Storage.initGymFromCurrentEquipment(gymId);
            UI.hideGymModal();
            WorkoutTimer.start(this._currentWeek, this._currentDay);
            UI.renderDay(this._currentWeek, this._currentDay);
            return true;
        }

        // Gym link prompt — No (skip linking)
        if (target.id === 'gym-link-no') {
            var gymId = read(target, EQ.GYM_ID);
            UI.hideGymModal();
            WorkoutTimer.start(this._currentWeek, this._currentDay);
            UI.renderDay(this._currentWeek, this._currentDay);
            return true;
        }

        // Choice modal: select option (must be before eq-option handler)
        if (target.closest('.eq-option[' + WORKOUT.CHOICE_KEY + ']')) {
            const opt = target.closest('.eq-option[' + WORKOUT.CHOICE_KEY + ']');
            const choiceKey = read(opt, WORKOUT.CHOICE_KEY);
            const exerciseId = read(opt, WORKOUT.EXERCISE_ID);
            Storage.saveChoice(choiceKey, exerciseId);
            UI.hideChoiceModal();
            this.invalidatePageCache('#/week/' + this._currentWeek + '/day/' + this._currentDay);
            UI.renderDay(this._currentWeek, this._currentDay);
            return true;
        }

        // Equipment modal — ignore clicks on inputs
        if (target.closest('#equipment-modal') && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            return true;
        }

        // Equipment modal — select option
        if (target.closest('.eq-option')) {
            const opt = target.closest('.eq-option');
            const eqId = read(opt, EQ.ID);
            const exId = read(opt, WORKOUT.EXERCISE);
            this._bindEquipment(exId, eqId || null, eqId ? Storage.getEquipmentById(eqId) : null);
            return true;
        }

        // Equipment modal — add new custom
        if (target.closest('#eq-add-btn')) {
            const input = document.getElementById('eq-new-name');
            const name = input ? input.value.trim() : '';
            if (!name) return true;
            const modal = document.getElementById('equipment-modal');
            const exId = modal ? modal._exerciseId : null;
            const muscleGroup = modal ? modal._muscleGroup : null;
            const newId = Storage.addEquipment(name);
            if (Social && muscleGroup && muscleGroup !== 'all') {
                Social.addSharedEquipment(name, muscleGroup).catch(function() {});
            }
            if (exId) {
                this._bindEquipment(exId, newId, { name: name });
            }
            return true;
        }

        // Equipment modal — click search result (catalog or shared)
        if (target.closest('.eq-search-item')) {
            var item = target.closest('.eq-search-item');
            var eqName = read(item, EQ.NAME);
            var catalogId = read(item, EQ.CATALOG_ID) ? readInt(item, EQ.CATALOG_ID) : null;
            if (!eqName) return true;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var muscleGroup = modal ? modal._muscleGroup : null;
            var eqImageUrl2 = read(item, EQ.IMAGE) || null;
            var newId = Storage.addEquipment(eqName, undefined, eqImageUrl2);
            if (Social && muscleGroup && muscleGroup !== 'all') {
                Social.addSharedEquipment(eqName, muscleGroup).catch(function() {});
            }
            if (exId) {
                this._bindEquipment(exId, newId, { name: eqName, catalogId: catalogId });
            } else {
                UI.hideEquipmentModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return true;
        }

        // Equipment modal — click gym equipment item
        if (target.closest('.eq-gym-item')) {
            var item = target.closest('.eq-gym-item');
            var eqName = read(item, EQ.NAME);
            if (!eqName) return true;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var newId = Storage.addEquipment(eqName);
            if (exId) {
                this._bindEquipment(exId, newId, null);
            } else {
                UI.hideEquipmentModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return true;
        }

        // Equipment modal — brand click → show brand equipment
        if (target.closest('.eq-brand-item')) {
            var brandItem = target.closest('.eq-brand-item');
            var brand = read(brandItem, EQ.BRAND);
            var extype = read(brandItem, EQ.EXTYPE) || null;
            if (brand) EquipmentManager.loadBrandEquipment(brand, extype);
            return true;
        }

        // Equipment modal — back to brands
        if (target.closest('#eq-brand-back')) {
            EquipmentManager.backToBrands();
            return true;
        }

        // Equipment modal — select from catalog
        if (target.closest('.eq-catalog-item')) {
            var catItem = target.closest('.eq-catalog-item');
            var eqName = read(catItem, EQ.NAME);
            var catalogId = read(catItem, EQ.CATALOG_ID) ? readInt(catItem, EQ.CATALOG_ID) : null;
            if (!eqName) return true;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var eqImageUrl = read(catItem, EQ.IMAGE) || null;
            var newId = Storage.addEquipment(eqName, undefined, eqImageUrl);
            if (exId) {
                Storage.linkEquipmentToExercise(exId, newId);
                this._bindEquipment(exId, newId, { name: eqName, catalogId: catalogId });
            } else {
                UI.hideEquipmentModal();
                UI.renderDay(this._currentWeek, this._currentDay);
            }
            return true;
        }

        // Equipment modal — remove current equipment
        if (target.closest('#eq-remove-btn')) {
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            if (exId) {
                Storage.removeExerciseEquipment(exId);
                var row = document.getElementById('eq-current-row');
                if (row) row.remove();
            }
            UI.hideEquipmentModal();
            UI.renderDay(this._currentWeek, this._currentDay);
            return true;
        }

        // Equipment modal — close on overlay or X button
        if (target.closest('#eq-close')) {
            UI.hideEquipmentModal();
            return true;
        }
        if (target.id === 'equipment-modal') {
            // Ignore phantom overlay clicks from iOS input focus (within 600ms)
            var modal = document.getElementById('equipment-modal');
            if (modal && modal._inputFocusedAt && (Date.now() - modal._inputFocusedAt < 600)) return true;
            UI.hideEquipmentModal();
            return true;
        }

        return false;
    },

    // ===== Delegated social click handlers =====
    _handleSocialClick(target) {
        // Profile edit button
        if (target.closest('#btn-profile-edit')) {
            location.hash = '#/profile/edit';
            return true;
        }

        // New checkin button
        if (target.closest('#btn-new-checkin')) {
            location.hash = '#/checkin';
            return true;
        }

        // Profile grid item click → detail
        var gridItem = target.closest('.profile-feed-item');
        if (gridItem) {
            var cid = read(gridItem, SOCIAL.CHECKIN);
            if (cid) location.hash = '#/checkin/' + cid;
            return true;
        }

        // Profile post-type tab filter
        if (target.classList.contains('profile-tab')) {
            var allTabs = document.querySelectorAll('.profile-tab');
            allTabs.forEach(function(t) { t.classList.remove('active'); });
            target.classList.add('active');
            var tab = read(target, SOCIAL.TAB);
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
            return true;
        }

        // Profile save
        if (target.closest('#btn-profile-save')) {
            ProfileManager.saveProfile();
            return true;
        }

        // Profile back
        if (target.closest('#btn-profile-back')) {
            location.hash = '#/profile';
            return true;
        }

        // Avatar file input
        if (target.closest('#avatar-file-input')) {
            // handled by change event below
            return false;
        }

        // Athlete toggle
        if (target.id === 'edit-is-athlete') {
            var fields = document.getElementById('edit-athlete-fields');
            if (fields) fields.style.display = target.checked ? '' : 'none';
            return true;
        }

        // Follow/unfollow
        if (target.closest('#btn-follow')) {
            var btn = target.closest('#btn-follow');
            var userId = read(btn, SOCIAL.USER);
            if (!userId) return true;
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
            return true;
        }

        // Follow (small btn in discover)
        if (target.classList.contains('btn-follow-sm')) {
            var userId = read(target, SOCIAL.USER);
            if (!userId) return true;
            target.disabled = true;
            Social.follow(userId).then(function(ok) {
                if (ok) {
                    target.textContent = 'Подписан';
                    target.classList.add('followed');
                } else {
                    target.disabled = false;
                }
            }).catch(function(e) { target.disabled = false; alert('Ошибка: ' + e.message); });
            return true;
        }

        // Discover navigation
        if (target.closest('#btn-discover') || target.closest('#btn-discover-empty')) {
            location.hash = '#/discover';
            return true;
        }

        // Discover back
        if (target.closest('#btn-discover-back')) {
            location.hash = '#/feed';
            return true;
        }

        // Follow list back
        if (target.closest('#btn-followlist-back')) {
            history.back();
            return true;
        }

        // Discover search
        if (target.closest('#btn-discover-search')) {
            var query = (document.getElementById('discover-search-input').value || '').trim();
            if (!query) return true;
            var resultsEl = document.getElementById('discover-results');
            if (resultsEl) resultsEl.innerHTML = '<div class="social-loading">Поиск...</div>';
            Promise.all([Social.searchUsers(query), Social.getMyFollowingIds()]).then(function(r) {
                if (resultsEl) resultsEl.innerHTML = SocialUI._renderUserList(r[0], Social._getSupaUserId(), r[1]);
            });
            return true;
        }

        // Discover user click → profile
        var discoverUser = target.closest('.discover-user');
        if (discoverUser && !target.classList.contains('btn-follow-sm')) {
            var userId = discoverUser.querySelector('.btn-follow-sm');
            if (userId) {
                var uid = read(userId, SOCIAL.USER);
                var username = discoverUser.querySelector('.discover-user-username');
                if (username) {
                    location.hash = '#/u/' + username.textContent.replace('@', '');
                }
            }
            return true;
        }

        // Notifications button
        if (target.closest('#btn-notifications')) {
            location.hash = '#/notifications';
            return true;
        }

        // Messages button (feed header)
        if (target.closest('#btn-messages')) {
            location.hash = '#/messages';
            return true;
        }

        // Messages back
        if (target.closest('#btn-messages-back')) {
            history.back();
            return true;
        }

        // Chat back
        if (target.closest('#btn-chat-back')) {
            Social.unsubscribeMessages();
            if (SocialUI._chatViewportCleanup) { SocialUI._chatViewportCleanup(); SocialUI._chatViewportCleanup = null; }
            history.back();
            return true;
        }

        // Conversation item click
        var convItem = target.closest('.conversation-item');
        if (convItem) {
            var userId = read(convItem, SOCIAL.USER);
            if (userId) location.hash = '#/messages/' + userId;
            return true;
        }

        // Send message
        if (target.closest('#btn-send-message')) {
            var inp = document.getElementById('chat-input');
            var text = inp ? inp.value.trim() : '';
            if (!text || !SocialUI._chatConvId) return true;
            inp.value = '';
            // Optimistic render
            var chatEl = document.getElementById('chat-messages');
            if (chatEl) {
                var time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                chatEl.insertAdjacentHTML('beforeend', '<div class="chat-bubble mine">' + text + '<div class="chat-bubble-time">' + time + '</div></div>');
                chatEl.scrollTop = chatEl.scrollHeight;
            }
            Social.sendMessage(SocialUI._chatConvId, text).catch(function() {});
            return true;
        }

        // DM button on other user's profile
        if (target.closest('#btn-dm')) {
            var btn = target.closest('#btn-dm');
            var userId = read(btn, SOCIAL.USER);
            if (userId) location.hash = '#/messages/' + userId;
            return true;
        }

        // Notification back
        if (target.closest('#btn-notif-back')) {
            history.back();
            return true;
        }

        // Like button (feed cards and detail)
        var likeBtn = target.closest('.like-btn');
        if (likeBtn) {
            var checkinId = read(likeBtn, SOCIAL.CHECKIN);
            if (!checkinId) return true;
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
            return true;
        }

        // Comment icon button → scroll to or navigate to comments
        var commentBtnIcon = target.closest('.comment-btn-icon');
        if (commentBtnIcon) {
            var checkinId = read(commentBtnIcon, SOCIAL.CHECKIN);
            var commentInput = document.getElementById('comment-input');
            if (commentInput) {
                commentInput.focus();
            } else if (checkinId) {
                location.hash = '#/checkin/' + checkinId;
            }
            return true;
        }

        // Comment author profile link
        var profileLink = target.closest('.comment-profile-link');
        if (profileLink && !target.closest('.comment-reply-btn') && !target.closest('.comment-like-btn')) {
            var username = read(profileLink, SOCIAL.USERNAME);
            if (username) location.hash = '#/u/' + username;
            return true;
        }

        // Reply to comment
        var replyBtn = target.closest('.comment-reply-btn');
        if (replyBtn) {
            var username = read(replyBtn, SOCIAL.USERNAME);
            var commentId = read(replyBtn, SOCIAL.COMMENT_ID);
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
            return true;
        }

        // Cancel reply
        if (target.closest('#btn-reply-cancel')) {
            App._replyToCommentId = null;
            var indicator = document.getElementById('reply-indicator');
            if (indicator) indicator.style.display = 'none';
            var input = document.getElementById('comment-input');
            if (input) { input.value = ''; input.focus(); }
            return true;
        }

        // Comment like
        var commentLikeBtn = target.closest('.comment-like-btn');
        if (commentLikeBtn) {
            var commentId = read(commentLikeBtn, SOCIAL.COMMENT);
            if (!commentId) return true;
            var wasActive = commentLikeBtn.classList.contains('active');
            commentLikeBtn.classList.toggle('active');
            var countEl = commentLikeBtn.querySelector('.comment-like-count');
            var cur = parseInt(countEl.textContent) || 0;
            countEl.textContent = wasActive ? (cur > 1 ? cur - 1 : '') : (cur + 1);
            Social.toggleCommentLike(commentId).catch(function() {
                commentLikeBtn.classList.toggle('active');
                countEl.textContent = cur > 0 ? cur : '';
            });
            return true;
        }

        // Tag user button in checkin form
        if (target.closest('#btn-tag-user')) {
            if (!ProfileManager.checkinTaggedUsers) ProfileManager.checkinTaggedUsers = [];
            SocialUI.renderTagSearch(function(user) {
                // Check if already tagged
                var already = ProfileManager.checkinTaggedUsers.some(function(u) { return u.user_id === user.user_id; });
                if (already) return;
                ProfileManager.checkinTaggedUsers.push(user);
                var container = document.getElementById('checkin-tagged-users');
                if (container) {
                    var tag = document.createElement('span');
                    tag.className = 'tagged-user-chip';
                    tag.setAttribute(SOCIAL.UID, user.user_id);
                    tag.innerHTML = '@' + esc(user.username) + ' <button class="tagged-user-remove">&times;</button>';
                    container.appendChild(tag);
                }
            });
            return true;
        }

        // Remove tagged user chip
        var removeTag = target.closest('.tagged-user-remove');
        if (removeTag) {
            var chip = removeTag.closest('.tagged-user-chip');
            if (chip && ProfileManager.checkinTaggedUsers) {
                ProfileManager.checkinTaggedUsers = ProfileManager.checkinTaggedUsers.filter(function(u) { return u.user_id !== read(chip, SOCIAL.UID); });
                chip.remove();
            }
            return true;
        }

        // Checkin card click → detail (with double-tap detection)
        var checkinCard = target.closest('.checkin-card');
        if (checkinCard && !checkinCard.classList.contains('checkin-full') && !target.closest('.like-btn') && !target.closest('.comment-btn-icon')) {
            var checkinId = read(checkinCard, SOCIAL.CHECKIN);
            if (!checkinId) return true;

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
                return true;
            }

            // Single tap → navigate after delay
            checkinCard._tapTimer = setTimeout(function() {
                location.hash = '#/checkin/' + checkinId;
            }, 300);
            return true;
        }

        // Checkin back
        if (target.closest('#btn-checkin-back')) {
            location.hash = '#/profile';
            return true;
        }

        // Checkin detail back
        if (target.closest('#btn-checkin-detail-back')) {
            history.back();
            return true;
        }

        // Delete checkin
        if (target.closest('#btn-delete-checkin')) {
            var delBtn = target.closest('#btn-delete-checkin');
            var cid = read(delBtn, SOCIAL.CHECKIN);
            if (cid && confirm('Удалить этот чекин?')) {
                Social.deleteCheckin(cid).then(function() {
                    location.hash = '#/profile';
                }).catch(function(err) {
                    alert('Ошибка: ' + err.message);
                });
            }
            return true;
        }

        // Checkin submit
        if (target.closest('#btn-checkin-submit')) {
            ProfileManager.submitCheckin();
            return true;
        }

        // Checkin photo input trigger
        if (target.closest('.checkin-add-photo')) {
            // Let label handle file input click
            return false;
        }

        // Legacy reaction button (removed, now using like-btn)

        // Send comment
        if (target.closest('#btn-send-comment')) {
            var btn = target.closest('#btn-send-comment');
            var checkinId = read(btn, SOCIAL.CHECKIN);
            var input = document.getElementById('comment-input');
            var text = input ? input.value.trim() : '';
            if (!text || !checkinId) return true;
            btn.disabled = true;
            var parentId = App._replyToCommentId || null;
            App._replyToCommentId = null;
            Social.addComment(checkinId, text, parentId).then(function() {
                SocialUI.renderCheckinDetail(checkinId);
            }).catch(function() { btn.disabled = false; });
            return true;
        }

        // Delete comment
        var deleteCommentBtn = target.closest('.comment-delete');
        if (deleteCommentBtn) {
            var commentId = read(deleteCommentBtn, SOCIAL.COMMENT);
            if (commentId && confirm('Удалить комментарий?')) {
                Social.deleteComment(commentId).then(function() {
                    // Find parent checkin and refresh
                    var sendBtn = document.getElementById('btn-send-comment');
                    if (sendBtn) SocialUI.renderCheckinDetail(read(sendBtn, SOCIAL.CHECKIN));
                });
            }
            return true;
        }

        // Load more (feed)
        if (target.closest('#btn-load-more-feed')) {
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
            return true;
        }

        // Load more (profile)
        if (target.closest('#btn-load-more-profile')) {
            var btn = target.closest('#btn-load-more-profile');
            var userId = read(btn, SOCIAL.USER);
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
            return true;
        }

        // Checkin author click → profile
        var checkinAuthor = target.closest('.checkin-author[' + SOCIAL.USERNAME + ']');
        if (checkinAuthor) {
            var username = read(checkinAuthor, SOCIAL.USERNAME);
            if (username) location.hash = '#/u/' + username;
            return true;
        }

        return false;
    },

    handleInput(e) {
        const target = e.target;

        // Weight input
        if (target.matches('.weight-input')) {
            const exId = read(target, WORKOUT.EXERCISE);
            const setIdx = readInt(target, WORKOUT.SET);
            this._saveDebounced(this._currentWeek, this._currentDay, exId, setIdx, 'weight', target.value);
            return;
        }

        // Reps input
        if (target.matches('.reps-input')) {
            const exId = read(target, WORKOUT.EXERCISE);
            const setIdx = readInt(target, WORKOUT.SET);
            this._saveDebounced(this._currentWeek, this._currentDay, exId, setIdx, 'reps', target.value);
            return;
        }

        // Extra segment reps (seg > 0)
        if (target.matches('.seg-reps-input') && readInt(target, WORKOUT.SEG) > 0) {
            const exId = read(target, WORKOUT.EXERCISE);
            const setIdx = readInt(target, WORKOUT.SET);
            const segIdx = readInt(target, WORKOUT.SEG);
            Storage.saveSegReps(this._currentWeek, this._currentDay, exId, setIdx, segIdx, target.value);
            return;
        }

        // Extra segment weight (seg > 0)
        if (target.matches('.seg-weight-input') && readInt(target, WORKOUT.SEG) > 0) {
            const exId = read(target, WORKOUT.EXERCISE);
            const setIdx = readInt(target, WORKOUT.SET);
            const segIdx = readInt(target, WORKOUT.SEG);
            Storage.saveSegWeight(this._currentWeek, this._currentDay, exId, setIdx, segIdx, target.value);
            return;
        }

        // Equipment search
        if (target.id === 'eq-search') {
            var query = target.value.trim();
            EquipmentManager.searchEquipment(query);
            return;
        }

        // Gym modal — filter shared gyms as user types in search
        if (target.id === 'gym-search-input') {
            var query = target.value.trim().toLowerCase();
            EquipmentManager.renderSharedGyms(query);
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

    _addSet(exerciseId) {
        var p = Storage.getProgram();
        var ex = findExerciseInProgram(p, exerciseId);
        if (!ex) return;
        var lastSet = ex.sets[ex.sets.length - 1] || { type: 'H', rpe: '8', techniques: [] };
        ex.sets.push({ type: lastSet.type, rpe: lastSet.rpe, techniques: lastSet.techniques ? lastSet.techniques.slice() : [] });
        Storage.saveProgram(p, false);
        this.invalidatePageCache('#/week/' + this._currentWeek);
        UI.renderDay(this._currentWeek, this._currentDay);
    },

    _removeSet(exerciseId) {
        var p = Storage.getProgram();
        var ex = findExerciseInProgram(p, exerciseId);
        if (!ex || ex.sets.length <= 1) return;
        ex.sets.pop();
        Storage.saveProgram(p, false);
        this.invalidatePageCache('#/week/' + this._currentWeek);
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
            var elapsed = WorkoutTimer.stop(self._currentWeek, self._currentDay);
            Celebration.show(elapsed, self._currentWeek, self._currentDay);
        });
    },


};

// Celebration moved to js/celebration.js
