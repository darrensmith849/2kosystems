import { AdminCard, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import ImportPreviewCard from '@/components/admin-ui/ImportPreviewCard';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { listSnapshotDecisionItems } from '@/lib/ops/ops-snapshot-data';
import DecisionsClient from './DecisionsClient';

// Server component. Fetches the snapshot decisions list and composes:
//   1. SectionHeader + SnapshotBanner / NotConnectedBanner
//   2. ImportPreviewCard (Phase A component — supersedes the old inline
//      "Import readiness" table, which is now removed to avoid duplicating
//      the same readiness signal twice on one page).
//   3. DecisionsClient — the browser-only review workflow.
//   4. Footer explainer card.

export default async function ReviewPage() {
  const snapshot = isSnapshotMode();
  const decisions = listSnapshotDecisionItems();

  return (
    <>
      <SectionHeader
        title="Review &amp; decisions"
        subtitle="Ambiguous items from the discovery snapshot — pick an option per item before Hetzner Postgres lands so the import is clean."
      />
      {snapshot ? <SnapshotBanner area="Review &amp; decisions" /> : <NotConnectedBanner />}

      <div className="mb-6">
        <ImportPreviewCard />
      </div>

      <DecisionsClient initialDecisions={decisions} />

      <div className="mt-8">
        <AdminCard title="What this page is for">
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            The dashboard is in read-only Snapshot Mode until Hetzner Postgres lands. The items above are real ambiguities surfaced from the discovery work — choosing now means the first DB import is clean and the canonical mappings are obvious. Status + notes you set here are stored in <strong className="text-[#e4e4e7]">your browser only</strong>; once <code className="text-emerald-300">DATABASE_URL</code> is set, the same questions will reappear as ticket rows seeded from this list and the local entries can be migrated.
          </p>
        </AdminCard>
      </div>
    </>
  );
}
