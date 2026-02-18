/* ===== Application Entry Point ===== */

const App = {
    _currentWeek: 1,
    _currentDay: 1,
    _saveDebounced: null,

    init() {
        this._saveDebounced = debounce((week, day, exId, setIdx, field, value) => {
            Storage.updateSetValue(week, day, exId, setIdx, field, parseFloat(value) || 0);
        }, 300);

        // Route handling
        window.addEventListener('hashchange', () => this.route());

        // Global event delegation
        document.getElementById('app').addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('app').addEventListener('input', (e) => this.handleInput(e));
        document.getElementById('app').addEventListener('focus', (e) => this.handleFocus(e), true);

        // Initial route
        this.route();
    },

    startSetup() {
        const cycleBtn = document.querySelector('.cycle-toggle button.active');
        const cycleType = cycleBtn ? parseInt(cycleBtn.dataset.cycle) : 7;
        const startDate = document.getElementById('start-date').value;
        if (!startDate) {
            alert('Выберите дату начала');
            return;
        }
        Storage.saveSettings({ cycleType, startDate });
        location.hash = '#/week/1';
    },

    route() {
        const hash = location.hash || '';

        // Setup check
        if (!Storage.isSetup() && hash !== '#/setup') {
            location.hash = '#/setup';
            return;
        }

        if (hash === '#/setup' || hash === '') {
            if (!Storage.isSetup()) {
                UI.renderSetup();
                return;
            }
            // Redirect to current progress week
            const progress = getProgressWeek();
            location.hash = `#/week/${progress.week}`;
            return;
        }

        if (hash === '#/settings') {
            UI.renderSettings();
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
            UI.renderWeek(this._currentWeek);
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
            if (this._currentWeek > 1) {
                location.hash = `#/week/${this._currentWeek - 1}`;
            }
            return;
        }
        if (target.id === 'next-week' || target.closest('#next-week')) {
            if (this._currentWeek < 12) {
                location.hash = `#/week/${this._currentWeek + 1}`;
            }
            return;
        }

        // Back button
        if (target.id === 'btn-back' || target.closest('#btn-back')) {
            location.hash = `#/week/${this._currentWeek}`;
            return;
        }

        // Back from history
        if (target.id === 'btn-back-history' || target.closest('#btn-back-history')) {
            location.hash = `#/week/${this._currentWeek}/day/${this._currentDay}`;
            return;
        }

        // Settings
        if (target.id === 'btn-settings' || target.closest('#btn-settings')) {
            location.hash = '#/settings';
            return;
        }

        // Back from settings
        if (target.id === 'btn-back-settings' || target.closest('#btn-back-settings')) {
            location.hash = `#/week/${this._currentWeek}`;
            return;
        }

        // Save settings
        if (target.id === 'settings-save') {
            const cycleBtn = document.querySelector('.cycle-toggle button.active');
            const cycleType = cycleBtn ? parseInt(cycleBtn.dataset.cycle) : 7;
            const startDate = document.getElementById('settings-start-date').value;
            Storage.saveSettings({ cycleType, startDate });
            location.hash = `#/week/${this._currentWeek}`;
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

        // Complete button
        if (target.matches('.complete-btn') || target.closest('.complete-btn')) {
            const btn = target.matches('.complete-btn') ? target : target.closest('.complete-btn');
            const exId = btn.dataset.exercise;
            const setIdx = parseInt(btn.dataset.set);

            // Get current input values
            const row = btn.closest('.set-row');
            const weightInput = row.querySelector('.weight-input');
            const repsInput = row.querySelector('.reps-input');
            const weight = parseFloat(weightInput.value) || parseFloat(weightInput.placeholder) || 0;
            const reps = parseInt(repsInput.value) || parseInt(repsInput.placeholder) || 0;

            const existing = Storage.getSetLog(this._currentWeek, this._currentDay, exId, setIdx);
            if (existing && existing.completed) {
                // Uncomplete
                Storage.toggleSetComplete(this._currentWeek, this._currentDay, exId, setIdx);
                btn.classList.remove('completed');
                btn.innerHTML = '';
            } else {
                // Complete with values
                if (weight > 0) {
                    weightInput.value = weight;
                }
                if (reps > 0) {
                    repsInput.value = reps;
                }
                Storage.saveSetLog(this._currentWeek, this._currentDay, exId, setIdx, weight, reps);
                btn.classList.add('completed');
                btn.innerHTML = '&#10003;';
            }
            return;
        }

        // Choose one option
        if (target.matches('.choose-option') || target.closest('.choose-option')) {
            const option = target.matches('.choose-option') ? target : target.closest('.choose-option');
            const choiceKey = option.dataset.choiceKey;
            const exerciseId = option.dataset.exerciseId;
            Storage.saveChoice(choiceKey, exerciseId);
            // Re-render the day view
            UI.renderDay(this._currentWeek, this._currentDay);
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

        // Weight modal: quick adjust
        if (target.matches('[data-adjust]')) {
            const modal = document.getElementById('weight-modal');
            if (!modal) return;
            const valEl = document.getElementById('modal-value');
            const current = parseFloat(valEl.textContent) || 0;
            const adjust = parseFloat(target.dataset.adjust);
            const newVal = Math.max(0, Math.round((current + adjust) * 100) / 100);
            valEl.textContent = newVal;
            modal._isTyping = false;
            return;
        }

        // Weight modal: numpad
        if (target.matches('[data-num]')) {
            const modal = document.getElementById('weight-modal');
            if (!modal) return;
            const valEl = document.getElementById('modal-value');
            const num = target.dataset.num;

            if (num === 'backspace') {
                const str = valEl.textContent;
                valEl.textContent = str.length > 1 ? str.slice(0, -1) : '0';
            } else {
                if (!modal._isTyping) {
                    valEl.textContent = num === '.' ? '0.' : num;
                    modal._isTyping = true;
                } else {
                    if (num === '.' && valEl.textContent.includes('.')) return;
                    valEl.textContent += num;
                }
            }
            return;
        }

        // Weight modal: done
        if (target.id === 'modal-done') {
            const modal = document.getElementById('weight-modal');
            if (!modal) return;
            const value = parseFloat(document.getElementById('modal-value').textContent) || 0;
            const input = modal._targetInput;
            if (input) {
                input.value = value;
                // Trigger save
                const exId = input.dataset.exercise;
                const setIdx = parseInt(input.dataset.set);
                Storage.updateSetValue(this._currentWeek, this._currentDay, exId, setIdx, 'weight', value);
            }
            UI.hideWeightModal();
            return;
        }

        // Click on modal overlay (outside modal content) to close
        if (target.matches('.modal-overlay')) {
            UI.hideWeightModal();
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
    },

    handleFocus(e) {
        const target = e.target;

        // Show weight modal on weight input focus
        if (target.matches('.weight-input')) {
            e.preventDefault();
            target.blur();
            UI.showWeightModal(target);
            return;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
