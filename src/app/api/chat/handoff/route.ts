import { NextRequest, NextResponse } from "next/server";
import type {
  HandoffRequestBody,
  HandoffResponseBody,
  ChatMessage,
} from "@/lib/chat/types";
import { escapeHtml, isValidEmail, notifyRecipients, sendRaw } from "@/lib/email";
import { postSigmafyLead, SigmafyLeadError } from "@/lib/sigmafy/lead-client";

export const runtime = "nodejs";




async function recordSigmafyLead(payload: HandoffRequestBody) {
  const transcriptText = payload.transcript
    .slice(-20)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const messageParts = [
    payload.requestedHuman
      ? "Visitor requested a human handoff via the chat bot."
      : "New lead captured by the chat bot.",
    payload.detectedIntent ? `Detected intent: ${payload.detectedIntent}` : null,
    transcriptText ? `Recent transcript:\n${transcriptText}` : null,
  ].filter(Boolean);

  try {
    await postSigmafyLead({
      source: "2kosystems-chat-handoff",
      sourcePage: payload.pagePath || "/chat",
      name: payload.lead.name,
      email: payload.lead.email,
      phone: payload.lead.phone || null,
      subject: payload.requestedHuman ? "consultancy" : "general",
      message: messageParts.join("\n\n"),
      receivedAt: payload.timestamp || new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof SigmafyLeadError) {
      console.error(
        "[2kosystems chat] Sigmafy lead error:",
        err.status,
        err.body,
      );
    } else {
      console.error("[2kosystems chat] Sigmafy lead request failed", err);
    }
    throw err;
  }
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

  await sendRaw({
    to: notifyRecipients(),
    subject,
    html: htmlContent,
    text: textContent,
    replyTo: payload.lead.email,
  });
}

async function sendUserConfirmation(payload: HandoffRequestBody) {
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

  await sendRaw({
    to: payload.lead.email,
    subject: "Thanks — the 2KO team will be in touch",
    html: htmlContent,
    text: `Hi ${firstName},\n\nSomeone from the 2KO team will reach out soon with the context from your chat. If you would like to share anything else in the meantime, reply to this email.\n\n— The 2KO Systems team`,
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
    await recordSigmafyLead({ ...body, transcript });
    await sendInternalNotification({ ...body, transcript });
    await sendUserConfirmation(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/chat/handoff failed", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't send that through — please try again or email darren@2kosystems.com." },
      { status: 500 }
    );
  }
}
