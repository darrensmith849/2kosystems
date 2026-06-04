import { listRecentSyncRuns } from '@/lib/ops/sync-service';
import { AdminCard, Badge, DataTable, EmptyState, SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import NotConnectedBanner from '../NotConnectedBanner';

const STATUS_TONES: Record<string, 'green' | 'amber' | 'rose' | 'blue' | 'neutral'> = {
  ok: 'green', running: 'amber', partial: 'amber', failed: 'rose', skipped: 'blue',
};

export default async function SyncLogPage() {
  const runs = await listRecentSyncRuns(100);
  return (
    <>
      <SectionHeader title="Sync log" subtitle="Recent automatic and manual sync runs." />
      <NotConnectedBanner />
      <WaitingForDb
        area="Sync runs"
        whatYouWillSee={[
          'Every scheduled-job and manual sync run across all providers',
          'Per-run counts: seen / created / updated / skipped',
          'Duration and the team member who triggered each run',
        ]}
      />
      {runs.length === 0 ? (
        <AdminCard title="No sync runs yet">
          <EmptyState
            title="Nothing has synced yet"
            hint="Run a sync from any section (GitHub, Vercel, etc.) to see runs appear here."
          />
        </AdminCard>
      ) : (
        <DataTable
          rows={runs}
          columns={[
            { key: 'provider', header: 'Provider', render: (r) => <span className="font-mono text-[#f5f5f5]">{r.provider}</span> },
            { key: 'status', header: 'Status', render: (r) => <Badge text={r.status} tone={STATUS_TONES[r.status] ?? 'neutral'} /> },
            { key: 'started', header: 'Started', render: (r) => fmtAbs(r.startedAt) },
            { key: 'duration', header: 'Duration', render: (r) => duration(r.startedAt, r.finishedAt) },
            { key: 'counts', header: 'Counts', render: (r) => <span className="font-mono text-[10px] text-[#a1a1aa]">seen {r.itemsSeen} · +{r.itemsCreated} · ↻{r.itemsUpdated} · skip {r.itemsSkipped}</span> },
            { key: 'who', header: 'Triggered by', render: (r) => <span className="text-xs text-[#a1a1aa]">{r.triggeredBy ?? '—'}{r.triggeredByOperatorSlug ? ` (${r.triggeredByOperatorSlug})` : ''}</span> },
            { key: 'error', header: 'Error', render: (r) => r.errorMessage ? <span className="text-xs text-rose-400">{r.errorMessage.slice(0, 60)}</span> : <span className="text-[#52525b]">—</span> },
          ]}
        />
      )}
    </>
  );
}

function fmtAbs(d: Date | null): string {
  if (!d) return '—';
  const iso = new Date(d).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}Z`;
}
function duration(start: Date | null, end: Date | null): string {
  if (!start || !end) return '—';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m`;
}
