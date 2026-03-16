"""
Fetch Precor equipment images from precor.com (Contentful CDN),
upload to Supabase Storage, and update the database.
"""
import requests
import re
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

# --- Step 1: Get equipment list from DB ---
print("=" * 60)
print("Step 1: Querying database for Precor equipment without images...")
print("=" * 60)

r = requests.post(DB_URL, headers={
    "Authorization": f"Bearer {MGMT_TOKEN}",
    "Content-Type": "application/json"
}, json={"query": "SELECT id, model, name FROM equipment_catalog WHERE brand = 'Precor' AND image_url IS NULL ORDER BY id;"})

equipment = r.json()
print(f"Found {len(equipment)} Precor items without images:")
for eq in equipment:
    print(f"  id={eq['id']} model={eq['model']} name={eq['name']}")

# --- Step 2: Scrape Precor website for image URLs ---
print("\n" + "=" * 60)
print("Step 2: Scraping Precor website for product images...")
print("=" * 60)

PRECOR_PAGES = [
    "https://www.precor.com/en-US/strength/selectorized",
    "https://www.precor.com/en-US/strength/selectorized/resolute",
    "https://www.precor.com/en-US/strength/selectorized/vitality",
    "https://www.precor.com/en-US/strength/plate-loaded",
    "https://www.precor.com/en-US/strength/plate-loaded/discovery/all",
    "https://www.precor.com/en-US/strength/benches-and-racks",
    "https://www.precor.com/en-US/strength/benches-and-racks/discovery",
    "https://www.precor.com/en-US/strength/benches-and-racks/vitality",
    "https://www.precor.com/en-US/strength/cable-stations",
    "https://www.precor.com/en-US/strength/cable-stations/FTS",
    "https://www.precor.com/en-US/strength/benches-and-racks/discovery/glute-bridge-bench",
]

# model -> base ctfassets URL (without query params)
model_to_image = {}

for page in PRECOR_PAGES:
    try:
        resp = requests.get(page, headers=HEADERS_UA, timeout=30)
        if resp.status_code != 200:
            print(f"  SKIP {page} -> {resp.status_code}")
            continue

        html = resp.text
        # Extract all ctfassets image URLs (without query params)
        images = re.findall(r'(https://images\.ctfassets\.net/5bv2a78ngtvd/[A-Za-z0-9]+/[a-f0-9]+/[^?\"&\\\s]+)', html)
        count = 0
        for img in images:
            fname = img.split("/")[-1]
            # Match model numbers like DSL0204, RSL0310, DPL0540, DBR0119
            m = re.search(r'(DSL|RSL|DPL|DBR)\d{4}', fname)
            if m:
                model = m.group(0)
                if model not in model_to_image:
                    model_to_image[model] = img
                    count += 1
            # Also match FTS (no number suffix)
            elif fname.startswith("FTS"):
                if "FTS" not in model_to_image:
                    model_to_image["FTS"] = img
                    count += 1

        page_short = page.split("/")[-1] or page.split("/")[-2]
        print(f"  {page_short}: +{count} new models")
    except Exception as e:
        print(f"  ERROR {page}: {e}")

print(f"\nTotal models with images from website: {len(model_to_image)}")

# --- Step 2b: For DSL models, fall back to RSL equivalent if not found ---
# DSL (Discovery Series Line) and RSL (Resolute Series Line) are visually similar
needed_models = {eq["model"] for eq in equipment}

for model in sorted(needed_models):
    if model.startswith("DSL") and model not in model_to_image:
        rsl_model = "RSL" + model[3:]
        if rsl_model in model_to_image:
            model_to_image[model] = model_to_image[rsl_model]
            print(f"  Fallback: {model} -> using {rsl_model} image")

# Report what we can and cannot find
found = [eq for eq in equipment if eq["model"] in model_to_image]
missing = [eq for eq in equipment if eq["model"] not in model_to_image]
print(f"\nCan process: {len(found)} items")
if missing:
    print(f"Cannot find images for {len(missing)} items:")
    for eq in missing:
        print(f"  id={eq['id']} model={eq['model']} name={eq['name']}")

# --- Step 3: Download and upload images ---
print("\n" + "=" * 60)
print("Step 3: Downloading images and uploading to Supabase Storage...")
print("=" * 60)

success_count = 0
fail_count = 0
results = []  # (id, model, storage_filename)

for eq in equipment:
    model = eq["model"]
    db_id = eq["id"]

    if model not in model_to_image:
        print(f"  SKIP {model} (id={db_id}) - no image found")
        fail_count += 1
        continue

    source_url = model_to_image[model]
    # Determine file extension from source
    src_fname = source_url.split("/")[-1]
    ext = os.path.splitext(src_fname)[1].lower()
    if ext in (".avif",):
        # Request as PNG instead via Contentful transform
        download_url = source_url + "?fm=png&w=800&q=85"
        storage_filename = f"{model}.png"
        content_type = "image/png"
    elif ext in (".png",):
        download_url = source_url + "?w=800&q=85"
        storage_filename = f"{model}.png"
        content_type = "image/png"
    elif ext in (".jpg", ".jpeg"):
        download_url = source_url + "?w=800&q=85"
        storage_filename = f"{model}.jpg"
        content_type = "image/jpeg"
    else:
        # Default: request as PNG
        download_url = source_url + "?fm=png&w=800&q=85"
        storage_filename = f"{model}.png"
        content_type = "image/png"

    print(f"\n  [{model}] Downloading from Contentful...")
    try:
        img_resp = requests.get(download_url, headers=HEADERS_UA, timeout=30)
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
    upload_path = f"precor/{storage_filename}"
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

print(f"\n  Uploaded: {success_count}, Failed: {fail_count}")

# --- Step 4: Update database with image URLs ---
print("\n" + "=" * 60)
print("Step 4: Updating database with image URLs...")
print("=" * 60)

update_count = 0
for db_id, model, filename in results:
    public_image_url = f"{PUBLIC_URL}/precor/{filename}"
    sql = f"UPDATE equipment_catalog SET image_url = '{public_image_url}' WHERE id = {db_id};"

    try:
        resp = requests.post(DB_URL, headers={
            "Authorization": f"Bearer {MGMT_TOKEN}",
            "Content-Type": "application/json"
        }, json={"query": sql})

        if resp.status_code == 200 or resp.status_code == 201:
            print(f"  OK: {model} (id={db_id}) -> {public_image_url}")
            update_count += 1
        else:
            print(f"  FAIL: {model} (id={db_id}) -> HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"  FAIL: {model} (id={db_id}) -> {e}")

print(f"\n{'=' * 60}")
print(f"DONE! Updated {update_count}/{len(results)} records.")
print(f"  Images uploaded: {success_count}")
print(f"  Images not found: {fail_count}")
print(f"  DB records updated: {update_count}")
print(f"{'=' * 60}")
