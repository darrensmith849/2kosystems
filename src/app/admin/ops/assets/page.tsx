import { listAssets } from '@/lib/ops/assets-service';
import { listClients } from '@/lib/ops/clients-service';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import NotConnectedBanner from '../NotConnectedBanner';
import AssetsClient from './AssetsClient';

export default async function AssetsPage() {
  const [assets, clients] = await Promise.all([listAssets(), listClients()]);
  return (
    <>
      <SectionHeader
        title="Assets"
        subtitle="Every managed website / app / SaaS / API / internal tool. Linking to CF, Hetzner, Vercel, repo, domain is Phase 1+ as those tables fill."
      />
      <NotConnectedBanner />
      <WaitingForDb
        area="Assets"
        whatYouWillSee={[
          'Asset inventory across all clients',
          'Linked GitHub repos, Vercel projects, Cloudflare zones, Hetzner servers',
          'Domain registrations and renewal windows per asset',
        ]}
      />
      <AssetsClient initialAssets={assets} clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
