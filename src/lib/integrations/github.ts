import 'server-only';
import { connected, notConnected, type IntegrationConnectivity } from './types';

// Read-only GitHub integration. Uses a personal access token at runtime.
// Local development can fall back to the gh CLI's auth via the user's keyring
// but the production path is API-only.

export type GithubRepoSummary = {
  owner: string;
  name: string;
  visibility: 'public' | 'private';
  isArchived: boolean;
  isFork: boolean;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  topics: string[];
  pushedAt: string | null;
  htmlUrl: string;
};

function getToken(): string | null {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
}

export function githubConnectivity(): IntegrationConnectivity {
  const tok = getToken();
  if (!tok) return notConnected('missing_token', 'Set GITHUB_TOKEN (read-only PAT with `read:user`, `repo`)');
  return connected();
}

export async function listGithubRepos(owner: string): Promise<GithubRepoSummary[]> {
  const tok = getToken();
  if (!tok) return [];
  const repos: GithubRepoSummary[] = [];
  let page = 1;
  // GitHub paginates 100 max per page.
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(owner)}/repos?per_page=100&page=${page}&type=owner&sort=pushed`,
      {
        headers: {
          authorization: `Bearer ${tok}`,
          accept: 'application/vnd.github+json',
          'x-github-api-version': '2022-11-28',
        },
        cache: 'no-store',
      },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text().catch(() => '')}`.slice(0, 500));
    const page_data: unknown = await res.json();
    if (!Array.isArray(page_data)) break;
    for (const r of page_data) {
      const raw = r as Record<string, unknown>;
      repos.push({
        owner: (raw.owner as Record<string, unknown> | undefined)?.login as string ?? owner,
        name: raw.name as string,
        visibility: raw.private ? 'private' : 'public',
        isArchived: Boolean(raw.archived),
        isFork: Boolean(raw.fork),
        description: (raw.description as string | null) ?? null,
        defaultBranch: (raw.default_branch as string) ?? 'main',
        language: (raw.language as string | null) ?? null,
        topics: Array.isArray(raw.topics) ? (raw.topics as string[]) : [],
        pushedAt: (raw.pushed_at as string | null) ?? null,
        htmlUrl: raw.html_url as string,
      });
    }
    if (page_data.length < 100) break;
    page += 1;
    if (page > 30) break; // hard safety stop
  }
  return repos;
}

// Maps a repo name (and topics if present) to the dashboard's category vocab.
// Conservative — anything we can't confidently classify lands in
// `unknown_unmapped` so the operator sees and resolves it explicitly.

export type RepoCategory =
  | '2ko_africa'
  | '2ko_systems'
  | 'six_sigma'
  | 'sigmaphi_portal'
  | 'sigmaphi_stats'
  | 'shared_internal'
  | 'external_client'
  | 'personal_excluded'
  | 'legacy_stale'
  | 'unknown_unmapped';

const PERSONAL_PATTERNS = [
  /^trades?_/i, /^binance/i, /^pumpbot/i, /^scalper/i, /^swing_bot/i, /^momentum_/i,
  /^modular_/i, /^ross/i, /^dad/i, /^monolyth$/i, /^moneymaker$/i, /^manual_buys$/i,
  /^multi_bot$/i, /^rocket_bot$/i, /^stable$/i, /^live$/i, /^tuesday$/i, /^monday$/i,
  /^tori_trades/i, /^trendlines/i, /^forex$/i, /^trading_bot_live$/i, /^websocket_server$/i,
  /^danielpeter$/i, /^jesusisking$/i, /^mogwai_reversal_strategy$/i, /^anniversaryclaude$/i,
  /^darreniscool$/i, /^allthegloryclaude$/i, /^allthe_glory$/i, /^alltheglory101$/i,
  /^sky_gardens_proposal$/i, /^base_test/i, /^im-kade$/i, /^slabhead/i,
  /^foodlovers$/i, /^edenlang$/i, /^ukama$/i, /^strongtower$/i, /^rileyscarwash$/i,
  /^highendtravel$/i, /^lovelace-moki$/i, /^website_while_you_wait$/i, /^crewter$/i,
  /^impart_agency/i, /^smarthomearchitects/i,
];

const TWOKO_AFRICA = [/^2ko-africa$/i, /^2ko_africa_website$/i];
const TWOKO_SYSTEMS = [/^2kosystems$/i, /^2ko_website$/i, /^infra-handover$/i];
const SIX_SIGMA = [/^sixsigma2026$/i, /^sixsigmasouthafrica$/i];
const SIGMAPHI_PORTAL = [/^laravel-sigmafy$/i];
const SIGMAPHI_STATS = [/^sigmafynew$/i, /^sigmafy-tools$/i, /^ai-sigmafy$/i, /^sigmafyai-py$/i, /^sigmafy/i];
const SHARED_INTERNAL = [/^local-dev-setup$/i, /^staging$/i, /^support$/i];

export function classifyRepo(name: string, topics: string[] = []): RepoCategory {
  // 1) Topic override wins if explicit
  const t = new Set(topics.map((s) => s.toLowerCase()));
  if (t.has('2ko-africa')) return '2ko_africa';
  if (t.has('2ko-systems')) return '2ko_systems';
  if (t.has('six-sigma')) return 'six_sigma';
  if (t.has('sigmaphi-portal')) return 'sigmaphi_portal';
  if (t.has('sigmaphi-stats') || t.has('sigmaphi-statistics')) return 'sigmaphi_stats';
  if (t.has('client')) return 'external_client';
  if (t.has('personal')) return 'personal_excluded';
  if (t.has('legacy')) return 'legacy_stale';

  // 2) Heuristic patterns
  if (TWOKO_AFRICA.some((re) => re.test(name))) return '2ko_africa';
  if (TWOKO_SYSTEMS.some((re) => re.test(name))) return '2ko_systems';
  if (SIX_SIGMA.some((re) => re.test(name))) return 'six_sigma';
  if (SIGMAPHI_PORTAL.some((re) => re.test(name))) return 'sigmaphi_portal';
  if (SIGMAPHI_STATS.some((re) => re.test(name))) return 'sigmaphi_stats';
  if (SHARED_INTERNAL.some((re) => re.test(name))) return 'shared_internal';
  if (PERSONAL_PATTERNS.some((re) => re.test(name))) return 'personal_excluded';

  return 'unknown_unmapped';
}
