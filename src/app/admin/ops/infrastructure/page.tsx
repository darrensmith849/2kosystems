import { cloudflareConnectivity } from '@/lib/integrations/cloudflare';
import { hetznerConnectivity } from '@/lib/integrations/hetzner';
import { listStoredCloudflareZones, listStoredCloudflarePagesProjects } from '@/lib/ops/cloudflare-service';
import { listStoredHetznerServers } from '@/lib/ops/hetzner-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import {
  SNAPSHOT_CLOUDFLARE_ZONES,
  SNAPSHOT_CLOUDFLARE_PAGES,
  SNAPSHOT_HETZNER_SERVERS,
} from '@/lib/ops/ops-snapshot-data';
import InfrastructureClient from './InfrastructureClient';

export default async function InfrastructurePage() {
  const snapshot = isSnapshotMode();
  const [cfConn, hzConn, zones, pages, servers] = snapshot
    ? [cloudflareConnectivity(), hetznerConnectivity(), SNAPSHOT_CLOUDFLARE_ZONES, SNAPSHOT_CLOUDFLARE_PAGES, SNAPSHOT_HETZNER_SERVERS]
    : await Promise.all([
        Promise.resolve(cloudflareConnectivity()),
        Promise.resolve(hetznerConnectivity()),
        listStoredCloudflareZones(),
        listStoredCloudflarePagesProjects(),
        listStoredHetznerServers(),
      ]);

  return (
    <>
      <SectionHeader
        title="Infrastructure"
        subtitle="Cloudflare zones, DNS records, and Hetzner servers."
      />
      {snapshot ? (
        <SnapshotBanner area="Infrastructure (DNS, Pages, and servers)" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="Infrastructure"
            whatYouWillSee={[
              'Cloudflare zones and DNS records',
              'Cloudflare Pages projects with deployment metadata',
              'Hetzner servers with location, type, and status',
            ]}
          />
        </>
      )}
      <InfrastructureClient
        cloudflareStatus={cfConn}
        hetznerStatus={hzConn}
        zones={zones}
        pagesProjects={pages}
        hetznerServers={servers}
      />
    </>
  );
}
