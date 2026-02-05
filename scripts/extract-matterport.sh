#!/bin/bash
#
# 🏆 MATTERPORT DATA EXTRACTION - MASTER SCRIPT
#
# Ekstraktoi kaikki julkinen data Matterport-tilasta ja luo videon.
#
# Käyttö:
#   ./extract-matterport.sh <MODEL_ID> <KOHDE_NIMI>
#
# Esimerkki:
#   ./extract-matterport.sh SQMmpYKKQ7L niittyportti-2-a21
#
# Tulokset:
#   /opt/vuokra-platform/data/matterport-archive/<KOHDE_NIMI>/
#   /srv/shared/DROPZONE/<KOHDE_NIMI>-tour-web.mp4
#

set -e

# === KONFIGURAATIO ===
ARCHIVE_BASE="/opt/vuokra-platform/data/matterport-archive"
DROPZONE="/srv/shared/DROPZONE"
PUBLIC_VIDEOS="/opt/vuokra-platform/apps/esittely/public/videos"

# === VÄRIT ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GOLD='\033[1;33m'
NC='\033[0m' # No Color

# === FUNKTIOT ===

print_header() {
    echo ""
    echo -e "${GOLD}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GOLD}  🏆 MATTERPORT DATA EXTRACTION${NC}"
    echo -e "${GOLD}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# === PARAMETRIT ===

if [ $# -lt 2 ]; then
    echo "Käyttö: $0 <MODEL_ID> <KOHDE_NIMI>"
    echo ""
    echo "Esimerkki:"
    echo "  $0 SQMmpYKKQ7L niittyportti-2-a21"
    echo ""
    exit 1
fi

MODEL_ID="$1"
KOHDE_NIMI="$2"
OUTPUT_DIR="$ARCHIVE_BASE/$KOHDE_NIMI"

print_header
echo "Model ID:    $MODEL_ID"
echo "Kohde:       $KOHDE_NIMI"
echo "Output:      $OUTPUT_DIR"
echo ""

# === 1. LUO KANSIORAKENNE ===

print_step "Luodaan kansiorakenne..."

mkdir -p "$OUTPUT_DIR/images"
mkdir -p "$OUTPUT_DIR/video/clips"

print_success "Kansiot luotu"

# === 2. HAE METADATA ===

print_step "Haetaan metadata API:sta..."

# Hae perustiedot
METADATA=$(curl -s "https://my.matterport.com/api/player/models/$MODEL_ID")

if echo "$METADATA" | grep -q '"code":"not.found"'; then
    print_error "Model ID $MODEL_ID ei löytynyt!"
fi

# Parsitaan tiedot
MODEL_NAME=$(echo "$METADATA" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name','Unknown'))" 2>/dev/null || echo "Unknown")
MODEL_STATUS=$(echo "$METADATA" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "unknown")

echo "  Nimi: $MODEL_NAME"
echo "  Status: $MODEL_STATUS"

# Tallenna metadata
echo "$METADATA" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))" > "$OUTPUT_DIR/metadata-raw.json" 2>/dev/null || echo "$METADATA" > "$OUTPUT_DIR/metadata-raw.json"

print_success "Metadata tallennettu"

# === 3. HAE KUVA-ID:T ===

print_step "Haetaan kuvalista..."

IMAGES_JSON=$(curl -s "https://my.matterport.com/api/player/models/$MODEL_ID/images")
IMAGE_IDS=$(echo "$IMAGES_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        for img in data:
            print(img.get('sid', ''))
    elif isinstance(data, dict) and 'images' in data:
        for img in data['images']:
            print(img.get('sid', ''))
except:
    pass
" 2>/dev/null)

IMAGE_COUNT=$(echo "$IMAGE_IDS" | grep -c . || echo "0")
echo "  Löytyi $IMAGE_COUNT kuvaa"

if [ "$IMAGE_COUNT" -eq "0" ]; then
    print_error "Kuvia ei löytynyt!"
fi

print_success "Kuvalista haettu"

# === 4. LATAA KUVAT ===

print_step "Ladataan kuvat (tämä kestää hetken)..."

DOWNLOADED=0
for IMAGE_ID in $IMAGE_IDS; do
    if [ -z "$IMAGE_ID" ]; then
        continue
    fi

    # Hae signed URL
    SIGNED_URL=$(curl -s "https://my.matterport.com/api/player/models/$MODEL_ID/images/$IMAGE_ID" | \
        python3 -c "import sys,json; print(json.load(sys.stdin).get('signed_src',''))" 2>/dev/null)

    if [ -n "$SIGNED_URL" ]; then
        curl -sL "$SIGNED_URL" -o "$OUTPUT_DIR/images/$IMAGE_ID.jpg"
        DOWNLOADED=$((DOWNLOADED + 1))
        echo -ne "\r  Ladattu: $DOWNLOADED / $IMAGE_COUNT"
    fi
done

echo ""
print_success "Kuvat ladattu ($DOWNLOADED kpl)"

# === 5. TARKISTA KUVAT ===

print_step "Tarkistetaan kuvien laatu..."

VALID_IMAGES=0
for img in "$OUTPUT_DIR/images"/*.jpg; do
    if [ -f "$img" ]; then
        SIZE=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 100000 ]; then
            VALID_IMAGES=$((VALID_IMAGES + 1))
        else
            rm -f "$img"
        fi
    fi
done

echo "  Kelvollisia kuvia: $VALID_IMAGES"

if [ "$VALID_IMAGES" -lt 3 ]; then
    print_error "Liian vähän kelvollisia kuvia videon luomiseen!"
fi

print_success "Kuvat tarkistettu"

# === 6. LUO VIDEO-KLIPIT ===

print_step "Luodaan video-klipit Ken Burns -efektillä..."

CLIP_NUM=0
for img in "$OUTPUT_DIR/images"/*.jpg; do
    if [ ! -f "$img" ]; then
        continue
    fi

    # Vaihtele zoom-suuntaa
    if [ $((CLIP_NUM % 2)) -eq 0 ]; then
        ZOOM="z='1.0+on/500'"
        PAN_X="x='iw/4+on/5'"
        PAN_Y="y='ih/4'"
    else
        ZOOM="z='1.3-on/500'"
        PAN_X="x='iw/2-on/5'"
        PAN_Y="y='ih/3'"
    fi

    CLIP_FILE="$OUTPUT_DIR/video/clips/clip_$(printf '%02d' $CLIP_NUM).mp4"

    ffmpeg -y -loop 1 -i "$img" \
        -vf "scale=8000:-1,zoompan=${ZOOM}:${PAN_X}:${PAN_Y}:d=150:s=1920x1080:fps=30" \
        -t 5 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p \
        "$CLIP_FILE" 2>/dev/null

    CLIP_NUM=$((CLIP_NUM + 1))
    echo -ne "\r  Klippi: $CLIP_NUM / $VALID_IMAGES"

    # Max 12 klippiä (60 sek video)
    if [ "$CLIP_NUM" -ge 12 ]; then
        break
    fi
done

echo ""
print_success "Klipit luotu ($CLIP_NUM kpl)"

# === 7. YHDISTÄ KLIPIT CROSSFADE-SIIRTYMILLÄ ===

print_step "Yhdistetään klipit crossfade-siirtymillä..."

# Laske offset-arvot (5s per clip - 0.5s fade)
CLIPS=("$OUTPUT_DIR/video/clips"/clip_*.mp4)
CLIP_COUNT=${#CLIPS[@]}

if [ "$CLIP_COUNT" -lt 2 ]; then
    print_error "Liian vähän klippejä yhdistämiseen!"
fi

# Rakenna ffmpeg-komento dynaamisesti
INPUTS=""
FILTER=""
OFFSET=4.5

for i in "${!CLIPS[@]}"; do
    INPUTS="$INPUTS -i ${CLIPS[$i]}"
done

# Ensimmäinen xfade
FILTER="[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v01]"
PREV="v01"

for ((i=2; i<CLIP_COUNT; i++)); do
    OFFSET=$(echo "$OFFSET + 4.5" | bc)
    CURR="v$(printf '%02d' $i)"
    if [ $i -eq $((CLIP_COUNT - 1)) ]; then
        CURR="vout"
    fi
    FILTER="$FILTER;[$PREV][$i:v]xfade=transition=fade:duration=0.5:offset=$OFFSET[$CURR]"
    PREV="$CURR"
done

# Jos vain 2 klippiä, output on v01
if [ "$CLIP_COUNT" -eq 2 ]; then
    FILTER="[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[vout]"
fi

# Suorita ffmpeg
eval "ffmpeg -y $INPUTS -filter_complex \"$FILTER\" -map \"[vout]\" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    \"$OUTPUT_DIR/video/${KOHDE_NIMI}-tour.mp4\"" 2>/dev/null

print_success "Master-video luotu"

# === 8. LUO WEB-VERSIOT ===

print_step "Luodaan web-optimoidut versiot..."

# MP4 web (pienempi)
ffmpeg -y -i "$OUTPUT_DIR/video/${KOHDE_NIMI}-tour.mp4" \
    -vf "fade=t=in:st=0:d=1,fade=t=out:st=$((CLIP_COUNT * 5 - 6)):d=1.5" \
    -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -movflags +faststart \
    "$OUTPUT_DIR/video/${KOHDE_NIMI}-tour-web.mp4" 2>/dev/null

print_success "Web MP4 luotu"

# WebM (pienin)
ffmpeg -y -i "$OUTPUT_DIR/video/${KOHDE_NIMI}-tour.mp4" \
    -vf "fade=t=in:st=0:d=1,fade=t=out:st=$((CLIP_COUNT * 5 - 6)):d=1.5" \
    -c:v libvpx-vp9 -crf 30 -b:v 2M \
    -deadline good -cpu-used 2 \
    "$OUTPUT_DIR/video/${KOHDE_NIMI}-tour.webm" 2>/dev/null

print_success "WebM luotu"

# === 9. SIIVOA VÄLIAIKAISET ===

print_step "Siivotaan väliaikaiset tiedostot..."

rm -rf "$OUTPUT_DIR/video/clips"

print_success "Siivottu"

# === 10. LUO RAPORTTI ===

print_step "Luodaan raportti..."

TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)
IMAGE_SIZE=$(du -sh "$OUTPUT_DIR/images" | cut -f1)
VIDEO_SIZE=$(du -sh "$OUTPUT_DIR/video" | cut -f1)

cat > "$OUTPUT_DIR/RAPORTTI.md" << EOF
# Matterport Extract: $MODEL_NAME

**Model ID:** $MODEL_ID
**Kohde:** $KOHDE_NIMI
**Ekstraktoitu:** $(date '+%Y-%m-%d %H:%M')

---

## Sisältö

| Tyyppi | Määrä | Koko |
|--------|-------|------|
| Kuvat | $VALID_IMAGES kpl | $IMAGE_SIZE |
| Videot | 3 kpl | $VIDEO_SIZE |
| **Yhteensä** | | **$TOTAL_SIZE** |

## Videot

| Tiedosto | Käyttö |
|----------|--------|
| ${KOHDE_NIMI}-tour.mp4 | Master (korkein laatu) |
| ${KOHDE_NIMI}-tour-web.mp4 | Web (optimoitu) |
| ${KOHDE_NIMI}-tour.webm | Pienin koko |

## Sijainti

- Arkisto: \`$OUTPUT_DIR/\`
- Dropzone: \`$DROPZONE/${KOHDE_NIMI}-tour-web.mp4\`
- Web: \`/videos/${KOHDE_NIMI}-tour-web.mp4\`

---

*Generoitu automaattisesti extract-matterport.sh skriptillä*
EOF

print_success "Raportti luotu"

# === 11. KOPIOI DROPZONEEN JA PUBLIC ===

print_step "Kopioidaan dropzoneen ja public-kansioon..."

cp "$OUTPUT_DIR/video/${KOHDE_NIMI}-tour-web.mp4" "$DROPZONE/"
mkdir -p "$PUBLIC_VIDEOS"
cp "$OUTPUT_DIR/video/${KOHDE_NIMI}-tour-web.mp4" "$PUBLIC_VIDEOS/"

print_success "Kopioitu"

# === VALMIS ===

echo ""
echo -e "${GOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${GOLD}  🏆 VALMIS!${NC}"
echo -e "${GOLD}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Arkisto:     $OUTPUT_DIR/"
echo "Dropzone:    $DROPZONE/${KOHDE_NIMI}-tour-web.mp4"
echo "Web:         /videos/${KOHDE_NIMI}-tour-web.mp4"
echo ""
echo "Koko:        $TOTAL_SIZE"
echo "Kuvia:       $VALID_IMAGES kpl"
echo "Video:       $((CLIP_COUNT * 5 - (CLIP_COUNT - 1)))s @ 1080p"
echo ""
