'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminCard, Badge, EmptyState } from '@/components/admin-ui';
import type { IndexItem, IndexItemType, IndexItemSource } from '@/lib/ops/ops-knowledge-index';
import {
  SAVED_SEARCHES_KEY,
  loadSaved,
  persistSaved,
  makeIdFromName,
  type SavedSearch,
} from '@/lib/ops/saved-workspace-local-state';

// ---------------------------------------------------------------- Tokenizer
// Mirrors src/lib/ops/ops-search.ts so client and server behaviour match.
// Strategy: lowercase, split on whitespace, strip everything that is not
// [a-z0-9_./-], drop a small English stop-word list. Same constants the
// server scorer uses — keeping it inline avoids importing the server-only
// module into the client bundle.

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in', 'is',
  'what', 'which', 'who', 'show', 'me', 'all',
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\s+/g)
    .map((t) => t.replace(/[^a-z0-9_./-]/g, ''))
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

function countOccurrences(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  let count = 0;
  let pos = 0;
  while (true) {
    const next = haystack.indexOf(needle, pos);
    if (next === -1) break;
    count += 1;
    pos = next + needle.length;
  }
  return count;
}

type SearchResult = { item: IndexItem; score: number; reasons: string[] };

function scoreItem(item: IndexItem, tokens: string[]): { score: number; reasons: string[] } {
  if (tokens.length === 0) return { score: 1, reasons: [] };
  const title = item.title.toLowerCase();
  const subtitle = (item.subtitle ?? '').toLowerCase();
  const body = item.body.toLowerCase();
  const tags = item.tags.map((t) => t.toLowerCase());
  let score = 0;
  const reasons: string[] = [];
  let tokensInBody = 0;
  for (const token of tokens) {
    const titleHits = countOccurrences(title, token);
    const subtitleHits = countOccurrences(subtitle, token);
    const bodyHits = countOccurrences(body, token);
    const tagHits = tags.reduce((acc, tag) => acc + (tag.includes(token) ? 1 : 0), 0);
    if (titleHits > 0) {
      score += titleHits * 5;
      reasons.push(`title:${token}`);
    }
    if (subtitleHits > 0) {
      score += subtitleHits * 3;
      reasons.push(`subtitle:${token}`);
    }
    if (tagHits > 0) {
      score += tagHits * 3;
      reasons.push(`tag:${token}`);
    }
    if (bodyHits > 0) {
      score += bodyHits * 1;
      tokensInBody += 1;
      reasons.push(`body:${token}`);
    }
  }
  if (tokensInBody === tokens.length && tokens.length > 1) {
    score += 2;
    reasons.push('all_tokens_in_body');
  }
  return { score, reasons };
}

type FilterState = {
  q: string;
  types: IndexItemType[];
  sources: IndexItemSource[];
  blockedBy: string[];
};

// ---------------------------------------------------------------- Constants

const ALL_TYPES: IndexItemType[] = [
  'division', 'client', 'asset', 'github_repo', 'vercel_project',
  'hetzner_server', 'cloudflare_zone', 'domain', 'ticket', 'renewal',
  'incident', 'audit_finding', 'review_decision', 'import_readiness',
  'activation_step', 'runbook',
];

const ALL_SOURCES: IndexItemSource[] = ['snapshot', 'db', 'docs', 'readiness'];

const ALL_BLOCKED_BY = [
  'env', 'ssh', 'human', 'db', 'github_token', 'vercel_token',
  'cloudflare_token', 'hetzner_token',
];

const EXAMPLES = [
  'Hetzner',
  'SigmaPhi',
  'renewals',
  'unmapped',
  // Email + commercial example chips — these route through the same search
  // tokenizer; they're suggestions of phrases that match planned email_ref /
  // service / contact items.
  'billing emails',
  'Hetzner invoices',
  'services needing review',
  'billing owner missing',
  'approval contact',
  'domain renewal emails',
];

// ---------------------------------------------------------------- Highlight

// Splits a string on the union of query tokens (case-insensitive) and wraps
// matched segments in an emerald span. No HTML injection — the segments are
// rendered as plain React children, not innerHTML.
function highlight(text: string, tokens: string[]): React.ReactNode {
  if (tokens.length === 0 || !text) return text;
  const escaped = tokens
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return text;
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <span key={i} className="text-emerald-300 bg-emerald-400/10 rounded px-0.5">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ---------------------------------------------------------------- Multi-select

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const summary =
    selected.length === 0
      ? 'Any'
      : selected.length <= 2
        ? selected.join(', ')
        : `${selected.length} selected`;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3 py-2 text-xs text-[#e4e4e7] hover:border-[#3f3f46] transition-colors min-w-[160px]"
      >
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">{label}:</span>
        <span className="font-mono text-[11px] text-[#f5f5f5] truncate">{summary}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 max-h-72 w-full min-w-[220px] overflow-auto rounded-lg border border-[#27272a] bg-[#111113] p-1 shadow-xl">
            <button
              type="button"
              onClick={() => onChange([])}
              className="block w-full text-left px-2 py-1 text-[11px] text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#1c1c1e] rounded"
            >
              Clear ({selected.length})
            </button>
            {options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-2 py-1 text-[11px] text-[#e4e4e7] hover:bg-[#1c1c1e] rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) onChange(selected.filter((s) => s !== opt));
                      else onChange([...selected, opt]);
                    }}
                    className="accent-emerald-400"
                  />
                  <span className="font-mono">{opt}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Client

export default function SearchClient({ initialItems }: { initialItems: IndexItem[] }) {
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    types: [],
    sources: [],
    blockedBy: [],
  });
  const [debouncedQ, setDebouncedQ] = useState('');
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [openWhy, setOpenWhy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setSaved(loadSaved<SavedSearch>(SAVED_SEARCHES_KEY));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(filters.q), 150);
    return () => clearTimeout(id);
  }, [filters.q]);

  const hasActiveFilters =
    filters.q.trim().length > 0 ||
    filters.types.length > 0 ||
    filters.sources.length > 0 ||
    filters.blockedBy.length > 0;

  function commitSavedSearches(next: SavedSearch[]) {
    setSaved(next);
    try {
      persistSaved<SavedSearch>(SAVED_SEARCHES_KEY, next);
    } catch {
      // silent
    }
  }

  function handleSaveCurrent() {
    const name = saveName.trim();
    if (!name) return;
    const entry: SavedSearch = {
      id: makeIdFromName(name),
      name,
      q: filters.q,
      types: filters.types.length > 0 ? filters.types : undefined,
      sources: filters.sources.length > 0 ? filters.sources : undefined,
      blockedBy: filters.blockedBy.length > 0 ? filters.blockedBy : undefined,
      createdAt: new Date().toISOString(),
    };
    const next = [...saved.filter((s) => s.id !== entry.id), entry];
    commitSavedSearches(next);
    setSaveName('');
    setShowSaveDialog(false);
  }

  function handleDeleteSaved(id: string) {
    commitSavedSearches(saved.filter((s) => s.id !== id));
  }

  function handleClearAllSaved() {
    if (saved.length === 0) return;
    if (typeof window !== 'undefined' && !window.confirm('Clear all saved searches?')) return;
    commitSavedSearches([]);
  }

  function handleRestoreSaved(s: SavedSearch) {
    const restored: FilterState = {
      q: s.q ?? '',
      types: (s.types ?? []) as IndexItemType[],
      sources: (s.sources ?? []) as IndexItemSource[],
      blockedBy: s.blockedBy ?? [],
    };
    setFilters(restored);
    setDebouncedQ(restored.q);
  }

  function summarizeSaved(s: SavedSearch): string {
    const parts: string[] = [];
    if (s.q && s.q.trim().length > 0) parts.push(`q:"${s.q.trim()}"`);
    if (s.types && s.types.length > 0) parts.push(`type:${s.types.join(',')}`);
    if (s.sources && s.sources.length > 0) parts.push(`source:${s.sources.join(',')}`);
    if (s.blockedBy && s.blockedBy.length > 0) parts.push(`blockedBy:${s.blockedBy.join(',')}`);
    return parts.length > 0 ? parts.join(' · ') : '(no filters)';
  }

  const tokens = useMemo(() => tokenize(debouncedQ), [debouncedQ]);

  const results = useMemo<SearchResult[]>(() => {
    const out: SearchResult[] = [];
    const hasQuery = tokens.length > 0;
    for (const item of initialItems) {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) continue;
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) continue;
      if (filters.blockedBy.length > 0) {
        const itemBlocked = item.blockedBy ?? [];
        const hasAny = filters.blockedBy.some((b) => itemBlocked.includes(b));
        if (!hasAny) continue;
      }
      if (hasQuery) {
        const { score, reasons } = scoreItem(item, tokens);
        if (score <= 0) continue;
        out.push({ item, score, reasons });
      } else {
        out.push({ item, score: 1, reasons: [] });
      }
    }
    out.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.title.localeCompare(b.item.title);
    });
    return out.slice(0, 50);
  }, [initialItems, tokens, filters.types, filters.sources, filters.blockedBy]);

  const totalAfterFilters = useMemo(() => {
    let n = 0;
    const hasQuery = tokens.length > 0;
    for (const item of initialItems) {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) continue;
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) continue;
      if (filters.blockedBy.length > 0) {
        const itemBlocked = item.blockedBy ?? [];
        const hasAny = filters.blockedBy.some((b) => itemBlocked.includes(b));
        if (!hasAny) continue;
      }
      if (hasQuery) {
        const { score } = scoreItem(item, tokens);
        if (score <= 0) continue;
      }
      n += 1;
    }
    return n;
  }, [initialItems, tokens, filters.types, filters.sources, filters.blockedBy]);

  function applyExample(example: string) {
    setFilters((prev) => ({ ...prev, q: example }));
    setDebouncedQ(example);
  }

  const hasQuery = filters.q.trim().length > 0;
  const showSaved = saved.length > 0;
  const advancedActive =
    filters.types.length > 0 ||
    filters.sources.length > 0 ||
    filters.blockedBy.length > 0;
  const advancedOpen = showAdvancedFilters || advancedActive;

  return (
    <div className="space-y-5">
      <AdminCard title="Search">
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              placeholder="Search clients, assets, repos, renewals, incidents, decisions, services…"
              className="w-full rounded-lg border border-emerald-400/30 bg-[#0a0a0b] px-4 py-3 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-emerald-400/60 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#52525b]">
              Try:
            </span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => applyExample(ex)}
                className="rounded-full border border-[#27272a] hover:border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-mono text-[#a1a1aa] hover:text-emerald-300 transition-colors"
              >
                {ex}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((v) => !v)}
              aria-expanded={advancedOpen}
              className="ml-auto rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
            >
              {advancedOpen ? 'Hide filters' : 'More filters'}
              {advancedActive && (
                <span className="ml-1.5 text-emerald-300">
                  · {filters.types.length + filters.sources.length + filters.blockedBy.length}
                </span>
              )}
            </button>
          </div>
          {advancedOpen && (
            <div className="rounded-lg border border-[#27272a] bg-[#0a0a0b] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <MultiSelect
                  label="type"
                  options={ALL_TYPES}
                  selected={filters.types}
                  onChange={(next) => setFilters((p) => ({ ...p, types: next }))}
                />
                <MultiSelect
                  label="source"
                  options={ALL_SOURCES}
                  selected={filters.sources}
                  onChange={(next) => setFilters((p) => ({ ...p, sources: next }))}
                />
                <MultiSelect
                  label="blockedBy"
                  options={ALL_BLOCKED_BY}
                  selected={filters.blockedBy}
                  onChange={(next) => setFilters((p) => ({ ...p, blockedBy: next }))}
                />
                {(filters.types.length > 0 ||
                  filters.sources.length > 0 ||
                  filters.blockedBy.length > 0 ||
                  filters.q.length > 0) && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({ q: '', types: [], sources: [], blockedBy: [] })
                    }
                    className="rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#71717a] hover:text-[#f5f5f5] transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  onClick={() => setShowSaveDialog(true)}
                  className="rounded-full border border-[#27272a] hover:border-emerald-400/40 disabled:opacity-40 disabled:hover:border-[#27272a] disabled:cursor-not-allowed px-3 py-1 text-[11px] font-mono text-[#a1a1aa] hover:text-emerald-300 transition-colors"
                >
                  Save current search
                </button>
              </div>
              {showSaveDialog && (
                <div className="mt-3 rounded-lg border border-[#27272a] bg-[#111113] p-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] mb-2">
                    Save search
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCurrent();
                        else if (e.key === 'Escape') {
                          setShowSaveDialog(false);
                          setSaveName('');
                        }
                      }}
                      autoFocus
                      placeholder="Name this search…"
                      className="flex-1 min-w-[200px] rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCurrent}
                      disabled={saveName.trim().length === 0}
                      className="rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1 text-[11px] font-mono text-emerald-300 hover:border-emerald-400/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setSaveName('');
                      }}
                      className="rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#71717a] hover:text-[#f5f5f5] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminCard>

      {showSaved && (
        <AdminCard
          title="Saved searches"
          action={
            <button
              type="button"
              onClick={handleClearAllSaved}
              className="rounded-full border border-[#27272a] hover:border-rose-400/40 px-2.5 py-0.5 text-[10px] font-mono text-[#71717a] hover:text-rose-300 transition-colors"
            >
              Clear all saved
            </button>
          }
        >
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#52525b]">
              Saved locally in this browser
            </p>
            <ul className="space-y-1.5">
              {saved.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#0a0a0b] px-2.5 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => handleRestoreSaved(s)}
                    className="flex-1 min-w-0 text-left group"
                  >
                    <p className="text-xs text-[#f5f5f5] group-hover:text-emerald-300 transition-colors truncate">
                      {s.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#52525b] truncate">
                      {summarizeSaved(s)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(s.id)}
                    aria-label={`Delete ${s.name}`}
                    className="shrink-0 rounded-full border border-[#27272a] hover:border-rose-400/40 px-2 py-0.5 text-[11px] font-mono text-[#71717a] hover:text-rose-300 transition-colors"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </AdminCard>
      )}

      {results.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No results"
            hint="No results for that search. Try a shorter query, or open More filters to widen the search."
          />
        ) : (
          <EmptyState
            title="Start by searching for a client name, an asset, or a question"
            hint={'For example, "Hetzner" or "SigmaPhi". The search covers clients, assets, repos, projects, servers, tickets, renewals, incidents, decisions, services, and runbooks.'}
          />
        )
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
            {hasQuery ? `Showing ${results.length} of ${totalAfterFilters} results` : `Showing ${results.length} of ${totalAfterFilters} indexed items`}
          </p>
          {results.map(({ item, reasons }) => {
            const cardKey = `${item.source}::${item.type}::${item.id}`;
            return (
              <ResultCard
                key={cardKey}
                item={item}
                reasons={reasons}
                tokens={tokens}
                whyOpen={Boolean(openWhy[cardKey])}
                onToggleWhy={() =>
                  setOpenWhy((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Card

function ResultCard({
  item,
  reasons,
  tokens,
  whyOpen,
  onToggleWhy,
}: {
  item: IndexItem;
  reasons: string[];
  tokens: string[];
  whyOpen: boolean;
  onToggleWhy: () => void;
}) {
  const excerpt = item.body.length > 200 ? item.body.slice(0, 200) + '…' : item.body;
  const sourceTone: 'green' | 'blue' | 'neutral' | 'amber' =
    item.source === 'db' ? 'green'
      : item.source === 'snapshot' ? 'blue'
      : item.source === 'readiness' ? 'amber'
      : 'neutral';
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {item.url ? (
            <Link
              href={item.url}
              className="text-sm font-medium text-[#f5f5f5] hover:text-emerald-300 transition-colors break-words"
            >
              {highlight(item.title, tokens)}
            </Link>
          ) : (
            <p className="text-sm font-medium text-[#f5f5f5] break-words">
              {highlight(item.title, tokens)}
            </p>
          )}
          {item.subtitle && (
            <p className="mt-0.5 text-[11px] text-[#71717a]">{item.subtitle}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-wrap items-center justify-end gap-1.5">
          <Badge text={item.type} tone="neutral" />
          <Badge text={item.source} tone={sourceTone} />
          {item.status ? <Badge text={item.status} tone="neutral" /> : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-[#a1a1aa] leading-relaxed break-words line-clamp-2">
        {highlight(excerpt, tokens)}
      </p>
      {reasons.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onToggleWhy}
            aria-expanded={whyOpen}
            className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] hover:text-emerald-300 transition-colors"
          >
            {whyOpen ? 'Hide why' : `Why? · ${reasons.length}`}
          </button>
          {whyOpen && (
            <div className="mt-2 flex flex-wrap gap-1">
              {reasons.slice(0, 8).map((r, i) => (
                <span
                  key={i}
                  className="inline-block text-[10px] font-mono text-[#71717a] border border-[#27272a] rounded-full px-1.5 py-0.5"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
