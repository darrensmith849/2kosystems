'use client';

// Composer textarea + Send button. Enter submits, Shift+Enter newlines.
// Disabled while loading. The parent owns input state so the same composer
// can be used inside the floating drawer and the full Ask page.

import { useRef, type FormEvent, type KeyboardEvent } from 'react';

export type ChatComposerProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: (value: string) => void;
  busy?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
  autoFocus?: boolean;
};

const DEFAULT_HINT =
  'Enter to send · Shift + Enter for new line · Read-only · No secrets shared';

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  busy = false,
  placeholder = 'Type a question…',
  hint = DEFAULT_HINT,
  rows = 2,
  autoFocus = false,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    onSubmit(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || busy) return;
      onSubmit(trimmed);
    }
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] focus-within:border-white/[0.14] focus-within:bg-white/[0.04] p-3 space-y-2 transition-colors"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={busy}
        autoFocus={autoFocus}
        onKeyDown={handleKeyDown}
        className="w-full resize-none bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500 leading-tight">{hint}</span>
        <button
          type="submit"
          disabled={busy || value.trim().length === 0}
          className="rounded-md bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.14] px-4 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? 'Working…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
