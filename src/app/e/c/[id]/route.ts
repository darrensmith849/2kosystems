import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { recordEvent } from "@/lib/tracking/store";
import { decodeDestination, verify } from "@/lib/tracking/links";

/**
 * Click redirect.
 *
 * The signature is the whole point. A redirect that forwards to whatever `?u=`
 * says is an open redirect — anyone could wrap a phishing destination in this
 * domain's reputation and send it from their own infrastructure. So the
 * destination is HMAC-signed over (messageId, url) at send time and anything
 * that does not verify is refused rather than followed.
 *
 * Recording is best-effort; the redirect is not. Somebody clicked a link in an
 * email and is waiting, so a logging failure must not cost them their
 * destination.
 */
/**
 * The network this request came from, when the edge supplies it.
 *
 * Cloudflare puts the autonomous system number on the request; it is the only
 * reliable way to tell a mail provider fetching on someone's behalf from a
 * person, because the user agent is whatever the fetcher chooses to send.
 * Absent (local dev, or a runtime that does not populate it) the detector
 * falls back to matching user agents.
 */
function requestAsn(): number | null {
  try {
    const asn = (getCloudflareContext().cf as { asn?: number } | undefined)?.asn;
    return typeof asn === "number" ? asn : null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const u = req.nextUrl.searchParams.get("u");
  const sig = req.nextUrl.searchParams.get("s");
  const secret = process.env.TRACKING_SECRET;

  if (!u || !sig || !secret) {
    return NextResponse.json({ error: "Invalid tracking link." }, { status: 400 });
  }

  const destination = decodeDestination(u);
  if (!destination) {
    return NextResponse.json({ error: "Invalid tracking link." }, { status: 400 });
  }

  if (!(await verify(secret, id, destination, sig))) {
    // Deliberately not redirecting, and deliberately not saying why.
    return NextResponse.json({ error: "Invalid tracking link." }, { status: 400 });
  }

  try {
    await recordEvent({
      messageId: id,
      event: "click",
      source: "redirect",
      url: destination,
      ip: req.headers.get("cf-connecting-ip"),
      userAgent: req.headers.get("user-agent"),
      asn: requestAsn(),
    });
  } catch (e) {
    console.error("[track] click failed:", e);
  }

  // 302 rather than 301: a permanent redirect would be cached by the browser
  // and the second click would never reach us.
  return NextResponse.redirect(destination, 302);
}
