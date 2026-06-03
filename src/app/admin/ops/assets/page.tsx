import { listAssets } from '@/lib/ops/assets-service';
import { listClients } from '@/lib/ops/clients-service';
import { SectionHeader } from '@/components/admin-ui';
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
      <AssetsClient initialAssets={assets} clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
