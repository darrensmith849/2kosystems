'use client';

import { slug } from '../utils/formatters';

export function AdminCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-700 dark:text-[#71717a]">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-zinc-200 dark:border-[#1c1c1e] last:border-0">
      <span className="w-36 shrink-0 text-xs text-zinc-700 dark:text-[#71717a]">{label}</span>
      <span className="text-xs text-zinc-900 dark:text-[#f5f5f5] flex-1">{value}</span>
    </div>
  );
}

export function Badge({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${className ?? 'text-zinc-700 dark:text-[#a1a1aa] border-zinc-200 dark:border-[#27272a]'}`}
    >
      {slug(text)}
    </span>
  );
}

export function CopyBtn({
  text,
  label,
  id,
  copiedKey,
  onCopy,
  disabled,
}: {
  text: string;
  label: string;
  id: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  disabled?: boolean;
}) {
  const copied = copiedKey === id;
  return (
    <button
      type="button"
      onClick={() => !disabled && onCopy(text, id)}
      disabled={disabled}
      className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
