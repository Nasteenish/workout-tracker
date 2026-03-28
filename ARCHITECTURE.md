# ARCHITECTURE.md — Трекер Тренировок (post-refactor)

## Стек технологий

| Категория | Технология |
|-----------|-----------|
| Фреймворк | Vanilla JS (ES modules). SPA с hash-роутингом |
| Модульная система | ES modules (`import/export`). Entry point: `main.js` → `App.init()` |
| Стейт-менеджмент | `Storage` синглтон → `localStorage` с in-memory кешем (`_data`) |
| Роутинг | Hash-based (`#/week/1`, `#/feed`). `App.route()` с regex-парсингом |
| БД/Хранилище | `localStorage` (offline-first) + Supabase (cloud sync + соцсеть) |
| Стили | 14 CSS файлов через `@import` в `styles.css`. CSS-переменные, тёмная тема |
| PWA | Service Worker (`sw.js`) + `manifest.json`. Cache-first |
| UI-рендеринг | innerHTML (HTML-строки). `esc()` для экранирования пользовательских данных |
| Внешние зависимости | Только Supabase JS v2 (CDN). Нет npm, бандлера, транспиляции |

---

## Структура файлов

```
workout-tracker/
├── index.html              # SPA точка входа. Supabase CDN + <script type="module" src="main.js">
├── manifest.json           # PWA
├── sw.js                   # Service Worker: кеш всех файлов + фоновые нотификации таймера
├── css/
│   ├── styles.css          # Entry: @import всех CSS
│   ├── variables.css       # CSS custom properties
│   ├── base.css            # Сброс, типографика, layout
│   ├── auth.css            # Логин, регистрация, онбординг
│   ├── week-view.css       # Карточки дней недели
│   ├── day-view.css        # Экран тренировки (подходы, упражнения)
│   ├── settings.css        # Настройки, меню
│   ├── components.css      # Модалки, кнопки, общие компоненты
│   ├── timer.css           # Таймер отдыха (inline bar)
│   ├── builder.css         # Визард, редактор дня, picker
│   ├── celebration.css     # Анимация завершения тренировки
│   ├── social.css          # Лента, профиль, чекины, discover
│   ├── chat.css            # Сообщения (DM)
│   └── animations.css      # Свайпы, переходы
├── js/
│   ├── main.js             # Entry point: import App → App.init()
│   ├── app.js              # Роутинг, handleClick (делегатор), init, login/logout
│   ├── ui.js               # Рендер: login, week, day, history, settings, menu, модалки
│   ├── builder.js          # Визард, редактор дня, picker, онбординг, регистрация
│   ├── social-ui.js        # Рендер соцсети: feed, profile, checkin, discover, messages
│   ├── social.js           # Supabase API: профили, follows, чекины, реакции, DM, залы
│   ├── storage.js          # localStorage CRUD + sibling cache + миграции данных
│   ├── timer.js            # Таймер отдыха: звук, нотификации, фоновый режим
│   ├── app-state.js        # Shared readable state (currentWeek, currentDay, pageCache)
│   ├── program-utils.js    # Storage-зависимые утилиты: resolveWorkout, exName, getTotalWeeks...
│   ├── utils.js            # Чистые утилиты: esc(), даты, миниатюры, getGroupExercises
│   ├── data.js             # DEFAULT_PROGRAM + SET_TYPES, TECHNIQUE_TYPES
│   ├── mikhail_data.js     # MIKHAIL_PROGRAM
│   ├── mikhail2_data.js    # MIKHAIL2_PROGRAM
│   ├── users.js            # ACCOUNTS + BUILTIN_PROGRAMS
│   ├── exercises_db.js     # EXERCISE_DB (438 упражнений) + EXERCISE_CATEGORIES (8)
│   ├── supabase-sync.js    # Auth + cloud sync (push/pull/merge)
│   ├── data-attrs.js       # Реестр data-атрибутов (WORKOUT, BUILDER, EQ, SOCIAL, SETTINGS, ONBOARDING)
│   ├── workout-ui.js       # Workout + modal click/input/focus handlers
│   ├── inline-editor.js    # Day view: swipe-delete, reorder mode (long-press→drag), exercise menu (три точки)
│   ├── equipment-manager.js# Привязка оборудования, залы, каталог
│   ├── swipe-nav.js        # Свайп-навигация (carousel, back-swipe, tabs)
│   ├── migrations.js       # Одноразовые data-fix миграции
│   ├── cropper.js          # Canvas-кроппер аватарок
│   ├── celebration.js      # Конфетти + статистика при завершении тренировки
│   ├── pull-refresh.js     # Pull-to-refresh
│   ├── workout-timer.js    # Таймер длительности тренировки (elapsed)
│   ├── profile-manager.js  # Сохранение профиля, обработка формы
│   ├── message-notifications.js # Realtime DM уведомления + polling
│   └── scroll-lock.js      # lockBodyScroll, unlockBodyScroll для модалок
├── tools/                  # Утилиты разработки (не runtime)
├── admin.html              # Админ-панель
├── catalog.html            # Каталог оборудования
└── v2.html                 # Экспериментальный интерфейс
```

---

## Граф импортов (ES modules)

```
main.js
 └→ app.js (entry hub — импортирует все модули, wires callbacks в init())
     ├→ storage.js → users.js, utils.js
     ├→ supabase-sync.js → storage.js, migrations.js
     ├→ ui.js → scroll-lock.js, storage.js, social.js, social-ui.js, builder.js, app-state.js, equipment-manager.js, workout-timer.js, timer.js, utils.js, program-utils.js, exercises_db.js, data-attrs.js
     ├→ social.js → storage.js, supabase-sync.js, utils.js
     ├→ social-ui.js → social.js, storage.js, profile-manager.js, utils.js, data-attrs.js
     ├→ builder.js → storage.js, social.js, supabase-sync.js, users.js, exercises_db.js, scroll-lock.js, utils.js, program-utils.js, app-state.js, data.js, data-attrs.js
     ├→ timer.js → storage.js
     ├→ celebration.js → program-utils.js, social.js, storage.js
     ├→ swipe-nav.js → program-utils.js, builder.js, ui.js
     ├→ equipment-manager.js → app-state.js, social.js, storage.js, workout-timer.js, utils.js, data-attrs.js
     ├→ workout-ui.js → storage.js, ui.js, social.js, timer.js, workout-timer.js, equipment-manager.js, celebration.js, data-attrs.js, utils.js, program-utils.js
     ├→ inline-editor.js → scroll-lock.js, storage.js, app-state.js, data-attrs.js, utils.js, program-utils.js
     ├→ pull-refresh.js (callback injection, no imports)
     ├→ message-notifications.js → social.js, social-ui.js, utils.js
     ├→ profile-manager.js → social.js, utils.js
     ├→ cropper.js → scroll-lock.js
     ├→ migrations.js → storage.js, exercises_db.js, utils.js
     ├→ program-utils.js → storage.js, utils.js
     ├→ scroll-lock.js → data-attrs.js
     ├→ app-state.js (leaf — no imports)
     ├→ data-attrs.js (leaf — no imports)
     ├→ utils.js → exercises_db.js
     └→ users.js → data.js, mikhail_data.js, mikhail2_data.js

Транзитивные leaf-модули (не импортируются app.js напрямую):
  workout-timer.js — через ui.js, equipment-manager.js, workout-ui.js
  exercises_db.js  — через ui.js, builder.js, utils.js, migrations.js
  data.js          — через builder.js, users.js
```

**0 циклических импортов.** Межмодульное связывание через callback injection в `App.init()` (паттерн аналогичен `PullRefresh.init(onRefresh)`).

---

## Карта компонентов

### Дерево рендеринга

```
App.init() → App.route()
 ├── UI.renderLogin()
 ├── UI.renderSetup()
 ├── UI.renderWeek(weekNum)
 │   ├── UI._weekCardsHTML()     (swipe companion)
 │   └── UI._weekViewHTML()      (swipe companion)
 ├── UI.renderDay(week, day)
 │   ├── UI._dayViewHTML()       (swipe companion)
 │   ├── UI._renderExercise()
 │   ├── UI._renderSetRow()
 │   ├── UI._renderSuperset()
 │   └── UI._renderChooseOne()
 ├── UI.renderHistory(exId)
 ├── UI.renderMenu()
 │   └── UI._menuHTML()          (swipe companion)
 ├── UI.renderSettings()
 ├── UI.renderGuide()
 ├── UI.renderCalculator()
 ├── Builder.renderRegister()
 ├── Builder.renderMigration()
 ├── Builder.renderOnboarding*()
 ├── Builder.renderWizardStep1/2()
 ├── Builder.renderDayEditor()
 ├── SocialUI.renderFeed()
 ├── SocialUI.renderProfile()
 ├── SocialUI.renderProfileEdit()
 ├── SocialUI.renderCheckinForm()
 ├── SocialUI.renderCheckinDetail()
 ├── SocialUI.renderDiscover()
 ├── SocialUI.renderNotifications()
 ├── SocialUI.renderMessages()
 ├── SocialUI.renderConversation()
 └── SocialUI.renderFollowList()

Inline-editor (день — touch-обработчики):
  InlineEditor.attachHandlers()  — swipe-delete + reorder mode
  InlineEditor.showExerciseMenu() — модалка три точки (техники, повторения, замена, удаление)

Модалки (поверх текущего экрана):
  UI.showEquipmentModal()    — EquipmentManager обрабатывает клики
  UI.showGymModal()
  UI.showChoiceModal()
  UI.showSubstitutionModal()
  Builder.showExercisePicker()
  Builder.showExerciseConfig()
  AvatarCropper.open()
```

### Ответственность модулей

| Модуль | Файл | Что делает |
|--------|------|------------|
| `App` | app.js | Init, роутинг, handleClick (~276 строк, делегатор → Builder/SocialUI/WorkoutUI), login/logout |
| `UI` | ui.js | Рендер тренировочных экранов + модалки |
| `SocialUI` | social-ui.js | Рендер соцсети |
| `Builder` | builder.js | Визард, редактор, picker, онбординг |
| `Storage` | storage.js | localStorage CRUD, sibling cache |
| `Social` | social.js | Supabase API для всех social-таблиц |
| `SupaSync` | supabase-sync.js | Auth + data sync (push/pull/merge) |
| `RestTimer` | timer.js | Таймер отдыха между подходами |
| `WorkoutUI` | workout-ui.js | Workout + modal click/input/focus handlers (делегат из App.handleClick) |
| `InlineEditor` | inline-editor.js | Swipe-delete, reorder mode (long-press→drag), exercise menu (три точки), повторения/техники |
| `EquipmentManager` | equipment-manager.js | Привязка оборудования + залы |
| `AvatarCropper` | cropper.js | Canvas-кроппер аватарок |
| `ScrollLock` | scroll-lock.js | lockBodyScroll, unlockBodyScroll, blockOverlayScroll для модалок |
| `SwipeNav` | swipe-nav.js | Свайп-навигация |
| `PullRefresh` | pull-refresh.js | Pull-to-refresh |
| `Celebration` | celebration.js | Конфетти при завершении тренировки |
| `WorkoutTimer` | workout-timer.js | Elapsed time тренировки |
| `Migrations` | migrations.js | One-time data fixes |
| `MessageNotifications` | message-notifications.js | DM realtime + polling |
| `ProfileManager` | profile-manager.js | Сохранение профиля |
| `AppState` | app-state.js | Shared readable state (currentWeek, currentDay, pageCache) |
| `program-utils` | program-utils.js | Storage-зависимые утилиты: resolveWorkout, exName, getCompletedSets |
| `data-attrs` | data-attrs.js | Реестр всех data-атрибутов |

---

## Поток данных

### Схема `Storage._data` (пример заполненного состояния)

```javascript
// _defaultData() содержит только базовые поля. Остальные добавляются динамически.
Storage._data = {
  settings: {
    cycleType: 7,              // дней в цикле
    startDate: "2025-01-06",   // default: null — устанавливается при старте
    weightUnit: "kg",
    timerDuration: 120,        // dynamic — не в _defaultData()
    exerciseLang: "ru"         // dynamic — не в _defaultData()
  },
  program: { ... } | null,     // кастомная программа (null → BUILTIN)
  log: {
    "1": {                     // week (string)
      "1": {                   // day (string)
        "_gym": "uuid-...",    // metadata: ID зала
        "D1E2": {              // exerciseId
          "0": {               // setIdx (string)
            weight: 40, reps: 12, completed: true,
            timestamp: 1710000000000,
            unit: "kg", equipmentId: "eq_123",
            segs: { "1": { weight: 30, reps: 8 } }
          }
        }
      }
    }
  },
  exerciseChoices: { "D1_deadlift": "D1E1_opt3" },
  exerciseEquipment: { "D1:bench_press": "catalog:88" },  // null = tombstone; NO sibling propagation
  exerciseEquipmentOptions: { "D1:bench_press": ["catalog:88", "custom:my_bar"] },  // siblings share options
  exerciseUnits: { "D3E5": "lb" },
  exerciseSubstitutions: { "D1E4": "Выпады с гантелями" },
  equipment: [{ id: "eq_123", name: "Cybex Eagle NX", type: "machine", imageUrl: "..." }],
  gyms: [],                    // legacy локальные залы (в _defaultData)
  myGymIds: ["uuid-1"],        // dynamic — не в _defaultData()
  gymLastUsed: { "uuid-1": 1710000000 },  // dynamic
  gymEquipmentMap: { "uuid-1": { "D1:bench_press": "catalog:88" } },  // NO sibling propagation
  weekSlots: [{ type: "day", dayNum: 1 }, { type: "rest" }, ...],  // dynamic
  _lastModified: 1710000000000,      // updated on every _save()
  _programModified: 1710000000000    // updated only in saveProgram()
}
```

### Путь записи

```
User tap "✓" → App.handleClick()
  → read(btn, WORKOUT.EXERCISE)  // data-attrs.js
  → Storage.saveSetLog(w, d, exId, setIdx, weight, reps, eqId)
    → _data.log[w][d][exId][setIdx] = { ... }
    → _save() → localStorage + Storage._onSave() callback → SupaSync.onLocalSave() → debounced push (3s)
  → App.invalidatePageCache()  // fix stale cache
```

### Путь чтения

```
App.route() → UI.renderDay(3, 1)
  → resolveWorkout(3, 1)  // program-utils.js — uses Storage.getProgram()
  → Storage.getSetLog() per set
  → UI._renderSetRow() → HTML с data-attrs из WORKOUT.*
  → innerHTML
```

### Pull-to-Refresh рендер (async path)

```
PullRefresh → App.route(true)
  → appEl.classList.add('no-animate')
  → UI.renderDay() sees isPTR=true → offscreen div + img.decode() → swap()
    → swap() moves DOM nodes → appEl.classList.remove('no-animate')
    → UI._onPTRSwap() → InlineEditor.attachHandlers() [async, after swap]
```

**Важно:** `attachHandlers()` в `route()` (синхронный) находит СТАРЫЙ `.day-slide`. Реальное подключение — через `_onPTRSwap` callback ПОСЛЕ async swap.

### Cloud Sync

```
Login: SupaSync.syncOnLogin()
  → pullData()
  → _deepMergeLogs(local, remote) [per-set, latest timestamp wins; _-fields: local priority]
  → merge exerciseChoices (union, no overwrite)
  → merge exerciseEquipment (null = tombstone, undefined = absent)
  → merge program (by _programModified; skipped if WorkoutTimer active via _isWorkoutActiveFn)
  → _flattenChooseOneInData() — normalize choose_one→single after merge
  → _normalizeEquipmentIds() — convert eq_* → custom:*/catalog:* (post-sync permanent fix)
  → pushData()
  → _onSyncComplete → Storage.setProgram(getStoredProgram()) — обновить in-memory кеш

Guards:
  → onLocalSave() checks _syncing — не пушить частично-merged данные
  → Builder._autoSave() checks SupaSync._syncing — не перезаписывать результат sync
  → _isWorkoutActiveFn — не заменять program во время активной тренировки

Continuous: Storage._save() → SupaSync.onLocalSave() → schedulePush() [debounced 3s]

Background triggers:
  → window 'online' event → syncOnLogin (reconnect after offline)
  → visibilitychange 'visible' → syncOnLogin (debounced 60s, skips if init sync recent)
  → syncOnLogin has _syncing guard + 15s timeout safety net

Timestamps:
  → _lastModified — updated on every _save(), used for overall blob comparison
  → _programModified — updated only in saveProgram(), used for independent program merge
  → After merge: _lastModified = Math.max(local, remote) — NEVER Date.now()

Template snapshots:
  → log[w][d]._template — created at workout start by snapshotTemplateInLog()
  → _deepMergeLogs: _-fields use local priority (ld !== undefined ? ld : rd)
  → null tombstone = corrupted snapshot, resolveWorkout falls back to live template
  → Builder._buildDayEditorVM reads from snapshot (inline editor sees same data as renderDay)
  → Builder._autoSave updates snapshot after saving to live program

Equipment per-instance (NO sibling propagation):
  → setExerciseEquipment: sets ONLY for this exerciseId, adds to sibling OPTIONS
  → removeExerciseEquipment: tombstone ONLY for this exerciseId
  → setGymExerciseEquipment: ONLY for this exerciseId
  → getExerciseEquipment: fallback to siblings if this exercise has no assignment
  → getPreviousLog: filters by equipmentId; if no match → fallback to any log (no filter)
  → Analytics.getWeekComparison: groups by exerciseId + equipmentId
```

---

## Ключевые сущности

### Program — `Storage.getProgram()` (больше нет глобального `let PROGRAM`)

```javascript
{ version, title, coach, athlete, totalWeeks,
  dayTemplates: { 1: { title, titleRu, exerciseGroups: [...] } },
  weeklyOverrides: { 3: { 1: { "D1E2": { sets: { 0: { rpe: "10" } } } } } }
}
```

**Снэпшоты шаблонов** хранятся в `log[week][day]._template` (не в program). Создаются при старте тренировки (`Storage.snapshotTemplateInLog`). `resolveWorkout(week, day)` приоритет: `_template` из лога → live `dayTemplates`. `_deepMergeLogs` даёт приоритет локальному для `_`-полей → sync не теряет снэпшот. Tombstone `null` = битый снэпшот (не перезаписывается, `resolveWorkout` падает на live template).

**Legacy:** `templateSnapshots` и `weekTemplateVersion` могут присутствовать в старых данных, но не используются активным кодом (удалены в Phase 3). Старые миграции (v5, v12) в migrations.js ссылаются на них — не трогать.

### ExerciseGroup (4 типа)

```javascript
{ type: "single",     exercise: { id, name, nameRu, reps, rest, sets } }
{ type: "superset",   exercises: [...] }
{ type: "choose_one", choiceKey: "D1_deadlift", options: [...] }
{ type: "warmup",     exercise: { ... } }
```

### Set Log — `log[week][day][exId][setIdx]`

```javascript
{ weight: 45, reps: 12, completed: true, timestamp: 1710000000000,
  unit: "kg", equipmentId: "eq_123",
  segs: { "1": { weight: 35, reps: 8 } } }
```

---

## Роутинг

Все маршруты в `App.route()`. Свайпы в `SwipeNav`.

### Тренировки: `#/setup`, `#/week/{n}`, `#/week/{n}/day/{d}`, `#/history/{exId}`, `#/menu`, `#/settings`, `#/guide`, `#/calculator`
### Авторизация: `#/login`, `#/register`, `#/migrate`, `#/onboarding/{1-5}`
### Построитель: `#/builder/step1`, `#/builder/step2`, `#/edit/day/{n}`
### Соцсеть: `#/feed`, `#/profile`, `#/profile/edit`, `#/checkin`, `#/checkin/{id}`, `#/discover`, `#/notifications`, `#/messages`, `#/messages/{id}`, `#/u/{username}`, `#/followers/{id}`, `#/following/{id}`

### Навигация

```
login → onboarding/1 (пол) → 2 (роль) → 3/3a/3t → setup
setup → builder/step1 → step2 → week/{n}
week/{n} ↔ day (tap) → Celebration (100%) → week
week ↔ feed ↔ profile (tab bar)
```

Свайпы (`SwipeNav._getSwipeConfig()`): carousel недель, back-swipe, feed↔profile tabs, pull-to-refresh.

---

## Supabase — таблицы и хранилища

| Таблица | Модуль | Что хранит |
|---------|--------|------------|
| `user_data` | SupaSync | JSONB-блоб данных (зеркало localStorage) |
| `profiles` | Social | username, display_name, avatar_url, gender, bio |
| `checkins` | Social | Посты: текст, фото, workout_summary |
| `photo_tags` | Social | Теги пользователей на фото |
| `follows` | Social | follower_id → following_id |
| `reactions` | Social | Лайки/реакции на чекины |
| `comments` | Social | Комментарии к чекинам |
| `comment_likes` | Social | Лайки на комментарии |
| `conversations` | Social | DM-диалоги |
| `messages` | Social | Сообщения в диалогах |
| `notifications` | Social | Уведомления (follow, like, comment) |
| `shared_gyms` | Social | Общая база залов (crowdsourced) |
| `shared_equipment` | Social | Общая база оборудования |
| `shared_exercises` | Social | Общая база упражнений |
| `gym_equipment` | Social | Оборудование ↔ зал (crowdsourced) |
| `equipment_catalog` | Social | Каталог брендов (Cybex, Precor, gym80) |

| Storage bucket | Что хранит |
|---------------|------------|
| `avatars` | Аватарки (`{userId}/avatar.jpg`) |
| `checkin-photos` | Фото чекинов |
| `equipment-images` | Изображения оборудования + `exercise-thumbs/` |

| Realtime | Что слушает |
|----------|-------------|
| `messages` | Новые DM (подписка в `Social.subscribeMessages()`) |
