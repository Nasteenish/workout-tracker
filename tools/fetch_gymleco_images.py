"""
Fetch Gymleco product images from Shopify CDN, upload to Supabase Storage,
and insert records into equipment_catalog table.
"""
import requests
import time
import os

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL  = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL      = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TEMP_DIR    = "/tmp/gymleco_images"

CDN_BASE = "https://cdn.shopify.com/s/files/1/0850/4147/9946/files"

# (db_id, model, name, muscle_group, equipment_type, exercise_type, cdn_filename)
MACHINES = [
    # --- Plate Loaded 010–167 ---
    (1408, '010',  'Seated Row',                           'back',      'plate-loaded', 'seated_row',                                       'seated-row-010-gymleco-free-weight-gym-machine-sittande-rodd-friviktsmaskin_98967992-5f61-4d7f-85c1-a2f333255b9d.jpg'),
    (1409, '011',  'Iso Lateral Pulldown',                 'back',      'plate-loaded', 'lat_pulldown',                                     '011-iso-lateral-pulldown-latsdrag_1.webp'),
    (1410, '012',  'Iso Lateral Low Row',                  'back',      'plate-loaded', 'low_row',                                          'Gi-012-2.jpg'),
    (1411, '013',  'Iso Lateral High Row',                 'back',      'plate-loaded', 'high_row',                                         'Gi-013.jpg'),
    (1412, '017',  'D.Y. Row',                             'back',      'plate-loaded', 'seated_row',                                       '017D.Y.Row.png'),
    (1413, '020',  'Lateral Incline Bench Press',          'chest',     'plate-loaded', 'incline_press',                                    'Gi-020-1.jpg'),
    (1414, '021',  'Seated Chest Press',                   'chest',     'plate-loaded', 'chest_press',                                      '021-seated-chest-press.png'),
    (1415, '022',  'ISO Lateral Bench Press, Horizontal',  'chest',     'plate-loaded', 'chest_press',                                      'Gi-022-1.jpg'),
    (1416, '023',  'Incline Pec Fly',                      'chest',     'plate-loaded', 'chest_fly',                                        '023.jpg'),
    (1417, '027',  'Decline Chest Press',                  'chest',     'plate-loaded', 'decline_press',                                    '027_Decline_Chest_Press.png'),
    (1418, '028',  'Standing Chest Press',                 'chest',     'plate-loaded', 'chest_press',                                      '028028StandingChestPress.png'),
    (1419, '029',  'Incline Press / Chest Flyes',          'chest',     'plate-loaded', 'incline_press,chest_fly',                          '029.png'),
    (1420, '030',  'Shoulder Press',                       'shoulders', 'plate-loaded', 'shoulder_press',                                   '030-Shoulder-Press-axelpress-plate-loaded-gym-machine-friviktsmaskin-gymleco.jpg'),
    (1421, '031',  'Shoulder Rotation',                    'shoulders', 'plate-loaded', 'lateral_raise',                                    '031_Shoulder_Rotation.png'),
    (1422, '032',  'Upright Row',                          'shoulders', 'plate-loaded', 'lateral_raise,shrug',                              '032-Upright-Row-Vertikal-Rodd-Friviktsmaskin-Plate-Loaded-gymleco-machine.jpg'),
    (1423, '038',  'Viking Press',                         'shoulders', 'plate-loaded', 'shoulder_press',                                   'Gi-038.jpg'),
    (1424, '040',  'Leg Extension',                        'legs',      'plate-loaded', 'leg_extension',                                    '040.png'),
    (1425, '041',  'Leg Curl, Seated',                     'legs',      'plate-loaded', 'seated_leg_curl',                                  'Gi-041-2.jpg'),
    (1426, '042',  'Standing Leg Curl',                    'legs',      'plate-loaded', 'standing_leg_curl',                                'Gi-042-2.jpg'),
    (1427, '043',  'Hip Press',                            'legs',      'plate-loaded', 'leg_press',                                        '043-leg-press-1.jpg'),
    (1428, '044',  'V-Squat, Plate Loaded',                'legs',      'plate-loaded', 'squat',                                            '044.png'),
    (1429, '045',  'Pendulum Squat',                       'legs',      'plate-loaded', 'squat',                                            'pendulum-squat-045-gymleco-plate-loaded-gym-machine-friviktsmaskin.jpg'),
    (1430, '046',  'Donkey Raise',                         'legs',      'plate-loaded', 'calf',                                             '046-donkey-raise-gymleco-plate-loaded-machine-friviktsmaskin-vadpress.jpg'),
    (1431, '047',  'Tibia Dorsi Flexion',                  'legs',      'plate-loaded', 'tibial_raise',                                     '047-Tibia-Dorsi-Flexion-plate-loaded-gym-machine-friviktsmaskin-gymleco.jpg'),
    (1432, '050',  'Biceps Curl Machine',                  'arms',      'plate-loaded', 'bicep_curl',                                       'Gi-050.jpg'),
    (1433, '051',  'Iso Lateral Triceps',                  'arms',      'plate-loaded', 'tricep_extension',                                 'Gi-051-1.jpg'),
    (1434, '055',  'Dip Press',                            'arms',      'plate-loaded', 'tricep_dip',                                       'Gi-055.jpg'),
    (1435, '060',  'Glute Kickback',                       'glutes',    'plate-loaded', 'glute_kickback',                                   '060-gluteus-one-leg-kick.jpg'),
    (1436, '061',  'Reverse Hyper',                        'back',      'plate-loaded', 'reverse_hyper',                                    'Gi-061.jpg'),
    (1437, '062',  'Standing Abductor, Plate Loaded',      'legs',      'plate-loaded', 'hip_abduction',                                    '062-standing-abductor-Staende-Abduktor-Friviktsmaskin-plate-loaded-machine-gymleco.jpg'),
    (1438, '063',  'Reverse Hyper Pendulum',               'back',      'plate-loaded', 'reverse_hyper',                                    '062-reverse-hyper-pendulum.jpg'),
    (1439, '066',  'Hip Thrust',                           'glutes',    'plate-loaded', 'hip_thrust',                                       'Gi-066.02.jpg'),
    (1440, '070',  'Seated Abs Machine',                   'core',      'plate-loaded', 'crunch',                                           'Gi-070.-1.jpg'),
    (1441, '072',  'Ab Roll Up',                           'core',      'plate-loaded', 'crunch',                                           'Gi-072.jpg'),
    (1442, '082',  'Belt Squat Machine',                   'legs',      'plate-loaded', 'squat',                                            'Gi-082.jpg'),
    (1443, '083',  'Deadlift / Squat Machine',             'legs',      'plate-loaded', 'squat,deadlift',                                   'Gi-083-1.jpg'),
    (1444, '115',  'T-Bar Row',                            'back',      'plate-loaded', 'seated_row',                                       '115-1.jpg'),
    (1445, '116',  'Incline T-Bar Row',                    'back',      'plate-loaded', 'seated_row',                                       '116_Incline_T-Bar_Row.jpg'),
    (1446, '145',  'Seated Calf Press',                    'legs',      'plate-loaded', 'calf',                                             'Gi-145.jpg'),
    (1447, '167',  'Glute Bridge',                         'glutes',    'plate-loaded', 'hip_thrust',                                       '167GluteBridge02.png'),

    # --- Cable Stations 210–255 ---
    (1448, '210',  'Seated Row',                           'back',      'cable',        'seated_row',                                       '210.jpg'),
    (1449, '211',  'Lateral Pulldown',                     'back',      'cable',        'lat_pulldown',                                     '211.jpg'),
    (1450, '211R', 'Lateral Pulldown, Adjustable',         'back',      'cable',        'lat_pulldown',                                     '211R-gymleco-back-machine-ryggmaskin-lats.jpg'),
    (1451, '214',  'Lateral Pulldown/Seated Row',          'back',      'cable',        'lat_pulldown,seated_row',                          'Gi-214-1-1.jpg'),
    (1452, '215',  'Four Station Multi Gym',               'back',      'cable',        'lat_pulldown,seated_row,chest_dip,tricep_dip',     '215_1.jpg'),
    (1453, '215K', 'Multi Gym / Four Station with Cable Cross', 'back', 'cable',        'lat_pulldown,seated_row,chest_fly,cable_multi',    'Gi-215K.png'),
    (1454, '225',  'Cable Crossover Multi Gym',            'chest',     'cable',        'chest_fly,cable_multi',                            '225CableCrossoverMultiGym.png'),
    (1455, '225B', 'Half Cable Cross',                     'chest',     'cable',        'chest_fly,cable_multi',                            '225BHalfofaCableCross.png'),
    (1456, '226',  'Dual Adjustable Pulley',               'full_body', 'cable',        'cable_multi',                                      'Gymleco_226_Dual_Adjustable_Pulley.png'),
    (1457, '243',  'Leg Press 45°',                        'legs',      'plate-loaded', 'leg_press',                                        '243LegPress45.png'),
    (1458, '244',  'Hacklift',                             'legs',      'plate-loaded', 'hack_squat',                                       '244Hacklift.png'),
    (1459, '245',  'Leg Press / Hacklift',                 'legs',      'plate-loaded', 'leg_press,hack_squat',                             '245-Gymleco-Leg-Press-Hack-Lift_setting1.jpg'),
    (1460, '251',  'Triceps Pushdown',                     'arms',      'cable',        'tricep_extension',                                 'Gi-251-1-1.jpg'),
    (1461, '255',  'Biceps Curl / Triceps Extension',      'arms',      'cable',        'bicep_curl,tricep_extension',                      '255BicepsCurlTricepsExtension2.png'),

    # --- Smith Machines ---
    (1462, '280',  'Smith Machine',                        'full_body', 'smith',        'smith_machine,squat,shoulder_press,chest_press,incline_press', '280-scaled-1.jpg'),
    (1463, '281',  'Smith Machine with Counterweight',     'full_body', 'smith',        'smith_machine,squat,shoulder_press,chest_press,incline_press', '281-smith-machine.webp'),
    (1464, '285',  'Multi Smith Machine',                  'full_body', 'smith',        'smith_machine,squat,shoulder_press,chest_press,incline_press', 'Gi-285.jpg'),

    # --- Selectorized 310–376 ---
    (1465, '310',  'Seated Row',                           'back',      'selectorized', 'seated_row',                                       'seated-row-310-gymleco-selectorized-gym-machine-sittande-rodd-viktmagasinsmaskin-1.jpg'),
    (1466, '311',  'Iso Lateral Pulldown',                 'back',      'selectorized', 'lat_pulldown',                                     '311.jpg'),
    (1467, '312',  'Iso Lateral Low Row',                  'back',      'selectorized', 'low_row',                                          '312-low-row.webp'),
    (1468, '314',  'Chins / Dips',                         'back',      'selectorized', 'lat_pulldown,chest_dip',                           '314ChinsDips.png'),
    (1469, '320',  'Incline Chest Press',                  'chest',     'selectorized', 'incline_press',                                    '320-incline-chest-press.webp'),
    (1470, '321',  'Seated Wide Chest Press',              'chest',     'selectorized', 'chest_press',                                      '321.png'),
    (1471, '323',  'Seated Pec Deck',                      'chest',     'selectorized', 'chest_fly',                                        'Gi-323-3.jpg'),
    (1472, '324',  'Pullover',                             'back',      'selectorized', 'pullover',                                         'Gi-324.jpg'),
    (1473, '326',  'Standing Pec Fly',                     'chest',     'selectorized', 'chest_fly',                                        '326StandingPecFly.png'),
    (1474, '330',  'Shoulder Press',                       'shoulders', 'selectorized', 'shoulder_press',                                   'Gi-330-1-4.jpg'),
    (1475, '331',  'Shoulder Rotation',                    'shoulders', 'selectorized', 'lateral_raise',                                    'Gi-331.jpg'),
    (1476, '333',  'Rear Deltoid Shoulder',                'shoulders', 'selectorized', 'rear_delt',                                        'Gymleco_333_Rear_Deltoid_Shoulder.jpg'),
    (1477, '334',  'Standing Side Lateral',                'shoulders', 'selectorized', 'lateral_raise',                                    '334StandingSideLateral.png'),
    (1478, '335',  'Rear Deltoid / Pec Deck',              'shoulders', 'selectorized', 'rear_delt,chest_fly',                              'Gi-335.jpg'),
    (1479, '336',  'Shoulder Front Press',                 'shoulders', 'selectorized', 'shoulder_press',                                   '336ShoulderFrontPress01.png'),
    (1480, '340',  'Leg Extension',                        'legs',      'selectorized', 'leg_extension',                                    '340.png'),
    (1481, '340R', 'Leg Extension, Adjustable',            'legs',      'selectorized', 'leg_extension',                                    '340r.png'),
    (1482, '341',  'Seated Leg Curl',                      'legs',      'selectorized', 'seated_leg_curl',                                  'seated-leg-curl-341-selectorized-gym-machine-sittande-larcurl-viktmagasinsmaskin.jpg'),
    (1483, '342',  'Lying Leg Curl',                       'legs',      'selectorized', 'lying_leg_curl',                                   'Gi-342.02.jpg'),
    (1484, '342R', 'Lying Leg Curl, Adjustable',           'legs',      'selectorized', 'lying_leg_curl',                                   '342R_Lying_Leg_Curl_Adjustable.jpg'),
    (1485, '343',  'Seated Leg Press',                     'legs',      'selectorized', 'leg_press',                                        '343SeatedLegPress.png'),
    (1486, '344',  'Horizontal Lying Leg Press',           'legs',      'selectorized', 'leg_press',                                        '344HorizontalLyingLegPress.png'),
    (1487, '345',  'Seated Calf Press',                    'legs',      'selectorized', 'calf',                                             'Gi-345-1-2.jpg'),
    (1488, '347',  'Standing Calf Press',                  'legs',      'selectorized', 'calf',                                             'Gi-347-1-1.png'),
    (1489, '348',  'Seated Calf Press 45°',                'legs',      'selectorized', 'calf',                                             '348-gymleco-seated-calf-press-45-degrees-selectorized-gym-machine-vadpress-45-grader-viktmagasinsmaskin-1.jpg'),
    (1490, '349',  'Leg Extension / Leg Curl',             'legs',      'selectorized', 'leg_extension,seated_leg_curl',                    '349LegExtensionLegCurl_11d198ae-9537-40ff-9a55-7a23646d6b8e.png'),
    (1491, '350',  'Biceps Curl Machine',                  'arms',      'selectorized', 'bicep_curl',                                       'Gi-350-1-4.jpg'),
    (1492, '351',  'Triceps Extension',                    'arms',      'selectorized', 'tricep_extension',                                 'triceps-extension-351-selectorized-gym-machine-gymleco-triceps-viktmagasinsmaskin-back-rest-ryggdyna.jpg'),
    (1493, '354',  'Dips Press / Shoulder Pull',           'arms',      'selectorized', 'tricep_dip,shoulder_press',                        '354-product-Gymleco.jpg'),
    (1494, '355',  'Biceps / Triceps',                     'arms',      'selectorized', 'bicep_curl,tricep_extension',                      '355.jpg'),
    (1495, '360',  'Gluteus, One Leg Kick',                'glutes',    'selectorized', 'glute_kickback',                                   'Gi-360-1-1.jpg'),
    (1496, '362',  'Standing Abductor',                    'legs',      'selectorized', 'hip_abduction',                                    'Gi-362.jpg'),
    (1497, '364',  'Adductor / Abductor',                  'legs',      'selectorized', 'hip_abduction,hip_adduction',                      'Gi-364-3.jpg'),
    (1498, '365A', 'Lumbar / Abdominal',                   'back',      'selectorized', 'crunch,back_extension',                            'Gi-365.jpg'),
    (1499, '365B', 'Lumbar / Abdominal with Armrest',      'back',      'selectorized', 'crunch,back_extension',                            '365B-korsrygg-mage-kombi-med-armstod-viktmagasinsmaskin-lumbar-abdominal-with-armrest-selectorized-gym-machine-gymleco-1-1.jpg'),
    (1500, '369',  'Multihip',                             'legs',      'selectorized', 'hip_abduction,glute_kickback',                     '369-multihip.webp'),
    (1501, '370',  'Seated Abs Machine',                   'core',      'selectorized', 'crunch',                                           'Gi-370-3.jpg'),
    (1502, '375',  'Torso Rotation',                       'core',      'selectorized', 'torso_rotation',                                   'Gi-375-01-2-scaled-1.jpg'),
    (1503, '376',  'Knee Standing Abdominal',              'core',      'selectorized', 'crunch',                                           'Gi-376-02-2.jpg'),

    # --- Cable Cross ---
    (1504, '725',  'Cable Cross, Adjustable 2×75 kg',      'chest',     'cable',        'chest_fly,cable_multi',                            'gymleco-cable-cross-kryssdrag-725.jpg'),
    (1505, '726',  'Dual Adjustable Pulley 2×75 kg',       'full_body', 'cable',        'cable_multi',                                      '726-1-scaled.jpg'),

    # --- Circuit / Rehab 900-series ---
    (1506, '911',  'Pulldown / Shoulder Press',            'back',      'selectorized', 'lat_pulldown,shoulder_press',                      '911-Back-Shoulders-w.-handle-1-1.png'),
    (1507, '921',  'Chest Press / Back',                   'chest',     'selectorized', 'chest_press,seated_row',                           '921-Chest-Back-w.-handle-1.jpg'),
    (1508, '935',  'Pec Deck / Rear Deltoid Shoulder',     'chest',     'selectorized', 'chest_fly,rear_delt',                              '935-Pec-Deck-Shoulders-w.-handle.jpg'),
    (1509, '944',  'Squats / Hacklift',                    'legs',      'selectorized', 'squat,hack_squat',                                 '944-knaboj-Hacklift.jpg'),
    (1510, '949',  'Leg Extension / Leg Curl',             'legs',      'selectorized', 'leg_extension,leg_curl',                           '949-Legcurl-Extension.jpg'),
    (1511, '954',  'Shoulder Lift / Dips',                 'shoulders', 'selectorized', 'shoulder_press,tricep_dip',                        '954-Dips-Shoulder-Pulley-w.-handle.jpg'),
    (1512, '955',  'Biceps / Triceps',                     'arms',      'selectorized', 'bicep_curl,tricep_extension',                      '955.jpg'),
    (1513, '964',  'Abductor / Adductor',                  'legs',      'selectorized', 'hip_abduction,hip_adduction',                      '964-Abductor-Adductor-1.png'),
    (1514, '965',  'Abs / Lower Back',                     'core',      'selectorized', 'crunch,back_extension',                            '965-Lower-Back-Abdominal.png'),
    (1515, '975',  'Waist Rotator',                        'core',      'selectorized', 'torso_rotation',                                   '975-Waist-Rotator-1.png'),
]

CONTENT_TYPES = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
}


def get_ext(filename):
    _, ext = os.path.splitext(filename.lower())
    return ext


def download_image(cdn_filename, local_path):
    url = f"{CDN_BASE}/{cdn_filename}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=headers, timeout=30)
    if r.status_code != 200:
        raise Exception(f"HTTP {r.status_code} for {url}")
    with open(local_path, 'wb') as f:
        f.write(r.content)
    return len(r.content)


def upload_to_storage(local_path, storage_path, ext):
    content_type = CONTENT_TYPES.get(ext, 'image/jpeg')
    url = f"{STORAGE_URL}/{storage_path}"
    headers = {
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': content_type,
        'x-upsert': 'true',
    }
    with open(local_path, 'rb') as f:
        data = f.read()
    r = requests.post(url, headers=headers, data=data, timeout=60)
    if r.status_code not in (200, 201):
        raise Exception(f"Upload failed {r.status_code}: {r.text[:200]}")


def insert_db(rows):
    """Insert all rows in one SQL statement."""
    values = []
    for (db_id, model, name, muscle_group, equipment_type, exercise_type, _, image_url) in rows:
        name_esc     = name.replace("'", "''")
        ex_type_esc  = exercise_type.replace("'", "''")
        image_esc    = image_url.replace("'", "''")
        values.append(
            f"({db_id}, 'Gymleco', '{model}', '{name_esc}', "
            f"'{muscle_group}', '{equipment_type}', '{ex_type_esc}', '{image_esc}')"
        )
    sql = (
        "INSERT INTO equipment_catalog (id, brand, model, name, muscle_group, equipment_type, exercise_type, image_url) VALUES\n"
        + ",\n".join(values)
        + "\nON CONFLICT (id) DO NOTHING;"
    )
    headers = {
        'Authorization': f'Bearer {MGMT_TOKEN}',
        'Content-Type': 'application/json',
    }
    r = requests.post(DB_URL, headers=headers, json={'query': sql}, timeout=30)
    if r.status_code != 200:
        raise Exception(f"DB insert failed {r.status_code}: {r.text[:300]}")
    return r.json()


def main():
    os.makedirs(TEMP_DIR, exist_ok=True)

    rows_for_db = []
    failed = []

    print(f"Processing {len(MACHINES)} Gymleco machines...\n")

    for i, machine in enumerate(MACHINES):
        db_id, model, name, muscle_group, equipment_type, exercise_type, cdn_filename = machine
        ext = get_ext(cdn_filename)
        storage_filename = f"{model}{ext}"
        storage_path = f"gymleco/{storage_filename}"
        local_path = os.path.join(TEMP_DIR, storage_filename)
        public_image_url = f"{PUBLIC_URL}/{storage_path}"

        print(f"[{i+1:3}/{len(MACHINES)}] {model} — {name}")

        try:
            # 1. Download
            size = download_image(cdn_filename, local_path)
            print(f"         ↓ downloaded {size // 1024} KB")

            # 2. Upload to Supabase Storage
            upload_to_storage(local_path, storage_path, ext)
            print(f"         ↑ uploaded → {storage_path}")

            rows_for_db.append((db_id, model, name, muscle_group, equipment_type, exercise_type, cdn_filename, public_image_url))

        except Exception as e:
            print(f"         ✗ ERROR: {e}")
            failed.append((model, str(e)))

        time.sleep(0.3)  # polite rate-limiting

    print(f"\n{'='*60}")
    print(f"Images: {len(rows_for_db)} uploaded, {len(failed)} failed")

    if failed:
        print("\nFailed models:")
        for m, err in failed:
            print(f"  {m}: {err}")

    if rows_for_db:
        print(f"\nInserting {len(rows_for_db)} rows into equipment_catalog...")
        try:
            result = insert_db(rows_for_db)
            print(f"DB insert OK: {result}")
        except Exception as e:
            print(f"DB insert ERROR: {e}")

    print("\nDone!")


if __name__ == '__main__':
    main()
