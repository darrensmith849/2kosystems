import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { listIncidents } from '@/lib/ops/incidents-service';
import { listAssets } from '@/lib/ops/assets-service';
import { listClients } from '@/lib/ops/clients-service';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  SNAPSHOT_INCIDENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_CLIENTS,
} from '@/lib/ops/ops-snapshot-data';
import NotConnectedBanner from '../NotConnectedBanner';
import IncidentsClient from './IncidentsClient';

export default async function IncidentsPage() {
  const snapshot = isSnapshotMode();
  const [incidents, assets, clients] = snapshot
    ? [SNAPSHOT_INCIDENTS, SNAPSHOT_ASSETS, SNAPSHOT_CLIENTS]
    : await Promise.all([
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
      {snapshot ? (
        <SnapshotBanner area="Incidents" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Incidents"
            whatYouWillSee={[
              'Uptime, deployment, and customer-impacting events',
              'Severity classification (info / minor / major / critical)',
              'Status timeline per incident with assignee notes',
            ]}
          />
        </>
      )}
      <IncidentsClient
        initialIncidents={incidents}
        assets={assets.map((a) => ({ id: a.id, name: a.name }))}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        isSnapshot={snapshot}
      />
    </>
  );
}
