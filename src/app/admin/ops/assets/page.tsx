import { listAssets } from '@/lib/ops/assets-service';
import { listClients } from '@/lib/ops/clients-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { SNAPSHOT_ASSETS, SNAPSHOT_CLIENTS } from '@/lib/ops/ops-snapshot-data';
import AssetsClient from './AssetsClient';

export default async function AssetsPage() {
  const snapshot = isSnapshotMode();
  const [assets, clients] = snapshot
    ? [SNAPSHOT_ASSETS, SNAPSHOT_CLIENTS]
    : await Promise.all([listAssets(), listClients()]);
  return (
    <>
      <SectionHeader
        title="Assets"
        subtitle="Websites, apps, APIs, and internal tools we manage."
      />
      {snapshot ? (
        <SnapshotBanner area="The asset inventory" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Assets"
            whatYouWillSee={[
              'Asset inventory across all clients',
              'Linked GitHub repos, Vercel projects, Cloudflare zones, Hetzner servers',
              'Domain registrations and renewal windows per asset',
            ]}
          />
        </>
      )}
      <AssetsClient
        initialAssets={assets}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        isSnapshot={snapshot}
      />
    </>
  );
}
