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

async function accessToken(): Promise<string> {
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

/** The Data API returns transient 503s often enough to be the normal case. */
async function report(token: string, propertyId: string, attempt = 0): Promise<number[]> {
  const res = await fetch(`${DATA}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [
        { startDate: "7daysAgo", endDate: "today", name: "d7" },
        { startDate: "28daysAgo", endDate: "today", name: "d28" },
        { startDate: "90daysAgo", endDate: "today", name: "d90" },
      ],
      metrics: [{ name: "activeUsers" }],
    }),
  });

  if (!res.ok) {
    if (res.status >= 500 && attempt < 3) {
      await sleep(400 * 2 ** attempt);
      return report(token, propertyId, attempt + 1);
    }
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`${res.status} ${body?.error?.message ?? res.statusText}`);
  }

  const json = (await res.json()) as {
    rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  };

  // Multiple date ranges come back as one row each, carrying a dateRange
  // dimension — and ordered by metric descending, not by range. Match on the
  // range name; row position lies.
  const out = [0, 0, 0];
  for (const row of json.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value;
    const n = Number(row.metricValues?.[0]?.value ?? 0);
    if (name === "d7") out[0] = n;
    else if (name === "d28") out[1] = n;
    else if (name === "d90") out[2] = n;
  }
  return out;
}

/** Every site, queried in parallel. One failure does not lose the others. */
export async function trafficBySite(): Promise<SiteTraffic[]> {
  const token = await accessToken();
  const rows = await Promise.all(
    SITES.map(async (site): Promise<SiteTraffic> => {
      try {
        const [users7, users28, users90] = await report(token, site.id);
        return { ...site, users7, users28, users90, error: null };
      } catch (e) {
        return {
          ...site,
          users7: 0,
          users28: 0,
          users90: 0,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }),
  );
  return rows.sort((a, b) => b.users28 - a.users28);
}
