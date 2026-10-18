import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse, readProtectedJson } from "@/lib/api-protection";
import { cleanConversation, DEMO_MODEL, LIMITS, SAMPLE, systemPrompt } from "@/lib/kos/receptionist-demo";

/**
 * The live Receptionist demo on 2kosystems.com (and on partners' client pages).
 *
 * WHAT KEEPS THE BILL SMALL. Every reply is a paid call to Claude Sonnet, on a public page, so:
 *   - a Turnstile check before the first message, answered with a signed ticket good for 30 minutes,
 *     so the check is not repeated on every message;
 *   - a per-visitor rate limit (api-protection), short replies (max_tokens), at most LIMITS.userTurns
 *     messages from the visitor per conversation, and a cap on how much text they can send;
 *   - the monthly spend limit on the Anthropic account itself, which is the backstop.
 *
 * Needs the ANTHROPIC_API_KEY secret on the Worker. Without it the demo answers that it is resting,
 * rather than failing. KOS_DEMO_MOCK=1 gives canned replies in local development only.
 */

const VERIFY_URL = "https://turnstile-siteverify-2ko.damp-feather-2944.workers.dev";
const TICKET_MS = 30 * 60 * 1000;

type Body = {
  ticket?: string;
  turnstile?: string;
  business?: { name?: string; facts?: string } | null;
  messages?: unknown;
};

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`kos-demo-ticket|${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function issueTicket(secret: string) {
  const exp = String(Date.now() + TICKET_MS);
  return `${exp}.${await hmac(secret, exp)}`;
}

async function ticketValid(secret: string, ticket: string | undefined) {
  const [exp, sig] = String(ticket ?? "").split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = await hmac(secret, exp);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

async function turnstileOk(token: string | undefined) {
  if (process.env.NODE_ENV !== "production") return true;
  if (!token) return false;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const out = (await res.json().catch(() => ({}))) as { success?: boolean };
    return res.ok && out.success === true;
  } catch {
    return false;
  }
}

function mockReply(last: string) {
  if (/book|saturday|friday|time|slot/i.test(last)) return "Sure. I have Saturday at 08:30 or 10:30. Which suits you?";
  if (/\d{1,2}[:h]\d{2}/.test(last)) return "Done. You're booked. We'll send you a reminder the day before.";
  return "Hi! A cut and colour is R650 and takes about 2 hours. Would you like to book?";
}

export async function POST(req: NextRequest) {
  try {
    const body = await readProtectedJson<Body>(req, { endpoint: "kos-receptionist", limit: 30, windowMs: 10 * 60 * 1000 });

    const messages = cleanConversation(body.messages);
    if (!messages) return NextResponse.json({ ok: false, error: "That conversation could not be read. Start again." }, { status: 400 });

    const ownName = String(body.business?.name ?? "").replace(/\s+/g, " ").trim().slice(0, LIMITS.businessNameChars);
    const ownFacts = String(body.business?.facts ?? "").trim().slice(0, LIMITS.factsChars);
    const own = ownName.length >= 2 && ownFacts.length >= 20;

    const mock = process.env.NODE_ENV !== "production" && process.env.KOS_DEMO_MOCK === "1";
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey && !mock) {
      return NextResponse.json({ ok: false, error: "The demo is resting right now. Please try again later." }, { status: 503 });
    }
    const secret = apiKey ?? "local-mock";

    let ticket = body.ticket;
    if (!(await ticketValid(secret, ticket))) {
      if (!(await turnstileOk(body.turnstile))) {
        return NextResponse.json({ ok: false, error: "check", message: "Please complete the quick check first." }, { status: 403 });
      }
      ticket = await issueTicket(secret);
    }

    if (mock) {
      return NextResponse.json({ ok: true, reply: mockReply(messages[messages.length - 1].text), ticket });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: DEMO_MODEL,
        max_tokens: LIMITS.maxTokens,
        system: systemPrompt(own ? { name: ownName, facts: ownFacts, own: true } : { ...SAMPLE, own: false }),
        messages: messages.map((m) => ({ role: m.role, content: m.text })),
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      console.error("/api/kos/receptionist upstream", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return NextResponse.json({ ok: false, error: "The demo couldn't answer just now. Try again in a moment." }, { status: 502 });
    }
    const out = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const reply = (out.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    if (!reply) return NextResponse.json({ ok: false, error: "The demo couldn't answer just now. Try again in a moment." }, { status: 502 });

    return NextResponse.json({ ok: true, reply, ticket });
  } catch (error) {
    const guarded = apiErrorResponse(error);
    if (guarded) return guarded;
    console.error("/api/kos/receptionist failed", error);
    return NextResponse.json({ ok: false, error: "The demo couldn't answer just now. Try again in a moment." }, { status: 500 });
  }
}
