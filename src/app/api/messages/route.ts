import { NextRequest, NextResponse } from "next/server";
import { recordMessage, recordEvent, type MessageEvent, type EventSource } from "@/lib/tracking/store";
import { NoDatabase } from "@/lib/enquiries/store";

/**
 * Ledger ingest for senders that cannot reach D1 directly.
 *
 * Sigmafy's Laravel app runs on a Hetzner box, so it has no D1 binding — it
 * posts here instead. Workers in this account write to the database directly
 * and skip this endpoint entirely.
 *
 * Accepts a message, an event, or both in one call: a sender usually knows at
 * the same moment that it sent something and that the provider accepted it.
 *
 * Authorised by the same write-only bearer token as the enquiry ingest. It
 * grants the ability to file a record and nothing else — no reads.
 */
export const dynamic = "force-dynamic";

function constantTimeEqual(a: string, b: string) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function authorised(req: NextRequest) {
  const expected = process.env.ENQUIRY_INGEST_TOKEN;
  if (!expected) return false; // fail closed
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return constantTimeEqual(header.slice(7), expected);
}

const EVENTS = new Set([
  "sent", "delivered", "open", "click", "bounce", "complaint", "unsubscribe", "failed",
]);

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 422 });

  try {
    // The message half. Optional, so a later event for an already-filed
    // message does not have to repeat everything about it.
    if (body.site && body.toAddress) {
      await recordMessage({
        id,
        site: String(body.site),
        provider: (String(body.provider ?? "cloudflare") as "cloudflare" | "brevo" | "other"),
        providerId: body.providerId ? String(body.providerId) : undefined,
        fromAddress: String(body.fromAddress ?? ""),
        fromName: body.fromName ? String(body.fromName) : undefined,
        toAddress: String(body.toAddress),
        subject: body.subject ? String(body.subject).slice(0, 500) : undefined,
        template: body.template ? String(body.template).slice(0, 120) : undefined,
        kind: body.kind ? (String(body.kind) as "transactional" | "notification" | "marketing") : undefined,
        enquiryId: body.enquiryId ? String(body.enquiryId) : undefined,
        contactEmail: body.contactEmail ? String(body.contactEmail) : undefined,
        status: body.status ? (String(body.status) as "sent" | "delivered" | "bounced" | "failed") : undefined,
        failedReason: body.failedReason ? String(body.failedReason).slice(0, 500) : undefined,
        meta: body.meta && typeof body.meta === "object" ? (body.meta as Record<string, unknown>) : undefined,
      }, typeof body.sentAt === "string" ? body.sentAt : undefined);
    }

    // The event half.
    if (body.event) {
      const event = String(body.event);
      if (!EVENTS.has(event)) {
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 422 });
      }
      await recordEvent({
        messageId: id,
        event: event as MessageEvent,
        source: (String(body.source ?? "cloudflare") as EventSource),
        occurredAt: typeof body.occurredAt === "string" ? body.occurredAt : undefined,
        url: body.url ? String(body.url).slice(0, 2000) : undefined,
        // A sender reporting its own outcome has no visitor IP or UA to give.
        detail: body.detail && typeof body.detail === "object"
          ? (body.detail as Record<string, unknown>)
          : undefined,
      });
    }

    return NextResponse.json({ ok: true, id }, { status: 202 });
  } catch (e) {
    if (e instanceof NoDatabase) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error("[messages] ingest failed:", e);
    return NextResponse.json({ error: "Could not record the message." }, { status: 500 });
  }
}
