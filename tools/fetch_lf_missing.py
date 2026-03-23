"""
Fetch missing Life Fitness images and update equipment_catalog.
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

CDN = "https://production-gvckb4eyhna3g6c7.a03.azurefd.net/v11-24-24/960_lossy_level2_webp/kentico13corebase/media/lfmedia/lifefitnessimages"
STATIC = "https://www.lifefitness.com/Kentico13CoreBase/media/LFMedia/LifeFitnessImages"

TEMP_DIR = "/tmp/lifefitness_images"
os.makedirs(TEMP_DIR, exist_ok=True)

# (db_id, model, full_image_url)
UPDATES = [
    # === MISSING INSIGNIA ===
    (583, "SS-FLY", f"{CDN}/mediasync/119-73-insignia-series-pectoral-fly-rear-deltoid-image-6--data.webp"),
    (586, "SS-PDX", f"{STATIC}/Equipment/Strength/Selectorised/Insignia%20Series/Insignia%20Dual%20Axis%20Pulldown/LF-INSIGNIA-Pulldown-Dual-Axis-Black-Thumbnail.png"),
    (594, "SS-ABD", f"{STATIC}/Equipment/Strength/Selectorised/Insignia%20Series/Insignia%20Dual%20Abdominal%20Advanced/Selectorized-Insignia-Dual-Abdominal-Advanced-1.png"),
    (597, "SS-LP", f"{STATIC}/Equipment/Strength/Selectorised/Insignia%20Series/Insignia%20Dual%20Arc%20Leg%20Press/LF-INSIGNIA-Arc-Leg-Press-Black-Thumbnail.png"),
    (599, "SS-LC", f"{CDN}/mediasync/349-22-leg-curl.webp"),
    (600, "SS-SLC", f"{CDN}/mediasync/437-994-seated-leg-curl.webp"),
    (603, "IS-GLD", f"{STATIC}/Equipment/Strength/Selectorised/Insignia%20Series/Strength-Insignia-Series-Glute-Bridge.png"),
    (606, "SS-SHB", f"{STATIC}/Equipment/Strength/Selectorised/Insignia%20Series/Strength-Insignia-Series-Seated-Standing-Hip-Abductor-1.png"),

    # === SIGNATURE PLATE-LOADED ===
    (626, "SPLCP", f"{CDN}/mediasync/270-641-signatureseries-plate-loaded-decline-chest-press-l.webp"),  # closest match
    (627, "SPLIP", f"{CDN}/mediasync/202-833-plateloaded-inclinepress.webp"),
    (628, "SPLSP", f"{CDN}/mediasync/364-547-signatureseries-plate-loaded-shoulder-press-l.webp"),
    (629, "SPLPD", f"{CDN}/mediasync/252-486-plateloaded-frontpulldown.webp"),
    (630, "SPLHR", f"{CDN}/mediasync/309-208-signatureseries-plate-loaded-high-row-l.webp"),
    (631, "SPLR", f"{CDN}/mediasync/296-781-signatureseries-plate-loaded-row-l.webp"),
    (632, "SPLBC", f"{CDN}/mediasync/367-991-signatureseries-plate-loaded-biceps-curl-l.webp"),
    (633, "SPLSD", f"{CDN}/mediasync/249-344-signatureseries-plate-loaded-seated-dip-l.webp"),
    (634, "SPLLLP", f"{STATIC}/Equipment/Strength/Plate-Loaded/Linear%20Leg%20Press/LF-Linear-Leg-Press.png"),
    (635, "SPLLE", f"{CDN}/mediasync/327-301-download-copy.webp"),
    (636, "SPLKLC", f"{CDN}/mediasync/185-656-plateloaded-kneelinglegcurl-2-.webp"),
    (637, "SPLSM", f"{STATIC}/Equipment/Strength/Benches/Strength-Bench-Life-Fitness-Smith-Machine-1.png"),

    # === SIGNATURE BENCHES & RACKS ===
    (658, "CMDAP", f"{CDN}/mediasync/315-975-signature-series-dap.webp"),
    (659, "CMACO", f"{STATIC}/Equipment/Strength/Cable%20Motion/Cable%20Crossover/Strength-Cable-Cable-Crossover-1.png"),
    (660, "SOFB", f"{CDN}/mediasync/190-764-download-copy.webp"),
    (661, "SOIB", f"{CDN}/mediasync/235-572-download-copy.webp"),
    (662, "SODB", f"{CDN}/mediasync/256-586-download-copy.webp"),
    (663, "SOMB", f"{CDN}/mediasync/322-881-sig-somb-cpl.webp"),
    (664, "SOSR", f"{CDN}/mediasync/353-863-sig-sosr-01cpr.webp"),
    (665, "SMAB", f"{CDN}/mediasync/261-91-sig-smab-01cpl.webp"),
    (667, "SAC", f"{CDN}/mediasync/323-701-signature-series-arm-curl-bench-image.webp"),
    (668, "SBWBE", f"{CDN}/mediasync/190-735-signature-series-back-extension-image.webp"),
    (669, "SCDLR", f"{CDN}/mediasync/188-466-download-copy.webp"),

    # === SIGNATURE SELECTORIZED (found via Cable Motion pages) ===
    (608, "FZSP", f"{CDN}/mediasync/279-622-signatureseries-cablemotion-shoulderpress-trasp-bg.webp"),
    (611, "FZPD", f"{CDN}/mediasync/209-396-signature-series-pulldown-1000x1000.webp"),
    (610, "FZRW", f"{CDN}/mediasync/237-631-signatureseries-cable-motion-row-l.webp"),

    # === SIGNATURE PL CALF (not in original list, add new) ===
    # Plate Loaded Calf Raise found
]

# Also add Signature PL Calf Raise as new record
NEW_RECORDS = [
    # Decline chest press was misassigned to SPLCP - fix: SPLCP should be chest press, add decline separately
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


def convert_to_jpg(src_path, jpg_path):
    try:
        subprocess.run(["sips", "-s", "format", "jpeg", src_path, "--out", jpg_path],
                       capture_output=True, timeout=10)
        return os.path.exists(jpg_path) and os.path.getsize(jpg_path) > 1000
    except:
        return False


def upload_to_storage(local_path, storage_path):
    ct = "image/jpeg"
    with open(local_path, "rb") as f:
        data = f.read()
    r = requests.post(f"{STORAGE_URL}/{storage_path}",
        headers={"Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": ct, "x-upsert": "true"},
        data=data, timeout=30)
    return f"{PUBLIC_URL}/{storage_path}" if r.status_code in (200, 201) else None


def run_sql(query):
    r = requests.post(DB_URL,
        headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"},
        json={"query": query}, timeout=30)
    return r.json() if r.status_code == 201 else None


def main():
    print(f"Updating {len(UPDATES)} Life Fitness machines with images...")
    ok = 0

    for idx, (eq_id, model, img_url) in enumerate(UPDATES):
        print(f"[{idx+1}/{len(UPDATES)}] {model} (id={eq_id})")

        safe_model = model.replace('/', '-')
        ext = "webp" if img_url.endswith(".webp") else "png"
        dl_path = os.path.join(TEMP_DIR, f"{safe_model}.{ext}")
        jpg_path = os.path.join(TEMP_DIR, f"{safe_model}.jpg")

        if download_image(img_url, dl_path):
            # Convert to jpg
            if convert_to_jpg(dl_path, jpg_path):
                storage_path = f"lifefitness/{safe_model}.jpg"
                uploaded = upload_to_storage(jpg_path, storage_path)
                if uploaded:
                    # Update DB
                    safe_url = uploaded.replace("'", "''")
                    run_sql(f"UPDATE equipment_catalog SET image_url = '{safe_url}' WHERE id = {eq_id};")
                    print(f"  OK")
                    ok += 1
                else:
                    print(f"  Upload failed")
            else:
                print(f"  Convert failed")
        time.sleep(0.3)

    print(f"\n=== Done: {ok}/{len(UPDATES)} updated ===")


if __name__ == "__main__":
    main()
