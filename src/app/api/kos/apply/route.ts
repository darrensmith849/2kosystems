import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, readProtectedJson } from "@/lib/api-protection";
import { insertEnquiry } from "@/lib/enquiries/store";
import {
  escapeHtml,
  isValidEmail,
  notifyRecipients,
  renderBrandedEmail,
  renderEmailDetailRows,
  sendRaw,
} from "@/lib/email";

/**
 * Partner applications from 2kosystems.com/apply. Recorded in the shared
 * enquiries table (site "2kosystems.com") and sent to the team. Later this
 * also creates a pending partner on the platform.
 */

type Body = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  kind?: string;
  clients?: string;
  products?: unknown;
  website?: string;
  message?: string;
  consent?: string;
  honeypot?: string;
  sourcePage?: string;
};

const field = (value: unknown, max = 180) => String(value ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  try {
    const body = await readProtectedJson<Body>(req, {
      endpoint: "kos-apply",
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    // Bots fill hidden fields. Answer as if it worked so they learn nothing.
    if (field(body.honeypot)) return NextResponse.json({ ok: true });

    const application = {
      name: field(body.name, 120),
      company: field(body.company, 180),
      email: field(body.email, 254).toLowerCase(),
      phone: field(body.phone, 60),
      kind: field(body.kind, 80),
      clients: field(body.clients, 40),
      products: (Array.isArray(body.products) ? body.products : [])
        .map((value) => field(value, 40))
        .filter(Boolean)
        .slice(0, 6),
      website: field(body.website, 300),
      message: field(body.message, 2_000),
      sourcePage: field(body.sourcePage, 200) || "/apply",
    };

    if (!application.name || !application.company || !application.email || field(body.consent, 10) !== "yes") {
      return NextResponse.json({ ok: false, error: "Please fill in your name, business, email and the tick box." }, { status: 400 });
    }
    if (!isValidEmail(application.email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const rows: [string, string][] = [
      ["Name", application.name],
      ["Business", application.company],
      ["Email", application.email],
      ["Phone", application.phone || "—"],
      ["What they do", application.kind || "—"],
      ["Small-business clients", application.clients || "—"],
      ["Would sell", application.products.join(", ") || "Not sure yet"],
      ["Website", application.website || "—"],
    ];

    let enquiryId: string | undefined;
    let recorded = false;
    try {
      ({ id: enquiryId } = await insertEnquiry({
        site: "2kosystems.com",
        kind: "contact",
        sourcePage: application.sourcePage,
        name: application.name,
        email: application.email,
        phone: application.phone || undefined,
        company: application.company,
        subject: "Partner application",
        message: [rows.map(([k, v]) => `${k}: ${v}`).join("\n"), application.message].filter(Boolean).join("\n\n"),
        country: req.headers.get("cf-ipcountry") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
        extra: {
          type: "partner-application",
          partnerKind: application.kind,
          clients: application.clients,
          products: application.products,
          website: application.website,
        },
      }));
      recorded = true;
    } catch (error) {
      console.error("kos apply record failed:", error);
    }

    let notified = false;
    try {
      await sendRaw({
        to: notifyRecipients(),
        replyTo: application.email,
        subject: `Partner application: ${application.company}`,
        html: renderBrandedEmail({
          eyebrow: "2KO Systems",
          title: "New partner application",
          intro: `${application.name} from ${application.company} wants to sell 2KO Systems tools.`,
          body: renderEmailDetailRows(rows) + (application.message ? `<p>${escapeHtml(application.message)}</p>` : ""),
          footer: "An internal notification from 2kosystems.com.",
        }),
        text: [rows.map(([k, v]) => `${k}: ${v}`).join("\n"), application.message].filter(Boolean).join("\n\n"),
        ledger: { template: "kos-partner-application", site: "2kosystems.com", kind: "notification", enquiryId, track: false },
      });
      notified = true;
    } catch (error) {
      console.error("kos apply notification failed:", error);
    }

    // At least one of the two must have worked, or the application is lost.
    if (!recorded && !notified) throw new Error("No delivery channel succeeded");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const guarded = apiErrorResponse(error);
    if (guarded) return guarded;
    console.error("/api/kos/apply failed", error);
    return NextResponse.json({ ok: false, error: "Could not send that. Please try again." }, { status: 500 });
  }
}
