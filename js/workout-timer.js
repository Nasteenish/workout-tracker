/* ===== Workout Session Timer ===== */
const WorkoutTimer = {
    _interval: null,

    _getTimerKey(week, day) {
        return 'wt_timer_' + week + '_' + day;
    },

    _getPauseKey(week, day) {
        return this._getTimerKey(week, day) + '_paused';
    },

    start(week, day) {
        var key = this._getTimerKey(week, day);
        if (sessionStorage.getItem(key)) return; // already running
        sessionStorage.setItem(key, String(Date.now()));
        sessionStorage.removeItem(this._getPauseKey(week, day));
        this._startDisplay(week, day);
    },

    pause(week, day) {
        var pauseKey = this._getPauseKey(week, day);
        if (sessionStorage.getItem(pauseKey)) return; // already paused
        sessionStorage.setItem(pauseKey, String(Date.now()));
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    },

    unpause(week, day) {
        var key = this._getTimerKey(week, day);
        var pauseKey = this._getPauseKey(week, day);
        var pausedAt = parseInt(sessionStorage.getItem(pauseKey));
        if (!pausedAt) return;
        var startTime = parseInt(sessionStorage.getItem(key));
        if (startTime) {
            var pauseDuration = Date.now() - pausedAt;
            sessionStorage.setItem(key, String(startTime + pauseDuration));
        }
        sessionStorage.removeItem(pauseKey);
        this._startDisplay(week, day);
    },

    cancel(week, day) {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        sessionStorage.removeItem(this._getTimerKey(week, day));
        sessionStorage.removeItem(this._getPauseKey(week, day));
        Storage.saveWorkoutGym(week, day, null);
    },

    stop(week, day) {
        var key = this._getTimerKey(week, day);
        var pauseKey = this._getPauseKey(week, day);
        var startTime = parseInt(sessionStorage.getItem(key));
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        var pausedAt = parseInt(sessionStorage.getItem(pauseKey));
        sessionStorage.removeItem(key);
        sessionStorage.removeItem(pauseKey);
        if (!startTime) return null;
        var end = pausedAt || Date.now();
        return Math.floor((end - startTime) / 1000);
    },

    isRunning(week, day) {
        return !!sessionStorage.getItem(this._getTimerKey(week, day));
    },

    isPaused(week, day) {
        return this.isRunning(week, day) && !!sessionStorage.getItem(this._getPauseKey(week, day));
    },

    getElapsed(week, day) {
        var startTime = parseInt(sessionStorage.getItem(this._getTimerKey(week, day)));
        if (!startTime) return 0;
        var pausedAt = parseInt(sessionStorage.getItem(this._getPauseKey(week, day)));
        var end = pausedAt || Date.now();
        return Math.floor((end - startTime) / 1000);
    },

    resume(week, day) {
        if (this.isRunning(week, day) && !this.isPaused(week, day)) {
            this._startDisplay(week, day);
        }
    },

    _startDisplay(week, day) {
        if (this._interval) clearInterval(this._interval);
        var key = this._getTimerKey(week, day);
        var startTime = parseInt(sessionStorage.getItem(key));
        if (!startTime) return;
        this._updateUI(startTime);
        var self = this;
        this._interval = setInterval(function() {
            self._updateUI(startTime);
        }, 1000);
    },

    _updateUI(startTime) {
        var el = document.getElementById('workout-timer');
        if (!el) return;
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        var h = Math.floor(elapsed / 3600);
        var m = Math.floor((elapsed % 3600) / 60);
        var s = elapsed % 60;
        el.textContent = (h > 0 ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }
};
