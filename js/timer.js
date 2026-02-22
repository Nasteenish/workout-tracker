/* ===== Rest Timer ===== */

const RestTimer = {
    _interval: null,
    _remaining: 120,
    _defaultDuration: 120,
    _paused: false,
    _audioCtx: null,
    _endTime: null,
    _pausedAt: null,
    _keepAliveAudio: null,
    _keepAliveUrl: null,

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

        // Request notification permission early
        this._requestNotificationPermission();

        // Handle returning from background
        document.addEventListener('visibilitychange', () => this._onVisibilityChange());

        // Restore timer if page was killed and reloaded while timer was active
        this._restoreTimer();

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
        this._persistTimer();

        document.getElementById('rest-timer-bar').classList.add('active');

        this._startTicking();
    },

    stop() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
        this._endTime = null;
        this._pausedAt = null;
        this._swTimer('STOP_TIMER');
        this._clearPersistedTimer();
        document.getElementById('rest-timer-bar').classList.remove('active');
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
        this._persistTimer();
        this._updatePauseBtn();
    },

    adjust(delta) {
        this._remaining = Math.max(5, this._remaining + delta);
        if (this._endTime && !this._paused) {
            this._endTime = Date.now() + this._remaining * 1000;
            this._swTimer('START_TIMER', this._remaining * 1000);
        }
        this._persistTimer();
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

    _startKeepAlive() {
        if (this._keepAliveAudio) return;
        try {
            // Generate 1-second silent WAV in memory
            const sampleRate = 8000;
            const numSamples = sampleRate;
            const buffer = new ArrayBuffer(44 + numSamples);
            const view = new DataView(buffer);
            const w = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
            w(0, 'RIFF');
            view.setUint32(4, 36 + numSamples, true);
            w(8, 'WAVE');
            w(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate, true);
            view.setUint16(32, 1, true);
            view.setUint16(34, 8, true);
            w(36, 'data');
            view.setUint32(40, numSamples, true);
            for (let i = 0; i < numSamples; i++) view.setUint8(44 + i, 128);

            const blob = new Blob([buffer], { type: 'audio/wav' });
            this._keepAliveUrl = URL.createObjectURL(blob);
            const audio = new Audio(this._keepAliveUrl);
            audio.loop = true;
            audio.volume = 0.01;
            audio.play().catch(() => {});
            this._keepAliveAudio = audio;
        } catch(e) {}
    },

    _stopKeepAlive() {
        if (this._keepAliveAudio) {
            this._keepAliveAudio.pause();
            this._keepAliveAudio.src = '';
            this._keepAliveAudio = null;
        }
        if (this._keepAliveUrl) {
            URL.revokeObjectURL(this._keepAliveUrl);
            this._keepAliveUrl = null;
        }
    },

    // Generate beep WAV and play via <audio> (works in iOS background, unlike Web Audio API)
    _playBeepViaAudio() {
        try {
            const sampleRate = 44100;
            const duration = 0.9;
            const numSamples = Math.floor(sampleRate * duration);
            const buffer = new ArrayBuffer(44 + numSamples * 2);
            const view = new DataView(buffer);
            const w = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };

            // WAV header (16-bit mono)
            w(0, 'RIFF');
            view.setUint32(4, 36 + numSamples * 2, true);
            w(8, 'WAVE');
            w(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            w(36, 'data');
            view.setUint32(40, numSamples * 2, true);

            // Three ascending tones: 880Hz, 1100Hz, 1320Hz
            const tones = [
                { freq: 880,  start: 0,    end: 0.3 },
                { freq: 1100, start: 0.3,  end: 0.6 },
                { freq: 1320, start: 0.6,  end: 0.9 }
            ];

            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;
                for (const tone of tones) {
                    if (t >= tone.start && t < tone.end) {
                        const env = Math.max(0, 1 - (t - tone.start) / (tone.end - tone.start) * 0.5);
                        sample = Math.sin(2 * Math.PI * tone.freq * t) * env * 0.4;
                    }
                }
                view.setInt16(44 + i * 2, sample * 32767, true);
            }

            const blob = new Blob([buffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            // Reuse keepalive <audio> if available (already has OS audio session)
            if (this._keepAliveAudio) {
                this._keepAliveAudio.loop = false;
                this._keepAliveAudio.volume = 1;
                this._keepAliveAudio.src = url;
                this._keepAliveAudio.play().catch(() => {});
                this._keepAliveAudio.onended = () => {
                    this._stopKeepAlive();
                    URL.revokeObjectURL(url);
                };
                if (this._keepAliveUrl) URL.revokeObjectURL(this._keepAliveUrl);
                this._keepAliveUrl = url;
            } else {
                const audio = new Audio(url);
                audio.volume = 1;
                audio.play().catch(() => {});
                audio.onended = () => { URL.revokeObjectURL(url); };
            }
        } catch(e) {}
    },

    _swTimer(type, duration) {
        if (!navigator.serviceWorker) return;
        navigator.serviceWorker.ready.then(reg => {
            if (reg.active) {
                reg.active.postMessage({ type, duration });
            }
        });
    },

    _startTicking() {
        if (this._interval) clearInterval(this._interval);
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

    _persistTimer() {
        try {
            const data = {
                endTime: this._endTime,
                paused: this._paused,
                pausedAt: this._pausedAt,
                remaining: this._remaining
            };
            localStorage.setItem('_restTimer', JSON.stringify(data));
        } catch(e) {}
    },

    _clearPersistedTimer() {
        try { localStorage.removeItem('_restTimer'); } catch(e) {}
    },

    _restoreTimer() {
        try {
            const raw = localStorage.getItem('_restTimer');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data || !data.endTime) return;

            if (data.paused) {
                // Timer was paused — restore paused state
                this._paused = true;
                this._pausedAt = data.pausedAt;
                this._endTime = data.endTime;
                this._remaining = data.remaining || Math.ceil((this._endTime - this._pausedAt) / 1000);
                this._updateDisplay();
                this._updatePauseBtn();
                document.getElementById('rest-timer-bar').classList.add('active');
                this._startTicking();
                return;
            }

            const remaining = Math.ceil((data.endTime - Date.now()) / 1000);
            if (remaining <= 0) {
                // Timer expired while page was dead — fire immediately
                this._clearPersistedTimer();
                this._showFinishEffects();
            } else {
                // Timer still active — resume it
                this._endTime = data.endTime;
                this._remaining = remaining;
                this._paused = false;
                this._updateDisplay();
                this._updatePauseBtn();
                document.getElementById('rest-timer-bar').classList.add('active');
                this._startTicking();
            }
        } catch(e) {
            this._clearPersistedTimer();
        }
    },

    _finish() {
        clearInterval(this._interval);
        this._interval = null;
        this._endTime = null;
        this._swTimer('STOP_TIMER');
        this._clearPersistedTimer();
        document.getElementById('rest-timer-bar').classList.remove('active');

        // If page is hidden (user on YouTube etc.), defer notification until they return
        if (document.visibilityState !== 'visible') {
            this._pendingFinish = true;
            return;
        }

        this._showFinishEffects();
    },

    _showFinishEffects() {
        this._pendingFinish = false;
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

        setTimeout(dismiss, 10000);
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

    _sendSystemNotification() {
        if (!navigator.serviceWorker) return;
        navigator.serviceWorker.ready.then(reg => {
            if (reg.active) {
                reg.active.postMessage({ type: 'SHOW_NOTIFICATION' });
            }
        });
    },

    _onVisibilityChange() {
        if (document.visibilityState !== 'visible') return;

        // Show deferred finish effects when returning from background
        if (this._pendingFinish) {
            this._showFinishEffects();
            return;
        }

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
