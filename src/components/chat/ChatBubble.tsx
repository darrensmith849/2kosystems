"use client";

import { useChat } from "@/lib/chat/ChatContext";

export default function ChatBubble() {
  const { state, open } = useChat();
  if (state.open) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open chat with 2KO Systems specialist"
      className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border border-accent-border bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/40 transition-colors hover:bg-accent2 hover:text-black active:bg-accent-pressed sm:bottom-6 sm:right-6"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a8 8 0 1 1-3.05-6.29L21 4l-1.71 3.05A8 8 0 0 1 21 12Z" />
        <path d="M8 11h8M8 15h5" />
      </svg>
      <span className="hidden sm:inline">Chat with us</span>
    </button>
  );
}
