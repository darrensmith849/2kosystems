import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Transactional email via Cloudflare Email Service.
 *
 * The Worker's `send_email` binding is the credential — there is no API key to
 * store, rotate or leak, which is the main reason for moving off Brevo.
 *
 * The `from` domain must be onboarded first:
 *   npx wrangler email sending enable <domain>
 */

/** Onboarded sending domain. 2ko.co.za is live; see EMAIL_SETUP.md. */
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "systems@2ko.co.za";
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "2KO Systems";
/** Where enquiries land. Comma-separated. */
const NOTIFY_TO = process.env.EMAIL_NOTIFY_TO ?? "";

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

type SendInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Sends through the binding. Throws when the binding is absent (local `next
 * dev` without wrangler) so callers can fail closed rather than silently drop.
 */
/** Internal recipients for enquiry notifications. */
export function notifyRecipients(): string[] {
  const recipients = NOTIFY_TO.split(",")
    .map((address) => address.trim())
    .filter(isValidEmail);

  if (recipients.length === 0) {
    throw new Error("EMAIL_NOTIFY_TO is not set");
  }
  return recipients;
}

export async function sendRaw(input: SendInput) {
  return send(input);
}

async function send({ to, subject, html, text, replyTo }: SendInput) {
  const { env } = getCloudflareContext();
  const binding = (env as { EMAIL?: { send: (m: unknown) => Promise<unknown> } })
    .EMAIL;

  if (!binding) {
    throw new Error(
      "EMAIL binding unavailable — run through wrangler, not plain next dev",
    );
  }

  await binding.send({
    to,
    from: { email: FROM_ADDRESS, name: FROM_NAME },
    ...(replyTo ? { replyTo } : {}),
    subject,
    html,
    // Always both: some clients render text only, and it improves spam scoring.
    text,
  });
}

export type Enquiry = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  website?: string;
  message?: string;
};

const WRAP = (body: string) => `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#101311;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e0;border-radius:10px;padding:28px;">
${body}
<hr style="border:none;border-top:1px solid #e4e4e0;margin:24px 0;" />
<p style="margin:0;font-size:12px;color:#7c8079;">2KO Systems · Operational systems for South African industry<br />
<a href="https://www.2kosystems.com" style="color:#0f6b34;">2kosystems.com</a></p>
</div></body></html>`;

/** Internal notification — the one that has to arrive. */
export async function sendEnquiryNotification(enquiry: Enquiry) {
  const recipients = notifyRecipients();

  const name = `${enquiry.firstName} ${enquiry.lastName}`.trim();
  const rows: [string, string][] = [
    ["Name", name],
    ["Company", enquiry.company],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || "—"],
    ["Website", enquiry.website || "—"],
  ];

  const html = WRAP(`
<p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">New enquiry</p>
<h1 style="margin:0 0 20px;font-size:20px;font-weight:600;">${escapeHtml(name)} · ${escapeHtml(enquiry.company)}</h1>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
${rows.map(([k, v]) => `<tr><td style="padding:6px 0;color:#7c8079;width:96px;">${k}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`).join("")}
</table>
${enquiry.message ? `<p style="margin:20px 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">The process that keeps going wrong</p><p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(enquiry.message)}</p>` : ""}
<p style="margin:24px 0 0;"><a href="mailto:${escapeHtml(enquiry.email)}" style="display:inline-block;background:#0f6b34;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:600;">Reply to ${escapeHtml(enquiry.firstName)}</a></p>`);

  const text = [
    `New enquiry — ${name} · ${enquiry.company}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    enquiry.message ? `\nMessage:\n${enquiry.message}` : "",
  ].join("\n");

  await send({
    to: recipients,
    subject: `Enquiry — ${name}, ${enquiry.company}`,
    html,
    text,
    // Replying to the notification replies to the enquirer.
    replyTo: enquiry.email,
  });
}

/** Confirmation to the person who filled the form. */
export async function sendEnquiryConfirmation(enquiry: Enquiry) {
  const html = WRAP(`
<p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">Received</p>
<h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Thanks — that has landed.</h1>
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Hi ${escapeHtml(enquiry.firstName)},</p>
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">We have your enquiry and someone will come back to you within one business day. If it is urgent, reply to this email directly — it reaches a person, not a queue.</p>
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">In the meantime, every price we charge is published, including the day rate for out-of-scope work:</p>
<p style="margin:0 0 20px;"><a href="https://www.2kosystems.com/pricing" style="color:#0f6b34;font-weight:600;">See the price list →</a></p>`);

  const text = `Hi ${enquiry.firstName},

We have your enquiry and someone will come back to you within one business day. If it is urgent, reply to this email directly — it reaches a person, not a queue.

Every price we charge is published: https://www.2kosystems.com/pricing

2KO Systems`;

  await send({
    to: enquiry.email,
    subject: "We have your enquiry — 2KO Systems",
    html,
    text,
  });
}
