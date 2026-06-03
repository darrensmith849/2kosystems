import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import { listIncidents } from '@/lib/ops/incidents-service';
import { listAssets } from '@/lib/ops/assets-service';
import { listClients } from '@/lib/ops/clients-service';
import NotConnectedBanner from '../NotConnectedBanner';
import IncidentsClient from './IncidentsClient';

export default async function IncidentsPage() {
  const [incidents, assets, clients] = await Promise.all([
    listIncidents(),
    listAssets(),
    listClients(),
  ]);
  return (
    <>
      <SectionHeader
        title="Incidents"
        subtitle="Track uptime / deployment / customer-impacting events. BetterStack auto-ingestion is Phase 2B."
      />
      <NotConnectedBanner />
      <WaitingForDb
        area="Incidents"
        whatYouWillSee={[
          'Uptime, deployment, and customer-impacting events',
          'Severity classification (info / minor / major / critical)',
          'Status timeline per incident with assignee notes',
        ]}
      />
      <IncidentsClient
        initialIncidents={incidents}
        assets={assets.map((a) => ({ id: a.id, name: a.name }))}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
