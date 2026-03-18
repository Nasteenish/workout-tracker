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

### ~~3. HTML-строки как единственный способ рендера (XSS + потеря состояния)~~ ✅ ЧАСТИЧНО РЕШЕНО

**Что сделано:** Добавлена функция `esc()` в `utils.js` — экранирует `& < > " '`, обрабатывает null/undefined/0. Применена в ~65 местах вставки пользовательских данных в HTML:
- `social-ui.js` (~40 мест) — профиль, комменты, чекины, чат, уведомления, mention autocomplete, `_renderMentionText()` переведён с частичного `<` escape на полный `esc()`
- `app.js` (~15 мест) — toast сообщений, tagged users, equipment modal (все `.replace(/"/g, '&quot;')` заменены на `esc()`), gym search
- `ui.js` (~10 мест) — gym indicator, equipment button/modal, history equipment titles
- `builder.js` (~6 мест) — program title, day title, exercise picker

**Осталось (не XSS, но часть проблемы #3):**
- Потеря состояния инпутов (фокус, позиция курсора, scroll) при полном innerHTML перерендере
- Мерцание изображений (частично решено `markCachedThumbs`)
- Невозможно обновить один элемент — только полный перерендер

---

### ~~4. Одноразовые миграции в `App.init()` — 110 строк хардкода~~ ✅ РЕШЕНО

**Коммит:** `2fbc887` (2026-03-18)

**Что сделано:** Все 4 миграции вынесены в `js/migrations.js` → объект `Migrations` с методом `run()`. Дубликат `_cleanOrphanedLogEntries()` удалён из `App`, перенесён в `Migrations.cleanOrphanedLogEntries()`. `App.init()` теперь вызывает `Migrations.run()` вместо 95 строк inline-кода.

---

### ~~5. `App.js` делает слишком много (4034 строки)~~ ✅ ЧАСТИЧНО РЕШЕНО

**Что сделано:** Вынесены 3 модуля из `app.js` (3853 → 3204 строк, -649):
- `js/celebration.js` (198 строк) — объект Celebration (конфетти, оверлей завершения тренировки)
- `js/swipe-nav.js` (294 строки) — `SwipeNav.getConfig()` + `SwipeNav.init(app)` (свайп-навигация)
- `js/pull-refresh.js` (166 строк) — `PullRefresh.init(onRefresh)` (pull-to-refresh)
- Ранее: `js/migrations.js` (миграции из `App.init()`)

**Осталось:** workout timer (~107 строк), checkin form, profile save — тесно связаны с App state.

---

### 6. Тесная связь свайпов и рендеринга

**Где:** `App._getSwipeConfig()`, `App._initSwipeNav()`

**Проблема:** Свайп-навигация жёстко привязана к каждому маршруту. Для создания companion-экранов при свайпе вызываются внутренние методы UI: `UI._weekCardsHTML()`, `UI._weekViewHTML()`, `UI._dayViewHTML()`, `UI._menuHTML()`. Если рендерер изменится — свайпы сломаются.

**Решение:** Companion-экраны кэшировать через `App._pageCache` вместо повторного рендеринга.

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

### 11. Отсутствие разделения логики и UI

**Где:** `ui.js`, `social-ui.js`, `builder.js`

**Проблема:** Рендер-методы содержат бизнес-логику. `UI._renderSetRow()` вычисляет предыдущий лог, формат веса, единицы, siblings — и тут же генерирует HTML. `SocialUI.renderProfile()` делает 6 параллельных API-запросов и сразу рендерит.

**Решение:** Выделить view-model слой. Render-функции принимают готовые данные.

---

### 12. Пароли в открытом виде

**Где:** `js/users.js` (строки 28-30), `Storage.createSelfRegisteredUser()`, `Storage.loginSelfRegistered()`

**Проблема:** `ACCOUNTS` содержит пароли plain text. Self-registered пользователи хранят пароль в localStorage.

**Статус:** Легаси, есть миграция на Supabase Auth. Но код ещё активен.

**Решение:** После полной миграции всех пользователей — удалить `users.js` и связанный код.

---

### 13. CSS: 5329 строк в одном файле

Нет структуры, нет разделения по компонентам. Сложно найти стили конкретного экрана.

**Решение:** Разбить на файлы (`timer.css`, `social.css`, `builder.css`), подключать через `@import`.

---

### 14. Порядок загрузки скриптов критичен, нет модульности

**Где:** `index.html` — 15 `<script>` тегов в жёстком порядке

**Проблема:** Нет `import/export`. Каждый скрипт зависит от глобальных объектов, определённых ранее. Нельзя загрузить один файл отдельно. Нельзя tree-shake.

**Решение (долгосрочное):** Миграция на ES-модули. Это решит проблему порядка и позволит изолировать зависимости.

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

### 18. Stale `App._pageCache` — кеш HTML без инвалидации

**Где:** `js/app.js`, строка 12 и 1381–1384

**Проблема:** `App.route()` кеширует `innerHTML` каждой страницы в `_pageCache[hash]` для instant-restore при back swipe. Но кеш **никогда не инвалидируется** — может показать stale данные после изменения настроек, завершения подхода и т.д.

**Примечание:** Мы предлагали использовать pageCache для companion-экранов (проблема 6). Нужно решить stale-проблему прежде чем расширять его использование.

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
| 5 | ~~App.js слишком большой~~ ✅ частично | **Средняя** | Высокое | 🟡 P1 |
| 6 | Свайпы связаны с рендерингом | Средняя | Среднее | 🟡 P1 |
| 3 | ~~innerHTML / XSS~~ ✅ частично (esc() добавлен) | **Средняя** | Среднее (остаток — потеря состояния) | 🟡 P1 |
| 7 | ~~PROGRAM encapsulation~~ ✅ | **Низкая** | Среднее | 🟢 P2 |
| 11 | Логика + UI в одном | Высокая | Среднее | 🟢 P2 |
| 12 | Пароли (легаси) | Низкая | Среднее | 🟢 P2 |
| 16 | ~~Дублирование closest-паттерна~~ ✅ | **Низкая** | Низкое | 🟢 P2 |
| 17 | Хрупкая _migrateExerciseNames | Средняя | Среднее | 🟢 P2 |
| 13 | Монолитный CSS | Средняя | Низкое | 🟢 P3 |
| 14 | Нет ES-модулей | Высокая | Низкое (пока) | 🟢 P3 |
| 15 | Prop drilling | Средняя | Низкое | 🟢 P3 |
| 18 | Stale _pageCache | Низкая | Низкое | 🟢 P3 |
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
- ~~Вынести свайпы, pull-to-refresh, celebration в отдельные модули (#5)~~ ✅
- **Тестировать каждый экран после каждого шага**

**Шаг 3 — Безопасность и рендер (долгосрочно):**
- ~~Добавить `escapeHtml()` для пользовательских данных (#3)~~ ✅ → `esc()` в utils.js, ~65 мест
- Точечное обновление DOM для форм ввода (#3 остаток)
- Инвалидация `_pageCache` при мутациях данных (#18)
- Удалить `users.js` после полной миграции на Supabase Auth (#12)
- Рассмотреть миграцию на ES-модули (#14)
