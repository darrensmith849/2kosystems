'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable } from '@/components/admin-ui';
import type { IncidentWithRefs } from '@/lib/ops/incidents-service';

const SEVERITIES = ['info', 'minor', 'major', 'critical'] as const;
const SOURCES = ['manual', 'betterstack', 'cloudflare', 'hetzner', 'vercel'] as const;
const STATUSES = ['open', 'investigating', 'resolved', 'postmortem_done'] as const;

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

export default function IncidentsClient({
  initialIncidents,
  assets,
  clients,
}: {
  initialIncidents: IncidentWithRefs[];
  assets: { id: string; name: string }[];
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>('minor');
  const [source, setSource] = useState<(typeof SOURCES)[number]>('manual');
  const [assetId, setAssetId] = useState('');
  const [clientId, setClientId] = useState('');
  const [startedAtLocal, setStartedAtLocal] = useState<string>(() => nowDatetimeLocalValue());
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => initialIncidents, [initialIncidents]);

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

  async function setStatus(id: string, status: (typeof STATUSES)[number]) {
    setRowBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <div className="space-y-5">
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
            onChange={(e) => setSeverity(e.target.value as (typeof SEVERITIES)[number])}
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
                  onChange={(e) => setStatus(i.id, e.target.value as (typeof STATUSES)[number])}
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
            <p className="text-sm text-[#a1a1aa]">No incidents logged.</p>
            <p className="mt-2 text-xs text-[#52525b] max-w-md mx-auto">
              Log incidents manually for now. BetterStack auto-ingestion lands in Phase 2B.
            </p>
          </div>
        }
      />
    </div>
  );
}
