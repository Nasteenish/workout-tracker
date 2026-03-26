// Mikhail Timoshin training program
export const MIKHAIL_PROGRAM = {
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
            "name": "Seated Leg Curl (Machine)",
            "nameRu": "Сгибание ног сидя (в тренажёре)",
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
            "name": "Seated Leg Curl (Machine)",
            "nameRu": "Сгибание ног сидя (в тренажёре)",
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
            "name": "Lying Leg Curl (Machine)",
            "nameRu": "Сгибание ног лёжа (в тренажёре)",
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
              "name": "Straight Leg Deadlift",
              "nameRu": "Становая тяга на прямых ногах (со штангой)",
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
              "name": "Straight Leg Deadlift (Dumbbell)",
              "nameRu": "Становая тяга на прямых ногах (с гантелями)",
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
              "name": "Deadlift (Smith Machine)",
              "nameRu": "Становая тяга (в Смите)",
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
              "name": "Romanian Deadlift (Barbell)",
              "nameRu": "Румынская тяга (со штангой)",
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
            "name": "Hip Abduction (Machine)",
            "nameRu": "Разведение ног (в тренажёре)",
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
            "name": "Standing Cable Glute Kickbacks",
            "nameRu": "Отведение ноги назад стоя (на блоке)",
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
            "name": "Hip Thrust (Machine)",
            "nameRu": "Ягодичный мост (в тренажёре)",
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
            "name": "Leg Extension (Machine)",
            "nameRu": "Разгибание ног (в тренажёре)",
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
            "name": "Standing Calf Raise (Machine)",
            "nameRu": "Подъём на носки стоя (в тренажёре)",
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
              "name": "Incline Bench Press (Smith Machine)",
              "nameRu": "Жим лёжа на наклонной скамье (в Смите)",
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
              "name": "Chest Press (Machine)",
              "nameRu": "Жим от груди (в тренажёре)",
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
              "name": "Incline Bench Press (Dumbbell)",
              "nameRu": "Жим лёжа на наклонной скамье (с гантелями)",
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
            "name": "Low Cable Fly Crossovers",
            "nameRu": "Сведение рук в кроссовере снизу",
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
            "name": "Chest Dip",
            "nameRu": "Отжимания на брусьях на грудь",
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
            "name": "Chest Fly (Machine)",
            "nameRu": "Разведение на грудь (в тренажёре)",
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
            "name": "Unilateral Low Pulley Raises",
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
              "name": "Lateral Raise (Dumbbell)",
              "nameRu": "Махи в стороны (с гантелями)",
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
              "name": "Seated Lateral Raise (Dumbbell)",
              "nameRu": "Махи в стороны (сидя, с гантелями)",
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
              "name": "Lateral Raise (Machine)",
              "nameRu": "Махи в стороны (в тренажёре)",
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
            "name": "One Arm Rope Triceps Extension",
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
            "name": "Overhead Triceps Extension (Cable)",
            "nameRu": "Разгибание рук над головой (блок)",
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
            "name": "Skullcrusher (Dumbbell)",
            "nameRu": "Французский жим лёжа (с гантелями)",
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
            "name": "Chest Supported Incline Row (Dumbbell)",
            "nameRu": "Тяга с упором в наклонную скамью (с гантелями)",
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
            "name": "Lat Pulldown - Close Grip (Cable)",
            "nameRu": "Тяга верхнего блока (узкий хват)",
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
              "name": "Bent Over Row (Barbell)",
              "nameRu": "Тяга в наклоне (со штангой)",
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
              "name": "Single Arm Cable Row",
              "nameRu": "Тяга одной рукой (на блоке)",
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
              "name": "Seated Cable Row - V Grip (Cable)",
              "nameRu": "Тяга нижнего блока сидя (V-рукоять)",
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
              "name": "Lat Pulldown (Machine)",
              "nameRu": "Тяга верхнего блока (в тренажёре)",
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
              "name": "Single Arm Lat Pulldown",
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
              "name": "Lat Pulldown (Machine)",
              "nameRu": "Тяга верхнего блока (в тренажёре)",
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
              "name": "Rear Delt Reverse Fly (Dumbbell)",
              "nameRu": "Разведение на заднюю дельту (с гантелями)",
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
              "name": "Rear Delt Reverse Fly (Cable)",
              "nameRu": "Разведение на заднюю дельту (на блоке)",
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
              "name": "Preacher Curl (Dumbbell)",
              "nameRu": "Подъём на бицепс на скамье Скотта (с гантелями)",
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
              "name": "Dual Bayesian Curl",
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
            "name": "Hip Adduction (Machine)",
            "nameRu": "Сведение ног (в тренажёре)",
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
            "name": "Hip Abduction (Machine)",
            "nameRu": "Разведение ног (в тренажёре)",
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
              "name": "Hack Squat (Machine)",
              "nameRu": "Гакк-присед (в тренажёре)",
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
              "name": "Hack Squat (Machine)",
              "nameRu": "Гакк-присед (в тренажёре)",
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
              "name": "Pendulum Squat (Machine)",
              "nameRu": "Маятниковые приседания (в тренажёре)",
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
              "name": "Squat (Smith Machine)",
              "nameRu": "Приседание (в Смите)",
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
            "name": "Leg Press (Machine)",
            "nameRu": "Жим ногами (в тренажёре)",
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
            "name": "Leg Extension (Machine)",
            "nameRu": "Разгибание ног (в тренажёре)",
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
            "name": "Hip Adduction (Machine)",
            "nameRu": "Сведение ног (в тренажёре)",
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
            "name": "Hip Abduction (Machine)",
            "nameRu": "Разведение ног (в тренажёре)",
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
            "name": "Seated Leg Curl (Machine)",
            "nameRu": "Сгибание ног сидя (в тренажёре)",
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
            "name": "Standing Cable Glute Kickbacks",
            "nameRu": "Отведение ноги назад стоя (на блоке)",
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
            "name": "Standing Calf Raise (Machine)",
            "nameRu": "Подъём на носки стоя (в тренажёре)",
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
              "name": "Chest Press (Machine)",
              "nameRu": "Жим от груди (в тренажёре)",
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
                  "name": "Low Cable Fly Crossovers",
                  "nameRu": "Сведение рук в кроссовере снизу",
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
                  "name": "Seated Chest Flys (Cable)",
                  "nameRu": "Сведение рук сидя (на блоке)",
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
                  "name": "Chest Dip",
                  "nameRu": "Отжимания на брусьях на грудь",
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
                  "name": "Push Up",
                  "nameRu": "Отжимание",
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
              "name": "Shoulder Press (Machine)",
              "nameRu": "Жим на плечи сидя (в тренажёре)",
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
                  "name": "Lateral Raise (Machine)",
                  "nameRu": "Махи в стороны (в тренажёре)",
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
                  "name": "Seated Lateral Raise (Dumbbell)",
                  "nameRu": "Махи в стороны (сидя, с гантелями)",
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
              "name": "Rear Delt Reverse Fly (Dumbbell)",
              "nameRu": "Разведение на заднюю дельту (с гантелями)",
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
              "name": "Triceps Extension (Cable)",
              "nameRu": "Разгибание на трицепс (на блоке)",
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
              "name": "Overhead Triceps Extension (Cable)",
              "nameRu": "Разгибание рук над головой (блок)",
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
              "name": "Skullcrusher (Dumbbell)",
              "nameRu": "Французский жим лёжа (с гантелями)",
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
                  "name": "Lat Pulldown (Machine)",
                  "nameRu": "Тяга верхнего блока (в тренажёре)",
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
                  "name": "Lat Pulldown - Close Grip (Cable)",
                  "nameRu": "Тяга верхнего блока (узкий хват)",
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
              "name": "Seated Cable Row - V Grip (Cable)",
              "nameRu": "Тяга нижнего блока сидя (V-рукоять)",
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
                  "name": "Single Arm Lat Pulldown",
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
                  "name": "Lat Pulldown (Machine)",
                  "nameRu": "Тяга верхнего блока (в тренажёре)",
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
                  "name": "Single Arm Cable Row",
                  "nameRu": "Тяга одной рукой (на блоке)",
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
                  "name": "Seated Cable Row - V Grip (Cable)",
                  "nameRu": "Тяга нижнего блока сидя (V-рукоять)",
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
                  "name": "Bent Over Row (Barbell)",
                  "nameRu": "Тяга в наклоне (со штангой)",
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
              "name": "Rear Delt Reverse Fly (Dumbbell)",
              "nameRu": "Разведение на заднюю дельту (с гантелями)",
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
              "name": "Rear Delt Reverse Fly (Cable)",
              "nameRu": "Разведение на заднюю дельту (на блоке)",
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
              "name": "Seated Incline Curl (Dumbbell)",
              "nameRu": "Сгибание на наклонной скамье сидя (с гантелями)",
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
              "name": "Preacher Curl (Dumbbell)",
              "nameRu": "Подъём на бицепс на скамье Скотта (с гантелями)",
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
