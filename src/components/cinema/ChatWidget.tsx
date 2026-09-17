"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import TurnstileWidget, { verifyTurnstileToken } from "@/components/cinema/TurnstileWidget";

type Msg = { role: "user" | "assistant"; content: string };

const OPENERS = [
  "Which 2KO service fits our problem?",
  "We need Six Sigma training for a team",
  "Could Sigmafy support our improvement programme?",
  "What would an automation cost?",
];

const GREETING =
  "Ask me anything about what we build, how engagements run, or what things cost — every price on this site is published, so I can just tell you.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffState, setHandoffState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [handoffError, setHandoffError] = useState("");
  const [handoffTurnstileToken, setHandoffTurnstileToken] = useState("");
  const [handoffTurnstileReset, setHandoffTurnstileReset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      const next: Msg[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setDraft("");
      setBusy(true);

      // Placeholder the stream writes into as tokens arrive.
      setMessages([...next, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: null }));
          setMessages([
            ...next,
            {
              role: "assistant",
              content:
                error ??
                "I could not reach the server. The contact page always works.",
            },
          ]);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...next, { role: "assistant", content: acc }]);
        }
      } catch {
        setMessages([
          ...next,
          {
            role: "assistant",
            content: "Something interrupted that. Please try again.",
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [messages, busy],
  );

  async function handoff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setHandoffError("");
    if (!(await verifyTurnstileToken(handoffTurnstileToken))) {
      setHandoffError("Please complete the security check and try again.");
      setHandoffState("error");
      setHandoffTurnstileReset((value) => value + 1);
      return;
    }
    setHandoffState("sending");
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/chat/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            phone: String(formData.get("phone") || ""),
          },
          transcript: messages
            .filter((message) => message.content.trim())
            .map((message, index) => ({
              id: `site-chat-${index + 1}`,
              role: message.role,
              content: message.content,
              createdAt: new Date().toISOString(),
              intent: "free-form",
            })),
          pagePath: `${window.location.pathname}${window.location.search}`,
          requestedHuman: true,
          detectedIntent: "visitor-requested-handoff",
          timestamp: new Date().toISOString(),
        }),
      });
      const result = await response.json().catch(() => ({ ok: false }));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not send the conversation.");
      }
      setHandoffState("sent");
    } catch (error) {
      setHandoffError(error instanceof Error ? error.message : "Could not send the conversation.");
      setHandoffState("error");
      setHandoffTurnstileReset((value) => value + 1);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="k-chat-launch"
        aria-expanded={open}
        aria-label={open ? "Close the assistant" : "Open the assistant"}
      >
        <span className="k-dot" />
        <span>{open ? "Close" : "Ask a question"}</span>
      </button>

      {open && (
        <div className="k-chat" role="dialog" aria-label="2KO assistant">
          <header className="k-chat-head">
            <div className="flex items-center gap-2">
              <span className="k-dot" />
              <span className="text-[13px] font-medium">2KO</span>
            </div>
            <span className="k-mono">Assistant</span>
          </header>

          <div ref={scrollRef} className="k-chat-body">
            {messages.length === 0 && (
              <>
                <p className="k-sm">{GREETING}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {OPENERS.map((opener) => (
                    <button
                      key={opener}
                      type="button"
                      onClick={() => send(opener)}
                      className="k-chat-opener"
                    >
                      {opener}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`k-chat-msg k-chat-msg--${msg.role}`}>
                {msg.content ||
                  (busy && i === messages.length - 1 ? (
                    <span className="k-chat-typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : null)}
              </div>
            ))}

            {messages.length > 0 && handoffState !== "sent" && !handoffOpen && (
              <button type="button" onClick={() => setHandoffOpen(true)} className="k-chat-opener mt-4">
                Send this conversation to a person
              </button>
            )}

            {handoffOpen && handoffState !== "sent" && (
              <form onSubmit={handoff} className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--hair-2)] bg-black/25 p-4">
                <div>
                  <p className="text-[13px] font-medium">Continue with a person</p>
                  <p className="k-mono mt-1">We send your details and this conversation to the 2KO team.</p>
                </div>
                <input name="name" required maxLength={160} className="k-chat-input" placeholder="Your name" />
                <input name="email" required type="email" maxLength={254} className="k-chat-input" placeholder="Work email" />
                <input name="phone" maxLength={80} className="k-chat-input" placeholder="Phone · optional" />
                <label className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--warm-45)]">
                  <input type="checkbox" required className="mt-0.5 accent-[var(--ember)]" />
                  <span>I agree that 2KO may contact me about this conversation.</span>
                </label>
                <TurnstileWidget
                  compact
                  onToken={setHandoffTurnstileToken}
                  resetKey={handoffTurnstileReset}
                />
                {handoffError && <p className="text-[11px] text-[var(--ember)]">{handoffError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={handoffState === "sending" || !handoffTurnstileToken} className="k-chat-send min-h-9 flex-1 px-3 text-[11px] disabled:opacity-60">
                    {handoffState === "sending" ? "Sending…" : "Send to 2KO"}
                  </button>
                  <button type="button" onClick={() => setHandoffOpen(false)} className="k-chat-opener px-3 text-[11px]">Cancel</button>
                </div>
              </form>
            )}

            {handoffState === "sent" && (
              <div className="mt-4 rounded-xl border border-[var(--signal)]/30 bg-[var(--signal)]/5 p-4" role="status">
                <p className="text-[13px] font-medium">That has reached the team.</p>
                <p className="k-mono mt-2">A person will respond using the details you provided.</p>
              </div>
            )}
          </div>

          <form
            className="k-chat-foot"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              maxLength={2_000}
              placeholder="Ask about scope, timing or price…"
              className="k-chat-input"
              disabled={busy}
            />
            <button
              type="submit"
              className="k-chat-send"
              disabled={busy || !draft.trim()}
              aria-label="Send"
            >
              &#8593;
            </button>
          </form>

          <p className="k-chat-note">
            Answers come from this site&rsquo;s own published material. For anything
            binding, <Link href="/contact">talk to a person</Link>.
          </p>
        </div>
      )}
    </>
  );
}
