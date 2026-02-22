/* ===== Rest Timer ===== */

const RestTimer = {
    _interval: null,
    _remaining: 120,
    _defaultDuration: 120,
    _paused: false,
    _audioCtx: null,
    _endTime: null,
    _pausedAt: null,
    _minimized: false,

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
        document.body.appendChild(bar);

        document.getElementById('rtb-close').addEventListener('click', () => this.stop());
        document.getElementById('rtb-minus').addEventListener('click', () => this.adjust(-30));
        document.getElementById('rtb-plus').addEventListener('click', () => this.adjust(30));
        document.getElementById('rtb-pause').addEventListener('click', () => this.togglePause());

        // Drag to minimize / tap to expand
        let _swY = 0;
        let _dragging = false;
        bar.addEventListener('touchstart', (e) => {
            _swY = e.touches[0].clientY;
            _dragging = false;
        }, { passive: true });
        bar.addEventListener('touchmove', (e) => {
            if (this._minimized || !this._interval) return;
            const dy = e.touches[0].clientY - _swY;
            if (Math.abs(dy) > 8) {
                _dragging = true;
                e.preventDefault();
                const up = Math.min(0, dy);
                const progress = Math.min(1, Math.abs(up) / 120);
                bar.style.transition = 'none';
                bar.style.transform = `translateX(-50%) translateY(${up * 0.5}px) scale(${1 - progress * 0.1})`;
                bar.style.opacity = 1 - progress * 0.15;
            }
        }, { passive: false });
        bar.addEventListener('touchend', (e) => {
            if (!_dragging) return;
            const dy = e.changedTouches[0].clientY - _swY;
            if (dy < -40 && !this._minimized) {
                this._animateMinimize();
            } else {
                bar.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.35s ease';
                bar.style.transform = '';
                bar.style.opacity = '';
                setTimeout(() => { bar.style.transition = ''; bar.style.transform = ''; bar.style.opacity = ''; }, 400);
            }
            setTimeout(() => { _dragging = false; }, 50);
        }, { passive: true });
        bar.addEventListener('click', (e) => {
            if (_dragging) { e.stopPropagation(); return; }
            if (this._minimized) { e.stopPropagation(); this._animateExpand(); }
        });

        // Unlock AudioContext on first user interaction (required on iOS)
        const unlock = () => this._unlockAudio();
        document.addEventListener('touchstart', unlock, { passive: true, once: false });
        document.addEventListener('click', unlock, { once: false });

        // Request notification permission early
        this._requestNotificationPermission();

        // Handle returning from background
        document.addEventListener('visibilitychange', () => this._onVisibilityChange());

        this._updateDisplay();
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

    start() {
        if (this._interval) clearInterval(this._interval);
        this._paused = false;
        this._pausedAt = null;
        this._remaining = this._defaultDuration;
        this._endTime = Date.now() + this._remaining * 1000;
        this._updateDisplay();
        this._updatePauseBtn();

        // Ensure notification permission for background alerts
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        this._swTimer('START_TIMER', this._remaining * 1000);

        const timerBar = document.getElementById('rest-timer-bar');
        timerBar.classList.remove('minimized');
        this._minimized = false;
        timerBar.classList.add('active');

        this._interval = setInterval(() => {
            if (!this._paused) {
                this._remaining = Math.ceil((this._endTime - Date.now()) / 1000);
                this._updateDisplay();
                if (this._remaining <= 0) {
                    this._finish();
                }
            }
        }, 1000);
    },

    stop() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
        this._endTime = null;
        this._pausedAt = null;
        this._minimized = false;
        this._swTimer('STOP_TIMER');
        const stopBar = document.getElementById('rest-timer-bar');
        stopBar.classList.remove('active', 'minimized');
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
    },

    adjust(delta) {
        this._remaining = Math.max(5, this._remaining + delta);
        if (this._endTime && !this._paused) {
            this._endTime = Date.now() + this._remaining * 1000;
            this._swTimer('START_TIMER', this._remaining * 1000);
        }
        this._updateDisplay();
    },

    _animateMinimize() {
        const bar = document.getElementById('rest-timer-bar');
        // Capture current visual position (includes drag offset)
        const first = bar.getBoundingClientRect();

        // Apply minimized state instantly
        bar.style.transition = 'none';
        bar.style.transform = '';
        bar.style.opacity = '';
        this._minimized = true;
        bar.classList.add('minimized');
        void bar.offsetHeight;

        // Capture target position
        const last = bar.getBoundingClientRect();

        // FLIP: minimized CSS has transform:none, so raw = visual
        const dx = (first.left + first.width / 2) - (last.left + last.width / 2);
        const dy = (first.top + first.height / 2) - (last.top + last.height / 2);
        const sx = first.width / last.width;
        const sy = first.height / last.height;

        bar.animate([
            { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: '28px', opacity: 0.85 },
            { transform: 'none', borderRadius: '50%', opacity: 1 }
        ], { duration: 420, easing: 'cubic-bezier(0.22, 0.9, 0.36, 1)' });
    },

    _animateExpand() {
        const bar = document.getElementById('rest-timer-bar');
        // Capture minimized position
        const first = bar.getBoundingClientRect();

        // Apply expanded state instantly
        bar.style.transition = 'none';
        this._minimized = false;
        bar.classList.remove('minimized');
        void bar.offsetHeight;

        // Capture expanded position
        const last = bar.getBoundingClientRect();

        // Expanded CSS has transform: translateX(-50%)
        // Raw center X = visual center X + width/2 (undoing the -50%)
        const rawCx = last.left + last.width;
        const rawCy = last.top + last.height / 2;
        const firstCx = first.left + first.width / 2;
        const firstCy = first.top + first.height / 2;

        const tx = firstCx - rawCx;
        const ty = firstCy - rawCy;
        const sx = first.width / last.width;
        const sy = first.height / last.height;

        bar.animate([
            { transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`, borderRadius: '50%', opacity: 0.85 },
            { transform: `translateX(${-last.width / 2}px)`, borderRadius: '28px', opacity: 1 }
        ], { duration: 420, easing: 'cubic-bezier(0.22, 0.9, 0.36, 1)' });
    },

    _unlockAudio() {
        try {
            if (!this._audioCtx) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this._audioCtx.state === 'suspended') {
                this._audioCtx.resume();
            }
        } catch(e) {}
    },

    _swTimer(type, duration) {
        if (!navigator.serviceWorker) return;
        navigator.serviceWorker.ready.then(reg => {
            if (reg.active) reg.active.postMessage({ type, duration });
        });
    },

    _finish() {
        clearInterval(this._interval);
        this._interval = null;
        this._endTime = null;
        const finBar = document.getElementById('rest-timer-bar');
        finBar.classList.remove('active', 'minimized');
        this._minimized = false;

        this._swTimer('STOP_TIMER');
        if (navigator.vibrate) navigator.vibrate([200, 80, 200, 80, 400]);
        this._playBeep();
        this._showNotification();
    },

    _playBeep() {
        try {
            if (!this._audioCtx) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this._audioCtx;

            const doPlay = () => {
                [[880, 0, 0.5], [1100, 0.35, 0.6], [1320, 0.65, 0.8]].forEach(([freq, start, end]) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
                    osc.start(ctx.currentTime + start);
                    osc.stop(ctx.currentTime + end);
                });
            };

            if (ctx.state === 'suspended') {
                ctx.resume().then(doPlay).catch(() => {});
            } else {
                doPlay();
            }
        } catch(e) {}
    },

    _showNotification() {
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
            notif.classList.remove('visible');
            setTimeout(() => notif.remove(), 300);
        };

        setTimeout(dismiss, 3000);
        notif.addEventListener('click', dismiss);
    },

    _updateDisplay() {
        const display = document.getElementById('rtb-display');
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
            this._finish();
        } else {
            this._updateDisplay();
        }
    },

    _updatePauseBtn() {
        const btn = document.getElementById('rtb-pause');
        if (!btn) return;
        btn.innerHTML = this._paused
            ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l10 4.5L2 11V2z" fill="currentColor"/></svg>`
            : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="3.5" height="11" rx="1" fill="currentColor"/><rect x="8" y="1" width="3.5" height="11" rx="1" fill="currentColor"/></svg>`;
    }
};
