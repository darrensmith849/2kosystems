'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, DataTable, EmptyState, StatusPill } from '@/components/admin-ui';
import type { GithubRepoRow } from '@/lib/ops/github-service';
import type { IntegrationConnectivity } from '@/lib/integrations/types';
import { REPO_CATEGORY_LABEL, labelFor } from '@/lib/ops/labels';

const CATEGORY_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  '2ko_africa': 'green',
  '2ko_systems': 'green',
  'six_sigma': 'green',
  'sigmaphi_portal': 'green',
  'sigmaphi_stats': 'green',
  'shared_internal': 'blue',
  'external_client': 'amber',
  'personal_excluded': 'neutral',
  'legacy_stale': 'neutral',
  'unknown_unmapped': 'rose',
};

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
              className="rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? 'Syncing…' : 'Run sync now'}
            </button>
          </div>
        }
      >
        {integrationStatus.status === 'connected' ? (
          <p className="text-xs text-[#71717a]">Connected. Categories are a best-guess from repo names and topics; manual category edits are planned for a later step.</p>
        ) : (
          <p className="text-xs text-amber-200">
            Not connected. {integrationStatus.detail ?? 'Add a GitHub access token in Settings to enable sync.'}
          </p>
        )}
        {syncError && <p className="mt-2 text-xs text-rose-400">{syncError}</p>}
      </AdminCard>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#71717a]">
          Showing <strong className="text-[#f5f5f5]">{visible.length}</strong> of {repos.length} repos
        </p>
        <label className="flex items-center gap-2 text-xs text-[#a1a1aa] cursor-pointer">
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
        <DataTable
          rows={visible}
          columns={[
            { key: 'name', header: 'Name', render: (r) => (
              <span>
                <span className="text-[#71717a]">{r.owner}/</span>
                <span className="font-medium text-[#f5f5f5]">{r.name}</span>
                {r.isArchived && <span className="ml-2 text-[10px] text-amber-300">archived</span>}
              </span>
            )},
            { key: 'visibility', header: 'Visibility', render: (r) => <Badge text={r.visibility[0].toUpperCase() + r.visibility.slice(1)} tone={r.visibility === 'private' ? 'neutral' : 'blue'} /> },
            { key: 'category', header: 'Category', render: (r) => <Badge text={labelFor(REPO_CATEGORY_LABEL, r.category)} tone={CATEGORY_TONES[r.category] ?? 'neutral'} /> },
            { key: 'language', header: 'Language', render: (r) => r.language ?? <span className="text-[#52525b]">—</span> },
            { key: 'pushed', header: 'Last push', render: (r) => fmtDate(r.pushedAt) },
          ]}
        />
      )}
    </div>
  );
}

function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toISOString().slice(0, 10);
}
