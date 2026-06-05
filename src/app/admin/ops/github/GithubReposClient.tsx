'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, EmptyState, StatusPill, Tile } from '@/components/admin-ui';
import type { GithubRepoRow } from '@/lib/ops/github-service';
import type { IntegrationConnectivity } from '@/lib/integrations/types';

export default function GithubReposClient({
  repos,
  integrationStatus,
}: {
  repos: GithubRepoRow[];
  integrationStatus: IntegrationConnectivity;
}) {
  const router = useRouter();
  const [showExcluded, setShowExcluded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (showExcluded) return repos;
    return repos.filter((r) => r.category !== 'personal_excluded' && r.category !== 'legacy_stale');
  }, [repos, showExcluded]);

  async function runSync() {
    if (integrationStatus.status !== 'connected') return;
    setBusy(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/admin/ops/sync/github', { method: 'POST' });
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
        title="GitHub"
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
          <p className="text-xs text-zinc-400">Connected. Categories are a best-guess from repo names and topics; manual category edits are planned for a later step.</p>
        ) : (
          <p className="text-xs text-amber-200">
            Not connected. {integrationStatus.detail ?? 'Add a GitHub access token in Settings to enable sync.'}
          </p>
        )}
        {syncError && <p className="mt-2 text-xs text-rose-400">{syncError}</p>}
      </AdminCard>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">
          Showing <strong className="text-zinc-100">{visible.length}</strong> of {repos.length} repos
        </p>
        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showExcluded}
            onChange={(e) => setShowExcluded(e.target.checked)}
            className="accent-emerald-500"
          />
          Show excluded / personal / legacy
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No GitHub repos imported yet"
          hint="If GitHub is connected, run a sync. Otherwise add a GitHub access token in Settings and try again."
        />
      ) : (
        <>
          <p className="text-xs text-zinc-500">{visible.length} repos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((repo) => (
              <Tile
                key={repo.id}
                href="/admin/ops/github"
                name={repo.name}
                subtitle={`${repo.category} · ${repo.language ?? '—'}`}
                sparklineSeed={repo.id}
                sparklineTone={repo.isArchived ? 'neutral' : 'good'}
                status={repo.isArchived ? 'neutral' : 'ok'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
