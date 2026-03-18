/* ===== Utility Functions ===== */

// Exercise display name based on language setting
function exName(ex) {
    if (!ex) return '';
    var lang = (typeof Storage !== 'undefined' && Storage._data && Storage._data.settings)
        ? Storage._data.settings.exerciseLang : 'ru';
    if (lang === 'en') return ex.name || ex.nameRu || '';
    return ex.nameRu || ex.name || '';
}

// Exercise thumbnail URL from name (matches Supabase storage path)
var EX_THUMB_BASE = 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/exercise-thumbs/';
var _exThumbLookup = null;
function _buildThumbLookup() {
    if (_exThumbLookup) return;
    _exThumbLookup = {};
    if (typeof EXERCISE_DB !== 'undefined') {
        for (var i = 0; i < EXERCISE_DB.length; i++) {
            var ex = EXERCISE_DB[i];
            if (ex.name) {
                _exThumbLookup[ex.name.toLowerCase()] = ex.name;
                if (ex.nameRu) _exThumbLookup[ex.nameRu.toLowerCase()] = ex.name;
            }
        }
    }
}
function exThumbUrl(name, nameRu) {
    if (!name && !nameRu) return '';
    _buildThumbLookup();
    // Try resolving via EXERCISE_DB: check name first, then nameRu
    var resolved = null;
    if (_exThumbLookup) {
        if (name) resolved = _exThumbLookup[name.toLowerCase()];
        if (!resolved && nameRu) resolved = _exThumbLookup[nameRu.toLowerCase()];
    }
    var canonical = resolved || name || nameRu;
    return EX_THUMB_BASE + canonical.replace(/ /g, '_').replace(/[()\/]/g, '_') + '.jpg';
}
function exThumbHtml(name, sizeOrNameRu, size) {
    // Supports: exThumbHtml(name), exThumbHtml(name, size), exThumbHtml(name, nameRu, size)
    var nameRu = null;
    var sz = null;
    if (typeof sizeOrNameRu === 'string') { nameRu = sizeOrNameRu; sz = size; }
    else { sz = sizeOrNameRu; }
    if (!name && !nameRu) return '';
    var cls = sz ? ' style="width:' + sz + 'px;height:' + sz + 'px"' : '';
    return '<img class="ex-thumb" src="' + exThumbUrl(name, nameRu) + '" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'"' + cls + '>';
}
// Mark already-cached images as loaded instantly (prevents flicker on re-render)
function markCachedThumbs(root) {
    var imgs = (root || document).querySelectorAll('.ex-thumb:not(.loaded)');
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].complete && imgs[i].naturalWidth > 0) imgs[i].classList.add('loaded');
    }
}

const MONTHS_RU = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function getTotalWeeks() {
    var p = Storage.getProgram();
    return p ? p.totalWeeks : 12;
}

function getTotalDays() {
    var p = Storage.getProgram();
    return p ? Object.keys(p.dayTemplates).length : 5;
}

function validateProgram(data) {
    if (!data || typeof data !== 'object') return 'Неверный формат JSON';
    if (!data.title || typeof data.title !== 'string') return 'Отсутствует title';
    if (!data.totalWeeks || typeof data.totalWeeks !== 'number') return 'Отсутствует totalWeeks';
    if (!data.dayTemplates || typeof data.dayTemplates !== 'object') return 'Отсутствует dayTemplates';
    const days = Object.keys(data.dayTemplates);
    if (days.length === 0) return 'dayTemplates пуст';
    for (const dayKey of days) {
        const day = data.dayTemplates[dayKey];
        if (!day.exerciseGroups || !Array.isArray(day.exerciseGroups)) {
            return `День ${dayKey}: отсутствует exerciseGroups`;
        }
    }
    if (!data.weeklyOverrides) data.weeklyOverrides = {};
    return null;
}

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

function getCurrentPosition(startDate, cycleType) {
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
 * Find an exercise by ID across ALL days in a program.
 * Builds on findExerciseInTemplate() → getGroupExercises().
 */
function findExerciseInProgram(program, exerciseId) {
    if (!program || !program.dayTemplates) return null;
    for (var dNum in program.dayTemplates) {
        var ex = findExerciseInTemplate(program.dayTemplates[dNum], exerciseId);
        if (ex) return ex;
    }
    return null;
}

/**
 * Collect ALL exercises from a program with their day numbers.
 * Returns [{ exercise, day }]. Handles all group types via getGroupExercises().
 */
function getAllProgramExercises(program) {
    var result = [];
    if (!program) return result;
    var templates = program.dayTemplates;
    if (templates) {
        for (var dNum in templates) {
            var groups = templates[dNum].exerciseGroups || [];
            for (var g = 0; g < groups.length; g++) {
                var exercises = getGroupExercises(groups[g]);
                for (var i = 0; i < exercises.length; i++) {
                    result.push({ exercise: exercises[i], day: parseInt(dNum) });
                }
            }
        }
    }
    // Legacy format support
    if (program.days) {
        for (var d = 0; d < program.days.length; d++) {
            var dayGroups = program.days[d].groups || [];
            for (var g2 = 0; g2 < dayGroups.length; g2++) {
                var exs = getGroupExercises(dayGroups[g2]);
                for (var i2 = 0; i2 < exs.length; i2++) {
                    result.push({ exercise: exs[i2], day: d + 1 });
                }
            }
        }
    }
    return result;
}

/**
 * Resolve a workout for a given week/day by merging the day template
 * with any weekly overrides.
 * data.js structure: weeklyOverrides[weekNum][dayNum][exerciseId].sets[setIdx]
 */
function resolveWorkout(week, day) {
    const p = Storage.getProgram();
    const template = deepClone(p.dayTemplates[day]);
    if (!template) return null;

    const weekOverrides = p.weeklyOverrides[week];
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

function formatRest(rest) {
    if (!rest || rest === '-') return '';
    if (typeof rest === 'number') {
        if (rest >= 60) return `>${Math.floor(rest / 60)}'`;
        return `${rest}"`;
    }
    return rest;
}
