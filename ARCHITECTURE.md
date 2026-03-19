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
├── sw.js                   # Service Worker (v544): кеш всех файлов + фоновые нотификации таймера
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
│   ├── main.js             # (5) Entry point: import App → App.init()
│   ├── app.js              # (2515) Роутинг, handleClick, init, login/logout
│   ├── ui.js               # (2047) Рендер: login, week, day, history, settings, menu, модалки
│   ├── builder.js          # (1646) Визард, редактор дня, picker, онбординг, регистрация
│   ├── social-ui.js        # (1333) Рендер соцсети: feed, profile, checkin, discover, messages
│   ├── social.js           # (900) Supabase API: профили, follows, чекины, реакции, DM, залы
│   ├── storage.js          # (1001) localStorage CRUD + sibling cache + миграции данных
│   ├── timer.js            # (495) Таймер отдыха: звук, нотификации, фоновый режим
│   ├── app-state.js        # (8) Shared readable state (currentWeek, currentDay, pageCache)
│   ├── program-utils.js    # (175) Storage-зависимые утилиты: resolveWorkout, exName, getTotalWeeks...
│   ├── utils.js            # (250) Чистые утилиты: esc(), даты, миниатюры, getGroupExercises
│   ├── data.js             # (2604) DEFAULT_PROGRAM + SET_TYPES, TECHNIQUE_TYPES
│   ├── mikhail_data.js     # (9064) MIKHAIL_PROGRAM
│   ├── mikhail2_data.js    # (7846) MIKHAIL2_PROGRAM
│   ├── users.js            # (34) ACCOUNTS + BUILTIN_PROGRAMS
│   ├── exercises_db.js     # (463) EXERCISE_DB (429 упражнений)
│   ├── supabase-sync.js    # (238) Auth + cloud sync (push/pull/merge)
│   ├── data-attrs.js       # (121) Реестр data-атрибутов (WORKOUT, BUILDER, EQ, SOCIAL...)
│   ├── equipment-manager.js# (444) Привязка оборудования, залы, каталог
│   ├── swipe-nav.js        # (311) Свайп-навигация (carousel, back-swipe, tabs)
│   ├── migrations.js       # (300) Одноразовые data-fix миграции
│   ├── cropper.js          # (314) Canvas-кроппер аватарок
│   ├── celebration.js      # (203) Конфетти + статистика при завершении тренировки
│   ├── pull-refresh.js     # (166) Pull-to-refresh
│   ├── workout-timer.js    # (114) Таймер длительности тренировки (elapsed)
│   ├── profile-manager.js  # (100) Сохранение профиля, обработка формы
│   ├── message-notifications.js # (83) Realtime DM уведомления + polling
│   └── scroll-lock.js      # (40) lockBodyScroll, unlockBodyScroll для модалок
├── tools/                  # Утилиты разработки (не runtime)
├── admin.html              # Админ-панель
└── catalog.html            # Каталог оборудования
```

---

## Граф импортов (ES modules)

```
main.js
 └→ app.js (entry hub — импортирует все модули, wires callbacks в init())
     ├→ storage.js → users.js, utils.js
     ├→ supabase-sync.js → storage.js, migrations.js
     ├→ ui.js → app-state.js, program-utils.js, utils.js, storage.js, equipment-manager.js
     ├→ social.js → storage.js, supabase-sync.js
     ├→ social-ui.js → social.js, storage.js, profile-manager.js
     ├→ builder.js → program-utils.js, utils.js, storage.js, supabase-sync.js
     ├→ timer.js → storage.js
     ├→ celebration.js → program-utils.js, social.js, storage.js
     ├→ swipe-nav.js → program-utils.js, builder.js, ui.js
     ├→ equipment-manager.js → app-state.js, social.js, storage.js
     ├→ pull-refresh.js (callback injection)
     ├→ workout-timer.js (leaf)
     ├→ message-notifications.js → social.js, social-ui.js
     ├→ profile-manager.js → social.js
     ├→ migrations.js → storage.js, utils.js
     ├→ program-utils.js → storage.js, utils.js
     ├→ app-state.js (leaf — no imports)
     ├→ data-attrs.js (leaf — no imports)
     ├→ utils.js → exercises_db.js
     ├→ users.js → data.js, mikhail_data.js, mikhail2_data.js
     └→ exercises_db.js (leaf)
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
| `App` | app.js | Init, роутинг, handleClick (1530 строк), login/logout |
| `UI` | ui.js | Рендер тренировочных экранов + модалки |
| `SocialUI` | social-ui.js | Рендер соцсети |
| `Builder` | builder.js | Визард, редактор, picker, онбординг |
| `Storage` | storage.js | localStorage CRUD, sibling cache |
| `Social` | social.js | Supabase API для всех social-таблиц |
| `SupaSync` | supabase-sync.js | Auth + data sync (push/pull/merge) |
| `RestTimer` | timer.js | Таймер отдыха между подходами |
| `EquipmentManager` | equipment-manager.js | Привязка оборудования + залы |
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

### Полная схема `Storage._data`

```javascript
Storage._data = {
  settings: {
    cycleType: 7,              // дней в цикле
    startDate: "2025-01-06",
    weightUnit: "kg",
    timerDuration: 120,
    exerciseLang: "ru"
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
  exerciseEquipment: { "D1E2": "eq_123" },     // null = tombstone
  exerciseEquipmentOptions: { "D1E2": ["eq_123", "eq_456"] },
  exerciseUnits: { "D3E5": "lb" },
  exerciseSubstitutions: { "D1E4": "Выпады с гантелями" },
  equipment: [{ id: "eq_123", name: "Cybex Eagle NX", type: "machine", imageUrl: "..." }],
  myGymIds: ["uuid-1"],
  gymLastUsed: { "uuid-1": 1710000000 },
  gymEquipmentMap: { "uuid-1": { "D1E2": "eq_123" } },
  weekSlots: [{ type: "day", dayNum: 1 }, { type: "rest" }, ...]
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

### Cloud Sync

```
Login: SupaSync.syncOnLogin()
  → pullData() → _deepMergeLogs(local, remote) [per-set, latest timestamp wins]
  → merge exerciseChoices, exerciseEquipment (respect null tombstones)
  → pushData()

Continuous: Storage._save() → SupaSync.schedulePush() [debounced 3s]
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
