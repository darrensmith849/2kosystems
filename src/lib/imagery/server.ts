/**
 * Server-only imagery helpers.
 *
 * Centralises all calls to Pexels and the Nano Banana (gemini-2.5-flash-image)
 * APIs. Keys are read via `process.env.*` and MUST never be re-exported or
 * read from a client component.
 *
 * Cached results live under public/imagery/cache/ so subsequent calls hit
 * disk, not the API. A simple disk-based cache is fine for now — Vercel's
 * read-only fs at runtime means we only write during local script runs or
 * inside a route that's allowed write access (we don't enable that yet).
 *
 * If either API fails we fall back to a static asset already shipped under
 * public/imagery/static/, so the site never depends on a live API call.
 */

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { ImageMeta, ImageryIntent } from "./types";

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const NANO_KEY = process.env.NANO_API_KEY;

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, "public", "imagery", "cache");

const PEXELS_QUERY: Record<ImageryIntent, string> = {
  "intelligent-systems": "modern operations control room screens",
  "automation-workflows": "automated factory robotics arm",
  "software-dashboards": "data dashboard analytics screen",
  "neural-architecture": "abstract network nodes connections dark",
  "command-centre": "operations center dark monitors",
  "digital-infrastructure": "server room blue lights",
  "premium-dark-tech": "premium dark technology product",
  "south-african-business": "modern johannesburg office",
  "process-automation": "automated production line",
  "ai-operations": "engineer reviewing dashboard tablet",
};

const NANO_PROMPT: Record<ImageryIntent, string> = {
  "intelligent-systems":
    "Premium 3D isometric workflow visualisation. Floating dark-glass panels showing dashboards and approval gates connected by softly glowing emerald-green lines. Deep navy and near-black background. No text, no logos, no people, no trading or financial imagery. Cinematic 16:9.",
  "automation-workflows":
    "Abstract premium automation pipeline visual. Glowing emerald data tokens flowing left-to-right through five glass nodes. Dark navy background. Soft volumetric light. No text, no logos, no people. 16:9.",
  "software-dashboards":
    "Premium minimal abstract dashboard rendering. Three dark-glass cards floating in deep navy space, each with subtle emerald-green graph elements. No legible text. No logos. 16:9.",
  "neural-architecture":
    "Abstract minimalist neural network visualisation. Soft emerald-green nodes and pale silver edges on a deep navy background. Restrained, premium, calm. No text, no logos. 16:9.",
  "command-centre":
    "Premium cinematic interior of a modern operational command centre at night. Wall of dark glass screens with emerald accent dashboards. No legible text. No people. Volumetric haze. 16:9.",
  "digital-infrastructure":
    "Abstract dark-tech digital infrastructure visual. Vertical accent-green data columns rising through a near-black void. No text. No logos. 16:9.",
  "premium-dark-tech":
    "Abstract premium dark-tech composition. Glass panels, soft accent green light bloom, subtle silver wireframes, deep navy background. No text. No logos. 16:9.",
  "south-african-business":
    "Premium minimal abstract render evoking modernised South African operations. Floating glass panels with subtle accent-green flow lines, deep navy background. No flags. No text. No logos. 16:9.",
  "process-automation":
    "Abstract premium process automation visual. A loop of three glass discs rotating around a central emerald node, soft motion blur, dark background. No text. No logos. 16:9.",
  "ai-operations":
    "Abstract minimal AI-assisted operations visual. A glass core with five light beams radiating outward, each ending in a small floating panel. Emerald accents on near-black. No text. No logos. 16:9.",
};

const STATIC_FALLBACK: Record<ImageryIntent, string> = {
  "intelligent-systems": "/imagery/generated/operational-overview.png",
  "automation-workflows": "/imagery/generated/process-mesh.png",
  "software-dashboards": "/imagery/generated/operational-overview.png",
  "neural-architecture": "/imagery/generated/process-mesh.png",
  "command-centre": "/imagery/about/hero.jpg",
  "digital-infrastructure": "/imagery/generated/process-mesh.png",
  "premium-dark-tech": "/imagery/generated/operational-overview.png",
  "south-african-business": "/imagery/about/hero.jpg",
  "process-automation": "/imagery/generated/process-mesh.png",
  "ai-operations": "/imagery/generated/operational-overview.png",
};

// ---------- cache helpers ----------

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

function cacheKey(intent: ImageryIntent, source: "pexels" | "nano") {
  return `${source}-${intent}`;
}

async function readCache(key: string): Promise<ImageMeta | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, `${key}.json`), "utf8");
    return JSON.parse(raw) as ImageMeta;
  } catch {
    return null;
  }
}

async function writeCache(key: string, meta: ImageMeta) {
  await ensureCacheDir();
  await fs.writeFile(
    path.join(CACHE_DIR, `${key}.json`),
    JSON.stringify(meta, null, 2),
    "utf8",
  );
}

function staticFallback(intent: ImageryIntent): ImageMeta {
  return {
    src: STATIC_FALLBACK[intent],
    width: 1376,
    height: 768,
    source: "static",
    alt: intent.replaceAll("-", " "),
    cachedAt: new Date(0).toISOString(),
  };
}

// ---------- Pexels ----------

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: { large?: string; large2x?: string; original?: string };
};

export async function getPexelsImage(intent: ImageryIntent): Promise<ImageMeta> {
  if (!PEXELS_KEY) return staticFallback(intent);

  const key = cacheKey(intent, "pexels");
  const cached = await readCache(key);
  if (cached) return cached;

  try {
    const url =
      "https://api.pexels.com/v1/search?per_page=1&orientation=landscape&size=large&query=" +
      encodeURIComponent(PEXELS_QUERY[intent]);
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Pexels HTTP ${res.status}`);
    const data = (await res.json()) as { photos?: PexelsPhoto[] };
    const photo = data.photos?.[0];
    if (!photo) throw new Error("No photo returned");

    const meta: ImageMeta = {
      src: photo.src.large2x || photo.src.large || photo.src.original || "",
      width: photo.width,
      height: photo.height,
      source: "pexels",
      alt: photo.alt || intent.replaceAll("-", " "),
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      cachedAt: new Date().toISOString(),
    };
    await writeCache(key, meta);
    return meta;
  } catch (err) {
    console.error("[imagery] pexels error", err);
    return staticFallback(intent);
  }
}

// ---------- Nano Banana (gemini-2.5-flash-image) ----------

/**
 * Generate-and-cache via nano-banana. Returns metadata pointing to the
 * static fallback if the API isn't reachable. Image bytes are NOT downloaded
 * here — production runs use the static fallback. Live generation should be
 * triggered by the build-time `scripts/fetch-imagery.py` which already writes
 * to public/imagery/generated/.
 *
 * This function exists so server components can ask "what's the right
 * image for intent X" with a single call and a guaranteed graceful
 * degradation path.
 */
export async function getNanoImage(intent: ImageryIntent): Promise<ImageMeta> {
  if (!NANO_KEY) return staticFallback(intent);

  const key = cacheKey(intent, "nano");
  const cached = await readCache(key);
  if (cached) return cached;

  // Without writable production fs we can't materialise generated bytes
  // into /public at request time. Cache the prompt-resolved metadata so
  // future calls don't re-query, but use the static fallback URL.
  const meta: ImageMeta = {
    ...staticFallback(intent),
    source: "nano",
    alt: NANO_PROMPT[intent].slice(0, 80),
    cachedAt: new Date().toISOString(),
  };
  await writeCache(key, meta);
  return meta;
}

/**
 * Convenience: pick the best image for an intent, preferring an existing
 * cache, then Pexels, then static fallback. Server components call this.
 */
export async function getImage(
  intent: ImageryIntent,
  prefer: "pexels" | "nano" = "pexels",
): Promise<ImageMeta> {
  if (prefer === "nano") return getNanoImage(intent);
  return getPexelsImage(intent);
}
