import 'server-only';
import { getDb } from './client';
import { divisions } from './schema/divisions';
import { vercelTeams } from './schema/infra';
import { sql } from 'drizzle-orm';

// Idempotent seed of the foundational rows the dashboard needs to function.
// Safe to call repeatedly. Returns counts of inserted rows.

export type SeedResult = {
  divisions: number;
  vercelTeams: number;
  operators: number;
  skipped?: string;
};

const DIVISION_SEEDS: { code: string; name: string; parentCode?: string; description?: string }[] = [
  { code: '2ko_africa', name: '2KO Africa', description: 'Umbrella holding company' },
  { code: '2ko_systems', name: '2KO Systems', parentCode: '2ko_africa', description: 'Tech systems for large clients' },
  { code: 'six_sigma_sa', name: '6 Sigma South Africa', parentCode: '2ko_africa', description: 'Six Sigma training company' },
  { code: 'sigmaphi', name: 'SigmaPhi', parentCode: '2ko_africa', description: 'SaaS family — portal + statistics' },
  { code: 'sigmaphi_portal', name: 'SigmaPhi Portal', parentCode: 'sigmaphi', description: 'Training/delegate/projects/exams SaaS' },
  { code: 'sigmaphi_statistics', name: 'SigmaPhi Statistics', parentCode: 'sigmaphi', description: 'Minitab alternative SaaS' },
];

const VERCEL_TEAM_SEEDS: { slug: string; displayName: string; notes?: string }[] = [
  { slug: 'pumpbots-projects', displayName: "PumpBot's projects", notes: 'Primary 2KO Africa Vercel team' },
  { slug: 'impart-global', displayName: "impartglobal's projects", notes: 'Impart Agency-related; some sites need owner mapping' },
];

export async function seedFoundational(): Promise<SeedResult> {
  const db = getDb();
  if (!db) return { divisions: 0, vercelTeams: 0, operators: 0, skipped: 'no_database' };

  let divInserted = 0;
  for (const d of DIVISION_SEEDS) {
    const result = await db
      .insert(divisions)
      .values({ code: d.code, name: d.name, description: d.description })
      .onConflictDoNothing({ target: divisions.code })
      .returning({ id: divisions.id });
    if (result.length > 0) divInserted++;
  }

  // Second pass to set parent FKs now that all divisions exist.
  for (const d of DIVISION_SEEDS) {
    if (!d.parentCode) continue;
    await db.execute(sql`
      update divisions
      set parent_division_id = (select id from divisions where code = ${d.parentCode})
      where code = ${d.code} and parent_division_id is null
    `);
  }

  let teamInserted = 0;
  for (const t of VERCEL_TEAM_SEEDS) {
    const result = await db
      .insert(vercelTeams)
      .values({ slug: t.slug, displayName: t.displayName, notes: t.notes })
      .onConflictDoNothing({ target: vercelTeams.slug })
      .returning({ id: vercelTeams.id });
    if (result.length > 0) teamInserted++;
  }

  // No default operators — the team adds themselves via Settings.
  return { divisions: divInserted, vercelTeams: teamInserted, operators: 0 };
}
