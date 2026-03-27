/* ===== Analytics Module — PR detection, streaks, 1RM calculations ===== */
import { Storage } from './storage.js';
import { EXERCISE_DB, EXERCISE_CATEGORIES } from './exercises_db.js';
import { getTotalWeeks, getTotalDays, getCompletedSets, resolveWorkout, exName } from './program-utils.js';
import { getGroupExercises } from './utils.js';

// ===== Funny PR toast messages (bodybuilding humor) =====
const PR_TOASTS = [
    'Олимпия ждёт тебя!',
    'Арнольд, случайно не твой отец?',
    'Самсон Дауда нервно курит в сторонке',
    'Крис Бамстед передаёт привет',
    'Ронни Колман шепчет: "Light weight, baby!"',
    'Где твоя заявка на Олимпию?',
    'Зал в шоке. Штанга в шоке. Все в шоке.',
    'Гравитация просит пощады',
    'Дориан Ятс одобряет',
    'Это был не подход, это было заявление',
    'Штанга: "За что?!"',
    'Тренажёр хочет подать жалобу',
    'Рекорд побит. Как и чувства штанги.',
    'Джей Катлер звонит — хочет узнать секрет',
    'Это вообще легально?!',
    'Новый рекорд. Старый даже не расстроился.',
    'Блины на штанге аплодируют стоя',
    'Ты — машина!',
    'Да ты монстр!',
    'Халк позавидовал бы',
];

const STREAK_BROKEN_MESSAGES = [
    'Серия прервана. Зал скучает по тебе!',
    'Штанга ржавеет без тебя!',
    'Тренажёры простаивают...',
    'Блины пылятся. Вернись!',
    'Зал отправил тебе запрос в друзья',
];

export const Analytics = {

    // ===== Estimated 1RM (Brzycki formula) =====
    estimated1RM(weight, reps) {
        if (!weight || weight <= 0 || !reps || reps <= 0) return 0;
        if (reps === 1) return weight;
        if (reps >= 37) return Math.round(weight * 2);
        return Math.round(weight * 36 / (37 - reps) * 10) / 10;
    },

    // ===== PR Detection =====
    // Filter sets by equipmentId — PR is per-equipment
    _matchesEquipment(setEqId, filterEqId) {
        // Both null/undefined = no equipment = same context
        if (!setEqId && !filterEqId) return true;
        return setEqId === filterEqId;
    },

    // Returns PR info if this set is a record, or null
    // PR is strictly per-equipment (or no-equipment vs no-equipment)
    checkPR(exerciseId, weight, reps, currentWeek, currentDay, equipmentId) {
        if (!weight || weight <= 0 || !reps || reps <= 0) return null;

        const history = Storage.getExerciseHistory(exerciseId);
        if (!history || history.length === 0) return null;

        const current1RM = this.estimated1RM(weight, reps);

        let prevBest1RM = 0;
        let prevBestWeightAtReps = 0;

        for (const entry of history) {
            if (entry.week === currentWeek && entry.day === currentDay) continue;
            for (const s of entry.sets) {
                if (!s.weight || !s.reps) continue;
                if (!this._matchesEquipment(s.equipmentId, equipmentId)) continue;
                const e1rm = this.estimated1RM(s.weight, s.reps);
                if (e1rm > prevBest1RM) prevBest1RM = e1rm;
                if (s.reps === reps && s.weight > prevBestWeightAtReps) {
                    prevBestWeightAtReps = s.weight;
                }
            }
        }

        // Need at least one previous session on same equipment to compare
        if (prevBest1RM === 0) return null;

        // Check 1RM PR
        if (current1RM > prevBest1RM) {
            return {
                type: '1rm',
                old: prevBest1RM,
                new: current1RM,
                toast: this._randomPRToast()
            };
        }

        // Check weight PR at same reps
        if (prevBestWeightAtReps > 0 && weight > prevBestWeightAtReps) {
            return {
                type: 'weight_at_reps',
                reps,
                old: prevBestWeightAtReps,
                new: weight,
                toast: this._randomPRToast()
            };
        }

        return null;
    },

    // Check if a set is currently the all-time best for this exercise
    // Strictly per-equipment (or no-equipment vs no-equipment)
    isAllTimeBest(exerciseId, weight, reps, equipmentId) {
        if (!weight || weight <= 0 || !reps || reps <= 0) return false;
        const history = Storage.getExerciseHistory(exerciseId);
        if (!history) return false;

        const current1RM = this.estimated1RM(weight, reps);
        for (const entry of history) {
            for (const s of entry.sets) {
                if (!s.weight || !s.reps) continue;
                if (!this._matchesEquipment(s.equipmentId, equipmentId)) continue;
                if (this.estimated1RM(s.weight, s.reps) > current1RM) return false;
            }
        }
        return true;
    },

    // ===== PR Records Table — best weight at each rep count =====
    getPRTable(exerciseId) {
        const history = Storage.getExerciseHistory(exerciseId);
        if (!history || history.length === 0) return [];

        // Map: reps → { weight, week, day }
        const bestByReps = {};
        for (const entry of history) {
            for (const s of entry.sets) {
                if (!s.weight || s.weight <= 0 || !s.reps || s.reps <= 0) continue;
                const key = s.reps;
                if (!bestByReps[key] || s.weight > bestByReps[key].weight) {
                    bestByReps[key] = { weight: s.weight, reps: s.reps, week: entry.week, day: entry.day };
                }
            }
        }

        // Sort by reps ascending
        return Object.values(bestByReps).sort((a, b) => a.reps - b.reps);
    },

    // ===== 1RM Progression over weeks =====
    get1RMProgression(exerciseId) {
        const history = Storage.getExerciseHistory(exerciseId);
        if (!history) return [];

        const weekMap = {};
        for (const entry of history) {
            for (const s of entry.sets) {
                if (!s.weight || !s.reps) continue;
                const e1rm = this.estimated1RM(s.weight, s.reps);
                if (!weekMap[entry.week] || e1rm > weekMap[entry.week].e1rm) {
                    weekMap[entry.week] = { e1rm, weight: s.weight, reps: s.reps };
                }
            }
        }

        return Object.entries(weekMap)
            .map(([week, data]) => ({ week: Number(week), ...data }))
            .sort((a, b) => a.week - b.week);
    },

    // ===== Streak calculation =====
    getStreak() {
        const totalWeeks = getTotalWeeks();
        const totalDays = getTotalDays();
        let currentStreak = 0;
        let bestStreak = 0;
        let streakBroken = false;

        // Walk backwards from most recent completed week
        // A week counts as "completed" if all training days have at least 1 completed set
        for (let week = totalWeeks; week >= 1; week--) {
            let weekHasAnyLog = false;
            let weekFullyDone = true;

            for (let day = 1; day <= totalDays; day++) {
                const result = getCompletedSets(week, day);
                if (result.total === 0) continue; // empty day template, skip
                if (result.completed > 0) {
                    weekHasAnyLog = true;
                } else {
                    weekFullyDone = false;
                }
            }

            if (!weekHasAnyLog) {
                // No logs at all — this week hasn't happened yet (future) or was skipped
                // If we already saw completed weeks, this breaks the streak
                if (currentStreak > 0) {
                    streakBroken = true;
                    break;
                }
                continue; // skip future/untouched weeks
            }

            if (weekFullyDone) {
                currentStreak++;
            } else {
                // Partially done — could be current week (in progress)
                // Count it if it has activity, but don't break streak
                if (currentStreak === 0) {
                    // This is the most recent active week, partially done — skip for streak count
                    // (current week in progress doesn't count as broken)
                } else {
                    streakBroken = true;
                    break;
                }
            }
        }

        // Calculate best streak (walk forward)
        let runStreak = 0;
        for (let week = 1; week <= totalWeeks; week++) {
            let weekFullyDone = true;
            let weekHasAnyLog = false;
            for (let day = 1; day <= totalDays; day++) {
                const result = getCompletedSets(week, day);
                if (result.total === 0) continue;
                if (result.completed > 0) weekHasAnyLog = true;
                else weekFullyDone = false;
            }
            if (weekHasAnyLog && weekFullyDone) {
                runStreak++;
                if (runStreak > bestStreak) bestStreak = runStreak;
            } else if (weekHasAnyLog) {
                // Partially done — reset
                runStreak = 0;
            }
            // untouched weeks don't reset (might be future)
        }

        if (currentStreak > bestStreak) bestStreak = currentStreak;

        return {
            current: currentStreak,
            best: bestStreak,
            broken: streakBroken,
            brokenMessage: streakBroken ? this._randomStreakMessage() : null
        };
    },

    // ===== Helpers =====
    _randomPRToast() {
        return PR_TOASTS[Math.floor(Math.random() * PR_TOASTS.length)];
    },

    _randomStreakMessage() {
        return STREAK_BROKEN_MESSAGES[Math.floor(Math.random() * STREAK_BROKEN_MESSAGES.length)];
    },

    // ===== Dashboard: Weekly Volume by Muscle Group =====
    getWeeklyMuscleVolume(weekNum) {
        const totalDays = getTotalDays();
        const result = {}; // { category: { sets: 0, catNameRu: '' } }

        for (let day = 1; day <= totalDays; day++) {
            const workout = resolveWorkout(weekNum, day);
            if (!workout || !workout.exerciseGroups) continue;

            for (const group of workout.exerciseGroups) {
                const exercises = getGroupExercises(group);
                for (const ex of exercises) {
                    const cat = this._findCategory(ex);
                    if (!cat) continue;

                    const logExId = Storage.getLogExerciseId(ex.id);
                    const numSets = ex.sets ? ex.sets.length : 0;
                    for (let s = 0; s < numSets; s++) {
                        const log = Storage.getSetLog(weekNum, day, logExId, s);
                        if (log && log.completed) {
                            if (!result[cat]) {
                                const catObj = EXERCISE_CATEGORIES.find(c => c.id === cat);
                                result[cat] = { sets: 0, nameRu: catObj ? catObj.nameRu : cat };
                            }
                            result[cat].sets++;
                        }
                    }
                }
            }
        }

        // Sort by sets descending
        return Object.entries(result)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.sets - a.sets);
    },

    // ===== Dashboard: Weekly Tonnage =====
    getWeeklyTonnage(weekNum) {
        const totalDays = getTotalDays();
        let tonnage = 0;
        let completedSets = 0;

        for (let day = 1; day <= totalDays; day++) {
            const workout = resolveWorkout(weekNum, day);
            if (!workout || !workout.exerciseGroups) continue;

            for (const group of workout.exerciseGroups) {
                const exercises = getGroupExercises(group);
                for (const ex of exercises) {
                    const logExId = Storage.getLogExerciseId(ex.id);
                    const numSets = ex.sets ? ex.sets.length : 0;
                    for (let s = 0; s < numSets; s++) {
                        const log = Storage.getSetLog(weekNum, day, logExId, s);
                        if (log && log.completed) {
                            completedSets++;
                            if (log.weight > 0 && log.reps > 0) {
                                tonnage += log.weight * log.reps;
                            }
                        }
                    }
                }
            }
        }

        return { tonnage: Math.round(tonnage), completedSets };
    },

    // ===== Dashboard: Tonnage sparkline across all weeks =====
    getTonnageByWeek() {
        const totalWeeks = getTotalWeeks();
        const data = [];
        for (let w = 1; w <= totalWeeks; w++) {
            const { tonnage } = this.getWeeklyTonnage(w);
            if (tonnage > 0) data.push({ week: w, tonnage });
        }
        return data;
    },

    // ===== Dashboard: Week stats =====
    getWeekStats(weekNum) {
        const totalDays = getTotalDays();
        let trainedDays = 0;
        let totalTrainingDays = 0;
        let prCount = 0;

        for (let day = 1; day <= totalDays; day++) {
            const result = getCompletedSets(weekNum, day);
            if (result.total === 0) continue;
            totalTrainingDays++;
            if (result.completed > 0) trainedDays++;
        }

        return { trainedDays, totalTrainingDays };
    },

    // ===== Dashboard: Week-over-week comparison =====
    getWeekComparison(weekNum) {
        if (weekNum <= 1) return [];
        const prevWeek = weekNum - 1;
        const totalDays = getTotalDays();
        const exercises = {}; // exId → { name, current: { weight, reps }, prev: { weight, reps } }

        for (const [wk, label] of [[weekNum, 'current'], [prevWeek, 'prev']]) {
            for (let day = 1; day <= totalDays; day++) {
                const workout = resolveWorkout(wk, day);
                if (!workout || !workout.exerciseGroups) continue;
                for (const group of workout.exerciseGroups) {
                    const exList = getGroupExercises(group);
                    for (const ex of exList) {
                        const logExId = Storage.getLogExerciseId(ex.id);
                        let bestWeight = 0;
                        const numSets = ex.sets ? ex.sets.length : 0;
                        for (let s = 0; s < numSets; s++) {
                            const log = Storage.getSetLog(wk, day, logExId, s);
                            if (log && log.completed && log.weight > bestWeight) {
                                bestWeight = log.weight;
                            }
                        }
                        if (bestWeight > 0) {
                            if (!exercises[ex.id]) {
                                exercises[ex.id] = { name: exName(ex), current: 0, prev: 0 };
                            }
                            if (label === 'current' && bestWeight > exercises[ex.id].current) {
                                exercises[ex.id].current = bestWeight;
                            }
                            if (label === 'prev' && bestWeight > exercises[ex.id].prev) {
                                exercises[ex.id].prev = bestWeight;
                            }
                        }
                    }
                }
            }
        }

        // Filter: only exercises present in both weeks
        return Object.values(exercises)
            .filter(e => e.current > 0 && e.prev > 0)
            .map(e => ({
                name: e.name,
                current: e.current,
                prev: e.prev,
                diff: e.current - e.prev,
                pct: Math.round(((e.current - e.prev) / e.prev) * 100)
            }))
            .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    },

    // ===== Dashboard: Average workout duration for a week =====
    getAvgWorkoutDuration(weekNum) {
        const totalDays = getTotalDays();
        const durations = [];

        for (let day = 1; day <= totalDays; day++) {
            const data = Storage._load();
            const w = String(weekNum), d = String(day);
            if (!data.log[w] || !data.log[w][d]) continue;

            const finishedAt = data.log[w][d]._finishedAt;
            if (!finishedAt) continue;

            // Find earliest completed set timestamp
            let minTs = Infinity;
            for (const exId of Object.keys(data.log[w][d])) {
                if (exId.charAt(0) === '_') continue;
                const exData = data.log[w][d][exId];
                if (typeof exData !== 'object' || exData === null) continue;
                for (const setData of Object.values(exData)) {
                    if (setData && setData.completed && setData.timestamp && setData.timestamp < minTs) {
                        minTs = setData.timestamp;
                    }
                }
            }

            if (minTs < Infinity && finishedAt > minTs) {
                const durationMin = Math.round((finishedAt - minTs) / 60000);
                if (durationMin > 0 && durationMin < 300) { // sanity: < 5 hours
                    durations.push(durationMin);
                }
            }
        }

        if (durations.length === 0) return null;
        const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        return { avg, count: durations.length };
    },

    // Find category for an exercise from EXERCISE_DB
    _findCategory(ex) {
        const name = ex.name || '';
        const nameRu = ex.nameRu || '';
        // Check substitution
        const sub = Storage.getSubstitution(ex.id);
        const searchNameRu = sub || nameRu;
        for (const dbEx of EXERCISE_DB) {
            if ((dbEx.name && dbEx.name === name) || (dbEx.nameRu && dbEx.nameRu === searchNameRu)) {
                return dbEx.category;
            }
        }
        return null;
    },

    // Get exercise category from EXERCISE_DB
    _getExerciseCategory(exerciseId) {
        const program = Storage.getProgram();
        if (!program) return null;
        // Find exercise in program
        for (const dayKey of Object.keys(program.dayTemplates)) {
            const tmpl = program.dayTemplates[dayKey];
            if (!tmpl || !tmpl.exerciseGroups) continue;
            for (const group of tmpl.exerciseGroups) {
                const exercises = group.exercises || (group.exercise ? [group.exercise] : []);
                for (const ex of exercises) {
                    if (ex && ex.id === exerciseId) {
                        // Look up in DB
                        const name = ex.name || '';
                        const nameRu = ex.nameRu || '';
                        for (const dbEx of EXERCISE_DB) {
                            if (dbEx.name === name || dbEx.nameRu === nameRu) {
                                return dbEx.category;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
};
