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

shoot() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --virtual-time-budget="${3:-12000}" --window-size=1440,900 \
    --screenshot="$TMP/$1.png" "$2" >/dev/null 2>&1 || { echo "  FAILED $1"; return; }
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
shoot sa-private-schools    https://saprivateschools.vercel.app
shoot slabhead              https://slabhead.co.za
shoot activitar             https://activitar.com
shoot vemia                 https://my.vemia.app
shoot taxup                 https://taxup.app
shoot sigmafy               https://sigmafynew.vercel.app
shoot tori-trades           https://toritradestodamoon.vercel.app
rm -rf "$TMP"
