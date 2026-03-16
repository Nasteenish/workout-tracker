import json
from collections import Counter

with open('c:/Users/Administrator/Desktop/workout-tracker/exercise_db_data.json', 'r', encoding='utf-8') as f:
    entries = json.load(f)

cat_order = ['chest', 'back', 'legs', 'glutes', 'shoulders', 'arms', 'core', 'cardio']
cat_names = {
    'chest': 'Грудь', 'back': 'Спина', 'legs': 'Ноги', 'glutes': 'Ягодицы',
    'shoulders': 'Плечи', 'arms': 'Руки', 'core': 'Пресс', 'cardio': 'Кардио'
}

entries.sort(key=lambda e: (cat_order.index(e['category']) if e['category'] in cat_order else 99, e['nameRu']))
cats = Counter(e['category'] for e in entries)

lines = ['// exercises_db.js — Exercise library (429 exercises from Hevy)', '']
lines.append('const EXERCISE_CATEGORIES = [')
for c in cat_order:
    lines.append("    { id: '%s', nameRu: '%s' }," % (c, cat_names[c]))
lines.append('];')
lines.append('')
lines.append('const EXERCISE_DB = [')

current_cat = None
for e in entries:
    if e['category'] != current_cat:
        current_cat = e['category']
        count = cats[current_cat]
        lines.append('    // === %s (%d) ===' % (cat_names[current_cat], count))

    name_ru = e['nameRu'].replace("'", "\\'")
    name_en = e['name'].replace("'", "\\'")
    cat = e['category']
    lines.append("    { nameRu: '%s', name: '%s', category: '%s' }," % (name_ru, name_en, cat))

lines.append('];')
lines.append('')

content = '\n'.join(lines)
with open('c:/Users/Administrator/Desktop/workout-tracker/js/exercises_db.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Generated exercises_db.js with %d exercises' % len(entries))
for c in cat_order:
    print('  %s: %d' % (cat_names[c], cats[c]))
