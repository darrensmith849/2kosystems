import 'server-only';

// Runtime adapter. The dashboard runs on Vercel for MVP and must be portable
// to a Hetzner Node host later. ALL runtime-specific code lives behind this
// boundary. Application code imports from `@/lib/runtime`, never from
// `process.env.VERCEL_*` or platform-specific APIs directly.

type RuntimeName = 'vercel' | 'hetzner' | 'unknown';

export function detectRuntime(): RuntimeName {
  if (process.env.VERCEL === '1') return 'vercel';
  if (process.env.OPS_RUNTIME === 'hetzner') return 'hetzner';
  return 'unknown';
}

export function getCronSecret(): string | null {
  return process.env.CRON_SECRET ?? null;
}

export function getDeploymentRegion(): string | null {
  // Vercel sets VERCEL_REGION; Hetzner sets nothing. Keep this hidden behind
  // the adapter so callers don't grow Vercel-specific imports.
  return process.env.VERCEL_REGION ?? process.env.OPS_REGION ?? null;
}

export function getDeploymentEnv(): 'development' | 'preview' | 'production' {
  const v = process.env.VERCEL_ENV;
  if (v === 'preview' || v === 'production') return v;
  if (process.env.NODE_ENV === 'production') return 'production';
  return 'development';
}

export function getDeploymentUrl(): string | null {
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.OPS_PUBLIC_URL ?? null;
}
