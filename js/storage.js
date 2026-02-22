/* ===== Storage Module ===== */

// Dynamic storage key per user
function _storageKey() {
    var userId = localStorage.getItem('wt_current');
    return userId ? 'wt_data_' + userId : 'workout_tracker_v1';
}

const Storage = {
    _data: null,

    _invalidateCache() {
        this._data = null;
    },

    _load() {
        if (this._data) return this._data;
        try {
            const raw = localStorage.getItem(_storageKey());
            this._data = raw ? JSON.parse(raw) : this._defaultData();
            // Migrate: add new fields if missing
            if (!this._data.equipment) this._data.equipment = [];
            if (!this._data.exerciseEquipment) this._data.exerciseEquipment = {};
            if (!this._data.exerciseUnits) this._data.exerciseUnits = {};
            if (this._data.program === undefined) this._data.program = null;
            if (!this._data.exerciseEquipmentOptions) {
                this._data.exerciseEquipmentOptions = {};
                // Auto-migrate: link currently assigned equipment to their exercises
                for (const [exId, eqId] of Object.entries(this._data.exerciseEquipment)) {
                    if (eqId) this._data.exerciseEquipmentOptions[exId] = [eqId];
                }
                this._save();
            }
        } catch (e) {
            console.error('Storage load error:', e);
            this._data = this._defaultData();
        }
        return this._data;
    },

    _save() {
        try {
            localStorage.setItem(_storageKey(), JSON.stringify(this._data));
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
            program: null,
            equipment: [],
            exerciseEquipment: {},
            exerciseEquipmentOptions: {},
            exerciseUnits: {},
            exerciseChoices: {},
            log: {}
        };
    },

    // ===== User Management =====
    getUsers() {
        try {
            var raw = localStorage.getItem('wt_users');
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    },

    _saveUsers(users) {
        localStorage.setItem('wt_users', JSON.stringify(users));
    },

    getCurrentUserId() {
        return localStorage.getItem('wt_current') || null;
    },

    setCurrentUser(userId) {
        this._invalidateCache();
        localStorage.setItem('wt_current', userId);
    },

    getCurrentUser() {
        var userId = this.getCurrentUserId();
        if (!userId) return null;
        return this.getUsers().find(function(u) { return u.id === userId; }) || null;
    },

    createUser(id, name, programId) {
        var users = this.getUsers();
        users.push({ id: id, name: name, programId: programId, createdAt: Date.now() });
        this._saveUsers(users);
        return id;
    },

    logout() {
        this._invalidateCache();
        localStorage.removeItem('wt_current');
    },

    // Fix misidentified users from v164 migration
    _fixMigration() {
        if (localStorage.getItem('_wt_fix_v165')) return;
        localStorage.setItem('_wt_fix_v165', '1');

        var users = this.getUsers();
        if (users.length === 0) return;

        var origData = localStorage.getItem('workout_tracker_v1');
        if (!origData) return;

        try {
            var parsed = JSON.parse(origData);
            var athlete = parsed.program && parsed.program.athlete ? parsed.program.athlete : '';
            var isAnastasia = athlete.indexOf('Anastasiia') !== -1 || athlete.indexOf('Dobrosol') !== -1;

            // User was wrongly assigned as anastasia but original data is NOT Anastasia's
            var wrongUser = users.find(function(u) { return u.id === 'anastasia'; });
            if (wrongUser && !isAnastasia) {
                // Restore from original backup
                localStorage.setItem('wt_data_mikhail', origData);
                localStorage.removeItem('wt_data_anastasia');
                wrongUser.id = 'mikhail';
                wrongUser.name = 'Дима';
                wrongUser.programId = 'mikhail_default';
                this._saveUsers(users);
                if (localStorage.getItem('wt_current') === 'anastasia') {
                    localStorage.setItem('wt_current', 'mikhail');
                }
            }
        } catch (e) {
            console.error('Fix migration error:', e);
        }
    },

    // One-time migration: convert old single-user data to multi-user
    migrateToMultiUser() {
        this._fixMigration();

        // Already migrated?
        if (this.getUsers().length > 0) return;

        // Check if old single-user data exists
        var oldData = localStorage.getItem('workout_tracker_v1');
        if (!oldData) return;

        try {
            var parsed = JSON.parse(oldData);
            var athlete = parsed.program && parsed.program.athlete ? parsed.program.athlete : '';

            var userId, name, programId;
            if (athlete.indexOf('Mikhail') !== -1 || athlete.indexOf('Timoshin') !== -1) {
                userId = 'mikhail';
                name = 'Дима';
                programId = 'mikhail_default';
            } else if (athlete.indexOf('Anastasiia') !== -1 || athlete.indexOf('Dobrosol') !== -1) {
                userId = 'anastasia';
                name = 'Анастасия';
                programId = 'anastasia_default';
            } else {
                // Unknown athlete — show login screen
                return;
            }

            // Create user profile
            this.createUser(userId, name, programId);

            // Copy data to new key
            localStorage.setItem('wt_data_' + userId, oldData);

            // Set as current user
            localStorage.setItem('wt_current', userId);
        } catch (e) {
            console.error('Migration error:', e);
        }
    },

    // ===== Settings =====
    getSettings() {
        return this._load().settings;
    },

    saveSettings(settings) {
        this._load().settings = { ...this._load().settings, ...settings };
        this._save();
    },

    isSetup() {
        var s = this.getSettings();
        return s.startDate !== null;
    },

    // ===== Program =====
    hasProgram() {
        return this._load().program !== null;
    },

    getProgram() {
        return this._load().program;
    },

    saveProgram(programData, clearExerciseData) {
        var data = this._load();
        if (clearExerciseData) {
            data.log = {};
            data.exerciseChoices = {};
            data.exerciseEquipment = {};
            data.exerciseEquipmentOptions = {};
            data.exerciseUnits = {};
            data.settings.startDate = null;
        }
        data.program = programData;
        this._save();
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
        var data = this._load();
        var id = 'eq_' + Date.now();
        data.equipment.push({ id: id, name: name, type: type || 'other' });
        this._save();
        return id;
    },

    removeEquipment(id) {
        var data = this._load();
        data.equipment = data.equipment.filter(function(e) { return e.id !== id; });
        for (var exId of Object.keys(data.exerciseEquipmentOptions)) {
            data.exerciseEquipmentOptions[exId] = (data.exerciseEquipmentOptions[exId] || []).filter(function(eqId) { return eqId !== id; });
        }
        for (var [exId2, eqId] of Object.entries(data.exerciseEquipment)) {
            if (eqId === id) data.exerciseEquipment[exId2] = null;
        }
        this._save();
    },

    renameEquipment(id, newName) {
        var data = this._load();
        var eq = data.equipment.find(function(e) { return e.id === id; });
        if (eq) {
            eq.name = newName;
            this._save();
        }
    },

    getEquipmentById(id) {
        if (!id) return null;
        return this.getEquipmentList().find(function(e) { return e.id === id; }) || null;
    },

    getExerciseEquipment(exerciseId) {
        return this._load().exerciseEquipment[exerciseId] || null;
    },

    setExerciseEquipment(exerciseId, equipmentId) {
        this._load().exerciseEquipment[exerciseId] = equipmentId;
        if (equipmentId) this.linkEquipmentToExercise(exerciseId, equipmentId);
        this._save();
    },

    getExerciseEquipmentOptions(exerciseId) {
        var data = this._load();
        var ids = data.exerciseEquipmentOptions[exerciseId] || [];
        return ids.map(function(id) { return Storage.getEquipmentById(id); }).filter(Boolean);
    },

    linkEquipmentToExercise(exerciseId, equipmentId) {
        var data = this._load();
        if (!data.exerciseEquipmentOptions[exerciseId]) {
            data.exerciseEquipmentOptions[exerciseId] = [];
        }
        if (!data.exerciseEquipmentOptions[exerciseId].includes(equipmentId)) {
            data.exerciseEquipmentOptions[exerciseId].push(equipmentId);
        }
    },

    unlinkEquipmentFromExercise(exerciseId, equipmentId) {
        var data = this._load();
        if (data.exerciseEquipmentOptions[exerciseId]) {
            data.exerciseEquipmentOptions[exerciseId] = data.exerciseEquipmentOptions[exerciseId].filter(function(id) { return id !== equipmentId; });
        }
        if (data.exerciseEquipment[exerciseId] === equipmentId) {
            data.exerciseEquipment[exerciseId] = null;
        }
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
        var data = this._load();
        var w = String(week), d = String(day), s = String(setIdx);
        if (data.log[w] && data.log[w][d] && data.log[w][d][exerciseId] && data.log[w][d][exerciseId][s]) {
            return data.log[w][d][exerciseId][s];
        }
        return null;
    },

    saveSetLog(week, day, exerciseId, setIdx, weight, reps, equipmentId) {
        var data = this._load();
        var w = String(week), d = String(day), s = String(setIdx);
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
        var existing = this.getSetLog(week, day, exerciseId, setIdx);
        if (existing && existing.completed) {
            var data = this._load();
            delete data.log[String(week)][String(day)][exerciseId][String(setIdx)];
            this._save();
            return false;
        } else {
            var data = this._load();
            var w = String(week), d = String(day), s = String(setIdx);
            if (!data.log[w]) data.log[w] = {};
            if (!data.log[w][d]) data.log[w][d] = {};
            if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};
            var current = data.log[w][d][exerciseId][s] || {};
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
        var data = this._load();
        var w = String(week), d = String(day), s = String(setIdx);
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};
        if (!data.log[w][d][exerciseId][s]) {
            data.log[w][d][exerciseId][s] = {
                weight: 0, reps: 0, completed: false, timestamp: Date.now()
            };
        }
        data.log[w][d][exerciseId][s][field] = value;
        data.log[w][d][exerciseId][s].timestamp = Date.now();
        this._save();
    },

    stampEquipment(week, day, exerciseId, setIdx, equipmentId) {
        var data = this._load();
        var w = String(week), d = String(day), s = String(setIdx);
        if (data.log[w] && data.log[w][d] && data.log[w][d][exerciseId] && data.log[w][d][exerciseId][s]) {
            data.log[w][d][exerciseId][s].equipmentId = equipmentId || null;
            this._save();
        }
    },

    _ensureSegEntry(week, day, exerciseId, setIdx, segIdx) {
        var data = this._load();
        var w = String(week), d = String(day), s = String(setIdx), si = String(segIdx);
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};
        if (!data.log[w][d][exerciseId][s]) {
            data.log[w][d][exerciseId][s] = { weight: 0, reps: 0, completed: false, timestamp: Date.now() };
        }
        var entry = data.log[w][d][exerciseId][s];
        if (!entry.segs) entry.segs = {};
        if (!entry.segs[si] || typeof entry.segs[si] !== 'object') entry.segs[si] = {};
        return { entry: entry, si: si };
    },

    saveSegReps(week, day, exerciseId, setIdx, segIdx, value) {
        if (segIdx === 0) { this.updateSetValue(week, day, exerciseId, setIdx, 'reps', value); return; }
        var r = this._ensureSegEntry(week, day, exerciseId, setIdx, segIdx);
        r.entry.segs[r.si].reps = value;
        r.entry.timestamp = Date.now();
        this._save();
    },

    saveSegWeight(week, day, exerciseId, setIdx, segIdx, value) {
        if (segIdx === 0) { this.updateSetValue(week, day, exerciseId, setIdx, 'weight', value); return; }
        var r = this._ensureSegEntry(week, day, exerciseId, setIdx, segIdx);
        r.entry.segs[r.si].weight = value;
        r.entry.timestamp = Date.now();
        this._save();
    },

    getPreviousLog(week, day, exerciseId, setIdx, equipmentId) {
        for (var w = week - 1; w >= 1; w--) {
            var log = this.getSetLog(w, day, exerciseId, setIdx);
            if (log && log.completed) {
                if (equipmentId) {
                    if (log.equipmentId === equipmentId) return log;
                } else {
                    return log;
                }
            }
        }
        return null;
    },

    getExerciseHistory(exerciseId) {
        var data = this._load();
        var history = [];
        var totalWeeks = PROGRAM ? PROGRAM.totalWeeks : 12;
        var totalDays = PROGRAM ? Object.keys(PROGRAM.dayTemplates).length : 5;
        for (var week = 1; week <= totalWeeks; week++) {
            var w = String(week);
            if (!data.log[w]) continue;
            for (var day = 1; day <= totalDays; day++) {
                var d = String(day);
                if (!data.log[w][d] || !data.log[w][d][exerciseId]) continue;
                var sets = [];
                for (var [setIdx, setData] of Object.entries(data.log[w][d][exerciseId])) {
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
                    sets.sort(function(a, b) { return a.setIdx - b.setIdx; });
                    history.push({ week: week, day: day, sets: sets });
                }
            }
        }
        return history;
    },

    getLastTrainingDate(week, day) {
        var data = this._load();
        var w = String(week), d = String(day);
        if (!data.log[w] || !data.log[w][d]) return null;
        var maxTs = 0;
        for (var exId of Object.keys(data.log[w][d])) {
            for (var setData of Object.values(data.log[w][d][exId])) {
                if (setData && setData.timestamp > maxTs) maxTs = setData.timestamp;
            }
        }
        return maxTs > 0 ? maxTs : null;
    },

    exportData() {
        return JSON.stringify(this._load(), null, 2);
    },

    importData(jsonString) {
        try {
            var data = JSON.parse(jsonString);
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
