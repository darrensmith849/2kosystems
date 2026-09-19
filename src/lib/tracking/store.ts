import { database, NoDatabase } from "@/lib/enquiries/store";

/**
 * Writes and reads for the message ledger.
 *
 * Reuses the D1 binding helper from the enquiries store — same database, and
 * fetching the binding per call rather than caching it in module scope, which
 * is shared across requests on Workers.
 */

export type MessageInput = {
  id: string;
  site: string;
  provider: "cloudflare" | "brevo" | "other";
  providerId?: string;
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  subject?: string;
  template?: string;
  kind?: "transactional" | "notification" | "marketing";
  enquiryId?: string;
  contactEmail?: string;
  status?: "sent" | "delivered" | "bounced" | "failed" | "complained";
  failedReason?: string;
  meta?: Record<string, unknown>;
};

export type MessageEvent =
  | "sent" | "delivered" | "open" | "click"
  | "bounce" | "complaint" | "unsubscribe" | "failed";

export type EventSource = "pixel" | "redirect" | "cloudflare" | "brevo";

/**
 * Apple Mail Privacy Protection and Gmail's image proxy fetch remote images
 * without a human involved, so a pixel hit is not an open. Flagged at write
 * time so the dashboard can report the honest number rather than re-deriving
 * a guess from user agents later.
 */
export function looksLikeProxy(userAgent: string | null, ip: string | null): boolean {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return true; // no UA at all is a fetcher, not a mail client
  return (
    ua.includes("googleimageproxy") ||
    ua.includes("yahoomailproxy") ||
    ua.includes("proofpoint") ||
    ua.includes("barracuda") ||
    ua.includes("mimecast") ||
    // Apple's relay presents as a plain Mac Safari-ish agent from Apple ranges.
    (ua.includes("macintosh") && ua.includes("applewebkit") && !ua.includes("mobile") && (ip ?? "").startsWith("17."))
  );
}

export async function recordMessage(m: MessageInput, sentAt = new Date().toISOString()): Promise<void> {
  const db = database();
  if (!db) throw new NoDatabase();

  await db
    .prepare(
      `INSERT OR IGNORE INTO messages (
         id, sent_at, site, provider, provider_id, from_address, from_name,
         to_address, subject, template, kind, enquiry_id, contact_email,
         status, failed_reason, meta
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      m.id, sentAt, m.site, m.provider, m.providerId ?? null,
      m.fromAddress, m.fromName ?? null, m.toAddress, m.subject ?? null,
      m.template ?? null, m.kind ?? "transactional",
      m.enquiryId ?? null, m.contactEmail ?? null,
      m.status ?? "sent", m.failedReason ?? null,
      m.meta ? JSON.stringify(m.meta) : null,
    )
    .run();
}

/**
 * Append an event and roll it up onto the message.
 *
 * The counters on `messages` are the reason a list view is one query rather
 * than a join over every event ever recorded.
 */
export async function recordEvent(args: {
  messageId: string;
  event: MessageEvent;
  source: EventSource;
  occurredAt?: string;
  url?: string;
  ip?: string | null;
  userAgent?: string | null;
  detail?: Record<string, unknown>;
}): Promise<void> {
  const db = database();
  if (!db) throw new NoDatabase();

  const at = args.occurredAt ?? new Date().toISOString();
  const proxy = args.event === "open" && looksLikeProxy(args.userAgent ?? null, args.ip ?? null);

  // Only for a message we actually sent. The pixel URL is public by
  // construction — it sits in the HTML of every email — so without this guard
  // anyone could fill the ledger with events for invented ids by requesting
  // /e/o/<anything>.gif. INSERT...SELECT...WHERE EXISTS keeps it to one
  // statement rather than a read followed by a write.
  await db
    .prepare(
      `INSERT INTO message_events (
         id, message_id, event, source, occurred_at, url, ip, user_agent, likely_proxy, detail
       )
       SELECT ?,?,?,?,?,?,?,?,?,?
        WHERE EXISTS (SELECT 1 FROM messages WHERE id = ?)`,
    )
    .bind(
      crypto.randomUUID(), args.messageId, args.event, args.source, at,
      args.url ?? null, args.ip ?? null, args.userAgent ?? null,
      proxy ? 1 : 0, args.detail ? JSON.stringify(args.detail) : null,
      args.messageId,
    )
    .run();

  // Roll up. COALESCE on the first_* columns keeps the earliest, which is the
  // one that answers "when did this land".
  const rollups: Record<string, string> = {
    open: `UPDATE messages SET open_count = open_count + 1,
             first_open_at = COALESCE(first_open_at, ?) WHERE id = ?`,
    click: `UPDATE messages SET click_count = click_count + 1,
             first_click_at = COALESCE(first_click_at, ?) WHERE id = ?`,
    delivered: `UPDATE messages SET status = 'delivered',
             delivered_at = COALESCE(delivered_at, ?) WHERE id = ?`,
  };

  if (rollups[args.event]) {
    await db.prepare(rollups[args.event]).bind(at, args.messageId).run();
  } else if (args.event === "bounce" || args.event === "failed") {
    await db
      .prepare(`UPDATE messages SET status = ?, failed_reason = COALESCE(failed_reason, ?) WHERE id = ?`)
      .bind(args.event === "bounce" ? "bounced" : "failed", args.url ?? null, args.messageId)
      .run();
  } else if (args.event === "complaint") {
    await db.prepare(`UPDATE messages SET status = 'complained' WHERE id = ?`).bind(args.messageId).run();
  }
}

export type MessageRow = {
  id: string;
  sent_at: string;
  site: string;
  provider: string;
  from_address: string;
  to_address: string;
  subject: string | null;
  template: string | null;
  kind: string | null;
  status: string;
  delivered_at: string | null;
  first_open_at: string | null;
  open_count: number;
  first_click_at: string | null;
  click_count: number;
};

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

export async function listMessages(
  f: { site?: string; days?: number; limit?: number } = {},
): Promise<MessageRow[]> {
  const db = database();
  if (!db) throw new NoDatabase();

  const where: string[] = [];
  const binds: unknown[] = [];
  if (f.site) { where.push("site = ?"); binds.push(f.site); }
  if (f.days) { where.push("sent_at >= ?"); binds.push(isoDaysAgo(f.days)); }

  const sql =
    `SELECT id, sent_at, site, provider, from_address, to_address, subject, template,
            kind, status, delivered_at, first_open_at, open_count, first_click_at, click_count
       FROM messages` +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    ` ORDER BY sent_at DESC LIMIT ?`;
  binds.push(Math.min(f.limit ?? 100, 500));

  const { results } = await db.prepare(sql).bind(...binds).all<MessageRow>();
  return results ?? [];
}

export type MessageStats = {
  sent: number;
  delivered: number;
  bounced: number;
  /** Opens excluding machine fetches — the number worth showing. */
  humanOpens: number;
  proxyOpens: number;
  clicks: number;
  bySite: { site: string; count: number }[];
  byTemplate: { template: string; count: number; clicks: number }[];
};

export async function messageStats(days = 28): Promise<MessageStats> {
  const db = database();
  if (!db) throw new NoDatabase();
  const since = isoDaysAgo(days);

  const one = async (sql: string, ...b: unknown[]) => {
    const r = await db.prepare(sql).bind(...b).first<{ n: number }>();
    return r?.n ?? 0;
  };
  const many = async <T>(sql: string, ...b: unknown[]) => {
    const r = await db.prepare(sql).bind(...b).all<T>();
    return r.results ?? [];
  };

  const [sent, delivered, bounced, humanOpens, proxyOpens, clicks, bySite, byTemplate] =
    await Promise.all([
      one(`SELECT COUNT(*) AS n FROM messages WHERE sent_at >= ?`, since),
      one(`SELECT COUNT(*) AS n FROM messages WHERE sent_at >= ? AND delivered_at IS NOT NULL`, since),
      one(`SELECT COUNT(*) AS n FROM messages WHERE sent_at >= ? AND status IN ('bounced','failed')`, since),
      one(`SELECT COUNT(DISTINCT message_id) AS n FROM message_events
            WHERE event='open' AND likely_proxy=0 AND occurred_at >= ?`, since),
      one(`SELECT COUNT(DISTINCT message_id) AS n FROM message_events
            WHERE event='open' AND likely_proxy=1 AND occurred_at >= ?`, since),
      one(`SELECT COUNT(DISTINCT message_id) AS n FROM message_events
            WHERE event='click' AND occurred_at >= ?`, since),
      many<{ site: string; count: number }>(
        `SELECT site, COUNT(*) AS count FROM messages WHERE sent_at >= ?
          GROUP BY site ORDER BY count DESC`, since),
      many<{ template: string; count: number; clicks: number }>(
        `SELECT COALESCE(template,'(untitled)') AS template, COUNT(*) AS count,
                SUM(CASE WHEN click_count > 0 THEN 1 ELSE 0 END) AS clicks
           FROM messages WHERE sent_at >= ?
          GROUP BY template ORDER BY count DESC LIMIT 12`, since),
    ]);

  return { sent, delivered, bounced, humanOpens, proxyOpens, clicks, bySite, byTemplate };
}
