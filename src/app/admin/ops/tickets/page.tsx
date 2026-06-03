import { listTickets } from '@/lib/ops/tickets-service';
import { listClients } from '@/lib/ops/clients-service';
import { listAssets } from '@/lib/ops/assets-service';
import { listOperators } from '@/lib/ops/operators';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import NotConnectedBanner from '../NotConnectedBanner';
import TicketsClient from './TicketsClient';

export default async function TicketsPage() {
  const [tickets, clients, assets, operators] = await Promise.all([
    listTickets(),
    listClients(),
    listAssets(),
    listOperators(),
  ]);
  return (
    <>
      <SectionHeader
        title="Tickets"
        subtitle="Support, bugs, change requests, content updates, emergencies, and billing — tracked end-to-end with internal/external comments and time logging."
      />
      <NotConnectedBanner />
      <WaitingForDb
        area="Tickets"
        whatYouWillSee={[
          'Support requests, bug reports, change requests, content updates',
          'Status, priority, and assignee tracking',
          'Internal/external comments and time logging per ticket',
        ]}
      />
      <TicketsClient
        initialTickets={tickets}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        assets={assets.map((a) => ({ id: a.id, name: a.name }))}
        operators={operators.map((o) => ({ id: o.id, slug: o.slug, displayName: o.displayName }))}
      />
    </>
  );
}
