import { AdminCard, Badge, Row, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  listSnapshotDecisionItems,
  getSnapshotImportReadiness,
  type SnapshotDecision,
  type ImportReadinessGroup,
} from '@/lib/ops/ops-snapshot-data';

const RISK_TONE: Record<SnapshotDecision['risk'], 'rose' | 'amber' | 'blue' | 'neutral' | 'green'> = {
  high: 'rose', med: 'amber', low: 'green',
};

const READINESS_TONE: Record<ImportReadinessGroup['readiness'], 'green' | 'amber' | 'rose'> = {
  ready: 'green', needs_review: 'amber', blocked: 'rose',
};

const CLUSTER_LABEL: Record<SnapshotDecision['cluster'], string> = {
  repo_cluster: 'Repo cluster',
  unmapped_vercel: 'Unmapped Vercel / domain',
  cleanup: 'Cleanup',
  incident: 'Open risk',
  backup: 'Backup gap',
};

export default async function ReviewPage() {
  const snapshot = isSnapshotMode();
  const decisions = listSnapshotDecisionItems();
  const readiness = getSnapshotImportReadiness();

  // Group decisions by cluster for clearer scanning.
  const byCluster = decisions.reduce<Record<string, SnapshotDecision[]>>((acc, d) => {
    (acc[d.cluster] ||= []).push(d);
    return acc;
  }, {});

  return (
    <>
      <SectionHeader
        title="Review &amp; decisions"
        subtitle="Ambiguous items from the discovery snapshot — pick an option per item before Hetzner Postgres lands so the import is clean."
      />
      {snapshot ? <SnapshotBanner area="Review &amp; decisions" /> : <NotConnectedBanner />}

      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-[#71717a] mb-3">
          Import readiness — what will load when DATABASE_URL is set
        </h3>
        <div className="rounded-2xl border border-[#27272a] bg-[#111113]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#1c1c1e]">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#71717a]">Category</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#71717a]">Snapshot count</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#71717a]">Readiness</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-[#71717a]">Notes</th>
              </tr>
            </thead>
            <tbody>
              {readiness.map((r) => (
                <tr key={r.category} className="border-b border-[#1c1c1e] last:border-0">
                  <td className="px-4 py-3 text-[#f5f5f5] font-medium">{r.category}</td>
                  <td className="px-4 py-3 text-[#e4e4e7] font-mono text-[11px]">{r.snapshotCount}</td>
                  <td className="px-4 py-3"><Badge text={r.readiness.replace('_', ' ')} tone={READINESS_TONE[r.readiness]} /></td>
                  <td className="px-4 py-3 text-[11px] text-[#a1a1aa]">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {Object.entries(byCluster).map(([cluster, items]) => (
        <section key={cluster} className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-[#71717a] mb-3">
            {CLUSTER_LABEL[cluster as SnapshotDecision['cluster']]} · {items.length}
          </h3>
          <div className="space-y-3">
            {items.map((d) => (
              <DecisionCard key={d.id} d={d} />
            ))}
          </div>
        </section>
      ))}

      <AdminCard title="What this page is for">
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          The dashboard is in read-only Snapshot Mode until Hetzner Postgres lands. The items above are real ambiguities surfaced from the discovery work — choosing now means the first DB import is clean and the canonical mappings are obvious. None of these decisions are persisted yet; once <code className="text-emerald-300">DATABASE_URL</code> is set, the same questions will reappear as ticket rows seeded from this list.
        </p>
      </AdminCard>
    </>
  );
}

function DecisionCard({ d }: { d: SnapshotDecision }) {
  const recommended = d.options.find((o) => o.recommended);
  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#f5f5f5]">{d.title}</p>
          <p className="mt-1 text-xs text-[#a1a1aa] leading-relaxed">{d.context}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge text={`risk: ${d.risk}`} tone={RISK_TONE[d.risk]} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#52525b] mb-1.5">Options</p>
          <ul className="space-y-1">
            {d.options.map((o) => (
              <li
                key={o.label}
                className={`text-xs rounded-md border px-3 py-1.5 ${
                  o.recommended
                    ? 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'
                    : 'border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                {o.recommended && <span className="mr-1 text-[10px] uppercase tracking-wider text-emerald-400">recommended</span>}
                {o.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Row label="Recommendation" value={<span className="text-[#e4e4e7]">{d.recommendation}</span>} />
          <Row label="Action" value={<code className="font-mono text-[10px] text-[#a1a1aa] break-all">{d.action}</code>} />
          <Row label="Blocked by" value={<span className="text-[11px] text-[#a1a1aa]">{d.blockedBy.includes('none') ? 'no provider blockers — operator decision only' : d.blockedBy.join(', ')}</span>} />
        </div>
      </div>
      {recommended && (
        <p className="mt-3 text-[10px] uppercase tracking-wider text-emerald-400/80">
          Decision is not persisted yet — activates when DATABASE_URL is set.
        </p>
      )}
    </div>
  );
}
