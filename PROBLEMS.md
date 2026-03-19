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

### 2. `App.handleClick()` — ✅ решено

**Где:** `js/app.js`

**Что изменилось:** app.js уменьшился с 2515 до ~1200 строк. 40+ social handlers (489 строк) вынесены в `SocialUI.handleClick()`. 29 builder/onboarding/setup handlers (248 строк) вынесены в `Builder.handleClick()`. Workout + modal handlers (~570 строк) вынесены в `WorkoutUI.handleClick()` / `WorkoutUI.handleModalClick()` (`js/workout-ui.js`). Также вынесены `handleInput` и `handleFocus`.

**Что осталось внутри:** login, registration, navigation, settings — лёгкий координатор.

---

### 3. UI = data logic + rendering в одном — ✅ решено

**Где:** `js/ui.js`, `js/social-ui.js`

**Что изменилось:** Все render-методы в обоих файлах следуют паттерну `_buildXxxVM()` → `_renderXxx(vm)`:

**ui.js** (было ранее):
- `_buildDayVM()` → `renderDay()`
- `_buildSetRowVM()` → `_renderSetRow()`
- `_buildWeekVM()` → `_weekCardsHTML()`
- `_buildExerciseVM()` → `_renderExercise()`
- `_buildChooseOneVM()` → `_renderChooseOne()`
- `_buildHistoryVM()` → `renderHistory()`

**social-ui.js** (NEW):
- `_buildProfileVM()` → `_renderProfile()` — вынесены _loadProfileData(), isOwn/targetId логика
- `_buildProfileEditVM()` → `_renderProfileEdit()` — вынесены Social.getMyProfile(), category/phase filtering
- `_buildFeedVM()` → `_renderFeed()` — вынесены _loadFeedData(), cursor, followingIds
- `_buildCheckinDetailVM()` → `_renderCheckinDetail()` — вынесены _loadCheckinData(), threading комментариев. `renderComment` → `_renderCheckinComment()`
- `_buildDiscoverVM()` → `_renderDiscover()` — вынесены getRecentUsers(), getMyFollowingIds()
- `_buildFollowListVM()` → `_renderFollowList()` — вынесены getFollowers/getFollowing()
- `_buildNotificationsVM()` → `_renderNotifications()` — вынесены getNotifications(), type→text mapping
- `_buildMessagesVM()` → `_renderMessages()` — вынесены getConversations(), getUnreadMessageCount()
- `_buildConversationVM()` → `_renderConversation()` — вынесены resolve convId, load messages/profile

---

### 4. Полный re-render через innerHTML — 🟡 частично решено

**Проблема:** Каждый `renderDay()` уничтожает весь DOM. Потеря фокуса, scroll, мерцание.

**Что уже есть:** Точечное обновление при complete-btn (иконка + класс без re-render). `markCachedThumbs()`. Scroll restore. `RestTimer.reattach()` после DOM-свапа.

**Решено:** Equipment selection → `_updateEquipmentBadge()` (точечное обновление кнопки). Workout timer pause/resume/cancel → `_updateTimerSection()` (замена только секции таймера). Убраны лишние `UI.renderDay()` в fallback-ветках equipment modal.

**Что осталось:** Add/remove set, substitution, btn-start-workout (применяет gym equipment ко всем упражнениям) — полный re-render.

---

### 5. Дублирование `target.closest()` — ✅ решено

**Где:** `js/workout-ui.js`, `js/builder.js`, `js/social-ui.js`, `js/app.js`

**Что изменилось:** Убраны все двойные вызовы `.closest()` (сначала в `if`, потом присваивание внутри). ~25 мест рефакторены на паттерн `const el = target.closest(sel); if (el) {...}` с block scoping.

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
| 2 | ~~handleClick 1530 строк~~ → ~200 строк (social + builder + workout вынесены) | — | ✅ Решено |
| 3 | ~~UI = data + render~~ → VM-паттерн в ui.js + social-ui.js (15 VM builders) | — | ✅ Решено |
| 4 | innerHTML re-render — equipment + timer решены, остались add/remove set, substitution | Средняя | 🟡 P2 |
| 5 | ~~Дублирование closest-паттерна~~ | — | ✅ Решено |
| 6 | Хрупкая _migrateExerciseNames | Средняя | 🟢 P2 |
| 7 | Хардкод аккаунтов | Низкая | 🟢 P2 |
| 8 | Нет JSDoc типизации | Средняя | 🟢 P3 |
| 9 | Программы грузятся всегда | Средняя | 🟢 P3 |

---

## Рекомендуемый порядок

**~~Шаг 1~~ ✅ — Циклические импорты (#1) — решено.**

**Шаг 2 — Разбить handleClick (#2):** (в процессе)

~~Шаг 2a~~ ✅ — Social handlers → `SocialUI.handleClick()` (40+ handlers, 489 строк). `_replyToCommentId` перемещён в SocialUI.

~~Шаг 2b~~ ✅ — Builder/onboarding/setup handlers → `Builder.handleClick()` (29 handlers, 248 строк). 9 callbacks injected в App.init().

~~Шаг 2c~~ ✅ — Workout + modal handlers → `WorkoutUI.handleClick()` / `WorkoutUI.handleModalClick()` в `js/workout-ui.js` (~570 строк). handleInput/handleFocus также делегированы.

~~Шаг 3~~ ✅ — Отделить data от render (#3) в `ui.js` + `social-ui.js`:

**ui.js:** 6 VM builders — `_buildDayVM()`, `_buildSetRowVM()`, `_buildWeekVM()`, `_buildExerciseVM()`, `_buildChooseOneVM()`, `_buildHistoryVM()`.

**social-ui.js:** 9 VM builders — `_buildProfileVM()`, `_buildProfileEditVM()`, `_buildFeedVM()`, `_buildCheckinDetailVM()`, `_buildDiscoverVM()`, `_buildFollowListVM()`, `_buildNotificationsVM()`, `_buildMessagesVM()`, `_buildConversationVM()`. Inline `renderComment` вынесен в `_renderCheckinComment()`.
