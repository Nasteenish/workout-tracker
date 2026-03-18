// data.js - Training program data
// Architecture: template + weekly overrides pattern
// Program is stored in Storage._program, accessed via Storage.getProgram()/setProgram()

const SET_TYPES = {
  S: { label: "Straight", labelRu: "Прямой", color: "#4CAF50" },
  SH: { label: "Straight-Hard", labelRu: "Прямой-Тяжёлый", color: "#FF9800" },
  H: { label: "Hard", labelRu: "Тяжёлый", color: "#f44336" }
};

const TECHNIQUE_TYPES = {
  DROP: { label: "Drop set", labelRu: "Дроп-сет", abbr: "DROP" },
  REST_PAUSE: { label: "Rest-pause", labelRu: "Отдых-пауза", abbr: "REST" },
  MP: { label: "Myoreps / partial", labelRu: "Миорепы / частичные", abbr: "MP" },
  DROP_OR_REST: { label: "Drop set or Rest-pause", labelRu: "Дроп-сет или Отдых-пауза", abbr: "DROP/REST" }
};

const DEFAULT_PROGRAM = {
  version: 2,
  title: "12-Week Training Program",
  coach: "Francisco Espin",
  athlete: "Anastasiia Dobrosol",
  totalWeeks: 12,

  // =========================================================================
  // DAY TEMPLATES (Base = Weeks 1 & 2)
  // =========================================================================
  dayTemplates: {

    // -----------------------------------------------------------------------
    // DAY 1 - HAMSTRINGS & GLUTEUS
    // -----------------------------------------------------------------------
    1: {
      title: "Hamstrings & Gluteus",
      titleRu: "Задняя поверхность бедра и ягодицы",
      exerciseGroups: [
        {
          type: "choose_one",
          choiceKey: "D1_deadlift",
          sectionTitle: "HAMSTRINGS",
          sectionTitleRu: "ЗАДНЯЯ ПОВЕРХНОСТЬ БЕДРА",
          options: [
            {
              id: "D1E1_opt1",
              name: "Straight Leg Deadlift",
              nameRu: "Становая тяга на прямых ногах (со штангой)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D1E1_opt2",
              name: "Straight Leg Deadlift (Dumbbell)",
              nameRu: "Становая тяга на прямых ногах (с гантелями)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D1E1_opt3",
              name: "Deadlift (Smith Machine)",
              nameRu: "Становая тяга (в Смите)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D1E1_opt4",
              name: "Romanian Deadlift (Machine)",
              nameRu: "Румынская тяга (в тренажёре)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "single",
          exercise: {
            id: "D1E2",
            name: "Seated Leg Curl (Machine)",
            nameRu: "Сгибание ног сидя (в тренажёре)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D1E3",
            name: "Lying Leg Curl (Machine)",
            nameRu: "Сгибание ног лёжа (в тренажёре)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          sectionTitle: "GLUTEUS",
          sectionTitleRu: "ЯГОДИЦЫ",
          exercise: {
            id: "D1E4",
            name: "Bulgarian Split Squat",
            nameRu: "Болгарские сплит-приседания",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D1E5",
            name: "Glute Kickback (Machine)",
            nameRu: "Отведение ноги назад (в тренажёре)",
            reps: "8-12",
            rest: 120,
            sets: [
              { type: "H", rpe: "9", techniques: [] },
              { type: "H", rpe: "9", techniques: [] },
              { type: "H", rpe: "9", techniques: [] }
            ]
          }
        },
        {
          type: "superset",
          sectionTitle: "CALFS",
          sectionTitleRu: "ГОЛЕНИ",
          exercises: [
            {
              id: "D1E6",
              name: "Standing Calf Raise (Machine)",
              nameRu: "Подъём на носки стоя (в тренажёре)",
              reps: "15-20",
              rest: 120,
              sets: [
                { type: "SH", rpe: "10", techniques: [] },
                { type: "SH", rpe: "10", techniques: [] },
                { type: "SH", rpe: "10", techniques: [] }
              ]
            },
            {
              id: "D1E7",
              name: "Tibial Raises",
              nameRu: "Подъём передней части голени",
              reps: "15-20",
              rest: 120,
              sets: [
                { type: "SH", rpe: "10", techniques: [] },
                { type: "SH", rpe: "10", techniques: [] },
                { type: "SH", rpe: "10", techniques: [] }
              ]
            }
          ]
        }
      ]
    },

    // -----------------------------------------------------------------------
    // DAY 2 - BACK & SHOULDERS
    // -----------------------------------------------------------------------
    2: {
      title: "Back & Shoulders",
      titleRu: "Спина и плечи",
      exerciseGroups: [
        {
          type: "choose_one",
          choiceKey: "D2_support",
          sectionTitle: "BACK",
          sectionTitleRu: "СПИНА",
          options: [
            {
              id: "D2E1",
              name: "Chest Supported Incline Row (Dumbbell)",
              nameRu: "Тяга с упором в наклонную скамью (с гантелями)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D2E1_opt2",
              name: "T Bar Row",
              nameRu: "Тяга Т-грифа",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D2E1_opt3",
              name: "Chest Supported Incline Row (Dumbbell)",
              nameRu: "Тяга с упором в наклонную скамью (с гантелями)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D2E1_opt4",
              name: "Supported Bar Rows",
              nameRu: "Тяга штанги с опорой на грудь",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "single",
          exercise: {
            id: "D2E2",
            name: "Lat Pulldown - Close Grip (Cable)",
            nameRu: "Тяга верхнего блока узким хватом (на блоке)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "choose_one",
          choiceKey: "D2_row",
          sectionTitle: "BACK - Rowing",
          sectionTitleRu: "СПИНА - Тяга",
          options: [
            {
              id: "D2E3_opt1",
              name: "Bent Over Row (Barbell)",
              nameRu: "Тяга в наклоне (со штангой)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D2E3_opt2",
              name: "Single Arm Cable Row",
              nameRu: "Тяга одной рукой (на блоке)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            },
            {
              id: "D2E3_opt3",
              name: "Iso-Lateral Low Row",
              nameRu: "Нижняя тяга раздельная",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "choose_one",
          choiceKey: "D2_pull",
          sectionTitle: "BACK - Pulldown",
          sectionTitleRu: "СПИНА - Тяга сверху",
          options: [
            {
              id: "D2E4_opt1",
              name: "Iso-Lateral High Row (Machine)",
              nameRu: "Верхняя тяга раздельная (в тренажёре)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            },
            {
              id: "D2E4_opt2",
              name: "Single Arm Lat Pulldown",
              nameRu: "Тяга верхнего блока одной рукой",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            },
            {
              id: "D2E4_opt3",
              name: "Lat Pulldown (Machine)",
              nameRu: "Тяга верхнего блока (в тренажёре)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "superset",
          sectionTitle: "REAR DELTS",
          sectionTitleRu: "ЗАДНИЕ ДЕЛЬТЫ",
          exercises: [
            {
              id: "D2E5",
              name: "Rear Delt Reverse Fly (Dumbbell)",
              nameRu: "Разведение на заднюю дельту (с гантелями)",
              reps: "15-20",
              rest: 120,
              sets: [
                { type: "H", rpe: "10", techniques: [] },
                { type: "H", rpe: "10", techniques: [] },
                { type: "H", rpe: "10", techniques: [] }
              ]
            },
            {
              id: "D2E6",
              name: "Rear Delt Reverse Fly (Cable)",
              nameRu: "Разведение на заднюю дельту (на блоке)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            }
          ]
        }
      ]
    },

    // -----------------------------------------------------------------------
    // DAY 3 - GLUTEUS & QUADRICEPS
    // -----------------------------------------------------------------------
    3: {
      title: "Gluteus & Quadriceps",
      titleRu: "Ягодицы и квадрицепсы",
      exerciseGroups: [
        {
          type: "warmup",
          exercise: {
            id: "D3E0",
            name: "Hip Abduction (Machine)",
            nameRu: "Разведение ног (в тренажёре)",
            reps: "15-20",
            rest: null,
            note: "High repetition warm-ups, do not come close to muscle failure",
            noteRu: "Разминочные подходы с высоким числом повторений, не приближаться к отказу",
            sets: []
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E1",
            name: "Hip Thrust (Machine)",
            nameRu: "Ягодичный мост (в тренажёре)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E2",
            name: "Bulgarian Split Squat",
            nameRu: "Болгарские сплит-приседания",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E3",
            name: "Hip Abduction (Machine)",
            nameRu: "Разведение ног (в тренажёре)",
            reps: "12-15",
            rest: 120,
            note: "Tilted torso, partial range at max contraction",
            noteRu: "Наклон корпуса, частичная амплитуда на пике сокращения",
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E4",
            name: "Hip Adduction (Machine)",
            nameRu: "Сведение ног (в тренажёре)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E5",
            name: "Single Leg Press (Machine)",
            nameRu: "Жим ногой (в тренажёре)",
            reps: "15-20",
            rest: 120,
            sets: [
              { type: "SH", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E6",
            name: "Leg Extension (Machine)",
            nameRu: "Разгибание ног (в тренажёре)",
            reps: "15-20",
            rest: 120,
            sets: [
              { type: "SH", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D3E7",
            name: "Standing Calf Raise (Machine)",
            nameRu: "Подъём на носки стоя (в тренажёре)",
            reps: "15-20",
            rest: 120,
            sets: [
              { type: "SH", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] }
            ]
          }
        }
      ]
    },

    // -----------------------------------------------------------------------
    // DAY 4 - SHOULDERS & BACK
    // -----------------------------------------------------------------------
    4: {
      title: "Shoulders & Back",
      titleRu: "Плечи и спина",
      exerciseGroups: [
        {
          type: "single",
          sectionTitle: "SHOULDERS",
          sectionTitleRu: "ПЛЕЧИ",
          exercise: {
            id: "D4E1",
            name: "Shoulder Press (Machine Plates)",
            nameRu: "Жим на плечи (в тренажёре, диски)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "choose_one",
          choiceKey: "D4_lateral",
          options: [
            {
              id: "D4E2_opt1",
              name: "Lateral Raise (Machine)",
              nameRu: "Махи в стороны (в тренажёре)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            },
            {
              id: "D4E2_opt2",
              name: "Seated Lateral Raise (Dumbbell)",
              nameRu: "Махи в стороны сидя (с гантелями)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "superset",
          sectionTitle: "REAR DELTS",
          sectionTitleRu: "ЗАДНИЕ ДЕЛЬТЫ",
          exercises: [
            {
              id: "D4E3",
              name: "Rear Delt Reverse Fly (Dumbbell)",
              nameRu: "Разведение на заднюю дельту (с гантелями)",
              reps: "15-20",
              rest: 120,
              sets: [
                { type: "SH", rpe: "10", techniques: [] },
                { type: "H", rpe: "10", techniques: [] },
                { type: "H", rpe: "10", techniques: [] }
              ]
            },
            {
              id: "D4E4",
              name: "Rear Delt Reverse Fly (Cable)",
              nameRu: "Разведение на заднюю дельту (на блоке)",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "SH", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "superset",
          sectionTitle: "BACK - Superset 1",
          sectionTitleRu: "СПИНА - Суперсет 1",
          exercises: [
            {
              _chooseOne: true,
              choiceKey: "D4_back1",
              options: [
                {
                  id: "D4E5_opt1",
                  name: "Iso-Lateral High Row (Machine)",
                  nameRu: "Верхняя тяга раздельная (в тренажёре)",
                  reps: "8-12",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9", techniques: [] },
                    { type: "H", rpe: "9", techniques: [] },
                    { type: "H", rpe: "9", techniques: [] }
                  ]
                },
                {
                  id: "D4E5_opt2",
                  name: "Lat Pulldown - Close Grip (Cable)",
                  nameRu: "Тяга верхнего блока узким хватом (на блоке)",
                  reps: "8-12",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9", techniques: [] },
                    { type: "H", rpe: "9", techniques: [] },
                    { type: "H", rpe: "9", techniques: [] }
                  ]
                }
              ]
            },
            {
              id: "D4E6",
              name: "Iso-Lateral Low Row",
              nameRu: "Нижняя тяга раздельная",
              reps: "12-15",
              rest: 120,
              sets: [
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] },
                { type: "H", rpe: "9-10", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "superset",
          sectionTitle: "BACK - Superset 2",
          sectionTitleRu: "СПИНА - Суперсет 2",
          exercises: [
            {
              _chooseOne: true,
              choiceKey: "D4_back2a",
              options: [
                {
                  id: "D4E7_opt1",
                  name: "Single Arm Lat Pulldown",
                  nameRu: "Тяга верхнего блока одной рукой",
                  reps: "12-15",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] }
                  ]
                },
                {
                  id: "D4E7_opt2",
                  name: "Lat Pulldown (Machine)",
                  nameRu: "Тяга верхнего блока (в тренажёре)",
                  reps: "12-15",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] }
                  ]
                }
              ]
            },
            {
              _chooseOne: true,
              choiceKey: "D4_back2b",
              options: [
                {
                  id: "D4E8_opt1",
                  name: "Single Arm Cable Row",
                  nameRu: "Тяга одной рукой (на блоке)",
                  reps: "12-15",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] }
                  ]
                },
                {
                  id: "D4E8_opt2",
                  name: "Iso-Lateral Low Row",
                  nameRu: "Нижняя тяга раздельная",
                  reps: "12-15",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] }
                  ]
                },
                {
                  id: "D4E8_opt3",
                  name: "Bent Over Row (Barbell)",
                  nameRu: "Тяга в наклоне (со штангой)",
                  reps: "12-15",
                  rest: 120,
                  sets: [
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] },
                    { type: "H", rpe: "9-10", techniques: [] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    // -----------------------------------------------------------------------
    // DAY 5 - GLUTEUS
    // -----------------------------------------------------------------------
    5: {
      title: "Gluteus",
      titleRu: "Ягодицы",
      exerciseGroups: [
        {
          type: "single",
          exercise: {
            id: "D5E1",
            name: "Hip Abduction (Machine)",
            nameRu: "Разведение ног (в тренажёре)",
            reps: "15-20",
            rest: 120,
            note: "Tilted torso, partial range",
            noteRu: "Наклон корпуса, частичная амплитуда",
            sets: [
              { type: "SH", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "choose_one",
          choiceKey: "D5_thrust",
          options: [
            {
              id: "D5E2_opt1",
              name: "Hip Thrust (Barbell)",
              nameRu: "Ягодичный мост (со штангой)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D5E2_opt2",
              name: "Hip Thrust (Machine)",
              nameRu: "Ягодичный мост (в тренажёре)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "S", rpe: "8-7", techniques: [] },
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "choose_one",
          choiceKey: "D5_kick",
          options: [
            {
              id: "D5E3_opt1",
              name: "Standing Cable Glute Kickbacks",
              nameRu: "Отведение ноги назад стоя (на блоке)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            },
            {
              id: "D5E3_opt2",
              name: "Glute Kickback (Machine)",
              nameRu: "Отведение ноги назад (в тренажёре)",
              reps: "8-12",
              rest: 120,
              sets: [
                { type: "SH", rpe: "8-9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] },
                { type: "H", rpe: "9", techniques: [] }
              ]
            }
          ]
        },
        {
          type: "single",
          exercise: {
            id: "D5E4",
            name: "Medium Gluteus on Low Pulley",
            nameRu: "Средняя ягодичная (нижний блок)",
            reps: "12-15",
            rest: 120,
            sets: [
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] },
              { type: "H", rpe: "9-10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D5E5",
            name: "Leg Extension (Machine)",
            nameRu: "Разгибание ног (в тренажёре)",
            reps: "15-20",
            rest: 120,
            sets: [
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D5E6",
            name: "Seated Leg Curl (Machine)",
            nameRu: "Сгибание ног сидя (в тренажёре)",
            reps: "15-20",
            rest: 120,
            sets: [
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] }
            ]
          }
        },
        {
          type: "single",
          exercise: {
            id: "D5E7",
            name: "Standing Calf Raise (Machine)",
            nameRu: "Подъём на носки стоя (в тренажёре)",
            reps: "15-20",
            rest: 120,
            sets: [
              { type: "SH", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] },
              { type: "H", rpe: "10", techniques: [] }
            ]
          }
        }
      ]
    }
  },

  // =========================================================================
  // WEEKLY OVERRIDES
  // Only what changes from the base template, keyed by exercise ID + set index
  // Weeks 1 & 2: no overrides (they ARE the base template)
  // =========================================================================
  weeklyOverrides: {

    // -----------------------------------------------------------------------
    // WEEK 3
    // -----------------------------------------------------------------------
    3: {
      1: {
        // Day 1 - Seated leg curl set 3: +1 MP
        "D1E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Lying leg curl set 3: +1 MP
        "D1E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      2: {
        // Day 2 - Dorian row set 3: +1 MP
        "D2E3_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Single arm cable row set 3: +1 MP
        "D2E3_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Hammer single arm low row set 3: +1 MP
        "D2E3_opt3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Hammer low row set 3: +1 MP
        "D4E6": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // All choose_one pulldown exercises set 3: +1 MP
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      3: {
        // Day 3 - Abductor machine (D3E3) set 3: +1 MP
        "D3E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Adductor (D3E4) set 3: +1 MP
        "D3E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      4: {
        // Day 4 - Swings (D4E3) set 3: +1 MP
        "D4E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Fly (D4E4) set 3: +1 MP
        "D4E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      5: {
        // Day 5 - Glute cable kickbacks set 3: +1 MP
        "D5E3_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Glute kickback machine set 3: +1 MP
        "D5E3_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 4
    // -----------------------------------------------------------------------
    4: {
      1: {
        // Day 1 - All deadlift variants set 3: +1 MP
        "D1E1_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Seated curl set 3: +1 MP
        "D1E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Lying curl set 3: +1 MP
        "D1E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      2: {
        // Day 2 - Close grip pulldown set 3: +1 MP
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // All rowing set 3: +1 MP
        "D2E3_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // All pulldown set 3: +1 MP
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      3: {
        // Day 3 - Glute split squat (D3E2) set 3: +1 DROP
        "D3E2": {
          sets: {
            2: { techniques: ["DROP"] }
          }
        },
        // Abductor (D3E3) set 3: +1 MP
        "D3E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Adductor (D3E4) set 3: +1 MP
        "D3E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      4: {
        // Day 4 - Lateral raise set 3: +1 REST
        "D4E2_opt1": {
          sets: {
            2: { techniques: ["REST_PAUSE"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            2: { techniques: ["REST_PAUSE"] }
          }
        },
        // Swings (D4E3) set 3: +1 MP
        "D4E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Fly (D4E4) set 3: +1 MP
        "D4E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      5: {
        // Day 5 - Same as W3 for D5
        "D5E3_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 5
    // -----------------------------------------------------------------------
    5: {
      1: {
        // Day 1 - Deadlift variants set 1: +1 DROP, set 3: +1 MP
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Seated curl set 2: +1 MP, set 3: +1 MP
        "D1E2": {
          sets: {
            1: { techniques: ["MP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Lying curl set 3: +1 MP
        "D1E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      2: {
        // Day 2 - Supported row set 1: +1 DROP
        "D2E1": { sets: { 0: { techniques: ["DROP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP"] } } },
        // Close grip pulldown set 3: +1 MP
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Rowing set 2: +1 DROP, set 3: +1 MP
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Pulldown set 3: +1 MP
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      3: {
        // Day 3 - Glute split squat set 1: +1 DROP, set 3: +1 MP
        "D3E2": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Abductor set 2: +1 REST, set 3: +1 MP
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Adductor set 3: +1 MP
        "D3E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      4: {
        // Day 4 - Lateral raise set 1: +1 DROP, set 3: +1 REST
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["REST_PAUSE"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["REST_PAUSE"] }
          }
        },
        // Swings set 3: +1 MP
        "D4E3": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Fly set 3: +1 MP
        "D4E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      5: {
        // Day 5 - Hip thrust set 1: +1 DROP
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP"] }
          }
        },
        // Kickbacks set 2: +1 REST, set 3: +1 MP
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 6
    // -----------------------------------------------------------------------
    6: {
      1: {
        // Day 1 - Deadlift variants set 1: +1 DROP, set 3: +1 MP
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Seated curl set 2: +1 MP, set 3: +1 MP
        "D1E2": {
          sets: {
            1: { techniques: ["MP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Lying curl set 2: +1 MP, set 3: +1 MP
        "D1E3": {
          sets: {
            1: { techniques: ["MP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Glute split squat set 1 type changes to SH
        "D1E4": {
          sets: {
            0: { type: "SH" }
          }
        }
      },
      2: {
        // Day 2 - Supported row set 1: +1 DROP, set 3: +1 MP
        "D2E1": { sets: { 0: { techniques: ["DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP"] }, 2: { techniques: ["MP"] } } },
        // Close grip pulldown set 3: +1 MP
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Rowing set 2: +1 DROP, set 3: +1 MP
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Pulldown set 3: +2 MP
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        // Day 3 - Glute split squat set 1: +1 DROP, set 2: +1 REST, set 3: +1 MP
        "D3E2": {
          sets: {
            0: { techniques: ["DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Abductor set 2: +1 REST, set 3: +1 MP
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Adductor set 3: +2 MP
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      4: {
        // Day 4 - Lateral raise set 1: +1 DROP, set 2: +1 REST, set 3: +1 MP
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Swings set 3: +2 MP
        "D4E3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Fly set 3: +1 MP
        "D4E4": {
          sets: {
            2: { techniques: ["MP"] }
          }
        }
      },
      5: {
        // Day 5 - Hip thrust set 1: +1 DROP
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP"] }
          }
        },
        // Kickbacks set 2: +1 REST, set 3: +1 MP
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Medium gluteus set 3: +1 REST
        "D5E4": {
          sets: {
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 7
    // -----------------------------------------------------------------------
    7: {
      1: {
        // Day 1 - Deadlift set 1: +1 DROP, set 3: +1 MP
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Seated curl: set 1 type SH, set 2 type SH +1 MP, set 3 type H +2 MP
        "D1E2": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH", techniques: ["MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        // Lying curl: set 2 +1 MP, set 3 +2 MP
        "D1E3": {
          sets: {
            1: { techniques: ["MP"] },
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      2: {
        // Day 2 - Supported row set 1: +2 DROP, set 3: +1 MP
        "D2E1": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        // Close grip pulldown set 3: +1 MP
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Rowing set 2: +1 DROP or 1 REST, set 3: +2 MP
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Pulldown set 3: +2 MP
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        // Day 3 - Glute split squat set 1: +2 DROP, set 2: +1 REST, set 3: +1 MP
        "D3E2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Abductor set 2: +1 REST, set 3: +2 MP
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Adductor set 3: +2 MP
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      4: {
        // Day 4 - Lateral raise set 1: +2 DROP, set 2: +1 REST, set 3: +1 MP
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Swings set 2: +1 REST, set 3: +2 MP
        "D4E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Fly set 3: +1 REST +2 MP
        "D4E4": {
          sets: {
            2: { techniques: ["REST_PAUSE", "MP", "MP"] }
          }
        }
      },
      5: {
        // Day 5 - Hip thrust set 1: +2 DROP
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        // Kickbacks set 2: +1 REST, set 3: +1 MP
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Medium gluteus: set 2 type SH, set 3 +1 REST
        "D5E4": {
          sets: {
            1: { type: "SH" },
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 8 (same as Week 7)
    // -----------------------------------------------------------------------
    8: {
      1: {
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E2": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH", techniques: ["MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E3": {
          sets: {
            1: { techniques: ["MP"] },
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      2: {
        "D2E1": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        "D3E2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      4: {
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D4E4": {
          sets: {
            2: { techniques: ["REST_PAUSE", "MP", "MP"] }
          }
        }
      },
      5: {
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E4": {
          sets: {
            1: { type: "SH" },
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 9
    // -----------------------------------------------------------------------
    9: {
      1: {
        // Day 1 - Deadlift set 1: +2 DROP, set 3: +1 MP
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        // Seated curl: set 2 SH +2 MP, set 3 H +2 MP
        "D1E2": {
          sets: {
            1: { type: "SH", techniques: ["MP", "MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        // Lying curl: set 2 SH +1 MP, set 3 H +2 MP
        "D1E3": {
          sets: {
            1: { type: "SH", techniques: ["MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        // Glute split squat: set 1 SH, set 2 SH
        "D1E4": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        },
        // Kickback: set 1 SH, set 2 SH
        "D1E5": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        }
      },
      2: {
        // Day 2 - Supported row set 1: +2 DROP, set 3: +1 MP
        "D2E1": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        // Pulldown (D2E2) set 3: +1 MP
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        // Rowing set 2: +1 DROP or 1 REST, set 3: +2 MP
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Pulldown (choose) set 3: +2 MP
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        // Day 3 - split squat set 1: +2 DROP, set 2: +1 REST, set 3: +2 MP
        "D3E2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Abductor set 2: +1 REST, set 3: +2 MP
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Adductor set 3: +2 MP
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        // Single leg press: set 2 SH
        "D3E5": {
          sets: {
            1: { type: "SH" }
          }
        },
        // Leg ext: set 1 SH
        "D3E6": {
          sets: {
            0: { type: "SH" }
          }
        }
      },
      4: {
        // Day 4 - Lateral raise set 1: +2 DROP, set 2: +1 REST, set 3: +1 MP
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Swings set 2: +1 REST, set 3: +3 MP
        "D4E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP", "MP"] }
          }
        },
        // Fly set 3: +1 REST +3 MP
        "D4E4": {
          sets: {
            2: { techniques: ["REST_PAUSE", "MP", "MP", "MP"] }
          }
        }
      },
      5: {
        // Day 5 - Hip thrust set 1: +2 DROP
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        // Kickbacks set 2: +1 REST, set 3: +1 MP
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        // Medium gluteus: set 2 SH, set 3 +1 REST
        "D5E4": {
          sets: {
            1: { type: "SH" },
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 10 (same as Week 9)
    // -----------------------------------------------------------------------
    10: {
      1: {
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E2": {
          sets: {
            1: { type: "SH", techniques: ["MP", "MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E3": {
          sets: {
            1: { type: "SH", techniques: ["MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E4": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        },
        "D1E5": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        }
      },
      2: {
        "D2E1": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        "D3E2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E5": {
          sets: {
            1: { type: "SH" }
          }
        },
        "D3E6": {
          sets: {
            0: { type: "SH" }
          }
        }
      },
      4: {
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP", "MP"] }
          }
        },
        "D4E4": {
          sets: {
            2: { techniques: ["REST_PAUSE", "MP", "MP", "MP"] }
          }
        }
      },
      5: {
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E4": {
          sets: {
            1: { type: "SH" },
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 11 (same as Weeks 9-10)
    // -----------------------------------------------------------------------
    11: {
      1: {
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E2": {
          sets: {
            1: { type: "SH", techniques: ["MP", "MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E3": {
          sets: {
            1: { type: "SH", techniques: ["MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E4": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        },
        "D1E5": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        }
      },
      2: {
        "D2E1": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        "D3E2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E5": {
          sets: {
            1: { type: "SH" }
          }
        },
        "D3E6": {
          sets: {
            0: { type: "SH" }
          }
        }
      },
      4: {
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP", "MP"] }
          }
        },
        "D4E4": {
          sets: {
            2: { techniques: ["REST_PAUSE", "MP", "MP", "MP"] }
          }
        }
      },
      5: {
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E4": {
          sets: {
            1: { type: "SH" },
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    },

    // -----------------------------------------------------------------------
    // WEEK 12 (same as Weeks 9-10-11)
    // -----------------------------------------------------------------------
    12: {
      1: {
        "D1E1_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt3": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E1_opt4": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            2: { techniques: ["MP"] }
          }
        },
        "D1E2": {
          sets: {
            1: { type: "SH", techniques: ["MP", "MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E3": {
          sets: {
            1: { type: "SH", techniques: ["MP"] },
            2: { type: "H", techniques: ["MP", "MP"] }
          }
        },
        "D1E4": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        },
        "D1E5": {
          sets: {
            0: { type: "SH" },
            1: { type: "SH" }
          }
        }
      },
      2: {
        "D2E1": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt2": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt3": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E1_opt4": { sets: { 0: { techniques: ["DROP", "DROP"] }, 2: { techniques: ["MP"] } } },
        "D2E2": {
          sets: {
            2: { techniques: ["MP"] }
          }
        },
        "D2E3_opt1": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt2": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E3_opt3": {
          sets: {
            1: { techniques: ["DROP_OR_REST"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt1": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt2": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D2E4_opt3": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        }
      },
      3: {
        "D3E2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E4": {
          sets: {
            2: { techniques: ["MP", "MP"] }
          }
        },
        "D3E5": {
          sets: {
            1: { type: "SH" }
          }
        },
        "D3E6": {
          sets: {
            0: { type: "SH" }
          }
        }
      },
      4: {
        "D4E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] },
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D4E3": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP", "MP", "MP"] }
          }
        },
        "D4E4": {
          sets: {
            2: { techniques: ["REST_PAUSE", "MP", "MP", "MP"] }
          }
        }
      },
      5: {
        "D5E2_opt1": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E2_opt2": {
          sets: {
            0: { techniques: ["DROP", "DROP"] }
          }
        },
        "D5E3_opt1": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E3_opt2": {
          sets: {
            1: { techniques: ["REST_PAUSE"] },
            2: { techniques: ["MP"] }
          }
        },
        "D5E4": {
          sets: {
            1: { type: "SH" },
            2: { techniques: ["REST_PAUSE"] }
          }
        }
      }
    }
  }
};

// Make available for ES module or global scope
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEFAULT_PROGRAM, SET_TYPES, TECHNIQUE_TYPES };
}
