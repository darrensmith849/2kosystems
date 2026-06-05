'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Tile, type TileStatus } from '@/components/admin-ui';
import type { SparklineTone } from '@/components/admin-ui';
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

function sparklineToneForIncident(severity: string, status: string): SparklineTone {
  if (severity === 'critical') return 'risk';
  if (severity === 'major') return 'warn';
  if (status === 'resolved') return 'good';
  return 'neutral';
}

function tileStatusForIncident(severity: string, status: string): TileStatus {
  if (severity === 'critical') return 'risk';
  if (severity === 'major') return 'warn';
  if (status === 'resolved') return 'ok';
  return 'neutral';
}

function chipClass(active: boolean, tone: Tone): string {
  const palette: Record<Tone, string> = {
    neutral: active
      ? 'border-white/[0.12] bg-white/[0.06] text-zinc-900 dark:text-zinc-100'
      : 'border-white/[0.08] bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100',
    green: active
      ? 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-700 dark:text-emerald-200'
      : 'border-white/[0.08] bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/[0.04] hover:text-emerald-200',
    amber: active
      ? 'border-amber-400/30 bg-amber-400/[0.08] text-amber-700 dark:text-amber-200'
      : 'border-white/[0.08] bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/[0.04] hover:text-amber-200',
    rose: active
      ? 'border-rose-400/30 bg-rose-400/[0.08] text-rose-700 dark:text-rose-200'
      : 'border-white/[0.08] bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/[0.04] hover:text-rose-200',
    blue: active
      ? 'border-sky-400/30 bg-sky-400/[0.08] text-sky-700 dark:text-sky-200'
      : 'border-white/[0.08] bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-white/[0.04] hover:text-sky-200',
  };
  return `inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${palette[tone]}`;
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
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

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

  return (
    <div className="space-y-5">
      {isSnapshot ? null : (
      <AdminCard title="Log incident">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One-line summary"
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-white/[0.12] focus:outline-none lg:col-span-3"
            disabled={busy}
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            disabled={busy}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as (typeof SOURCES)[number])}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
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
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
            disabled={busy}
          />
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 lg:col-span-3"
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
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 lg:col-span-3"
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
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors lg:col-span-6"
          >
            {busy ? 'Logging…' : 'Log incident'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </AdminCard>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-zinc-500">Severity</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeverityFilter('all')}
              className={chipClass(severityFilter === 'all', 'neutral')}
            >
              All
            </button>
            {SEVERITIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityFilter(s)}
                className={chipClass(severityFilter === s, SEVERITY_TONES[s] ?? 'neutral')}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-zinc-500">Status</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={chipClass(statusFilter === 'all', 'neutral')}
            >
              All
            </button>
            {STATUSES.map((s) => {
              const label = s.replace('_', ' ');
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={chipClass(statusFilter === s, STATUS_TONES[s] ?? 'neutral')}
                >
                  {label[0].toUpperCase() + label.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {initialIncidents.length === 0
              ? 'No incidents logged.'
              : 'No incidents match the current filters.'}
          </p>
          <p className="mt-2 text-xs text-zinc-500 max-w-md mx-auto">
            {initialIncidents.length === 0
              ? 'Log incidents manually for now. BetterStack auto-ingestion lands in Phase 2B.'
              : 'Clear or adjust the severity/status chips to widen the view.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-medium text-zinc-500">
            {rows.length} incident{rows.length === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((i) => {
              const who = i.client?.name ?? i.asset?.name ?? '—';
              const subtitle = `${i.severity} · ${i.status} · ${who}`;
              return (
                <Tile
                  key={i.id}
                  href={`/admin/ops/incidents/${i.id}`}
                  name={i.summary}
                  subtitle={subtitle}
                  sparklineSeed={i.id}
                  sparklineTone={sparklineToneForIncident(i.severity, i.status)}
                  status={tileStatusForIncident(i.severity, i.status)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
