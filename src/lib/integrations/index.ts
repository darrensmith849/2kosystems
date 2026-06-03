import 'server-only';
import { githubConnectivity } from './github';
import { vercelConnectivity } from './vercel';
import { cloudflareConnectivity } from './cloudflare';
import { hetznerConnectivity } from './hetzner';
import type { IntegrationConnectivity } from './types';

export type ProviderName = 'github' | 'vercel' | 'cloudflare' | 'hetzner';

export function allConnectivity(): Record<ProviderName, IntegrationConnectivity> {
  return {
    github: githubConnectivity(),
    vercel: vercelConnectivity(),
    cloudflare: cloudflareConnectivity(),
    hetzner: hetznerConnectivity(),
  };
}

export type { IntegrationConnectivity };
