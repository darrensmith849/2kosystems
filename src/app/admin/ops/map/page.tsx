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
        subtitle="Relationship explorer across divisions, clients, assets, repos, projects, servers, zones, domains, tickets, renewals, and incidents."
      />
      {snapshot && <SnapshotBanner area="The asset map" />}
      <MapClient initialItems={items} />
    </>
  );
}
