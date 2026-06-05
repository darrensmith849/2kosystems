import { AdminCard, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { SNAPSHOT_SERVICES } from '@/lib/ops/email-services-data';
import ServicesClient, {
  type ServicesClientService,
} from './ServicesClient';

// /admin/ops/services — supplier services / subscriptions catalogue.
//
// Read-only preview. Tracks supplier accounts, subscriptions, services,
// and recurring tools. Distinct from Renewals: this is the commercial
// catalogue of every supplier we depend on.
//
// The server component owns the snapshot data + the status / safety cards.
// ServicesClient owns filter chips, summary tiles for the current view,
// JSON/Markdown export, and the per-service cards.

export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  const snapshot = isSnapshotMode();

  // Pass-through to the client. The shape matches SnapshotService — we widen
  // to ServicesClientService here so the client file does not need to import
  // from the 'server-only' module.
  const services: ServicesClientService[] = SNAPSHOT_SERVICES.map((s) => ({
    id: s.id,
    name: s.name,
    provider: s.provider,
    category: s.category,
    linkedScope: s.linkedScope,
    billingOwner: s.billingOwner,
    cadence: s.cadence,
    status: s.status,
    blockers: s.blockers,
    notes: s.notes,
  }));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Services"
        subtitle="Supplier accounts, subscriptions, and recurring tools — the commercial list."
      />
      {snapshot && <SnapshotBanner area="Services list" />}

      {/* Status / context */}
      <AdminCard title="Status">
        <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
          The Services list is a read-only catalogue of every supplier we depend on. No supplier
          credentials or provider API keys are stored or shown here. Use the filters below to
          narrow the view, then export the current view as JSON or Markdown for offline review.
        </p>
      </AdminCard>

      {/* Filter + summary + cards + export (client) */}
      <ServicesClient services={services} />

      {/* Safety */}
      <AdminCard title="What this page never does">
        <ul className="space-y-2 text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
          <li>· No supplier credentials are stored or displayed.</li>
          <li>· No billing actions can be triggered from this page.</li>
          <li>· No provider changes are wired — read-only list only.</li>
          <li>· Renewal dates and amounts live on the Renewals page, not here.</li>
        </ul>
      </AdminCard>
    </div>
  );
}
