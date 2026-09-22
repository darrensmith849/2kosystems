import { SITES, type DashboardSite } from "./sites";
import { accessToken, type ReportRow } from "./ga";

/**
 * Per-site drill-down.
 *
 * The overview answers "which sites are alive". This answers "what is
 * happening on one of them" — where the traffic comes from, what it lands on,
 * who it is, and what it searched to get here.
 *
 * Two batches rather than one: the Data API caps a batch at five reports and
 * this needs seven. They are issued in parallel, so it is one round trip's
 * latency, not two.
 */

const DATA = "https://analyticsdata.googleapis.com/v1beta";

export type Breakdown = { label: string; users: number };

export type SiteDetail = {
  site: DashboardSite;
  users28: number;
  engaged28: number;
  sessions28: number;
  daily: { date: string; users: number; engaged: number }[];
  age: Breakdown[];
  gender: Breakdown[];
  cities: Breakdown[];
  sources: Breakdown[];
  landing: Breakdown[];
  error: string | null;
};

export function siteByHost(host: string): DashboardSite | undefined {
  return SITES.find((s) => s.host === host);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type BatchResponse = { reports?: { rows?: ReportRow[] }[] };

/** Same transient-503 tolerance as the overview; the Data API needs it. */
async function batch(
  token: string,
  propertyId: string,
  requests: unknown[],
  attempt = 0,
): Promise<BatchResponse> {
  const res = await fetch(`${DATA}/properties/${propertyId}:batchRunReports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) {
    if (res.status >= 500 && attempt < 3) {
      await sleep(400 * 2 ** attempt);
      return batch(token, propertyId, requests, attempt + 1);
    }
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`${res.status} ${body?.error?.message ?? res.statusText}`);
  }
  return res.json();
}

const RANGE = [{ startDate: "28daysAgo", endDate: "today" }];

/** A one-dimension, activeUsers report — the shape most of these panels take. */
function byDimension(name: string, limit = 8) {
  return {
    dateRanges: RANGE,
    dimensions: [{ name }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit,
  };
}

function toBreakdown(rows: ReportRow[] | undefined): Breakdown[] {
  return (rows ?? []).map((r) => ({
    label: r.dimensionValues?.[0]?.value ?? "(not set)",
    users: Number(r.metricValues?.[0]?.value ?? 0),
  }));
}

export async function siteDetail(site: DashboardSite, token?: string): Promise<SiteDetail> {
  const blank: SiteDetail = {
    site,
    users28: 0, engaged28: 0, sessions28: 0,
    daily: [], age: [], gender: [], cities: [], sources: [], landing: [],
    error: null,
  };

  try {
    const t = token ?? (await accessToken());
    const [first, second] = await Promise.all([
      batch(t, site.id, [
        {
          dateRanges: RANGE,
          metrics: [
            { name: "activeUsers" },
            { name: "engagedSessions" },
            { name: "sessions" },
          ],
        },
        {
          dateRanges: RANGE,
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "engagedSessions" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 40,
        },
        // Age and gender need Google Signals on the property. Where it is off,
        // or the numbers are below Google's disclosure threshold, these come
        // back empty rather than erroring — the UI says so instead of
        // rendering a convincing blank chart.
        byDimension("userAgeBracket"),
        byDimension("userGender"),
        byDimension("city"),
      ]),
      batch(t, site.id, [
        byDimension("sessionSourceMedium", 10),
        byDimension("landingPage", 10),
      ]),
    ]);

    const [totals, daily, age, gender, cities] = first.reports ?? [];
    const [sources, landing] = second.reports ?? [];
    const m = totals?.rows?.[0]?.metricValues;

    return {
      ...blank,
      users28: Number(m?.[0]?.value ?? 0),
      engaged28: Number(m?.[1]?.value ?? 0),
      sessions28: Number(m?.[2]?.value ?? 0),
      daily: (daily?.rows ?? []).map((r) => ({
        date: r.dimensionValues?.[0]?.value ?? "",
        users: Number(r.metricValues?.[0]?.value ?? 0),
        engaged: Number(r.metricValues?.[1]?.value ?? 0),
      })),
      // "unknown" is most of the demographic rows on most properties. It is
      // not a cohort, so it does not belong in a chart of cohorts — but it is
      // the coverage figure, so the UI reports it separately.
      age: toBreakdown(age?.rows),
      gender: toBreakdown(gender?.rows),
      cities: toBreakdown(cities?.rows),
      sources: toBreakdown(sources?.rows),
      landing: toBreakdown(landing?.rows),
    };
  } catch (e) {
    return { ...blank, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Identified share of a demographic breakdown, and the cohorts without "unknown". */
export function split(rows: Breakdown[]) {
  const total = rows.reduce((a, r) => a + r.users, 0);
  const known = rows.filter((r) => r.label.toLowerCase() !== "unknown");
  const identified = known.reduce((a, r) => a + r.users, 0);
  return { known, identified, total, coverage: total ? identified / total : 0 };
}
