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

        // Pull-to-refresh
        this._initPullToRefresh();

        // Initial route
        this.route();
    },

    _initPullToRefresh() {
        let startY = 0;
        let pulling = false;
        const threshold = 80;
        let indicator = null;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;
            const dy = e.touches[0].clientY - startY;
            if (dy > 10 && window.scrollY === 0) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.id = 'pull-indicator';
                    indicator.textContent = '↓';
                    document.body.prepend(indicator);
                }
                const progress = Math.min(dy / threshold, 1);
                indicator.style.height = Math.min(dy * 0.5, 50) + 'px';
                indicator.style.opacity = progress;
                if (progress >= 1) {
                    indicator.textContent = '↻';
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (indicator) {
                const ready = indicator.textContent === '↻';
                indicator.remove();
                indicator = null;
                if (ready) {
                    location.reload();
                }
            }
            pulling = false;
        });
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
            const cycleBtn = document.querySelector('.cycle-toggle button.active[data-cycle]');
            const cycleType = cycleBtn ? parseInt(cycleBtn.dataset.cycle) : 7;
            const startDate = document.getElementById('settings-start-date').value;
            const unitBtn = document.querySelector('.cycle-toggle button.active[data-unit]');
            const weightUnit = unitBtn ? unitBtn.dataset.unit : 'kg';
            Storage.saveSettings({ cycleType, startDate, weightUnit });
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

        // Equipment button — show equipment picker
        if (target.matches('.equipment-btn') || target.closest('.equipment-btn')) {
            const btn = target.matches('.equipment-btn') ? target : target.closest('.equipment-btn');
            const exId = btn.dataset.exercise;
            UI.showEquipmentModal(exId);
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
                btn.innerHTML = '';
            } else {
                // Complete with values
                if (weight > 0) {
                    weightInput.value = weight;
                }
                if (reps > 0) {
                    repsInput.value = reps;
                }
                Storage.saveSetLog(this._currentWeek, this._currentDay, exId, setIdx, weight, reps, eqId);
                btn.classList.add('completed');
                btn.innerHTML = '&#10003;';
            }
            return;
        }

        // Choose one: open dropdown modal
        if (target.matches('.choose-one-btn') || target.closest('.choose-one-btn')) {
            const btn = target.matches('.choose-one-btn') ? target : target.closest('.choose-one-btn');
            const choiceKey = btn.dataset.choiceKey;
            UI.showChoiceModal(choiceKey);
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

        // Weight modal: unit toggle (kg <-> lbs)
        if (target.id === 'unit-toggle' || target.closest('#unit-toggle')) {
            const modal = document.getElementById('weight-modal');
            if (!modal) return;
            const valEl = document.getElementById('modal-value');
            const current = parseFloat(valEl.textContent) || 0;
            const labelEl = document.getElementById('modal-unit-label');
            const toggleBtn = document.getElementById('unit-toggle');

            if (modal._displayUnit === 'kg') {
                // Convert kg -> lbs
                const lbs = Math.round(current * 2.20462 * 100) / 100;
                valEl.textContent = lbs;
                modal._displayUnit = 'lbs';
                labelEl.textContent = 'lbs';
                toggleBtn.textContent = 'lbs \u2194 \u043a\u0433';
            } else {
                // Convert lbs -> kg
                const kg = Math.round(current / 2.20462 * 100) / 100;
                valEl.textContent = kg;
                modal._displayUnit = 'kg';
                labelEl.textContent = '\u043a\u0433';
                toggleBtn.textContent = '\u043a\u0433 \u2194 lbs';
            }
            modal._isTyping = false;
            return;
        }

        // Weight modal: done
        if (target.id === 'modal-done') {
            const modal = document.getElementById('weight-modal');
            if (!modal) return;
            let value = parseFloat(document.getElementById('modal-value').textContent) || 0;
            // If displaying in lbs, convert back to storage unit
            const storageUnit = Storage.getWeightUnit();
            if (modal._displayUnit !== storageUnit) {
                if (modal._displayUnit === 'lbs' && storageUnit === 'kg') {
                    value = Math.round(value / 2.20462 * 100) / 100;
                } else if (modal._displayUnit === 'kg' && storageUnit === 'lbs') {
                    value = Math.round(value * 2.20462 * 100) / 100;
                }
            }
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
