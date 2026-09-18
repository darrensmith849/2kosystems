import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { EnquiryInput, EnquiryRow, EnquiryStatus } from "./schema";

/**
 * Reads and writes against the enquiries database.
 *
 * The D1 binding only exists at request time on the Worker, so it is fetched
 * per call rather than held in a module-level variable — a module scope is
 * shared across requests on Workers and caching a binding there is how you end
 * up serving one request's context to another.
 */

type D1 = {
  prepare: (sql: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
      all: <T>() => Promise<{ results: T[] }>;
    };
    first: <T>() => Promise<T | null>;
    all: <T>() => Promise<{ results: T[] }>;
  };
};

export function database(): D1 | null {
  try {
    const env = getCloudflareContext().env as unknown as { DB?: D1 };
    return env.DB ?? null;
  } catch {
    // No Cloudflare context — `next dev` without wrangler, or a build-time
    // render. Callers degrade rather than crash.
    return null;
  }
}

export class NoDatabase extends Error {
  constructor() {
    super("The enquiries database is not bound on this Worker.");
  }
}

const COLUMNS = [
  "id", "received_at", "site", "kind", "source_page",
  "name", "email", "phone", "company", "subject", "message",
  "course_topic", "course_mode", "delegates", "preferred_city", "industry",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "referrer", "country", "user_agent", "extra",
] as const;

/**
 * Store one enquiry. Returns the id, and whether it was already there.
 *
 * `INSERT OR IGNORE` against the (site, email, received_at) unique index makes
 * a retried POST idempotent within the same second, which is the realistic
 * duplicate: a double-clicked submit button or a network retry, not two
 * genuine enquiries.
 */
export async function insertEnquiry(
  e: EnquiryInput,
  receivedAt = new Date().toISOString(),
): Promise<{ id: string; duplicate: boolean }> {
  const db = database();
  if (!db) throw new NoDatabase();

  const id = crypto.randomUUID();
  const values = [
    id, receivedAt, e.site, e.kind, e.sourcePage ?? null,
    e.name ?? null, e.email ?? null, e.phone ?? null, e.company ?? null,
    e.subject ?? null, e.message ?? null,
    e.courseTopic ?? null, e.courseMode ?? null, e.delegates ?? null,
    e.preferredCity ?? null, e.industry ?? null,
    e.utm?.source ?? null, e.utm?.medium ?? null, e.utm?.campaign ?? null,
    e.utm?.term ?? null, e.utm?.content ?? null,
    e.referrer ?? null, e.country ?? null, e.userAgent ?? null,
    e.extra ? JSON.stringify(e.extra) : null,
  ];

  await db
    .prepare(
      `INSERT OR IGNORE INTO enquiries (${COLUMNS.join(", ")})
       VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    )
    .bind(...values)
    .run();

  // Which row won is the one carrying this second's timestamp for this sender.
  const row = await db
    .prepare(
      `SELECT id FROM enquiries
        WHERE site = ? AND received_at = ? AND (email IS ? OR email = ?)
        LIMIT 1`,
    )
    .bind(e.site, receivedAt, e.email ?? null, e.email ?? null)
    .first<{ id: string }>();

  return { id: row?.id ?? id, duplicate: !!row && row.id !== id };
}

export type EnquiryFilter = {
  site?: string;
  status?: EnquiryStatus;
  /** Days back from now. Omit for everything. */
  days?: number;
  limit?: number;
};

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export async function listEnquiries(f: EnquiryFilter = {}): Promise<EnquiryRow[]> {
  const db = database();
  if (!db) throw new NoDatabase();

  const where: string[] = [];
  const binds: unknown[] = [];
  if (f.site) { where.push("site = ?"); binds.push(f.site); }
  if (f.status) { where.push("status = ?"); binds.push(f.status); }
  if (f.days) { where.push("received_at >= ?"); binds.push(isoDaysAgo(f.days)); }

  const sql =
    `SELECT * FROM enquiries` +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    ` ORDER BY received_at DESC LIMIT ?`;
  binds.push(Math.min(f.limit ?? 100, 500));

  const { results } = await db.prepare(sql).bind(...binds).all<EnquiryRow>();
  return results ?? [];
}

export type EnquiryStats = {
  total: number;
  last7: number;
  last28: number;
  awaiting: number;
  bySite: { site: string; count: number }[];
  byKind: { kind: string; count: number }[];
  byCompany: { company: string; count: number }[];
  daily: { date: string; count: number }[];
};

/** Counts for the enquiries overview. One round trip per aggregate, in parallel. */
export async function enquiryStats(): Promise<EnquiryStats> {
  const db = database();
  if (!db) throw new NoDatabase();

  const count = async (sql: string, ...binds: unknown[]) => {
    const stmt = db.prepare(sql);
    const row = binds.length
      ? await stmt.bind(...binds).first<{ n: number }>()
      : await stmt.first<{ n: number }>();
    return row?.n ?? 0;
  };
  const rows = async <T>(sql: string, ...binds: unknown[]) => {
    const stmt = db.prepare(sql);
    const r = binds.length ? await stmt.bind(...binds).all<T>() : await stmt.all<T>();
    return r.results ?? [];
  };

  const [total, last7, last28, awaiting, bySite, byKind, byCompany, daily] = await Promise.all([
    count("SELECT COUNT(*) AS n FROM enquiries"),
    count("SELECT COUNT(*) AS n FROM enquiries WHERE received_at >= ?", isoDaysAgo(7)),
    count("SELECT COUNT(*) AS n FROM enquiries WHERE received_at >= ?", isoDaysAgo(28)),
    count("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'"),
    rows<{ site: string; count: number }>(
      `SELECT site, COUNT(*) AS count FROM enquiries WHERE received_at >= ?
        GROUP BY site ORDER BY count DESC`, isoDaysAgo(28)),
    rows<{ kind: string; count: number }>(
      `SELECT kind, COUNT(*) AS count FROM enquiries WHERE received_at >= ?
        GROUP BY kind ORDER BY count DESC`, isoDaysAgo(28)),
    // Self-reported on the form. GA4 has no firmographics and never will, so
    // this is the only company data in the estate.
    rows<{ company: string; count: number }>(
      `SELECT company, COUNT(*) AS count FROM enquiries
        WHERE company IS NOT NULL AND TRIM(company) <> '' AND received_at >= ?
        GROUP BY LOWER(company) ORDER BY count DESC LIMIT 12`, isoDaysAgo(90)),
    rows<{ date: string; count: number }>(
      `SELECT substr(received_at, 1, 10) AS date, COUNT(*) AS count FROM enquiries
        WHERE received_at >= ? GROUP BY date ORDER BY date`, isoDaysAgo(28)),
  ]);

  return { total, last7, last28, awaiting, bySite, byKind, byCompany, daily };
}
