import { cloudflareConnectivity } from '@/lib/integrations/cloudflare';
import { hetznerConnectivity } from '@/lib/integrations/hetzner';
import { AdminCard, SectionHeader, StatusPill } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';

export default async function InfrastructurePage() {
  const cf = cloudflareConnectivity();
  const hz = hetznerConnectivity();

  return (
    <>
      <SectionHeader
        title="Infrastructure"
        subtitle="Cloudflare and Hetzner read-only mappings. Schemas exist; live sync activates when tokens are configured."
      />
      <NotConnectedBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard
          title="Cloudflare"
          action={<StatusPill status={cf.status === 'connected' ? 'connected' : 'not_connected'} />}
        >
          {cf.status === 'connected' ? (
            <div className="space-y-2">
              <p className="text-xs text-[#a1a1aa]">Token detected. Zone / DNS / Pages sync will populate this section once the sync route is exercised.</p>
              <p className="text-[11px] text-[#71717a]">Inventory: ~40 zones, ~20 Pages brochure sites (per infra-handover).</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-200">{cf.detail}</p>
              <p className="text-[11px] text-[#71717a]">Required scopes: Account Read, Zone Read, DNS Read, Pages Read, Account Analytics Read. Also set CLOUDFLARE_ACCOUNT_ID.</p>
            </div>
          )}
        </AdminCard>

        <AdminCard
          title="Hetzner Cloud"
          action={<StatusPill status={hz.status === 'connected' ? 'connected' : 'not_connected'} />}
        >
          {hz.status === 'connected' ? (
            <div className="space-y-2">
              <p className="text-xs text-[#a1a1aa]">Token detected. Server + metrics sync will populate this section once the sync route is exercised.</p>
              <p className="text-[11px] text-[#71717a]">Inventory: ma130-apps, ma130-data, ma130-tori (fsn1, ~€77.50/mo).</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-200">{hz.detail}</p>
              <p className="text-[11px] text-[#71717a]">Required: read-only Hetzner Cloud token.</p>
            </div>
          )}
        </AdminCard>
      </div>

      <div className="mt-5">
        <AdminCard title="Why placeholders?">
          <p className="text-xs text-[#71717a]">
            Phase 1 ships the schemas, integration clients, sync framework, and UI hooks for Cloudflare and Hetzner.
            The full per-zone / per-server detail views land in Phase 2 once at least one production sync has run with
            real tokens. This keeps the day-1 dashboard usable without forcing token rotation pressure.
          </p>
        </AdminCard>
      </div>
    </>
  );
}
