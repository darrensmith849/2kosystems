"use client";

import { QUICK_REPLIES } from "@/lib/chat/scriptedReplies";
import type { ScriptedIntent } from "@/lib/chat/types";

type Props = {
  onSelect: (intent: ScriptedIntent) => void;
  disabled?: boolean;
};

export default function QuickReplies({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
      {QUICK_REPLIES.map((qr) => (
        <button
          key={qr.intent}
          type="button"
          onClick={() => onSelect(qr.intent)}
          disabled={disabled}
          className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent/40 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {qr.label}
        </button>
      ))}
    </div>
  );
}
