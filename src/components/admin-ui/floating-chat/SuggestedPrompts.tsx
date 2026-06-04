'use client';

// Suggested prompt chips. Renders the 8 brief-canonical prompts above
// (optionally) a welcome bubble. The parent picks the prompt and submits.

import { SUGGESTED_PROMPTS } from './chatTypes';

export type SuggestedPromptsProps = {
  onPick: (prompt: string) => void;
  disabled?: boolean;
  prompts?: readonly string[];
  showWelcome?: boolean;
  welcomeText?: string;
};

const DEFAULT_WELCOME =
  "Hi! I'm 2KO's ops assistant. Ask me anything about clients, assets, incidents, renewals, or what's blocking the database go-live. Try one of these to get started:";

export function SuggestedPrompts({
  onPick,
  disabled = false,
  prompts = SUGGESTED_PROMPTS,
  showWelcome = true,
  welcomeText = DEFAULT_WELCOME,
}: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col gap-4">
      {showWelcome && (
        <div className="rounded-2xl border border-[#27272a] bg-[#111113] px-4 py-3">
          <p className="text-sm text-[#e4e4e7] leading-relaxed">{welcomeText}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            disabled={disabled}
            className="rounded-full border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-3 py-1.5 text-xs text-[#a1a1aa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
