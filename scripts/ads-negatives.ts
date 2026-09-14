/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google Ads — shared negative keyword lists for the Six Sigma account.
 *
 *   npm run ads:negatives -- --apply     (omit --apply for a dry run)
 *
 * Built from the full 30-day search-term report, not a sample: 1,129 unique
 * terms carrying R8,789 of attributable spend, of which R8,037 (91.4%) never
 * mentioned Six Sigma, Lean, a belt or any related method.
 *
 * The lists are deliberately narrow. A phrase negative on "online courses"
 * would have caught most of the waste — and also "six sigma online courses",
 * which is exactly the query worth paying for. Everything here is either a
 * competitor's brand or a qualification 2KO does not sell.
 */
import { query, mutate } from "./ads-query.ts";

const CID = "3516006867";
const APPLY = process.argv.includes("--apply");

/** Rival training providers. Someone searching these wants them, not you. */
const COMPETITOR_BRANDS = [
  "iq academy", "mancosa", "rosebank college", "knowledge academy",
  "alison", "lusatech", "damelin", "boston city campus", "unisa",
  "skills academy", "oxbridge academy", "regenesys", "milpark",
];

/** Qualifications and funding routes 2KO does not offer. */
const GENERIC_EDUCATION = [
  "learnership", "learnerships", "tvet", "bursary", "bursaries",
  "matric", "nqf", "prospectus", "college", "diploma courses",
  "online diploma", "education and training courses",
  "courses with certificates", "courses with certificate",
  "course with certificate", "study courses", "courses application",
  "distance learning", "part time studies", "apply online",
];

const LISTS = [
  { name: "Competitor brands", terms: COMPETITOR_BRANDS },
  { name: "Generic education", terms: GENERIC_EDUCATION },
];

async function main() {
  console.log(`\n  ${APPLY ? "APPLYING" : "DRY RUN — pass --apply to write"}\n`);

  const existing = (await query(
    CID,
    `SELECT shared_set.id, shared_set.name, shared_set.type
     FROM shared_set WHERE shared_set.status != 'REMOVED'`,
  )) as any[];
  const byName = new Map(existing.map((r) => [r.sharedSet.name, r.sharedSet.id]));
  console.log(`  existing shared sets: ${existing.length ? existing.map((r) => r.sharedSet.name).join(", ") : "none"}`);

  const enabled = (await query(
    CID,
    `SELECT campaign.id, campaign.name FROM campaign WHERE campaign.status = 'ENABLED'`,
  )) as any[];
  console.log(`  enabled campaigns: ${enabled.map((r) => r.campaign.name).join(", ")}\n`);

  for (const list of LISTS) {
    let setId = byName.get(list.name);

    if (!setId) {
      const res = (await mutate(
        CID,
        "sharedSets",
        [{ create: { name: list.name, type: "NEGATIVE_KEYWORDS" } }],
        !APPLY,
      )) as any;
      setId = res?.results?.[0]?.resourceName?.split("/").pop();
      console.log(`  + shared set "${list.name}"${setId ? ` (${setId})` : " (validated)"}`);
    } else {
      console.log(`  = shared set "${list.name}" already exists (${setId})`);
    }

    if (!setId) {
      console.log(`    ${list.terms.length} negatives validated, not written\n`);
      continue;
    }

    const ops = list.terms.map((text) => ({
      create: {
        sharedSet: `customers/${CID}/sharedSets/${setId}`,
        keyword: { text, matchType: "PHRASE" },
      },
    }));
    await mutate(CID, "sharedCriteria", ops, !APPLY);
    console.log(`    ${list.terms.length} phrase negatives`);

    for (const c of enabled) {
      await mutate(
        CID,
        "campaignSharedSets",
        [{ create: { campaign: `customers/${CID}/campaigns/${c.campaign.id}`, sharedSet: `customers/${CID}/sharedSets/${setId}` } }],
        !APPLY,
      ).catch((e: Error) => console.log(`    ! ${c.campaign.name}: ${e.message.slice(0, 90)}`));
      console.log(`    → attached to ${c.campaign.name}`);
    }
    console.log();
  }
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
