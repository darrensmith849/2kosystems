"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat/types";

/**
 * Renders one chat message. Fresh assistant replies (created within the
 * last few seconds) reveal character-by-character at ~50 chars/sec to
 * feel like a real agent typing. User messages and previously-rendered
 * assistant messages (e.g. restored from sessionStorage) display
 * immediately.
 *
 * The effect is disabled under prefers-reduced-motion.
 */

const TYPE_INTERVAL_MS = 18; // ~55 chars/sec
const FRESH_WINDOW_MS = 5000; // messages older than this skip the typewriter

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  const isFreshAssistantRef = useRef<boolean>(false);
  // Decide once on mount whether this bubble should typewriter — based on
  // age + role + reduced motion. Don't re-evaluate as the message updates.
  if (isFreshAssistantRef.current === false) {
    const ageMs = Date.now() - new Date(message.createdAt || 0).getTime();
    isFreshAssistantRef.current =
      !isUser && ageMs >= 0 && ageMs < FRESH_WINDOW_MS && !prefersReducedMotion();
  }

  const [shown, setShown] = useState<string>(
    isFreshAssistantRef.current ? "" : message.content,
  );

  useEffect(() => {
    if (!isFreshAssistantRef.current) {
      // Static — make sure full content is shown.
      setShown(message.content);
      return;
    }
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 1;
      setShown(message.content.slice(0, i));
      if (i >= message.content.length) {
        window.clearInterval(id);
      }
    }, TYPE_INTERVAL_MS);
    return () => window.clearInterval(id);
    // We deliberately key on message.id so a swap/replace re-runs the
    // typewriter for the new content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.id]);

  const isStreaming = isFreshAssistantRef.current && shown.length < message.content.length;

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-accent text-white"
            : "bg-white/[0.04] text-text border border-white/10",
        ].join(" ")}
      >
        {shown}
        {isStreaming && (
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-3 w-[2px] -mb-0.5 bg-text/70 align-baseline animate-pulse motion-reduce:animate-none"
          />
        )}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex w-full justify-start" aria-label="Assistant is typing">
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted2 motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted2 [animation-delay:200ms] motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted2 [animation-delay:400ms] motion-reduce:animate-none" />
      </div>
    </div>
  );
}
