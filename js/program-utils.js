/* ===== Program Utility Functions (Storage-dependent) ===== */
import { Storage } from './storage.js';
import { deepClone, findExerciseInTemplate, getGroupExercises, parseLocalDate } from './utils.js';

// Deterministic exercise ID: D{dayNum}:{nameSlug}
// No positional suffix — moveExercise() changes position but ID stays stable
export function makeDeterministicExId(dayNum, name, assignedIds) {
    var slug = (name || 'exercise')
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]/gi, '_')
        .replace(/_+/g, '_')
        .slice(0, 30);
    var base = 'D' + dayNum + ':' + slug;
    if (!assignedIds || !assignedIds.has(base)) return base;
    var i = 2;
    while (assignedIds.has(base + '_' + i)) i++;
    return base + '_' + i;
}

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
    if (!p) return null;
    const template = deepClone(p.dayTemplates[day]);
    if (!template) return null;

    // Snapshot from log (created at workout start, sync-safe)
    const logDay = Storage.getLogDay(week, day);
    if (logDay && logDay._template) {
        template.exerciseGroups = deepClone(logDay._template);
    }

    // Apply set-level overrides (progression techniques)
    _applyOverrides(template, p, week, day);
    return template;
}

function _applyOverrides(template, p, week, day) {
    const weekOverrides = p.weeklyOverrides && p.weeklyOverrides[week];
    const dayOverrides = weekOverrides && weekOverrides[day];
    if (!dayOverrides) return;
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
                const logId = Storage.getLogExerciseId(ex.id);
                const log = Storage.getSetLog(week, day, logId, i)
                    || (logId !== ex.id ? Storage.getSetLog(week, day, ex.id, i) : null);
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
    var lastActive = 1;
    for (var week = 1; week <= getTotalWeeks(); week++) {
        for (var day = 1; day <= getTotalDays(); day++) {
            var result = getCompletedSets(week, day);
            if (result.total > 0 && result.completed < result.total) {
                return { week: week, day: day };
            }
            if (result.completed > 0) lastActive = week;
        }
    }
    // Everything done — show last active week; nothing started — week 1
    return { week: lastActive, day: 1 };
}
