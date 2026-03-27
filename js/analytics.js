/* ===== Analytics Module — PR detection, streaks, 1RM calculations ===== */
import { Storage } from './storage.js';
import { EXERCISE_DB } from './exercises_db.js';
import { getTotalWeeks, getTotalDays, getCompletedSets } from './program-utils.js';

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
    // Returns PR info if this set is a record, or null
    checkPR(exerciseId, weight, reps, currentWeek, currentDay) {
        if (!weight || weight <= 0 || !reps || reps <= 0) return null;

        const history = Storage.getExerciseHistory(exerciseId);
        if (!history || history.length === 0) return null;

        const current1RM = this.estimated1RM(weight, reps);

        // Collect all previous completed sets (excluding current week/day)
        let prevBest1RM = 0;
        let prevBestWeightAtReps = 0;

        for (const entry of history) {
            // Skip current session
            if (entry.week === currentWeek && entry.day === currentDay) continue;
            for (const s of entry.sets) {
                if (!s.weight || !s.reps) continue;
                const e1rm = this.estimated1RM(s.weight, s.reps);
                if (e1rm > prevBest1RM) prevBest1RM = e1rm;
                if (s.reps === reps && s.weight > prevBestWeightAtReps) {
                    prevBestWeightAtReps = s.weight;
                }
            }
        }

        // Need at least one previous session to compare
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

    // Check if a historical set was a PR at the time it was recorded
    wasSetPR(exerciseId, targetWeek, targetDay, targetSetIdx) {
        const history = Storage.getExerciseHistory(exerciseId);
        if (!history || history.length === 0) return false;

        // Find the target set
        let targetWeight = 0, targetReps = 0;
        for (const entry of history) {
            if (entry.week === targetWeek && entry.day === targetDay) {
                for (const s of entry.sets) {
                    if (s.setIdx === targetSetIdx) {
                        targetWeight = s.weight;
                        targetReps = s.reps;
                        break;
                    }
                }
                break;
            }
        }
        if (!targetWeight || !targetReps) return false;

        const target1RM = this.estimated1RM(targetWeight, targetReps);

        // Check all sets that happened BEFORE this one
        for (const entry of history) {
            if (entry.week > targetWeek || (entry.week === targetWeek && entry.day >= targetDay)) continue;
            for (const s of entry.sets) {
                if (!s.weight || !s.reps) continue;
                const e1rm = this.estimated1RM(s.weight, s.reps);
                if (e1rm >= target1RM) return false; // not a PR — someone was better before
            }
        }
        return true; // no previous set had higher 1RM
    },

    // Check if a set is currently the all-time best for this exercise
    isAllTimeBest(exerciseId, weight, reps) {
        if (!weight || weight <= 0 || !reps || reps <= 0) return false;
        const history = Storage.getExerciseHistory(exerciseId);
        if (!history) return false;

        const current1RM = this.estimated1RM(weight, reps);
        for (const entry of history) {
            for (const s of entry.sets) {
                if (!s.weight || !s.reps) continue;
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
