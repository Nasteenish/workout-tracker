const MIKHAIL2_PROGRAM = {
  "title": "OFF-SEASON Program",
  "coach": "Francisco Espin",
  "athlete": "Mikhail Timoshin",
  "totalWeeks": 12,
  "dayTemplates": {
    "1": {
      "title": "Hamstrings, Glutes & Quadriceps",
      "titleRu": "Бицепс бедра, ягодицы и квадрицепс",
      "exerciseGroups": [
        {
          "type": "choose_one",
          "choiceKey": "D1_deadlift",
          "sectionTitle": "HAMSTRINGS",
          "sectionTitleRu": "БИЦЕПС БЕДРА",
          "options": [
            {
              "id": "D1E1_opt1",
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
              "id": "D1E1_opt2",
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
              "id": "D1E1_opt3",
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
          "exercise": {
            "id": "D1E2",
            "name": "Seated leg curl",
            "nameRu": "Сгибание ног сидя",
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
        },
        {
          "type": "single",
          "exercise": {
            "id": "D1E3",
            "name": "Lying leg curl",
            "nameRu": "Сгибание ног лёжа",
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
        },
        {
          "type": "single",
          "sectionTitle": "ABDUCTOR",
          "sectionTitleRu": "АБДУКТОР",
          "exercise": {
            "id": "D1E4",
            "name": "Abductor machine",
            "nameRu": "Разведение ног в тренажёре",
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
        },
        {
          "type": "choose_one",
          "choiceKey": "D1_glutes",
          "sectionTitle": "GLUTES",
          "sectionTitleRu": "ЯГОДИЦЫ",
          "options": [
            {
              "id": "D1E5_opt1",
              "name": "Single leg step up",
              "nameRu": "Подъём на платформу (поочерёдно)",
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
              "id": "D1E5_opt2",
              "name": "Glute split squat",
              "nameRu": "Сплит-присед (акцент на ягодицы)",
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
          "sectionTitle": "QUADRICEPS",
          "sectionTitleRu": "КВАДРИЦЕПСЫ",
          "exercises": [
            {
              "id": "D1E6",
              "name": "Single leg press",
              "nameRu": "Жим ногой (поочерёдно)",
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
              "id": "D1E7",
              "name": "Unilateral leg extension",
              "nameRu": "Разгибание ноги (поочерёдно)",
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
          ]
        },
        {
          "type": "single",
          "sectionTitle": "CALFS",
          "sectionTitleRu": "ГОЛЕНИ",
          "exercise": {
            "id": "D1E8",
            "name": "Calf raises machine",
            "nameRu": "Подъём на носки (тренажёр)",
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
          "type": "single",
          "sectionTitle": "CHEST",
          "sectionTitleRu": "ГРУДЬ",
          "exercise": {
            "id": "D2E2",
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
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E3",
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
          }
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E4",
            "name": "Machine fly",
            "nameRu": "Разводка в тренажёре",
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
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E5",
            "name": "Cable crossover and dip superset for chest",
            "nameRu": "Кроссовер + отжимания в тренажёре (суперсет)",
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
          "type": "choose_one",
          "choiceKey": "D2_lateral",
          "options": [
            {
              "id": "D2E7_opt1",
              "name": "Standing lateral dumbell raises",
              "nameRu": "Махи гантелями стоя",
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
              "id": "D2E7_opt2",
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
            },
            {
              "id": "D2E7_opt3",
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
        },
        {
          "type": "single",
          "exercise": {
            "id": "D2E9",
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
          "sectionTitle": "HAMSTRINGS",
          "sectionTitleRu": "БИЦЕПС БЕДРА",
          "exercise": {
            "id": "D2E11",
            "name": "Single leg curl",
            "nameRu": "Сгибание ноги (поочерёдно)",
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
          "type": "choose_one",
          "choiceKey": "D3_row",
          "options": [
            {
              "id": "D3E3_opt1",
              "name": "Dorian row",
              "nameRu": "Тяга Дориана",
              "reps": "8-12",
              "rest": 120,
              "sets": [
                {
                  "type": "SH",
                  "rpe": "8-9",
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
              "id": "D3E3_opt2",
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
              "id": "D3E3_opt3",
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
            }
          ]
        },
        {
          "type": "choose_one",
          "choiceKey": "D3_pulldown",
          "options": [
            {
              "id": "D3E4_opt1",
              "name": "Single arm hammer high row",
              "nameRu": "Тяга Хаммер одной рукой (верхняя)",
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
              "id": "D3E4_opt2",
              "name": "Single arm pulldown",
              "nameRu": "Тяга верхнего блока одной рукой",
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
              "id": "D3E4_opt3",
              "name": "Unilateral pulldown machine",
              "nameRu": "Тяга сверху в тренажёре (поочерёдно)",
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
          "sectionTitle": "REAR DELTS",
          "sectionTitleRu": "ЗАДНИЕ ДЕЛЬТЫ",
          "exercises": [
            {
              "id": "D3E5",
              "name": "Inclined bench dumbell swings",
              "nameRu": "Махи гантелями на наклонной скамье",
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
              "id": "D3E6",
              "name": "Fly machine / Cable rear delt fly",
              "nameRu": "Разводка в тренажёре / Задние дельты на блоке",
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
              "id": "D3E8",
              "name": "Dual bayesian curl",
              "nameRu": "Байесовские сгибания",
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
    "4": {
      "title": "Quadriceps, Glutes & Hamstrings",
      "titleRu": "Квадрицепсы, ягодицы и бицепс бедра",
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
                "rpe": "8-9",
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
          "exercise": {
            "id": "D4E3",
            "name": "Bulgarian split squat",
            "nameRu": "Болгарский сплит-присед",
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
        },
        {
          "type": "single",
          "exercise": {
            "id": "D4E4",
            "name": "Leg extension",
            "nameRu": "Разгибание ног сидя",
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
        },
        {
          "type": "single",
          "sectionTitle": "ADDUCTOR & ABDUCTOR",
          "sectionTitleRu": "ПРИВОДЯЩИЕ И ОТВОДЯЩИЕ",
          "exercise": {
            "id": "D4E5",
            "name": "Adductor machine",
            "nameRu": "Сведение ног в тренажёре",
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
        },
        {
          "type": "single",
          "exercise": {
            "id": "D4E6",
            "name": "Abductor machine",
            "nameRu": "Разведение ног в тренажёре",
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
        },
        {
          "type": "single",
          "sectionTitle": "HAMSTRINGS",
          "sectionTitleRu": "БИЦЕПС БЕДРА",
          "exercise": {
            "id": "D4E7",
            "name": "Unilateral seated leg curl",
            "nameRu": "Сгибание ноги сидя (поочерёдно)",
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
        },
        {
          "type": "single",
          "sectionTitle": "GLUTES",
          "sectionTitleRu": "ЯГОДИЦЫ",
          "exercise": {
            "id": "D4E8",
            "name": "High cable glute kickbacks",
            "nameRu": "Отведение ноги назад (верхний блок)",
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
        },
        {
          "type": "single",
          "sectionTitle": "CALFS",
          "sectionTitleRu": "ГОЛЕНИ",
          "exercise": {
            "id": "D4E9",
            "name": "Calf raises machine",
            "nameRu": "Подъём на носки (тренажёр)",
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
              "reps": "12-15",
              "rest": 120,
              "sets": [
                {
                  "type": "S",
                  "rpe": "8",
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
              "choiceKey": "D5_chest_fly",
              "options": [
                {
                  "id": "D5E2_opt1",
                  "name": "Low cable crossover",
                  "nameRu": "Сведение рук на нижних блоках",
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
                  "id": "D5E2_opt2",
                  "name": "Seated pec flys",
                  "nameRu": "Разводка сидя (тренажёр)",
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
          "sectionTitle": "TRICEPS (tri-series)",
          "sectionTitleRu": "ТРИЦЕПС (три-серия)",
          "exercises": [
            {
              "id": "D5E7",
              "name": "Dual rope cable extension",
              "nameRu": "Разгибания на блоке (двойной канат)",
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
        },
        {
          "type": "single",
          "sectionTitle": "HAMSTRINGS",
          "sectionTitleRu": "БИЦЕПС БЕДРА",
          "exercise": {
            "id": "D5E10",
            "name": "Single leg curl",
            "nameRu": "Сгибание ноги (поочерёдно)",
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
        }
      ]
    }
  },
  "weeklyOverrides": {
    "3": {
      "1": {
        "D1E2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
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
                "MP"
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E2_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      }
    },
    "4": {
      "1": {
        "D1E2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "2": {
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
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
                "MP"
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E2_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      }
    },
    "5": {
      "1": {
        "D1E2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
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
                "MP"
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E2": {
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
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E2_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
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
        }
      }
    },
    "6": {
      "1": {
        "D1E2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E5_opt2": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D1E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D2E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E5": {
          "sets": {
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
                "MP"
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D2E2": {
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
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "5": {
        "D5E2_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E4": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
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
        }
      }
    },
    "7": {
      "1": {
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D1E3": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E4": {
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
        "D1E5_opt1": {
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
        "D1E5_opt2": {
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
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E8": {
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
        }
      },
      "2": {
        "D2E2": {
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
            }
          }
        },
        "D2E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
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
                "MP"
              ]
            }
          }
        },
        "D2E9": {
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
        "D2E10": {
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
        "D2E11": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
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
            "1": {
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
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E5": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE"
              ]
            }
          }
        },
        "D4E7": {
          "sets": {
            "1": {
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
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E2_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E3_opt1": {
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
        "D5E3_opt2": {
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
        "D5E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
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
        "D5E8": {
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
        "D5E9": {
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
        "D5E10": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      }
    },
    "8": {
      "1": {
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D1E3": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E4": {
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
        "D1E5_opt1": {
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
        "D1E5_opt2": {
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
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
            "1": {
              "techniques": [
                "MP"
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
        "D1E8": {
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
        }
      },
      "2": {
        "D2E2": {
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
            }
          }
        },
        "D2E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D2E5": {
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
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D2E7_opt1": {
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
        "D2E7_opt2": {
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
        "D2E7_opt3": {
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
        "D2E10": {
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
        "D2E11": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D4E5": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D4E6": {
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
        "D4E7": {
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
        "D4E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
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
              "techniques": [
                "DROP"
              ]
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D5E2_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D5E3_opt1": {
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
        "D5E3_opt2": {
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
        "D5E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
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
        "D5E8": {
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
        "D5E9": {
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
        "D5E10": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      }
    },
    "9": {
      "1": {
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D1E3": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D1E4": {
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
        "D1E5_opt1": {
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
        "D1E5_opt2": {
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
        "D1E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
            "1": {
              "techniques": [
                "MP"
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
        "D1E8": {
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
        }
      },
      "2": {
        "D2E2": {
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
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D2E5": {
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
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D2E7_opt1": {
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
        "D2E7_opt2": {
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
        "D2E7_opt3": {
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
        "D2E10": {
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
        "D2E11": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D4E5": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D4E6": {
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
        "D4E7": {
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
        "D4E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        },
        "D4E9": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
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
              "techniques": [
                "DROP",
                "DROP"
              ],
              "rpe": "8-7"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D5E2_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D5E3_opt1": {
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
        "D5E3_opt2": {
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
        "D5E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E6": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E7": {
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
        "D5E8": {
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
        "D5E9": {
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
        "D5E10": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      }
    },
    "10": {
      "1": {
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D1E3": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D1E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        }
      },
      "2": {
        "D2E2": {
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
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP",
                "MP"
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
        "D2E5": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "MP",
                "MP"
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
        "D2E7_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
                "REST_PAUSE",
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
        "D2E10": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E11": {
          "sets": {
            "2": {
              "techniques": [
                "MP",
                "MP"
              ]
            }
          }
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E5": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D4E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E7": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E9": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ],
              "rpe": "8-7"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D5E2_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
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
        "D5E3_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E3_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E4": {
          "sets": {
            "1": {
              "techniques": [
                "MP"
              ]
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D5E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E7": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E9": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E10": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        }
      }
    },
    "11": {
      "1": {
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D1E3": {
          "sets": {
            "1": {
              "techniques": [
                "MP",
                "MP"
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
        "D1E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        }
      },
      "2": {
        "D2E2": {
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
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E5": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
                "REST_PAUSE",
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
        "D2E10": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E11": {
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
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E5": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E7": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E9": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ],
              "rpe": "8-7"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E2_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E3_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E3_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E7": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E9": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E10": {
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
        }
      }
    },
    "12": {
      "1": {
        "D1E1_opt1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt2": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D1E1_opt3": {
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
        "D1E3": {
          "sets": {
            "1": {
              "techniques": [
                "MP",
                "MP"
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
        "D1E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D1E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        }
      },
      "2": {
        "D2E2": {
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
                "DROP",
                "DROP"
              ]
            }
          }
        },
        "D2E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E5": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E7_opt3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
                "REST_PAUSE",
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
        "D2E10": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D2E11": {
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
        }
      },
      "3": {
        "D3E2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt1": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt2": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E3_opt3": {
          "sets": {
            "2": {
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
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D3E6": {
          "sets": {
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
                "MP"
              ]
            }
          }
        },
        "D3E8": {
          "sets": {
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
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
            },
            "2": {
              "techniques": [
                "MP"
              ]
            }
          }
        },
        "D4E2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E3": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E5": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E7": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D4E9": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        }
      },
      "5": {
        "D5E1": {
          "sets": {
            "0": {
              "techniques": [
                "DROP",
                "DROP"
              ],
              "rpe": "8-7"
            }
          }
        },
        "D5E2_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E2_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E3_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E3_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E4": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E5_opt1": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E5_opt2": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E6": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E7": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E8": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E9": {
          "sets": {
            "1": {
              "techniques": [
                "REST_PAUSE",
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
        "D5E10": {
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
        }
      }
    }
  }
};
