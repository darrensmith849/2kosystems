import { listRenewals, listDomainOptions } from '@/lib/ops/renewals-service';
import { listClients } from '@/lib/ops/clients-service';
import { listAssets } from '@/lib/ops/assets-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  SNAPSHOT_RENEWALS,
  SNAPSHOT_CLIENTS,
  SNAPSHOT_ASSETS,
  SNAPSHOT_DOMAINS,
} from '@/lib/ops/ops-snapshot-data';
import RenewalsClient from './RenewalsClient';

export default async function RenewalsPage() {
  const snapshot = isSnapshotMode();
  const [renewals, clients, assets, domains] = snapshot
    ? [SNAPSHOT_RENEWALS, SNAPSHOT_CLIENTS, SNAPSHOT_ASSETS, SNAPSHOT_DOMAINS]
    : await Promise.all([
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
      {snapshot ? (
        <SnapshotBanner area="Renewals" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Renewals"
            whatYouWillSee={[
              'Domains, hosting, SSL, retainers, and subscription renewals',
              'Reminder windows (60 / 30 / 14 / 7 / due / overdue)',
              'Auto-coloured rows so urgent renewals surface first',
            ]}
          />
        </>
      )}
      <RenewalsClient
        initialRenewals={renewals}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        assets={assets.map((a) => ({ id: a.id, name: a.name }))}
        domains={domains.map((d) => ({ id: d.id, name: d.name }))}
        isSnapshot={snapshot}
      />
    </>
  );
}
