import { listStoredGithubRepos } from '@/lib/ops/github-service';
import { githubConnectivity } from '@/lib/integrations/github';
import { SectionHeader } from '@/components/admin-ui';
import WaitingForDb from '@/components/admin-ui/WaitingForDb';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import NotConnectedBanner from '../NotConnectedBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { SNAPSHOT_REPOS } from '@/lib/ops/ops-snapshot-data';
import GithubReposClient from './GithubReposClient';

export default async function GithubReposPage() {
  const snapshot = isSnapshotMode();
  const repos = snapshot ? SNAPSHOT_REPOS : await listStoredGithubRepos();
  const conn = githubConnectivity();
  return (
    <>
      <SectionHeader
        title="GitHub repos"
        subtitle="All repositories under our account, grouped by team. Personal and legacy repos are hidden by default."
      />
      {snapshot ? (
        <SnapshotBanner area="The GitHub repo classification" />
      ) : (
        <>
          <NotConnectedBanner />
          <WaitingForDb
            area="GitHub repos"
            whatYouWillSee={[
              'Imported repos classified by division',
              'Personal and legacy/stale repos hidden by default',
              'Last sync timestamp and per-repo activity status',
            ]}
          />
        </>
      )}
      <GithubReposClient repos={repos} integrationStatus={conn} />
    </>
  );
}
