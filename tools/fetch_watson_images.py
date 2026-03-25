"""
Fetch Watson Gym Equipment images from watsongym.co.uk,
upload to Supabase Storage, and insert into equipment_catalog + equipment_exercises.

Watson products: ~93 machines (plate-loaded, selectorized, cable)
Run: python3 tools/fetch_watson_images.py
"""

import requests
import time
import os
import re
import json
import tempfile

# --- Config ---
SUPABASE_REF = "mqyfdbfdeuwojgexhwpy"
MGMT_TOKEN = "sbp_01caff5afbb7344ac074136202719c2cc17a6930"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"
PUBLIC_URL  = f"https://{SUPABASE_REF}.supabase.co/storage/v1/object/public/equipment-images"
DB_URL      = f"https://api.supabase.com/v1/projects/{SUPABASE_REF}/database/query"
TEMP_DIR    = tempfile.gettempdir()
WATSON_BASE = "https://watsongym.co.uk"

HEADERS_UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.5",
}

# ---------------------------------------------------------------------------
# Watson product catalog
# Each entry:
#   slug         — product URL slug (also used as model in DB)
#   name         — display name
#   muscle_group — chest / back / shoulders / legs / glutes / arms / core / full_body
#   eq_type      — selectorized / plate-loaded / cable
#   ex_type      — exercise_type(s) for equipment_catalog, comma-separated
#   img_url      — pre-fetched og:image URL (None = fetch dynamically)
# ---------------------------------------------------------------------------
WATSON_PRODUCTS = [

    # ── CHEST ──────────────────────────────────────────────────────────────
    {
        "slug": "plate-loaded-chest-press",
        "name": "PL Chest Press",
        "muscle_group": "chest", "eq_type": "plate-loaded", "ex_type": "chest_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/PL-Chest-Press.jpg",
    },
    {
        "slug": "plate-load-decline-chest-press",
        "name": "PL Decline Chest Press",
        "muscle_group": "chest", "eq_type": "plate-loaded", "ex_type": "chest_press",
        "img_url": None,
    },
    {
        "slug": "plate-load-free-motion-chest-press",
        "name": "PL Free Motion Chest Press",
        "muscle_group": "chest", "eq_type": "plate-loaded", "ex_type": "chest_press",
        "img_url": None,
    },
    {
        "slug": "plate-load-super-incline-chest-press",
        "name": "PL Super Incline Chest Press",
        "muscle_group": "chest", "eq_type": "plate-loaded", "ex_type": "incline_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/DSC08504.jpg",
    },
    {
        "slug": "animal-iso-standing-chest-press",
        "name": "PL Animal ISO Standing Chest Press",
        "muscle_group": "chest", "eq_type": "plate-loaded", "ex_type": "chest_press",
        "img_url": None,
    },
    {
        "slug": "animal-dual-stack-chest-press",
        "name": "DS Animal Chest Press",
        "muscle_group": "chest", "eq_type": "selectorized", "ex_type": "chest_press",
        "img_url": None,
    },
    {
        "slug": "single-stack-chest-press",
        "name": "SS Chest Press",
        "muscle_group": "chest", "eq_type": "selectorized", "ex_type": "chest_press",
        "img_url": None,
    },
    {
        "slug": "single-stack-pec-fly-rear-delt",
        "name": "SS Pec Fly / Rear Delt",
        "muscle_group": "chest", "eq_type": "selectorized", "ex_type": "chest_fly,rear_delt",
        "img_url": None,
    },
    {
        "slug": "single-stack-multi-pec-delt",
        "name": "SS Multi Pec Delt",
        "muscle_group": "chest", "eq_type": "selectorized", "ex_type": "chest_fly,rear_delt",
        "img_url": None,
    },

    # ── BACK — LAT / PULLOVER ───────────────────────────────────────────────
    {
        "slug": "single-stack-lat-pulldown",
        "name": "SS Lat Pulldown",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "lat_pulldown",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/single-stack-lat-pulldown-copy.jpg",
    },
    {
        "slug": "single-stack-dual-cable-lat-pulldown",
        "name": "SS Dual Cable Lat Pulldown",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "lat_pulldown",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Dual-Cable-Lat-Pulldown-2.jpg",
    },
    {
        "slug": "animal-dual-stack-lat-pulldown",
        "name": "DS Animal Lat Pulldown",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "lat_pulldown",
        "img_url": None,
    },
    {
        "slug": "plate-load-front-pulldown",
        "name": "PL Front Pulldown",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "lat_pulldown",
        "img_url": None,
    },
    {
        "slug": "plate-load-independent-pullover",
        "name": "PL Independent Pullover",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "lat_pulldown",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/DSC08612.jpg",
    },

    # ── BACK — ROWS ─────────────────────────────────────────────────────────
    {
        "slug": "seated-single-stack-row",
        "name": "SS Seated Row",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "single-stack-dual-cable-low-pulley-row",
        "name": "SS Dual Cable Low Pulley Row",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "seated_row",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Single-Stack-Dual-Cable-Low-Pulley-Row-Web-copy.jpg",
    },
    {
        "slug": "single-stack-low-pulley-row",
        "name": "SS Low Pulley Row",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "plate-load-lateral-row",
        "name": "PL Lateral Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "animal-plate-load-lateral-row",
        "name": "PL Animal Lateral Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "plate-load-perfect-row",
        "name": "PL Perfect Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "plate-load-low-row",
        "name": "PL Low Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "animal-iso-linear-row",
        "name": "PL Animal ISO Linear Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "animal-chest-supported-t-bar-row-with-rotating-handles",
        "name": "Animal Chest Supported T-Bar Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "plate-load-t-bar-row",
        "name": "PL T-Bar Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "classic-bench-row",
        "name": "Classic Bench Row",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "seated_row",
        "img_url": None,
    },
    {
        "slug": "plate-loaded-deadlift",
        "name": "PL Deadlift",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "deadlift",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/PLATE-LOADED-DEADLIFT2.jpg",
    },

    # ── BACK — HYPEREXTENSION ───────────────────────────────────────────────
    {
        "slug": "single-stack-back-extension",
        "name": "SS Back Extension",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "single-stack-hyper-extension",
        "name": "SS Hyperextension",
        "muscle_group": "back", "eq_type": "selectorized", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "animal-hyper-extension",
        "name": "Animal Hyperextension",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "deluxe-hyper-extension",
        "name": "Deluxe Hyperextension",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "deluxe-reverse-hyper-extension",
        "name": "Deluxe Reverse Hyperextension",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "power-rack-reverse-hyper-extension",
        "name": "Power Rack Reverse Hyperextension",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "westside-ultra-pro-reverse-hyper",
        "name": "Westside Ultra Pro Reverse Hyper",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "westside-ultra-supreme-reverse-hyper",
        "name": "Westside Ultra Supreme Reverse Hyper",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },
    {
        "slug": "westside-reverse-hyper-with-bent-pendulum",
        "name": "Westside Reverse Hyper Bent Pendulum",
        "muscle_group": "back", "eq_type": "plate-loaded", "ex_type": "back_extension",
        "img_url": None,
    },

    # ── SHOULDERS ───────────────────────────────────────────────────────────
    {
        "slug": "animal-dual-stack-shoulder-press",
        "name": "DS Animal Shoulder Press",
        "muscle_group": "shoulders", "eq_type": "selectorized", "ex_type": "shoulder_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/DSC04601-copy.jpg",
    },
    {
        "slug": "plate-load-shoulder-press",
        "name": "PL Shoulder Press",
        "muscle_group": "shoulders", "eq_type": "plate-loaded", "ex_type": "shoulder_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/IMG_3469.jpg",
    },
    {
        "slug": "plate-loaded-incline-shoulder-press",
        "name": "PL Incline Shoulder Press",
        "muscle_group": "shoulders", "eq_type": "plate-loaded", "ex_type": "shoulder_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/11/IMG_4547-copy-3-copy-2-copy-2.png",
    },
    {
        "slug": "plate-load-free-motion-shoulder-press",
        "name": "PL Free Motion Shoulder Press",
        "muscle_group": "shoulders", "eq_type": "plate-loaded", "ex_type": "shoulder_press",
        "img_url": None,
    },
    {
        "slug": "seated-shoulder-press",
        "name": "SS Seated Shoulder Press",
        "muscle_group": "shoulders", "eq_type": "selectorized", "ex_type": "shoulder_press",
        "img_url": None,
    },
    {
        "slug": "single-stack-standing-lateral-raise",
        "name": "SS Standing Lateral Raise",
        "muscle_group": "shoulders", "eq_type": "selectorized", "ex_type": "lateral_raise",
        "img_url": None,
    },
    {
        "slug": "plate-load-standing-lateral-raise",
        "name": "PL Standing Lateral Raise",
        "muscle_group": "shoulders", "eq_type": "plate-loaded", "ex_type": "lateral_raise",
        "img_url": None,
    },
    {
        "slug": "seated-lateral-raise",
        "name": "SS Seated Lateral Raise",
        "muscle_group": "shoulders", "eq_type": "selectorized", "ex_type": "lateral_raise",
        "img_url": None,
    },
    {
        "slug": "seated-incline-lateral-raise",
        "name": "SS Seated Incline Lateral Raise",
        "muscle_group": "shoulders", "eq_type": "selectorized", "ex_type": "lateral_raise",
        "img_url": None,
    },
    {
        "slug": "animal-viking-press",
        "name": "Animal Viking Press",
        "muscle_group": "shoulders", "eq_type": "plate-loaded", "ex_type": "shoulder_press",
        "img_url": None,
    },

    # ── LEGS — LEG PRESS / SQUAT ─────────────────────────────────────────────
    {
        "slug": "animal-plate-load-leg-press",
        "name": "PL Animal Leg Press",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "leg_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/01/New-Animal-Leg-Press-Different-Angle.png",
    },
    {
        "slug": "rear-pivot-plate-loaded-leg-press",
        "name": "PL Rear Pivot Leg Press",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "leg_press",
        "img_url": None,
    },
    {
        "slug": "animal-horizontal-leg-press",
        "name": "PL Animal Horizontal Leg Press",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "leg_press",
        "img_url": None,
    },
    {
        "slug": "animal-vertical-leg-press",
        "name": "PL Animal Vertical Leg Press",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "leg_press",
        "img_url": None,
    },
    {
        "slug": "seated-single-stack-leg-press",
        "name": "SS Leg Press",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "leg_press",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Copper-Seated-Leg-Press.png",
    },
    {
        "slug": "adjustable-hack-squat",
        "name": "PL Adjustable Hack Squat",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },
    {
        "slug": "linear-hack-squat",
        "name": "PL Linear Hack Squat",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },
    {
        "slug": "plate-loaded-hack-squat",
        "name": "PL Hack Squat",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },
    {
        "slug": "pendulum-squat",
        "name": "PL Pendulum Squat",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },
    {
        "slug": "trusquat",
        "name": "PL Tru Squat",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },
    {
        "slug": "hip-belt-squat",
        "name": "PL Hip Belt Squat",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },
    {
        "slug": "plate-loaded-lunge-machine",
        "name": "PL Lunge Machine",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "squat",
        "img_url": None,
    },

    # ── LEGS — EXTENSION / CURL ──────────────────────────────────────────────
    {
        "slug": "single-stack-leg-extension",
        "name": "SS Leg Extension",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "leg_extension",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Leg-Extension.jpg",
    },
    {
        "slug": "single-stack-seated-leg-extension-leg-curl",
        "name": "SS Leg Extension / Seated Leg Curl",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "leg_extension,seated_leg_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2024/04/New-Seated-leg-ex-curl-3.jpg",
    },
    {
        "slug": "single-stack-leg-extension-leg-curl",
        "name": "SS Leg Extension / Lying Leg Curl",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "leg_extension,lying_leg_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/B.Studio2.0_05-04-25_322927.jpg",
    },
    {
        "slug": "animal-dual-stack-leg-extension",
        "name": "DS Animal Leg Extension",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "leg_extension",
        "img_url": None,
    },
    {
        "slug": "plate-load-leg-extension",
        "name": "PL Leg Extension",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "leg_extension",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/IMG_5364.jpg",
    },
    {
        "slug": "seated-leg-curl",
        "name": "SS Seated Leg Curl",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "seated_leg_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Seated-Leg-Curl.jpg",
    },
    {
        "slug": "lying-leg-curl",
        "name": "SS Lying Leg Curl",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "lying_leg_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Lying-Leg-Curl-1.jpg",
    },
    {
        "slug": "standing-leg-curl",
        "name": "SS Standing Leg Curl",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "standing_leg_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2025/12/DSC03702-2.jpg",
    },
    {
        "slug": "westside-inverse-curl-pro",
        "name": "PL Westside Inverse Curl Pro",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "lying_leg_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/IMG_0591.jpg",
    },
    {
        "slug": "westside-hip-and-quad-developer-pro",
        "name": "Westside Hip & Quad Developer Pro",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "leg_extension,lying_leg_curl",
        "img_url": None,
    },

    # ── LEGS — CALF ──────────────────────────────────────────────────────────
    {
        "slug": "standing-single-stack-calf-raise",
        "name": "SS Calf Raise",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "calf",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/IMG-20250609-WA0027-2.jpg",
    },
    {
        "slug": "seated-plate-load-calf-tibia-raise",
        "name": "PL Seated Calf / Tibia Raise",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "calf",
        "img_url": None,
    },

    # ── GLUTES / HIPS ────────────────────────────────────────────────────────
    {
        "slug": "single-stack-glute-machine",
        "name": "SS Glute Machine",
        "muscle_group": "glutes", "eq_type": "selectorized", "ex_type": "glute_kickback",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/DSC09218-3.jpg",
    },
    {
        "slug": "plate-load-glute-blaster",
        "name": "PL Glute Blaster",
        "muscle_group": "glutes", "eq_type": "plate-loaded", "ex_type": "glute_kickback",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/PLATE-LOAD-GLUTE-BLASTER3.jpg",
    },
    {
        "slug": "single-stack-multi-hip",
        "name": "SS Multi-Hip",
        "muscle_group": "glutes", "eq_type": "selectorized", "ex_type": "glute_kickback,hip_abduction",
        "img_url": None,
    },
    {
        "slug": "dual-hip-adductor-abductor",
        "name": "SS Dual Hip Adductor / Abductor",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "hip_abduction,hip_adduction",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Dual-Adductor-Abductor-1.jpg",
    },
    {
        "slug": "single-stack-hip-abductor",
        "name": "SS Hip Abductor",
        "muscle_group": "glutes", "eq_type": "selectorized", "ex_type": "hip_abduction",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Hip-Abductor-1.jpg",
    },
    {
        "slug": "single-stack-standing-hip-abductor",
        "name": "SS Standing Hip Abductor",
        "muscle_group": "glutes", "eq_type": "selectorized", "ex_type": "hip_abduction",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2024/01/SS-Standing-Hip-Abd_-1.jpg",
    },
    {
        "slug": "single-stack-hip-adductor",
        "name": "SS Hip Adductor",
        "muscle_group": "legs", "eq_type": "selectorized", "ex_type": "hip_adduction",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Hip-Adductor-technical-file-3.jpg",
    },
    {
        "slug": "plate-loaded-hip-adductor",
        "name": "PL Hip Adductor",
        "muscle_group": "legs", "eq_type": "plate-loaded", "ex_type": "hip_adduction",
        "img_url": None,
    },
    {
        "slug": "westside-plyo-swing",
        "name": "Westside Plyo Swing",
        "muscle_group": "glutes", "eq_type": "plate-loaded", "ex_type": "glute_kickback",
        "img_url": None,
    },

    # ── ARMS — BICEP ─────────────────────────────────────────────────────────
    {
        "slug": "single-stack-bicep-curl",
        "name": "SS Bicep Curl",
        "muscle_group": "arms", "eq_type": "selectorized", "ex_type": "bicep_curl",
        "img_url": None,
    },
    {
        "slug": "single-stack-bicep-tricep-machine",
        "name": "SS Bicep Tricep Machine",
        "muscle_group": "arms", "eq_type": "selectorized", "ex_type": "bicep_curl,tricep_extension",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Watson-tricep-bicep-44-1.jpg",
    },
    {
        "slug": "plate-loaded-bicep-curl",
        "name": "PL Bicep Curl",
        "muscle_group": "arms", "eq_type": "plate-loaded", "ex_type": "bicep_curl",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Bicep-Curl-6.jpg",
    },

    # ── ARMS — TRICEP / DIP ──────────────────────────────────────────────────
    {
        "slug": "single-stack-overhead-tricep-extension",
        "name": "SS Overhead Tricep Extension",
        "muscle_group": "arms", "eq_type": "selectorized", "ex_type": "tricep_extension",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2024/09/Tricep-Extension.jpg",
    },
    {
        "slug": "single-stack-tricep-extension",
        "name": "SS Tricep Extension",
        "muscle_group": "arms", "eq_type": "selectorized", "ex_type": "tricep_extension",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/single-stack-tricep-extension-01-v2-copy.jpg",
    },
    {
        "slug": "seated-single-stack-tricep-dip",
        "name": "SS Seated Tricep Dip",
        "muscle_group": "arms", "eq_type": "selectorized", "ex_type": "tricep_dip",
        "img_url": None,
    },
    {
        "slug": "seated-plate-loaded-dip",
        "name": "PL Seated Dip",
        "muscle_group": "arms", "eq_type": "plate-loaded", "ex_type": "tricep_dip",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/PL-Seated-Dip-1000x1000-1.jpg",
    },
    {
        "slug": "standing-iso-dip",
        "name": "PL Standing ISO Dip",
        "muscle_group": "arms", "eq_type": "plate-loaded", "ex_type": "tricep_dip",
        "img_url": None,
    },

    # ── CABLE / MULTI-FUNCTION ───────────────────────────────────────────────
    {
        "slug": "dual-cable-adjustable-pulley",
        "name": "SS Dual Cable Adjustable Pulley",
        "muscle_group": "full_body", "eq_type": "cable", "ex_type": "cable_multi",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/Dual-Cable-Adjustable-Pulley-1-Recovered-1.png",
    },
    {
        "slug": "dual-adjustable-pulley",
        "name": "DS Dual Adjustable Pulley",
        "muscle_group": "full_body", "eq_type": "cable", "ex_type": "cable_multi",
        "img_url": "https://watsongym.co.uk/wp-content/uploads/2023/03/dual-adjustable-pulley-01-v2-1-1.jpg",
    },
    {
        "slug": "single-stack-multi-gym",
        "name": "SS Multi-Gym",
        "muscle_group": "full_body", "eq_type": "cable", "ex_type": "cable_multi",
        "img_url": None,
    },
    {
        "slug": "power-gym",
        "name": "Power Gym",
        "muscle_group": "full_body", "eq_type": "cable", "ex_type": "cable_multi",
        "img_url": None,
    },

    # ── CORE ─────────────────────────────────────────────────────────────────
    {
        "slug": "abdominal-crunch",
        "name": "SS Abdominal Crunch",
        "muscle_group": "core", "eq_type": "selectorized", "ex_type": "crunch",
        "img_url": None,
    },
    {
        "slug": "crunch-bench",
        "name": "Crunch Bench",
        "muscle_group": "core", "eq_type": "plate-loaded", "ex_type": "crunch",
        "img_url": None,
    },
]

# ---------------------------------------------------------------------------
# exercise_type → exercise names in exercises_db (for equipment_exercises table)
# ---------------------------------------------------------------------------
EXERCISE_TYPE_MAP = {
    "chest_press":        ["Chest Press (Machine)", "Decline Bench Press (Machine)", "Decline Chest Press (Machine)"],
    "incline_press":      ["Incline Chest Press (Machine)"],
    "chest_fly":          ["Chest Fly (Machine)", "Cable Fly Crossovers", "Seated Chest Flys (Cable)"],
    "rear_delt":          ["Rear Delt Fly (Machine)", "Rear Delt Fly (Dumbbell)"],
    "lat_pulldown":       ["Lat Pulldown (Machine)", "Pullover (Machine)"],
    "seated_row":         ["Seated Row (Machine)", "Low Row (Machine)", "T-Bar Row (Plate Loaded)"],
    "deadlift":           ["Deadlift (Barbell)", "Romanian Deadlift (Barbell)"],
    "back_extension":     ["Back Extension", "Reverse Hyperextension"],
    "shoulder_press":     ["Shoulder Press (Machine)", "Overhead Press (Machine)"],
    "lateral_raise":      ["Lateral Raise (Machine)", "Lateral Raise (Dumbbell)"],
    "leg_press":          ["Leg Press (Machine)"],
    "squat":              ["Hack Squat (Machine)", "Pendulum Squat (Machine)", "Leg Press (Machine)"],
    "leg_extension":      ["Leg Extension (Machine)"],
    "seated_leg_curl":    ["Seated Leg Curl (Machine)"],
    "lying_leg_curl":     ["Lying Leg Curl (Machine)"],
    "standing_leg_curl":  ["Standing Leg Curl (Machine)"],
    "calf":               ["Calf Raise (Machine)", "Seated Calf Raise (Machine)"],
    "glute_kickback":     ["Кикбек (в тренажёре)", "Glute Kickback (Machine)"],
    "hip_abduction":      ["Hip Abduction (Machine)"],
    "hip_adduction":      ["Hip Adduction (Machine)"],
    "bicep_curl":         ["Bicep Curl (Machine)", "Preacher Curl (Machine)"],
    "tricep_extension":   ["Tricep Extension (Machine)", "Overhead Tricep Extension (Machine)"],
    "tricep_dip":         ["Tricep Dip (Machine)", "Chest Dip (Assisted)"],
    "cable_multi":        ["Cable Fly Crossovers", "Lat Pulldown (Cable)", "Seated Row (Cable)"],
    "crunch":             ["Crunch (Machine)", "Abdominal Crunch (Machine)"],
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def sql(query):
    r = requests.post(
        DB_URL,
        headers={"Authorization": f"Bearer {MGMT_TOKEN}", "Content-Type": "application/json"},
        json={"query": query},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def fetch_og_image(slug):
    """Fetch og:image URL from Watson product page."""
    url = f"{WATSON_BASE}/product/{slug}/"
    try:
        r = requests.get(url, headers=HEADERS_UA, timeout=20)
        if r.status_code != 200:
            print(f"  ⚠ HTTP {r.status_code} for {slug}")
            return None
        m = re.search(r'<meta property="og:image" content="([^"]+)"', r.text)
        if m:
            return m.group(1)
        # Fallback: wp-post-image src
        m = re.search(r'wp-post-image[^>]+src="([^"]+)"', r.text)
        if m:
            return m.group(1)
        print(f"  ⚠ No og:image found for {slug}")
        return None
    except Exception as e:
        print(f"  ✗ fetch_og_image error for {slug}: {e}")
        return None


def download_image(img_url, slug):
    """Download image to temp file, return (path, ext)."""
    # Fix malformed URLs (e.g. .jpg1_.jpg)
    img_url = re.sub(r'\.jpg\d+_\.jpg', '.jpg', img_url)
    ext = "jpg"
    if img_url.lower().endswith(".png"):
        ext = "png"
    elif img_url.lower().endswith(".webp"):
        ext = "webp"
    tmp_path = os.path.join(TEMP_DIR, f"watson_{slug}.{ext}")
    try:
        r = requests.get(img_url, headers=HEADERS_UA, timeout=30, stream=True)
        if r.status_code != 200:
            print(f"  ⚠ Image download HTTP {r.status_code}: {img_url}")
            return None, None
        with open(tmp_path, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        size = os.path.getsize(tmp_path)
        if size < 5000:
            print(f"  ⚠ Image too small ({size} bytes), skipping: {slug}")
            os.remove(tmp_path)
            return None, None
        return tmp_path, ext
    except Exception as e:
        print(f"  ✗ download error for {slug}: {e}")
        return None, None


def upload_to_storage(local_path, slug, ext):
    """Upload image to Supabase Storage, return public URL."""
    storage_path = f"watson/{slug}.{ext}"
    content_type = "image/png" if ext == "png" else ("image/webp" if ext == "webp" else "image/jpeg")
    url = f"{STORAGE_URL}/{storage_path}"
    try:
        with open(local_path, "rb") as f:
            r = requests.post(
                url,
                headers={
                    "Authorization": f"Bearer {SERVICE_KEY}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                },
                data=f,
                timeout=60,
            )
        if r.status_code in (200, 201):
            return f"{PUBLIC_URL}/{storage_path}"
        else:
            print(f"  ✗ Storage upload failed {r.status_code}: {r.text[:200]}")
            return None
    except Exception as e:
        print(f"  ✗ upload error for {slug}: {e}")
        return None


def upsert_catalog(product, image_url):
    """Upsert into equipment_catalog, return inserted id."""
    slug = product["slug"]
    name = product["name"].replace("'", "''")
    q = f"""
INSERT INTO equipment_catalog (brand, model, name, muscle_group, equipment_type, exercise_type, image_url)
VALUES (
    'Watson',
    '{slug}',
    '{name}',
    '{product["muscle_group"]}',
    '{product["eq_type"]}',
    '{product["ex_type"]}',
    '{image_url}'
)
ON CONFLICT (brand, model) DO UPDATE SET
    name         = EXCLUDED.name,
    muscle_group = EXCLUDED.muscle_group,
    equipment_type = EXCLUDED.equipment_type,
    exercise_type  = EXCLUDED.exercise_type,
    image_url      = EXCLUDED.image_url
RETURNING id;
"""
    try:
        result = sql(q)
        if result and isinstance(result, list) and result[0].get("id"):
            return result[0]["id"]
        # If RETURNING didn't work (conflict path), fetch the id
        r2 = sql(f"SELECT id FROM equipment_catalog WHERE brand='Watson' AND model='{slug}'")
        if r2:
            return r2[0]["id"]
    except Exception as e:
        print(f"  ✗ upsert_catalog error for {slug}: {e}")
    return None


def insert_exercises(eq_id, ex_types_str):
    """Insert exercise links into equipment_exercises."""
    types = [t.strip() for t in ex_types_str.split(",")]
    inserted = 0
    for t in types:
        names = EXERCISE_TYPE_MAP.get(t, [])
        for ex_name in names:
            ex_name_esc = ex_name.replace("'", "''")
            q = f"""
INSERT INTO equipment_exercises (equipment_id, exercise_id)
VALUES ({eq_id}, '{ex_name_esc}')
ON CONFLICT DO NOTHING;
"""
            try:
                sql(q)
                inserted += 1
            except Exception as e:
                print(f"    ⚠ exercise link error ({ex_name}): {e}")
    return inserted


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print(f"Watson Gym Equipment import — {len(WATSON_PRODUCTS)} products\n")
    ok, skipped, failed = 0, 0, 0

    for i, product in enumerate(WATSON_PRODUCTS, 1):
        slug = product["slug"]
        print(f"[{i:02d}/{len(WATSON_PRODUCTS)}] {slug}")

        # 1. Get image URL
        img_url = product.get("img_url")
        if not img_url:
            print(f"  → fetching og:image...")
            img_url = fetch_og_image(slug)
            time.sleep(1.2)  # polite delay

        if not img_url:
            print(f"  ✗ No image URL, skipping")
            failed += 1
            continue

        # 2. Download
        local_path, ext = download_image(img_url, slug)
        if not local_path:
            print(f"  ✗ Download failed, skipping")
            failed += 1
            continue

        # 3. Upload to Storage
        public_url = upload_to_storage(local_path, slug, ext)
        os.remove(local_path)
        if not public_url:
            print(f"  ✗ Upload failed")
            failed += 1
            continue
        print(f"  ✓ Storage: watson/{slug}.{ext}")

        # 4. Upsert into equipment_catalog
        eq_id = upsert_catalog(product, public_url)
        if not eq_id:
            print(f"  ✗ DB insert failed")
            failed += 1
            continue
        print(f"  ✓ Catalog id={eq_id}")

        # 5. Insert exercise links
        n = insert_exercises(eq_id, product["ex_type"])
        print(f"  ✓ {n} exercise link(s)")

        ok += 1
        time.sleep(0.3)

    print(f"\n{'='*50}")
    print(f"Done: {ok} ok / {skipped} skipped / {failed} failed")
    print(f"Total Watson products in catalog: {ok}")


if __name__ == "__main__":
    main()
