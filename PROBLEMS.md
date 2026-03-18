# PROBLEMS.md — Архитектурные проблемы

## 🔴 Критические (чинить первым)

### 1. ~~God Object: `App.handleClick()` — 2000+ строк if/else~~ ✅ РЕШЕНО

**Коммит:** `906bff6` (2026-03-18)

**Что сделано:** `handleClick()` разбит на 7 доменных под-методов + хелпер `_navigateBack()`. Теперь это 18-строчный диспетчер:
- `_handleAuthClick()` — login, register, migrate, logout
- `_handleBuilderClick()` — onboarding, builder, setup, program mgmt
- `_handleSocialClick()` — profiles, feed, chat, checkins, likes, comments
- `_handleNavigationClick()` — back buttons с анимацией
- `_handleSettingsClick()` — timer, equipment, gyms, reset
- `_handleModalClick()` — substitution, gym, choice, equipment modals
- `_handleWorkoutClick()` — unit cycle, timer, sets, complete, history, export

---

### ~~2. Дублирование поиска упражнений (4-6 реализаций)~~ ✅ РЕШЕНО

**Что сделано:** Все обходы `exerciseGroups` унифицированы через канонические функции в `utils.js`:
- `getGroupExercises(group)` — извлекает упражнения из группы любого типа
- `findExerciseInTemplate(template, id)` → `findExerciseInProgram(program, id)` — поиск по ID
- `getAllProgramExercises(program)` — все упражнения с номерами дней

`UI._findSiblingExercises()` удалён — заменён на `Storage.getSiblingExercises(id)`, использующий lazy-кеш `_siblingCache` с `{id, day}` парами (O(1) после первого вызова). `UI._getExerciseInfo()` использует `findExerciseInProgram()`. Добавление нового `group.type` требует изменения только в `getGroupExercises()`.

---

## 🟡 Серьёзные (чинить вторым приоритетом)

### ~~3. HTML-строки как единственный способ рендера (XSS + потеря состояния)~~ ✅ РЕШЕНО

**Коммит:** `f0267b3` (XSS), `eca3ec1` (input state)

**Что сделано:**
1. **XSS:** Добавлена функция `esc()` в `utils.js` — экранирует `& < > " '`, обрабатывает null/undefined/0. Применена в ~65 местах вставки пользовательских данных в HTML:
   - `social-ui.js` (~40 мест) — профиль, комменты, чекины, чат, уведомления, mention autocomplete, `_renderMentionText()` переведён с частичного `<` escape на полный `esc()`
   - `app.js` (~15 мест) — toast сообщений, tagged users, equipment modal (все `.replace(/"/g, '&quot;')` заменены на `esc()`), gym search
   - `ui.js` (~10 мест) — gym indicator, equipment button/modal, history equipment titles
   - `builder.js` (~6 мест) — program title, day title, exercise picker

2. **Потеря состояния инпутов:** Добавлен `debounce.flush()` в `utils.js` — немедленно выполняет pending callback. `renderDay()` вызывает `App._saveDebounced.flush()` в самом начале, до генерации HTML — pending значения попадают в Storage до построения нового DOM. После DOM-замены восстанавливается фокус, позиция курсора через `_restoreFocus()` (поиск инпута по data-exercise/data-set/data-seg). Работает для всех 19 вызовов `renderDay()`.

**Осталось (архитектурные ограничения, не баги):**
- Мерцание изображений (частично решено `markCachedThumbs` + PTR offscreen decode)
- Невозможно обновить один элемент — только полный перерендер

---

### ~~4. Одноразовые миграции в `App.init()` — 110 строк хардкода~~ ✅ РЕШЕНО

**Коммит:** `2fbc887` (2026-03-18)

**Что сделано:** Все 4 миграции вынесены в `js/migrations.js` → объект `Migrations` с методом `run()`. Дубликат `_cleanOrphanedLogEntries()` удалён из `App`, перенесён в `Migrations.cleanOrphanedLogEntries()`. `App.init()` теперь вызывает `Migrations.run()` вместо 95 строк inline-кода.

---

### ~~5. `App.js` делает слишком много (4034 строки)~~ ✅ РЕШЕНО

**Что сделано:** Вынесены 8 модулей из `app.js` (4034 → 2473 строк, -1561):
- `js/celebration.js` (198 строк) — объект Celebration (конфетти, оверлей завершения тренировки)
- `js/swipe-nav.js` (294 строки) — `SwipeNav.getConfig()` + `SwipeNav.init(app)` (свайп-навигация)
- `js/pull-refresh.js` (166 строк) — `PullRefresh.init(onRefresh)` (pull-to-refresh)
- `js/migrations.js` — миграции из `App.init()`
- `js/workout-timer.js` (114 строк) — `WorkoutTimer` (start/pause/resume/cancel/stop, sessionStorage)
- `js/equipment-manager.js` (436 строк) — `EquipmentManager` (модалки оборудования, каталог, geo-suggest, привязка к залам)
- `js/message-notifications.js` (79 строк) — `MessageNotifications` (realtime+polling, badge, toast)
- `js/profile-manager.js` (97 строк) — `ProfileManager` (сохранение профиля, чекин с фото/тегами)

---

### ~~6. Тесная связь свайпов и рендеринга~~ ✅ РЕШЕНО

**Что сделано:** `createBackCompanion()` и `createCarouselCompanion()` в `swipe-nav.js` переведены на cache-first подход: сначала используют `App._pageCache[targetHash]` (HTML, сохранённый при последнем рендере страницы), и только при пустом кеше (cold start) вызывают UI-методы как fallback. Добавлен `App.invalidatePageCache(hashOrPrefix?)` для инвалидации кеша при мутациях данных (решает также проблему #18).

---

### ~~7. Глобальное мутабельное состояние PROGRAM~~ ✅ РЕШЕНО

**Что сделано:** Глобальная `let PROGRAM` удалена из `data.js`. Программа хранится в `Storage._program` с API: `Storage.getProgram()` (runtime getter), `Storage.setProgram(prog)` (setter с инвалидацией sibling cache), `Storage.getStoredProgram()` (чтение из localStorage). Все ~65 обращений к `PROGRAM` в 6 файлах заменены на `Storage.getProgram()`/`setProgram()`.

---

### ~~8. Дублирование привязки оборудования (5 копий)~~ ✅ РЕШЕНО

**Что сделано:** Вынесен `_bindEquipment(exId, eqId, shareInfo)` — единый хелпер для `setExerciseEquipment` + `setGymExerciseEquipment` + `_shareToGymEquipment` + hide modal + re-render. Все 5 обработчиков (`eq-option`, `eq-add-btn`, `eq-search-item`, `eq-gym-item`, `eq-catalog-item`) используют его.

---

### ~~9. Дублирование навигации «назад» (8+ копий)~~ ✅ РЕШЕНО

**Коммиты:** `906bff6` (handleClick refactor создал `_navigateBack()` и перевёл 6 кнопок), текущий коммит (убрал последний дубликат в `_handleEditorBack()`)

**Что сделано:** `_navigateBack(hash, beforeNav)` — единый хелпер с опциональным callback и поддержкой `history.back()` (через `hash === null`). Все back-кнопки используют его. `_handleEditorBack()` сведён к однострочнику.

---

### ~~10. `Storage._getSiblingIds()` — O(N²) обход на каждый вызов~~ ✅ РЕШЕНО

**Что сделано:** Добавлен lazy-кеш `_siblingCache` в `Storage`. `_buildSiblingCache()` строит lookup `{ exerciseId → [siblingIds] }` одним обходом `PROGRAM.dayTemplates`. Кеш инвалидируется в `saveProgram()`. `_getSiblingIds()` теперь O(1) после первого вызова.

---

## 🟢 Средние (чинить когда руки дойдут)

### ~~11. Отсутствие разделения логики и UI~~ ✅ РЕШЕНО

**Что сделано:** Введён view-model слой — бизнес-логика (Storage reads, API calls, вычисления) вынесена из рендер-методов в отдельные функции подготовки данных:

**ui.js:**
- `_buildSetRowVM(ex, setIdx, weekNum, dayNum)` — 7 Storage reads + segment computation → plain object. `_renderSetRow(vm)` получает готовые данные
- `_buildDayVM(weekNum, dayNum)` — resolveWorkout, timer state, progress, gym → plain object. Используется в `renderDay()` и `_dayViewHTML()` (устранено дублирование)
- `_buildWeekVM(weekNum)` — slots с progress, user info, settings → plain object. Используется в `renderWeek()`, `_weekViewHTML()`, `_weekCardsHTML(vm)` (устранено дублирование)

**social-ui.js:**
- `_loadProfileData(targetId, isOwn)` — 8 async API calls → plain object
- `_loadFeedData()` — 8 async API calls → plain object
- `_loadCheckinData(checkinId)` — 4+ async API calls + comment threading → plain object

**builder.js:**
- `_buildDayEditorVM(dayNum)` — program/choice resolution + exercise extraction → plain object

---

### ~~12. Пароли в открытом виде~~ ✅ ЧАСТИЧНО РЕШЕНО

**Что сделано:** Пароли plain text удалены из `ACCOUNTS` в `users.js`. Login legacy-юзеров теперь по username only (без проверки пароля) → сразу миграция на Supabase Auth или сообщение «войдите через email» для уже мигрированных.

**Осталось:** Self-registered пользователи (`wt_users` в localStorage) всё ещё хранят пароль plain text — отдельная задача. После миграции всех legacy-юзеров — удалить `users.js` целиком.

---

### ~~13. CSS: 5329 строк в одном файле~~ ✅ РЕШЕНО

**Что сделано:** `css/styles.css` разбит на 13 компонентных файлов, подключаемых через `@import`:
- `variables.css` — CSS custom properties (:root)
- `base.css` — reset, body, #app, header, content area
- `auth.css` — setup, login, onboarding, notification prompt
- `week-view.css` — week nav, day cards
- `day-view.css` — exercise cards, set rows, weight modal, history, finish btn
- `settings.css` — equipment modal, settings cards, substitution modal
- `components.css` — menu cards, guide, calculator, pull-to-refresh
- `timer.css` — rest timer, workout timer, gym indicator, equipment chips/search
- `builder.css` — day editor, exercise picker, set controls, groups, cropper
- `celebration.css` — workout complete overlay, fireworks, timer row
- `social.css` — tab bar, profiles, checkins, likes, notifications, discover
- `chat.css` — messaging, chat bubbles, input bar, toast
- `animations.css` — shared keyframes (fadeIn, slide-up-modal)

Keyframes остаются при своих компонентах, в `animations.css` только общие. `styles.css` — 15-строчная точка входа. SW ASSETS и CACHE_NAME обновлены.

---

### ~~14. Порядок загрузки скриптов критичен, нет модульности~~ ✅ РЕШЕНО

**Решение:** Все 23 файла мигрированы на native ES modules (`import`/`export`). Единственная точка входа `js/main.js` через `<script type="module">`. Scroll-lock утилиты вынесены в `js/scroll-lock.js`. Круговые зависимости (Storage ↔ Social ↔ SupaSync) безопасны через runtime-only ссылки. Без бандлера.

---

### 15. Prop drilling через data-атрибуты

**Где:** `UI._renderSetRow()` → `App.handleClick()`

**Проблема:** Данные передаются через DOM: `<button data-exercise="D1E2" data-set="0">` → `btn.dataset.exercise`. Нет type safety (строки), при изменении имени атрибута — менять в двух файлах.

---

### ~~16. Дублирование `target.id === 'X' || target.closest('#X')` (~100 раз)~~ ✅ РЕШЕНО

**Что сделано:** `Element.closest()` по спецификации проверяет сам элемент, поэтому `target.id === 'X' || target.closest('#X')` избыточно — достаточно `target.closest('#X')`. Удалены ~106 дублирующих проверок в `app.js` и `builder.js`:
- 52 паттерна `target.id === 'X' || target.closest('#X')` → `target.closest('#X')`
- 30 паттернов `target.matches('.X') || target.closest('.X')` → `target.closest('.X')`
- 16 тернарных `target.matches('.X') ? target : target.closest('.X')` → `target.closest('.X')`
- Специальные случаи: multi-ID, reversed ternary, classList.contains+closest

---

### 17. `Storage._migrateExerciseNames()` — хрупкая rename-карта

**Где:** `js/storage.js`, строки 187–356

**Проблема:** Переименование упражнений при загрузке — MAP из 50+ записей + RU_MAP + DB_RU lookup + ID_MAP. Запускается на каждую загрузку данных если `_exerciseNamesMigrated < 3`. Перезаписывает имена в stored program. Конфликтует с cloud sync (sync может перезаписать мигрированные имена обратно на старые).

---

### ~~18. Stale `App._pageCache` — кеш HTML без инвалидации~~ ✅ РЕШЕНО

**Что сделано:** Добавлен `App.invalidatePageCache(hashOrPrefix?)` — инвалидирует конкретный hash или все записи. Вызывается при: завершении подхода (день+неделя), смене настроек (все), привязке оборудования (день), замене упражнения (день), выборе варианта (день), импорте программы (все), добавлении/удалении недель/дней/подходов (все или неделя).

---

### 19. Нет валидации пользовательского ввода

`parseFloat(String(value).replace(',', '.'))` — единственная "валидация" веса. Нет проверки на отрицательные / аномальные значения.

---

### 20. Тихие ошибки Supabase

**Где:** `js/social.js` — паттерн `if (result.error) return null;` → ошибки проглатываются, пользователь не видит что запрос провалился.

---

## Приоритет исправлений

| # | Проблема | Сложность | Влияние | Приоритет |
|---|----------|-----------|---------|-----------|
| 1 | God Object handleClick | Высокая | Критическое | 🔴 P0 |
| 2 | ~~Дублирование поиска упражнений~~ ✅ | **Средняя** | Высокое | 🔴 P0 |
| 9 | ~~Дублирование навигации назад~~ ✅ | **Низкая** | Среднее | 🟡 P1 |
| 10 | ~~`_getSiblingIds()` O(N²)~~ ✅ | **Низкая** | Среднее (perf) | 🟡 P1 |
| 8 | ~~5× дублирование привязки оборудования~~ ✅ | **Низкая** | Среднее | 🟡 P1 |
| 4 | ~~Миграции в init()~~ ✅ | Низкая | Среднее | 🟡 P1 |
| 5 | ~~App.js слишком большой~~ ✅ | **Средняя** | Высокое | 🟡 P1 |
| 6 | ~~Свайпы связаны с рендерингом~~ ✅ | **Средняя** | Среднее | 🟡 P1 |
| 3 | ~~innerHTML / XSS + потеря состояния~~ ✅ | **Средняя** | Среднее | 🟡 P1 |
| 7 | ~~PROGRAM encapsulation~~ ✅ | **Низкая** | Среднее | 🟢 P2 |
| 11 | ~~Логика + UI в одном~~ ✅ | **Средняя** | Среднее | 🟢 P2 |
| 12 | ~~Пароли (легаси)~~ ✅ частично | Низкая | Среднее | 🟢 P2 |
| 16 | ~~Дублирование closest-паттерна~~ ✅ | **Низкая** | Низкое | 🟢 P2 |
| 17 | Хрупкая _migrateExerciseNames | Средняя | Среднее | 🟢 P2 |
| 13 | Монолитный CSS | Средняя | Низкое | 🟢 P3 |
| 14 | ~~Нет ES-модулей~~ ✅ | **Высокая** | Низкое (пока) | 🟢 P3 |
| 15 | Prop drilling | Средняя | Низкое | 🟢 P3 |
| 18 | ~~Stale _pageCache~~ ✅ | **Низкая** | Низкое | 🟢 P3 |
| 19 | Нет валидации ввода | Низкая | Низкое | 🟢 P3 |
| 20 | Тихие ошибки Supabase | Средняя | Среднее | 🟢 P3 |

---

## Рекомендуемый порядок действий

**Шаг 1 — Быстрые win'ы (низкий риск, не ломают функционал):**
- ~~Вынести навигацию назад в `_navigateBack()` (#9)~~ ✅
- ~~Вынести `_bindEquipment()` (#8)~~ ✅
- ~~Построить sibling lookup cache (#10)~~ ✅
- ~~Вынести миграции из `App.init()` (#4)~~ ✅

**Шаг 2 — Структурные рефакторинги (средний риск):**
- ~~Создать `ProgramUtils` для поиска упражнений (#2)~~ ✅
- ~~Инкапсулировать `PROGRAM` в Storage (#7)~~ ✅
- ~~Разделить `handleClick` на подметоды по экранам (#1)~~ ✅
- ~~Вынести свайпы, pull-to-refresh, celebration, workout-timer, equipment-manager, message-notifications, profile-manager в отдельные модули (#5)~~ ✅
- **Тестировать каждый экран после каждого шага**

**Шаг 3 — Безопасность и рендер (долгосрочно):**
- ~~Добавить `escapeHtml()` для пользовательских данных (#3)~~ ✅ → `esc()` в utils.js, ~65 мест
- ~~Сохранение состояния инпутов при перерендере (#3)~~ ✅ → `debounce.flush()` + `_restoreFocus()` в renderDay()
- ~~Инвалидация `_pageCache` при мутациях данных (#18)~~ ✅ → `invalidatePageCache()` + cache-first companions (#6)
- ~~Выделить view-model слой (#11)~~ ✅ → `_buildXxxVM()` / `_loadXxxData()` в ui.js, social-ui.js, builder.js
- ~~Убрать plain text пароли из `users.js` (#12)~~ ✅ → пароли удалены, login по username only → миграция на Supabase Auth. Осталось: удалить `users.js` после миграции всех юзеров
- ~~Рассмотреть миграцию на ES-модули (#14)~~ ✅
