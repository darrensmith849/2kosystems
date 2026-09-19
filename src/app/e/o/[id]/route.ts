import { NextRequest } from "next/server";
import { recordEvent } from "@/lib/tracking/store";

/**
 * Open pixel.
 *
 * Always returns a valid 1×1 GIF, whatever happens. A tracking pixel that can
 * 404 or 500 is a broken image in somebody's email, which is a worse outcome
 * than losing the measurement — so every failure path still returns the image.
 *
 * Read the number it produces with suspicion. Apple Mail Privacy Protection
 * fetches every remote image in every message regardless of whether a human
 * opens it, and Gmail proxies images too. The store flags those at write time;
 * the dashboard separates them.
 */
export const dynamic = "force-dynamic";

// 1×1 transparent GIF.
const GIF = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
  (c) => c.charCodeAt(0),
);

function pixel() {
  return new Response(GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(GIF.byteLength),
      // Without this a second open is served from cache and never counted.
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
    },
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const messageId = id.replace(/\.(gif|png|jpg)$/i, "");
    await recordEvent({
      messageId,
      event: "open",
      source: "pixel",
      ip: req.headers.get("cf-connecting-ip"),
      userAgent: req.headers.get("user-agent"),
    });
  } catch (e) {
    // Never let a logging failure break the image.
    console.error("[track] open failed:", e);
  }
  return pixel();
}
