import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTicket, listComments } from '@/lib/ops/tickets-service';
import { listOperators } from '@/lib/ops/operators';
import { AdminCard, Badge, Row, SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../../NotConnectedBanner';
import { isSnapshotId, getSnapshotTicket } from '@/lib/ops/ops-snapshot-data';
import TicketDetailClient from './TicketDetailClient';

const PRIORITY_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  low: 'neutral', med: 'blue', high: 'amber', urgent: 'rose',
};
const STATUS_TONES: Record<string, 'neutral' | 'green' | 'amber' | 'rose' | 'blue'> = {
  new: 'amber', triage: 'amber', in_progress: 'amber',
  waiting_client: 'blue', blocked: 'rose', review: 'amber',
  completed: 'green', archived: 'neutral',
};

// Why-it-exists context per snapshot ticket — keeps the snapshot detail
// useful without forcing the operator to switch to the Review page.
const SNAPSHOT_CONTEXT: Record<string, { why: string; next: string; needsHuman: boolean; needsDb: boolean; needsToken: string | null }> = {
  'snap-ticket-saps-canonical': {
    why: 'Three SAPS repos exist (saps / sa_private_schools / saprivateschools). Operational risk: a future deploy could pull from the wrong repo and overwrite the live site.',
    next: 'See Review → "SAPS — pick canonical repo (3 candidates)". Recommendation: keep saps; archive the others.',
    needsHuman: true, needsDb: false, needsToken: 'GITHUB_TOKEN',
  },
  'snap-ticket-impart-global-mapping': {
    why: 'impart-global Vercel team holds coupex.net, taxup.app, impartai.co.za with no owner mapping in infra-handover.',
    next: 'See Review → 3 unmapped Vercel decisions. Manual reach-out to Impart Global needed.',
    needsHuman: true, needsDb: false, needsToken: null,
  },
  'snap-ticket-autotax-vs-taxo': {
    why: 'systemd units are taxo-* but repo is autotax. Live domain is autotax.co.za. Mismatch makes deploy logs ambiguous.',
    next: 'See Review → "AutoTax / Taxo — repo vs systemd-name mismatch". Recommendation: keep autotax, rename systemd units.',
    needsHuman: true, needsDb: false, needsToken: 'GITHUB_TOKEN + SSH',
  },
  'snap-ticket-dormant-vercel': {
    why: '~25 dormant Vercel projects in pumpbots-projects clutter the team and may carry small build minutes cost.',
    next: 'See Review → "Delete ~25 dormant Vercel projects". Manual per-project review then vercel projects rm.',
    needsHuman: true, needsDb: false, needsToken: 'VERCEL_API_TOKEN',
  },
  'snap-ticket-hetzner-postgres': {
    why: 'Dashboard runs in snapshot mode until DATABASE_URL is set. Hetzner ops DB lands next week per the project plan.',
    next: 'Restore ~/.ssh/ma130_migration → create ops DB + ops_app user → apply migrations → set DATABASE_URL in Vercel.',
    needsHuman: true, needsDb: false, needsToken: 'SSH key',
  },
};

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isSnap = isSnapshotId(id);

  if (isSnap) {
    const ticket = getSnapshotTicket(id);
    if (!ticket) notFound();
    const ctx = SNAPSHOT_CONTEXT[id];
    return (
      <>
        <SectionHeader
          title={ticket.title}
          subtitle={
            <>
              <Link href="/admin/ops/tickets" className="text-emerald-300 hover:underline">← back to Tickets</Link>
              <span className="ml-2 text-zinc-600 dark:text-[#52525b]">·</span>
              <span className="ml-2 text-zinc-700 dark:text-[#71717a]">{ticket.kind}</span>
            </>
          }
        />
        <SnapshotBanner area="This ticket" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <div className="lg:col-span-2">
            <AdminCard title="Ticket detail">
              <Row label="Title" value={ticket.title} />
              <Row label="Kind" value={<Badge text={ticket.kind} />} />
              <Row label="Status" value={<Badge text={ticket.status} tone={STATUS_TONES[ticket.status] ?? 'neutral'} />} />
              <Row label="Priority" value={<Badge text={ticket.priority} tone={PRIORITY_TONES[ticket.priority] ?? 'neutral'} />} />
              {ticket.client && <Row label="Client" value={<Link href={`/admin/ops/clients/${ticket.clientId}`} className="text-emerald-300 hover:underline">{ticket.client.name}</Link>} />}
              {ticket.asset && <Row label="Asset" value={<Link href={`/admin/ops/assets/${ticket.assetId}`} className="text-emerald-300 hover:underline">{ticket.asset.name}</Link>} />}
              <Row label="Description" value={ticket.description ?? null} />
            </AdminCard>
          </div>
          <div className="space-y-4">
            <AdminCard title="Why this exists">
              <p className="text-xs text-zinc-700 dark:text-[#a1a1aa] leading-relaxed">{ctx?.why ?? 'Snapshot ticket — surfaced from the discovery work.'}</p>
            </AdminCard>
            <AdminCard title="Recommended next step">
              <p className="text-xs text-zinc-800 dark:text-[#e4e4e7] leading-relaxed">{ctx?.next ?? 'Review and assign once the Hetzner DB is connected.'}</p>
            </AdminCard>
            <AdminCard title="Blockers">
              <Row label="Needs human decision" value={ctx?.needsHuman ? <Badge text="yes" tone="amber" /> : <Badge text="no" tone="green" />} />
              <Row label="Needs DB" value={ctx?.needsDb ? <Badge text="yes" tone="amber" /> : <Badge text="no" tone="green" />} />
              <Row label="Needs provider access" value={ctx?.needsToken ? <Badge text={ctx.needsToken} tone="amber" /> : <Badge text="no" tone="green" />} />
            </AdminCard>
          </div>
        </div>
      </>
    );
  }

  const ticket = await getTicket(id);
  if (!ticket) notFound();
  const [comments, operators] = await Promise.all([listComments(id), listOperators()]);
  return (
    <>
      <NotConnectedBanner />
      <TicketDetailClient
        ticket={ticket}
        comments={comments}
        operators={operators.map((o) => ({ id: o.id, slug: o.slug, displayName: o.displayName }))}
      />
    </>
  );
}
