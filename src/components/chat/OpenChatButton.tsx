"use client";

import { useChat } from "@/lib/chat/ChatContext";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

/**
 * Drop-in replacement for the old `<Link href="/get-started">…</Link>` CTAs.
 * Renders a button styled identically to a link CTA, but opens the chat
 * widget instead of navigating away.
 */
export default function OpenChatButton({ className, children, ...rest }: Props) {
  const { open } = useChat();
  return (
    <button type="button" onClick={open} className={className} {...rest}>
      {children}
    </button>
  );
}
