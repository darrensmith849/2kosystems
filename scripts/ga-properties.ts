/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google Analytics Admin — audit the estate, then fill the gaps.
 *
 *   npm run ga:audit                                  list everything, show gaps
 *   npm run ga:audit -- --create --account=6684600    create the missing ones
 *
 * Written after an afternoon of guessing wrong about this estate from the Ads
 * API side. Three similarly-named properties, two of them tracking nothing, and
 * the umbrella site tracking nowhere at all. This reads the Admin API directly
 * so the picture is what exists rather than what the names imply.
 *
 * Needs GOOGLE_ANALYTICS_REFRESH_TOKEN (npm run ga:auth) and the Google
 * Analytics Admin API enabled on the Cloud project.
 */
import { readEnv } from "./env-file.ts";

const API = "https://analyticsadmin.googleapis.com/v1beta";
const CREATE = process.argv.includes("--create");
const ACCOUNT = process.argv.find((a) => a.startsWith("--account="))?.split("=")[1];

/**
 * Every live property-worthy surface, and the hostname that proves it.
 * A domain is "covered" when some stream's defaultUri matches its host.
 */
const TARGETS: { host: string; property: string; stream: string; note: string }[] = [
  { host: "www.2ko.co.za", property: "2KO", stream: "2KO — umbrella site", note: "the group site; currently reports nowhere" },
  { host: "portal.sigmafy.co", property: "Sigmafy Portal", stream: "Sigmafy Portal", note: "the LMS and project platform" },
  { host: "tools.sigmafy.co", property: "Sigmafy Statistics", stream: "Sigmafy Statistics", note: "312-tool product; also serves stats.sigmafy.co" },
  { host: "www.sixsigmauk.com", property: "Six Sigma UK", stream: "Six Sigma UK", note: "live and untagged" },
];

const env = readEnv();
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
  if (!j.access_token) {
    throw new Error(
      j.error === "invalid_grant"
        ? "refresh token rejected — run npm run ga:auth"
        : `token: ${j.error_description ?? j.error}`,
    );
  }
  return j.access_token as string;
}

let TOKEN = "";
async function api(path: string, init?: RequestInit) {
  const r = await fetch(`${API}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const m = j?.error?.message ?? r.statusText;
    if (/SERVICE_DISABLED|has not been used/i.test(m)) {
      throw new Error("Google Analytics Admin API is not enabled on the Cloud project.\n    Enable it, wait a minute, and run this again.");
    }
    throw new Error(`${r.status} ${m}`);
  }
  return j;
}

const host = (u?: string) => { try { return new URL(u ?? "").host.replace(/^www\./, ""); } catch { return ""; } };

async function main() {
  if (!env.get("GOOGLE_ANALYTICS_REFRESH_TOKEN")) {
    console.error("\n  ✖ No GOOGLE_ANALYTICS_REFRESH_TOKEN. Run: npm run ga:auth\n");
    process.exit(1);
  }
  TOKEN = await token();

  const accounts = (await api("accounts")).accounts ?? [];
  console.log(`\n── accounts (${accounts.length}) ──`);
  for (const a of accounts) console.log(`  ${a.name.split("/")[1].padEnd(12)} ${a.displayName}`);

  const covered = new Map<string, string>();
  const all: { account: string; property: string; id: string; streams: any[] }[] = [];

  for (const a of accounts) {
    const props = (await api(`properties?filter=parent:${a.name}&pageSize=200`)).properties ?? [];
    for (const p of props) {
      const streams = (await api(`${p.name}/dataStreams?pageSize=200`)).dataStreams ?? [];
      all.push({ account: a.displayName, property: p.displayName, id: p.name.split("/")[1], streams });
      for (const s of streams) {
        const h = host(s.webStreamData?.defaultUri);
        if (h) covered.set(h, `${p.displayName} (${s.webStreamData?.measurementId ?? "?"})`);
      }
    }
  }

  console.log(`\n── properties (${all.length}) ──`);
  for (const p of all.sort((x, y) => x.account.localeCompare(y.account))) {
    const s = p.streams.map((x: any) =>
      `${host(x.webStreamData?.defaultUri) || "(no web stream)"} ${x.webStreamData?.measurementId ?? ""}`).join("; ");
    console.log(`  ${p.account.padEnd(20)} ${p.property.slice(0, 34).padEnd(35)} ${s || "— no streams —"}`);
  }

  const gaps = TARGETS.filter((t) => !covered.has(t.host.replace(/^www\./, "")));
  console.log(`\n── coverage ──`);
  for (const t of TARGETS) {
    const c = covered.get(t.host.replace(/^www\./, ""));
    console.log(`  ${c ? "✓" : "✗"} ${t.host.padEnd(28)} ${c ?? `MISSING — ${t.note}`}`);
  }

  if (!gaps.length) { console.log("\n  Nothing missing.\n"); return; }
  if (!CREATE) {
    console.log(`\n  ${gaps.length} to create. Re-run with:  npm run ga:audit -- --create --account=<id>\n`);
    return;
  }
  if (!ACCOUNT) { console.error("\n  ✖ --create needs --account=<id> from the list above.\n"); process.exit(1); }

  console.log(`\n── creating in account ${ACCOUNT} ──`);
  for (const t of gaps) {
    const prop = await api("properties", {
      method: "POST",
      body: JSON.stringify({
        parent: `accounts/${ACCOUNT}`,
        displayName: t.property,
        timeZone: "Africa/Johannesburg",
        currencyCode: "ZAR",
        industryCategory: "JOBS_AND_EDUCATION",
      }),
    });
    const stream = await api(`${prop.name}/dataStreams`, {
      method: "POST",
      body: JSON.stringify({
        displayName: t.stream,
        type: "WEB_DATA_STREAM",
        webStreamData: { defaultUri: `https://${t.host}` },
      }),
    });
    console.log(`  + ${t.property.padEnd(22)} ${stream.webStreamData.measurementId}   ${t.host}`);
  }
  console.log("\n  Set each measurement id on its site, then re-run the audit.\n");
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
