import 'server-only';
import { connected, notConnected, type IntegrationConnectivity } from './types';

// Read-only Cloudflare integration. Token scope should be:
// Account Read, Zone Read, DNS Read, Pages Read, Account Analytics Read.

export type CloudflareZoneSummary = {
  zoneId: string;
  name: string;
  status: string;
  nameServers: string[];
  plan: string | null;
};

export type CloudflarePagesProjectSummary = {
  projectId: string;
  name: string;
  subdomain: string | null;
  productionBranch: string | null;
  latestDeploymentStatus: string | null;
  customDomains: string[];
};

export type CloudflareDnsRecordSummary = {
  recordId: string;
  zoneId: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number | null;
};

function getToken(): string | null {
  return process.env.CLOUDFLARE_API_TOKEN ?? null;
}

function getAccountId(): string | null {
  return process.env.CLOUDFLARE_ACCOUNT_ID ?? null;
}

export function cloudflareConnectivity(): IntegrationConnectivity {
  const tok = getToken();
  if (!tok) return notConnected('missing_token', 'Set CLOUDFLARE_API_TOKEN (read-only)');
  if (!getAccountId()) return notConnected('missing_env', 'Set CLOUDFLARE_ACCOUNT_ID');
  return connected();
}

const API = 'https://api.cloudflare.com/client/v4';

async function cfFetch(path: string): Promise<Record<string, unknown>> {
  const tok = getToken();
  if (!tok) throw new Error('CLOUDFLARE_API_TOKEN not set');
  const res = await fetch(`${API}${path}`, {
    headers: { authorization: `Bearer ${tok}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Cloudflare API ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

export async function listCloudflareZones(): Promise<CloudflareZoneSummary[]> {
  if (!getToken()) return [];
  const out: CloudflareZoneSummary[] = [];
  let page = 1;
  while (true) {
    const data = await cfFetch(`/zones?per_page=50&page=${page}`);
    const result = data.result as Array<Record<string, unknown>> | undefined;
    if (!result) break;
    for (const z of result) {
      out.push({
        zoneId: z.id as string,
        name: z.name as string,
        status: (z.status as string) ?? 'unknown',
        nameServers: Array.isArray(z.name_servers) ? (z.name_servers as string[]) : [],
        plan: (z.plan as Record<string, unknown> | undefined)?.name as string ?? null,
      });
    }
    const info = data.result_info as Record<string, unknown> | undefined;
    if (!info || (info.page as number) >= (info.total_pages as number)) break;
    page += 1;
    if (page > 20) break;
  }
  return out;
}

export async function listCloudflareDnsRecords(zoneId: string): Promise<CloudflareDnsRecordSummary[]> {
  if (!getToken()) return [];
  const out: CloudflareDnsRecordSummary[] = [];
  let page = 1;
  while (true) {
    const data = await cfFetch(`/zones/${zoneId}/dns_records?per_page=100&page=${page}`);
    const result = data.result as Array<Record<string, unknown>> | undefined;
    if (!result) break;
    for (const r of result) {
      out.push({
        recordId: r.id as string,
        zoneId,
        type: r.type as string,
        name: r.name as string,
        content: (r.content as string) ?? '',
        proxied: Boolean(r.proxied),
        ttl: typeof r.ttl === 'number' ? r.ttl : null,
      });
    }
    const info = data.result_info as Record<string, unknown> | undefined;
    if (!info || (info.page as number) >= (info.total_pages as number)) break;
    page += 1;
    if (page > 50) break;
  }
  return out;
}

export async function listCloudflarePagesProjects(): Promise<CloudflarePagesProjectSummary[]> {
  const accountId = getAccountId();
  if (!getToken() || !accountId) return [];
  const data = await cfFetch(`/accounts/${accountId}/pages/projects`);
  const result = data.result as Array<Record<string, unknown>> | undefined;
  if (!result) return [];
  return result.map((p) => {
    const latest = p.latest_deployment as Record<string, unknown> | undefined;
    const latestStage = (latest?.latest_stage as Record<string, unknown> | undefined)?.status as
      | string
      | undefined;
    const domains = (p.domains as string[]) ?? [];
    return {
      projectId: p.id as string,
      name: p.name as string,
      subdomain: (p.subdomain as string | null) ?? null,
      productionBranch: (p.production_branch as string | null) ?? null,
      latestDeploymentStatus: latestStage ?? null,
      customDomains: domains.filter((d) => !d.endsWith('.pages.dev')),
    };
  });
}
