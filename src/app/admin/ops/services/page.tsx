import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  SERVICE_CATEGORY_LABEL,
  SERVICE_STATUS_LABEL,
  SERVICE_STATUS_TONE,
  SNAPSHOT_SERVICES,
} from '@/lib/ops/email-services-data';

// /admin/ops/services — supplier services / subscriptions catalogue.
//
// Read-only preview. Tracks supplier accounts, subscriptions, services,
// and recurring tools. Distinct from Renewals: this is the commercial
// catalogue of every supplier we depend on.

export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  const snapshot = isSnapshotMode();
  const total = SNAPSHOT_SERVICES.length;
  const active = SNAPSHOT_SERVICES.filter((s) => s.status === 'active').length;
  const needsReview = SNAPSHOT_SERVICES.filter(
    (s) => s.status === 'needs_review' || s.status === 'blocked',
  ).length;
  const planned = SNAPSHOT_SERVICES.filter((s) => s.status === 'planned').length;
  const missingBillingOwner = SNAPSHOT_SERVICES.filter((s) =>
    /needs review|unknown/i.test(s.billingOwner),
  ).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Services"
        subtitle="Supplier accounts, subscriptions, and recurring tools — the commercial catalogue."
      />
      {snapshot && <SnapshotBanner area="Services catalogue" />}

      {/* At-a-glance */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatusTile label="Total" value={total} tone="neutral" />
        <StatusTile label="Active" value={active} tone="green" />
        <StatusTile label="Needs review" value={needsReview} tone="amber" />
        <StatusTile label="Missing billing owner" value={missingBillingOwner} tone="amber" />
      </div>

      {planned > 0 && (
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          {planned} services are planned but not yet active. They become active once the relevant
          token, subscription, or approval is in place.
        </p>
      )}

      {/* Catalogue */}
      <AdminCard title="Catalogue">
        <ul className="space-y-3">
          {SNAPSHOT_SERVICES.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-[#f5f5f5]">{s.name}</p>
                <Badge
                  text={SERVICE_STATUS_LABEL[s.status]}
                  tone={SERVICE_STATUS_TONE[s.status]}
                />
                <Badge text={SERVICE_CATEGORY_LABEL[s.category]} tone="neutral" />
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[140px_1fr] text-xs">
                <span className="text-[#71717a]">Provider</span>
                <span className="text-[#e4e4e7]">{s.provider}</span>

                <span className="text-[#71717a]">Linked scope</span>
                <span className="text-[#e4e4e7]">{s.linkedScope}</span>

                <span className="text-[#71717a]">Billing owner</span>
                <span className="text-[#e4e4e7]">{s.billingOwner}</span>

                <span className="text-[#71717a]">Cadence</span>
                <span className="text-[#e4e4e7]">{s.cadence}</span>

                {s.blockers.filter((b) => b !== 'none').length > 0 && (
                  <>
                    <span className="text-[#71717a]">Blocker</span>
                    <span className="text-[#e4e4e7]">
                      {s.blockers.filter((b) => b !== 'none').join(', ')}
                    </span>
                  </>
                )}

                <span className="text-[#71717a]">Notes</span>
                <span className="text-[#a1a1aa] leading-relaxed">{s.notes}</span>
              </div>
            </li>
          ))}
        </ul>
      </AdminCard>

      {/* Safety */}
      <AdminCard title="What this page never does">
        <ul className="space-y-2 text-xs text-[#a1a1aa] leading-relaxed">
          <li>· No supplier credentials are stored or displayed.</li>
          <li>· No billing actions can be triggered from this page.</li>
          <li>· No provider mutations are wired — read-only catalogue only.</li>
          <li>· Renewal dates and amounts live on the Renewals page, not here.</li>
        </ul>
      </AdminCard>
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'neutral' | 'green' | 'amber' | 'rose' | 'blue';
}) {
  const ring =
    tone === 'green'
      ? 'border-emerald-400/30 bg-emerald-400/5'
      : tone === 'amber'
        ? 'border-amber-400/30 bg-amber-400/5'
        : tone === 'rose'
          ? 'border-rose-400/30 bg-rose-400/5'
          : tone === 'blue'
            ? 'border-sky-400/30 bg-sky-400/5'
            : 'border-[#27272a] bg-[#0e0e10]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[#f5f5f5]">{value}</p>
    </div>
  );
}
