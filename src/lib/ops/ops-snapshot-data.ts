// Read-only operational snapshot from the discovery work and the
// infra-handover repo. This file is intentionally a static, committed,
// human-edited fixture — NEVER treat it as live data.
//
// It activates ONLY when DATABASE_URL is missing. The moment Hetzner
// Postgres is connected, every service prefers DB results and this file
// becomes a reference fixture (still kept for local-dev seeding).
//
// SAFETY: no secrets / no tokens / no passwords. Operational metadata only.

import type { Client } from '@/lib/db/schema/clients';
import type { Division } from '@/lib/db/schema/divisions';
import type { Asset } from '@/lib/db/schema/assets';
import type { GithubRepo, VercelProject, HetznerServer, CloudflareZone, CloudflarePagesProject, Domain } from '@/lib/db/schema/infra';
import type { Ticket, TicketComment } from '@/lib/db/schema/tickets';
import type { Renewal } from '@/lib/db/schema/renewals';
import type { Incident } from '@/lib/db/schema/incidents';
import type { AuditFinding } from '@/lib/db/schema/audits';

import type { TicketWithRefs } from './tickets-service';
import type { RenewalWithRefs } from './renewals-service';
import type { IncidentWithRefs } from './incidents-service';
import type { AssetWithRefs } from './assets-service';
import type { ClientWithDivision } from './clients-service';

const FROZEN = new Date('2025-06-01T00:00:00Z');

// ---------------------------------------------------------------- Divisions

export const SNAPSHOT_DIVISIONS: Division[] = [
  { id: 'snap-div-2ko-africa', code: '2ko_africa', name: '2KO Africa', parentDivisionId: null, description: 'Umbrella holding company', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-div-2ko-systems', code: '2ko_systems', name: '2KO Systems', parentDivisionId: 'snap-div-2ko-africa', description: 'Tech systems for large clients — the dashboard owner', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-div-six-sigma-sa', code: 'six_sigma_sa', name: '6 Sigma South Africa', parentDivisionId: 'snap-div-2ko-africa', description: 'Six Sigma training company', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-div-sigmaphi', code: 'sigmaphi', name: 'SigmaPhi', parentDivisionId: 'snap-div-2ko-africa', description: 'SaaS family — portal + statistics', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-div-sigmaphi-portal', code: 'sigmaphi_portal', name: 'SigmaPhi Portal', parentDivisionId: 'snap-div-sigmaphi', description: 'Delegate training / project / exam SaaS (Laravel)', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-div-sigmaphi-stats', code: 'sigmaphi_statistics', name: 'SigmaPhi Statistics', parentDivisionId: 'snap-div-sigmaphi', description: 'Minitab alternative + Six Sigma tools', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
];

const divBy = (code: string): Division | null => SNAPSHOT_DIVISIONS.find((d) => d.code === code) ?? null;

// ---------------------------------------------------------------- Clients

function mkClient(input: { id: string; name: string; divisionCode?: string; status?: Client['status']; legalName?: string | null; notes?: string | null; tags?: string[] }): ClientWithDivision {
  const division = input.divisionCode ? divBy(input.divisionCode) : null;
  return {
    id: input.id,
    divisionId: division?.id ?? null,
    name: input.name,
    legalName: input.legalName ?? null,
    status: input.status ?? 'active',
    since: null,
    notes: input.notes ?? null,
    tags: input.tags ?? [],
    createdAt: FROZEN,
    updatedAt: FROZEN,
    archivedAt: null,
    division,
  };
}

export const SNAPSHOT_CLIENTS: ClientWithDivision[] = [
  // Internal / 2KO products (treated as clients of "2KO Systems" for the ops view)
  mkClient({ id: 'snap-client-2ko-systems', name: '2KO Systems (internal)', divisionCode: '2ko_systems', tags: ['internal', 'product'], notes: 'The org behind this dashboard. Source of truth lives here.' }),
  mkClient({ id: 'snap-client-2ko-africa', name: '2KO Africa (umbrella)', divisionCode: '2ko_africa', tags: ['internal', 'umbrella'] }),
  mkClient({ id: 'snap-client-six-sigma-sa', name: '6 Sigma South Africa', divisionCode: 'six_sigma_sa', tags: ['internal', 'product'] }),
  mkClient({ id: 'snap-client-sigmaphi', name: 'SigmaPhi (group)', divisionCode: 'sigmaphi', tags: ['internal', 'group'] }),

  // External managed clients
  mkClient({ id: 'snap-client-autotax', name: 'AutoTax', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'autotax.co.za + api.autotax.co.za on Hetzner. Repo cluster: autotax vs taxo — canonical pick needed.' }),
  mkClient({ id: 'snap-client-coastal-security', name: 'Coastal Security Systems', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'coastalsecuritysystems.co.za — currently on Vercel.' }),
  mkClient({ id: 'snap-client-flex-and-flow', name: 'Flex and Flow', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'flexandflow.co.za — Vercel.' }),
  mkClient({ id: 'snap-client-all-the-glory', name: 'All The Glory', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'alltheglory.co.za — Vercel. Repo cluster needs canonical pick (allthegloryclaude / allthe_glory / alltheglory101).' }),
  mkClient({ id: 'snap-client-crewter', name: 'Crewter', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'crewter.com (WordPress on Hetzner).' }),
  mkClient({ id: 'snap-client-impart-agency', name: 'Impart Agency', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'impartagency.co.za on Hetzner + impartagency.us still on Vercel (should redirect) + impartai.co.za on impart-global Vercel team. Three repos: impart_agency / impart_agency_site / impart_agency_website — canonical pick needed.' }),
  mkClient({ id: 'snap-client-sa-private-schools', name: 'SA Private Schools', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'saprivateschools.co.za on Hetzner. Three repo variants: saps / sa_private_schools / saprivateschools — canonical pick needed.' }),
  mkClient({ id: 'snap-client-smart-home-architects', name: 'SmartHomeArchitects', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'smarthomearchitects.co.za WordPress on Hetzner. Repo typo cluster: smarthomearchitects_website vs smarthomearchitects_websaite.' }),
  mkClient({ id: 'snap-client-gay-weddings', name: 'GayWeddings Abroad', divisionCode: '2ko_systems', tags: ['client', 'external'], notes: 'gayweddingsabroad.co.za WordPress on Hetzner.' }),

  // Unmapped / unknown owners (impart-global Vercel team)
  mkClient({ id: 'snap-client-coupex', name: 'coupex.net (unmapped)', divisionCode: '2ko_systems', status: 'lead', tags: ['external', 'unmapped'], notes: 'impart-global Vercel team. Owner mapping pending.' }),
  mkClient({ id: 'snap-client-tax-up', name: 'tax-up / taxup.app (unmapped)', divisionCode: '2ko_systems', status: 'lead', tags: ['external', 'unmapped'], notes: 'impart-global Vercel team. May relate to legacy taxup DB on ma130-data.' }),
];

// ---------------------------------------------------------------- Assets

function mkAsset(input: { id: string; name: string; type: Asset['type']; clientId?: string; divisionCode?: string; liveUrl?: string; status?: Asset['status']; notes?: string; techStack?: string[] }): AssetWithRefs {
  const division = input.divisionCode ? divBy(input.divisionCode) : null;
  const client = input.clientId ? SNAPSHOT_CLIENTS.find((c) => c.id === input.clientId) ?? null : null;
  return {
    id: input.id,
    clientId: input.clientId ?? null,
    divisionId: division?.id ?? null,
    name: input.name,
    type: input.type,
    liveUrl: input.liveUrl ?? null,
    stagingUrl: null,
    techStack: input.techStack ?? [],
    responsibleOperatorId: null,
    environment: 'production',
    status: input.status ?? 'active',
    lastDeployedAt: null,
    lastAuditedAt: null,
    notes: input.notes ?? null,
    createdAt: FROZEN,
    updatedAt: FROZEN,
    archivedAt: null,
    client: client ? ({ ...client, division: undefined } as unknown as Client) : null,
    division,
  };
}

export const SNAPSHOT_ASSETS: AssetWithRefs[] = [
  // Internal 2KO product surfaces
  mkAsset({ id: 'snap-asset-2kosystems-com', name: '2kosystems.com', type: 'website', clientId: 'snap-client-2ko-systems', divisionCode: '2ko_systems', liveUrl: 'https://2kosystems.com', techStack: ['Next.js 16', 'React 19', 'Tailwind v4'], notes: 'The marketing site + Ops Dashboard (/admin/ops) + Agent Ops (/admin/agent). Vercel.' }),
  mkAsset({ id: 'snap-asset-2ko-africa-website', name: '2KO Africa website', type: 'website', clientId: 'snap-client-2ko-africa', divisionCode: '2ko_africa', notes: 'Older / superseded codebase — verify against 2ko_africa_website repo.' }),
  mkAsset({ id: 'snap-asset-six-sigma-sa', name: '6 Sigma South Africa site', type: 'website', clientId: 'snap-client-six-sigma-sa', divisionCode: 'six_sigma_sa', liveUrl: 'https://sixsigmasouthafrica.co.za', notes: 'sixsigma2026 Vercel project — known issue: was supposed to be on Cloudflare Pages.' }),
  mkAsset({ id: 'snap-asset-sigmafy-co', name: 'sigmafy.co (WordPress)', type: 'website', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi', liveUrl: 'https://sigmafy.co', techStack: ['WordPress', 'PHP-FPM 8.3'], notes: 'On ma130-apps.' }),
  mkAsset({ id: 'snap-asset-sigmaphi-portal', name: 'SigmaPhi Portal (Laravel)', type: 'portal', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi_portal', liveUrl: 'https://portal.sigmafy.co', techStack: ['Laravel', 'MariaDB', 'PHP-FPM'], notes: 'portal + dev-portal + staging-portal on ma130-apps. Repo: laravel-sigmafy.' }),
  mkAsset({ id: 'snap-asset-sigmafy-app', name: 'app.sigmafy.co', type: 'saas_app', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi_portal', liveUrl: 'https://app.sigmafy.co', techStack: ['Next.js 15.5'], notes: 'On ma130-apps systemd unit sigmafy-web.service, port 3001.' }),
  mkAsset({ id: 'snap-asset-sigmafy-admin', name: 'admin.sigmafy.co', type: 'saas_app', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi_portal', liveUrl: 'https://admin.sigmafy.co', techStack: ['Next.js 15.5'], notes: 'sigmafy-admin.service, port 3002.' }),
  mkAsset({ id: 'snap-asset-sigmafy-studio', name: 'studio.sigmafy.co', type: 'saas_app', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi_statistics', liveUrl: 'https://studio.sigmafy.co', techStack: ['Next.js 15.5'], notes: 'sigmafy-stats-studio.service, port 3003. The Minitab-alternative surface.' }),
  mkAsset({ id: 'snap-asset-sigmafy-tools', name: 'tools.sigmafy.co', type: 'api', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi_statistics', liveUrl: 'https://tools.sigmafy.co', techStack: ['FastAPI', 'Python 3.12', 'BullMQ'], notes: 'Six Sigma chart tooling. sigmafy-tools.service, port 8003.' }),
  mkAsset({ id: 'snap-asset-ai-sigmafy', name: 'ai.sigmafy.co', type: 'api', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi', liveUrl: 'https://ai.sigmafy.co', techStack: ['FastAPI', 'Python 3.12'], notes: 'Currently dormant. ai-sigmafy.service, port 8001.' }),
  mkAsset({ id: 'snap-asset-ai-python-sigmafy', name: 'ai-python.sigmafy.co', type: 'api', clientId: 'snap-client-sigmaphi', divisionCode: 'sigmaphi', liveUrl: 'https://ai-python.sigmafy.co', techStack: ['FastAPI'], notes: 'ai-python-sigmafy.service, port 8002.' }),
  mkAsset({ id: 'snap-asset-vemia-app', name: 'vemia.app', type: 'saas_app', clientId: 'snap-client-2ko-systems', divisionCode: '2ko_systems', liveUrl: 'https://vemia.app', notes: 'social-media-bot + vemia-frontend Vercel projects. Has its own DB.' }),
  mkAsset({ id: 'snap-asset-infra-handover', name: 'infra-handover (docs)', type: 'internal_tool', clientId: 'snap-client-2ko-systems', divisionCode: '2ko_systems', notes: 'Operator handover Markdown — INVENTORY, RUNBOOKS, EMERGENCIES. The single source of truth for live infra.' }),

  // External client surfaces
  mkAsset({ id: 'snap-asset-autotax-co-za', name: 'autotax.co.za', type: 'website', clientId: 'snap-client-autotax', liveUrl: 'https://autotax.co.za', techStack: ['Next.js'], notes: 'taxo-web.service on ma130-apps, port 3010.' }),
  mkAsset({ id: 'snap-asset-autotax-api', name: 'api.autotax.co.za', type: 'api', clientId: 'snap-client-autotax', liveUrl: 'https://api.autotax.co.za', techStack: ['NestJS', 'BullMQ'], notes: 'taxo-api.service, port 3011.' }),
  mkAsset({ id: 'snap-asset-coastal-security', name: 'coastalsecuritysystems.co.za', type: 'website', clientId: 'snap-client-coastal-security', liveUrl: 'https://coastalsecuritysystems.co.za', notes: 'Vercel — coastal-security-2-0 project.' }),
  mkAsset({ id: 'snap-asset-flex-and-flow', name: 'flexandflow.co.za', type: 'website', clientId: 'snap-client-flex-and-flow', liveUrl: 'https://flexandflow.co.za', notes: 'Vercel — flexandflow project.' }),
  mkAsset({ id: 'snap-asset-all-the-glory', name: 'alltheglory.co.za', type: 'website', clientId: 'snap-client-all-the-glory', liveUrl: 'https://alltheglory.co.za', notes: 'Vercel — allthegloryclaude project.' }),
  mkAsset({ id: 'snap-asset-crewter-com', name: 'crewter.com', type: 'website', clientId: 'snap-client-crewter', liveUrl: 'https://crewter.com', techStack: ['WordPress'], notes: 'PHP-FPM pool crewter on ma130-apps.' }),
  mkAsset({ id: 'snap-asset-impart-coza', name: 'impartagency.co.za', type: 'website', clientId: 'snap-client-impart-agency', liveUrl: 'https://impartagency.co.za', techStack: ['Next.js'], notes: 'On ma130-apps, port 3030.' }),
  mkAsset({ id: 'snap-asset-impart-us', name: 'impartagency.us (redirect pending)', type: 'website', clientId: 'snap-client-impart-agency', liveUrl: 'https://impartagency.us', status: 'sunset', notes: 'Vercel impart_agency_site — should redirect to impartagency.co.za.' }),
  mkAsset({ id: 'snap-asset-impart-ai', name: 'impartai.co.za', type: 'website', clientId: 'snap-client-impart-agency', liveUrl: 'https://impartai.co.za', notes: 'impart-global Vercel team — not in infra-handover.' }),
  mkAsset({ id: 'snap-asset-saps', name: 'saprivateschools.co.za', type: 'saas_app', clientId: 'snap-client-sa-private-schools', liveUrl: 'https://saprivateschools.co.za', techStack: ['Next.js 16.2', 'Drizzle', 'Paystack', '@sentry', '@vercel/blob'], notes: 'saps.service on ma130-apps, port 3020. Migrated from Vercel + Neon to Hetzner.' }),
  mkAsset({ id: 'snap-asset-smart-home', name: 'smarthomearchitects.co.za', type: 'website', clientId: 'snap-client-smart-home-architects', liveUrl: 'https://smarthomearchitects.co.za', techStack: ['WordPress'], notes: 'pool smarthome on ma130-apps.' }),
  mkAsset({ id: 'snap-asset-gayweddings', name: 'gayweddingsabroad.co.za', type: 'website', clientId: 'snap-client-gay-weddings', liveUrl: 'https://gayweddingsabroad.co.za', techStack: ['WordPress'], notes: 'pool gayweddings on ma130-apps.' }),

  // Unmapped impart-global properties
  mkAsset({ id: 'snap-asset-coupex-net', name: 'coupex.net', type: 'website', clientId: 'snap-client-coupex', liveUrl: 'https://coupex.net', notes: 'impart-global Vercel — owner mapping pending.' }),
  mkAsset({ id: 'snap-asset-taxup-app', name: 'taxup.app', type: 'website', clientId: 'snap-client-tax-up', liveUrl: 'https://taxup.app', notes: 'impart-global Vercel — owner mapping pending. May relate to legacy taxup DB.' }),
];

// ---------------------------------------------------------------- GitHub repos

function mkRepo(input: { name: string; category: GithubRepo['category']; visibility?: 'public' | 'private'; description?: string; language?: string; isArchived?: boolean; notes?: string }): GithubRepo {
  return {
    id: `snap-repo-${input.name}`,
    owner: 'darrensmith849',
    name: input.name,
    visibility: input.visibility ?? 'private',
    defaultBranch: 'main',
    description: input.description ?? null,
    language: input.language ?? null,
    topics: [],
    pushedAt: FROZEN,
    isArchived: input.isArchived ?? false,
    isFork: false,
    category: input.category,
    divisionId: null,
    clientId: null,
    notes: input.notes ?? null,
    lastSyncedAt: null,
    createdAt: FROZEN,
    updatedAt: FROZEN,
  };
}

export const SNAPSHOT_REPOS: GithubRepo[] = [
  // 2KO Africa umbrella
  mkRepo({ name: '2ko-africa', category: '2ko_africa', description: '2KO Africa umbrella content' }),
  mkRepo({ name: '2ko_africa_website', category: '2ko_africa', description: 'Older 2KO Africa marketing site' }),

  // 2KO Systems
  mkRepo({ name: '2kosystems', category: '2ko_systems', visibility: 'public', description: 'Dashboard host repo — /admin/ops + /admin/agent + marketing', language: 'TypeScript' }),
  mkRepo({ name: '2ko_website', category: '2ko_systems', visibility: 'public', description: 'Older 2KO site — dormant Vercel project, deletable' }),
  mkRepo({ name: 'infra-handover', category: '2ko_systems', description: 'Operator handover docs — Hetzner + Cloudflare + Vercel inventory' }),

  // 6 Sigma SA
  mkRepo({ name: 'sixsigma2026', category: 'six_sigma', visibility: 'public', description: 'Current 6 Sigma SA codebase — sixsigmasouthafrica.co.za (on Vercel, intended for CF Pages)' }),
  mkRepo({ name: 'sixsigmasouthafrica', category: 'six_sigma', visibility: 'public', description: 'Older 6 Sigma SA codebase' }),

  // SigmaPhi Portal
  mkRepo({ name: 'laravel-sigmafy', category: 'sigmaphi_portal', description: 'SigmaPhi Portal — Laravel + MariaDB on ma130-apps', language: 'PHP' }),

  // SigmaPhi Statistics / SigmaPhi
  mkRepo({ name: 'sigmafynew', category: 'sigmaphi_stats', visibility: 'public', description: 'app/admin/studio.sigmafy.co — Next.js trio', language: 'TypeScript' }),
  mkRepo({ name: 'sigmafy-tools', category: 'sigmaphi_stats', visibility: 'public', description: 'Six Sigma chart tooling (FastAPI)', language: 'Python' }),
  mkRepo({ name: 'sigmafyai-py', category: 'sigmaphi_stats', description: 'ai-python.sigmafy.co (FastAPI)', language: 'Python' }),
  mkRepo({ name: 'ai-sigmafy', category: 'sigmaphi_stats', description: 'ai.sigmafy.co (FastAPI) — currently dormant', language: 'Python' }),

  // External clients
  mkRepo({ name: 'autotax', category: 'external_client', description: 'AutoTax — Next.js. Cluster with `taxo` — canonical pick needed.', language: 'TypeScript' }),
  mkRepo({ name: 'taxo', category: 'external_client', description: 'AutoTax variant — cluster with `autotax`', language: 'TypeScript' }),
  mkRepo({ name: 'coastal_security_2.0', category: 'external_client', description: 'Coastal Security — Vercel', language: 'TypeScript' }),
  mkRepo({ name: 'coastal_security_systems', category: 'external_client', description: 'Older Coastal Security variant' }),
  mkRepo({ name: 'FlexandFlow', category: 'external_client', visibility: 'public', description: 'Flex and Flow — Vercel', language: 'TypeScript' }),
  mkRepo({ name: 'allthegloryclaude', category: 'external_client', visibility: 'public', description: 'All The Glory — Vercel. Cluster with allthe_glory + alltheglory101.', language: 'TypeScript' }),
  mkRepo({ name: 'allthe_glory', category: 'external_client', visibility: 'public', description: 'All The Glory variant' }),
  mkRepo({ name: 'alltheglory101', category: 'external_client', visibility: 'public', description: 'All The Glory variant' }),
  mkRepo({ name: 'crewter', category: 'external_client', description: 'Crewter — WordPress on Hetzner', language: 'PHP' }),
  mkRepo({ name: 'impart_agency', category: 'external_client', description: 'Impart Agency (canonical?) — cluster with impart_agency_site + impart_agency_website', language: 'TypeScript' }),
  mkRepo({ name: 'impart_agency_site', category: 'external_client', description: 'Impart Agency variant — Vercel impartagency.us', language: 'TypeScript' }),
  mkRepo({ name: 'impart_agency_website', category: 'external_client', description: 'Impart Agency variant' }),
  mkRepo({ name: 'saps', category: 'external_client', description: 'SA Private Schools (canonical?) — cluster with sa_private_schools + saprivateschools', language: 'TypeScript' }),
  mkRepo({ name: 'sa_private_schools', category: 'external_client', visibility: 'public', description: 'SAPS variant' }),
  mkRepo({ name: 'saprivateschools', category: 'external_client', visibility: 'public', description: 'SAPS variant' }),
  mkRepo({ name: 'smarthomearchitects_website', category: 'external_client', description: 'SmartHomeArchitects WP — Hetzner. Typo cluster with smarthomearchitects_websaite.' }),
  mkRepo({ name: 'smarthomearchitects_websaite', category: 'external_client', description: 'Typo variant — archive after canonical pick' }),

  // Personal / excluded
  mkRepo({ name: 'tori_trades_trading_bot', category: 'personal_excluded', description: 'trendlines.app — personal trading bot on ma130-tori' }),
  mkRepo({ name: 'mogwai_reversal_strategy', category: 'personal_excluded' }),
  mkRepo({ name: 'momentum_scalper', category: 'personal_excluded' }),
  mkRepo({ name: 'pumpbot', category: 'personal_excluded' }),

  // Unmapped / unknown
  mkRepo({ name: 'staging', category: 'unknown_unmapped', description: 'Generic name — purpose unclear' }),
  mkRepo({ name: 'support', category: 'unknown_unmapped', description: 'Generic name — purpose unclear' }),
  mkRepo({ name: 'foodlovers', category: 'unknown_unmapped' }),
  mkRepo({ name: 'edenlang', category: 'unknown_unmapped' }),
  mkRepo({ name: 'ukama', category: 'unknown_unmapped' }),

  // Shared internal
  mkRepo({ name: 'local-dev-setup', category: 'shared_internal', visibility: 'public', description: 'Reusable Postgres-in-Docker local dev env' }),
];

// ---------------------------------------------------------------- Vercel

function mkVercel(input: { team: 'pumpbots-projects' | 'impart-global'; name: string; productionUrl?: string | null; state?: VercelProject['state']; linkedRepo?: string; framework?: string; nodeVersion?: string; notes?: string }): VercelProject {
  return {
    id: `snap-vercel-${input.team}-${input.name}`,
    teamId: null,
    teamSlug: input.team,
    vercelProjectId: null,
    name: input.name,
    framework: input.framework ?? 'nextjs',
    productionUrl: input.productionUrl ?? null,
    latestDeploymentStatus: 'READY',
    linkedRepo: input.linkedRepo ?? null,
    nodeVersion: input.nodeVersion ?? '24.x',
    state: input.state ?? 'live',
    notes: input.notes ?? null,
    lastSyncedAt: null,
    createdAt: FROZEN,
    updatedAt: FROZEN,
  };
}

export const SNAPSHOT_VERCEL_PROJECTS: VercelProject[] = [
  // pumpbots-projects — live with custom domains
  mkVercel({ team: 'pumpbots-projects', name: '2kosystems', productionUrl: 'www.2kosystems.com', linkedRepo: 'darrensmith849/2kosystems', state: 'live' }),
  mkVercel({ team: 'pumpbots-projects', name: 'sixsigma2026', productionUrl: 'sixsigmasouthafrica.co.za', linkedRepo: 'darrensmith849/sixsigma2026', state: 'live', notes: 'Known issue: intended for CF Pages' }),
  mkVercel({ team: 'pumpbots-projects', name: 'coastal-security-2-0', productionUrl: 'www.coastalsecuritysystems.co.za', linkedRepo: 'darrensmith849/coastal_security_2.0', state: 'live' }),
  mkVercel({ team: 'pumpbots-projects', name: 'flexandflow', productionUrl: 'www.flexandflow.co.za', linkedRepo: 'darrensmith849/FlexandFlow', state: 'live' }),
  mkVercel({ team: 'pumpbots-projects', name: 'allthegloryclaude', productionUrl: 'www.alltheglory.co.za', linkedRepo: 'darrensmith849/allthegloryclaude', state: 'live' }),
  mkVercel({ team: 'pumpbots-projects', name: 'social-media-bot', productionUrl: 'www.vemia.app', state: 'live' }),
  mkVercel({ team: 'pumpbots-projects', name: 'vemia-frontend', productionUrl: 'vemia.app', state: 'live' }),
  mkVercel({ team: 'pumpbots-projects', name: 'impart_agency_site', productionUrl: 'impartagency.us', state: 'live', notes: 'Should redirect to impartagency.co.za' }),

  // Migrated to Hetzner — deletable
  mkVercel({ team: 'pumpbots-projects', name: 'sa_private_schools', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'taxo', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'sigmafy-web', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'sigmafy-admin', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'sigmafynew', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'sigmafy-tools', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'tori_trades_trading_bot', state: 'migrated_to_hetzner' }),
  mkVercel({ team: 'pumpbots-projects', name: 'crewter', state: 'migrated_to_hetzner' }),

  // Dormant samples
  mkVercel({ team: 'pumpbots-projects', name: 'ukama', state: 'dormant' }),
  mkVercel({ team: 'pumpbots-projects', name: 'pumpbot', state: 'dormant' }),
  mkVercel({ team: 'pumpbots-projects', name: 'lovelace-moki', state: 'dormant' }),
  mkVercel({ team: 'pumpbots-projects', name: 'strongtower', state: 'dormant' }),
  mkVercel({ team: 'pumpbots-projects', name: 'website-while-you-wait', state: 'dormant' }),

  // impart-global — unmapped properties
  mkVercel({ team: 'impart-global', name: 'coupex', productionUrl: 'www.coupex.net', state: 'live', notes: 'Owner mapping pending' }),
  mkVercel({ team: 'impart-global', name: 'tax-up', productionUrl: 'taxup.app', state: 'live', notes: 'May relate to legacy taxup DB on ma130-data' }),
  mkVercel({ team: 'impart-global', name: 'impart-agency-site', productionUrl: 'www.impartai.co.za', state: 'live', notes: 'Third Impart Agency property — scope pending' }),
];

// ---------------------------------------------------------------- Hetzner servers

function mkHz(input: { hzServerId: number; name: string; serverType: string; location: string; publicIpv4: string; labels?: Record<string, string>; notes?: string }): HetznerServer {
  return {
    id: `snap-hz-${input.name}`,
    hzServerId: input.hzServerId,
    name: input.name,
    status: 'running',
    serverType: input.serverType,
    location: input.location,
    publicIpv4: input.publicIpv4,
    publicIpv6: null,
    privateIps: ['10.0.0.x'],
    labels: input.labels ?? {},
    createdAtCloud: FROZEN,
    state: 'seen',
    lastSyncedAt: null,
    lastSeenAt: null,
    createdAt: FROZEN,
    updatedAt: FROZEN,
  };
}

export const SNAPSHOT_HETZNER_SERVERS: HetznerServer[] = [
  mkHz({ hzServerId: 1, name: 'ma130-apps', serverType: 'CCX23', location: 'fsn1', publicIpv4: '167.233.55.201', labels: { role: 'web', tier: 'apps' } }),
  mkHz({ hzServerId: 2, name: 'ma130-data', serverType: 'CCX23', location: 'fsn1', publicIpv4: '167.233.50.49', labels: { role: 'data', tier: 'database' } }),
  mkHz({ hzServerId: 3, name: 'ma130-tori', serverType: 'CX23', location: 'fsn1', publicIpv4: '167.233.63.166', labels: { role: 'trading-bot', isolated: 'true' } }),
];

// ---------------------------------------------------------------- Cloudflare placeholders

export const SNAPSHOT_CLOUDFLARE_ZONES: CloudflareZone[] = [
  // Illustrative subset — full list activates with CLOUDFLARE_API_TOKEN.
  { id: 'snap-cfz-sigmafy', cfZoneId: 'snap-cf-sigmafy', name: 'sigmafy.co', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-2kosystems', cfZoneId: 'snap-cf-2kosystems', name: '2kosystems.com', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-2ko-coza', cfZoneId: 'snap-cf-2ko-coza', name: '2ko.co.za', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-saps', cfZoneId: 'snap-cf-saps', name: 'saprivateschools.co.za', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-autotax', cfZoneId: 'snap-cf-autotax', name: 'autotax.co.za', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-crewter', cfZoneId: 'snap-cf-crewter', name: 'crewter.com', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-impart', cfZoneId: 'snap-cf-impart', name: 'impartagency.co.za', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfz-coastal', cfZoneId: 'snap-cf-coastal', name: 'coastalsecuritysystems.co.za', status: 'active', plan: 'Free', nameServers: [], domainId: null, state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
];

export const SNAPSHOT_CLOUDFLARE_PAGES: CloudflarePagesProject[] = [
  { id: 'snap-cfp-schoolsnearme', cfProjectId: 'snap-cfp-1', name: 'schoolsnearme', subdomain: 'schoolsnearme', productionBranch: 'main', latestDeploymentStatus: 'success', customDomains: ['schoolsnearme.co.za'], state: 'seen', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
  { id: 'snap-cfp-leansixsigma', cfProjectId: 'snap-cfp-2', name: 'leansixsigmaafrica', subdomain: 'leansixsigmaafrica', productionBranch: 'main', latestDeploymentStatus: 'success', customDomains: [], state: 'vanished', lastSyncedAt: null, lastSeenAt: null, createdAt: FROZEN, updatedAt: FROZEN },
];

// ---------------------------------------------------------------- Domains

export const SNAPSHOT_DOMAINS: Domain[] = [
  { id: 'snap-dom-sigmafy', name: 'sigmafy.co', registrar: 'xneelo', expiresAt: null, autoRenew: null, dnssec: null, clientId: null, divisionId: null, cloudflareZoneId: 'snap-cf-sigmafy', notes: 'Hosts entire SigmaPhi ecosystem', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-dom-2kosystems', name: '2kosystems.com', registrar: 'xneelo', expiresAt: null, autoRenew: null, dnssec: null, clientId: null, divisionId: null, cloudflareZoneId: 'snap-cf-2kosystems', notes: 'Marketing + Ops Dashboard', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-dom-saps', name: 'saprivateschools.co.za', registrar: 'xneelo', expiresAt: null, autoRenew: null, dnssec: null, clientId: null, divisionId: null, cloudflareZoneId: 'snap-cf-saps', notes: 'On Hetzner', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
  { id: 'snap-dom-trendlines', name: 'trendlines.app', registrar: 'GoDaddy', expiresAt: null, autoRenew: null, dnssec: null, clientId: null, divisionId: null, cloudflareZoneId: null, notes: 'Personal trading bot', createdAt: FROZEN, updatedAt: FROZEN, archivedAt: null },
];

// ---------------------------------------------------------------- Findings (10 from discovery)

function mkFinding(input: { kind: AuditFinding['kind']; severity: AuditFinding['severity']; title: string; detail: string; entityRef?: string; entityType?: string }): AuditFinding {
  return {
    id: `snap-finding-${input.entityRef ?? input.title.slice(0, 24)}`,
    kind: input.kind,
    severity: input.severity,
    entityType: input.entityType ?? null,
    entityRef: input.entityRef ?? null,
    title: input.title,
    detail: input.detail,
    status: 'open',
    source: 'seed',
    resolvedAt: null,
    resolvedByOperatorId: null,
    metadata: {},
    createdAt: FROZEN,
    updatedAt: FROZEN,
  };
}

export const SNAPSHOT_FINDINGS: AuditFinding[] = [
  mkFinding({ kind: 'dns', severity: 'med', entityType: 'domain', entityRef: 'sixsigmasouthafrica.co.za', title: 'sixsigmasouthafrica.co.za still on Vercel (intended Cloudflare Pages)', detail: 'DNS for sixsigmasouthafrica.co.za points at Vercel. Per the MA130 migration plan, this site was supposed to move to Cloudflare Pages. Action: confirm intended target and migrate.' }),
  mkFinding({ kind: 'dns', severity: 'low', entityType: 'domain', entityRef: 'impartagency.us', title: 'impartagency.us still on Vercel — should redirect to .co.za', detail: 'impartagency.us is supposed to redirect to impartagency.co.za (Hetzner). Action: configure the redirect and verify.' }),
  mkFinding({ kind: 'dns', severity: 'low', entityType: 'domain', entityRef: 'dev.saprivateschools.co.za', title: 'dev.saprivateschools.co.za A record points to dead MA130 IP (78.46.220.231)', detail: 'Not blocking but should be cleaned up. Action: delete or repoint to the current dev host.' }),
  mkFinding({ kind: 'dns', severity: 'med', entityType: 'xneelo_zones', entityRef: 'stranded_4', title: '4 xneelo zones stranded — pending NS update', detail: 'plasticsurgerycapetown, schoolsnearme.au, leansixsigmaafrica, iammeskincare. Sites currently down. Action: complete NS migration or formally retire.' }),
  mkFinding({ kind: 'backup', severity: 'high', entityType: 'postgres', entityRef: 'ma130-data', title: 'No automated off-site backups for ma130-data Postgres', detail: 'Postgres dumps happen only during manual operations. Recommended: nightly cron to Hetzner Storage Box with GPG encryption.' }),
  mkFinding({ kind: 'vercel', severity: 'low', entityType: 'vercel_team', entityRef: 'pumpbots-projects', title: '~25 dormant Vercel projects in pumpbots-projects', detail: 'Cost waste + clutter. Action: delete one by one after confirming each is truly unused.' }),
  mkFinding({ kind: 'cloudflare', severity: 'low', entityType: 'db', entityRef: 'taxup', title: 'taxup legacy Postgres DB on ma130-data has not been audited', detail: 'May relate to the taxup.app site in the impart-global Vercel team. Action: confirm whether taxup DB is still in use.' }),
  mkFinding({ kind: 'repo_health', severity: 'low', entityType: 'github', entityRef: 'duplicates', title: 'Duplicate repo clusters: SAPS, Impart, All-The-Glory, SmartHome, AutoTax/Taxo', detail: 'Five clusters with multiple repos for the same site. Pick canonical per cluster and archive the others.' }),
  mkFinding({ kind: 'vercel', severity: 'med', entityType: 'vercel_team', entityRef: 'impart-global', title: 'impart-global Vercel team holds coupex.net, taxup.app, impartai.co.za — not in handover docs', detail: 'Owner/client mapping needed for the three live properties in the impart-global team.' }),
  mkFinding({ kind: 'hetzner', severity: 'med', entityType: 'server', entityRef: 'ma130-apps', title: 'ma130-apps disk fill risk — was 100% on 2026-06-03', detail: 'After SAPS migration the disk hit 144/150 GB. Mitigated by removing final-sweep tarballs (down to 65 GB). Add a daily disk-usage check.' }),
];

// ---------------------------------------------------------------- Tickets

function mkTicket(input: { id: string; title: string; kind: Ticket['kind']; status?: Ticket['status']; priority?: Ticket['priority']; clientId?: string; assetId?: string; description?: string }): TicketWithRefs {
  const client = input.clientId ? SNAPSHOT_CLIENTS.find((c) => c.id === input.clientId) ?? null : null;
  const asset = input.assetId ? SNAPSHOT_ASSETS.find((a) => a.id === input.assetId) ?? null : null;
  return {
    id: input.id,
    clientId: input.clientId ?? null,
    assetId: input.assetId ?? null,
    kind: input.kind,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? 'triage',
    priority: input.priority ?? 'med',
    assigneeOperatorId: null,
    submittedByContactId: null,
    dueAt: null,
    timeLoggedMinutes: 0,
    billingStatus: 'included',
    emailRefs: [],
    tags: ['snapshot'],
    createdAt: FROZEN,
    updatedAt: FROZEN,
    archivedAt: null,
    client: client ? ({ ...client, division: undefined } as unknown as Client) : null,
    asset: asset ? ({ ...asset, client: undefined, division: undefined } as unknown as Asset) : null,
  };
}

export const SNAPSHOT_TICKETS: TicketWithRefs[] = [
  mkTicket({ id: 'snap-ticket-saps-canonical', title: 'Pick canonical SAPS repo (saps / sa_private_schools / saprivateschools)', kind: 'change_request', priority: 'high', clientId: 'snap-client-sa-private-schools', description: 'Three repos exist. Pick one canonical, archive the others. Update infra-handover.' }),
  mkTicket({ id: 'snap-ticket-impart-global-mapping', title: 'Map impart-global Vercel projects to owning clients', kind: 'change_request', priority: 'high', clientId: 'snap-client-impart-agency', description: 'coupex.net + taxup.app + impartai.co.za sit in impart-global Vercel team without owner mapping.' }),
  mkTicket({ id: 'snap-ticket-autotax-vs-taxo', title: 'Confirm AutoTax vs Taxo canonical repo', kind: 'change_request', priority: 'med', clientId: 'snap-client-autotax', description: 'systemd unit is taxo-* but repo is autotax. Align names and pick canonical.' }),
  mkTicket({ id: 'snap-ticket-dormant-vercel', title: 'Review the ~25 dormant Vercel projects in pumpbots-projects', kind: 'change_request', priority: 'low', description: 'Cost waste + clutter — confirm each is unused, then delete one by one.' }),
  mkTicket({ id: 'snap-ticket-hetzner-postgres', title: 'Connect Hetzner Postgres to Ops Dashboard', kind: 'change_request', priority: 'urgent', clientId: 'snap-client-2ko-systems', description: 'Restore ~/.ssh/ma130_migration; create ops DB + ops_app user; apply 0000/0001/0002 migrations; set DATABASE_URL in Vercel.' }),
];

// ---------------------------------------------------------------- Renewals

function mkRenewal(input: { id: string; name: string; kind: Renewal['kind']; dueOffsetDays: number; amount?: string; currency?: string; clientId?: string; notes?: string }): RenewalWithRefs {
  const client = input.clientId ? SNAPSHOT_CLIENTS.find((c) => c.id === input.clientId) ?? null : null;
  const nextDueAt = new Date('2025-06-01T00:00:00Z');
  nextDueAt.setDate(nextDueAt.getDate() + input.dueOffsetDays);
  return {
    id: input.id,
    name: input.name,
    kind: input.kind,
    subjectType: null,
    subjectId: null,
    clientId: input.clientId ?? null,
    amount: input.amount ?? null,
    currency: input.currency ?? 'ZAR',
    period: 'annual',
    nextDueAt,
    autoRenew: null,
    responsibleOperatorId: null,
    lastRemindedAt: null,
    reminderState: 'none',
    externalLink: null,
    notes: input.notes ?? null,
    emailRefs: [],
    createdAt: FROZEN,
    updatedAt: FROZEN,
    archivedAt: null,
    client: client ? ({ ...client, division: undefined } as unknown as Client) : null,
  };
}

export const SNAPSHOT_RENEWALS: RenewalWithRefs[] = [
  mkRenewal({ id: 'snap-renew-sigmafy-domain', name: 'Domain: sigmafy.co', kind: 'domain', dueOffsetDays: 45, amount: '199.00', notes: 'Confirm renewal date at xneelo' }),
  mkRenewal({ id: 'snap-renew-2kosystems-domain', name: 'Domain: 2kosystems.com', kind: 'domain', dueOffsetDays: 120, amount: '250.00', notes: 'Confirm renewal date at xneelo' }),
  mkRenewal({ id: 'snap-renew-hetzner-monthly', name: 'Hetzner Cloud — 3 servers (CCX23×2 + CX23)', kind: 'hosting', dueOffsetDays: 7, amount: '77.50', currency: 'EUR', notes: 'Monthly recurring — ma130-apps + ma130-data + ma130-tori' }),
  mkRenewal({ id: 'snap-renew-vercel-pro', name: 'Vercel Pro — pumpbots-projects team', kind: 'saas', dueOffsetDays: 21, amount: '20.00', currency: 'USD', notes: 'To be cancelled after full Hetzner migration' }),
  mkRenewal({ id: 'snap-renew-xneelo-email', name: 'xneelo email hosting (sapricsgbu account)', kind: 'hosting', dueOffsetDays: 60, amount: '150.00', notes: '32 production mailboxes — DO NOT cancel' }),
];

// ---------------------------------------------------------------- Incidents

function mkIncident(input: { id: string; summary: string; severity: Incident['severity']; status?: Incident['status']; assetId?: string; clientId?: string; rootCause?: string; followupRequired?: boolean; daysAgo?: number; resolvedDaysAgo?: number }): IncidentWithRefs {
  const client = input.clientId ? SNAPSHOT_CLIENTS.find((c) => c.id === input.clientId) ?? null : null;
  const asset = input.assetId ? SNAPSHOT_ASSETS.find((a) => a.id === input.assetId) ?? null : null;
  const baseline = new Date('2025-06-01T00:00:00Z');
  const startedAt = new Date(baseline);
  startedAt.setDate(startedAt.getDate() - (input.daysAgo ?? 0));
  const resolvedAt = input.resolvedDaysAgo !== undefined ? (() => { const d = new Date(baseline); d.setDate(d.getDate() - input.resolvedDaysAgo!); return d; })() : null;
  return {
    id: input.id,
    assetId: input.assetId ?? null,
    clientId: input.clientId ?? null,
    startedAt,
    endedAt: resolvedAt,
    severity: input.severity,
    source: 'manual',
    externalId: null,
    summary: input.summary,
    rootCause: input.rootCause ?? null,
    clientNotifiedAt: null,
    resolvedAt,
    followupRequired: input.followupRequired ?? false,
    status: input.status ?? 'open',
    tags: ['snapshot'],
    createdAt: FROZEN,
    updatedAt: FROZEN,
    asset: asset ? ({ ...asset, client: undefined, division: undefined } as unknown as Asset) : null,
    client: client ? ({ ...client, division: undefined } as unknown as Client) : null,
  };
}

export const SNAPSHOT_INCIDENTS: IncidentWithRefs[] = [
  mkIncident({ id: 'snap-incident-saps-dev-dead-ip', summary: 'dev.saprivateschools.co.za DNS points to dead MA130 IP (78.46.220.231)', severity: 'minor', daysAgo: 14, clientId: 'snap-client-sa-private-schools', followupRequired: true, rootCause: 'Stale DNS record from before MA130 cancellation. No automation to detect.' }),
  mkIncident({ id: 'snap-incident-xneelo-stranded', summary: 'Four xneelo zones stranded — sites down pending NS update', severity: 'major', daysAgo: 10, followupRequired: true, rootCause: 'NS update at xneelo was skipped during the MA130 cancellation rush. Zones: plasticsurgerycapetown, schoolsnearme.au, leansixsigmaafrica, iammeskincare.' }),
  mkIncident({ id: 'snap-incident-ma130-apps-disk', summary: 'ma130-apps disk fill — 100% / 150 GB during SAPS migration', severity: 'critical', status: 'resolved', daysAgo: 3, resolvedDaysAgo: 3, rootCause: '79 GB of /srv/backups/final-sweep tarballs from MA130 migration. Rsynced to operator Mac and deleted. Now 65/150 GB.', followupRequired: true }),
  mkIncident({ id: 'snap-incident-taxup-unmapped', summary: 'taxup.app live on impart-global Vercel — owner mapping unknown', severity: 'minor', daysAgo: 7, followupRequired: true, rootCause: 'impart-global Vercel team not documented in infra-handover. May connect to legacy taxup Postgres on ma130-data.' }),
  mkIncident({ id: 'snap-incident-impart-us-redirect', summary: 'impartagency.us still serves from Vercel — should redirect to impartagency.co.za', severity: 'minor', daysAgo: 21, followupRequired: true, rootCause: 'Redirect was never configured at Vercel after the Impart Agency Hetzner migration.' }),
];

// ---------------------------------------------------------------- Counts

export const SNAPSHOT_COUNTS = {
  divisions: SNAPSHOT_DIVISIONS.length,
  clients: SNAPSHOT_CLIENTS.length,
  assets: SNAPSHOT_ASSETS.length,
  repos: SNAPSHOT_REPOS.length,
  vercelProjects: SNAPSHOT_VERCEL_PROJECTS.length,
  hetznerServers: SNAPSHOT_HETZNER_SERVERS.length,
  cloudflareZones: SNAPSHOT_CLOUDFLARE_ZONES.length,
  findings: SNAPSHOT_FINDINGS.length,
  tickets: SNAPSHOT_TICKETS.length,
  renewals: SNAPSHOT_RENEWALS.length,
  incidents: SNAPSHOT_INCIDENTS.length,
};

// ---------------------------------------------------------------- Lookup helpers
// All pure, all synchronous, all DB-free. Safe to import from anywhere.

export function isSnapshotId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith('snap-');
}

export function getSnapshotClient(id: string): ClientWithDivision | null {
  return SNAPSHOT_CLIENTS.find((c) => c.id === id) ?? null;
}

export function getSnapshotAsset(id: string): AssetWithRefs | null {
  return SNAPSHOT_ASSETS.find((a) => a.id === id) ?? null;
}

export function getSnapshotTicket(id: string): TicketWithRefs | null {
  return SNAPSHOT_TICKETS.find((t) => t.id === id) ?? null;
}

export function getSnapshotRenewal(id: string): RenewalWithRefs | null {
  return SNAPSHOT_RENEWALS.find((r) => r.id === id) ?? null;
}

export function getSnapshotIncident(id: string): IncidentWithRefs | null {
  return SNAPSHOT_INCIDENTS.find((i) => i.id === id) ?? null;
}

export function listSnapshotAssetsForClient(clientId: string): AssetWithRefs[] {
  return SNAPSHOT_ASSETS.filter((a) => a.clientId === clientId);
}

export function listSnapshotTicketsForClient(clientId: string): TicketWithRefs[] {
  return SNAPSHOT_TICKETS.filter((t) => t.clientId === clientId);
}

export function listSnapshotTicketsForAsset(assetId: string): TicketWithRefs[] {
  return SNAPSHOT_TICKETS.filter((t) => t.assetId === assetId);
}

export function listSnapshotRenewalsForClient(clientId: string): RenewalWithRefs[] {
  return SNAPSHOT_RENEWALS.filter((r) => r.clientId === clientId);
}

export function listSnapshotRenewalsForAsset(assetId: string): RenewalWithRefs[] {
  return SNAPSHOT_RENEWALS.filter((r) => r.subjectType === 'asset' && r.subjectId === assetId);
}

export function listSnapshotIncidentsForClient(clientId: string): IncidentWithRefs[] {
  return SNAPSHOT_INCIDENTS.filter((i) => i.clientId === clientId);
}

export function listSnapshotIncidentsForAsset(assetId: string): IncidentWithRefs[] {
  return SNAPSHOT_INCIDENTS.filter((i) => i.assetId === assetId);
}

export function listSnapshotReposForCategory(category: GithubRepo['category']): GithubRepo[] {
  return SNAPSHOT_REPOS.filter((r) => r.category === category);
}

export function listSnapshotVercelForTeam(teamSlug: string): VercelProject[] {
  return SNAPSHOT_VERCEL_PROJECTS.filter((v) => v.teamSlug === teamSlug);
}

// ---------------------------------------------------------------- Mapping confidence
// Used in detail pages to communicate how certain we are about a snapshot
// row's classification. "confirmed" — discovered from infra-handover and
// verified. "likely" — strong heuristic. "needs_review" — ambiguous.
// "unknown" — placeholder pending operator decision.

export type MappingConfidence = 'confirmed' | 'likely' | 'needs_review' | 'unknown';

const CLIENT_CONFIDENCE: Record<string, MappingConfidence> = {
  'snap-client-2ko-systems': 'confirmed',
  'snap-client-2ko-africa': 'confirmed',
  'snap-client-six-sigma-sa': 'confirmed',
  'snap-client-sigmaphi': 'confirmed',
  'snap-client-autotax': 'confirmed',
  'snap-client-coastal-security': 'confirmed',
  'snap-client-flex-and-flow': 'confirmed',
  'snap-client-all-the-glory': 'likely',
  'snap-client-crewter': 'confirmed',
  'snap-client-impart-agency': 'confirmed',
  'snap-client-sa-private-schools': 'confirmed',
  'snap-client-smart-home-architects': 'likely',
  'snap-client-gay-weddings': 'likely',
  'snap-client-coupex': 'needs_review',
  'snap-client-tax-up': 'needs_review',
};

const ASSET_CONFIDENCE: Record<string, MappingConfidence> = {
  'snap-asset-impart-ai': 'needs_review',
  'snap-asset-coupex-net': 'needs_review',
  'snap-asset-taxup-app': 'needs_review',
  'snap-asset-impart-us': 'needs_review',
};

export function getClientConfidence(id: string): MappingConfidence {
  return CLIENT_CONFIDENCE[id] ?? 'confirmed';
}

export function getAssetConfidence(id: string): MappingConfidence {
  return ASSET_CONFIDENCE[id] ?? 'confirmed';
}

// ---------------------------------------------------------------- Review/Decisions

export type DecisionOption = { label: string; recommended?: boolean };

export type SnapshotDecision = {
  id: string;
  cluster: 'repo_cluster' | 'unmapped_vercel' | 'cleanup' | 'incident' | 'backup';
  title: string;
  context: string;
  options: DecisionOption[];
  recommendation: string;
  risk: 'low' | 'med' | 'high';
  action: string;
  blockedBy: ('db' | 'ssh' | 'github_token' | 'cloudflare_token' | 'vercel_token' | 'hetzner_token' | 'none')[];
};

export const SNAPSHOT_DECISIONS: SnapshotDecision[] = [
  // Repo clusters
  {
    id: 'dec-repo-saps',
    cluster: 'repo_cluster',
    title: 'SAPS — pick canonical repo (3 candidates)',
    context: 'saps, sa_private_schools, saprivateschools all exist. The Hetzner systemd unit is saps.service in /srv/node/saps, and the live site is saprivateschools.co.za.',
    options: [
      { label: 'Keep saps (matches systemd unit + /srv path)', recommended: true },
      { label: 'Keep saprivateschools (matches domain)' },
      { label: 'Keep sa_private_schools' },
    ],
    recommendation: 'Keep saps. Archive sa_private_schools and saprivateschools. Update infra-handover INVENTORY.md to record the decision.',
    risk: 'low',
    action: 'gh repo archive darrensmith849/sa_private_schools && gh repo archive darrensmith849/saprivateschools',
    blockedBy: ['github_token'],
  },
  {
    id: 'dec-repo-impart',
    cluster: 'repo_cluster',
    title: 'Impart Agency — pick canonical repo (3 candidates)',
    context: 'impart_agency, impart_agency_site, impart_agency_website. The Hetzner /srv/node/impart_agency_site path matches systemd. The Vercel-still-live project is named impart_agency_site (impartagency.us).',
    options: [
      { label: 'Keep impart_agency (clean name, owns the .co.za primary)', recommended: true },
      { label: 'Keep impart_agency_site (matches Hetzner systemd + Vercel project)' },
    ],
    recommendation: 'Keep impart_agency_site for now — it matches both systemd and Vercel. Re-rename later once redirect is in place.',
    risk: 'low',
    action: 'gh repo archive darrensmith849/impart_agency && gh repo archive darrensmith849/impart_agency_website',
    blockedBy: ['github_token'],
  },
  {
    id: 'dec-repo-glory',
    cluster: 'repo_cluster',
    title: 'All The Glory — pick canonical repo (3 candidates)',
    context: 'allthegloryclaude, allthe_glory, alltheglory101. Vercel project allthegloryclaude is the one serving alltheglory.co.za.',
    options: [
      { label: 'Keep allthegloryclaude (matches Vercel project)', recommended: true },
    ],
    recommendation: 'Keep allthegloryclaude. Archive the other two.',
    risk: 'low',
    action: 'gh repo archive darrensmith849/allthe_glory && gh repo archive darrensmith849/alltheglory101',
    blockedBy: ['github_token'],
  },
  {
    id: 'dec-repo-smarthome',
    cluster: 'repo_cluster',
    title: 'SmartHomeArchitects — typo cluster (2 candidates)',
    context: 'smarthomearchitects_website vs smarthomearchitects_websaite (typo in second). Hetzner WP pool is `smarthome`. No Vercel involvement.',
    options: [
      { label: 'Keep smarthomearchitects_website (correct spelling)', recommended: true },
    ],
    recommendation: 'Keep smarthomearchitects_website. Archive the typo variant.',
    risk: 'low',
    action: 'gh repo archive darrensmith849/smarthomearchitects_websaite',
    blockedBy: ['github_token'],
  },
  {
    id: 'dec-repo-autotax',
    cluster: 'repo_cluster',
    title: 'AutoTax / Taxo — repo vs systemd-name mismatch',
    context: 'Repo names: autotax + taxo. Hetzner systemd units: taxo-web.service + taxo-api.service. The live site is autotax.co.za. Subjective: align names or keep both.',
    options: [
      { label: 'Keep autotax (matches domain)', recommended: true },
      { label: 'Keep taxo (matches systemd)' },
    ],
    recommendation: 'Keep autotax. Rename Hetzner systemd units from taxo-* to autotax-* in a follow-up SSH session. Archive taxo repo.',
    risk: 'med',
    action: 'On ma130-apps: systemctl rename + reload; then gh repo archive darrensmith849/taxo',
    blockedBy: ['ssh', 'github_token'],
  },

  // Unmapped Vercel/domains
  {
    id: 'dec-unmapped-coupex',
    cluster: 'unmapped_vercel',
    title: 'coupex.net — owner mapping needed',
    context: 'Live on impart-global Vercel team. Project name "coupex". No reference in infra-handover. Could be Impart Agency-related (same team) or fully external.',
    options: [
      { label: 'Map to Impart Agency client' },
      { label: 'Create a new "Coupex" client', recommended: true },
      { label: 'Mark for shutdown if unowned' },
    ],
    recommendation: 'Create a new "Coupex" client and assign coupex.net to it. If turns out Impart owns it, reassign once confirmed.',
    risk: 'low',
    action: 'Manual: ask Impart Global directly, or check coupex.net for branding/contact info.',
    blockedBy: ['none'],
  },
  {
    id: 'dec-unmapped-taxup',
    cluster: 'unmapped_vercel',
    title: 'taxup.app — owner mapping + legacy DB risk',
    context: 'Live on impart-global Vercel team. Project "tax-up". A legacy `taxup` Postgres DB exists on ma130-data — unaudited. Likely related.',
    options: [
      { label: 'Map to Impart Agency client', recommended: true },
      { label: 'Create a separate "TaxUp" client' },
    ],
    recommendation: 'Map to Impart Agency. Audit the taxup Postgres DB on ma130-data to confirm it powers this site.',
    risk: 'med',
    action: 'SSH ma130-data → list databases → check taxup DB activity → confirm linkage',
    blockedBy: ['ssh'],
  },
  {
    id: 'dec-unmapped-impartai',
    cluster: 'unmapped_vercel',
    title: 'impartai.co.za — third Impart property',
    context: 'Live on impart-global Vercel team. Project "impart-agency-site". This is a third Impart-branded property beyond impartagency.co.za and impartagency.us.',
    options: [
      { label: 'Map to existing Impart Agency client', recommended: true },
      { label: 'Investigate whether it is an experiment to retire' },
    ],
    recommendation: 'Map to Impart Agency. Add a follow-up ticket to confirm whether all three Impart domains should remain live.',
    risk: 'low',
    action: 'Manual: ask Impart Agency.',
    blockedBy: ['none'],
  },
  {
    id: 'dec-unmapped-postigo',
    cluster: 'unmapped_vercel',
    title: 'postigo.app + postigo.co.za — not bound to a project',
    context: 'Listed in infra-handover INVENTORY but no Vercel project mapping. May be inactive, may be on a different host.',
    options: [
      { label: 'Investigate where DNS points', recommended: true },
      { label: 'Mark for retirement if no traffic' },
    ],
    recommendation: 'Resolve DNS and check current host before further action.',
    risk: 'low',
    action: 'dig postigo.app and postigo.co.za to see current A/AAAA targets.',
    blockedBy: ['none'],
  },

  // Cleanup
  {
    id: 'dec-cleanup-dormant-vercel',
    cluster: 'cleanup',
    title: 'Delete ~25 dormant Vercel projects (pumpbots-projects team)',
    context: 'ukama, pumpbot, lovelace-moki, strongtower, coupex (separate from impart-global), website-while-you-wait, toritradestodamoon, schools_near_me_us, base_test_2, im-kade, edenlang, anniversaryclaude, rileyscarwash, highendtravel, darreniscool×2, allthe_glory, alltheglory101, slabheadcodex, slabhead.co.za, danielpeter, smarthomearchitects_website, 2ko_website, sigmafy-funnel-public.',
    options: [
      { label: 'Delete one-by-one after manual review', recommended: true },
      { label: 'Bulk-delete after first confirming no custom domains attached' },
    ],
    recommendation: 'Manual review per-project. Delete via vercel projects rm <name> --yes --scope pumpbots-projects.',
    risk: 'med',
    action: 'vercel projects rm <name> --yes --scope pumpbots-projects',
    blockedBy: ['vercel_token'],
  },
  {
    id: 'dec-cleanup-xneelo-zones',
    cluster: 'cleanup',
    title: '4 stranded xneelo zones — NS update or formal retirement',
    context: 'plasticsurgerycapetown, schoolsnearme.au, leansixsigmaafrica, iammeskincare. Sites currently down. NS update at xneelo was skipped during the MA130 cancellation rush.',
    options: [
      { label: 'Complete NS migration to Cloudflare' },
      { label: 'Formally retire all four', recommended: true },
    ],
    recommendation: 'Confirm with the original owners whether any of these should be revived. If none, formally retire and document.',
    risk: 'low',
    action: 'Per-zone: log into xneelo, decide, update NS or close.',
    blockedBy: ['none'],
  },
  {
    id: 'dec-cleanup-dead-ip',
    cluster: 'cleanup',
    title: 'dev.saprivateschools.co.za — dead MA130 A record',
    context: 'A record points to 78.46.220.231 (dead). Not blocking but should be cleaned up.',
    options: [
      { label: 'Delete the dev. record', recommended: true },
      { label: 'Repoint to a current staging host' },
    ],
    recommendation: 'Delete the record. SAPS already has dev/staging on ma130-apps via different hostnames.',
    risk: 'low',
    action: 'Via Cloudflare DNS UI or API.',
    blockedBy: ['cloudflare_token'],
  },
  {
    id: 'dec-cleanup-taxup-db',
    cluster: 'cleanup',
    title: 'taxup legacy DB on ma130-data — audit before deciding',
    context: 'Legacy Postgres DB on ma130-data, not yet audited. May still be in use by taxup.app (impart-global Vercel team).',
    options: [
      { label: 'Audit first, then decide', recommended: true },
    ],
    recommendation: 'Read-only audit: check pg_stat_activity, recent writes, table sizes. Then decide.',
    risk: 'high',
    action: 'SSH ma130-data → sudo -u postgres psql taxup → run audit queries.',
    blockedBy: ['ssh'],
  },
  {
    id: 'dec-incident-disk',
    cluster: 'incident',
    title: 'ma130-apps disk fill risk — add daily check',
    context: 'Disk hit 100% during SAPS migration. Mitigated by removing 79 GB of final-sweep tarballs. No automated monitor.',
    options: [
      { label: 'Add cron job that pages above 85%', recommended: true },
    ],
    recommendation: 'Cron on ma130-apps: df -h / | awk \'$5+0 > 85\' | mail -s "disk warning" ops@2ko.co.za. Or Better Stack monitor.',
    risk: 'high',
    action: 'SSH ma130-apps + add /etc/cron.d/disk-check',
    blockedBy: ['ssh'],
  },
  {
    id: 'dec-backup-offsite',
    cluster: 'backup',
    title: 'No automated off-site Postgres backups',
    context: 'pg_dump only runs during manual ops work. Risk: a server fire loses everything since the last manual dump.',
    options: [
      { label: 'Nightly pg_dump to Hetzner Storage Box (cheap)', recommended: true },
      { label: 'Hetzner Storage Box + GPG encryption to S3 elsewhere' },
    ],
    recommendation: 'Start with Hetzner Storage Box nightly. Add GPG + off-region copy in Phase 2.',
    risk: 'high',
    action: 'See docs/runbooks/ops-db-setup.md — "Backup steps" section.',
    blockedBy: ['ssh'],
  },
];

// ---------------------------------------------------------------- Import readiness

export type ImportReadiness = 'ready' | 'needs_review' | 'blocked';

export type ImportReadinessGroup = {
  category: string;
  snapshotCount: number;
  readiness: ImportReadiness;
  notes: string;
};

export function getSnapshotImportReadiness(): ImportReadinessGroup[] {
  return [
    { category: 'Divisions', snapshotCount: SNAPSHOT_DIVISIONS.length, readiness: 'ready', notes: 'Six divisions in the 2KO Africa hierarchy — clean to import directly.' },
    { category: 'Clients', snapshotCount: SNAPSHOT_CLIENTS.length, readiness: 'needs_review', notes: '2 unmapped (coupex, taxup) need owner mapping. All-The-Glory + SmartHome at "likely" confidence.' },
    { category: 'Assets', snapshotCount: SNAPSHOT_ASSETS.length, readiness: 'needs_review', notes: 'impart-us / coupex.net / taxup.app / impartai.co.za need owner verification before final import.' },
    { category: 'GitHub repos', snapshotCount: SNAPSHOT_REPOS.length, readiness: 'needs_review', notes: '5 duplicate clusters need canonical picks (Review page). Personal/legacy already auto-categorised.' },
    { category: 'Vercel projects', snapshotCount: SNAPSHOT_VERCEL_PROJECTS.length, readiness: 'needs_review', notes: 'impart-global team has 3 unmapped properties. pumpbots dormant cleanup pending.' },
    { category: 'Hetzner servers', snapshotCount: SNAPSHOT_HETZNER_SERVERS.length, readiness: 'ready', notes: 'ma130-apps + ma130-data + ma130-tori — fully documented in infra-handover.' },
    { category: 'Cloudflare zones', snapshotCount: SNAPSHOT_CLOUDFLARE_ZONES.length, readiness: 'blocked', notes: 'Only an illustrative subset is in snapshot. Real list is ~40 zones — needs CLOUDFLARE_API_TOKEN to enumerate before import.' },
    { category: 'Domains', snapshotCount: SNAPSHOT_DOMAINS.length, readiness: 'blocked', notes: 'Only 4 illustrative entries in snapshot. Full list needs registrar API or manual entry per domain.' },
    { category: 'Tickets', snapshotCount: SNAPSHOT_TICKETS.length, readiness: 'ready', notes: '5 real operational tasks — import as the starting backlog.' },
    { category: 'Renewals', snapshotCount: SNAPSHOT_RENEWALS.length, readiness: 'needs_review', notes: '5 real upcoming renewals. Renewal dates need confirming against the registrar / provider before import.' },
    { category: 'Incidents', snapshotCount: SNAPSHOT_INCIDENTS.length, readiness: 'ready', notes: '5 historical incidents from discovery. Safe to import as the starting incident log.' },
    { category: 'Audit findings', snapshotCount: SNAPSHOT_FINDINGS.length, readiness: 'ready', notes: '10 known issues from infra-handover/HISTORY.md — same as the existing findings seed.' },
  ];
}

// ---------------------------------------------------------------- Decision listing

export function listSnapshotDecisionItems(): SnapshotDecision[] {
  return SNAPSHOT_DECISIONS;
}

// Comment to suppress unused-type warnings — these are imported solely for
// shape parity between snapshot constants and live DB types.
export type _SnapshotTypes = TicketComment;
