"""Fetch missing Advanced Line images from puremuscleathletics.com"""
import requests, time, os, tempfile

SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TD = tempfile.mkdtemp(prefix="nt_adv_")
PMA = "https://puremuscleathletics.com/cdn/shop/files"
IMGS = {
    # 13 new machines found on puremuscleathletics
    "ADV-CDA": f"{PMA}/ScreenShot2024-04-15at3.46.30PM.png?v=1713210398",
    "ADV-LR": f"{PMA}/ScreenShot2024-04-15at3.51.48PM.png?v=1713210716",
    "ADV-SLR": f"{PMA}/ScreenShot2024-04-15at3.57.19PM.png?v=1713211047",
    "OH-AB": f"{PMA}/ScreenShot2024-04-10at6.50.24PM.png?v=1712789433",
    "F-RC": f"{PMA}/ScreenShot2024-04-10at6.27.03PM.png?v=1712788030",
    "F-BLR": f"{PMA}/ScreenShot2024-04-15at5.55.29PM.png?v=1713218140",
    "R-SMH": f"{PMA}/ScreenShot2024-04-10at6.32.20PM.png?v=1712788349",
    "R-SMV": f"{PMA}/ScreenShot2024-04-10at6.30.58PM.png?v=1712788266",
    "F-TD": f"{PMA}/ScreenShot2024-04-10at6.37.50PM.png?v=1712788678",
    "F-MLR": f"{PMA}/ScreenShot2024-04-10at6.39.04PM.png?v=1712788752",
    "F-BOB": f"{PMA}/ScreenShot2024-04-15at4.30.54PM.png?v=1713213062",
    "F-PCB": f"{PMA}/ScreenShot2024-04-10at6.25.37PM.png?v=1712787944",
    "F-MOB": f"{PMA}/ScreenShot2024-04-10at6.45.05PM.png?v=1712789112",
}
ok = 0
for m, u in IMGS.items():
    ext = "jpg" if ".jpg" in u else "png"
    p = os.path.join(TD, f"{m}.{ext}")
    r = requests.get(u, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
    if r.status_code != 200 or len(r.content) < 1024:
        print(f"SKIP {m}: {r.status_code}")
        continue
    open(p, "wb").write(r.content)
    ct = "image/jpeg" if ext == "jpg" else "image/png"
    sp = f"newtech/{m}.{ext}"
    r2 = requests.post(f"{STORAGE_URL}/{sp}", headers={"Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": ct, "x-upsert": "true"}, data=open(p, "rb").read(), timeout=30)
    if r2.status_code not in (200, 201):
        print(f"UPLOAD FAIL {m}")
        continue
    pub = f"{PUBLIC_URL}/{sp}"
    r3 = requests.post(DB_URL, headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"}, json={"query": f"UPDATE equipment_catalog SET image_url = '{pub}' WHERE brand = 'Newtech' AND model = '{m}';"}, timeout=30)
    ok += 1 if r3.status_code == 201 else 0
    print(f"{'OK' if r3.status_code == 201 else 'DB FAIL'} {m} ({len(r.content)//1024}KB)")
    time.sleep(0.3)
print(f"\nDone: {ok}/{len(IMGS)}")
