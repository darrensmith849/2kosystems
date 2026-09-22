import { recordMessage } from "@/lib/tracking/store";
import { instrument } from "@/lib/tracking/links";
import { trackingBase } from "@/lib/tracking/domains";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { EnquiryRouting } from "@/lib/enquiry-routing";

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
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "2KO";
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
  /**
   * File this send in the estate ledger, and — for mail going to someone
   * outside the business — rewrite its links and add an open pixel.
   *
   * Omitted entirely for mail that should stay off the record. Everything sent
   * to a person who enquired should carry it: without `enquiryId` the dashboard
   * can show that an email went out but not which enquiry it answered, which is
   * the join that makes the view worth looking at.
   */
  ledger?: {
    /** Groups sends: "enquiry-confirmation", not this one's subject line. */
    template: string;
    site?: string;
    kind?: "transactional" | "notification" | "marketing";
    enquiryId?: string;
    /**
     * Instrument the HTML. False for internal mail — pixels in our own
     * notifications would record staff reading their inbox as engagement,
     * which is noise dressed up as a number.
     */
    track?: boolean;
  };
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

async function send({ to, subject, html, text, replyTo, ledger }: SendInput) {
  const { env } = getCloudflareContext();
  const binding = (env as { EMAIL?: { send: (m: unknown) => Promise<unknown> } })
    .EMAIL;

  if (!binding) {
    throw new Error(
      "EMAIL binding unavailable — run through wrangler, not plain next dev",
    );
  }

  // Minted before the send, so the same id is in the pixel, in every rewritten
  // link and in the ledger row. An open recorded weeks later still names the
  // message that caused it.
  const messageId = crypto.randomUUID();
  const site = ledger?.site ?? "2ko.co.za";
  const secret = process.env.TRACKING_SECRET;
  let body = html;

  if (ledger?.track && secret) {
    try {
      body = await instrument(html, {
        base: trackingBase(site),
        secret,
        messageId,
      });
    } catch (error) {
      // An email that goes out unmeasured beats one that does not go out.
      console.error("[email] instrumenting failed, sending plain:", error);
    }
  }

  await binding.send({
    to,
    from: { email: FROM_ADDRESS, name: FROM_NAME },
    ...(replyTo ? { replyTo } : {}),
    subject,
    html: body,
    // Always both: some clients render text only, and it improves spam scoring.
    text,
  });

  if (!ledger) return;

  // After the send, and unable to undo it. The ledger records what happened, so
  // a database problem must not turn a delivered email into a failure the
  // caller retries — which would send it a second time.
  try {
    const recipient = Array.isArray(to) ? to[0] : to;

    await recordMessage({
      id: messageId,
      site,
      provider: "cloudflare",
      fromAddress: FROM_ADDRESS,
      fromName: FROM_NAME,
      toAddress: recipient,
      subject,
      template: ledger.template,
      kind: ledger.kind ?? "transactional",
      enquiryId: ledger.enquiryId,
      contactEmail: recipient,
      status: "sent",
      meta:
        Array.isArray(to) && to.length > 1 ? { recipients: to.length } : undefined,
    });
  } catch (error) {
    console.error("[email] ledger record failed:", error);
  }
}

export type Enquiry = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  website?: string;
  siteRegion?: string;
  interest?: string;
  processState?: string;
  sponsorStatus?: string;
  workstreamCount?: string;
  trainingPopulation?: string;
  dataReadiness?: string;
  decisionTiming?: string;
  consent?: string;
  message?: string;
  /** Which ad or campaign paid for this visit, when there was one. */
  attribution?: Record<string, string>;
};

type EmailAccent = "ember" | "signal" | "info";

const EMAIL_ACCENTS: Record<EmailAccent, string> = {
  ember: "#d9a95a",
  signal: "#3fb950",
  info: "#6a8cff",
};

export function renderEmailDetailRows(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
${rows.map(([key, value]) => `<tr>
  <td width="38%" valign="top" style="padding:13px 0;border-bottom:1px solid #25282c;color:#8a8f98;font-size:13px;line-height:1.5;">${escapeHtml(key)}</td>
  <td valign="top" style="padding:13px 0;border-bottom:1px solid #25282c;color:#f7f8f8;font-size:13px;font-weight:600;line-height:1.5;">${escapeHtml(value)}</td>
</tr>`).join("")}
</table>`;
}

export function renderEmailStatusPanel({
  label,
  title,
  body,
  accent = "signal",
}: {
  label: string;
  title: string;
  body: string;
  accent?: EmailAccent;
}) {
  const colour = EMAIL_ACCENTS[accent];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;border-collapse:separate;background:#16171a;border:1px solid #292c31;border-left:4px solid ${colour};border-radius:8px;">
  <tr><td style="padding:18px 20px;">
    <p style="margin:0 0 7px;color:${colour};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(label)}</p>
    <p style="margin:0 0 6px;color:#f7f8f8;font-size:16px;font-weight:700;line-height:1.4;">${escapeHtml(title)}</p>
    <p style="margin:0;color:#b4b8bf;font-size:13px;line-height:1.65;">${escapeHtml(body)}</p>
  </td></tr>
</table>`;
}

export function renderEmailButton(label: string, href: string, accent: EmailAccent = "ember") {
  const colour = EMAIL_ACCENTS[accent];
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-collapse:separate;">
  <tr><td bgcolor="${colour}" style="border-radius:7px;">
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 19px;color:#08090a;font-size:13px;font-weight:750;line-height:1;text-decoration:none;">${escapeHtml(label)} &nbsp;→</a>
  </td></tr>
</table>`;
}

export function renderBrandedEmail({
  eyebrow,
  title,
  intro,
  identityLabel,
  identityMeta,
  body,
  preheader,
  accent = "ember",
  footer = "A transactional message from the 2KO team.",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  identityLabel?: string;
  identityMeta?: string;
  body: string;
  preheader?: string;
  accent?: EmailAccent;
  footer?: string;
}) {
  const colour = EMAIL_ACCENTS[accent];
  const initials = (identityLabel || "2KO").replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "2K";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
    @media only screen and (max-width:640px) {
      .email-pad { padding-left:22px !important; padding-right:22px !important; }
      .email-title { font-size:25px !important; }
    }
  </style>
</head>
<body bgcolor="#08090a" style="margin:0;padding:0;background:#08090a;color:#f7f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#08090a" style="width:100%;border-collapse:collapse;background:#08090a;">
  <tr><td align="center" style="padding:36px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f1012" style="width:100%;max-width:640px;border:1px solid #25282c;border-collapse:separate;background:#0f1012;border-radius:12px;overflow:hidden;">
      <tr><td height="4" bgcolor="${colour}" style="height:4px;background:${colour};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td class="email-pad" style="padding:30px 34px 34px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <tr>
            <td valign="middle" style="color:#f7f8f8;font-size:18px;font-weight:800;letter-spacing:-.02em;"><span style="color:${colour};">●</span>&nbsp; 2KO</td>
            <td align="right" valign="middle" style="color:#62666d;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;">South Africa</td>
          </tr>
        </table>

        <p style="margin:34px 0 8px;color:${colour};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
        <h1 class="email-title" style="margin:0;color:#f7f8f8;font-size:30px;font-weight:720;letter-spacing:-.025em;line-height:1.18;">${escapeHtml(title)}</h1>
        ${intro ? `<p style="margin:15px 0 0;color:#b4b8bf;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>` : ""}

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 28px;border:1px solid #292c31;border-collapse:separate;background:#16171a;border-radius:9px;">
          <tr>
            <td style="padding:8px 0 8px 9px;">
              <div style="width:34px;height:34px;border-radius:50%;background:#24272b;color:${colour};font-size:11px;font-weight:800;line-height:34px;text-align:center;">${escapeHtml(initials)}</div>
            </td>
            <td style="padding:8px 14px 8px 10px;">
              <p style="margin:0;color:#f7f8f8;font-size:12px;font-weight:700;line-height:1.35;">${escapeHtml(identityLabel || "2KO")}</p>
              <p style="margin:1px 0 0;color:#8a8f98;font-size:11px;line-height:1.35;">${escapeHtml(identityMeta || "Process improvement")}</p>
            </td>
          </tr>
        </table>

        ${body}

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin-top:34px;border-top:1px solid #25282c;border-collapse:collapse;">
          <tr><td style="padding-top:20px;color:#62666d;font-size:11px;line-height:1.7;">
            <strong style="color:#b4b8bf;">2KO</strong> · Improve the process, train the people, build the system and measure whether the result holds.<br />
            ${escapeHtml(footer)} · <a href="https://www.2ko.co.za" style="color:${colour};text-decoration:none;">2ko.co.za</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Internal notification. Sigmafy remains the durable source of truth. */
export async function sendEnquiryNotification(
  enquiry: Enquiry,
  routing: EnquiryRouting,
  enquiryId?: string,
) {
  const recipients = notifyRecipients();

  const name = `${enquiry.firstName} ${enquiry.lastName}`.trim();
  const partnership = ["improvement-programme", "operational-excellence", "transformation-office", "outcome-partnership"].includes(enquiry.interest ?? "");
  const rows: [string, string][] = [
    ["Reference", routing.reference],
    ["Name", name],
    ["Company", enquiry.company],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || "—"],
    ["Site or region", enquiry.siteRegion || "—"],
    ["Starting point", enquiry.interest || "Not sure"],
    ["Process state", enquiry.processState || "Not supplied"],
    ...(partnership ? [
      ["Executive sponsorship", enquiry.sponsorStatus || "Not supplied"],
      ["Active workstreams", enquiry.workstreamCount || "Not supplied"],
      ["Training population", enquiry.trainingPopulation || "Not supplied"],
      ["Baseline and data", enquiry.dataReadiness || "Not supplied"],
      ["Decision window", enquiry.decisionTiming || "Not supplied"],
    ] as [string, string][] : []),
  ];

  // So you can tell a R2,000 cost-per-enquiry that converts from one that does not.
  const source = enquiry.attribution ?? {};
  const sourceRows = Object.entries(source).map(([k, v]) => [k, v] as [string, string]);

  const html = renderBrandedEmail({
    eyebrow: `New enquiry · ${routing.reference}`,
    title: `${name} submitted a process brief`,
    intro: `${enquiry.company} has been provisionally routed to ${routing.routeLabel}.`,
    identityLabel: "2KO Intake",
    identityMeta: `${routing.routeCode} · routed enquiry`,
    preheader: `${routing.routeCode} · ${routing.routeLabel} · ${name}, ${enquiry.company}`,
    accent: "ember",
    footer: "Internal notification · confirm the route before actioning",
    body: `
${renderEmailStatusPanel({
  label: "Provisional route · human confirmation required",
  title: `${routing.routeCode} · ${routing.routeLabel}`,
  body: `${routing.owner} owns the next decision. Due ${routing.nextActionDueLabel}: ${routing.nextAction}`,
  accent: "signal",
})}
<p style="margin:0 0 7px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Enquiry details</p>
${renderEmailDetailRows(rows)}
${sourceRows.length ? `<p style="margin:28px 0 7px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Came from</p>${renderEmailDetailRows(sourceRows)}` : ""}
${enquiry.message ? `<div style="margin-top:28px;padding:19px 20px;border:1px solid #292c31;border-radius:8px;background:#0b0c0d;"><p style="margin:0 0 9px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">${partnership ? "The operating result" : "The process that keeps going wrong"}</p><p style="margin:0;color:#f7f8f8;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(enquiry.message)}</p></div>` : ""}
${renderEmailButton(`Reply to ${enquiry.firstName}`, `mailto:${enquiry.email}`, "ember")}`,
  });

  const text = [
    `New enquiry — ${routing.reference} — ${name} · ${enquiry.company}`,
    "",
    "PROVISIONAL ROUTE — HUMAN CONFIRMATION REQUIRED",
    `Route: ${routing.routeCode} · ${routing.routeLabel}`,
    `Owner: ${routing.owner}`,
    `Next action due: ${routing.nextActionDueLabel}`,
    `Next action: ${routing.nextAction}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    enquiry.message ? `\nMessage:\n${enquiry.message}` : "",
  ].join("\n");

  await send({
    to: recipients,
    subject: `[${routing.routeCode}] ${routing.reference} — ${name}, ${enquiry.company}`,
    html,
    text,
    // Replying to the notification replies to the enquirer.
    replyTo: enquiry.email,
    // Recorded, so the dashboard shows the enquiry reached us and when, but
    // never instrumented: this one goes to our own inbox.
    ledger: {
      template: "enquiry-notification",
      kind: "notification",
      enquiryId,
      track: false,
    },
  });
}

/** Confirmation to the person who filled the form. */
export async function sendEnquiryConfirmation(
  enquiry: Enquiry,
  routing: EnquiryRouting,
  enquiryId?: string,
) {
  const html = renderBrandedEmail({
    eyebrow: "Enquiry received",
    title: `Thanks, ${enquiry.firstName}. Your brief has landed.`,
    intro: "A person will review what you sent and come back with the smallest responsible next step.",
    identityLabel: "2KO Team",
    identityMeta: "Human review · no automated sales sequence",
    preheader: `${routing.reference} · your enquiry is with the 2KO team`,
    accent: "signal",
    footer: "Sent because you submitted a process brief on 2ko.co.za",
    body: `
${renderEmailDetailRows([
  ["Reference", routing.reference],
  ["Response target", routing.nextActionDueLabel],
  ["Likely starting point", routing.routeLabel],
])}
${renderEmailStatusPanel({
  label: "What happens next",
  title: "One human review. One clear next decision.",
  body: "We will confirm whether the right move is diagnosis, training, automation, a system—or no engagement at all. If it is urgent, reply directly to this email.",
  accent: "signal",
})}
<p style="margin:0;color:#b4b8bf;font-size:13px;line-height:1.7;">Every 2KO price is published, including the day rate for anything outside an agreed scope.</p>
${renderEmailButton("See pricing and terms", "https://www.2ko.co.za/pricing", "signal")}`,
  });

  const text = `Hi ${enquiry.firstName},

We have your enquiry and someone will come back to you within one business day. If it is urgent, reply to this email directly — it reaches a person, not a queue.

Your reference: ${routing.reference}

Every price we charge is published: https://www.2ko.co.za/pricing

2KO`;

  await send({
    to: enquiry.email,
    subject: `${routing.reference} — we have your enquiry — 2KO`,
    html,
    text,
    ledger: {
      template: "enquiry-confirmation",
      kind: "transactional",
      enquiryId,
      track: true,
    },
  });
}
