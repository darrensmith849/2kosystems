/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Is this site reporting, right now?
 *
 *   npm run ga:realtime -- G-S7ZQBB3WHV
 *
 * The last mile of tagging a site. A measurement id in the page source only
 * proves the script is there; this proves Google received the hit. Takes the
 * measurement id because that is what you just pasted into the site — it
 * resolves the property itself rather than making you hunt for the number.
 */
import { readEnv } from "./env-file.ts";

const ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
const DATA = "https://analyticsdata.googleapis.com/v1beta";
const WANTED = process.argv.find((a) => /^G-[A-Z0-9]+$/i.test(a))?.toUpperCase();

const env = readEnv();
let TOKEN = "";

async function token() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.get("GOOGLE_ADS_CLIENT_ID")!,
      client_secret: env.get("GOOGLE_ADS_CLIENT_SECRET")!,
      refresh_token: env.get("GOOGLE_ANALYTICS_REFRESH_TOKEN")!,
      grant_type: "refresh_token",
    }).toString(),
  });
  const j: any = await r.json();
  if (!j.access_token) throw new Error("token refused — run npm run ga:auth");
  return j.access_token as string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The Data API returns a transient 503 often enough that a single one used to
 * abort the whole check — which reads as "the tag is not working" when the tag
 * is fine. Retry those; fail fast on anything that says the request is wrong.
 */
async function api(url: string, init?: RequestInit, attempt = 0): Promise<any> {
  const r = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const j: any = await r.json().catch(() => ({}));
  if (r.ok) return j;
  if (r.status >= 500 && attempt < 4) {
    await sleep(500 * 2 ** attempt);
    return api(url, init, attempt + 1);
  }
  throw new Error(`${r.status} ${j?.error?.message ?? r.statusText}`);
}

async function main() {
  if (!WANTED) { console.error("\n  Usage: npm run ga:realtime -- G-XXXXXXXXXX\n"); process.exit(1); }
  TOKEN = await token();

  let found: { id: string; name: string } | undefined;
  for (const a of (await api(`${ADMIN}/accounts`)).accounts ?? []) {
    for (const p of (await api(`${ADMIN}/properties?filter=parent:${a.name}&pageSize=200`)).properties ?? []) {
      const streams = (await api(`${ADMIN}/${p.name}/dataStreams?pageSize=200`)).dataStreams ?? [];
      if (streams.some((s: any) => s.webStreamData?.measurementId?.toUpperCase() === WANTED)) {
        found = { id: p.name.split("/")[1], name: p.displayName };
      }
    }
    if (found) break;
  }
  if (!found) { console.error(`\n  ✖ No property on this account has a stream for ${WANTED}.\n`); process.exit(1); }

  const rep = await api(`${DATA}/properties/${found.id}:runRealtimeReport`, {
    method: "POST",
    body: JSON.stringify({ dimensions: [{ name: "unifiedScreenName" }], metrics: [{ name: "activeUsers" }], limit: 10 }),
  });

  console.log(`\n  ${found.name}  ${WANTED}  (property ${found.id})`);
  if (!rep.rows?.length) {
    console.log(`\n  No active users right now. That is not yet a failure — open the site,\n  accept analytics if it asks, and try again within a minute.\n`);
    return;
  }
  console.log(`  active users in the last 30 minutes:\n`);
  for (const row of rep.rows) console.log(`    ${String(row.metricValues[0].value).padStart(5)}  ${row.dimensionValues[0].value}`);
  console.log();
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
