# PROBLEMS.md — Архитектурные проблемы (post-refactor)

## ✅ Исправлено в рефакторинге

| # | Было | Статус |
|---|------|--------|
| — | Монолитный CSS (5329 строк) | ✅ Разбит на 14 файлов через @import |
| — | Нет ES-модулей, критичный порядок скриптов | ✅ Полная миграция на ES modules |
| — | Миграции в App.init() (110 строк хардкода) | ✅ Вынесены в `migrations.js` (300 строк) |
| — | Глобальное мутабельное PROGRAM | ✅ Инкапсулирован в `Storage.getProgram()` |
| — | 5× дублирование привязки оборудования | ✅ `App._bindEquipment()` |
| — | 8× дублирование навигации «назад» | ✅ `App._navigateBack()` |
| — | `_getSiblingIds()` O(N²) на каждый вызов | ✅ `Storage._siblingCache` с lazy build |
| — | Нет XSS-экранирования | ✅ `esc()` в utils.js, используется в ui/social-ui/builder |
| — | Stale _pageCache без инвалидации | ✅ `App.invalidatePageCache()` вызывается при мутациях |
| — | App.js 4034 строк, mixed concerns | ✅ Вынесены 11 модулей: swipe, pull-refresh, equipment, celebration, migrations и т.д. |
| — | Prop drilling через magic strings | ✅ `data-attrs.js` — единый реестр с `attr()`/`read()`/`readInt()` |
| 1 | 11 циклических импортов (ES modules) | ✅ Callback injection + `app-state.js` + `program-utils.js`. 0 циклов |

---

## 🟡 Оставшиеся серьёзные проблемы

### 2. `App.handleClick()` — всё ещё 1530 строк

**Где:** `js/app.js`, строки ~875–2406

**Что изменилось:** app.js уменьшился с 4034 до 2515 строк. Вынесены модули. Но `handleClick` по-прежнему содержит ВСЕ click-обработчики в одной if/else цепочке.

**Что осталось внутри:** login, registration, onboarding, social (follow, like, comment, discover, messages), workout (complete set, add/remove set, choice, substitution), settings, navigation.

**Решение:** Разбить на подметоды: `_handleSocialClick()`, `_handleWorkoutClick()`, `_handleSettingsClick()`. Или делегировать в модули: `SocialUI.handleClick()`, `Builder.handleClick()`.

---

### 3. UI = data logic + rendering в одном

**Где:** `js/ui.js` (2047 строк), `js/social-ui.js` (1333 строк)

**Проблема:** `UI.renderDay()` смешивает получение данных (`Storage.getSetLog()`, `resolveWorkout()`), вычисление бизнес-логики (процент выполнения, previous log lookup), и генерацию HTML.

**Решение:** Вынести data-preparation в отдельные функции. Render принимает готовые данные.

---

### 4. Полный re-render через innerHTML

**Проблема:** Каждый `renderDay()` уничтожает весь DOM. Потеря фокуса, scroll, мерцание.

**Что уже есть:** Точечное обновление при complete-btn (иконка + класс без re-render). `markCachedThumbs()`. Scroll restore.

**Что осталось:** Выбор оборудования, выбор упражнения, настройки — всё ещё полный re-render.

---

### 5. Дублирование `target.id || target.closest()` (~100 раз)

**Где:** `js/app.js` handleClick

**Проблема:** Каждый handler: `if (target.id === 'btn-X' || target.closest('#btn-X'))`. 100+ повторений.

**Решение:** Утилита `function closest(e, sel)` + один паттерн.

---

### 6. `_migrateExerciseNames()` — хрупкая MAP из 50+ записей

**Где:** `js/storage.js`

**Проблема:** Запускается при каждой загрузке. Перезаписывает имена. Конфликтует с cloud sync.

---

## 🟢 Средние / низкие

### 7. Хардкод аккаунтов в `users.js`

Легаси, миграция на Supabase Auth в процессе. Удалить после завершения.

---

### 8. Нет типизации (JSDoc отсутствует)

Все данные — plain objects. Ошибки только в runtime. Добавить хотя бы JSDoc для SetLog, Exercise, Program.

---

### 9. mikhail_data.js (17K строк) загружается всегда

Даже если пользователь не Михаил. ES modules загружают при первом import — а `users.js` импортирует оба.

**Решение:** Dynamic `import()` — загружать программу по требованию.

---

## Сводная таблица

| # | Проблема | Сложность | Приоритет |
|---|----------|-----------|-----------|
| 1 | ~~11 циклических импортов~~ | — | ✅ Решено |
| 2 | handleClick 1530 строк | Средняя | 🟡 P1 |
| 3 | UI = data + render | Высокая | 🟡 P1 |
| 4 | innerHTML re-render | Средняя | 🟡 P1 |
| 5 | Дублирование closest-паттерна | Низкая | 🟡 P1 |
| 6 | Хрупкая _migrateExerciseNames | Средняя | 🟢 P2 |
| 7 | Хардкод аккаунтов | Низкая | 🟢 P2 |
| 8 | Нет JSDoc типизации | Средняя | 🟢 P3 |
| 9 | Программы грузятся всегда | Средняя | 🟢 P3 |

---

## Рекомендуемый порядок

**~~Шаг 1~~ ✅ — Циклические импорты (#1) — решено.**

**Шаг 2 — Разбить handleClick (#2):**

Поэтапно: сначала social handlers → `SocialUI.handleClick()` (самый изолированный блок). Потом builder, потом equipment.

**Шаг 3 — Отделить data от render (#3):**

Начать с `UI.renderDay()` — самый сложный и самый используемый. Вынести data-preparation.
