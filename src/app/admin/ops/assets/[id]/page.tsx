import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAsset, listLinksForAsset } from '@/lib/ops/asset-links-service';
import { AdminCard, Row, SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../../NotConnectedBanner';
import AssetLinksClient from './AssetLinksClient';

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();
  const links = await listLinksForAsset(id);

  return (
    <>
      <SectionHeader
        title={asset.name}
        subtitle={
          <span>
            <Link href="/admin/ops/assets" className="text-emerald-300 hover:underline">← Assets</Link>
            <span className="ml-2 text-[#52525b]">·</span>
            <span className="ml-2 text-[#71717a]">{asset.type}</span>
          </span>
        }
      />
      <NotConnectedBanner />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <AdminCard title="Asset detail">
            <Row label="Name" value={asset.name} />
            <Row label="Type" value={asset.type} />
            <Row label="Environment" value={asset.environment} />
            <Row label="Status" value={asset.status} />
            <Row
              label="Live URL"
              value={
                asset.liveUrl ? (
                  <a href={asset.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">
                    {asset.liveUrl}
                  </a>
                ) : null
              }
            />
            <Row label="Staging URL" value={asset.stagingUrl ?? null} />
            <Row label="Notes" value={asset.notes ?? null} />
          </AdminCard>
        </div>
        <AdminCard title="Audit">
          <Row label="Created" value={<span className="font-mono text-[10px]">{asset.createdAt?.toISOString().slice(0, 16) ?? '—'}</span>} />
          <Row label="Updated" value={<span className="font-mono text-[10px]">{asset.updatedAt?.toISOString().slice(0, 16) ?? '—'}</span>} />
          <Row label="Last deployed" value={asset.lastDeployedAt ? <span className="font-mono text-[10px]">{asset.lastDeployedAt.toISOString().slice(0, 16)}</span> : null} />
          <Row label="Last audited" value={asset.lastAuditedAt ? <span className="font-mono text-[10px]">{asset.lastAuditedAt.toISOString().slice(0, 16)}</span> : null} />
        </AdminCard>
      </div>

      <AssetLinksClient assetId={id} initialLinks={links} />
    </>
  );
}
