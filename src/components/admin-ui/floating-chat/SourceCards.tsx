'use client';

// Compact source card list rendered below assistant bubbles.
// Source kind mapping: 'db' -> 'live', 'snapshot' -> 'preview', others stay.

import { Badge } from '@/components/admin-ui';
import type { AssistantSource } from './chatTypes';

function sourceLabel(source: AssistantSource['source']): {
  text: string;
  tone: 'green' | 'blue' | 'neutral';
} {
  if (source === 'db') return { text: 'live', tone: 'green' };
  if (source === 'snapshot') return { text: 'preview', tone: 'blue' };
  return { text: source, tone: 'neutral' };
}

export function SourceCards({ sources }: { sources: AssistantSource[] }) {
  if (sources.length === 0) return null;
  const shown = sources.slice(0, 8);
  return (
    <div className="mt-3 rounded-xl border border-[#1c1c1e] bg-[#0a0a0b] p-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
        Related records ({sources.length})
      </p>
      <ul className="space-y-1.5">
        {shown.map((s) => {
          const tag = sourceLabel(s.source);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
              <Badge text={s.type.replace(/_/g, ' ')} tone="neutral" />
              <Badge text={tag.text} tone={tag.tone} />
              {s.url ? (
                <a
                  href={s.url}
                  className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2 truncate"
                >
                  {s.title}
                </a>
              ) : (
                <span className="text-[#e4e4e7] truncate">{s.title}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
