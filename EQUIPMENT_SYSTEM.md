# Equipment System — Архитектура и задачи

> **Этот файл — единственный источник правды по системе оборудования.**
> После выполнения задачи — обнови соответствующую секцию (статус, цифры, архитектуру).

---

## Состояние БД (обновлено 2026-03-20)

### equipment_catalog

| Бренд | В БД | С картинкой | Без картинки | SQL-файл | Storage папка |
|-------|------|-------------|--------------|----------|---------------|
| gym80 | 140 | 140 | 0 | `tools/insert_equipment.sql` (145 строк, 135 data rows, +5 в БД не в SQL) | `gym80/` (140 файлов) |
| Cybex | 110 | 110 | 0 | `tools/insert_cybex.sql` (119 строк, 108 data rows, 3 нет в SQL) | `cybex/` (180 файлов*) |
| Hammer Strength | 82 | 82 | 0 | **нет SQL-файла** | `hammer/` (82 файла) |
| Precor | 68 | 68 | 0 | `tools/insert_precor.sql` (72 строки, 65 data rows, 3 нет в SQL) | `precor/` (68 файлов) |
| **Итого** | **400** | **400** | **0** | — | **470 файлов** |

*Cybex: 180 файлов в storage при 110 записях — вероятно дубли или старые файлы.

### equipment_exercises (junction table)
- **500+ строк**, 151 уникальных equipment_id → 76 уникальных exercise_id
- Заполняется через `admin.html` и `catalog.html`
- **НЕ используется в runtime** — мёртвые данные для приложения

### Supabase Storage
- Bucket: `equipment-images`
- Папки: `cybex/`, `gym80/`, `hammer/`, `precor/`, `exercise-thumbs/`
- URL-паттерн: `https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/{brand}/{model}.{ext}`

---

## Архитектура: 4 системы

### Система 1: Runtime matching (в приложении)
**Файлы:** `equipment-manager.js` (строки 215-304), `social.js` (каталог: 818-897, залы+equipment: 697-812)

**Как работает:**
```
Пользователь кликает упражнение → showEquipmentModal()
  │
  ├─ _getExerciseType(exerciseName):
  │    1. Smith machine check: "(smith machine)" → "smith_machine"
  │    2. Strip parenthetical modifier: "Bench Press (Barbell)" → "bench press"
  │    3. Direct lookup в _exerciseTypeMap (90 записей)
  │    4. Strip prefixes: "iso-lateral ", "single leg ", "seated "... (12 модификаторов)
  │    5. Substring match: core.indexOf(key)
  │    → Возвращает exercise_type или null
  │
  ├─ _isFreeWeightExercise():
  │    Модификатор в скобках: barbell/dumbbell/kettlebell/band/... → НЕ показывать каталог
  │
  ├─ Social.getCatalogBrands(exerciseType):
  │    SELECT DISTINCT brand FROM equipment_catalog WHERE exercise_type ILIKE '%type%'
  │
  └─ Social.getCatalogByBrandAndType(brand, exerciseType):
       SELECT * FROM equipment_catalog WHERE brand=X AND exercise_type ILIKE '%type%'
```

**Покрытие (438 упражнений в exercises_db.js, хедер файла говорит "429 from Hevy" — устарел):**
- 159 → совпадение с каталогом (показываются тренажёры)
- 112 → free weight (каталог пропускается, это корректно)
- **167 → нет матча** (каталог не показывается)

**Из 167 без матча:**
- ~30 кардио (Running, Cycling, Swimming...) — тренажёры не нужны
- ~40 bodyweight (Push Up, Plank, Burpee...) — тренажёры не нужны
- ~15 olympic lifts (Clean, Snatch...) — тренажёры не нужны
- **~20 cable-специфичные** — ПРОБЛЕМА, есть `cable_multi` в каталоге
- **~10 machine-специфичные** — ПРОБЛЕМА (`Shrug (Machine)`, `Vertical Traction`, `Triceps Pressdown`)
- ~50 прочие (landmine, neck, stretching...) — тренажёры не критичны

**exercise_type значения в каталоге (38 уникальных в БД, из них 31 покрыт маппингом):**
Не покрыты маппингом: `back_machine`, `cable_multi`, `kneeling_leg_curl`, `rack`, `standing_leg_curl`, `standing_multi`, `bench` (частично — только через 'bench press'/'floor press'/'hex press')
```
back_extension, back_machine, bench, bicep_curl, cable_multi, calf,
chest_dip, chest_fly, chest_press, crunch, deadlift, decline_press,
glute_kickback, hip_abduction, hip_adduction, hip_thrust, incline_press,
kneeling_leg_curl, lat_pulldown, lateral_raise, leg_curl, leg_extension,
leg_press, lying_leg_curl, preacher_curl, pullover, rack, rear_delt,
seated_leg_curl, seated_row, shoulder_press, smith_machine, squat,
standing_leg_curl, standing_multi, torso_rotation, tricep_dip, tricep_extension
```

### Система 2: Админка (equipment_exercises junction table)
**Файлы:** `admin.html`, `catalog.html`, `tools/create_equipment_exercises.sql`

Many-to-many: `equipment_catalog.id ↔ equipment_exercises ↔ exercise_id (text)`
- exercise_id формат: `Chest_Fly__Machine_`, `Butterfly__Pec_Deck_` (из exercises таблицы в Supabase)
- Заполняется вручную через UI админки
- **Runtime НЕ использует** — двойная работа

### Система 3: localStorage (пользовательская привязка)
**Файл:** `storage.js`

```javascript
Storage._data = {
  equipment: [{ id, name, imageUrl }],           // локальный список выбранных
  exerciseEquipment: { "D1E2": "eq_123" },       // текущий выбор для упражнения
  exerciseEquipmentOptions: { "D1E2": ["eq_123"] }, // история выборов
  gymEquipmentMap: { "gym-uuid": { "D1E2": "eq_123" } }  // привязка к залу
}
```
При логе подхода: `log[w][d][exId][setIdx].equipmentId`

### Система 4: Crowdsourced gym_equipment
**Файлы:** `equipment-manager.js` (shareToGymEquipment), `social.js`

```
gym_equipment: { gym_name, gym_city, exercise_name, equipment_name, catalog_id }
```
Пользователь выбирает тренажёр + привязан к залу → запись в gym_equipment.
При следующем открытии модала → секция "В этом зале:".

---

## Файлы системы

### Runtime (приложение)
| Файл | Что делает | Строки |
|------|-----------|--------|
| `js/equipment-manager.js` | UI модала, маппинг упражнений, выбор тренажёров | 446 |
| `js/social.js` (залы: 697-812, каталог: 818-897) | Supabase API: каталог, залы, gym_equipment | ~200 |
| `js/storage.js` | localStorage CRUD для equipment, gymEquipmentMap | ~100 |
| `js/data-attrs.js` (EQ) | Data-атрибуты: EQ.ID, EQ.CATALOG_ID, EQ.BRAND... | ~10 |
| `js/ui.js` | showEquipmentModal() — точка входа | ~30 |

### Инструменты
| Файл | Что делает |
|------|-----------|
| `tools/insert_equipment.sql` | INSERT gym80 (145 строк / 135 data rows) |
| `tools/insert_cybex.sql` | INSERT Cybex (119 строк / 108 data rows) |
| `tools/insert_precor.sql` | INSERT Precor (72 строки / 65 data rows) |
| `tools/create_equipment_exercises.sql` | CREATE TABLE equipment_exercises |
| `tools/fetch_gym80_images.py` | Скрапинг gym80.de → upload в Storage |
| `tools/fetch_precor_images.py` | Скрапинг precor.com → upload в Storage |
| `admin.html` | Админка: редактирование каталога + equipment_exercises |
| `catalog.html` | Просмотр каталога + привязка к упражнениям |

### Конфигурация Supabase
```
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
SERVICE_KEY  = (в tools/*.py)
MGMT_TOKEN   = "sbp_01caff5afbb7344ac074136202719c2cc17a6930" (Management API)
Storage URL  = https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/equipment-images
Public URL   = https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images
DB REST API  = https://mqyfdbfdeuwojgexhwpy.supabase.co/rest/v1/
DB Mgmt API  = https://api.supabase.com/v1/projects/mqyfdbfdeuwojgexhwpy/database/query
```

---

## Задачи

### Обозначения статусов
- `[ ]` — не начата
- `[~]` — в работе
- `[x]` — выполнена
- `[!]` — заблокирована (описание блокера)

---

### TASK-01: Докачать 36 gym80 картинок
**Статус:** `[x]` (2026-03-20)
**Приоритет:** HIGH
**Описание:** 36 моделей gym80 без image_url в equipment_catalog (20 старых + 16 новых из TASK-02).

**Модели без картинок:**

**FTM / Smith machines (4):**
| model | name | id |
|-------|------|----|
| 4002 | Basic Multi Press Station | 300 |
| 4036 | Multipress Station | 301 |
| 4040 | Max Rack | 302 |
| 4040 Basic | Basic Max Rack | 303 |

**80CLASSICS (16):**
| model | name | id |
|-------|------|----|
| 80CL0001 | Lying Leg Curl | 96 |
| 80CL0002 | Seated Leg Curl | 97 |
| 80CL0003 | Radial Gluteus | 98 |
| 80CL0004 | Lower Back | 99 |
| 80CL0006 | Abdominal | 100 |
| 80CL0007 | Special Abdominal | 101 |
| 80CL0008 | Total Ab | 102 |
| 80CL0011 | Crossover | 105 |
| 80CL0015 | Standing Calf | 108 |
| 80CL0016 | Seated Row with Chest Pad | 109 |
| 80CL0017 | Butterfly with Handgrips | 110 |
| 80CL0018 | Butterfly Reverse | 111 |
| 80CL0019 | Abduction Machine | 112 |
| 80CL0020 | Adduction Machine | 113 |
| 80CL0026 | Standing Scott Curl | 117 |
| 80CL0029 | Total Hip | 118 |

**PURE KRAFT plate-loaded (16, добавлены в TASK-02):**
| model | name | id |
|-------|------|----|
| 4018 | T-Bar Row | 392 |
| 4026 | Seated Calf Raise | 393 |
| 4307 | Lying Abdominal | 394 |
| 4325 | Shoulder Lateral Raise Dual | 395 |
| 4331 | Bench Press Dual | 396 |
| 4350 | Pullover | 397 |
| 4366 | Biceps Overhead | 398 |
| 4371 | Neck Press | 399 |
| 4375 | Inverse Leg Curl | 400 |
| 4376 | Lying Inner Chest Dual | 401 |
| 4380 | Donkey Calf | 402 |
| 4383 | 55-Degree Rowing Machine | 403 |
| 4384 | Abduction 3D | 404 |
| 4385 | Standing Shoulder Lateral Raise | 405 |
| 4386 | Booty Booster Special | 406 |
| 4388 | Viking Press | 407 |

**Подход:** Написать/обновить `tools/fetch_gym80_images.py` для 80CLASSICS серии и PURE KRAFT. Найти URL-маппинг на gym80.de для этих моделей. Smith machines (40xx) — возможно отдельные страницы.

**Результат:** Все 400 записей имеют image_url, все URL возвращают HTTP 200.

**Источники картинок:**
- 16 PURE KRAFT: gym80.de sitemap (wp-content/uploads overview images)
- 4 Smith machines: gym80.de product pages (4002, 4036 scrape; 4040 sitemap; 4040 Basic scrape)
- 16 80CLASSICS: gym80.us/products/80classics/ (3 страницы, 80CL0026 с kinsta.cloud CDN)

**Замечание:** 80CL0001 на gym80.us называется "Leg Extension", а в нашей БД — "Lying Leg Curl". Возможна ошибка в данных (проверить).

---

### TASK-02: Вставить 16 недостающих gym80 моделей в БД
**Статус:** `[x]` (2026-03-20)
**Приоритет:** MEDIUM
**Описание:** 16 моделей есть в `insert_equipment.sql`, но не были в БД.

**Причина:** SQL файл с `ON CONFLICT DO NOTHING` по PRIMARY KEY (id, автоинкремент) — конфликт невозможен. Скорее всего SQL просто не был выполнен полностью. Единственный constraint на таблице — `equipment_catalog_pkey (PRIMARY KEY id)`, нет UNIQUE на (brand, model).

**Вставлены 16 моделей** (все PURE KRAFT, plate-loaded):
| model | name | id | exercise_type |
|-------|------|----|---------------|
| 4018 | T-Bar Row | 392 | seated_row |
| 4026 | Seated Calf Raise | 393 | calf |
| 4307 | Lying Abdominal | 394 | crunch |
| 4325 | Shoulder Lateral Raise Dual | 395 | lateral_raise |
| 4331 | Bench Press Dual | 396 | chest_press |
| 4350 | Pullover | 397 | pullover |
| 4366 | Biceps Overhead | 398 | bicep_curl |
| 4371 | Neck Press | 399 | shoulder_press |
| 4375 | Inverse Leg Curl | 400 | lying_leg_curl |
| 4376 | Lying Inner Chest Dual | 401 | chest_fly |
| 4380 | Donkey Calf | 402 | calf |
| 4383 | 55-Degree Rowing Machine | 403 | seated_row |
| 4384 | Abduction 3D | 404 | hip_abduction |
| 4385 | Standing Shoulder Lateral Raise | 405 | lateral_raise |
| 4386 | Booty Booster Special | 406 | hip_thrust |
| 4388 | Viking Press | 407 | shoulder_press |

**Дополнительно исправлены 19 имён** — были generic ("Back Machine", "Chest Press (variant)"), заменены на официальные gym80 названия из SQL-файла (например "Bent Over Row", "Decline Chest Press Dual").

**Дополнительно исправлены 7 exercise_type** — были привязаны к неправильным упражнениям из-за generic переименований:
| id | model | name | было | стало |
|----|-------|------|------|-------|
| 55 | 4318 | Bent Over Row | back_machine | seated_row |
| 56 | 4319 | Low Row Dual | back_machine | seated_row |
| 61 | 4326 | Chest Crossover Dual | chest_press | chest_fly |
| 74 | 4342N | Rotating Abdominal Crunch | back_machine | crunch |
| 78 | 4346 | Decline Chest Press Dual | chest_press | decline_press |
| 79 | 4348 | Tibia Dorsi Flexion | leg_extension | calf |
| 80 | 4350N | Pullover | back_machine | pullover |

**Корневая причина:** ранний скрипт/разработчик вставил данные с упрощёнными именами и подогнал exercise_type под generic имена, а не под реальные тренажёры.

**Итог:** gym80 теперь 140 записей (135 из SQL + 5 добавленных вручную ранее). Все 140 имеют exercise_type (все проверены на корректность). 36 без картинок (20 старых + 16 новых).

**Остаток для TASK-03:** 5 моделей в БД но не в SQL: 4002, 4036, 4040, 4040 Basic, 4382.

---

### TASK-03: Синхронизировать SQL-файлы с БД
**Статус:** `[ ]`
**Приоритет:** MEDIUM
**Описание:** SQL-файлы не отражают реальное состояние БД:
- gym80: ~~16 не в БД~~ (TASK-02 done); 5 моделей в БД но не в SQL (4002, 4036, 4040, 4040 Basic, 4382)
- Cybex: 1 в SQL не в БД (5437); 3 в БД не в SQL (16121, 5341, CI-SM)
- Precor: 3 в БД не в SQL (DPL0802, Icarian, VBR6802)
- Hammer Strength: **нет SQL-файла вообще** (82 записи в БД)

**Подход:** Экспортировать текущее состояние БД → сгенерировать актуальные SQL-файлы. Создать `tools/insert_hammer.sql`.

**Результат:** Каждый бренд имеет актуальный SQL-файл. `SELECT * FROM equipment_catalog` полностью воспроизводится из SQL-файлов.

---

### TASK-04: Расширить _exerciseTypeMap для cable и machine упражнений
**Статус:** `[ ]`
**Приоритет:** MEDIUM
**Описание:** ~30 упражнений с тренажёрами не показывают каталог из-за отсутствия маппинга.

**Упражнения, которые должны показывать каталог:**
```
Cable:
  Cable Fly Crossovers → chest_fly
  Low Cable Fly Crossovers → chest_fly
  Cable Core Palloff Press → cable_multi
  Cable Pull Through → cable_multi
  Cable Twist (Down to up) → torso_rotation
  Cable Twist (Up to down) → torso_rotation
  Front Raise (Cable) → cable_multi
  Reverse Fly Single Arm (Cable) → rear_delt
  Behind the Back Curl (Cable) → bicep_curl
  Single Arm Curl (Cable) → bicep_curl
  Overhead Curl (Cable) → bicep_curl
  Rope Cable Curl → bicep_curl
  Reverse Curl (Cable) → bicep_curl
  Triceps Kickback (Cable) → tricep_extension
  Triceps Pressdown → tricep_extension
  Triceps Rope Pushdown → tricep_extension
  Rope Straight Arm Pulldown → lat_pulldown
  Upright Row (Cable) → cable_multi
  Shrug (Cable) → cable_multi
  Unilateral Low Pulley Raises → lateral_raise

Machine:
  Shrug (Machine) → back_machine? (нужен новый тип?)
  Vertical Traction (Machine) → lat_pulldown
  Glute Ham Raise → back_extension (или glute_kickback?)
  Nordic Hamstrings Curls → lying_leg_curl
```

**Подход:** Добавить записи в `_exerciseTypeMap`. Для cable-упражнений использовать `cable_multi` или конкретный тип мышцы.

**Результат:** Покрытие увеличивается с 159 до ~185 упражнений (+ cable/machine).

---

### TASK-05: Создать универсальный тулкит `tools/equipment_tool.py`
**Статус:** `[ ]`
**Приоритет:** MEDIUM
**Описание:** Сейчас: отдельные скрипты на бренд с хардкодом, Windows-пути, дублированная логика.

**Команды:**
```bash
python3 tools/equipment_tool.py status              # Статистика каталога
python3 tools/equipment_tool.py verify              # Проверить все image_url (HEAD запросы)
python3 tools/equipment_tool.py export-sql <brand>  # Выгрузить SQL из БД
python3 tools/equipment_tool.py export-sql --all    # Все бренды
python3 tools/equipment_tool.py fetch-images <brand> # Скачать недостающие картинки
python3 tools/equipment_tool.py add-brand <brand> --sql <file>  # Добавить новый бренд
python3 tools/equipment_tool.py upload-image <brand> <model> <file>  # Загрузить картинку вручную
```

**Общая логика:**
- Конфиг (SUPABASE_REF, keys) — из env или hardcoded
- REST API (не Management API) для запросов к БД
- Service key для Storage upload
- Кросс-платформенные пути (не `C:\Users\...`)
- Логирование: success/fail/skip с итогами

**Результат:** Один скрипт для всех операций с каталогом. Старые `fetch_*.py` можно удалить.

---

### TASK-06: Решить судьбу equipment_exercises junction table
**Статус:** `[ ]`
**Приоритет:** LOW
**Описание:** 500+ строк в junction table заполнены через админку, но runtime их игнорирует.

**Варианты:**
1. **Переключить runtime на junction table** — точнее, чем exercise_type ILIKE. Но требует:
   - Изменить `Social.getCatalogBrands()` и `getCatalogByBrandAndType()` — JOIN через equipment_exercises
   - Маппинг exercise names → exercise_id в junction table
   - Перенести все данные из exercise_type в junction (или использовать как fallback)
   - Тестирование покрытия
2. **Оставить как есть** — exercise_type работает, junction = бонус для админки
3. **Удалить junction table** — если не нужна, убрать мёртвый код

**Текущее решение:** Отложить до завершения TASK-01..05. Обе системы работают параллельно без конфликтов.

---

### TASK-07: Очистить Cybex storage (180 файлов для 110 записей)
**Статус:** `[ ]`
**Приоритет:** LOW
**Описание:** В `equipment-images/cybex/` 180 файлов, а записей в БД 110. 70 файлов — вероятно дубли, старые ресайзы, или неиспользуемые.

**Подход:** Получить список файлов из storage, сравнить с image_url в БД, удалить неиспользуемые.

---

### TASK-08: Добавить новый бренд (шаблон)
**Статус:** `[ ]` (шаблон для будущих задач)
**Приоритет:** —

**Чеклист добавления нового бренда:**
1. Собрать данные: model, name, muscle_group, equipment_type, exercise_type
2. Создать `tools/insert_{brand}.sql` с INSERT ON CONFLICT DO NOTHING
3. Выполнить SQL → проверить что все строки в БД
4. Собрать/скачать картинки → upload в `equipment-images/{brand}/`
5. Обновить image_url в equipment_catalog
6. Проверить что exercise_type совпадает с ключами в `_exerciseTypeMap`
7. Добавить недостающие маппинги в `_exerciseTypeMap` если нужно
8. Проверить: `Social.getCatalogBrands(type)` возвращает новый бренд
9. Обновить этот файл (EQUIPMENT_SYSTEM.md) — таблицу состояния и SQL-файлы

---

## Как обновлять этот файл

После выполнения любой задачи:

1. **Статус задачи** → `[x]`, добавить дату и коммит
2. **Таблица "Состояние БД"** → обновить цифры
3. **Если изменилась архитектура** (новые файлы, изменённые API) → обновить секцию "Архитектура"
4. **Если добавлен бренд** → новая строка в таблице + новый SQL-файл в списке

Формат отметки о выполнении:
```
### TASK-XX: ...
**Статус:** `[x]` (2026-03-21, commit abc1234)
```
