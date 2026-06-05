import { AdminCard, Badge } from '@/components/admin-ui';
import DecisionBridgeButtonsClient from '@/components/admin-ui/DecisionBridgeButtonsClient';
import { previewDecisionToTicket } from '@/lib/ops/decision-to-ticket';
import { isDbConfigured } from '@/lib/db/client';

// Server component. Fetches the decision-to-ticket bridge preview and renders
// the summary, an items table, and the dry-run / run-import buttons via a
// small client component. Buttons disabled until DATABASE_URL is set.

const PRIORITY_TONE: Record<'low' | 'med' | 'high' | 'urgent', 'neutral' | 'blue' | 'amber' | 'rose'> = {
  low: 'neutral',
  med: 'blue',
  high: 'amber',
  urgent: 'rose',
};

export default async function DecisionBridgeCard() {
  const preview = await previewDecisionToTicket();
  const dbConfigured = isDbConfigured();

  const clusters = Object.entries(preview.byCluster);

  return (
    <AdminCard title="Decision-to-ticket bridge — preview">
      <p className="text-xs text-zinc-700 dark:text-[#a1a1aa] mb-3">
        Will create <span className="text-zinc-900 dark:text-[#f5f5f5] font-medium">{preview.toCreate}</span>{' '}
        tickets, skip{' '}
        <span className="text-zinc-900 dark:text-[#f5f5f5] font-medium">{preview.toSkip}</span> existing.
        {' '}
        <span className="text-zinc-500 dark:text-[#52525b]">
          ({preview.totalDecisions} decisions in snapshot)
        </span>
      </p>

      {clusters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {clusters.map(([cluster, n]) => (
            <Badge key={cluster} text={`${cluster}: ${n}`} tone="neutral" />
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] mb-4">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-zinc-200 dark:border-[#1c1c1e]">
            <tr>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Decision id
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Cluster
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Ticket title
              </th>
              <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-zinc-700 dark:text-[#71717a]">
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {preview.items.map((item) => (
              <tr key={item.decisionId} className="border-b border-zinc-200 dark:border-[#1c1c1e] last:border-0">
                <td className="px-4 py-3 text-zinc-700 dark:text-[#a1a1aa] font-mono text-[11px]">
                  {item.decisionId}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-[#e4e4e7] font-mono text-[11px]">
                  {item.clusterTitle}
                </td>
                <td className="px-4 py-3 text-zinc-900 dark:text-[#f5f5f5] max-w-md">{item.ticketTitle}</td>
                <td className="px-4 py-3">
                  <Badge text={item.priority} tone={PRIORITY_TONE[item.priority]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <DecisionBridgeButtonsClient canRun={dbConfigured} />
        {!dbConfigured && (
          <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-[#52525b]">
            Activates after DATABASE_URL is set.
          </p>
        )}
      </div>
    </AdminCard>
  );
}
