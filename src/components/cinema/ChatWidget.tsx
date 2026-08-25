"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const OPENERS = [
  "What would a system cost us?",
  "We run everything on one spreadsheet",
  "How does the audit work?",
];

const GREETING =
  "Ask me anything about what we build, how engagements run, or what things cost — every price on this site is published, so I can just tell you.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
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
        <div className="k-chat" role="dialog" aria-label="2KO Systems assistant">
          <header className="k-chat-head">
            <div className="flex items-center gap-2">
              <span className="k-dot" />
              <span className="text-[13px] font-medium">2KO Systems</span>
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
