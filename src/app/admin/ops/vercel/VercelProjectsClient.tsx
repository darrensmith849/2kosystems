'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable, EmptyState, StatusPill } from '@/components/admin-ui';
import type { VercelProject } from '@/lib/db/schema/infra';
import type { IntegrationConnectivity } from '@/lib/integrations/types';
import { VERCEL_STATE_LABEL, labelFor } from '@/lib/ops/labels';

const STATE_TONES: Record<string, 'green' | 'amber' | 'blue' | 'neutral' | 'rose'> = {
  live: 'green',
  migrated_to_hetzner: 'blue',
  dormant: 'amber',
  deleted: 'rose',
  unknown: 'neutral',
};

export default function VercelProjectsClient({
  projects,
  integrationStatus,
}: {
  projects: VercelProject[];
  integrationStatus: IntegrationConnectivity;
}) {
  const router = useRouter();
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [busy, setBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) =>
      (stateFilter === 'all' || p.state === stateFilter) &&
      (teamFilter === 'all' || p.teamSlug === teamFilter),
    );
  }, [projects, stateFilter, teamFilter]);

  async function runSync() {
    if (integrationStatus.status !== 'connected') return;
    setBusy(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/admin/ops/sync/vercel', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSyncError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminCard
        title="Vercel"
        action={
          <div className="flex items-center gap-3">
            <StatusPill status={integrationStatus.status === 'connected' ? 'connected' : 'not_connected'} />
            <button
              type="button"
              onClick={runSync}
              disabled={busy || integrationStatus.status !== 'connected'}
              className="rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? 'Syncing…' : 'Run sync now'}
            </button>
          </div>
        }
      >
        {integrationStatus.status === 'connected' ? (
          <p className="text-xs text-[#71717a]">Both Vercel teams are connected and syncing.</p>
        ) : (
          <p className="text-xs text-amber-200">Not connected. {integrationStatus.detail}</p>
        )}
        {syncError && <p className="mt-2 text-xs text-rose-400">{syncError}</p>}
      </AdminCard>

      <div className="flex flex-wrap gap-3">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2 text-xs text-[#f5f5f5]"
        >
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="migrated_to_hetzner">Moved off Vercel</option>
          <option value="dormant">Dormant</option>
          <option value="unknown">Unknown</option>
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2 text-xs text-[#f5f5f5]"
        >
          <option value="all">All teams</option>
          <option value="pumpbots-projects">pumpbots-projects</option>
          <option value="impart-global">impart-global</option>
        </select>
        <p className="text-xs text-[#71717a] self-center">
          {filtered.length} of {projects.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Vercel projects in this view"
          hint="Connect Vercel in Settings and run a sync, or change the filters."
        />
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            { key: 'name', header: 'Name', render: (p) => <span className="font-medium text-[#f5f5f5]">{p.name}</span> },
            { key: 'team', header: 'Team', render: (p) => <Badge text={p.teamSlug} /> },
            { key: 'state', header: 'Status', render: (p) => <Badge text={labelFor(VERCEL_STATE_LABEL, p.state)} tone={STATE_TONES[p.state] ?? 'neutral'} /> },
            { key: 'url', header: 'Production URL', render: (p) =>
              p.productionUrl
                ? <a href={p.productionUrl.startsWith('http') ? p.productionUrl : `https://${p.productionUrl}`} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">{p.productionUrl}</a>
                : <span className="text-[#52525b]">—</span>
            },
            { key: 'repo', header: 'Linked repo', render: (p) => p.linkedRepo ?? <span className="text-[#52525b]">—</span> },
            { key: 'node', header: 'Node', render: (p) => p.nodeVersion ?? <span className="text-[#52525b]">—</span> },
          ]}
        />
      )}
    </div>
  );
}
