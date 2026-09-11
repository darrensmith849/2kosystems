import OpenAI from "openai";
import { NextRequest } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/chat/knowledge";

/**
 * Site assistant.
 *
 * The knowledge base is a stable ~2.8k-token prefix carried as the first
 * message. OpenAI caches identical prompt prefixes over 1,024 tokens
 * automatically, so from the second turn onward that prefix is billed at a
 * discount — no explicit cache breakpoint to declare, unlike Anthropic's
 * cache_control. It only works while the prefix stays byte-identical, which is
 * why nothing volatile goes into it; the conversation is the only thing that
 * varies.
 *
 * Short-form Q&A over supplied material rather than reasoning work, so a small
 * fast model is the right trade and temperature stays low — this answers
 * questions about published prices, and it should not get inventive about them.
 */

/** Change here, not in a dozen places. */
const MODEL = "gpt-4o-mini";
const MAX_TURNS = 20;

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
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

  const turns = history
    .filter((m) => typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content.slice(0, 4000),
    }));

  if (turns.length === 0 || turns[0].role !== "user") {
    return Response.json({ error: "Nothing to answer." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      temperature: 0.3,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...turns],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (error) {
          // The response has already started, so the only way to tell the
          // visitor is to write the failure into the stream itself.
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
    if (error instanceof OpenAI.RateLimitError) {
      return Response.json(
        { error: "Busy right now — try again in a moment." },
        { status: 429 },
      );
    }
    if (error instanceof OpenAI.AuthenticationError) {
      console.error("Chat auth failed — check OPENAI_API_KEY");
      return Response.json(
        { error: "The assistant is not configured correctly." },
        { status: 503 },
      );
    }
    if (error instanceof OpenAI.APIError) {
      console.error(`Chat API error ${error.status}:`, error.message);
      return Response.json({ error: "The assistant is unavailable." }, { status: 502 });
    }
    console.error("Chat failed:", error);
    return Response.json({ error: "The assistant is unavailable." }, { status: 500 });
  }
}
