import { listRenewals, listDomainOptions } from '@/lib/ops/renewals-service';
import { listClients } from '@/lib/ops/clients-service';
import { listAssets } from '@/lib/ops/assets-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import NotConnectedBanner from '../NotConnectedBanner';
import RenewalsClient from './RenewalsClient';

export default async function RenewalsPage() {
  const [renewals, clients, assets, domains] = await Promise.all([
    listRenewals(),
    listClients(),
    listAssets(),
    listDomainOptions(),
  ]);
  return (
    <>
      <SectionHeader
        title="Renewals"
        subtitle="Domain, hosting, SSL, subscription, retainer renewals — coloured by window to due."
      />
      <NotConnectedBanner />
      <WaitingForDb
        area="Renewals"
        whatYouWillSee={[
          'Domains, hosting, SSL, retainers, and subscription renewals',
          'Reminder windows (60 / 30 / 14 / 7 / due / overdue)',
          'Auto-coloured rows so urgent renewals surface first',
        ]}
      />
      <RenewalsClient
        initialRenewals={renewals}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        assets={assets.map((a) => ({ id: a.id, name: a.name }))}
        domains={domains.map((d) => ({ id: d.id, name: d.name }))}
      />
    </>
  );
}
