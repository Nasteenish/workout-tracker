"""
Fetch Etenon Fitness product images from their CDN, upload to Supabase Storage,
and update the equipment_catalog table with image URLs.

Usage: python3 fetch_etenon_images.py
"""
import requests
import time
import json
import urllib.parse
import os
import sys

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TEMP_DIR = "/tmp/etenon_images"

# --- Equipment data: (id, model, cdn_url) ---
# CDN pattern: https://cdn.etenonfitness.com/assets/products/{MODEL}/{filename}-large.jpg
EQUIPMENT = [
    (900, "M5003", "https://cdn.etenonfitness.com/assets/products/M5003/M5003%20-%20Etenon%20Press%20de%20Hombro-large.jpg?v=1"),
    (901, "M5004", "https://cdn.etenonfitness.com/assets/products/M5004/M5004%20-%20Etenon%20Remo%20Sentado-large.jpg?v=1"),
    (902, "PC0101", "https://cdn.etenonfitness.com/assets/products/PC0101/PC0101%20-%20Etenon%20Press%20de%20Pecho%20Vertical-large.jpg?v=1"),
    (903, "PC0102", "https://cdn.etenonfitness.com/assets/products/PC0102/PC0102%20-%20Etenon%20Dual%20Apertura-Deltoides-large.jpg?v=1"),
    (904, "PC0104", "https://cdn.etenonfitness.com/assets/products/PC0104/PC0104%20-%20Etenon%20Press%20de%20Hombros-large.jpg?v=1"),
    (905, "PC0105", "https://cdn.etenonfitness.com/assets/products/PC0105/PC0105%20-%20Etenon%20Vuelo%20Hombros-large.jpg?v=1"),
    (906, "PC0106", "https://cdn.etenonfitness.com/assets/products/PC0106/PC0106%20-%20Etenon%20Jalon-large.jpg?v=1"),
    (907, "PC0107", "https://cdn.etenonfitness.com/assets/products/PC0107/PC0107%20-%20Etenon%20Jalon%20con%20Barra-large.jpg?v=1"),
    (908, "PC0108", "https://cdn.etenonfitness.com/assets/products/PC0108/PC0108%20-%20Etenon%20Remo%20Sentado-large.jpg?v=1"),
    (909, "PC0109", "https://cdn.etenonfitness.com/assets/products/PC0109/PC0109%20-%20Etenon%20Curl%20de%20Biceps-large.jpg?v=1"),
    (910, "PC0110", "https://cdn.etenonfitness.com/assets/products/PC0110/PC0110%20-%20Etenon%20Curl%20de%20Triceps-large.jpg?v=1"),
    (911, "PC0111", "https://cdn.etenonfitness.com/assets/products/PC0111/PC0111%20-%20Etenon%20Dual%20Fondos-Dominadas-large.jpg?v=1"),
    (912, "PC0112", "https://cdn.etenonfitness.com/assets/products/PC0112/PC0112%20-%20Etenon%20Prensa%20de%20Piernas-large.jpg?v=1"),
    (913, "PC0113", "https://cdn.etenonfitness.com/assets/products/PC0113/PC0113%20-%20Etenon%20Extension%20de%20cuadriceps-large.jpg?v=1"),
    (914, "PC0114", "https://cdn.etenonfitness.com/assets/products/PC0114/PC0114%20-%20Etenon%20Femoral%20sentado-large.jpg?v=1"),
    (915, "PC0115", "https://cdn.etenonfitness.com/assets/products/PC0115/PC0115%20-%20Etenon%20Femoral%20tumbado-large.jpg?v=1"),
    (916, "PC0116", "https://cdn.etenonfitness.com/assets/products/PC0116/PC0116%20-%20Etenon%20Abductor-large.jpg?v=1"),
    (917, "PC0117", "https://cdn.etenonfitness.com/assets/products/PC0117/PC0117%20-%20Etenon%20Adductor-large.jpg?v=1"),
    (918, "PC0118", "https://cdn.etenonfitness.com/assets/products/PC0118/PC0118%20-%20Etenon%20Gemelo%20de%20pie-large.jpg?v=1"),
    (919, "PC0120", "https://cdn.etenonfitness.com/assets/products/PC0120/PC0120%20-%20Etenon%20Multicadera-large.jpg?v=1"),
    (920, "PC0123", "https://cdn.etenonfitness.com/assets/products/PC0123/PC0123%20-%20Etenon%20Remo%20bajo-large.jpg?v=1"),
    (921, "PC0131", "https://cdn.etenonfitness.com/assets/products/PC0131/PC0131%20-%20Etenon%20Dual%20Cuadriceps-Femoral%20sentado-large.jpg?v=1"),
    (922, "PC0132", "https://cdn.etenonfitness.com/assets/products/PC0132/PC0132%20-%20Etenon%20Dual%20Abductor-Adductor-large.jpg?v=1"),
    (923, "PC0133", "https://cdn.etenonfitness.com/assets/products/PC0133/PC0133%20-%20Etenon%20Dual%20Polea%20alta-Baja-large.jpg?v=1"),
    (924, "PC0134", "https://cdn.etenonfitness.com/assets/products/PC0134/PC0134%20-%20Etenon%20Dual%20Biceps-Triceps-large.jpg?v=1"),
    (925, "PC0135", "https://cdn.etenonfitness.com/assets/products/PC0135/PC0135%20-%20Etenon%20Dual%20Press%20de%20pecho-Hombro-large.jpg?v=1"),
    (926, "PC0136", "https://cdn.etenonfitness.com/assets/products/PC0136/PC0136%20-%20Etenon%20Dual%20Abdominal-Lumbar-large.jpg?v=1"),
    (927, "PC0195", "https://cdn.etenonfitness.com/assets/products/PC0195/PC0195%20-%20Vuelo%20Hombros%20Laterales%20Press-large.jpg?v=1"),
]

# This is a partial list - the full list is generated programmatically below
# We'll read the complete data from etenon_records.json

def load_full_equipment_list():
    """Load from JSON if available, otherwise use hardcoded EQUIPMENT"""
    json_path = "/tmp/etenon_records.json"
    images_path = "/tmp/etenon_images.txt"

    if os.path.exists(json_path) and os.path.exists(images_path):
        with open(json_path) as f:
            records = json.load(f)

        # Build CDN URL map from images file
        cdn_map = {}
        with open(images_path) as f:
            for line in f:
                parts = line.strip().split('|', 2)
                if len(parts) == 3:
                    cdn_map[parts[0]] = parts[2]

        # PC60 extra CDN URLs
        pc60_cdn = {
            'PC6001': 'https://cdn.etenonfitness.com/assets/products/PC6001/PC6001%20-%20Etenon%20Press%20Vertical-large.jpg',
            'PC6002': 'https://cdn.etenonfitness.com/assets/products/PC6002/PC6002%20-%20Etenon%20Aperturas-large.jpg',
            'PC6003': 'https://cdn.etenonfitness.com/assets/products/PC6003/PC6003%20-%20Etenon%20Remo%20sentado-large.jpg',
            'PC6004': 'https://cdn.etenonfitness.com/assets/products/PC6004/PC6004%20-%20Etenon%20Press%20de%20hombros-large.jpg',
            'PC6006': 'https://cdn.etenonfitness.com/assets/products/PC6006/PC6006%20-%20Etenon%20Jalon%20dorsal-large.jpg',
            'PC6007': 'https://cdn.etenonfitness.com/assets/products/PC6007/PC6007%20-%20Etenon%20Curl%20de%20biceps-large.jpg',
            'PC6008': 'https://cdn.etenonfitness.com/assets/products/PC6008/PC6008%20-%20Etenon%20Fondos%20de%20triceps-large.jpg',
            'PC6009': 'https://cdn.etenonfitness.com/assets/products/PC6009/PC6009%20-%20Etenon%20Prensa%20sentado-large.jpg',
            'PC6010': 'https://cdn.etenonfitness.com/assets/products/PC6010/PC6010%20-%20Etenon%20Extension%20de%20cuadriceps-large.jpg',
            'PC6012': 'https://cdn.etenonfitness.com/assets/products/PC6012/PC6012%20-%20Etenon%20Femoral%20tumbado-large.jpg',
            'PC6013': 'https://cdn.etenonfitness.com/assets/products/PC6013/PC6013%20-%20Etenon%20Dual%20aperturas-Deltoides-large.jpg',
            'PC6016': 'https://cdn.etenonfitness.com/assets/products/PC6016/PC6016%20-%20Etenon%20Contraccion%20Abdominal-large.jpg',
            'PC6019': 'https://cdn.etenonfitness.com/assets/products/PC6019/PC6019%20-%20Etenon%20Dual%20Abductor-Adductor-large.jpg',
            'PC6022': 'https://cdn.etenonfitness.com/assets/products/PC6022/PC6022%20-%20Etenon%20Dual%20Biceps-Triceps-large.jpg',
            'PC6023': 'https://cdn.etenonfitness.com/assets/products/PC6023/PC6023%20-%20Etenon%20Dual%20cuadriceps-Femoral%20sentado-large.jpg',
            'PC6052': 'https://cdn.etenonfitness.com/assets/products/PC6052/PC6052%20-%20Etenon%20Cruce%20de%20poleas-large.jpg',
        }
        cdn_map.update(pc60_cdn)

        result = []
        for r in records:
            cdn_url = cdn_map.get(r['model'], r.get('cdn_url', ''))
            if cdn_url:
                result.append((r['id'], r['model'], cdn_url))
        return result

    return EQUIPMENT


def download_image(url, filepath):
    """Download image from CDN"""
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code == 200 and len(resp.content) > 1000:
        with open(filepath, 'wb') as f:
            f.write(resp.content)
        return True
    return False


def upload_to_storage(filepath, storage_path):
    """Upload image to Supabase Storage"""
    ext = os.path.splitext(filepath)[1].lower()
    content_type = "image/jpeg" if ext in ('.jpg', '.jpeg') else "image/png"

    with open(filepath, 'rb') as f:
        data = f.read()

    url = f"{STORAGE_URL}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    resp = requests.post(url, headers=headers, data=data, timeout=30)
    return resp.status_code in (200, 201)


def update_image_url(eq_id, image_url):
    """Update equipment_catalog image_url via Management API"""
    sql = f"UPDATE equipment_catalog SET image_url = '{image_url}' WHERE id = {eq_id}"
    headers = {
        "Authorization": f"Bearer {MGMT_TOKEN}",
        "Content-Type": "application/json",
    }
    resp = requests.post(DB_URL, headers=headers, json={"query": sql}, timeout=30)
    return resp.status_code == 201


def main():
    os.makedirs(TEMP_DIR, exist_ok=True)

    equipment = load_full_equipment_list()
    print(f"Processing {len(equipment)} equipment items...")

    success = 0
    failed = 0
    skipped = 0

    for eq_id, model, cdn_url in equipment:
        if not cdn_url:
            print(f"  SKIP {model} - no CDN URL")
            skipped += 1
            continue

        # Determine file extension from URL
        url_decoded = urllib.parse.unquote(cdn_url)
        if '.png' in url_decoded.lower():
            ext = '.png'
        else:
            ext = '.jpg'

        local_path = os.path.join(TEMP_DIR, f"{model}{ext}")
        storage_path = f"etenon/{model}{ext}"
        public_image_url = f"{PUBLIC_URL}/{storage_path}"

        try:
            # Download
            if not os.path.exists(local_path):
                if not download_image(cdn_url, local_path):
                    print(f"  FAIL download {model}")
                    failed += 1
                    continue
                time.sleep(0.3)  # be polite

            # Upload
            if not upload_to_storage(local_path, storage_path):
                print(f"  FAIL upload {model}")
                failed += 1
                continue

            # Update DB
            if not update_image_url(eq_id, public_image_url):
                print(f"  FAIL db update {model}")
                failed += 1
                continue

            success += 1
            if success % 10 == 0:
                print(f"  OK {success}/{len(equipment)} (latest: {model})")

        except Exception as e:
            print(f"  ERROR {model}: {e}")
            failed += 1
            continue

    print(f"\nDone! Success: {success}, Failed: {failed}, Skipped: {skipped}")


if __name__ == "__main__":
    main()
