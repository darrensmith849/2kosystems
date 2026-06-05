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

// Server component. Composes the Review page in a renumbered, clearly-named flow:
//   1. What I've reviewed locally — browser-local checklist (ReviewSessionClient)
//   2. Will be imported when the database connects — ImportPreviewCard
//   3. Import rehearsal — split across four small cards inside ImportRehearsalCard
//   4. Validation findings
//   5. Dependency order
//   6. Needs human decision — DecisionsClient
//   7. Decisions → tickets bridge
//
// Names match Track C's brief. No data plumbing changes; section copy only.

export default async function ReviewPage() {
  const snapshot = isSnapshotMode();
  const decisions = listSnapshotDecisionItems();
  const validationReport = validateSnapshot();

  return (
    <>
      <SectionHeader
        title="Review & decisions"
        subtitle="Open decisions to settle before the database goes live."
      />
      {snapshot ? <SnapshotBanner area="Review & decisions" /> : <NotConnectedBanner />}

      <nav className="mb-6 hidden flex-wrap gap-3 rounded-2xl border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b]/60 px-4 py-3 text-[11px] text-zinc-700 dark:text-[#a1a1aa] sm:flex">
        <span className="font-mono uppercase tracking-[0.18em] text-[10px] text-zinc-600 dark:text-[#52525b]">
          Jump to
        </span>
        <a href="#step-1" className="hover:text-emerald-300">
          1. Reviewed locally
        </a>
        <a href="#step-2" className="hover:text-emerald-300">
          2. Will be imported
        </a>
        <a href="#step-3" className="hover:text-emerald-300">
          3. Rehearsal
        </a>
        <a href="#step-4" className="hover:text-emerald-300">
          4. Validation
        </a>
        <a href="#step-5" className="hover:text-emerald-300">
          5. Dependency order
        </a>
        <a href="#step-6" className="hover:text-emerald-300">
          6. Needs human decision
        </a>
        <a href="#step-7" className="hover:text-emerald-300">
          7. Decisions → tickets
        </a>
      </nav>

      <section id="step-1" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">
          1. What I&rsquo;ve reviewed locally
        </h3>
        <ReviewSessionClient />
      </section>

      <section id="step-2" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">
          2. Will be imported when the database connects
        </h3>
        <ImportPreviewCard />
      </section>

      <section id="step-3" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">3. Import rehearsal</h3>
        <ImportRehearsalCard />
      </section>

      <section id="step-4" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">4. Validation findings</h3>
        <ValidationFindingsCard report={validationReport} />
      </section>

      <section id="step-5" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">5. Dependency order</h3>
        <ImportDependencyOrderCard />
      </section>

      <section id="step-6" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">6. Needs human decision</h3>
        <DecisionsClient initialDecisions={decisions} />
      </section>

      <section id="step-7" className="mb-8 scroll-mt-24">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-[#f5f5f5]">
          7. Decisions &rarr; tickets bridge
        </h3>
        <DecisionBridgeCard />
      </section>

      <div className="mt-8">
        <AdminCard title="Scope and limits">
          <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-[#a1a1aa] leading-relaxed">
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-[#52525b]" />
              <span>Read-only preview of the import.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-[#52525b]" />
              <span>
                Decisions and notes are saved in this browser only — switching browsers or clearing
                site data will lose them.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-[#52525b]" />
              <span>No data is written to the production database from this page.</span>
            </li>
          </ul>
        </AdminCard>
      </div>
    </>
  );
}
