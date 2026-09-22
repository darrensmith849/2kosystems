/**
 * Google Ads API — run a GAQL query against an account.
 *
 *   npm run ads:query -- <customer-id> "<GAQL>"
 *   npm run ads:query -- 351-600-6867 "SELECT campaign.name FROM campaign"
 *
 * Prints JSON on stdout so it can be piped, with progress on stderr. Dashes in
 * the customer id are stripped; login-customer-id is always the manager, which
 * is what lets one set of credentials reach every linked account.
 *
 * This is the read side the audit engine will sit on — src/lib/audit currently
 * parses CSVs exported by hand.
 */
import { readEnv } from "./env-file.ts";

const API = "https://googleads.googleapis.com/v25";

function die(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

/** Unwraps the real cause from the Ads API's generic error envelope. */
function explain(text: string): string {
  try {
    const j = JSON.parse(text) as {
      error?: { message?: string; details?: { errors?: { errorCode?: Record<string, string>; message?: string }[] }[] };
    };
    const inner = j.error?.details?.flatMap((d) => d.errors ?? []) ?? [];
    if (inner.length) {
      return inner
        .map((e) => `${Object.values(e.errorCode ?? {})[0] ?? "?"} — ${e.message ?? ""}`)
        .join("\n    ");
    }
    return j.error?.message ?? text.slice(0, 300);
  } catch {
    return `Not JSON — probably a wrong API version (${API}).`;
  }
}

export async function accessToken() {
  const env = readEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.get("GOOGLE_ADS_CLIENT_ID") ?? "",
      client_secret: env.get("GOOGLE_ADS_CLIENT_SECRET") ?? "",
      refresh_token: env.get("GOOGLE_ADS_REFRESH_TOKEN") ?? "",
      grant_type: "refresh_token",
    }),
  });
  const j = (await res.json()) as { access_token?: string; error_description?: string };
  if (!j.access_token) die(`Could not refresh the access token: ${j.error_description ?? "unknown"}`);
  return j.access_token;
}

/** Runs a GAQL query, following pagination to the end. */
export async function query(customerId: string, gaql: string) {
  const env = readEnv();
  const cid = customerId.replace(/\D/g, "");
  const token = await accessToken();
  const rows: Record<string, unknown>[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch(`${API}/customers/${cid}/googleAds:search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "developer-token": env.get("GOOGLE_ADS_DEVELOPER_TOKEN") ?? "",
        "login-customer-id": (env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID") ?? "").replace(/\D/g, ""),
        "Content-Type": "application/json",
      },
      // v25 rejects pageSize outright: PAGE_SIZE_NOT_SUPPORTED. The page is
      // fixed at 10,000 rows, so only the token matters.
      body: JSON.stringify(pageToken ? { query: gaql, pageToken } : { query: gaql }),
    });
    if (!res.ok) die(`Query failed (${res.status}) on ${customerId}.\n    ${explain(await res.text())}`);
    const page = (await res.json()) as { results?: Record<string, unknown>[]; nextPageToken?: string };
    rows.push(...(page.results ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return rows;
}

/**
 * POSTs a mutate request. `validateOnly` asks Google to check the payload and
 * change nothing, which is how every write here gets rehearsed first.
 */
export async function mutate(
  customerId: string,
  service: string,
  operations: unknown[],
  validateOnly = false,
) {
  const env = readEnv();
  const cid = customerId.replace(/\D/g, "");
  const token = await accessToken();
  const res = await fetch(`${API}/customers/${cid}/${service}:mutate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "developer-token": env.get("GOOGLE_ADS_DEVELOPER_TOKEN") ?? "",
      "login-customer-id": (env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID") ?? "").replace(/\D/g, ""),
      "Content-Type": "application/json",
    },
    // Not every mutate service accepts these. customConversionGoals rejects
    // partialFailure outright ("Cannot find field"), and false is the default
    // anyway — so send each flag only when it is actually doing something.
    body: JSON.stringify({ operations, ...(validateOnly ? { validateOnly: true } : {}) }),
  });
  if (!res.ok) die(`Mutate ${service} failed (${res.status}).\n    ${explain(await res.text())}`);
  return (await res.json()) as { results?: { resourceName: string }[] };
}

// CLI
if (process.argv[1]?.endsWith("ads-query.ts")) {
  const [cid, gaql] = process.argv.slice(2);
  if (!cid || !gaql) die('Usage: npm run ads:query -- <customer-id> "<GAQL>"');
  const rows = await query(cid, gaql);
  console.error(`  ${rows.length} rows`);
  console.log(JSON.stringify(rows, null, 2));
}
