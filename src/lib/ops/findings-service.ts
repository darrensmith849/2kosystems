import 'server-only';
import { getDb } from '@/lib/db/client';
import { auditFindings, type AuditFinding, type NewAuditFinding } from '@/lib/db/schema/audits';
import { and, desc, eq, sql } from 'drizzle-orm';

export async function listFindings(opts?: { status?: string }): Promise<AuditFinding[]> {
  const db = getDb();
  if (!db) return [];
  const where = opts?.status ? and(eq(auditFindings.status, opts.status)) : undefined;
  const q = db.select().from(auditFindings).orderBy(desc(auditFindings.createdAt));
  return where ? q.where(where) : q;
}

export async function updateFindingStatus(input: {
  id: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'wontfix';
}): Promise<AuditFinding | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .update(auditFindings)
    .set({
      status: input.status,
      resolvedAt: input.status === 'resolved' || input.status === 'wontfix' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(auditFindings.id, input.id))
    .returning();
  return rows[0] ?? null;
}

// Known operational issues sourced from infra-handover/HISTORY.md and the
// discovery audit. Re-seeding is idempotent: each row is keyed by
// (kind, entity_ref, title) and only inserted if no matching row exists.
const SEED_FINDINGS: Omit<NewAuditFinding, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolvedByOperatorId'>[] = [
  {
    kind: 'dns', severity: 'med', source: 'seed',
    entityType: 'domain', entityRef: 'sixsigmasouthafrica.co.za',
    title: 'sixsigmasouthafrica.co.za still on Vercel (intended Cloudflare Pages)',
    detail: 'DNS for sixsigmasouthafrica.co.za points at Vercel. Per the MA130 migration plan, this site was supposed to be moved to Cloudflare Pages. Action: confirm intended target and migrate.',
    status: 'open',
  },
  {
    kind: 'dns', severity: 'low', source: 'seed',
    entityType: 'domain', entityRef: 'impartagency.us',
    title: 'impartagency.us still on Vercel — should redirect to .co.za',
    detail: 'impartagency.us is supposed to redirect to impartagency.co.za (Hetzner). Action: configure the redirect and verify.',
    status: 'open',
  },
  {
    kind: 'dns', severity: 'low', source: 'seed',
    entityType: 'domain', entityRef: 'dev.saprivateschools.co.za',
    title: 'dev.saprivateschools.co.za A record points to dead MA130 IP (78.46.220.231)',
    detail: 'Not blocking but should be cleaned up. Action: delete or repoint to the current dev host.',
    status: 'open',
  },
  {
    kind: 'dns', severity: 'med', source: 'seed',
    entityType: 'xneelo_zones', entityRef: 'stranded_4',
    title: '4 xneelo zones stranded: plasticsurgerycapetown, schoolsnearme.au, leansixsigmaafrica, iammeskincare',
    detail: 'Nameserver update pending at xneelo. Sites currently down. Action: complete NS migration or formally retire.',
    status: 'open',
  },
  {
    kind: 'backup', severity: 'high', source: 'seed',
    entityType: 'postgres', entityRef: 'ma130-data',
    title: 'No automated off-site backups for ma130-data Postgres',
    detail: 'Postgres dumps happen only during manual operations. Recommended: nightly cron to Hetzner Storage Box with GPG encryption.',
    status: 'open',
  },
  {
    kind: 'vercel', severity: 'low', source: 'seed',
    entityType: 'vercel_team', entityRef: 'pumpbots-projects',
    title: '~25 dormant Vercel projects in pumpbots-projects',
    detail: 'Dormant test/duplicate Vercel projects waiting for deletion. Cost waste + clutter. See the Vercel section for the list. Action: delete one by one after confirming each is truly unused.',
    status: 'open',
  },
  {
    kind: 'cloudflare', severity: 'low', source: 'seed',
    entityType: 'db', entityRef: 'taxup',
    title: 'taxup legacy Postgres DB on ma130-data has not been audited',
    detail: 'May relate to the taxup.app site in the impart-global Vercel team. Action: confirm whether taxup DB is still in use and by what.',
    status: 'open',
  },
  {
    kind: 'repo_health', severity: 'low', source: 'seed',
    entityType: 'github', entityRef: 'duplicates',
    title: 'Duplicate repo clusters need canonical picks: SAPS, Impart, All-The-Glory, SmartHome, Taxo/AutoTax',
    detail: 'Five clusters with multiple repos for the same site/app. Pick canonical per cluster in the GitHub section and archive the others.',
    status: 'open',
  },
  {
    kind: 'vercel', severity: 'med', source: 'seed',
    entityType: 'vercel_team', entityRef: 'impart-global',
    title: 'impart-global Vercel team holds coupex.net, taxup.app, impartai.co.za — not in handover docs',
    detail: 'Owner/client mapping needed for the three live properties in the impart-global team.',
    status: 'open',
  },
  {
    kind: 'hetzner', severity: 'med', source: 'seed',
    entityType: 'server', entityRef: 'ma130-apps',
    title: 'ma130-apps disk fill risk — was 100% on 2026-06-03',
    detail: 'After SAPS migration the disk hit 144/150 GB. Mitigated by removing final-sweep tarballs (down to 65 GB). Add a daily disk-usage check.',
    status: 'open',
  },
];

export async function seedInitialFindings(): Promise<{ inserted: number; skipped: number }> {
  const db = getDb();
  if (!db) return { inserted: 0, skipped: SEED_FINDINGS.length };

  // Use a raw idempotency check on (kind, entity_ref, title) so re-seeding never duplicates.
  let inserted = 0;
  let skipped = 0;
  for (const f of SEED_FINDINGS) {
    const existing = await db
      .select({ id: auditFindings.id })
      .from(auditFindings)
      .where(
        and(
          eq(auditFindings.kind, f.kind),
          eq(auditFindings.title, f.title),
        ),
      );
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    await db.insert(auditFindings).values(f);
    inserted++;
  }
  // Silence unused warning if drizzle's `sql` ever gets removed
  void sql;
  return { inserted, skipped };
}
