import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL, CHAT_MAX_TOKENS, CHAT_TURN_WINDOW } from "@/lib/chat/constants";
import { SYSTEM_PROMPT, detectIntent } from "@/lib/chat/systemPrompt";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/chat/types";

export const runtime = "nodejs";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponseBody>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Chat service is not configured." },
      { status: 503 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No messages provided." },
      { status: 400 }
    );
  }

  // Trim to last N turns sent to the model.
  const trimmed = messages.slice(-CHAT_TURN_WINDOW).map((m) => ({
    role: m.role,
    content: typeof m.content === "string" ? m.content.slice(0, 4000) : "",
  }));

  // Optional small lead/page context appended to the system prompt.
  const contextSuffix: string[] = [];
  if (body.lead?.name) contextSuffix.push(`Visitor name: ${body.lead.name}.`);
  if (body.pagePath) contextSuffix.push(`Visitor is on page: ${body.pagePath}.`);

  const systemBlocks = [
    {
      type: "text" as const,
      text: SYSTEM_PROMPT,
      // Cache the long, stable system prompt across requests.
      cache_control: { type: "ephemeral" as const },
    },
    ...(contextSuffix.length
      ? [{ type: "text" as const, text: contextSuffix.join(" ") }]
      : []),
  ];

  try {
    const completion = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: CHAT_MAX_TOKENS,
      system: systemBlocks,
      messages: trimmed,
    });

    const reply =
      completion.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim() ||
      "Sorry — I didn't quite catch that. Could you rephrase, or click \"Speak to a real agent\"?";

    return NextResponse.json({
      ok: true,
      reply,
      intent: detectIntent(reply),
    });
  } catch (error) {
    console.error("/api/chat failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Something interrupted that — please try again, or click \"Speak to a real agent\".",
      },
      { status: 500 }
    );
  }
}
