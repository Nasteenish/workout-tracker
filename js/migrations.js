/* ===== Data Migrations ===== */
import { Storage } from './storage.js';
import { EXERCISE_DB } from './exercises_db.js';
import { getAllProgramExercises, getGroupExercises } from './utils.js';
import { MIKHAIL2_PROGRAM } from './mikhail2_data.js';
import { MIKHAIL_PROGRAM } from './mikhail_data.js';
import { AppState } from './app-state.js';

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
    'Close grip pulldown': ['Lat Pulldown - Close Grip (Cable)', 'Вертикальная тяга (узким хватом на блоке)'],
    // Тяга верхнего блока → Вертикальная тяга (EXERCISE_DB rename)
    'Тяга верхнего блока (в тренажёре)': ['Lat Pulldown (Machine)', 'Вертикальная тяга (в тренажёре)'],
    'Тяга верхнего блока (на блоке)': ['Lat Pulldown (Cable)', 'Вертикальная тяга (на блоке)'],
    'Тяга верхнего блока (узкий хват)': ['Lat Pulldown - Close Grip (Cable)', 'Вертикальная тяга (узким хватом на блоке)'],
    'Тяга верхнего блока узким хватом (блок)': ['Lat Pulldown - Close Grip (Cable)', 'Вертикальная тяга (узким хватом на блоке)'],
    'Тяга верхнего блока одной рукой': ['Single Arm Lat Pulldown', 'Вертикальная тяга одной рукой'],
    'Dorian row': ['Bent Over Row (Barbell)', 'Тяга штанги в наклоне'],
    'Single arm cable row': ['Single Arm Cable Row', 'Тяга нижнего блока одной рукой'],
    'Hammer single arm low row': ['Iso-Lateral Low Row', 'Тяга рычажная нижняя'],
    'Single arm hammer high row': ['Iso-Lateral High Row (Machine)', 'Тяга рычажная верхняя (в тренажёре)'],
    'Single arm pulldown': ['Single Arm Lat Pulldown', 'Вертикальная тяга одной рукой'],
    'Unilateral pulldown machine': ['Lat Pulldown (Machine)', 'Вертикальная тяга (в тренажёре)'],
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
    'Machine shoulder press': ['Shoulder Press (Machine)', 'Жим на плечи сидя (в тренажёре)'],
    'Shoulder Press (Machine Plates)': ['Shoulder Press (Machine)', 'Жим на плечи сидя (в тренажёре)'],
    'Жим на плечи (в тренажёре, диски)': ['Shoulder Press (Machine)', 'Жим на плечи сидя (в тренажёре)'],
    'Жим плечами (в тренажёре, диски)': ['Shoulder Press (Machine)', 'Жим на плечи сидя (в тренажёре)'],
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
    'Жим плечами (тренажёр)': ['Shoulder Press (Machine)', 'Жим на плечи сидя (в тренажёре)'],
    'Жим на плечи (в тренажёре)': ['Shoulder Press (Machine)', 'Жим на плечи сидя (в тренажёре)'],
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

            // Also unbind stale snapshots for weeks without logs.
            // This runs after every sync to prevent cloud from restoring old bindings.
            this._unbindStaleSnapshots(d);
        } catch (e) {
            console.error('Log cleanup error:', e);
        }
    },

    /**
     * Unbind snapshot bindings that differ from dayTemplates for weeks without log data.
     * Called after sync and during one-time migration.
     */
    _unbindStaleSnapshots(data) {
        if (!data || !data.program) return;
        var wtv = data.program.weekTemplateVersion;
        var snaps = data.program.templateSnapshots;
        var dt = data.program.dayTemplates;
        var log = data.log;
        if (!wtv || !dt) return;
        var changed = false;
        // Never touch current week — it always uses live template
        var _currentWeek = (typeof AppState !== 'undefined' && AppState.currentWeek) ? String(AppState.currentWeek) : null;

        // Build dayTemplates exercise IDs per day
        var dtIds = {};
        for (var dayNum in dt) {
            var ids = {};
            var groups = (dt[dayNum] && dt[dayNum].exerciseGroups) || [];
            for (var gi = 0; gi < groups.length; gi++) {
                var g = groups[gi];
                if (g.exercise && g.exercise.id) ids[g.exercise.id] = 1;
                if (g.exercises) {
                    for (var ei = 0; ei < g.exercises.length; ei++) {
                        if (g.exercises[ei].id) ids[g.exercises[ei].id] = 1;
                    }
                }
            }
            dtIds[dayNum] = ids;
        }

        for (var w in wtv) {
            // Skip current week — always uses live template
            if (_currentWeek && w === _currentWeek) continue;
            for (var d in wtv[w]) {
                // Check if this week/day has any exercise log data
                var dayLog = (log && log[w] && log[w][d]) || {};
                var hasRealLog = false;
                for (var lk in dayLog) {
                    if (lk.charAt(0) === '_') continue;
                    // Skip empty objects (no actual set data)
                    var entry = dayLog[lk];
                    if (entry && typeof entry === 'object' && Object.keys(entry).length > 0) {
                        hasRealLog = true; break;
                    }
                }
                if (hasRealLog) continue; // preserve snapshot for weeks with real data

                if (!snaps || !snaps[d]) continue;
                var version = wtv[w][d];
                var snap = null;
                var snapArr = snaps[d];
                if (Array.isArray(snapArr)) {
                    for (var si = 0; si < snapArr.length; si++) {
                        if (snapArr[si].version === version) { snap = snapArr[si]; break; }
                    }
                }
                if (!snap) continue;

                var snapIds = {};
                var sg = snap.groups || [];
                for (var sgi = 0; sgi < sg.length; sgi++) {
                    var sg2 = sg[sgi];
                    if (sg2.exercise && sg2.exercise.id) snapIds[sg2.exercise.id] = 1;
                    if (sg2.exercises) {
                        for (var sei = 0; sei < sg2.exercises.length; sei++) {
                            if (sg2.exercises[sei].id) snapIds[sg2.exercises[sei].id] = 1;
                        }
                    }
                }

                var dtDay = dtIds[d] || {};
                var needsUnbind = false;
                for (var sid in snapIds) {
                    if (!dtDay[sid]) { needsUnbind = true; break; }
                }
                if (!needsUnbind) {
                    for (var did in dtDay) {
                        if (!snapIds[did]) { needsUnbind = true; break; }
                    }
                }

                if (needsUnbind) {
                    delete wtv[w][d];
                    changed = true;
                    if (Object.keys(wtv[w]).length === 0) delete wtv[w];
                }
            }
        }

        if (changed) {
            data._programModified = Date.now();
            Storage._save();
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
        // Also collect exercises from templateSnapshots (not covered by getAllProgramExercises)
        var snaps = data.program.templateSnapshots;
        if (snaps) {
            for (var dk in snaps) {
                var daySnaps = snaps[dk];
                if (!Array.isArray(daySnaps)) continue;
                for (var si = 0; si < daySnaps.length; si++) {
                    var sg = daySnaps[si].groups;
                    if (!sg) continue;
                    for (var gi = 0; gi < sg.length; gi++) {
                        var sexs = getGroupExercises(sg[gi]);
                        for (var ei = 0; ei < sexs.length; ei++) allExercises.push(sexs[ei]);
                    }
                }
            }
        }
        var dbRu = _getDbRuMap();

        // Build English name → DB entry lookup for auto-sync
        var dbByEnName = {};
        for (var dbi = 0; dbi < EXERCISE_DB.length; dbi++) {
            if (EXERCISE_DB[dbi].name) dbByEnName[EXERCISE_DB[dbi].name] = EXERCISE_DB[dbi];
        }

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
            // 5. Auto-sync nameRu from EXERCISE_DB by English name.
            // English names are stable (Hevy DB standard), nameRu may change.
            // This eliminates the need for manual _NAME_MAP entries when
            // only the Russian name is updated in exercises_db.js.
            if (ex.name) {
                var dbEntry = dbByEnName[ex.name];
                if (dbEntry && dbEntry.nameRu && ex.nameRu !== dbEntry.nameRu) {
                    ex.nameRu = dbEntry.nameRu;
                    count++;
                }
            }
        });

        // Also migrate exerciseSubstitutions — they store nameRu values
        // that may reference old names, breaking the variation picker
        var subs = data.exerciseSubstitutions;
        if (subs) {
            // Build reverse lookup: old nameRu → new nameRu from DB
            var dbByRuName = {};
            for (var dbi2 = 0; dbi2 < EXERCISE_DB.length; dbi2++) {
                var dbe = EXERCISE_DB[dbi2];
                if (dbe.nameRu && dbe.name) dbByRuName[dbe.name] = dbe.nameRu;
            }
            for (var subKey in subs) {
                var oldVal = subs[subKey];
                if (!oldVal) continue;
                // 1. Check _NAME_MAP
                var mapped = _NAME_MAP[oldVal];
                if (mapped) { subs[subKey] = mapped[1]; count++; continue; }
                // 2. Auto-sync: find by matching against DB nameRu values
                // If substitution nameRu doesn't exist in DB, try to find
                // the exercise by English name from the program and update
                var found = false;
                for (var dbi3 = 0; dbi3 < EXERCISE_DB.length; dbi3++) {
                    if (EXERCISE_DB[dbi3].nameRu === oldVal) { found = true; break; }
                }
                if (!found) {
                    // Try to find exercise in program to get English name
                    var progEx = allExercises.find(function(e) { return e && e.id === subKey; });
                    if (progEx && progEx.name && dbByEnName[progEx.name]) {
                        subs[subKey] = dbByEnName[progEx.name].nameRu;
                        count++;
                    }
                }
            }
        }

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
        },
        // v8: Fix warmup restore in snapshots — v1 migration had a bug:
        // templateSnapshots is { dayKey: [ {version, groups}, ... ] }
        // v1 iterated as snaps[ver].exerciseGroups (wrong) instead of snaps[dayKey][i].groups
        {
            key: '_restore_warmup_snapshots_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    if (!dd.program) continue;
                    var changed = false;

                    // Collect warmup exercise IDs from the live templates (already fixed by v1)
                    var warmupIds = {};
                    var dt = dd.program.dayTemplates;
                    if (dt) {
                        for (var dayNum in dt) {
                            var groups = dt[dayNum].exerciseGroups;
                            if (!groups) continue;
                            for (var gi = 0; gi < groups.length; gi++) {
                                if (groups[gi].type === 'warmup' && groups[gi].exercise) {
                                    warmupIds[groups[gi].exercise.id] = true;
                                }
                            }
                        }
                    }

                    // Fix snapshots with correct iteration
                    var snaps = dd.program.templateSnapshots;
                    if (snaps) {
                        for (var dayKey in snaps) {
                            var daySnaps = snaps[dayKey];
                            if (!Array.isArray(daySnaps)) continue;
                            for (var si = 0; si < daySnaps.length; si++) {
                                var snapGroups = daySnaps[si].groups;
                                if (!snapGroups) continue;
                                for (var gi = 0; gi < snapGroups.length; gi++) {
                                    if (snapGroups[gi].type === 'single' && snapGroups[gi].exercise && warmupIds[snapGroups[gi].exercise.id]) {
                                        snapGroups[gi].type = 'warmup';
                                        changed = true;
                                    }
                                }
                            }
                        }
                    }

                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        },
        // v9: Fix shoulder press nameRu — old migration used "Жим на плечи (в тренажёре)" (без "сидя"),
        // but EXERCISE_DB has "Жим на плечи сидя (в тренажёре)" → вариации не находились.
        {
            key: '_fix_shoulder_press_nameRu_v2',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (!dd.program) continue;
                    var changed = false;

                    function fixEx(ex) {
                        if (!ex) return;
                        var needsFix = (ex.name === 'Shoulder Press (Machine)' || ex.name === 'Shoulder Press (Machine Plates)') &&
                            (ex.nameRu === 'Жим на плечи (в тренажёре)' || ex.nameRu === 'Жим на плечи (в тренажёре, диски)');
                        if (needsFix) {
                            ex.name = 'Shoulder Press (Machine)';
                            ex.nameRu = 'Жим на плечи сидя (в тренажёре)';
                            changed = true;
                        }
                    }

                    // Fix dayTemplates
                    var dt = dd.program.dayTemplates;
                    if (dt) {
                        for (var dayNum in dt) {
                            var groups = dt[dayNum].exerciseGroups || [];
                            for (var gi = 0; gi < groups.length; gi++) {
                                var g = groups[gi];
                                if (g.exercise) fixEx(g.exercise);
                                if (g.exercises) g.exercises.forEach(fixEx);
                                if (g.options) g.options.forEach(fixEx);
                            }
                        }
                    }

                    // Fix templateSnapshots
                    var snaps = dd.program.templateSnapshots;
                    if (snaps) {
                        for (var dayKey in snaps) {
                            var snapArr = snaps[dayKey];
                            if (!Array.isArray(snapArr)) continue;
                            for (var si = 0; si < snapArr.length; si++) {
                                var snapGroups = snapArr[si].groups || [];
                                for (var sgi = 0; sgi < snapGroups.length; sgi++) {
                                    var sg = snapGroups[sgi];
                                    if (sg.exercise) fixEx(sg.exercise);
                                    if (sg.exercises) sg.exercises.forEach(fixEx);
                                    if (sg.options) sg.options.forEach(fixEx);
                                }
                            }
                        }
                    }

                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        },
        // v9b: Fix exerciseSubstitutions — old substitution values may contain
        // pre-migration names (e.g. "Жим на плечи (в тренажёре)") that don't match
        // EXERCISE_DB → variation picker can't find variations → no chooser arrow.
        {
            key: '_fix_substitution_names_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    var subs = dd.exerciseSubstitutions;
                    if (!subs) continue;
                    var changed = false;
                    for (var exId in subs) {
                        var oldNameRu = subs[exId];
                        if (!oldNameRu) continue;
                        // Check if substitution nameRu matches a known old name in _NAME_MAP
                        if (_NAME_MAP[oldNameRu]) {
                            subs[exId] = _NAME_MAP[oldNameRu][1]; // new nameRu
                            changed = true;
                        }
                    }
                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        },
        // v10: Flatten choose_one groups → individual single exercises.
        // choose_one is redundant — the DB-based variation picker (showVariationModal) already
        // handles switching between exercise variants. Each choose_one slot becomes one single
        // exercise: the first option that is NOT a single-arm variation.
        {
            key: '_flatten_choose_one_v1',
            fn: function() {
                function isSingleArm(ex) {
                    var n = (ex.nameRu || '') + ' ' + (ex.name || '');
                    return /одной рукой|single arm/i.test(n);
                }

                function pickOption(options) {
                    if (!options || !options.length) return null;
                    for (var i = 0; i < options.length; i++) {
                        if (!isSingleArm(options[i])) return options[i];
                    }
                    return options[0]; // fallback — all are single-arm
                }

                function flattenGroups(groups) {
                    if (!groups) return null;
                    var result = [];
                    var changed = false;
                    for (var gi = 0; gi < groups.length; gi++) {
                        var g = groups[gi];
                        if (g.type === 'choose_one' && g.options && g.options.length > 0) {
                            var chosen = pickOption(g.options);
                            if (!chosen) { result.push(g); continue; }
                            var ng = { type: 'single', exercise: chosen };
                            if (g.sectionTitle) ng.sectionTitle = g.sectionTitle;
                            if (g.sectionTitleRu) ng.sectionTitleRu = g.sectionTitleRu;
                            result.push(ng);
                            changed = true;
                        } else {
                            result.push(g);
                        }
                    }
                    return changed ? result : null;
                }

                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (!dd.program) continue;
                    var changed = false;

                    var dt = dd.program.dayTemplates;
                    if (dt) {
                        for (var dayNum in dt) {
                            var ng = flattenGroups(dt[dayNum].exerciseGroups);
                            if (ng) { dt[dayNum].exerciseGroups = ng; changed = true; }
                        }
                    }

                    var snaps = dd.program.templateSnapshots;
                    if (snaps) {
                        for (var dayKey in snaps) {
                            var daySnaps = snaps[dayKey];
                            if (!Array.isArray(daySnaps)) continue;
                            for (var si = 0; si < daySnaps.length; si++) {
                                var ng2 = flattenGroups(daySnaps[si].groups);
                                if (ng2) { daySnaps[si].groups = ng2; changed = true; }
                            }
                        }
                    }

                    if (changed) {
                        dd._lastModified = Date.now();
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },
        // v11: Fix v10 regression — v10 always picked opt1 but users had specific options chosen.
        // Restore the correct exercise in each template slot using exerciseChoices.
        {
            key: '_fix_choose_one_selection_v1',
            fn: function() {
                // Build lookup: exerciseId → full exercise object, from original program data
                var optionLookup = {};
                function indexOptions(program) {
                    if (!program || !program.dayTemplates) return;
                    for (var d in program.dayTemplates) {
                        var groups = (program.dayTemplates[d] && program.dayTemplates[d].exerciseGroups) || [];
                        for (var gi = 0; gi < groups.length; gi++) {
                            var g = groups[gi];
                            if (g.type === 'choose_one' && g.options) {
                                for (var oi = 0; oi < g.options.length; oi++) {
                                    if (g.options[oi].id) optionLookup[g.options[oi].id] = g.options[oi];
                                }
                            }
                        }
                    }
                }
                indexOptions(MIKHAIL2_PROGRAM);
                indexOptions(MIKHAIL_PROGRAM);

                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (!dd.program || !dd.exerciseChoices) continue;
                    var changed = false;

                    // For each choiceKey, find the most recently chosen option:
                    // prefer highest per-week choice (week:key) over global (key).
                    var bestChoice = {}; // choiceKey → chosen exerciseId
                    for (var rawKey in dd.exerciseChoices) {
                        var chosenId = dd.exerciseChoices[rawKey];
                        if (!chosenId || chosenId.indexOf('_opt') === -1) continue;
                        var colonIdx = rawKey.indexOf(':');
                        if (colonIdx !== -1) {
                            // Per-week choice: "week:choiceKey"
                            var week = parseInt(rawKey.substring(0, colonIdx), 10);
                            var ck = rawKey.substring(colonIdx + 1);
                            if (!bestChoice[ck] || (bestChoice[ck].week !== undefined && week > bestChoice[ck].week)) {
                                bestChoice[ck] = { id: chosenId, week: week };
                            }
                        } else {
                            // Global choice
                            if (!bestChoice[rawKey]) bestChoice[rawKey] = { id: chosenId };
                        }
                    }

                    // For each best choice, fix the dayTemplates slot
                    for (var ck2 in bestChoice) {
                        var targetId = bestChoice[ck2].id;
                        var chosenEx = optionLookup[targetId];
                        if (!chosenEx) continue;
                        // Find the prefix (e.g. "D3E4" from "D3E4_opt2")
                        var prefix = targetId.substring(0, targetId.indexOf('_opt'));
                        var dt = dd.program.dayTemplates;
                        if (!dt) continue;
                        for (var dayNum in dt) {
                            var groups = dt[dayNum].exerciseGroups || [];
                            for (var gi2 = 0; gi2 < groups.length; gi2++) {
                                var g2 = groups[gi2];
                                if (g2.type === 'single' && g2.exercise && g2.exercise.id &&
                                    g2.exercise.id !== targetId &&
                                    g2.exercise.id.indexOf(prefix + '_opt') === 0) {
                                    g2.exercise = JSON.parse(JSON.stringify(chosenEx));
                                    changed = true;
                                }
                            }
                        }
                    }

                    if (changed) {
                        dd._lastModified = Date.now();
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },

        // v12: Fix v10/v11 regression — templateSnapshots also had choose_one flattened
        // to opt1 but users had specific options chosen. v11 only fixed dayTemplates.
        // This migration fixes templateSnapshots using the same logic.
        {
            key: '_fix_choose_one_snapshots_v1',
            fn: function() {
                // Build lookup: exerciseId → full exercise object, from original program data
                var optionLookup = {};
                function indexOptions(program) {
                    if (!program || !program.dayTemplates) return;
                    for (var d in program.dayTemplates) {
                        var groups = (program.dayTemplates[d] && program.dayTemplates[d].exerciseGroups) || [];
                        for (var gi = 0; gi < groups.length; gi++) {
                            var g = groups[gi];
                            if (g.type === 'choose_one' && g.options) {
                                for (var oi = 0; oi < g.options.length; oi++) {
                                    if (g.options[oi].id) optionLookup[g.options[oi].id] = g.options[oi];
                                }
                            }
                        }
                    }
                }
                indexOptions(MIKHAIL2_PROGRAM);
                indexOptions(MIKHAIL_PROGRAM);

                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (!dd.program || !dd.exerciseChoices) continue;
                    var changed = false;

                    // Collect global choices only (no week prefix) — these apply to snapshots
                    var globalChoices = {}; // prefix → targetOptId
                    for (var rawKey in dd.exerciseChoices) {
                        var chosenId = dd.exerciseChoices[rawKey];
                        if (!chosenId || chosenId.indexOf('_opt') === -1) continue;
                        if (rawKey.indexOf(':') !== -1) continue; // skip per-week choices
                        var prefix = chosenId.substring(0, chosenId.indexOf('_opt'));
                        // Only use global choice if no later per-week choice overrides it
                        // (We fix all snapshots with global choice; per-week snap versions
                        //  are typically set correctly by the user's explicit week actions.)
                        globalChoices[prefix] = chosenId;
                    }

                    // Fix templateSnapshots
                    var snaps = dd.program.templateSnapshots;
                    if (!snaps) continue;
                    for (var dayId in snaps) {
                        var daySnaps = snaps[dayId];
                        if (!Array.isArray(daySnaps)) continue;
                        for (var si = 0; si < daySnaps.length; si++) {
                            var snapGroups = daySnaps[si].groups;
                            if (!snapGroups) continue;
                            for (var gi2 = 0; gi2 < snapGroups.length; gi2++) {
                                var g2 = snapGroups[gi2];
                                if (g2.type !== 'single' || !g2.exercise || !g2.exercise.id) continue;
                                var eid = g2.exercise.id;
                                if (eid.indexOf('_opt') === -1) continue;
                                var exPrefix = eid.substring(0, eid.indexOf('_opt'));
                                var targetId = globalChoices[exPrefix];
                                if (!targetId || targetId === eid) continue;
                                // Need to replace this exercise with targetId
                                var chosenEx = optionLookup[targetId];
                                if (!chosenEx) {
                                    // Not in original program (user-customized).
                                    // Create synthetic object: copy current, change ID only.
                                    chosenEx = JSON.parse(JSON.stringify(g2.exercise));
                                    chosenEx.id = targetId;
                                }
                                g2.exercise = JSON.parse(JSON.stringify(chosenEx));
                                changed = true;
                            }
                        }
                    }

                    if (changed) {
                        dd._lastModified = Date.now();
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },
        // v13: Unbind stale snapshots for weeks without logs.
        // When user edits the program (adds/removes exercises), dayTemplates update
        // but old snapshots stay bound to future weeks. Those weeks show deleted exercises.
        // Fix: for any week/day with no log data, if the snapshot differs from dayTemplates,
        // unbind it so resolveWorkout falls through to dayTemplates (current program).
        {
            key: '_unbind_stale_snapshots_v2',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (!dd.program) continue;
                    var wtv = dd.program.weekTemplateVersion;
                    var snaps = dd.program.templateSnapshots;
                    var dt = dd.program.dayTemplates;
                    var log = dd.log;
                    if (!wtv || !dt) continue;
                    var changed = false;

                    // Build dayTemplates exercise IDs per day
                    var dtIds = {};
                    for (var dayNum in dt) {
                        var ids = {};
                        var groups = (dt[dayNum] && dt[dayNum].exerciseGroups) || [];
                        for (var gi = 0; gi < groups.length; gi++) {
                            var g = groups[gi];
                            if (g.exercise && g.exercise.id) ids[g.exercise.id] = 1;
                            if (g.exercises) {
                                for (var ei = 0; ei < g.exercises.length; ei++) {
                                    if (g.exercises[ei].id) ids[g.exercises[ei].id] = 1;
                                }
                            }
                        }
                        dtIds[dayNum] = ids;
                    }

                    for (var w in wtv) {
                        for (var d in wtv[w]) {
                            var version = wtv[w][d];
                            // Check if this week/day has any exercise log data
                            var dayLog = (log && log[w] && log[w][d]) || {};
                            var hasRealLog2 = false;
                            for (var lk in dayLog) {
                                if (lk.charAt(0) === '_') continue;
                                var entry2 = dayLog[lk];
                                if (entry2 && typeof entry2 === 'object' && Object.keys(entry2).length > 0) {
                                    hasRealLog2 = true; break;
                                }
                            }
                            if (hasRealLog2) continue; // preserve snapshot for weeks with real data

                            // Check if snapshot differs from dayTemplates
                            if (!snaps || !snaps[d]) continue;
                            var snap = null;
                            var snapArr = snaps[d];
                            for (var si = 0; si < snapArr.length; si++) {
                                if (snapArr[si].version === version) { snap = snapArr[si]; break; }
                            }
                            if (!snap) continue;

                            var snapIds = {};
                            var sg = snap.groups || [];
                            for (var sgi = 0; sgi < sg.length; sgi++) {
                                var sg2 = sg[sgi];
                                if (sg2.exercise && sg2.exercise.id) snapIds[sg2.exercise.id] = 1;
                                if (sg2.exercises) {
                                    for (var sei = 0; sei < sg2.exercises.length; sei++) {
                                        if (sg2.exercises[sei].id) snapIds[sg2.exercises[sei].id] = 1;
                                    }
                                }
                            }

                            // Compare: if any exercise in snap is not in dayTemplates, unbind
                            var dtDay = dtIds[d] || {};
                            var needsUnbind = false;
                            for (var sid in snapIds) {
                                if (!dtDay[sid]) { needsUnbind = true; break; }
                            }
                            for (var did in dtDay) {
                                if (!snapIds[did]) { needsUnbind = true; break; }
                            }

                            if (needsUnbind) {
                                delete wtv[w][d];
                                changed = true;
                                if (Object.keys(wtv[w]).length === 0) delete wtv[w];
                            }
                        }
                    }

                    if (changed) {
                        dd._lastModified = Date.now();
                        dd._programModified = Date.now();
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },
        // v14: Clear false unilateral flags.
        // Some exercises had unilateralMode=true from corrupted data/sync.
        // User never set them manually. Reset all to start fresh.
        {
            key: '_clear_false_unilateral_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (dd.unilateralMode && Object.keys(dd.unilateralMode).length > 0) {
                        dd.unilateralMode = {};
                        dd._lastModified = Date.now();
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },
        // v14: Deduplicate equipment — merge items with identical names into one canonical ID.
        // Updates all references: equipment array, exerciseEquipment, exerciseEquipmentOptions,
        // gymEquipmentMap, and log entries (equipmentId in saved sets).
        {
            key: '_dedup_equipment_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    var eqs = dd.equipment;
                    if (!eqs || eqs.length === 0) continue;

                    // Build name → canonical (first occurrence) + dupeIds
                    var nameMap = {}; // name → { canonical: eq, dupeIds: [id, ...] }
                    for (var i = 0; i < eqs.length; i++) {
                        var n = eqs[i].name;
                        if (!n) continue;
                        if (!nameMap[n]) {
                            nameMap[n] = { canonical: eqs[i], dupeIds: [] };
                        } else {
                            nameMap[n].dupeIds.push(eqs[i].id);
                        }
                    }

                    // Build oldId → canonicalId remap
                    var remap = {};
                    var hasDupes = false;
                    for (var name in nameMap) {
                        var entry = nameMap[name];
                        if (entry.dupeIds.length === 0) continue;
                        hasDupes = true;
                        for (var di = 0; di < entry.dupeIds.length; di++) {
                            remap[entry.dupeIds[di]] = entry.canonical.id;
                        }
                    }
                    if (!hasDupes) continue;

                    // 1. Remove duplicate entries from equipment array
                    dd.equipment = eqs.filter(function(e) { return !remap[e.id]; });

                    // 2. Fix exerciseEquipment
                    if (dd.exerciseEquipment) {
                        for (var exId in dd.exerciseEquipment) {
                            var v = dd.exerciseEquipment[exId];
                            if (v && remap[v]) dd.exerciseEquipment[exId] = remap[v];
                        }
                    }

                    // 3. Fix exerciseEquipmentOptions (arrays of IDs, deduplicate after remap)
                    if (dd.exerciseEquipmentOptions) {
                        for (var exId2 in dd.exerciseEquipmentOptions) {
                            var opts = dd.exerciseEquipmentOptions[exId2];
                            if (!opts || !opts.length) continue;
                            var seen = {};
                            var newOpts = [];
                            for (var oi = 0; oi < opts.length; oi++) {
                                var mapped = remap[opts[oi]] || opts[oi];
                                if (!seen[mapped]) { seen[mapped] = true; newOpts.push(mapped); }
                            }
                            dd.exerciseEquipmentOptions[exId2] = newOpts;
                        }
                    }

                    // 4. Fix gymEquipmentMap
                    if (dd.gymEquipmentMap) {
                        for (var gymId in dd.gymEquipmentMap) {
                            var map = dd.gymEquipmentMap[gymId];
                            for (var mk in map) {
                                if (map[mk] && remap[map[mk]]) map[mk] = remap[map[mk]];
                            }
                        }
                    }

                    // 5. Fix equipmentId in log entries
                    if (dd.log) {
                        for (var w in dd.log) {
                            for (var d in dd.log[w]) {
                                var dayLog = dd.log[w][d];
                                for (var ek in dayLog) {
                                    if (ek.charAt(0) === '_') continue;
                                    var exLog = dayLog[ek];
                                    if (typeof exLog !== 'object' || exLog === null) continue;
                                    for (var si in exLog) {
                                        var setData = exLog[si];
                                        if (setData && setData.equipmentId && remap[setData.equipmentId]) {
                                            setData.equipmentId = remap[setData.equipmentId];
                                        }
                                    }
                                }
                            }
                        }
                    }

                    dd._lastModified = Date.now();
                    localStorage.setItem(keys[ki], JSON.stringify(dd));
                    console.log('Equipment dedup: remapped', Object.keys(remap).length, 'duplicate IDs');
                }
            }
        },
        // v15: DISABLED — was buggy. Key preserved so it never re-runs.
        { key: '_restore_orphaned_exercises_v1', fn: function() {} },
        // v16: Full repair — remove cross-day snapshots + re-bind each week to best match
        {
            key: '_fix_snapshots_full_repair_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd;
                    try { dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}'); } catch(e) { continue; }
                    if (!dd.program || !dd.log) continue;
                    var p = dd.program;
                    var snaps = p.templateSnapshots || {};
                    var dt = p.dayTemplates;
                    if (!dt) continue;

                    // Step 1: Remove all cross-day snapshots
                    for (var dStr in snaps) {
                        var daySnaps = snaps[dStr];
                        if (!Array.isArray(daySnaps)) continue;
                        snaps[dStr] = daySnaps.filter(function(s) {
                            var groups = s.groups || [];
                            for (var gi = 0; gi < groups.length; gi++) {
                                var exs = [];
                                if (groups[gi].exercise) exs.push(groups[gi].exercise);
                                if (groups[gi].exercises) exs = exs.concat(groups[gi].exercises);
                                for (var ei = 0; ei < exs.length; ei++) {
                                    var eid = exs[ei] && exs[ei].id;
                                    if (!eid) continue;
                                    var m = eid.match(/^D(\d+)E/);
                                    if (m && m[1] !== dStr) return false; // cross-day = remove
                                }
                            }
                            return true; // clean
                        });
                    }

                    // Step 2: Clear all weekTemplateVersion
                    p.weekTemplateVersion = {};

                    // Step 3: For each week/day with completed log data, find best clean snapshot
                    var totalWeeks = p.totalWeeks || 12;
                    var totalDays = Object.keys(dt).length;
                    for (var w = 1; w <= totalWeeks; w++) {
                        var wStr = String(w);
                        if (!dd.log[wStr]) continue;
                        for (var d = 1; d <= totalDays; d++) {
                            var dStr2 = String(d);
                            var dayLog = dd.log[wStr][dStr2];
                            if (!dayLog) continue;
                            // Get completed exercise IDs
                            var logEx = {};
                            for (var lk in dayLog) {
                                if (lk.charAt(0) === '_') continue;
                                var base = lk.replace(/_uni$/, '');
                                for (var sk in dayLog[lk]) {
                                    if (dayLog[lk][sk] && dayLog[lk][sk].completed) { logEx[base] = true; break; }
                                }
                            }
                            var logIds = Object.keys(logEx);
                            if (!logIds.length) continue;

                            // Count template matches
                            var tmplIds = {};
                            var tGroups = (dt[dStr2] && dt[dStr2].exerciseGroups) || [];
                            for (var tgi = 0; tgi < tGroups.length; tgi++) {
                                if (tGroups[tgi].exercise && tGroups[tgi].exercise.id) tmplIds[tGroups[tgi].exercise.id] = 1;
                                if (tGroups[tgi].exercises) {
                                    for (var tei = 0; tei < tGroups[tgi].exercises.length; tei++) {
                                        if (tGroups[tgi].exercises[tei].id) tmplIds[tGroups[tgi].exercises[tei].id] = 1;
                                    }
                                }
                            }
                            var tmplMatch = 0;
                            for (var li = 0; li < logIds.length; li++) { if (tmplIds[logIds[li]]) tmplMatch++; }

                            // Find best clean snapshot
                            var bestVer = null, bestMatch = tmplMatch;
                            var daySnaps2 = snaps[dStr2] || [];
                            for (var si2 = 0; si2 < daySnaps2.length; si2++) {
                                var sIds = {};
                                var sg = daySnaps2[si2].groups || [];
                                for (var sgi = 0; sgi < sg.length; sgi++) {
                                    if (sg[sgi].exercise && sg[sgi].exercise.id) sIds[sg[sgi].exercise.id] = 1;
                                    if (sg[sgi].exercises) {
                                        for (var sei = 0; sei < sg[sgi].exercises.length; sei++) {
                                            if (sg[sgi].exercises[sei].id) sIds[sg[sgi].exercises[sei].id] = 1;
                                        }
                                    }
                                }
                                var match = 0;
                                for (var li2 = 0; li2 < logIds.length; li2++) { if (sIds[logIds[li2]]) match++; }
                                if (match > bestMatch) { bestMatch = match; bestVer = daySnaps2[si2].version; }
                            }

                            if (bestVer) {
                                if (!p.weekTemplateVersion[wStr]) p.weekTemplateVersion[wStr] = {};
                                p.weekTemplateVersion[wStr][dStr2] = bestVer;
                            }
                        }
                    }

                    dd._lastModified = Date.now();
                    localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        }
    ]
};