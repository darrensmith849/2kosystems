import { cloudflareConnectivity } from '@/lib/integrations/cloudflare';
import { hetznerConnectivity } from '@/lib/integrations/hetzner';
import { listStoredCloudflareZones, listStoredCloudflarePagesProjects } from '@/lib/ops/cloudflare-service';
import { listStoredHetznerServers } from '@/lib/ops/hetzner-service';
import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import InfrastructureClient from './InfrastructureClient';

export default async function InfrastructurePage() {
  const [cfConn, hzConn, zones, pages, servers] = await Promise.all([
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
        subtitle="Read-only Cloudflare zones, DNS records, Pages projects, and Hetzner servers. Sync upserts by external ID; missing rows are marked vanished, never deleted."
      />
      <NotConnectedBanner />
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
