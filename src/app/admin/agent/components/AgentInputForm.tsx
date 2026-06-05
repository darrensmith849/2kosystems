'use client';

import type { FormState } from '../utils/types';
import { PRESETS } from '../utils/presets';

export function AgentInputForm({
  form,
  loading,
  error,
  hasResult,
  onFieldChange,
  onPreset,
  onSubmit,
  onClear,
}: {
  form: FormState;
  loading: boolean;
  error: string | null;
  hasResult: boolean;
  onFieldChange: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPreset: (form: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5">
      {/* Presets */}
      <div className="mb-5 pb-5 border-b border-zinc-200 dark:border-[#1c1c1e]">
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-2.5">
          Quick-fill presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onPreset(p.form)}
              disabled={loading}
              className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#3f3f46] mt-2">
          Fills form fields only — click Analyse to run.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-1.5">
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={onFieldChange('message')}
            rows={6}
            className="w-full rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-3 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors resize-y"
            placeholder="Paste or type the raw enquiry message here…"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={onFieldChange('subject')}
              className="w-full rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              placeholder="Email subject or enquiry topic"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-1.5">
              Source
            </label>
            <input
              type="text"
              value={form.source}
              onChange={onFieldChange('source')}
              className="w-full rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              placeholder="admin_ui"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-1.5">
              Sender name
            </label>
            <input
              type="text"
              value={form.senderName}
              onChange={onFieldChange('senderName')}
              className="w-full rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              placeholder="Full name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-1.5">
              Sender email
            </label>
            <input
              type="email"
              value={form.senderEmail}
              onChange={onFieldChange('senderEmail')}
              className="w-full rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              placeholder="email@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-700 dark:text-[#71717a] mb-1.5">
              Sender phone
            </label>
            <input
              type="tel"
              value={form.senderPhone}
              onChange={onFieldChange('senderPhone')}
              className="w-full rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              placeholder="+27 00 000 0000"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-4 py-3">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-4 py-3 flex items-center gap-3">
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#0f7b3a] border-t-transparent animate-spin shrink-0" />
            <p className="text-sm text-zinc-700 dark:text-[#71717a]">Analysing enquiry — this may take a moment</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !form.message.trim()}
            className="rounded-full bg-[#0f7b3a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Analysing…' : 'Analyse enquiry'}
          </button>
          {(hasResult || form.message) && !loading && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
