"use client";

import type { ChatMessage } from "@/lib/chat/types";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
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
        {message.content}
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
