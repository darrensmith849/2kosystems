import { NextRequest, NextResponse } from "next/server";
import { CHAT_TURN_WINDOW } from "@/lib/chat/constants";
import { SYSTEM_PROMPT, detectIntent } from "@/lib/chat/systemPrompt";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/chat/types";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Server-side chat endpoint for the 2KO Systems site widget.
 *
 * Calls Google's Gemini API with the server-only NANO_API_KEY. The key
 * never leaves this module. If the key is missing or the upstream call
 * fails, we return a useful intent-aware fallback reply so the visitor
 * always gets a sensible response — never a configuration error.
 */

// ---------- intent-aware fallback (used when Gemini is unreachable) ----------

function fallbackReply(message: string): string {
  const lower = message.toLowerCase();

  if (/(cost|price|expensive|budget|quote)/.test(lower)) {
    return (
      "The cleanest way to bring scope down is to start with one focused workflow rather than a full system build. " +
      "A Pilot validates the approach quickly, lowers risk, and the work carries forward into the larger Build later. " +
      "Which workflow is costing your team the most time each week right now?"
    );
  }

  if (/(start smaller|pilot|small|narrow|first step)/.test(lower)) {
    return (
      "Yes — starting smaller is usually the smartest path. We focus on one painful workflow, ship a tightly scoped " +
      "Pilot, and only expand once it proves useful. Which area would you want to fix first: approvals, reporting, " +
      "admin follow-up, customer communication, or live dashboards?"
    );
  }

  if (/(what do you build|services|solutions|do you do)/.test(lower)) {
    return (
      "2KO Systems builds custom operational software, dashboards, portals, approval flows, automations and AI-assisted " +
      "workflows for businesses that have outgrown spreadsheets, manual admin or outdated systems. " +
      "Are you mainly trying to replace spreadsheets, automate admin, improve reporting, or build a client-facing portal?"
    );
  }

  if (/(audit|systems audit|book|next step)/.test(lower)) {
    return (
      "The Systems Audit is a paid diagnostic that maps your highest-pain workflow, defines the ROI case and " +
      "recommends the first system to build. It's typically a short, focused engagement. " +
      "Which workflow do you suspect is the biggest drag on operations right now?"
    );
  }

  return (
    "Happy to help. 2KO Systems usually starts by understanding the workflow, the bottleneck and the business outcome " +
    "before recommending a build. What process in your business currently feels the most manual, slow, or hard to track?"
  );
}

// ---------- Gemini call ----------

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiResponse = { candidates?: GeminiCandidate[]; error?: { message?: string } };

async function callGemini(
  apiKey: string,
  history: { role: "user" | "assistant"; content: string }[],
  message: string,
): Promise<string | null> {
  // Gemini wants alternating user/model turns. We prepend the system prompt
  // as the first "user" turn (Gemini doesn't expose a separate system role
  // on v1beta), and follow with the trimmed conversation + the new message.
  const trimmed = history.slice(-CHAT_TURN_WINDOW);
  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: "model",
      parts: [
        {
          text:
            "Understood. I'll keep replies focused, premium and consultative, and I'll always end with a useful qualifying question.",
        },
      ],
    },
    ...trimmed.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 420,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as GeminiResponse;
  if (data.error) return null;

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || "";
  return text || null;
}

// ---------- POST handler ----------

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponseBody>> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No messages provided." },
      { status: 400 },
    );
  }

  // The most recent message must be from the user; everything before is history.
  const last = messages[messages.length - 1];
  const userMessage =
    last && last.role === "user" && typeof last.content === "string"
      ? last.content.trim()
      : "";

  if (!userMessage) {
    return NextResponse.json(
      {
        ok: true,
        reply:
          "Tell me what you're trying to improve and I'll point you in the right direction. " +
          "What system or workflow are you trying to fix first?",
      },
      { status: 200 },
    );
  }

  const history = messages
    .slice(0, -1)
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    );

  const apiKey = process.env.NANO_API_KEY;

  // Always return ok:true with a useful reply — even when the upstream API
  // is missing or fails. The visitor never sees a configuration error.
  if (!apiKey) {
    return NextResponse.json({ ok: true, reply: fallbackReply(userMessage) });
  }

  try {
    const reply = await callGemini(apiKey, history, userMessage);
    if (!reply) {
      return NextResponse.json({ ok: true, reply: fallbackReply(userMessage) });
    }
    return NextResponse.json({
      ok: true,
      reply,
      intent: detectIntent(reply),
    });
  } catch (error) {
    console.error("/api/chat failed", error);
    return NextResponse.json({ ok: true, reply: fallbackReply(userMessage) });
  }
}
