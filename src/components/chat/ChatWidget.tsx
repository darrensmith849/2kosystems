"use client";

import { ChatProvider } from "@/lib/chat/ChatContext";
import ChatBubble from "./ChatBubble";
import ChatPanel from "./ChatPanel";

/**
 * Top-level chat widget wrapper. Mounted once in the root layout.
 * Wraps everything in the ChatProvider so any client component on the
 * site can use `useChat()` to programmatically open the chat.
 */
export default function ChatWidget({ children }: { children?: React.ReactNode }) {
  return (
    <ChatProvider>
      {children}
      <ChatBubble />
      <ChatPanel />
    </ChatProvider>
  );
}
