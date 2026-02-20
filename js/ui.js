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

        let daysHtml = '';
        for (let d = 0; d < 5; d++) {
            const dayNum = d + 1;
            const { completed, total } = getCompletedSets(weekNum, dayNum);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const template = PROGRAM.dayTemplates[dayNum];
            const dayTitle = template ? template.titleRu : `День ${dayNum}`;
            const isDone = total > 0 && completed >= total;
            const isNext = progress.week === weekNum && progress.day === dayNum;

            let cardClass = 'day-card';
            if (isNext) cardClass += ' today';
            if (isDone) cardClass += ' done';

            daysHtml += `
                <a class="${cardClass}" href="#/week/${weekNum}/day/${dayNum}">
                    <div class="day-header">
                        <span class="day-number">${isDone ? '&#10003; ' : ''}День ${dayNum}</span>
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

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <div class="header-title">
                    <h1>Трекер Тренировок</h1>
                </div>
                <button class="settings-btn" id="btn-settings">&#9881;</button>
            </div>
            <div class="app-content">
                <div class="week-nav">
                    <button id="prev-week" ${weekNum <= 1 ? 'disabled' : ''}>&#9664;</button>
                    <div class="week-label">
                        <h2>Неделя ${weekNum} из 12</h2>
                    </div>
                    <button id="next-week" ${weekNum >= 12 ? 'disabled' : ''}>&#9654;</button>
                </div>
                ${daysHtml}
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
                <button class="back-btn" id="btn-back">&#9664;</button>
                <div class="header-title">
                    <h1>Нед.${weekNum} / День ${dayNum}</h1>
                    <div class="header-subtitle">${dayTitle}</div>
                </div>
            </div>
            <div class="app-content">
                ${html}
            </div>
        `;
    },

    _renderExercise(ex, weekNum, dayNum) {
        let setsHtml = '';
        for (let i = 0; i < ex.sets.length; i++) {
            setsHtml += this._renderSetRow(ex, i, weekNum, dayNum);
        }

        const restText = formatRest(ex.rest);

        // Equipment selector
        const eqId = Storage.getExerciseEquipment(ex.id);
        const eq = eqId ? Storage.getEquipmentById(eqId) : null;
        const eqLabel = eq ? eq.name : 'Оборудование';
        const eqHtml = `
            <div class="equipment-row">
                <button class="equipment-btn" data-exercise="${ex.id}">
                    ${eqLabel} &#9662;
                </button>
            </div>
        `;

        return `
            <div class="exercise-card">
                <div class="exercise-header">
                    <div class="exercise-name">${ex.nameRu || ex.name}</div>
                    <div class="exercise-meta">
                        <span>${ex.reps} повт</span>
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
        const unit = Storage.getWeightUnit();
        const unitLabel = unit === 'lbs' ? 'lbs' : 'кг';
        const prevText = prev ? `пред: ${prev.weight}${unitLabel} x ${prev.reps}` : '';

        // Type badge
        const typeClass = `type-${set.type}`;
        const typeLabels = { S: 'С', SH: 'С/Г', H: 'Г' };
        const typeLabel = typeLabels[set.type] || set.type;

        // Technique badges
        let techHtml = '';
        if (set.techniques && set.techniques.length > 0) {
            const techLabels = {
                'DROP': 'DROP',
                'REST_PAUSE': 'R-P',
                'MP': 'МП',
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

        return `
            <div class="set-row" data-exercise="${ex.id}" data-set="${setIdx}">
                <div class="set-info">
                    <span class="set-number">П.${setIdx + 1}</span>
                    <span class="set-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="rpe-badge">${set.rpe}</span>
                    <span class="set-reps">${ex.reps}</span>
                    ${techHtml}
                </div>
                <div class="set-inputs">
                    <div class="input-group">
                        <label>${unitLabel}</label>
                        <input type="text" inputmode="decimal" pattern="[0-9]*\\.?[0-9]*"
                            class="weight-input"
                            data-exercise="${ex.id}" data-set="${setIdx}"
                            value="${weightVal}"
                            placeholder="${placeholderW}">
                    </div>
                    <div class="input-group">
                        <label>повт</label>
                        <input type="text" inputmode="numeric" pattern="[0-9]*"
                            class="reps-input"
                            data-exercise="${ex.id}" data-set="${setIdx}"
                            value="${repsVal}"
                            placeholder="${placeholderR}">
                    </div>
                    <button class="complete-btn ${isCompleted ? 'completed' : ''}"
                        data-exercise="${ex.id}" data-set="${setIdx}">
                        ${isCompleted ? '&#10003;' : ''}
                    </button>
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
                <div class="superset-label">Суперсет</div>
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

        const chosenName = chosen ? (chosen.nameRu || chosen.name) : 'Выберите';

        let exerciseHtml = '';
        if (chosen) {
            exerciseHtml = this._renderExercise(chosen, weekNum, dayNum);
        }

        return `
            <div class="choose-one-group">
                <div class="choose-one-header">
                    <button class="choose-one-btn" data-choice-key="${choiceKey}">
                        ${chosenName} &#9662;
                    </button>
                </div>
                ${exerciseHtml}
            </div>
        `;
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

            if (maxWeight > 0) {
                contentHtml += `<div class="history-max">Максимальный вес: ${maxWeight} ${unitLabel}</div>`;
            }
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-history">&#9664;</button>
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

    // ===== WEIGHT INPUT MODAL =====
    showWeightModal(inputEl) {
        const currentVal = inputEl.value || inputEl.placeholder || '0';
        const unit = Storage.getWeightUnit();
        const unitLabel = unit === 'lbs' ? 'lbs' : 'кг';
        const otherLabel = unit === 'lbs' ? 'кг' : 'lbs';
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'weight-modal';
        overlay.innerHTML = `
            <div class="weight-modal">
                <div class="modal-header">
                    <h3>Вес (<span id="modal-unit-label">${unitLabel}</span>)</h3>
                    <button class="unit-toggle" id="unit-toggle">${unitLabel} &harr; ${otherLabel}</button>
                    <button class="modal-done" id="modal-done">Готово</button>
                </div>
                <div class="modal-value" id="modal-value">${currentVal}</div>
                <div class="quick-adjust">
                    <button data-adjust="1.25">+1.25</button>
                    <button data-adjust="2.5">+2.5</button>
                    <button data-adjust="5">+5</button>
                    <button data-adjust="10">+10</button>
                    <button data-adjust="-1.25">-1.25</button>
                    <button data-adjust="-2.5">-2.5</button>
                    <button data-adjust="-5">-5</button>
                    <button data-adjust="-10">-10</button>
                </div>
                <div class="numpad">
                    <button data-num="1">1</button>
                    <button data-num="2">2</button>
                    <button data-num="3">3</button>
                    <button data-num="4">4</button>
                    <button data-num="5">5</button>
                    <button data-num="6">6</button>
                    <button data-num="7">7</button>
                    <button data-num="8">8</button>
                    <button data-num="9">9</button>
                    <button data-num=".">.</button>
                    <button data-num="0">0</button>
                    <button data-num="backspace" class="numpad-clear">&#9003;</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lockBodyScroll();

        // Store reference to the input element and current display unit
        overlay._targetInput = inputEl;
        overlay._isTyping = false;
        overlay._displayUnit = unit; // 'kg' or 'lbs'

        blockOverlayScroll(overlay, '.weight-modal');
        // Handle clicks inside the modal directly
        overlay.addEventListener('click', function(e) {
            App.handleClick(e);
        });
    },

    hideWeightModal() {
        const modal = document.getElementById('weight-modal');
        if (modal) {
            modal.remove();
        }
        if (!document.querySelector('.modal-overlay')) {
            unlockBodyScroll();
        }
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

        let eqListHtml = '';
        for (const eq of equipmentList) {
            eqListHtml += `
                <div class="settings-eq-item">
                    <span>${eq.name}</span>
                    <div class="eq-item-actions">
                        <button class="eq-edit-btn" data-eq-id="${eq.id}">&#9998;</button>
                        <button class="eq-remove-btn" data-eq-id="${eq.id}">&times;</button>
                    </div>
                </div>
            `;
        }
        if (equipmentList.length === 0) {
            eqListHtml = '<div class="settings-eq-empty">Нет оборудования</div>';
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-settings">&#9664;</button>
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
                            <input type="date" id="settings-start-date" value="${settings.startDate || ''}">
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="settings-card-label">Единицы</div>
                    <div class="setup-field" style="margin-bottom: 0;">
                        <div class="cycle-toggle">
                            <button data-unit="kg" ${unit === 'kg' ? 'class="active"' : ''}>кг</button>
                            <button data-unit="lbs" ${unit === 'lbs' ? 'class="active"' : ''}>lbs</button>
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
                        <button class="eq-add-btn" id="settings-eq-add">+</button>
                    </div>
                </div>

                <div class="settings-card settings-danger" style="margin-top: var(--spacing-sm);">
                    <button class="btn-danger" id="btn-reset">⚠ Сбросить все данные</button>
                </div>

            </div>
        `;
    }
};
