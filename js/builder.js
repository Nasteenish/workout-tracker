// builder.js — Program Builder: registration, wizard, day editor, exercise picker

// Webhook URL for registration notifications (Google Apps Script)
const REGISTRATION_WEBHOOK = '';  // Set after creating Apps Script

const Builder = {
    _config: null,      // wizard temp: {title, totalWeeks, numDays}
    _editingDay: null,  // editor temp: {dayNum, exercises: [...]}

    // ===== Barbell SVG (shared) =====
    _barbellSVG: '<svg viewBox="0 0 40 40" fill="white" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="16" width="3" height="8" rx="1.5"/><rect x="6" y="11" width="4" height="18" rx="2"/><rect x="11" y="14" width="3" height="12" rx="1.5"/><rect x="14" y="18" width="12" height="4" rx="2"/><rect x="26" y="14" width="3" height="12" rx="1.5"/><rect x="30" y="11" width="4" height="18" rx="2"/><rect x="35" y="16" width="3" height="8" rx="1.5"/></svg>',

    // ===== Send registration data to webhook =====
    _notifyRegistration(login, email) {
        if (!REGISTRATION_WEBHOOK) return;
        try {
            fetch(REGISTRATION_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login: login,
                    email: email,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            }).catch(function() {});
        } catch (e) {}
    },

    // ===== REGISTRATION SCREEN =====
    renderRegister() {
        document.getElementById('app').innerHTML = `
            <div class="login-screen">
                <div class="app-icon">${this._barbellSVG}</div>
                <h1>Создать аккаунт</h1>
                <p class="subtitle">Начните отслеживать тренировки</p>

                <div class="login-field">
                    <label for="reg-login">Логин</label>
                    <input type="text" id="reg-login" autocomplete="username" autocapitalize="none" placeholder="Придумайте логин">
                </div>
                <div class="login-field">
                    <label for="reg-email">Email</label>
                    <input type="email" id="reg-email" autocomplete="email" placeholder="Ваш email">
                </div>
                <div class="login-field">
                    <label for="reg-password">Пароль</label>
                    <div class="password-wrapper">
                        <input type="password" id="reg-password" autocomplete="new-password" placeholder="Придумайте пароль">
                        <button type="button" class="password-toggle" data-target="reg-password" aria-label="Показать пароль">
                            <svg class="eye-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="eye-off-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>

                <div id="reg-error" class="login-error" style="display:none"></div>

                <button class="btn-primary" id="reg-submit">СОЗДАТЬ АККАУНТ</button>
                <button class="btn-link" id="btn-go-login">Уже есть аккаунт? Войти</button>
            </div>
        `;

        // Enter key navigation
        var loginInput = document.getElementById('reg-login');
        var emailInput = document.getElementById('reg-email');
        var passInput = document.getElementById('reg-password');
        if (loginInput) loginInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') emailInput.focus();
        });
        if (emailInput) emailInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') passInput.focus();
        });
        if (passInput) passInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') document.getElementById('reg-submit').click();
        });
    },

    handleRegister() {
        var login = (document.getElementById('reg-login').value || '').trim().toLowerCase();
        var email = (document.getElementById('reg-email').value || '').trim().toLowerCase();
        var password = (document.getElementById('reg-password').value || '').trim();
        var errEl = document.getElementById('reg-error');
        var submitBtn = document.getElementById('reg-submit');

        if (!login || !email || !password) {
            errEl.textContent = 'Заполните все поля';
            errEl.style.display = 'block';
            return;
        }
        if (login.length < 2) {
            errEl.textContent = 'Логин минимум 2 символа';
            errEl.style.display = 'block';
            return;
        }
        if (!email.includes('@')) {
            errEl.textContent = 'Введите корректный email';
            errEl.style.display = 'block';
            return;
        }
        if (password.length < 6) {
            errEl.textContent = 'Пароль минимум 6 символов';
            errEl.style.display = 'block';
            return;
        }

        // Disable button while registering
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'СОЗДАНИЕ...'; }
        errEl.style.display = 'none';

        // Register via Supabase Auth
        SupaSync.signUp(email, password, login).then(function(data) {
            if (!data || !data.user) throw new Error('Не удалось создать аккаунт');

            var supaUserId = data.user.id;
            var localId = 'supa_' + supaUserId;

            // Create local user profile
            Storage.createSelfRegisteredUser(login, login, password, email, localId);

            // Store Supabase user mapping
            localStorage.setItem('wt_supa_' + localId, supaUserId);

            // Set up sync
            SupaSync._currentSupaUserId = supaUserId;
            SupaSync._currentStorageKey = 'wt_data_' + localId;

            App.switchUser(localId);
        }).catch(function(err) {
            errEl.textContent = err.message || 'Ошибка регистрации';
            errEl.style.display = 'block';
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'СОЗДАТЬ АККАУНТ'; }
        });
    },

    // ===== WIZARD STEP 1 =====
    renderWizardStep1() {
        var cfg = this._config || { title: '', totalWeeks: 4, numDays: 4 };
        document.getElementById('app').innerHTML = `
            <div class="setup-screen" style="justify-content:flex-start;padding-top:var(--spacing-xl)">
                <h1>Новая программа</h1>
                <p class="subtitle">Настройте базовые параметры</p>

                <div class="setup-field">
                    <label>НАЗВАНИЕ ПРОГРАММЫ</label>
                    <input type="text" id="builder-title" class="form-input" placeholder="Моя программа" value="${cfg.title}">
                </div>

                <div class="setup-field">
                    <label>ДЛИТЕЛЬНОСТЬ (НЕДЕЛЬ)</label>
                    <div class="builder-toggle" id="builder-weeks-toggle">
                        <button data-val="1" ${cfg.totalWeeks===1?'class="active"':''}>1</button>
                        <button data-val="2" ${cfg.totalWeeks===2?'class="active"':''}>2</button>
                        <button data-val="4" ${cfg.totalWeeks===4?'class="active"':''}>4</button>
                        <button data-val="8" ${cfg.totalWeeks===8?'class="active"':''}>8</button>
                        <button data-val="12" ${cfg.totalWeeks===12?'class="active"':''}>12</button>
                        <button data-val="16" ${cfg.totalWeeks===16?'class="active"':''}>16</button>
                        <button data-val="999" ${cfg.totalWeeks===999?'class="active"':''}>∞</button>
                    </div>
                </div>

                <div class="setup-field">
                    <label>ТРЕНИРОВОЧНЫХ ДНЕЙ В НЕДЕЛЕ</label>
                    <div class="builder-toggle" id="builder-days-toggle">
                        ${[1,2,3,4,5,6,7].map(n => `<button data-val="${n}" ${cfg.numDays===n?'class="active"':''}>${n}</button>`).join('')}
                    </div>
                </div>

                <button class="btn-primary" id="builder-next" style="margin-top:var(--spacing-lg)">ДАЛЕЕ</button>
                <button class="btn-link" id="builder-back-setup">Назад</button>
            </div>
        `;
    },

    saveStep1() {
        var title = (document.getElementById('builder-title').value || '').trim() || 'Моя программа';
        var weeksBtn = document.querySelector('#builder-weeks-toggle button.active');
        var daysBtn = document.querySelector('#builder-days-toggle button.active');
        this._config = {
            title: title,
            totalWeeks: weeksBtn ? parseInt(weeksBtn.dataset.val) : 4,
            numDays: daysBtn ? parseInt(daysBtn.dataset.val) : 5
        };
    },

    // ===== WIZARD STEP 2 =====
    renderWizardStep2() {
        if (!this._config) { location.hash = '#/builder/step1'; return; }
        var cfg = this._config;
        var dayNames = cfg.dayNames || [];

        var fieldsHtml = '';
        var dayPlaceholders = ['Грудь и трицепс', 'Спина и бицепс', 'Ноги и ягодицы', 'Плечи и руки', 'Грудь и спина', 'Ноги и плечи', 'Спина и трицепс'];
        for (var i = 1; i <= cfg.numDays; i++) {
            var val = dayNames[i - 1] || '';
            var ph = dayPlaceholders[(i - 1) % dayPlaceholders.length];
            fieldsHtml += `
                <div class="setup-field">
                    <label>ДЕНЬ ${i}</label>
                    <input type="text" class="form-input builder-day-name" data-day="${i}" placeholder="Например: ${ph}" value="${val}">
                </div>
            `;
        }

        document.getElementById('app').innerHTML = `
            <div class="setup-screen" style="justify-content:flex-start;padding-top:var(--spacing-xl)">
                <h1>Названия дней</h1>
                <p class="subtitle">Опишите каждый тренировочный день</p>
                ${fieldsHtml}
                <button class="btn-primary" id="builder-create" style="margin-top:var(--spacing-lg)">СОЗДАТЬ ПРОГРАММУ</button>
                <button class="btn-link" id="builder-back-step1">Назад</button>
            </div>
        `;
    },

    createProgram() {
        if (!this._config) return;
        var cfg = this._config;

        // Collect day names
        var dayInputs = document.querySelectorAll('.builder-day-name');
        var dayNames = [];
        dayInputs.forEach(function(inp) {
            dayNames.push(inp.value.trim() || ('День ' + inp.dataset.day));
        });

        // Build program
        var dayTemplates = {};
        for (var i = 0; i < cfg.numDays; i++) {
            dayTemplates[i + 1] = {
                title: 'Day ' + (i + 1),
                titleRu: dayNames[i],
                exerciseGroups: []
            };
        }

        var user = Storage.getCurrentUser();
        var program = {
            version: 2,
            title: cfg.title,
            coach: '',
            athlete: user ? user.name : '',
            totalWeeks: cfg.totalWeeks,
            isCustom: true,
            dayTemplates: dayTemplates,
            weeklyOverrides: {}
        };

        Storage.saveProgram(program, false);
        PROGRAM = program;
        this._config = null;
    },

    // ===== DAY EDITOR =====
    renderDayEditor(dayNum) {
        if (!PROGRAM || !PROGRAM.dayTemplates[dayNum]) {
            location.hash = '#/setup';
            return;
        }

        var dayTemplate = PROGRAM.dayTemplates[dayNum];
        var exercises = [];

        // Extract exercises from exerciseGroups
        for (var i = 0; i < dayTemplate.exerciseGroups.length; i++) {
            var group = dayTemplate.exerciseGroups[i];
            if (group.type === 'single' || group.type === 'warmup') {
                exercises.push({
                    nameRu: group.exercise.nameRu || group.exercise.name,
                    name: group.exercise.name || group.exercise.nameRu,
                    reps: group.exercise.reps,
                    rest: group.exercise.rest,
                    setsCount: group.exercise.sets.length,
                    note: group.exercise.note || '',
                    noteRu: group.exercise.noteRu || ''
                });
            }
        }

        this._editingDay = { dayNum: dayNum, exercises: exercises };
        this._renderDayEditorHTML();
    },

    _renderDayEditorHTML() {
        var ed = this._editingDay;
        if (!ed) return;

        var dayTitle = PROGRAM.dayTemplates[ed.dayNum].titleRu || PROGRAM.dayTemplates[ed.dayNum].title;
        var listHtml = '';

        for (var i = 0; i < ed.exercises.length; i++) {
            var ex = ed.exercises[i];
            listHtml += `
                <div class="editor-exercise-card">
                    <div class="editor-ex-info">
                        <div class="editor-ex-name">${ex.nameRu || ex.name}</div>
                        <div class="editor-ex-meta">${ex.setsCount} × ${ex.reps} · ${ex.rest ? ex.rest + 'с' : '—'}</div>
                    </div>
                    <div class="editor-ex-actions">
                        ${i > 0 ? `<button class="editor-action-btn editor-move-up" data-idx="${i}">↑</button>` : '<span class="editor-action-spacer"></span>'}
                        ${i < ed.exercises.length - 1 ? `<button class="editor-action-btn editor-move-down" data-idx="${i}">↓</button>` : '<span class="editor-action-spacer"></span>'}
                        <button class="editor-action-btn editor-delete" data-idx="${i}">✕</button>
                    </div>
                </div>
            `;
        }

        if (ed.exercises.length === 0) {
            listHtml = `<div class="empty-day-hint">Нет упражнений. Добавьте первое!</div>`;
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-editor">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div class="header-title">
                    <h1>Редактирование</h1>
                    <div class="header-subtitle">${dayTitle}</div>
                </div>
            </div>
            <div class="app-content">
                <div id="editor-exercises">${listHtml}</div>
                <button class="btn-primary editor-add-btn" id="editor-add-exercise">
                    <span style="font-size:20px;margin-right:6px">+</span> ДОБАВИТЬ УПРАЖНЕНИЕ
                </button>
                ${ed.exercises.length > 0 ? '<button class="btn-primary editor-save-btn" id="editor-save">СОХРАНИТЬ</button>' : ''}
            </div>
        `;
    },

    moveExercise(idx, dir) {
        var ed = this._editingDay;
        if (!ed) return;
        var newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= ed.exercises.length) return;
        var tmp = ed.exercises[idx];
        ed.exercises[idx] = ed.exercises[newIdx];
        ed.exercises[newIdx] = tmp;
        this._renderDayEditorHTML();
    },

    deleteExercise(idx) {
        var ed = this._editingDay;
        if (!ed) return;
        ed.exercises.splice(idx, 1);
        this._renderDayEditorHTML();
    },

    saveDayEdits() {
        var ed = this._editingDay;
        if (!ed || !PROGRAM) return;

        var groups = [];
        for (var i = 0; i < ed.exercises.length; i++) {
            var ex = ed.exercises[i];
            var sets = [];
            for (var s = 0; s < ex.setsCount; s++) {
                sets.push({ type: 'H', rpe: '8', techniques: [] });
            }
            groups.push({
                type: 'single',
                exercise: {
                    id: 'D' + ed.dayNum + 'E' + (i + 1),
                    name: ex.name || ex.nameRu,
                    nameRu: ex.nameRu || ex.name,
                    reps: ex.reps,
                    rest: ex.rest,
                    sets: sets,
                    note: ex.note || '',
                    noteRu: ex.noteRu || ''
                }
            });
        }

        PROGRAM.dayTemplates[ed.dayNum].exerciseGroups = groups;
        Storage.saveProgram(PROGRAM, false);
        this._editingDay = null;

        // Navigate back
        if (Storage.isSetup()) {
            location.hash = '#/week/' + App._currentWeek + '/day/' + ed.dayNum;
        } else {
            location.hash = '#/setup';
        }
    },

    // ===== EXERCISE PICKER MODAL =====
    _pickerDayNum: null,
    _pickerCategory: 'all',

    showExercisePicker() {
        var ed = this._editingDay;
        if (!ed) return;
        this._pickerDayNum = ed.dayNum;
        this._pickerCategory = 'all';

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'exercise-picker-modal';

        var catsHtml = '<button class="picker-cat active" data-cat="all">Все</button>';
        for (var i = 0; i < EXERCISE_CATEGORIES.length; i++) {
            var cat = EXERCISE_CATEGORIES[i];
            catsHtml += `<button class="picker-cat" data-cat="${cat.id}">${cat.nameRu}</button>`;
        }

        var listHtml = this._buildPickerList('all', '');

        overlay.innerHTML = `
            <div class="picker-modal">
                <div class="picker-header">
                    <h3>Добавить упражнение</h3>
                    <button class="picker-close-btn" id="picker-close">✕</button>
                </div>
                <div class="picker-search">
                    <input type="text" id="picker-search-input" placeholder="Поиск упражнения..." autocomplete="off">
                </div>
                <div class="picker-categories" id="picker-categories">${catsHtml}</div>
                <div class="picker-list" id="picker-list">${listHtml}</div>
                <div class="picker-custom">
                    <input type="text" id="picker-custom-name" class="form-input" placeholder="Своё упражнение..." autocomplete="off">
                    <button class="btn-primary picker-custom-btn" id="picker-add-custom">ДОБАВИТЬ</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        lockBodyScroll();
        blockOverlayScroll(overlay, '.picker-list');

        // Search input listener
        var searchInput = document.getElementById('picker-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                var query = searchInput.value.trim();
                var activeCat = document.querySelector('.picker-cat.active');
                var cat = activeCat ? activeCat.dataset.cat : 'all';
                document.getElementById('picker-list').innerHTML = Builder._buildPickerList(cat, query);
            });
        }

        // Click delegation
        overlay.addEventListener('click', function(e) { Builder._handlePickerClick(e); });

        // Animate in
        requestAnimationFrame(function() { overlay.classList.add('visible'); });
    },

    _buildPickerList(category, query) {
        var filtered = EXERCISE_DB;
        if (category && category !== 'all') {
            filtered = filtered.filter(function(ex) { return ex.category === category; });
        }
        if (query) {
            var q = query.toLowerCase();
            filtered = filtered.filter(function(ex) {
                return (ex.nameRu && ex.nameRu.toLowerCase().indexOf(q) !== -1) ||
                       (ex.name && ex.name.toLowerCase().indexOf(q) !== -1);
            });
        }

        if (filtered.length === 0) {
            return '<div class="picker-empty">Ничего не найдено</div>';
        }

        var html = '';
        for (var i = 0; i < filtered.length; i++) {
            var ex = filtered[i];
            html += `<div class="picker-item" data-name-ru="${ex.nameRu}" data-name="${ex.name}">${ex.nameRu}</div>`;
        }
        return html;
    },

    _handlePickerClick(e) {
        var target = e.target;

        // Close
        if (target.id === 'picker-close' || target.closest('#picker-close')) {
            this._closeExercisePicker();
            return;
        }

        // Click on backdrop
        if (target.classList.contains('modal-overlay')) {
            this._closeExercisePicker();
            return;
        }

        // Category
        if (target.classList.contains('picker-cat')) {
            var buttons = document.querySelectorAll('.picker-cat');
            buttons.forEach(function(b) { b.classList.remove('active'); });
            target.classList.add('active');
            var cat = target.dataset.cat;
            var searchInput = document.getElementById('picker-search-input');
            var query = searchInput ? searchInput.value.trim() : '';
            document.getElementById('picker-list').innerHTML = this._buildPickerList(cat, query);
            return;
        }

        // Exercise item
        if (target.classList.contains('picker-item')) {
            var nameRu = target.dataset.nameRu;
            var name = target.dataset.name;
            this._closeExercisePicker();
            this.showExerciseConfig(nameRu, name);
            return;
        }

        // Add custom
        if (target.id === 'picker-add-custom' || target.closest('#picker-add-custom')) {
            var input = document.getElementById('picker-custom-name');
            var customName = input ? input.value.trim() : '';
            if (!customName) return;
            this._closeExercisePicker();
            this.showExerciseConfig(customName, customName);
            return;
        }
    },

    _closeExercisePicker() {
        var modal = document.getElementById('exercise-picker-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(function() { modal.remove(); }, 200);
        }
        unlockBodyScroll();
    },

    // ===== EXERCISE CONFIG MODAL =====
    _configExercise: null,

    showExerciseConfig(nameRu, name) {
        this._configExercise = { nameRu: nameRu, name: name, setsCount: 3, reps: '8-12', rest: 120 };

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'exercise-config-modal';

        overlay.innerHTML = `
            <div class="config-modal">
                <div class="config-header">
                    <h3>${nameRu}</h3>
                </div>

                <div class="config-field">
                    <label>ПОДХОДЫ</label>
                    <div class="config-stepper">
                        <button class="config-step" id="cfg-sets-minus">−</button>
                        <span class="config-val" id="cfg-sets-val">3</span>
                        <button class="config-step" id="cfg-sets-plus">+</button>
                    </div>
                </div>

                <div class="config-field">
                    <label>ПОВТОРЕНИЯ</label>
                    <input type="text" id="cfg-reps" class="form-input" value="8-12" placeholder="8-12" style="text-align:center">
                </div>

                <div class="config-field">
                    <label>ОТДЫХ (СЕК)</label>
                    <div class="config-stepper">
                        <button class="config-step" id="cfg-rest-minus">−</button>
                        <span class="config-val" id="cfg-rest-val">120</span>
                        <button class="config-step" id="cfg-rest-plus">+</button>
                    </div>
                </div>

                <button class="btn-primary" id="cfg-confirm" style="margin-top:var(--spacing-md)">ДОБАВИТЬ</button>
                <button class="btn-link" id="cfg-cancel">Отмена</button>
            </div>
        `;

        document.body.appendChild(overlay);
        lockBodyScroll();

        overlay.addEventListener('click', function(e) { Builder._handleConfigClick(e); });
        requestAnimationFrame(function() { overlay.classList.add('visible'); });
    },

    _handleConfigClick(e) {
        var target = e.target;

        // Sets stepper
        if (target.id === 'cfg-sets-minus' || target.id === 'cfg-sets-plus') {
            var valEl = document.getElementById('cfg-sets-val');
            var val = parseInt(valEl.textContent) || 3;
            if (target.id === 'cfg-sets-minus') val = Math.max(1, val - 1);
            if (target.id === 'cfg-sets-plus') val = Math.min(10, val + 1);
            valEl.textContent = val;
            return;
        }

        // Rest stepper
        if (target.id === 'cfg-rest-minus' || target.id === 'cfg-rest-plus') {
            var valEl = document.getElementById('cfg-rest-val');
            var val = parseInt(valEl.textContent) || 120;
            if (target.id === 'cfg-rest-minus') val = Math.max(15, val - 15);
            if (target.id === 'cfg-rest-plus') val = Math.min(600, val + 15);
            valEl.textContent = val;
            return;
        }

        // Confirm
        if (target.id === 'cfg-confirm' || target.closest('#cfg-confirm')) {
            this.confirmExercise();
            return;
        }

        // Cancel / backdrop
        if (target.id === 'cfg-cancel' || target.closest('#cfg-cancel') || target.classList.contains('modal-overlay')) {
            this._closeExerciseConfig();
            return;
        }
    },

    confirmExercise() {
        if (!this._configExercise || !this._editingDay) return;

        var cfg = this._configExercise;
        var setsVal = document.getElementById('cfg-sets-val');
        var repsInput = document.getElementById('cfg-reps');
        var restVal = document.getElementById('cfg-rest-val');

        this._editingDay.exercises.push({
            nameRu: cfg.nameRu,
            name: cfg.name,
            setsCount: parseInt(setsVal.textContent) || 3,
            reps: (repsInput.value || '').trim() || '8-12',
            rest: parseInt(restVal.textContent) || 120,
            note: '',
            noteRu: ''
        });

        this._closeExerciseConfig();
        this._renderDayEditorHTML();
    },

    _closeExerciseConfig() {
        var modal = document.getElementById('exercise-config-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(function() { modal.remove(); }, 200);
        }
        unlockBodyScroll();
        this._configExercise = null;
    }
};
