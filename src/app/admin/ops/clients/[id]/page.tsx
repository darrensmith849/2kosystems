import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getClient,
  listContactsForClient,
  listAssetsForClient,
} from '@/lib/ops/clients-service';
import { listTicketsForClient } from '@/lib/ops/tickets-service';
import {
  listRenewalsForClient,
  computeRenewalWindow,
} from '@/lib/ops/renewals-service';
import { listIncidentsForClient } from '@/lib/ops/incidents-service';
import {
  AdminCard,
  Badge,
  DataTable,
  EmptyState,
  Row,
  SectionHeader,
} from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../../NotConnectedBanner';
import {
  isSnapshotId,
  getSnapshotClient,
  listSnapshotAssetsForClient,
  listSnapshotTicketsForClient,
  listSnapshotRenewalsForClient,
  listSnapshotIncidentsForClient,
  getClientConfidence,
} from '@/lib/ops/ops-snapshot-data';
import type { Contact } from '@/lib/db/schema/clients';
import type { Asset } from '@/lib/db/schema/assets';
import type { TicketWithRefs } from '@/lib/ops/tickets-service';
import type { RenewalWithRefs } from '@/lib/ops/renewals-service';
import type { IncidentWithRefs } from '@/lib/ops/incidents-service';

const CLIENT_STATUS_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  active: 'green',
  lead: 'blue',
  paused: 'amber',
  archived: 'neutral',
  former: 'rose',
};

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

const CLOSED_TICKET_STATUSES = new Set(['completed', 'archived']);
const OPEN_INCIDENT_STATUSES = new Set(['open', 'investigating']);

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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isSnap = isSnapshotId(id);

  let client: Awaited<ReturnType<typeof getClient>> | null = null;
  let contacts: Contact[] = [];
  let clientAssets: Asset[] = [];
  let tickets: TicketWithRefs[] = [];
  let renewals: RenewalWithRefs[] = [];
  let incidents: IncidentWithRefs[] = [];

  if (isSnap) {
    const snap = getSnapshotClient(id);
    if (!snap) notFound();
    client = snap;
    clientAssets = listSnapshotAssetsForClient(id) as unknown as Asset[];
    tickets = listSnapshotTicketsForClient(id);
    renewals = listSnapshotRenewalsForClient(id);
    incidents = listSnapshotIncidentsForClient(id);
  } else {
    client = await getClient(id).catch(() => null);
    if (!client) notFound();
    [contacts, clientAssets, tickets, renewals, incidents] = await Promise.all([
      safeList<Contact>(() => listContactsForClient(id)),
      safeList<Asset>(() => listAssetsForClient(id)),
      safeList<TicketWithRefs>(() => listTicketsForClient(id)),
      safeList<RenewalWithRefs>(() => listRenewalsForClient(id)),
      safeList<IncidentWithRefs>(() => listIncidentsForClient(id)),
    ]);
  }
  const confidence = isSnap ? getClientConfidence(id) : null;

  const openTickets = tickets.filter((t) => !CLOSED_TICKET_STATUSES.has(t.status));
  const upcomingRenewals = renewals.filter(
    (r) => computeRenewalWindow(r.nextDueAt) !== 'future',
  );
  const openIncidents = incidents.filter((i) => OPEN_INCIDENT_STATUSES.has(i.status));

  return (
    <>
      <SectionHeader
        title={client.name}
        subtitle={
          <>
            <Link href="/admin/ops/clients" className="text-emerald-300 hover:underline">
              ← back to Clients
            </Link>
            <span className="ml-2 text-zinc-600 dark:text-[#52525b]">·</span>
            <span className="ml-2 text-zinc-700 dark:text-[#71717a]">{client.status}</span>
          </>
        }
      />
      {isSnap ? (
        <SnapshotBanner area="This client detail" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Client detail"
            whatYouWillSee={[
              'Contacts attached to this client',
              'Related assets, tickets, renewals, and incidents',
            ]}
          />
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <AdminCard title="Client detail">
          <Row label="Name" value={client.name} />
          <Row label="Legal name" value={client.legalName ?? null} />
          <Row
            label="Status"
            value={<Badge text={client.status} tone={CLIENT_STATUS_TONES[client.status] ?? 'neutral'} />}
          />
          <Row label="Since" value={client.since ? fmtDate(client.since) : null} />
          <Row label="Division" value={client.division?.name ?? null} />
          {confidence && (
            <Row
              label="Mapping confidence"
              value={
                <Badge
                  text={confidence.replace('_', ' ')}
                  tone={
                    confidence === 'confirmed' ? 'green'
                    : confidence === 'likely' ? 'blue'
                    : confidence === 'needs_review' ? 'amber'
                    : 'neutral'
                  }
                />
              }
            />
          )}
          {client.tags && client.tags.length > 0 && (
            <Row label="Tags" value={<span className="font-mono text-[10px] text-zinc-700 dark:text-[#a1a1aa]">{client.tags.join(', ')}</span>} />
          )}
          <Row label="Notes" value={client.notes ?? null} />
        </AdminCard>

        <AdminCard title={`Contacts · ${contacts.length}`}>
          {contacts.length === 0 ? (
            <EmptyState title="No contacts yet" hint="Contacts capture is Phase 2." />
          ) : (
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-1 rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5]">{c.fullName}</span>
                    {c.role && <Badge text={c.role} />}
                    {c.isPrimary === 'true' && <Badge text="primary" tone="green" />}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-zinc-700 dark:text-[#a1a1aa]">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard title={`Assets · ${clientAssets.length}`}>
          {clientAssets.length === 0 ? (
            <EmptyState title="No assets yet" />
          ) : (
            <DataTable
              rows={clientAssets}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  render: (a) => (
                    <Link
                      href={`/admin/ops/assets/${a.id}`}
                      className="font-medium text-zinc-900 dark:text-[#f5f5f5] hover:text-emerald-300 transition-colors"
                    >
                      {a.name}
                    </Link>
                  ),
                },
                { key: 'type', header: 'Type', render: (a) => <Badge text={a.type} /> },
                {
                  key: 'status',
                  header: 'Status',
                  render: (a) => (
                    <Badge text={a.status} tone={a.status === 'active' ? 'green' : 'neutral'} />
                  ),
                },
              ]}
            />
          )}
        </AdminCard>

        <AdminCard title={`Open tickets · ${openTickets.length}`}>
          {openTickets.length === 0 ? (
            <EmptyState title="No open tickets yet" />
          ) : (
            <DataTable
              rows={openTickets}
              columns={[
                {
                  key: 'title',
                  header: 'Title',
                  render: (t) => (
                    <Link
                      href={`/admin/ops/tickets/${t.id}`}
                      className="font-medium text-zinc-900 dark:text-[#f5f5f5] hover:text-emerald-300 transition-colors"
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

        <AdminCard title={`Renewals (next 90 days) · ${upcomingRenewals.length}`}>
          {upcomingRenewals.length === 0 ? (
            <EmptyState title="No renewals due soon" />
          ) : (
            <DataTable
              rows={upcomingRenewals}
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  render: (r) => (
                    <span className="font-medium text-zinc-900 dark:text-[#f5f5f5]">{r.name}</span>
                  ),
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

        <AdminCard title={`Incidents (open) · ${openIncidents.length}`}>
          {openIncidents.length === 0 ? (
            <EmptyState title="No open incidents" />
          ) : (
            <DataTable
              rows={openIncidents}
              columns={[
                {
                  key: 'summary',
                  header: 'Summary',
                  render: (i) => (
                    <span className="font-medium text-zinc-900 dark:text-[#f5f5f5]">{i.summary}</span>
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
              ]}
            />
          )}
        </AdminCard>
      </div>
    </>
  );
}
