import 'server-only';
import { getDb } from '@/lib/db/client';
import { divisions } from '@/lib/db/schema/divisions';
import { domains } from '@/lib/db/schema/infra';
import { syncRuns } from '@/lib/db/schema/sync';
import { eq } from 'drizzle-orm';

// Imports the hand-maintained operator handover into the DB. Source of truth
// is `darrensmith849/infra-handover/INVENTORY.md`. We do NOT vendor a copy of
// that file into this repo — we fetch it at run time via the GitHub API using
// the same GITHUB_TOKEN as the github integration. This way the importer
// always sees the latest version.

const INVENTORY_REPO = 'darrensmith849/infra-handover';
const INVENTORY_PATH = 'INVENTORY.md';

async function fetchInventory(): Promise<string | null> {
  const tok = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!tok) return null;
  const res = await fetch(`https://api.github.com/repos/${INVENTORY_REPO}/contents/${INVENTORY_PATH}`, {
    headers: {
      authorization: `Bearer ${tok}`,
      accept: 'application/vnd.github.raw',
      'x-github-api-version': '2022-11-28',
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.text();
}

// Very conservative parsing: we only extract the few high-confidence facts
// the dashboard can use as seeds without risk of misinterpretation.
// Anything ambiguous becomes an audit finding instead of a silent DB write.

type ParsedDomain = { name: string };

function extractDomains(md: string): ParsedDomain[] {
  const seen = new Set<string>();
  // Domain regex: word.tld(.tld)... where each segment is hostname-ish.
  const re = /\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+\.[a-z]{2,})\b/gi;
  const blocked = new Set(['github.com', 'vercel.app', 'pages.dev', 'cloudflare.com', 'hetzner.com', 'fly.io', 'neon.tech', 'upstash.com', 'openai.com', 'anthropic.com', 'paystack.co.za', 'stripe.com', 'godaddy.com', 'xneelo.co.za', 'icloud.com', 'api.cloudflare.com']);
  const m = md.toLowerCase().match(re) ?? [];
  for (const candidate of m) {
    if (blocked.has(candidate)) continue;
    if (candidate.endsWith('.vercel.app') || candidate.endsWith('.pages.dev')) continue;
    if (candidate.endsWith('.local') || candidate.endsWith('.internal')) continue;
    // Drop bare second-level dev/staging/admin prefixes; keep the canonical apex
    // for now — the operator can add subdomains explicitly in the UI later.
    const parts = candidate.split('.');
    if (parts.length > 3) continue; // skip deep subdomains in MVP
    seen.add(candidate);
  }
  return [...seen].slice(0, 200).map((name) => ({ name }));
}

export type ImporterResult = {
  ok: boolean;
  error?: string;
  fetched: boolean;
  domainsSeen: number;
  domainsInserted: number;
};

export async function importInventoryMd(input: {
  operatorSlug: string | null;
  triggeredBy: 'manual' | 'cron' | 'seed';
}): Promise<ImporterResult> {
  const db = getDb();
  if (!db) {
    return { ok: false, error: 'no_database', fetched: false, domainsSeen: 0, domainsInserted: 0 };
  }
  const runRows = await db
    .insert(syncRuns)
    .values({
      provider: 'inventory_md',
      status: 'running',
      triggeredBy: input.triggeredBy,
      triggeredByOperatorSlug: input.operatorSlug,
    })
    .returning();
  const runId = runRows[0]?.id;

  try {
    const md = await fetchInventory();
    if (!md) {
      if (runId) {
        await db
          .update(syncRuns)
          .set({
            status: 'skipped',
            finishedAt: new Date(),
            details: { reason: 'missing_github_token_or_inventory_unreachable' },
          })
          .where(eq(syncRuns.id, runId));
      }
      return { ok: false, error: 'inventory_not_fetched', fetched: false, domainsSeen: 0, domainsInserted: 0 };
    }
    // Look up 2KO Africa division so domains land under the umbrella by default.
    const div = await db.select({ id: divisions.id }).from(divisions).where(eq(divisions.code, '2ko_africa'));
    const divisionId = div[0]?.id ?? null;

    const parsedDomains = extractDomains(md);
    let inserted = 0;
    for (const d of parsedDomains) {
      const result = await db
        .insert(domains)
        .values({ name: d.name, divisionId, notes: 'Seeded from infra-handover/INVENTORY.md' })
        .onConflictDoNothing({ target: domains.name })
        .returning({ id: domains.id });
      if (result.length > 0) inserted++;
    }

    if (runId) {
      await db
        .update(syncRuns)
        .set({
          status: 'ok',
          finishedAt: new Date(),
          itemsSeen: parsedDomains.length,
          itemsCreated: inserted,
          details: { source: `${INVENTORY_REPO}/${INVENTORY_PATH}` },
        })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: true, fetched: true, domainsSeen: parsedDomains.length, domainsInserted: inserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) {
      await db
        .update(syncRuns)
        .set({ status: 'failed', finishedAt: new Date(), errorMessage: message.slice(0, 500) })
        .where(eq(syncRuns.id, runId));
    }
    return { ok: false, error: message, fetched: false, domainsSeen: 0, domainsInserted: 0 };
  }
}
