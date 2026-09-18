/**
 * Search Console reporting for the internal dashboard.
 *
 * Both properties are Domain properties, so the resource id is
 * `sc-domain:<host>` rather than a URL prefix — a URL-prefix id would return
 * 403 for these.
 */

const API = "https://searchconsole.googleapis.com/webmasters/v3";

/** One-click enable for the API on the `2ko-ads-api` project (41808878114). */
const ENABLE_URL =
  "https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=41808878114";

export type SearchSite = { host: string; label: string };

export const SEARCH_SITES: SearchSite[] = [
  { host: "sixsigmasouthafrica.co.za", label: "Six Sigma South Africa" },
  { host: "sixsigmauk.com", label: "Six Sigma UK" },
];

export type Query = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchSummary = {
  site: SearchSite;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Query[];
  /** Daily clicks, oldest first, for the sparkline. */
  daily: { date: string; clicks: number }[];
  error: string | null;
};

export function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

export async function query(
  token: string,
  host: string,
  body: Record<string, unknown>,
): Promise<{ rows?: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[] }> {
  const resource = encodeURIComponent(`sc-domain:${host}`);
  const res = await fetch(`${API}/sites/${resource}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    const msg = j?.error?.message ?? res.statusText;
    if (/insufficient authentication scopes|ACCESS_TOKEN_SCOPE/i.test(msg)) {
      throw new Error("Token lacks webmasters.readonly — re-run npm run ga:auth, then npm run cf:secrets.");
    }
    if (/has not been used|SERVICE_DISABLED/i.test(msg)) {
      // Google's own message carries the enable link; keep it, the panel turns
      // any trailing URL into a link so this is one click from here.
      throw new Error(
        "Search Console API is not enabled on the Cloud project. " +
          `Enable it: ${ENABLE_URL}`,
      );
    }
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export async function searchBySite(token: string, days = 28): Promise<SearchSummary[]> {
  // Search Console data lags ~2 days; asking for today returns a short week.
  const startDate = isoDaysAgo(days + 2);
  const endDate = isoDaysAgo(2);

  return Promise.all(
    SEARCH_SITES.map(async (site): Promise<SearchSummary> => {
      const empty = {
        site, clicks: 0, impressions: 0, ctr: 0, position: 0,
        topQueries: [] as Query[], daily: [] as { date: string; clicks: number }[],
      };
      try {
        const [totals, queries, byDate] = await Promise.all([
          query(token, site.host, { startDate, endDate, dimensions: [] }),
          query(token, site.host, { startDate, endDate, dimensions: ["query"], rowLimit: 10 }),
          query(token, site.host, { startDate, endDate, dimensions: ["date"], rowLimit: 90 }),
        ]);
        const t = totals.rows?.[0];
        return {
          ...empty,
          clicks: Math.round(t?.clicks ?? 0),
          impressions: Math.round(t?.impressions ?? 0),
          ctr: t?.ctr ?? 0,
          position: t?.position ?? 0,
          topQueries: (queries.rows ?? []).map((r) => ({
            query: r.keys?.[0] ?? "",
            clicks: Math.round(r.clicks),
            impressions: Math.round(r.impressions),
            ctr: r.ctr,
            position: r.position,
          })),
          daily: (byDate.rows ?? [])
            .map((r) => ({ date: r.keys?.[0] ?? "", clicks: Math.round(r.clicks) }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          error: null,
        };
      } catch (e) {
        return { ...empty, error: e instanceof Error ? e.message : String(e) };
      }
    }),
  );
}

/** A site the estate owns in Search Console. Anything else has no query data. */
export function searchSiteFor(host: string): SearchSite | undefined {
  return SEARCH_SITES.find((s) => s.host === host);
}

export type SearchDetail = {
  site: SearchSite;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  queries: Query[];
  pages: Query[];
  countries: Query[];
  /** Daily clicks, impressions and position over the window, oldest first. */
  daily: { date: string; clicks: number; impressions: number; position: number }[];
  error: string | null;
};

/**
 * The full search picture for one site, over a longer window than the overview
 * uses. 90 days rather than 28, because a position trend needs enough points
 * to show a direction rather than a wobble.
 */
export async function searchDetail(
  token: string,
  site: SearchSite,
  days = 90,
): Promise<SearchDetail> {
  const startDate = isoDaysAgo(days + 2);
  const endDate = isoDaysAgo(2);
  const base = { startDate, endDate };
  const empty: SearchDetail = {
    site, clicks: 0, impressions: 0, ctr: 0, position: 0,
    queries: [], pages: [], countries: [], daily: [], error: null,
  };

  try {
    const [totals, queries, pages, countries, byDate] = await Promise.all([
      query(token, site.host, { ...base, dimensions: [] }),
      query(token, site.host, { ...base, dimensions: ["query"], rowLimit: 25 }),
      query(token, site.host, { ...base, dimensions: ["page"], rowLimit: 15 }),
      query(token, site.host, { ...base, dimensions: ["country"], rowLimit: 8 }),
      query(token, site.host, { ...base, dimensions: ["date"], rowLimit: 100 }),
    ]);

    const t = totals.rows?.[0];
    const asQuery = (rows: typeof queries.rows): Query[] =>
      (rows ?? []).map((r) => ({
        query: r.keys?.[0] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      }));

    return {
      ...empty,
      clicks: t?.clicks ?? 0,
      impressions: t?.impressions ?? 0,
      ctr: t?.ctr ?? 0,
      position: t?.position ?? 0,
      queries: asQuery(queries.rows),
      pages: asQuery(pages.rows),
      countries: asQuery(countries.rows),
      daily: (byDate.rows ?? []).map((r) => ({
        date: r.keys?.[0] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
      })),
    };
  } catch (e) {
    return { ...empty, error: e instanceof Error ? e.message : String(e) };
  }
}
