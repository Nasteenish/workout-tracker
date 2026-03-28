/* ===== Workout Click/Input/Focus Handlers (extracted from app.js) ===== */
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Social } from './social.js';
import { RestTimer } from './timer.js';
import { WorkoutTimer } from './workout-timer.js';
import { EquipmentManager } from './equipment-manager.js';
import { Celebration } from './celebration.js';
import { WORKOUT, EQ, INLINE, read, readInt } from './data-attrs.js';
import { findExerciseInProgram, parseWeight, parseReps, formatDateISO, esc, markCachedThumbs, showToast } from './utils.js';
import { getCompletedSets, exName } from './program-utils.js';
import { Analytics } from './analytics.js';

export const WorkoutUI = {
    // Callbacks — wired in App.init()
    _onInvalidateCache: null,   // (hash?) => void
    _onRoute: null,             // () => void
    _onInlineMenu: null,        // (exId, groupIdx, dayNum, weekNum) => void
    _onInlineAdd: null,         // (dayNum) => void

    // ===== Workout day click handlers =====
    handleClick(target, week, day) {
        // Block all exercise clicks in reorder mode (only allow reorder-done-btn)
        if (window._reorderMode && !target.closest('.reorder-done-btn') && !target.closest('#btn-add-exercise-inline')) {
            return true;
        }

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
            UI.showGymModal((gymId) => {
                Storage.saveWorkoutGym(week, day, gymId || null);
                if (gymId) {
                    Storage.touchGym(gymId);
                    if (Storage.gymHasEquipmentMap(gymId)) {
                        Storage.applyGymEquipment(gymId);
                    } else {
                        Storage.initGymFromCurrentEquipment(gymId);
                    }
                }
                Storage.snapshotTemplateInLog(week, day);
                WorkoutTimer.start(week, day);
                this._updateTimerSection(week, day);
                this._updateAllEquipmentBadges();
            });
            return true;
        }

        if (target.id === 'btn-pause-workout') {
            WorkoutTimer.pause(week, day);
            this._updateTimerSection(week, day);
            return true;
        }

        if (target.id === 'btn-resume-workout') {
            WorkoutTimer.unpause(week, day);
            this._updateTimerSection(week, day);
            return true;
        }

        if (target.id === 'btn-cancel-workout') {
            WorkoutTimer.cancel(week, day);
            this._updateTimerSection(week, day);
            return true;
        }

        // Add set button
        {const btn = target.closest('.add-set-btn');
        if (btn) {
            const exId = read(btn, WORKOUT.EXERCISE);
            this._addSet(exId, week, day);
            return true;
        }}

        // Remove set button
        {const btn = target.closest('.remove-set-btn');
        if (btn) {
            const exId = read(btn, WORKOUT.EXERCISE);
            this._removeSet(exId, week, day);
            return true;
        }}

        // Equipment button
        {const btn = target.closest('.equipment-btn');
        if (btn) {
            const exId = read(btn, WORKOUT.EXERCISE);
            UI.showEquipmentModal(exId, read(btn, WORKOUT.EX_NAME) || '', read(btn, WORKOUT.EX_NAME_RU) || '');
            return true;
        }}

        // Complete button
        {const btn = target.closest('.complete-btn');
        if (btn) {
            const exId = read(btn, WORKOUT.EXERCISE);
            const logExId = Storage.getLogExerciseId(exId);
            const setIdx = readInt(btn, WORKOUT.SET);
            const eqId = Storage.getExerciseEquipment(exId);

            const row = btn.closest('.set-row');
            const weightInput = row.querySelector('.weight-input');
            const repsInput = row.querySelector('.reps-input');
            const weight = parseWeight(weightInput.value) || parseWeight(weightInput.placeholder);
            const reps = parseReps(repsInput.value) || parseReps(repsInput.placeholder);

            const existing = Storage.getSetLog(week, day, logExId, setIdx);
            if (existing && existing.completed) {
                Storage.toggleSetComplete(week, day, logExId, setIdx, eqId);
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
                Storage.saveSetLog(week, day, logExId, setIdx, weight, reps, eqId);
                var activeGym = EquipmentManager.getActiveGymId(week, day);
                if (activeGym && eqId) {
                    Storage.setGymExerciseEquipment(activeGym, exId, eqId);
                    EquipmentManager.shareToGymEquipment(exId, Storage.getEquipmentById(eqId), week, day);
                }

                row.querySelectorAll('.seg-weight-input[' + WORKOUT.SEG + ']').forEach(inp => {
                    var si = readInt(inp, WORKOUT.SEG);
                    if (si > 0 && inp.value) Storage.saveSegWeight(week, day, logExId, setIdx, si, inp.value);
                });
                row.querySelectorAll('.seg-reps-input[' + WORKOUT.SEG + ']').forEach(inp => {
                    var si = readInt(inp, WORKOUT.SEG);
                    if (si > 0 && inp.value) Storage.saveSegReps(week, day, logExId, setIdx, si, inp.value);
                });

                btn.classList.add('completed');
                const gid = `cg-${exId}-${setIdx}`;
                btn.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#${gid})"/><g transform="translate(11,11)"><path d="M4 9l3.5 3.5L14 5.5" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
                btn.classList.add('pop');
                btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
                row.classList.add('done');

                // PR detection — check after saving
                if (weight > 0 && reps > 0) {
                    const prResult = Analytics.checkPR(logExId, weight, reps, week, day, eqId || null);
                    if (prResult) {
                        // Add PR badge to the row
                        if (!row.querySelector('.pr-badge')) {
                            const badge = document.createElement('div');
                            badge.className = 'pr-badge pr-badge-new';
                            badge.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                            row.appendChild(badge);
                        }
                        // Show big centered PR notification
                        this._showPRNotification(prResult.toast);
                    }
                }

                var progress = getCompletedSets(week, day);
                if (progress.total > 0 && progress.completed >= progress.total) {
                    this._showFinishButton(week, day);
                } else if (progress.total > 0) {
                    RestTimer.start(row);
                }
            }
            // Invalidate week cache (progress changed)
            if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week);
            return true;
        }}

        // Unilateral button-badge — toggle state + re-render set rows
        {const toggle = target.closest('.uni-btn');
        if (toggle) {
            const exId = read(toggle, WORKOUT.EXERCISE);
            if (exId) {
                const current = Storage.getUnilateral(exId);
                const newState = !current;
                Storage.setUnilateral(exId, newState);
                // Update button text and style
                const isLeg = toggle.getAttribute('data-uni-leg') === '1';
                const label = isLeg ? 'По одной ноге' : 'По одной руке';
                toggle.textContent = newState ? label + ' ✓' : label;
                toggle.classList.toggle('on', newState);
                // Toast feedback
                const part = isLeg ? 'ногу' : 'руку';
                showToast(newState ? 'Вес на каждую ' + part + ' отдельно' : 'Вес считается суммарно');
                // Re-render set rows for this exercise to update "пред:" and values
                const card = toggle.closest('.exercise-card');
                if (card) {
                    const ex = findExerciseInProgram(Storage.getProgram(), exId);
                    if (ex) {
                        const setRows = card.querySelectorAll('.set-row');
                        for (let i = 0; i < ex.sets.length && i < setRows.length; i++) {
                            const vm = UI._buildSetRowVM(ex, i, week, day);
                            const newHtml = UI._renderSetRow(vm);
                            const temp = document.createElement('div');
                            temp.innerHTML = newHtml;
                            if (temp.firstElementChild) {
                                setRows[i].replaceWith(temp.firstElementChild);
                            }
                        }
                    }
                }
                if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week + '/day/' + day);
            }
            return true;
        }}

        // Variation arrow: tap exercise name to open variation picker
        {const el = target.closest('.exercise-name-chooser');
        if (el) {
            const exId = read(el, WORKOUT.EXERCISE);
            const exNameVal = read(el, WORKOUT.EX_NAME);
            const exNameRu = read(el, WORKOUT.EX_NAME_RU);
            const choiceKey = read(el, WORKOUT.CHOICE_KEY);
            UI.showVariationModal(exId, exNameVal, exNameRu, choiceKey);
            return true;
        }}

        // Variation modal: close on overlay
        if (target.id === 'variation-modal') {
            UI.hideVariationModal();
            return true;
        }

        // History uni filter buttons
        {const filterBtn = target.closest('.history-filter-btn');
        if (filterBtn) {
            const filterVal = filterBtn.getAttribute('data-uni-filter');
            const container = filterBtn.closest('.history-uni-filter');
            const exId = container ? container.getAttribute('data-history-ex') : null;
            if (filterVal && exId) {
                UI._historyUniFilter = filterVal;
                UI.renderHistory(exId);
            }
            return true;
        }}

        // History button
        {const btn = target.closest('.history-btn');
        if (btn) {
            const exId = read(btn, WORKOUT.EXERCISE);
            UI._historyUniFilter = 'all'; // reset filter when opening history
            location.hash = `#/history/${encodeURIComponent(exId)}`;
            return true;
        }}

        // Inline editor: menu button (⋮)
        {const btn = target.closest('.inline-menu-btn');
        if (btn && this._onInlineMenu) {
            const exId = read(btn, INLINE.EX_ID);
            const groupIdx = readInt(btn, INLINE.GROUP_IDX);
            const displayName = btn.getAttribute('data-ex-display') || '';
            this._onInlineMenu(exId, groupIdx, day, week, displayName);
            return true;
        }}

        // Inline editor: add exercise button
        if (target.id === 'btn-add-exercise-inline' || target.closest('#btn-add-exercise-inline')) {
            if (this._onInlineAdd) this._onInlineAdd(day);
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
                        if (this._onRoute) this._onRoute();
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

    // ===== PR Notification — big centered overlay =====
    _showPRNotification(message) {
        if (document.querySelector('.pr-overlay')) return;
        var overlay = document.createElement('div');
        overlay.className = 'pr-overlay';
        overlay.innerHTML = '<div class="pr-overlay-content">' +
            '<div class="pr-overlay-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>' +
            '<div class="pr-overlay-title">Новый рекорд!</div>' +
            '<div class="pr-overlay-message">' + message + '</div>' +
            '</div>';
        document.body.appendChild(overlay);
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        setTimeout(function() {
            overlay.classList.add('pr-overlay-hide');
            setTimeout(function() { overlay.remove(); }, 400);
        }, 2500);
        overlay.addEventListener('click', function() {
            overlay.classList.add('pr-overlay-hide');
            setTimeout(function() { overlay.remove(); }, 400);
        });
    },

    // ===== Modal click handlers (substitution, gym, choice, equipment) =====
    handleModalClick(target, week, day) {
        // Substitution modal — select exercise from list (must be before eq-option handler)
        {const opt = target.closest('.sub-option');
        if (opt) {
            const exId = read(opt, WORKOUT.TARGET_EXERCISE);
            const subName = read(opt, WORKOUT.SUB_NAME);
            Storage.setSubstitution(exId, subName);
            UI.hideSubstitutionModal();
            if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week + '/day/' + day);
            this._updateExerciseName(exId);
            return true;
        }}

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
                this._updateExerciseName(exId);
            }
            return true;
        }

        // Substitution modal — revert to original
        {const btn = target.closest('.sub-revert-btn');
        if (btn) {
            const exId = read(btn, WORKOUT.EXERCISE);
            Storage.removeSubstitution(exId);
            UI.hideSubstitutionModal();
            this._updateExerciseName(exId);
            return true;
        }}

        // Substitution modal — close button or overlay
        if (target.closest('#sub-close-btn') || target.id === 'substitution-modal') {
            UI.hideSubstitutionModal();
            return true;
        }

        // Gym modal — select gym
        {var opt = target.closest('.eq-option[' + EQ.GYM_ID + ']');
        if (opt && target.closest('#gym-modal')) {
            var gymId = read(opt, EQ.GYM_ID) || null;
            var modal = document.getElementById('gym-modal');
            var onSelect = modal ? modal._onSelect : null;
            UI.hideGymModal();
            if (onSelect) onSelect(gymId);
            return true;
        }}

        // Gym modal — select shared gym from search results
        {var item = target.closest('.gym-shared-item');
        if (item) {
            var sharedId = read(item, EQ.GYM_SHARED_ID);
            if (sharedId) {
                Storage.addMyGym(sharedId);
                var modal = document.getElementById('gym-modal');
                var onSelect = modal ? modal._onSelect : null;
                UI.hideGymModal();
                if (onSelect) onSelect(sharedId);
            }
            return true;
        }}

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
            Storage.snapshotTemplateInLog(week, day);
            WorkoutTimer.start(week, day);
            this._updateTimerSection(week, day);
            return true;
        }

        // Gym link prompt — No (skip linking)
        if (target.id === 'gym-link-no') {
            var gymId = read(target, EQ.GYM_ID);
            UI.hideGymModal();
            Storage.snapshotTemplateInLog(week, day);
            WorkoutTimer.start(week, day);
            this._updateTimerSection(week, day);
            return true;
        }

        // Variation modal: select option (must be before eq-option handler)
        {const opt = target.closest('.variation-option');
        if (opt) {
            const choiceKey = read(opt, WORKOUT.CHOICE_KEY);
            if (choiceKey) {
                // Choose-one mode: save choice by exercise ID
                const optId = read(opt, WORKOUT.EXERCISE);
                Storage.saveChoice(choiceKey, optId, week);
            } else {
                // DB variation mode: save as substitution (display name override)
                const nameRu = read(opt, WORKOUT.EX_NAME_RU);
                if (nameRu) {
                    const exId = read(opt, WORKOUT.EXERCISE);
                    Storage.setSubstitution(exId, nameRu);
                }
            }
            UI.hideVariationModal();
            if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week + '/day/' + day);
            UI.renderDay(week, day);
            return true;
        }}

        // Equipment modal — ignore clicks on inputs
        if (target.closest('#equipment-modal') && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            return true;
        }

        // Equipment modal — select option
        {const opt = target.closest('.eq-option');
        if (opt) {
            const eqId = read(opt, EQ.ID);
            const exId = read(opt, WORKOUT.EXERCISE);
            this._bindEquipment(exId, eqId || null, eqId ? Storage.getEquipmentById(eqId) : null, week, day);
            return true;
        }}

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
                this._bindEquipment(exId, newId, { name: name }, week, day);
            }
            return true;
        }

        // Equipment modal — click search result (catalog or shared)
        {var item = target.closest('.eq-search-item');
        if (item) {
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
                this._bindEquipment(exId, newId, { name: eqName, catalogId: catalogId }, week, day);
            } else {
                UI.hideEquipmentModal();
            }
            return true;
        }}

        // Equipment modal — click gym equipment item
        {var item = target.closest('.eq-gym-item');
        if (item) {
            var eqName = read(item, EQ.NAME);
            if (!eqName) return true;
            var eqImage = read(item, EQ.IMAGE) || null;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var newId = Storage.addEquipment(eqName, undefined, eqImage);
            if (exId) {
                this._bindEquipment(exId, newId, null, week, day);
            } else {
                UI.hideEquipmentModal();
            }
            return true;
        }}

        // Equipment modal — brand click → show brand equipment
        {var brandItem = target.closest('.eq-brand-item');
        if (brandItem) {
            var brand = read(brandItem, EQ.BRAND);
            var extype = read(brandItem, EQ.EXTYPE) || null;
            if (brand) EquipmentManager.loadBrandEquipment(brand, extype);
            return true;
        }}

        // Equipment modal — back to brands
        if (target.closest('#eq-brand-back')) {
            EquipmentManager.backToBrands();
            return true;
        }

        // Equipment modal — select from catalog
        {var catItem = target.closest('.eq-catalog-item');
        if (catItem) {
            var eqName = read(catItem, EQ.NAME);
            var catalogId = read(catItem, EQ.CATALOG_ID) ? readInt(catItem, EQ.CATALOG_ID) : null;
            if (!eqName) return true;
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            var eqImageUrl = read(catItem, EQ.IMAGE) || null;
            var newId = Storage.addEquipment(eqName, undefined, eqImageUrl);
            if (exId) {
                Storage.linkEquipmentToExercise(exId, newId);
                this._bindEquipment(exId, newId, { name: eqName, catalogId: catalogId }, week, day);
            } else {
                UI.hideEquipmentModal();
            }
            return true;
        }}

        // Equipment modal — remove current equipment
        if (target.closest('#eq-remove-btn')) {
            var modal = document.getElementById('equipment-modal');
            var exId = modal ? modal._exerciseId : null;
            if (exId) {
                Storage.removeExerciseEquipment(exId);
                var row = document.getElementById('eq-current-row');
                if (row) row.remove();
                if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week + '/day/' + day);
            }
            UI.hideEquipmentModal();
            if (exId) this._updateEquipmentBadge(exId);
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

    // ===== Input handlers (weight, reps, segments, equipment search, gym search) =====
    handleInput(target, week, day, saveDebounced) {
        // Weight input
        if (target.matches('.weight-input')) {
            const exId = read(target, WORKOUT.EXERCISE);
            const setIdx = readInt(target, WORKOUT.SET);
            saveDebounced(week, day, exId, setIdx, 'weight', target.value);
            return true;
        }

        // Reps input
        if (target.matches('.reps-input')) {
            const exId = read(target, WORKOUT.EXERCISE);
            const setIdx = readInt(target, WORKOUT.SET);
            saveDebounced(week, day, exId, setIdx, 'reps', target.value);
            return true;
        }

        // Extra segment reps (seg > 0)
        if (target.matches('.seg-reps-input') && readInt(target, WORKOUT.SEG) > 0) {
            const exId = read(target, WORKOUT.EXERCISE);
            const logExId = Storage.getLogExerciseId(exId);
            const setIdx = readInt(target, WORKOUT.SET);
            const segIdx = readInt(target, WORKOUT.SEG);
            Storage.saveSegReps(week, day, logExId, setIdx, segIdx, target.value);
            return true;
        }

        // Extra segment weight (seg > 0)
        if (target.matches('.seg-weight-input') && readInt(target, WORKOUT.SEG) > 0) {
            const exId = read(target, WORKOUT.EXERCISE);
            const logExId = Storage.getLogExerciseId(exId);
            const setIdx = readInt(target, WORKOUT.SET);
            const segIdx = readInt(target, WORKOUT.SEG);
            Storage.saveSegWeight(week, day, logExId, setIdx, segIdx, target.value);
            return true;
        }

        // Equipment search
        if (target.id === 'eq-search') {
            var query = target.value.trim();
            EquipmentManager.searchEquipment(query);
            return true;
        }

        // Gym modal — filter shared gyms as user types in search
        if (target.id === 'gym-search-input') {
            var query = target.value.trim().toLowerCase();
            EquipmentManager.renderSharedGyms(query);
            return true;
        }

        return false;
    },

    // ===== Focus handler (cursor to end) =====
    handleFocus(target) {
        if (target.matches('.weight-input') || target.matches('.reps-input') ||
            target.matches('.seg-reps-input') || target.matches('.seg-weight-input')) {
            requestAnimationFrame(() => {
                const len = target.value.length;
                target.setSelectionRange(len, len);
            });
            return true;
        }
        return false;
    },

    // ===== Helpers =====
    _addSet(exerciseId, week, day) {
        var p = Storage.getProgram();
        var ex = findExerciseInProgram(p, exerciseId);
        if (!ex) return;
        var lastSet = ex.sets[ex.sets.length - 1] || { type: 'H', rpe: '8', techniques: [] };
        ex.sets.push({ type: lastSet.type, rpe: lastSet.rpe, techniques: lastSet.techniques ? lastSet.techniques.slice() : [] });
        Storage.saveProgram(p, false);
        if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week);

        // Targeted DOM insert: render only the new set row
        var newSetIdx = ex.sets.length - 1;
        var card = document.querySelector('.exercise-card .add-set-btn[' + WORKOUT.EXERCISE + '="' + exerciseId + '"]');
        if (card) {
            var exerciseCard = card.closest('.exercise-card');
            var controls = exerciseCard ? exerciseCard.querySelector('.set-controls') : null;
            if (exerciseCard && controls) {
                var vm = UI._buildSetRowVM(ex, newSetIdx, week, day);
                var html = UI._renderSetRow(vm);
                var temp = document.createElement('div');
                temp.innerHTML = html;
                while (temp.firstChild) exerciseCard.insertBefore(temp.firstChild, controls);
                return;
            }
        }
        UI.renderDay(week, day);
    },

    _removeSet(exerciseId, week, day) {
        var p = Storage.getProgram();
        var ex = findExerciseInProgram(p, exerciseId);
        if (!ex || ex.sets.length <= 1) return;
        ex.sets.pop();
        Storage.saveProgram(p, false);
        if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week);

        // Targeted DOM remove: remove the last set row for this exercise
        var card = document.querySelector('.exercise-card .remove-set-btn[' + WORKOUT.EXERCISE + '="' + exerciseId + '"]');
        if (card) {
            var exerciseCard = card.closest('.exercise-card');
            if (exerciseCard) {
                var rows = exerciseCard.querySelectorAll('.set-row[' + WORKOUT.EXERCISE + '="' + exerciseId + '"]');
                if (rows.length > 0) {
                    rows[rows.length - 1].remove();
                    return;
                }
            }
        }
        UI.renderDay(week, day);
    },

    _showFinishButton(week, day) {
        if (document.getElementById('finish-workout-btn')) return;
        var container = document.querySelector('.day-slide');
        if (!container) return;
        var btn = document.createElement('button');
        btn.id = 'finish-workout-btn';
        btn.className = 'btn-finish-workout';
        btn.textContent = 'ЗАВЕРШИТЬ ТРЕНИРОВКУ';
        container.appendChild(btn);
        setTimeout(function() { btn.classList.add('visible'); }, 50);
        btn.addEventListener('click', function() {
            btn.remove();
            Storage.setFinishedAt(week, day);
            var elapsed = WorkoutTimer.stop(week, day);
            Celebration.show(elapsed, week, day);
        });
    },

    _updateTimerSection(week, day) {
        const slide = document.querySelector('.day-slide');
        if (!slide) return false;

        // Remove existing timer elements
        slide.querySelectorAll('.workout-timer-row, .workout-timer-actions, .btn-timer-pause, .btn-start-workout').forEach(el => el.remove());

        const running = WorkoutTimer.isRunning(week, day);
        const paused = WorkoutTimer.isPaused(week, day);

        let timerHtml = '';
        if (paused) {
            const elapsed = WorkoutTimer.getElapsed(week, day);
            const h = Math.floor(elapsed / 3600);
            const m = Math.floor((elapsed % 3600) / 60);
            const s = elapsed % 60;
            const str = (h > 0 ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
            timerHtml = '<div class="workout-timer-row paused"><span class="workout-timer-icon">&#9208;</span><span id="workout-timer">' + str + '</span></div>'
                + '<div class="workout-timer-actions"><button class="btn-timer-resume" id="btn-resume-workout">ПРОДОЛЖИТЬ</button><button class="btn-timer-cancel" id="btn-cancel-workout">ОТМЕНИТЬ</button></div>';
        } else if (running) {
            timerHtml = '<div class="workout-timer-row"><span class="workout-timer-icon">&#9201;</span><span id="workout-timer">00:00</span></div>'
                + '<button class="btn-timer-pause" id="btn-pause-workout">ПАУЗА</button>';
        } else {
            timerHtml = '<button class="btn-start-workout" id="btn-start-workout">НАЧАТЬ ТРЕНИРОВКУ</button>';
        }

        const temp = document.createElement('div');
        temp.innerHTML = timerHtml;
        const firstChild = slide.firstChild;
        while (temp.firstChild) slide.insertBefore(temp.firstChild, firstChild);

        if (running && !paused) WorkoutTimer.resume(week, day);
        return true;
    },

    _updateEquipmentBadge(exId) {
        const btn = document.querySelector('.equipment-btn[' + WORKOUT.EXERCISE + '="' + exId + '"]');
        if (!btn) return false;
        const eqId = Storage.getExerciseEquipment(exId);
        const eq = eqId ? Storage.getEquipmentById(eqId) : null;
        const label = eq ? esc(eq.name) : 'Оборудование';
        const thumb = eq && eq.imageUrl
            ? '<img class="ex-thumb" src="' + esc(eq.imageUrl) + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">'
            : '';
        const badge = '<span class="chooser-badge"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
        btn.innerHTML = thumb + label + badge;
        markCachedThumbs(btn);
        return true;
    },

    _bindEquipment(exId, eqId, shareInfo, week, day) {
        Storage.setExerciseEquipment(exId, eqId);
        var activeGym = EquipmentManager.getActiveGymId(week, day);
        if (activeGym) Storage.setGymExerciseEquipment(activeGym, exId, eqId);
        if (shareInfo) EquipmentManager.shareToGymEquipment(exId, shareInfo, week, day);
        UI.hideEquipmentModal();
        if (this._onInvalidateCache) this._onInvalidateCache('#/week/' + week + '/day/' + day);
        this._updateEquipmentBadge(exId);
    },

    _updateAllEquipmentBadges() {
        document.querySelectorAll('.equipment-btn[' + WORKOUT.EXERCISE + ']').forEach(btn => {
            var exId = read(btn, WORKOUT.EXERCISE);
            if (exId) this._updateEquipmentBadge(exId);
        });
    },

    _updateExerciseName(exId) {
        var nameEl = document.querySelector('.exercise-name[' + WORKOUT.EXERCISE + '="' + exId + '"]');
        if (!nameEl) return;
        var sub = Storage.getSubstitution(exId);
        if (sub) {
            nameEl.textContent = sub;
        } else {
            var p = Storage.getProgram();
            var ex = findExerciseInProgram(p, exId);
            nameEl.textContent = ex ? exName(ex) : exId;
        }
    },
};
