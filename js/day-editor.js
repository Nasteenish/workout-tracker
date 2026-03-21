// day-editor.js — Inline exercise editing in day view
// Handles tech panel operations, structural changes (superset/choose_one),
// exercise add/delete/reorder — all from within the day view.

import { Storage } from './storage.js';
import { ACCOUNTS } from './users.js';
import { buildDayEditorVM, autoSaveEditorItems, extractExForEdit } from './program-utils.js';

export const DayEditor = {
    // Callbacks — wired in App.init()
    _onInvalidateCache: null,
    _onRenderDay: null,

    // State
    _editingDay: null,  // { dayNum, items: [{type, exercise|exercises|options}] }

    // ===== Lifecycle =====

    /** Lazily start editing — called on first structural action */
    startEditing(dayNum) {
        if (this._editingDay && this._editingDay.dayNum === dayNum) return;
        this._editingDay = buildDayEditorVM(dayNum);
    },

    stopEditing() {
        this._editingDay = null;
    },

    // ===== Helpers =====

    _isPremium() {
        var user = Storage.getCurrentUser();
        if (!user) return false;
        var account = ACCOUNTS.find(function(a) { return a.id === user.id || a.login === user.login; });
        return !!(account && account.premium);
    },

    _getExercise(groupIdx, subIdx) {
        var item = this._editingDay && this._editingDay.items[groupIdx];
        if (!item) return null;
        if (item.type === 'single') return item.exercise;
        if (item.type === 'superset') return item.exercises && item.exercises[subIdx];
        if (item.type === 'choose_one') return item.options && item.options[subIdx];
        return null;
    },

    /** Save and re-render (for structural changes) */
    _save(weekNum, dayNum) {
        autoSaveEditorItems(this._editingDay);
        if (this._onInvalidateCache) this._onInvalidateCache();
        if (this._onRenderDay) this._onRenderDay(weekNum, dayNum);
    },

    /** Save without re-render (for inline tech/type/RPE changes) */
    _saveSilent() {
        autoSaveEditorItems(this._editingDay);
        if (this._onInvalidateCache) this._onInvalidateCache();
    },

    // ===== Tech Panel Operations =====

    cycleTechnique(groupIdx, subIdx, setIdx, techName) {
        var ex = this._getExercise(groupIdx, subIdx);
        if (!ex || !ex.sets || !ex.sets[setIdx]) return null;
        var techs = ex.sets[setIdx].techniques || [];
        var count = techs.filter(function(x) { return x === techName; }).length;
        var next = count >= 3 ? 0 : count + 1;
        ex.sets[setIdx].techniques = techs.filter(function(x) { return x !== techName; });
        for (var n = 0; n < next; n++) ex.sets[setIdx].techniques.push(techName);
        return next;
    },

    cycleType(groupIdx, subIdx, setIdx, typeName) {
        var ex = this._getExercise(groupIdx, subIdx);
        if (!ex || !ex.sets || !ex.sets[setIdx]) return;
        ex.sets[setIdx].type = typeName;
    },

    setRPE(groupIdx, subIdx, setIdx, value) {
        var ex = this._getExercise(groupIdx, subIdx);
        if (!ex || !ex.sets || !ex.sets[setIdx]) return;
        ex.sets[setIdx].rpe = value;
    },

    // ===== Structural Operations =====

    addExercise(exerciseConfig, weekNum, dayNum) {
        this.startEditing(dayNum);
        this._editingDay.items.push({
            type: 'single',
            exercise: {
                _id: 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                nameRu: exerciseConfig.nameRu,
                name: exerciseConfig.name,
                sets: exerciseConfig.sets || [
                    { type: 'H', rpe: '8', techniques: [] },
                    { type: 'H', rpe: '8', techniques: [] },
                    { type: 'H', rpe: '8', techniques: [] }
                ],
                reps: exerciseConfig.reps || '8-12',
                rest: exerciseConfig.rest || 120,
                note: '', noteRu: '',
                progression: []
            }
        });
        this._save(weekNum, dayNum);
    },

    deleteExercise(groupIdx, weekNum, dayNum) {
        this.startEditing(dayNum);
        if (groupIdx < 0 || groupIdx >= this._editingDay.items.length) return;
        this._editingDay.items.splice(groupIdx, 1);
        this._save(weekNum, dayNum);
    },

    // Merge exercise at groupIdx with a new partner into a superset
    mergeSuperset(groupIdx, partnerExercise, weekNum, dayNum) {
        this.startEditing(dayNum);
        var item = this._editingDay.items[groupIdx];
        if (!item) return;

        if (item.type === 'superset') {
            // Already a superset — add partner
            item.exercises.push({
                _id: 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                nameRu: partnerExercise.nameRu,
                name: partnerExercise.name,
                sets: partnerExercise.sets || [{ type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }],
                reps: partnerExercise.reps || '8-12',
                rest: partnerExercise.rest || 120,
                note: '', noteRu: '', progression: []
            });
        } else if (item.type === 'single') {
            // Convert single → superset
            var exercises = [item.exercise, {
                _id: 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                nameRu: partnerExercise.nameRu,
                name: partnerExercise.name,
                sets: partnerExercise.sets || [{ type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }],
                reps: partnerExercise.reps || '8-12',
                rest: partnerExercise.rest || 120,
                note: '', noteRu: '', progression: []
            }];
            this._editingDay.items[groupIdx] = { type: 'superset', exercises: exercises };
        }
        this._save(weekNum, dayNum);
    },

    splitSuperset(groupIdx, weekNum, dayNum) {
        this.startEditing(dayNum);
        var item = this._editingDay.items[groupIdx];
        if (!item) return;

        var singles = [];
        if (item.type === 'superset') {
            for (var i = 0; i < item.exercises.length; i++) {
                singles.push({ type: 'single', exercise: item.exercises[i] });
            }
        } else if (item.type === 'choose_one') {
            for (var i = 0; i < item.options.length; i++) {
                singles.push({ type: 'single', exercise: item.options[i] });
            }
        } else {
            return;
        }

        this._editingDay.items.splice(groupIdx, 1, ...singles);
        this._save(weekNum, dayNum);
    },

    addAlternative(groupIdx, alternativeExercise, weekNum, dayNum) {
        this.startEditing(dayNum);
        var item = this._editingDay.items[groupIdx];
        if (!item) return;

        var altEx = {
            _id: 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            nameRu: alternativeExercise.nameRu,
            name: alternativeExercise.name,
            sets: alternativeExercise.sets || [{ type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }],
            reps: alternativeExercise.reps || '8-12',
            rest: alternativeExercise.rest || 120,
            note: '', noteRu: '', progression: []
        };

        if (item.type === 'choose_one') {
            item.options.push(altEx);
        } else if (item.type === 'single') {
            this._editingDay.items[groupIdx] = {
                type: 'choose_one',
                choiceKey: 'c_' + Date.now(),
                options: [item.exercise, altEx]
            };
        }
        this._save(weekNum, dayNum);
    },

    removeAlternative(groupIdx, subIdx, weekNum, dayNum) {
        this.startEditing(dayNum);
        var item = this._editingDay.items[groupIdx];
        if (!item || item.type !== 'choose_one') return;

        item.options.splice(subIdx, 1);
        if (item.options.length <= 1) {
            // Convert back to single
            this._editingDay.items[groupIdx] = { type: 'single', exercise: item.options[0] };
        }
        this._save(weekNum, dayNum);
    },

    removeFromSuperset(groupIdx, subIdx, weekNum, dayNum) {
        this.startEditing(dayNum);
        var item = this._editingDay.items[groupIdx];
        if (!item || item.type !== 'superset') return;

        item.exercises.splice(subIdx, 1);
        if (item.exercises.length <= 1) {
            this._editingDay.items[groupIdx] = { type: 'single', exercise: item.exercises[0] };
        }
        this._save(weekNum, dayNum);
    },

    moveExercise(groupIdx, direction, weekNum, dayNum) {
        this.startEditing(dayNum);
        var items = this._editingDay.items;
        var newIdx = groupIdx + direction;
        if (newIdx < 0 || newIdx >= items.length) return;
        var temp = items[groupIdx];
        items[groupIdx] = items[newIdx];
        items[newIdx] = temp;
        this._save(weekNum, dayNum);
    },

    reorderExercises(newOrder, weekNum, dayNum) {
        this.startEditing(dayNum);
        var items = this._editingDay.items;
        var reordered = newOrder.map(function(idx) { return items[idx]; });
        this._editingDay.items = reordered;
        this._save(weekNum, dayNum);
    }
};
