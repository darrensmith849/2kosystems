'use client';

// Compact source card list rendered below assistant bubbles.
// Defaults to 5 visible sources with an emerald-link "Show <n> more sources"
// toggle. Cards with an invalid href degrade to plain text — never broken
// anchors. Stays in sync with the inlined twin in
// src/app/admin/ops/ask/AskClient.tsx until the floating-chat barrel is
// adopted by the Ask page.

import { useState } from 'react';
import { Badge } from '@/components/admin-ui';
import type { AssistantSource } from './chatTypes';

const DEFAULT_VISIBLE = 5;

function sourceLabel(source: AssistantSource['source']): {
  text: string;
  tone: 'green' | 'blue' | 'neutral';
} {
  if (source === 'db') return { text: 'live', tone: 'green' };
  if (source === 'snapshot') return { text: 'preview', tone: 'blue' };
  return { text: source, tone: 'neutral' };
}

function isValidHref(href: string | undefined): href is string {
  if (!href) return false;
  if (href === '#') return false;
  return href.startsWith('/') || href.startsWith('http');
}

export function SourceCards({ sources }: { sources: AssistantSource[] }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  if (sources.length === 0) return null;
  const visible = expanded ? sources : sources.slice(0, DEFAULT_VISIBLE);
  const hidden = sources.length - DEFAULT_VISIBLE;
  const showToggle = sources.length > DEFAULT_VISIBLE;
  return (
    <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <p className="text-xs font-medium text-zinc-500 mb-2">
        Related records ({sources.length})
      </p>
      <ul className="space-y-1">
        {visible.map((s) => {
          const tag = sourceLabel(s.source);
          const valid = isValidHref(s.url);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs py-1">
              <Badge text={s.type.replace(/_/g, ' ')} tone="neutral" />
              <Badge text={tag.text} tone={tag.tone} />
              {valid ? (
                <a
                  href={s.url}
                  className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-200 underline underline-offset-2 truncate text-xs"
                >
                  {s.title}
                </a>
              ) : (
                <span className="text-zinc-700 dark:text-zinc-300 truncate text-xs">{s.title}</span>
              )}
            </li>
          );
        })}
      </ul>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-200"
        >
          {expanded ? 'Show fewer' : `Show ${hidden} more sources`}
        </button>
      )}
    </div>
  );
}
