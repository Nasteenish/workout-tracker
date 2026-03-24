#!/bin/bash
# Download Impulse equipment images
# Priority: official impulsehealthtech.com (full-res) → finixcorp (fallback)

DIR="/Users/claudenasteenish/Desktop/workout-tracker/temp/impulse"
cd "$DIR"

download() {
  local model=$1
  local url=$2
  local ext="${url##*.}"
  local file="${model}.${ext}"

  if [ -f "$file" ] && [ $(stat -f%z "$file" 2>/dev/null || echo 0) -gt 5000 ]; then
    echo "SKIP $model (already exists)"
    return
  fi

  curl -sL -o "$file" "$url" -w "$model: %{http_code} %{size_download}b\n"

  # Check if download was successful
  local size=$(stat -f%z "$file" 2>/dev/null || echo 0)
  if [ "$size" -lt 5000 ]; then
    echo "WARN: $model too small ($size bytes), may be invalid"
    rm -f "$file"
  fi
}

echo "=== IT95 Series (Selectorized) ==="

# Official full-res images (from impulsehealthtech.com)
download "IT9501" "https://www.impulsehealthtech.com/uploads/2480b35e1.jpg"
download "IT9502" "https://www.impulsehealthtech.com/uploads/IT9502-00.jpg"
download "IT9503" "https://www.impulsehealthtech.com/uploads/46a2c864.jpg"
download "IT9504" "https://www.impulsehealthtech.com/uploads/f447e632.jpg"
download "IT9505" "https://www.impulsehealthtech.com/uploads/c412805b.jpg"
download "IT9506" "https://www.impulsehealthtech.com/uploads/3f028e83.jpg"
download "IT9508" "https://www.impulsehealthtech.com/uploads/d348f894.jpg"
download "IT9509" "https://www.impulsehealthtech.com/uploads/d27fa021.jpg"
download "IT9510" "https://www.impulsehealthtech.com/uploads/a2843a85.jpg"
download "IT9530" "https://www.impulsehealthtech.com/uploads/3.png"
download "IT9537" "https://www.impulsehealthtech.com/uploads/asd-1.png"
download "IT9538" "https://www.impulsehealthtech.com/uploads/asd-11.png"
download "IT9539" "https://www.impulsehealthtech.com/uploads/asd-12.jpg"

# Finixcorp fallback for remaining IT95 models
download "IT9512" "https://finixcorp.com/wp-content/uploads/2021/12/IT9512-Shoulder-Press.jpg"
download "IT9514" "https://finixcorp.com/wp-content/uploads/2021/12/IT9514-Abdominal.jpg"
download "IT9515" "https://finixcorp.com/wp-content/uploads/2021/12/IT9515-Pec-Fly-Rear-Delt.jpg"
download "IT9516" "https://finixcorp.com/wp-content/uploads/2021/12/IT9516-Calf-Raise.jpg"
download "IT9517" "https://finixcorp.com/wp-content/uploads/2021/12/IT9517-Seated-Dip.jpg"
download "IT9518" "https://finixcorp.com/wp-content/uploads/2021/12/IT9518-Torso-Rotation.jpg"
download "IT9519" "https://finixcorp.com/wp-content/uploads/2021/12/IT9519-Vertical-Row.jpg"
download "IT9520" "https://finixcorp.com/wp-content/uploads/2021/12/IT9520-Weight-Assisted-Chin-Dip-Combo.jpg"
download "IT9521" "https://finixcorp.com/wp-content/uploads/2021/12/IT9521-Prone-Leg-Curl.jpg"
download "IT9522" "https://finixcorp.com/wp-content/uploads/2021/12/IT9522-Lat-Pulldown-Vertical-Row.jpg"
download "IT9524" "https://finixcorp.com/wp-content/uploads/2021/12/IT9524-Lateral-Raise.jpg"
download "IT9526" "https://finixcorp.com/wp-content/uploads/2021/12/IT9526-Glute.jpg"
download "IT9528" "https://finixcorp.com/wp-content/uploads/2021/12/IT9528-Leg-Extention-Leg-Curl.jpg"
download "IT9529" "https://finixcorp.com/wp-content/uploads/2021/12/IT9529-Multi-Press.jpg"
download "IT9532" "https://finixcorp.com/wp-content/uploads/2021/12/IT9532-Back-Extension.jpg"
download "IT9533" "https://finixcorp.com/wp-content/uploads/2021/12/IT9533-Bicep-Curl-Tricep-Extension.jpg"
download "IT9534" "https://finixcorp.com/wp-content/uploads/2021/12/IT9534-Abdominal-Back-Extension.jpg"

echo ""
echo "=== SL Series (Plate-loaded) ==="

# Official full-res images
download "SL7001" "https://www.impulsehealthtech.com/uploads/26bc11142.jpg"
download "SL7002" "https://www.impulsehealthtech.com/uploads/46e15a50.jpg"
download "SL7003" "https://www.impulsehealthtech.com/uploads/c99cf1741.jpg"
download "SL7004" "https://www.impulsehealthtech.com/uploads/18f86a0c.jpg"
download "SL7005" "https://www.impulsehealthtech.com/uploads/8350c212.jpg"
download "SL7006" "https://www.impulsehealthtech.com/uploads/4f4afcbf.jpg"
download "SL7007" "https://www.impulsehealthtech.com/uploads/0925ce98.jpg"
download "SL7008" "https://www.impulsehealthtech.com/uploads/3be862ba.jpg"
download "SL7046" "https://www.impulsehealthtech.com/uploads/LATERAL-SUPER-Chest-Press-2.jpg"
download "SL7055" "https://www.impulsehealthtech.com/uploads/SL70555.jpg"
download "SL7057" "https://www.impulsehealthtech.com/uploads/q-2.png"

# Finixcorp fallback for remaining SL models
download "SL7013" "https://finixcorp.com/wp-content/uploads/2021/12/SL7013-Glute-Ham-Bench.jpg"
download "SL7017" "https://finixcorp.com/wp-content/uploads/2021/12/SL7017-Seated-Calf-Raise.jpg"
download "SL7018" "https://finixcorp.com/wp-content/uploads/2021/12/SL7018-Arm-Curl.jpg"
download "SL7019" "https://finixcorp.com/wp-content/uploads/2021/12/SL7019-Incline-Row.jpg"
download "SL7020" "https://finixcorp.com/wp-content/uploads/2021/12/SL7020-Reverse-Leg-Press.jpg"
download "SL7021" "https://finixcorp.com/wp-content/uploads/2021/12/SL7021-Hack-Squat.jpg"
download "SL7023" "https://finixcorp.com/wp-content/uploads/2021/12/SL7023-Bicep-Curl.jpg"
download "SL7024" "https://finixcorp.com/wp-content/uploads/2021/12/SL7024-Tricep-Dip.jpg"
download "SL7025" "https://finixcorp.com/wp-content/uploads/2021/12/SL7025-Leg-Extension.jpg"
download "SL7026" "https://finixcorp.com/wp-content/uploads/2021/12/SL7026-Standing-Leg-Curl.jpg"
download "SL7032" "https://finixcorp.com/wp-content/uploads/2021/12/SL7032-Standing-Calf.jpg"
download "SL7034" "https://finixcorp.com/wp-content/uploads/2021/12/SL7034-Squat.jpg"
download "SL7036" "https://finixcorp.com/wp-content/uploads/2021/12/SL7036-Abdominals.jpg"
download "SL7038" "https://finixcorp.com/wp-content/uploads/2021/12/SL7038-Total-Hip.jpg"
download "SL7039" "https://finixcorp.com/wp-content/uploads/2021/12/SL7039-Standing-Press.jpg"
download "SL7042" "https://finixcorp.com/wp-content/uploads/2021/12/SL7042-Smith-Machine.jpg"
download "SL7047" "https://finixcorp.com/wp-content/uploads/2021/12/SL7047-Multi-Hyper-Extension.jpg"

echo ""
echo "=== SUMMARY ==="
echo "Total files: $(ls -1 IT*.{jpg,png} SL*.{jpg,png} 2>/dev/null | wc -l)"
echo "Total size: $(du -sh . | cut -f1)"
ls -la IT*.{jpg,png} SL*.{jpg,png} 2>/dev/null | awk '{printf "%s %6.0fKB\n", $NF, $5/1024}'
