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
            if (!this._data.exerciseSubstitutions) this._data.exerciseSubstitutions = {};
            if (!this._data.gyms) this._data.gyms = [];
            if (!this._data.gymEquipmentMap) this._data.gymEquipmentMap = {};
            if (!this._data.exerciseEquipmentOptions) {
                this._data.exerciseEquipmentOptions = {};
                // Auto-migrate: link currently assigned equipment to their exercises
                for (const [exId, eqId] of Object.entries(this._data.exerciseEquipment)) {
                    if (eqId) this._data.exerciseEquipmentOptions[exId] = [eqId];
                }
                this._save();
            }
            // v431: migrate exercise names to Hevy DB standard
            if (!this._data._exerciseNamesMigrated) {
                this._migrateExerciseNames();
                this._data._exerciseNamesMigrated = true;
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
            if (typeof SupaSync !== 'undefined') SupaSync.onLocalSave();
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
    createSelfRegisteredUser(name, login, password, email, customId) {
        var users = this.getUsers();
        var id = customId || ('user_' + Date.now());
        users.push({ id: id, name: name, login: login, password: password, email: email || '', programId: null, selfRegistered: true, createdAt: Date.now() });
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
        if (typeof ACCOUNTS !== 'undefined') {
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

    // v431: rename exercises to Hevy DB standard names
    _migrateExerciseNames() {
        var MAP = {
            'Stiff legged deadlift': ['Straight Leg Deadlift', '\u0421\u0442\u0430\u043D\u043E\u0432\u0430\u044F \u0442\u044F\u0433\u0430 \u043D\u0430 \u043F\u0440\u044F\u043C\u044B\u0445 \u043D\u043E\u0433\u0430\u0445'],
            'Dumbell stiff legged deadlift': ['Straight Leg Deadlift', '\u0421\u0442\u0430\u043D\u043E\u0432\u0430\u044F \u0442\u044F\u0433\u0430 \u043D\u0430 \u043F\u0440\u044F\u043C\u044B\u0445 \u043D\u043E\u0433\u0430\u0445'],
            'Smith deadlift': ['Deadlift (Smith Machine)', '\u0421\u0442\u0430\u043D\u043E\u0432\u0430\u044F \u0442\u044F\u0433\u0430 (\u0432 \u0421\u043C\u0438\u0442\u0435)'],
            'Romanian deadlift machine': ['Romanian Deadlift (Barbell)', '\u0420\u0443\u043C\u044B\u043D\u0441\u043A\u0430\u044F \u0442\u044F\u0433\u0430 (\u0441\u043E \u0448\u0442\u0430\u043D\u0433\u043E\u0439)'],
            'Seated leg curl': ['Seated Leg Curl (Machine)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u043E\u0433 \u0441\u0438\u0434\u044F (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Lying leg curl': ['Lying Leg Curl (Machine)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u043E\u0433 \u043B\u0451\u0436\u0430 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Glute split squat': ['Bulgarian Split Squat', '\u0411\u043E\u043B\u0433\u0430\u0440\u0441\u043A\u0438\u0435 \u0432\u044B\u043F\u0430\u0434\u044B'],
            'Glute kickback machine': ['Glute Kickback (Machine)', '\u041E\u0442\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433\u0438 \u043D\u0430\u0437\u0430\u0434 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Calf raises machine': ['Standing Calf Raise (Machine)', '\u041F\u043E\u0434\u044A\u0451\u043C \u043D\u0430 \u043D\u043E\u0441\u043A\u0438 \u0441\u0442\u043E\u044F (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Supported row': ['Chest Supported Incline Row (Dumbbell)', '\u0422\u044F\u0433\u0430 \u0433\u0430\u043D\u0442\u0435\u043B\u0435\u0439 \u043D\u0430 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E\u0439 \u0441\u043A\u0430\u043C\u044C\u0435 \u0441 \u043E\u043F\u043E\u0440\u043E\u0439'],
            'T-bar supported row': ['T Bar Row', '\u0422\u044F\u0433\u0430 \u0422-\u0433\u0440\u0438\u0444\u0430'],
            'Incline dumbbell rows': ['Chest Supported Incline Row (Dumbbell)', '\u0422\u044F\u0433\u0430 \u0433\u0430\u043D\u0442\u0435\u043B\u0435\u0439 \u043D\u0430 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E\u0439 \u0441\u043A\u0430\u043C\u044C\u0435 \u0441 \u043E\u043F\u043E\u0440\u043E\u0439'],
            'Incline dumbell rows': ['Chest Supported Incline Row (Dumbbell)', '\u0422\u044F\u0433\u0430 \u0433\u0430\u043D\u0442\u0435\u043B\u0435\u0439 \u043D\u0430 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E\u0439 \u0441\u043A\u0430\u043C\u044C\u0435 \u0441 \u043E\u043F\u043E\u0440\u043E\u0439'],
            'Close grip pulldown': ['Lat Pulldown - Close Grip (Cable)', '\u0422\u044F\u0433\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u043B\u043E\u043A\u0430 \u0443\u0437\u043A\u0438\u043C \u0445\u0432\u0430\u0442\u043E\u043C (\u0431\u043B\u043E\u043A)'],
            'Dorian row': ['Bent Over Row (Barbell)', '\u0422\u044F\u0433\u0430 \u0448\u0442\u0430\u043D\u0433\u0438 \u0432 \u043D\u0430\u043A\u043B\u043E\u043D\u0435'],
            'Single arm cable row': ['Single Arm Cable Row', '\u0422\u044F\u0433\u0430 \u043D\u0438\u0436\u043D\u0435\u0433\u043E \u0431\u043B\u043E\u043A\u0430 \u043E\u0434\u043D\u043E\u0439 \u0440\u0443\u043A\u043E\u0439'],
            'Hammer single arm low row': ['Iso-Lateral Low Row', '\u0422\u044F\u0433\u0430 \u0440\u044B\u0447\u0430\u0436\u043D\u0430\u044F \u043D\u0438\u0436\u043D\u044F\u044F'],
            'Single arm hammer high row': ['Iso-Lateral High Row (Machine)', '\u0422\u044F\u0433\u0430 \u0440\u044B\u0447\u0430\u0436\u043D\u0430\u044F \u0432\u0435\u0440\u0445\u043D\u044F\u044F (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Single arm pulldown': ['Single Arm Lat Pulldown', '\u0422\u044F\u0433\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u043B\u043E\u043A\u0430 \u043E\u0434\u043D\u043E\u0439 \u0440\u0443\u043A\u043E\u0439'],
            'Unilateral pulldown machine': ['Lat Pulldown (Machine)', '\u0422\u044F\u0433\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u043B\u043E\u043A\u0430 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Hammer high row': ['Iso-Lateral High Row (Machine)', '\u0422\u044F\u0433\u0430 \u0440\u044B\u0447\u0430\u0436\u043D\u0430\u044F \u0432\u0435\u0440\u0445\u043D\u044F\u044F (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Hammer low row': ['Iso-Lateral Low Row', '\u0422\u044F\u0433\u0430 \u0440\u044B\u0447\u0430\u0436\u043D\u0430\u044F \u043D\u0438\u0436\u043D\u044F\u044F'],
            'Inclined bench dumbell swings': ['Rear Delt Reverse Fly (Dumbbell)', '\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0440\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u044F (\u0441 \u0433\u0430\u043D\u0442\u0435\u043B\u044F\u043C\u0438)'],
            'Fly machine / Cable rear delt fly': ['Rear Delt Reverse Fly (Cable)', '\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0440\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u044F (\u0431\u043B\u043E\u043A)'],
            'Fly machine / cable rear delt fly': ['Rear Delt Reverse Fly (Cable)', '\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0440\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u044F (\u0431\u043B\u043E\u043A)'],
            'Fly machine / standing cable rear delt fly': ['Rear Delt Reverse Fly (Cable)', '\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0440\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u044F (\u0431\u043B\u043E\u043A)'],
            'Abductor machine': ['Hip Abduction (Machine)', '\u0420\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Abductor machine - WARMUP': ['Hip Abduction (Machine)', '\u0420\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Abductor machine (warm-up)': ['Hip Abduction (Machine)', '\u0420\u0430\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Adductor machine': ['Hip Adduction (Machine)', '\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Adductor machine (warm-up)': ['Hip Adduction (Machine)', '\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Hip thrust machine': ['Hip Thrust (Machine)', '\u042F\u0433\u043E\u0434\u0438\u0447\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Unilateral hip thrust machine': ['Hip Thrust (Machine)', '\u042F\u0433\u043E\u0434\u0438\u0447\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Barbell hip thrust': ['Hip Thrust (Barbell)', '\u042F\u0433\u043E\u0434\u0438\u0447\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 (\u0441\u043E \u0448\u0442\u0430\u043D\u0433\u043E\u0439)'],
            'Single leg press': ['Single Leg Press (Machine)', '\u0416\u0438\u043C \u043D\u043E\u0433\u043E\u0439 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Leg extension': ['Leg Extension (Machine)', '\u0420\u0430\u0437\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Unilateral leg extension': ['Leg Extension (Machine)', '\u0420\u0430\u0437\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u043E\u0433 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Machine shoulder press': ['Shoulder Press (Machine Plates)', '\u0416\u0438\u043C \u043F\u043B\u0435\u0447\u0430\u043C\u0438 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435, \u0434\u0438\u0441\u043A\u0438)'],
            'Lateral raise machine': ['Lateral Raise (Machine)', '\u041F\u043E\u0434\u044A\u0451\u043C \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u044B (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Seated dumbell lateral raises': ['Seated Lateral Raise (Dumbbell)', '\u041F\u043E\u0434\u044A\u0451\u043C \u0433\u0430\u043D\u0442\u0435\u043B\u0435\u0439 \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u0441\u0438\u0434\u044F'],
            'Standing lateral dumbell raises': ['Lateral Raise (Dumbbell)', '\u041F\u043E\u0434\u044A\u0451\u043C \u0433\u0430\u043D\u0442\u0435\u043B\u0435\u0439 \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u044B'],
            'Machine chest press': ['Chest Press (Machine)', '\u0416\u0438\u043C \u043E\u0442 \u0433\u0440\u0443\u0434\u0438 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Convergence chest press': ['Iso-Lateral Chest Press (Machine)', '\u0416\u0438\u043C \u043E\u0442 \u0433\u0440\u0443\u0434\u0438 \u0438\u0437\u043E\u043B\u0430\u0442\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Incline dumbell press': ['Incline Bench Press (Dumbbell)', '\u0416\u0438\u043C \u043B\u0451\u0436\u0430 \u043D\u0430 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E\u0439 (\u0441 \u0433\u0430\u043D\u0442\u0435\u043B\u044F\u043C\u0438)'],
            'Incline bench press (Smith)': ['Incline Bench Press (Smith Machine)', '\u0416\u0438\u043C \u043B\u0451\u0436\u0430 \u043D\u0430 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E\u0439 (\u0432 \u0421\u043C\u0438\u0442\u0435)'],
            'Low cable crossover': ['Low Cable Fly Crossovers', '\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0440\u0443\u043A \u0432 \u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440\u0435 \u0441\u043D\u0438\u0437\u0443'],
            'Dip machine for chest': ['Chest Dip', '\u041E\u0442\u0436\u0438\u043C\u0430\u043D\u0438\u044F \u043D\u0430 \u0431\u0440\u0443\u0441\u044C\u044F\u0445 (\u0433\u0440\u0443\u0434\u044C)'],
            'Machine fly': ['Chest Fly (Machine)', '\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0440\u0443\u043A (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Unilateral machine fly': ['Chest Fly (Machine)', '\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0440\u0443\u043A (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Seated pec flys': ['Seated Chest Flys (Cable)', '\u0421\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u0440\u0443\u043A \u0441\u0438\u0434\u044F (\u0431\u043B\u043E\u043A)'],
            'Overhead triceps extension': ['Overhead Triceps Extension (Cable)', '\u0420\u0430\u0437\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u0440\u0443\u043A \u043D\u0430\u0434 \u0433\u043E\u043B\u043E\u0432\u043E\u0439 (\u0431\u043B\u043E\u043A)'],
            'Dual rope cable extension': ['Triceps Extension (Cable)', '\u0420\u0430\u0437\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u0430 \u0442\u0440\u0438\u0446\u0435\u043F\u0441 (\u0431\u043B\u043E\u043A)'],
            'Incline skull crushers': ['Skullcrusher (Dumbbell)', '\u0424\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438\u0439 \u0436\u0438\u043C (\u0441 \u0433\u0430\u043D\u0442\u0435\u043B\u044F\u043C\u0438)'],
            'Dumbell single arm preacher curl': ['Preacher Curl (Dumbbell)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u0430 \u0441\u043A\u0430\u043C\u044C\u0435 \u0421\u043A\u043E\u0442\u0442\u0430 (\u0441 \u0433\u0430\u043D\u0442\u0435\u043B\u044F\u043C\u0438)'],
            'Seated dumbell curl': ['Seated Incline Curl (Dumbbell)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u0440\u0443\u043A \u0441\u0438\u0434\u044F \u043D\u0430 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E\u0439 (\u0441 \u0433\u0430\u043D\u0442\u0435\u043B\u044F\u043C\u0438)'],
            'Preacher curls': ['Preacher Curl (Dumbbell)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u0430 \u0441\u043A\u0430\u043C\u044C\u0435 \u0421\u043A\u043E\u0442\u0442\u0430 (\u0441 \u0433\u0430\u043D\u0442\u0435\u043B\u044F\u043C\u0438)'],
            'Glute cable kickbacks': ['Standing Cable Glute Kickbacks', '\u041E\u0442\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433\u0438 \u043D\u0430\u0437\u0430\u0434 (\u0431\u043B\u043E\u043A) \u0441\u0442\u043E\u044F'],
            'High cable glute kickbacks': ['Standing Cable Glute Kickbacks', '\u041E\u0442\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043D\u043E\u0433\u0438 \u043D\u0430\u0437\u0430\u0434 (\u0431\u043B\u043E\u043A) \u0441\u0442\u043E\u044F'],
            'Unilateral seated leg curl': ['Seated Leg Curl (Machine)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u043E\u0433 \u0441\u0438\u0434\u044F (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Pendulum squat': ['Pendulum Squat (Machine)', '\u041C\u0430\u044F\u0442\u043D\u0438\u043A\u043E\u0432\u044B\u0439 \u043F\u0440\u0438\u0441\u0435\u0434 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Reverse banded hack squat': ['Hack Squat (Machine)', '\u0413\u0430\u043A\u043A-\u043F\u0440\u0438\u0441\u0435\u0434 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Smith squat': ['Squat (Smith Machine)', '\u041F\u0440\u0438\u0441\u0435\u0434 (\u0432 \u0421\u043C\u0438\u0442\u0435)'],
            '45\u00b0 leg press': ['Leg Press (Machine)', '\u0416\u0438\u043C \u043D\u043E\u0433\u0430\u043C\u0438 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Push-ups': ['Push Up', '\u041E\u0442\u0436\u0438\u043C\u0430\u043D\u0438\u044F'],
            'Single leg curl': ['Lying Leg Curl (Machine)', '\u0421\u0433\u0438\u0431\u0430\u043D\u0438\u0435 \u043D\u043E\u0433 \u043B\u0451\u0436\u0430 (\u0432 \u0442\u0440\u0435\u043D\u0430\u0436\u0451\u0440\u0435)'],
            'Single leg step up': ['Step Up', '\u0417\u0430\u0448\u0430\u0433\u0438\u0432\u0430\u043D\u0438\u044F']
        };
        // v419: also fix wrong Russian names (nameRu) when English name is already correct
        var RU_MAP = {
            'Мёртвая тяга со штангой': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах'],
            'Мёртвая тяга с гантелями': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах'],
            'Мёртвая тяга в Смите': ['Deadlift (Smith Machine)', 'Становая тяга (в Смите)'],
            'Румынская тяга в тренажёре': ['Romanian Deadlift (Barbell)', 'Румынская тяга (со штангой)']
        };
        var d = this._data;
        if (!d || !d.program || !d.program.days) return;
        var count = 0;
        d.program.days.forEach(function(day) {
            if (!day.groups) return;
            day.groups.forEach(function(g) {
                var exList = [];
                if (g.type === 'single' && g.exercise) exList.push(g.exercise);
                if (g.type === 'superset' && g.exercises) exList = exList.concat(g.exercises);
                if (g.type === 'choose_one' && g.options) exList = exList.concat(g.options);
                exList.forEach(function(ex) {
                    if (!ex) return;
                    // Check by English name
                    var m = MAP[ex.name];
                    if (m) { ex.name = m[0]; ex.nameRu = m[1]; count++; }
                    // Check by Russian name
                    if (!m && ex.nameRu) {
                        var mr = RU_MAP[ex.nameRu];
                        if (mr) { ex.name = mr[0]; ex.nameRu = mr[1]; count++; }
                    }
                    // Check nested options (choose_one inside superset)
                    if (ex.options) {
                        ex.options.forEach(function(opt) {
                            var m2 = MAP[opt.name];
                            if (m2) { opt.name = m2[0]; opt.nameRu = m2[1]; count++; }
                            if (!m2 && opt.nameRu) {
                                var mr2 = RU_MAP[opt.nameRu];
                                if (mr2) { opt.name = mr2[0]; opt.nameRu = mr2[1]; count++; }
                            }
                        });
                    }
                });
            });
        });
        if (count > 0) console.log('Migrated ' + count + ' exercise names to Hevy DB standard');
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

    // Find all exercise IDs with the same name across all days
    _getSiblingIds(exerciseId) {
        if (!PROGRAM || !PROGRAM.dayTemplates) return [];
        var name = null;
        // Find this exercise's name
        for (var dNum in PROGRAM.dayTemplates) {
            var groups = PROGRAM.dayTemplates[dNum].exerciseGroups || [];
            for (var g = 0; g < groups.length; g++) {
                var gr = groups[g];
                if (gr.exercise && gr.exercise.id === exerciseId) { name = gr.exercise.nameRu || gr.exercise.name; break; }
                if (gr.options) { for (var o = 0; o < gr.options.length; o++) { if (gr.options[o].id === exerciseId) { name = gr.options[o].nameRu || gr.options[o].name; break; } } }
                if (gr.exercises) { for (var s = 0; s < gr.exercises.length; s++) { var se = gr.exercises[s].exercise || gr.exercises[s]; if (se.id === exerciseId) { name = se.nameRu || se.name; break; } } }
                if (name) break;
            }
            if (name) break;
        }
        if (!name) return [];
        // Collect all IDs with same name
        var ids = [];
        for (var dNum in PROGRAM.dayTemplates) {
            var groups = PROGRAM.dayTemplates[dNum].exerciseGroups || [];
            for (var g = 0; g < groups.length; g++) {
                var gr = groups[g];
                if (gr.exercise && (gr.exercise.nameRu === name || gr.exercise.name === name) && gr.exercise.id !== exerciseId) ids.push(gr.exercise.id);
                if (gr.options) { for (var o = 0; o < gr.options.length; o++) { var opt = gr.options[o]; if ((opt.nameRu === name || opt.name === name) && opt.id !== exerciseId) ids.push(opt.id); } }
                if (gr.exercises) { for (var s = 0; s < gr.exercises.length; s++) { var se = gr.exercises[s].exercise || gr.exercises[s]; if ((se.nameRu === name || se.name === name) && se.id !== exerciseId) ids.push(se.id); } }
            }
        }
        return ids;
    },

    getExerciseEquipment(exerciseId) {
        var data = this._load();
        var eq = data.exerciseEquipment[exerciseId];
        if (eq) return eq;
        // Check siblings
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            if (data.exerciseEquipment[sibs[i]]) return data.exerciseEquipment[sibs[i]];
        }
        return null;
    },

    setExerciseEquipment(exerciseId, equipmentId) {
        var data = this._load();
        data.exerciseEquipment[exerciseId] = equipmentId;
        if (equipmentId) this.linkEquipmentToExercise(exerciseId, equipmentId);
        // Apply to siblings
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            data.exerciseEquipment[sibs[i]] = equipmentId;
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
        // Unlink from this exercise and all siblings
        var allIds = [exerciseId].concat(this._getSiblingIds(exerciseId));
        for (var a = 0; a < allIds.length; a++) {
            var id = allIds[a];
            if (data.exerciseEquipmentOptions[id]) {
                data.exerciseEquipmentOptions[id] = data.exerciseEquipmentOptions[id].filter(function(eqId) { return eqId !== equipmentId; });
            }
            if (data.exerciseEquipment[id] === equipmentId) {
                data.exerciseEquipment[id] = null;
            }
        }
        this._save();
    },

    // ===== Gyms =====
    getGyms() {
        var data = this._load();
        return (data.gyms || []).slice().sort(function(a, b) { return (b.lastUsed || 0) - (a.lastUsed || 0); });
    },

    getGymById(id) {
        if (!id) return null;
        return (this._load().gyms || []).find(function(g) { return g.id === id; }) || null;
    },

    addGym(name, lat, lng, city) {
        var data = this._load();
        var id = 'gym_' + Date.now();
        data.gyms.push({ id: id, name: name, lat: lat || null, lng: lng || null, city: city || null, lastUsed: Date.now() });
        this._save();
        return id;
    },

    removeGym(id) {
        var data = this._load();
        data.gyms = data.gyms.filter(function(g) { return g.id !== id; });
        delete data.gymEquipmentMap[id];
        this._save();
    },

    renameGym(id, newName) {
        var data = this._load();
        var gym = data.gyms.find(function(g) { return g.id === id; });
        if (gym) { gym.name = newName; this._save(); }
    },

    touchGym(id) {
        var data = this._load();
        var gym = data.gyms.find(function(g) { return g.id === id; });
        if (gym) { gym.lastUsed = Date.now(); this._save(); }
    },

    updateGymCoords(id, lat, lng) {
        var data = this._load();
        var gym = data.gyms.find(function(g) { return g.id === id; });
        if (gym) { gym.lat = lat; gym.lng = lng; this._save(); }
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
        var sibs = this._getSiblingIds(exerciseId);
        for (var i = 0; i < sibs.length; i++) {
            data.gymEquipmentMap[gymId][sibs[i]] = equipmentId;
        }
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
        for (var exerciseId in map) {
            var eqId = map[exerciseId];
            if (eqId && this.getEquipmentById(eqId)) {
                data.exerciseEquipment[exerciseId] = eqId;
            }
        }
        this._save();
    },

    initGymFromCurrentEquipment(gymId) {
        if (!gymId) return;
        var data = this._load();
        if (!data.gymEquipmentMap[gymId]) data.gymEquipmentMap[gymId] = {};
        for (var exId in data.exerciseEquipment) {
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
    getChoice(groupKey) {
        return this._load().exerciseChoices[groupKey] || null;
    },

    saveChoice(groupKey, exerciseId) {
        this._load().exerciseChoices[groupKey] = exerciseId;
        this._save();
    },

    // Exercise substitutions (display name override)
    getSubstitution(exerciseId) {
        return this._load().exerciseSubstitutions[exerciseId] || null;
    },

    setSubstitution(exerciseId, displayName) {
        this._load().exerciseSubstitutions[exerciseId] = displayName;
        this._save();
    },

    removeSubstitution(exerciseId) {
        delete this._load().exerciseSubstitutions[exerciseId];
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

    clearWeekLog(week) {
        var data = this._load();
        delete data.log[String(week)];
        this._save();
    },

    saveSetLog(week, day, exerciseId, setIdx, weight, reps, equipmentId) {
        var data = this._load();
        var w = String(week), d = String(day), s = String(setIdx);
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
        var v = parseInt(value) || 0;
        if (segIdx === 0) { this.updateSetValue(week, day, exerciseId, setIdx, 'reps', v); return; }
        var r = this._ensureSegEntry(week, day, exerciseId, setIdx, segIdx);
        r.entry.segs[r.si].reps = v;
        r.entry.timestamp = Date.now();
        this._save();
    },

    saveSegWeight(week, day, exerciseId, setIdx, segIdx, value) {
        var v = parseFloat(String(value).replace(',', '.')) || 0;
        if (segIdx === 0) { this.updateSetValue(week, day, exerciseId, setIdx, 'weight', v); return; }
        var r = this._ensureSegEntry(week, day, exerciseId, setIdx, segIdx);
        r.entry.segs[r.si].weight = v;
        r.entry.timestamp = Date.now();
        this._save();
    },

    getPreviousLog(week, day, exerciseId, setIdx, equipmentId, siblings) {
        // Standard: same exerciseId, same day, previous weeks
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
        // Fallback: search sibling exercises (same name, different day)
        // No equipment filter — different days may use different machines
        if (siblings && siblings.length > 0) {
            var best = null, bestTime = 0;
            for (var w = week; w >= 1; w--) {
                for (var si = 0; si < siblings.length; si++) {
                    var sib = siblings[si];
                    // Skip future/current day in current week
                    if (w === week && sib.day >= day) continue;
                    var log = this.getSetLog(w, sib.day, sib.id, setIdx);
                    if (log && log.completed && log.timestamp > bestTime) {
                        best = log;
                        bestTime = log.timestamp;
                    }
                }
            }
            if (best) return best;
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
                if (setData && setData.completed && setData.timestamp > maxTs) maxTs = setData.timestamp;
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
