'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, EmptyState } from '@/components/admin-ui';
import type { AuditFinding } from '@/lib/db/schema/audits';

const SEVERITY_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  critical: 'rose', high: 'rose', med: 'amber', low: 'blue', info: 'neutral',
};
const STATUS_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  open: 'amber', acknowledged: 'blue', resolved: 'green', wontfix: 'neutral',
};

export default function AuditsClient({ findings, isSnapshot = false }: { findings: AuditFinding[]; isSnapshot?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function seedFindings() {
    setBusy('seed');
    setError(null);
    try {
      const res = await fetch('/api/admin/ops/findings/seed', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(id: string, status: 'acknowledged' | 'resolved' | 'wontfix' | 'open') {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/findings/${id}`, {
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
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <AdminCard
        title="Seed initial findings"
        action={
          <button
            type="button"
            onClick={seedFindings}
            disabled={busy === 'seed' || isSnapshot}
            title={isSnapshot ? 'Seeding activates once DATABASE_URL is set' : undefined}
            className="rounded-full border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-zinc-900 dark:text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy === 'seed' ? 'Seeding…' : isSnapshot ? 'Seed (DB required)' : 'Seed known issues'}
          </button>
        }
      >
        <p className="text-xs text-zinc-700 dark:text-[#71717a]">
          Seeds the ~10 known operational issues from infra-handover/HISTORY.md (sixsigma2026 on Vercel, stranded xneelo zones,
          ma130-apps disk risk, duplicate repo clusters, etc.). Idempotent — running twice does nothing.
        </p>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
      </AdminCard>

      {findings.length === 0 ? (
        <EmptyState
          title="No findings yet"
          hint="Click ‘Seed known issues’ above to populate the dashboard with the operational issues already surfaced during discovery."
        />
      ) : (
        <div className="space-y-3">
          {findings.map((f) => (
            <div key={f.id} className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm text-zinc-900 dark:text-[#f5f5f5] font-medium">{f.title}</p>
                  {f.detail && <p className="mt-1 text-xs text-zinc-700 dark:text-[#a1a1aa] leading-relaxed">{f.detail}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge text={f.severity} tone={SEVERITY_TONES[f.severity] ?? 'neutral'} />
                  <Badge text={f.status} tone={STATUS_TONES[f.status] ?? 'neutral'} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] font-mono text-zinc-600 dark:text-[#52525b]">
                  {f.kind} · {f.entityType ?? '—'} · {f.entityRef ?? '—'}
                </p>
                <div className="flex items-center gap-1">
                  {f.status !== 'open' && (
                    <button
                      type="button"
                      onClick={() => setStatus(f.id, 'open')}
                      disabled={busy === f.id || isSnapshot}
                      className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1"
                    >
                      Reopen
                    </button>
                  )}
                  {f.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => setStatus(f.id, 'acknowledged')}
                      disabled={busy === f.id || isSnapshot}
                      className="text-[11px] text-sky-300 hover:text-sky-200 border border-sky-400/30 hover:border-sky-400/50 rounded-full px-3 py-1"
                    >
                      Acknowledge
                    </button>
                  )}
                  {(f.status === 'open' || f.status === 'acknowledged') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(f.id, 'resolved')}
                        disabled={busy === f.id || isSnapshot}
                        className="text-[11px] text-emerald-300 hover:text-emerald-200 border border-emerald-400/30 hover:border-emerald-400/50 rounded-full px-3 py-1"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(f.id, 'wontfix')}
                        disabled={busy === f.id || isSnapshot}
                        className="text-[11px] text-zinc-700 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1"
                      >
                        Won&apos;t fix
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
