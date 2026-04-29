import { NextRequest, NextResponse } from "next/server";
import {
  type AuditPayload,
  isValidEmail,
  submitAuditEnquiry,
} from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AuditPayload>;

    const payload: AuditPayload = {
      firstName: String(body.firstName || "").trim(),
      lastName: String(body.lastName || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      company: String(body.company || "").trim(),
      phone: String(body.phone || "").trim(),
      website: String(body.website || "").trim(),
      message: String(body.message || "").trim(),
      honeypot: String(body.honeypot || "").trim(),
    };

    if (payload.honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.company) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isValidEmail(payload.email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await submitAuditEnquiry(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/contact failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong while submitting the form.",
      },
      { status: 500 }
    );
  }
}
