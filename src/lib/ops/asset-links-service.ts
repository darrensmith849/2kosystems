import 'server-only';
import { getDb } from '@/lib/db/client';
import { assetLinks, type AssetLink, type NewAssetLink } from '@/lib/db/schema/assets';
import { assets, type Asset } from '@/lib/db/schema/assets';
import { githubRepos } from '@/lib/db/schema/infra';
import { vercelProjects } from '@/lib/db/schema/infra';
import { cloudflareZones, cloudflarePagesProjects, hetznerServers, domains } from '@/lib/db/schema/infra';
import { eq, and } from 'drizzle-orm';

export type AssetLinkKind =
  | 'github_repo'
  | 'vercel_project'
  | 'cloudflare_zone'
  | 'cloudflare_pages'
  | 'hetzner_server'
  | 'domain';

export const ASSET_LINK_KINDS: AssetLinkKind[] = [
  'github_repo',
  'vercel_project',
  'cloudflare_zone',
  'cloudflare_pages',
  'hetzner_server',
  'domain',
];

export async function getAsset(id: string): Promise<Asset | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(assets).where(eq(assets.id, id));
  return rows[0] ?? null;
}

export async function listLinksForAsset(assetId: string): Promise<AssetLink[]> {
  const db = getDb();
  if (!db) return [];
  return db.select().from(assetLinks).where(eq(assetLinks.assetId, assetId));
}

export async function createLink(input: NewAssetLink): Promise<AssetLink | null> {
  const db = getDb();
  if (!db) return null;
  // Idempotent: same (assetId, kind, externalRef) returns existing row.
  const existing = await db
    .select()
    .from(assetLinks)
    .where(
      and(
        eq(assetLinks.assetId, input.assetId),
        eq(assetLinks.kind, input.kind),
        eq(assetLinks.externalRef, input.externalRef),
      ),
    );
  if (existing.length > 0) return existing[0];
  const rows = await db.insert(assetLinks).values(input).returning();
  return rows[0] ?? null;
}

export async function deleteLink(linkId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  await db.delete(assetLinks).where(eq(assetLinks.id, linkId));
  return true;
}

// Candidate listings for each kind. Returned shape:
//   { ref: string (stored in externalRef), label: string (shown in UI), detail?: string }
export type LinkCandidate = { ref: string; label: string; detail?: string };

export async function listCandidates(kind: AssetLinkKind): Promise<LinkCandidate[]> {
  const db = getDb();
  if (!db) return [];
  switch (kind) {
    case 'github_repo': {
      const rows = await db.select().from(githubRepos);
      return rows
        .map((r) => ({
          ref: `${r.owner}/${r.name}`,
          label: `${r.owner}/${r.name}`,
          detail: [r.visibility, r.category].filter(Boolean).join(' · '),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    case 'vercel_project': {
      const rows = await db.select().from(vercelProjects);
      return rows
        .map((p) => ({
          ref: `${p.teamSlug}/${p.name}`,
          label: `${p.name}`,
          detail: `${p.teamSlug} · ${p.state}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    case 'cloudflare_zone': {
      const rows = await db.select().from(cloudflareZones);
      return rows
        .map((z) => ({
          ref: z.cfZoneId,
          label: z.name,
          detail: z.status ?? undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    case 'cloudflare_pages': {
      const rows = await db.select().from(cloudflarePagesProjects);
      return rows
        .map((p) => ({
          ref: p.cfProjectId,
          label: p.name,
          detail: p.productionBranch ?? undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    case 'hetzner_server': {
      const rows = await db.select().from(hetznerServers);
      return rows
        .map((s) => ({
          ref: String(s.hzServerId),
          label: s.name,
          detail: [s.serverType, s.location].filter(Boolean).join(' · ') || undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    case 'domain': {
      const rows = await db.select().from(domains);
      return rows
        .map((d) => ({
          ref: d.name,
          label: d.name,
          detail: d.registrar ?? undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
  }
}
