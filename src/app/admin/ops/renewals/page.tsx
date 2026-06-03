import { listRenewals } from '@/lib/ops/renewals-service';
import { listClients } from '@/lib/ops/clients-service';
import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import RenewalsClient from './RenewalsClient';

export default async function RenewalsPage() {
  const [renewals, clients] = await Promise.all([listRenewals(), listClients()]);
  return (
    <>
      <SectionHeader
        title="Renewals"
        subtitle="Domain, hosting, SSL, subscription, retainer renewals — coloured by window to due."
      />
      <NotConnectedBanner />
      <RenewalsClient
        initialRenewals={renewals}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
