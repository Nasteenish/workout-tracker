/* ===== UI Rendering Module ===== */

function lockBodyScroll() {
    document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
    document.body.classList.remove('modal-open');
}

function blockOverlayScroll(overlay, scrollableSelector) {
    overlay.addEventListener('touchmove', function(e) {
        if (!e.target.closest(scrollableSelector)) {
            e.preventDefault();
        }
    }, { passive: false });
}

const UI = {
    // ===== SETUP SCREEN =====
    renderSetup() {
        const today = formatDateISO(new Date());
        document.getElementById('app').innerHTML = `
            <div class="setup-screen">
                <div class="app-icon">&#127947;</div>
                <h1>Трекер Тренировок</h1>
                <p class="subtitle">12-недельная программа</p>

                <div class="setup-field">
                    <label>Тип цикла</label>
                    <div class="cycle-toggle">
                        <button class="active" data-cycle="7">7 дней</button>
                        <button data-cycle="8">8 дней</button>
                    </div>
                </div>

                <div class="setup-field">
                    <label>Дата начала программы</label>
                    <input type="date" id="start-date" value="${today}">
                </div>

                <button class="btn-primary" id="setup-start" onclick="App.startSetup()">НАЧАТЬ</button>
            </div>
        `;
    },

    // ===== WEEK VIEW =====
    renderWeek(weekNum) {
        const progress = getProgressWeek();
        const settings = Storage.getSettings();
        const cycleType = settings.cycleType || 7;

        // Slot sequences per cycle type (from the program structure):
        // 7-day: Day1, Day2, Day3, REST, Day4, Day5, REST
        // 8-day: Day1, Day2, REST, Day3, Day4, REST, Day5, REST
        let slots;
        if (cycleType === 8) {
            slots = [
                { type: 'day', dayNum: 1 },
                { type: 'day', dayNum: 2 },
                { type: 'rest' },
                { type: 'day', dayNum: 3 },
                { type: 'day', dayNum: 4 },
                { type: 'rest' },
                { type: 'day', dayNum: 5 },
                { type: 'rest' },
            ];
        } else {
            slots = [
                { type: 'day', dayNum: 1 },
                { type: 'day', dayNum: 2 },
                { type: 'day', dayNum: 3 },
                { type: 'rest' },
                { type: 'day', dayNum: 4 },
                { type: 'day', dayNum: 5 },
                { type: 'rest' },
            ];
        }

        const restCardHtml = `
            <div class="rest-day-card">
                <svg class="rest-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="rest-label">Отдых</span>
            </div>
        `;

        let cardsHtml = '';
        for (const slot of slots) {
            if (slot.type === 'rest') {
                cardsHtml += restCardHtml;
            } else {
                const dayNum = slot.dayNum;
                const { completed, total } = getCompletedSets(weekNum, dayNum);
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const template = PROGRAM.dayTemplates[dayNum];
                const dayTitle = template ? template.titleRu : `День ${dayNum}`;
                const isDone = total > 0 && completed >= total;
                const isNext = progress.week === weekNum && progress.day === dayNum;

                let cardClass = 'day-card';
                if (isNext) cardClass += ' today';
                if (isDone) cardClass += ' done';

                cardsHtml += `
                    <a class="${cardClass}" href="#/week/${weekNum}/day/${dayNum}">
                        <div class="day-header">
                            <span class="day-number">${isDone ? '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;margin-right:2px"><path d="M2.5 6.5l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}День ${dayNum}</span>
                            <span class="day-date">${pct}%</span>
                        </div>
                        <div class="day-title">${dayTitle}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${pct}%"></div>
                        </div>
                        <div class="progress-text">${completed}/${total} подходов</div>
                    </a>
                `;
            }
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <div class="header-title">
                    <h1>Трекер Тренировок</h1>
                </div>
                <button class="settings-btn" id="btn-settings">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/>
                    </svg>
                </button>
            </div>
            <div class="app-content">
                <div class="week-nav">
                    <button id="prev-week" ${weekNum <= 1 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 15l-5-5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="week-label">
                        <div class="week-num">${weekNum}</div>
                        <div class="week-sublabel">неделя из 12</div>
                    </div>
                    <button id="next-week" ${weekNum >= 12 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                ${cardsHtml}
                <div class="data-actions">
                    <button id="btn-export">Экспорт</button>
                    <button id="btn-import">Импорт</button>
                </div>
            </div>
        `;
    },

    // ===== DAY VIEW =====
    renderDay(weekNum, dayNum) {
        const workout = resolveWorkout(weekNum, dayNum);
        if (!workout) {
            document.getElementById('app').innerHTML = '<p>Тренировка не найдена</p>';
            return;
        }

        let html = '';
        let currentSection = '';

        for (const group of workout.exerciseGroups) {
            // Section header from group's sectionTitleRu
            const sectionTitle = group.sectionTitleRu || group.sectionTitle || '';
            if (sectionTitle && sectionTitle !== currentSection) {
                currentSection = sectionTitle;
                html += `<div class="section-header">${sectionTitle}</div>`;
            }

            if (group.type === 'warmup') {
                // Warmup exercise
                const wu = group.exercise;
                if (wu) {
                    html += `
                        <div class="warmup-section">
                            <div class="warmup-label">Разминка</div>
                            <div class="warmup-text">${wu.nameRu || wu.name}${wu.noteRu ? ' — ' + wu.noteRu : ''}</div>
                        </div>
                    `;
                }
            } else if (group.type === 'superset') {
                html += this._renderSuperset(group, weekNum, dayNum);
            } else if (group.type === 'choose_one') {
                html += this._renderChooseOne(group, weekNum, dayNum);
            } else if (group.type === 'single') {
                if (group.exercise) {
                    html += this._renderExercise(group.exercise, weekNum, dayNum);
                }
            }
        }

        const dayTitle = workout.titleRu || workout.title || `День ${dayNum}`;

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Неделя ${weekNum} / День ${dayNum}</h1>
                    <div class="header-subtitle">${dayTitle}</div>
                </div>
            </div>
            <div class="app-content">
                ${html}
            </div>
        `;
    },

    _renderExercise(ex, weekNum, dayNum, choiceKey = null) {
        let setsHtml = '';
        for (let i = 0; i < ex.sets.length; i++) {
            setsHtml += this._renderSetRow(ex, i, weekNum, dayNum);
        }

        const timerSec = Storage.getSettings().timerDuration || 120;
        const restText = timerSec >= 60
            ? `rest ${Math.floor(timerSec / 60)}min`
            : `rest ${timerSec}s`;

        // Equipment selector
        const eqId = Storage.getExerciseEquipment(ex.id);
        const eq = eqId ? Storage.getEquipmentById(eqId) : null;
        const eqLabel = eq ? eq.name : 'Оборудование';
        const eqHtml = `
            <div class="equipment-row">
                <button class="equipment-btn" data-exercise="${ex.id}">
                    ${eqLabel}<span class="chooser-badge"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </button>
            </div>
        `;

        return `
            <div class="exercise-card ${choiceKey ? 'is-chooser' : ''}">
                <div class="exercise-header">
                    <div class="exercise-name ${choiceKey ? 'exercise-name-chooser' : ''}" ${choiceKey ? `data-choice-key="${choiceKey}"` : ''}>${ex.nameRu || ex.name}${choiceKey ? `<span class="chooser-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : ''}</div>
                    <div class="exercise-meta">
                        <span>${ex.reps} reps</span>
                        ${restText ? `<span>${restText}</span>` : ''}
                    </div>
                </div>
                ${eqHtml}
                ${setsHtml}
                <button class="history-btn" data-exercise="${ex.id}">
                    История
                </button>
            </div>
        `;
    },

    _renderSetRow(ex, setIdx, weekNum, dayNum) {
        const set = ex.sets[setIdx];
        const log = Storage.getSetLog(weekNum, dayNum, ex.id, setIdx);
        const eqId = Storage.getExerciseEquipment(ex.id);
        const prev = Storage.getPreviousLog(weekNum, dayNum, ex.id, setIdx, eqId);
        const isCompleted = log && log.completed;
        const weightVal = log ? log.weight : '';
        const repsVal = log ? log.reps : '';
        const unitLabels = { kg: 'кг', lbs: 'lbs', plates: 'пл' };
        const unit = Storage.getExerciseUnit(ex.id) || Storage.getWeightUnit();
        const unitLabel = unitLabels[unit] || 'кг';
        const prevText = prev ? `пред: ${prev.weight}<span class="set-prev-unit" data-exercise="${ex.id}">${unitLabel}</span> x ${prev.reps}` : '';

        // Type badge
        const typeClass = `type-${set.type}`;
        const typeLabels = { S: 'S', SH: 'S/H', H: 'H' };
        const typeLabel = typeLabels[set.type] || set.type;

        // Technique badges
        let techHtml = '';
        if (set.techniques && set.techniques.length > 0) {
            const techLabels = {
                'DROP': 'DROP',
                'REST_PAUSE': 'R-P',
                'MP': 'MP',
                'DROP_OR_REST': 'DROP/R-P'
            };
            const techClasses = {
                'DROP': 'tech-DROP',
                'REST_PAUSE': 'tech-REST_PAUSE',
                'MP': 'tech-MP',
                'DROP_OR_REST': 'tech-DROP'
            };
            techHtml = '<div class="technique-badges">';
            for (const t of set.techniques) {
                techHtml += `<span class="tech-badge ${techClasses[t] || ''}">${techLabels[t] || t}</span>`;
            }
            techHtml += '</div>';
        }

        const placeholderW = prev ? prev.weight : '';
        const placeholderR = prev ? prev.reps : '';

        // Count extra reps segments from techniques
        const segCount = 1 + (set.techniques ? set.techniques.filter(t => ['DROP','REST_PAUSE','MP','DROP_OR_REST'].includes(t)).length : 0);

        // Build reps input area: single or split
        let repsInputHtml;
        if (segCount === 1) {
            repsInputHtml = `<input type="text" inputmode="numeric" pattern="[0-9]*"
                class="reps-input"
                data-exercise="${ex.id}" data-set="${setIdx}"
                value="${repsVal}" placeholder="${placeholderR}">`;
        } else {
            let parts = `<input type="text" inputmode="numeric" pattern="[0-9]*"
                class="reps-input seg-reps-input"
                data-exercise="${ex.id}" data-set="${setIdx}" data-seg="0"
                value="${repsVal}" placeholder="${placeholderR}">`;
            for (let i = 1; i < segCount; i++) {
                const segVal = (log && log.segs && log.segs[String(i)]) || '';
                parts += `<input type="text" inputmode="numeric" pattern="[0-9]*"
                    class="seg-reps-input"
                    data-exercise="${ex.id}" data-set="${setIdx}" data-seg="${i}"
                    value="${segVal}" placeholder="">`;
            }
            repsInputHtml = `<div class="split-reps">${parts}</div>`;
        }

        const completeSvg = isCompleted
            ? `<svg width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="cg-${ex.id}-${setIdx}" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#cg-${ex.id}-${setIdx})"/><g transform="translate(11,11)"><path d="M4 9l3.5 3.5L14 5.5" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`
            : '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18.5" stroke="rgba(157,141,245,0.4)" stroke-width="1.5"/></svg>';

        return `
            <div class="set-row" data-exercise="${ex.id}" data-set="${setIdx}">
                <div class="set-info">
                    <span class="set-number">П.${setIdx + 1}</span>
                    <span class="set-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="rpe-badge">${set.rpe}</span>
                    ${techHtml}
                </div>
                <div class="set-inputs">
                    <div class="input-group">
                        <button class="unit-cycle-btn" data-exercise="${ex.id}">${unitLabel}</button>
                        <input type="text" inputmode="decimal" pattern="[0-9]*\\.?[0-9]*"
                            class="weight-input"
                            data-exercise="${ex.id}" data-set="${setIdx}"
                            value="${weightVal}" placeholder="${placeholderW}">
                    </div>
                    <div class="input-group">
                        <label>reps</label>
                        ${repsInputHtml}
                    </div>
                    <div role="button" class="complete-btn ${isCompleted ? 'completed' : ''}"
                        data-exercise="${ex.id}" data-set="${setIdx}">${completeSvg}</div>
                </div>
                ${prevText ? `<div class="set-prev">${prevText}</div>` : ''}
            </div>
        `;
    },

    _renderSuperset(group, weekNum, dayNum) {
        const items = group.exercises || [];
        let exercisesHtml = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item._chooseOne) {
                // Render inline choose_one within superset
                exercisesHtml += this._renderChooseOne(item, weekNum, dayNum);
            } else {
                exercisesHtml += this._renderExercise(item, weekNum, dayNum);
            }
            if (i < items.length - 1) {
                exercisesHtml += '<div class="superset-arrow">&#8595; без отдыха &#8595;</div>';
            }
        }

        return `
            <div class="superset-group">
                <div class="superset-label">
                    <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><circle cx="5.5" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/><circle cx="12.5" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/></svg>
                    Суперсет
                </div>
                ${exercisesHtml}
            </div>
        `;
    },

    _renderChooseOne(group, weekNum, dayNum) {
        const choiceKey = group.choiceKey;
        const chosenId = Storage.getChoice(choiceKey);
        const options = group.options || [];
        const chosen = chosenId
            ? options.find(ex => ex.id === chosenId)
            : options[0];

        let exerciseHtml = '';
        if (chosen) {
            exerciseHtml = this._renderExercise(chosen, weekNum, dayNum, choiceKey);
        }

        return `<div class="choose-one-group">${exerciseHtml}</div>`;
    },

    // ===== HISTORY VIEW =====
    renderHistory(exerciseId) {
        const history = Storage.getExerciseHistory(exerciseId);
        const unit = Storage.getWeightUnit();
        const unitLabel = unit === 'lbs' ? 'lbs' : 'кг';

        // Find exercise name using getGroupExercises helper
        let exerciseName = exerciseId;
        for (let d = 1; d <= 5; d++) {
            const tmpl = PROGRAM.dayTemplates[d];
            if (!tmpl) continue;
            for (const group of tmpl.exerciseGroups) {
                const exercises = getGroupExercises(group);
                for (const ex of exercises) {
                    if (ex.id === exerciseId) {
                        exerciseName = ex.nameRu || ex.name;
                        break;
                    }
                }
            }
        }

        let contentHtml = '';
        if (history.length === 0) {
            contentHtml = '<p class="history-empty">Нет записей</p>';
        } else {
            // Group entries by equipmentId
            const byEquipment = {};
            let maxWeight = 0;
            for (const entry of history) {
                for (const s of entry.sets) {
                    const eqKey = s.equipmentId || '_none';
                    if (!byEquipment[eqKey]) byEquipment[eqKey] = [];
                    if (s.weight > maxWeight) maxWeight = s.weight;
                }
                // Group full entries
                const eqKey = (entry.sets[0] && entry.sets[0].equipmentId) || '_none';
                if (!byEquipment[eqKey]) byEquipment[eqKey] = [];
                byEquipment[eqKey].push(entry);
            }

            const eqKeys = Object.keys(byEquipment);
            const hasMultipleEquipment = eqKeys.length > 1 || (eqKeys.length === 1 && eqKeys[0] !== '_none');

            for (const eqKey of eqKeys) {
                const entries = byEquipment[eqKey];
                if (hasMultipleEquipment) {
                    const eq = eqKey !== '_none' ? Storage.getEquipmentById(eqKey) : null;
                    const eqName = eq ? eq.name : 'Без оборудования';
                    contentHtml += `<div class="history-equipment-title">${eqName}</div>`;
                }

                for (const entry of entries) {
                    let setsHtml = '';
                    for (const s of entry.sets) {
                        setsHtml += `
                            <div class="history-set">
                                <span>П.${s.setIdx + 1}:</span>
                                <span class="weight-value">${s.weight}${unitLabel} x ${s.reps}</span>
                            </div>
                        `;
                    }
                    contentHtml += `
                        <div class="history-week">
                            <div class="history-week-title">Неделя ${entry.week}, День ${entry.day}</div>
                            ${setsHtml}
                        </div>
                    `;
                }
            }

            // Sparkline — max weight per entry (last 8)
            const sparkWeights = history.map(e => Math.max(...e.sets.map(s => s.weight || 0))).filter(w => w > 0);
            if (sparkWeights.length > 1) {
                const sparkMax = Math.max(...sparkWeights);
                const shown = sparkWeights.slice(-8);
                const isLast = (i) => i === shown.length - 1;
                const bars = shown.map((w, i) => {
                    const pct = Math.max(10, Math.round((w / sparkMax) * 100));
                    return `<div class="spark-bar-wrap">
                        <div class="spark-bar ${isLast(i) ? 'last' : ''}" style="height:${pct}%"></div>
                        <div class="spark-label">${w}</div>
                    </div>`;
                }).join('');
                contentHtml = `<div class="history-sparkline">${bars}</div>` + contentHtml;
            }

            if (maxWeight > 0) {
                contentHtml += `<div class="history-max">Максимальный вес: ${maxWeight} ${unitLabel}</div>`;
            }
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-history"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>История</h1>
                    <div class="header-subtitle">${exerciseName}</div>
                </div>
            </div>
            <div class="app-content">
                ${contentHtml}
            </div>
        `;
    },

    // ===== EQUIPMENT MODAL =====
    showEquipmentModal(exerciseId) {
        const equipmentList = Storage.getEquipmentList();
        const currentEqId = Storage.getExerciseEquipment(exerciseId);

        let optionsHtml = `
            <div class="eq-option ${!currentEqId ? 'selected' : ''}" data-eq-id="" data-exercise="${exerciseId}">
                Без оборудования
            </div>
        `;
        for (const eq of equipmentList) {
            const isSelected = eq.id === currentEqId;
            optionsHtml += `
                <div class="eq-option ${isSelected ? 'selected' : ''}" data-eq-id="${eq.id}" data-exercise="${exerciseId}">
                    ${eq.name}
                </div>
            `;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'equipment-modal';
        overlay.innerHTML = `
            <div class="equipment-modal">
                <div class="modal-header">
                    <h3>Оборудование</h3>
                </div>
                <div class="eq-list">
                    ${optionsHtml}
                </div>
                <div class="eq-add-row">
                    <input type="text" id="eq-new-name" placeholder="Новое оборудование..." class="eq-new-input">
                    <button class="eq-add-btn" id="eq-add-btn">+</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lockBodyScroll();

        overlay._exerciseId = exerciseId;

        blockOverlayScroll(overlay, '.equipment-modal');
        overlay.addEventListener('click', function(e) {
            App.handleClick(e);
        });
    },

    hideEquipmentModal() {
        const modal = document.getElementById('equipment-modal');
        if (modal) modal.remove();
        if (!document.querySelector('.modal-overlay')) {
            unlockBodyScroll();
        }
    },

    // ===== CHOICE MODAL (choose one exercise) =====
    showChoiceModal(choiceKey) {
        // Find the group across all day templates
        let group = null;
        for (let d = 1; d <= 5; d++) {
            const tmpl = PROGRAM.dayTemplates[d];
            if (!tmpl) continue;
            for (const g of tmpl.exerciseGroups) {
                if (g.choiceKey === choiceKey) { group = g; break; }
                // Also check inside supersets
                if (g.type === 'superset' && g.exercises) {
                    for (const item of g.exercises) {
                        if (item._chooseOne && item.choiceKey === choiceKey) { group = item; break; }
                    }
                }
                if (group) break;
            }
            if (group) break;
        }
        if (!group) return;

        const options = group.options || [];
        const chosenId = Storage.getChoice(choiceKey);

        let optionsHtml = '';
        for (const ex of options) {
            const isSelected = ex.id === chosenId || (!chosenId && ex === options[0]);
            optionsHtml += `
                <div class="eq-option ${isSelected ? 'selected' : ''}"
                     data-choice-key="${choiceKey}" data-exercise-id="${ex.id}">
                    ${ex.nameRu || ex.name}
                </div>
            `;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'choice-modal';
        overlay.innerHTML = `
            <div class="equipment-modal">
                <div class="modal-header">
                    <h3>Выберите упражнение</h3>
                </div>
                <div class="eq-list">
                    ${optionsHtml}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lockBodyScroll();

        blockOverlayScroll(overlay, '.equipment-modal');
        overlay.addEventListener('click', function(e) {
            App.handleClick(e);
        });
    },

    hideChoiceModal() {
        const modal = document.getElementById('choice-modal');
        if (modal) modal.remove();
        if (!document.querySelector('.modal-overlay')) {
            unlockBodyScroll();
        }
    },

    // ===== SETTINGS MODAL =====
    renderSettings() {
        const settings = Storage.getSettings();
        const unit = Storage.getWeightUnit();
        const equipmentList = Storage.getEquipmentList();

        const startDate = settings.startDate || '';
        let formattedDate = 'Выберите дату';
        if (startDate) {
            const d = new Date(startDate + 'T00:00:00');
            formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        const svgPencil = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M11.5 2.5l3 3L4.5 15.5H1.5v-3L11.5 2.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        let eqListHtml = '';
        for (const eq of equipmentList) {
            eqListHtml += `
                <div class="settings-eq-item">
                    <span>${eq.name}</span>
                    <div class="eq-item-actions">
                        <button class="eq-edit-btn" data-eq-id="${eq.id}">${svgPencil}</button>
                        <button class="eq-remove-btn" data-eq-id="${eq.id}"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
                    </div>
                </div>
            `;
        }
        if (equipmentList.length === 0) {
            eqListHtml = '<div class="settings-eq-empty">Нет оборудования</div>';
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-settings"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Настройки</h1>
                </div>
            </div>
            <div class="app-content">

                <div class="settings-card">
                    <div class="settings-card-label">Программа</div>
                    <div class="setup-field" style="margin-bottom: var(--spacing-md);">
                        <label>Тип цикла</label>
                        <div class="cycle-toggle">
                            <button data-cycle="7" ${settings.cycleType === 7 ? 'class="active"' : ''}>7 дней</button>
                            <button data-cycle="8" ${settings.cycleType === 8 ? 'class="active"' : ''}>8 дней</button>
                        </div>
                    </div>
                    <div class="setup-field" style="margin-bottom: 0;">
                        <label>Дата начала</label>
                        <div class="date-wrapper">
                            <div class="settings-date-display" id="date-display-text">${formattedDate}</div>
                            <input type="date" id="settings-start-date" value="${startDate}" class="date-input-hidden">
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-label">Таймер отдыха</div>
                    <div class="setup-field" style="margin-bottom: 0;">
                        <label>Время по умолчанию</label>
                        <div class="td-minsec">
                            <div class="td-field-wrap">
                                <div class="td-stepper">
                                    <button class="td-step" id="td-min-minus">−</button>
                                    <span class="td-val" id="td-min-val">${Math.floor((settings.timerDuration||120)/60)}</span>
                                    <button class="td-step" id="td-min-plus">+</button>
                                </div>
                                <span class="td-field-lbl">мин</span>
                            </div>
                            <span class="td-colon">:</span>
                            <div class="td-field-wrap">
                                <div class="td-stepper">
                                    <button class="td-step" id="td-sec-minus">−</button>
                                    <span class="td-val" id="td-sec-val">${String((settings.timerDuration||120)%60).padStart(2,'0')}</span>
                                    <button class="td-step" id="td-sec-plus">+</button>
                                </div>
                                <span class="td-field-lbl">сек</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-label">Единицы</div>
                    <div class="setup-field" style="margin-bottom: 0;">
                        <div class="cycle-toggle">
                            <button data-unit="kg" ${unit === 'kg' ? 'class="active"' : ''}>кг</button>
                            <button data-unit="lbs" ${unit === 'lbs' ? 'class="active"' : ''}>lbs</button>
                            <button data-unit="plates" ${unit === 'plates' ? 'class="active"' : ''}>плитки</button>
                        </div>
                    </div>
                </div>

                <button class="btn-primary" id="settings-save">Сохранить</button>

                <div class="settings-card" style="margin-top: var(--spacing-lg);">
                    <div class="settings-card-label">Оборудование</div>
                    <div class="settings-eq-list">
                        ${eqListHtml}
                    </div>
                    <div class="eq-add-row">
                        <input type="text" id="settings-eq-name" placeholder="Название..." class="eq-new-input">
                        <button class="eq-add-btn" id="settings-eq-add"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                    </div>
                </div>

                <div class="settings-card settings-danger" style="margin-top: var(--spacing-sm);">
                    <button class="btn-danger" id="btn-reset">Сбросить все данные</button>
                </div>

            </div>
        `;

        // Update date display text when user picks a date
        const dateInput = document.getElementById('settings-start-date');
        const dateDisplay = document.getElementById('date-display-text');
        if (dateInput && dateDisplay) {
            dateInput.addEventListener('change', function() {
                if (this.value) {
                    const d = new Date(this.value + 'T00:00:00');
                    dateDisplay.textContent = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                }
            });
        }
    }
};
