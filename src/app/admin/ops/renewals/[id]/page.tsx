import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db/client';
import { renewals } from '@/lib/db/schema/renewals';
import { clients } from '@/lib/db/schema/clients';
import { eq } from 'drizzle-orm';
import { computeRenewalWindow } from '@/lib/ops/renewals-window';
import { AdminCard, Badge, Row, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../../NotConnectedBanner';
import { isSnapshotId, getSnapshotRenewal } from '@/lib/ops/ops-snapshot-data';

const WINDOW_TONE: Record<string, 'rose' | 'amber' | 'blue' | 'neutral'> = {
  overdue: 'rose', due: 'rose', within_7: 'amber', within_14: 'amber',
  within_30: 'blue', within_60: 'neutral', future: 'neutral',
};

const SNAPSHOT_NEXT: Record<string, string> = {
  'snap-renew-sigmafy-domain': 'Confirm renewal date at xneelo registrar. Set auto-renew if not already on.',
  'snap-renew-2kosystems-domain': 'Confirm renewal date at xneelo. Add to reminder cron once DATABASE_URL is set.',
  'snap-renew-hetzner-monthly': 'Recurring monthly bill — verify auto-pay on the Hetzner Cloud account.',
  'snap-renew-vercel-pro': 'Plan to cancel after full Hetzner migration. Track ongoing usage until then.',
  'snap-renew-xneelo-email': 'DO NOT cancel — 32 production mailboxes depend on it. Confirm annual renewal at xneelo.',
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}

function fmtAmount(amount: string | null, currency: string): string {
  if (!amount) return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency || 'ZAR', maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default async function RenewalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isSnap = isSnapshotId(id);

  if (isSnap) {
    const r = getSnapshotRenewal(id);
    if (!r) notFound();
    const win = computeRenewalWindow(r.nextDueAt);
    return (
      <>
        <SectionHeader
          title={r.name}
          subtitle={
            <>
              <Link href="/admin/ops/renewals" className="text-emerald-300 hover:underline">← back to Renewals</Link>
              <span className="ml-2 text-[#52525b]">·</span>
              <span className="ml-2 text-[#71717a]">{r.kind}</span>
            </>
          }
        />
        <SnapshotBanner area="This renewal" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AdminCard title="Renewal detail">
              <Row label="Name" value={r.name} />
              <Row label="Kind" value={<Badge text={r.kind} />} />
              <Row label="Window" value={<Badge text={win.replace('_', ' ')} tone={WINDOW_TONE[win] ?? 'neutral'} />} />
              <Row label="Next due" value={fmtDate(r.nextDueAt)} />
              <Row label="Period" value={r.period ?? null} />
              <Row label="Amount" value={fmtAmount(r.amount, r.currency)} />
              {r.client && <Row label="Client" value={<Link href={`/admin/ops/clients/${r.clientId}`} className="text-emerald-300 hover:underline">{r.client.name}</Link>} />}
              <Row label="Auto-renew" value={r.autoRenew === null ? 'unknown' : r.autoRenew ? <Badge text="yes" tone="green" /> : <Badge text="no" tone="amber" />} />
              <Row label="Notes" value={r.notes ?? null} />
            </AdminCard>
          </div>
          <div className="space-y-4">
            <AdminCard title="What needs confirming">
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{r.notes ?? 'Verify with the provider before relying on the snapshot date.'}</p>
            </AdminCard>
            <AdminCard title="Next action">
              <p className="text-xs text-[#e4e4e7] leading-relaxed">{SNAPSHOT_NEXT[id] ?? 'Confirm date + cost; mark auto-renew once DATABASE_URL is set.'}</p>
            </AdminCard>
          </div>
        </div>
      </>
    );
  }

  const db = getDb();
  if (!db) notFound();
  const rows = await db.select({ renewal: renewals, client: clients }).from(renewals).leftJoin(clients, eq(clients.id, renewals.clientId)).where(eq(renewals.id, id));
  const row = rows[0];
  if (!row) notFound();
  const r = row.renewal;
  const win = computeRenewalWindow(r.nextDueAt);
  return (
    <>
      <SectionHeader
        title={r.name}
        subtitle={
          <>
            <Link href="/admin/ops/renewals" className="text-emerald-300 hover:underline">← back to Renewals</Link>
            <span className="ml-2 text-[#52525b]">·</span>
            <span className="ml-2 text-[#71717a]">{r.kind}</span>
          </>
        }
      />
      <NotConnectedBanner />
      <AdminCard title="Renewal detail">
        <Row label="Name" value={r.name} />
        <Row label="Kind" value={<Badge text={r.kind} />} />
        <Row label="Window" value={<Badge text={win.replace('_', ' ')} tone={WINDOW_TONE[win] ?? 'neutral'} />} />
        <Row label="Next due" value={fmtDate(r.nextDueAt)} />
        <Row label="Period" value={r.period ?? null} />
        <Row label="Amount" value={fmtAmount(r.amount, r.currency)} />
        {row.client && <Row label="Client" value={<Link href={`/admin/ops/clients/${r.clientId}`} className="text-emerald-300 hover:underline">{row.client.name}</Link>} />}
        <Row label="Auto-renew" value={r.autoRenew === null ? 'unknown' : r.autoRenew ? <Badge text="yes" tone="green" /> : <Badge text="no" tone="amber" />} />
        <Row label="Reminder state" value={<Badge text={r.reminderState} />} />
        <Row label="External link" value={r.externalLink ? <a className="text-emerald-300 hover:underline" href={r.externalLink} target="_blank" rel="noreferrer">{r.externalLink}</a> : null} />
        <Row label="Notes" value={r.notes ?? null} />
      </AdminCard>
    </>
  );
}
