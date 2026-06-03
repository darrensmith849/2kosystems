'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { AdminCard, Badge } from '@/components/admin-ui';
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

type ChatMessage =
  | { role: 'user'; content: string }
  | {
      role: 'assistant';
      content: string;
      sources?: AssistantSource[];
      warnings?: AssistantWarning[];
      mode?: 'ai' | 'search_only';
    };

type Stage = 'idle' | 'searching' | 'generating';

type Category =
  | 'All'
  | 'Activation'
  | 'Infrastructure'
  | 'Clients'
  | 'Assets'
  | 'Repos'
  | 'Vercel'
  | 'Hetzner'
  | 'Incidents'
  | 'Renewals'
  | 'Decisions'
  | 'Next steps';

// --------------------------------------------------------------- Constants

const CATEGORIES: Category[] = [
  'All',
  'Activation',
  'Infrastructure',
  'Clients',
  'Assets',
  'Repos',
  'Vercel',
  'Hetzner',
  'Incidents',
  'Renewals',
  'Decisions',
  'Next steps',
];

type SuggestedQuestion = { q: string; category: Exclude<Category, 'All'> };

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { q: 'Which projects are unmapped?', category: 'Vercel' },
  { q: 'What belongs to SigmaPhi?', category: 'Clients' },
  { q: 'Which Vercel projects are dormant?', category: 'Vercel' },
  { q: 'What is blocking Hetzner activation?', category: 'Hetzner' },
  { q: 'Which assets are linked to Impart Agency?', category: 'Assets' },
  { q: 'What renewals are coming up?', category: 'Renewals' },
  { q: 'What incidents need urgent review?', category: 'Incidents' },
  { q: 'Which repos are duplicates?', category: 'Repos' },
  { q: 'What should we do next?', category: 'Next steps' },
  { q: 'What is on ma130-apps?', category: 'Infrastructure' },
  { q: 'Which items are blocked by Cloudflare token?', category: 'Activation' },
  { q: 'What can I safely work on before the DB is connected?', category: 'Activation' },
];

const WARNING_LABEL: Record<AssistantWarning, string> = {
  db_missing: 'DB not connected',
  ai_key_missing: 'AI unavailable — grounded search',
  snapshot_mode: 'Snapshot mode',
  no_results: 'No matches',
};

const WARNING_TONE: Record<AssistantWarning, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  db_missing: 'amber',
  ai_key_missing: 'amber',
  snapshot_mode: 'green',
  no_results: 'neutral',
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
        <li key={`li-${idx}`} className="text-xs text-[#e4e4e7] leading-relaxed">
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
        <p
          key={`h-${idx}`}
          className="mt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-[#a1a1aa]"
        >
          {heading[1]}
        </p>,
      );
      return;
    }
    out.push(
      <p key={`p-${idx}`} className="text-xs text-[#e4e4e7] leading-relaxed">
        {renderInline(line, idx)}
      </p>,
    );
  });
  flushList('end');
  return out;
}

// Inline tokens: **bold**, [text](url), _italic_, `code`
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
        <strong key={`b-${keyHint}-${key++}`} className="text-[#f5f5f5] font-semibold">
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
          className="px-1 py-0.5 rounded bg-[#1c1c1e] text-[10.5px] font-mono text-emerald-300"
        >
          {first.match[1]}
        </code>,
      );
    }
    remaining = remaining.slice(first.match.index + first.match[0].length);
  }
  return nodes;
}

// --------------------------------------------------------------- Sources panel

function SourcesPanel({ sources }: { sources: AssistantSource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-3 rounded-xl border border-[#1c1c1e] bg-[#0a0a0b] p-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
        Sources ({sources.length})
      </p>
      <ul className="space-y-1.5">
        {sources.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-[11px]">
            <Badge text={s.type.replace('_', ' ')} tone="neutral" />
            <Badge text={s.source} tone={s.source === 'db' ? 'green' : s.source === 'snapshot' ? 'blue' : 'neutral'} />
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
        ))}
      </ul>
    </div>
  );
}

// --------------------------------------------------------------- Safety panel

function SafetyPanel() {
  const bullets = [
    'Assistant is read-only — cannot modify providers or DB',
    'Snapshot data should be verified before action',
    'AI mode requires ANTHROPIC_API_KEY; absent => grounded search only',
    'Never exposes secrets, tokens, or env values',
  ];
  return (
    <AdminCard title="Safety">
      <ul className="space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2 text-xs text-[#e4e4e7] leading-relaxed">
            <span className="text-[#52525b] shrink-0">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}

// --------------------------------------------------------------- Component

export default function AskClient({ hasAiKey }: { hasAiKey: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('All');
  const [saved, setSaved] = useState<SavedQuestion[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [saveName, setSaveName] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, stage]);

  // Hydrate saved questions on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setSaved(loadSaved<SavedQuestion>(SAVED_QUESTIONS_KEY));
    } catch {
      // silent
    }
  }, []);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setError(null);
    setBusy(true);
    setStage('searching');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');

    try {
      // Brief stage transition for UX. The fetch covers both phases server-side.
      if (hasAiKey) {
        // Show 'Searching...' first, then 'Generating...' once the fetch is in
        // flight long enough to feel like the AI is taking over.
        setTimeout(() => {
          setStage((s) => (s === 'searching' ? 'generating' : s));
        }, 350);
      }

      const res = await fetch('/api/admin/ops/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, mode: 'ai_if_available' }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }

      const data: AssistantAnswer = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
          warnings: data.warnings,
          mode: data.mode,
        },
      ]);
      // Surface follow-up suggestions as additional chips for the next ask.
      if (data.followUps && data.followUps.length > 0) {
        // Render via the assistant card itself; we attach them by storing them
        // on a follow-up state object below.
        setLastFollowUps(data.followUps);
      } else {
        setLastFollowUps([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
      setStage('idle');
    }
  }

  const [lastFollowUps, setLastFollowUps] = useState<string[]>([]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitQuestion(input);
  }

  // ----- Saved-question helpers -----
  function commitSavedQuestion() {
    const name = saveName.trim();
    const question = input.trim();
    if (!name || !question) return;
    const item: SavedQuestion = {
      id: makeIdFromName(name),
      name,
      question,
      category: category === 'All' ? undefined : category,
      createdAt: new Date().toISOString(),
    };
    // Replace any existing entry with the same id; otherwise append.
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

  // ----- Derived: filtered suggestions -----
  const visibleSuggestions =
    category === 'All'
      ? SUGGESTED_QUESTIONS
      : SUGGESTED_QUESTIONS.filter((s) => s.category === category);

  const canSave = input.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Safety panel (top) */}
      <SafetyPanel />

      {/* Mode banner */}
      <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge text={hasAiKey ? 'AI mode' : 'Search only'} tone={hasAiKey ? 'green' : 'amber'} />
          <span className="text-xs text-[#e4e4e7]">
            {hasAiKey
              ? 'AI mode active — answers grounded in dashboard search.'
              : 'AI key not configured — answers come from grounded search (no AI calls).'}
          </span>
        </div>
        <p className="text-[11px] text-[#71717a]">
          Answers are restricted to the dashboard index. The assistant cannot read external sources,
          execute actions, or reveal any secret values.
        </p>
      </div>

      {/* Two-column layout at lg+: suggestions on left, saved on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Question category filter + suggested questions */}
          <AdminCard title="Suggested questions">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = c === category;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                        active
                          ? 'border-emerald-400/60 text-emerald-200 bg-emerald-400/5'
                          : 'border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-[#e4e4e7]'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {visibleSuggestions.length === 0 ? (
                  <p className="text-[11px] text-[#52525b]">
                    No suggestions in this category yet.
                  </p>
                ) : (
                  visibleSuggestions.map((s) => (
                    <button
                      key={s.q}
                      type="button"
                      onClick={() => void submitQuestion(s.q)}
                      disabled={busy}
                      className="rounded-full border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-3 py-1 text-[11px] text-[#e4e4e7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {s.q}
                    </button>
                  ))
                )}
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Saved questions panel */}
        <div className="space-y-3">
          <AdminCard
            title="Saved questions"
            action={
              <span className="text-[10px] font-mono text-[#52525b]">{saved.length}</span>
            }
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!canSave) return;
                    setShowSaveDialog((v) => !v);
                  }}
                  disabled={!canSave}
                  className="rounded-full border border-emerald-400/30 hover:border-emerald-400/60 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300 hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Save this question
                </button>
                <button
                  type="button"
                  onClick={clearSaved}
                  disabled={saved.length === 0}
                  className="rounded-full border border-[#27272a] hover:border-rose-400/40 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Clear saved
                </button>
              </div>

              {showSaveDialog && canSave && (
                <div className="rounded-xl border border-[#27272a] bg-[#0a0a0b] p-3 space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
                    Save as
                  </p>
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
                    className="w-full rounded-md border border-[#27272a] bg-[#111113] px-3 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:outline-none focus:border-emerald-400/40"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setSaveName('');
                      }}
                      className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] hover:text-[#e4e4e7] px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={commitSavedQuestion}
                      disabled={saveName.trim().length === 0}
                      className="rounded-full border border-emerald-400/40 hover:border-emerald-400/70 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300 hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {saved.length === 0 ? (
                <p className="text-[11px] text-[#52525b]">
                  No saved questions yet. Type a question, then press “Save this question”.
                </p>
              ) : (
                <ul className="space-y-2">
                  {saved.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border border-[#27272a] bg-[#0a0a0b] p-3 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => void submitQuestion(s.question)}
                          disabled={busy}
                          className="text-left text-xs text-[#f5f5f5] hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-1 min-w-0"
                        >
                          <span className="block truncate font-medium">{s.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSaved(s.id)}
                          aria-label={`Delete ${s.name}`}
                          className="text-[#52525b] hover:text-rose-300 text-xs leading-none px-1"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-[11px] italic text-[#71717a] break-words">
                        {s.question}
                      </p>
                      {s.category && (
                        <div>
                          <Badge text={s.category} tone="neutral" />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Chat thread */}
      <div
        ref={scrollRef}
        className="rounded-2xl border border-[#27272a] bg-[#0a0a0b] p-4 space-y-4 max-h-[60vh] overflow-y-auto"
      >
        {messages.length === 0 && (
          <p className="text-xs text-[#52525b] text-center py-8">
            Ask a question or click a suggestion above. Answers cite their dashboard sources.
          </p>
        )}

        {messages.map((m, idx) => {
          if (m.role === 'user') {
            return (
              <div key={`u-${idx}`} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-[#1c1c1e] border border-[#27272a] px-4 py-2.5">
                  <p className="text-xs text-[#f5f5f5] leading-relaxed">{m.content}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={`a-${idx}`} className="flex justify-start">
              <div className="max-w-[92%] w-full rounded-2xl border border-[#27272a] bg-[#111113] px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge text={m.mode === 'ai' ? 'AI' : 'Search'} tone={m.mode === 'ai' ? 'green' : 'blue'} />
                  {(m.warnings ?? []).map((w) => (
                    <Badge key={w} text={WARNING_LABEL[w]} tone={WARNING_TONE[w]} />
                  ))}
                </div>
                <div className="space-y-1">{renderMarkdownLite(m.content)}</div>
                {m.sources && <SourcesPanel sources={m.sources} />}
                {idx === messages.length - 1 && lastFollowUps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1c1c1e]">
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
                      Follow-up suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lastFollowUps.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => void submitQuestion(f)}
                          disabled={busy}
                          className="rounded-full border border-[#27272a] hover:border-emerald-400/40 hover:text-emerald-200 px-3 py-1 text-[11px] text-[#e4e4e7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                {stage === 'generating' ? 'Generating…' : 'Searching…'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#27272a] bg-[#111113] p-3 space-y-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about clients, assets, repos, renewals, activation steps…"
          rows={2}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submitQuestion(input);
            }
          }}
          className="w-full resize-none bg-transparent text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#52525b]">
            Enter to send · Shift+Enter for newline
          </span>
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="rounded-full border border-emerald-400/40 hover:border-emerald-400/70 px-4 py-1 text-[11px] font-mono uppercase tracking-wider text-emerald-300 hover:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Working…' : 'Ask'}
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
