import { NextRequest, NextResponse } from "next/server";
import {
  isValidEmail,
  sendEnquiryConfirmation,
  sendEnquiryNotification,
  type Enquiry,
} from "@/lib/email";
import { postSigmafyLead } from "@/lib/sigmafy/lead-client";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Enquiry> & { honeypot?: string };

    // Bots fill hidden fields. Return success so they learn nothing.
    if (String(body.honeypot ?? "").trim()) {
      return NextResponse.json({ ok: true });
    }

    const enquiry: Enquiry = {
      firstName: String(body.firstName ?? "").trim(),
      lastName: String(body.lastName ?? "").trim(),
      email: String(body.email ?? "").trim().toLowerCase(),
      company: String(body.company ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      website: String(body.website ?? "").trim(),
      message: String(body.message ?? "").trim(),
    };

    if (!enquiry.firstName || !enquiry.lastName || !enquiry.email || !enquiry.company) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (!isValidEmail(enquiry.email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // The internal notification is the one that must not be lost, so it is
    // awaited and its failure fails the request.
    await sendEnquiryNotification(enquiry);

    // The confirmation and the CRM push are best-effort — a failure in either
    // must not tell the enquirer their message did not go through.
    const followUps = await Promise.allSettled([
      sendEnquiryConfirmation(enquiry),
      postSigmafyLead({
        source: "2kosystems-contact",
        sourcePage: "/contact",
        name: `${enquiry.firstName} ${enquiry.lastName}`.trim() || enquiry.email,
        email: enquiry.email,
        phone: enquiry.phone || null,
        company: enquiry.company || null,
        subject: "audit-request",
        message: enquiry.message || "Enquiry via 2kosystems contact form",
        receivedAt: new Date().toISOString(),
      }),
    ]);

    for (const result of followUps) {
      if (result.status === "rejected") {
        console.error("contact follow-up failed:", result.reason);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/contact failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not send that. Please try again." },
      { status: 500 },
    );
  }
}
