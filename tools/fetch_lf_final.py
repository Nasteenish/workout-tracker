"""Fetch final 19 missing Life Fitness images from reseller sites."""
import requests, time, os, subprocess

SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TD = "/tmp/lifefitness_images"
os.makedirs(TD, exist_ok=True)

MACHINES = [
    (609, "FZPEC", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-281-lfsignaturepecfly_220x220-5-2.jpg"),
    (612, "FZBC", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-270-lfsignaturebicepscurl_220x220-5-2.jpg"),
    (613, "FZTP", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-258-lfsignaturetriceppress4_220x220-5-2.jpg"),
    (614, "FZLR", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-278-lfsignaturelateralraise_220x220-5-2.jpg"),
    (615, "FZAB", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-957-lfsignatureab_220x220-5-2.jpg"),
    (616, "FZTR", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-965-lfsignaturetorsorotation_220x220-5-2.jpg"),
    (617, "FZBE", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-961-lfsignaturebackextension-5-2.jpg"),
    (618, "FZGL", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-382-lfsignatureglute_220x220-5-2.jpg"),
    (619, "FZLE", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-70-lfsignaturelegextension_220x220-5-2.jpg"),
    (620, "FZSLC", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-294-lfsignatureseatedlegcurl_220x220-5-2.jpg"),
    (621, "FZLC", "https://primofitnessusa.com/wp-content/uploads/2023/02/p-291-lfsignaturepronelegcurl_220x220-5-1.jpg"),
    (622, "FZSLP", "https://gym-experts.com/cdn/shop/products/LFSSLegPress-2.jpg?v=1486325767"),
    (623, "FZCE", "https://www.fitnesssuperstore.com/cdn/shop/files/LFSSFZCE-main_grande.webp?v=1762970927"),
    (624, "FZHAD", "https://gym-experts.com/cdn/shop/products/LFSSHIPADD-2T.jpg?v=1486325757"),
    (625, "FZHAB", "https://gym-experts.com/cdn/shop/products/LFSSHIPABD-2.jpg?v=1486325759"),
    (641, "OP-RW", "https://shop.lifefitness.com/cdn/shop/files/axiom-series-seated-row1000x1000-charcoal.jpg?v=1767883986"),
    (645, "OP-LP", "https://shop.lifefitness.com/cdn/shop/files/axiom-series-leg-press-charcoal-black-1000x1000.jpg?v=1748945177"),
    (647, "OP-LC", "https://shop.lifefitness.com/cdn/shop/files/axiom-series-leg-curl1000x1000-charcoal.jpg?v=1767814890"),
    (666, "SADB", "https://shop.lifefitness.com/cdn/shop/files/new-lifefitness-decline-bench-charcoal-black-1000x1000.jpg?v=1748945297"),
]

def main():
    print(f"Fetching {len(MACHINES)} missing images...")
    ok = 0
    for idx, (eq_id, model, url) in enumerate(MACHINES):
        print(f"[{idx+1}/{len(MACHINES)}] {model}")
        ext = "webp" if url.endswith(".webp") or "webp" in url else "jpg"
        dl = os.path.join(TD, f"{model}.{ext}")
        jpg = os.path.join(TD, f"{model}.jpg")

        try:
            r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
            if r.status_code == 200 and len(r.content) > 500:
                with open(dl, "wb") as f: f.write(r.content)
                # Convert to jpg if needed
                if ext != "jpg":
                    subprocess.run(["sips", "-s", "format", "jpeg", dl, "--out", jpg], capture_output=True, timeout=10)
                else:
                    jpg = dl

                if os.path.exists(jpg) and os.path.getsize(jpg) > 500:
                    with open(jpg, "rb") as f: data = f.read()
                    resp = requests.post(f"{STORAGE_URL}/lifefitness/{model}.jpg",
                        headers={"Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "image/jpeg", "x-upsert": "true"},
                        data=data, timeout=30)
                    if resp.status_code in (200, 201):
                        pub = f"{PUBLIC_URL}/lifefitness/{model}.jpg"
                        requests.post(DB_URL,
                            headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"},
                            json={"query": f"UPDATE equipment_catalog SET image_url = '{pub}' WHERE id = {eq_id};"}, timeout=30)
                        print(f"  OK")
                        ok += 1
                    else:
                        print(f"  Upload fail: {resp.status_code}")
                else:
                    print(f"  Convert fail")
            else:
                print(f"  Download fail: {r.status_code}, {len(r.content)}b")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

    print(f"\nDone: {ok}/{len(MACHINES)}")

if __name__ == "__main__":
    main()
