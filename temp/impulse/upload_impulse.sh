#!/bin/bash
# Upload Impulse equipment images to Supabase Storage
# Bucket: equipment-images/impulse/

DIR="/Users/claudenasteenish/Desktop/workout-tracker/temp/impulse"
SUPABASE_REF="mqyfdbfdeuwojgexhwpy"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MTU5NiwiZXhwIjoyMDg3NDQ3NTk2fQ.epUp4kV83LbUrHHNmx693G1nNjPGos-NGQiOKP-oJQU"
STORAGE_URL="https://${SUPABASE_REF}.supabase.co/storage/v1/object/equipment-images"

cd "$DIR"

upload() {
  local file=$1
  local model=$(echo "$file" | sed 's/\.[^.]*$//')
  local ext="${file##*.}"

  # Determine content type
  local ctype="image/jpeg"
  if [ "$ext" = "png" ]; then
    ctype="image/png"
  fi

  # Upload to impulse/{model}.{ext}
  local status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${STORAGE_URL}/impulse/${model}.${ext}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: ${ctype}" \
    -H "x-upsert: true" \
    --data-binary "@${file}")

  echo "${model}.${ext}: HTTP ${status}"
}

echo "Uploading Impulse images to Supabase Storage..."
echo ""

# Upload only model files (skip _official, _finix test files)
for f in IT9501.jpg IT9502.jpg IT9503.jpg IT9504.jpg IT9505.jpg IT9506.jpg IT9508.jpg IT9509.jpg IT9510.jpg IT9512.jpg IT9514.jpg IT9515.jpg IT9516.jpg IT9517.jpg IT9518.jpg IT9519.jpg IT9520.jpg IT9521.jpg IT9522.jpg IT9524.jpg IT9526.jpg IT9528.jpg IT9529.jpg IT9530.png IT9532.jpg IT9533.jpg IT9534.jpg IT9537.png IT9538.png IT9539.jpg SL7001.jpg SL7002.jpg SL7003.jpg SL7004.jpg SL7005.jpg SL7006.jpg SL7007.jpg SL7008.jpg SL7013.jpg SL7017.jpg SL7018.jpg SL7019.jpg SL7020.jpg SL7021.jpg SL7023.jpg SL7024.jpg SL7025.jpg SL7026.jpg SL7032.jpg SL7034.jpg SL7036.jpg SL7038.jpg SL7039.jpg SL7042.jpg SL7046.jpg SL7047.jpg SL7055.jpg SL7057.png; do
  upload "$f"
done

echo ""
echo "Done! Total uploaded: 58 files"
