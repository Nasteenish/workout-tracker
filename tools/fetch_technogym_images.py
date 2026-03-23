"""
Fetch Technogym product images, upload to Supabase Storage,
and insert into equipment_catalog table.
"""
import requests
import time
import os
import json
import sys

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"

TG_CDN = "https://webapi-prod.technogym.com/dw/image/v2/BFLQ_PRD/on/demandware.static/-/Sites-tg-catalog-master/default"
INNOVFIT = "https://innovativefit.com/wp-content/uploads/2021/06"

TEMP_DIR = "/tmp/technogym_images"
os.makedirs(TEMP_DIR, exist_ok=True)

# --- Equipment data ---
# Format: (id, model, name, muscle_group, equipment_type, exercise_type, image_source_url)

EQUIPMENT = [
    # === SELECTION 900 (Selectorized) ===
    (445, "MNFP", "Selection 900 Chest Press", "chest", "selectorized", "chest_press",
     f"{TG_CDN}/product/MNFP/selection-900-chest-press.jpg"),
    (446, "MNTP", "Selection 900 Pectoral", "chest", "selectorized", "chest_fly",
     f"{TG_CDN}/product/MNTP/selection_900_pectoral_hero.jpg"),
    (447, "MNXP", "Selection 900 Reverse Fly", "back", "selectorized", "rear_delt",
     f"{TG_CDN}/product/MNFP/selection-900-chest-press.jpg"),  # no dedicated image found
    (448, "MNEP", "Selection 900 Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     f"{TG_CDN}/product/MNEP/selection-900-shoulder-press-plp.jpg"),
    (449, "MNKP", "Selection 900 Delts Machine", "shoulders", "selectorized", "lateral_raise",
     f"{TG_CDN}/product/MNKP/selection-900delt-machine.jpg"),
    (450, "MN3P", "Selection 900 Multi Flight", "shoulders", "selectorized", "lateral_raise,shrug",
     f"{TG_CDN}/product/MN3P/selection-900-multi-flight-MN3-plp.jpg"),
    (451, "MNGP", "Selection 900 Vertical Traction", "back", "selectorized", "lat_pulldown",
     f"{TG_CDN}/product/MNGP/selection-900-vertical-traction-plp.jpg"),
    (452, "MNLP", "Selection 900 Lat Machine", "back", "selectorized", "lat_pulldown",
     f"{TG_CDN}/product/MNLP/selection-900-lat-machine.jpg"),
    (453, "MNVP", "Selection 900 Pulldown", "back", "selectorized", "lat_pulldown",
     f"{TG_CDN}/product/MNVP/selection-900-pulldown-plp.jpg"),
    (454, "MNHP", "Selection 900 Low Row", "back", "selectorized", "low_row",
     f"{TG_CDN}/product/MNHP/selection-900-low-row-plp.jpg"),
    (455, "MNAP", "Selection 900 Leg Press", "legs", "selectorized", "leg_press",
     f"{TG_CDN}/product/MNAP/selection-900-leg-press-plp.jpg"),
    (456, "MNJP", "Selection 900 Leg Extension", "legs", "selectorized", "leg_extension",
     f"{TG_CDN}/product/MNJP/selection-900-leg-extension-plp.jpg"),
    (457, "MNIP", "Selection 900 Leg Curl", "legs", "selectorized", "leg_curl",
     f"{TG_CDN}/product/MNIP/selection-900-leg-curl-plp.jpg"),
    (458, "MNUP", "Selection 900 Prone Leg Curl", "legs", "selectorized", "lying_leg_curl",
     f"{TG_CDN}/product/MNUP/selection-900-prone-leg-curl-plp.jpg"),
    (459, "MNPP", "Selection 900 Abductor", "glutes", "selectorized", "hip_abduction",
     None),  # no CDN image found
    (460, "MNQP", "Selection 900 Adductor", "legs", "selectorized", "hip_adduction",
     f"{TG_CDN}/product/selection-900-adductor-plp.jpg"),
    (461, "MN4P", "Selection 900 Glute Press", "glutes", "selectorized", "glute_kickback",
     f"{TG_CDN}/product/MN4P/selection-900-glute-press-MN4-plp.jpg"),
    (462, "MNP2", "Selection 900 Hip Thrust", "glutes", "selectorized", "hip_thrust",
     f"{TG_CDN}/product/MNP2/selection-900-hip-thrust-MN2-plp.jpg"),
    (463, "MNDP", "Selection 900 Multi Hip", "glutes", "selectorized", "hip_abduction,hip_adduction,glute_kickback",
     None),  # no CDN image found
    (464, "MN5P", "Selection 900 Standing Calf", "legs", "selectorized", "calf",
     f"{TG_CDN}/product/MN5P/selection-900-standing-calf-MN5-plp.jpg"),
    (465, "MNRP", "Selection 900 Arm Curl", "arms", "selectorized", "bicep_curl",
     f"{TG_CDN}/product/MNRP/selection-900-arm-curl.jpg"),
    (466, "MNSP", "Selection 900 Arm Extension", "arms", "selectorized", "tricep_extension",
     f"{TG_CDN}/product/MNSP/selection-900-arm-extension-plp.jpg"),
    (467, "MNBP", "Selection 900 Abdominal Crunch", "core", "selectorized", "crunch",
     f"{TG_CDN}/product/MNBP/selecrtion-900-abdominal-crunch-plp.jpg"),
    (468, "MNZP", "Selection 900 Total Abdominal", "core", "selectorized", "crunch",
     f"{TG_CDN}/product/MNZP/selection-900-total-abdominal-plp.jpg"),
    (469, "MNCP", "Selection 900 Lower Back", "core", "selectorized", "back_extension",
     f"{TG_CDN}/product/MNCP/selection-900-lower-back-plp.jpg"),
    (470, "MNYP", "Selection 900 Rotary Torso", "core", "selectorized", "torso_rotation",
     f"{TG_CDN}/product/MNYP/selection-900-rotary-torso-plp.jpg"),
    (471, "MNWP", "Selection 900 Pulley", "full_body", "cable", "cable_multi",
     f"{TG_CDN}/product/MNWP/selection-900-pulley-plp.jpg"),

    # === SELECTION 700 (Compact Selectorized) ===
    (472, "MNFC", "Selection 700 Chest Press", "chest", "selectorized", "chest_press",
     f"{TG_CDN}/product/MNFC/selection-700-chest-press-plp.jpg"),
    (473, "MNNC", "Selection 700 Dual Pectoral / Reverse Fly", "chest", "selectorized", "chest_fly,rear_delt",
     f"{TG_CDN}/product/MNNC/selection-700-dual-pectoral-reverse-fly-plp.jpg"),
    (474, "MNEC", "Selection 700 Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     f"{TG_CDN}/product/MNEC/selection-700-shoulder-press-plp.jpg"),
    (475, "MNKC", "Selection 700 Delts Machine", "shoulders", "selectorized", "lateral_raise",
     f"{TG_CDN}/product/MNKC/selection-700-delts-machine-plp.jpg"),
    (476, "MNGC", "Selection 700 Vertical Traction", "back", "selectorized", "lat_pulldown",
     f"{TG_CDN}/product/MNGC/selection-700-vertical-traction-plp.jpg"),
    (477, "MNLC", "Selection 700 Lat Machine", "back", "selectorized", "lat_pulldown",
     f"{TG_CDN}/product/MNLC/selection-700-lat-machine-plp.jpg"),
    (478, "MNHC", "Selection 700 Low Row", "back", "selectorized", "low_row",
     f"{TG_CDN}/product/MNHC/selection-700-low-row-plp.jpg"),
    (479, "MNAC", "Selection 700 Leg Press", "legs", "selectorized", "leg_press",
     f"{TG_CDN}/product/MNAC/selection-700-leg-press-plp.jpg"),
    (480, "MNJC", "Selection 700 Leg Extension", "legs", "selectorized", "leg_extension",
     f"{TG_CDN}/product/MNJC/selection-700-leg-extension-plp-1.jpg"),
    (481, "MNIC", "Selection 700 Leg Curl", "legs", "selectorized", "leg_curl",
     f"{TG_CDN}/product/MNIC/selection-700-leg-curl-plp-1.jpg"),
    (482, "MNMC", "Selection 700 Dual Leg Extension / Curl", "legs", "selectorized", "leg_extension,leg_curl",
     f"{TG_CDN}/product/MNMC/selection-700-dual-leg-curl-extension-plp.jpg"),
    (483, "MNOC", "Selection 700 Dual Abductor / Adductor", "glutes", "selectorized", "hip_abduction,hip_adduction",
     f"{TG_CDN}/product/MNOC/selection-700-dual-abductor-adductor-plp.jpg"),
    (484, "MNDC", "Selection 700 Multi Hip", "glutes", "selectorized", "hip_abduction,hip_adduction,glute_kickback",
     f"{TG_CDN}/product/MNDC/selection-700-multi-hip-plp.jpg"),
    (485, "MNBC", "Selection 700 Abdominal Crunch", "core", "selectorized", "crunch",
     f"{TG_CDN}/product/MNBC/selection-700-abdominal-crunch-plp.jpg"),
    (486, "MNCC", "Selection 700 Lower Back", "core", "selectorized", "back_extension",
     f"{TG_CDN}/product/MNCC/selection-700-lower-back-plp.jpg"),

    # === PURE STRENGTH (Plate-Loaded) ===
    (487, "MG0500", "Pure Strength Chest Press", "chest", "plate-loaded", "chest_press",
     f"{TG_CDN}/product/MG0500-NBGJV0/pure-chest-press-plp.jpg"),
    (488, "MG1000", "Pure Strength Wide Chest Press", "chest", "plate-loaded", "chest_press",
     f"{TG_CDN}/product/MG1000-NBGJV0/pure-wide-chest-press-plp.jpg"),
    (489, "MG1500", "Pure Strength Incline Chest Press", "chest", "plate-loaded", "incline_press",
     None),  # not found on CDN
    (490, "MG9000", "Pure Strength Pullover", "chest", "plate-loaded", "pullover",
     f"{TG_CDN}/product/MG9000-NBGJV0/pure-pullover-plp.jpg"),
    (491, "MG3500", "Pure Strength Shoulder Press", "shoulders", "plate-loaded", "shoulder_press",
     f"{TG_CDN}/product/MG3500-NBGJV0/pure-shoulder-press-plp.jpg"),
    (492, "MG2000", "Pure Strength Pulldown", "back", "plate-loaded", "lat_pulldown",
     None),  # not found on CDN
    (493, "MG2500", "Pure Strength Low Row", "back", "plate-loaded", "low_row",
     None),  # not found on CDN
    (494, "MG3000", "Pure Strength Row", "back", "plate-loaded", "seated_row",
     f"{TG_CDN}/product/MG3000-NBGJV0/pure-row-plp.jpg"),
    (495, "MG5000", "Pure Strength Leg Press", "legs", "plate-loaded", "leg_press",
     f"{TG_CDN}/product/MG5000-NBGJV0/pure-leg-press-plp.jpg"),
    (496, "MG7500", "Pure Strength Linear Leg Press", "legs", "plate-loaded", "leg_press",
     f"{TG_CDN}/product/MG7500-NBGJV0/pure-linear-leg-press-plp.jpg"),
    (497, "MG8500", "Pure Strength Hack Squat", "legs", "plate-loaded", "squat",
     f"{TG_CDN}/product/MG8500-NBGJV0/pure-hack-squat.jpg"),
    (498, "MG6500", "Pure Strength Leg Extension", "legs", "plate-loaded", "leg_extension",
     f"{TG_CDN}/product/MG6500-NBGJV0/pure-leg-extension-plp_2.jpg"),
    (499, "MG7000", "Pure Strength Standing Leg Curl", "legs", "plate-loaded", "leg_curl",
     f"{TG_CDN}/product/MG7000-NBGJV0/pure-standing-leg-curl-plp.jpg"),
    (500, "MG4000", "Pure Strength Rear Kick", "glutes", "plate-loaded", "glute_kickback",
     f"{TG_CDN}/product/MG4000-NBGJV0/pure-rear-kick-plp.jpg"),
    (501, "MG8000", "Pure Strength Hip Thrust", "glutes", "plate-loaded", "hip_thrust",
     None),  # not found on CDN
    (502, "MG9500", "Pure Strength Standing Abductor", "glutes", "plate-loaded", "hip_abduction",
     None),  # not found on CDN
    (503, "MG4500", "Pure Strength Calf", "legs", "plate-loaded", "calf",
     f"{TG_CDN}/product/MG4500-NBGJV0/pure-calf-plp.jpg"),
    (504, "MG5500", "Pure Strength Seated Dip", "arms", "plate-loaded", "tricep_dip",
     f"{TG_CDN}/product/MG5500-NBGJV0/pure-seated-dip-plp.jpg"),
    (505, "MG6000", "Pure Strength Biceps Curl", "arms", "plate-loaded", "bicep_curl",
     f"{TG_CDN}/product/MG6000-NBGJV0/pure-biceps-plp.jpg"),
    (506, "MG86", "Pure Strength Belt Squat", "legs", "plate-loaded", "squat",
     f"{TG_CDN}/product/MG86/pure-belt-squat-plp.jpg"),
    (507, "MG87", "Pure Strength Deadlift", "back", "plate-loaded", "deadlift",
     f"{TG_CDN}/product/MG87/pure-deadlift-plp.jpg"),

    # === Pure Strength Benches & Racks ===
    (508, "PG04", "Pure Strength Adjustable Bench", "full_body", "bench", "chest_press,incline_press,shoulder_press",
     f"{TG_CDN}/product/PG04-NBV000/adjustable-bench-pure-plp.jpg"),
    (509, "PG07", "Pure Strength Olympic Flat Bench", "chest", "bench", "chest_press",
     f"{TG_CDN}/product/PG07-NBV000/olympic-flat-bench-plp.jpg"),
    (510, "PG01", "Pure Strength Olympic Incline Bench", "chest", "bench", "incline_press",
     f"{TG_CDN}/product/PG01-NBV000/olympic-incline-bench-plp.jpg"),
    (511, "PG23", "Pure Strength Olympic Decline Bench", "chest", "bench", "decline_press",
     f"{TG_CDN}/product/PG23-NBV000/olympic-decline-bench-pure-plp.jpg"),
    (512, "PG08", "Pure Strength Olympic Military Bench", "shoulders", "bench", "shoulder_press",
     f"{TG_CDN}/product/PG08-NBV000/olympic-military-bench-pure-plp.jpg"),
    (513, "PG14", "Pure Strength Flat Bench", "chest", "bench", "chest_press",
     f"{TG_CDN}/product/PG14-NBV000/flat-bench-pure-plp.jpg"),
    (514, "PG03", "Pure Strength Adjustable Decline Ab Crunch", "core", "bench", "crunch",
     f"{TG_CDN}/product/PG03-NBV000/adjustable-decline-ab-crunch-pure-plp.jpg"),
    (515, "PG11", "Pure Strength Olympic Power Rack", "full_body", "rack", "squat,chest_press,shoulder_press",
     None),  # not found on CDN

    # === ELEMENT+ (Selectorized, Entry-Level) ===
    (516, "MB20", "Element+ Chest Press", "chest", "selectorized", "chest_press",
     f"{INNOVFIT}/MB20_chestpress_element_related_01_1.jpg"),
    (517, "MB70", "Element+ Pectoral", "chest", "selectorized", "chest_fly",
     f"{INNOVFIT}/MB70_pectoral_element_related_01_1.jpg"),
    (518, "MB15", "Element+ Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     f"{INNOVFIT}/MB15_shoulderpress_element_related_01_1.jpg"),
    (519, "MB25", "Element+ Vertical Traction", "back", "selectorized", "lat_pulldown",
     f"{INNOVFIT}/MB25_verticaltraction_element_related_01_1.jpg"),
    (520, "MB40", "Element+ Lat Machine", "back", "selectorized", "lat_pulldown",
     f"{INNOVFIT}/MB40_latmachine_element_related_01_3.jpg"),
    (521, "MB95", "Element+ Low Row", "back", "selectorized", "low_row",
     f"{INNOVFIT}/MB95_lowrow_element_related_01_1.jpg"),
    (522, "MB50", "Element+ Leg Press", "legs", "selectorized", "leg_press",
     f"{INNOVFIT}/MB50_legpress_element_related_01_1.jpg"),
    (523, "MB30", "Element+ Leg Extension", "legs", "selectorized", "leg_extension",
     f"{INNOVFIT}/MB30_legextension_element_related_01_1.jpg"),
    (524, "MB35", "Element+ Leg Curl", "legs", "selectorized", "leg_curl",
     f"{INNOVFIT}/MB35_legcurl_element_related_01_1.jpg"),
    (525, "MB10", "Element+ Abductor", "glutes", "selectorized", "hip_abduction",
     f"{INNOVFIT}/abductor_element_related_01.jpg"),
    (526, "MB05", "Element+ Adductor", "legs", "selectorized", "hip_adduction",
     None),  # discontinued, no image
    (527, "MB75", "Element+ Glute", "glutes", "selectorized", "glute_kickback",
     f"{INNOVFIT}/MB75_glute_element_related_01_1.jpg"),
    (528, "MB55", "Element+ Arm Curl", "arms", "selectorized", "bicep_curl",
     f"{INNOVFIT}/MB55_armcurl_element_related_01_1.jpg"),
    (529, "MB60", "Element+ Arm Extension", "arms", "selectorized", "tricep_extension",
     f"{INNOVFIT}/MB60_armextension_element_related_01_1.jpg"),
    (530, "MB65", "Element+ Abdominal Crunch", "core", "selectorized", "crunch",
     f"{INNOVFIT}/MB65_abdominalcrunch_element_related_01_1.jpg"),
    (531, "MB45", "Element+ Lower Back", "core", "selectorized", "back_extension",
     f"{INNOVFIT}/MB45_lowerback_element_related_01_3.jpg"),

    # === BIOSTRENGTH (Smart Selectorized) ===
    (532, "MM70", "Biostrength Chest Press", "chest", "selectorized", "chest_press",
     f"{TG_CDN}/product/MM70/Biostrength-chest-press.jpg"),
    (533, "MM13", "Biostrength Pectoral", "chest", "selectorized", "chest_fly",
     f"{TG_CDN}/product/MM13/Biostrength-pectoral-pdp.jpg"),
    (534, "MM31", "Biostrength Reverse Fly", "back", "selectorized", "rear_delt",
     f"{TG_CDN}/product/MM31/Biostrength-reverse-fly-pdp.jpg"),
    (535, "MM69", "Biostrength Shoulder Press", "shoulders", "selectorized", "shoulder_press",
     f"{TG_CDN}/product/MM69/Biostrength-shoulder-press-pdp.jpg"),
    (536, "MM71", "Biostrength Vertical Traction", "back", "selectorized", "lat_pulldown",
     f"{TG_CDN}/product/MM71/Biostrength-vertical-traciotn-pdpjpg.jpg"),
    (537, "MM80", "Biostrength Low Row", "back", "selectorized", "low_row",
     f"{TG_CDN}/product/MM80/Biostrength-low-row-pdp.jpg"),
    (538, "MM51", "Biostrength Leg Press", "legs", "selectorized", "leg_press",
     f"{TG_CDN}/product/MM51/Biostrength-leg-press-pdp.jpg"),
    (539, "MM91", "Biostrength Leg Extension", "legs", "selectorized", "leg_extension",
     f"{TG_CDN}/product/MM91/Biostrength-leg-extension-pdp.jpg"),
    (540, "MM90", "Biostrength Leg Curl", "legs", "selectorized", "leg_curl",
     f"{TG_CDN}/product/MM90/Biostrength-leg-curl-pdp.jpg"),
    (541, "MM18", "Biostrength Abductor", "glutes", "selectorized", "hip_abduction",
     f"{TG_CDN}/product/MM18/Biostrength-Abductor_pdp.jpg"),
    (542, "MM17", "Biostrength Adductor", "legs", "selectorized", "hip_adduction",
     f"{TG_CDN}/product/MM17/Biostrength-Adductor_pdp.jpg"),
    (543, "MM92", "Biostrength Arm Curl", "arms", "selectorized", "bicep_curl",
     f"{TG_CDN}/product/MM92/Biostrength-Arm-curl-pdp.jpg"),
    (544, "MM45", "Biostrength Arm Extension", "arms", "selectorized", "tricep_extension",
     f"{TG_CDN}/product/MM45/Biostrength-Arm-Extension-pdp.jpg"),
    (545, "MM58", "Biostrength Lower Back", "core", "selectorized", "back_extension",
     f"{TG_CDN}/product/MM58/Biostrength-lowerback-pdp.jpg"),
    (546, "MM83", "Biostrength Total Abdominal", "core", "selectorized", "crunch",
     f"{TG_CDN}/product/MM83/Biostrength-total-abdominal-pdp.jpg"),

    # === KINESIS (Functional Trainers) ===
    (547, "M5800", "Kinesis One", "full_body", "functional", "cable_multi",
     f"{TG_CDN}/product/M5800-AN19GZ/kinesis_one_bg_white.jpg"),

    # === PLURIMA (Multi-Station) ===
    (548, "MF25", "Plurima Tower", "full_body", "functional", "cable_multi",
     f"{INNOVFIT}/plurimatower_hero.jpg"),
    (549, "MF30", "Plurima Wall", "full_body", "functional", "cable_multi",
     f"{INNOVFIT}/MF30_wall_plurimamultistation_related_01_1.jpg"),
]

BRAND = "Technogym"


def download_image(url, local_path):
    """Download image from URL to local path."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200 and len(r.content) > 1000:
            with open(local_path, "wb") as f:
                f.write(r.content)
            return True
        else:
            print(f"  SKIP (status={r.status_code}, size={len(r.content)}): {url}")
            return False
    except Exception as e:
        print(f"  ERROR downloading {url}: {e}")
        return False


def upload_to_storage(local_path, storage_path):
    """Upload file to Supabase Storage."""
    content_type = "image/jpeg" if local_path.endswith(".jpg") else "image/png"
    with open(local_path, "rb") as f:
        data = f.read()

    r = requests.post(
        f"{STORAGE_URL}/{storage_path}",
        headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true",
        },
        data=data,
        timeout=30,
    )
    if r.status_code in (200, 201):
        return f"{PUBLIC_URL}/{storage_path}"
    else:
        print(f"  Upload failed ({r.status_code}): {r.text[:200]}")
        return None


def run_sql(query):
    """Execute SQL via Supabase Management API."""
    r = requests.post(
        DB_URL,
        headers={
            "Authorization": f"Bearer {MGMT_TOKEN}",
            "Content-Type": "application/json",
        },
        json={"query": query},
        timeout=30,
    )
    if r.status_code == 201:
        return r.json()
    else:
        print(f"  SQL error ({r.status_code}): {r.text[:300]}")
        return None


def main():
    print(f"Processing {len(EQUIPMENT)} Technogym machines...")

    success = 0
    no_image = 0
    failed = 0
    sql_values = []

    for idx, (eq_id, model, name, muscle, eq_type, ex_type, img_url) in enumerate(EQUIPMENT):
        print(f"\n[{idx+1}/{len(EQUIPMENT)}] {model} - {name}")

        image_public_url = None

        if img_url:
            ext = "jpg"
            local_file = os.path.join(TEMP_DIR, f"{model}.{ext}")
            storage_path = f"technogym/{model}.{ext}"

            if download_image(img_url, local_file):
                uploaded_url = upload_to_storage(local_file, storage_path)
                if uploaded_url:
                    image_public_url = uploaded_url
                    print(f"  OK: {uploaded_url}")
                    success += 1
                else:
                    failed += 1
            else:
                failed += 1
        else:
            print("  No source image available")
            no_image += 1

        # Escape single quotes in name
        safe_name = name.replace("'", "''")
        img_val = f"'{image_public_url}'" if image_public_url else "NULL"

        sql_values.append(
            f"({eq_id}, '{BRAND}', '{model}', '{safe_name}', '{muscle}', '{eq_type}', '{ex_type}', {img_val})"
        )

        # Rate limit
        time.sleep(0.3)

    # Insert all records
    print(f"\n\n=== Inserting {len(sql_values)} records into equipment_catalog ===")

    # Split into batches of 20
    batch_size = 20
    for i in range(0, len(sql_values), batch_size):
        batch = sql_values[i:i+batch_size]
        sql = (
            "INSERT INTO equipment_catalog (id, brand, model, name, muscle_group, equipment_type, exercise_type, image_url) VALUES\n"
            + ",\n".join(batch)
            + "\nON CONFLICT (id) DO UPDATE SET brand=EXCLUDED.brand, model=EXCLUDED.model, name=EXCLUDED.name, "
            "muscle_group=EXCLUDED.muscle_group, equipment_type=EXCLUDED.equipment_type, "
            "exercise_type=EXCLUDED.exercise_type, image_url=EXCLUDED.image_url;"
        )
        result = run_sql(sql)
        if result is not None:
            print(f"  Batch {i//batch_size + 1}: OK ({len(batch)} records)")
        else:
            print(f"  Batch {i//batch_size + 1}: FAILED")
        time.sleep(0.5)

    print(f"\n=== Done ===")
    print(f"Images: {success} uploaded, {no_image} no source, {failed} failed")
    print(f"Total records: {len(EQUIPMENT)}")

    # Generate SQL file for backup
    sql_file = os.path.join(os.path.dirname(__file__), "insert_technogym.sql")
    with open(sql_file, "w") as f:
        f.write(f"-- Technogym equipment catalog\n")
        f.write(f"-- Generated {time.strftime('%Y-%m-%d')}\n")
        f.write(f"-- {len(EQUIPMENT)} records\n\n")
        f.write("INSERT INTO equipment_catalog (id, brand, model, name, muscle_group, equipment_type, exercise_type, image_url) VALUES\n")
        f.write(",\n".join(sql_values))
        f.write(";\n")
    print(f"SQL backup saved to: {sql_file}")


if __name__ == "__main__":
    main()
