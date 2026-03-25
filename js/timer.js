/* ===== Rest Timer ===== */
import { Storage } from './storage.js';
import { AppState } from './app-state.js';

export const RestTimer = {
    _interval: null,
    _remaining: 120,
    _defaultDuration: 120,
    _paused: false,
    _audioCtx: null,
    _endTime: null,
    _pausedAt: null,
    _bar: null,
    _tickCount: 0,
    _targetExId: null,
    _targetSetIdx: null,
    _targetWeek: null,
    _targetDay: null,
    _beepToken: 0,
    _activeGains: [],

    init() {
        const settings = Storage.getSettings();
        this._defaultDuration = settings.timerDuration || 120;
        this._remaining = this._defaultDuration;

        const bar = document.createElement('div');
        bar.id = 'rest-timer-bar';
        bar.innerHTML = `
            <button class="rtb-btn rtb-close" id="rtb-close">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
            </button>
            <button class="rtb-adj" id="rtb-minus">−30</button>
            <div class="rtb-display" id="rtb-display">2:00</div>
            <button class="rtb-adj" id="rtb-plus">+30</button>
            <button class="rtb-btn rtb-pause" id="rtb-pause">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1.5" y="1" width="3.5" height="11" rx="1" fill="currentColor"/>
                    <rect x="8" y="1" width="3.5" height="11" rx="1" fill="currentColor"/>
                </svg>
            </button>
        `;
        this._bar = bar;
        // Don't append to body — will be inserted inline on start()

        bar.addEventListener('click', (e) => {
            var target = e.target.closest('button');
            if (!target) return;
            if (target.id === 'rtb-close') this.stop();
            else if (target.id === 'rtb-minus') this.adjust(-30);
            else if (target.id === 'rtb-plus') this.adjust(30);
            else if (target.id === 'rtb-pause') this.togglePause();
        });

        // Request notification permission early
        this._requestNotificationPermission();

        // Handle returning from background — multiple listeners for iOS reliability
        document.addEventListener('visibilitychange', () => this._onVisibilityChange());
        window.addEventListener('focus', () => this._onVisibilityChange());
        window.addEventListener('pageshow', () => this._onVisibilityChange());

        // Stop SW timer on page close (prevents stale push notifications)
        // but keep _wt_timer in localStorage so timer survives app restart
        window.addEventListener('beforeunload', () => {
            this._swTimer('STOP_TIMER');
        });

        this._updateDisplay();

        // Try to restore timer from previous session (survives app restart)
        if (localStorage.getItem('_wt_timer')) {
            this._restoreState();
        } else {
            this._swTimer('STOP_TIMER');
        }
        // Close any stale push notifications from previous session
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(function(reg) {
                if (reg.getNotifications) {
                    reg.getNotifications({ tag: 'rest-timer' }).then(function(notifs) {
                        notifs.forEach(function(n) { n.close(); });
                    });
                }
            });
        }
        // Remove any stale in-app notification overlays
        var staleNotif = document.querySelector('.rtn-overlay');
        if (staleNotif) staleNotif.remove();

    },

    // Call this whenever settings change
    setDefaultDuration(seconds) {
        this._defaultDuration = Math.max(5, seconds);
        Storage.saveSettings({ timerDuration: this._defaultDuration });
        if (!this._interval) {
            this._remaining = this._defaultDuration;
            this._updateDisplay();
        }
    },

    start(targetRow) {
        if (this._interval) clearInterval(this._interval);
        this._paused = false;
        this._pausedAt = null;
        this._remaining = this._defaultDuration;
        this._endTime = Date.now() + this._remaining * 1000;

        this._updateDisplay();
        this._updatePauseBtn();

        // Save target row identity for reattach after re-render
        this._targetExId = targetRow ? targetRow.getAttribute('data-exercise') : null;
        this._targetSetIdx = targetRow ? targetRow.getAttribute('data-set') : null;
        this._targetWeek = AppState.currentWeek;
        this._targetDay = AppState.currentDay;

        // Ensure notification permission for background alerts
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Cancel any pending/playing beep from previous _finish()
        this._cancelBeep();

        // Init AudioContext while we have user gesture (critical for iOS)
        this._ensureAudioCtx();
        this._tickCount = 0;

        this._swTimer('START_TIMER', this._remaining * 1000);

        // Insert timer inline after completed set/exercise
        var bar = this._bar;
        bar.classList.remove('floating');
        if (bar.parentNode) bar.remove();
        this._insertAfterRow(targetRow);
        bar.classList.add('active');
        this._saveState();

        // Gentle scroll: only if bar is below the visible area
        setTimeout(() => {
            var rect = bar.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                window.scrollBy({ top: rect.bottom - window.innerHeight + 20, behavior: 'smooth' });
            }
        }, 50);

        this._interval = setInterval(() => {
            if (!this._paused) {
                this._remaining = Math.ceil((this._endTime - Date.now()) / 1000);
                this._updateDisplay();
                if (this._remaining <= 0) {
                    this._finish();
                } else if (++this._tickCount % 100 === 0) {
                    // Every ~25s: keep AudioContext alive so iOS doesn't suspend it
                    this._keepAudioAlive();
                }
            }
        }, 250);
    },

    /** Find the set row in current DOM and insert bar after it (same logic as start()) */
    _insertAfterRow(targetRow) {
        var bar = this._bar;
        if (bar.parentNode) bar.remove();
        if (targetRow) {
            var card = targetRow.closest('.exercise-card') || targetRow.closest('.superset-group');
            var nextSib = targetRow.nextElementSibling;
            var isLastSet = !nextSib || !nextSib.classList.contains('set-row');
            if (isLastSet && card) {
                card.after(bar);
            } else {
                targetRow.after(bar);
            }
        } else {
            document.body.appendChild(bar);
            bar.classList.add('floating');
        }
    },

    /** Find set row by saved exercise/set data attributes */
    _findTargetRow() {
        if (!this._targetExId || this._targetSetIdx == null) return null;
        return document.querySelector(
            '.set-row[data-exercise="' + this._targetExId + '"][data-set="' + this._targetSetIdx + '"]'
        );
    },

    /** Re-insert timer bar into DOM after innerHTML re-render destroys it */
    reattach() {
        var bar = this._bar;
        if (!bar) return;
        // Timer actively running or paused — re-insert at correct position
        if (this._interval) {
            // Only show timer on the same week/day where it was started
            if (this._targetWeek != null && this._targetDay != null &&
                (AppState.currentWeek !== this._targetWeek || AppState.currentDay !== this._targetDay)) {
                if (bar.isConnected) bar.remove();
                return;
            }
            if (!bar.isConnected) {
                bar.classList.remove('floating');
                var row = this._findTargetRow();
                this._insertAfterRow(row);
                bar.classList.add('active');
            }
            return;
        }
        // No interval but saved state exists (e.g. app restart) — full restore
        if (localStorage.getItem('_wt_timer')) {
            this._restoreState();
        }
    },

    stop() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
        this._cancelBeep();
        this._endTime = null;
        this._pausedAt = null;
        this._targetWeek = null;
        this._targetDay = null;
        this._swTimer('STOP_TIMER');
        localStorage.removeItem('_wt_timer');
        var bar = this._bar;
        bar.classList.remove('active');
        if (bar.parentNode) bar.remove();
    },

    togglePause() {
        if (!this._paused) {
            this._paused = true;
            this._pausedAt = Date.now();
            this._swTimer('STOP_TIMER');
        } else {
            this._paused = false;
            const pausedDuration = Date.now() - this._pausedAt;
            this._endTime += pausedDuration;
            this._pausedAt = null;
            this._swTimer('START_TIMER', (this._endTime - Date.now()));
        }
        this._updatePauseBtn();
        this._saveState();
    },

    adjust(delta) {
        this._remaining = Math.max(5, this._remaining + delta);
        if (this._endTime && !this._paused) {
            this._endTime = Date.now() + this._remaining * 1000;
            this._swTimer('START_TIMER', this._remaining * 1000);
        }
        this._updateDisplay();
        this._saveState();
    },

    _swTimer(type, duration) {
        if (!navigator.serviceWorker) return;
        navigator.serviceWorker.ready.then(reg => {
            if (reg.active) reg.active.postMessage({ type, duration });
        });
    },

    _finish() {
        if (this._finishing) return;
        this._finishing = true;
        clearInterval(this._interval);
        this._interval = null;
        this._endTime = null;
        localStorage.removeItem('_wt_timer');

        // Auto-hide the inline timer
        var bar = this._bar;
        bar.classList.remove('active');
        if (bar.parentNode) bar.remove();

        var self = this;
        const alertUser = (src) => {
            if (navigator.vibrate) navigator.vibrate([200, 80, 200, 80, 400]);
            self._playBeep('finish:' + (src || 'visible'));
        };

        if (document.visibilityState === 'visible') {
            // App is visible — beep now, cancel SW timer (not needed)
            this._swTimer('STOP_TIMER');
            alertUser();
            this._showNotification(null);
        } else {
            // App is in background — let SW show the push notification
            // NO sound callback — SW notification is enough, no beep on return
            this._showNotification(null);
        }
        setTimeout(() => { this._finishing = false; }, 500);
    },

    _audioEl: null,
    _audioUnlocked: false,

    _ensureAudioEl() {
        if (this._audioEl) return this._audioEl;
        // Generate a short WAV beep programmatically
        var sr = 22050, dur = 0.8, samples = sr * dur | 0;
        var buf = new ArrayBuffer(44 + samples * 2);
        var v = new DataView(buf);
        var w = function(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
        w(0, 'RIFF'); v.setUint32(4, 36 + samples * 2, true); w(8, 'WAVEfmt ');
        v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
        v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
        v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data');
        v.setUint32(40, samples * 2, true);
        for (var i = 0; i < samples; i++) {
            var t = i / sr;
            var freq = t < 0.3 ? 880 : (t < 0.55 ? 1100 : 1320);
            var env = Math.max(0, 1 - (t % 0.3) / 0.25) * 0.4;
            v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * freq * t) * env * 32767 | 0, true);
        }
        var blob = new Blob([buf], { type: 'audio/wav' });
        this._audioEl = new Audio(URL.createObjectURL(blob));
        this._audioEl.preload = 'auto';
        return this._audioEl;
    },

    _ensureAudioCtx() {
        try {
            if (!this._audioCtx) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            var ctx = this._audioCtx;
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            // Play silent 1-sample buffer to "unlock" context on iOS
            var buf = ctx.createBuffer(1, 1, 22050);
            var src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
        } catch(e) {}
        // Unlock HTML Audio fallback element ONCE (requires user gesture)
        if (!this._audioUnlocked) {
            try {
                var audio = this._ensureAudioEl();
                audio.volume = 0;
                var self = this;
                var p = audio.play();
                if (p) p.then(function() { audio.pause(); audio.volume = 1; audio.currentTime = 0; self._audioUnlocked = true; }).catch(function() { audio.volume = 1; });
                else this._audioUnlocked = true;
            } catch(e) {}
        }
    },

    _keepAudioAlive() {
        try {
            var ctx = this._audioCtx;
            if (!ctx) return;
            if (ctx.state === 'suspended') {
                ctx.resume().catch(function() {});
            }
            if (ctx.state === 'running') {
                // Play a single silent sample to keep the context active
                var buf = ctx.createBuffer(1, 1, ctx.sampleRate);
                var src = ctx.createBufferSource();
                src.buffer = buf;
                src.connect(ctx.destination);
                src.start();
            }
        } catch(e) {}
    },

    _cancelBeep() {
        this._beepToken++;
        // Immediately silence any Web Audio oscillators already playing
        this._activeGains.forEach(function(g) {
            try { g.cancelScheduledValues(0); g.setValueAtTime(0, 0); } catch(e) {}
        });
        this._activeGains = [];
        // Immediately silence HTML Audio fallback if playing
        try {
            var audio = this._audioEl;
            if (audio && !audio.paused) { audio.pause(); audio.currentTime = 0; }
        } catch(e) {}
    },

    _playBeep(reason) {
        var webAudioOk = false;
        var beepToken = this._beepToken;
        var self = this;
        // Try Web Audio API first
        try {
            var ctx = this._audioCtx;

            var doPlay = function() {
                if (self._beepToken !== beepToken) return;
                [[880, 0, 0.5], [1100, 0.35, 0.6], [1320, 0.65, 0.8]].forEach(function(p) {
                    var freq = p[0], start = p[1], end = p[2];
                    var osc = ctx.createOscillator();
                    var gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
                    osc.start(ctx.currentTime + start);
                    osc.stop(ctx.currentTime + end);
                    self._activeGains.push(gain.gain);
                });
                // Clear gain refs after all oscillators finish (auto-cleanup)
                setTimeout(function() {
                    if (self._beepToken === beepToken) self._activeGains = [];
                }, 900);
            };

            if (ctx && ctx.state === 'suspended') {
                // Async resume — play via Web Audio when ready, HTML Audio fallback below
                ctx.resume().then(doPlay).catch(function() {});
            } else if (ctx && ctx.state === 'running') {
                doPlay();
                webAudioOk = true;
            }
        } catch(e) {}
        // Fallback: HTML Audio element if Web Audio was suspended or failed
        if (!webAudioOk) {
            try {
                var audio = this._ensureAudioEl();
                audio.currentTime = 0;
                audio.play().then(function() {
                    // If a new timer started (or stop() was called) while audio was pending,
                    // cancel the sound immediately — it's from a stale _finish()
                    if (self._beepToken !== beepToken) {
                        audio.pause();
                        audio.currentTime = 0;
                    }
                }).catch(function() {});
            } catch(e) {}
        }
    },

    _showNotification(onReturnCallback) {
        const notif = document.createElement('div');
        notif.className = 'rtn-overlay';
        notif.innerHTML = `
            <div class="rtn-card">
                <div class="rtn-ring-wrap">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="46" stroke="rgba(195,255,60,0.12)" stroke-width="7" fill="none"/>
                        <circle cx="55" cy="55" r="46" stroke="rgba(195,255,60,1)" stroke-width="7" fill="none"
                            stroke-dasharray="289" stroke-dashoffset="289" stroke-linecap="round"
                            class="rtn-ring-fill"/>
                    </svg>
                    <div class="rtn-check">
                        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                            <path d="M8 19l8 8L30 10" stroke="rgba(195,255,60,1)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="rtn-title">Пора!</div>
                <div class="rtn-sub">Отдых завершён</div>
            </div>
        `;
        document.body.appendChild(notif);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const fill = notif.querySelector('.rtn-ring-fill');
                if (fill) fill.style.strokeDashoffset = '0';
                notif.classList.add('visible');
            });
        });

        const dismiss = () => {
            if (notif._dismissed) return;
            notif._dismissed = true;
            notif.classList.remove('visible');
            setTimeout(() => notif.remove(), 300);
        };

        notif.addEventListener('click', dismiss);

        // If app is visible — auto-dismiss after 3s; if in background — wait for tap
        if (document.visibilityState === 'visible') {
            setTimeout(dismiss, 3000);
        } else {
            // When user returns, show the notification fresh, dismiss only on tap
            const onReturn = () => {
                if (document.visibilityState !== 'visible') return;
                document.removeEventListener('visibilitychange', onReturn);
                // Play sound/vibration now that the user is back
                if (onReturnCallback) onReturnCallback();
                // Re-trigger the entrance animation + auto-dismiss after 3s
                notif.classList.remove('visible');
                const fill = notif.querySelector('.rtn-ring-fill');
                if (fill) fill.style.strokeDashoffset = '289';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (fill) fill.style.strokeDashoffset = '0';
                        notif.classList.add('visible');
                    });
                });
                setTimeout(dismiss, 3000);
            };
            document.addEventListener('visibilitychange', onReturn);
        }
    },

    _updateDisplay() {
        var display = this._bar ? this._bar.querySelector('.rtb-display') : null;
        if (!display) return;
        const sec = Math.max(0, this._remaining);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        display.classList.toggle('rtb-warning', this._remaining <= 10 && this._remaining > 0);
    },

    _requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    _onVisibilityChange() {
        if (document.visibilityState !== 'visible') return;
        if (!this._interval || this._paused) return;

        // Recalculate remaining based on real time
        this._remaining = Math.ceil((this._endTime - Date.now()) / 1000);
        if (this._remaining <= 0) {
            // If timer expired more than 30s ago, silently clean up (user was away too long)
            if (this._remaining < -30) {
                this._silentCleanup();
            } else {
                this._finish();
            }
        } else {
            this._updateDisplay();
        }
    },

    _silentCleanup() {
        clearInterval(this._interval);
        this._interval = null;
        this._cancelBeep();
        this._endTime = null;
        this._remaining = 0;
        this._saveState();
        this._swTimer('STOP_TIMER');
        var bar = this._bar;
        bar.classList.remove('active');
        if (bar.parentNode) bar.remove();
    },

    _saveState() {
        if (!this._endTime) {
            localStorage.removeItem('_wt_timer');
            return;
        }
        localStorage.setItem('_wt_timer', JSON.stringify({
            endTime: this._endTime,
            paused: this._paused,
            pausedAt: this._pausedAt,
            defaultDuration: this._defaultDuration,
            exId: this._targetExId,
            setIdx: this._targetSetIdx,
            week: this._targetWeek,
            day: this._targetDay
        }));
    },

    _restoreState() {
        try {
            const saved = localStorage.getItem('_wt_timer');
            if (!saved) return;
            const s = JSON.parse(saved);

            if (s.paused) {
                this._remaining = Math.ceil((s.endTime - s.pausedAt) / 1000);
            } else {
                this._remaining = Math.ceil((s.endTime - Date.now()) / 1000);
            }

            if (this._remaining <= 0) {
                localStorage.removeItem('_wt_timer');
                // Timer expired while app was closed — just clean up, don't beep
                this._defaultDuration = s.defaultDuration || this._defaultDuration;
                this._remaining = 0;
                // Stop any lingering SW timer
                this._swTimer('STOP_TIMER');
                return;
            }

            this._endTime = s.endTime;
            this._paused = s.paused;
            this._pausedAt = s.pausedAt;
            this._defaultDuration = s.defaultDuration || this._defaultDuration;
            this._targetExId = s.exId || null;
            this._targetSetIdx = s.setIdx != null ? s.setIdx : null;
            this._targetWeek = s.week != null ? s.week : null;
            this._targetDay = s.day != null ? s.day : null;

            if (this._paused) {
                const drift = Date.now() - s.pausedAt;
                this._endTime += drift;
                this._pausedAt = Date.now();
            }

            // Only show timer on the same week/day where it was started
            var onCorrectPage = this._targetWeek == null || this._targetDay == null ||
                (AppState.currentWeek === this._targetWeek && AppState.currentDay === this._targetDay);

            if (onCorrectPage) {
                var bar = this._bar;
                bar.classList.remove('floating');
                var row = this._findTargetRow();
                this._insertAfterRow(row);
                bar.classList.add('active');
            }
            this._updateDisplay();
            this._updatePauseBtn();

            // Re-start SW timer for background notifications
            if (!this._paused) {
                this._swTimer('START_TIMER', this._remaining * 1000);
            }

            this._tickCount = 0;
            this._interval = setInterval(() => {
                if (!this._paused) {
                    this._remaining = Math.ceil((this._endTime - Date.now()) / 1000);
                    this._updateDisplay();
                    if (this._remaining <= 0) {
                        this._finish();
                    } else if (++this._tickCount % 100 === 0) {
                        this._keepAudioAlive();
                    }
                }
            }, 250);
        } catch (e) {
            localStorage.removeItem('_wt_timer');
        }
    },

    _updatePauseBtn() {
        var btn = this._bar ? this._bar.querySelector('#rtb-pause') : null;
        if (!btn) return;
        btn.innerHTML = this._paused
            ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l10 4.5L2 11V2z" fill="currentColor"/></svg>`
            : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="3.5" height="11" rx="1" fill="currentColor"/><rect x="8" y="1" width="3.5" height="11" rx="1" fill="currentColor"/></svg>`;
    }
};
