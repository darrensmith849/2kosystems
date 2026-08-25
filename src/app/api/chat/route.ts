import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/chat/knowledge";

/**
 * Site assistant.
 *
 * The knowledge base is a stable ~2k-token prefix, so it carries a
 * `cache_control` breakpoint — every turn after the first reads it from cache
 * at roughly a tenth of the input cost. Nothing volatile goes into `system`;
 * the conversation is the only thing that varies.
 *
 * Effort is deliberately low: this is short-form Q&A over supplied material,
 * not reasoning work, and low effort keeps replies fast.
 */

const MODEL = "claude-opus-5";
const MAX_TURNS = 20;

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "The assistant is not configured yet." },
      { status: 503 },
    );
  }

  let history: IncomingMessage[];
  try {
    const body = (await req.json()) as { messages?: IncomingMessage[] };
    history = Array.isArray(body.messages) ? body.messages : [];
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = history
    .filter((m) => typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.slice(0, 4000),
    }));

  if (messages.length === 0 || messages[0].role !== "user") {
    return Response.json({ error: "Nothing to answer." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error("Chat stream failed:", error);
          controller.enqueue(
            encoder.encode(
              "\n\nSomething went wrong on our side. Please try again, or use the contact page.",
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "Busy right now — try again in a moment." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Chat auth failed — check ANTHROPIC_API_KEY");
      return Response.json(
        { error: "The assistant is not configured correctly." },
        { status: 503 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Chat API error ${error.status}:`, error.message);
      return Response.json({ error: "The assistant is unavailable." }, { status: 502 });
    }
    console.error("Chat failed:", error);
    return Response.json({ error: "The assistant is unavailable." }, { status: 500 });
  }
}
