/* ===== Program Utility Functions (Storage-dependent) ===== */
import { Storage } from './storage.js';
import { deepClone, findExerciseInTemplate, getGroupExercises, parseLocalDate } from './utils.js';
import { AppState } from './app-state.js';

// Exercise display name based on language setting
export function exName(ex) {
    if (!ex) return '';
    var lang = (Storage && Storage._data && Storage._data.settings)
        ? Storage._data.settings.exerciseLang : 'ru';
    if (lang === 'en') return ex.name || ex.nameRu || '';
    return ex.nameRu || ex.name || '';
}

export function getTotalWeeks() {
    var p = Storage.getProgram();
    return p ? p.totalWeeks : 12;
}

export function getTotalDays() {
    var p = Storage.getProgram();
    return p ? Object.keys(p.dayTemplates).length : 5;
}

export function getScheduleDates(startDate, cycleType) {
    const dates = [];
    const start = parseLocalDate(startDate);
    for (let week = 0; week < getTotalWeeks(); week++) {
        const weekDates = [];
        for (let day = 0; day < getTotalDays(); day++) {
            const totalDays = week * cycleType + day;
            const date = new Date(start);
            date.setDate(start.getDate() + totalDays);
            weekDates.push(date);
        }
        dates.push(weekDates);
    }
    return dates;
}

export function getCurrentPosition(startDate, cycleType) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = parseLocalDate(startDate);
    const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    if (daysSinceStart < 0) return { week: 1, day: 1, isRestDay: false, isProgramComplete: false };
    const cycleNumber = Math.floor(daysSinceStart / cycleType);
    const dayInCycle = daysSinceStart % cycleType;
    if (cycleNumber >= getTotalWeeks()) return { week: getTotalWeeks(), day: getTotalDays(), isRestDay: false, isProgramComplete: true };
    const isRestDay = dayInCycle >= getTotalDays();
    return {
        week: cycleNumber + 1,
        day: isRestDay ? null : dayInCycle + 1,
        isRestDay,
        isProgramComplete: false
    };
}

/**
 * Resolve a superset exercise item — it may be a normal exercise
 * or a _chooseOne wrapper (Day 4 has choose_one inside supersets).
 */
export function resolveSupersetItem(item, week) {
    if (item._chooseOne) {
        const chosenId = Storage.getChoice(item.choiceKey, week);
        const options = item.options || [];
        if (chosenId) {
            const found = options.find(ex => ex.id === chosenId);
            if (found) return found;
        }
        return options[0] || null;
    }
    return item;
}

/**
 * Resolve a workout for a given week/day by merging the day template
 * with any weekly overrides.
 * data.js structure: weeklyOverrides[weekNum][dayNum][exerciseId].sets[setIdx]
 */
export function resolveWorkout(week, day) {
    const p = Storage.getProgram();
    const template = deepClone(p.dayTemplates[day]);
    if (!template) return null;

    const d = String(day);

    // Check if this week is bound to a snapshot version
    const version = p.weekTemplateVersion && p.weekTemplateVersion[week]
        && p.weekTemplateVersion[week][d];
    if (version && p.templateSnapshots && p.templateSnapshots[d]) {
        const snap = p.templateSnapshots[d].find(s => s.version === version);
        if (snap) {
            template.exerciseGroups = deepClone(snap.groups);
        }
    }

    // Legacy fallback: support _frozenGroups from old data (before migration runs)
    const weekOverrides = p.weeklyOverrides && p.weeklyOverrides[week];
    const dayOverrides = weekOverrides && weekOverrides[day];
    if (dayOverrides && dayOverrides._frozenGroups && !version) {
        template.exerciseGroups = deepClone(dayOverrides._frozenGroups);
    }

    // Apply set-level overrides
    if (dayOverrides) {
        for (const [exerciseId, exOverride] of Object.entries(dayOverrides)) {
            if (exerciseId === '_frozenGroups') continue;
            const exercise = findExerciseInTemplate(template, exerciseId);
            if (!exercise || !exOverride.sets) continue;

            for (const [setIdx, setOverride] of Object.entries(exOverride.sets)) {
                const idx = parseInt(setIdx);
                if (exercise.sets[idx]) {
                    Object.assign(exercise.sets[idx], setOverride);
                }
            }
        }
    }

    return template;
}

/**
 * Calculate total sets for a day's workout.
 */
export function getTotalSets(workout, week) {
    let total = 0;
    for (const group of workout.exerciseGroups) {
        if (group.type === 'choose_one') {
            const chosen = getChosenExercise(group, week);
            if (chosen) {
                total += chosen.sets.length;
            }
        } else if (group.type === 'superset') {
            for (const item of (group.exercises || [])) {
                const ex = resolveSupersetItem(item, week);
                if (ex && ex.sets) total += ex.sets.length;
            }
        } else if (group.type === 'single') {
            if (group.exercise) {
                total += group.exercise.sets.length;
            }
        }
    }
    return total;
}

/**
 * Count completed sets for a given week/day.
 */
export function getCompletedSets(week, day) {
    const workout = resolveWorkout(week, day);
    if (!workout) return { completed: 0, total: 0 };

    const total = getTotalSets(workout, week);
    let completed = 0;

    for (const group of workout.exerciseGroups) {
        let exercises;
        if (group.type === 'choose_one') {
            exercises = [getChosenExercise(group, week)];
        } else if (group.type === 'superset') {
            exercises = (group.exercises || []).map(item => resolveSupersetItem(item, week));
        } else {
            exercises = group.exercise ? [group.exercise] : [];
        }

        for (const ex of exercises) {
            if (!ex) continue;
            for (let i = 0; i < ex.sets.length; i++) {
                const log = Storage.getSetLog(week, day, ex.id, i);
                if (log && log.completed) completed++;
            }
        }
    }

    return { completed, total };
}

/**
 * Get the chosen exercise from a choose_one group.
 */
export function getChosenExercise(group, week) {
    const choiceKey = group.choiceKey;
    const chosenId = Storage.getChoice(choiceKey, week);
    const options = group.options || [];
    if (chosenId) {
        const found = options.find(ex => ex.id === chosenId);
        if (found) return found;
    }
    return options[0] || null;
}

/**
 * Find the current progress position — first week/day that is not fully completed.
 */
export function getProgressWeek() {
    for (var week = 1; week <= getTotalWeeks(); week++) {
        for (var day = 1; day <= getTotalDays(); day++) {
            var result = getCompletedSets(week, day);
            if (result.total > 0 && result.completed < result.total) {
                return { week: week, day: day };
            }
        }
    }
    // Everything done or nothing started
    return { week: 1, day: 1 };
}

// ===== Snapshot / Template Editing Utilities =====
// Shared between builder.js and day-editor.js

/**
 * Build a fingerprint of exercise IDs + order to detect template changes.
 */
export function templateFingerprint(groups) {
    var ids = [];
    for (var g = 0; g < groups.length; g++) {
        var exs = getGroupExercises(groups[g]);
        for (var e = 0; e < exs.length; e++) {
            if (exs[e].id) ids.push(exs[e].id);
        }
    }
    return ids.join(',');
}

/**
 * Create a snapshot of the old template if it changed, and bind past weeks to the old version.
 * Must be called BEFORE updating p.dayTemplates[dayNum].exerciseGroups.
 */
export function snapshotIfChanged(p, dayNum, newGroups) {
    var oldGroups = p.dayTemplates[dayNum].exerciseGroups;
    if (!oldGroups) return;

    var oldFp = templateFingerprint(oldGroups);
    var newFp = templateFingerprint(newGroups);
    if (oldFp === newFp) return;

    var d = String(dayNum);
    if (!p.templateSnapshots) p.templateSnapshots = {};
    if (!p.templateSnapshots[d]) p.templateSnapshots[d] = [];
    if (!p.weekTemplateVersion) p.weekTemplateVersion = {};

    var snapshots = p.templateSnapshots[d];
    var nextVersion = snapshots.length + 1;

    snapshots.push({
        version: nextVersion,
        groups: JSON.parse(JSON.stringify(oldGroups))
    });

    var currentWeek = AppState.currentWeek || 1;
    for (var w = 1; w < currentWeek; w++) {
        if (!p.weekTemplateVersion[w]) p.weekTemplateVersion[w] = {};
        if (!p.weekTemplateVersion[w][d]) {
            p.weekTemplateVersion[w][d] = nextVersion;
        }
    }
    // Current week always uses the live template
    if (p.weekTemplateVersion[currentWeek]) {
        delete p.weekTemplateVersion[currentWeek][d];
    }
}

/**
 * Serialize an exercise for storage in dayTemplates.
 * Generates a new ID if the exercise doesn't have one.
 */
export function serializeExercise(ex) {
    var sets = ex.sets && ex.sets.length > 0
        ? ex.sets
        : [{ type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }];
    var id = ex._id || ex.id || ('ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    var result = {
        id: id,
        name: ex.name || ex.nameRu,
        nameRu: ex.nameRu || ex.name,
        reps: ex.reps,
        rest: ex.rest,
        sets: sets,
        note: ex.note || '',
        noteRu: ex.noteRu || ''
    };
    if (ex.progression && ex.progression.length > 0) result.progression = ex.progression;
    return result;
}

/**
 * Extract an exercise from template into editing format.
 */
export function extractExForEdit(e, dayNum) {
    if (!e) return { nameRu: '?', name: '?', reps: '8-12', rest: 120, sets: [], _id: '', note: '', noteRu: '', progression: [] };
    return {
        nameRu: e.nameRu || e.name, name: e.name || e.nameRu,
        reps: e.reps, rest: e.rest,
        note: e.note || '', noteRu: e.noteRu || '',
        sets: JSON.parse(JSON.stringify(e.sets || [])),
        _id: e.id,
        progression: e.progression ? JSON.parse(JSON.stringify(e.progression)) : extractProgression(dayNum, e.id)
    };
}

/**
 * Extract progression rules for an exercise from weeklyOverrides.
 */
export function extractProgression(dayNum, exerciseId) {
    var p = Storage.getProgram();
    if (!p || !p.weeklyOverrides || !exerciseId) return [];
    var rules = [];
    for (var w = 1; w <= p.totalWeeks; w++) {
        var dayOver = p.weeklyOverrides[w] && p.weeklyOverrides[w][dayNum];
        if (!dayOver || !dayOver[exerciseId] || !dayOver[exerciseId].sets) continue;
        var setsOver = dayOver[exerciseId].sets;
        for (var s in setsOver) {
            if (!setsOver[s].techniques) continue;
            for (var t = 0; t < setsOver[s].techniques.length; t++) {
                var tech = setsOver[s].techniques[t];
                var exists = rules.some(function(r) { return r.setIdx === parseInt(s) && r.technique === tech; });
                if (!exists) rules.push({ startWeek: w, setIdx: parseInt(s), technique: tech });
            }
        }
    }
    return rules;
}

/**
 * Sync progression rules from template exercises into weeklyOverrides.
 */
export function syncProgressionToOverrides(dayNum) {
    var p = Storage.getProgram();
    if (!p.weeklyOverrides) p.weeklyOverrides = {};

    var template = p.dayTemplates[dayNum];
    var allRules = [];

    for (var g = 0; g < template.exerciseGroups.length; g++) {
        var group = template.exerciseGroups[g];
        var exercises = getGroupExercises(group);
        for (var e = 0; e < exercises.length; e++) {
            if (exercises[e].progression && exercises[e].progression.length > 0) {
                for (var r = 0; r < exercises[e].progression.length; r++) {
                    allRules.push({ exerciseId: exercises[e].id, rule: exercises[e].progression[r] });
                }
            }
        }
    }

    if (allRules.length === 0) return;

    for (var w = 1; w <= p.totalWeeks; w++) {
        if (p.weeklyOverrides[w] && p.weeklyOverrides[w][dayNum]) {
            delete p.weeklyOverrides[w][dayNum];
        }
    }

    for (var i = 0; i < allRules.length; i++) {
        var exId = allRules[i].exerciseId;
        var rule = allRules[i].rule;
        for (var w = rule.startWeek; w <= p.totalWeeks; w++) {
            if (!p.weeklyOverrides[w]) p.weeklyOverrides[w] = {};
            if (!p.weeklyOverrides[w][dayNum]) p.weeklyOverrides[w][dayNum] = {};
            if (!p.weeklyOverrides[w][dayNum][exId]) p.weeklyOverrides[w][dayNum][exId] = { sets: {} };
            if (!p.weeklyOverrides[w][dayNum][exId].sets[rule.setIdx]) {
                p.weeklyOverrides[w][dayNum][exId].sets[rule.setIdx] = { techniques: [] };
            }
            var techs = p.weeklyOverrides[w][dayNum][exId].sets[rule.setIdx].techniques;
            if (techs.indexOf(rule.technique) === -1) techs.push(rule.technique);
        }
    }
}

/**
 * Build editing items from a day template (for both builder and day-editor).
 */
export function buildDayEditorVM(dayNum) {
    var p = Storage.getProgram();
    if (!p || !p.dayTemplates[dayNum]) return null;

    var dayTemplate = p.dayTemplates[dayNum];
    var items = [];

    for (var i = 0; i < dayTemplate.exerciseGroups.length; i++) {
        var group = dayTemplate.exerciseGroups[i];
        if (group.type === 'single' || group.type === 'warmup') {
            items.push({ type: 'single', exercise: extractExForEdit(group.exercise, dayNum) });
        } else if (group.type === 'superset' && group.exercises) {
            var exs = [];
            for (var j = 0; j < group.exercises.length; j++) {
                var e = group.exercises[j];
                if (e._chooseOne && e.options) {
                    var chosenId = Storage.getChoice(e.choiceKey);
                    var chosen = chosenId ? e.options.find(function(o) { return o.id === chosenId; }) : null;
                    exs.push(extractExForEdit(chosen || e.options[0], dayNum));
                } else {
                    exs.push(extractExForEdit(e, dayNum));
                }
            }
            items.push({ type: 'superset', exercises: exs });
        } else if (group.type === 'choose_one' && group.options) {
            var opts = [];
            for (var j = 0; j < group.options.length; j++) {
                opts.push(extractExForEdit(group.options[j], dayNum));
            }
            items.push({ type: 'choose_one', choiceKey: group.choiceKey || ('c_' + Date.now()), options: opts });
        }
    }

    return { dayNum: dayNum, items: items };
}

/**
 * Auto-save editing items back to program storage.
 * Handles snapshot creation and progression sync.
 */
export function autoSaveEditorItems(editingDay) {
    var p = Storage.getProgram();
    if (!editingDay || !p) return;

    var groups = [];
    for (var i = 0; i < editingDay.items.length; i++) {
        var item = editingDay.items[i];
        if (item.type === 'single') {
            groups.push({ type: 'single', exercise: serializeExercise(item.exercise) });
        } else if (item.type === 'superset') {
            var exs = [];
            for (var j = 0; j < item.exercises.length; j++) {
                exs.push(serializeExercise(item.exercises[j]));
            }
            groups.push({ type: 'superset', exercises: exs });
        } else if (item.type === 'choose_one') {
            var opts = [];
            for (var j = 0; j < item.options.length; j++) {
                opts.push(serializeExercise(item.options[j]));
            }
            groups.push({ type: 'choose_one', choiceKey: item.choiceKey, options: opts });
        }
    }

    snapshotIfChanged(p, editingDay.dayNum, groups);
    p.dayTemplates[editingDay.dayNum].exerciseGroups = groups;
    syncProgressionToOverrides(editingDay.dayNum);
    Storage.saveProgram(p, false);
}
