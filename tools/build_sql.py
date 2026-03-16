import json, os, subprocess

with open('c:/Users/Administrator/Desktop/workout-tracker/exercises_raw.json', 'r') as f:
    data = json.load(f)

IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

def esc(s):
    if s is None:
        return ''
    return s.replace("'", "''")

def pg_arr_simple(arr):
    if not arr:
        return '{}'
    return '{' + ','.join('"' + a.replace('"', '') + '"' for a in arr) + '}'

BATCH = 10
total_ok = 0
total_err = 0

for i in range(0, len(data), BATCH):
    batch = data[i:i+BATCH]
    values = []
    for e in batch:
        eid = esc(e.get('id') or e['name'].replace(' ', '_'))
        name = esc(e['name'])
        force = esc(e.get('force') or '')
        level = esc(e.get('level', ''))
        mechanic = esc(e.get('mechanic') or '')
        equipment = esc(e.get('equipment') or '')
        category = esc(e.get('category', ''))
        pm = pg_arr_simple(e.get('primaryMuscles', []))
        sm = pg_arr_simple(e.get('secondaryMuscles', []))
        imgs = pg_arr_simple([IMG_BASE + img for img in e.get('images', [])])
        values.append(
            f"('{eid}','{name}','{force}','{level}','{mechanic}','{equipment}','{category}','{pm}','{sm}','{{}}','{imgs}')"
        )

    sql = "INSERT INTO exercises (id,name_en,force,level,mechanic,equipment,category,primary_muscles,secondary_muscles,instructions,images) VALUES " + ",".join(values) + " ON CONFLICT (id) DO NOTHING;"

    tmpfile = 'c:/Users/Administrator/Desktop/workout-tracker/temp_sql.json'
    with open(tmpfile, 'w') as f:
        json.dump({'query': sql}, f)

    result = subprocess.run(
        ['curl', '-s', '-X', 'POST',
         'https://api.supabase.com/v1/projects/mqyfdbfdeuwojgexhwpy/database/query',
         '-H', 'Authorization: Bearer sbp_01caff5afbb7344ac074136202719c2cc17a6930',
         '-H', 'Content-Type: application/json',
         '-d', '@' + tmpfile],
        capture_output=True, text=True
    )

    out = result.stdout
    if 'error' in out.lower() or 'message' in out.lower():
        print(f"Batch {i//BATCH+1}: ERROR - {out[:300]}")
        total_err += len(batch)
    else:
        total_ok += len(batch)
        if (i // BATCH + 1) % 10 == 0:
            print(f"Progress: {total_ok}/{len(data)}")

print(f"\nDone: {total_ok} ok, {total_err} errors, total {len(data)}")
