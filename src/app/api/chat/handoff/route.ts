import { NextRequest, NextResponse } from "next/server";
import type {
  HandoffRequestBody,
  HandoffResponseBody,
  ChatMessage,
} from "@/lib/chat/types";
import {
  escapeHtml,
  isValidEmail,
  notifyRecipients,
  sendRaw,
  renderBrandedEmail,
  renderEmailButton,
  renderEmailDetailRows,
  renderEmailStatusPanel,
} from "@/lib/email";
import { postSigmafyLead, SigmafyLeadError } from "@/lib/sigmafy/lead-client";
import { apiErrorResponse, readProtectedJson } from "@/lib/api-protection";

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
      source: "2ko-chat-handoff",
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
        "[2ko chat] Sigmafy lead error:",
        err.status,
        err.body,
      );
    } else {
      console.error("[2ko chat] Sigmafy lead request failed", err);
    }
    throw err;
  }
}

function renderTranscriptHtml(transcript: ChatMessage[]) {
  return transcript
    .map((m) => {
      const who =
        m.role === "user"
          ? "Visitor"
          : m.role === "assistant"
            ? "2KO assistant"
            : "System";
      const accent = m.role === "user" ? "#6a8cff" : m.role === "assistant" ? "#3fb950" : "#8a8f98";
      return `<div style="margin:0 0 10px;padding:14px 16px;border:1px solid #292c31;border-left:3px solid ${accent};border-radius:7px;background:#0b0c0d;">
        <p style="margin:0 0 5px;color:${accent};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${who}</p>
        <p style="margin:0;color:#f7f8f8;font-size:13px;line-height:1.65;">${escapeHtml(m.content)}</p>
      </div>`;
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

  const htmlContent = renderBrandedEmail({
    eyebrow: "Chat handoff",
    title: payload.requestedHuman ? `${payload.lead.name} asked for a person` : `New chat lead from ${payload.lead.name}`,
    intro: "The conversation context and contact details are captured below so the visitor does not need to start again.",
    identityLabel: "2KO Assistant",
    identityMeta: "Human handoff · conversation attached",
    preheader: `${payload.lead.name} · ${payload.detectedIntent || "chat handoff"}`,
    accent: "info",
    footer: "Internal notification · reply to continue the conversation",
    body: `
${renderEmailStatusPanel({
  label: "Action required",
  title: payload.requestedHuman ? "A visitor is waiting for a human response." : "A new lead was captured in chat.",
  body: "Review the transcript, confirm the likely route and reply using the contact details below.",
  accent: "info",
})}
<p style="margin:0 0 7px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Contact and context</p>
${renderEmailDetailRows([
  ["Name", payload.lead.name],
  ["Email", payload.lead.email],
  ["Phone", payload.lead.phone || "—"],
  ["From page", payload.pagePath || "—"],
  ["Detected intent", payload.detectedIntent || "—"],
  ["Captured at", payload.timestamp],
])}
<p style="margin:28px 0 10px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Chat transcript</p>
${renderTranscriptHtml(payload.transcript)}
${renderEmailButton("Reply to visitor", `mailto:${payload.lead.email}`, "info")}`,
  });

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
  const htmlContent = renderBrandedEmail({
    eyebrow: "Conversation received",
    title: `Thanks, ${firstName}. You will not need to repeat yourself.`,
    intro: "The 2KO team has received your details together with the context from your chat.",
    identityLabel: "2KO Team",
    identityMeta: "Human follow-up · conversation retained",
    preheader: "Your conversation has reached the 2KO team",
    accent: "signal",
    footer: "Sent because you asked to continue your site conversation with a person",
    body: `
${renderEmailStatusPanel({
  label: "Handoff complete",
  title: "A person now has the context.",
  body: "Someone from 2KO will reach out using the details you supplied. Reply to this email if you would like to add anything in the meantime.",
  accent: "signal",
})}
${renderEmailButton("Visit 2KO", "https://www.2ko.co.za", "signal")}`,
  });

  await sendRaw({
    to: payload.lead.email,
    subject: "Thanks — the 2KO team will be in touch",
    html: htmlContent,
    text: `Hi ${firstName},\n\nSomeone from the 2KO team will reach out soon with the context from your chat. If you would like to share anything else in the meantime, reply to this email.\n\n— The 2KO team`,
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: HandoffRequestBody;
  try {
    body = await readProtectedJson<HandoffRequestBody>(req, {
      endpoint: "chat-handoff",
      limit: 5,
      windowMs: 10 * 60 * 1000,
      maxBodyBytes: 64 * 1024,
    });
  } catch (error) {
    const guarded = apiErrorResponse(error);
    if (guarded) return guarded;
    return NextResponse.json<HandoffResponseBody>({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const lead = body.lead;
  if (!lead?.name || !lead?.email || !isValidEmail(lead.email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid name and email." },
      { status: 400 }
    );
  }

  const transcript = Array.isArray(body.transcript)
    ? body.transcript
        .slice(-20)
        .filter((message) => message && typeof message.content === "string")
        .map((message) => ({ ...message, content: message.content.slice(0, 4_000) }))
    : [];

  try {
    const safeBody = {
      ...body,
      lead: {
        name: lead.name.trim().slice(0, 160),
        email: lead.email.trim().toLowerCase().slice(0, 254),
        phone: lead.phone?.trim().slice(0, 80),
      },
      pagePath: body.pagePath?.slice(0, 500),
      transcript,
    };
    const [sigmafyDelivery, internalNotification] = await Promise.allSettled([
      recordSigmafyLead(safeBody),
      sendInternalNotification(safeBody),
    ]);

    if (sigmafyDelivery.status === "rejected") {
      console.error("chat handoff Sigmafy delivery failed:", sigmafyDelivery.reason);
    }
    if (internalNotification.status === "rejected") {
      console.error("chat handoff internal notification failed:", internalNotification.reason);
    }
    if (sigmafyDelivery.status === "rejected" && internalNotification.status === "rejected") {
      throw new Error("No internal chat-handoff channel succeeded");
    }

    const confirmation = await Promise.allSettled([sendUserConfirmation(safeBody)]);
    if (confirmation[0].status === "rejected") {
      console.error("chat handoff confirmation failed:", confirmation[0].reason);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/chat/handoff failed", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't send that through — please try again or email contact@2ko.co.za." },
      { status: 500 }
    );
  }
}
