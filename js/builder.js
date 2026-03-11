// builder.js — Program Builder: registration, wizard, day editor, exercise picker

// Webhook URL for registration notifications (Google Apps Script)
const REGISTRATION_WEBHOOK = '';  // Set after creating Apps Script

const Builder = {
    _config: null,      // wizard temp: {title, totalWeeks, numDays}
    _editingDay: null,  // editor temp: {dayNum, items: [{type, exercise|exercises|options}]}

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
                    </div>
                </div>

                <div class="setup-field">
                    <label>ТРЕНИРОВОК В НЕДЕЛЮ</label>
                    <div class="builder-toggle" id="builder-days-toggle">
                        ${[1,2,3,4,5,6,7].map(n => `<button data-val="${n}" ${cfg.numDays===n?'class="active"':''}>${n}</button>`).join('')}
                    </div>
                </div>

                <p class="builder-hint">Количество тренировок и недель всегда можно изменить позже</p>

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
            numDays: daysBtn ? parseInt(daysBtn.dataset.val) : 4
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
        var items = [];

        for (var i = 0; i < dayTemplate.exerciseGroups.length; i++) {
            var group = dayTemplate.exerciseGroups[i];
            if (group.type === 'single' || group.type === 'warmup') {
                items.push({ type: 'single', exercise: this._extractExForEdit(group.exercise, dayNum) });
            } else if (group.type === 'superset' && group.exercises) {
                var exs = [];
                for (var j = 0; j < group.exercises.length; j++) {
                    var e = group.exercises[j];
                    if (e._chooseOne && e.options) {
                        var chosenId = Storage.getChoice(e.choiceKey);
                        var chosen = chosenId ? e.options.find(function(o) { return o.id === chosenId; }) : null;
                        exs.push(this._extractExForEdit(chosen || e.options[0], dayNum));
                    } else {
                        exs.push(this._extractExForEdit(e, dayNum));
                    }
                }
                items.push({ type: 'superset', exercises: exs });
            } else if (group.type === 'choose_one' && group.options) {
                var opts = [];
                for (var j = 0; j < group.options.length; j++) {
                    opts.push(this._extractExForEdit(group.options[j], dayNum));
                }
                items.push({ type: 'choose_one', choiceKey: group.choiceKey || ('c_' + Date.now()), options: opts });
            }
        }

        this._editingDay = { dayNum: dayNum, items: items };
        this._renderDayEditorHTML();
    },

    _extractExForEdit(e, dayNum) {
        if (!e) return { nameRu: '?', name: '?', reps: '8-12', rest: 120, sets: [], _id: '', note: '', noteRu: '', progression: [] };
        return {
            nameRu: e.nameRu || e.name, name: e.name || e.nameRu,
            reps: e.reps, rest: e.rest,
            note: e.note || '', noteRu: e.noteRu || '',
            sets: JSON.parse(JSON.stringify(e.sets || [])),
            _id: e.id,
            progression: e.progression ? JSON.parse(JSON.stringify(e.progression)) : this._extractProgression(dayNum, e.id)
        };
    },

    _extractProgression(dayNum, exerciseId) {
        if (!PROGRAM || !PROGRAM.weeklyOverrides || !exerciseId) return [];
        var rules = [];
        for (var w = 1; w <= PROGRAM.totalWeeks; w++) {
            var dayOver = PROGRAM.weeklyOverrides[w] && PROGRAM.weeklyOverrides[w][dayNum];
            if (!dayOver || !dayOver[exerciseId] || !dayOver[exerciseId].sets) continue;
            var setsOver = dayOver[exerciseId].sets;
            for (var s in setsOver) {
                if (!setsOver[s].techniques) continue;
                for (var t = 0; t < setsOver[s].techniques.length; t++) {
                    var tech = setsOver[s].techniques[t];
                    var exists = rules.some(function(r) { return r.setIdx === parseInt(s) && r.technique === tech; });
                    if (!exists) rules.push({ startWeek: w, setIdx: parseInt(s), technique: tech });
                }
            }
        }
        return rules;
    },

    _isPremium() {
        var user = Storage.getCurrentUser();
        if (!user) return false;
        var account = ACCOUNTS.find(function(a) { return a.id === user.id; });
        return !!(account && account.premium);
    },

    _getExercise(itemIdx, subIdx) {
        var item = this._editingDay && this._editingDay.items[itemIdx];
        if (!item) return null;
        if (item.type === 'single') return item.exercise;
        if (item.type === 'superset') return item.exercises && item.exercises[subIdx];
        if (item.type === 'choose_one') return item.options && item.options[subIdx];
        return null;
    },

    _exerciseCardHTML(ex, itemIdx, subIdx, isPremium) {
        var setsArr = ex.sets || [];
        var panelId = itemIdx + '-' + (subIdx >= 0 ? subIdx : 'x');

        // Technique toggles
        var techHtml = '';
        for (var s = 0; s < setsArr.length; s++) {
            var techs = setsArr[s].techniques || [];
            techHtml += '<div class="editor-set-techs"><span class="editor-set-label">\u041F.' + (s + 1) + '</span>';
            var tt = [['DROP', 'DROP'], ['REST_PAUSE', 'R-P'], ['MP', 'MP']];
            for (var t = 0; t < tt.length; t++) {
                var count = techs.filter(function(x) { return x === tt[t][0]; }).length;
                var ac = count > 0 ? ' active' : '';
                var label = tt[t][1] + (count > 1 ? ' \u00D7' + count : '');
                techHtml += '<button class="editor-tech-btn' + ac + '" data-item="' + itemIdx + '" data-sub="' + subIdx + '" data-set="' + s + '" data-tech="' + tt[t][0] + '">' + label + '</button>';
            }
            techHtml += '</div>';
        }

        // Premium: type/RPE per set
        if (isPremium && setsArr.length > 0) {
            techHtml += '<div class="editor-section-divider">\u0422\u0418\u041F \u0418 RPE</div>';
            for (var s = 0; s < setsArr.length; s++) {
                var st = setsArr[s];
                techHtml += '<div class="editor-set-techs"><span class="editor-set-label">\u041F.' + (s + 1) + '</span>';
                var types = ['S', 'SH', 'H'];
                for (var ti = 0; ti < types.length; ti++) {
                    var ac = st.type === types[ti] ? ' active' : '';
                    techHtml += '<button class="editor-type-btn' + ac + '" data-item="' + itemIdx + '" data-sub="' + subIdx + '" data-set="' + s + '" data-type="' + types[ti] + '">' + types[ti] + '</button>';
                }
                techHtml += '<input class="editor-rpe-input" type="text" placeholder="RPE" value="' + (st.rpe || '') + '" data-item="' + itemIdx + '" data-sub="' + subIdx + '" data-set="' + s + '">';
                techHtml += '</div>';
            }
        }

        // Progression rules
        var prog = ex.progression || [];
        techHtml += '<div class="editor-section-divider">\u041F\u0420\u041E\u0413\u0420\u0415\u0421\u0421\u0418\u042F</div>';
        for (var p = 0; p < prog.length; p++) {
            var r = prog[p];
            var techLabel = r.technique === 'REST_PAUSE' ? 'R-P' : r.technique;
            techHtml += '<div class="editor-prog-rule"><span>\u0421 \u043D\u0435\u0434. ' + r.startWeek + ' \u2192 \u041F.' + (r.setIdx + 1) + ' + ' + techLabel + '</span>';
            techHtml += '<button class="editor-prog-del" data-item="' + itemIdx + '" data-sub="' + subIdx + '" data-rule="' + p + '">\u2715</button></div>';
        }
        techHtml += '<button class="editor-prog-add" data-item="' + itemIdx + '" data-sub="' + subIdx + '">+ \u041F\u0440\u0430\u0432\u0438\u043B\u043E</button>';
        // Inline progression form (hidden by default)
        var maxSets = setsArr.length || 3;
        var formId = 'prog-form-' + panelId;
        techHtml += '<div class="editor-prog-form" id="' + formId + '" style="display:none" data-item="' + itemIdx + '" data-sub="' + subIdx + '">';
        techHtml += '<div class="editor-prog-form-row"><span>\u0421 \u043D\u0435\u0434\u0435\u043B\u0438</span>';
        techHtml += '<div class="prog-stepper"><button class="prog-step prog-week-minus">\u2212</button><span class="prog-week-val">3</span><button class="prog-step prog-week-plus">+</button></div></div>';
        techHtml += '<div class="editor-prog-form-row"><span>\u041F\u043E\u0434\u0445\u043E\u0434</span>';
        techHtml += '<div class="prog-stepper"><button class="prog-step prog-set-minus">\u2212</button><span class="prog-set-val">' + maxSets + '</span><button class="prog-step prog-set-plus" data-max="' + maxSets + '">+</button></div></div>';
        techHtml += '<div class="editor-prog-form-row"><span>\u0422\u0435\u0445\u043D\u0438\u043A\u0430</span>';
        techHtml += '<div class="prog-tech-select">';
        techHtml += '<button class="editor-tech-btn prog-tech-opt" data-val="DROP">DROP</button>';
        techHtml += '<button class="editor-tech-btn prog-tech-opt" data-val="REST_PAUSE">R-P</button>';
        techHtml += '<button class="editor-tech-btn prog-tech-opt active" data-val="MP">MP</button>';
        techHtml += '</div></div>';
        techHtml += '<button class="btn-primary prog-confirm">\u0414\u041E\u0411\u0410\u0412\u0418\u0422\u042C</button>';
        techHtml += '</div>';

        var hasTechs = setsArr.some(function(s) { return s.techniques && s.techniques.length > 0; });
        var delAttr = subIdx >= 0
            ? 'data-del-sub-item="' + itemIdx + '" data-del-sub="' + subIdx + '"'
            : 'data-idx="' + itemIdx + '"';
        var delClass = subIdx >= 0 ? 'editor-del-sub' : 'editor-delete';

        return '<div class="editor-exercise-card" data-sub-idx="' + subIdx + '">'
            + '<div class="editor-ex-main">'
            + '<div class="editor-ex-info">'
            + '<div class="editor-ex-name">' + (ex.nameRu || ex.name) + '</div>'
            + '<div class="editor-ex-meta">' + (setsArr.length || 3) + ' \u00D7 ' + ex.reps
            + (ex.rest && ex.rest !== 120 ? ' \u00B7 ' + Math.floor(ex.rest / 60) + ':' + String(ex.rest % 60).padStart(2, '0') : '')
            + '</div></div>'
            + '<div class="editor-ex-actions">'
            + '<button class="editor-action-btn editor-toggle-tech' + (hasTechs ? ' has-techs' : '') + '" data-item="' + itemIdx + '" data-sub="' + subIdx + '">\u2699</button>'
            + '<button class="editor-action-btn ' + delClass + '" ' + delAttr + '>\u2715</button>'
            + '</div></div>'
            + '<div class="editor-tech-panel" id="tech-panel-' + panelId + '" style="display:none">' + techHtml + '</div>'
            + '</div>';
    },

    _renderDayEditorHTML() {
        var ed = this._editingDay;
        if (!ed) return;

        var dayTitle = PROGRAM.dayTemplates[ed.dayNum].titleRu || PROGRAM.dayTemplates[ed.dayNum].title;
        var listHtml = '';
        var isPremium = this._isPremium();

        for (var i = 0; i < ed.items.length; i++) {
            var item = ed.items[i];
            listHtml += '<div class="editor-item' + (item.type !== 'single' ? ' editor-item-group' : '') + '" data-item-idx="' + i + '" data-orig-idx="' + i + '">';

            // Checkbox for grouping
            listHtml += '<label class="editor-item-check"><input type="checkbox" class="editor-check" data-check-idx="' + i + '"><span class="editor-check-mark"></span></label>';

            if (item.type === 'single') {
                listHtml += this._exerciseCardHTML(item.exercise, i, -1, isPremium);
            } else if (item.type === 'superset') {
                listHtml += '<div class="editor-group-wrapper editor-superset-wrapper">';
                listHtml += '<div class="editor-group-header"><span class="editor-group-label superset-label">\u0421\u0423\u041F\u0415\u0420\u0421\u0415\u0422</span>';
                listHtml += '<div class="editor-group-actions"><button class="editor-split-btn" data-split-idx="' + i + '">\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u044C</button>';
                listHtml += '<button class="editor-action-btn editor-delete" data-idx="' + i + '">\u2715</button></div></div>';
                for (var j = 0; j < item.exercises.length; j++) {
                    listHtml += this._exerciseCardHTML(item.exercises[j], i, j, isPremium);
                }
                listHtml += '</div>';
            } else if (item.type === 'choose_one') {
                listHtml += '<div class="editor-group-wrapper editor-choose-wrapper">';
                listHtml += '<div class="editor-group-header"><span class="editor-group-label choose-label">\u0412\u042B\u0411\u041E\u0420</span>';
                listHtml += '<div class="editor-group-actions"><button class="editor-split-btn" data-split-idx="' + i + '">\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u044C</button>';
                listHtml += '<button class="editor-action-btn editor-delete" data-idx="' + i + '">\u2715</button></div></div>';
                for (var j = 0; j < item.options.length; j++) {
                    if (j > 0) listHtml += '<div class="editor-or-divider">\u0418\u041B\u0418</div>';
                    listHtml += this._exerciseCardHTML(item.options[j], i, j, isPremium);
                }
                listHtml += '</div>';
            }

            listHtml += '</div>';
        }

        if (ed.items.length === 0) {
            listHtml = '<div class="empty-day-hint">\u041D\u0435\u0442 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u043E\u0435!</div>';
        }

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back-editor">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div class="header-title">
                    <h1>\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435</h1>
                    <div class="header-subtitle" id="editor-day-title" style="cursor:pointer">${dayTitle} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;opacity:0.4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                </div>
            </div>
            <div class="app-content">
                <div class="editor-exercise-list" id="editor-exercises">${listHtml}</div>
                <div class="editor-group-bar" id="editor-group-bar" style="display:none">
                    <button class="editor-group-action" id="btn-make-superset">\u0421\u0423\u041F\u0415\u0420\u0421\u0415\u0422</button>
                    <button class="editor-group-action" id="btn-make-choose">\u0418\u041B\u0418 (\u0412\u042B\u0411\u041E\u0420)</button>
                </div>
                <button class="btn-primary editor-add-btn" id="editor-add-exercise">
                    <span style="font-size:20px;margin-right:6px">+</span> \u0414\u041E\u0411\u0410\u0412\u0418\u0422\u042C \u0423\u041F\u0420\u0410\u0416\u041D\u0415\u041D\u0418\u0415
                </button>
                <button class="btn-primary editor-save-btn" id="editor-save-btn">\u0421\u041E\u0425\u0420\u0410\u041D\u0418\u0422\u042C</button>
            </div>
        `;

        // Event handlers
        var self = this;
        var backBtn = document.getElementById('btn-back-editor');
        if (backBtn) backBtn.addEventListener('click', function() { App._handleEditorBack(); });

        var titleEl = document.getElementById('editor-day-title');
        if (titleEl) {
            titleEl.addEventListener('click', function() {
                var tmpl = PROGRAM.dayTemplates[ed.dayNum];
                var newName = prompt('\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0434\u043D\u044F:', tmpl.titleRu || tmpl.title || '');
                if (newName !== null && newName.trim()) {
                    tmpl.titleRu = newName.trim();
                    tmpl.title = newName.trim();
                    Storage.saveProgram(PROGRAM, false);
                    self._renderDayEditorHTML();
                }
            });
        }

        // Exercise list click delegation
        var exList = document.getElementById('editor-exercises');
        if (exList) {
            exList.addEventListener('click', function(e) {
                var target = e.target;

                // Checkbox
                if (target.matches('.editor-check')) { self._updateGroupBar(); return; }

                // Toggle tech panel
                if (target.matches('.editor-toggle-tech')) {
                    var id = target.dataset.item + '-' + (parseInt(target.dataset.sub) >= 0 ? target.dataset.sub : 'x');
                    var panel = document.getElementById('tech-panel-' + id);
                    if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
                    return;
                }

                // Technique counter (tap cycles 0→1→2→3→0)
                if (target.matches('.editor-tech-btn')) {
                    var ex = self._getExercise(parseInt(target.dataset.item), parseInt(target.dataset.sub));
                    if (!ex) return;
                    var setIdx = parseInt(target.dataset.set);
                    if (!ex.sets || !ex.sets[setIdx]) return;
                    var tech = target.dataset.tech;
                    var techs = ex.sets[setIdx].techniques || [];
                    var count = techs.filter(function(x) { return x === tech; }).length;
                    var next = count >= 3 ? 0 : count + 1;
                    // Remove all of this tech, then add 'next' copies
                    ex.sets[setIdx].techniques = techs.filter(function(x) { return x !== tech; });
                    for (var n = 0; n < next; n++) ex.sets[setIdx].techniques.push(tech);
                    // Update button
                    var techLabels = { DROP: 'DROP', REST_PAUSE: 'R-P', MP: 'MP' };
                    target.textContent = techLabels[tech] + (next > 1 ? ' \u00D7' + next : '');
                    target.classList.toggle('active', next > 0);
                    var card = target.closest('.editor-exercise-card');
                    if (card) {
                        var gear = card.querySelector('.editor-toggle-tech');
                        var anyTech = ex.sets.some(function(s) { return s.techniques && s.techniques.length > 0; });
                        if (gear) gear.classList.toggle('has-techs', anyTech);
                    }
                    self._autoSave();
                    return;
                }

                // Type toggle (premium)
                if (target.matches('.editor-type-btn')) {
                    var ex = self._getExercise(parseInt(target.dataset.item), parseInt(target.dataset.sub));
                    if (!ex) return;
                    var setIdx = parseInt(target.dataset.set);
                    if (ex.sets && ex.sets[setIdx]) {
                        ex.sets[setIdx].type = target.dataset.type;
                        var row = target.closest('.editor-set-techs');
                        if (row) row.querySelectorAll('.editor-type-btn').forEach(function(b) { b.classList.remove('active'); });
                        target.classList.add('active');
                        self._autoSave();
                    }
                    return;
                }

                // Delete sub-exercise from group
                if (target.matches('.editor-del-sub') || target.closest('.editor-del-sub')) {
                    var btn = target.matches('.editor-del-sub') ? target : target.closest('.editor-del-sub');
                    self._deleteSubExercise(parseInt(btn.dataset.delSubItem), parseInt(btn.dataset.delSub));
                    return;
                }

                // Split group
                if (target.matches('.editor-split-btn')) {
                    self._splitItem(parseInt(target.dataset.splitIdx));
                    return;
                }

                // Progression: toggle form
                if (target.matches('.editor-prog-add')) {
                    var fid = 'prog-form-' + target.dataset.item + '-' + (parseInt(target.dataset.sub) >= 0 ? target.dataset.sub : 'x');
                    var form = document.getElementById(fid);
                    if (form) form.style.display = form.style.display === 'none' ? '' : 'none';
                    return;
                }

                // Progression form: steppers
                if (target.matches('.prog-week-minus')) {
                    var val = target.parentElement.querySelector('.prog-week-val');
                    val.textContent = Math.max(1, parseInt(val.textContent) - 1);
                    return;
                }
                if (target.matches('.prog-week-plus')) {
                    var val = target.parentElement.querySelector('.prog-week-val');
                    val.textContent = Math.min(PROGRAM.totalWeeks, parseInt(val.textContent) + 1);
                    return;
                }
                if (target.matches('.prog-set-minus')) {
                    var val = target.parentElement.querySelector('.prog-set-val');
                    val.textContent = Math.max(1, parseInt(val.textContent) - 1);
                    return;
                }
                if (target.matches('.prog-set-plus')) {
                    var val = target.parentElement.querySelector('.prog-set-val');
                    var max = parseInt(target.dataset.max) || 10;
                    val.textContent = Math.min(max, parseInt(val.textContent) + 1);
                    return;
                }

                // Progression form: tech select
                if (target.matches('.prog-tech-opt')) {
                    target.parentElement.querySelectorAll('.prog-tech-opt').forEach(function(b) { b.classList.remove('active'); });
                    target.classList.add('active');
                    return;
                }

                // Progression form: confirm
                if (target.matches('.prog-confirm')) {
                    var form = target.closest('.editor-prog-form');
                    if (!form) return;
                    var ex = self._getExercise(parseInt(form.dataset.item), parseInt(form.dataset.sub));
                    if (!ex) return;
                    var startWeek = parseInt(form.querySelector('.prog-week-val').textContent);
                    var setIdx = parseInt(form.querySelector('.prog-set-val').textContent) - 1;
                    var techBtn = form.querySelector('.prog-tech-opt.active');
                    var technique = techBtn ? techBtn.dataset.val : 'MP';
                    if (!ex.progression) ex.progression = [];
                    ex.progression.push({ startWeek: startWeek, setIdx: setIdx, technique: technique });
                    self._autoSave();
                    self._renderDayEditorHTML();
                    return;
                }

                // Progression: delete rule
                if (target.matches('.editor-prog-del')) {
                    var ex = self._getExercise(parseInt(target.dataset.item), parseInt(target.dataset.sub));
                    if (ex && ex.progression) {
                        ex.progression.splice(parseInt(target.dataset.rule), 1);
                        self._autoSave();
                        self._renderDayEditorHTML();
                    }
                    return;
                }
            });

            // RPE input changes
            exList.addEventListener('input', function(e) {
                if (e.target.matches('.editor-rpe-input')) {
                    var ex = self._getExercise(parseInt(e.target.dataset.item), parseInt(e.target.dataset.sub));
                    if (ex && ex.sets) {
                        var setIdx = parseInt(e.target.dataset.set);
                        if (ex.sets[setIdx]) {
                            ex.sets[setIdx].rpe = e.target.value.trim();
                            self._autoSave();
                        }
                    }
                }
            });
        }

        // Group bar buttons
        var sBtn = document.getElementById('btn-make-superset');
        var cBtn = document.getElementById('btn-make-choose');
        if (sBtn) sBtn.addEventListener('click', function() { self._mergeItems('superset'); });
        if (cBtn) cBtn.addEventListener('click', function() { self._mergeItems('choose_one'); });

        var saveBtn = document.getElementById('editor-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', function() { self.saveDayEdits(); });

        this._initExerciseDragDrop();
    },

    _updateGroupBar() {
        var checked = document.querySelectorAll('.editor-check:checked').length;
        var bar = document.getElementById('editor-group-bar');
        if (bar) bar.style.display = checked >= 2 ? '' : 'none';
    },

    _mergeItems(type) {
        var checkboxes = document.querySelectorAll('.editor-check:checked');
        var indices = [];
        checkboxes.forEach(function(cb) { indices.push(parseInt(cb.dataset.checkIdx)); });
        if (indices.length < 2) return;

        indices.sort(function(a, b) { return a - b; });

        var exercises = [];
        for (var i = 0; i < indices.length; i++) {
            var item = this._editingDay.items[indices[i]];
            if (item.type === 'single') exercises.push(item.exercise);
            else if (item.type === 'superset') exercises = exercises.concat(item.exercises);
            else if (item.type === 'choose_one') exercises = exercises.concat(item.options);
        }

        var newItem;
        if (type === 'superset') {
            newItem = { type: 'superset', exercises: exercises };
        } else {
            newItem = { type: 'choose_one', choiceKey: 'choice_' + Date.now(), options: exercises };
        }

        this._editingDay.items[indices[0]] = newItem;
        for (var i = indices.length - 1; i >= 1; i--) {
            this._editingDay.items.splice(indices[i], 1);
        }

        this._autoSave();
        this._renderDayEditorHTML();
    },

    _splitItem(idx) {
        var item = this._editingDay.items[idx];
        if (!item) return;
        var arr = item.type === 'superset' ? item.exercises : (item.type === 'choose_one' ? item.options : null);
        if (!arr) return;

        var singles = arr.map(function(ex) { return { type: 'single', exercise: ex }; });
        var args = [idx, 1].concat(singles);
        Array.prototype.splice.apply(this._editingDay.items, args);

        this._autoSave();
        this._renderDayEditorHTML();
    },

    _deleteSubExercise(itemIdx, subIdx) {
        var item = this._editingDay.items[itemIdx];
        if (!item) return;
        var arr = item.type === 'superset' ? item.exercises : (item.type === 'choose_one' ? item.options : null);
        if (!arr) return;

        if (arr.length <= 2) {
            arr.splice(subIdx, 1);
            this._editingDay.items[itemIdx] = { type: 'single', exercise: arr[0] };
        } else {
            arr.splice(subIdx, 1);
        }

        this._autoSave();
        this._renderDayEditorHTML();
    },

    _initExerciseDragDrop() {
        var container = document.getElementById('editor-exercises');
        if (!container) return;
        var self = this;

        var dragEl = null, startY = 0, startX = 0, longPressTimer = null;
        var dragging = false, clone = null, touchOffsetY = 0;
        var cachedRects = [], swapCooldown = false, rafId = 0;

        function cacheRects() {
            cachedRects = [];
            var els = container.querySelectorAll('[data-item-idx]');
            for (var i = 0; i < els.length; i++) {
                var r = els[i].getBoundingClientRect();
                cachedRects.push({ el: els[i], top: r.top, bottom: r.bottom, midY: r.top + r.height / 2, height: r.height });
            }
        }

        function cleanup() {
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
            if (clone) { clone.remove(); clone = null; }
            if (dragEl) {
                dragEl.style.opacity = '';
                dragEl.style.pointerEvents = '';
            }
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            dragging = false;
            window._slotDragging = false;
            dragEl = null;
            cachedRects = [];
        }

        container.addEventListener('touchstart', function(e) {
            var card = e.target.closest('[data-item-idx]');
            if (!card || e.target.closest('.editor-action-btn') || e.target.closest('.editor-item-check') || e.target.closest('.editor-split-btn') || e.target.closest('.editor-tech-panel')) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dragEl = card;

            longPressTimer = setTimeout(function() {
                dragging = true;
                window._slotDragging = true;
                document.body.style.overflow = 'hidden';
                document.body.style.touchAction = 'none';
                document.body.style.userSelect = 'none';
                document.body.style.webkitUserSelect = 'none';
                card.style.pointerEvents = 'none';
                var rect = card.getBoundingClientRect();
                touchOffsetY = startY - rect.top;
                clone = card.cloneNode(true);
                clone.style.cssText = 'position:fixed;left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;z-index:999;opacity:0.92;pointer-events:none;will-change:transform;transition:none;transform:scale(1.04);box-shadow:0 8px 24px rgba(0,0,0,0.35);border-radius:16px;';
                document.body.appendChild(clone);
                card.style.opacity = '0.15';
                cacheRects();
                if (navigator.vibrate) navigator.vibrate(30);
            }, 400);
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            if (!dragging && longPressTimer) {
                var dx = e.touches[0].clientX - startX;
                var dy = e.touches[0].clientY - startY;
                if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                return;
            }
            if (!dragging) return;
            e.preventDefault();
            var touchY = e.touches[0].clientY;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function() {
                if (clone) clone.style.top = (touchY - touchOffsetY) + 'px';
            });
            if (swapCooldown) return;
            for (var i = 0; i < cachedRects.length; i++) {
                var cr = cachedRects[i];
                if (cr.el === dragEl) continue;
                if (touchY > cr.top + cr.height * 0.2 && touchY < cr.bottom - cr.height * 0.2) {
                    if (touchY < cr.midY) {
                        container.insertBefore(dragEl, cr.el);
                    } else {
                        container.insertBefore(dragEl, cr.el.nextSibling);
                    }
                    var allCards = container.querySelectorAll('[data-item-idx]');
                    for (var j = 0; j < allCards.length; j++) allCards[j].dataset.itemIdx = j;
                    swapCooldown = true;
                    cacheRects();
                    if (navigator.vibrate) navigator.vibrate(15);
                    setTimeout(function() { swapCooldown = false; }, 150);
                    break;
                }
            }
        }, { passive: false });

        container.addEventListener('touchend', function() {
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            if (!dragging) return;
            var newItems = [];
            var allCards = container.querySelectorAll('[data-item-idx]');
            for (var i = 0; i < allCards.length; i++) {
                var origIdx = parseInt(allCards[i].dataset.origIdx);
                if (self._editingDay && self._editingDay.items[origIdx]) {
                    newItems.push(self._editingDay.items[origIdx]);
                }
            }
            if (self._editingDay && newItems.length === self._editingDay.items.length) {
                self._editingDay.items = newItems;
                self._autoSave();
                for (var i = 0; i < allCards.length; i++) {
                    allCards[i].dataset.itemIdx = i;
                    allCards[i].dataset.origIdx = i;
                }
            }
            cleanup();
        }, { passive: true });

        container.addEventListener('touchcancel', function() { cleanup(); });
    },

    moveExercise(idx, dir) {
        var ed = this._editingDay;
        if (!ed) return;
        var newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= ed.items.length) return;
        var tmp = ed.items[idx];
        ed.items[idx] = ed.items[newIdx];
        ed.items[newIdx] = tmp;
        this._renderDayEditorHTML();
    },

    deleteExercise(idx) {
        var ed = this._editingDay;
        if (!ed) return;
        ed.items.splice(idx, 1);
        this._autoSave();
        this._renderDayEditorHTML();
    },

    _autoSave() {
        var ed = this._editingDay;
        if (!ed || !PROGRAM) return;

        var groups = [];
        for (var i = 0; i < ed.items.length; i++) {
            var item = ed.items[i];
            if (item.type === 'single') {
                groups.push({ type: 'single', exercise: this._serializeExercise(item.exercise, ed.dayNum, i) });
            } else if (item.type === 'superset') {
                var exs = [];
                for (var j = 0; j < item.exercises.length; j++) {
                    exs.push(this._serializeExercise(item.exercises[j], ed.dayNum, i));
                }
                groups.push({ type: 'superset', exercises: exs });
            } else if (item.type === 'choose_one') {
                var opts = [];
                for (var j = 0; j < item.options.length; j++) {
                    opts.push(this._serializeExercise(item.options[j], ed.dayNum, i));
                }
                groups.push({ type: 'choose_one', choiceKey: item.choiceKey, options: opts });
            }
        }

        PROGRAM.dayTemplates[ed.dayNum].exerciseGroups = groups;
        this._syncProgressionToOverrides(ed.dayNum);
        Storage.saveProgram(PROGRAM, false);
    },

    _serializeExercise(ex, dayNum, itemIdx) {
        var sets = ex.sets && ex.sets.length > 0
            ? ex.sets
            : [{ type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }, { type: 'H', rpe: '8', techniques: [] }];
        var id = ex._id || ('D' + dayNum + 'E' + (itemIdx + 1));
        var result = {
            id: id,
            name: ex.name || ex.nameRu,
            nameRu: ex.nameRu || ex.name,
            reps: ex.reps,
            rest: ex.rest,
            sets: sets,
            note: ex.note || '',
            noteRu: ex.noteRu || ''
        };
        if (ex.progression && ex.progression.length > 0) result.progression = ex.progression;
        return result;
    },

    _syncProgressionToOverrides(dayNum) {
        if (!PROGRAM.weeklyOverrides) PROGRAM.weeklyOverrides = {};

        var template = PROGRAM.dayTemplates[dayNum];
        var allRules = [];

        for (var g = 0; g < template.exerciseGroups.length; g++) {
            var group = template.exerciseGroups[g];
            var exercises = getGroupExercises(group);
            for (var e = 0; e < exercises.length; e++) {
                if (exercises[e].progression && exercises[e].progression.length > 0) {
                    for (var r = 0; r < exercises[e].progression.length; r++) {
                        allRules.push({ exerciseId: exercises[e].id, rule: exercises[e].progression[r] });
                    }
                }
            }
        }

        // If no rules at all, don't touch existing overrides
        if (allRules.length === 0) return;

        // Clear this day's overrides across all weeks
        for (var w = 1; w <= PROGRAM.totalWeeks; w++) {
            if (PROGRAM.weeklyOverrides[w]) {
                delete PROGRAM.weeklyOverrides[w][dayNum];
            }
        }

        // Generate overrides from rules
        for (var i = 0; i < allRules.length; i++) {
            var exId = allRules[i].exerciseId;
            var rule = allRules[i].rule;
            for (var w = rule.startWeek; w <= PROGRAM.totalWeeks; w++) {
                if (!PROGRAM.weeklyOverrides[w]) PROGRAM.weeklyOverrides[w] = {};
                if (!PROGRAM.weeklyOverrides[w][dayNum]) PROGRAM.weeklyOverrides[w][dayNum] = {};
                if (!PROGRAM.weeklyOverrides[w][dayNum][exId]) PROGRAM.weeklyOverrides[w][dayNum][exId] = { sets: {} };
                if (!PROGRAM.weeklyOverrides[w][dayNum][exId].sets[rule.setIdx]) {
                    PROGRAM.weeklyOverrides[w][dayNum][exId].sets[rule.setIdx] = { techniques: [] };
                }
                var techs = PROGRAM.weeklyOverrides[w][dayNum][exId].sets[rule.setIdx].techniques;
                if (techs.indexOf(rule.technique) === -1) techs.push(rule.technique);
            }
        }
    },

    saveDayEdits() {
        this._autoSave();
        var ed = this._editingDay;
        this._editingDay = null;

        // Navigate back
        if (Storage.isSetup()) {
            location.hash = '#/week/' + App._currentWeek + '/day/' + (ed ? ed.dayNum : App._currentDay);
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
        this._savedScrollY = window.scrollY;

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'exercise-picker-modal';

        var catsHtml = '<button class="picker-cat active" data-cat="all">\u0412\u0441\u0435</button>';
        for (var i = 0; i < EXERCISE_CATEGORIES.length; i++) {
            var cat = EXERCISE_CATEGORIES[i];
            catsHtml += `<button class="picker-cat" data-cat="${cat.id}">${cat.nameRu}</button>`;
        }

        var listHtml = this._buildPickerList('all', '');

        overlay.innerHTML = `
            <div class="picker-modal">
                <div class="picker-header">
                    <h3>\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435</h3>
                    <button class="picker-close-btn" id="picker-close">\u2715</button>
                </div>
                <div class="picker-search">
                    <input type="text" id="picker-search-input" placeholder="\u041F\u043E\u0438\u0441\u043A \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F..." autocomplete="off">
                </div>
                <div class="picker-categories" id="picker-categories">${catsHtml}</div>
                <div class="picker-list" id="picker-list">${listHtml}</div>
                <div class="picker-custom">
                    <input type="text" id="picker-custom-name" class="form-input" placeholder="\u0421\u0432\u043E\u0451 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435..." autocomplete="off">
                    <button class="btn-primary picker-custom-btn" id="picker-add-custom">\u0414\u041E\u0411\u0410\u0412\u0418\u0422\u042C</button>
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
                var listHtml = Builder._buildPickerList(cat, query);
                document.getElementById('picker-list').innerHTML = listHtml;
                // Auto-fill custom input when no results found
                var customInput = document.getElementById('picker-custom-name');
                if (customInput && query && listHtml.indexOf('picker-empty') !== -1) {
                    customInput.value = query;
                }
            });
        }

        // Scroll custom input into view when keyboard opens
        var customInput = document.getElementById('picker-custom-name');
        if (customInput) {
            customInput.addEventListener('focus', function() {
                setTimeout(function() {
                    customInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }, 300);
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
            return '<div class="picker-empty">\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E</div>';
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
                    <label>\u041F\u041E\u0414\u0425\u041E\u0414\u042B</label>
                    <div class="config-stepper">
                        <button class="config-step" id="cfg-sets-minus">\u2212</button>
                        <span class="config-val" id="cfg-sets-val">3</span>
                        <button class="config-step" id="cfg-sets-plus">+</button>
                    </div>
                </div>

                <div class="config-field">
                    <label>\u041F\u041E\u0412\u0422\u041E\u0420\u0415\u041D\u0418\u042F</label>
                    <input type="text" id="cfg-reps" class="form-input" value="8-12" placeholder="8-12" style="text-align:center">
                </div>

                <button class="btn-primary" id="cfg-confirm" style="margin-top:var(--spacing-md)">\u0414\u041E\u0411\u0410\u0412\u0418\u0422\u042C</button>
                <button class="btn-link" id="cfg-cancel">\u041E\u0442\u043C\u0435\u043D\u0430</button>
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

        var numSets = parseInt(setsVal.textContent) || 3;
        var setsArr = [];
        for (var s = 0; s < numSets; s++) {
            setsArr.push({ type: 'H', rpe: '8', techniques: [] });
        }
        this._editingDay.items.push({
            type: 'single',
            exercise: {
                nameRu: cfg.nameRu,
                name: cfg.name,
                sets: setsArr,
                reps: (repsInput.value || '').trim() || '8-12',
                rest: 120,
                note: '',
                noteRu: ''
            }
        });

        this._closeExerciseConfig();
        this._autoSave();
        var scrollY = this._savedScrollY || 0;
        this._renderDayEditorHTML();
        window.scrollTo(0, scrollY);
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
