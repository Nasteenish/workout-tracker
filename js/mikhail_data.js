// Mikhail Timoshin training program
const MIKHAIL_PROGRAM = {
  "title": "12-Week Pre-Competition Program",
  "coach": "Francisco Espin",
  "athlete": "Mikhail Timoshin",
  "totalWeeks": 12,
  "dayTemplates": {
    "1": {
      "title": "Hamstrings, Gluteus & Quadriceps",
      "titleRu": "Задняя поверхность бедра, ягодицы и квадрицепсы",
      "exerciseGroups": [
        {
          "type": "single",
          "sectionTitle": "HAMSTRINGS",
          "sectionTitleRu": "ЗАДНЯЯ ПОВЕРХНОСТЬ БЕДРА",
          "exercise": {
            "id": "D1E1",
            "name": "Seated leg curl",
            "nameRu": "Сгибание ног сидя",
            "reps": "8-12",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8-7",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "8-9",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D1E2",
            "name": "Unilateral seated leg curl",
            "nameRu": "Сгибание ноги сидя (поочерёдно)",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D1E3",
            "name": "Lying leg curl",
            "nameRu": "Сгибание ног лёжа",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "choose_one",
          "choiceKey": "D1_deadlift",
          "sectionTitle": "HAMSTRINGS - Deadlift",
          "sectionTitleRu": "ЗАДНЯЯ ПОВЕРХНОСТЬ БЕДРА - Тяга",
          "options": [
            {
              "id": "D1E4_opt1",
              "name": "Stiff legged deadlift",
              "nameRu": "Мёртвая тяга со штангой",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D1E4_opt2",
              "name": "Dumbell stiff legged deadlift",
              "nameRu": "Мёртвая тяга с гантелями",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D1E4_opt3",
              "name": "Smith deadlift",
              "nameRu": "Мёртвая тяга в Смите",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D1E4_opt4",
              "name": "Romanian deadlift machine",
              "nameRu": "Румынская тяга в тренажёре",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "single",
          "sectionTitle": "ABDUCTOR",
          "sectionTitleRu": "ОТВОДЯЩИЕ",
          "exercise": {
            "id": "D1E5",
            "name": "Abductor machine",
            "nameRu": "Разведение ног в тренажёре",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "GLUTEUS",
          "sectionTitleRu": "ЯГОДИЦЫ",
          "exercise": {
            "id": "D1E6",
            "name": "High cable glute kickbacks",
            "nameRu": "Отведение ноги назад (верхний блок)",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D1E7",
            "name": "Unilateral hip thrust machine",
            "nameRu": "Ягодичный мост в тренажёре (поочерёдно)",
            "reps": "8-12",
            "rest": 120,
            "sets": [
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "QUADRICEPS",
          "sectionTitleRu": "КВАДРИЦЕПСЫ",
          "exercise": {
            "id": "D1E8",
            "name": "Unilateral leg extension",
            "nameRu": "Разгибание ноги сидя (поочерёдно)",
            "reps": "12-15",
            "rest": 30,
            "sets": [
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "CALFS",
          "sectionTitleRu": "ГОЛЕНИ",
          "exercise": {
            "id": "D1E9",
            "name": "Calf raises machine",
            "nameRu": "Подъём на носки (тренажёр)",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        }
      ]
    },
    "2": {
      "title": "Chest, Delts & Triceps",
      "titleRu": "Грудь, дельты и трицепс",
      "exerciseGroups": [
        {
          "type": "single",
          "sectionTitle": "DELTS (warm-up)",
          "sectionTitleRu": "ДЕЛЬТЫ (разминка)",
          "exercise": {
            "id": "D2E1",
            "name": "6 Ways",
            "nameRu": "6 Ways (разминка плеч)",
            "reps": "8-12",
            "rest": 120,
            "sets": [
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "choose_one",
          "choiceKey": "D2_chest_press",
          "sectionTitle": "CHEST",
          "sectionTitleRu": "ГРУДЬ",
          "options": [
            {
              "id": "D2E2_opt1",
              "name": "Incline bench press (Smith)",
              "nameRu": "Жим на наклонной в Смите",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D2E2_opt2",
              "name": "Convergence chest press",
              "nameRu": "Жим в тренажёре (конвергентный)",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D2E2_opt3",
              "name": "Incline dumbell press",
              "nameRu": "Жим гантелей на наклонной",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E3",
            "name": "Low cable crossover",
            "nameRu": "Сведение рук на нижних блоках",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E4",
            "name": "Dip machine for chest",
            "nameRu": "Отжимания в тренажёре (грудь)",
            "reps": "8-12",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8-7",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "8-9",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E5",
            "name": "Unilateral machine fly",
            "nameRu": "Разводка в тренажёре (поочерёдно)",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "DELTS",
          "sectionTitleRu": "ДЕЛЬТЫ",
          "exercise": {
            "id": "D2E6",
            "name": "Unilateral low pulley raises",
            "nameRu": "Подъём на нижнем блоке (поочерёдно)",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "choose_one",
          "choiceKey": "D2_lateral_raise",
          "options": [
            {
              "id": "D2E7_opt1",
              "name": "Standing lateral dumbell raises",
              "nameRu": "Махи гантелями стоя",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D2E7_opt2",
              "name": "Seated dumbell lateral raises",
              "nameRu": "Махи гантелями сидя",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D2E7_opt3",
              "name": "Lateral raise machine",
              "nameRu": "Махи в тренажёре",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "single",
          "sectionTitle": "TRICEPS",
          "sectionTitleRu": "ТРИЦЕПС",
          "exercise": {
            "id": "D2E8",
            "name": "One arm rope triceps extension",
            "nameRu": "Разгибание одной рукой (канат)",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E9",
            "name": "Overhead triceps extension",
            "nameRu": "Французский жим из-за головы",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E10",
            "name": "Incline skull crushers",
            "nameRu": "Французский жим на наклонной",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        }
      ]
    },
    "3": {
      "title": "Back, Rear Delts & Biceps",
      "titleRu": "Спина, задние дельты и бицепс",
      "exerciseGroups": [
        {
          "type": "single",
          "sectionTitle": "BACK",
          "sectionTitleRu": "СПИНА",
          "exercise": {
            "id": "D3E1",
            "name": "Supported row",
            "nameRu": "Тяга с опорой на грудь",
            "reps": "8-12",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8-7",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "8-9",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D3E2",
            "name": "Close grip pulldown",
            "nameRu": "Тяга верхнего блока узким хватом",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "choose_one",
          "choiceKey": "D3_unilateral_row",
          "sectionTitle": "BACK - Unilateral Row",
          "sectionTitleRu": "СПИНА - Односторонняя тяга",
          "options": [
            {
              "id": "D3E3_opt1",
              "name": "Dorian row",
              "nameRu": "Тяга Дориана",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D3E3_opt2",
              "name": "Single arm cable row",
              "nameRu": "Тяга нижнего блока одной рукой",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D3E3_opt3",
              "name": "Hammer single arm low row",
              "nameRu": "Тяга Хаммер одной рукой (нижняя)",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "choose_one",
          "choiceKey": "D3_pulldown",
          "sectionTitle": "BACK - Pulldown",
          "sectionTitleRu": "СПИНА - Тяга сверху",
          "options": [
            {
              "id": "D3E4_opt1",
              "name": "Single arm hammer high row",
              "nameRu": "Тяга Хаммер одной рукой (верхняя)",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D3E4_opt2",
              "name": "Single arm pulldown",
              "nameRu": "Тяга верхнего блока одной рукой",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D3E4_opt3",
              "name": "Unilateral pulldown machine",
              "nameRu": "Тяга сверху в тренажёре (поочерёдно)",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "sectionTitle": "REAR DELTS",
          "sectionTitleRu": "ЗАДНИЕ ДЕЛЬТЫ",
          "exercises": [
            {
              "id": "D3E5",
              "name": "Inclined bench dumbell swings",
              "nameRu": "Махи гантелями на наклонной скамье",
              "reps": "15-20",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D3E6",
              "name": "Fly machine / Cable rear delt fly",
              "nameRu": "Разводка в тренажёре / Задние дельты на блоке",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "sectionTitle": "BICEPS",
          "sectionTitleRu": "БИЦЕПС",
          "exercises": [
            {
              "id": "D3E7",
              "name": "Dumbell single arm preacher curl",
              "nameRu": "Сгибание на скамье Скотта (гантель, поочерёдно)",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D3E8",
              "name": "Dual bayesian curl",
              "nameRu": "Байесовские сгибания",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "SH",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        }
      ]
    },
    "4": {
      "title": "Quadriceps, Gluteus & Hamstrings",
      "titleRu": "Квадрицепсы, ягодицы и задняя поверхность бедра",
      "exerciseGroups": [
        {
          "type": "warmup",
          "sectionTitle": "WARM UP",
          "sectionTitleRu": "РАЗМИНКА",
          "exercise": {
            "id": "D4W1",
            "name": "Adductor machine (warm-up)",
            "nameRu": "Сведение ног (разминка)",
            "reps": "15-20",
            "rest": 0,
            "sets": [
              {
                "type": "H",
                "rpe": "7",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "warmup",
          "exercise": {
            "id": "D4W2",
            "name": "Abductor machine (warm-up)",
            "nameRu": "Разведение ног (разминка)",
            "reps": "15-20",
            "rest": 0,
            "sets": [
              {
                "type": "H",
                "rpe": "7",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "choose_one",
          "choiceKey": "D4_squat",
          "sectionTitle": "QUADRICEPS",
          "sectionTitleRu": "КВАДРИЦЕПСЫ",
          "options": [
            {
              "id": "D4E1_opt1",
              "name": "Hack squat",
              "nameRu": "Гакк-присед",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D4E1_opt2",
              "name": "Reverse banded hack squat",
              "nameRu": "Гакк-присед с резинкой (обратный)",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D4E1_opt3",
              "name": "Pendulum squat",
              "nameRu": "Присед в маятниковом тренажёре",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D4E1_opt4",
              "name": "Smith squat",
              "nameRu": "Присед в Смите",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8-7",
                  "techniques": []
                },
                {
                  "type": "SH",
                  "rpe": "8-9",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "single",
          "exercise": {
            "id": "D4E2",
            "name": "45° leg press",
            "nameRu": "Жим ногами 45°",
            "reps": "8-12",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8-7",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "8-9",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D4E3",
            "name": "Leg extension",
            "nameRu": "Разгибание ног сидя",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "ADDUCTOR & ABDUCTOR",
          "sectionTitleRu": "ПРИВОДЯЩИЕ И ОТВОДЯЩИЕ",
          "exercise": {
            "id": "D4E4",
            "name": "Adductor machine",
            "nameRu": "Сведение ног в тренажёре",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "8",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D4E5",
            "name": "Abductor machine",
            "nameRu": "Разведение ног в тренажёре",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "HAMSTRINGS",
          "sectionTitleRu": "ЗАДНЯЯ ПОВЕРХНОСТЬ БЕДРА",
          "exercise": {
            "id": "D4E6",
            "name": "Unilateral seated leg curl",
            "nameRu": "Сгибание ноги сидя (поочерёдно)",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "GLUTEUS",
          "sectionTitleRu": "ЯГОДИЦЫ",
          "exercise": {
            "id": "D4E7",
            "name": "High cable glute kickbacks",
            "nameRu": "Отведение ноги назад (верхний блок)",
            "reps": "12-15",
            "rest": 120,
            "sets": [
              {
                "type": "SH",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "9-10",
                "techniques": []
              }
            ]
          }
        },
        {
          "type": "single",
          "sectionTitle": "CALFS",
          "sectionTitleRu": "ГОЛЕНИ",
          "exercise": {
            "id": "D4E8",
            "name": "Calf raises machine",
            "nameRu": "Подъём на носки (тренажёр)",
            "reps": "15-20",
            "rest": 120,
            "sets": [
              {
                "type": "S",
                "rpe": "9",
                "techniques": []
              },
              {
                "type": "SH",
                "rpe": "10",
                "techniques": []
              },
              {
                "type": "H",
                "rpe": "10",
                "techniques": []
              }
            ]
          }
        }
      ]
    },
    "5": {
      "title": "Chest, Delts & Triceps (secondary)",
      "titleRu": "Грудь, дельты и трицепс (вторичная)",
      "exerciseGroups": [
        {
          "type": "superset",
          "sectionTitle": "CHEST (tri-series)",
          "sectionTitleRu": "ГРУДЬ (три-серия)",
          "exercises": [
            {
              "id": "D5E1",
              "name": "Machine chest press",
              "nameRu": "Жим в тренажёре",
              "reps": "15-20",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            },
            {
              "_chooseOne": true,
              "choiceKey": "D5_chest_fly",
              "options": [
                {
                  "id": "D5E2_opt1",
                  "name": "Low cable crossover",
                  "nameRu": "Сведение рук на нижних блоках",
                  "reps": "15-20",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D5E2_opt2",
                  "name": "Seated pec flys",
                  "nameRu": "Разводка сидя (тренажёр)",
                  "reps": "15-20",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    }
                  ]
                }
              ]
            },
            {
              "_chooseOne": true,
              "choiceKey": "D5_chest_dip",
              "options": [
                {
                  "id": "D5E3_opt1",
                  "name": "Dip machine for chest",
                  "nameRu": "Отжимания в тренажёре (грудь)",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D5E3_opt2",
                  "name": "Push-ups",
                  "nameRu": "Отжимания",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "sectionTitle": "DELTS (tri-series)",
          "sectionTitleRu": "ДЕЛЬТЫ (три-серия)",
          "exercises": [
            {
              "id": "D5E4",
              "name": "Machine shoulder press",
              "nameRu": "Жим в тренажёре (плечи)",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "_chooseOne": true,
              "choiceKey": "D5_lateral",
              "options": [
                {
                  "id": "D5E5_opt1",
                  "name": "Lateral raise machine",
                  "nameRu": "Махи в тренажёре",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D5E5_opt2",
                  "name": "Seated dumbell lateral raises",
                  "nameRu": "Махи гантелями сидя",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                }
              ]
            },
            {
              "id": "D5E6",
              "name": "Inclined bench dumbell swings",
              "nameRu": "Махи гантелями на наклонной скамье",
              "reps": "15-20",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "sectionTitle": "TRICEPS (tri-series)",
          "sectionTitleRu": "ТРИЦЕПС (три-серия)",
          "exercises": [
            {
              "id": "D5E7",
              "name": "Dual rope cable extension",
              "nameRu": "Разгибания на блоке (двойной канат)",
              "reps": "15-20",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D5E8",
              "name": "Overhead triceps extension",
              "nameRu": "Французский жим из-за головы",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D5E9",
              "name": "Incline skull crushers",
              "nameRu": "Французский жим на наклонной",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        }
      ]
    },
    "6": {
      "title": "Back, Rear Delts & Biceps (secondary)",
      "titleRu": "Спина, задние дельты и бицепс (вторичная)",
      "exerciseGroups": [
        {
          "type": "superset",
          "sectionTitle": "BACK",
          "sectionTitleRu": "СПИНА",
          "exercises": [
            {
              "_chooseOne": true,
              "choiceKey": "D6_back_high",
              "options": [
                {
                  "id": "D6E1_opt1",
                  "name": "Hammer high row",
                  "nameRu": "Тяга Хаммер (верхняя)",
                  "reps": "8-12",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D6E1_opt2",
                  "name": "Close grip pulldown",
                  "nameRu": "Тяга верхнего блока узким хватом",
                  "reps": "8-12",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9",
                      "techniques": []
                    }
                  ]
                }
              ]
            },
            {
              "id": "D6E2",
              "name": "Hammer low row",
              "nameRu": "Тяга Хаммер (нижняя)",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "exercises": [
            {
              "_chooseOne": true,
              "choiceKey": "D6_pulldown",
              "options": [
                {
                  "id": "D6E3_opt1",
                  "name": "Single arm pulldown",
                  "nameRu": "Тяга верхнего блока одной рукой",
                  "reps": "15-20",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D6E3_opt2",
                  "name": "Unilateral pulldown machine",
                  "nameRu": "Тяга сверху в тренажёре (поочерёдно)",
                  "reps": "15-20",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "10",
                      "techniques": []
                    }
                  ]
                }
              ]
            },
            {
              "_chooseOne": true,
              "choiceKey": "D6_unilateral_row",
              "options": [
                {
                  "id": "D6E4_opt1",
                  "name": "Single arm cable row",
                  "nameRu": "Тяга нижнего блока одной рукой",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D6E4_opt2",
                  "name": "Hammer single arm low row",
                  "nameRu": "Тяга Хаммер одной рукой (нижняя)",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                },
                {
                  "id": "D6E4_opt3",
                  "name": "Dorian row",
                  "nameRu": "Тяга Дориана",
                  "reps": "12-15",
                  "rest": 120,
                  "sets": [
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    },
                    {
                      "type": "H",
                      "rpe": "9-10",
                      "techniques": []
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "sectionTitle": "REAR DELTS",
          "sectionTitleRu": "ЗАДНИЕ ДЕЛЬТЫ",
          "exercises": [
            {
              "id": "D6E5",
              "name": "Inclined bench dumbell swings",
              "nameRu": "Махи гантелями на наклонной скамье",
              "reps": "15-20",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D6E6",
              "name": "Fly machine / Cable rear delt fly",
              "nameRu": "Разводка в тренажёре / Задние дельты на блоке",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            }
          ]
        },
        {
          "type": "superset",
          "sectionTitle": "BICEPS",
          "sectionTitleRu": "БИЦЕПС",
          "exercises": [
            {
              "id": "D6E7",
              "name": "Seated dumbell curl",
              "nameRu": "Сгибания с гантелями сидя",
              "reps": "15-20",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "10",
                  "techniques": []
                }
              ]
            },
            {
              "id": "D6E8",
              "name": "Preacher curls",
              "nameRu": "Сгибания на скамье Скотта",
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                },
                {
                  "type": "H",
                  "rpe": "9-10",
                  "techniques": []
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "weeklyOverrides": {
    "3": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      }
    },
    "4": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      }
    },
    "5": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D1E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      }
    },
    "6": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D1E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      }
    },
    "7": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E3": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP_OR_REST"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D2E7_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E10": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E7": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            }
          }
        }
      }
    },
    "8": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE",
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP_OR_REST"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E7_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E10": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E7": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      }
    },
    "9": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E9": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E7_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E10": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E7": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      }
    },
    "10": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E9": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E7_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E10": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E7": {
          "sets": {
            "2": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      }
    },
    "11": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E9": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E7_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E10": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10",
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10",
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E7": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      }
    },
    "12": {
      "1": {
        "D1E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E4_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E4_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E5": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E9": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E2_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E2_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D2E7_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E7_opt3": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E9": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D2E10": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D3E2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "1": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E4_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D3E5": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10",
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10",
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E7": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        }
      },
      "4": {
        "D4E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt3": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E1_opt4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP"
              ]
            }
          }
        },
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "DROP"
              ]
            },
            "2": {
              "techniques": [
                "REST_PAUSE",
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "0": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E8": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            },
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "9"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E4": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E6": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D5E9": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      },
      "6": {
        "D6E1_opt1": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E1_opt2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8-7"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E2": {
          "sets": {
            "0": {
              "type": "S",
              "rpe": "8"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E3_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt1": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt2": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E4_opt3": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E5": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E6": {
          "sets": {
            "0": {
              "type": "SH",
              "rpe": "9-10"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E7": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        },
        "D6E8": {
          "sets": {
            "0": {
              "type": "SH"
            },
            "1": {
              "type": "SH"
            }
          }
        }
      }
    }
  }
};
