"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "@/lib/chat/ChatContext";
import { CHAT_TURN_CAP } from "@/lib/chat/constants";
import { findScriptedReply } from "@/lib/chat/scriptedReplies";
import { detectIntent, userRequestedHuman } from "@/lib/chat/systemPrompt";
import { trackChatEvent } from "@/lib/chat/analytics";
import type {
  ChatRequestBody,
  ChatResponseBody,
  ScriptedIntent,
} from "@/lib/chat/types";
import MessageBubble, { TypingBubble } from "./MessageBubble";
import QuickReplies from "./QuickReplies";

export default function ChatPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    state,
    userTurns,
    capReached,
    close,
    addUserMessage,
    addAssistantMessage,
    setSending,
  } = useChat();

  const [draft, setDraft] = useState("");
  // Show the starter quick-reply menu. True at the start of a session,
  // false once the visitor takes any action, and re-enabled when the
  // Back button is clicked so the visitor can pick another starter
  // without losing their conversation.
  const [showStartMenu, setShowStartMenu] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages, sending toggles, and handoff state changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.messages.length, state.isSending]);

  // Auto-scroll continuously while the panel is open so the typewriter
  // animation keeps the bottom of the latest reply in view as it grows.
  // Cheap (one DOM read + write every 120ms), and only runs while open.
  useEffect(() => {
    if (!state.open) return;
    const id = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      // Only stick to the bottom if the user is already near the bottom —
      // don't yank them down if they've scrolled up to read history.
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distance < 80) {
        el.scrollTop = el.scrollHeight;
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [state.open]);

  // Close on Escape — common UX expectation for any modal-like overlay.
  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, close]);

  // Lock body scroll on mobile when open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!state.open) return;
    const original = document.body.style.overflow;
    if (window.matchMedia("(max-width: 640px)").matches) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [state.open]);

  if (!state.open) return null;

  const userMessageCount = userTurns;

  function handleQuickReply(intent: ScriptedIntent) {
    trackChatEvent("quick_reply_clicked", { intent });

    if (intent === "talk-to-human") {
      requestHandoff();
      return;
    }

    const qr = findScriptedReply(intent);
    if (!qr?.reply) return;

    addUserMessage(qr.label);
    // Render the scripted reply immediately — no LLM call.
    addAssistantMessage(qr.reply, intent);
    setShowStartMenu(false);
  }

  async function callChatAPI(userText: string) {
    if (capReached) {
      trackChatEvent("turn_cap_reached");
      addAssistantMessage(
        "We've covered a lot of ground here. The fastest next step is to chat with someone from the team — click \"Speak to a real agent\" below and I'll send the conversation through.",
        "free-form"
      );
      return;
    }

    setSending(true);

    // Conversation history sent to model: only user + assistant turns, in order.
    const apiMessages = [...state.messages, { id: "tmp", role: "user" as const, content: userText, createdAt: "" }]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const body: ChatRequestBody = {
      messages: apiMessages,
      lead: state.lead ?? undefined,
      pagePath: pathname || "/",
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ChatResponseBody;
      if (!data.ok) {
        addAssistantMessage(
          "I'm having trouble connecting right now. You can still tell me what you need, or tap \"Speak to a real agent\" below and the team will follow up.",
        );
      } else {
        const intent = detectIntent(data.reply);
        if (intent === "audit-intent") {
          trackChatEvent("audit_intent_detected");
        }
        addAssistantMessage(data.reply, "free-form");
      }
    } catch {
      addAssistantMessage(
        "I'm having trouble connecting right now. You can still tell me what you need, or tap \"Speak to a real agent\" below and the team will follow up.",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || state.isSending) return;
    setDraft("");

    addUserMessage(text);
    setShowStartMenu(false);

    // Detect direct human request → trigger handoff path.
    if (userRequestedHuman(text)) {
      requestHandoff();
      return;
    }

    await callChatAPI(text);
  }

  function requestHandoff() {
    trackChatEvent("human_handoff_requested");
    // The chat session (messages + lead if captured) is already persisted
    // to sessionStorage by the ChatProvider, so the visitor doesn't lose
    // anything by navigating away. Close the panel and route them to the
    // dedicated contact page where they can fill in name / email / message.
    close();
    router.push("/contact");
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-end p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chat with 2KO Systems specialist"
    >
      {/* Backdrop on mobile only */}
      <div
        className="absolute inset-0 bg-black/40 sm:hidden"
        onClick={close}
        aria-hidden="true"
      />

      <div
        className="relative flex h-full w-full flex-col overflow-hidden border border-white/10 bg-background shadow-2xl sm:h-[600px] sm:w-[380px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-accent/20 text-accent text-sm font-bold"
            >
              2KO
            </span>
            <div>
              <p className="text-sm font-semibold text-text leading-tight">
                Talk to our Specialist
              </p>
              <p className="text-[11px] text-muted2 leading-tight">2KO Systems</p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close chat"
            className="rounded-full p-1.5 text-muted hover:bg-white/5 hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto" role="list">
          <div className="flex flex-col gap-2.5 p-4">
            {state.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {state.isSending && <TypingBubble />}
          </div>

          {showStartMenu ? (
            <QuickReplies onSelect={handleQuickReply} disabled={state.isSending} />
          ) : (
            !capReached && (
              <div className="px-4 pt-3 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    trackChatEvent("start_menu_reopened");
                    setShowStartMenu(true);
                  }}
                  disabled={state.isSending}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:bg-white/[0.08] hover:text-text disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Back to questions
                </button>
              </div>
            )
          )}

          {capReached && (
            <p className="mx-4 my-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted">
              We&apos;ve gone deep — the fastest next step is a real conversation. Click <strong>Speak to a real agent</strong> below and I&apos;ll send everything through.
            </p>
          )}
        </div>

        {/* Input + actions */}
        <div className="border-t border-white/10 bg-background/95">
          <div className="flex items-end gap-2 p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={capReached ? "Turn limit reached — please use the agent button." : "Ask anything…"}
              rows={1}
              disabled={state.isSending || capReached}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text placeholder:text-muted2 focus:border-accent/60 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={state.isSending || !draft.trim() || capReached}
              aria-label="Send message"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent2 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/5 px-3 py-2">
            <button
              type="button"
              onClick={requestHandoff}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:border-accent/40 hover:bg-white/[0.06]"
            >
              Speak to a real agent
            </button>
            <p className="text-[10px] leading-tight text-muted2 text-right">
              You&apos;re chatting with an AI assistant.
              <br />
              <Link href="/privacy" className="underline hover:text-text">
                Privacy policy
              </Link>
            </p>
          </div>
        </div>

        {/* Cap pill (UI hint) */}
        {userMessageCount > 0 && userMessageCount < CHAT_TURN_CAP && (
          <span className="sr-only">{`${userMessageCount} of ${CHAT_TURN_CAP} turns used`}</span>
        )}
      </div>
    </div>
  );
}
