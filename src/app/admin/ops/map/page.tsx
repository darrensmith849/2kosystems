import { SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildIndex } from '@/lib/ops/ops-knowledge-index';
import MapClient from './MapClient';

export default async function MapPage() {
  const items = await buildIndex();
  const snapshot = isSnapshotMode();
  return (
    <>
      <SectionHeader
        title="Asset map"
        subtitle="How clients, assets, and infrastructure relate."
      />
      {snapshot && <SnapshotBanner area="The asset map" />}
      <MapClient initialItems={items} />
    </>
  );
}
