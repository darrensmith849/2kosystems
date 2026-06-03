import 'server-only';
import { connected, notConnected, type IntegrationConnectivity } from './types';

// Read-only Vercel integration. Supports MULTIPLE teams from the start —
// `pumpbots-projects` and `impart-global` are both in active use. Team slugs
// come from the `vercel_teams` table seed, so adding a third team later is
// data-driven, not code.

export type VercelProjectSummary = {
  teamSlug: string;
  projectId: string;
  name: string;
  framework: string | null;
  productionUrl: string | null;
  latestDeploymentStatus: string | null;
  linkedRepo: string | null;
  nodeVersion: string | null;
};

function getToken(): string | null {
  return process.env.VERCEL_API_TOKEN ?? null;
}

export function vercelConnectivity(): IntegrationConnectivity {
  const tok = getToken();
  if (!tok) return notConnected('missing_token', 'Set VERCEL_API_TOKEN (read-only, both teams)');
  return connected();
}

type VercelTeamLookup = { id: string; slug: string };

async function lookupTeams(token: string): Promise<VercelTeamLookup[]> {
  const res = await fetch('https://api.vercel.com/v2/teams', {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Vercel teams API ${res.status}`);
  const data = (await res.json()) as { teams?: { id: string; slug: string }[] };
  return Array.isArray(data.teams) ? data.teams.map((t) => ({ id: t.id, slug: t.slug })) : [];
}

export async function listVercelProjects(teamSlugs: string[]): Promise<VercelProjectSummary[]> {
  const tok = getToken();
  if (!tok) return [];
  const teams = await lookupTeams(tok);
  const teamsBySlug = new Map(teams.map((t) => [t.slug, t]));
  const result: VercelProjectSummary[] = [];

  for (const slug of teamSlugs) {
    const team = teamsBySlug.get(slug);
    if (!team) continue;

    let next: string | null = null;
    let safety = 0;
    do {
      const url = new URL('https://api.vercel.com/v9/projects');
      url.searchParams.set('teamId', team.id);
      url.searchParams.set('limit', '50');
      if (next) url.searchParams.set('until', next);

      const res = await fetch(url, {
        headers: { authorization: `Bearer ${tok}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Vercel projects API ${res.status}`);
      const data = (await res.json()) as {
        projects?: Array<Record<string, unknown>>;
        pagination?: { next?: string | null };
      };
      for (const raw of data.projects ?? []) {
        const latest = raw.latestDeployments as Array<Record<string, unknown>> | undefined;
        const top = latest?.[0];
        const link = raw.link as Record<string, unknown> | undefined;
        const targets = raw.targets as Record<string, unknown> | undefined;
        const prod = targets?.production as Record<string, unknown> | undefined;
        result.push({
          teamSlug: slug,
          projectId: raw.id as string,
          name: raw.name as string,
          framework: (raw.framework as string | null) ?? null,
          productionUrl: (prod?.url as string | undefined) ?? (top?.url as string | undefined) ?? null,
          latestDeploymentStatus: (top?.readyState as string | undefined) ?? null,
          linkedRepo: link
            ? `${link.org ?? link.owner ?? ''}/${link.repo ?? ''}`.replace(/^\/$/, '') || null
            : null,
          nodeVersion: (raw.nodeVersion as string | undefined) ?? null,
        });
      }
      next = (data.pagination?.next as string | null) ?? null;
      safety += 1;
      if (safety > 20) break;
    } while (next);
  }
  return result;
}
