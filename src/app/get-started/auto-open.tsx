"use client";

import { useEffect } from "react";
import { useChat } from "@/lib/chat/ChatContext";

/**
 * When the /get-started page mounts, immediately open the chat widget.
 * Kept as a deep-link fallback so any external link to /get-started still
 * lands the user in the conversational flow.
 */
export default function AutoOpenChat() {
  const { open } = useChat();
  useEffect(() => {
    open();
  }, [open]);
  return null;
}
