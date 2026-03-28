/* ===== Storage Module ===== */
import { ACCOUNTS } from './users.js';
import { parseWeight, parseReps, getAllProgramExercises, getGroupExercises } from './utils.js';

// Dynamic storage key per user
export function _storageKey() {
    var userId = localStorage.getItem('wt_current');
    return userId ? 'wt_data_' + userId : 'workout_tracker_v1';
}

export const Storage = {
    _data: null,
    _siblingCache: null,
    _program: null,
    _onSave: null,
    _migrateFn: null,

    getProgram() {
        return this._program;
    },

    setProgram(prog) {
        this._program = prog;
        this._invalidateSiblingCache();
    },

    _invalidateCache() {
        this._data = null;
    },

    _invalidateSiblingCache() {
        this._siblingCache = null;
    },

    _buildSiblingCache() {
        this._siblingCache = {};
        if (!this._program) return;
        var data = this._load();
        var subs = data.exerciseSubstitutions || {};
        var nameToEntries = {};
        var all = getAllProgramExercises(this._program);
        for (var i = 0; i < all.length; i++) {
            var ex = all[i].exercise;
            var n = subs[ex.id] || ex.nameRu || ex.name;
            if (n) { if (!nameToEntries[n]) nameToEntries[n] = []; nameToEntries[n].push({ id: ex.id, day: all[i].day }); }
        }
        var cache = this._siblingCache;
        for (var name in nameToEntries) {
            var entries = nameToEntries[name];
            if (entries.length < 2) { cache[entries[0].id] = []; continue; }
            for (var i = 0; i < entries.length; i++) {
                cache[entries[i].id] = entries.filter(function(e) { return e.id !== entries[i].id && e.day !== entries[i].day; });
            }
        }
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
            if (!this._data.exerciseSubstitutions) this._data.exerciseSubstitutions = {};
            if (!this._data.gyms) this._data.gyms = [];
            if (!this._data.myGymIds) this._data.myGymIds = [];
            if (!this._data.gymLastUsed) this._data.gymLastUsed = {};
            if (!this._data.gymEquipmentMap) this._data.gymEquipmentMap = {};
            if (!this._data.unilateralMode) this._data.unilateralMode = {};
            if (!this._data.exerciseEquipmentOptions) {
                this._data.exerciseEquipmentOptions = {};
                // Auto-migrate: link currently assigned equipment to their exercises
                for (const [exId, eqId] of Object.entries(this._data.exerciseEquipment)) {
                    if (eqId) this._data.exerciseEquipmentOptions[exId] = [eqId];
                }
                this._save();
            }
            // Initialize _programModified from _lastModified if missing
            // (ensures sync merge can compare program timestamps)
            if (!this._data._programModified && this._data._lastModified && this._data.program) {
                this._data._programModified = this._data._lastModified;
            }
            // Run migrations only when version changes (not every load)
            var MIGRATION_VERSION = 22;
            if ((this._data._migrationVersion || 0) < MIGRATION_VERSION) {
                if (this._migrateFn) {
                    this._migrateFn(this._data);
                }
                this._data._migrationVersion = MIGRATION_VERSION;
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
            if (this._data) this._data._lastModified = Date.now();
            localStorage.setItem(_storageKey(), JSON.stringify(this._data));
            // Trigger cloud sync if available
            if (this._onSave) this._onSave();
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
            exerciseSubstitutions: {},
            unilateralMode: {},
            gyms: [],
            gymEquipmentMap: {},
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

    // Self-registration: create new user with login/password/email stored in wt_users
    createSelfRegisteredUser(name, login, password, email, customId, programId) {
        var users = this.getUsers();
        var id = customId || ('user_' + Date.now());
        users.push({ id: id, name: name, login: login, password: password, email: email || '', programId: programId || null, selfRegistered: true, createdAt: Date.now() });
        this._saveUsers(users);
        return id;
    },

    // Login for self-registered users
    loginSelfRegistered(login, password) {
        var users = this.getUsers();
        return users.find(function(u) {
            return u.selfRegistered && u.login === login && u.password === password;
        }) || null;
    },

    // Check if login is already taken (across hardcoded + self-registered)
    isLoginTaken(login) {
        // Check hardcoded ACCOUNTS
        if (ACCOUNTS) {
            if (ACCOUNTS.some(function(a) { return a.login === login; })) return true;
        }
        // Check self-registered
        var users = this.getUsers();
        return users.some(function(u) { return u.login === login; });
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

    // Week slot layout (custom day/rest order)
    getWeekSlots() {
        return this._load().weekSlots || null;
    },

    saveWeekSlots(slots) {
        this._load().weekSlots = slots;
        this._save();
    },

    // ===== Program =====
    hasProgram() {
        return this._load().program !== null;
    },

    getStoredProgram() {
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
        data._programModified = Date.now();
        this._invalidateSiblingCache();
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

    makeEquipmentId(name, catalogId) {
        if (catalogId) return 'catalog:' + catalogId;
        return 'custom:' + (name || 'unknown')
            .toLowerCase()
            .replace(/[^a-zа-яё0-9]/gi, '_')
            .replace(/_+/g, '_')
            .slice(0, 40);
    },

    addEquipment(name, type, imageUrl, catalogId) {
        var data = this._load();
        var id = this.makeEquipmentId(name, catalogId);
        var existing = data.equipment.find(function(e) { return e.id === id; });
        if (existing) {
            var updated = false;
            if (imageUrl && !existing.imageUrl) { existing.imageUrl = imageUrl; updated = true; }
            if (catalogId && !existing.catalogId) { existing.catalogId = catalogId; updated = true; }
            if (updated) this._save();
            return existing.id;
        }
        var eq = { id: id, name: name, type: type || 'other' };
        if (imageUrl) eq.imageUrl = imageUrl;
        if (catalogId) eq.catalogId = catalogId;
        data.equipment.push(eq);
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

    // Find all exercise IDs with the same name across all days (cached)
    _getSiblingIds(exerciseId) {
        var entries = this.getSiblingExercises(exerciseId);
        return entries.map(function(e) { return e.id; });
    },

    // Find sibling exercises with day info: [{id, day}] (cached)
    getSiblingExercises(exerciseId) {
        if (!this._program || !this._program.dayTemplates) return [];
        if (!this._siblingCache) this._buildSiblingCache();
        return this._siblingCache[exerciseId] || [];
    },

    getExerciseEquipment(exerciseId) {
        var data = this._load();
        var eq = data.exerciseEquipment[exerciseId];
        if (eq === null) return null;        // tombstone: explicitly unbound
        if (eq !== undefined) return eq;     // has a value
        // Key doesn't exist at all — check siblings
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            var sibEq = data.exerciseEquipment[sibs[i]];
            if (sibEq) return sibEq;
            if (sibEq === null) return null; // sibling tombstone counts too
        }
        return null;
    },

    removeExerciseEquipment(exerciseId) {
        var data = this._load();
        // Use null as tombstone so sync doesn't resurrect the deleted binding
        data.exerciseEquipment[exerciseId] = null;
        // Do NOT propagate to siblings — each exercise manages its own equipment
        // Propagate tombstone to gymEquipmentMap for THIS exercise only
        if (data.gymEquipmentMap) {
            for (var gymId in data.gymEquipmentMap) {
                var map = data.gymEquipmentMap[gymId];
                if (exerciseId in map) map[exerciseId] = null;
            }
        }
        this._save();
        // Also patch the rollback snapshot so pull-to-refresh doesn't undo this deletion
        var snap = localStorage.getItem('_wt_eq_snapshot');
        if (snap) {
            try {
                var s = JSON.parse(snap);
                s.exerciseEquipment[exerciseId] = null;
                localStorage.setItem('_wt_eq_snapshot', JSON.stringify(s));
            } catch(e) {}
        }
    },

    // Snapshot equipment state for rollback if no sets completed
    // Persisted to localStorage so it survives app close on mobile
    snapshotEquipment(week, day) {
        var data = this._load();
        var eqCount = Object.keys(data.exerciseEquipment || {}).length;
        localStorage.setItem('_wt_eq_snapshot', JSON.stringify({
            week: week,
            day: day,
            exerciseEquipment: data.exerciseEquipment || {},
            equipment: data.equipment || []
        }));
    },

    rollbackEquipmentIfNoSets() {
        var snap = localStorage.getItem('_wt_eq_snapshot');
        if (!snap) return;
        var s = JSON.parse(snap);
        // Don't rollback if sets were completed for this week/day
        var data = this._load();
        var w = String(s.week), d = String(s.day);
        var hasCompletedSets = data.log && data.log[w] && data.log[w][d] &&
            Object.keys(data.log[w][d]).some(function(exId) {
                if (exId.charAt(0) === '_') return false; // skip metadata
                var sets = data.log[w][d][exId];
                if (typeof sets !== 'object' || sets === null) return false;
                return Object.keys(sets).some(function(si) { return sets[si].completed; });
            });
        if (hasCompletedSets) {
            localStorage.removeItem('_wt_eq_snapshot');
            return;
        }
        data.exerciseEquipment = s.exerciseEquipment;
        data.equipment = s.equipment;
        this._save();
        localStorage.removeItem('_wt_eq_snapshot');
    },

    // Called on app init — rollback any pending snapshot from a previous session
    checkPendingEquipmentRollback() {
        var snap = localStorage.getItem('_wt_eq_snapshot');
        if (snap) this.rollbackEquipmentIfNoSets();
    },

    setExerciseEquipment(exerciseId, equipmentId) {
        var data = this._load();
        data.exerciseEquipment[exerciseId] = equipmentId;
        if (equipmentId) this.linkEquipmentToExercise(exerciseId, equipmentId);
        // Share equipment to sibling OPTIONS (available list) but do NOT override
        // their current assignment — each exercise instance keeps its own equipment
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            if (equipmentId) this.linkEquipmentToExercise(sibs[i], equipmentId);
        }
        this._save();
    },

    getExerciseEquipmentOptions(exerciseId) {
        var data = this._load();
        // Merge options from this exercise and all siblings
        var allIds = [exerciseId].concat(this._getSiblingIds(exerciseId));
        var seen = {};
        var merged = [];
        for (var a = 0; a < allIds.length; a++) {
            var ids = data.exerciseEquipmentOptions[allIds[a]] || [];
            for (var i = 0; i < ids.length; i++) {
                if (!seen[ids[i]]) { seen[ids[i]] = true; merged.push(ids[i]); }
            }
        }
        return merged.map(function(id) { return Storage.getEquipmentById(id); }).filter(Boolean);
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
        // Remove from equipment OPTIONS for this exercise and all siblings
        var allIds = [exerciseId].concat(this._getSiblingIds(exerciseId));
        for (var a = 0; a < allIds.length; a++) {
            if (data.exerciseEquipmentOptions[allIds[a]]) {
                data.exerciseEquipmentOptions[allIds[a]] = data.exerciseEquipmentOptions[allIds[a]].filter(function(eqId) { return eqId !== equipmentId; });
            }
        }
        // Remove assignment only for THIS exercise (not siblings)
        if (data.exerciseEquipment[exerciseId] === equipmentId) {
            data.exerciseEquipment[exerciseId] = null;
        }
        this._save();
    },

    // ===== Gyms (backed by shared_gyms in Supabase) =====
    // _gymCache: array of {id, name, city, ...} from Supabase
    _gymCache: [],

    setGymCache(gyms) {
        this._gymCache = gyms || [];
        // Also update local name cache for offline display
        var data = this._load();
        if (!data._gymNames) data._gymNames = {};
        var changed = false;
        for (var i = 0; i < gyms.length; i++) {
            var g = gyms[i];
            if (!data._gymNames[g.id] || data._gymNames[g.id].name !== g.name) {
                data._gymNames[g.id] = { name: g.name, city: g.city || '' };
                changed = true;
            }
        }
        if (changed) this._save();
    },

    _getGymFromCacheOrLocal(id) {
        // Try Supabase cache first
        for (var i = 0; i < this._gymCache.length; i++) {
            if (this._gymCache[i].id === id) return this._gymCache[i];
        }
        // Fallback to local name cache (for offline display)
        var data = this._load();
        if (data._gymNames && data._gymNames[id]) {
            return { id: id, name: data._gymNames[id].name, city: data._gymNames[id].city || '' };
        }
        return null;
    },

    getGyms() {
        var data = this._load();
        var ids = data.myGymIds || [];
        var lastUsed = data.gymLastUsed || {};
        var result = [];
        for (var i = 0; i < ids.length; i++) {
            var gym = this._getGymFromCacheOrLocal(ids[i]);
            if (gym) {
                result.push({ id: gym.id, name: gym.name, city: gym.city || null, lastUsed: lastUsed[gym.id] || 0 });
            }
        }
        result.sort(function(a, b) { return (b.lastUsed || 0) - (a.lastUsed || 0); });
        return result;
    },

    getGymById(id) {
        if (!id) return null;
        var gym = this._getGymFromCacheOrLocal(id);
        if (!gym) return null;
        var data = this._load();
        return { id: gym.id, name: gym.name, city: gym.city || null, lastUsed: (data.gymLastUsed || {})[id] || 0 };
    },

    addMyGym(sharedGymId) {
        var data = this._load();
        if (!data.myGymIds) data.myGymIds = [];
        if (data.myGymIds.indexOf(sharedGymId) === -1) {
            data.myGymIds.push(sharedGymId);
            if (!data.gymLastUsed) data.gymLastUsed = {};
            data.gymLastUsed[sharedGymId] = Date.now();
            this._save();
        }
        return sharedGymId;
    },

    removeGym(id) {
        var data = this._load();
        data.myGymIds = (data.myGymIds || []).filter(function(gid) { return gid !== id; });
        delete data.gymEquipmentMap[id];
        delete data.gymLastUsed[id];
        this._save();
    },

    touchGym(id) {
        var data = this._load();
        if (!data.gymLastUsed) data.gymLastUsed = {};
        data.gymLastUsed[id] = Date.now();
        this._save();
    },

    // Migration: convert old local gyms to Supabase IDs
    async migrateLocalGyms(Social) {
        var data = this._load();
        if (!data.gyms || !data.gyms.length) return;
        if (!Social) return;
        if (!data.myGymIds) data.myGymIds = [];
        if (!data.gymLastUsed) data.gymLastUsed = {};

        for (var i = 0; i < data.gyms.length; i++) {
            var oldGym = data.gyms[i];
            try {
                var shared = await Social.addSharedGym(oldGym.name, oldGym.city || '');
                if (shared && shared.id) {
                    // Transfer gymEquipmentMap from old ID to new ID
                    if (data.gymEquipmentMap[oldGym.id]) {
                        data.gymEquipmentMap[shared.id] = data.gymEquipmentMap[oldGym.id];
                        delete data.gymEquipmentMap[oldGym.id];
                    }
                    // Transfer lastUsed
                    data.gymLastUsed[shared.id] = oldGym.lastUsed || Date.now();
                    // Save name locally for offline display
                    if (!data._gymNames) data._gymNames = {};
                    data._gymNames[shared.id] = { name: shared.name, city: shared.city || '' };
                    // Add to myGymIds
                    if (data.myGymIds.indexOf(shared.id) === -1) {
                        data.myGymIds.push(shared.id);
                    }
                    // Update workout log references
                    if (data.log) {
                        for (var w in data.log) {
                            for (var d in data.log[w]) {
                                if (data.log[w][d]._gym === oldGym.id) {
                                    data.log[w][d]._gym = shared.id;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Gym migration error:', oldGym.name, e);
            }
        }
        // Clear old gyms array
        data.gyms = [];
        this._save();
        console.log('Gym migration complete, myGymIds:', data.myGymIds);
    },

    getGymExerciseEquipment(gymId, exerciseId) {
        var data = this._load();
        var map = data.gymEquipmentMap[gymId];
        return map ? (map[exerciseId] || null) : null;
    },

    setGymExerciseEquipment(gymId, exerciseId, equipmentId) {
        var data = this._load();
        if (!data.gymEquipmentMap[gymId]) data.gymEquipmentMap[gymId] = {};
        data.gymEquipmentMap[gymId][exerciseId] = equipmentId;
        // Do NOT propagate to siblings — each exercise has its own gym equipment
        this._save();
    },

    copyGymEquipmentMap(fromGymId, toGymId) {
        var data = this._load();
        var map = data.gymEquipmentMap[fromGymId];
        if (!map) return;
        data.gymEquipmentMap[toGymId] = JSON.parse(JSON.stringify(map));
        this._save();
    },

    getGymEquipmentMap(gymId) {
        var data = this._load();
        return data.gymEquipmentMap[gymId] || {};
    },

    gymHasEquipmentMap(gymId) {
        var map = this.getGymEquipmentMap(gymId);
        return Object.keys(map).length > 0;
    },

    applyGymEquipment(gymId) {
        if (!gymId) return;
        var data = this._load();
        var map = data.gymEquipmentMap[gymId];
        if (!map) return;
        // Build valid exercise IDs from current program to filter orphans
        var validExIds = null;
        if (this._program) {
            validExIds = {};
            var all = getAllProgramExercises(this._program);
            for (var i = 0; i < all.length; i++) {
                if (all[i].exercise && all[i].exercise.id) validExIds[all[i].exercise.id] = true;
            }
        }
        for (var exerciseId in map) {
            if (validExIds && !validExIds[exerciseId]) continue; // skip orphan
            var eqId = map[exerciseId];
            if (eqId && this.getEquipmentById(eqId)) {
                data.exerciseEquipment[exerciseId] = eqId;
            } else if (eqId === null) {
                data.exerciseEquipment[exerciseId] = null;
            }
        }
        this._save();
    },

    initGymFromCurrentEquipment(gymId) {
        if (!gymId) return;
        var data = this._load();
        if (!data.gymEquipmentMap[gymId]) data.gymEquipmentMap[gymId] = {};
        // Only copy equipment for exercises that exist in the current program
        var validExIds = null;
        if (this._program) {
            validExIds = {};
            var all = getAllProgramExercises(this._program);
            for (var i = 0; i < all.length; i++) {
                if (all[i].exercise && all[i].exercise.id) validExIds[all[i].exercise.id] = true;
            }
        }
        for (var exId in data.exerciseEquipment) {
            if (validExIds && !validExIds[exId]) continue; // skip orphan
            var eqId = data.exerciseEquipment[exId];
            if (eqId && this.getEquipmentById(eqId)) {
                data.gymEquipmentMap[gymId][exId] = eqId;
            }
        }
        this._save();
    },

    getExerciseUnit(exerciseId) {
        var data = this._load();
        var u = data.exerciseUnits[exerciseId];
        if (u) return u;
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            if (data.exerciseUnits[sibs[i]]) return data.exerciseUnits[sibs[i]];
        }
        return null;
    },

    setExerciseUnit(exerciseId, unit) {
        var data = this._load();
        data.exerciseUnits[exerciseId] = unit;
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            data.exerciseUnits[sibs[i]] = unit;
        }
        this._save();
    },

    // Exercise choices (for choose_one groups)
    // week param makes choices per-week; falls back to global (legacy) choice
    getChoice(groupKey, week) {
        var choices = this._load().exerciseChoices;
        if (week != null) {
            var perWeek = choices[week + ':' + groupKey];
            if (perWeek) return perWeek;
        }
        return choices[groupKey] || null;
    },

    saveChoice(groupKey, exerciseId, week) {
        var key = week != null ? (week + ':' + groupKey) : groupKey;
        this._load().exerciseChoices[key] = exerciseId;
        this._save();
    },

    // Exercise substitutions (display name override)
    getSubstitution(exerciseId) {
        return this._load().exerciseSubstitutions[exerciseId] || null;
    },

    setSubstitution(exerciseId, displayName) {
        this._load().exerciseSubstitutions[exerciseId] = displayName;
        this._invalidateSiblingCache();
        this._save();
    },

    removeSubstitution(exerciseId) {
        delete this._load().exerciseSubstitutions[exerciseId];
        this._invalidateSiblingCache();
        this._save();
    },

    // Unilateral mode (L/R toggle)
    getUnilateral(exerciseId) {
        return !!this._load().unilateralMode[exerciseId];
    },

    setUnilateral(exerciseId, enabled) {
        if (enabled) {
            this._load().unilateralMode[exerciseId] = true;
        } else {
            delete this._load().unilateralMode[exerciseId];
        }
        this._save();
    },

    // Get the effective exercise ID for logging (adds _uni suffix when unilateral)
    getLogExerciseId(exerciseId) {
        return this.getUnilateral(exerciseId) ? exerciseId + '_uni' : exerciseId;
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

    clearWeekLog(week) {
        var data = this._load();
        delete data.log[String(week)];
        this._save();
    },

    getLogDay(week, day) {
        var data = this._load();
        var w = String(week), d = String(day);
        return (data.log[w] && data.log[w][d]) ? data.log[w][d] : null;
    },

    snapshotTemplateInLog(week, day) {
        var p = this.getProgram();
        if (!p) return;

        var data = this._load();
        var w = String(week), d = String(day);
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if ('_template' in data.log[w][d]) return; // idempotent — don't overwrite (respects null tombstone)

        // Capture current live template
        var groups = (p.dayTemplates && p.dayTemplates[day])
            ? p.dayTemplates[day].exerciseGroups : null;
        if (!groups) return;

        data.log[w][d]._template = JSON.parse(JSON.stringify(groups));
        this._save();
    },

    saveSetLog(week, day, exerciseId, setIdx, weight, reps, equipmentId) {
        // Safety net: snapshot template before first set if not yet done
        var w = String(week), d = String(day), s = String(setIdx);
        var data = this._load();
        if (!data.log[w] || !data.log[w][d] || !('_template' in data.log[w][d])) {
            this.snapshotTemplateInLog(week, day);
            this._data = null; // invalidate cache — snapshotTemplateInLog called _save()
            data = this._load();
        }
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (!data.log[w][d][exerciseId]) data.log[w][d][exerciseId] = {};
        var existing = data.log[w][d][exerciseId][s] || {};
        var unit = this.getExerciseUnit(exerciseId) || this.getWeightUnit();
        data.log[w][d][exerciseId][s] = {
            weight: weight,
            reps: reps,
            completed: true,
            timestamp: Date.now(),
            unit: unit
        };
        if (existing.segs) data.log[w][d][exerciseId][s].segs = existing.segs;
        if (equipmentId) data.log[w][d][exerciseId][s].equipmentId = equipmentId;
        this._save();
        // Set completed — equipment is now permanent, clear snapshot
        localStorage.removeItem('_wt_eq_snapshot');
    },

    saveWorkoutGym(week, day, gymId) {
        var data = this._load();
        var w = String(week), d = String(day);
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        if (gymId) {
            data.log[w][d]._gym = gymId;
        } else {
            delete data.log[w][d]._gym;
        }
        this._save();
    },

    getWorkoutGym(week, day) {
        var data = this._load();
        var dayLog = data.log && data.log[String(week)] && data.log[String(week)][String(day)];
        return dayLog && dayLog._gym || null;
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
            if (current.segs) data.log[w][d][exerciseId][s].segs = current.segs;
            if (equipmentId) data.log[w][d][exerciseId][s].equipmentId = equipmentId;
            this._save();
            // Set completed — equipment is now permanent, clear snapshot
            localStorage.removeItem('_wt_eq_snapshot');
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
        var v = parseReps(value);
        if (segIdx === 0) { this.updateSetValue(week, day, exerciseId, setIdx, 'reps', v); return; }
        var r = this._ensureSegEntry(week, day, exerciseId, setIdx, segIdx);
        r.entry.segs[r.si].reps = v;
        r.entry.timestamp = Date.now();
        this._save();
    },

    saveSegWeight(week, day, exerciseId, setIdx, segIdx, value) {
        var v = parseWeight(value);
        if (segIdx === 0) { this.updateSetValue(week, day, exerciseId, setIdx, 'weight', v); return; }
        var r = this._ensureSegEntry(week, day, exerciseId, setIdx, segIdx);
        r.entry.segs[r.si].weight = v;
        r.entry.timestamp = Date.now();
        this._save();
    },

    getPreviousLog(week, day, exerciseId, setIdx, equipmentId, siblings) {
        // exerciseId may have _uni suffix (logExId); extract base for uniform handling
        var isUni = exerciseId.endsWith('_uni');
        var baseExId = isUni ? exerciseId.slice(0, -4) : exerciseId;

        // Collect all entries with BASE ids (logId computed below)
        var allEntries = [{ id: baseExId, day: day }];
        if (siblings && siblings.length > 0) {
            for (var si = 0; si < siblings.length; si++) {
                allEntries.push({ id: siblings[si].id, day: siblings[si].day });
            }
        }

        var bestResult = null;
        var bestTime = 0;

        // Single pass: all weeks × all entries, find most recent by timestamp
        for (var w = week; w >= 1; w--) {
            for (var ei = 0; ei < allEntries.length; ei++) {
                var entry = allEntries[ei];
                // Skip current session (same week + same day + same exercise)
                if (w === week && entry.day === day && entry.id === baseExId) continue;
                // Skip future days in current week
                if (w === week && entry.day > day) continue;

                var logId = isUni ? entry.id + '_uni' : entry.id;
                var log = this.getSetLog(w, entry.day, logId, setIdx);
                if (!log || !log.completed) continue;
                if (equipmentId && log.equipmentId !== equipmentId) continue;

                var ts = log.timestamp || 0;
                if (ts > bestTime) {
                    bestResult = log;
                    bestTime = ts;
                }
            }
        }

        return bestResult;
    },

    getExerciseHistory(exerciseId) {
        var data = this._load();
        var history = [];
        var p = this._program;
        var totalWeeks = p ? p.totalWeeks : 12;
        var totalDays = p ? Object.keys(p.dayTemplates).length : 5;
        // Strip _uni suffix for sibling lookup — cache only has base IDs
        var baseExId = exerciseId.endsWith('_uni') ? exerciseId.slice(0, -4) : exerciseId;
        var sibIds = this._getSiblingIds(baseExId);
        // Include both bilateral and unilateral log keys
        var baseIds = [baseExId].concat(sibIds);
        var allIds = [];
        for (var bi = 0; bi < baseIds.length; bi++) {
            allIds.push(baseIds[bi]);
            allIds.push(baseIds[bi] + '_uni');
        }
        for (var week = 1; week <= totalWeeks; week++) {
            var w = String(week);
            if (!data.log[w]) continue;
            for (var day = 1; day <= totalDays; day++) {
                var d = String(day);
                if (!data.log[w] || !data.log[w][d]) continue;
                var sets = [];
                for (var ai = 0; ai < allIds.length; ai++) {
                    var id = allIds[ai];
                    if (!data.log[w][d][id]) continue;
                    var isUni = id.endsWith('_uni');
                    for (var [setIdx, setData] of Object.entries(data.log[w][d][id])) {
                        if (setData.completed) {
                            sets.push({
                                setIdx: parseInt(setIdx),
                                weight: setData.weight,
                                reps: setData.reps,
                                timestamp: setData.timestamp,
                                equipmentId: setData.equipmentId || null,
                                uni: isUni
                            });
                        }
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
        // Prefer explicit finish timestamp (set when "Завершить тренировку" is pressed)
        if (data.log[w][d]._finishedAt) return data.log[w][d]._finishedAt;
        // Fallback: max timestamp from completed sets
        var maxTs = 0;
        for (var exId of Object.keys(data.log[w][d])) {
            if (exId.charAt(0) === '_') continue; // skip metadata like _gym
            var exData = data.log[w][d][exId];
            if (typeof exData !== 'object' || exData === null) continue;
            for (var setData of Object.values(exData)) {
                if (setData && setData.completed && setData.timestamp > maxTs) maxTs = setData.timestamp;
            }
        }
        return maxTs > 0 ? maxTs : null;
    },

    setFinishedAt(week, day) {
        var data = this._load();
        var w = String(week), d = String(day);
        if (!data.log[w]) data.log[w] = {};
        if (!data.log[w][d]) data.log[w][d] = {};
        data.log[w][d]._finishedAt = Date.now();
        this._save();
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
