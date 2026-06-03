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
        subtitle="Lexical search across every record in the Ops Dashboard — divisions, clients, assets, repos, projects, servers, tickets, renewals, incidents, findings, decisions, activation steps, runbooks."
      />
      {snapshot && <SnapshotBanner area="Search results" />}
      <SearchClient initialItems={items} />
    </>
  );
}
