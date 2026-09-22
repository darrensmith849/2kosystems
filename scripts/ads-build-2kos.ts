/**
 * Build out the 2KOS Systems search campaign from docs/ads/2kosystems/*.csv.
 *
 *   node scripts/ads-build-2kos.ts            rehearse (validateOnly, changes nothing)
 *   node scripts/ads-build-2kos.ts --apply    actually write
 *
 * Only four of the five planned ad groups were missing — the CSV bulk upload
 * in August landed "Job cards" and then failed on the rest. This creates them
 * through the API instead, which avoids the two failure modes that upload had:
 * silently renaming an ad group to "Ad group 1", and rejecting whole rows over
 * an undocumented "EU political ads" column.
 *
 * The campaign stays PAUSED throughout. Nothing here starts spending.
 */
import { readFileSync } from "node:fs";
import { query, mutate } from "./ads-query.ts";

const CID = "351-600-6867";
const CAMPAIGN = "2KOS | Systems | Search | ZA";
const DIR = new URL("../docs/ads/2kosystems/", import.meta.url).pathname;
const APPLY = process.argv.includes("--apply");
/** The CSV says Max CPC 25; the one ad group that imported came in at R0.01. */
const CPC_MICROS = 25_000_000;

function csv(file: string): Record<string, string>[] {
  const text = readFileSync(DIR + file, "utf8").trim();
  const rows: string[][] = [];
  let cur: string[] = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  const head = rows.shift()!;
  return rows.filter((r) => r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

const MATCH: Record<string, string> = { Exact: "EXACT", Phrase: "PHRASE", Broad: "BROAD" };

const log = (s: string) => console.log(`  ${s}`);

// ── what exists now ────────────────────────────────────────────────────────
const existing = await query(
  CID,
  `SELECT campaign.resource_name, ad_group.resource_name, ad_group.name
   FROM ad_group WHERE campaign.name = '${CAMPAIGN}'`,
);
if (!existing.length) throw new Error(`Campaign "${CAMPAIGN}" has no ad groups — is the name right?`);

const campaignRn = (existing[0] as { campaign: { resourceName: string } }).campaign.resourceName;
const have = new Map(
  existing.map((r) => {
    const a = (r as { adGroup: { name: string; resourceName: string } }).adGroup;
    return [a.name, a.resourceName];
  }),
);
log(`campaign ${campaignRn}`);
log(`already present: ${[...have.keys()].join(", ")}`);

// ── 1. ad groups ───────────────────────────────────────────────────────────
const wanted = csv("2-ad-groups.csv").filter((r) => r.Campaign === CAMPAIGN);
const missing = wanted.filter((r) => !have.has(r["Ad Group"]));
log(`\nad groups to create: ${missing.length ? missing.map((m) => m["Ad Group"]).join(", ") : "none"}`);

if (missing.length) {
  const res = await mutate(CID, "adGroups", missing.map((r) => ({
    create: {
      name: r["Ad Group"],
      campaign: campaignRn,
      status: "ENABLED",
      type: "SEARCH_STANDARD",
      cpcBidMicros: String(CPC_MICROS),
    },
  })), !APPLY);
  res.results?.forEach((x, i) => have.set(missing[i]["Ad Group"], x.resourceName));
  log(`  ${APPLY ? "created" : "validated"} ${res.results?.length ?? 0}`);
}

// Bring the one that imported at R0.01 up to the planned bid.
if (APPLY && have.has("Job cards")) {
  await mutate(CID, "adGroups", [{
    update: { resourceName: have.get("Job cards"), cpcBidMicros: String(CPC_MICROS) },
    updateMask: "cpcBidMicros",
  }]);
  log(`  corrected Job cards bid to R${CPC_MICROS / 1e6}`);
}

if (!APPLY) {
  log("\n  Rehearsal only — nothing written. Re-run with --apply.");
  process.exit(0);
}

// ── 2. keywords ────────────────────────────────────────────────────────────
const newNames = new Set(missing.map((m) => m["Ad Group"]));
const kws = csv("3-keywords.csv").filter((r) => r.Campaign === CAMPAIGN && newNames.has(r["Ad Group"]));
log(`\nkeywords to add: ${kws.length}`);
if (kws.length) {
  const res = await mutate(CID, "adGroupCriteria", kws.map((r) => ({
    create: {
      adGroup: have.get(r["Ad Group"]),
      status: "ENABLED",
      keyword: { text: r.Keyword, matchType: MATCH[r["Match Type"]] ?? "EXACT" },
      finalUrls: r["Final URL"] ? [r["Final URL"]] : undefined,
    },
  })));
  log(`  added ${res.results?.length ?? 0}`);
}

// ── 3. responsive search ads ───────────────────────────────────────────────
const ads = csv("4-ads.csv").filter((r) => r.Campaign === CAMPAIGN && newNames.has(r["Ad Group"]));
log(`\nads to add: ${ads.length}`);
if (ads.length) {
  const res = await mutate(CID, "adGroupAds", ads.map((r) => {
    const headlines = Array.from({ length: 15 }, (_, i) => r[`Headline ${i + 1}`])
      .filter(Boolean).map((text) => ({ text }));
    const descriptions = Array.from({ length: 4 }, (_, i) => r[`Description ${i + 1}`])
      .filter(Boolean).map((text) => ({ text }));
    return {
      create: {
        adGroup: have.get(r["Ad Group"]),
        status: "ENABLED",
        ad: {
          finalUrls: [r["Final URL"]],
          responsiveSearchAd: {
            headlines,
            descriptions,
            path1: r["Path 1"] || undefined,
            path2: r["Path 2"] || undefined,
          },
        },
      },
    };
  }));
  log(`  added ${res.results?.length ?? 0}`);
}

log("\n  Done. The campaign is still PAUSED — nothing is spending.");
