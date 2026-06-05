'use client';

// Pure presentational chat thread. Renders user + assistant bubbles, lite
// markdown for assistant text, optional warnings, source cards, and follow-up
// chips on the last assistant message.

import type { ReactNode } from 'react';
import { Badge } from '@/components/admin-ui';
import { SourceCards } from './SourceCards';
import {
  WARNING_LABEL,
  WARNING_TONE,
  type ChatMessage,
} from './chatTypes';

// --------------------------------------------------------------- Markdown lite

function renderInline(text: string, keyHint: number): ReactNode {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/;
  const boldRe = /\*\*([^*]+)\*\*/;
  const italicRe = /_([^_]+)_/;
  const codeRe = /`([^`]+)`/;

  while (remaining.length > 0) {
    const linkMatch = linkRe.exec(remaining);
    const boldMatch = boldRe.exec(remaining);
    const italicMatch = italicRe.exec(remaining);
    const codeMatch = codeRe.exec(remaining);
    const candidates = [
      linkMatch ? { kind: 'link' as const, match: linkMatch } : null,
      boldMatch ? { kind: 'bold' as const, match: boldMatch } : null,
      italicMatch ? { kind: 'italic' as const, match: italicMatch } : null,
      codeMatch ? { kind: 'code' as const, match: codeMatch } : null,
    ].filter(
      (c): c is { kind: 'link' | 'bold' | 'italic' | 'code'; match: RegExpExecArray } =>
        c !== null,
    );

    if (candidates.length === 0) {
      nodes.push(<span key={`t-${keyHint}-${key++}`}>{remaining}</span>);
      break;
    }
    candidates.sort((a, b) => a.match.index - b.match.index);
    const first = candidates[0];
    const before = remaining.slice(0, first.match.index);
    if (before) nodes.push(<span key={`t-${keyHint}-${key++}`}>{before}</span>);

    if (first.kind === 'link') {
      const [, label, url] = first.match;
      nodes.push(
        <a
          key={`a-${keyHint}-${key++}`}
          href={url}
          className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
        >
          {label}
        </a>,
      );
    } else if (first.kind === 'bold') {
      nodes.push(
        <strong
          key={`b-${keyHint}-${key++}`}
          className="text-[#f5f5f5] font-medium"
        >
          {first.match[1]}
        </strong>,
      );
    } else if (first.kind === 'italic') {
      nodes.push(
        <em
          key={`i-${keyHint}-${key++}`}
          className="text-[#a1a1aa] not-italic"
        >
          {first.match[1]}
        </em>,
      );
    } else if (first.kind === 'code') {
      nodes.push(
        <code
          key={`c-${keyHint}-${key++}`}
          className="px-1 py-0.5 rounded bg-[#1c1c1e] text-[12px] font-mono text-emerald-700 dark:text-emerald-300"
        >
          {first.match[1]}
        </code>,
      );
    }
    remaining = remaining.slice(first.match.index + first.match[0].length);
  }
  return nodes;
}

export function renderMarkdownLite(text: string): ReactNode {
  const lines = text.split('\n');
  const out: ReactNode[] = [];
  let listBuffer: ReactNode[] = [];

  function flushList(keyPrefix: string) {
    if (listBuffer.length > 0) {
      out.push(
        <ul key={`ul-${keyPrefix}`} className="my-2 ml-4 list-disc space-y-1">
          {listBuffer}
        </ul>,
      );
      listBuffer = [];
    }
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    const bulletMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      listBuffer.push(
        <li key={`li-${idx}`} className="text-sm text-[#e4e4e7] leading-relaxed">
          {renderInline(bulletMatch[1], idx)}
        </li>,
      );
      return;
    }
    flushList(String(idx));
    if (line.length === 0) {
      out.push(<div key={`br-${idx}`} className="h-2" />);
      return;
    }
    const heading = /^\*\*(.+)\*\*$/.exec(line);
    if (heading) {
      out.push(
        <p key={`h-${idx}`} className="mt-3 text-xs font-medium text-[#a1a1aa]">
          {heading[1]}
        </p>,
      );
      return;
    }
    out.push(
      <p key={`p-${idx}`} className="text-sm text-[#e4e4e7] leading-relaxed">
        {renderInline(line, idx)}
      </p>,
    );
  });
  flushList('end');
  return out;
}

// --------------------------------------------------------------- Bubbles

export type ChatBubblesProps = {
  messages: ChatMessage[];
  onFollowUpClick?: (prompt: string) => void;
  busy?: boolean;
  busyLabel?: string;
};

export function ChatBubbles({
  messages,
  onFollowUpClick,
  busy = false,
  busyLabel = 'Searching…',
}: ChatBubblesProps) {
  return (
    <div className="space-y-4">
      {messages.map((m, idx) => {
        if (m.role === 'user') {
          return (
            <div key={`u-${idx}-${m.ts}`} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-emerald-400/[0.10] border border-emerald-400/[0.20] px-4 py-3">
                <p className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </p>
              </div>
            </div>
          );
        }
        const isLast = idx === messages.length - 1;
        return (
          <div key={`a-${idx}-${m.ts}`} className="flex flex-col items-start">
            <p className="text-xs text-zinc-500 mb-1 ml-1">
              2KO Ops Assistant
            </p>
            <div className="max-w-[92%] w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              {(m.mode || (m.warnings && m.warnings.length > 0)) && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {m.mode && (
                    <Badge
                      text={m.mode === 'ai' ? 'AI' : 'Search'}
                      tone={m.mode === 'ai' ? 'green' : 'blue'}
                    />
                  )}
                  {(m.warnings ?? []).map((w) => (
                    <Badge key={w} text={WARNING_LABEL[w]} tone={WARNING_TONE[w]} />
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {renderMarkdownLite(
                  (m.content ?? '').trim().length > 0
                    ? m.content
                    : (m.sources && m.sources.length > 0
                        ? "Here's what I found in the dashboard data."
                        : "I don't have anything matching that yet in the dashboard."),
                )}
              </div>
              {m.sources && <SourceCards sources={m.sources} />}
              {isLast && m.followUps && m.followUps.length > 0 && onFollowUpClick && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-zinc-500 mb-2">
                    Try next
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.followUps.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => onFollowUpClick(f)}
                        disabled={busy}
                        className="rounded-full border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.04] px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {busy && (
        <div className="flex flex-col items-start">
          <p className="text-xs text-zinc-500 mb-1 ml-1">
            2KO Ops Assistant
          </p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {busyLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
