import 'server-only';
import { connected, notConnected, type IntegrationConnectivity } from './types';

// Read-only Hetzner Cloud integration.

export type HetznerServerSummary = {
  id: number;
  name: string;
  status: string;
  serverType: string | null;
  location: string | null;
  publicIpv4: string | null;
  publicIpv6: string | null;
  privateIps: string[];
  labels: Record<string, string>;
  createdAt: string | null;
};

function getToken(): string | null {
  return process.env.HETZNER_API_TOKEN ?? null;
}

export function hetznerConnectivity(): IntegrationConnectivity {
  const tok = getToken();
  if (!tok) return notConnected('missing_token', 'Set HETZNER_API_TOKEN (read-only)');
  return connected();
}

const API = 'https://api.hetzner.cloud/v1';

export async function listHetznerServers(): Promise<HetznerServerSummary[]> {
  const tok = getToken();
  if (!tok) return [];
  const out: HetznerServerSummary[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API}/servers?page=${page}&per_page=50`, {
      headers: { authorization: `Bearer ${tok}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Hetzner API ${res.status}`);
    const data = (await res.json()) as {
      servers?: Array<Record<string, unknown>>;
      meta?: { pagination?: { last_page?: number } };
    };
    for (const s of data.servers ?? []) {
      const pub = s.public_net as Record<string, unknown> | undefined;
      const priv = (s.private_net as Array<Record<string, unknown>> | undefined) ?? [];
      const stype = s.server_type as Record<string, unknown> | undefined;
      const loc = (s.datacenter as Record<string, unknown> | undefined)?.location as
        | Record<string, unknown>
        | undefined;
      out.push({
        id: s.id as number,
        name: s.name as string,
        status: (s.status as string) ?? 'unknown',
        serverType: (stype?.name as string | undefined) ?? null,
        location: (loc?.name as string | undefined) ?? null,
        publicIpv4: ((pub?.ipv4 as Record<string, unknown> | undefined)?.ip as string) ?? null,
        publicIpv6: ((pub?.ipv6 as Record<string, unknown> | undefined)?.ip as string) ?? null,
        privateIps: priv.map((p) => p.ip as string).filter(Boolean),
        labels: (s.labels as Record<string, string>) ?? {},
        createdAt: (s.created as string | null) ?? null,
      });
    }
    const lp = data.meta?.pagination?.last_page ?? page;
    if (page >= lp) break;
    page += 1;
    if (page > 10) break;
  }
  return out;
}
