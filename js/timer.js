/* ===== Rest Timer ===== */

const RestTimer = {
    _interval: null,
    _remaining: 120,
    _defaultDuration: 120,
    _paused: false,
    _audioCtx: null,

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

        // Unlock AudioContext on first user interaction (required on iOS)
        const unlock = () => this._unlockAudio();
        document.addEventListener('touchstart', unlock, { passive: true, once: false });
        document.addEventListener('click', unlock, { once: false });

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
        this._remaining = this._defaultDuration;
        this._updateDisplay();
        this._updatePauseBtn();

        document.getElementById('rest-timer-bar').classList.add('active');

        this._interval = setInterval(() => {
            if (!this._paused) {
                this._remaining--;
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
        document.getElementById('rest-timer-bar').classList.remove('active');
    },

    togglePause() {
        this._paused = !this._paused;
        this._updatePauseBtn();
    },

    adjust(delta) {
        this._remaining = Math.max(5, this._remaining + delta);
        this._updateDisplay();
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

    _finish() {
        clearInterval(this._interval);
        this._interval = null;
        document.getElementById('rest-timer-bar').classList.remove('active');

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

    _updatePauseBtn() {
        const btn = document.getElementById('rtb-pause');
        if (!btn) return;
        btn.innerHTML = this._paused
            ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l10 4.5L2 11V2z" fill="currentColor"/></svg>`
            : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="1" width="3.5" height="11" rx="1" fill="currentColor"/><rect x="8" y="1" width="3.5" height="11" rx="1" fill="currentColor"/></svg>`;
    }
};
