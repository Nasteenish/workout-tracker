/* ===== Inline Editor — Day View Quick Edit ===== */
import { lockBodyScroll, unlockBodyScroll } from './scroll-lock.js';
import { Storage } from './storage.js';
import { AppState } from './app-state.js';
import { INLINE, attr, read, readInt, write } from './data-attrs.js';
import { esc } from './utils.js';
import { exName } from './program-utils.js';

// Global reorder-mode touchmove blocker — capture phase, fires before pull-refresh
document.addEventListener('touchmove', function(e) {
    if (window._reorderMode) e.preventDefault();
}, { passive: false, capture: true });

export const InlineEditor = {
    // Callbacks wired in App.init()
    _onAutoSave: null,      // (editingDay) => void — delegates to Builder._autoSave
    _onBuildVM: null,        // (dayNum) => {dayNum, items}
    _onInvalidateCache: null,// () => void
    _onRenderDay: null,      // () => void — re-renders current day
    _onShowPicker: null,     // (onConfirm) => void — opens exercise picker

    // ===== ATTACH / DETACH =====

    attachHandlers(container) {
        if (!container) return;
        // Reset any stuck drag/swipe state from previous render
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window._slotDragging = false;
        window._reorderMode = false;
        // Remove any leftover reorder-mode buttons
        var staleBtn = document.querySelector('.reorder-done-btn');
        if (staleBtn) staleBtn.remove();
        this._initSwipeDelete(container);
        this._initDragReorder(container);
    },

    // ===== FEATURE 1: SWIPE-TO-DELETE =====

    _initSwipeDelete(container) {
        var self = this;
        var swipeEl = null, startX = 0, startY = 0, swiping = false, deleteBg = null;
        var THRESHOLD = 80;

        container.addEventListener('touchstart', function(e) {
            var card = e.target.closest('.exercise-card[' + INLINE.GROUP_IDX + '], .superset-group[' + INLINE.GROUP_IDX + ']');
            if (!card) return;
            // Don't start swipe on interactive elements
            if (e.target.closest('input, button, .set-controls, .equipment-btn, .history-btn, .inline-menu-btn')) return;
            swipeEl = card;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            swiping = false;
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            if (!swipeEl) return;
            var dx = e.touches[0].clientX - startX;
            var dy = e.touches[0].clientY - startY;

            if (!swiping) {
                // Decide direction: horizontal swipe left only
                if (Math.abs(dx) > 10 && Math.abs(dy) < Math.abs(dx) && dx < 0) {
                    swiping = true;
                    window._slotDragging = true;
                    swipeEl.classList.add('swiping');
                    // Create delete background
                    if (!deleteBg) {
                        deleteBg = document.createElement('div');
                        deleteBg.className = 'swipe-delete-bg';
                        deleteBg.textContent = 'Удалить';
                    }
                    swipeEl.style.position = 'relative';
                    swipeEl.style.zIndex = '1';
                    swipeEl.parentNode.insertBefore(deleteBg, swipeEl);
                    deleteBg.style.position = 'absolute';
                    deleteBg.style.top = swipeEl.offsetTop + 'px';
                    deleteBg.style.right = '0';
                    deleteBg.style.height = swipeEl.offsetHeight + 'px';
                } else if (Math.abs(dy) > 10) {
                    // Vertical scroll — cancel swipe
                    swipeEl = null;
                    return;
                } else {
                    return;
                }
            }

            e.preventDefault();
            var translateX = Math.min(0, dx);
            swipeEl.style.transform = 'translateX(' + translateX + 'px)';
        }, { passive: false });

        container.addEventListener('touchend', function() {
            if (!swipeEl || !swiping) {
                _cleanupSwipe();
                return;
            }
            var el = swipeEl;
            var bg = deleteBg;
            var currentTransform = el.style.transform;
            var match = currentTransform.match(/translateX\((-?\d+)/);
            var dx = match ? parseInt(match[1]) : 0;

            if (Math.abs(dx) >= THRESHOLD) {
                // Swiped far enough — show confirm
                el.classList.add('swipe-animate');
                el.style.transform = 'translateX(-100px)';
                var groupIdx = readInt(el, INLINE.GROUP_IDX);
                self._confirmDelete(groupIdx, function() {
                    // On confirm — remove
                    _cleanupSwipe();
                }, function() {
                    // On cancel — hide red bg immediately, animate card back
                    if (bg) bg.style.display = 'none';
                    el.classList.add('swipe-animate');
                    el.style.transform = 'translateX(0)';
                    setTimeout(function() {
                        _cleanupSwipe();
                    }, 260);
                });
            } else {
                // Not far enough — snap back, hide red bg immediately
                if (bg) bg.style.display = 'none';
                el.classList.add('swipe-animate');
                el.style.transform = 'translateX(0)';
                setTimeout(function() {
                    _cleanupSwipe();
                }, 260);
            }
        });

        function _cleanupSwipe() {
            if (swipeEl) {
                swipeEl.classList.remove('swiping', 'swipe-animate');
                swipeEl.style.transform = '';
                swipeEl.style.zIndex = '';
                swipeEl.style.position = '';
            }
            if (deleteBg && deleteBg.parentNode) {
                deleteBg.parentNode.removeChild(deleteBg);
            }
            // Safety: remove any stray delete backgrounds
            container.querySelectorAll('.swipe-delete-bg').forEach(function(bg) { bg.remove(); });
            swipeEl = null;
            deleteBg = null;
            swiping = false;
            window._slotDragging = false;
        }
    },

    _confirmDelete(groupIdx, onConfirm, onCancel) {
        var self = this;
        var overlay = document.createElement('div');
        overlay.className = 'inline-confirm';
        overlay.innerHTML = '<div class="inline-confirm-box">' +
            '<p>Удалить упражнение?</p>' +
            '<div class="inline-confirm-actions">' +
            '<button class="inline-confirm-cancel">Отмена</button>' +
            '<button class="inline-confirm-ok">Удалить</button>' +
            '</div></div>';
        document.body.appendChild(overlay);

        overlay.querySelector('.inline-confirm-cancel').onclick = function() {
            overlay.remove();
            if (onCancel) onCancel();
        };
        overlay.querySelector('.inline-confirm-ok').onclick = function() {
            overlay.remove();
            self._deleteGroup(groupIdx);
            if (onConfirm) onConfirm();
        };
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    },

    _deleteGroup(groupIdx) {
        var dayNum = AppState.currentDay;
        if (!dayNum) return;
        var ed = this._onBuildVM(dayNum);
        if (!ed || !ed.items[groupIdx]) return;
        ed.items.splice(groupIdx, 1);
        this._onAutoSave(ed);
        this._clearCurrentWeekSnapshot(dayNum);
        this._onInvalidateCache();
        // Stay in reorder mode if active — re-render and re-enter
        if (window._reorderMode) {
            this._onRenderDay();
            this._enterReorderAfterRender();
        } else {
            this._onRenderDay();
        }
    },

    // ===== FEATURE 2: REORDER MODE (long-press to enter, drag to reorder, "Готово" to exit) =====

    _initDragReorder(container) {
        var self = this;
        var reorderMode = false;
        var dragEl = null, startY = 0, startX = 0, longPressTimer = null;
        var activeDrag = false;
        var cachedRects = [], swapCooldown = false;
        var doneBtn = null;

        function getGroupElements() {
            return container.querySelectorAll(':scope > [' + INLINE.GROUP_IDX + '], :scope > .choose-one-group[' + INLINE.GROUP_IDX + ']');
        }

        function cacheRects() {
            cachedRects = [];
            var els = getGroupElements();
            for (var i = 0; i < els.length; i++) {
                var r = els[i].getBoundingClientRect();
                cachedRects.push({ el: els[i], top: r.top, bottom: r.bottom, midY: r.top + r.height / 2, height: r.height });
            }
        }

        function enterReorderMode() {
            reorderMode = true;
            window._slotDragging = true;
            window._reorderMode = true;
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            // Hide rest timer bar during reorder (it will reattach on next renderDay)
            var timerBar = document.getElementById('rest-timer-bar');
            if (timerBar && timerBar.parentNode) timerBar.remove();
            // Collapse all cards
            var allGroups = getGroupElements();
            for (var gi = 0; gi < allGroups.length; gi++) {
                allGroups[gi].classList.add('drag-compact');
            }
            // Add "Готово" button
            doneBtn = document.createElement('button');
            doneBtn.className = 'reorder-done-btn';
            doneBtn.textContent = 'Готово';
            doneBtn.addEventListener('click', exitReorderMode);
            container.parentElement.insertBefore(doneBtn, container);
            window.scrollTo(0, 0);
            if (navigator.vibrate) navigator.vibrate(30);
        }

        function exitReorderMode() {
            if (!reorderMode) return;
            // Save current order
            var dayNum = AppState.currentDay;
            if (dayNum) {
                var allEls = getGroupElements();
                var newOrder = [];
                for (var i = 0; i < allEls.length; i++) {
                    newOrder.push(readInt(allEls[i], INLINE.GROUP_IDX));
                }
                var changed = false;
                for (var i = 0; i < newOrder.length; i++) {
                    if (newOrder[i] !== i) { changed = true; break; }
                }
                if (changed) {
                    var ed = self._onBuildVM(dayNum);
                    if (ed) {
                        var reordered = [];
                        for (var i = 0; i < newOrder.length; i++) {
                            if (ed.items[newOrder[i]]) reordered.push(ed.items[newOrder[i]]);
                        }
                        if (reordered.length === ed.items.length) {
                            ed.items = reordered;
                            self._onAutoSave(ed);
                        }
                    }
                }
            }
            cleanupReorder();
            self._onInvalidateCache();
            self._onRenderDay();
        }

        function cleanupReorder() {
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            if (dragEl) dragEl.classList.remove('drag-active');
            var compacts = container.querySelectorAll('.drag-compact');
            for (var i = 0; i < compacts.length; i++) compacts[i].classList.remove('drag-compact');
            if (doneBtn && doneBtn.parentNode) doneBtn.remove();
            doneBtn = null;
            window._reorderMode = false;
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            reorderMode = false;
            activeDrag = false;
            window._slotDragging = false;
            dragEl = null;
            cachedRects = [];
        }

        container.addEventListener('touchstart', function(e) {
            var card = e.target.closest('[' + INLINE.GROUP_IDX + ']');
            if (!card) return;
            if (card.parentElement !== container && !card.parentElement.classList.contains('choose-one-group')) {
                var supersetParent = card.closest('.superset-group[' + INLINE.GROUP_IDX + ']');
                if (supersetParent) card = supersetParent;
                else return;
            }
            if (e.target.closest('input, button, .set-inputs, .set-controls, .equipment-btn, .history-btn, .inline-menu-btn')) return;

            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;

            if (reorderMode) {
                // Already in reorder mode — start dragging this card
                dragEl = card;
                activeDrag = true;
                if (dragEl) dragEl.classList.add('drag-active');
                cacheRects();
            } else {
                // Not in reorder mode — long press to enter
                dragEl = card;
                longPressTimer = setTimeout(function() {
                    enterReorderMode();
                    // Also start dragging the pressed card
                    dragEl = card;
                    activeDrag = true;
                    card.classList.add('drag-active');
                    cacheRects();
                }, 400);
            }
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            if (!reorderMode && longPressTimer) {
                var dx = e.touches[0].clientX - startX;
                var dy = e.touches[0].clientY - startY;
                if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                return;
            }
            // Block all scrolling/pull-to-refresh while in reorder mode
            if (reorderMode) e.preventDefault();
            if (!activeDrag) return;
            var touchY = e.touches[0].clientY;

            if (swapCooldown) return;
            for (var i = 0; i < cachedRects.length; i++) {
                var cr = cachedRects[i];
                if (cr.el === dragEl) continue;
                // Wide hit zone — just cross the midpoint
                if (touchY > cr.top && touchY < cr.bottom) {
                    if (touchY < cr.midY) {
                        container.insertBefore(dragEl, cr.el);
                    } else {
                        container.insertBefore(dragEl, cr.el.nextSibling);
                    }
                    // Don't update data-group-idx — keep original indices for save
                    swapCooldown = true;
                    cacheRects();
                    if (navigator.vibrate) navigator.vibrate(15);
                    setTimeout(function() { swapCooldown = false; }, 80);
                    break;
                }
            }
        }, { passive: false });

        container.addEventListener('touchend', function() {
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            if (!activeDrag) return;
            // Release current drag but stay in reorder mode
            if (dragEl) {
                dragEl.classList.remove('drag-active');
            }
            activeDrag = false;
            dragEl = null;
            // Keep touchAction: 'none' — cleared only on exitReorderMode
        });
    },

    // ===== FEATURE 3: BOTTOM SHEET MENU =====

    showExerciseMenu(exId, groupIdx, dayNum, weekNum, displayName) {
        var self = this;
        var ed = this._onBuildVM(dayNum);
        if (!ed) return;
        var item = ed.items[groupIdx];
        if (!item) return;

        // Find the exercise in this group
        var exercise = null;
        var subIdx = -1;
        var applyToAll = false; // for choose_one: apply changes to all options
        if (item.type === 'single') {
            exercise = item.exercise;
        } else if (item.type === 'superset') {
            for (var i = 0; i < item.exercises.length; i++) {
                if (item.exercises[i]._id === exId) { exercise = item.exercises[i]; subIdx = i; break; }
            }
            if (!exercise) exercise = item.exercises[0];
        } else if (item.type === 'choose_one') {
            // For choose_one, snapshot IDs may differ from live template IDs.
            // Apply structural changes (sets, reps, rest) to ALL options,
            // since options represent the same slot with the same set structure.
            exercise = item.options[0];
            subIdx = 0;
            applyToAll = true;
        }
        if (!exercise) return;

        var name = displayName || exercise.nameRu || exercise.name || '';
        var isSuperset = item.type === 'superset';
        var hasNextGroup = groupIdx < ed.items.length - 1;

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'inline-menu-overlay';

        var menuItems = '';

        // Techniques
        menuItems += '<div class="inline-menu-item" data-action="techniques"><div class="inline-menu-icon">' + _svgTech() + '</div><div class="inline-menu-label">Техники</div><div class="inline-menu-value">' + _techSummary(exercise) + '</div></div>';

        // Unilateral toggle
        var uniLabel = exercise.unilateral ? 'вкл' : 'выкл';
        menuItems += '<div class="inline-menu-item" data-action="unilateral"><div class="inline-menu-icon">' + _svgUni() + '</div><div class="inline-menu-label">Поочерёдно L/R</div><div class="inline-menu-value">' + uniLabel + '</div></div>';

        // Reps
        menuItems += '<div class="inline-menu-item" data-action="reps"><div class="inline-menu-icon">' + _svgReps() + '</div><div class="inline-menu-label">Повторения</div><div class="inline-menu-value">' + esc(exercise.reps || '') + '</div></div>';

        // Superset
        if (isSuperset) {
            menuItems += '<div class="inline-menu-item" data-action="split-superset"><div class="inline-menu-icon">' + _svgSplit() + '</div><div class="inline-menu-label">Разделить суперсет</div></div>';
        } else if (hasNextGroup) {
            menuItems += '<div class="inline-menu-item" data-action="merge-superset"><div class="inline-menu-icon">' + _svgMerge() + '</div><div class="inline-menu-label">Суперсет со следующим</div></div>';
        }

        // Replace
        menuItems += '<div class="inline-menu-item" data-action="replace"><div class="inline-menu-icon">' + _svgReplace() + '</div><div class="inline-menu-label">Заменить упражнение</div></div>';

        // Delete
        menuItems += '<div class="inline-menu-item danger" data-action="delete"><div class="inline-menu-icon">' + _svgDelete() + '</div><div class="inline-menu-label">Удалить</div></div>';

        overlay.innerHTML = '<div class="inline-sheet">' +
            '<div class="inline-sheet-header"><h3>' + esc(name) + '</h3><button class="inline-sheet-close">\u2715</button></div>' +
            '<div class="inline-menu-list">' + menuItems + '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        lockBodyScroll();

        // Close handlers
        overlay.querySelector('.inline-sheet-close').onclick = function() { self._closeSheet(); };
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) self._closeSheet();
        });

        // Store context for choose_one apply-to-all
        this._menuCtx = { applyToAll: applyToAll, groupItem: item };

        // Menu item clicks
        overlay.querySelector('.inline-menu-list').addEventListener('click', function(e) {
            var menuItem = e.target.closest('.inline-menu-item');
            if (!menuItem) return;
            var action = menuItem.getAttribute('data-action');
            self._handleMenuAction(action, exId, groupIdx, subIdx, dayNum, exercise, ed, menuItem);
        });
    },

    _handleMenuAction(action, exId, groupIdx, subIdx, dayNum, exercise, ed, menuItem) {
        var self = this;
        // Remove any existing sub-panel
        var oldPanel = document.getElementById('inline-sub-panel');
        if (oldPanel) oldPanel.remove();

        switch (action) {
            case 'techniques': case 'reps': {
                // Create panel and insert right after the clicked menu item
                var panel = document.createElement('div');
                panel.id = 'inline-sub-panel';
                menuItem.parentNode.insertBefore(panel, menuItem.nextSibling);

                if (action === 'techniques') {
                    panel.innerHTML = this._buildTechPanel(exercise);
                    this._bindTechPanel(panel, exercise, groupIdx, subIdx, dayNum, ed);
                } else {
                    panel.innerHTML = this._buildRepsPanel(exercise);
                    this._bindRepsPanel(panel, exercise, groupIdx, subIdx, dayNum, ed);
                }
                setTimeout(function() { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
                break;
            }

            case 'merge-superset':
                this._mergeWithNext(groupIdx, dayNum);
                break;

            case 'split-superset':
                this._splitSuperset(groupIdx, dayNum);
                break;

            case 'unilateral':
                this._toggleUnilateral(exercise, groupIdx, subIdx, dayNum, ed, menuItem);
                break;

            case 'replace':
                this._replaceExercise(exId, groupIdx, subIdx, dayNum, ed);
                break;

            case 'delete':
                this._closeSheet();
                this._confirmDelete(groupIdx, null, null);
                break;
        }
    },

    // --- Technique panel ---
    _buildTechPanel(exercise) {
        var sets = exercise.sets || [];
        var techs = [
            { key: 'DROP', label: 'DROP', name: 'Дроп-сет', cls: 'tech-DROP',
              desc: 'Снижаешь вес на 20-30% и сразу продолжаешь до отказа' },
            { key: 'REST_PAUSE', label: 'R-P', name: 'Отдых-пауза', cls: 'tech-REST_PAUSE',
              desc: 'Отдых 10-15 сек, продолжаешь повторения до отказа' },
            { key: 'MP', label: 'MP', name: 'Микро-пауза', cls: 'tech-MP',
              desc: 'Отдых макс 5 сек, ещё 1-3 повторения' }
        ];
        var html = '<div class="inline-sub-panel"><div class="inline-sub-title">Добавить техники</div>';
        for (var t = 0; t < techs.length; t++) {
            var tech = techs[t];
            html += '<div class="tech-card">';
            html += '<div class="tech-card-header"><span class="tech-card-badge ' + tech.cls + '">' + tech.label + '</span>';
            html += '<span class="tech-card-name">' + tech.name + '</span></div>';
            html += '<div class="tech-card-desc">' + tech.desc + '</div>';
            html += '<div class="tech-card-sets"><span class="tech-card-sets-label">Добавить в подход:</span>';
            for (var i = 0; i < sets.length; i++) {
                var setTechs = sets[i].techniques || [];
                var isActive = setTechs.indexOf(tech.key) >= 0;
                html += '<button class="tech-set-chip' + (isActive ? ' active' : '') + '" data-set="' + i + '" data-tech="' + tech.key + '">П.' + (i + 1) + '</button>';
            }
            html += '</div></div>';
        }
        html += '<button class="inline-apply-btn" data-apply="techniques">Применить</button></div>';
        return html;
    },

    _bindTechPanel(panel, exercise, groupIdx, subIdx, dayNum, ed) {
        var self = this;
        panel.addEventListener('click', function(e) {
            var chip = e.target.closest('.tech-set-chip');
            if (chip) {
                var setIdx = parseInt(chip.getAttribute('data-set'));
                var tech = chip.getAttribute('data-tech');
                var set = exercise.sets[setIdx];
                if (!set) return;
                if (!set.techniques) set.techniques = [];
                var idx = set.techniques.indexOf(tech);
                if (idx >= 0) {
                    set.techniques.splice(idx, 1);
                    chip.classList.remove('active');
                } else {
                    set.techniques.push(tech);
                    chip.classList.add('active');
                }
                return;
            }
            if (e.target.closest('[data-apply="techniques"]')) {
                self._saveAndClose(ed);
            }
        });
    },

    // --- Sets panel ---
    _buildSetsPanel(exercise) {
        var count = exercise.sets ? exercise.sets.length : 0;
        return '<div class="inline-sub-panel"><div class="inline-sub-title">Количество подходов</div>' +
            '<div class="inline-stepper">' +
            '<button class="inline-stepper-btn" data-step="-1">\u2212</button>' +
            '<span class="inline-stepper-val">' + count + '</span>' +
            '<button class="inline-stepper-btn" data-step="1">+</button>' +
            '</div>' +
            '<button class="inline-apply-btn" data-apply="sets">Применить</button></div>';
    },

    _bindSetsPanel(panel, exercise, groupIdx, subIdx, dayNum, ed) {
        var self = this;
        var valEl = panel.querySelector('.inline-stepper-val');
        panel.addEventListener('click', function(e) {
            var btn = e.target.closest('.inline-stepper-btn');
            if (btn) {
                var step = parseInt(btn.getAttribute('data-step'));
                var current = parseInt(valEl.textContent) || 0;
                var next = Math.max(1, Math.min(20, current + step));
                valEl.textContent = next;

                // Actually modify sets array
                if (!exercise.sets) exercise.sets = [];
                while (exercise.sets.length < next) {
                    var lastSet = exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1] : null;
                    exercise.sets.push({
                        type: lastSet ? lastSet.type : 'H',
                        rpe: lastSet ? lastSet.rpe : '8',
                        techniques: []
                    });
                }
                while (exercise.sets.length > next) {
                    exercise.sets.pop();
                }
                return;
            }
            if (e.target.closest('[data-apply="sets"]')) {
                self._saveAndClose(ed);
            }
        });
    },

    // --- Reps panel ---
    _buildRepsPanel(exercise) {
        var reps = exercise.reps || '8-12';
        var parts = reps.split('-');
        var from = parts[0] || '';
        var to = parts[1] || '';
        return '<div class="inline-sub-panel"><div class="inline-sub-title">Диапазон повторений</div>' +
            '<div class="inline-reps-row">' +
            '<input type="text" id="inline-reps-from" value="' + esc(from) + '" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="от">' +
            '<span class="inline-reps-dash">—</span>' +
            '<input type="text" id="inline-reps-to" value="' + esc(to) + '" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="до">' +
            '</div>' +
            '<button class="inline-apply-btn" data-apply="reps">Применить</button></div>';
    },

    _bindRepsPanel(panel, exercise, groupIdx, subIdx, dayNum, ed) {
        var self = this;
        var fromInput = panel.querySelector('#inline-reps-from');
        var toInput = panel.querySelector('#inline-reps-to');
        if (fromInput) {
            setTimeout(function() { fromInput.focus(); fromInput.select(); }, 100);
        }
        panel.addEventListener('click', function(e) {
            if (e.target.closest('[data-apply="reps"]')) {
                var from = fromInput ? fromInput.value.trim() : '';
                var to = toInput ? toInput.value.trim() : '';
                if (from && to) {
                    exercise.reps = from + '-' + to;
                } else if (from) {
                    exercise.reps = from;
                } else {
                    exercise.reps = exercise.reps || '8-12';
                }
                self._saveAndClose(ed);
            }
        });
    },

    // --- Rest panel ---
    _buildRestPanel(exercise) {
        var current = exercise.rest || 120;
        var presets = [60, 90, 120, 150, 180, 240];
        var html = '<div class="inline-sub-panel"><div class="inline-sub-title">Время отдыха</div><div class="inline-rest-grid">';
        for (var i = 0; i < presets.length; i++) {
            var val = presets[i];
            var label = val >= 60 ? Math.floor(val / 60) + ':' + ('0' + (val % 60)).slice(-2) : val + 'с';
            html += '<button class="inline-rest-btn' + (val === current ? ' active' : '') + '" data-rest="' + val + '">' + label + '</button>';
        }
        html += '</div><button class="inline-apply-btn" data-apply="rest">Применить</button></div>';
        return html;
    },

    _bindRestPanel(panel, exercise, groupIdx, subIdx, dayNum, ed) {
        var self = this;
        panel.addEventListener('click', function(e) {
            var btn = e.target.closest('.inline-rest-btn');
            if (btn) {
                panel.querySelectorAll('.inline-rest-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                exercise.rest = parseInt(btn.getAttribute('data-rest'));
                return;
            }
            if (e.target.closest('[data-apply="rest"]')) {
                self._saveAndClose(ed);
            }
        });
    },

    // --- Unilateral toggle ---
    _toggleUnilateral(exercise, groupIdx, subIdx, dayNum, ed, menuItem) {
        exercise.unilateral = !exercise.unilateral;
        // Update the menu value text
        var valueEl = menuItem.querySelector('.inline-menu-value');
        if (valueEl) valueEl.textContent = exercise.unilateral ? 'вкл' : 'выкл';
        this._onAutoSave(ed);
        this._onInvalidateCache();
    },

    // --- Merge / Split ---
    _mergeWithNext(groupIdx, dayNum) {
        var ed = this._onBuildVM(dayNum);
        if (!ed) return;
        var current = ed.items[groupIdx];
        var next = ed.items[groupIdx + 1];
        if (!current || !next) return;

        // Collect exercises from both
        var exercises = [];
        if (current.type === 'single') exercises.push(current.exercise);
        else if (current.type === 'superset') exercises = exercises.concat(current.exercises);
        else if (current.type === 'choose_one') exercises.push(current.options[0]);

        if (next.type === 'single') exercises.push(next.exercise);
        else if (next.type === 'superset') exercises = exercises.concat(next.exercises);
        else if (next.type === 'choose_one') exercises.push(next.options[0]);

        ed.items[groupIdx] = { type: 'superset', exercises: exercises };
        ed.items.splice(groupIdx + 1, 1);

        this._closeSheet();
        this._onAutoSave(ed);
        this._clearCurrentWeekSnapshot(dayNum);
        this._onInvalidateCache();
        this._onRenderDay();
    },

    _splitSuperset(groupIdx, dayNum) {
        var ed = this._onBuildVM(dayNum);
        if (!ed) return;
        var item = ed.items[groupIdx];
        if (!item || item.type !== 'superset') return;

        var singles = item.exercises.map(function(ex) { return { type: 'single', exercise: ex }; });
        var args = [groupIdx, 1].concat(singles);
        Array.prototype.splice.apply(ed.items, args);

        this._closeSheet();
        this._onAutoSave(ed);
        this._clearCurrentWeekSnapshot(dayNum);
        this._onInvalidateCache();
        this._onRenderDay();
    },

    // --- Replace exercise ---
    _replaceExercise(exId, groupIdx, subIdx, dayNum, ed) {
        var self = this;
        this._closeSheet();
        if (!this._onShowPicker) return;

        this._onShowPicker(function(result) {
            // result = { nameRu, name, numSets }
            var freshEd = self._onBuildVM(dayNum);
            if (!freshEd) return;
            var item = freshEd.items[groupIdx];
            if (!item) return;

            var newEx = {
                _id: 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                nameRu: result.nameRu,
                name: result.name,
                reps: '8-12',
                rest: 120,
                note: '',
                noteRu: '',
                sets: [],
                progression: []
            };
            if (result.unilateral) newEx.unilateral = true;

            // Copy sets config from old exercise if available
            var oldEx = null;
            if (item.type === 'single') oldEx = item.exercise;
            else if (item.type === 'superset' && item.exercises[subIdx]) oldEx = item.exercises[subIdx];
            if (oldEx && oldEx.sets) {
                newEx.sets = JSON.parse(JSON.stringify(oldEx.sets));
                newEx.reps = oldEx.reps;
                newEx.rest = oldEx.rest;
            } else {
                var numSets = result.numSets || 3;
                for (var s = 0; s < numSets; s++) {
                    newEx.sets.push({ type: 'H', rpe: '8', techniques: [] });
                }
            }

            if (item.type === 'single') {
                item.exercise = newEx;
            } else if (item.type === 'superset' && subIdx >= 0) {
                item.exercises[subIdx] = newEx;
            } else if (item.type === 'choose_one' && subIdx >= 0) {
                item.options[subIdx] = newEx;
            }

            self._onAutoSave(freshEd);
            self._onInvalidateCache();
            self._onRenderDay();
        });
    },

    // --- Add exercise ---
    addExercise(dayNum) {
        var self = this;
        if (!this._onShowPicker) return;

        this._onShowPicker(function(result) {
            var ed = self._onBuildVM(dayNum);
            if (!ed) return;

            var numSets = result.numSets || 3;
            var setsArr = [];
            for (var s = 0; s < numSets; s++) {
                setsArr.push({ type: 'H', rpe: '8', techniques: [] });
            }

            var addEx = {
                _id: 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                nameRu: result.nameRu,
                name: result.name,
                sets: setsArr,
                reps: '8-12',
                rest: 120,
                note: '',
                noteRu: '',
                progression: []
            };
            if (result.unilateral) addEx.unilateral = true;
            ed.items.push({ type: 'single', exercise: addEx });

            self._onAutoSave(ed);
            self._onInvalidateCache();
            // Stay in reorder mode if active — re-render and re-enter
            if (window._reorderMode) {
                self._onRenderDay();
                self._enterReorderAfterRender();
            } else {
                self._onRenderDay();
            }
        });
    },

    // Re-enter reorder mode after a re-render (add/delete while in reorder mode)
    _enterReorderAfterRender() {
        var self = this;
        setTimeout(function() {
            var slide = document.querySelector('.day-slide');
            if (!slide) return;
            var groups = slide.querySelectorAll(':scope > [data-group-idx], :scope > .choose-one-group[data-group-idx]');
            window._reorderMode = true;
            window._slotDragging = true;
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            for (var i = 0; i < groups.length; i++) {
                groups[i].classList.add('drag-compact');
            }
            // Add done button if not present
            if (!document.querySelector('.reorder-done-btn')) {
                var btn = document.createElement('button');
                btn.className = 'reorder-done-btn';
                btn.textContent = 'Готово';
                btn.addEventListener('click', function() {
                    window._reorderMode = false;
                    window._slotDragging = false;
                    document.body.style.overflow = '';
                    document.body.style.touchAction = '';
                    document.body.style.userSelect = '';
                    document.body.style.webkitUserSelect = '';
                    btn.remove();
                    self._onInvalidateCache();
                    self._onRenderDay();
                });
                slide.parentElement.insertBefore(btn, slide);
            }
            window.scrollTo(0, 0);
        }, 50);
    },

    // --- Shared helpers ---

    _saveAndClose(ed) {
        // For choose_one: mirror structural changes (sets, reps, rest) to all options
        if (this._menuCtx && this._menuCtx.applyToAll && this._menuCtx.groupItem) {
            var gi = this._menuCtx.groupItem;
            var primary = gi.options[0];
            if (primary && gi.options.length > 1) {
                for (var i = 1; i < gi.options.length; i++) {
                    gi.options[i].sets = JSON.parse(JSON.stringify(primary.sets));
                    gi.options[i].reps = primary.reps;
                    gi.options[i].rest = primary.rest;
                }
            }
        }
        this._menuCtx = null;
        this._onAutoSave(ed);
        this._clearCurrentWeekSnapshot(ed.dayNum);
        this._closeSheet();
        this._onInvalidateCache();
        this._onRenderDay();
    },

    _clearCurrentWeekSnapshot(dayNum) {
        var p = Storage.getProgram();
        var cw = AppState.currentWeek;
        var dayStr = String(dayNum);
        if (p && p.weekTemplateVersion && p.weekTemplateVersion[cw] && p.weekTemplateVersion[cw][dayStr]) {
            delete p.weekTemplateVersion[cw][dayStr];
            Storage.saveProgram(p, false);
        }
    },

    _closeSheet() {
        var overlay = document.getElementById('inline-menu-overlay');
        if (overlay) overlay.remove();
        unlockBodyScroll();
    },
};

// ===== SVG icons for menu items =====
function _svgUni() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>';
}
function _svgTech() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
}
function _svgSets() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
}
function _svgReps() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
}
function _svgRest() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
}
function _svgSplit() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>';
}
function _svgMerge() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5"/></svg>';
}
function _svgReplace() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>';
}
function _svgDelete() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
}

function _techSummary(exercise) {
    var techs = new Set();
    var sets = exercise.sets || [];
    for (var i = 0; i < sets.length; i++) {
        var t = sets[i].techniques || [];
        for (var j = 0; j < t.length; j++) techs.add(t[j]);
    }
    if (techs.size === 0) return '\u2014';
    var labels = { DROP: 'DROP', REST_PAUSE: 'R-P', MP: 'MP' };
    var result = [];
    techs.forEach(function(t) { result.push(labels[t] || t); });
    return result.join(', ');
}

function _formatRest(seconds) {
    if (!seconds) return '\u2014';
    if (seconds >= 60) return Math.floor(seconds / 60) + ':' + ('0' + (seconds % 60)).slice(-2);
    return seconds + '\u0441';
}
