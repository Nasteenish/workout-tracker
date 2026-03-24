/* ===== UI Rendering Module ===== */
import { lockBodyScroll, unlockBodyScroll, blockOverlayScroll, _restoreFocus } from './scroll-lock.js';
import { Storage } from './storage.js';
import { Social } from './social.js';
import { SocialUI } from './social-ui.js';
import { Builder } from './builder.js';
import { AppState } from './app-state.js';
import { EquipmentManager } from './equipment-manager.js';
import { WorkoutTimer } from './workout-timer.js';
import { RestTimer } from './timer.js';
import { formatDateISO, markCachedThumbs, autoTrimImg, esc, exThumbHtml, getGroupExercises, findExerciseInProgram, getExerciseBaseName, getVariationLabel, groupExercisesByBase } from './utils.js';
import { getTotalWeeks, getTotalDays, getProgressWeek, getCompletedSets, resolveWorkout, exName } from './program-utils.js';
import { EXERCISE_DB } from './exercises_db.js';
import { WORKOUT, EQ, SETTINGS, INLINE, attr } from './data-attrs.js';

export const UI = {
    _onClick: null,
    _onInput: null,
    _onPTRSwap: null,  // wired in App.init() — re-attach inline editor after PTR DOM swap

    // ===== LOGIN SCREEN =====
    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-screen">
                <div class="app-icon"><svg viewBox="0 0 40 40" fill="white" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="16" width="3" height="8" rx="1.5"/><rect x="6" y="11" width="4" height="18" rx="2"/><rect x="11" y="14" width="3" height="12" rx="1.5"/><rect x="14" y="18" width="12" height="4" rx="2"/><rect x="26" y="14" width="3" height="12" rx="1.5"/><rect x="30" y="11" width="4" height="18" rx="2"/><rect x="35" y="16" width="3" height="8" rx="1.5"/></svg></div>
                <h1>Трекер Тренировок</h1>

                <div class="login-features">
                    <div class="login-feature"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="5" height="16" rx="2"/><rect x="17" y="4" width="5" height="16" rx="2"/><line x1="7" y1="12" x2="17" y2="12" stroke-width="3"/></svg><span>Трекинг тренировок</span></div>
                    <div class="login-feature"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><span>Check-in</span></div>
                    <div class="login-feature"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/></svg><span>Лента атлетов</span></div>
                </div>

                <div class="login-field">
                    <label for="login-input">Логин или Email</label>
                    <input type="text" id="login-input" autocomplete="username" autocapitalize="none" placeholder="Логин или email">
                </div>

                <div class="login-field">
                    <label for="password-input">Пароль</label>
                    <div class="password-wrapper">
                        <input type="password" id="password-input" autocomplete="current-password" placeholder="Введите пароль">
                        <button type="button" class="password-toggle" ${attr(SETTINGS.TARGET, 'password-input')} aria-label="Показать пароль">
                            <svg class="eye-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="eye-off-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>

                <div id="login-error" class="login-error" style="display:none"></div>

                <button class="btn-primary" id="login-submit">ВОЙТИ</button>
                <button class="btn-link" id="btn-register">Создать аккаунт</button>
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
        // Phase 2: program loaded, need date/cycle setup → summary screen
        var _p = Storage.getProgram();
        if (_p && !Storage.isSetup()) {
            const programTitle = _p.title || 'Моя программа';
            const totalW = getTotalWeeks();
            const totalD = getTotalDays();
            const athleteName = _p.athlete ? `<p class="subtitle" style="opacity:0.5;margin-top:4px">${_p.athlete}</p>` : '';

            // Build day list summary
            let daysHtml = '';
            for (let d = 1; d <= totalD; d++) {
                const tmpl = _p.dayTemplates[d];
                const dayTitle = (tmpl && (tmpl.titleRu || tmpl.title)) || ('День ' + d);
                const exCount = tmpl ? tmpl.exerciseGroups.length : 0;
                const exText = exCount > 0 ? ` · ${exCount} упражнений` : '';
                daysHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-color);">
                    <span style="font-weight:600;">День ${d}</span>
                    <span style="color:var(--text-muted);font-size:var(--font-size-xs);">${dayTitle}${exText}</span>
                </div>`;
            }

            document.getElementById('app').innerHTML = `
                <div class="setup-screen">
                    <div class="app-icon"><svg viewBox="0 0 40 40" fill="white" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="16" width="3" height="8" rx="1.5"/><rect x="6" y="11" width="4" height="18" rx="2"/><rect x="11" y="14" width="3" height="12" rx="1.5"/><rect x="14" y="18" width="12" height="4" rx="2"/><rect x="26" y="14" width="3" height="12" rx="1.5"/><rect x="30" y="11" width="4" height="18" rx="2"/><rect x="35" y="16" width="3" height="8" rx="1.5"/></svg></div>
                    <h1>${programTitle}</h1>
                    <p class="subtitle">${totalW} недель · ${totalD} дней в неделе</p>
                    ${athleteName}

                    <div style="text-align:left;width:100%;margin:var(--spacing-md) 0;">
                        ${daysHtml}
                    </div>

                    <input type="hidden" id="start-date" value="${formatDateISO(new Date())}">
                    <button class="btn-primary" id="setup-start">НАЧАТЬ</button>
                    <button class="btn-link" id="setup-back-builder">Назад</button>
                </div>
            `;
            return;
        }

        // Phase 1: no program — show setup screen
        document.getElementById('app').innerHTML = `
            <div class="setup-screen">
                <div class="app-icon"><svg viewBox="0 0 40 40" fill="white" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="16" width="3" height="8" rx="1.5"/><rect x="6" y="11" width="4" height="18" rx="2"/><rect x="11" y="14" width="3" height="12" rx="1.5"/><rect x="14" y="18" width="12" height="4" rx="2"/><rect x="26" y="14" width="3" height="12" rx="1.5"/><rect x="30" y="11" width="4" height="18" rx="2"/><rect x="35" y="16" width="3" height="8" rx="1.5"/></svg></div>
                <h1>Трекер Тренировок</h1>
                <p class="subtitle">Создайте свою программу тренировок</p>

                <button class="btn-primary" id="setup-create-program">СОЗДАТЬ ПРОГРАММУ</button>
                <button class="btn-link" id="setup-import-program">Загрузить из файла</button>
                <div id="program-status" style="font-size:13px;text-align:center"></div>
                <button class="btn-link" id="setup-back-onboarding">Назад</button>
                <button class="btn-link" id="setup-logout">Выйти из аккаунта</button>
            </div>
        `;
    },

    _generateDefaultSlots(numDays, cycleType) {
        const slots = [];
        const restCount = Math.max(0, cycleType - numDays);
        if (restCount === 0) {
            for (let d = 1; d <= numDays; d++) slots.push({ type: 'day', dayNum: d });
        } else {
            // Distribute rest days evenly between training days
            let restPlaced = 0;
            for (let d = 1; d <= numDays; d++) {
                slots.push({ type: 'day', dayNum: d });
                const remainingTraining = numDays - d;
                const remainingRest = restCount - restPlaced;
                const restHere = Math.round(remainingRest / (remainingTraining + 1));
                for (let r = 0; r < restHere; r++) {
                    slots.push({ type: 'rest' });
                    restPlaced++;
                }
            }
        }
        return slots;
    },

    // ===== WEEK VIEW =====
    // Data preparation for week view — slots, progress, user info
    _buildWeekVM(weekNum) {
        const progress = getProgressWeek();
        const settings = Storage.getSettings();
        const cycleType = settings.cycleType || 7;
        const numDays = getTotalDays();
        const program = Storage.getProgram();

        const savedSlots = Storage.getWeekSlots();
        const rawSlots = (savedSlots && savedSlots.length === cycleType)
            ? savedSlots
            : this._generateDefaultSlots(numDays, cycleType);

        const slots = rawSlots.map((slot, si) => {
            if (slot.type === 'rest') return { type: 'rest', slotIdx: si };
            const dayNum = slot.dayNum;
            const { completed, total } = getCompletedSets(weekNum, dayNum);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const template = program.dayTemplates[dayNum];
            const isDone = total > 0 && completed >= total;
            const lastTs = Storage.getLastTrainingDate(weekNum, dayNum);
            let trainedDateHtml = '';
            if (lastTs) {
                const dt = new Date(lastTs);
                const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
                trainedDateHtml = `<div class="day-trained-date">${dt.getDate()} ${months[dt.getMonth()]}</div>`;
            }
            return {
                type: 'workout', slotIdx: si, dayNum,
                dayTitle: template ? template.titleRu : `День ${dayNum}`,
                completed, total, pct, isDone,
                isNext: progress.week === weekNum && progress.day === dayNum,
                trainedDateHtml
            };
        });

        const currentUser = Storage.getCurrentUser();
        return {
            weekNum,
            headerName: currentUser ? currentUser.name : 'Трекер Тренировок',
            totalWeeks: getTotalWeeks(),
            totalDays: numDays,
            hasTabBar: SocialUI && Social._hasSupaAuth(),
            slots
        };
    },

    // Pure HTML from pre-computed week VM
    _weekCardsHTML(vm) {
        let cardsHtml = '';
        for (const slot of vm.slots) {
            if (slot.type === 'rest') {
                cardsHtml += `<div class="rest-day-card" data-slot-idx="${slot.slotIdx}">
                    <svg class="rest-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="rest-label">Отдых</span>
                </div>`;
            } else {
                let cardClass = 'day-card';
                if (slot.isNext) cardClass += ' today';
                if (slot.isDone) cardClass += ' done';

                cardsHtml += `
                    <a class="${cardClass}" href="#/week/${vm.weekNum}/day/${slot.dayNum}" data-slot-idx="${slot.slotIdx}">
                        <div class="day-header">
                            <span class="day-number">${slot.isDone ? '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:-2px;margin-right:2px"><path d="M2.5 6.5l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}День ${slot.dayNum}</span>
                            <span class="day-date">${slot.pct}%</span>
                        </div>
                        <div class="day-title">${slot.dayTitle}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${slot.pct}%"></div>
                        </div>
                        <div class="progress-text">${slot.completed}/${slot.total} подходов</div>
                        ${slot.trainedDateHtml}
                    </a>
                `;
            }
        }
        return cardsHtml;
    },

    // Returns full week view HTML (for back-swipe companion)
    _weekViewHTML(weekNum) {
        const vm = this._buildWeekVM(weekNum);
        const cardsHtml = this._weekCardsHTML(vm);
        return `
            <div class="app-header">
                <div class="header-title">
                    <h1>${vm.headerName}</h1>
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
                        <div class="week-sublabel">неделя из ${vm.totalWeeks}</div>
                    </div>
                    <button>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                <div class="slide-container">
                    <div class="week-slide">
                    ${cardsHtml}
                <div class="data-actions">
                    <button>Экспорт</button>
                    <button>Импорт</button>
                </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderWeek(weekNum) {
        const vm = this._buildWeekVM(weekNum);
        const cardsHtml = this._weekCardsHTML(vm);

        document.getElementById('app').innerHTML = `
            <div class="app-header">
                <div class="header-title">
                    <h1>${vm.headerName}</h1>
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
                        <div class="week-sublabel">неделя из ${vm.totalWeeks}</div>
                    </div>
                    <button id="next-week">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                <div class="slide-container">
                    <div class="week-slide">
                    ${cardsHtml}
                <div class="week-actions-row">
                    <button class="add-week-btn" id="btn-add-day"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> День</button>
                    ${vm.totalDays > 1 ? `<button class="remove-week-btn" id="btn-remove-day"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg> День</button>` : ''}
                </div>
                ${weekNum === vm.totalWeeks ? `<div class="week-actions-row">
                    <button class="add-week-btn" id="btn-add-week"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Неделю</button>
                    ${vm.totalWeeks > 1 ? `<button class="remove-week-btn" id="btn-remove-week"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg> Неделю</button>` : ''}
                </div>` : ''}
                <div class="data-actions">
                    <button id="btn-export">Экспорт</button>
                    <button id="btn-import">Импорт</button>
                </div>
                    </div>
                </div>
            </div>
            ${vm.hasTabBar ? SocialUI._tabBarHTML('workouts') : ''}
        `;

        this._initSlotDragDrop(weekNum);
    },

    _initSlotDragDrop(weekNum) {
        const container = document.querySelector('.week-slide');
        if (!container) return;

        let dragEl = null, startY = 0, startX = 0, longPressTimer = null;
        let dragging = false, clone = null, touchOffsetY = 0;
        let cachedRects = [], swapCooldown = false, rafId = 0;

        function cacheRects() {
            cachedRects = [];
            var els = container.querySelectorAll('[data-slot-idx]');
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
                dragEl.style.transition = '';
            }
            // Restore all card transitions
            var els = container.querySelectorAll('[data-slot-idx]');
            for (var i = 0; i < els.length; i++) {
                els[i].style.transform = '';
                els[i].style.transition = '';
            }
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            container.style.overscrollBehavior = '';
            dragging = false;
            window._slotDragging = false;
            dragEl = null;
            cachedRects = [];
        }

        container.addEventListener('touchstart', function(e) {
            var card = e.target.closest('[data-slot-idx]');
            if (!card) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dragEl = card;

            longPressTimer = setTimeout(function() {
                dragging = true;
                window._slotDragging = true;
                // Block scrolling and text selection
                document.body.style.overflow = 'hidden';
                document.body.style.touchAction = 'none';
                document.body.style.userSelect = 'none';
                document.body.style.webkitUserSelect = 'none';
                container.style.overscrollBehavior = 'none';
                // Prevent link navigation
                card.style.pointerEvents = 'none';
                // Create clone
                var rect = card.getBoundingClientRect();
                touchOffsetY = startY - rect.top;
                clone = card.cloneNode(true);
                clone.style.cssText = 'position:fixed;left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;z-index:999;opacity:0.92;pointer-events:none;will-change:transform;transition:none;transform:scale(1.04);box-shadow:0 8px 24px rgba(0,0,0,0.35);border-radius:16px;';
                document.body.appendChild(clone);
                // Ghost original
                card.style.opacity = '0.15';
                card.style.transition = 'none';
                // Cache positions
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

            // Move clone via rAF
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function() {
                if (clone) {
                    clone.style.top = (touchY - touchOffsetY) + 'px';
                }
            });

            // Swap detection with cooldown
            if (swapCooldown) return;
            for (var i = 0; i < cachedRects.length; i++) {
                var cr = cachedRects[i];
                if (cr.el === dragEl) continue;
                if (touchY > cr.top + cr.height * 0.2 && touchY < cr.bottom - cr.height * 0.2) {
                    // Swap in DOM
                    if (touchY < cr.midY) {
                        container.insertBefore(dragEl, cr.el);
                    } else {
                        container.insertBefore(dragEl, cr.el.nextSibling);
                    }
                    // Update indices
                    var allCards = container.querySelectorAll('[data-slot-idx]');
                    for (var j = 0; j < allCards.length; j++) {
                        allCards[j].dataset.slotIdx = j;
                    }
                    // Re-cache after swap
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
            // Save new slot order
            var newSlots = [];
            var allCards = container.querySelectorAll('[data-slot-idx]');
            for (var i = 0; i < allCards.length; i++) {
                var el = allCards[i];
                if (el.classList.contains('rest-day-card')) {
                    newSlots.push({ type: 'rest' });
                } else if (el.classList.contains('day-card')) {
                    var href = el.getAttribute('href') || '';
                    var m = href.match(/day\/(\d+)/);
                    if (m) newSlots.push({ type: 'day', dayNum: parseInt(m[1]) });
                }
            }
            if (newSlots.length > 0) Storage.saveWeekSlots(newSlots);
            cleanup();
        }, { passive: true });

        container.addEventListener('touchcancel', function() {
            cleanup();
        });
    },

    // Returns full day view HTML (for back-swipe companion)
    _gymIndicatorHTML(weekNum, dayNum) {
        var gymId = Storage.getWorkoutGym(weekNum, dayNum);
        if (!gymId) return '';
        var gym = Storage.getGymById(gymId);
        if (!gym) return '';
        return '<div class="gym-indicator"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(gym.name) + '</div>';
    },

    _dayViewHTML(weekNum, dayNum) {
        const vm = this._buildDayVM(weekNum, dayNum);
        if (!vm) return '<p>Тренировка не найдена</p>';

        const { workout, isEmpty, dayTitle, timerRunning, timerPaused, timerElapsedStr,
                allDone, gymHtml } = vm;

        let exerciseHtml = '';
        if (workout.exerciseGroups) {
            let currentSection = '';
            for (const group of workout.exerciseGroups) {
                const sectionTitle = group.sectionTitleRu || group.sectionTitle || '';
                if (sectionTitle && sectionTitle !== currentSection) {
                    currentSection = sectionTitle;
                    exerciseHtml += `<div class="section-header">${sectionTitle}</div>`;
                }
                if (group.type === 'warmup' && group.exercise) {
                    const wu = group.exercise;
                    exerciseHtml += `<div class="warmup-section"><div class="warmup-label">Разминка</div><div class="warmup-text">${exName(wu)}</div></div>`;
                } else if (group.type === 'superset') {
                    exerciseHtml += this._renderSuperset(group, weekNum, dayNum);
                } else if (group.type === 'choose_one') {
                    exerciseHtml += this._renderChooseOne(group, weekNum, dayNum);
                } else if (group.type === 'single' && group.exercise) {
                    exerciseHtml += this._renderExercise(group.exercise, weekNum, dayNum);
                }
            }
        }

        let timerHtml = '';
        if (!isEmpty) {
            if (timerPaused) {
                timerHtml = '<div class="workout-timer-row paused"><span class="workout-timer-icon">&#9208;</span><span>' + timerElapsedStr + '</span></div>';
            } else if (timerRunning) {
                timerHtml = '<div class="workout-timer-row"><span class="workout-timer-icon">&#9201;</span><span>00:00</span></div>';
            } else if (!allDone) {
                timerHtml = '<button class="btn-start-workout">НАЧАТЬ ТРЕНИРОВКУ</button>';
            }
        }

        return `
            <div class="app-header">
                <button class="back-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Неделя ${weekNum} / День ${dayNum}</h1>
                    <div class="header-subtitle">${dayTitle}</div>
                </div>
            </div>
            <div class="app-content">
                <div class="slide-container"><div class="day-slide">${timerHtml}${gymHtml}${exerciseHtml}</div></div>
            </div>
        `;
    },

    // ===== DAY VIEW =====
    // Data preparation for day view — resolves workout, timer state, progress
    _buildDayVM(weekNum, dayNum) {
        const workout = resolveWorkout(weekNum, dayNum);
        if (!workout) return null;

        const timerRunning = WorkoutTimer.isRunning(AppState.currentWeek, AppState.currentDay);
        const timerPaused = WorkoutTimer.isPaused(AppState.currentWeek, AppState.currentDay);
        const { completed: doneCount, total: totalCount } = getCompletedSets(weekNum, dayNum);
        const allDone = totalCount > 0 && doneCount >= totalCount;
        const isEmpty = workout.exerciseGroups.length === 0;

        let timerElapsedStr = '';
        if (timerPaused) {
            const elapsed = WorkoutTimer.getElapsed(AppState.currentWeek, AppState.currentDay);
            const h = Math.floor(elapsed / 3600);
            const m = Math.floor((elapsed % 3600) / 60);
            const s = elapsed % 60;
            timerElapsedStr = (h > 0 ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }

        return {
            workout, isEmpty,
            dayTitle: workout.titleRu || workout.title || `День ${dayNum}`,
            timerRunning, timerPaused, timerElapsedStr,
            doneCount, totalCount, allDone,
            gymHtml: this._gymIndicatorHTML(weekNum, dayNum),
            hasTabBar: SocialUI && Social._hasSupaAuth()
        };
    },

    renderDay(weekNum, dayNum) {
        // Flush pending input saves so Storage is up-to-date before generating HTML
        if (AppState.saveDebounced) AppState.saveDebounced.flush();

        const vm = this._buildDayVM(weekNum, dayNum);
        if (!vm) {
            document.getElementById('app').innerHTML = '<p>Тренировка не найдена</p>';
            return;
        }

        const { workout, isEmpty, dayTitle, timerRunning, timerPaused, timerElapsedStr,
                allDone, gymHtml, hasTabBar } = vm;

        let html = '';
        let currentSection = '';

        for (let gi = 0; gi < workout.exerciseGroups.length; gi++) {
            const group = workout.exerciseGroups[gi];
            const sectionTitle = group.sectionTitleRu || group.sectionTitle || '';
            if (sectionTitle && sectionTitle !== currentSection) {
                currentSection = sectionTitle;
                html += `<div class="section-header">${sectionTitle}</div>`;
            }

            if (group.type === 'warmup') {
                const wu = group.exercise;
                if (wu) {
                    html += `
                        <div class="warmup-section">
                            <div class="warmup-label">Разминка</div>
                            <div class="warmup-text">${exName(wu)}${wu.noteRu ? ' — ' + wu.noteRu : ''}</div>
                        </div>
                    `;
                }
            } else if (group.type === 'superset') {
                html += this._renderSuperset(group, weekNum, dayNum, gi);
            } else if (group.type === 'choose_one') {
                html += this._renderChooseOne(group, weekNum, dayNum, gi);
            } else if (group.type === 'single') {
                if (group.exercise) {
                    html += this._renderExercise(group.exercise, weekNum, dayNum, undefined, gi);
                }
            }
        }

        if (!isEmpty) {
            html += `<button class="btn-add-exercise-inline" id="btn-add-exercise-inline">+ Добавить упражнение</button>`;
        }

        // NOTE: карандаш скрыт — редактирование через три точки на каждом упражнении.
        // Оставлено для будущего: может пригодиться для режима составления программ тренерами.
        const editBtn = '';

        if (isEmpty) {
            html = `
                <div class="empty-day">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M12 5v14M5 12h14"/></svg>
                    <p>Нет упражнений</p>
                    <button class="btn-primary" id="btn-add-exercise-empty" style="margin-top:var(--spacing-md)">ДОБАВИТЬ УПРАЖНЕНИЯ</button>
                </div>
            `;
        }

        let timerHtml = '';
        if (timerPaused) {
            timerHtml = '<div class="workout-timer-row paused"><span class="workout-timer-icon">&#9208;</span><span id="workout-timer">' + timerElapsedStr + '</span></div>'
                + '<div class="workout-timer-actions"><button class="btn-timer-resume" id="btn-resume-workout">ПРОДОЛЖИТЬ</button><button class="btn-timer-cancel" id="btn-cancel-workout">ОТМЕНИТЬ</button></div>';
        } else if (timerRunning) {
            timerHtml = '<div class="workout-timer-row"><span class="workout-timer-icon">&#9201;</span><span id="workout-timer">00:00</span></div>'
                + '<button class="btn-timer-pause" id="btn-pause-workout">ПАУЗА</button>';
        } else if (!allDone && !isEmpty) {
            timerHtml = '<button class="btn-start-workout" id="btn-start-workout">НАЧАТЬ ТРЕНИРОВКУ</button>';
        }

        const newHTML = `
            <div class="app-header">
                <button class="back-btn" id="btn-back"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="header-title">
                    <h1>Неделя ${weekNum} / День ${dayNum}</h1>
                    <div class="header-subtitle">${dayTitle}</div>
                </div>
                ${isEmpty ? '' : editBtn}
            </div>
            <div class="app-content">
                <div class="slide-container">
                    <div class="day-slide">
                    ${timerHtml}
                    ${gymHtml}
                    ${html}
                    </div>
                </div>
            </div>
            ${hasTabBar ? SocialUI._tabBarHTML('workouts') : ''}
        `;

        // Capture focused input for restoration after re-render
        const ae = document.activeElement;
        var focusInfo = null;
        if (ae && (ae.matches('.weight-input, .reps-input, .seg-weight-input, .seg-reps-input'))) {
            focusInfo = {
                cls: ae.classList.contains('weight-input') ? '.weight-input'
                   : ae.classList.contains('reps-input') ? '.reps-input'
                   : ae.classList.contains('seg-weight-input') ? '.seg-weight-input'
                   : '.seg-reps-input',
                ex: ae.getAttribute(WORKOUT.EXERCISE),
                set: ae.getAttribute(WORKOUT.SET),
                seg: ae.getAttribute(WORKOUT.SEG),
                pos: ae.selectionStart
            };
        }

        const appEl = document.getElementById('app');
        const isPTR = appEl.classList.contains('no-animate');

        if (isPTR) {
            // Pull-to-refresh: render offscreen, decode images, then swap DOM nodes
            const offscreen = document.createElement('div');
            offscreen.style.cssText = 'position:fixed;left:0;top:0;width:100%;visibility:hidden;pointer-events:none';
            offscreen.innerHTML = newHTML;
            document.body.appendChild(offscreen);

            const imgs = offscreen.querySelectorAll('img');
            const decodePromises = [];
            imgs.forEach(function(img) {
                if (img.src) {
                    decodePromises.push(
                        img.decode().catch(function() {})
                    );
                }
            });

            var swapped = false;
            var swap = function() {
                if (swapped) return;
                swapped = true;
                // Move actual DOM nodes (with decoded images) — not innerHTML copy
                while (appEl.firstChild) appEl.removeChild(appEl.firstChild);
                while (offscreen.firstChild) appEl.appendChild(offscreen.firstChild);
                offscreen.remove();
                // Clear no-animate so subsequent renders use normal path
                appEl.classList.remove('no-animate');
                if (timerRunning) WorkoutTimer.resume(AppState.currentWeek, AppState.currentDay);
                RestTimer.reattach();
                markCachedThumbs();
                try { UI._trimEqBadges(); } catch(e) {}
                _restoreFocus(focusInfo);
                // Re-attach inline editor after async DOM swap (PTR path)
                if (UI._onPTRSwap) UI._onPTRSwap();
            };

            if (decodePromises.length > 0) {
                Promise.all(decodePromises).then(swap);
                setTimeout(swap, 800);
            } else {
                swap();
            }
        } else {
            appEl.innerHTML = newHTML;
            if (timerRunning) WorkoutTimer.resume(AppState.currentWeek, AppState.currentDay);
            RestTimer.reattach();
            markCachedThumbs();
            this._trimEqBadges();
            _restoreFocus(focusInfo);
        }
    },

    _trimEqBadges() {
        var imgs = document.querySelectorAll('.eq-badge-thumb');
        for (var i = 0; i < imgs.length; i++) {
            (function(img) {
                if (img.complete && img.naturalWidth > 0) autoTrimImg(img);
                else img.addEventListener('load', function() { autoTrimImg(img); });
            })(imgs[i]);
        }
    },

    _getExerciseDisplayName(ex) {
        const sub = Storage.getSubstitution(ex.id);
        return sub || exName(ex);
    },

    _isSubstituted(exerciseId) {
        return !!Storage.getSubstitution(exerciseId);
    },

    // Data preparation for exercise card — all Storage reads
    _buildExerciseVM(ex, weekNum, dayNum, choiceKey = null) {
        const timerSec = Storage.getSettings().timerDuration || 120;
        const restText = timerSec >= 60
            ? `rest ${Math.floor(timerSec / 60)}min`
            : `rest ${timerSec}s`;

        const eqId = Storage.getExerciseEquipment(ex.id);
        const eq = eqId ? Storage.getEquipmentById(eqId) : null;
        const displayName = this._getExerciseDisplayName(ex);
        const isUnilateral = Storage.getUnilateral(ex.id);

        const setVMs = [];
        for (let i = 0; i < ex.sets.length; i++) {
            setVMs.push(this._buildSetRowVM(ex, i, weekNum, dayNum));
        }

        return {
            ex, choiceKey, restText,
            eqLabel: eq ? esc(eq.name) : 'Оборудование',
            eqImageUrl: eq && eq.imageUrl ? eq.imageUrl : null,
            displayName, setVMs, isUnilateral
        };
    },

    // Pure HTML rendering from exercise view-model
    _renderExercise(exVMorEx, weekNumOrUndef, dayNumOrUndef, choiceKeyOrUndef, groupIdx) {
        // Accept either a pre-built VM or raw (ex, weekNum, dayNum, choiceKey) args
        const vm = exVMorEx.setVMs
            ? exVMorEx
            : this._buildExerciseVM(exVMorEx, weekNumOrUndef, dayNumOrUndef, choiceKeyOrUndef);
        const { ex, choiceKey, restText, eqLabel, eqImageUrl, displayName, setVMs, isUnilateral } = vm;

        let setsHtml = '';
        for (const setVM of setVMs) {
            setsHtml += this._renderSetRow(setVM);
        }

        const eqThumb = eqImageUrl ? '<img class="ex-thumb eq-badge-thumb" src="' + esc(eqImageUrl) + '" loading="lazy" onerror="this.style.display=\'none\'">' : '';
        const eqTrailing = `<span class="chooser-badge"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        const uniToggleHtml = `<label class="uni-toggle" ${attr(WORKOUT.EXERCISE, ex.id)}><span class="uni-toggle-label">\u041F\u043E\u043E\u0447\u0435\u0440\u0451\u0434\u043D\u043E</span><span class="uni-switch ${isUnilateral ? 'on' : ''}"><span class="uni-knob"></span></span></label>`;
        const eqHtml = `
            <div class="equipment-row">
                <button class="equipment-btn" ${attr(WORKOUT.EXERCISE, ex.id)} ${attr(WORKOUT.EX_NAME, esc(ex.name || ''))} ${attr(WORKOUT.EX_NAME_RU, esc(ex.nameRu || ''))}>
                    ${eqThumb}${eqLabel}${eqTrailing}
                </button>
                ${uniToggleHtml}
            </div>
        `;

        // Check if this exercise has variations in EXERCISE_DB
        const _exBaseName = getExerciseBaseName(ex.nameRu || ex.name || '');
        // Find category from DB since program exercises don't always have it
        let _exCat = ex.category || '';
        if (!_exCat) {
            for (let _i = 0; _i < EXERCISE_DB.length; _i++) {
                if (EXERCISE_DB[_i].nameRu === ex.nameRu || EXERCISE_DB[_i].name === ex.name) {
                    _exCat = EXERCISE_DB[_i].category;
                    break;
                }
            }
        }
        const _hasVariations = _exCat && EXERCISE_DB.filter(function(dbEx) {
            return dbEx.category === _exCat && getExerciseBaseName(dbEx.nameRu || dbEx.name || '') === _exBaseName;
        }).length > 1;

        const nameClass = `exercise-name exercise-name-editable${_hasVariations ? ' exercise-name-chooser' : ''}`;
        const nameAttrs = `${attr(WORKOUT.EXERCISE, ex.id)} ${attr(WORKOUT.EX_NAME, esc(ex.name || ''))} ${attr(WORKOUT.EX_NAME_RU, esc(ex.nameRu || ''))}`;
        const nameContent = _hasVariations ? this._nameWithBadge(displayName) : displayName;

        const setControls = `<div class="set-controls">
            <button class="set-ctrl-btn remove-set-btn" ${attr(WORKOUT.EXERCISE, ex.id)}>− подход</button>
            <button class="set-ctrl-btn add-set-btn" ${attr(WORKOUT.EXERCISE, ex.id)}>+ подход</button>
        </div>`;

        const groupIdxAttr = groupIdx != null ? ` ${attr(INLINE.GROUP_IDX, groupIdx)}` : '';
        const menuBtn = groupIdx != null ? `<button class="inline-menu-btn" ${attr(INLINE.EX_ID, ex.id)} ${attr(INLINE.GROUP_IDX, groupIdx)} data-ex-display="${esc(displayName)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="19" r="2.5"/></svg></button>` : '';

        return `
            <div class="exercise-card"${groupIdxAttr}>
                <div class="exercise-header">
                    <div class="exercise-name-row">
                        ${exThumbHtml(ex.name, ex.nameRu)}
                        <div class="${nameClass}" ${nameAttrs}>${nameContent}</div>
                    </div>
                    <div class="exercise-meta">
                        <span>${ex.reps} reps</span>
                        ${restText ? `<span>${restText}</span>` : ''}
                        ${menuBtn}
                    </div>
                </div>
                ${eqHtml}
                ${setsHtml}
                ${setControls}
                <button class="history-btn" ${attr(WORKOUT.EXERCISE, ex.id)}>
                    История
                </button>
            </div>
        `;
    },

    // Data preparation for set row — all Storage reads and computations
    _buildSetRowVM(ex, setIdx, weekNum, dayNum) {
        const set = ex.sets[setIdx];
        const logExId = Storage.getLogExerciseId(ex.id);
        const log = Storage.getSetLog(weekNum, dayNum, logExId, setIdx);
        const eqId = Storage.getExerciseEquipment(ex.id);
        const siblings = Storage.getSiblingExercises(ex.id);
        const prev = Storage.getPreviousLog(weekNum, dayNum, logExId, setIdx, eqId, siblings.length > 0 ? siblings : null);

        const unitLabels = { kg: 'кг', lbs: 'lbs', plates: 'пл' };
        const unit = Storage.getExerciseUnit(ex.id) || Storage.getWeightUnit();
        const unitLabel = unitLabels[unit] || 'кг';
        const prevUnitLabel = prev && prev.unit ? (unitLabels[prev.unit] || 'кг') : unitLabel;

        // Technique segment counts
        const techs = set.techniques || [];
        const weightSegCount = 1 + techs.filter(t => ['DROP','DROP_OR_REST'].includes(t)).length;
        const segCount = 1 + techs.filter(t => ['DROP','REST_PAUSE','MP','DROP_OR_REST'].includes(t)).length;

        // Pre-extract segment data from log
        const segs = {};
        for (let i = 1; i < Math.max(weightSegCount, segCount); i++) {
            const raw = log && log.segs && log.segs[String(i)];
            if (!raw) { segs[i] = { weight: '', reps: '' }; }
            else if (typeof raw === 'object') { segs[i] = { weight: raw.weight ?? '', reps: raw.reps ?? '' }; }
            else { segs[i] = { weight: '', reps: raw }; }
        }

        return {
            exId: ex.id, setIdx, set,
            isCompleted: !!(log && log.completed),
            weightVal: log && log.weight ? log.weight : '',
            repsVal: log && log.reps ? log.reps : '',
            unitLabel,
            prev, prevUnitLabel,
            weightSegCount, segCount, segs
        };
    },

    // Pure HTML rendering from pre-computed view-model
    _renderSetRow(vm) {
        const { exId, setIdx, set, isCompleted, weightVal, repsVal,
                unitLabel, prev, prevUnitLabel, weightSegCount, segCount, segs } = vm;

        const prevText = prev ? `пред: ${prev.weight}<span class="set-prev-unit" ${attr(WORKOUT.EXERCISE, exId)}>${prevUnitLabel}</span> x ${prev.reps}` : '';

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

        // Build weight input area (split only for DROP, not for pauses)
        let weightInputHtml;
        if (weightSegCount === 1) {
            weightInputHtml = `<input type="text" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*"
                class="weight-input"
                ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)}
                value="${weightVal}" placeholder="${placeholderW}">`;
        } else {
            let parts = `<input type="text" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*"
                class="weight-input seg-weight-input split-main"
                ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)} ${attr(WORKOUT.SEG, 0)}
                value="${weightVal}" placeholder="${placeholderW}">`;
            for (let i = 1; i < weightSegCount; i++) {
                const sv = segs[i].weight;
                parts += `<span class="split-sep">+</span><input type="text" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*"
                    class="seg-weight-input split-extra"
                    ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)} ${attr(WORKOUT.SEG, i)}
                    value="${sv}" placeholder="">`;
            }
            weightInputHtml = `<div class="split-reps">${parts}</div>`;
        }

        // Build reps input area
        let repsInputHtml;
        if (segCount === 1) {
            repsInputHtml = `<input type="text" inputmode="numeric" pattern="[0-9]*"
                class="reps-input"
                ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)}
                value="${repsVal}" placeholder="${placeholderR}">`;
        } else {
            let parts = `<input type="text" inputmode="numeric" pattern="[0-9]*"
                class="reps-input seg-reps-input split-main"
                ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)} ${attr(WORKOUT.SEG, 0)}
                value="${repsVal}" placeholder="${placeholderR}">`;
            for (let i = 1; i < segCount; i++) {
                const sv = segs[i].reps;
                parts += `<span class="split-sep">+</span><input type="text" inputmode="numeric" pattern="[0-9]*"
                    class="seg-reps-input split-extra"
                    ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)} ${attr(WORKOUT.SEG, i)}
                    value="${sv}" placeholder="">`;
            }
            repsInputHtml = `<div class="split-reps">${parts}</div>`;
        }

        const completeSvg = isCompleted
            ? `<svg width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="cg-${exId}-${setIdx}" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#cg-${exId}-${setIdx})"/><g transform="translate(11,11)"><path d="M4 9l3.5 3.5L14 5.5" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`
            : '<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18.5" stroke="rgba(157,141,245,0.4)" stroke-width="1.5"/></svg>';

        return `
            <div class="set-row${isCompleted ? ' done' : ''}" ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)}>
                <div class="set-info">
                    <span class="set-number">П.${setIdx + 1}</span>
                    ${(set.type && set.type !== 'H') || (set.rpe && set.rpe !== '8') ? `<span class="set-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="rpe-badge">${set.rpe}</span>` : ''}
                    ${techHtml}
                </div>
                <div class="set-inputs">
                    <div class="input-group">
                        <button class="unit-cycle-btn" ${attr(WORKOUT.EXERCISE, exId)}>${unitLabel}</button>
                        ${weightInputHtml}
                    </div>
                    <div class="input-group">
                        <label>reps</label>
                        ${repsInputHtml}
                    </div>
                    <div role="button" class="complete-btn ${isCompleted ? 'completed' : ''}"
                        ${attr(WORKOUT.EXERCISE, exId)} ${attr(WORKOUT.SET, setIdx)}>${completeSvg}</div>
                </div>
                ${prevText ? `<div class="set-prev">${prevText}</div>` : ''}
            </div>
        `;
    },

    _renderSuperset(group, weekNum, dayNum, groupIdx) {
        const items = group.exercises || [];
        let exercisesHtml = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item._chooseOne) {
                exercisesHtml += this._renderChooseOne(item, weekNum, dayNum);
            } else {
                exercisesHtml += this._renderExercise(item, weekNum, dayNum, undefined, groupIdx);
            }
            if (i < items.length - 1) {
                exercisesHtml += '<div class="superset-arrow">&#8595; без отдыха &#8595;</div>';
            }
        }

        const groupIdxAttr = groupIdx != null ? ` ${attr(INLINE.GROUP_IDX, groupIdx)}` : '';
        return `
            <div class="superset-group"${groupIdxAttr}>
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

    // Data preparation for choose-one group — resolve chosen exercise
    _buildChooseOneVM(group, weekNum, dayNum) {
        const choiceKey = group.choiceKey;
        const chosenId = Storage.getChoice(choiceKey, weekNum);
        const options = group.options || [];
        const chosen = chosenId
            ? (options.find(ex => ex.id === chosenId) || options[0])
            : options[0];

        return {
            choiceKey,
            exerciseVM: chosen ? this._buildExerciseVM(chosen, weekNum, dayNum, choiceKey) : null
        };
    },

    // Pure HTML rendering from choose-one view-model
    _renderChooseOne(groupOrVM, weekNum, dayNum, groupIdx) {
        // Accept either a pre-built VM or raw group
        const vm = groupOrVM.exerciseVM !== undefined
            ? groupOrVM
            : this._buildChooseOneVM(groupOrVM, weekNum, dayNum);

        let exerciseHtml = '';
        if (vm.exerciseVM) {
            exerciseHtml = this._renderExercise(vm.exerciseVM, undefined, undefined, undefined, groupIdx);
        }

        const groupIdxAttr = groupIdx != null ? ` ${attr(INLINE.GROUP_IDX, groupIdx)}` : '';
        return `<div class="choose-one-group"${groupIdxAttr}>${exerciseHtml}</div>`;
    },

    // ===== HISTORY VIEW =====

    // Data preparation for history — all Storage reads and data processing
    _buildHistoryVM(exerciseId) {
        const allHistory = Storage.getExerciseHistory(exerciseId);
        const unit = Storage.getExerciseUnit(exerciseId) || Storage.getWeightUnit();
        const unitLabels = { kg: 'кг', lbs: 'lbs', plates: 'пл' };
        const unitLabel = unitLabels[unit] || 'кг';
        const currentEqId = Storage.getExerciseEquipment(exerciseId);
        const currentEq = currentEqId ? Storage.getEquipmentById(currentEqId) : null;

        // Find exercise name
        let exerciseName = exerciseId;
        var _p2 = Storage.getProgram();
        for (let d = 1; d <= getTotalDays(); d++) {
            const tmpl = _p2.dayTemplates[d];
            if (!tmpl) continue;
            for (const group of tmpl.exerciseGroups) {
                const exercises = getGroupExercises(group);
                for (const ex of exercises) {
                    if (ex.id === exerciseId) {
                        exerciseName = exName(ex);
                        break;
                    }
                }
            }
        }
        const subName = Storage.getSubstitution(exerciseId);
        if (subName) exerciseName = subName;

        // Annotate each entry with equipment name for display
        const _eqCache = {};
        const _resolveEqName = (eqId) => {
            if (!eqId) return null;
            if (_eqCache[eqId] === undefined) {
                const eq = Storage.getEquipmentById(eqId);
                _eqCache[eqId] = eq ? eq.name : null;
            }
            return _eqCache[eqId];
        };

        const history = allHistory.map(entry => {
            const eqId = entry.sets[0] && entry.sets[0].equipmentId;
            const eqName = _resolveEqName(eqId);
            return { ...entry, eqName };
        });

        // Compute chart data (all entries)
        const weekMap = {};
        for (const e of history) {
            const mw = Math.max(...e.sets.map(s => s.weight || 0));
            if (mw > 0 && (!weekMap[e.week] || mw > weekMap[e.week])) weekMap[e.week] = mw;
        }
        const chartWeeks = Object.keys(weekMap).map(Number).sort((a, b) => a - b);
        const chartValues = chartWeeks.map(w => weekMap[w]);

        // Check if history contains both uni and non-uni logs
        const _allSets = allHistory.flatMap(e => e.sets);
        const hasUni = _allSets.some(s => s.uni);
        const hasNonUni = _allSets.some(s => !s.uni);
        const hasBothModes = hasUni && hasNonUni;

        return {
            exerciseName, unitLabel,
            currentEqName: currentEq ? currentEq.name : null,
            hasCurrentEq: !!currentEqId,
            history,
            chartWeeks, chartValues,
            hasBothModes
        };
    },

    // Pure HTML rendering from history view-model
    _historyUniFilter: 'all', // 'all' | 'normal' | 'uni'

    renderHistory(exerciseId) {
        const vm = this._buildHistoryVM(exerciseId);
        const { exerciseName, unitLabel, currentEqName,
                history, chartWeeks, chartValues, hasBothModes } = vm;

        // Apply uni filter to history entries
        const uniFilter = this._historyUniFilter;
        const filteredHistory = uniFilter === 'all' ? history : history.map(entry => {
            const filtered = entry.sets.filter(s => uniFilter === 'uni' ? s.uni : !s.uni);
            return filtered.length > 0 ? { ...entry, sets: filtered } : null;
        }).filter(Boolean);

        let contentHtml = '';

        // Uni/normal filter — only show when both types exist
        if (hasBothModes) {
            contentHtml += `<div class="history-uni-filter" data-history-ex="${esc(exerciseId)}">
                <button class="history-filter-btn${uniFilter === 'all' ? ' active' : ''}" data-uni-filter="all">\u0412\u0441\u0435</button>
                <button class="history-filter-btn${uniFilter === 'normal' ? ' active' : ''}" data-uni-filter="normal">\u041E\u0431\u044B\u0447\u043D\u044B\u0435</button>
                <button class="history-filter-btn${uniFilter === 'uni' ? ' active' : ''}" data-uni-filter="uni">\u041F\u043E\u043E\u0447\u0435\u0440\u0451\u0434\u043D\u043E</button>
            </div>`;
        }

        if (filteredHistory.length === 0) {
            contentHtml = '<p class="history-empty">Нет записей</p>';
        } else {
            let maxWeight = 0;

            // Progress chart — max weight per week, SVG line chart
            if (chartWeeks.length > 1) {
                const minV = Math.min(...chartValues);
                const maxV = Math.max(...chartValues);
                const pad = { top: 22, right: 12, bottom: 24, left: 38 };
                const W = 320, H = 130;
                const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
                const range = maxV - minV || 1;
                const x = (i) => pad.left + (i / (chartWeeks.length - 1)) * cW;
                const y = (v) => pad.top + cH - ((v - minV) / range) * cH;
                let gridHtml = '';
                const gridSteps = [minV, minV + range / 2, maxV];
                for (const gv of gridSteps) {
                    const gy = y(gv);
                    gridHtml += `<line x1="${pad.left}" y1="${gy}" x2="${W - pad.right}" y2="${gy}" class="chart-grid"/>`;
                    gridHtml += `<text x="${pad.left - 5}" y="${gy + 3}" class="chart-y-label">${Math.round(gv)}</text>`;
                }
                let xLabels = '';
                const step = chartWeeks.length <= 12 ? 1 : Math.ceil(chartWeeks.length / 8);
                for (let i = 0; i < chartWeeks.length; i += step) {
                    xLabels += `<text x="${x(i)}" y="${H - 4}" class="chart-x-label">W${chartWeeks[i]}</text>`;
                }
                const pts = chartValues.map((v, i) => `${x(i)},${y(v)}`).join(' ');
                let circles = '';
                for (let i = 0; i < chartValues.length; i++) {
                    const isLast = i === chartValues.length - 1;
                    circles += `<circle cx="${x(i)}" cy="${y(chartValues[i])}" r="${isLast ? 4 : 3}" class="chart-point${isLast ? ' last' : ''}"><title>W${chartWeeks[i]}: ${chartValues[i]}${unitLabel}</title></circle>`;
                }
                contentHtml += `<div class="progress-chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
                    ${gridHtml}${xLabels}
                    <polyline points="${pts}" class="chart-line"/>
                    ${circles}
                </svg></div>`;
            }

            // Render all entries in chronological order with equipment badges
            for (const entry of filteredHistory) {
                let setsHtml = '';
                for (const s of entry.sets) {
                    if (s.weight > maxWeight) maxWeight = s.weight;
                    const uniMark = s.uni ? ' <span style="opacity:0.5;font-size:10px">L/R</span>' : '';
                    setsHtml += `
                        <div class="history-set">
                            <span>П.${s.setIdx + 1}:</span>
                            <span class="weight-value">${s.weight}${unitLabel} x ${s.reps}${uniMark}</span>
                        </div>
                    `;
                }
                const eqBadge = entry.eqName
                    ? `<span class="history-eq-badge">${esc(entry.eqName)}</span>`
                    : '';
                contentHtml += `
                    <div class="history-week">
                        <div class="history-week-title">Неделя ${entry.week}, День ${entry.day}${eqBadge}</div>
                        ${setsHtml}
                    </div>
                `;
            }

            if (maxWeight > 0) {
                contentHtml += `<div class="history-max">Максимальный вес: ${maxWeight} ${unitLabel}</div>`;
            }
        }

        const subtitleParts = [exerciseName];
        if (currentEqName) subtitleParts.push(currentEqName);

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
    _getExerciseInfo(exerciseId) {
        var ex = findExerciseInProgram(Storage.getProgram(), exerciseId);
        if (!ex) return { name: '', nameRu: '', category: 'all' };
        // Look up category in EXERCISE_DB — always use DB's English name
        var coreName = (ex.name || ex.nameRu || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        var coreNameRu = (ex.nameRu || ex.name || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        for (var i = 0; i < EXERCISE_DB.length; i++) {
            var dbCoreName = (EXERCISE_DB[i].name || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            var dbCoreNameRu = (EXERCISE_DB[i].nameRu || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            if ((dbCoreName && dbCoreName === coreName) ||
                (dbCoreNameRu && dbCoreNameRu === coreNameRu)) {
                return { name: ex.name || EXERCISE_DB[i].name, nameRu: ex.nameRu || EXERCISE_DB[i].nameRu, category: EXERCISE_DB[i].category };
            }
        }
        return { name: ex.name || '', nameRu: ex.nameRu || '', category: 'all' };
    },

    showEquipmentModal(exerciseId, exEnName, exRuName) {
        var exInfo;
        if (exEnName || exRuName) {
            // Resolve English name from EXERCISE_DB (custom programs may only have Russian names)
            // First try exact full name match, then fallback to core name
            var cat = 'all';
            var resolvedEnName = exEnName || '';
            var fullNameLower = (exEnName || '').toLowerCase();
            var fullNameRuLower = (exRuName || '').toLowerCase();
            var coreName = (exEnName || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            var coreNameRu = (exRuName || exEnName || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            var coreMatch = null;
            for (var i = 0; i < EXERCISE_DB.length; i++) {
                var dbFull = (EXERCISE_DB[i].name || '').toLowerCase();
                var dbFullRu = (EXERCISE_DB[i].nameRu || '').toLowerCase();
                // Exact full name match — best
                if ((dbFull && dbFull === fullNameLower) || (dbFullRu && dbFullRu === fullNameRuLower)) {
                    cat = EXERCISE_DB[i].category;
                    resolvedEnName = EXERCISE_DB[i].name;
                    coreMatch = null; // clear any core match
                    break;
                }
                // Core name match — fallback (keep first)
                if (!coreMatch) {
                    var dbCore = dbFull.replace(/\s*\(.*?\)\s*/g, '').trim();
                    var dbCoreRu = dbFullRu.replace(/\s*\(.*?\)\s*/g, '').trim();
                    if ((dbCore && dbCore === coreName) || (dbCoreRu && dbCoreRu === coreNameRu) ||
                        (dbCore && dbCore === coreNameRu) || (dbCoreRu && dbCoreRu === coreName)) {
                        coreMatch = EXERCISE_DB[i];
                    }
                }
            }
            if (coreMatch) {
                cat = coreMatch.category;
                resolvedEnName = coreMatch.name;
            }
            exInfo = { name: resolvedEnName, nameRu: exRuName || exEnName || '', category: cat };
        } else {
            exInfo = this._getExerciseInfo(exerciseId);
        }
        const muscleGroup = exInfo.category;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'equipment-modal';
        // Check if equipment is currently assigned
        var currentEqId = Storage.getExerciseEquipment(exerciseId);
        var currentEq = currentEqId ? Storage.getEquipmentById(currentEqId) : null;
        var currentEqHtml = '';
        if (currentEq) {
            var thumbHtml = currentEq.imageUrl ? '<img class="eq-current-thumb" src="' + esc(currentEq.imageUrl) + '">' : '';
            currentEqHtml = '<div id="eq-current-row" class="eq-current-row">'
                + thumbHtml
                + '<span class="eq-current-name">Выбрано: <b>' + esc(currentEq.name) + '</b></span>'
                + '<button class="eq-current-remove" id="eq-remove-btn">\u2715</button>'
                + '</div>';
        }

        overlay.innerHTML = `
            <div class="equipment-modal">
                <div class="eq-modal-header">
                    <h3>Оборудование</h3>
                    <button class="picker-close-btn" id="eq-close">\u2715</button>
                </div>
                ${currentEqHtml}
                <div class="eq-search-row">
                    <input type="text" id="eq-search" placeholder="Поиск тренажёра..." class="eq-new-input" autocomplete="off">
                </div>
                <div id="eq-main-content">
                    <div id="eq-gym-section"></div>
                    <div id="eq-brands-section"></div>
                </div>
                <div id="eq-brand-content" style="display:none">
                    <div id="eq-brand-list"></div>
                </div>
                <div id="eq-search-results" class="eq-search-results"></div>
                <div class="eq-add-row" id="eq-add-row">
                    <input type="text" id="eq-new-name" placeholder="Своё оборудование..." class="eq-new-input">
                    <button class="eq-add-btn" id="eq-add-btn">+</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lockBodyScroll();

        overlay._exerciseId = exerciseId;
        overlay._muscleGroup = muscleGroup;
        overlay._exerciseName = exInfo.name;
        overlay._exerciseNameRu = exInfo.nameRu || '';

        blockOverlayScroll(overlay, '.equipment-modal');
        overlay.addEventListener('click', function(e) { UI._onClick && UI._onClick(e); });

        // Search mode — like exercise picker
        var eqModal = overlay.querySelector('.equipment-modal');
        var searchInput = document.getElementById('eq-search');

        function enterEqSearch() {
            overlay._inputFocusedAt = Date.now();
            var mainContent = document.getElementById('eq-main-content');
            var brandContent = document.getElementById('eq-brand-content');
            var addRow = document.getElementById('eq-add-row');
            if (mainContent) mainContent.style.display = 'none';
            if (brandContent) brandContent.style.display = 'none';
            if (addRow) addRow.style.display = 'none';
            var searchResults = document.getElementById('eq-search-results');
            if (searchResults) searchResults.style.flex = '1';
            // Move modal to top (like exercise picker)
            eqModal.style.bottom = 'auto';
            eqModal.style.top = 'env(safe-area-inset-top, 44px)';
            eqModal.style.borderRadius = '0 0 var(--radius-xl) var(--radius-xl)';
            eqModal.style.position = 'fixed';
            eqModal.style.left = '0';
            eqModal.style.right = '0';
            overlay.style.alignItems = 'flex-start';
            adjustEqViewport();
        }

        function exitEqSearch() {
            var mainContent = document.getElementById('eq-main-content');
            var addRow = document.getElementById('eq-add-row');
            if (mainContent) mainContent.style.display = '';
            if (addRow) addRow.style.display = '';
            var searchResults = document.getElementById('eq-search-results');
            if (searchResults) { searchResults.innerHTML = ''; searchResults.style.flex = ''; }
            eqModal.style.bottom = '';
            eqModal.style.top = '';
            eqModal.style.borderRadius = '';
            eqModal.style.position = '';
            eqModal.style.left = '';
            eqModal.style.right = '';
            eqModal.style.maxHeight = '';
            overlay.style.alignItems = '';
        }

        function adjustEqViewport() {
            if (window.visualViewport) {
                eqModal.style.maxHeight = (window.visualViewport.height - 10) + 'px';
            }
        }

        searchInput.addEventListener('focus', function() {
            enterEqSearch();
            if (!searchInput.value.trim()) {
                EquipmentManager.searchEquipment('');
            }
        });

        searchInput.addEventListener('blur', function() {
            if (searchInput.value.trim()) return;
            exitEqSearch();
        });

        // Close button
        var closeBtn = document.getElementById('eq-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // If in brand view, go back first
                var brandContent = document.getElementById('eq-brand-content');
                if (brandContent && brandContent.style.display !== 'none') {
                    EquipmentManager.backToBrands();
                } else {
                    UI.hideEquipmentModal();
                }
            });
        }

        // Swipe right to go back (brand view → brands list)
        var touchStartX = 0;
        var touchStartY = 0;
        eqModal.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        eqModal.addEventListener('touchend', function(e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
            // Swipe right: dx > 80px, mostly horizontal
            if (dx > 80 && dy < 100) {
                var brandContent = document.getElementById('eq-brand-content');
                if (brandContent && brandContent.style.display !== 'none') {
                    EquipmentManager.backToBrands();
                } else {
                    UI.hideEquipmentModal();
                }
            }
        }, { passive: true });

        // visualViewport resize listener for keyboard
        if (window.visualViewport) {
            overlay._vpListener = function() { adjustEqViewport(); };
            window.visualViewport.addEventListener('resize', overlay._vpListener);
        }

        searchInput.addEventListener('input', function() {
            EquipmentManager.searchEquipment(searchInput.value.trim());
        });

        EquipmentManager.loadEquipmentBrands(exerciseId);
    },

    hideEquipmentModal() {
        const modal = document.getElementById('equipment-modal');
        if (modal) {
            if (modal._vpListener && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', modal._vpListener);
            }
            modal.remove();
        }
        if (!document.querySelector('.modal-overlay')) {
            unlockBodyScroll();
        }
    },

    showGymModal(onSelect) {
        var gyms = Storage.getGyms();
        var myGymsHtml = '';
        if (gyms.length > 0) {
            myGymsHtml = '<div class="gym-shared-label">Мои залы:</div>';
            for (var i = 0; i < gyms.length; i++) {
                var g = gyms[i];
                myGymsHtml += '<div class="eq-option" data-gym-id="' + g.id + '">'
                    + '<span>' + esc(g.name) + (g.city ? ' <span class="gym-shared-city">' + esc(g.city) + '</span>' : '') + '</span></div>';
            }
        }

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'gym-modal';
        overlay.innerHTML = '<div class="equipment-modal">'
            + '<div class="modal-header"><h3>Где тренируешься?</h3></div>'
            + '<div id="gym-geo-suggestion" style="display:none"></div>'
            + '<div id="gym-link-prompt" style="display:none"></div>'
            + '<div class="eq-option" data-gym-id="">Без зала</div>'
            + '<div id="gym-my-list">' + myGymsHtml + '</div>'
            + '<div class="eq-add-row">'
            + '<input type="text" id="gym-search-input" placeholder="Поиск зала..." class="eq-new-input">'
            + '</div>'
            + '<div id="gym-shared-results"></div>'
            + '<div class="eq-add-row">'
            + '<input type="text" id="gym-new-name" placeholder="Новый зал..." class="eq-new-input">'
            + '<button class="eq-add-btn" id="gym-add-btn">+</button>'
            + '</div>'
            + '<div id="gym-city-prompt" class="gym-city-prompt" style="display:none">'
            + '<span>Город:</span>'
            + '<input type="text" id="gym-new-city" placeholder="Город..." class="eq-new-input">'
            + '<button class="eq-add-btn gym-city-ok" id="gym-city-ok">OK</button>'
            + '</div></div>';
        document.body.appendChild(overlay);
        lockBodyScroll();

        overlay._onSelect = onSelect;
        blockOverlayScroll(overlay, '.equipment-modal');
        overlay.addEventListener('click', function(e) { UI._onClick && UI._onClick(e); });
        overlay.addEventListener('input', function(e) { UI._onInput && UI._onInput(e); });

        EquipmentManager.suggestNearbyGym();
        EquipmentManager.loadSharedGyms();
    },

    hideGymModal() {
        var modal = document.getElementById('gym-modal');
        if (modal) modal.remove();
        if (!document.querySelector('.modal-overlay')) unlockBodyScroll();
    },

    // ===== VARIATION MODAL (pick exercise variation from same base group) =====
    showVariationModal(exerciseId, exerciseName, exerciseNameRu) {
        // Find base name and all variations from EXERCISE_DB
        // Use original names from data-attrs (not substituted display name)
        const currentNameRu = exerciseNameRu || '';
        const currentNameEn = exerciseName || '';
        const baseName = getExerciseBaseName(currentNameRu || currentNameEn);
        // Find category from EXERCISE_DB
        let category = '';
        for (var i = 0; i < EXERCISE_DB.length; i++) {
            if (EXERCISE_DB[i].nameRu === currentNameRu || EXERCISE_DB[i].name === currentNameEn ||
                getExerciseBaseName(EXERCISE_DB[i].nameRu || '') === baseName) {
                category = EXERCISE_DB[i].category;
                break;
            }
        }

        // Get all variations with same base name + category
        const variations = EXERCISE_DB.filter(function(dbEx) {
            return dbEx.category === category && getExerciseBaseName(dbEx.nameRu || dbEx.name || '') === baseName;
        });

        if (variations.length === 0) return;

        const currentSub = Storage.getSubstitution(exerciseId);
        const currentDisplay = currentSub || currentNameRu || currentNameEn;

        let optionsHtml = '';
        for (var v = 0; v < variations.length; v++) {
            var vex = variations[v];
            var vName = exName(vex);
            var vLabel = getVariationLabel(vName);
            var isSelected = vName === currentDisplay || vex.nameRu === currentDisplay || vex.name === currentDisplay;
            optionsHtml += `
                <div class="eq-option variation-option ${isSelected ? 'selected' : ''}"
                     ${attr(WORKOUT.EXERCISE, exerciseId)}
                     ${attr(WORKOUT.EX_NAME_RU, esc(vex.nameRu))}
                     ${attr(WORKOUT.EX_NAME, esc(vex.name))}>
                    ${exThumbHtml(vex.name)}${esc(vLabel)}${isSelected ? ' <span class="eq-check">\u2713</span>' : ''}
                </div>
            `;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'variation-modal';
        overlay.innerHTML = `
            <div class="equipment-modal">
                <div class="modal-header">
                    <h3>${esc(baseName)}</h3>
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
            UI._onClick && UI._onClick(e);
        });
    },

    hideVariationModal() {
        const modal = document.getElementById('variation-modal');
        if (modal) modal.remove();
        if (!document.querySelector('.modal-overlay')) {
            unlockBodyScroll();
        }
    },

    // ===== SUBSTITUTION MODAL =====
    showSubstitutionModal(exerciseId) {
        // Find original exercise name
        var _p4 = Storage.getProgram();
        let originalName = exerciseId;
        for (let d = 1; d <= getTotalDays(); d++) {
            const tmpl = _p4.dayTemplates[d];
            if (!tmpl) continue;
            for (const group of tmpl.exerciseGroups) {
                const exercises = getGroupExercises(group);
                for (const ex of exercises) {
                    if (ex.id === exerciseId) {
                        originalName = exName(ex);
                        break;
                    }
                }
            }
        }

        const currentSub = Storage.getSubstitution(exerciseId);
        const isSubbed = !!currentSub;

        // Collect ALL exercises from ALL days (unique by name, exclude current)
        const allExercises = [];
        const seenNames = new Set();
        for (let d = 1; d <= getTotalDays(); d++) {
            const tmpl = _p4.dayTemplates[d];
            if (!tmpl) continue;
            for (const group of tmpl.exerciseGroups) {
                const exercises = getGroupExercises(group);
                for (const ex of exercises) {
                    const name = exName(ex);
                    if (ex.id !== exerciseId && !seenNames.has(name)) {
                        seenNames.add(name);
                        allExercises.push(name);
                    }
                }
            }
        }

        // Sort alphabetically
        allExercises.sort((a, b) => a.localeCompare(b, 'ru'));

        // Build exercise list HTML
        let listHtml = '';
        for (const name of allExercises) {
            const isActive = currentSub === name;
            listHtml += `<div class="eq-option sub-option${isActive ? ' selected' : ''}" ${attr(WORKOUT.SUB_NAME, name)} ${attr(WORKOUT.TARGET_EXERCISE, exerciseId)}>${name}${isActive ? ' <span class="eq-check">\u2713</span>' : ''}</div>`;
        }

        // Revert button (only if currently substituted)
        const revertHtml = isSubbed ? `
            <div class="sub-revert-row">
                <button class="sub-revert-btn" ${attr(WORKOUT.EXERCISE, exerciseId)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Вернуть оригинал (${originalName})
                </button>
            </div>
        ` : '';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'substitution-modal';
        overlay.innerHTML = `
            <div class="equipment-modal substitution-modal">
                <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <h3>Заменить упражнение</h3>
                    <button class="sub-close-btn" id="sub-close-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>
                ${revertHtml}
                <div class="sub-search-row">
                    <input type="text" id="sub-search-input" placeholder="Поиск..." autocomplete="off">
                </div>
                <div class="eq-list sub-list" id="sub-exercise-list">
                    ${listHtml}
                </div>
                <div class="eq-add-row">
                    <input type="text" id="sub-custom-name" placeholder="Своё название..." autocomplete="off">
                    <button class="eq-add-btn" id="sub-add-custom-btn">+</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lockBodyScroll();

        overlay._exerciseId = exerciseId;

        blockOverlayScroll(overlay, '.substitution-modal');
        overlay.addEventListener('click', function(e) {
            UI._onClick && UI._onClick(e);
        });

        // Wire up search/filter
        const searchInput = document.getElementById('sub-search-input');
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            const items = document.querySelectorAll('#sub-exercise-list .sub-option');
            items.forEach(function(item) {
                const name = (item.getAttribute(WORKOUT.SUB_NAME) || '').toLowerCase();
                item.style.display = name.includes(query) ? '' : 'none';
            });
        });

        // Swipe right to close with parallax
        var swStartX = 0, swStartY = 0, swDragging = false, swLocked = false;
        var modalEl = overlay.querySelector('.substitution-modal');
        var appEl = document.getElementById('app');

        overlay.addEventListener('touchstart', function(e) {
            swStartX = e.touches[0].clientX;
            swStartY = e.touches[0].clientY;
            swDragging = false;
            swLocked = false;
        }, { passive: true });

        overlay.addEventListener('touchmove', function(e) {
            if (swLocked) return;
            var dx = e.touches[0].clientX - swStartX;
            var dy = e.touches[0].clientY - swStartY;
            if (!swDragging) {
                if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
                if (Math.abs(dy) > Math.abs(dx)) { swLocked = true; return; }
                if (dx < 0) { swLocked = true; return; }
                swDragging = true;
                modalEl.style.transition = 'none';
                appEl.style.transition = 'none';
            }
            if (swDragging) {
                e.preventDefault();
                modalEl.style.transform = 'translateX(' + dx + 'px)';
                // Parallax: background content moves at 0.28x speed from -28% offset
                var W = window.innerWidth;
                var parallax = -0.28 * W + 0.28 * dx;
                appEl.style.transform = 'translateX(' + parallax + 'px)';
                overlay.style.background = 'rgba(4,4,10,' + (0.62 * Math.max(0, 1 - dx / W)) + ')';
            }
        }, { passive: false });

        overlay.addEventListener('touchend', function(e) {
            if (!swDragging) return;
            var dx = e.changedTouches[0].clientX - swStartX;
            if (dx > 80) {
                modalEl.style.transition = 'transform 0.25s ease-out';
                modalEl.style.transform = 'translateX(100%)';
                appEl.style.transition = 'transform 0.25s ease-out';
                appEl.style.transform = '';
                overlay.style.transition = 'background 0.25s';
                overlay.style.background = 'rgba(4,4,10,0)';
                setTimeout(function() {
                    appEl.style.transition = '';
                    appEl.style.transform = '';
                    UI.hideSubstitutionModal();
                }, 260);
            } else {
                modalEl.style.transition = 'transform 0.2s ease-out';
                modalEl.style.transform = '';
                appEl.style.transition = 'transform 0.2s ease-out';
                appEl.style.transform = '';
                overlay.style.transition = 'background 0.2s';
                overlay.style.background = '';
                setTimeout(function() {
                    appEl.style.transition = '';
                }, 220);
            }
            swDragging = false;
        }, { passive: true });
    },

    hideSubstitutionModal() {
        const modal = document.getElementById('substitution-modal');
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
                        <button class="eq-edit-btn" ${attr(EQ.ID, eq.id)}>${svgPencil}</button>
                        <button class="eq-remove-btn" ${attr(EQ.ID, eq.id)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
                    </div>
                </div>
            `;
        }
        if (equipmentList.length === 0) {
            eqListHtml = '<div class="settings-eq-empty">Нет оборудования</div>';
        }

        const gymList = Storage.getGyms();
        let gymListHtml = '';
        for (const g of gymList) {
            gymListHtml += `
                <div class="settings-eq-item">
                    <span>${g.name}${g.city ? ' <span class="gym-shared-city">' + g.city + '</span>' : ''}</span>
                    <div class="eq-item-actions">
                        <button class="gym-remove-btn" data-gym-id="${g.id}"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
                    </div>
                </div>
            `;
        }
        if (gymList.length === 0) {
            gymListHtml = '<div class="settings-eq-empty">Нет залов</div>';
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

                <div class="settings-card">
                    <div class="settings-card-label">Язык упражнений</div>
                    <div class="setup-field" style="margin-bottom: 0;">
                        <div class="cycle-toggle">
                            <button data-lang="ru" ${(settings.exerciseLang || 'ru') === 'ru' ? 'class="active"' : ''}>Русский</button>
                            <button data-lang="en" ${settings.exerciseLang === 'en' ? 'class="active"' : ''}>English</button>
                        </div>
                    </div>
                </div>

                <div style="text-align:center;margin:var(--spacing-lg) 0">
                    <button class="btn-primary btn-compact" id="settings-save">Сохранить</button>
                </div>

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

                <div class="settings-card" style="margin-top: var(--spacing-lg);">
                    <div class="settings-card-label">Мои залы</div>
                    <div class="settings-eq-list">
                        ${gymListHtml}
                    </div>
                    <div class="settings-eq-hint" style="color:var(--text-secondary);font-size:12px;padding:8px 0 0;">Залы добавляются при начале тренировки</div>
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
