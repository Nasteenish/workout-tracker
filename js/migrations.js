/* ===== Data Migrations ===== */
import { Storage } from './storage.js';
import { EXERCISE_DB } from './exercises_db.js';
import { getAllProgramExercises } from './utils.js';

// Consolidated name migration map: oldName → [newName, newNameRu]
// Merged from MAP (English old names) + RU_MAP (Russian old names)
var _NAME_MAP = {
    // English old names → Hevy DB standard
    'Stiff legged deadlift': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах (со штангой)'],
    'Dumbell stiff legged deadlift': ['Straight Leg Deadlift (Dumbbell)', 'Становая тяга на прямых ногах (с гантелями)'],
    'Smith deadlift': ['Deadlift (Smith Machine)', 'Становая тяга (в Смите)'],
    'Romanian deadlift machine': ['Romanian Deadlift (Machine)', 'Румынская тяга (в тренажёре)'],
    'Seated leg curl': ['Seated Leg Curl (Machine)', 'Сгибание ног сидя (в тренажёре)'],
    'Lying leg curl': ['Lying Leg Curl (Machine)', 'Сгибание ног лёжа (в тренажёре)'],
    'Glute split squat': ['Bulgarian Split Squat (Dumbbell)', 'Болгарские сплит-приседания (с гантелями)'],
    'Glute kickback machine': ['Glute Kickback (Machine)', 'Кикбек (в тренажёре)'],
    'Glute Kickback (Machine)': ['Glute Kickback (Machine)', 'Кикбек (в тренажёре)'],
    'Отведение ноги назад (в тренажёре)': ['Glute Kickback (Machine)', 'Кикбек (в тренажёре)'],
    'Calf raises machine': ['Standing Calf Raise (Machine)', 'Подъём на носки стоя (в тренажёре)'],
    'Supported row': ['Chest Supported Incline Row (Dumbbell)', 'Тяга гантелей на наклонной скамье с опорой'],
    'T-bar supported row': ['T Bar Row', 'Тяга Т-грифа'],
    'Incline dumbbell rows': ['Chest Supported Incline Row (Dumbbell)', 'Тяга гантелей на наклонной скамье с опорой'],
    'Incline dumbell rows': ['Chest Supported Incline Row (Dumbbell)', 'Тяга гантелей на наклонной скамье с опорой'],
    'Close grip pulldown': ['Lat Pulldown - Close Grip (Cable)', 'Тяга верхнего блока узким хватом (блок)'],
    'Dorian row': ['Bent Over Row (Barbell)', 'Тяга штанги в наклоне'],
    'Single arm cable row': ['Single Arm Cable Row', 'Тяга нижнего блока одной рукой'],
    'Hammer single arm low row': ['Iso-Lateral Low Row', 'Тяга рычажная нижняя'],
    'Single arm hammer high row': ['Iso-Lateral High Row (Machine)', 'Тяга рычажная верхняя (в тренажёре)'],
    'Single arm pulldown': ['Single Arm Lat Pulldown', 'Тяга верхнего блока одной рукой'],
    'Unilateral pulldown machine': ['Lat Pulldown (Machine)', 'Тяга верхнего блока (в тренажёре)'],
    'Hammer high row': ['Iso-Lateral High Row (Machine)', 'Тяга рычажная верхняя (в тренажёре)'],
    'Hammer low row': ['Iso-Lateral Low Row', 'Тяга рычажная нижняя'],
    'Inclined bench dumbell swings': ['Rear Delt Reverse Fly (Dumbbell)', 'Обратные разведения (с гантелями)'],
    'Fly machine / Cable rear delt fly': ['Rear Delt Reverse Fly (Cable)', 'Обратные разведения (блок)'],
    'Fly machine / cable rear delt fly': ['Rear Delt Reverse Fly (Cable)', 'Обратные разведения (блок)'],
    'Fly machine / standing cable rear delt fly': ['Rear Delt Reverse Fly (Cable)', 'Обратные разведения (блок)'],
    'Abductor machine': ['Hip Abduction (Machine)', 'Разведение ног (в тренажёре)'],
    'Abductor machine - WARMUP': ['Hip Abduction (Machine)', 'Разведение ног (в тренажёре)'],
    'Abductor machine (warm-up)': ['Hip Abduction (Machine)', 'Разведение ног (в тренажёре)'],
    'Adductor machine': ['Hip Adduction (Machine)', 'Сведение ног (в тренажёре)'],
    'Adductor machine (warm-up)': ['Hip Adduction (Machine)', 'Сведение ног (в тренажёре)'],
    'Hip thrust machine': ['Hip Thrust (Machine)', 'Ягодичный мост (в тренажёре)'],
    'Unilateral hip thrust machine': ['Hip Thrust (Machine)', 'Ягодичный мост (в тренажёре)'],
    'Barbell hip thrust': ['Hip Thrust (Barbell)', 'Ягодичный мост (со штангой)'],
    'Single leg press': ['Leg Press (Machine)', 'Жим ногами (в тренажёре)'],
    'Жим ногой (в тренажёре)': ['Leg Press (Machine)', 'Жим ногами (в тренажёре)'],
    'Leg extension': ['Leg Extension (Machine)', 'Разгибание ног (в тренажёре)'],
    'Unilateral leg extension': ['Leg Extension (Machine)', 'Разгибание ног (в тренажёре)'],
    'Machine shoulder press': ['Shoulder Press (Machine Plates)', 'Жим плечами (в тренажёре, диски)'],
    'Lateral raise machine': ['Lateral Raise (Machine)', 'Подъём в стороны (в тренажёре)'],
    'Seated dumbell lateral raises': ['Seated Lateral Raise (Dumbbell)', 'Подъём гантелей в стороны сидя'],
    'Standing lateral dumbell raises': ['Lateral Raise (Dumbbell)', 'Подъём гантелей в стороны'],
    'Machine chest press': ['Chest Press (Machine)', 'Жим от груди (в тренажёре)'],
    'Convergence chest press': ['Iso-Lateral Chest Press (Machine)', 'Жим от груди изолатеральный (в тренажёре)'],
    'Incline dumbell press': ['Incline Bench Press (Dumbbell)', 'Жим лёжа на наклонной (с гантелями)'],
    'Incline bench press (Smith)': ['Incline Bench Press (Smith Machine)', 'Жим лёжа на наклонной (в Смите)'],
    'Low cable crossover': ['Low Cable Fly Crossovers', 'Сведение рук в кроссовере снизу'],
    'Dip machine for chest': ['Chest Dip', 'Отжимания на брусьях (грудь)'],
    'Machine fly': ['Chest Fly (Machine)', 'Сведение рук (в тренажёре)'],
    'Unilateral machine fly': ['Chest Fly (Machine)', 'Сведение рук (в тренажёре)'],
    'Seated pec flys': ['Seated Chest Flys (Cable)', 'Сведение рук сидя (блок)'],
    'Overhead triceps extension': ['Overhead Triceps Extension (Cable)', 'Разгибание рук над головой (блок)'],
    'Dual rope cable extension': ['Triceps Extension (Cable)', 'Разгибание на трицепс (блок)'],
    'Incline skull crushers': ['Skullcrusher (Dumbbell)', 'Французский жим (с гантелями)'],
    'Dumbell single arm preacher curl': ['Preacher Curl (Dumbbell)', 'Сгибание на скамье Скотта (с гантелями)'],
    'Seated dumbell curl': ['Seated Incline Curl (Dumbbell)', 'Сгибание рук сидя на наклонной (с гантелями)'],
    'Preacher curls': ['Preacher Curl (Dumbbell)', 'Сгибание на скамье Скотта (с гантелями)'],
    'Glute cable kickbacks': ['Standing Cable Glute Kickbacks', 'Кикбек стоя (на блоке)'],
    'High cable glute kickbacks': ['Standing Cable Glute Kickbacks', 'Кикбек стоя (на блоке)'],
    'Standing Cable Glute Kickbacks': ['Standing Cable Glute Kickbacks', 'Кикбек стоя (на блоке)'],
    'Отведение ноги назад стоя (на блоке)': ['Standing Cable Glute Kickbacks', 'Кикбек стоя (на блоке)'],
    'Отведение ноги назад (блок) стоя': ['Standing Cable Glute Kickbacks', 'Кикбек стоя (на блоке)'],
    'Unilateral seated leg curl': ['Seated Leg Curl (Machine)', 'Сгибание ног сидя (в тренажёре)'],
    'Pendulum squat': ['Pendulum Squat (Machine)', 'Маятниковый присед (в тренажёре)'],
    'Reverse banded hack squat': ['Hack Squat (Machine)', 'Гакк-присед (в тренажёре)'],
    'Smith squat': ['Squat (Smith Machine)', 'Присед (в Смите)'],
    '45° leg press': ['Leg Press (Machine)', 'Жим ногами (в тренажёре)'],
    'Push-ups': ['Push Up', 'Отжимания'],
    'Single leg curl': ['Lying Leg Curl (Machine)', 'Сгибание ног лёжа (в тренажёре)'],
    'Single leg step up': ['Step Up', 'Зашагивания'],
    // Russian old names (nameRu field or name field with Cyrillic)
    'Мёртвая тяга со штангой': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах (со штангой)'],
    'Мёртвая тяга с гантелями': ['Straight Leg Deadlift (Dumbbell)', 'Становая тяга на прямых ногах (с гантелями)'],
    'Мёртвая тяга в Смите': ['Deadlift (Smith Machine)', 'Становая тяга (в Смите)'],
    'Румынская тяга в тренажёре': ['Romanian Deadlift (Machine)', 'Румынская тяга (в тренажёре)'],
    'Становая тяга на прямых ногах': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах (со штангой)'],
    'Подъём передней части стопы': ['Tibial Raises', 'Подъём передней части голени'],
    'Тяга штанги с опорой': ['Supported Bar Rows', 'Тяга штанги с опорой на грудь'],
    'Средняя ягодичная на нижнем блоке': ['Medium Gluteus on Low Pulley', 'Средняя ягодичная (нижний блок)'],
    'Сгибание ног сидя': ['Seated Leg Curl (Machine)', 'Сгибание ног сидя (в тренажёре)'],
    'Сгибание ног лёжа': ['Lying Leg Curl (Machine)', 'Сгибание ног лёжа (в тренажёре)'],
    'Сплит-присед на ягодицы': ['Bulgarian Split Squat (Dumbbell)', 'Болгарские сплит-приседания (с гантелями)'],
    'Болгарские выпады': ['Bulgarian Split Squat (Dumbbell)', 'Болгарские сплит-приседания (с гантелями)'],
    'Подъём на носки (тренажёр)': ['Standing Calf Raise (Machine)', 'Подъём на носки стоя (в тренажёре)'],
    'Жим плечами (тренажёр)': ['Shoulder Press (Machine Plates)', 'Жим плечами (в тренажёре, диски)'],
    'Махи гантелями на наклонной скамье': ['Rear Delt Reverse Fly (Dumbbell)', 'Обратные разведения (с гантелями)'],
    'Разведение ног (тренажёр)': ['Hip Abduction (Machine)', 'Разведение ног (в тренажёре)'],
    // v4: Renamed exercises for grouping (classify exercise DB)
    'Верхняя тяга раздельная (в тренажёре)': ['Lat Pulldown (Machine)', 'Тяга верхнего блока (в тренажёре)'],
    'Тяга верхнего блока (Iso-Lateral)': ['Lat Pulldown (Machine)', 'Тяга верхнего блока (в тренажёре)'],
    'Нижняя тяга раздельная': ['Seated Cable Row - V Grip (Cable)', 'Тяга нижнего блока сидя (V-рукоять)'],
    'Тяга нижнего блока сидя (Iso-Lateral)': ['Seated Cable Row - V Grip (Cable)', 'Тяга нижнего блока сидя (V-рукоять)'],
    'Тяга раздельная (в тренажёре)': ['Seated Row (Machine)', 'Тяга сидя (в тренажёре)'],
    'Тяга сидя (Iso-Lateral)': ['Seated Row (Machine)', 'Тяга сидя (в тренажёре)'],
    'Жим от груди раздельный (в тренажёре)': ['Chest Press (Machine)', 'Жим от груди (в тренажёре)'],
    'Жим от груди (Iso-Lateral)': ['Chest Press (Machine)', 'Жим от груди (в тренажёре)'],
    'Тяга верхнего блока обратным хватом (на блоке)': ['Reverse Grip Lat Pulldown (Cable)', 'Тяга верхнего блока (обратный хват)'],
    'Тяга верхнего блока узким хватом (на блоке)': ['Lat Pulldown - Close Grip (Cable)', 'Тяга верхнего блока (узкий хват)'],
    'Подтягивание обратным хватом': ['Chin Up', 'Подтягивание (обратный хват)'],
    'Подтягивание широким хватом': ['Wide Pull Up', 'Подтягивание (широкий хват)'],
    'Жим лёжа широким хватом (со штангой)': ['Bench Press - Wide Grip (Barbell)', 'Жим лёжа (широкий хват, штанга)'],
    'Отжимание узким хватом': ['Push Up - Close Grip', 'Отжимание (узкий хват)'],
    'Отжимания на брусьях (на грудь)': ['Chest Dip', 'Отжимания на брусьях на грудь'],
    'Гакк-приседания': ['Hack Squat (Machine)', 'Гакк-присед (в тренажёре)'],
    'Махи в стороны сидя (с гантелями)': ['Seated Lateral Raise (Dumbbell)', 'Махи в стороны (сидя, с гантелями)'],
    'Тяга нижнего блока сидя — V-рукоять (на блоке)': ['Seated Cable Row - V Grip (Cable)', 'Тяга нижнего блока сидя (V-рукоять)'],
    'Тяга нижнего блока сидя — прямой гриф': ['Seated Cable Row - Bar Grip', 'Тяга нижнего блока сидя (прямой гриф)'],
    'Тяга нижнего блока сидя — широкий хват': ['Seated Cable Row - Bar Wide Grip', 'Тяга нижнего блока сидя (широкий хват)'],
    // Bulgarian Split Squat: bare name → dumbbell variant (removed bare from DB)
    'Bulgarian Split Squat': ['Bulgarian Split Squat (Dumbbell)', 'Болгарские сплит-приседания (с гантелями)'],
    'Болгарские сплит-приседания': ['Bulgarian Split Squat (Dumbbell)', 'Болгарские сплит-приседания (с гантелями)']
};

// Fix specific exercises by ID (for cases where name-based matching is ambiguous)
var _ID_MAP = {
    'D1E1_opt1': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах (со штангой)'],
    'D1E1_opt2': ['Straight Leg Deadlift (Dumbbell)', 'Становая тяга на прямых ногах (с гантелями)'],
    'D1E1_opt4': ['Romanian Deadlift (Machine)', 'Румынская тяга (в тренажёре)'],
    'D1E4_opt1': ['Straight Leg Deadlift', 'Становая тяга на прямых ногах (со штангой)'],
    'D1E4_opt2': ['Straight Leg Deadlift (Dumbbell)', 'Становая тяга на прямых ногах (с гантелями)']
};

// Reverse map from EXERCISE_DB: Russian nameRu → [English name, Russian nameRu]
// Built once lazily for resolving Cyrillic names stuck in the `name` field
var _DB_RU = null;
function _getDbRuMap() {
    if (_DB_RU) return _DB_RU;
    _DB_RU = {};
    if (EXERCISE_DB) {
        for (var i = 0; i < EXERCISE_DB.length; i++) {
            var ex = EXERCISE_DB[i];
            if (ex.name && ex.nameRu) _DB_RU[ex.nameRu.toLowerCase()] = [ex.name, ex.nameRu];
        }
    }
    return _DB_RU;
}

export const Migrations = {
    /**
     * Run all pending one-time migrations.
     * Each migration is guarded by a localStorage flag so it only runs once.
     */
    run() {
        this._migrations.forEach(function(m) {
            if (!localStorage.getItem(m.key)) {
                try { m.fn(); } catch(e) { console.error('Migration error:', m.key, e); }
                localStorage.setItem(m.key, '1');
            }
        });
    },

    /**
     * Fix corrupted _gym (object instead of string) and remove empty exercise entries in log.
     * Called after sync to clean up data that cloud may have re-introduced.
     */
    cleanOrphanedLogEntries() {
        try {
            Storage._invalidateCache();
            var d = Storage._load();
            if (!d || !d.log) return;
            var changed = false;
            for (var w in d.log) {
                for (var dd in d.log[w]) {
                    var dayLog = d.log[w][dd];
                    // Fix corrupted _gym (object instead of string)
                    if (dayLog._gym && typeof dayLog._gym === 'object') {
                        var chars = [];
                        for (var ci = 0; ci < Object.keys(dayLog._gym).length; ci++) {
                            chars.push(dayLog._gym[String(ci)] || '');
                        }
                        dayLog._gym = chars.join('');
                        changed = true;
                    }
                    // Remove empty exercise entries
                    for (var exKey in dayLog) {
                        if (exKey.charAt(0) === '_') continue;
                        if (typeof dayLog[exKey] === 'object' && dayLog[exKey] !== null && Object.keys(dayLog[exKey]).length === 0) {
                            delete dayLog[exKey];
                            changed = true;
                        }
                    }
                }
            }
            if (changed) Storage._save();
        } catch (e) {
            console.error('Log cleanup error:', e);
        }
    },

    /**
     * Migrate exercise names in a stored program to Hevy DB standard.
     * Idempotent: only renames exercises that match old names.
     * Can be called on any data object (Storage._data or sync merge result).
     * @param {Object} data - the user data object containing .program
     * @returns {number} count of renamed exercises
     */
    migrateExerciseNames(data) {
        if (!data || !data.program) return 0;
        var count = 0;
        var allExercises = getAllProgramExercises(data.program).map(function(entry) { return entry.exercise; });
        var dbRu = _getDbRuMap();

        allExercises.forEach(function(ex) {
            if (!ex) return;
            // 1. Check by exercise ID (highest priority — unambiguous)
            var idm = _ID_MAP[ex.id];
            if (idm) { ex.name = idm[0]; ex.nameRu = idm[1]; count++; return; }
            // 2. Check by English name in consolidated map
            var m = _NAME_MAP[ex.name];
            if (m) { ex.name = m[0]; ex.nameRu = m[1]; count++; return; }
            // 3. Check by Russian nameRu in consolidated map
            if (ex.nameRu) {
                var mr = _NAME_MAP[ex.nameRu];
                if (mr) { ex.name = mr[0]; ex.nameRu = mr[1]; count++; return; }
            }
            // 4. Check if name field has Cyrillic — resolve via EXERCISE_DB
            if (ex.name && /[а-яА-ЯёЁ]/.test(ex.name)) {
                var dbm = dbRu[ex.name.toLowerCase()];
                if (dbm) { ex.name = dbm[0]; ex.nameRu = dbm[1]; count++; return; }
                var mr2 = _NAME_MAP[ex.name];
                if (mr2) { ex.name = mr2[0]; ex.nameRu = mr2[1]; count++; return; }
            }
        });

        if (count > 0) console.log('Migrated ' + count + ' exercise names to Hevy DB standard');
        return count;
    },

    _migrations: [
        // v1: Fix exerciseChoices for Anastasia (D1_deadlift, D2_support)
        {
            key: '_fix_choices_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    if (!dd.exerciseChoices) continue;
                    var changed = false;
                    if (dd.exerciseChoices.D1_deadlift === 'D1E1_opt1') {
                        dd.exerciseChoices.D1_deadlift = 'D1E1_opt3';
                        changed = true;
                    }
                    if (dd.exerciseChoices.D2_support === 'D2E1_opt4') {
                        dd.exerciseChoices.D2_support = 'D2E1';
                        changed = true;
                    }
                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        },
        // v2: Remove gym80 Abdominal from D2E1 (wrong binding)
        {
            key: '_fix_d2e1_eq',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    if (dd.exerciseEquipment && dd.exerciseEquipment.D2E1 === 'eq_1773590540310') {
                        delete dd.exerciseEquipment.D2E1;
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },
        // v3: Remove Precor Seated Leg Curl from D1E2 (test data)
        {
            key: '_fix_precor_d1e2',
            fn: function() {
                var allUsers = Storage.getUsers ? Storage.getUsers() : [];
                for (var i = 0; i < allUsers.length; i++) {
                    var key = 'wt_data_' + allUsers[i].id;
                    var d = JSON.parse(localStorage.getItem(key) || '{}');
                    if (d.exerciseEquipment && d.exerciseEquipment.D1E2) {
                        var eq = d.equipment || [];
                        var eqObj = eq.find(function(e) { return e.id === d.exerciseEquipment.D1E2; });
                        if (eqObj && eqObj.name && eqObj.name.toLowerCase().indexOf('precor') !== -1) {
                            delete d.exerciseEquipment.D1E2;
                            localStorage.setItem(key, JSON.stringify(d));
                        }
                    }
                }
            }
        },
        // v4: Fix corrupted _gym (object instead of string) + empty entries in log
        {
            key: '_fix_orphan_log_v2',
            fn: function() {
                var allUsers = Storage.getUsers ? Storage.getUsers() : [];
                for (var ui = 0; ui < allUsers.length; ui++) {
                    var key = 'wt_data_' + allUsers[ui].id;
                    var d = JSON.parse(localStorage.getItem(key) || '{}');
                    if (!d.log) continue;
                    var changed = false;
                    for (var w in d.log) {
                        for (var dd in d.log[w]) {
                            var dayLog = d.log[w][dd];
                            if (dayLog._gym && typeof dayLog._gym === 'object') {
                                var chars = [];
                                for (var ci = 0; ci < Object.keys(dayLog._gym).length; ci++) {
                                    chars.push(dayLog._gym[String(ci)] || '');
                                }
                                dayLog._gym = chars.join('');
                                changed = true;
                            }
                            for (var ek in dayLog) {
                                if (ek.charAt(0) === '_') continue;
                                if (typeof dayLog[ek] === 'object' && dayLog[ek] !== null && Object.keys(dayLog[ek]).length === 0) {
                                    delete dayLog[ek];
                                    changed = true;
                                }
                            }
                        }
                    }
                    if (changed) localStorage.setItem(key, JSON.stringify(d));
                }
            }
        },
        // v5: Migrate _frozenGroups → templateSnapshots + weekTemplateVersion
        {
            key: '_migrate_frozen_to_snapshots_v1',
            fn: function() {
                var allUsers = Storage.getUsers ? Storage.getUsers() : [];
                for (var ui = 0; ui < allUsers.length; ui++) {
                    var key = 'wt_data_' + allUsers[ui].id;
                    var d = JSON.parse(localStorage.getItem(key) || '{}');
                    if (!d.program || !d.program.weeklyOverrides) continue;

                    var changed = false;
                    var p = d.program;
                    if (!p.templateSnapshots) p.templateSnapshots = {};
                    if (!p.weekTemplateVersion) p.weekTemplateVersion = {};

                    // Group frozen data by dayNum to deduplicate snapshots
                    var frozenByDay = {};
                    for (var w in p.weeklyOverrides) {
                        for (var dd in p.weeklyOverrides[w]) {
                            var dayOv = p.weeklyOverrides[w][dd];
                            if (!dayOv || !dayOv._frozenGroups) continue;
                            if (!frozenByDay[dd]) frozenByDay[dd] = [];
                            frozenByDay[dd].push({ week: w, groups: dayOv._frozenGroups });
                        }
                    }

                    for (var dd in frozenByDay) {
                        var entries = frozenByDay[dd];
                        if (!p.templateSnapshots[dd]) p.templateSnapshots[dd] = [];

                        // All _frozenGroups for one day are identical (frozen at same time)
                        // so we only need one snapshot
                        var snap = entries[0].groups;
                        var version = p.templateSnapshots[dd].length + 1;
                        p.templateSnapshots[dd].push({ version: version, groups: snap });

                        // Bind all those weeks to this snapshot version
                        for (var i = 0; i < entries.length; i++) {
                            var wk = String(entries[i].week);
                            if (!p.weekTemplateVersion[wk]) p.weekTemplateVersion[wk] = {};
                            if (!p.weekTemplateVersion[wk][dd]) {
                                p.weekTemplateVersion[wk][dd] = version;
                            }
                        }

                        // Remove _frozenGroups from weeklyOverrides
                        for (var i = 0; i < entries.length; i++) {
                            var wk = String(entries[i].week);
                            if (p.weeklyOverrides[wk] && p.weeklyOverrides[wk][dd]) {
                                delete p.weeklyOverrides[wk][dd]._frozenGroups;
                                // Clean up empty day override objects
                                if (Object.keys(p.weeklyOverrides[wk][dd]).length === 0) {
                                    delete p.weeklyOverrides[wk][dd];
                                }
                            }
                        }
                        changed = true;
                    }

                    if (changed) localStorage.setItem(key, JSON.stringify(d));
                }
            }
        },
        // v6: Restore exerciseEquipment from exerciseEquipmentOptions after rollback bug
        // The rollback mechanism could clear exerciseEquipment (defaults) while leaving
        // exerciseEquipmentOptions (history) intact. Restore defaults from options.
        {
            key: '_restore_eq_from_opts_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    var opts = dd.exerciseEquipmentOptions;
                    if (!opts) continue;
                    if (!dd.exerciseEquipment) dd.exerciseEquipment = {};
                    var changed = false;
                    for (var exId in opts) {
                        // Only restore if no current assignment (null/undefined/missing)
                        if (!dd.exerciseEquipment[exId] && opts[exId] && opts[exId].length > 0) {
                            dd.exerciseEquipment[exId] = opts[exId][0];
                            changed = true;
                        }
                    }
                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        },
        // v7: Restore warmup group type that was lost due to _buildDayEditorVM bug
        // The bug converted type:'warmup' → type:'single' when building the editor VM,
        // so any edit via inline menu permanently changed the group type in saved data.
        {
            key: '_restore_warmup_type_v1',
            fn: function() {
                var warmupIds = { 'D3E0': true, 'D4W1': true, 'D4W2': true };
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    if (!dd.program || !dd.program.dayTemplates) continue;
                    var changed = false;

                    var dt = dd.program.dayTemplates;
                    for (var dayNum in dt) {
                        var groups = dt[dayNum].exerciseGroups;
                        if (!groups) continue;
                        for (var gi = 0; gi < groups.length; gi++) {
                            if (groups[gi].type === 'single' && groups[gi].exercise && warmupIds[groups[gi].exercise.id]) {
                                groups[gi].type = 'warmup';
                                changed = true;
                            }
                        }
                    }

                    var snaps = dd.program.templateSnapshots;
                    if (snaps) {
                        for (var ver in snaps) {
                            var snapGroups = snaps[ver].exerciseGroups;
                            if (!snapGroups) continue;
                            for (var si = 0; si < snapGroups.length; si++) {
                                if (snapGroups[si].type === 'single' && snapGroups[si].exercise && warmupIds[snapGroups[si].exercise.id]) {
                                    snapGroups[si].type = 'warmup';
                                    changed = true;
                                }
                            }
                        }
                    }

                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        }
    ]
};