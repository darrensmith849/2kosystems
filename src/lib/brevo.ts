const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "2KO Systems";
const BOOK_AUDIT_TO_EMAIL = process.env.BOOK_AUDIT_TO_EMAIL;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

export type AuditPayload = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  website?: string;
  message?: string;
  honeypot?: string;
};

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function brevoRequest(path: string, body: unknown) {
  if (!BREVO_API_KEY) {
    throw new Error("Missing BREVO_API_KEY");
  }

  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    throw new Error(
      `Brevo ${path} failed: ${res.status} ${JSON.stringify(json)}`
    );
  }

  return json;
}

async function upsertBrevoContact(payload: AuditPayload) {
  const listId = BREVO_LIST_ID ? Number(BREVO_LIST_ID) : undefined;

  await brevoRequest("/contacts", {
    email: payload.email,
    listIds: listId ? [listId] : undefined,
    updateEnabled: true,
  });
}

async function sendInternalNotification(payload: AuditPayload) {
  if (!BREVO_SENDER_EMAIL || !BOOK_AUDIT_TO_EMAIL) {
    throw new Error(
      "Missing BREVO_SENDER_EMAIL or BOOK_AUDIT_TO_EMAIL environment variable"
    );
  }

  const fullName = `${payload.firstName} ${payload.lastName}`.trim();
  const subject = `New Systems Audit Request — ${fullName}${payload.company ? ` (${payload.company})` : ""}`;

  const htmlContent = `
    <html>
      <body style="font-family:Arial,sans-serif;background:#0b0b10;color:#111;margin:0;padding:24px;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#666;">
            2KO Systems
          </p>
          <h1 style="margin:0 0 24px;font-size:24px;line-height:1.25;color:#111;">
            New Systems Audit Request
          </h1>

          <div style="display:grid;gap:12px;">
            <div><strong>Name:</strong> ${escapeHtml(fullName)}</div>
            <div><strong>Email:</strong> ${escapeHtml(payload.email)}</div>
            <div><strong>Company:</strong> ${escapeHtml(payload.company || "—")}</div>
            <div><strong>Phone:</strong> ${escapeHtml(payload.phone || "—")}</div>
            <div><strong>Website:</strong> ${escapeHtml(payload.website || "—")}</div>
          </div>

          <div style="margin-top:24px;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#666;">
              Project Notes
            </p>
            <p style="margin:0;white-space:pre-wrap;color:#111;">
              ${escapeHtml(payload.message || "No extra notes provided.")}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await brevoRequest("/smtp/email", {
    sender: {
      email: BREVO_SENDER_EMAIL,
      name: BREVO_SENDER_NAME,
    },
    to: [
      {
        email: BOOK_AUDIT_TO_EMAIL,
        name: "2KO Systems",
      },
    ],
    replyTo: {
      email: payload.email,
      name: fullName,
    },
    subject,
    htmlContent,
  });
}

async function sendUserConfirmation(payload: AuditPayload) {
  if (!BREVO_SENDER_EMAIL) {
    throw new Error("Missing BREVO_SENDER_EMAIL");
  }

  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  const htmlContent = `
    <html>
      <body style="font-family:Arial,sans-serif;background:#0b0b10;color:#111;margin:0;padding:24px;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#666;">
            2KO Systems
          </p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#111;">
            Thanks for your enquiry
          </h1>
          <p style="margin:0 0 16px;color:#111;">
            Hi ${escapeHtml(payload.firstName)},
          </p>
          <p style="margin:0 0 16px;color:#111;line-height:1.7;">
            We've received your Systems Audit request and a member of our team will review it shortly.
          </p>
          <p style="margin:0;color:#111;line-height:1.7;">
            We'll be in touch to confirm the best next step.
          </p>
        </div>
      </body>
    </html>
  `;

  await brevoRequest("/smtp/email", {
    sender: {
      email: BREVO_SENDER_EMAIL,
      name: BREVO_SENDER_NAME,
    },
    to: [
      {
        email: payload.email,
        name: fullName,
      },
    ],
    subject: "We've received your Systems Audit request",
    htmlContent,
  });
}

export async function submitAuditEnquiry(payload: AuditPayload) {
  await upsertBrevoContact(payload);
  await sendInternalNotification(payload);
  await sendUserConfirmation(payload);
}

// Comma-separated internal recipients to cc on every SLA email. Left empty by
// default so no real 2KO addresses are hardcoded — set SLA_CC_EMAILS in the
// environment (e.g. "darren@2ko.co.za,peter777daniel@gmail.com").
function getSlaCcList(): { email: string }[] {
  return (process.env.SLA_CC_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter((e) => isValidEmail(e))
    .map((email) => ({ email }));
}

export type SlaEmailInput = {
  toEmail: string;
  toName: string;
  clientName: string;
  slaPdfBase64: string;
  slaFileName: string;
  briefPdfBase64?: string;
  briefFileName?: string;
  logoBase64?: string;
  logoFileName?: string;
  priceFormatted: string;
  paymentTerms: string;
  paymentMethodLabel: string;
};

const SIGNATURE_HTML = `
  <div style="margin-top:28px;padding-top:8px;">
    <a href="https://www.2kosystems.com" target="_blank" style="text-decoration:none;border:0;">
      <img src="https://www.2kosystems.com/email/sig-daniel.jpg" alt="Daniel Jenkins — 2KO Systems" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;border-radius:10px;" />
    </a>
  </div>`;

// Sends TWO emails so each is clean:
//   1. To the client (cc 2KO): a tidy message + ONLY the SLA PDF attached.
//   2. To 2KO (the cc list): the Project Brief PDF + the client's logo file, so
//      the team has the requirements + brand asset without cluttering the
//      client's email. Returns a status object instead of throwing.
export async function sendSlaEmail(input: SlaEmailInput): Promise<{ sent: boolean; reason?: string }> {
  const cc = getSlaCcList();

  // Attachments: SLA + Project Brief + the client's logo file — all sent to the
  // client AND 2KO (cc), so both always have the brief PDF.
  const attachment: { name: string; content: string }[] = [
    { name: input.slaFileName, content: input.slaPdfBase64 },
  ];
  if (input.briefPdfBase64 && input.briefFileName) {
    attachment.push({ name: input.briefFileName, content: input.briefPdfBase64 });
  }
  if (input.logoBase64 && input.logoFileName) {
    attachment.push({ name: input.logoFileName, content: input.logoBase64 });
  }

  if (process.env.SLA_EMAIL_DRYRUN === "1" || process.env.SLA_EMAIL_DRYRUN === "true") {
    console.info(
      "[sla-email] DRYRUN — skipping send.",
      JSON.stringify({ to: input.toEmail, cc: cc.map((c) => c.email), attachments: attachment.map((a) => a.name) }),
    );
    return { sent: false, reason: "dryrun" };
  }

  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    return { sent: false, reason: "Email is not configured on the server yet." };
  }

  const htmlContent = `
    <html>
      <body style="font-family:Arial,sans-serif;background:#f4f8f4;color:#111;margin:0;padding:24px;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#16a34a;font-weight:bold;">2KO Systems</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0a3517;">Your Service Level Agreement</h1>
          <p style="margin:0 0 16px;color:#111;line-height:1.7;">Hi ${escapeHtml(input.toName || "there")},</p>
          <p style="margin:0 0 16px;color:#111;line-height:1.7;">
            Thank you for completing your onboarding questionnaire for <strong>${escapeHtml(input.clientName)}</strong>.
            Attached are two PDFs for your records: your <strong>Service Level Agreement</strong> and a
            <strong>Project Brief</strong> summarising what you've asked us to build.
          </p>
          <div style="margin:0 0 16px;padding:16px 20px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fcf9;">
            <div style="margin:0 0 6px;"><strong>Project fee:</strong> ${escapeHtml(input.priceFormatted)}</div>
            <div style="margin:0 0 6px;"><strong>Payment terms:</strong> ${escapeHtml(input.paymentTerms)}</div>
            <div><strong>Payment method:</strong> ${escapeHtml(input.paymentMethodLabel)}</div>
          </div>
          <p style="margin:0;color:#111;line-height:1.7;">
            We'll be in touch shortly with the next steps. If anything looks off, just reply to this email.
          </p>
          ${SIGNATURE_HTML}
        </div>
      </body>
    </html>
  `;

  const body: Record<string, unknown> = {
    sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
    to: [{ email: input.toEmail, name: input.toName || input.clientName }],
    subject: `Your 2KO Systems Service Level Agreement — ${input.clientName}`,
    htmlContent,
    attachment,
  };
  if (cc.length > 0) body.cc = cc;

  await brevoRequest("/smtp/email", body);
  return { sent: true };
}
