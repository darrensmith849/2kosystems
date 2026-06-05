'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, EmptyState, StatusPill, Tile } from '@/components/admin-ui';
import type { VercelProject } from '@/lib/db/schema/infra';
import type { IntegrationConnectivity } from '@/lib/integrations/types';

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
              className="rounded-md border border-white/[0.08] hover:bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? 'Syncing…' : 'Run sync now'}
            </button>
          </div>
        }
      >
        {integrationStatus.status === 'connected' ? (
          <p className="text-xs text-zinc-400">Both Vercel teams are connected and syncing.</p>
        ) : (
          <p className="text-xs text-amber-200">Not connected. {integrationStatus.detail}</p>
        )}
        {syncError && <p className="mt-2 text-xs text-rose-400">{syncError}</p>}
      </AdminCard>

      <div className="flex flex-wrap gap-3">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-zinc-100"
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
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-zinc-100"
        >
          <option value="all">All teams</option>
          <option value="pumpbots-projects">pumpbots-projects</option>
          <option value="impart-global">impart-global</option>
        </select>
        <p className="text-xs text-zinc-400 self-center">
          {filtered.length} of {projects.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Vercel projects in this view"
          hint="Connect Vercel in Settings and run a sync, or change the filters."
        />
      ) : (
        <>
          <p className="text-xs text-zinc-500">{filtered.length} projects</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((project) => {
              const state = project.state;
              const sparklineTone = state === 'live' ? 'good' : state === 'dormant' ? 'warn' : 'neutral';
              const status = state === 'live' ? 'ok' : state === 'dormant' ? 'warn' : 'neutral';
              return (
                <Tile
                  key={project.id}
                  href="/admin/ops/vercel"
                  name={project.name}
                  subtitle={`${project.teamSlug ?? '—'} · ${project.state}`}
                  sparklineSeed={project.id}
                  sparklineTone={sparklineTone}
                  status={status}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
