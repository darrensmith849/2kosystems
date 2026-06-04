import { SectionHeader } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { buildIndex } from '@/lib/ops/ops-knowledge-index';
import SearchClient from './SearchClient';

export default async function SearchPage() {
  const items = await buildIndex();
  const snapshot = isSnapshotMode();
  return (
    <>
      <SectionHeader
        title="Search"
        subtitle="Find any record across the dashboard."
      />
      {snapshot && <SnapshotBanner area="Search results" />}
      <SearchClient initialItems={items} />
    </>
  );
}
