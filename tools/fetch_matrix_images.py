"""
Fetch Matrix Fitness equipment images from jhtassets.com CDN,
upload to Supabase Storage, and update the database.
"""
import requests
import time
import os

# --- Configuration ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"

HEADERS_UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}

# --- Known image URLs for Matrix models ---
# Source: images.jhtassets.com/uploads/ (Johnson Health Tech CDN)
# Tested 2026-03-23 - these return HTTP 200

JHTASSETS_BASE = "https://images.jhtassets.com/uploads"

# model -> (filename on CDN, extension)
# Some models have color suffixes (-PT = Polarized Titanium, plain = default color)
KNOWN_IMAGES = {
    # Ultra Series (G7-S)
    "G7-S13": "G7-S13-PT.jpg",
    "G7-S21": "G7-S21.jpg",
    "G7-S23": "G7-S23.jpg",
    "G7-S34": "G7-S34.jpg",
    "G7-S40": "G7-S40.jpg",
    "G7-S42": "G7-S42.jpg",
    "G7-S51": "G7-S51.jpg",
    "G7-S52": "G7-S52.jpg",
    "G7-S55": "G7-S55.jpg",
    "G7-S72": "G7-S72.jpg",
    "G7-S73": "G7-S73.jpg",
    "G7-S74": "G7-S74.jpg",
    "G7-S75": "G7-S75.jpg",
    "G7-S77": "G7-S77.jpg",
    "G7-S78": "G7-S78.jpg",
    # Versa Series (VS-S)
    "VS-S33": "VS-S33.jpg",
    "VS-S53": "VS-S53.jpg",
    "VS-S78": "VS-S78.jpg",
    "VS-S601": "VS-S601.jpg",
    # Aura Series (G3-S)
    "G3-S13": "G3-S13.jpg",
    "G3-S21": "G3-S21.jpg",
    "G3-S22": "G3-S22.jpg",
    "G3-S23": "G3-S23.jpg",
    "G3-S31": "G3-S31.jpg",
    "G3-S33": "G3-S33.jpg",
    "G3-S40": "G3-S40.jpg",
    "G3-S42": "G3-S42.jpg",
    "G3-S51": "G3-S51.jpg",
    "G3-S60": "G3-S60.jpg",
    "G3-S70": "G3-S70.jpg",
    "G3-S71": "G3-S71.jpg",
    "G3-S72": "G3-S72.jpg",
    "G3-S74": "G3-S74.jpg",
    "G3-S75": "G3-S75.jpg",
    # Magnum Plate-Loaded (MG-PL)
    "MG-PL12": "MG-PL12.jpg",
    "MG-PL13": "MG-PL13.jpg",
    "MG-PL14": "MG-PL14.jpg",
    "MG-PL23": "MG-PL23.jpg",
    "MG-PL33": "MG-PL33.jpg",
    "MG-PL34": "MG-PL34.jpg",
    "MG-PL50": "MG-PL50.jpg",
    "MG-PL62": "MG-PL62.jpg",
    "MG-PL70": "MG-PL70.jpg",
    "MG-PL71": "MG-PL71.jpg",
    "MG-PL77": "MG-PL77.jpg",
    "MG-PL78": "MG-PL78.jpg",
    "MG-PL79": "MG-PL79.jpg",
}

# Fallback: for models without jhtassets images, use similar model's image
# (same machine type, different series → visually similar enough)
FALLBACK_IMAGES = {
    # Ultra missing → use Aura equivalent
    "G7-S12": "G3-S22.jpg",    # Pec Fly → Aura Rear Delt/Pec Fly
    "G7-S33": "G3-S33.jpg",    # Lat Pulldown → Aura Lat Pulldown
    "G7-S70": "G3-S70.jpg",    # Leg Press → Aura Leg Press
    "G7-S71": "G3-S71.jpg",    # Leg Extension → Aura Leg Extension
    # Versa missing → use Aura/Ultra equivalent
    "VS-S13": "G3-S13.jpg",    # Chest Press
    "VS-S22": "G3-S22.jpg",    # Pec Fly
    "VS-S23": "G3-S23.jpg",    # Shoulder Press
    "VS-S34": "G3-S31.jpg",    # Seated Row
    "VS-S40": "G3-S40.jpg",    # Biceps Curl
    "VS-S42": "G3-S42.jpg",    # Triceps
    "VS-S52": "G7-S52.jpg",    # Back Extension
    "VS-S70": "G3-S70.jpg",    # Leg Press
    "VS-S71": "G3-S71.jpg",    # Leg Extension
    "VS-S72": "G3-S72.jpg",    # Seated Leg Curl
    "VS-S74": "G3-S74.jpg",    # Hip Ab/Adductor
    # Versa Dual missing → use closest single station
    "VS-S131": "G3-S13.jpg",   # Multi Press → Chest Press
    "VS-S331": "G3-S33.jpg",   # Lat/Row combo → Lat Pulldown
    "VS-S401": "G3-S40.jpg",   # Bicep/Tricep → Biceps Curl
    "VS-S531": "G3-S51.jpg",   # Ab/Back → Abdominal
    "VS-S711": "G3-S71.jpg",   # Leg Ext/Curl → Leg Extension
    # Aura missing → use Ultra equivalent
    "G3-S52": "G7-S52.jpg",    # Back Extension
    "G3-S76": "G3-S74.jpg",    # Rotary Hip → Hip Adductor (close)
    "G3-S78": "G7-S78.jpg",    # Glute
    # Magnum missing
    "MG-PL15": "MG-PL14.jpg",  # Decline → Incline (similar form)
    "MG-PL38": "MG-PL34.jpg",  # Low Row → Seated Row (similar)
    "MG-PL76": "MG-PL77.jpg",  # Standing Calf → Seated Calf
    # Functional trainers → no fallback available, skip
    # Varsity → no images available, skip
}

# --- Step 1: Get Matrix equipment from DB ---
print("=" * 60)
print("Step 1: Querying database for Matrix equipment without images...")
print("=" * 60)

r = requests.post(DB_URL, headers={
    "Authorization": f"Bearer {MGMT_TOKEN}",
    "Content-Type": "application/json"
}, json={"query": "SELECT id, model, name FROM equipment_catalog WHERE brand = 'Matrix' AND image_url IS NULL ORDER BY id;"})

equipment = r.json()
print(f"Found {len(equipment)} Matrix items without images:")
for eq in equipment:
    print(f"  id={eq['id']} model={eq['model']} name={eq['name']}")

# --- Step 2: Download and upload images ---
print("\n" + "=" * 60)
print("Step 2: Downloading images and uploading to Supabase Storage...")
print("=" * 60)

success_count = 0
fail_count = 0
skip_count = 0
results = []  # (id, model, storage_filename)

for eq in equipment:
    model = eq["model"]
    db_id = eq["id"]

    # Determine source URL
    if model in KNOWN_IMAGES:
        cdn_file = KNOWN_IMAGES[model]
        source_type = "primary"
    elif model in FALLBACK_IMAGES:
        cdn_file = FALLBACK_IMAGES[model]
        source_type = "fallback"
    else:
        print(f"  SKIP {model} (id={db_id}) - no image source available")
        skip_count += 1
        continue

    source_url = f"{JHTASSETS_BASE}/{cdn_file}"
    storage_filename = f"{model}.jpg"
    content_type = "image/jpeg"

    print(f"\n  [{model}] Downloading ({source_type})...")
    try:
        img_resp = requests.get(source_url, headers=HEADERS_UA, timeout=30)
        if img_resp.status_code != 200:
            print(f"    FAIL download: HTTP {img_resp.status_code}")
            fail_count += 1
            continue
        img_data = img_resp.content
        print(f"    Downloaded {len(img_data)} bytes")

        if len(img_data) < 1000:
            print(f"    SKIP - image too small ({len(img_data)} bytes), likely error")
            fail_count += 1
            continue

    except Exception as e:
        print(f"    FAIL download: {e}")
        fail_count += 1
        continue

    # Upload to Supabase Storage
    upload_path = f"matrix/{storage_filename}"
    upload_url = f"{STORAGE_URL}/{upload_path}"
    print(f"    Uploading to {upload_path}...")

    try:
        up_resp = requests.put(upload_url, headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true",
        }, data=img_data, timeout=30)

        if up_resp.status_code in (200, 201):
            print(f"    Uploaded OK ({up_resp.status_code})")
            results.append((db_id, model, storage_filename))
            success_count += 1
        else:
            print(f"    FAIL upload: HTTP {up_resp.status_code} -> {up_resp.text[:200]}")
            fail_count += 1
    except Exception as e:
        print(f"    FAIL upload: {e}")
        fail_count += 1

    # Small delay to be polite
    time.sleep(0.3)

print(f"\n  Uploaded: {success_count}, Failed: {fail_count}, Skipped: {skip_count}")

# --- Step 3: Update database with image URLs ---
print("\n" + "=" * 60)
print("Step 3: Updating database with image URLs...")
print("=" * 60)

update_count = 0
for db_id, model, filename in results:
    public_image_url = f"{PUBLIC_URL}/matrix/{filename}"
    sql = f"UPDATE equipment_catalog SET image_url = '{public_image_url}' WHERE id = {db_id};"

    try:
        resp = requests.post(DB_URL, headers={
            "Authorization": f"Bearer {MGMT_TOKEN}",
            "Content-Type": "application/json"
        }, json={"query": sql})

        if resp.status_code in (200, 201):
            print(f"  OK: {model} (id={db_id}) -> {public_image_url}")
            update_count += 1
        else:
            print(f"  FAIL: {model} (id={db_id}) -> HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"  FAIL: {model} (id={db_id}) -> {e}")

print(f"\n{'=' * 60}")
print(f"DONE! Updated {update_count}/{len(results)} records.")
print(f"  Images uploaded: {success_count}")
print(f"  Images not found: {skip_count}")
print(f"  Errors: {fail_count}")
print(f"  DB records updated: {update_count}")
print(f"{'=' * 60}")
