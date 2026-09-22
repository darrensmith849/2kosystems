import { NextRequest, NextResponse } from "next/server";
import { validate, InvalidEnquiry } from "@/lib/enquiries/schema";
import { insertEnquiry, NoDatabase } from "@/lib/enquiries/store";

/**
 * Estate-wide enquiry ingest.
 *
 * Every site in the estate posts here so that an enquiry exists somewhere
 * other than an inbox. sixsigmasouthafrica.co.za and sixsigmauk.com are
 * separate Workers on separate domains, so they come over HTTP with a shared
 * bearer token; this site's own forms call `insertEnquiry` directly.
 *
 * The token is compared in constant time. It is a write-only credential —
 * holding it lets a site file an enquiry and nothing else, and it cannot read
 * anything back.
 */
export const dynamic = "force-dynamic";

function constantTimeEqual(left: string, right: string) {
  const enc = new TextEncoder();
  const a = enc.encode(left);
  const b = enc.encode(right);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    mismatch |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return mismatch === 0;
}

function authorised(req: NextRequest) {
  const expected = process.env.ENQUIRY_INGEST_TOKEN;
  // Fail closed. An unset token means nothing can write, rather than anything
  // being able to.
  if (!expected) return false;
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return constantTimeEqual(header.slice(7), expected);
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  try {
    const enquiry = validate(body);
    // The sending site rarely knows the visitor's country; Cloudflare does.
    enquiry.country ??= req.headers.get("cf-ipcountry") ?? undefined;
    const { id, duplicate } = await insertEnquiry(enquiry);
    return NextResponse.json({ ok: true, id, duplicate }, { status: duplicate ? 200 : 201 });
  } catch (e) {
    if (e instanceof InvalidEnquiry) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    if (e instanceof NoDatabase) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    // Never echo an internal error to a caller — that is how sixsigmauk.com
    // spent fourteen weeks showing prospects a missing-API-key message.
    console.error("[enquiries] insert failed:", e);
    return NextResponse.json({ error: "Could not record the enquiry." }, { status: 500 });
  }
}
