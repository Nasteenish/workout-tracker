"""
Fetch additional Technogym equipment (cables, benches, racks) found on es-ES site.
Upload to Supabase Storage and insert into equipment_catalog.
"""
import requests
import time
import os

SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TG_CDN = "https://webapi-prod.technogym.com/dw/image/v2/BFLQ_PRD/on/demandware.static/-/Sites-tg-catalog-master/default"
TEMP_DIR = "/tmp/technogym_images"
os.makedirs(TEMP_DIR, exist_ok=True)

BRAND = "Technogym"

# (id, model, name, muscle_group, equipment_type, exercise_type, cdn_path)
EQUIPMENT = [
    # === CABLE STATIONS ===
    (557, "MB430", "Dual Adjustable Pulley Performance", "full_body", "cable", "cable_multi",
     "product/MB430N0-AN00GGGP/dual-adjustable-pulley-performance-plp.jpg"),
    (558, "MB44", "Dual Adjustable Pulley Fitness", "full_body", "cable", "cable_multi",
     "product/MB44/dual-adjustable-pulley-fitness-plp.jpg"),
    (559, "MQ0B", "Adjustable Pulley", "full_body", "cable", "cable_multi",
     "product/MQ0B/MQ0B_grey.jpg"),
    (560, "MQ0F", "Cable Tower", "full_body", "cable", "cable_multi",
     "product/MQ0F/MQ0F_grey.jpg"),
    (561, "MQ0E", "Cable Station 4 Evolution", "full_body", "cable", "cable_multi",
     "product/MQ0E/MQ0E_grey.jpg"),
    (562, "MQ0D", "Cable Station 4", "full_body", "cable", "cable_multi",
     "product/MQ0D/MQ0D_grey.jpg"),
    (563, "MQ0A", "High Low Pulley", "full_body", "cable", "cable_multi",
     "product/MQ0A/MQ0A-grey.jpg"),
    (564, "MQ0C", "Cable Crossover", "full_body", "cable", "cable_multi",
     "product/MQ0C/MQ0C_grey.jpg"),

    # === BENCHES (Performance line) ===
    (565, "PA04", "Adjustable Bench", "full_body", "bench", "chest_press,incline_press,shoulder_press",
     "product/PA04-ANV0GG/adjustable-bench-plp.jpg"),
    (566, "PA01", "Inclined Bench", "chest", "bench", "incline_press",
     "product/PA01-ANV0GG/inclined-bench-plp.jpg"),
    (567, "PA02", "Vertical Bench", "shoulders", "bench", "shoulder_press",
     "product/PA02-ANV0GG/vertical-bench-plp.jpg"),
    (568, "PA03", "Crunch Bench", "core", "bench", "crunch",
     "product/PA03-ANV0GG/crunch-bench-plp.jpg"),
    (569, "PA05", "Lower Back Bench", "core", "bench", "back_extension",
     "product/PA05-ANV0GG/lower-back-bench-plp.jpg"),
    (570, "PA06", "Scott Bench", "arms", "bench", "preacher_curl",
     "product/PA06-ANV0GG/scott-bench-plp.jpg"),
    (571, "PA07", "Horizontal Bench", "chest", "bench", "chest_press",
     "product/PA07-ANV0GG/horizontal-bench-plp.jpg"),
    (572, "PA10", "Ab Crunch Bench", "core", "bench", "crunch",
     "product/PA10-ANV0GG/ab-crunch-bench-plp.jpg"),
    (573, "PA11", "Leg Raise / Dip", "core", "rack", "crunch,tricep_dip",
     "product/PA11-ALV0GG/leg-raise-dip-plp.jpg"),
    (574, "PA12", "Chin Up / Dip / Leg Raise", "full_body", "rack", "crunch,tricep_dip,lat_pulldown",
     "product/PA12/chin-up-dip-leg-raise-plp.jpg"),

    # === Pure Strength (missed) ===
    (575, "PG02", "Pure Strength GHD Bench", "core", "bench", "back_extension",
     "product/PG02/GHD-bench-plp.jpg"),
    (576, "PG10", "Pure Strength Olympic Half Rack", "full_body", "rack", "squat,chest_press,shoulder_press",
     "product/PG10-NB0000/olympic-half-rack-plp.jpg"),

    # === Specialty ===
    (577, "MB910", "Kneeling Easy Chin Dip", "arms", "selectorized", "tricep_dip",
     "product/MB910N0-ANV0GGGK/kneeling-easy-chin-dip-plp.jpg"),
    (578, "PA08", "Squat Rack", "legs", "rack", "squat",
     "product/PA08/squat-rack-plp.jpg"),

    # === Re-add PG11 with image ===
    (579, "PG11", "Pure Strength Olympic Power Rack", "full_body", "rack", "squat,chest_press,shoulder_press",
     "product/PG11/PG11-grey.jpg"),
]


def download_image(url, local_path):
    try:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(local_path, "wb") as f:
                f.write(r.content)
            return True
        print(f"  SKIP ({r.status_code}, {len(r.content)}b)")
        return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False


def upload_to_storage(local_path, storage_path):
    with open(local_path, "rb") as f:
        data = f.read()
    r = requests.post(f"{STORAGE_URL}/{storage_path}",
        headers={"Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "image/jpeg", "x-upsert": "true"},
        data=data, timeout=30)
    return f"{PUBLIC_URL}/{storage_path}" if r.status_code in (200, 201) else None


def run_sql(query):
    r = requests.post(DB_URL,
        headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"},
        json={"query": query}, timeout=30)
    return r.json() if r.status_code == 201 else None


def main():
    print(f"Processing {len(EQUIPMENT)} extra Technogym machines...")
    sql_values = []
    ok = 0

    for idx, (eq_id, model, name, muscle, eq_type, ex_type, cdn_path) in enumerate(EQUIPMENT):
        print(f"[{idx+1}/{len(EQUIPMENT)}] {model} - {name}")
        img_url = None
        local = os.path.join(TEMP_DIR, f"{model}.jpg")
        src = f"{TG_CDN}/{cdn_path}"

        if download_image(src, local):
            uploaded = upload_to_storage(local, f"technogym/{model}.jpg")
            if uploaded:
                img_url = uploaded
                print(f"  OK")
                ok += 1

        safe_name = name.replace("'", "''")
        img_val = f"'{img_url}'" if img_url else "NULL"
        sql_values.append(f"({eq_id}, '{BRAND}', '{model}', '{safe_name}', '{muscle}', '{eq_type}', '{ex_type}', {img_val})")
        time.sleep(0.3)

    # Insert
    print(f"\nInserting {len(sql_values)} records...")
    batch_size = 20
    for i in range(0, len(sql_values), batch_size):
        batch = sql_values[i:i+batch_size]
        sql = ("INSERT INTO equipment_catalog (id, brand, model, name, muscle_group, equipment_type, exercise_type, image_url) VALUES\n"
               + ",\n".join(batch)
               + "\nON CONFLICT (id) DO UPDATE SET brand=EXCLUDED.brand, model=EXCLUDED.model, name=EXCLUDED.name, "
               "muscle_group=EXCLUDED.muscle_group, equipment_type=EXCLUDED.equipment_type, "
               "exercise_type=EXCLUDED.exercise_type, image_url=EXCLUDED.image_url;")
        result = run_sql(sql)
        print(f"  Batch {i//batch_size+1}: {'OK' if result is not None else 'FAIL'}")
        time.sleep(0.5)

    print(f"\nDone: {ok}/{len(EQUIPMENT)} images uploaded")


if __name__ == "__main__":
    main()
