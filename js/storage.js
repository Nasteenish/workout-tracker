/* ===== Storage Module ===== */

const STORAGE_KEY = 'workout_tracker_v1';

const Storage = {
    _data: null,

    _load() {
        if (this._data) return this._data;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            this._data = raw ? JSON.parse(raw) : this._defaultData();
            // Migrate: add new fields if missing
            if (!this._data.equipment) this._data.equipment = [];
            if (!this._data.exerciseEquipment) this._data.exerciseEquipment = {};
            if (!this._data.exerciseUnits) this._data.exerciseUnits = {};
        } catch (e) {
            console.error('Storage load error:', e);
            this._data = this._defaultData();
        }
        return this._data;
    },

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
        } catch (e) {
            console.error('Storage save error:', e);
        }
    },

    _defaultData() {
        return {
            settings: {
                cycleType: 7,
                startDate: null,
                weightUnit: 'kg'
            },
            equipment: [],
            exerciseEquipment: {},
            exerciseUnits: {},
            exerciseChoices: {},
            log: {}
        };
    },

    // Settings
    getSettings() {
        return this._load().settings;
    },

    saveSettings(settings) {
        this._load().settings = { ...this._load().settings, ...settings };
        this._save();
    },

    isSetup() {
        const s = this.getSettings();
        return s.startDate !== null;
    },

    getWeightUnit() {
        return this.getSettings().weightUnit || 'kg';
    },

    setWeightUnit(unit) {
        this.saveSettings({ weightUnit: unit });
    },

    // ===== Equipment =====
    getEquipmentList() {
        return this._load().equipment || [];
    },

    addEquipment(name, type) {
        const data = this._load();
        const id = 'eq_' + Date.now();
        data.equipment.push({ id, name, type: type || 'other' });
        this._save();
        return id;
    },

    removeEquipment(id) {
        const data = this._load();
        data.equipment = data.equipment.filter(e => e.id !== id);
        this._save();
    },

    renameEquipment(id, newName) {
        const data = this._load();
        const eq = data.equipment.find(e => e.id === id);
        if (eq) {
            eq.name = newName;
            this._save();
        }
    },

    getEquipmentById(id) {
        if (!id) return null;
        return this.getEquipmentList().find(e => e.id === id) || null;
    },

    getExerciseEquipment(exerciseId) {
        return this._load().exerciseEquipment[exerciseId] || null;
    },

    setExerciseEquipment(exerciseId, equipmentId) {
        this._load().exerciseEquipment[exerciseId] = equipmentId;
        this._save();
    },

    getExerciseUnit(exerciseId) {
        return this._load().exerciseUnits[exerciseId] || null;
    },

    setExerciseUnit(exerciseId, unit) {
        this._load().exerciseUnits[exerciseId] = unit;
        this._save();
    },

    // Exercise choices (for choose_one groups)
    getChoice(groupKey) {
        return this._load().exerciseChoices[groupKey] || null;
    },

    saveChoice(groupKey, exerciseId) {
        this._load().exerciseChoices[groupKey] = exerciseId;
        this._save();
    },

    // ===== Set logging =====
    getSetLog(week, day, exerciseId, setIdx) {
        const data = this._load();
        const w = String(week);
        const d = String(day);
        const s = String(setIdx);

        if (data.log[w] && data.log[w][d] && data.log[w][d][exerciseId] && data.log[w][d][exerciseId][s]) {
            return data.log[w][d][exerciseId][s];
        }
        return null;
    },

    saveSetLog(week, day, exerciseId, setIdx, weight, reps, equipmentId) {
        const data = this._load();
        const w = String(week);
        const d = String(day);
        const s = String(setIdx);

        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};

        data.log[w][d][exerciseId][s] = {
            weight: weight,
            reps: reps,
            completed: true,
            timestamp: Date.now()
        };
        if (equipmentId) data.log[w][d][exerciseId][s].equipmentId = equipmentId;
        this._save();
    },

    toggleSetComplete(week, day, exerciseId, setIdx, equipmentId) {
        const existing = this.getSetLog(week, day, exerciseId, setIdx);
        if (existing && existing.completed) {
            // Uncomplete
            const data = this._load();
            delete data.log[String(week)][String(day)][exerciseId][String(setIdx)];
            this._save();
            return false;
        } else {
            // Complete with current values
            const data = this._load();
            const w = String(week);
            const d = String(day);
            const s = String(setIdx);

            if (!data.log[w]) data.log[w] = {};
            if (!data.log[w][d]) data.log[w][d] = {};
            if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};

            const current = data.log[w][d][exerciseId][s] || {};
            data.log[w][d][exerciseId][s] = {
                weight: current.weight || 0,
                reps: current.reps || 0,
                completed: true,
                timestamp: Date.now()
            };
            if (equipmentId) data.log[w][d][exerciseId][s].equipmentId = equipmentId;
            this._save();
            return true;
        }
    },

    updateSetValue(week, day, exerciseId, setIdx, field, value) {
        const data = this._load();
        const w = String(week);
        const d = String(day);
        const s = String(setIdx);

        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};
        if (!data.log[w][d][exerciseId][s]) {
            data.log[w][d][exerciseId][s] = {
                weight: 0,
                reps: 0,
                completed: false,
                timestamp: Date.now()
            };
        }

        data.log[w][d][exerciseId][s][field] = value;
        data.log[w][d][exerciseId][s].timestamp = Date.now();
        this._save();
    },

    // Stamp current equipment on a set log entry
    stampEquipment(week, day, exerciseId, setIdx, equipmentId) {
        const data = this._load();
        const w = String(week);
        const d = String(day);
        const s = String(setIdx);
        if (data.log[w] && data.log[w][d] && data.log[w][d][exerciseId] && data.log[w][d][exerciseId][s]) {
            data.log[w][d][exerciseId][s].equipmentId = equipmentId || null;
            this._save();
        }
    },

    saveSegReps(week, day, exerciseId, setIdx, segIdx, value) {
        if (segIdx === 0) {
            this.updateSetValue(week, day, exerciseId, setIdx, 'reps', value);
            return;
        }
        const data = this._load();
        const w = String(week), d = String(day), s = String(setIdx);
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};
        if (!data.log[w][d][exerciseId][s]) {
            data.log[w][d][exerciseId][s] = { weight: 0, reps: 0, completed: false, timestamp: Date.now() };
        }
        const entry = data.log[w][d][exerciseId][s];
        if (!entry.segs) entry.segs = {};
        entry.segs[String(segIdx)] = value;
        entry.timestamp = Date.now();
        this._save();
    },

    // Get previous week's log for an exercise/set (for placeholder)
    // If equipmentId provided, prefer matching equipment; fallback to any
    getPreviousLog(week, day, exerciseId, setIdx, equipmentId) {
        // First pass: match equipment
        if (equipmentId) {
            for (let w = week - 1; w >= 1; w--) {
                const log = this.getSetLog(w, day, exerciseId, setIdx);
                if (log && log.completed && log.equipmentId === equipmentId) return log;
            }
        }
        // Fallback: any equipment
        for (let w = week - 1; w >= 1; w--) {
            const log = this.getSetLog(w, day, exerciseId, setIdx);
            if (log && log.completed) return log;
        }
        return null;
    },

    // Get exercise history across all weeks — includes equipmentId
    getExerciseHistory(exerciseId) {
        const data = this._load();
        const history = [];

        for (let week = 1; week <= 12; week++) {
            const w = String(week);
            if (!data.log[w]) continue;

            for (let day = 1; day <= 5; day++) {
                const d = String(day);
                if (!data.log[w][d] || !data.log[w][d][exerciseId]) continue;

                const sets = [];
                for (const [setIdx, setData] of Object.entries(data.log[w][d][exerciseId])) {
                    if (setData.completed) {
                        sets.push({
                            setIdx: parseInt(setIdx),
                            weight: setData.weight,
                            reps: setData.reps,
                            timestamp: setData.timestamp,
                            equipmentId: setData.equipmentId || null
                        });
                    }
                }

                if (sets.length > 0) {
                    sets.sort((a, b) => a.setIdx - b.setIdx);
                    history.push({ week, day, sets });
                }
            }
        }

        return history;
    },

    // Export / Import
    exportData() {
        return JSON.stringify(this._load(), null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.settings && data.log) {
                this._data = data;
                this._save();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    clearAll() {
        this._data = this._defaultData();
        this._save();
    }
};
