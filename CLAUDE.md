# CLAUDE.md — Инструкции для Claude

## О проекте

Трекер тренировок — PWA на vanilla JS для отслеживания программ тренировок бодибилдинга с социальными функциями (лента, чекины, чат). Данные в localStorage + Supabase sync. SPA на hash-роутинге, без фреймворков, без бандлера. Логика в глобальных синглтонах (`App`, `UI`, `Storage`, `Social`, `SocialUI`, `Builder`, `RestTimer`).

## Запуск

Статический сервер из корня проекта. Нет npm/build шагов.
```bash
npx serve .
# или
python3 -m http.server 8000
```

---

## Структура проекта

```
index.html          — точка входа, порядок загрузки скриптов КРИТИЧЕН
js/app.js           — init(), route(), handleClick(), свайпы, миграции (4034 строк)
js/ui.js            — рендер основных экранов (неделя, день, настройки, модалки)
js/builder.js       — создание программ, редактор дня, онбординг, регистрация
js/social-ui.js     — UI соцсети (лента, профиль, чекин, чат, уведомления)
js/social.js        — Supabase API для соцсети (CRUD всех таблиц)
js/storage.js       — localStorage: чтение/запись/миграция данных пользователя
js/utils.js         — resolveWorkout(), даты, имена упражнений, миниатюры
js/data.js          — DEFAULT_PROGRAM (template + weekly overrides)
js/mikhail_data.js  — MIKHAIL_PROGRAM (предсоревновательная)
js/mikhail2_data.js — MIKHAIL2_PROGRAM (off-season)
js/timer.js         — таймер отдыха (inline-bar, Web Audio, push-нотификации)
js/supabase-sync.js — Auth + двусторонний sync через Supabase
js/users.js         — ACCOUNTS, BUILTIN_PROGRAMS (легаси)
js/exercises_db.js  — 429 упражнений из Hevy
js/cropper.js       — canvas-кроппер для аватарок
css/styles.css      — все стили (5329 строк, CSS-переменные, тёмная тема)
sw.js               — Service Worker (кэш, фоновые нотификации таймера)
```

---

## Критические правила

### 1. Файлы, которые нельзя менять без крайней необходимости

| Файл | Причина |
|------|---------|
| `js/data.js`, `js/mikhail_data.js`, `js/mikhail2_data.js` | Программы с реальными данными. Изменение ломает resolveWorkout(), getCompletedSets(), весь UI дня, историю логов |
| `js/storage.js` (структура `_defaultData()`) | Схема данных. Добавление полей требует миграции в `_load()`. Переименование ломает sync с Supabase |
| `js/users.js` | Хардкод аккаунтов. Изменение ID ломает привязку данных в localStorage |
| `js/exercises_db.js` | Справочник, от которого зависят миниатюры (`exThumbUrl`) |
| `sw.js` (CACHE_NAME) | Забыл обновить версию → пользователи не получат апдейт |

### 2. Связанные компоненты (если меняешь A → проверь B)

| Изменение | Проверить |
|---|---|
| `Storage.saveSetLog()` / формат лога | `App.handleClick` (complete-btn), `UI._renderSetRow()`, `SupaSync._deepMergeLogs()`, `Storage.getPreviousLog()` |
| `Storage._data` структура (поля) | `SupaSync.syncOnLogin()` (merge), `Storage._load()` (миграция), все `get*/save*` вызовы |
| `resolveWorkout()`, `getCompletedSets()` в `utils.js` | `UI.renderDay()`, `UI._weekCardsHTML()`, `App.route()` |
| Структура exerciseGroup / sets в `data.js` | `utils.js` (все resolve-функции), `UI.renderDay()`, `Builder.renderDayEditor()` |
| `UI.renderDay()` / `UI._renderSetRow()` | `App.handleClick()` — data-атрибуты в HTML должны совпадать с парсингом |
| `UI._renderSetRow()` CSS-классы (.weight-input, .reps-input) | `App.handleInput()` — классы = контракт между рендером и обработчиком |
| `Storage.getExerciseEquipment()` | `UI.showEquipmentModal()`, `App` (eq-option handlers) |
| `Social.*` (API-методы) | `SocialUI.*` (все render-функции), `App.handleClick` (social handlers) |
| `SocialUI._tabBarHTML()` | Все экраны с tab bar (feed, profile, discover, notifications, messages) |
| `RestTimer.start()` | DOM-структура `.set-row` и `.exercise-card` в `UI.renderDay()` |
| `App.route()` (новый маршрут) | `App._getSwipeConfig()` — каждый маршрут должен иметь swipe-конфиг |
| `UI.renderWeek()` | `UI._weekCardsHTML()`, `UI._weekViewHTML()` — используются как swipe companions |
| `innerHTML` перерисовки | `markCachedThumbs()` (мерцание миниатюр), scroll position, RestTimer bar |
| `Builder._editingDay` | `Builder.renderDayEditor()`, `Builder._autoSave()` |

### 3. Где хранится стейт и как с ним работать

**Главное правило**: Все данные пользователя проходят через `Storage`. Никогда не пиши в `localStorage` напрямую (кроме служебных флагов миграции).

```javascript
// ✅ Правильно:
Storage.saveSetLog(week, day, exId, setIdx, weight, reps, eqId);
Storage.getSetLog(week, day, exId, setIdx);
Storage.saveSettings({ weightUnit: 'lb' });

// ❌ Неправильно:
localStorage.setItem('wt_data_xxx', JSON.stringify(data));  // обходит кеш и sync
```

**Кеш `Storage._data`**: Storage кеширует данные в памяти. После `_save()` кеш актуален. Но если пишешь напрямую в localStorage — кеш устарел. Вызови `Storage._invalidateCache()`.

**Программа `PROGRAM`**:
1. Глобальная mutable переменная (`let`). Загружается в `App._loadProgramForUser()`. Может быть `DEFAULT_PROGRAM`, `MIKHAIL_PROGRAM`, или кастомная из `Storage.getProgram()`
2. `resolveWorkout(week, day)` возвращает DEEP CLONE шаблона с applied overrides — безопасно мутировать результат
3. Exercise ID формат: `D{day}E{num}` или `D{d}E{n}_opt{n}` для choose_one
4. **Если меняешь exercise ID — сломаются ВСЕ сохранённые логи** (`Storage.log[week][day][exerciseId]`)
5. Если меняешь в рантайме — вызови `Storage.saveProgram(PROGRAM, false)`

**Синхронизация**: `Storage._save()` автоматически триггерит `SupaSync.onLocalSave()` → debounced push (3 сек). Не нужно вызывать sync вручную.

**Рендеринг (UI)**:
1. Весь рендеринг — через `innerHTML = '...'` (полная замена DOM). Нет diffing
2. После `renderDay()` нужно переинициализировать: timer insert point, scroll position, `markCachedThumbs()`
3. Pull-to-refresh вызывает `App.route(true)` → полный re-render текущего экрана
4. Inline `onclick`/`onchange` **НЕ используются** (кроме пары исключений в setup). ВСЁ через delegation в `App.handleClick()`

### 4. Соглашения по стилям и именованию

**JavaScript:**
- Глобальные объекты: `PascalCase` (`Storage`, `UI`, `App`)
- Приватные методы: `_underscore` prefix (`_load()`, `_save()`, `_renderSetRow()`)
- Нет `class`, нет `new`, нет прототипов — только plain objects и functions
- В `storage.js` используется `var` и `function(){}` вместо arrow functions (историческая причина)
- ID упражнений: `D{day}E{number}` (например `D1E2`), варианты: `D1E1_opt1`
- Choice keys: `D{day}_{name}` (например `D1_deadlift`)
- Equipment IDs: `eq_{timestamp}` (например `eq_1773590540310`)
- Event handling: делегирование через `App.handleClick()` на `#app`, ID-based (`target.id === 'btn-xxx'`)

**CSS:**
- BEM-подобные классы: `.day-card`, `.set-row`, `.exercise-card`, `.complete-btn`
- Модалки: `.eq-modal`, `.choice-modal`, `.gym-modal`
- Состояния: `.done`, `.completed`, `.active`, `.modal-open`
- Анимации: `.pop`, `.slide-left`, `.slide-right`

**HTML-рендер:**
- Всё строками: `var html = '<div class="...">' + ... + '</div>'`
- Вставка: `document.getElementById('app').innerHTML = html`
- data-атрибуты: `data-exercise="D1E2"`, `data-set="0"`, `data-week="3"`

**Версионирование:**
- Query-параметры в `index.html`: `styles.css?v=155`, `app.js?v=217`
- Service Worker: `CACHE_NAME = 'workout-tracker-v515'` в `sw.js`

### 5. После каждого изменения

**Чеклист:**
1. Если менял `.js` или `.css` — инкрементируй `?v=` в `index.html`
2. Если менял список файлов — обнови `ASSETS` массив в `sw.js`
3. Если менял структуру данных — добавь миграцию в `Storage._load()`
4. Если добавил маршрут — добавь swipe-конфиг в `App._getSwipeConfig()`
5. Если менял рендер дня — проверь что data-атрибуты совпадают с `handleClick`
6. Проверь какие связанные файлы затронуты (см. таблицу выше)

**Формат описания изменений:**
```
Changed: js/ui.js (renderDay, lines 550-600)
What: Fixed equipment display in set row
Related: app.js handleClick (equipment picker), storage.js getExerciseEquipment()
Data: No storage structure changes
```

---

## Типичные ошибки и их причины

1. **Подход не сохраняется / не отображается**: Проверь data-атрибуты в `UI._renderSetRow()` → они должны совпадать с парсингом в `App.handleClick` (complete-btn блок).

2. **Данные не синхронизируются**: `Storage._save()` должен вызываться. Проверь что `SupaSync._currentSupaUserId` установлен (устанавливается в `App._initSupaSync`).

3. **Экран пустой после навигации**: `App.route()` не распознал hash. Проверь regex. Если добавил новый маршрут — проверь что он идёт до catch-all блока.

4. **Таймер не работает**: `RestTimer.start()` вызывается после `complete-btn` → нужен `.set-row` элемент для позиционирования inline бара.

5. **Оборудование "воскресает" после удаления**: Sync перезаписывает. Используй `null` как tombstone в `exerciseEquipment` (уже реализовано в `removeExerciseEquipment`).

6. **Миграция ломает данные**: Одноразовые фиксы в `App.init()` используют `localStorage.getItem('_fix_xxx')` как guard. Новые фиксы — уникальный ключ.

7. **Свайп не работает на новом экране**: Не добавлен конфиг в `App._getSwipeConfig()`. Каждый маршрут с навигацией должен быть там.

8. **Мерцание миниатюр при перерендере**: Вызови `markCachedThumbs()` после innerHTML. Уже используется, но легко забыть при добавлении нового рендера.
