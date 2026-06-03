'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable } from '@/components/admin-ui';
import type { IncidentWithRefs } from '@/lib/ops/incidents-service';

const SEVERITIES = ['info', 'minor', 'major', 'critical'] as const;
const SOURCES = ['manual', 'betterstack', 'cloudflare', 'hetzner', 'vercel'] as const;
const STATUSES = ['open', 'investigating', 'resolved', 'postmortem_done'] as const;

type Severity = (typeof SEVERITIES)[number];
type Status = (typeof STATUSES)[number];
type Tone = 'neutral' | 'green' | 'amber' | 'rose' | 'blue';

const SEVERITY_TONES: Record<string, Tone> = {
  critical: 'rose',
  major: 'rose',
  minor: 'amber',
  info: 'blue',
};

const STATUS_TONES: Record<string, Tone> = {
  open: 'amber',
  investigating: 'amber',
  resolved: 'green',
  postmortem_done: 'blue',
};

function nowDatetimeLocalValue(): string {
  // datetime-local needs YYYY-MM-DDTHH:MM in local time, no seconds, no Z.
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(startedAt: Date | string, endedAt: Date | string | null): string {
  const start = new Date(startedAt).getTime();
  if (!endedAt) return 'ongoing';
  const end = new Date(endedAt).getTime();
  const ms = Math.max(0, end - start);
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return `${hours}h ${remMins}m`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days}d ${remHours}h`;
}

function formatStarted(startedAt: Date | string): string {
  const d = new Date(startedAt);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function chipClass(active: boolean, tone: Tone): string {
  const palette: Record<Tone, string> = {
    neutral: active
      ? 'border-[#52525b] bg-[#1c1c1e] text-[#f5f5f5]'
      : 'border-[#27272a] bg-transparent text-[#a1a1aa] hover:text-[#e4e4e7]',
    green: active
      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
      : 'border-[#27272a] bg-transparent text-[#a1a1aa] hover:text-emerald-200',
    amber: active
      ? 'border-amber-400/60 bg-amber-400/10 text-amber-200'
      : 'border-[#27272a] bg-transparent text-[#a1a1aa] hover:text-amber-200',
    rose: active
      ? 'border-rose-400/60 bg-rose-400/10 text-rose-200'
      : 'border-[#27272a] bg-transparent text-[#a1a1aa] hover:text-rose-200',
    blue: active
      ? 'border-sky-400/60 bg-sky-400/10 text-sky-200'
      : 'border-[#27272a] bg-transparent text-[#a1a1aa] hover:text-sky-200',
  };
  return `inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${palette[tone]}`;
}

export default function IncidentsClient({
  initialIncidents,
  assets,
  clients,
  isSnapshot = false,
}: {
  initialIncidents: IncidentWithRefs[];
  assets: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  isSnapshot?: boolean;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [severity, setSeverity] = useState<Severity>('minor');
  const [source, setSource] = useState<(typeof SOURCES)[number]>('manual');
  const [assetId, setAssetId] = useState('');
  const [clientId, setClientId] = useState('');
  const [startedAtLocal, setStartedAtLocal] = useState<string>(() => nowDatetimeLocalValue());
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  // Inline root-cause editor state
  const [editingRootCause, setEditingRootCause] = useState<string | null>(null);
  const [rootCauseDraft, setRootCauseDraft] = useState<string>('');

  const rows = useMemo(() => {
    return initialIncidents.filter((i) => {
      if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return true;
    });
  }, [initialIncidents, severityFilter, statusFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const startedAtIso = startedAtLocal ? new Date(startedAtLocal).toISOString() : undefined;
      const res = await fetch('/api/admin/ops/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: summary.trim(),
          severity,
          source,
          assetId: assetId || null,
          clientId: clientId || null,
          startedAt: startedAtIso,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setSummary('');
      setSeverity('minor');
      setSource('manual');
      setAssetId('');
      setClientId('');
      setStartedAtLocal(nowDatetimeLocalValue());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  async function patchIncident(id: string, patch: Record<string, unknown>) {
    setRowBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return false;
      }
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      return false;
    } finally {
      setRowBusy(null);
    }
  }

  async function setStatus(id: string, status: Status) {
    await patchIncident(id, { status });
  }

  async function toggleFollowup(id: string, current: boolean) {
    await patchIncident(id, { followupRequired: !current });
  }

  function beginEditRootCause(i: IncidentWithRefs) {
    setEditingRootCause(i.id);
    setRootCauseDraft(i.rootCause ?? '');
  }

  function cancelEditRootCause() {
    setEditingRootCause(null);
    setRootCauseDraft('');
  }

  async function saveRootCause(id: string) {
    const ok = await patchIncident(id, { rootCause: rootCauseDraft.trim() || null });
    if (ok) {
      setEditingRootCause(null);
      setRootCauseDraft('');
    }
  }

  return (
    <div className="space-y-5">
      {isSnapshot ? (
        <AdminCard title="Log incident — read-only in snapshot mode">
          <p className="text-xs text-[#a1a1aa]">
            Creating incidents activates once <code className="text-emerald-300">DATABASE_URL</code> is set. Below are real operational incidents from the discovery (dead IP, stranded zones, disk-fill, redirect gap).
          </p>
        </AdminCard>
      ) : (
      <AdminCard title="Log incident">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One-line summary"
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none lg:col-span-3"
            disabled={busy}
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as (typeof SOURCES)[number])}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={startedAtLocal}
            onChange={(e) => setStartedAtLocal(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy}
          />
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] lg:col-span-3"
            disabled={busy}
          >
            <option value="">no asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] lg:col-span-3"
            disabled={busy}
          >
            <option value="">no client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy || !summary.trim()}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-6"
          >
            {busy ? 'Logging…' : 'Log incident'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#27272a] bg-[#111113] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">Severity</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeverityFilter('all')}
              className={chipClass(severityFilter === 'all', 'neutral')}
            >
              all
            </button>
            {SEVERITIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityFilter(s)}
                className={chipClass(severityFilter === s, SEVERITY_TONES[s] ?? 'neutral')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">Status</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={chipClass(statusFilter === 'all', 'neutral')}
            >
              all
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={chipClass(statusFilter === s, STATUS_TONES[s] ?? 'neutral')}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={[
          {
            key: 'summary',
            header: 'Summary',
            render: (i) => (
              <div className="max-w-md">
                <p className="font-medium text-[#f5f5f5]">{i.summary}</p>
                {i.client && (
                  <p className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-[#52525b]">
                    {i.client.name}
                  </p>
                )}
                {(i.status === 'resolved' || i.status === 'postmortem_done') && (
                  <div className="mt-2">
                    {editingRootCause === i.id ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={rootCauseDraft}
                          onChange={(e) => setRootCauseDraft(e.target.value)}
                          placeholder="Root cause…"
                          className="w-full rounded-md border border-[#27272a] bg-[#0a0a0b] px-2 py-1 text-[11px] text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none"
                          disabled={rowBusy === i.id}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveRootCause(i.id)}
                            disabled={rowBusy === i.id}
                            className="rounded-md bg-[#0f7b3a] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 transition-colors"
                          >
                            save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditRootCause}
                            disabled={rowBusy === i.id}
                            className="rounded-md border border-[#27272a] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-[#e4e4e7] disabled:opacity-40"
                          >
                            cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {i.rootCause ? (
                          <span className="text-[11px] text-[#a1a1aa] italic">{i.rootCause}</span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#52525b]">
                            no root cause
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => beginEditRootCause(i)}
                          className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] hover:text-[#e4e4e7] underline-offset-2 hover:underline"
                        >
                          {i.rootCause ? 'edit' : 'add'} root cause
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'severity',
            header: 'Severity',
            render: (i) => <Badge text={i.severity} tone={SEVERITY_TONES[i.severity] ?? 'neutral'} />,
          },
          {
            key: 'status',
            header: 'Status',
            render: (i) => (
              <div className="flex flex-col gap-1.5">
                <Badge text={i.status} tone={STATUS_TONES[i.status] ?? 'neutral'} />
                <select
                  value={i.status}
                  onChange={(e) => setStatus(i.id, e.target.value as Status)}
                  disabled={rowBusy === i.id}
                  className="rounded-md border border-[#27272a] bg-[#0a0a0b] px-2 py-1 text-[10px] font-mono text-[#a1a1aa] focus:border-[#0f7b3a]/50 focus:outline-none disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ),
          },
          {
            key: 'followup',
            header: 'Follow-up',
            render: (i) => (
              <button
                type="button"
                onClick={() => toggleFollowup(i.id, i.followupRequired)}
                disabled={rowBusy === i.id}
                className={chipClass(i.followupRequired, i.followupRequired ? 'amber' : 'neutral')}
                title="Toggle follow-up required"
              >
                {i.followupRequired ? 'required' : 'none'}
              </button>
            ),
          },
          {
            key: 'asset',
            header: 'Asset',
            render: (i) => i.asset?.name ?? <span className="text-[#52525b]">—</span>,
          },
          {
            key: 'started',
            header: 'Started',
            render: (i) => (
              <span className="text-[11px] font-mono text-[#a1a1aa] whitespace-nowrap">
                {formatStarted(i.startedAt)}
              </span>
            ),
          },
          {
            key: 'duration',
            header: 'Duration',
            render: (i) => (
              <span className="text-[11px] font-mono text-[#a1a1aa]">
                {formatDuration(i.startedAt, i.endedAt ?? i.resolvedAt)}
              </span>
            ),
          },
        ]}
        empty={
          <div className="rounded-2xl border border-dashed border-[#27272a] bg-[#0a0a0b] p-10 text-center">
            <p className="text-sm text-[#a1a1aa]">
              {initialIncidents.length === 0
                ? 'No incidents logged.'
                : 'No incidents match the current filters.'}
            </p>
            <p className="mt-2 text-xs text-[#52525b] max-w-md mx-auto">
              {initialIncidents.length === 0
                ? 'Log incidents manually for now. BetterStack auto-ingestion lands in Phase 2B.'
                : 'Clear or adjust the severity/status chips to widen the view.'}
            </p>
          </div>
        }
      />
    </div>
  );
}
