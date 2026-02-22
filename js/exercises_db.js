// exercises_db.js — Exercise library for program builder

const EXERCISE_CATEGORIES = [
    { id: 'chest',     nameRu: 'Грудь' },
    { id: 'back',      nameRu: 'Спина' },
    { id: 'legs',      nameRu: 'Ноги' },
    { id: 'glutes',    nameRu: 'Ягодицы' },
    { id: 'shoulders', nameRu: 'Плечи' },
    { id: 'arms',      nameRu: 'Руки' },
    { id: 'core',      nameRu: 'Пресс' },
    { id: 'cardio',    nameRu: 'Кардио' }
];

const EXERCISE_DB = [
    // === Грудь ===
    { nameRu: 'Жим штанги лёжа',              name: 'Barbell Bench Press',         category: 'chest' },
    { nameRu: 'Жим гантелей лёжа',            name: 'Dumbbell Bench Press',        category: 'chest' },
    { nameRu: 'Жим на наклонной скамье',       name: 'Incline Bench Press',         category: 'chest' },
    { nameRu: 'Жим гантелей на наклонной',     name: 'Incline Dumbbell Press',      category: 'chest' },
    { nameRu: 'Жим на наклонной вниз',         name: 'Decline Bench Press',         category: 'chest' },
    { nameRu: 'Разводка гантелей',             name: 'Dumbbell Flyes',              category: 'chest' },
    { nameRu: 'Сведение рук в кроссовере',     name: 'Cable Crossover',             category: 'chest' },
    { nameRu: 'Сведение в тренажёре (Pec Deck)', name: 'Pec Deck Machine',          category: 'chest' },
    { nameRu: 'Жим в тренажёре на грудь',      name: 'Chest Press Machine',         category: 'chest' },
    { nameRu: 'Отжимания от пола',             name: 'Push-ups',                    category: 'chest' },
    { nameRu: 'Отжимания на брусьях',          name: 'Dips (Chest)',                category: 'chest' },
    { nameRu: 'Пуловер с гантелей',            name: 'Dumbbell Pullover',           category: 'chest' },

    // === Спина ===
    { nameRu: 'Подтягивания',                  name: 'Pull-ups',                    category: 'back' },
    { nameRu: 'Тяга верхнего блока',           name: 'Lat Pulldown',                category: 'back' },
    { nameRu: 'Тяга штанги в наклоне',         name: 'Barbell Row',                 category: 'back' },
    { nameRu: 'Тяга гантели в наклоне',        name: 'Dumbbell Row',                category: 'back' },
    { nameRu: 'Тяга нижнего блока',            name: 'Seated Cable Row',            category: 'back' },
    { nameRu: 'Тяга Т-грифа',                  name: 'T-Bar Row',                   category: 'back' },
    { nameRu: 'Тяга в тренажёре с упором',     name: 'Supported Row Machine',       category: 'back' },
    { nameRu: 'Горизонтальная тяга в тренажёре', name: 'Seated Row Machine',        category: 'back' },
    { nameRu: 'Тяга верхнего блока узким хватом', name: 'Close-Grip Pulldown',      category: 'back' },
    { nameRu: 'Гиперэкстензия',                name: 'Hyperextension',              category: 'back' },
    { nameRu: 'Шраги со штангой',              name: 'Barbell Shrugs',              category: 'back' },
    { nameRu: 'Шраги с гантелями',             name: 'Dumbbell Shrugs',             category: 'back' },

    // === Ноги ===
    { nameRu: 'Приседания со штангой',          name: 'Barbell Squat',               category: 'legs' },
    { nameRu: 'Фронтальные приседания',         name: 'Front Squat',                 category: 'legs' },
    { nameRu: 'Гакк-приседания',               name: 'Hack Squat',                  category: 'legs' },
    { nameRu: 'Жим ногами',                    name: 'Leg Press',                   category: 'legs' },
    { nameRu: 'Разгибание ног в тренажёре',    name: 'Leg Extension',               category: 'legs' },
    { nameRu: 'Сгибание ног лёжа',             name: 'Lying Leg Curl',              category: 'legs' },
    { nameRu: 'Сгибание ног сидя',             name: 'Seated Leg Curl',             category: 'legs' },
    { nameRu: 'Сгибание ног стоя',             name: 'Standing Leg Curl',           category: 'legs' },
    { nameRu: 'Становая тяга',                 name: 'Deadlift',                    category: 'legs' },
    { nameRu: 'Румынская тяга',                name: 'Romanian Deadlift',           category: 'legs' },
    { nameRu: 'Выпады с гантелями',            name: 'Dumbbell Lunges',             category: 'legs' },
    { nameRu: 'Болгарские сплит-приседания',    name: 'Bulgarian Split Squat',       category: 'legs' },
    { nameRu: 'Подъём на носки стоя',           name: 'Standing Calf Raise',         category: 'legs' },
    { nameRu: 'Подъём на носки сидя',           name: 'Seated Calf Raise',           category: 'legs' },

    // === Ягодицы ===
    { nameRu: 'Ягодичный мостик со штангой',    name: 'Barbell Hip Thrust',          category: 'glutes' },
    { nameRu: 'Ягодичный мостик в тренажёре',   name: 'Hip Thrust Machine',          category: 'glutes' },
    { nameRu: 'Отведение ноги в кроссовере',    name: 'Cable Kickback',              category: 'glutes' },
    { nameRu: 'Отведение ноги в тренажёре',     name: 'Glute Kickback Machine',      category: 'glutes' },
    { nameRu: 'Разведение ног в тренажёре',     name: 'Hip Abduction Machine',       category: 'glutes' },
    { nameRu: 'Сведение ног в тренажёре',       name: 'Hip Adduction Machine',       category: 'glutes' },
    { nameRu: 'Жим одной ногой',               name: 'Single Leg Press',            category: 'glutes' },
    { nameRu: 'Ягодичные сплит-приседания',     name: 'Glute Split Squat',           category: 'glutes' },
    { nameRu: 'Step-up на платформу',           name: 'Step-up',                     category: 'glutes' },

    // === Плечи ===
    { nameRu: 'Жим штанги стоя',               name: 'Overhead Press',              category: 'shoulders' },
    { nameRu: 'Жим гантелей сидя',             name: 'Seated Dumbbell Press',       category: 'shoulders' },
    { nameRu: 'Жим в тренажёре на плечи',      name: 'Shoulder Press Machine',      category: 'shoulders' },
    { nameRu: 'Махи гантелями в стороны',       name: 'Lateral Raises',              category: 'shoulders' },
    { nameRu: 'Махи в стороны в кроссовере',    name: 'Cable Lateral Raises',        category: 'shoulders' },
    { nameRu: 'Махи гантелей перед собой',      name: 'Front Raises',                category: 'shoulders' },
    { nameRu: 'Разводка в наклоне (задняя дельта)', name: 'Rear Delt Flyes',         category: 'shoulders' },
    { nameRu: 'Обратные разведения в тренажёре', name: 'Reverse Pec Deck',           category: 'shoulders' },
    { nameRu: 'Тяга штанги к подбородку',       name: 'Upright Row',                 category: 'shoulders' },
    { nameRu: 'Тяга к лицу (Face Pull)',        name: 'Face Pull',                   category: 'shoulders' },

    // === Руки ===
    { nameRu: 'Подъём штанги на бицепс',        name: 'Barbell Curl',                category: 'arms' },
    { nameRu: 'Подъём гантелей на бицепс',      name: 'Dumbbell Curl',               category: 'arms' },
    { nameRu: 'Молотковые сгибания',            name: 'Hammer Curl',                 category: 'arms' },
    { nameRu: 'Сгибания на бицепс в кроссовере', name: 'Cable Curl',                 category: 'arms' },
    { nameRu: 'Сгибания на скамье Скотта',      name: 'Preacher Curl',               category: 'arms' },
    { nameRu: 'Концентрированные сгибания',      name: 'Concentration Curl',          category: 'arms' },
    { nameRu: 'Французский жим лёжа',           name: 'Skull Crushers',              category: 'arms' },
    { nameRu: 'Французский жим стоя',           name: 'Overhead Tricep Extension',   category: 'arms' },
    { nameRu: 'Разгибание рук на блоке',        name: 'Tricep Pushdown',             category: 'arms' },
    { nameRu: 'Разгибание рук с канатом',       name: 'Rope Tricep Pushdown',        category: 'arms' },
    { nameRu: 'Отжимания на брусьях (трицепс)',  name: 'Dips (Triceps)',              category: 'arms' },
    { nameRu: 'Жим узким хватом',               name: 'Close-Grip Bench Press',      category: 'arms' },
    { nameRu: 'Сгибания в запястьях',            name: 'Wrist Curls',                 category: 'arms' },

    // === Пресс ===
    { nameRu: 'Скручивания',                    name: 'Crunches',                    category: 'core' },
    { nameRu: 'Подъём ног в висе',              name: 'Hanging Leg Raise',           category: 'core' },
    { nameRu: 'Подъём ног лёжа',               name: 'Lying Leg Raise',             category: 'core' },
    { nameRu: 'Скручивания на блоке',           name: 'Cable Crunch',                category: 'core' },
    { nameRu: 'Планка',                         name: 'Plank',                       category: 'core' },
    { nameRu: 'Боковая планка',                 name: 'Side Plank',                  category: 'core' },
    { nameRu: 'Русские скручивания',             name: 'Russian Twist',               category: 'core' },
    { nameRu: 'Скручивания в тренажёре',         name: 'Ab Crunch Machine',           category: 'core' },
    { nameRu: 'Велосипед',                      name: 'Bicycle Crunch',              category: 'core' },

    // === Кардио ===
    { nameRu: 'Беговая дорожка',                name: 'Treadmill',                   category: 'cardio' },
    { nameRu: 'Эллиптический тренажёр',          name: 'Elliptical',                  category: 'cardio' },
    { nameRu: 'Велотренажёр',                   name: 'Stationary Bike',             category: 'cardio' },
    { nameRu: 'Гребной тренажёр',               name: 'Rowing Machine',              category: 'cardio' },
    { nameRu: 'Степпер',                        name: 'Stair Stepper',               category: 'cardio' },
    { nameRu: 'Прыжки на скакалке',             name: 'Jump Rope',                   category: 'cardio' }
];
