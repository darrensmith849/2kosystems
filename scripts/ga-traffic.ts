/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Which GA4 properties are actually receiving data.
 *
 *   npm run ga:traffic
 *
 * The estate has 56 properties and a lot of near-duplicate names — three for
 * sixsigmasouthafrica.co.za alone. The Admin API lists what was configured,
 * which is not the same question as what is reporting, and reading the first
 * as the second is how the umbrella site looked covered while tracking nothing.
 * This asks the Data API for 90 days of users per property and sorts by it.
 */
import { readEnv } from "./env-file.ts";

const ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
const DATA = "https://analyticsdata.googleapis.com/v1beta";

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
  if (!j.access_token) throw new Error(j.error === "invalid_grant" ? "refresh token rejected — run npm run ga:auth" : `token: ${j.error_description ?? j.error}`);
  return j.access_token as string;
}

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const m = j?.error?.message ?? r.statusText;
    const act = j?.error?.details?.find((d: any) => d.metadata?.activationUrl)?.metadata;
    if (act) throw new Error(`${act.serviceTitle} is not enabled.\n    Enable: ${act.activationUrl}`);
    throw new Error(`${r.status} ${m}`);
  }
  return j;
}

const host = (u?: string) => { try { return new URL(u ?? "").host.replace(/^www\./, ""); } catch { return ""; } };

async function main() {
  TOKEN = await token();
  const accounts = (await api(`${ADMIN}/accounts`)).accounts ?? [];

  const rows: { acct: string; name: string; id: string; hosts: string; mid: string }[] = [];
  for (const a of accounts) {
    for (const p of (await api(`${ADMIN}/properties?filter=parent:${a.name}&pageSize=200`)).properties ?? []) {
      const streams = (await api(`${ADMIN}/${p.name}/dataStreams?pageSize=200`)).dataStreams ?? [];
      rows.push({
        acct: a.displayName,
        name: p.displayName,
        id: p.name.split("/")[1],
        hosts: streams.map((s: any) => host(s.webStreamData?.defaultUri)).filter(Boolean).join(",") || "—",
        mid: streams.map((s: any) => s.webStreamData?.measurementId).filter(Boolean).join(",") || "—",
      });
    }
  }

  console.log(`\n  Asking ${rows.length} properties for 90 days of traffic…\n`);
  const out: (typeof rows[0] & { users: number; sessions: number })[] = [];
  let refusal: string | undefined;
  for (const r of rows) {
    let users = 0, sessions = 0;
    try {
      const rep = await api(`${DATA}/properties/${r.id}:runReport`, {
        method: "POST",
        body: JSON.stringify({
          dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        }),
      });
      users = Number(rep.rows?.[0]?.metricValues?.[0]?.value ?? 0);
      sessions = Number(rep.rows?.[0]?.metricValues?.[1]?.value ?? 0);
    } catch (e: any) {
      if (/not enabled/.test(e.message)) throw e;
      users = -1; // property exists but the report was refused
      refusal ??= e.message;
    }
    out.push({ ...r, users, sessions });
  }

  out.sort((a, b) => b.users - a.users);
  const live = out.filter((r) => r.users > 0);
  const dead = out.filter((r) => r.users === 0);

  console.log(`── receiving data (${live.length}) ──`);
  for (const r of live)
    console.log(`  ${String(r.users).padStart(7)} users ${String(r.sessions).padStart(7)} sess  ${r.hosts.slice(0, 30).padEnd(31)} ${r.mid.padEnd(16)} ${r.acct}`);

  console.log(`\n── silent, last 90 days (${dead.length}) ──`);
  for (const r of dead)
    console.log(`  ${r.hosts.slice(0, 30).padEnd(31)} ${r.mid.padEnd(16)} ${r.name.slice(0, 32).padEnd(33)} ${r.acct}`);

  const err = out.filter((r) => r.users < 0);
  if (err.length) {
    console.log(`\n── report refused (${err.length}) ──`);
    console.log(`  ${refusal}`);
    if (err.length < out.length) console.log(err.map((r) => `  ${r.name} (${r.id})`).join("\n"));
  }
  console.log();
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
