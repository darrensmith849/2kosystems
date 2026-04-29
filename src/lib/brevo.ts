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
