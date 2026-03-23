"""
Fetch Newtech Wellness product images from Shopify CDN,
upload to Supabase Storage, and insert equipment records.
"""
import requests
import time
import os
import tempfile

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TEMP_DIR = tempfile.mkdtemp(prefix="newtech_")

# Shopify CDN base
CDN = "https://cdn.shopify.com/s/files/1/0625/6171/4264/files"

# --- Image sources: model -> Shopify CDN filename ---
IMAGES = {
    # M-Torture Back
    "T-HR": f"{CDN}/0998a66f7fe3d.png?v=1732086103",
    "T-SR": f"{CDN}/2b5bc091999a9.jpg?v=1732085914",
    "T-FR": f"{CDN}/56ef0d04f3ddf.png?v=1732085963",
    "T-LR2": f"{CDN}/cf9b68a1ee6dd.png?v=1732087498",
    "T-2WR": f"{CDN}/b3d53672ffb9f.png?v=1732086211",
    "T-VPD": f"{CDN}/576e3e12f9f37.png?v=1732086103",
    "T-WPF": f"{CDN}/e340605775f8c.png?v=1732085959",
    "T-WPR2": f"{CDN}/72458547bdbe1.png?v=1732086060",
    # M-Torture Chest
    "T-WCP": f"{CDN}/d852b1c7e8cd9.png?v=1732086337",
    "T-SCP": f"{CDN}/4e0e6226d9ff2.png?v=1732087494",
    "T-ICP": f"{CDN}/16b8574493280.png?v=1732086335",
    "T-CDC": f"{CDN}/02e790ae82f67.png?v=1732086396",
    "T-PDF": f"{CDN}/8541193e3056d.png?v=1732086455",
    # M-Torture Shoulders
    "T-SP": f"{CDN}/e5e9c3ee0013c.png?v=1732086451",
    # M-Torture Arms
    "T-AC": f"{CDN}/d45d43e330971.png?v=1732086639",
    "T-OHE": f"{CDN}/035b1f6d00222.png?v=1732086636",
    # M-Torture Legs
    "T-PLP": f"{CDN}/aacd16c75c98c.png?v=1732086695",
    "T-PLPP": f"{CDN}/Power_Leg_Press_new.png?v=1763593945",
    "T-HS": f"{CDN}/241fac6103690_4e6f404e-997c-4773-a471-6b8b460a862c.png?v=1732086686",
    "T-HSP": f"{CDN}/hack_squat_new.jpg?v=1763594364",
    "T-HP": f"{CDN}/06820a7feadf0.png?v=1732087049",
    "T-DS": f"{CDN}/f69d627a2dc7a.png?v=1732087055",
    "T-BS": f"{CDN}/Belt_squat_new.jpg?v=1763596532",
    "T-SCR": f"{CDN}/6bc4d2c8f21ab.png?v=1732087058",
    "T-LE": f"{CDN}/ac75d7ef0ce6f.png?v=1732087231",
    "T-LC": f"{CDN}/fa322f88ef3e9.png?v=1732087224",
    "T-KLC": f"{CDN}/cd61000e7f267.png?v=1732087229",
    # M-Torture Glutes
    "T-HT": f"{CDN}/hip_thrust_new.jpg?v=1763596283",
    "T-GKB": f"{CDN}/294aa96ba7364.png?v=1732087337",
    "T-GKB2": f"{CDN}/34ab91f3cad05.png?v=1732077678",
    # OnHim Back
    "OH-SR": f"{CDN}/af5a488624e7a_2255ae17-e043-4af2-b032-9b39717b9218.png?v=1732070338",
    "OH-SRO": f"{CDN}/3328249ad0120.png?v=1732078098",
    "OH-SRI": f"{CDN}/540a5ee48489d.png?v=1732078101",
    "OH-LP": f"{CDN}/fe457a5afaa18.png?v=1732070133",
    "OH-SSRC": f"{CDN}/standing_and_seated_row.jpg?v=1764116013",
    # OnHim Chest
    "OH-SCP": f"{CDN}/21fab740ceebc_99f8e5dd-880d-4952-a7ef-04043c247d1e.png?v=1732078556",
    "OH-PDFW": f"{CDN}/aa328f063b4cf.png?v=1732065981",
    "OH-SFCB": f"{CDN}/4c7fc01d22ca6.png?v=1732069188",
    "OH-SD": f"{CDN}/8b477a968e551.png?v=1732077515",
    # OnHim Shoulders
    "OH-SP": f"{CDN}/7bbc36f2b6708.png?v=1732071179",
    "OH-STLR": f"{CDN}/cef87581efb74.png?v=1732071296",
    "OH-SLR": f"{CDN}/7f85e60994a98.png?v=1732071219",
    "OH-SNLR": f"{CDN}/fc36be983d613.png?v=1732072039",
    # OnHim Arms
    "OH-AC": f"{CDN}/7195546d82d32.png?v=1732077498",
    # OnHim Legs
    "OH-SLP": f"{CDN}/79139ece38113.png?v=1732077636",
    "OH-LE": f"{CDN}/cc2cf6b1a882e.png?v=1732077596",
    "OH-LC": f"{CDN}/0d25ee5ba4882.png?v=1732077615",
    "OH-SLC": f"{CDN}/seatedlegcurl.png?v=1764115231",
    "OH-SCR": f"{CDN}/standing_calf_raise_7a64f696-7d8d-48f3-a18b-36c7e2634c61.png?v=1764115600",
    # OnHim Glutes
    "OH-HAC": f"{CDN}/0a343d654654c.png?v=1732077657",
    "OH-HAS": f"{CDN}/418643e8feafe.png?v=1732077643",
    "OH-KHR": f"{CDN}/Kneeling_Hip_Raise_new.jpg?v=1763595720",
    "OH-RH": f"{CDN}/Reverse_Hyper_New.jpg?v=1763595965",
    "OH-GKB": f"{CDN}/34ab91f3cad05.png?v=1732077678",
    # OnHim Core
    "OH-RT": f"{CDN}/890e6294518b8.png?v=1732077528",
    # OnHim Multi
    "OH-CDA": f"{CDN}/f9d11c56ae218.png?v=1732071138",
    "OH-ALP": f"{CDN}/0ac1f0e6814dd_7bae1e13-4d69-498f-9395-71171d5aab9d.png?v=1732071087",
    # Cable
    "C-CCO": f"{CDN}/953ae0118884a.png?v=1732088475",
    "C-DP": f"{CDN}/7681cddf0cd70.png?v=1732088466",
    "C-MP": f"{CDN}/c4fbe944551e4.png?v=1732088470",
    "C-TC": f"{CDN}/c432acad94e95.png?v=1732088461",
    "C-TC6": f"{CDN}/tricable_6_station_17fd0c6c-1ba5-4726-b5ae-58363f4e711b.jpg?v=1764120013",
    "C-MG8": f"{CDN}/136ed128be028.png?v=1732088587",
    # Benches & Specialty
    "F-TBR": f"{CDN}/46f8bd43c239d.png?v=1732084869",
    "F-SCR": f"{CDN}/f9640603fed7d_1.png?v=1732085006",
    "F-GHD": f"{CDN}/6961d356cc86b.png?v=1732084797",
    "F-DLR": f"{CDN}/8a9e28861bc38.png?v=1732084718",
    "F-SU": f"{CDN}/d41f647f614f7.png?v=1732084640",
    # Racks
    "R-3DSH": f"{CDN}/smith_and_half_rack.jpg?v=1764116648",
    "R-3DR": f"{CDN}/3d_rack_560bde27-bd3c-4946-a84f-0b231be4744e.jpg?v=1764117666",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def download_image(model, url):
    """Download image from Shopify CDN."""
    ext = "jpg" if ".jpg" in url else "png"
    path = os.path.join(TEMP_DIR, f"{model}.{ext}")
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200 and len(r.content) > 1024:
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"  OK {model} ({len(r.content)//1024}KB)")
            return path, ext
        else:
            print(f"  SKIP {model}: status={r.status_code} size={len(r.content)}")
            return None, None
    except Exception as e:
        print(f"  ERR {model}: {e}")
        return None, None

def upload_to_supabase(model, path, ext):
    """Upload image to Supabase Storage."""
    content_type = "image/jpeg" if ext == "jpg" else "image/png"
    storage_path = f"newtech/{model}.{ext}"
    url = f"{STORAGE_URL}/{storage_path}"
    with open(path, "rb") as f:
        data = f.read()
    r = requests.post(url, headers={
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }, data=data, timeout=30)
    if r.status_code in (200, 201):
        public = f"{PUBLIC_URL}/{storage_path}"
        print(f"  UPLOADED {storage_path}")
        return public
    else:
        print(f"  UPLOAD FAIL {model}: {r.status_code} {r.text[:200]}")
        return None

def run_sql(query):
    """Execute SQL via Supabase Management API."""
    r = requests.post(DB_URL, headers={
        "Authorization": f"Bearer {MGMT_TOKEN}",
        "Content-Type": "application/json",
    }, json={"query": query}, timeout=30)
    if r.status_code == 201:
        return True
    else:
        print(f"  SQL ERR: {r.status_code} {r.text[:300]}")
        return False

def main():
    print(f"=== Newtech Image Fetcher ===")
    print(f"Temp dir: {TEMP_DIR}")
    print(f"Total images: {len(IMAGES)}")
    print()

    # Phase 1: Download
    print("--- Phase 1: Download from Shopify CDN ---")
    downloaded = {}
    for model, url in IMAGES.items():
        path, ext = download_image(model, url)
        if path:
            downloaded[model] = (path, ext)
        time.sleep(0.3)

    print(f"\nDownloaded: {len(downloaded)}/{len(IMAGES)}")

    # Phase 2: Upload to Supabase Storage
    print("\n--- Phase 2: Upload to Supabase Storage ---")
    uploaded = {}
    for model, (path, ext) in downloaded.items():
        public_url = upload_to_supabase(model, path, ext)
        if public_url:
            uploaded[model] = public_url
        time.sleep(0.2)

    print(f"\nUploaded: {len(uploaded)}/{len(downloaded)}")

    # Phase 3: Update image URLs in DB
    print("\n--- Phase 3: Update image URLs in DB ---")
    for model, url in uploaded.items():
        sql = f"UPDATE equipment_catalog SET image_url = '{url}' WHERE brand = 'Newtech' AND model = '{model}';"
        if run_sql(sql):
            print(f"  DB OK {model}")
        time.sleep(0.1)

    print(f"\n=== Done! {len(uploaded)} images processed ===")

if __name__ == "__main__":
    main()
