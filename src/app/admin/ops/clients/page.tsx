import { listClients } from '@/lib/ops/clients-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { SNAPSHOT_CLIENTS } from '@/lib/ops/ops-snapshot-data';
import ClientsClient from './ClientsClient';

export default async function ClientsPage() {
  const snapshot = isSnapshotMode();
  const clients = snapshot ? SNAPSHOT_CLIENTS : await listClients();
  return (
    <>
      <SectionHeader
        title="Clients"
        subtitle="Directory of clients across 2KO Africa. Add new clients here; deeper Contacts/Subscriptions wiring lands in Phase 2."
      />
      {snapshot ? (
        <SnapshotBanner area="The clients directory" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Clients"
            whatYouWillSee={[
              'Client directory across all divisions',
              'Contacts attached to each client',
              'Related assets, tickets, and renewals per client',
            ]}
          />
        </>
      )}
      <ClientsClient initialClients={clients} isSnapshot={snapshot} />
    </>
  );
}
