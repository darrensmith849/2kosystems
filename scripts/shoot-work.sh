#!/usr/bin/env bash
# Re-capture the portfolio screenshots used on /websites/[slug].
#
# Headless Chrome at 1440x900, written out at 760px wide WebP — cards render
# around 380px, so 760 keeps them crisp on a 2x screen without paying for a
# full-size image. Whole set is under 300KB.
#
# URLs are the source of truth in src/lib/websites.ts; keep them in step.
set -euo pipefail
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/work"
TMP=$(mktemp -d)
mkdir -p "$OUT"

# shoot NAME URL [TIME_BUDGET_MS] [TRIM_PX]
#
# TRIM_PX handles sites that pin a cookie note or a chat bubble to the foot of
# the viewport: shoot that much taller, then cut the strip back off the bottom.
# Every capture ends up 1440x900, which is the ratio the cards are cut to — a
# short image would otherwise be scaled up to fill and lose both ends of the
# header off the sides.
shoot() {
  local trim=${4:-0}
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --virtual-time-budget="${3:-12000}" --window-size=1440,$((900 + trim)) \
    --screenshot="$TMP/$1.png" "$2" >/dev/null 2>&1 || { echo "  FAILED $1"; return; }
  # sips -c crops about the centre whatever --cropOffset is given, which eats the
  # header along with the footer, and cwebp -crop black-filled the top. Pillow is
  # the one that anchors where it is told; skip the trim rather than fail if it
  # is not installed.
  if [ "$trim" -gt 0 ]; then
    python3 - "$TMP/$1.png" "$trim" <<'CROP' || echo "  (no Pillow — $1 keeps its footer)"
import sys
from PIL import Image
path, trim = sys.argv[1], int(sys.argv[2])
im = Image.open(path)
im.crop((0, 0, im.width, im.height - trim)).save(path)
CROP
  fi
  cwebp -quiet -q 72 -resize 760 0 "$TMP/$1.png" -o "$OUT/$1.webp"
  echo "  $1"
}

shoot rileys-car-wash       https://rileyscarwash.vercel.app
shoot flex-and-flow         https://flexandflow.vercel.app
shoot moki                  https://lovelace-moki.vercel.app
shoot daniel-jenkins        https://edenlang.vercel.app 25000   # video hero needs longer
shoot coastal-security      https://coastalsecuritysystems.co.za
shoot crosscoders           https://crosscoders.co.za
shoot smart-home-architects https://smart-home-architects.damp-feather-2944.workers.dev/
shoot groenkloof-gym        https://groenkloofgym.co.za/
shoot slabhead              https://slabhead.co.za
shoot activitar             https://activitar.com
shoot vemia                 https://vemia.app 12000 90    # cookie note pinned to the foot
shoot taxup                 https://taxup.app
shoot sigmafy              https://portal.sigmafy.co
shoot tori-trades           https://toritradestodamoon.vercel.app
rm -rf "$TMP"
