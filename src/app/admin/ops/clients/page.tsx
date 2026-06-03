import { listClients } from '@/lib/ops/clients-service';
import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import ClientsClient from './ClientsClient';

export default async function ClientsPage() {
  const clients = await listClients();
  return (
    <>
      <SectionHeader
        title="Clients"
        subtitle="Directory of clients across 2KO Africa. Add new clients here; deeper Contacts/Subscriptions wiring lands in Phase 2."
      />
      <NotConnectedBanner />
      <ClientsClient initialClients={clients} />
    </>
  );
}
