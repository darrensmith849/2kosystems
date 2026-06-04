'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Badge } from '@/components/admin-ui';
import {
  SAVED_QUESTIONS_KEY,
  loadSaved,
  persistSaved,
  makeIdFromName,
  type SavedQuestion,
} from '@/lib/ops/saved-workspace-local-state';
import type {
  AssistantAnswer,
  AssistantSource,
  AssistantWarning,
} from '@/lib/ops/ops-assistant-context';

// --------------------------------------------------------------- Types
//
// NOTE: this file intentionally inlines the chat primitives (bubbles,
// composer, source cards, suggested prompts, useChatHistory). The plan
// reserves a shared `@/components/admin-ui/floating-chat` barrel for the
// floating widget. When that barrel ships, swap the inlined components
// here for barrel imports. Until then we keep AskClient self-contained
// so the build stays green regardless of merge order.

type ChatMessage =
  | { role: 'user'; content: string; ts: number }
  | {
      role: 'assistant';
      content: string;
      ts: number;
      sources?: AssistantSource[];
      warnings?: AssistantWarning[];
      mode?: 'ai' | 'search_only';
      followUps?: string[];
    };

type Stage = 'idle' | 'searching' | 'generating';

// --------------------------------------------------------------- Storage

const CHAT_HISTORY_KEY = '2ko_ops_ask_chat_v1';

function loadChat(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistChat(messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch {
    /* silent */
  }
}

// --------------------------------------------------------------- Suggestions

const SUGGESTIONS = [
  'What is blocking activation?',
  'What belongs to SigmaPhi?',
  'What is on ma130-apps?',
  'Which Vercel projects are dormant?',
  'Which repos are duplicated?',
  'Show me upcoming renewals.',
  'Which incidents need attention?',
  'What can I work on before the DB is connected?',
];

const WELCOME_COPY =
  "Hi, I'm your 2KO Ops Assistant. Ask me about clients, assets, repos, Vercel projects, Hetzner servers, renewals, incidents, decisions, or activation blockers. I'm read-only and I'll only use dashboard data.";

const SEARCH_MODE_HELPER =
  'Search mode — I can answer using dashboard data already available. Full AI answers can be enabled later.';

const WARNING_LABEL: Record<AssistantWarning, string> = {
  db_missing: 'Database not connected',
  ai_key_missing: 'Search mode',
  snapshot_mode: 'Preview data',
  no_results: 'No matches',
};

const WARNING_TONE: Record<AssistantWarning, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  db_missing: 'amber',
  ai_key_missing: 'blue',
  snapshot_mode: 'green',
  no_results: 'neutral',
};

const SOURCE_KIND_LABEL: Record<string, string> = {
  db: 'live',
  snapshot: 'preview',
  search: 'search',
  docs: 'docs',
  readiness: 'readiness',
};

// --------------------------------------------------------------- Markdown lite

function renderMarkdownLite(text: string): React.ReactNode {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];

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

function renderInline(text: string, keyHint: number): React.ReactNode {
  const nodes: React.ReactNode[] = [];
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
      linkMatch ? { kind: 'link', match: linkMatch } : null,
      boldMatch ? { kind: 'bold', match: boldMatch } : null,
      italicMatch ? { kind: 'italic', match: italicMatch } : null,
      codeMatch ? { kind: 'code', match: codeMatch } : null,
    ].filter((c): c is { kind: string; match: RegExpExecArray } => c !== null);

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
          className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
        >
          {label}
        </a>,
      );
    } else if (first.kind === 'bold') {
      nodes.push(
        <strong key={`b-${keyHint}-${key++}`} className="text-[#f5f5f5] font-medium">
          {first.match[1]}
        </strong>,
      );
    } else if (first.kind === 'italic') {
      nodes.push(
        <em key={`i-${keyHint}-${key++}`} className="text-[#a1a1aa] not-italic">
          {first.match[1]}
        </em>,
      );
    } else if (first.kind === 'code') {
      nodes.push(
        <code
          key={`c-${keyHint}-${key++}`}
          className="px-1 py-0.5 rounded bg-[#1c1c1e] text-[12px] font-mono text-emerald-300"
        >
          {first.match[1]}
        </code>,
      );
    }
    remaining = remaining.slice(first.match.index + first.match[0].length);
  }
  return nodes;
}

// --------------------------------------------------------------- Source cards
//
// IMPORTANT: this inlined SourceCards is the twin of
// src/components/admin-ui/floating-chat/SourceCards.tsx. Until the
// floating-chat barrel is adopted on this page, the two implementations
// MUST stay in sync — defaults to 5 visible sources with a "Show N more
// sources" toggle, validates hrefs to avoid broken <a href="undefined">,
// and uses the same compact padding/typography.

const SOURCE_CARDS_DEFAULT_VISIBLE = 5;

function isValidHref(href: string | undefined): href is string {
  if (!href) return false;
  if (href === '#') return false;
  return href.startsWith('/') || href.startsWith('http');
}

function SourceCards({ sources }: { sources: AssistantSource[] }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  if (sources.length === 0) return null;
  const visible = expanded ? sources : sources.slice(0, SOURCE_CARDS_DEFAULT_VISIBLE);
  const hidden = sources.length - SOURCE_CARDS_DEFAULT_VISIBLE;
  const showToggle = sources.length > SOURCE_CARDS_DEFAULT_VISIBLE;
  return (
    <div className="mt-3 rounded-xl border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2.5">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
        Sources ({sources.length})
      </p>
      <ul className="space-y-1">
        {visible.map((s) => {
          const kindLabel = SOURCE_KIND_LABEL[s.source] ?? s.source;
          const kindTone: 'neutral' | 'green' | 'amber' | 'rose' | 'blue' =
            s.source === 'db' ? 'green' : s.source === 'snapshot' ? 'blue' : 'neutral';
          const valid = isValidHref(s.url);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs py-1">
              <Badge text={s.type.replace(/_/g, ' ')} tone="neutral" />
              <Badge text={kindLabel} tone={kindTone} />
              {valid ? (
                <a
                  href={s.url}
                  className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2 truncate text-[12px]"
                >
                  {s.title}
                </a>
              ) : (
                <span className="text-[#e4e4e7] truncate text-[12px]">{s.title}</span>
              )}
            </li>
          );
        })}
      </ul>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[11px] uppercase tracking-[0.18em] text-emerald-300 hover:text-emerald-200"
        >
          {expanded ? 'Show fewer' : `Show ${hidden} more sources`}
        </button>
      )}
    </div>
  );
}

// --------------------------------------------------------------- Component

export default function AskClient({ hasAiKey }: { hasAiKey: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedQuestion[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [helperDismissed, setHelperDismissed] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    setMessages(loadChat());
    setSaved(loadSaved<SavedQuestion>(SAVED_QUESTIONS_KEY));
    setHydrated(true);
  }, []);

  // Persist chat history on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    persistChat(messages);
  }, [messages, hydrated]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, stage]);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setError(null);
    setBusy(true);
    setStage('searching');
    const userMsg: ChatMessage = { role: 'user', content: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      if (hasAiKey) {
        setTimeout(() => {
          setStage((s) => (s === 'searching' ? 'generating' : s));
        }, 350);
      }

      // pageContext is forward-compatible: the API will accept it once the
      // widget agent ships the .strict() Zod schema bump. If the route still
      // rejects extra fields, we degrade by stripping it client-side.
      const res = await fetch('/api/admin/ops/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          mode: 'ai_if_available',
          pageContext: { route: '/admin/ops/ask', sectionTitle: 'Ask' },
        }),
      });

      if (!res.ok) {
        // If the schema is still strict and rejects pageContext, retry without it.
        if (res.status === 400) {
          const retry = await fetch('/api/admin/ops/assistant/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: trimmed, mode: 'ai_if_available' }),
          });
          if (retry.ok) {
            const data: AssistantAnswer = await retry.json();
            const assistantMsg: ChatMessage = {
              role: 'assistant',
              content: data.answer,
              ts: Date.now(),
              sources: data.sources,
              warnings: data.warnings,
              mode: data.mode,
              followUps: data.followUps,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            return;
          }
          const data: { error?: string } = await retry.json().catch(() => ({}));
          setError(data.error ?? `HTTP ${retry.status}`);
          return;
        }
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }

      const data: AssistantAnswer = await res.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        ts: Date.now(),
        sources: data.sources,
        warnings: data.warnings,
        mode: data.mode,
        followUps: data.followUps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
      setStage('idle');
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitQuestion(input);
  }

  function handleNewChat() {
    if (messages.length === 0) return;
    setMessages([]);
    setError(null);
    textareaRef.current?.focus();
  }

  function handleClearChat() {
    if (messages.length === 0) return;
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Clear this chat and start over?');
    if (!ok) return;
    setMessages([]);
    setError(null);
    textareaRef.current?.focus();
  }

  // ----- Saved-question helpers (preserved feature) -----
  function commitSavedQuestion() {
    const name = saveName.trim();
    const question = input.trim();
    if (!name || !question) return;
    const item: SavedQuestion = {
      id: makeIdFromName(name),
      name,
      question,
      createdAt: new Date().toISOString(),
    };
    const next = [...saved.filter((s) => s.id !== item.id), item];
    setSaved(next);
    persistSaved<SavedQuestion>(SAVED_QUESTIONS_KEY, next);
    setSaveName('');
    setShowSaveDialog(false);
  }

  function deleteSaved(id: string) {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    persistSaved<SavedQuestion>(SAVED_QUESTIONS_KEY, next);
  }

  function clearSaved() {
    if (saved.length === 0) return;
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Clear all saved questions?');
    if (!ok) return;
    setSaved([]);
    persistSaved<SavedQuestion>(SAVED_QUESTIONS_KEY, []);
  }

  const canSave = input.trim().length > 0;
  const hasMessages = messages.length > 0;
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant') as
    | (ChatMessage & { role: 'assistant' })
    | undefined;
  const showSearchModeHelper =
    !helperDismissed &&
    (!hasAiKey ||
      lastAssistant?.mode === 'search_only' ||
      (lastAssistant?.warnings ?? []).includes('ai_key_missing'));

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Badge text={hasAiKey ? 'AI mode' : 'Search mode'} tone={hasAiKey ? 'green' : 'blue'} />
          <span className="text-[#a1a1aa]">
            {hasAiKey
              ? 'Grounded in your dashboard data.'
              : 'Answering from dashboard data already available.'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={!hasMessages || busy}
            className="rounded-md border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-2.5 py-1 text-xs text-[#a1a1aa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            New chat
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            disabled={!hasMessages || busy}
            className="rounded-md border border-[#27272a] hover:border-rose-400/40 hover:text-rose-200 px-2.5 py-1 text-xs text-[#a1a1aa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear chat
          </button>
          <button
            type="button"
            onClick={() => setShowSavedPanel((v) => !v)}
            className="rounded-md border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-2.5 py-1 text-xs text-[#a1a1aa] transition-colors"
          >
            Saved ({saved.length})
          </button>
        </div>
      </div>

      {/* Search-mode helper banner (dismissible) */}
      {showSearchModeHelper && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-2.5">
          <p className="text-xs text-amber-200/90 leading-relaxed">{SEARCH_MODE_HELPER}</p>
          <button
            type="button"
            onClick={() => setHelperDismissed(true)}
            aria-label="Dismiss"
            className="text-[#71717a] hover:text-[#e4e4e7] text-sm leading-none px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Saved questions panel (preserved feature) */}
      {showSavedPanel && (
        <div className="rounded-2xl border border-[#27272a] bg-[#0a0a0b] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#e4e4e7] font-medium">Saved questions</p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (!canSave) return;
                  setShowSaveDialog((v) => !v);
                }}
                disabled={!canSave}
                className="rounded-md border border-emerald-400/30 hover:border-emerald-400/60 px-2.5 py-1 text-xs text-emerald-300 hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save current
              </button>
              <button
                type="button"
                onClick={clearSaved}
                disabled={saved.length === 0}
                className="rounded-md border border-[#27272a] hover:border-rose-400/40 px-2.5 py-1 text-xs text-[#a1a1aa] hover:text-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {showSaveDialog && canSave && (
            <div className="rounded-xl border border-[#27272a] bg-[#111113] p-3 space-y-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Give this question a name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitSavedQuestion();
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false);
                    setSaveName('');
                  }
                }}
                className="w-full rounded-md border border-[#27272a] bg-[#0a0a0b] px-3 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:outline-none focus:border-emerald-400/40"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveName('');
                  }}
                  className="text-xs text-[#71717a] hover:text-[#e4e4e7] px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={commitSavedQuestion}
                  disabled={saveName.trim().length === 0}
                  className="rounded-md border border-emerald-400/40 hover:border-emerald-400/70 px-3 py-1 text-xs text-emerald-300 hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {saved.length === 0 ? (
            <p className="text-xs text-[#52525b]">
              No saved questions yet. Type a question, then press &ldquo;Save current&rdquo;.
            </p>
          ) : (
            <ul className="space-y-2">
              {saved.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-[#27272a] bg-[#111113] p-2.5 flex items-start justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowSavedPanel(false);
                      void submitQuestion(s.question);
                    }}
                    disabled={busy}
                    className="text-left flex-1 min-w-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="block text-xs text-[#f5f5f5] font-medium truncate">
                      {s.name}
                    </span>
                    <span className="block text-xs italic text-[#71717a] break-words mt-0.5">
                      {s.question}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSaved(s.id)}
                    aria-label={`Delete ${s.name}`}
                    className="text-[#52525b] hover:text-rose-300 text-sm leading-none px-1"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Chat thread (dominant area) */}
      <div
        ref={scrollRef}
        className="rounded-2xl border border-[#27272a] bg-[#0a0a0b] p-4 min-h-[520px] max-h-[70vh] overflow-y-auto"
      >
        {!hasMessages ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 gap-8">
            {/* Welcome bubble */}
            <div className="max-w-xl w-full">
              <div className="flex justify-start">
                <div className="max-w-full rounded-2xl border border-[#27272a] bg-[#111113] px-5 py-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300 mb-2">
                    2KO Ops Assistant
                  </p>
                  <p className="text-sm text-[#e4e4e7] leading-relaxed">{WELCOME_COPY}</p>
                </div>
              </div>
            </div>

            {/* Suggested prompt chips */}
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs text-[#71717a]">Try one of these to get started:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void submitQuestion(s)}
                    disabled={busy}
                    className="rounded-full border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-3 py-1.5 text-xs text-[#a1a1aa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, idx) => {
              if (m.role === 'user') {
                return (
                  <div key={`u-${idx}-${m.ts}`} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-emerald-400/[0.08] border border-emerald-400/20 px-4 py-2.5">
                      <p className="text-sm text-[#f5f5f5] leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                  </div>
                );
              }
              const isLast = idx === messages.length - 1;
              return (
                <div key={`a-${idx}-${m.ts}`} className="flex justify-start">
                  <div className="max-w-[92%] w-full rounded-2xl border border-[#27272a] bg-[#111113] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">
                        2KO Ops Assistant
                      </span>
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
                    {isLast && m.followUps && m.followUps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#1c1c1e]">
                        <p className="text-xs text-[#71717a] mb-2">Try next</p>
                        <div className="flex flex-wrap gap-2">
                          {m.followUps.map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => void submitQuestion(f)}
                              disabled={busy}
                              className="rounded-full border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-3 py-1 text-xs text-[#e4e4e7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              <div className="flex justify-start">
                <div className="rounded-2xl border border-[#27272a] bg-[#111113] px-4 py-2.5">
                  <p className="text-xs text-[#a1a1aa]">
                    {stage === 'generating' ? 'Thinking…' : 'Checking the dashboard…'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#27272a] bg-[#111113] p-3 space-y-2"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasMessages ? 'Reply or ask another question…' : 'Type a question…'}
          rows={2}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submitQuestion(input);
            }
          }}
          className="w-full resize-none bg-transparent text-sm text-[#f5f5f5] placeholder:text-[#52525b] focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#52525b]">
            Enter to send · Shift + Enter for new line · Read-only · No secrets shared
          </span>
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="rounded-md bg-emerald-400/10 border border-emerald-400/40 hover:bg-emerald-400/20 hover:border-emerald-400/70 px-4 py-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Working…' : 'Send'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-400/[0.04] px-4 py-2.5 text-xs text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
