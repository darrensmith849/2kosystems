import { listStoredGithubRepos } from '@/lib/ops/github-service';
import { githubConnectivity } from '@/lib/integrations/github';
import { SectionHeader } from '@/components/admin-ui';
import NotConnectedBanner from '../NotConnectedBanner';
import GithubReposClient from './GithubReposClient';

export default async function GithubReposPage() {
  const [repos] = await Promise.all([listStoredGithubRepos()]);
  const conn = githubConnectivity();
  return (
    <>
      <SectionHeader
        title="GitHub repos"
        subtitle="All repos under the authenticated owner, classified by division. Personal/legacy repos are hidden by default — toggle to see them."
      />
      <NotConnectedBanner />
      <GithubReposClient repos={repos} integrationStatus={conn} />
    </>
  );
}
