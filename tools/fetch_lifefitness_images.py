"""
Fetch Life Fitness equipment images, upload to Supabase Storage,
and insert into equipment_catalog table.
"""
import requests
import time
import os
import subprocess

SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"

LF_CDN = "https://production-gvckb4eyhna3g6c7.a03.azurefd.net/v11-24-24/960_lossy_level2_webp/kentico13corebase/media/lfmedia/lifefitnessimages"
LF_STATIC = "https://www.lifefitness.com/Kentico13CoreBase/media/LFMedia/LifeFitnessImages"

TEMP_DIR = "/tmp/lifefitness_images"
os.makedirs(TEMP_DIR, exist_ok=True)

BRAND = "Life Fitness"

# (id, model, name, muscle_group, equipment_type, exercise_type, img_slug)
# img_slug: mediasync slug from CDN, or full URL if from different source
EQUIPMENT = [
    # === INSIGNIA SERIES (Selectorized) ===
    (580, "SS-CP", "Insignia Series Chest Press", "chest", "selectorized", "chest_press",
     "mediasync/464-965-chest-press.webp"),
    (581, "SS-CPX", "Insignia Series Dual Axis Chest Press", "chest", "selectorized", "chest_press",
     "mediasync/229-012-chest-press.webp"),
    (582, "SS-SP", "Insignia Series Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     "mediasync/454-974-shoulder-press.webp"),
    (583, "SS-FLY", "Insignia Series Pectoral Fly / Rear Delt", "chest", "selectorized", "chest_fly,rear_delt",
     "equipment/strength/selectorised/insignia%20series/insignia%20pectoral%20fly%20read%20deltoid/lf-insignia-pectoral-fly-rear-deltoid-black-thumbnail.webp"),
    (584, "SS-LR", "Insignia Series Lateral Raise", "shoulders", "selectorized", "lateral_raise",
     "mediasync/427-253-lateral-raise.webp"),
    (585, "SS-PD", "Insignia Series Pulldown", "back", "selectorized", "lat_pulldown",
     "mediasync/291-66-pulldown.webp"),
    (586, "SS-PDX", "Insignia Series Dual Axis Pulldown", "back", "selectorized", "lat_pulldown",
     None),
    (587, "SS-RW", "Insignia Series Row", "back", "selectorized", "seated_row",
     "mediasync/405-232-row.webp"),
    (588, "SS-BC", "Insignia Series Biceps Curl", "arms", "selectorized", "bicep_curl",
     "mediasync/459-241-biceps-curl.webp"),
    (589, "SS-BCD", "Insignia Series Biceps Curl Dependent", "arms", "selectorized", "bicep_curl",
     "mediasync/273-767-insignia-series-biceps-curl-dependent.webp"),
    (590, "SS-TE", "Insignia Series Triceps Extension", "arms", "selectorized", "tricep_extension",
     "mediasync/254-79-insignia-series-triceps-extension.webp"),
    (591, "SS-TP", "Insignia Series Triceps Press", "arms", "selectorized", "tricep_extension",
     "mediasync/448-906-triceps-press.webp"),
    (592, "SS-ADC", "Insignia Series Assisted Dip / Chin", "full_body", "selectorized", "chest_dip,lat_pulldown",
     "mediasync/322-995-assist-dip-chin.webp"),
    (593, "SS-AB", "Insignia Series Abdominal", "core", "selectorized", "crunch",
     "mediasync/43-047-insignia-series-abdominal-1-.webp"),
    (594, "SS-ABD", "Insignia Series Abdominal Advanced", "core", "selectorized", "crunch",
     None),
    (595, "SS-TR", "Insignia Series Torso Rotation", "core", "selectorized", "torso_rotation",
     "mediasync/413-701-torso-rotation.webp"),
    (596, "SS-BE", "Insignia Series Back Extension", "back", "selectorized", "back_extension",
     "mediasync/42-118-insignia-series-back-extension-1-.webp"),
    (597, "SS-LP", "Insignia Series Arc Leg Press", "legs", "selectorized", "leg_press",
     None),
    (598, "SS-LE", "Insignia Series Leg Extension", "legs", "selectorized", "leg_extension",
     "mediasync/42-794-insignia-series-leg-extension-1-.webp"),
    (599, "SS-LC", "Insignia Series Leg Curl", "legs", "selectorized", "leg_curl",
     None),
    (600, "SS-SLC", "Insignia Series Seated Leg Curl", "legs", "selectorized", "seated_leg_curl",
     None),
    (601, "SS-CE", "Insignia Series Calf Extension", "legs", "selectorized", "calf",
     "mediasync/42-411-insignia-series-calf-extension-1-.webp"),
    (602, "SS-GL", "Insignia Series Glute", "glutes", "selectorized", "glute_kickback",
     "mediasync/404-431-glute.webp"),
    (603, "IS-GLD", "Insignia Series Glute Bridge", "glutes", "selectorized", "hip_thrust",
     None),
    (604, "SS-HAD", "Insignia Series Hip Adduction", "legs", "selectorized", "hip_adduction",
     "mediasync/419-678-hip-adduction.webp"),
    (605, "IS-HAA", "Insignia Series Hip Abduction / Adduction", "legs", "selectorized", "hip_abduction,hip_adduction",
     "mediasync/346-14-insgnia-haa-12-17-2021-1-.webp"),
    (606, "SS-SHB", "Insignia Series Sit/Stand Hip Abductor", "legs", "selectorized", "hip_abduction",
     None),

    # === SIGNATURE SERIES (Selectorized) ===
    (607, "FZCP", "Signature Series Chest Press", "chest", "selectorized", "chest_press",
     "mediasync/277-773-signature-series-chest-press-1000-1000.webp"),
    (608, "FZSP", "Signature Series Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     "mediasync/454-974-shoulder-press.webp"),
    (609, "FZPEC", "Signature Series Pectoral Fly", "chest", "selectorized", "chest_fly",
     None),
    (610, "FZRW", "Signature Series Row / Rear Delt", "back", "selectorized", "seated_row,rear_delt",
     None),
    (611, "FZPD", "Signature Series Pulldown", "back", "selectorized", "lat_pulldown",
     None),
    (612, "FZBC", "Signature Series Biceps Curl", "arms", "selectorized", "bicep_curl",
     None),
    (613, "FZTP", "Signature Series Triceps Press", "arms", "selectorized", "tricep_extension",
     None),
    (614, "FZLR", "Signature Series Lateral Raise", "shoulders", "selectorized", "lateral_raise",
     None),
    (615, "FZAB", "Signature Series Abdominal", "core", "selectorized", "crunch",
     None),
    (616, "FZTR", "Signature Series Torso Rotation", "core", "selectorized", "torso_rotation",
     None),
    (617, "FZBE", "Signature Series Back Extension", "back", "selectorized", "back_extension",
     None),
    (618, "FZGL", "Signature Series Glute", "glutes", "selectorized", "glute_kickback",
     None),
    (619, "FZLE", "Signature Series Leg Extension", "legs", "selectorized", "leg_extension",
     None),
    (620, "FZSLC", "Signature Series Seated Leg Curl", "legs", "selectorized", "seated_leg_curl",
     None),
    (621, "FZLC", "Signature Series Prone Leg Curl", "legs", "selectorized", "lying_leg_curl",
     None),
    (622, "FZSLP", "Signature Series Seated Leg Press", "legs", "selectorized", "leg_press",
     None),
    (623, "FZCE", "Signature Series Calf Extension", "legs", "selectorized", "calf",
     None),
    (624, "FZHAD", "Signature Series Hip Adduction", "legs", "selectorized", "hip_adduction",
     None),
    (625, "FZHAB", "Signature Series Hip Abduction", "legs", "selectorized", "hip_abduction",
     None),

    # === SIGNATURE SERIES (Plate-Loaded) ===
    (626, "SPLCP", "Signature PL Chest Press", "chest", "plate-loaded", "chest_press",
     None),
    (627, "SPLIP", "Signature PL Incline Press", "chest", "plate-loaded", "incline_press",
     None),
    (628, "SPLSP", "Signature PL Shoulder Press", "shoulders", "plate-loaded", "shoulder_press",
     None),
    (629, "SPLPD", "Signature PL Front Pulldown", "back", "plate-loaded", "lat_pulldown",
     None),
    (630, "SPLHR", "Signature PL High Row", "back", "plate-loaded", "high_row",
     None),
    (631, "SPLR", "Signature PL Row", "back", "plate-loaded", "seated_row",
     None),
    (632, "SPLBC", "Signature PL Biceps Curl", "arms", "plate-loaded", "bicep_curl",
     None),
    (633, "SPLSD", "Signature PL Seated Dip", "arms", "plate-loaded", "tricep_dip",
     None),
    (634, "SPLLLP", "Signature PL Linear Leg Press", "legs", "plate-loaded", "leg_press",
     None),
    (635, "SPLLE", "Signature PL Leg Extension", "legs", "plate-loaded", "leg_extension",
     None),
    (636, "SPLKLC", "Signature PL Kneeling Leg Curl", "legs", "plate-loaded", "leg_curl",
     None),
    (637, "SPLSM", "Signature Smith Machine", "full_body", "smith", "smith_machine",
     None),

    # === AXIOM SERIES (Selectorized) ===
    (638, "OP-CP", "Axiom Series Chest Press", "chest", "selectorized", "chest_press",
     "mediasync/470-146-life-fitness-axiom-series-chest-press-rear-shroud-only-op-cp-1-.webp"),
    (639, "OP-SP", "Axiom Series Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     "mediasync/376-022-life-fitness-axiom-series-shoulder-press-full-shroud-op-sp-1-.webp"),
    (640, "OP-PD", "Axiom Series Lat Pulldown", "back", "selectorized", "lat_pulldown",
     "mediasync/304-598-life-fitness-axiom-series-lat-pulldown-full-shroud-op-lp-1-.webp"),
    (641, "OP-RW", "Axiom Series Seated Row", "back", "selectorized", "seated_row",
     None),
    (642, "OP-BC", "Axiom Series Biceps Curl", "arms", "selectorized", "bicep_curl",
     "mediasync/361-48-life-fitness-axiom-series-biceps-curl-full-shroud-op-bc-1-.webp"),
    (643, "OP-TE", "Axiom Series Triceps Extension", "arms", "selectorized", "tricep_extension",
     "mediasync/344-166-life-fitness-axiom-series-triceps-extension-full-shroud-op-te-1-.webp"),
    (644, "OP-AB", "Axiom Series Abdominal", "core", "selectorized", "crunch",
     "mediasync/378-677-life-fitness-axiom-series-abdominal-full-shroud-op-ab-1-.webp"),
    (645, "OP-LP", "Axiom Series Leg Press", "legs", "selectorized", "leg_press",
     None),
    (646, "OP-LE", "Axiom Series Leg Extension", "legs", "selectorized", "leg_extension",
     "mediasync/443-248-life-fitness-axiom-series-leg-extension-full-shroud-op-le-1-.webp"),
    (647, "OP-LC", "Axiom Series Leg Curl", "legs", "selectorized", "leg_curl",
     None),
    (648, "OP-MP", "Axiom Series Multi-Press", "chest", "selectorized", "chest_press,incline_press,shoulder_press",
     "mediasync/330-934-op-mp-12-1-2020.webp"),
    (649, "OP-FLY", "Axiom Series Pec Fly / Rear Delt", "chest", "selectorized", "chest_fly,rear_delt",
     "mediasync/172-664-op-fly-rear-1-.webp"),
    (650, "OP-LR", "Axiom Series Pulldown / Row", "back", "selectorized", "lat_pulldown,seated_row",
     "mediasync/175-944-op-lr-full-1-.webp"),
    (651, "OP-BT", "Axiom Series Biceps / Triceps", "arms", "selectorized", "bicep_curl,tricep_extension",
     "mediasync/209-223-op-bt-12-1-2020.webp"),
    (652, "OP-ABBA", "Axiom Series Abdominal / Back Extension", "core", "selectorized", "crunch,back_extension",
     "mediasync/221-892-op-abba-12-3-2020.webp"),
    (653, "OP-LCE", "Axiom Series Leg Curl / Extension", "legs", "selectorized", "leg_curl,leg_extension",
     "mediasync/271-699-op-lce-12-8-2020.webp"),
    (654, "OP-HAA", "Axiom Series Hip Abductor / Adductor", "legs", "selectorized", "hip_abduction,hip_adduction",
     "mediasync/222-968-op-haa-fnl.webp"),
    (655, "OP-SLC", "Axiom Series Seated Leg Curl / Extension", "legs", "selectorized", "seated_leg_curl,leg_extension",
     "mediasync/301-816-op-slce-1-26-2021-full-shroud.webp"),
    (656, "OP-DAP", "Axiom Series Dual Adjustable Pulley", "full_body", "cable", "cable_multi",
     "mediasync/178-917-op-dap-front-10x10-300dpi.webp"),
    (657, "OP-SM", "Axiom Series Smith Rack", "full_body", "smith", "smith_machine",
     "mediasync/333-855-op-sm-with-lb-plates.webp"),

    # === SIGNATURE CABLE MOTION ===
    (658, "CMDAP", "Signature Dual Adjustable Pulley", "full_body", "cable", "cable_multi",
     None),
    (659, "CMACO", "Signature Adjustable Cable Crossover", "full_body", "cable", "cable_multi",
     None),

    # === SIGNATURE BENCHES & RACKS ===
    (660, "SOFB", "Signature Olympic Flat Bench", "chest", "bench", "chest_press",
     None),
    (661, "SOIB", "Signature Olympic Incline Bench", "chest", "bench", "incline_press",
     None),
    (662, "SODB", "Signature Olympic Decline Bench", "chest", "bench", "decline_press",
     None),
    (663, "SOMB", "Signature Olympic Military Bench", "shoulders", "bench", "shoulder_press",
     None),
    (664, "SOSR", "Signature Olympic Squat Rack", "legs", "rack", "squat",
     None),
    (665, "SMAB", "Signature Multi-Adjustable Bench", "full_body", "bench", "chest_press,incline_press",
     None),
    (666, "SADB", "Signature Adjustable Decline / Ab Bench", "core", "bench", "crunch",
     None),
    (667, "SAC", "Signature Arm Curl Bench", "arms", "bench", "preacher_curl",
     None),
    (668, "SBWBE", "Signature 45-Degree Back Extension", "back", "bench", "back_extension",
     None),
    (669, "SCDLR", "Signature Chin / Dip / Leg Raise", "full_body", "rack", "chest_dip",
     None),

    # === AXIOM BENCHES ===
    (670, "OP-MAB", "Axiom Multi-Adjustable Bench", "full_body", "bench", "chest_press,incline_press",
     "mediasync/136-229-axiom-series-adjustable-bench.webp"),
    (671, "OP-DLR", "Axiom Dip / Leg Raise", "full_body", "rack", "chest_dip,crunch",
     "mediasync/220-1-lf-axiom-dipleg-raise-1-.webp"),
]


def download_image(url, local_path):
    """Download image from URL."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(local_path, "wb") as f:
                f.write(r.content)
            return True
        print(f"  SKIP ({r.status_code}, {len(r.content)}b)")
        return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False


def convert_webp_to_jpg(webp_path, jpg_path):
    """Convert webp to jpg using sips (macOS)."""
    try:
        subprocess.run(["sips", "-s", "format", "jpeg", webp_path, "--out", jpg_path],
                       capture_output=True, timeout=10)
        return os.path.exists(jpg_path) and os.path.getsize(jpg_path) > 1000
    except:
        return False


def upload_to_storage(local_path, storage_path):
    """Upload file to Supabase Storage."""
    ct = "image/jpeg" if local_path.endswith(".jpg") else "image/webp"
    with open(local_path, "rb") as f:
        data = f.read()
    r = requests.post(f"{STORAGE_URL}/{storage_path}",
        headers={"Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": ct, "x-upsert": "true"},
        data=data, timeout=30)
    return f"{PUBLIC_URL}/{storage_path}" if r.status_code in (200, 201) else None


def run_sql(query):
    """Execute SQL via Supabase Management API."""
    r = requests.post(DB_URL,
        headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"},
        json={"query": query}, timeout=30)
    return r.json() if r.status_code == 201 else None


def main():
    print(f"Processing {len(EQUIPMENT)} Life Fitness machines...")
    sql_values = []
    ok = 0
    no_img = 0

    for idx, (eq_id, model, name, muscle, eq_type, ex_type, img_slug) in enumerate(EQUIPMENT):
        print(f"[{idx+1}/{len(EQUIPMENT)}] {model} - {name}")
        image_public_url = None

        if img_slug:
            url = f"{LF_CDN}/{img_slug}"
            webp_path = os.path.join(TEMP_DIR, f"{model.replace('/', '-')}.webp")
            jpg_path = os.path.join(TEMP_DIR, f"{model.replace('/', '-')}.jpg")

            if download_image(url, webp_path):
                # Convert webp to jpg
                if convert_webp_to_jpg(webp_path, jpg_path):
                    storage_path = f"lifefitness/{model.replace('/', '-')}.jpg"
                    uploaded = upload_to_storage(jpg_path, storage_path)
                    if uploaded:
                        image_public_url = uploaded
                        print(f"  OK")
                        ok += 1
                    else:
                        print(f"  Upload failed")
                else:
                    # Try uploading webp directly
                    storage_path = f"lifefitness/{model.replace('/', '-')}.webp"
                    uploaded = upload_to_storage(webp_path, storage_path)
                    if uploaded:
                        image_public_url = uploaded
                        print(f"  OK (webp)")
                        ok += 1
        else:
            print("  No image source")
            no_img += 1

        safe_name = name.replace("'", "''")
        img_val = f"'{image_public_url}'" if image_public_url else "NULL"
        sql_values.append(
            f"({eq_id}, '{BRAND}', '{model}', '{safe_name}', '{muscle}', '{eq_type}', '{ex_type}', {img_val})"
        )
        time.sleep(0.3)

    # Insert all records
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

    print(f"\n=== Done ===")
    print(f"Images: {ok} uploaded, {no_img} no source")
    print(f"Total records: {len(EQUIPMENT)}")

    # Save SQL backup
    sql_file = os.path.join(os.path.dirname(__file__), "insert_lifefitness.sql")
    with open(sql_file, "w") as f:
        f.write(f"-- Life Fitness equipment catalog\n")
        f.write(f"-- Generated {time.strftime('%Y-%m-%d')}\n")
        f.write(f"-- {len(EQUIPMENT)} records\n\n")
        f.write("INSERT INTO equipment_catalog (id, brand, model, name, muscle_group, equipment_type, exercise_type, image_url) VALUES\n")
        f.write(",\n".join(sql_values))
        f.write(";\n")
    print(f"SQL backup: {sql_file}")


if __name__ == "__main__":
    main()
