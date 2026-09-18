import { SITES, type DashboardSite } from "./sites";

/**
 * GA4 reporting for the internal dashboard.
 *
 * Runs on the Worker, so the refresh token is a Worker secret rather than
 * anything the browser sees. Credentials are the same OAuth client the Ads
 * scripts use, with the analytics.readonly scope added.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA = "https://analyticsdata.googleapis.com/v1beta";

export type SiteTraffic = DashboardSite & {
  users7: number;
  users28: number;
  users90: number;
  /**
   * Engaged sessions over 28 days. This is the number to trust. GA4 counts a
   * session as engaged after 10 seconds, a conversion, or a second pageview,
   * so an automated hit that loads one page and leaves scores nothing. When
   * sixsigmauk.com took 71,491 "users" in January 2026, 52 sessions engaged.
   */
  engaged28: number;
  /** Sessions over 28 days, the denominator for the engagement rate. */
  sessions28: number;
  /** Daily active users, oldest first, last 28 days — for the sparklines. */
  daily: number[];
  /** Daily engaged sessions over the same 28 days, oldest first. */
  dailyEngaged: number[];
  /** generate_lead events, 28 days. Zero where the site does not fire one. */
  leads: number;
  /** Null when the property could not be read, so the UI can say so rather
   *  than render a zero that looks like "no traffic". */
  error: string | null;
};

function credentials() {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

export function dashboardConfigured() {
  return credentials() !== null;
}

export async function accessToken(): Promise<string> {
  const c = credentials();
  if (!c) throw new Error("Analytics credentials are not set on this Worker.");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret,
      refresh_token: c.refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) {
    throw new Error(
      json.error === "invalid_grant"
        ? "The analytics refresh token was rejected — re-run npm run ga:auth and update the Worker secret."
        : `Token exchange failed: ${json.error ?? res.status}`,
    );
  }
  return json.access_token;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Only the parts of the Data API response this page reads. */
export type ReportRow = {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
};
type BatchResponse = { reports?: { rows?: ReportRow[] }[] };

/** The Data API returns transient 503s often enough to be the normal case. */
async function batch(token: string, propertyId: string, attempt = 0): Promise<BatchResponse> {
  const res = await fetch(`${DATA}/properties/${propertyId}:batchRunReports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    // One round trip per property instead of three. The Data API allows up to
    // five reports per batch and this page needs three.
    body: JSON.stringify({
      requests: [
        {
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today", name: "d7" },
            { startDate: "28daysAgo", endDate: "today", name: "d28" },
            { startDate: "90daysAgo", endDate: "today", name: "d90" },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "engagedSessions" },
            { name: "sessions" },
          ],
        },
        {
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "engagedSessions" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 40,
        },
        {
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: {
            filter: { fieldName: "eventName", stringFilter: { value: "generate_lead" } },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    if (res.status >= 500 && attempt < 3) {
      await sleep(400 * 2 ** attempt);
      return batch(token, propertyId, attempt + 1);
    }
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`${res.status} ${body?.error?.message ?? res.statusText}`);
  }
  return res.json();
}

/** Every site, queried in parallel. One failure does not lose the others. */
export async function trafficBySite(): Promise<{ token: string; sites: SiteTraffic[] }> {
  const token = await accessToken();
  const sites = await Promise.all(
    SITES.map(async (site): Promise<SiteTraffic> => {
      const blank = {
        ...site,
        users7: 0, users28: 0, users90: 0,
        engaged28: 0, sessions28: 0,
        daily: [] as number[], dailyEngaged: [] as number[],
        leads: 0,
      };
      try {
        const res = await batch(token, site.id);
        const [totals, byDate, leadRows] = res.reports ?? [];

        // Multiple date ranges come back as one row each, carrying a dateRange
        // dimension — and ordered by metric descending, not by range. Match on
        // the range name; row position lies.
        const t: Record<string, number> = { d7: 0, d28: 0, d90: 0 };
        let engaged28 = 0;
        let sessions28 = 0;
        for (const row of totals?.rows ?? []) {
          const name = row.dimensionValues?.[0]?.value;
          if (!name || !(name in t)) continue;
          t[name] = Number(row.metricValues?.[0]?.value ?? 0);
          if (name === "d28") {
            engaged28 = Number(row.metricValues?.[1]?.value ?? 0);
            sessions28 = Number(row.metricValues?.[2]?.value ?? 0);
          }
        }

        return {
          ...blank,
          users7: t.d7,
          users28: t.d28,
          users90: t.d90,
          engaged28,
          sessions28,
          daily: (byDate?.rows ?? []).map((r) => Number(r.metricValues?.[0]?.value ?? 0)),
          dailyEngaged: (byDate?.rows ?? []).map((r) => Number(r.metricValues?.[1]?.value ?? 0)),
          leads: Number(leadRows?.rows?.[0]?.metricValues?.[0]?.value ?? 0),
          error: null,
        };
      } catch (e) {
        return { ...blank, error: e instanceof Error ? e.message : String(e) };
      }
    }),
  );
  // Ranked on engaged sessions, not raw users. Ranking on users lets an
  // automated flood take the top of the table, which is exactly what
  // sixsigmauk.com did for three months.
  sites.sort((a, b) => b.engaged28 - a.engaged28);
  // The token is handed back so the Search Console calls reuse it rather than
  // doing a second exchange.
  return { token, sites };
}

/** Share of sessions GA4 considered engaged, 0–1. Null below any useful volume. */
export function engagementRate(s: SiteTraffic): number | null {
  if (s.error || s.sessions28 < 30) return null;
  return s.engaged28 / s.sessions28;
}

/**
 * Traffic shaped like automation rather than people: real volume, almost none
 * of it engaged. Healthy sites in this estate sit between 25% and 50%; the
 * sixsigmauk.com flood ran at 0.1% across 110,767 sessions.
 *
 * The floor on sessions matters — a quiet property can post a low rate on a
 * handful of visits without anything being wrong.
 */
export function looksAutomated(s: SiteTraffic): boolean {
  const rate = engagementRate(s);
  return rate !== null && s.sessions28 >= 300 && rate < 0.1;
}
