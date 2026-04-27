import { NextRequest, NextResponse } from "next/server";
import type {
  HandoffRequestBody,
  HandoffResponseBody,
  ChatMessage,
} from "@/lib/chat/types";

export const runtime = "nodejs";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "2KO Systems";
const BOOK_AUDIT_TO_EMAIL = process.env.BOOK_AUDIT_TO_EMAIL;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function brevoRequest(path: string, body: unknown) {
  if (!BREVO_API_KEY) throw new Error("Missing BREVO_API_KEY");

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
    throw new Error(`Brevo ${path} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function upsertContact(email: string, name: string, phone?: string) {
  const listId = BREVO_LIST_ID ? Number(BREVO_LIST_ID) : undefined;
  const [firstName, ...rest] = name.split(/\s+/);
  await brevoRequest("/contacts", {
    email,
    attributes: {
      FIRSTNAME: firstName || name,
      LASTNAME: rest.join(" "),
      SMS: phone || undefined,
    },
    listIds: listId ? [listId] : undefined,
    updateEnabled: true,
  });
}

function renderTranscriptHtml(transcript: ChatMessage[]) {
  return transcript
    .map((m) => {
      const who =
        m.role === "user"
          ? `<strong>Visitor:</strong>`
          : m.role === "assistant"
            ? `<strong>2KO bot:</strong>`
            : `<strong>System:</strong>`;
      return `<p style="margin:0 0 12px;color:#111;line-height:1.55;">${who} ${escapeHtml(
        m.content
      )}</p>`;
    })
    .join("");
}

function renderTranscriptText(transcript: ChatMessage[]) {
  return transcript
    .map((m) => {
      const who = m.role === "user" ? "Visitor" : m.role === "assistant" ? "Bot" : "System";
      return `${who}: ${m.content}`;
    })
    .join("\n\n");
}

async function sendInternalNotification(payload: HandoffRequestBody) {
  if (!BREVO_SENDER_EMAIL || !BOOK_AUDIT_TO_EMAIL) {
    throw new Error("Missing BREVO_SENDER_EMAIL or BOOK_AUDIT_TO_EMAIL");
  }

  const subject = payload.requestedHuman
    ? `Chat handoff — ${payload.lead.name} requested an agent`
    : `New chat lead — ${payload.lead.name}`;

  const htmlContent = `
    <html>
      <body style="font-family:Arial,sans-serif;background:#0b0b10;color:#111;margin:0;padding:24px;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#666;">
            2KO Systems — Chat Handoff
          </p>
          <h1 style="margin:0 0 24px;font-size:24px;line-height:1.25;color:#111;">
            ${payload.requestedHuman ? "Visitor requested a real agent" : "New chat lead"}
          </h1>

          <div style="display:grid;gap:8px;margin-bottom:24px;">
            <div><strong>Name:</strong> ${escapeHtml(payload.lead.name)}</div>
            <div><strong>Email:</strong> ${escapeHtml(payload.lead.email)}</div>
            <div><strong>Phone:</strong> ${escapeHtml(payload.lead.phone || "—")}</div>
            <div><strong>From page:</strong> ${escapeHtml(payload.pagePath || "—")}</div>
            <div><strong>Detected intent:</strong> ${escapeHtml(payload.detectedIntent || "—")}</div>
            <div><strong>Captured at:</strong> ${escapeHtml(payload.timestamp)}</div>
          </div>

          <div style="padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
            <p style="margin:0 0 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#666;">
              Chat transcript
            </p>
            ${renderTranscriptHtml(payload.transcript)}
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = [
    `Name: ${payload.lead.name}`,
    `Email: ${payload.lead.email}`,
    `Phone: ${payload.lead.phone || "—"}`,
    `From page: ${payload.pagePath || "—"}`,
    `Intent: ${payload.detectedIntent || "—"}`,
    `Captured at: ${payload.timestamp}`,
    "",
    "Transcript:",
    renderTranscriptText(payload.transcript),
  ].join("\n");

  await brevoRequest("/smtp/email", {
    sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
    to: [{ email: BOOK_AUDIT_TO_EMAIL, name: "2KO Systems" }],
    replyTo: { email: payload.lead.email, name: payload.lead.name },
    subject,
    htmlContent,
    textContent,
  });
}

async function sendUserConfirmation(payload: HandoffRequestBody) {
  if (!BREVO_SENDER_EMAIL) throw new Error("Missing BREVO_SENDER_EMAIL");

  const firstName = payload.lead.name.split(/\s+/)[0] || payload.lead.name;
  const htmlContent = `
    <html>
      <body style="font-family:Arial,sans-serif;background:#0b0b10;color:#111;margin:0;padding:24px;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#666;">2KO Systems</p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#111;">Thanks — we'll be in touch.</h1>
          <p style="margin:0 0 16px;color:#111;">Hi ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 16px;color:#111;line-height:1.7;">
            Someone from the 2KO team will reach out soon with the context from your chat. If you'd like to share anything else in the meantime, reply to this email.
          </p>
          <p style="margin:0;color:#111;line-height:1.7;">— The 2KO Systems team</p>
        </div>
      </body>
    </html>
  `;

  await brevoRequest("/smtp/email", {
    sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
    to: [{ email: payload.lead.email, name: payload.lead.name }],
    subject: "Thanks — the 2KO team will be in touch",
    htmlContent,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<HandoffResponseBody>> {
  let body: HandoffRequestBody;
  try {
    body = (await req.json()) as HandoffRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const lead = body.lead;
  if (!lead?.name || !lead?.email || !isValidEmail(lead.email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid name and email." },
      { status: 400 }
    );
  }

  const transcript = Array.isArray(body.transcript) ? body.transcript.slice(-50) : [];

  try {
    await upsertContact(lead.email, lead.name, lead.phone);
    await sendInternalNotification({ ...body, transcript });
    await sendUserConfirmation(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/chat/handoff failed", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't send that through — please try again or email info@2ko.co.za." },
      { status: 500 }
    );
  }
}
