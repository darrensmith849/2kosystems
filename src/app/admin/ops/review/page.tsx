import { AdminCard, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import ImportPreviewCard from '@/components/admin-ui/ImportPreviewCard';
import ImportDependencyOrderCard from '@/components/admin-ui/ImportDependencyOrderCard';
import DecisionBridgeCard from '@/components/admin-ui/DecisionBridgeCard';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { listSnapshotDecisionItems } from '@/lib/ops/ops-snapshot-data';
import { validateSnapshot } from '@/lib/ops/snapshot-validation';
import DecisionsClient from './DecisionsClient';
import ReviewSessionClient from './ReviewSessionClient';
import ImportRehearsalCard, { ValidationFindingsCard } from './ImportRehearsalCard';

// Server component. Composes the Review page:
//   1. SectionHeader + SnapshotBanner / NotConnectedBanner
//   2. ImportPreviewCard
//   3. ImportRehearsalCard — what would happen if we imported right now,
//      rendered as a single read over snapshot data + the validation pass.
//   4. ValidationFindingsCard — per-finding detail, grouped by category.
//   5. ImportDependencyOrderCard
//   6. Review session (browser-only)
//   7. DecisionsClient
//   8. Decision-to-ticket bridge

export default async function ReviewPage() {
  const snapshot = isSnapshotMode();
  const decisions = listSnapshotDecisionItems();
  const validationReport = validateSnapshot();

  return (
    <>
      <SectionHeader
        title="Review &amp; decisions"
        subtitle="Open decisions to settle before the database goes live."
      />
      {snapshot ? <SnapshotBanner area="Review &amp; decisions" /> : <NotConnectedBanner />}

      <div className="mb-6">
        <ImportPreviewCard />
      </div>

      <div className="mb-6">
        <ImportRehearsalCard />
      </div>

      <div className="mb-6">
        <ValidationFindingsCard report={validationReport} />
      </div>

      <div className="mb-6">
        <ImportDependencyOrderCard />
      </div>

      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">Review session</h3>
        <ReviewSessionClient />
      </section>

      <DecisionsClient initialDecisions={decisions} />

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-[#f5f5f5] mb-3">Decision-to-ticket bridge</h3>
        <DecisionBridgeCard />
      </section>

      <div className="mt-8">
        <AdminCard title="What this page is for">
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            The dashboard is in read-only snapshot mode until Hetzner Postgres lands. The items above are real ambiguities surfaced from the discovery work — choosing now means the first database import is clean and the canonical mappings are obvious. Status + notes you set here are stored in <strong className="text-[#e4e4e7]">your browser only</strong>; once <code className="text-emerald-300">DATABASE_URL</code> is set, the same questions will reappear as ticket rows seeded from this list and the local entries can be migrated.
          </p>
        </AdminCard>
      </div>
    </>
  );
}
