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
 * Networks that fetch a message's images on the recipient's behalf.
 *
 * Keyed on the autonomous system the request came from, because the user agent
 * is not reliable. A real Gmail delivery in this estate arrived as an ordinary
 * "Windows NT 10.0 … AppleWebKit" string from 74.125.217.32, which the old
 * user-agent check — looking for the literal "googleimageproxy" — did not
 * catch. It was recorded as a human open, which is the exact inflation this
 * function exists to prevent.
 *
 * Gmail deserves a word of its own. It proxies every remote image and fetches
 * them when the message arrives, not when anyone reads it, so for a Gmail
 * recipient a pixel hit means "Google received this" and nothing more. Twelve
 * of the last twenty-one enquiries here came from gmail.com, so for most leads
 * an open is simply not knowable. Treating those as proxy fetches undercounts
 * rather than overcounts, which is the only side of that error worth being on.
 *
 * Clicks are the signal to trust.
 */
const PROXY_ASNS = new Map<number, string>([
  [15169, "Google"],   // Gmail image proxy, and Gmail in a browser
  [396982, "Google"],  // Google Cloud, which the proxy also egresses from
  [714, "Apple"],      // Apple Mail Privacy Protection
  [6185, "Apple"],
  [36647, "Yahoo"],
  [26101, "Yahoo"],
  [8075, "Microsoft"], // Outlook and Exchange Online link and image prefetch
]);

/** The provider fetching on the recipient's behalf, or null if it looks like a person. */
export function proxyProvider(
  userAgent: string | null,
  ip: string | null,
  asn: number | null,
): string | null {
  if (asn !== null && PROXY_ASNS.has(asn)) return PROXY_ASNS.get(asn)!;

  const ua = (userAgent ?? "").toLowerCase();

  // No user agent at all is a fetcher, not a mail client.
  if (!ua) return "unknown fetcher";

  if (ua.includes("googleimageproxy")) return "Google";
  if (ua.includes("yahoomailproxy")) return "Yahoo";
  if (ua.includes("proofpoint")) return "Proofpoint";
  if (ua.includes("barracuda")) return "Barracuda";
  if (ua.includes("mimecast")) return "Mimecast";

  // Apple's relay presents as a plain Mac Safari-ish agent from Apple ranges.
  // Kept as a fallback for the case where the ASN is unavailable.
  if (
    ua.includes("macintosh") &&
    ua.includes("applewebkit") &&
    !ua.includes("mobile") &&
    (ip ?? "").startsWith("17.")
  ) {
    return "Apple";
  }

  return null;
}

/** Kept for callers that only need the yes/no. */
export function looksLikeProxy(
  userAgent: string | null,
  ip: string | null,
  asn: number | null = null,
): boolean {
  return proxyProvider(userAgent, ip, asn) !== null;
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
  /** The autonomous system the request came from, when the edge supplies it. */
  asn?: number | null;
  detail?: Record<string, unknown>;
}): Promise<void> {
  const db = database();
  if (!db) throw new NoDatabase();

  const at = args.occurredAt ?? new Date().toISOString();

  // Opens and clicks are both worth classifying. Outlook and Exchange Online
  // prefetch links to scan them, so a click can be a machine too — rarer than
  // a proxied open, and just as misleading when it is not marked.
  const provider =
    args.event === "open" || args.event === "click"
      ? proxyProvider(args.userAgent ?? null, args.ip ?? null, args.asn ?? null)
      : null;
  const proxy = provider !== null;

  // Which network it was, kept alongside the flag. A classification you cannot
  // audit later is one you end up arguing with rather than correcting — and
  // this detector has been wrong once already.
  const detail =
    provider || args.asn
      ? { ...(args.detail ?? {}), ...(provider ? { proxy_provider: provider } : {}), ...(args.asn ? { asn: args.asn } : {}) }
      : args.detail;

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
      proxy ? 1 : 0, detail ? JSON.stringify(detail) : null,
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

/**
 * The moment replies started being recorded against the enquiry that caused
 * them.
 *
 * Every enquiry older than this has no reply rows, and that is a gap in the
 * record rather than a gap in the service — the team answered them by email
 * like always, nothing was filing it. The dashboard has to say which of the two
 * it is looking at, because "no reply recorded" and "nobody replied" are very
 * different sentences to put in front of whoever reads this page.
 */
export const REPLIES_RECORDED_SINCE = "2026-09-20T03:43:45Z";

export type EnquiryReply = {
  enquiry_id: string;
  template: string | null;
  kind: string | null;
  to_address: string;
  sent_at: string;
  status: string;
  first_open_at: string | null;
  /** Opens with the machine fetches excluded. The number worth showing. */
  human_opens: number;
  first_click_at: string | null;
  /** Clicks with the link-scanner prefetches excluded. */
  human_clicks: number;
};

/**
 * Every reply sent for these enquiries, grouped by enquiry.
 *
 * One query for the whole page rather than one per row: a list of a hundred
 * enquiries should cost two round trips, not a hundred and one.
 */
export async function repliesForEnquiries(
  enquiryIds: string[],
): Promise<Map<string, EnquiryReply[]>> {
  const grouped = new Map<string, EnquiryReply[]>();
  if (enquiryIds.length === 0) return grouped;

  const db = database();
  if (!db) throw new NoDatabase();

  const placeholders = enquiryIds.map(() => "?").join(", ");
  const { results } = await db
    .prepare(
      // open_count on the message counts every pixel fetch, and Apple Mail
      // Privacy Protection and Gmail's proxy fetch images with no human
      // involved. Counting those as opens is how a dashboard ends up reporting
      // 93% and meaning nothing, so the machines are excluded here.
      `SELECT m.enquiry_id, m.template, m.kind, m.to_address, m.sent_at, m.status,
              m.first_open_at, m.first_click_at,
              (SELECT COUNT(*) FROM message_events ev
                WHERE ev.message_id = m.id
                  AND ev.event = 'open'
                  AND ev.likely_proxy = 0) AS human_opens,
              (SELECT COUNT(*) FROM message_events ev
                WHERE ev.message_id = m.id
                  AND ev.event = 'click'
                  AND ev.likely_proxy = 0) AS human_clicks
         FROM messages m
        WHERE m.enquiry_id IN (${placeholders})
        ORDER BY m.sent_at`,
    )
    .bind(...enquiryIds)
    .all<EnquiryReply>();

  for (const row of results ?? []) {
    const list = grouped.get(row.enquiry_id);
    if (list) list.push(row);
    else grouped.set(row.enquiry_id, [row]);
  }

  return grouped;
}
