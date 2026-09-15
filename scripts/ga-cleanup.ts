/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Straighten out the GA4 estate: rename the properties that lie about what
 * they track, bin the duplicates that never received anything.
 *
 *   npm run ga:cleanup            show the plan, change nothing
 *   npm run ga:cleanup -- --apply carry it out
 *
 * Deliberately narrow. 24 properties have never received a hit, but most of
 * those are live sites that were never tagged — they want tagging, not
 * deleting. Only a property that has never seen a hit *and* has a live twin
 * for the same domain is listed here.
 *
 * Deletes are GA4 soft-deletes: the property goes to the account trash and is
 * recoverable for 35 days.
 */
import { readEnv } from "./env-file.ts";

const API = "https://analyticsadmin.googleapis.com/v1beta";
const APPLY = process.argv.includes("--apply");
// Renames and deletes are separable on purpose: a rename is reversible in a
// click, a delete needs the trash and a 35-day clock. --renames-only lets the
// reversible half proceed without also authorising the other.
const SKIP_DELETE = process.argv.includes("--renames-only");

/** Named for a domain it does not track. Renamed, and the stream URI corrected. */
const RENAME = [
  {
    id: "366743695",
    from: "2KO Africa - GA4",
    to: "i2KO / Six Sigma Johannesburg",
    uri: "https://www.i2ko.com",
    why: "stream claims 2ko.co.za; hits come from i2ko.com and sixsigmajohannesburg.co.za, and the name collides with the real 2koafrica.com property",
  },
  {
    id: "284740659",
    from: "http://www.sixsigmasouthafrica.co.za - GA4",
    to: "Six Sigma Certification (duplicate tag)",
    uri: "https://www.sixsigmacertification.co.za",
    why: "receives only sixsigmacertification.co.za, which is already tagged G-7EM76QCC22 — the site is double-tagged",
  },
];

/** Never received a hit, and another property for the same domain is live. */
const DELETE = [
  { id: "284730270", name: "Six Sigma South Africa - GA4", mid: "G-V1Z8XDLVBR", twin: "G-NLFDVKD836, 26,605 users/90d" },
  { id: "320088913", name: "SA Private Schools", mid: "G-DCFSW0MD8R", twin: "G-ZYWQKQ7W7T, 130,985 users/14mo" },
];

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
  if (!j.access_token) throw new Error(j.error === "invalid_grant" ? "refresh token rejected — run npm run ga:auth" : `token: ${j.error}`);
  return j.access_token as string;
}

async function api(path: string, init?: RequestInit) {
  const r = await fetch(`${API}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${j?.error?.message ?? r.statusText}`);
  return j;
}

async function main() {
  TOKEN = await token();

  console.log(APPLY ? "\n── applying ──\n" : "\n── plan (nothing will change; add --apply) ──\n");

  console.log("rename:");
  for (const r of RENAME) {
    // Read first: a property that has already been renamed should not be
    // reported as though this run did it.
    const now = await api(`properties/${r.id}`);
    if (now.displayName === r.to) { console.log(`  · ${r.to} — already done`); continue; }
    console.log(`  ${APPLY ? "→" : "·"} ${now.displayName}\n      to  ${r.to}\n      why ${r.why}`);
    if (!APPLY) continue;
    await api(`properties/${r.id}?updateMask=displayName`, { method: "PATCH", body: JSON.stringify({ displayName: r.to }) });
    const streams = (await api(`properties/${r.id}/dataStreams?pageSize=50`)).dataStreams ?? [];
    for (const s of streams.filter((s: any) => s.webStreamData)) {
      try {
        await api(`${s.name}?updateMask=webStreamData.defaultUri`, {
          method: "PATCH",
          body: JSON.stringify({ webStreamData: { defaultUri: r.uri } }),
        });
        console.log(`      stream uri → ${r.uri}`);
      } catch (e: any) {
        console.log(`      stream uri unchanged (${e.message})`);
      }
    }
  }

  if (SKIP_DELETE) {
    console.log("\ndelete: skipped (--renames-only). Still to remove:");
    for (const d of DELETE) console.log(`  · ${d.name} ${d.mid}`);
    console.log();
    return;
  }

  console.log("\ndelete (soft — recoverable from the account trash for 35 days):");
  for (const d of DELETE) {
    let now: any;
    try { now = await api(`properties/${d.id}`); }
    catch { console.log(`  · ${d.name} ${d.mid} — already gone`); continue; }
    console.log(`  ${APPLY ? "→" : "·"} ${now.displayName} ${d.mid}\n      keeping ${d.twin}`);
    if (APPLY) await api(`properties/${d.id}`, { method: "DELETE" });
  }

  console.log(APPLY ? "\n  Done. Re-run npm run ga:audit to confirm.\n" : "\n  Re-run with --apply to carry this out.\n");
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
