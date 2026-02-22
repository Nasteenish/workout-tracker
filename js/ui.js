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
    // ===== LOGIN SCREEN =====
    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-screen">
                <div class="app-icon">&#127947;</div>
                <h1>Трекер Тренировок</h1>
                <p class="subtitle">Войдите в свой аккаунт</p>

                <div class="login-field">
                    <label for="login-input">Логин</label>
                    <input type="text" id="login-input" autocomplete="username" autocapitalize="none" placeholder="Введите логин">
                </div>

                <div class="login-field">
                    <label for="password-input">Пароль</label>
                    <input type="password" id="password-input" autocomplete="current-password" placeholder="Введите пароль">
                </div>

                <div id="login-error" class="login-error" style="display:none"></div>

                <button class="btn-primary" id="login-submit">ВОЙТИ</button>
            </div>
        `;

        // Submit on Enter key
        var passInput = document.getElementById('password-input');
        if (passInput) {
            passInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('login-submit').click();
                }
            });
        }
        var loginInput = document.getElementById('login-input');
        if (loginInput) {
            loginInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('password-input').focus();
                }
            });
        }
    },

    // ===== SETUP SCREEN =====
    renderSetup() {
        // Phase 2: program loaded, need date/cycle setup
        if (PROGRAM && !Storage.isSetup()) {
            const today = formatDateISO(new Date());
            const programTitle = PROGRAM.title || 'Трекер Тренировок';
            const totalW = getTotalWeeks();
            const athleteName = PROGRAM.athlete ? `<p class="subtitle" style="opacity:0.5;margin-top:4px">${PROGRAM.athlete}</p>` : '';
            document.getElementById('app').innerHTML = `
                <div class="setup-screen">
                    <div class="app-icon">&#127947;</div>
                    <h1>${programTitle}</h1>
                    <p class="subtitle">${totalW}-недельная программа</p>
                    ${athleteName}

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
            return;
        }

        // Phase 1: no program — show import screen
        const hasDefault = typeof DEFAULT_PROGRAM !== 'undefined';
        document.getElementById('app').innerHTML = `
            <div class="setup-screen">
                <div class="app-icon">&#127947;</div>
                <h1>Трекер Тренировок</h1>
                <p class="subtitle">Загрузите программу тренировок</p>

                <div class="setup-field">
                    <button class="btn-primary" id="setup-import-program">
                        ЗАГРУЗИТЬ ПРОГРАММУ
                    </button>
                    <div id="program-status" style="min-height:24px;margin-top:8px;font-size:13px;text-align:center"></div>
                </div>

                ${hasDefault ? '<button class="btn-secondary" id="setup-use-default" style="margin-top:8px;opacity:0.6">Программа по умолчанию</button>' : ''}
            </div>
        `;
    },

    // ===== WEEK VIEW =====
    // Returns just the week day-cards HTML (used by swipe companion too)
    _weekCardsHTML(weekNum) {
        const progress = getProgressWeek();
        const settings = Storage.getSettings();
        const cycleType = settings.cycleType || 7;

        const numDays = getTotalDays();
        let slots;
        if (cycleType === 8 && numDays === 5) {
            // Original 8-day layout for 5-day programs
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
        } else if (cycleType === 7 && numDays === 5) {
            // Original 7-day layout for 5-day programs
            slots = [
                { type: 'day', dayNum: 1 },
                { type: 'day', dayNum: 2 },
                { type: 'day', dayNum: 3 },
                { type: 'rest' },
                { type: 'day', dayNum: 4 },
                { type: 'day', dayNum: 5 },
                { type: 'rest' },
            ];
        } else {
            // Dynamic layout: N training days + rest days to fill cycle
            slots = [];
            for (let d = 1; d <= numDays; d++) {
                slots.push({ type: 'day', dayNum: d });
            }
            const restDays = Math.max(0, cycleType - numDays);
            for (let r = 0; r < restDays; r++) {
                slots.push({ type: 'rest' });
            }
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

                const lastTs = Storage.getLastTrainingDate(weekNum, dayNum);
                let trainedDateHtml = '';
                if (lastTs) {
                    const dt = new Date(lastTs);
                    const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
                    trainedDateHtml = `<div class="day-trained-date">${dt.getDate()} ${months[dt.getMonth()]}</div>`;
                }

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
                        ${trainedDateHtml}
                    </a>
                `;
            }
        }

        return cardsHtml;
    },

    // Returns full week view HTML (for back-swipe companion)
    _weekViewHTML(weekNum) {
        const cardsHtml = this._weekCardsHTML(weekNum);
        const currentUser = Storage.getCurrentUser();
        const headerName = currentUser ? currentUser.name : 'Трекер Тренировок';
        return `
            <div class="app-header">
                <div class="header-title">
                    <h1>${headerName}</h1>
                </div>
                <div class="settings-btn">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                        <circle cx="5" cy="6" r="2.2" fill="currentColor"/><line x1="7" y1="6" x2="17" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="6" r="2.2" fill="currentColor"/>
                        <circle cx="5" cy="12" r="2.2" fill="currentColor"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="12" r="2.2" fill="currentColor"/>
                        <circle cx="5" cy="18" r="2.2" fill="currentColor"/><line x1="7" y1="18" x2="17" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="18" r="2.2" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            <div class="app-content">
                <div class="week-nav">
                    <button>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 15l-5-5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="week-label">
                        <div class="week-num">${weekNum}</div>
                        <div class="week-sublabel">неделя из ${getTotalWeeks()}</div>
                    </div>
                    <button>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                <div class="slide-container">
                    <div class="week-slide">
                    ${cardsHtml}
                    </div>
                </div>
                <div class="data-actions">
                    <button>Экспорт</button>
                    <button>Импорт</button>
                </div>
            </div>
        `;
    },

    renderWeek(weekNum) {
        const cardsHtml = this._weekCardsHTML(weekNum);
        const currentUser = Storage.getCurrentUser();
        const headerName = currentUser ? currentUser.name : 'Трекер Тренировок';

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <div class="header-title">
                    <h1>${headerName}</h1>
                </div>
                <button class="settings-btn" id="btn-settings">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                        <circle cx="5" cy="6" r="2.2" fill="currentColor"/><line x1="7" y1="6" x2="17" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="6" r="2.2" fill="currentColor"/>
                        <circle cx="5" cy="12" r="2.2" fill="currentColor"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="12" r="2.2" fill="currentColor"/>
                        <circle cx="5" cy="18" r="2.2" fill="currentColor"/><line x1="7" y1="18" x2="17" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="18" r="2.2" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="app-content">
                <div class="week-nav">
                    <button id="prev-week">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 15l-5-5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="week-label">
                        <div class="week-num">${weekNum}</div>
                        <div class="week-sublabel">неделя из ${getTotalWeeks()}</div>
                    </div>
                    <button id="next-week">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                <div class="slide-container">
                    <div class="week-slide">
                    ${cardsHtml}
                    </div>
                </div>
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
                <div class="slide-container">
                    <div class="day-slide">
                    ${html}
                    </div>
                </div>
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
                    <div class="exercise-name ${choiceKey ? 'exercise-name-chooser' : ''}" ${choiceKey ? `data-choice-key="${choiceKey}"` : ''}>${choiceKey ? this._nameWithBadge(ex.nameRu || ex.name) : (ex.nameRu || ex.name)}</div>
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

        // Drop changes weight+reps; pauses change reps only
        const techs = set.techniques || [];
        const weightSegCount = 1 + techs.filter(t => ['DROP','DROP_OR_REST'].includes(t)).length;
        const segCount = 1 + techs.filter(t => ['DROP','REST_PAUSE','MP','DROP_OR_REST'].includes(t)).length;

        const getSegData = (i) => {
            const raw = log && log.segs && log.segs[String(i)];
            if (!raw) return { weight: '', reps: '' };
            if (typeof raw === 'object') return { weight: raw.weight ?? '', reps: raw.reps ?? '' };
            return { weight: '', reps: raw }; // legacy plain value
        };

        // Build weight input area (split only for DROP, not for pauses)
        let weightInputHtml;
        if (weightSegCount === 1) {
            weightInputHtml = `<input type="text" inputmode="decimal" pattern="[0-9]*\\.?[0-9]*"
                class="weight-input"
                data-exercise="${ex.id}" data-set="${setIdx}"
                value="${weightVal}" placeholder="${placeholderW}">`;
        } else {
            let parts = `<input type="text" inputmode="decimal" pattern="[0-9]*\\.?[0-9]*"
                class="weight-input seg-weight-input split-main"
                data-exercise="${ex.id}" data-set="${setIdx}" data-seg="0"
                value="${weightVal}" placeholder="${placeholderW}">`;
            for (let i = 1; i < weightSegCount; i++) {
                const sv = getSegData(i).weight;
                parts += `<span class="split-sep">+</span><input type="text" inputmode="decimal" pattern="[0-9]*\\.?[0-9]*"
                    class="seg-weight-input split-extra"
                    data-exercise="${ex.id}" data-set="${setIdx}" data-seg="${i}"
                    value="${sv}" placeholder="">`;
            }
            weightInputHtml = `<div class="split-reps">${parts}</div>`;
        }

        // Build reps input area
        let repsInputHtml;
        if (segCount === 1) {
            repsInputHtml = `<input type="text" inputmode="numeric" pattern="[0-9]*"
                class="reps-input"
                data-exercise="${ex.id}" data-set="${setIdx}"
                value="${repsVal}" placeholder="${placeholderR}">`;
        } else {
            let parts = `<input type="text" inputmode="numeric" pattern="[0-9]*"
                class="reps-input seg-reps-input split-main"
                data-exercise="${ex.id}" data-set="${setIdx}" data-seg="0"
                value="${repsVal}" placeholder="${placeholderR}">`;
            for (let i = 1; i < segCount; i++) {
                const sv = getSegData(i).reps;
                parts += `<span class="split-sep">+</span><input type="text" inputmode="numeric" pattern="[0-9]*"
                    class="seg-reps-input split-extra"
                    data-exercise="${ex.id}" data-set="${setIdx}" data-seg="${i}"
                    value="${sv}" placeholder="">`;
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
                        ${weightInputHtml}
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

    _nameWithBadge(name) {
        const badge = `<span class="chooser-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        const lastSpace = name.lastIndexOf(' ');
        if (lastSpace > 0) {
            return `${name.substring(0, lastSpace)} <span class="chooser-nowrap">${name.substring(lastSpace + 1)}${badge}</span>`;
        }
        return `<span class="chooser-nowrap">${name}${badge}</span>`;
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
        const allHistory = Storage.getExerciseHistory(exerciseId);
        const unit = Storage.getExerciseUnit(exerciseId) || Storage.getWeightUnit();
        const unitLabels = { kg: 'кг', lbs: 'lbs', plates: 'пл' };
        const unitLabel = unitLabels[unit] || 'кг';
        const currentEqId = Storage.getExerciseEquipment(exerciseId);
        const currentEq = currentEqId ? Storage.getEquipmentById(currentEqId) : null;

        // Find exercise name using getGroupExercises helper
        let exerciseName = exerciseId;
        for (let d = 1; d <= getTotalDays(); d++) {
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

        // Filter history by current equipment if selected
        let history, otherHistory;
        if (currentEqId) {
            history = allHistory.map(entry => {
                const filteredSets = entry.sets.filter(s => s.equipmentId === currentEqId);
                return filteredSets.length > 0 ? { ...entry, sets: filteredSets } : null;
            }).filter(Boolean);
            otherHistory = allHistory.map(entry => {
                const filteredSets = entry.sets.filter(s => s.equipmentId !== currentEqId);
                return filteredSets.length > 0 ? { ...entry, sets: filteredSets } : null;
            }).filter(Boolean);
        } else {
            history = allHistory;
            otherHistory = [];
        }

        let contentHtml = '';
        if (history.length === 0 && otherHistory.length === 0) {
            contentHtml = '<p class="history-empty">Нет записей</p>';
        } else {
            let maxWeight = 0;

            const renderEntries = (entries) => {
                let html = '';
                for (const entry of entries) {
                    let setsHtml = '';
                    for (const s of entry.sets) {
                        if (s.weight > maxWeight) maxWeight = s.weight;
                        setsHtml += `
                            <div class="history-set">
                                <span>П.${s.setIdx + 1}:</span>
                                <span class="weight-value">${s.weight}${unitLabel} x ${s.reps}</span>
                            </div>
                        `;
                    }
                    html += `
                        <div class="history-week">
                            <div class="history-week-title">Неделя ${entry.week}, День ${entry.day}</div>
                            ${setsHtml}
                        </div>
                    `;
                }
                return html;
            };

            // Sparkline — max weight per entry (last 8), based on filtered data
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
                contentHtml += `<div class="history-sparkline">${bars}</div>`;
            }

            if (currentEq) {
                contentHtml += `<div class="history-equipment-title">${currentEq.name}</div>`;
            }

            if (history.length > 0) {
                contentHtml += renderEntries(history);
            } else if (currentEqId) {
                contentHtml += '<p class="history-empty">Нет записей для этого оборудования</p>';
            }

            // Show other equipment data as secondary section
            if (otherHistory.length > 0) {
                // Group other entries by equipment
                const byEquipment = {};
                for (const entry of otherHistory) {
                    const eqKey = (entry.sets[0] && entry.sets[0].equipmentId) || '_none';
                    if (!byEquipment[eqKey]) byEquipment[eqKey] = [];
                    byEquipment[eqKey].push(entry);
                }
                for (const eqKey of Object.keys(byEquipment)) {
                    const eq = eqKey !== '_none' ? Storage.getEquipmentById(eqKey) : null;
                    const eqName = eq ? eq.name : 'Без оборудования';
                    contentHtml += `<div class="history-equipment-title history-other-eq">${eqName}</div>`;
                    contentHtml += renderEntries(byEquipment[eqKey]);
                }
            }

            if (maxWeight > 0) {
                contentHtml += `<div class="history-max">Максимальный вес: ${maxWeight} ${unitLabel}</div>`;
            }
        }

        const subtitleParts = [exerciseName];
        if (currentEq) subtitleParts.push(currentEq.name);

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-history"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>История</h1>
                    <div class="header-subtitle">${subtitleParts.join(' · ')}</div>
                </div>
            </div>
            <div class="app-content">
                ${contentHtml}
            </div>
        `;
    },

    // ===== EQUIPMENT MODAL =====
    showEquipmentModal(exerciseId) {
        // Show only equipment linked to this exercise
        const exerciseEquipment = Storage.getExerciseEquipmentOptions(exerciseId);
        const currentEqId = Storage.getExerciseEquipment(exerciseId);

        let optionsHtml = `
            <div class="eq-option ${!currentEqId ? 'selected' : ''}" data-eq-id="" data-exercise="${exerciseId}">
                Без оборудования
            </div>
        `;
        for (const eq of exerciseEquipment) {
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
        for (let d = 1; d <= getTotalDays(); d++) {
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

    // ===== MENU =====
    _menuHTML() {
        const GEAR_SVG = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/></svg>';
        const BOOK_SVG = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const CALC_SVG = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7z" stroke="currentColor" stroke-width="1.7"/><path d="M8 7h8v3H8V7z" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1"/><circle cx="8.5" cy="14" r="0.8" fill="currentColor"/><circle cx="12" cy="14" r="0.8" fill="currentColor"/><circle cx="15.5" cy="14" r="0.8" fill="currentColor"/><circle cx="8.5" cy="17" r="0.8" fill="currentColor"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/><circle cx="15.5" cy="17" r="0.8" fill="currentColor"/></svg>';
        const currentUser = Storage.getCurrentUser();
        const LOGOUT_SVG = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        return `
            <div class="app-header">
                <button class="back-btn" id="btn-back-menu"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Меню</h1>
                </div>
            </div>
            <div class="app-content">
                <a class="menu-card" href="#/settings">
                    <div class="menu-card-icon">${GEAR_SVG}</div>
                    <div class="menu-card-text">
                        <div class="menu-card-title">Настройки</div>
                        <div class="menu-card-desc">Программа, таймер, единицы, оборудование</div>
                    </div>
                    <svg class="menu-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <a class="menu-card" href="#/guide">
                    <div class="menu-card-icon">${BOOK_SVG}</div>
                    <div class="menu-card-text">
                        <div class="menu-card-title">Справочник</div>
                        <div class="menu-card-desc">Типы подходов, RPE, техники интенсивности</div>
                    </div>
                    <svg class="menu-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <a class="menu-card" href="#/calculator">
                    <div class="menu-card-icon">${CALC_SVG}</div>
                    <div class="menu-card-text">
                        <div class="menu-card-title">Калькулятор</div>
                        <div class="menu-card-desc">Перевод фунтов в килограммы</div>
                    </div>
                    <svg class="menu-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>

                <div class="menu-card" id="btn-logout">
                    <div class="menu-card-icon">${LOGOUT_SVG}</div>
                    <div class="menu-card-text">
                        <div class="menu-card-title">Выйти</div>
                        <div class="menu-card-desc">${currentUser ? currentUser.name : ''}</div>
                    </div>
                </div>
            </div>
        `;
    },
    renderMenu() {
        document.getElementById('app').innerHTML = this._menuHTML();
    },

    // ===== GUIDE =====
    renderGuide() {
        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-guide"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Справочник</h1>
                </div>
            </div>
            <div class="app-content">

                <div class="guide-card">
                    <div class="guide-card-label">Типы подходов</div>
                    <div class="guide-item">
                        <span class="set-type-badge type-S">S</span>
                        <div class="guide-item-text">
                            <div class="guide-item-title">Сила</div>
                            <div class="guide-item-desc">Взрывные повторения. Фокус на перемещении веса с максимальной силой и скоростью. Каждое повторение — мощное и резкое. Первый подход направлен на увеличение силы или количества повторений от тренировки к тренировке.</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="set-type-badge type-SH">S/H</span>
                        <div class="guide-item-text">
                            <div class="guide-item-title">Сила / Гипертрофия</div>
                            <div class="guide-item-desc">Начинаешь подконтрольно, ближе к отказу переключаешься на взрывное выполнение. Комбинация контроля и мощности.</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="set-type-badge type-H">H</span>
                        <div class="guide-item-text">
                            <div class="guide-item-title">Гипертрофия</div>
                            <div class="guide-item-desc">Все повторения подконтрольные. Фокус на сокращении мышцы и чувстве нагрузки. Медленная негативная фаза.</div>
                        </div>
                    </div>
                </div>

                <div class="guide-card">
                    <div class="guide-card-label">Шкала RPE</div>
                    <div class="guide-item">
                        <span class="rpe-badge">RPE 7</span>
                        <div class="guide-item-text">
                            <div class="guide-item-desc">3 повторения до отказа — вес ощущается тяжёлым, но есть запас</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="rpe-badge">RPE 8</span>
                        <div class="guide-item-text">
                            <div class="guide-item-desc">2 повторения до отказа — тяжело, мог бы сделать ещё 2</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="rpe-badge">RPE 9</span>
                        <div class="guide-item-text">
                            <div class="guide-item-desc">1 повторение до отказа — очень тяжело, максимум ещё 1</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="rpe-badge">RPE 10</span>
                        <div class="guide-item-text">
                            <div class="guide-item-desc">Полный отказ — больше ни одного повторения с правильной техникой</div>
                        </div>
                    </div>
                </div>

                <div class="guide-card">
                    <div class="guide-card-label">Техники интенсивности</div>
                    <div class="guide-item">
                        <span class="tech-badge tech-DROP">DROP</span>
                        <div class="guide-item-text">
                            <div class="guide-item-title">Дроп-сет</div>
                            <div class="guide-item-desc">После последнего подхода снижаешь вес на 20-30% и сразу продолжаешь повторения до отказа без отдыха.</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="tech-badge tech-REST_PAUSE">R-P</span>
                        <div class="guide-item-text">
                            <div class="guide-item-title">Отдых-пауза</div>
                            <div class="guide-item-desc">После последнего подхода отдыхаешь 10-15 секунд с тем же весом, затем продолжаешь повторения до отказа.</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <span class="tech-badge tech-MP">MP</span>
                        <div class="guide-item-text">
                            <div class="guide-item-title">Микро-пауза</div>
                            <div class="guide-item-desc">После отказа отдыхаешь максимум 5 секунд, затем делаешь ещё 1-3 повторения. Можно повторить несколько раз.</div>
                        </div>
                    </div>
                </div>

                <div class="guide-card">
                    <div class="guide-card-label">Обозначения в программе</div>
                    <div class="guide-item">
                        <div class="guide-item-text">
                            <div class="guide-item-desc"><strong>+1 DROP</strong> — после последнего подхода сделай 1 дроп-сет</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <div class="guide-item-text">
                            <div class="guide-item-desc"><strong>+1 REST</strong> — после последнего подхода сделай 1 рест-паузу</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <div class="guide-item-text">
                            <div class="guide-item-desc"><strong>+1 MP</strong> — после последнего подхода сделай 1 микро-паузу</div>
                        </div>
                    </div>
                    <div class="guide-item">
                        <div class="guide-item-text">
                            <div class="guide-item-desc"><strong>+2 DROP</strong>, <strong>+2 MP</strong> — цифра означает количество дополнительных подходов с техникой</div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    },

    // ===== CALCULATOR =====
    renderCalculator() {
        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-calc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Калькулятор</h1>
                </div>
            </div>
            <div class="app-content">
                <div class="calc-card">
                    <div class="calc-row">
                        <div class="calc-field">
                            <label class="calc-label">Фунты (lbs)</label>
                            <input type="number" inputmode="decimal" class="calc-input" id="calc-lbs" placeholder="0">
                        </div>
                        <div class="calc-arrow">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 17l10-10M17 7v10M17 7H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/></svg>
                        </div>
                        <div class="calc-field">
                            <label class="calc-label">Килограммы (кг)</label>
                            <input type="number" inputmode="decimal" class="calc-input" id="calc-kg" placeholder="0">
                        </div>
                    </div>
                </div>
                <div class="calc-hint">1 lb = 0.4536 кг</div>
            </div>
        `;

        const lbsInput = document.getElementById('calc-lbs');
        const kgInput = document.getElementById('calc-kg');
        let activeSrc = null;

        lbsInput.addEventListener('input', () => {
            activeSrc = 'lbs';
            const v = parseFloat(lbsInput.value);
            kgInput.value = isNaN(v) ? '' : (v * 0.453592).toFixed(2).replace(/\.?0+$/, '');
        });

        kgInput.addEventListener('input', () => {
            activeSrc = 'kg';
            const v = parseFloat(kgInput.value);
            lbsInput.value = isNaN(v) ? '' : (v / 0.453592).toFixed(2).replace(/\.?0+$/, '');
        });

        lbsInput.addEventListener('focus', () => { activeSrc = 'lbs'; });
        kgInput.addEventListener('focus', () => { activeSrc = 'kg'; });
    },

    // ===== SETTINGS =====
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
