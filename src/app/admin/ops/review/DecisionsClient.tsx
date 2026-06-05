'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Row } from '@/components/admin-ui';
import type { SnapshotDecision } from '@/lib/ops/ops-snapshot-data';
import {
  LOCAL_REVIEW_KEY,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_TONE,
  type LocalReviewEntry,
  type LocalReviewState,
  type ReviewStatus,
} from '@/lib/ops/review-local-state';

const RISK_TONE: Record<SnapshotDecision['risk'], 'rose' | 'amber' | 'blue' | 'neutral' | 'green'> = {
  high: 'rose',
  med: 'amber',
  low: 'green',
};

const CLUSTER_LABEL: Record<SnapshotDecision['cluster'], string> = {
  repo_cluster: 'Repo cluster',
  unmapped_vercel: 'Unmapped Vercel / domain',
  cleanup: 'Cleanup',
  incident: 'Open risk',
  backup: 'Backup gap',
};

const CLUSTER_ORDER: SnapshotDecision['cluster'][] = [
  'repo_cluster',
  'unmapped_vercel',
  'cleanup',
  'incident',
  'backup',
];

const STATUS_ORDER: ReviewStatus[] = [
  'none',
  'accepted',
  'discussion',
  'blocked',
  'rejected',
  'resolved_externally',
];

type FilterValue = 'all' | ReviewStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'none', label: 'Unreviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'resolved_externally', label: 'Resolved externally' },
];

function safeReadLocalStorage(): LocalReviewState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_REVIEW_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as LocalReviewState;
    }
    return {};
  } catch {
    return {};
  }
}

function safeWriteLocalStorage(state: LocalReviewState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_REVIEW_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode / quota) — degrade gracefully.
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const sec = Math.round(diffMs / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

function entryOrDefault(state: LocalReviewState, id: string): LocalReviewEntry {
  return state[id] ?? { status: 'none', note: '', updatedAt: '' };
}

export default function DecisionsClient({
  initialDecisions,
}: {
  initialDecisions: SnapshotDecision[];
}) {
  const [state, setState] = useState<LocalReviewState>({});
  const [filter, setFilter] = useState<FilterValue>('all');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const fromStorage = safeReadLocalStorage();
    setState(fromStorage);
    setHydrated(true);
  }, []);

  // Persist on every state change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    safeWriteLocalStorage(state);
  }, [state, hydrated]);

  const setStatus = useCallback((id: string, status: ReviewStatus) => {
    setState((prev) => {
      const existing = entryOrDefault(prev, id);
      // Setting to 'none' with an empty note removes the entry entirely.
      if (status === 'none' && !existing.note) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: { ...existing, status, updatedAt: new Date().toISOString() },
      };
    });
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setState((prev) => {
      const existing = entryOrDefault(prev, id);
      if (existing.note === note) return prev;
      if (!note && existing.status === 'none') {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: { ...existing, note, updatedAt: new Date().toISOString() },
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      'Reset all local review state? Statuses and notes will be cleared from this browser only.',
    );
    if (!ok) return;
    try {
      window.localStorage.removeItem(LOCAL_REVIEW_KEY);
    } catch {
      // ignore
    }
    setState({});
  }, []);

  // Counts per status across ALL decisions (not just filtered view).
  const counts = useMemo(() => {
    const tally: Record<ReviewStatus, number> = {
      none: 0,
      accepted: 0,
      discussion: 0,
      blocked: 0,
      rejected: 0,
      resolved_externally: 0,
    };
    for (const d of initialDecisions) {
      tally[entryOrDefault(state, d.id).status] += 1;
    }
    return tally;
  }, [initialDecisions, state]);

  // Group decisions by cluster, applying the active filter.
  const grouped = useMemo(() => {
    const byCluster: Record<string, SnapshotDecision[]> = {};
    for (const d of initialDecisions) {
      const status = entryOrDefault(state, d.id).status;
      if (filter !== 'all' && status !== filter) continue;
      (byCluster[d.cluster] ||= []).push(d);
    }
    return byCluster;
  }, [initialDecisions, state, filter]);

  const hasAnyVisible = Object.values(grouped).some((arr) => arr.length > 0);

  return (
    <div>
      <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.04] px-4 py-2.5 text-[11px] leading-relaxed text-amber-200/90">
        <span className="font-mono uppercase tracking-[0.15em] text-[10px] text-amber-300/80">
          Local browser review
        </span>
        <span className="mx-2 text-amber-200/60">·</span>
        <span>
          Status + notes save to this browser only. Nothing is persisted to the database until Hetzner Postgres is connected.
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#52525b] mb-2">Summary</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {STATUS_ORDER.map((s) => (
            <Badge
              key={s}
              text={`${counts[s]} ${REVIEW_STATUS_LABEL[s].toLowerCase()}`}
              tone={REVIEW_STATUS_TONE[s]}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`text-[10px] font-mono uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'border-[#f5f5f5] bg-[#f5f5f5] text-[#0a0a0b]'
                  : 'border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:bg-[#1c1c1e]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {!hasAnyVisible && (
        <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] p-8 text-center mb-6">
          <p className="text-sm text-zinc-700 dark:text-[#a1a1aa]">No decisions match this filter.</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-[#52525b]">Switch to &ldquo;All&rdquo; to see every item.</p>
        </div>
      )}

      {CLUSTER_ORDER.filter((c) => grouped[c] && grouped[c].length > 0).map((cluster) => (
        <section key={cluster} className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-zinc-700 dark:text-[#71717a] mb-3">
            {CLUSTER_LABEL[cluster]} · {grouped[cluster].length}
          </h3>
          <div className="space-y-3">
            {grouped[cluster].map((d) => (
              <DecisionCard
                key={d.id}
                d={d}
                entry={entryOrDefault(state, d.id)}
                onStatusChange={(s) => setStatus(d.id, s)}
                onNoteChange={(n) => setNote(d.id, n)}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={resetAll}
          className="text-[10px] font-mono uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-rose-400/30 text-rose-300 hover:bg-rose-400/5 transition-colors"
        >
          Reset local review state
        </button>
      </div>
    </div>
  );
}

function DecisionCard({
  d,
  entry,
  onStatusChange,
  onNoteChange,
}: {
  d: SnapshotDecision;
  entry: LocalReviewEntry;
  onStatusChange: (s: ReviewStatus) => void;
  onNoteChange: (note: string) => void;
}) {
  const recommended = d.options.find((o) => o.recommended);
  const [noteDraft, setNoteDraft] = useState(entry.note);

  // Keep the textarea in sync if external state changes (e.g. reset).
  useEffect(() => {
    setNoteDraft(entry.note);
  }, [entry.note]);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5]">{d.title}</p>
          <p className="mt-1 text-xs text-zinc-700 dark:text-[#a1a1aa] leading-relaxed">{d.context}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge text={`risk: ${d.risk}`} tone={RISK_TONE[d.risk]} />
          <Badge
            text={REVIEW_STATUS_LABEL[entry.status]}
            tone={REVIEW_STATUS_TONE[entry.status]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#52525b] mb-1.5">Options</p>
          <ul className="space-y-1">
            {d.options.map((o) => (
              <li
                key={o.label}
                className={`text-xs rounded-md border px-3 py-1.5 ${
                  o.recommended
                    ? 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'
                    : 'border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa]'
                }`}
              >
                {o.recommended && (
                  <span className="mr-1 text-[10px] uppercase tracking-wider text-emerald-400">
                    recommended
                  </span>
                )}
                {o.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Row label="Recommendation" value={<span className="text-zinc-800 dark:text-[#e4e4e7]">{d.recommendation}</span>} />
          <Row
            label="Action"
            value={<code className="font-mono text-[10px] text-zinc-700 dark:text-[#a1a1aa] break-all">{d.action}</code>}
          />
          <Row
            label="Blocked by"
            value={
              <span className="text-[11px] text-zinc-700 dark:text-[#a1a1aa]">
                {d.blockedBy.includes('none')
                  ? 'no provider blockers — operator decision only'
                  : d.blockedBy.join(', ')}
              </span>
            }
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-[#1c1c1e]">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 dark:text-[#52525b] mb-2">Your call</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((s) => {
            const active = entry.status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? 'border-[#f5f5f5] bg-[#f5f5f5] text-[#0a0a0b]'
                    : 'border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:bg-[#1c1c1e]'
                }`}
              >
                {REVIEW_STATUS_LABEL[s]}
              </button>
            );
          })}
        </div>

        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value.slice(0, 500))}
          onBlur={() => onNoteChange(noteDraft)}
          maxLength={500}
          rows={2}
          placeholder="Note (saved locally on blur, max 500 chars)"
          className="mt-3 w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-800 dark:text-[#e4e4e7] placeholder:text-zinc-600 dark:text-[#52525b] focus:outline-none focus:border-[#3f3f46] resize-none"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] text-zinc-600 dark:text-[#52525b]">
            {noteDraft.length}/500
          </span>
          {entry.updatedAt && (
            <span className="text-[10px] text-zinc-600 dark:text-[#52525b]">
              Updated {relativeTime(entry.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {recommended && entry.status === 'none' && (
        <p className="mt-3 text-[10px] uppercase tracking-wider text-emerald-400/80">
          Recommendation available — pick a status to record your decision locally.
        </p>
      )}
    </div>
  );
}
