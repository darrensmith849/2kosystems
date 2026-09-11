/**
 * SixSigma: pause broad match, keep what it found.
 *
 *   node scripts/ads-kill-broad.ts            rehearse
 *   node scripts/ads-kill-broad.ts --apply    write
 *
 * Measured 29 Aug – 10 Sep, after 69 negatives were already in place:
 *
 *   BROAD   R4,084 spend ·  34 on-theme clicks · 96.2% of spend off-theme
 *   EXACT   R  404 spend ·  94 on-theme clicks · 18.5% off-theme
 *   PHRASE  R    4 spend ·   2 on-theme clicks ·  0.0% off-theme
 *
 * Broad was buying relevant visitors at R120 each while exact bought the same
 * kind of visitor at R3.70. Negatives could never fix it: the keywords are
 * fine ("lean six sigma certification"), and broad decides "online diploma
 * courses with certificates" is a near-enough match. It generates new variants
 * faster than anyone can block them.
 *
 * keyword_view returns negative criteria as well, and those are not
 * updateable (CANT_UPDATE_NEGATIVE), so they are filtered out.
 *
 * So: pause every broad keyword, and promote the on-theme searches broad did
 * find into exact keywords, which keeps the relevant traffic at 3% of the cost.
 */
import { readFileSync } from "node:fs";
import { query, mutate } from "./ads-query.ts";

const CID = "351-600-6867";
const CAMPAIGN = "SixSigma";
/** The ad group that already holds the exact/phrase set. */
const TARGET_AD_GROUP = "Six Sigma";
const APPLY = process.argv.includes("--apply");
const TERMS_JSON = process.argv.find((a) => a.endsWith(".json"));

const ON = /six ?sigma|lean|dmaic|black belt|green belt|yellow belt|white belt|belt certif|root cause|spc/i;
const log = (s: string) => console.log(`  ${s}`);

// ── 1. every enabled broad keyword ─────────────────────────────────────────
const broad = (await query(
  CID,
  `SELECT ad_group_criterion.resource_name, ad_group_criterion.keyword.text
   FROM keyword_view
   WHERE campaign.name = '${CAMPAIGN}'
     AND ad_group_criterion.status = 'ENABLED'
     AND ad_group_criterion.keyword.match_type = 'BROAD'
     AND ad_group_criterion.negative = FALSE`,
)).map((r) => (r as { adGroupCriterion: { resourceName: string; keyword: { text: string } } }).adGroupCriterion);
log(`broad keywords to pause: ${broad.length}`);

// ── 2. what exact/phrase already covers, so nothing is added twice ─────────
const covered = new Set(
  (await query(
    CID,
    `SELECT ad_group_criterion.keyword.text
     FROM keyword_view
     WHERE campaign.name = '${CAMPAIGN}'
       AND ad_group_criterion.keyword.match_type IN ('EXACT','PHRASE')`,
  )).map((r) =>
    (r as { adGroupCriterion: { keyword: { text: string } } }).adGroupCriterion.keyword.text.toLowerCase()),
);

// ── 3. the on-theme searches broad discovered ──────────────────────────────
if (!TERMS_JSON) throw new Error("pass the search-terms json as an argument");
const terms = JSON.parse(readFileSync(TERMS_JSON, "utf8")) as {
  searchTermView: { searchTerm: string };
  segments?: { keyword?: { info?: { matchType?: string } } };
}[];

const promote = [...new Set(
  terms
    .filter((t) => t.segments?.keyword?.info?.matchType === "BROAD")
    .map((t) => t.searchTermView.searchTerm.trim().toLowerCase())
    .filter((t) => ON.test(t) && !covered.has(t) && t.length <= 80),
)];
log(`on-theme searches to promote to exact: ${promote.length}`);

const ag = (await query(
  CID,
  `SELECT ad_group.resource_name FROM ad_group
   WHERE campaign.name = '${CAMPAIGN}' AND ad_group.name = '${TARGET_AD_GROUP}'`,
));
const agRn = (ag[0] as { adGroup: { resourceName: string } }).adGroup.resourceName;

if (!APPLY) {
  log(`\nwould pause ${broad.length} broad, add ${promote.length} exact to "${TARGET_AD_GROUP}"`);
  log("rehearsal only — re-run with --apply");
  process.exit(0);
}

// Promote first: never leave a window with no coverage at all.
for (let i = 0; i < promote.length; i += 100) {
  const batch = promote.slice(i, i + 100);
  await mutate(CID, "adGroupCriteria", batch.map((text) => ({
    create: { adGroup: agRn, status: "ENABLED", keyword: { text, matchType: "EXACT" } },
  })));
  log(`added ${batch.length} exact keywords`);
}

for (let i = 0; i < broad.length; i += 100) {
  const batch = broad.slice(i, i + 100);
  await mutate(CID, "adGroupCriteria", batch.map((c) => ({
    update: { resourceName: c.resourceName, status: "PAUSED" },
    updateMask: "status",
  })));
  log(`paused ${batch.length} broad keywords`);
}
log("\ndone");
