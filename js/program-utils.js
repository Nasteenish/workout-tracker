/* ===== Program Utility Functions (Storage-dependent) ===== */
import { Storage } from './storage.js';
import { deepClone, findExerciseInTemplate, getGroupExercises, parseLocalDate } from './utils.js';

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
                const log = Storage.getSetLog(week, day, Storage.getLogExerciseId(ex.id), i);
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
