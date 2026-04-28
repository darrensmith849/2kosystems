#!/usr/bin/env python3
"""
One-shot imagery fetch for the 2KO Systems site.

- Pulls landscape stock photos from Pexels for industries, case studies and the about hero.
- Generates two abstract brand visuals via Google's gemini-2.5-flash-image (a.k.a. nano-banana).
- Saves into public/imagery/{industries,case-studies,about,generated}/.
- Writes public/imagery/CREDITS.md with Pexels photographer attribution.

Requires PEXELS_API_KEY and NANO_API_KEY in the environment.
"""

import base64
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

PEXELS_KEY = os.environ.get("PEXELS_API_KEY")
NANO_KEY = os.environ.get("NANO_API_KEY")
if not PEXELS_KEY or not NANO_KEY:
    sys.exit("Missing PEXELS_API_KEY or NANO_API_KEY in environment.")

ROOT = Path(__file__).resolve().parents[1]
IMG_ROOT = ROOT / "public" / "imagery"
UA = "Mozilla/5.0 (compatible; 2kosystems-imagery-fetch/1.0)"

# (out-name, search query, preferred size)
INDUSTRIES = [
    ("mining",        "open pit mining haul truck",            "large2x"),
    ("agriculture",   "wheat harvest combine field",            "large2x"),
    ("logistics",     "container shipping port aerial",         "large2x"),
    ("industrial",    "industrial factory technician working",  "large2x"),
    ("compliance",    "modern corporate boardroom dark",        "large2x"),
    ("multi-branch",  "modern retail warehouse interior",       "large2x"),
]

CASE_STUDIES = [
    ("mining",       "mining engineer tablet site",                  "large2x"),
    ("agriculture",  "agricultural drone surveying farmland",        "large2x"),
    ("logistics",    "truck depot loading dock evening",             "large2x"),
    ("training",     "training session meeting room screen",         "large2x"),
    ("industrial",   "engineer reviewing machinery industrial",       "large2x"),
]

ABOUT_HERO = ("hero", "modern operations control room screens", "large2x")

# Brand-coloured AI visuals.
GENERATED = [
    {
        "out": "operational-overview.png",
        "prompt": (
            "Abstract operational dashboard visual. Ultra-dark near-black background "
            "(#040407). Three softly glowing emerald-green data nodes (#0f7b3a) at "
            "different depths, connected by thin curved light trails. Subtle ambient "
            "particles. Premium, minimalist, high-end corporate aesthetic. No text, "
            "no logos, no people. Cinematic depth of field, slight volumetric haze. "
            "Wide 16:9 composition, centred."
        ),
    },
    {
        "out": "process-mesh.png",
        "prompt": (
            "Abstract minimalist process visualisation. Three glowing emerald-green orbs "
            "(#0f7b3a) sitting on a near-black background (#040407), connected left to "
            "right by softly luminous flowing light arcs. Subtle silver-grey accent "
            "highlights. Quiet, premium, restrained, deeply technical aesthetic. No "
            "text, no logos, no people, no UI. Wide 16:9 cinematic composition with "
            "ambient depth haze."
        ),
    },
]

# ---------- helpers ----------

def pexels_search(query: str):
    url = (
        "https://api.pexels.com/v1/search?per_page=4&orientation=landscape&size=large&query="
        + urllib.parse.quote(query)
    )
    req = urllib.request.Request(url, headers={"Authorization": PEXELS_KEY, "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())

def http_get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()

def pick_photo(payload, want_size="large2x"):
    photos = payload.get("photos") or []
    if not photos:
        return None
    photo = photos[0]
    src = photo.get("src", {})
    url = src.get(want_size) or src.get("large") or src.get("original")
    return {
        "id": photo.get("id"),
        "url": url,
        "photographer": photo.get("photographer"),
        "photographer_url": photo.get("photographer_url"),
        "alt": photo.get("alt") or "",
        "page_url": photo.get("url"),
    }

def fetch_pexels_set(jobs, target_dir: Path, credits: list):
    target_dir.mkdir(parents=True, exist_ok=True)
    for slug, query, size in jobs:
        try:
            payload = pexels_search(query)
            photo = pick_photo(payload, size)
            if not photo or not photo["url"]:
                print(f"[skip] {slug}: no photo for '{query}'")
                continue
            data = http_get(photo["url"])
            out_path = target_dir / f"{slug}.jpg"
            out_path.write_bytes(data)
            credits.append(
                {
                    "file": str(out_path.relative_to(ROOT / "public")),
                    "photographer": photo["photographer"],
                    "photographer_url": photo["photographer_url"],
                    "page_url": photo["page_url"],
                    "alt": photo["alt"],
                }
            )
            print(f"[ok] {out_path.relative_to(ROOT)} ({len(data)//1024} KB) <- {photo['photographer']}")
            time.sleep(0.4)  # gentle on the API
        except Exception as e:
            print(f"[fail] {slug}: {e}")

def generate_nano(prompt: str) -> bytes:
    body = json.dumps(
        {
            "contents": [{"parts": [{"text": prompt}]}],
            # Nano-banana ignores most generationConfig fields for image output;
            # leaving them off keeps the request minimal.
        }
    ).encode("utf-8")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash-image:generateContent?key=" + NANO_KEY
    )
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": UA},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        payload = json.loads(r.read())
    parts = (
        payload.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [])
    )
    for p in parts:
        data = p.get("inlineData") or p.get("inline_data")
        if data and data.get("data"):
            return base64.b64decode(data["data"])
    raise RuntimeError(f"No image in response: {json.dumps(payload)[:300]}")

def fetch_generated_set(items, target_dir: Path):
    target_dir.mkdir(parents=True, exist_ok=True)
    for item in items:
        out = target_dir / item["out"]
        try:
            data = generate_nano(item["prompt"])
            out.write_bytes(data)
            print(f"[ok] {out.relative_to(ROOT)} ({len(data)//1024} KB)")
            time.sleep(0.6)
        except Exception as e:
            print(f"[fail] {item['out']}: {e}")

# ---------- run ----------

def main():
    credits = []

    print("== INDUSTRIES (Pexels) ==")
    fetch_pexels_set(INDUSTRIES, IMG_ROOT / "industries", credits)

    print("\n== CASE STUDIES (Pexels) ==")
    fetch_pexels_set(CASE_STUDIES, IMG_ROOT / "case-studies", credits)

    print("\n== ABOUT (Pexels) ==")
    fetch_pexels_set([ABOUT_HERO], IMG_ROOT / "about", credits)

    print("\n== GENERATED (nano-banana / gemini-2.5-flash-image) ==")
    fetch_generated_set(GENERATED, IMG_ROOT / "generated")

    # Write credits
    if credits:
        lines = [
            "# Imagery credits",
            "",
            "Stock photography sourced from [Pexels](https://www.pexels.com) under the [Pexels License](https://www.pexels.com/license/) (free for commercial use, no attribution required, but credited here in good faith).",
            "",
            "Abstract brand visuals in `generated/` were created with Google's `gemini-2.5-flash-image` (nano-banana) via the Google AI API.",
            "",
            "## Pexels photos",
            "",
        ]
        for c in credits:
            line = f"- `{c['file']}` — photo by [{c['photographer']}]({c['photographer_url']})"
            if c.get("page_url"):
                line += f" ([source]({c['page_url']}))"
            lines.append(line)
        (IMG_ROOT / "CREDITS.md").write_text("\n".join(lines) + "\n")
        print(f"\nCredits written to {IMG_ROOT / 'CREDITS.md'}")

if __name__ == "__main__":
    main()
