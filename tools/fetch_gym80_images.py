"""
Fetch gym80 product images from their website, upload to Supabase Storage,
and update the equipment_catalog table with image URLs.
"""
import requests
import re
import time
import os
import json

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TEMP_DIR = "C:/Users/Administrator/Desktop/workout-tracker/temp"

# --- Equipment data (from DB query) ---
EQUIPMENT = [
    {"id":1,"model":"3001","name":"Leg Extension"},
    {"id":2,"model":"3002","name":"Seated Leg Curl"},
    {"id":3,"model":"3005","name":"Radial Gluteus"},
    {"id":4,"model":"3006","name":"Lying Leg Curl"},
    {"id":5,"model":"3007","name":"Back Extension"},
    {"id":6,"model":"3008","name":"Abdominal"},
    {"id":7,"model":"3010","name":"Biceps Curl"},
    {"id":8,"model":"3011","name":"Triceps Horizontal"},
    {"id":9,"model":"3012","name":"Pull Over Machine"},
    {"id":10,"model":"3013","name":"Leg Curl"},
    {"id":11,"model":"3014","name":"Chest Crossover Machine"},
    {"id":12,"model":"3016","name":"Seated Chest Press"},
    {"id":13,"model":"3017","name":"Incline Chest Press"},
    {"id":14,"model":"3018","name":"Standing Calf"},
    {"id":15,"model":"3020","name":"Lat Pulldown Machine"},
    {"id":16,"model":"3021","name":"Butterfly with Pads"},
    {"id":17,"model":"3022","name":"Butterfly"},
    {"id":18,"model":"3024","name":"Twister"},
    {"id":19,"model":"3025","name":"Butterfly Reverse"},
    {"id":20,"model":"3027","name":"Back Machine"},
    {"id":21,"model":"3028","name":"Abduction Machine"},
    {"id":22,"model":"3029","name":"Adductor Machine"},
    {"id":23,"model":"3030","name":"Seated Leg Press"},
    {"id":24,"model":"3031","name":"Lying Leg Press"},
    {"id":25,"model":"3032","name":"Shoulder Press"},
    {"id":26,"model":"3034","name":"Lying Abdominal Machine"},
    {"id":27,"model":"3036","name":"Dip Machine"},
    {"id":28,"model":"3037","name":"Special Abdominal Machine"},
    {"id":29,"model":"3038","name":"Lower Back Machine"},
    {"id":30,"model":"3039","name":"Seated Row (no chest support)"},
    {"id":31,"model":"3040","name":"Seated Row Machine"},
    {"id":32,"model":"3047","name":"Iso Lat"},
    {"id":33,"model":"3042","name":"Dual Incline Chest Press"},
    {"id":34,"model":"3043","name":"Dual Shoulder Press"},
    {"id":35,"model":"3044","name":"Dual Lat Pulldown"},
    {"id":36,"model":"3045","name":"Dual Seated Row"},
    {"id":37,"model":"3046","name":"Dual Leg Press"},
    {"id":38,"model":"5101","name":"Cable Art No.1"},
    {"id":39,"model":"5102","name":"Cable Art No.2"},
    {"id":40,"model":"5103","name":"Cable Art No.3"},
    {"id":41,"model":"5104","name":"Cable Art No.4"},
    {"id":42,"model":"5105","name":"Cable Art No.5"},
    {"id":43,"model":"5106","name":"Cable Art No.6"},
    {"id":44,"model":"5001","name":"Innovation Leg Press"},
    {"id":45,"model":"5002","name":"Innovation Glutes Machine"},
    {"id":46,"model":"5003","name":"Innovation Rowing Machine"},
    {"id":47,"model":"5004","name":"Innovation Curler"},
    {"id":48,"model":"5006","name":"Innovation Multi Extension"},
    {"id":49,"model":"4023","name":"45-Degree Linear Leg Press"},
    {"id":50,"model":"4038","name":"Squat Machine"},
    {"id":51,"model":"4159N","name":"Hack Squat"},
    {"id":52,"model":"4311","name":"Lat Pulldown Dual"},
    {"id":53,"model":"4314","name":"Seated Leg Press Dual"},
    {"id":54,"model":"4317","name":"Abdominal Crunch"},
    {"id":55,"model":"4318","name":"Back Machine"},
    {"id":56,"model":"4319","name":"Back Machine (variant)"},
    {"id":57,"model":"4320","name":"Shoulder Press Dual"},
    {"id":58,"model":"4321","name":"Glute Machine"},
    {"id":59,"model":"4322","name":"Seated Row Dual"},
    {"id":60,"model":"4324","name":"Leg Press (variant)"},
    {"id":61,"model":"4326","name":"Chest Press"},
    {"id":62,"model":"4327","name":"Power Row Dual"},
    {"id":63,"model":"4328","name":"Seated Chest Press Dual"},
    {"id":64,"model":"4329N","name":"Incline Chest Press Dual"},
    {"id":65,"model":"4332","name":"Deadlift Rotating Grips Dual"},
    {"id":66,"model":"4333","name":"Deadlift Double Handle Grips Dual"},
    {"id":67,"model":"4335","name":"Triceps Dip Dual"},
    {"id":68,"model":"4336N","name":"Leg Extension"},
    {"id":69,"model":"4337N","name":"Lying Leg Curl"},
    {"id":70,"model":"4338N","name":"Biceps Curl"},
    {"id":71,"model":"4339N","name":"Triceps Machine"},
    {"id":72,"model":"4340","name":"High Row Dual"},
    {"id":73,"model":"4341","name":"Butterfly"},
    {"id":74,"model":"4342N","name":"Back Machine (plate)"},
    {"id":75,"model":"4343","name":"Abdominal Crunch (variant)"},
    {"id":76,"model":"4344","name":"Butterfly Reverse"},
    {"id":77,"model":"4345","name":"Calf Press"},
    {"id":78,"model":"4346","name":"Chest Press (variant)"},
    {"id":79,"model":"4348","name":"Leg Extension (variant)"},
    {"id":80,"model":"4350N","name":"Back Machine (variant 2)"},
    {"id":81,"model":"4352","name":"Booty Booster (Hip Thrust)"},
    {"id":82,"model":"4353N","name":"Pendulum Squat"},
    {"id":83,"model":"4354","name":"Leg Press (variant 2)"},
    {"id":84,"model":"4355","name":"Biceps Curl (variant)"},
    {"id":85,"model":"4360","name":"Belt Squat"},
    {"id":86,"model":"4372","name":"Standing Multi-Joint"},
    {"id":87,"model":"4373","name":"Standing Leg Curl"},
    {"id":88,"model":"4374","name":"Standing Abduction"},
    {"id":89,"model":"4379","name":"Overhead Triceps"},
    {"id":90,"model":"4382","name":"Back Machine (rowing)"},
    {"id":91,"model":"4361","name":"Strong Leg Press Dual"},
    {"id":92,"model":"4362","name":"Strong Decline Chest Press Dual"},
    {"id":93,"model":"4363","name":"Strong Shoulder Press Dual"},
    {"id":94,"model":"4364","name":"Strong Bench Press Dual"},
    {"id":95,"model":"4365","name":"Strong Incline Chest Press Dual"},
    {"id":96,"model":"80CL0001","name":"Lying Leg Curl"},
    {"id":97,"model":"80CL0002","name":"Seated Leg Curl"},
    {"id":98,"model":"80CL0003","name":"Radial Gluteus"},
    {"id":99,"model":"80CL0004","name":"Lower Back"},
    {"id":100,"model":"80CL0006","name":"Abdominal"},
    {"id":101,"model":"80CL0007","name":"Special Abdominal"},
    {"id":102,"model":"80CL0008","name":"Total Ab"},
    {"id":103,"model":"80CL0009","name":"Biceps Curl"},
    {"id":104,"model":"80CL0010","name":"Horizontal Triceps"},
    {"id":105,"model":"80CL0011","name":"Crossover"},
    {"id":106,"model":"80CL0012","name":"Deltoid Raise"},
    {"id":107,"model":"80CL0013","name":"Seated Chest Press"},
    {"id":108,"model":"80CL0015","name":"Standing Calf"},
    {"id":109,"model":"80CL0016","name":"Seated Row with Chest Pad"},
    {"id":110,"model":"80CL0017","name":"Butterfly with Handgrips"},
    {"id":111,"model":"80CL0018","name":"Butterfly Reverse"},
    {"id":112,"model":"80CL0019","name":"Abduction Machine"},
    {"id":113,"model":"80CL0020","name":"Adduction Machine"},
    {"id":114,"model":"80CL0021","name":"Seated Leg Press"},
    {"id":115,"model":"80CL0022","name":"Shoulder Press"},
    {"id":116,"model":"80CL0024","name":"Lat Pulley"},
    {"id":117,"model":"80CL0026","name":"Standing Scott Curl"},
    {"id":118,"model":"80CL0029","name":"Total Hip"},
    {"id":119,"model":"4401","name":"FTM Deadlift Machine"},
    {"id":120,"model":"4403","name":"FTM Push & Pull Machine"},
]

# --- Model -> product page URL mapping (from sitemap) ---
MODEL_TO_URL = {
    "3001": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3001-leg-extension/",
    "3002": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3002-seated-leg-curl/",
    "3005": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3005-radial-gluteus/",
    "3006": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3006-lying-leg-curl/",
    "3007": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3007-lower-back-machine/",
    "3008": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3008-abdominal/",
    "3010": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3010-biceps-curl/",
    "3011": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3011-triceps-horizontal/",
    "3012": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3012n-pull-over-machine/",
    "3013": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3013-standing-leg-curl/",
    "3014": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3014-chest-crossover-machine/",
    "3016": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3016-seated-chest-press/",
    "3017": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3017-incline-chest-press/",
    "3018": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3018-standing-calf/",
    "3020": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3020-lat-pulldown/",
    "3021": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3021-butterfly-with-pads/",
    "3022": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3022-butterfly/",
    "3025": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3025-butterfly-reverse/",
    "3027": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3027-seated-calf-press/",
    "3028": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3028-abduction-machine/",
    "3029": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3029-adduction-machine/",
    "3030": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3030-seated-leg-press/",
    "3031": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3031-lying-leg-press/",
    "3032": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3032-shoulder-press/",
    "3034": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3034-lying-abdominal/",
    "3036": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3036-dip-machine/",
    "3037": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3037-special-abdominal/",
    "3038": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3038-lower-back/",
    "3039": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3039-seated-row-no-chest-support/",
    "3040": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3040-seated-row/",
    "3047": "https://gym80.de/en/product/weight-stack-en/sygnum-en/3047-iso-lat/",
    "3042": "https://gym80.de/en/product/weight-stack-en/sygnum-dual-en/3042-dual-incline-chest-press/",
    "3043": "https://gym80.de/en/product/weight-stack-en/sygnum-dual-en/3043-dual-shoulder-press/",
    "3044": "https://gym80.de/en/product/weight-stack-en/sygnum-dual-en/3044-dual-lat-pulldown/",
    "3045": "https://gym80.de/en/product/weight-stack-en/sygnum-dual-en/3045-dual-seated-row/",
    "3046": "https://gym80.de/en/product/weight-stack-en/sygnum-dual-en/3046-dual-leg-press/",
    "3024": "https://gym80.de/produkt/weight-stack/sygnum/3024-twister/",
    "5101": "https://gym80.de/produkt/weight-stack/sygnum-cable-art/5101-cable-art-nr-1-schulter-und-ruecken/",
    "5102": "https://gym80.de/product/weight-stack/sygnum-cable-art/5102-cable-art-nr-2-latissimus-und-trapezius/",
    "5103": "https://gym80.de/produkt/weight-stack/sygnum-cable-art/5103-cable-art-nr-3-brust-und-schulter/",
    "5104": "https://gym80.de/produkt/weight-stack/sygnum-cable-art/5104-cable-art-nr-4-bizeps-und-trizeps/",
    "5105": "https://gym80.de/product/weight-stack/sygnum-cable-art/5105-cable-art-nr-5-oberkoerper/",
    "5106": "https://gym80.de/produkt/weight-stack/sygnum-cable-art/5106-cable-art-nr-6-beine/",
    "5001": "https://gym80.de/produkt/weight-stack/sygnum/5001-innovation-beinpresse/",
    "5002": "https://gym80.de/product/weight-stack/sygnum/5002-innovation-gluteusmaschine/",
    "5003": "https://gym80.de/produkt/weight-stack/sygnum/5003-innovation-rudermaschine/",
    "5004": "https://gym80.de/produkt/weight-stack/sygnum-dual/5004-innovation-curler-maschine/",
    "5006": "https://gym80.de/produkt/weight-stack/sygnum/5006-innovation-multistreckmaschine/",
    "4023": "https://gym80.de/produkt/plate-loaded/pure-kraft/4023-pure-kraft-45-grad-beinpresse/",
    "4038": "https://gym80.de/product/plate-loaded/pure-kraft/4038-pure-kraft-kniebeugemaschine/",
    "4159N": "https://gym80.de/produkt/plate-loaded/pure-kraft/4159n-pure-kraft-hackenschmidt/",
    "4311": "https://gym80.de/produkt/plate-loaded/pure-kraft/4311-pure-kraft-rueckenzugmaschine-dual/",
    "4314": "https://gym80.de/produkt/plate-loaded/pure-kraft/4314-pure-kraft-beinpresse-sitzend-dual/",
    "4317": "https://gym80.de/product/plate-loaded/pure-kraft/4317-pure-kraft-bauchmuskelmaschine-ab-swing/",
    "4318": "https://gym80.de/product/plate-loaded/pure-kraft/4318-pure-kraft-bodenhantel-multi-grip/",
    "4319": "https://gym80.de/product/plate-loaded/pure-kraft/4319-pure-kraft-low-row/",
    "4320": "https://gym80.de/product/plate-loaded/pure-kraft/4320-pure-kraft-schultermaschine-dual/",
    "4321": "https://gym80.de/produkt/plate-loaded/pure-kraft/4321-pure-kraft-gluteus-kick-maschine/",
    "4322": "https://gym80.de/product/plate-loaded/pure-kraft/4322-pure-kraft-rudermaschine-sitzend-dual/",
    "4324": "https://gym80.de/product/plate-loaded/pure-kraft/4324-pure-kraft-45-grad-pivot-beinpresse/",
    "4326": "https://gym80.de/produkt/plate-loaded/pure-kraft/4326-pure-kraft-brustmaschine-dual/",
    "4327": "https://gym80.de/product/plate-loaded/pure-kraft/4327-pure-kraft-power-row-dual/",
    "4328": "https://gym80.de/product/plate-loaded/pure-kraft/4328-pure-kraft-bankdrueckmaschine-sitzend-dual/",
    "4329N": "https://gym80.de/produkt/plate-loaded/pure-kraft/4329n-pure-kraft-schraegbank-dual/",
    "4332": "https://gym80.de/produkt/plate-loaded/pure-kraft/4332-pure-kraft-deadlift-drehgriffe-dual/",
    "4333": "https://gym80.de/product/plate-loaded/pure-kraft/4333-pure-kraft-deadlift-doppelgriffe-dual/",
    "4335": "https://gym80.de/product/plate-loaded/pure-kraft/4335-pure-kraft-trizeps-dip-maschine-dual/",
    "4336N": "https://gym80.de/produkt/plate-loaded/pure-kraft/4336n-pure-kraft-beinstreckermaschine/",
    "4337N": "https://gym80.de/produkt/plate-loaded/pure-kraft/4337n-pure-kraft-beinbeugermaschine/",
    "4338N": "https://gym80.de/product/plate-loaded/pure-kraft/4338n-pure-kraft-bizepsmaschine/",
    "4339N": "https://gym80.de/product/plate-loaded/pure-kraft/4339n-pure-kraft-trizepsmaschine/",
    "4340": "https://gym80.de/product/plate-loaded/pure-kraft/4340-pure-kraft-high-row-dual/",
    "4341": "https://gym80.de/product/plate-loaded/pure-kraft/4341-pure-kraft-butterfly-dual/",
    "4342N": "https://gym80.de/product/plate-loaded/pure-kraft/4342n-pure-kraft-bauchmuskelmaschin-klappsitz/",
    "4343": "https://gym80.de/produkt/plate-loaded/pure-kraft/4343-pure-kraft-bauchmuskelmaschine-crunch/",
    "4344": "https://gym80.de/product/plate-loaded/pure-kraft/4344-pure-kraft-butterfly-reverse-dual/",
    "4345": "https://gym80.de/product/plate-loaded/pure-kraft/4345-pure-kraft-55-grad-wadenmaschine/",
    "4346": "https://gym80.de/product/plate-loaded/pure-kraft/4346-pure-kraft-negativdrueckbank-dual/",
    "4348": "https://gym80.de/produkt/plate-loaded/pure-kraft/4348-pure-kraft-tibialismaschine-sitzend/",
    "4350N": "https://gym80.de/product/plate-loaded/pure-kraft/4350n-pure-kraft-ueberzugmaschine/",
    "4352": "https://gym80.de/product/plate-loaded/pure-kraft/4352-pure-kraft-booty-booster/",
    "4353N": "https://gym80.de/product/plate-loaded/pure-kraft/4353n-pure-kraft-pendulum-squat/",
    "4354": "https://gym80.de/produkt/plate-loaded/pure-kraft/4354-pure-kraft-vertikale-beinpresse/",
    "4355": "https://gym80.de/product/plate-loaded/pure-kraft/4355-pure-kraft-bizepsmaschine-dual/",
    "4360": "https://gym80.de/product/plate-loaded/pure-kraft/4360-pure-kraft-belt-squat/",
    "4372": "https://gym80.de/produkt/plate-loaded/pure-kraft/4372-pure-kraft-multigelenk-stehend/",
    "4373": "https://gym80.de/product/plate-loaded/pure-kraft/4373-pure-kraft-beinbeuger-stehend/",
    "4374": "https://gym80.de/product/plate-loaded/pure-kraft/4374-pure-kraft-stehende-abduktion/",
    "4379": "https://gym80.de/product/plate-loaded/pure-kraft/4379-pure-kraft-trizeps-ueberkopf/",
    "4382": "https://gym80.de/produkt/plate-loaded/pure-kraft/4382-pure-kraft-high-row-mit-beweglichen-griffen/",
    "4361": "https://gym80.de/product/plate-loaded/pure-kraft-strong/4361-pure-kraft-beinpresse/",
    "4362": "https://gym80.de/product/plate-loaded/pure-kraft-strong/4362-pure-kraft-negativdrueckbank/",
    "4363": "https://gym80.de/produkt/plate-loaded/pure-kraft-strong/4363-pure-kraft-schulterdrueckgeraet/",
    "4364": "https://gym80.de/produkt/plate-loaded/pure-kraft-strong/4364-pure-kraft-drueckbank/",
    "4365": "https://gym80.de/product/plate-loaded/pure-kraft-strong/4365-pure-kraft-strong-schraegbank/",
    "4401": "https://gym80.de/produkt/weight-stack/sygnum-dual/4401-ftm-deadlift-maschine/",
    "4403": "https://gym80.de/product/weight-stack/sygnum-dual/4403-ftm-zug-und-druckmaschine/",
}

# For German URLs, try the English equivalent too
# Also construct fallback English URLs for models with German-only sitemap entries
def get_en_url(model, de_url):
    """Try to construct English URL from German URL."""
    en_url = de_url.replace("/produkt/", "/en/product/")
    en_url = en_url.replace("/product/", "/en/product/") if "/en/" not in en_url else en_url
    # Fix double /en/
    en_url = en_url.replace("/en/en/", "/en/")
    return en_url


def extract_image_url(html, model):
    """Extract the main product image URL from a gym80 product page."""
    # Strategy 1: og:image meta tag
    og = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
    if not og:
        og = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', html, re.IGNORECASE)
    if og:
        url = og.group(1)
        # Skip placeholder/logo images
        if 'logo' not in url.lower() and 'placeholder' not in url.lower():
            return url

    # Strategy 2: Look for wp-content product image with model number
    model_lower = model.lower().replace("n", "").replace("N", "")
    pattern = r'(https?://gym80\.de/wp-content/uploads/[^"\'>\s]+?' + re.escape(model_lower) + r'[^"\'>\s]*\.(?:jpg|jpeg|png|webp))'
    match = re.search(pattern, html, re.IGNORECASE)
    if match:
        return match.group(1)

    # Strategy 2b: Look for wp-content image with model (with N suffix)
    pattern = r'(https?://gym80\.de/wp-content/uploads/[^"\'>\s]+?' + re.escape(model.lower()) + r'[^"\'>\s]*\.(?:jpg|jpeg|png|webp))'
    match = re.search(pattern, html, re.IGNORECASE)
    if match:
        return match.group(1)

    # Strategy 3: First large product image in wp-content
    imgs = re.findall(r'(https?://gym80\.de/wp-content/uploads/[^"\'>\s]+\.(?:jpg|jpeg|png|webp))', html)
    for img in imgs:
        if 'logo' not in img.lower() and 'placeholder' not in img.lower() and 'icon' not in img.lower():
            # Prefer images that aren't tiny thumbnails (look for ones without -150x150 etc)
            if '-150x150' not in img and '-100x100' not in img:
                return img

    # Strategy 4: Any img tag with product-like src
    imgs2 = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html)
    for img in imgs2:
        if 'gym80' in img and 'logo' not in img.lower() and 'placeholder' not in img.lower():
            if img.startswith('//'):
                img = 'https:' + img
            if '-150x150' not in img and '-100x100' not in img:
                return img

    return None


def get_best_image_url(image_url):
    """Try to get the full-size image by removing WordPress size suffix."""
    if not image_url:
        return None
    # Remove size suffix like -400x400, -300x300, -1024x1024 etc.
    cleaned = re.sub(r'-\d+x\d+(?=\.\w+$)', '', image_url)
    return cleaned


def download_image(url):
    """Download image and return (content, content_type, extension)."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
        resp = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        if resp.status_code != 200:
            return None, None, None
        ct = resp.headers.get('Content-Type', 'image/jpeg')
        if 'webp' in ct:
            ext = 'webp'
        elif 'png' in ct:
            ext = 'png'
        else:
            ext = 'jpg'
        return resp.content, ct, ext
    except Exception as e:
        print(f"    Download error: {e}")
        return None, None, None


def upload_to_supabase(data, filename, content_type):
    """Upload image to Supabase Storage."""
    url = f"{STORAGE_URL}/gym80/{filename}"
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


def update_db(equipment_id, image_url):
    """Update equipment_catalog with the image URL."""
    query = f"UPDATE equipment_catalog SET image_url = '{image_url}' WHERE id = {equipment_id};"
    headers = {
        'Authorization': f'Bearer {MGMT_TOKEN}',
        'Content-Type': 'application/json',
    }
    try:
        resp = requests.post(DB_URL, headers=headers, json={"query": query}, timeout=15)
        if resp.status_code == 200 or resp.status_code == 201:
            return True
        else:
            print(f"    DB update failed: {resp.status_code} {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"    DB update error: {e}")
        return False


def fetch_product_page(url):
    """Fetch a product page HTML."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    try:
        resp = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        if resp.status_code == 200:
            return resp.text
        else:
            return None
    except Exception as e:
        print(f"    Fetch error for {url}: {e}")
        return None


def main():
    os.makedirs(TEMP_DIR, exist_ok=True)

    success_count = 0
    fail_count = 0
    skip_count = 0

    print(f"Processing {len(EQUIPMENT)} equipment items...")
    print("=" * 70)

    for item in EQUIPMENT:
        model = item['model']
        eq_id = item['id']
        name = item['name']

        print(f"\n[{eq_id:3d}] {model} - {name}")

        # Check if we have a URL for this model
        if model not in MODEL_TO_URL:
            print(f"    SKIP: No product page URL found")
            skip_count += 1
            continue

        product_url = MODEL_TO_URL[model]

        # Try English URL first, then original
        urls_to_try = []
        if '/en/' in product_url:
            urls_to_try.append(product_url)
        else:
            en_url = get_en_url(model, product_url)
            urls_to_try.append(en_url)
            urls_to_try.append(product_url)

        html = None
        for url in urls_to_try:
            html = fetch_product_page(url)
            if html:
                break

        if not html:
            print(f"    FAIL: Could not fetch product page")
            fail_count += 1
            continue

        # Extract image URL
        image_url = extract_image_url(html, model)
        if not image_url:
            print(f"    FAIL: No image found on product page")
            fail_count += 1
            continue

        # Try to get full-size image
        full_url = get_best_image_url(image_url)
        print(f"    Image: {full_url}")

        # Download image
        data, ct, ext = download_image(full_url)
        if not data:
            # Try original (with size suffix) if full-size fails
            if full_url != image_url:
                print(f"    Trying thumbnail: {image_url}")
                data, ct, ext = download_image(image_url)

        if not data:
            print(f"    FAIL: Could not download image")
            fail_count += 1
            continue

        print(f"    Downloaded: {len(data)} bytes ({ct})")

        # Upload to Supabase Storage
        filename = f"{model.lower()}.{ext}"
        if not upload_to_supabase(data, filename, ct):
            fail_count += 1
            continue

        # Update DB
        public_url = f"{PUBLIC_URL}/gym80/{filename}"
        if update_db(eq_id, public_url):
            print(f"    SUCCESS -> {public_url}")
            success_count += 1
        else:
            fail_count += 1

        # Small delay to be nice to the server
        time.sleep(0.5)

    print("\n" + "=" * 70)
    print(f"DONE: {success_count} success, {fail_count} failed, {skip_count} skipped (no URL)")
    print(f"Total: {success_count + fail_count + skip_count}/{len(EQUIPMENT)}")


if __name__ == "__main__":
    main()
