import { listTickets } from '@/lib/ops/tickets-service';
import { listClients } from '@/lib/ops/clients-service';
import { listAssets } from '@/lib/ops/assets-service';
import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import TicketsClient from './TicketsClient';

export default async function TicketsPage() {
  const [tickets, clients, assets] = await Promise.all([listTickets(), listClients(), listAssets()]);
  return (
    <>
      <SectionHeader
        title="Tickets"
        subtitle="Support, bugs, change requests, content updates, emergencies, and billing — tracked end-to-end with internal/external comments and time logging."
      />
      <NotConnectedBanner />
      <TicketsClient
        initialTickets={tickets}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        assets={assets.map((a) => ({ id: a.id, name: a.name }))}
      />
    </>
  );
}
