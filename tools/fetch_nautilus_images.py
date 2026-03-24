"""
Fetch Nautilus equipment images from BigCommerce CDN (ardentfitness) and
Shopify CDN (showmeweights), upload to Supabase Storage.

Sources:
  - Instinct, Inspiration, Impact, Leverage, HumanSport: BigCommerce CDN
  - ONE series: Shopify CDN (showmeweights.com)

104 total images across 7 series.
"""
import requests
import time
import os

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"

BC_IMG_MGR = "https://cdn11.bigcommerce.com/s-o2j5iejem/images/stencil/original/image-manager"
BC_UPLOADS = "https://cdn11.bigcommerce.com/s-o2j5iejem/product_images/uploaded_images"
SMW_CDN = "https://showmeweights.com/cdn/shop/products"

# (model, source_url, upload_extension)
EQUIPMENT = [
    # ===== INSTINCT SERIES (selectorized) =====
    ("9NL-S2100", f"{BC_IMG_MGR}/nautilus-instinct-black-chest-press.jpg", "jpg"),
    ("9NL-D2120", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-multi-press.jpg", "jpg"),
    ("9NL-D2110", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-pectoral-fly.jpg", "jpg"),
    ("9NL-S4100", f"{BC_IMG_MGR}/nautilus-instinct-black-shoulder-press.jpg", "jpg"),
    ("9NL-S3310", f"{BC_IMG_MGR}/nautilus-instinct-black-lat-pull-down.jpg", "jpg"),
    ("9NL-S3320", f"{BC_IMG_MGR}/nautilus-instinct-black-vertical-row.jpg", "jpg"),
    ("9NL-D3340", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-lat-pull-down-vertical-ow.jpg", "jpg"),
    ("9NL-S5100", f"{BC_IMG_MGR}/nautilus-instinct-black-biceps-curl.jpg", "jpg"),
    ("9NL-S5110", f"{BC_IMG_MGR}/nautilus-instinct-black-triceps-ext.jpg", "jpg"),
    ("9NL-D5120", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-biceps-triceps-curl.jpg", "jpg"),
    ("9NL-D1013", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-leg-press.jpg", "jpg"),
    ("9NL-S1010", f"{BC_IMG_MGR}/nautilus-instinct-black-leg-ext.jpg", "jpg"),
    ("9NL-S1011", f"{BC_IMG_MGR}/nautilus-instinct-black-leg-curl.jpg", "jpg"),
    ("9NL-D1014", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-leg-ext-leg-curl.jpg", "jpg"),
    ("9NL-D1015", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-inner-outer-thigh.jpg", "jpg"),
    ("9NL-S1012", f"{BC_IMG_MGR}/nautilus-instinct-black-glute-press.jpg", "jpg"),
    ("9NL-S6300", f"{BC_IMG_MGR}/nautilus-instinct-black-rotary-torso.jpg", "jpg"),
    ("9NL-D6330", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-abdominal-lower-back.jpg", "jpg"),
    ("9NL-D2002", f"{BC_IMG_MGR}/nautilus-instinct-black-dual-adj-pulley.jpg", "jpg"),
    # Instinct Benches
    ("9NN-B7503", f"{BC_IMG_MGR}/nautilus-instinct-black-olympic-flat-bench.jpg", "jpg"),
    ("9NN-B7201", f"{BC_IMG_MGR}/nautilus-instinct-black-olympic-incline-bench.jpg", "jpg"),
    ("9NN-B7501", f"{BC_IMG_MGR}/nautilus-instinct-black-multi-adj-bench-.jpg", "jpg"),
    ("9NN-B7506", f"{BC_IMG_MGR}/nautilus-instinct-black-multi-adj-bench-100.jpg", "jpg"),
    ("9NN-B7502", f"{BC_IMG_MGR}/nautilus-instinct-black-45-back-extension.jpg", "jpg"),
    ("9NN-B7200", f"{BC_IMG_MGR}/nautilus-instinct-black-adjustable-abdominal-decline-bench.jpg", "jpg"),
    ("9NN-B7505", f"{BC_IMG_MGR}/nautilus-instinct-black-ab-bench.jpg", "jpg"),

    # ===== INSPIRATION SERIES (selectorized) =====
    ("IPVP3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-chest-press.jpg", "jpg"),
    ("IPPF3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-pec-fly-rear-deltoid.jpg", "jpg"),
    ("9-IPPO3",  f"{BC_IMG_MGR}/nautilus-inspiration-black-pull-over.jpg", "jpg"),
    ("IPSP3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-shoulder-press.jpg", "jpg"),
    ("IPDR3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-deltoid-raise.jpg", "jpg"),
    ("IPPD3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-lat-pull-down.jpg", "jpg"),
    ("IPVR3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-vertical-row.jpg", "jpg"),
    ("IPBC3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-biceps-curl.jpg", "jpg"),
    ("IPBA3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-bilateral-arm-curl.jpg", "jpg"),
    ("IPTE3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-triceps-ext.jpg", "jpg"),
    ("IPTD4",    f"{BC_IMG_MGR}/nautilus-inspiration-black-tricep-dip.jpg", "jpg"),
    ("IPLP3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-leg-press.jpg", "jpg"),
    ("IPLE33",   f"{BC_IMG_MGR}/nautilus-inspiration-black-leg-extension.jpg", "jpg"),
    ("IPLC3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-leg-curl.jpg", "jpg"),
    ("IPAA4",    f"{BC_IMG_MGR}/nautilus-inspiration-black-abduction-adduction.jpg", "jpg"),
    ("IPGM3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-glute-press.jpg", "jpg"),
    ("IPAC3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-abdominal-crunch.jpg", "jpg"),
    ("IPBE3",    f"{BC_IMG_MGR}/nautilus-inspiration-black-back-extension.jpg", "jpg"),
    ("IPRT5",    f"{BC_IMG_MGR}/nautilus-inspiration-black-rotary-torso.jpg", "jpg"),
    ("NP-D9302", f"{BC_IMG_MGR}/nautilus-inspiration-black-dual-adj-pulley.jpg", "jpg"),

    # ===== IMPACT SERIES (selectorized) =====
    ("9NA-S4301", f"{BC_IMG_MGR}/nautilus-impact-black-chest-press.jpg", "jpg"),
    ("9NA-S2301", f"{BC_IMG_MGR}/nautilus-impact-black-incline-press.jpg", "jpg"),
    ("9NA-S4304", f"{BC_IMG_MGR}/nautilus-impact-black-deltoid-fly.jpg", "jpg"),
    ("9NA-S4307", f"{BC_IMG_MGR}/nautilus-impact-black-shoulder-press.jpg", "jpg"),
    ("9NA-S4302", f"{BC_IMG_MGR}/nautilus-impact-black-deltoid-raise.jpg", "jpg"),
    ("9NA-S3305", f"{BC_IMG_MGR}/nautilus-impact-black-lat-pull-down.jpg", "jpg"),
    ("9NA-S3303", f"{BC_IMG_MGR}/nautilus-impact-black-fixed-lat-pull-down.jpg", "jpg"),
    ("9NA-S3301", f"{BC_IMG_MGR}/nautilus-impact-black-vertical-row.jpg", "jpg"),
    ("9NA-S3306", f"{BC_IMG_MGR}/nautilus-impact-black-low-row.jpg", "jpg"),
    ("9NA-S3302", f"{BC_IMG_MGR}/nautilus-impact-black-low-back.jpg", "jpg"),
    ("9NA-S5301", f"{BC_IMG_MGR}/nautilus-impact-black-biceps-curl.jpg", "jpg"),
    ("9NA-S5302", f"{BC_IMG_MGR}/nautilus-impact-black-triceps-extension.jpg", "jpg"),
    ("9NA-S5303", f"{BC_IMG_MGR}/nautilus-impact-black-dip-machine.jpg", "jpg"),
    ("9NA-S6334", f"{BC_IMG_MGR}/nautilus-impact-black-chin-dip-assist.jpg", "jpg"),
    ("9NA-S1305", f"{BC_IMG_MGR}/nautilus-impact-black-seated-leg-press.jpg", "jpg"),
    ("9NA-S1312", f"{BC_IMG_MGR}/nautilus-impact-black-leg-ext.jpg", "jpg"),
    ("9NA-S1313", f"{BC_IMG_MGR}/nautilus-impact-black-leg-curl.jpg", "jpg"),
    ("9NA-S1311", f"{BC_IMG_MGR}/nautilus-impact-black-kneeling-leg-curl.jpg", "jpg"),
    ("9NA-S1307", f"{BC_IMG_MGR}/nautilus-impact-black-abductor.jpg", "jpg"),
    ("9NA-S1308", f"{BC_IMG_MGR}/nautilus-impact-black-adductor.jpg", "jpg"),
    ("9NA-S1309", f"{BC_IMG_MGR}/nautilus-impact-black-standing-calf.jpg", "jpg"),
    ("9NA-S6301", f"{BC_IMG_MGR}/nautilus-impact-black-abdominal.jpg", "jpg"),

    # ===== ONE SERIES (selectorized) =====
    ("S6CP",   f"{SMW_CDN}/nautilus-one-chest-press_9d366c7a-91b5-4fe0-a54f-514f3bac6657.png?v=1676562787", "png"),
    ("S6SP",   f"{SMW_CDN}/nautilus-one-shoulder-press.jpg?v=1676562802", "jpg"),
    ("S6LATP", f"{SMW_CDN}/nautilus-one-lat-pulldown.jpg?v=1676562789", "jpg"),
    ("S6MR",   f"{SMW_CDN}/nautilus-one-row.png?v=1676562802", "png"),
    ("S6BC",   f"{SMW_CDN}/nautilus-one-biceps-curl.jpg?v=1676562786", "jpg"),
    ("S6TP",   f"{SMW_CDN}/nautilus-one-triceps-press_c832cde6-7964-4eb5-88e3-f788b0b1f4dc.png?v=1676562922", "png"),
    ("S6LP",   f"{SMW_CDN}/nautilus-one-leg-press.png?v=1676562789", "png"),
    ("S6LE",   f"{SMW_CDN}/nautilus-one-leg-extension_0c70e1f3-c5e5-477e-aabe-1b0525ba3f66.png?v=1676562789", "png"),
    ("S6LC",   f"{SMW_CDN}/nautilus-one-seated-leg-curl.png?v=1676562802", "png"),
    ("S6AA",   f"{SMW_CDN}/nautilus-one-hip-abductionadduction.png?v=1676562788", "png"),
    ("S6AB",   f"{SMW_CDN}/nautilus-one-abdominal-crunch.png?v=1676562786", "png"),
    ("S6LB",   f"{SMW_CDN}/nautilus-one-low-back_9cdf5903-f473-40cf-8a72-fb772c361dfd.png?v=1676562791", "png"),
    ("S6RT",   f"{SMW_CDN}/nautilus-one-rotary-torso.jpg?v=1676562791", "jpg"),

    # ===== LEVERAGE SERIES (plate-loaded) =====
    ("9NP-L2002", f"{BC_IMG_MGR}/nautilus-leverage-black-chest-press.jpg", "jpg"),
    ("9NP-L2003", f"{BC_IMG_MGR}/nautilus-leverage-black-incline-press.jpg", "jpg"),
    ("9NP-L2004", f"{BC_IMG_MGR}/nautilus-leverage-black-decline-press.jpg", "jpg"),
    ("9NP-L4002", f"{BC_IMG_MGR}/nautilus-leverage-black-shoulder-press.jpg", "jpg"),
    ("9NP-L3003", f"{BC_IMG_MGR}/nautilus-leverage-black-lat-pull-down.jpg", "jpg"),
    ("9NP-L3005", f"{BC_IMG_MGR}/nautilus-leverage-black-high-row.jpg", "jpg"),
    ("9NP-L3004", f"{BC_IMG_MGR}/nautilus-leverage-black-low-row.jpg", "jpg"),
    ("9NP-L3140", f"{BC_UPLOADS}/nautilus-plate-loaded-incline-lever-row.jpg", "jpg"),
    ("9NP-L3006", f"{BC_IMG_MGR}/nautilus-leverage-black-deadlift-shrug.jpg", "jpg"),
    ("9NP-L5002", f"{BC_IMG_MGR}/nautilus-leverage-black-biceps-curl.jpg", "jpg"),
    ("9NP-L5003", f"{BC_IMG_MGR}/nautilus-leverage-black-abdominal-crunch-code.jpg", "jpg"),

    # ===== PLATE-LOADED (non-leverage) =====
    ("9NP-L1130", f"{BC_UPLOADS}/nautilus-plate-loaded-hack-squat.jpg", "jpg"),
    ("9NP-L1141", f"{BC_UPLOADS}/nautilus-plate-loaded-angled-leg-press.jpg", "jpg"),
    ("9NP-L1110", f"{BC_UPLOADS}/nautilus-plate-loaded-tilt-seat-calf.jpg", "jpg"),
    ("9NP-L1131", f"{BC_UPLOADS}/nautilus-plate-loaded-glute-drive.jpg", "jpg"),

    # ===== HUMANSPORT SERIES (cable) =====
    ("HSSC3", f"{BC_UPLOADS}/nautilus-humansport-shoulder-chest.jpg", "jpg"),
    ("HSTD3", f"{BC_UPLOADS}/nautilus-humansport-total-delts.jpg", "jpg"),
    ("HSLP3", f"{BC_UPLOADS}/nautilus-humansport-lat-pulley.jpg", "jpg"),
    ("HSPL3", f"{BC_UPLOADS}/nautilus-humansport-pull-lift.jpg", "jpg"),
    ("HSAC3", f"{BC_UPLOADS}/nautilus-humansport-arm-crunch.jpg", "jpg"),
    ("HSTL3", f"{BC_UPLOADS}/nautilus-humansport-total-legs.jpg", "jpg"),
    ("IPAC5", f"{BC_IMG_MGR}/nautilus-humansport-black-abdominal-crunch.jpg", "jpg"),
    ("HSFT3", f"{BC_IMG_MGR}/nautilus-humansport-black-freedom-trainer.jpg", "jpg"),
]


def download_image(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        if resp.status_code == 200 and len(resp.content) > 100:
            return resp.content, resp.headers.get('Content-Type', 'image/jpeg')
        else:
            return None, None
    except Exception as e:
        print(f"    Download error: {e}")
        return None, None


def upload_to_supabase(data, filename, content_type):
    url = f"{STORAGE_URL}/nautilus/{filename}"
    headers = {
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': content_type,
        'x-upsert': 'true',
    }
    try:
        resp = requests.put(url, headers=headers, data=data, timeout=30)
        if resp.status_code in (200, 201):
            return True
        else:
            print(f"    Upload failed: {resp.status_code} {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"    Upload error: {e}")
        return False


def main():
    success = 0
    fail = 0

    print(f"Processing {len(EQUIPMENT)} Nautilus equipment images...")
    print("=" * 70)

    for model, source_url, ext in EQUIPMENT:
        print(f"\n  {model}")

        data, ct = download_image(source_url)
        if not data:
            print(f"    FAIL: Could not download ({source_url})")
            fail += 1
            continue

        print(f"    Downloaded: {len(data)} bytes")

        # Determine content type
        if ext == 'png':
            ct = 'image/png'
        else:
            ct = 'image/jpeg'

        filename = f"{model}.{ext}"
        if upload_to_supabase(data, filename, ct):
            print(f"    OK -> nautilus/{filename}")
            success += 1
        else:
            fail += 1

        time.sleep(0.3)

    print("\n" + "=" * 70)
    print(f"DONE: {success} success, {fail} failed out of {len(EQUIPMENT)}")


if __name__ == "__main__":
    main()
