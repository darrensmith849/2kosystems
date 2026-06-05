import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db/client';
import { incidents } from '@/lib/db/schema/incidents';
import { clients } from '@/lib/db/schema/clients';
import { assets } from '@/lib/db/schema/assets';
import { eq } from 'drizzle-orm';
import { AdminCard, Badge, Row, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../../NotConnectedBanner';
import { isSnapshotId, getSnapshotIncident } from '@/lib/ops/ops-snapshot-data';

const SEVERITY_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  info: 'blue', minor: 'neutral', major: 'amber', critical: 'rose',
};
const STATUS_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  open: 'amber', investigating: 'amber', resolved: 'green', postmortem_done: 'blue',
};

const SNAPSHOT_NEXT: Record<string, { next: string; clientNotif: boolean; blockedBy: string[] }> = {
  'snap-incident-saps-dev-dead-ip': {
    next: 'Delete the stale dev. record OR repoint to an active host. Operator must decide which.',
    clientNotif: false, blockedBy: ['CLOUDFLARE_API_TOKEN or DNS UI access'],
  },
  'snap-incident-xneelo-stranded': {
    next: 'Confirm with original owners whether to revive (NS migration) or retire (close). All four zones flagged in the Review page.',
    clientNotif: true, blockedBy: ['xneelo dashboard access'],
  },
  'snap-incident-ma130-apps-disk': {
    next: 'Resolved — disk cleared. Follow-up: add a daily disk-usage check cron + Better Stack monitor.',
    clientNotif: false, blockedBy: ['SSH to ma130-apps'],
  },
  'snap-incident-taxup-unmapped': {
    next: 'Audit the legacy taxup Postgres DB on ma130-data and confirm linkage to taxup.app. See Review.',
    clientNotif: false, blockedBy: ['SSH to ma130-data'],
  },
  'snap-incident-impart-us-redirect': {
    next: 'Configure redirect on Vercel impart_agency_site project pointing impartagency.us → impartagency.co.za.',
    clientNotif: false, blockedBy: ['VERCEL_API_TOKEN or Vercel UI access'],
  },
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}

function duration(start: Date | string | null | undefined, end: Date | string | null | undefined): string {
  if (!start) return '—';
  const s = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const e = end ? (end instanceof Date ? end.getTime() : new Date(end).getTime()) : Date.now();
  const ms = e - s;
  if (ms < 0) return '—';
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ${h % 24}h`;
  if (h >= 1) return `${h}h`;
  const m = Math.floor(ms / 60_000);
  return `${m}m`;
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isSnap = isSnapshotId(id);

  if (isSnap) {
    const i = getSnapshotIncident(id);
    if (!i) notFound();
    const ctx = SNAPSHOT_NEXT[id];
    const ongoing = i.status === 'open' || i.status === 'investigating';
    return (
      <>
        <SectionHeader
          title={i.summary}
          subtitle={
            <>
              <Link href="/admin/ops/incidents" className="text-emerald-300 hover:underline">← back to Incidents</Link>
              <span className="ml-2 text-zinc-600 dark:text-[#52525b]">·</span>
              <span className="ml-2 text-zinc-700 dark:text-[#71717a]">{i.source}</span>
            </>
          }
        />
        <SnapshotBanner area="This incident" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AdminCard title="Incident detail">
              <Row label="Summary" value={i.summary} />
              <Row label="Severity" value={<Badge text={i.severity} tone={SEVERITY_TONES[i.severity] ?? 'neutral'} />} />
              <Row label="Status" value={<Badge text={i.status} tone={STATUS_TONES[i.status] ?? 'neutral'} />} />
              <Row label="Source" value={<Badge text={i.source} />} />
              {i.asset && <Row label="Asset" value={<Link href={`/admin/ops/assets/${i.assetId}`} className="text-emerald-300 hover:underline">{i.asset.name}</Link>} />}
              {i.client && <Row label="Client" value={<Link href={`/admin/ops/clients/${i.clientId}`} className="text-emerald-300 hover:underline">{i.client.name}</Link>} />}
              <Row label="Started" value={fmtDate(i.startedAt)} />
              <Row label="Resolved" value={i.resolvedAt ? fmtDate(i.resolvedAt) : ongoing ? <Badge text="ongoing" tone="amber" /> : '—'} />
              <Row label="Duration" value={duration(i.startedAt, i.resolvedAt ?? i.endedAt)} />
              <Row label="Root cause" value={i.rootCause ?? null} />
              <Row label="Follow-up required" value={i.followupRequired ? <Badge text="yes" tone="amber" /> : <Badge text="no" tone="green" />} />
            </AdminCard>
          </div>
          <div className="space-y-4">
            <AdminCard title="Recommended next step">
              <p className="text-xs text-zinc-800 dark:text-[#e4e4e7] leading-relaxed">{ctx?.next ?? 'Review and resolve once Hetzner Postgres connects.'}</p>
            </AdminCard>
            <AdminCard title="Client notification">
              {ctx?.clientNotif ? (
                <p className="text-xs text-amber-200">Client notification recommended — verify with the operator before sending.</p>
              ) : (
                <p className="text-xs text-zinc-700 dark:text-[#a1a1aa]">No client notification required for this incident.</p>
              )}
            </AdminCard>
            <AdminCard title="Blocked by">
              <ul className="space-y-1 text-xs text-zinc-700 dark:text-[#a1a1aa]">
                {(ctx?.blockedBy ?? []).map((b) => <li key={b}>· {b}</li>)}
                {(!ctx || ctx.blockedBy.length === 0) && <li>· no provider blockers</li>}
              </ul>
            </AdminCard>
          </div>
        </div>
      </>
    );
  }

  const db = getDb();
  if (!db) notFound();
  const rows = await db.select({ incident: incidents, asset: assets, client: clients }).from(incidents).leftJoin(assets, eq(assets.id, incidents.assetId)).leftJoin(clients, eq(clients.id, incidents.clientId)).where(eq(incidents.id, id));
  const row = rows[0];
  if (!row) notFound();
  const i = row.incident;
  return (
    <>
      <SectionHeader
        title={i.summary}
        subtitle={<><Link href="/admin/ops/incidents" className="text-emerald-300 hover:underline">← back to Incidents</Link></>}
      />
      <NotConnectedBanner />
      <AdminCard title="Incident detail">
        <Row label="Summary" value={i.summary} />
        <Row label="Severity" value={<Badge text={i.severity} tone={SEVERITY_TONES[i.severity] ?? 'neutral'} />} />
        <Row label="Status" value={<Badge text={i.status} tone={STATUS_TONES[i.status] ?? 'neutral'} />} />
        <Row label="Source" value={<Badge text={i.source} />} />
        {row.asset && <Row label="Asset" value={<Link href={`/admin/ops/assets/${i.assetId}`} className="text-emerald-300 hover:underline">{row.asset.name}</Link>} />}
        {row.client && <Row label="Client" value={<Link href={`/admin/ops/clients/${i.clientId}`} className="text-emerald-300 hover:underline">{row.client.name}</Link>} />}
        <Row label="Started" value={fmtDate(i.startedAt)} />
        <Row label="Resolved" value={i.resolvedAt ? fmtDate(i.resolvedAt) : null} />
        <Row label="Duration" value={duration(i.startedAt, i.resolvedAt ?? i.endedAt)} />
        <Row label="Root cause" value={i.rootCause ?? null} />
        <Row label="Follow-up required" value={i.followupRequired ? <Badge text="yes" tone="amber" /> : <Badge text="no" tone="green" />} />
      </AdminCard>
    </>
  );
}
