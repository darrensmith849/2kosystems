import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAsset, listLinksForAsset } from '@/lib/ops/asset-links-service';
import { listTicketsForAsset } from '@/lib/ops/tickets-service';
import { listRenewalsForSubject, computeRenewalWindow } from '@/lib/ops/renewals-service';
import { listIncidentsForAsset } from '@/lib/ops/incidents-service';
import { AdminCard, Badge, DataTable, EmptyState, Row, SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../../NotConnectedBanner';
import AssetLinksClient from './AssetLinksClient';
import type { TicketWithRefs } from '@/lib/ops/tickets-service';
import type { RenewalWithRefs } from '@/lib/ops/renewals-service';
import type { IncidentWithRefs } from '@/lib/ops/incidents-service';

const PRIORITY_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  low: 'neutral',
  med: 'blue',
  high: 'amber',
  urgent: 'rose',
};

const SEVERITY_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  info: 'blue',
  minor: 'neutral',
  major: 'amber',
  critical: 'rose',
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}

async function safeList<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();
  const links = await listLinksForAsset(id);

  const [relatedTickets, relatedRenewals, relatedIncidents] = await Promise.all([
    safeList<TicketWithRefs>(() => listTicketsForAsset(id)),
    safeList<RenewalWithRefs>(() => listRenewalsForSubject('asset', id)),
    safeList<IncidentWithRefs>(() => listIncidentsForAsset(id)),
  ]);

  return (
    <>
      <SectionHeader
        title={asset.name}
        subtitle={
          <span>
            <Link href="/admin/ops/assets" className="text-emerald-300 hover:underline">← Assets</Link>
            <span className="ml-2 text-[#52525b]">·</span>
            <span className="ml-2 text-[#71717a]">{asset.type}</span>
          </span>
        }
      />
      <NotConnectedBanner />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <AdminCard title="Asset detail">
            <Row label="Name" value={asset.name} />
            <Row label="Type" value={asset.type} />
            <Row label="Environment" value={asset.environment} />
            <Row label="Status" value={asset.status} />
            <Row
              label="Live URL"
              value={
                asset.liveUrl ? (
                  <a href={asset.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">
                    {asset.liveUrl}
                  </a>
                ) : null
              }
            />
            <Row label="Staging URL" value={asset.stagingUrl ?? null} />
            <Row label="Notes" value={asset.notes ?? null} />
          </AdminCard>
        </div>
        <AdminCard title="Audit">
          <Row label="Created" value={<span className="font-mono text-[10px]">{asset.createdAt?.toISOString().slice(0, 16) ?? '—'}</span>} />
          <Row label="Updated" value={<span className="font-mono text-[10px]">{asset.updatedAt?.toISOString().slice(0, 16) ?? '—'}</span>} />
          <Row label="Last deployed" value={asset.lastDeployedAt ? <span className="font-mono text-[10px]">{asset.lastDeployedAt.toISOString().slice(0, 16)}</span> : null} />
          <Row label="Last audited" value={asset.lastAuditedAt ? <span className="font-mono text-[10px]">{asset.lastAuditedAt.toISOString().slice(0, 16)}</span> : null} />
        </AdminCard>
      </div>

      <AssetLinksClient assetId={id} initialLinks={links} />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard title={`Related tickets · ${relatedTickets.length}`}>
          {relatedTickets.length === 0 ? (
            <EmptyState title="No related tickets yet" />
          ) : (
            <DataTable
              rows={relatedTickets}
              columns={[
                {
                  key: 'title',
                  header: 'Title',
                  render: (t) => (
                    <Link
                      href={`/admin/ops/tickets/${t.id}`}
                      className="font-medium text-[#f5f5f5] hover:text-emerald-300 transition-colors"
                    >
                      {t.title}
                    </Link>
                  ),
                },
                {
                  key: 'priority',
                  header: 'Priority',
                  render: (t) => (
                    <Badge text={t.priority} tone={PRIORITY_TONES[t.priority] ?? 'neutral'} />
                  ),
                },
                { key: 'status', header: 'Status', render: (t) => <Badge text={t.status} /> },
                { key: 'updated', header: 'Updated', render: (t) => fmtDate(t.updatedAt) },
              ]}
            />
          )}
        </AdminCard>

        <AdminCard title={`Related renewals · ${relatedRenewals.length}`}>
          {relatedRenewals.length === 0 ? (
            <EmptyState title="No related renewals yet" />
          ) : (
            <DataTable
              rows={relatedRenewals}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  render: (r) => <span className="font-medium text-[#f5f5f5]">{r.name}</span>,
                },
                { key: 'kind', header: 'Kind', render: (r) => <Badge text={r.kind} /> },
                {
                  key: 'window',
                  header: 'Window',
                  render: (r) => {
                    const w = computeRenewalWindow(r.nextDueAt);
                    const tone =
                      w === 'overdue' || w === 'due'
                        ? 'rose'
                        : w === 'within_7' || w === 'within_14'
                          ? 'amber'
                          : 'neutral';
                    return <Badge text={w.replace('_', ' ')} tone={tone} />;
                  },
                },
                { key: 'due', header: 'Due', render: (r) => fmtDate(r.nextDueAt) },
              ]}
            />
          )}
        </AdminCard>

        <div className="lg:col-span-2">
          <AdminCard title={`Related incidents · ${relatedIncidents.length}`}>
            {relatedIncidents.length === 0 ? (
              <EmptyState title="No related incidents yet" />
            ) : (
              <DataTable
                rows={relatedIncidents}
                columns={[
                  {
                    key: 'summary',
                    header: 'Summary',
                    render: (i) => (
                      <span className="font-medium text-[#f5f5f5]">{i.summary}</span>
                    ),
                  },
                  {
                    key: 'severity',
                    header: 'Severity',
                    render: (i) => (
                      <Badge text={i.severity} tone={SEVERITY_TONES[i.severity] ?? 'neutral'} />
                    ),
                  },
                  { key: 'status', header: 'Status', render: (i) => <Badge text={i.status} /> },
                  { key: 'started', header: 'Started', render: (i) => fmtDate(i.startedAt) },
                  { key: 'resolved', header: 'Resolved', render: (i) => fmtDate(i.resolvedAt) },
                ]}
              />
            )}
          </AdminCard>
        </div>
      </div>
    </>
  );
}
