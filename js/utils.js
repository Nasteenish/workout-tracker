/* ===== Utility Functions ===== */

const MONTHS_RU = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

/** Parse "YYYY-MM-DD" as local date (avoids UTC shift bug) */
function parseLocalDate(str) {
    if (str instanceof Date) return new Date(str.getFullYear(), str.getMonth(), str.getDate());
    var p = String(str).split('-');
    return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
}

function formatDate(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

function formatDateFull(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    return `${DAYS_RU[d.getDay()]}, ${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

function formatDateISO(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getScheduleDates(startDate, cycleType) {
    const dates = [];
    const start = parseLocalDate(startDate);
    for (let week = 0; week < 12; week++) {
        const weekDates = [];
        for (let day = 0; day < 5; day++) {
            const totalDays = week * cycleType + day;
            const date = new Date(start);
            date.setDate(start.getDate() + totalDays);
            weekDates.push(date);
        }
        dates.push(weekDates);
    }
    return dates;
}

function getCurrentPosition(startDate, cycleType) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = parseLocalDate(startDate);
    const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    if (daysSinceStart < 0) return { week: 1, day: 1, isRestDay: false, isProgramComplete: false };
    const cycleNumber = Math.floor(daysSinceStart / cycleType);
    const dayInCycle = daysSinceStart % cycleType;
    if (cycleNumber >= 12) return { week: 12, day: 5, isRestDay: false, isProgramComplete: true };
    const isRestDay = dayInCycle >= 5;
    return {
        week: cycleNumber + 1,
        day: isRestDay ? null : dayInCycle + 1,
        isRestDay,
        isProgramComplete: false
    };
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function debounce(fn, ms) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

/**
 * Resolve a superset exercise item — it may be a normal exercise
 * or a _chooseOne wrapper (Day 4 has choose_one inside supersets).
 */
function resolveSupersetItem(item) {
    if (item._chooseOne) {
        const chosenId = Storage.getChoice(item.choiceKey);
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
 * Get all exercises from an exercise group, normalizing the data.js structure.
 * Returns an array of exercise objects (resolving _chooseOne inside supersets).
 */
function getGroupExercises(group) {
    if (group.type === 'single' || group.type === 'warmup') {
        return group.exercise ? [group.exercise] : [];
    }
    if (group.type === 'superset') {
        const exercises = group.exercises || [];
        const result = [];
        for (const item of exercises) {
            if (item._chooseOne) {
                // Add all options so IDs can be found
                for (const opt of (item.options || [])) {
                    result.push(opt);
                }
            } else {
                result.push(item);
            }
        }
        return result;
    }
    if (group.type === 'choose_one') {
        return group.options || [];
    }
    return [];
}

/**
 * Find an exercise by ID across all groups in a template.
 */
function findExerciseInTemplate(template, exerciseId) {
    for (const group of template.exerciseGroups) {
        const exercises = getGroupExercises(group);
        for (const ex of exercises) {
            if (ex.id === exerciseId) return ex;
        }
    }
    return null;
}

/**
 * Resolve a workout for a given week/day by merging the day template
 * with any weekly overrides.
 * data.js structure: weeklyOverrides[weekNum][dayNum][exerciseId].sets[setIdx]
 */
function resolveWorkout(week, day) {
    const template = deepClone(PROGRAM.dayTemplates[day]);
    if (!template) return null;

    const weekOverrides = PROGRAM.weeklyOverrides[week];
    if (!weekOverrides) return template;

    const dayOverrides = weekOverrides[day];
    if (!dayOverrides) return template;

    for (const [exerciseId, exOverride] of Object.entries(dayOverrides)) {
        const exercise = findExerciseInTemplate(template, exerciseId);
        if (!exercise || !exOverride.sets) continue;

        for (const [setIdx, setOverride] of Object.entries(exOverride.sets)) {
            const idx = parseInt(setIdx);
            if (exercise.sets[idx]) {
                Object.assign(exercise.sets[idx], setOverride);
            }
        }
    }

    return template;
}

/**
 * Calculate total sets for a day's workout.
 */
function getTotalSets(workout) {
    let total = 0;
    for (const group of workout.exerciseGroups) {
        if (group.type === 'choose_one') {
            const chosen = getChosenExercise(group);
            if (chosen) {
                total += chosen.sets.length;
            }
        } else if (group.type === 'superset') {
            for (const item of (group.exercises || [])) {
                const ex = resolveSupersetItem(item);
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
function getCompletedSets(week, day) {
    const workout = resolveWorkout(week, day);
    if (!workout) return { completed: 0, total: 0 };

    const total = getTotalSets(workout);
    let completed = 0;

    for (const group of workout.exerciseGroups) {
        let exercises;
        if (group.type === 'choose_one') {
            exercises = [getChosenExercise(group)];
        } else if (group.type === 'superset') {
            exercises = (group.exercises || []).map(resolveSupersetItem);
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
function getChosenExercise(group) {
    const choiceKey = group.choiceKey;
    const chosenId = Storage.getChoice(choiceKey);
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
function getProgressWeek() {
    for (var week = 1; week <= 12; week++) {
        for (var day = 1; day <= 5; day++) {
            var result = getCompletedSets(week, day);
            if (result.total > 0 && result.completed < result.total) {
                return { week: week, day: day };
            }
        }
    }
    // Everything done or nothing started
    return { week: 1, day: 1 };
}

function formatRest(rest) {
    if (!rest || rest === '-') return '';
    if (typeof rest === 'number') {
        if (rest >= 60) return `>${Math.floor(rest / 60)}'`;
        return `${rest}"`;
    }
    return rest;
}
