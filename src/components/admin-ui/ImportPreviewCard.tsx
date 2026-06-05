import { AdminCard, Badge } from '@/components/admin-ui';
import ImportButtonsClient from '@/components/admin-ui/ImportButtonsClient';
import { previewSnapshotImport, type ImportPreviewGroup } from '@/lib/ops/snapshot-import';

// Server component — fetches the import preview and renders the summary card,
// the per-category table, the action buttons (disabled when the DB is not yet
// connected), and the snapshot-export download links.

const READINESS_TONE: Record<ImportPreviewGroup['readiness'], 'green' | 'amber' | 'rose'> = {
  ready: 'green',
  needs_review: 'amber',
  blocked: 'rose',
};

export default async function ImportPreviewCard() {
  const { groups, dbConfigured } = await previewSnapshotImport();

  const readyCount = groups.filter((g) => g.readiness === 'ready').length;
  const needsReviewCount = groups.filter((g) => g.readiness === 'needs_review').length;
  const blockedCount = groups.filter((g) => g.readiness === 'blocked').length;

  return (
    <AdminCard title="Snapshot import — preview">
      <p className="text-xs text-zinc-700 dark:text-[#a1a1aa] mb-4">
        <span className="text-zinc-900 dark:text-[#f5f5f5] font-medium">{readyCount}</span> categories ready ·{' '}
        <span className="text-zinc-900 dark:text-[#f5f5f5] font-medium">{needsReviewCount}</span> need review ·{' '}
        <span className="text-zinc-900 dark:text-[#f5f5f5] font-medium">{blockedCount}</span> blocked
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] mb-4">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-zinc-200 dark:border-[#1c1c1e]">
            <tr>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Category
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Snapshot count
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Will insert
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Will skip
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Readiness
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.category} className="border-b border-zinc-200 dark:border-[#1c1c1e] last:border-0">
                <td className="px-4 py-3 text-zinc-900 dark:text-[#f5f5f5] font-medium">{g.category}</td>
                <td className="px-4 py-3 text-zinc-900 dark:text-[#e4e4e7] font-mono text-[11px]">
                  {g.snapshotCount}
                </td>
                <td className="px-4 py-3 text-emerald-300 font-mono text-[11px]">
                  {g.willInsert}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-[#a1a1aa] font-mono text-[11px]">{g.willSkip}</td>
                <td className="px-4 py-3">
                  <Badge text={g.readiness.replace('_', ' ')} tone={READINESS_TONE[g.readiness]} />
                </td>
                <td className="px-4 py-3 text-[11px] text-zinc-700 dark:text-[#a1a1aa] max-w-md">{g.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div>
          <ImportButtonsClient canRun={dbConfigured} />
          {!dbConfigured && (
            <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[#52525b]">
              Activates after DATABASE_URL is set.
            </p>
          )}
        </div>

        <div className="border-t border-zinc-200 dark:border-[#1c1c1e] pt-3 flex flex-wrap gap-3">
          <a
            href="/api/admin/ops/export/snapshot.json"
            download
            className="rounded-lg border border-zinc-200 dark:border-[#27272a] px-4 py-2 text-xs font-mono uppercase tracking-[0.15em] text-zinc-900 dark:text-[#e4e4e7] hover:bg-zinc-100 dark:bg-[#1c1c1e] transition-colors"
          >
            Export snapshot JSON
          </a>
          <a
            href="/api/admin/ops/export/snapshot.md"
            download
            className="rounded-lg border border-zinc-200 dark:border-[#27272a] px-4 py-2 text-xs font-mono uppercase tracking-[0.15em] text-zinc-900 dark:text-[#e4e4e7] hover:bg-zinc-100 dark:bg-[#1c1c1e] transition-colors"
          >
            Export snapshot Markdown
          </a>
        </div>
      </div>
    </AdminCard>
  );
}
