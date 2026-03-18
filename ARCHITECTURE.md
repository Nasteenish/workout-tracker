# ARCHITECTURE.md — Трекер Тренировок

## Стек технологий

| Категория | Технология |
|-----------|-----------|
| Фреймворк | Vanilla JS (без фреймворков). SPA с ручным роутингом через `location.hash` |
| Стейт-менеджмент | Глобальный объект `Storage` — обёртка над `localStorage` с in-memory кешем (`_data`) |
| Роутинг | Hash-based (`#/week/1`, `#/feed`, `#/profile`). Парсинг регулярками в `App.route()` |
| БД/Хранилище | `localStorage` (локально) + Supabase (облачная синхронизация и соцсеть) |
| Стили | Один CSS файл `css/styles.css` (~5300 строк), CSS-переменные, тёмная тема |
| PWA | Service Worker (`sw.js`) + `manifest.json`. Оффлайн через cache-first стратегию |
| UI-рендеринг | Ручная генерация HTML строками (innerHTML). Нет Virtual DOM, шаблонизатора |
| Язык интерфейса | Русский (с поддержкой EN для названий упражнений через `exName()`) |

---

## Структура папок

```
workout-tracker/
├── index.html              # Единственная HTML-точка входа. Загружает все JS в нужном порядке
├── v2.html                 # Старая/тестовая точка входа (урезанный набор скриптов)
├── manifest.json           # PWA-манифест
├── sw.js                   # Service Worker: кеширование + таймер-нотификации в фоне
├── css/
│   └── styles.css          # Все стили приложения (~5300 строк)
├── icons/
│   ├── icon-192.png        # PWA-иконка
│   └── icon-512.png        # PWA-иконка
├── js/
│   ├── utils.js            # (344) Утилиты: даты, форматирование, работа с программой тренировок
│   ├── data.js             # (2611) DEFAULT_PROGRAM (Анастасия): шаблоны дней + еженедельные оверрайды
│   ├── mikhail_data.js     # (9064) MIKHAIL_PROGRAM: предсоревновательная программа Дмитрия
│   ├── mikhail2_data.js    # (7846) MIKHAIL2_PROGRAM: off-season программа Михаила
│   ├── users.js            # (31) ACCOUNTS (хардкод логинов) + BUILTIN_PROGRAMS (реестр программ)
│   ├── exercises_db.js     # (463) EXERCISE_DB: 429 упражнений из Hevy (nameRu, name, category)
│   ├── supabase-sync.js    # (233) SupaSync: авторизация Supabase, push/pull данных, deep merge логов
│   ├── storage.js          # (1150) Storage: единая обёртка localStorage, CRUD для всех данных
│   ├── social.js           # (865) Social: Supabase API для профилей, чекинов, подписок, реакций, DM
│   ├── ui.js               # (2059) UI: рендер экранов (логин, неделя, день, настройки, модалки)
│   ├── cropper.js          # (313) AvatarCropper: кроп аватарки для профиля
│   ├── social-ui.js        # (1274) SocialUI: рендер ленты, профиля, чекинов, сообщений
│   ├── builder.js          # (1623) Builder: регистрация, визард программы, редактор дня, упражнения
│   ├── timer.js            # (494) RestTimer: таймер отдыха с нотификациями и звуком
│   └── app.js              # (4034) App: инициализация, роутинг, ВСЕ click/input обработчики, свайпы
├── tools/                  # Утилиты для разработки (не часть приложения)
│   ├── build_sql.py, gen_exercises_db.py, export-logs.py
│   ├── fetch_gym80_images.py, fetch_precor_images.py
│   ├── *.sql               # SQL для вставки оборудования в Supabase
│   └── *.json              # Сырые данные упражнений
├── admin.html              # Админ-панель (отдельная страница, ~53KB)
└── catalog.html            # Каталог оборудования (отдельная страница, ~27KB)
```

### Порядок загрузки скриптов (критичен!)

Скрипты загружаются синхронно через `<script>` теги. Каждый следующий зависит от предыдущих. Нет ES-модулей (`import/export`). Изменение порядка ломает приложение.

```
 1. supabase CDN      → window.supabase
 2. utils.js          → exName(), resolveWorkout(), getCompletedSets(), parseLocalDate()
 3. data.js           → SET_TYPES, TECHNIQUE_TYPES, DEFAULT_PROGRAM, PROGRAM (let)
 4. mikhail_data.js   → MIKHAIL_PROGRAM
 5. mikhail2_data.js  → MIKHAIL2_PROGRAM
 6. users.js          → BUILTIN_PROGRAMS, ACCOUNTS
 7. exercises_db.js   → EXERCISE_CATEGORIES, EXERCISE_DB
 8. supabase-sync.js  → supa (Supabase client), SupaSync  [зависит от: window.supabase]
 9. storage.js        → Storage  [зависит от: PROGRAM, EXERCISE_DB, SupaSync]
10. social.js         → Social   [зависит от: supa, Storage]
11. ui.js             → UI       [зависит от: Storage, PROGRAM, utils]
12. cropper.js        → AvatarCropper
13. social-ui.js      → SocialUI [зависит от: Social, UI]
14. builder.js        → Builder  [зависит от: Storage, EXERCISE_DB, Social]
15. timer.js          → RestTimer [зависит от: Storage]
16. app.js            → App      [зависит от: ВСЁ выше]
```

---

## Глобальные переменные

| Переменная | Где определена | Тип | Описание |
|---|---|---|---|
| `PROGRAM` | `data.js` (let), загружается в `app.js` | Mutable | Текущая программа тренировок |
| `DEFAULT_PROGRAM` | `data.js` | Const | Программа Анастасии |
| `MIKHAIL_PROGRAM` | `mikhail_data.js` | Const | Программа Дмитрия |
| `MIKHAIL2_PROGRAM` | `mikhail2_data.js` | Const | Программа Михаила |
| `SET_TYPES` | `data.js` | Const | Типы подходов (S, SH, H) |
| `TECHNIQUE_TYPES` | `data.js` | Const | Техники (DROP, REST_PAUSE, MP) |
| `EXERCISE_DB` | `exercises_db.js` | Const | 429 упражнений |
| `ACCOUNTS` | `users.js` | Const | Захардкоженные аккаунты (легаси) |
| `BUILTIN_PROGRAMS` | `users.js` | Const | Реестр встроенных программ |
| `supa` | `supabase-sync.js` | Const | Supabase client |
| `Storage._data` | `storage.js` | Mutable cache | In-memory кэш данных пользователя |
| `App._currentWeek` | `app.js` | Mutable | Текущая выбранная неделя |
| `App._currentDay` | `app.js` | Mutable | Текущий выбранный день |
| `Storage._gymCache` | `storage.js` | Mutable | Список залов из Supabase |

---

## Карта компонентов (модулей)

### Дерево рендеринга (кто кого вызывает)

```
App.init()
 ├── App.route() ─────────────────── центральный роутер
 │   ├── UI.renderLogin()            # экран логина
 │   ├── UI.renderSetup()            # настройка программы (старт дата, цикл)
 │   ├── UI.renderWeek(weekNum)      # карточки дней недели
 │   │   └── UI._weekCardsHTML()     # генерация карточек (swipe companion)
 │   │   └── UI._weekViewHTML()      # полный HTML недели (swipe companion)
 │   ├── UI.renderDay(week, day)     # экран тренировки (упражнения, подходы)
 │   │   ├── UI._dayViewHTML()       # полный HTML дня (swipe companion)
 │   │   ├── UI._renderExercise()    # одно упражнение с подходами
 │   │   ├── UI._renderSetRow()      # строка подхода (вес/повторы/чекбокс)
 │   │   ├── UI._renderSuperset()    # суперсет (группа упражнений)
 │   │   └── UI._renderChooseOne()   # выбор упражнения из вариантов
 │   ├── UI.renderHistory(exId)      # история упражнения (графики)
 │   ├── UI.renderMenu()             # главное меню
 │   │   └── UI._menuHTML()          # HTML меню (swipe companion)
 │   ├── UI.renderSettings()         # настройки
 │   ├── UI.renderGuide()            # гайд по типам подходов
 │   ├── UI.renderCalculator()       # калькулятор весов
 │   ├── Builder.renderRegister()    # регистрация нового пользователя
 │   ├── Builder.renderMigration()   # миграция хардкод → Supabase
 │   ├── Builder.renderWizardStep1() # создание программы: шаг 1
 │   ├── Builder.renderWizardStep2() # создание программы: шаг 2
 │   ├── Builder.renderDayEditor()   # редактор дня (drag&drop упражнений)
 │   ├── Builder.renderOnboarding*() # онбординг (пол, роль, цели)
 │   ├── SocialUI.renderFeed()       # лента чекинов подписок
 │   ├── SocialUI.renderProfile()    # профиль пользователя
 │   ├── SocialUI.renderProfileEdit()# редактирование профиля
 │   ├── SocialUI.renderCheckinForm()# форма нового чекина
 │   ├── SocialUI.renderCheckinDetail() # детальный чекин
 │   ├── SocialUI.renderDiscover()   # поиск пользователей
 │   ├── SocialUI.renderNotifications() # уведомления
 │   ├── SocialUI.renderMessages()   # список бесед
 │   ├── SocialUI.renderConversation() # переписка
 │   └── SocialUI.renderFollowList() # подписчики/подписки
 │
 ├── App.handleClick(e) ──────────── ВСЕ клики (event delegation на #app)
 │   (2000+ строк if/else цепочка)
 │
 ├── App.handleInput(e) ──────────── ввод в поля (вес, повторы, поиск)
 ├── App.handleFocus(e) ──────────── фокус на инпутах
 │
 ├── RestTimer ────────────────────── таймер отдыха
 │   ├── .init()                     # создание DOM-элемента бара
 │   ├── .start(row)                 # запуск после выполнения подхода
 │   └── .stop()                     # остановка
 │
 └── Celebration ──────────────────── анимация завершения тренировки
     └── .show(elapsed, week, day)   # конфетти + статистика
```

### Модалки (рендерятся поверх текущего экрана)

```
UI.showEquipmentModal()        # выбор оборудования для упражнения
UI.showGymModal()              # выбор зала
UI.showChoiceModal()           # выбор варианта упражнения (choose_one)
UI.showSubstitutionModal()     # замена упражнения
Builder.showExercisePicker()   # каталог упражнений (429 шт)
Builder.showExerciseConfig()   # настройка упражнения (подходы, повторы)
AvatarCropper.open()           # кроп фото для аватарки
```

---

## Поток данных

### Полная схема `Storage._data` (wt_data_{userId})

```javascript
Storage._data = {
  settings: {
    cycleType: 7,              // дней в цикле (7 = неделя)
    startDate: "2025-01-06",   // дата старта программы
    weightUnit: "kg",          // "kg" | "lb"
    timerDuration: 120,        // секунды отдыха по умолчанию
    exerciseLang: "ru"         // "ru" | "en"
  },
  program: { ... } | null,     // кастомная программа (null → используется BUILTIN)
  log: {                        // === ОСНОВНОЙ ЛОГ ТРЕНИРОВОК ===
    "1": {                     // week (string)
      "1": {                   // day (string)
        "_gym": "uuid-...",    // metadata: ID зала
        "D1E2": {              // exerciseId
          "0": {               // setIdx (string)
            weight: 40,
            reps: 12,
            completed: true,
            timestamp: 1710000000000,
            unit: "kg",
            equipmentId: "eq_123",
            segs: {            // drop-set / rest-pause сегменты
              "1": { weight: 30, reps: 8 },
              "2": { weight: 20, reps: 6 }
            }
          }
        }
      }
    }
  },
  exerciseChoices: {            // выбор в choose_one группах
    "D1_deadlift": "D1E1_opt3"
  },
  exerciseEquipment: {          // текущая привязка упражнение → тренажёр
    "D1E2": "eq_123"           // null = явно удалено (tombstone для sync)
  },
  exerciseEquipmentOptions: {   // все когда-либо привязанные тренажёры
    "D1E2": ["eq_123", "eq_456"]
  },
  exerciseUnits: {              // единицы веса per-exercise
    "D3E5": "lb"
  },
  exerciseSubstitutions: {      // замена названия упражнения
    "D1E4": "Выпады с гантелями"
  },
  equipment: [                  // список тренажёров пользователя
    { id: "eq_123", name: "Cybex Eagle NX", type: "machine", imageUrl: "..." }
  ],
  myGymIds: ["uuid-1"],        // ID избранных залов (Supabase shared_gyms)
  gymLastUsed: { "uuid-1": 1710000000 },
  gymEquipmentMap: {            // привязка тренажёров per-gym
    "uuid-1": { "D1E2": "eq_123" }
  },
  weekSlots: [                  // порядок дней в неделе (кастомный)
    { type: "day", dayNum: 1 },
    { type: "rest" },
    { type: "day", dayNum: 2 },
    ...
  ]
}
```

### localStorage ключи

```
wt_users           → [{id, name, programId, login?, password?}]
wt_current         → "supa_abc123" (ID текущего пользователя)
wt_data_{userId}   → Storage._data (JSON-блоб выше)
wt_supa_{localId}  → Supabase UUID (связь локальный ID ↔ Supabase auth)
wt_email_{supaId}  → email (для логина по username)
_wt_eq_snapshot    → снимок equipment для rollback если нет completed sets
```

### Путь записи данных

```
User tap "✓" (complete set)
  → App.handleClick()
    → парсит data-exercise, data-set из DOM
    → Storage.saveSetLog(week, day, exId, setIdx, weight, reps, eqId)
      → Storage._data.log[w][d][exId][setIdx] = { weight, reps, completed, timestamp, ... }
      → Storage._save()
        → localStorage.setItem('wt_data_{userId}', JSON.stringify(_data))
        → SupaSync.onLocalSave()
          → SupaSync.schedulePush()  [debounced 3 секунды]
            → supa.from('user_data').upsert(data)
```

### Путь чтения данных

```
App.route() → hash=#/week/3/day/1
  → UI.renderDay(3, 1)
    → resolveWorkout(3, 1)
      → deepClone(PROGRAM.dayTemplates[1])
      → merge PROGRAM.weeklyOverrides[3][1]
    → for each exercise:
      → Storage.getSetLog(3, 1, exId, setIdx)
        → Storage._load() → возвращает кешированный _data
      → UI._renderSetRow() → HTML строкой
    → document.getElementById('app').innerHTML = html
```

### Авторизация: два пути

```
A) Legacy (hardcoded ACCOUNTS):
   ACCOUNTS[] → Storage.loginSelfRegistered() → localStorage('wt_current')

B) Supabase Auth (новые пользователи):
   SupaSync.signIn(email, password)
     → supa.auth.signInWithPassword()
     → localStorage('wt_supa_' + localId) = supaUserId
     → SupaSync.syncOnLogin() → deep merge logs
     → Social._getSupaUserId() для всех social-запросов
```

### Cloud Sync Flow

```
Login / Pull-to-refresh:
  SupaSync.syncOnLogin(supaUserId, storageKey)
    → pullData()           ← Supabase user_data table
    → _deepMergeLogs(local.log, remote.log)
        per-set: latest timestamp wins
    → merge exerciseChoices   (keep both sides)
    → merge exerciseEquipment (respect null tombstones)
    → pushData()           → Supabase

Continuous (после каждого Storage._save):
  → SupaSync.onLocalSave()
  → schedulePush()  [debounced 3s]
  → pushData() → Supabase
```

---

## Ключевые сущности (структуры данных)

### Program (программа тренировок)

```javascript
PROGRAM = {
  version: 2,
  title: "12-Week Training Program",
  coach: "Francisco Espin",
  athlete: "Anastasiia Dobrosol",
  totalWeeks: 12,
  dayTemplates: {
    1: { title: "Hamstrings & Gluteus", titleRu: "...", exerciseGroups: [...] },
  },
  weeklyOverrides: {
    3: { 1: { "D1E2": { sets: { 0: { rpe: "10", techniques: ["DROP"] } } } } }
  }
}
```

### ExerciseGroup (4 типа)

```javascript
{ type: "single",     sectionTitle: "GLUTEUS", exercise: { id, name, nameRu, reps, rest, sets } }
{ type: "superset",   exercises: [{ id, name, nameRu, reps, rest, sets }, ...] }
{ type: "choose_one", choiceKey: "D1_deadlift", options: [{ id, name, nameRu, reps, rest, sets }, ...] }
{ type: "warmup",     exercise: { id, name, nameRu, reps, rest, sets } }
```

### Exercise (упражнение)

```javascript
{
  id: "D1E2",
  name: "Seated Leg Curl (Machine)",
  nameRu: "Сгибание ног сидя (в тренажёре)",
  reps: "12-15",
  rest: 120,
  sets: [
    { type: "SH", rpe: "9-10", techniques: [] },
    { type: "H",  rpe: "9-10", techniques: ["DROP"] },
    { type: "H",  rpe: "9-10", techniques: ["REST_PAUSE"] }
  ]
}
```

### Set Log (запись подхода)

```javascript
// Storage._data.log[week][day][exerciseId][setIdx]
{
  weight: 45,
  reps: 12,
  completed: true,
  timestamp: 1710000000000,    // для merge при синхронизации
  unit: "kg",                  // или "lb"
  equipmentId: "eq_17735905", // привязка к конкретному тренажёру
  segs: {                      // сегменты для дроп-сетов / rest-pause
    "1": { weight: 35, reps: 8 },
    "2": { weight: 25, reps: 6 }
  }
}
```

### Equipment (оборудование)

```javascript
{ id: "eq_1773590540310", name: "Cybex Eagle NX Seated Leg Curl", type: "other", imageUrl: "..." }
// Привязки: exerciseEquipment[exId] = eqId, gymEquipmentMap[gymId][exId] = eqId
```

---

## Роутинг

### Основные экраны

| Hash | Рендер | Описание |
|------|--------|----------|
| `#/setup` | `UI.renderSetup()` | Настройка программы |
| `#/week/{n}` | `UI.renderWeek(n)` | Обзор недели |
| `#/week/{n}/day/{n}` | `UI.renderDay(w,d)` | Экран тренировки |
| `#/history/{exId}` | `UI.renderHistory(exId)` | История упражнения |
| `#/menu` | `UI.renderMenu()` | Главное меню |
| `#/settings` | `UI.renderSettings()` | Настройки |
| `#/guide` | `UI.renderGuide()` | Гайд по подходам |
| `#/calculator` | `UI.renderCalculator()` | Калькулятор весов |

### Авторизация: `#/login`, `#/register`, `#/migrate`, `#/onboarding/{1-5}`
### Построитель: `#/builder/step1`, `#/builder/step2`, `#/edit/day/{n}`
### Соцсеть: `#/feed`, `#/profile`, `#/profile/edit`, `#/checkin`, `#/checkin/{id}`, `#/discover`, `#/notifications`, `#/messages`, `#/messages/{id}`, `#/u/{username}`, `#/followers/{id}`, `#/following/{id}`

### Навигация и свайпы

```
Авторизация и онбординг:
  login → register (или) → login
  login → onboarding/1 (пол) → 2 (роль) → 3 (casual: цель)
                                          → 3a (athlete: про/любитель) → 4 (категория) → 5 (фаза)
                                          → 3t (trainer: кол-во клиентов)
                                          → profile complete

Основной flow:
  setup → builder/step1 → step2 → setup (дата старта)
  week/{n} → day (tap card) → Celebration (100% complete) → week
  week/{n} → menu → settings / guide / calculator
  week ↔ feed ↔ profile (tab bar)
```

Свайпы конфигурируются в `App._getSwipeConfig()`:
- **Влево/вправо** на Week — carousel недель
- **Вправо** на Day — back-swipe (companion = `UI._weekViewHTML()`)
- **Влево/вправо** между Feed ↔ Profile (tab carousel)
- **Вниз** — pull-to-refresh

---

## Внешние зависимости

**Единственная библиотека**: Supabase JS v2 (CDN). Нет npm, бандлера, транспиляции.

### Supabase — таблицы и хранилища

| Таблица | Используется в | Что хранит |
|---------|---------------|------------|
| `user_data` | `SupaSync` | JSONB-блоб всех данных пользователя (зеркало localStorage) |
| `profiles` | `Social` | username, display_name, avatar_url, gender, bio, is_athlete, category, phase |
| `checkins` | `Social` | Посты: текст, фото (массив URL), workout_summary, muscle_groups |
| `photo_tags` | `Social` | Теги пользователей на фото чекинов |
| `follows` | `Social` | follower_id → following_id |
| `reactions` | `Social` | Лайки/реакции на чекины (user_id, checkin_id, type) |
| `comments` | `Social` | Комментарии к чекинам (user_id, checkin_id, text) |
| `comment_likes` | `Social` | Лайки на комментарии |
| `conversations` | `Social` | DM-диалоги (participant_ids, last_message_at) |
| `messages` | `Social` | Сообщения в диалогах (conversation_id, sender_id, text, read) |
| `notifications` | `Social` | type (follow/like/comment), actor_id, target_id, checkin_id |
| `shared_gyms` | `Social` | Общая база залов (name, city) — crowdsourced |
| `shared_equipment` | `Social` | Общая база оборудования (name, muscle_group) |
| `shared_exercises` | `Social` | Общая база упражнений |
| `gym_equipment` | `Social` | Привязка оборудование ↔ зал ↔ упражнение (crowdsourced) |
| `equipment_catalog` | `Social` | Каталог брендового оборудования (Cybex, Precor, gym80 и т.д.) |

| Storage bucket | Что хранит |
|---------------|------------|
| `avatars` | Аватарки пользователей (`{userId}/avatar.jpg`) |
| `checkin-photos` | Фото чекинов |
| `equipment-images` | Изображения оборудования + миниатюры упражнений (`exercise-thumbs/`) |

| Realtime | Что слушает |
|----------|-------------|
| `messages` | Новые DM-сообщения (подписка в `Social.subscribeMessages()`) |
