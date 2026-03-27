# CLAUDE.md — Инструкции для Claude (post-refactor)

## О проекте

PWA для бодибилдинг-атлетов: программы тренировок, логгирование подходов, таймер, привязка оборудования, социальная лента. Vanilla JS с ES modules, localStorage + Supabase, zero-dependency frontend.

## Запуск

```bash
npx serve .          # или любой статический сервер
python3 -m http.server 8000
```

Нужен сервер (не `file://`) — ES modules требуют HTTP.

## Supabase — прямой доступ

Credentials хранятся в `tools/fetch_gym80_images.py`. Claude может и должен выполнять SQL/API операции напрямую:

```bash
# SQL запросы (INSERT, UPDATE, SELECT):
curl -s -X POST "https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query" \
  -H "Authorization: Bearer {MGMT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "SQL тут"}'

# Upload файлов в Storage:
curl -X POST "https://{REF}.supabase.co/storage/v1/object/equipment-images/{path}" \
  -H "Authorization: Bearer {SERVICE_KEY}" \
  -H "Content-Type: image/png" \
  -H "x-upsert: true" \
  --data-binary @file.png
```

**Не проси пользователя запускать SQL вручную** — делай сам через API.

---

## Структура проекта (после рефакторинга)

```
index.html              — SPA: Supabase CDN + <script type="module" src="main.js">
js/main.js              — Entry: import App → App.init()
js/app.js               — (1196) Роутинг, init, auth, settings, navigation
js/ui.js                — (2107) Рендер тренировок: week, day, history, settings
js/builder.js           — (1911) Визард, редактор дня, picker, онбординг
js/social-ui.js         — (1906) Рендер соцсети: feed, profile, checkin, messages
js/social.js            — (900) Supabase API для всех social-таблиц
js/storage.js           — (1000) localStorage CRUD, sibling cache
js/app-state.js         — (8) Shared readable state (currentWeek, currentDay, pageCache)
js/program-utils.js     — (191) Storage-зависимые: resolveWorkout, exName, getTotalWeeks...
js/utils.js             — (251) Чистые утилиты: esc(), даты, миниатюры, getGroupExercises
js/data-attrs.js        — (121) Реестр data-атрибутов (WORKOUT, BUILDER, EQ, SOCIAL, SETTINGS, ONBOARDING)
js/workout-ui.js        — (684) Workout + modal click/input/focus handlers (вынесено из app.js)
js/inline-editor.js     — Day view: swipe-delete, reorder mode (long-press→drag), exercise menu (три точки)
js/equipment-manager.js — (445) Оборудование + залы (вынесено из app.js)
js/swipe-nav.js         — (310) Свайп-навигация (вынесено из app.js)
js/migrations.js        — (300) One-time data fixes (вынесено из app.js init)
js/timer.js             — (543) Таймер отдыха
js/supabase-sync.js     — (238) Auth + cloud sync
js/celebration.js       — (203) Конфетти при завершении
js/pull-refresh.js      — (166) Pull-to-refresh
js/workout-timer.js     — (114) Elapsed time тренировки
js/profile-manager.js   — (100) Сохранение профиля
js/message-notifications.js — (83) DM realtime
js/scroll-lock.js       — (40) Блокировка скролла для модалок
js/data.js              — (2604) DEFAULT_PROGRAM
js/mikhail_data.js      — (9064) MIKHAIL_PROGRAM
js/mikhail2_data.js     — (7846) MIKHAIL2_PROGRAM
js/users.js             — (34) ACCOUNTS + BUILTIN_PROGRAMS (легаси)
js/exercises_db.js      — (463) 438 упражнений + 8 категорий
js/cropper.js           — (314) Canvas-кроппер аватарок
css/styles.css          — Entry: @import 13 файлов (variables, base, day-view, social...)
sw.js                   — Service Worker (версия в CACHE_NAME внутри файла)
manifest.json           — PWA manifest
admin.html              — Админ-панель (не runtime)
catalog.html            — Каталог оборудования (не runtime)
v2.html                 — Экспериментальный интерфейс (не runtime)
icons/                  — PWA-иконки (192, 512)
tools/                  — Утилиты разработки: SQL, скрипты импорта, парсеры (не runtime)
```

---

## Критические правила

### 1. Файлы, которые нельзя менять без крайней необходимости

| Файл | Причина |
|------|---------|
| `js/data.js`, `mikhail_data.js`, `mikhail2_data.js` | Программы с реальными данными. Изменение ID ломает ВСЕ сохранённые логи |
| `js/storage.js` (структура `_defaultData()`) | Схема данных. Переименование полей ломает sync |
| `js/data-attrs.js` | Контракт между рендерами и обработчиками. Переименование ломает и UI и handlers |
| `js/exercises_db.js` | Справочник, от которого зависят миниатюры и миграции имён |
| `sw.js` (CACHE_NAME + ASSETS) | CACHE_NAME бампится автоматически pre-commit хуком. Но новые файлы → добавить в ASSETS вручную |
| `index.html` | Минимальный, но порядок `<script>` (Supabase CDN до main.js) критичен |

### 2. Связанные компоненты (если меняешь A → проверь B)

| Изменение | Проверить |
|---|---|
| `Storage.saveSetLog()` / формат лога | `WorkoutUI.handleClick` (complete-btn), `UI._renderSetRow()`, `SupaSync._deepMergeLogs()` |
| `Storage._data` структура | `SupaSync.syncOnLogin()` (merge), `Storage._load()` (миграция) |
| `data-attrs.js` (имя атрибута) | Рендер (ui.js/social-ui.js/builder.js) + обработчик (workout-ui.js/app.js/equipment-manager.js) |
| `UI.renderDay()` / `_renderSetRow()` | `WorkoutUI.handleClick()` — data-attrs должны совпадать с `read()`/`readInt()`. `WorkoutUI._addSet()` вызывает `UI._buildSetRowVM()` + `UI._renderSetRow()` для точечной вставки |
| `Social.*` API | `SocialUI.*`, `WorkoutUI.handleModalClick` (gym/equipment handlers) |
| `SocialUI._tabBarHTML()` | Все экраны с tab bar |
| `RestTimer.start()` | DOM-структура `.set-row` в `UI.renderDay()` |
| Новый маршрут в `App.route()` | `SwipeNav._getSwipeConfig()` |
| `UI.renderWeek()` | `UI._weekCardsHTML()`, `_weekViewHTML()` — swipe companions |
| `Builder._editingDay` | `Builder.renderDayEditor()`, `Builder._autoSave()` |
| `Builder._snapshotIfChanged()` / `templateSnapshots` | `resolveWorkout()` (program-utils.js), `SupaSync.syncOnLogin()` (merge snapshots), `migrations.js` (_frozenGroups → snapshots), `Builder._buildDayEditorVM()` (должен читать из снэпшота, не из dayTemplates напрямую) |
| `EquipmentManager.*` | `UI.showEquipmentModal()`, `WorkoutUI.handleModalClick` (eq handlers) |
| `Storage.removeExerciseEquipment()` | `gymEquipmentMap` (должен записывать null tombstone в map, иначе `applyGymEquipment` воскресит привязку) |
| `Storage.saveProgram()` | Ставит `_programModified = Date.now()`. Используется sync merge для независимого сравнения program timestamps |
| `SupaSync.syncOnLogin()` merge | `_programModified` (программа), `_lastModified` = `Math.max(local, remote)` (не Date.now()!), tombstone `null` vs `undefined` в exerciseEquipment |
| `Storage._load()` callbacks | `_migrateFn` → `Migrations.migrateExerciseNames`, `_unbindFn` → `Migrations._unbindStaleSnapshots`. Оба wired в `App.init()` ДО первого `_load()` |
| `exercises_db.js` (переименование `nameRu`) | Автоматически: `migrateExerciseNames` сверяет по English name → обновляет `nameRu` в программе, снэпшотах, substitutions |
| `exerciseSubstitutions` (variation picker) | `UI._buildExerciseVM()` резолвит English имя через EXERCISE_DB. data-attrs `EX_NAME`/`EX_NAME_RU` должны содержать resolved имена, не оригинальные из снэпшота |
| `UI.renderDay()` (PTR async path) | `UI._onPTRSwap` callback → `InlineEditor.attachHandlers()`. Без этого обработчики не подключатся после pull-to-refresh |
| `InlineEditor.attachHandlers()` | Вызывается в `route()` (синхронно) + `UI._onPTRSwap` (после async swap). Обе точки нужны |
| `InlineEditor._initDragReorder()` (reorder mode) | `SwipeNav` touchstart (блок `_reorderMode`), `PullRefresh` (блок `_slotDragging`), `App._handleNavigationClick` (#btn-back перехват) |

### 3. Где хранится стейт

**Storage (единственный источник):**
```javascript
// ✅ Правильно:
Storage.saveSetLog(week, day, exId, setIdx, weight, reps, eqId);
const program = Storage.getProgram();  // больше нет глобального PROGRAM

// ❌ Неправильно:
localStorage.setItem('wt_data_xxx', ...);  // обходит кеш и sync
```

**Правила:**
1. Всё через методы `Storage.*`. Прямой доступ к `_data` — только внутри storage.js
2. `Storage._save()` автоматически → `Storage._onSave()` → `SupaSync.onLocalSave()` → cloud push (3 сек)
3. `Storage._invalidateCache()` нужен только при смене пользователя
4. `Storage._siblingCache` — построен один раз, инвалидируется при смене программы

**Исключение:** миграционные флаги (`wt_migrated_*`, `wt_supa_*`, `wt_email_*`, `_wt_notif_asked`, `wt_onboarding_done_*`) используют `localStorage` напрямую в app.js и builder.js — это одноразовые ключи вне основного хранилища данных, не трогать.

**Программа:**
1. Больше нет глобального `let PROGRAM`. Везде `Storage.getProgram()` или передаётся аргументом
2. `resolveWorkout(week, day)` возвращает deep clone — безопасно мутировать
3. Exercise ID: `D{day}E{num}` или `D{d}E{n}_opt{n}`
4. **Изменение exercise ID ломает ВСЕ логи** — `log[week][day][exerciseId]`

**Рендеринг:**
1. Весь рендеринг через `innerHTML` (полная замена DOM). Нет diffing
2. После `renderDay()` переинициализировать: timer insert point, scroll, `markCachedThumbs()`
3. `App.invalidatePageCache()` вызывать при мутациях данных (уже сделано в ключевых местах)
4. Pull-to-refresh → `App.route(true)` → полный re-render
5. Inline `onclick` **НЕ используется** — всё через delegation в `App.handleClick()`

**Data-атрибуты (`data-attrs.js`):**
```javascript
import { WORKOUT, attr, read, readInt } from './data-attrs.js';

// В рендере (ui.js):
html += `<button ${attr(WORKOUT.EXERCISE, ex.id)} ${attr(WORKOUT.SET, i)}>`;

// В обработчике (app.js):
const exId = read(btn, WORKOUT.EXERCISE);
const setIdx = readInt(btn, WORKOUT.SET);
```
Не используй magic strings (`'data-exercise'`). Всё через реестр.

### 4. Межмодульное связывание — callback injection

**0 циклических импортов.** Все 11 циклов устранены. Граф импортов — строго ациклический (DAG).

**Паттерн — callback injection в `App.init()`:**
Модули объявляют `_onXxx: null` поля. `App.init()` подставляет реализации. Аналог: `PullRefresh.init(onRefresh)`.

```javascript
// В модуле (например, celebration.js):
export const Celebration = {
    _onShareCheckin: null,  // wired in App.init()
    _showShareBtn() {
        if (this._onShareCheckin) this._onShareCheckin(this._pendingShare);
    }
};

// В App.init():
Celebration._onShareCheckin = (data) => { this._pendingCheckinWorkout = data; };
```

**Три техники:**
1. **Callback injection** — модуль вызывает `this._onXxx()` вместо прямого импорта (7 циклов)
2. **Shared state** — `AppState` (app-state.js) — читаемое состояние (currentWeek, currentDay, pageCache, saveDebounced). App.js пишет, остальные читают (2 цикла)
3. **Function extraction** — `program-utils.js` содержит Storage-зависимые функции, вынесенные из utils.js. utils.js — чистые утилиты без app-импортов (1 цикл)
4. **Parameter injection** — `Storage.migrateLocalGyms(Social)` получает модуль аргументом (1 цикл)

**Правила для новых модулей:**
- Не импортируй app.js из других модулей — используй callback
- Не импортируй Storage в utils.js — функции с Storage идут в program-utils.js
- `AppState.*` — только для чтения из модулей (запись только в app.js)

### 5. Соглашения

**JavaScript:**
- Модули: `export const PascalCase = { ... }`. Нет `class`, `new`, прототипов
- Приватные: `_underscore` prefix
- Event handling: delegation через `App.handleClick()`, ID-based: `target.id === 'xxx'` или `target.closest('#xxx')`
- Экранирование: `esc()` из utils.js для пользовательских строк в innerHTML
- В `storage.js` используется `var` / `function(){}` (историческая причина)

**CSS:**
- CSS variables в `variables.css`
- kebab-case: `.day-card`, `.set-row`
- Файлы по модулям: `day-view.css`, `social.css`, `timer.css`

**Версионирование:**
- `css/styles.css?v=NNN` в index.html — инкрементировать при изменении CSS/JS
- `CACHE_NAME` в sw.js — **автоматически** бампится pre-commit хуком при изменении .js/.css файлов
- Новые файлы → добавить в `ASSETS` массив sw.js

**Автоматическая миграция имён упражнений:**
- При переименовании `nameRu` в `exercises_db.js` — программа автоматически обновляется при загрузке
- Механизм: `migrateExerciseNames()` сверяет English name (стабильный) → если `nameRu` отличается от DB → обновляет
- **НЕ нужно** добавлять в `_NAME_MAP` вручную, если English name не менялся
- `_NAME_MAP` нужен только когда меняется **English name** (редко)

### 6. После каждого изменения

**Чеклист:**
1. Если менял `.js`/`.css` — `CACHE_NAME` бампится автоматически pre-commit хуком. Инкрементируй `?v=` в index.html при изменении CSS
2. Если добавил файл — добавь в `ASSETS` в sw.js
3. Если менял структуру данных — миграция в `Storage._load()` или `migrations.js`
4. Если добавил маршрут — `SwipeNav._getSwipeConfig()`
5. Если менял data-attrs — проверь и рендер и обработчик
6. Вызови `App.invalidatePageCache()` если мутация данных влияет на кешированные страницы
7. **Документация** — пробегись по `CLAUDE.md`, `ARCHITECTURE.md`, `PROBLEMS.md`:
   - Изменился контракт между модулями (новый callback, новый data-attr, изменение API модуля) → обнови CLAUDE.md секцию "Связанные компоненты"
   - Добавил/удалил/переименовал файл → обнови структуру в ARCHITECTURE.md
   - Изменил граф импортов (новый import, новая зависимость) → обнови граф в ARCHITECTURE.md
   - Решил проблему из PROBLEMS.md → отметь ✅
   - Нашёл новую архитектурную проблему → добавь в PROBLEMS.md
   - **НЕ обновляй:** line counts, номера версий кеша — они читаются из кода напрямую
8. **Git** — после завершения изменений:
   - `git add -A && git commit -m "краткое описание изменений"`
   - `git push origin main`
   - Проект деплоится через GitHub Pages — без push изменения не видны для тестирования

**Формат описания:**
```
Changed: js/ui.js (_renderSetRow, lines 800-850)
What: Added equipment image to set row
Related: app.js handleClick (complete-btn), data-attrs.js WORKOUT
Data: No storage changes
```

---

## Типичные ошибки

1. **Подход не сохраняется**: Проверь `read(btn, WORKOUT.EXERCISE)` и `readInt(btn, WORKOUT.SET)` в handleClick → должны совпадать с `attr()` в `_renderSetRow()`

2. **`undefined` при импорте**: Не добавляй прямые импорты между модулями — используй callback injection через `App.init()`. См. пункт 4

3. **Stale UI после действия**: Забыли `App.invalidatePageCache()`. Вызови перед навигацией

4. **Новый модуль не загружается**: Забыли добавить в `sw.js ASSETS`. Браузер кеширует старую версию

5. **Свайп не работает**: Не добавлен конфиг в `SwipeNav._getSwipeConfig()`

6. **Оборудование "воскресает"**: Три причины: (a) sync merge использовал `!value` вместо `=== undefined` → tombstone null перезаписывался. (b) `applyGymEquipment` не проверял tombstone. (c) `removeExerciseEquipment` не обновлял `gymEquipmentMap`. Все три исправлены. `null` = tombstone, `undefined` = нет записи

7. **Мерцание миниатюр**: Вызови `markCachedThumbs()` после innerHTML

8. **«Верификация пройдена» для визуальных багов**: Скриншот preview-сервера делается после полной отрисовки. Если баг связан с таймингом (миллисекундные рывки, мерцание, flash-of-content) — скриншот не доказывает что баг исправлен. В таких случаях не пиши «верификация пройдена», а скажи: «по коду рывка быть не должно, проверь на телефоне». Для остальных визуальных багов (неправильный цвет, layout, отсутствующий элемент) скриншот — валидная проверка.

9. **Визуальный баг при свайпе — ищи причину в companion, а не в route()**: Свайп-навигация (swipe-nav.js) показывает companion-div **во время жеста**, до вызова route(). Если пользователь видит рывок/мерцание при свайпе — в первую очередь проверь, что companion отображает контент с правильной scroll-позицией (`_scrollCache`), а не с верха страницы. Companion — `position: fixed`, поэтому для смещения нужен `translateY(-savedScroll)` на содержимом. Не трать время на `scrollTo`/`innerHTML`/`opacity` в route() — к моменту route() пользователь уже увидел companion.

10. **Touch/drag на iOS — чеклист для модальных режимов (drag, reorder, picker)**:
    - **`touchAction: 'none'`** на body на ВЕСЬ режим, не на отдельные жесты. Иначе iOS между жестами перехватывает touch как scroll
    - **`overflow: hidden`** на body — блокирует нативный скролл, но НЕ блокирует кастомный pull-to-refresh (он на JS)
    - **Кастомный pull-to-refresh** — блокируй через `window._reorderMode` / `window._slotDragging` флаги. Pull-refresh (pull-refresh.js) проверяет их в touchstart и touchmove
    - **Capture-phase `touchmove` preventDefault** — единственный надёжный способ заблокировать ВСЁ на iOS. Используй с флагом чтобы не застрять: `document.addEventListener('touchmove', fn, { passive: false, capture: true })`
    - **Застрявшее состояние** — `route()` в app.js сбрасывает все body-стили и флаги при КАЖДОЙ навигации. Это safety net. Также `attachHandlers()` сбрасывает при перерендере дня
    - **history.pushState** для модальных режимов — кнопка "назад" должна закрывать режим, а не уходить на предыдущую страницу. Паттерн: `pushState` при входе, `popstate` listener при выходе
    - **`{ passive: true }` на touchstart** = нельзя `preventDefault`. Это ОК для начала жеста, но `touchmove` ОБЯЗАТЕЛЬНО `{ passive: false }` если нужен `preventDefault`

11. **Pull-to-refresh ломает обработчики (attachHandlers не работает после PTR)**:
    - `renderDay()` при PTR использует **async offscreen рендер** (проверяет класс `no-animate` на `#app`)
    - `attachHandlers()` вызванный синхронно после `renderDay()` цепляется к СТАРОМУ `.day-slide` — бесполезно
    - **Решение**: callback `UI._onPTRSwap` вызывается ПОСЛЕ `swap()` DOM-нодов и переподключает `attachHandlers`
    - Класс `no-animate` нужно убирать внутри `swap()`, иначе ВСЕ последующие рендеры пойдут через async путь
    - При выходе из модальных режимов (reorder) убирай `no-animate` ПЕРЕД `renderDay()` чтобы гарантировать синхронный рендер

12. **`this` внутри `var swap = function() {}` в ui.js**: Это обычная функция, `this` НЕ указывает на `UI`. Используй `UI.method()` напрямую, не `this.method()`. Это касается всех callback-ов переданных в `Promise.then()` или `setTimeout()`

13. **SwipeNav срабатывает в модальных режимах**: Добавляй `if (window._reorderMode) { cfg = null; return; }` в начале touchstart swipe-nav.js для блокировки свайп-навигации в модальных режимах

14. **Мерцание картинок в пикере — ищи асинхронный re-render, не CSS**: Если картинки в пикере мигают, CSS (`opacity`, `transition`) — не главная причина. Первый вопрос: **что делает `innerHTML` замену после первого рендера?** Типичный паттерн-ловушка: асинхронный callback (например `Social.searchSharedExercises().then(...)`) заменяет весь `picker-list innerHTML` уже после открытия пикера — все `<img>` теги уничтожаются и пересоздаются. Решение: не делать полный re-render в async callback — вместо этого только добавлять/обновлять нужный DOM-узел через `appendChild` или точечный апдейт. Для пикера упражнений: `_sharedExercisesCache` заполняется асинхронно, shared-секция добавляется как отдельный `<div>` в конец списка, основной список не трогается.

15. **Sync воскрешает удалённые упражнения / данные**: `syncOnLogin` берёт "base" по `_lastModified`. Если облако новее — программа из облака перезаписывает локальные изменения. Решения: (a) `_programModified` — отдельный timestamp для программы (ставится в `saveProgram()`). (b) `visibilitychange` sync не должен срабатывать сразу после init sync — ставь `_lastVisSync = Date.now()` при init. (c) `online` handler использует `syncOnLogin`, а не слепой push.

16. **Substitution ломает оборудование и вариации**: `exerciseSubstitutions` хранит только русское имя. Если рендер передаёт в data-attrs оригинальное английское имя из снэпшота (например "Hip Thrust (Barbell)") — модалка оборудования видит "(Barbell)" → `isFreeWeight = true` → пустой список. **Решение**: `_buildExerciseVM` резолвит substitution через EXERCISE_DB → передаёт resolved `_attrName` / `_attrNameRu` в data-attrs. Все data-attrs `EX_NAME`/`EX_NAME_RU` должны содержать resolved имена.

17. **`_buildDayEditorVM` должен читать из снэпшота, не из dayTemplates**: Inline editor (три точки) должен видеть те же упражнения что `resolveWorkout()`. Если читать из `dayTemplates` напрямую — editor работает с другим набором упражнений, `_snapshotIfChanged` видит разницу → unbind недели → галочки слетают. Всегда проверяй `weekTemplateVersion[week][day]` → `templateSnapshots[day][version].groups`.

18. **Нельзя переназначать снэпшоты на версии с бо́льшим числом упражнений**: При data repair — если пользователь удалил упражнения из программы, orphaned log entries для этих упражнений **нормальны**. Переназначение на старый снэпшот (где упражнения ещё были) **воскрешает** удалённые упражнения. Orphaned логи безопасно игнорировать.

19. **Tombstone `null` vs `undefined` — критичное различие в merge**: В `exerciseEquipment` и `gymEquipmentMap`: `null` = пользователь явно удалил привязку (tombstone, не трогать). `undefined` = записи нет (можно заполнить из другого источника). Используй `=== undefined` для проверки отсутствия, НЕ `!value` (falsy включает null).

20. **Data repair — НЕ патчить облако напрямую, писать миграцию в коде**: `schedulePush` делает слепой push каждые 3 секунды. Если патчить облако через Supabase API — телефон перезапишет патч своими данными за секунды. Правильный подход: написать миграцию в `Storage._load()`, которая выполнится на самом устройстве при загрузке. Тогда устройство — автор и получатель, гонки нет.

21. **Инварианты данных — ТОЛЬКО в `Storage._load()`, не после sync**: Если инвариант нужно гарантировать всегда (например "будущие недели не привязаны к устаревшим снэпшотам"), ставь проверку в `_load()` через callback (`_unbindFn`, `_migrateFn`). Одноразовая миграция (`migrations.js`) или post-sync cleanup (`cleanOrphanedLogEntries`) — **ненадёжно**: sync может перезаписать данные облачными ПОСЛЕ миграции, но ДО рендера. `_load()` — единственная точка через которую проходят ВСЕ чтения данных, включая те что после sync.

22. **Sync + миграция — порядок выполнения**: App init → `_load()` (с миграциями) → `syncOnLogin` → `Storage._invalidateCache()` → следующий `_load()` (миграции снова) → рендер. Миграции в `_load()` запускаются **дважды**: до и после sync. Это правильно — после sync данные могут измениться, и инварианты нужно восстановить.

23. **`_lastModified` в sync merge — НИКОГДА `Date.now()`**: После merge ставить `Math.max(localTime, remoteTime)`. Если ставить `Date.now()` — облако всегда будет "новее" локальных данных при следующем sync, и все локальные изменения (settings, choices, substitutions) будут проигрывать.

24. **Переименование упражнений — автоматическая миграция**: `migrateExerciseNames()` шаг 5 сверяет `nameRu` с EXERCISE_DB по стабильному English name. Переименовал `nameRu` в `exercises_db.js` → push → при загрузке программа автообновится. `_NAME_MAP` нужен только при смене English name.
