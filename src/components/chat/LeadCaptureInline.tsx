"use client";

import { useState } from "react";
import { useChat } from "@/lib/chat/ChatContext";

type Props = {
  /** Optional override for the prompt label. */
  label?: string;
  /** What happens after a successful capture. */
  onCaptured?: () => void;
  /** Whether to require phone (used for handoff). Defaults to false. */
  requirePhone?: boolean;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LeadCaptureInline({ label, onCaptured, requirePhone }: Props) {
  const { setLead, addAssistantMessage } = useChat();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setError("Please share your name.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError("That email doesn't look right.");
      return;
    }
    if (requirePhone && cleanPhone.length < 6) {
      setError("Please share a contact number too.");
      return;
    }

    setLead({ name: cleanName, email: cleanEmail, phone: cleanPhone || undefined });
    addAssistantMessage(
      `Thanks ${cleanName.split(/\s+/)[0]}. What would you like to dig into?`
    );
    onCaptured?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-4 my-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
    >
      <p className="mb-3 text-sm leading-relaxed text-text">
        {label ||
          "I can help narrow this down properly. What should I call you, and what's the best email to reach you on?"}
      </p>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text placeholder:text-muted2 focus:border-accent/60 focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          autoComplete="email"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text placeholder:text-muted2 focus:border-accent/60 focus:outline-none"
        />
        {requirePhone && (
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (so we can call you back)"
            autoComplete="tel"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text placeholder:text-muted2 focus:border-accent/60 focus:outline-none"
          />
        )}
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent2 hover:text-black"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
