/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google Ads — the interim Six Sigma South Africa search structure.
 *
 *   npm run ads:build-sssa -- --apply      (omit --apply for a dry run)
 *
 * Four campaigns, built in full, enabled in tranches. Three go live; the belts
 * that carry a project requirement are created PAUSED and stay that way until
 * project completion improves — advertising a course that 92% of delegates do
 * not finish is a reputational bill, not a marketing win.
 *
 * Three things this deliberately does differently from the campaign it replaces:
 *
 *   targetContentNetwork: false     the legacy SixSigma campaign had Display on
 *                                   by default and it took 88% of the budget.
 *   exact + phrase only             no broad. The search-term report is why.
 *   campaign-level custom goal      keeps Six Sigma reporting separate from
 *                                   2KO Systems inside one shared account.
 *
 * Ad copy is taken from the live course pages, not invented. Every accreditation
 * claim ("internationally accredited", CSSC) appears on the page it links to.
 */
import { query, mutate } from "./ads-query.ts";

const CID = "3516006867";
const APPLY = process.argv.includes("--apply");
const SITE = "https://www.sixsigmasouthafrica.co.za";

/** South Africa; English. */
const GEO_ZA = "2710";
const LANG_EN = "1000";
/** The custom goal that keeps SSSA conversions out of 2KO Systems reporting. */
const SSSA_GOAL = "6459037110";
const NEGATIVE_SETS = ["12233524383", "12235115434"]; // Generic education, Competitor brands

type Group = { name: string; url: string; exact: string[]; phrase: string[]; heads: string[]; descs: string[] };
type Camp = { name: string; status: "ENABLED" | "PAUSED"; daily: number; ceiling: number; groups: Group[] };

const ACCRED = "Internationally accredited Six Sigma certification from the CSSC.";
const VENUES = "Instructor-led in Johannesburg, Cape Town, Durban, Pretoria and PE.";
const ONSITE = "Or delivered on-site at your workplace, anywhere in South Africa.";

const CAMPAIGNS: Camp[] = [
  {
    name: "SSSA | Brand | Search | ZA", status: "ENABLED", daily: 30, ceiling: 8,
    groups: [{
      name: "Brand", url: `${SITE}/`,
      exact: ["six sigma south africa", "sixsigma south africa", "six sigma sa", "six sigma south africa courses"],
      phrase: ["six sigma south africa"],
      // No phone number in ad text — Google treats that as PROHIBITED
      // (PHONE_NUMBER_IN_AD_TEXT). It belongs in a call asset instead.
      // "Since 1998" is also out: the claim register marks it needs-evidence.
      heads: ["Six Sigma South Africa", "The Official Site", "CSSC Accredited Training", "Internationally Accredited",
              "Six Sigma Training in SA", "Accredited by the CSSC", "Classroom, Virtual or Online", "Train in SA or Online"],
      descs: [ACCRED, VENUES, ONSITE, "White, Yellow, Green and Black Belt training across South Africa."],
    }],
  },
  {
    name: "SSSA | White Belt | Search | ZA", status: "ENABLED", daily: 60, ceiling: 12,
    groups: [
      {
        name: "White Belt — Free", url: `${SITE}/courses/white-belt-online`,
        exact: ["free six sigma white belt", "six sigma white belt free", "free six sigma certification", "free six sigma course"],
        phrase: ["free six sigma white belt", "free six sigma certification"],
        heads: ["Free Six Sigma White Belt", "Start Free, Certify Online", "No Cost. Real Certificate.",
                "Free White Belt Training", "CSSC Accredited, Free", "Self-Paced Video Lessons",
                "Study On Your Schedule", "Six Sigma South Africa"],
        descs: ["Self-paced online training with video lessons and knowledge checks. Free to start.",
                ACCRED, "Study anywhere in South Africa, on your own schedule. No classroom required.",
                "Earn a recognised Six Sigma White Belt without paying a cent."],
      },
      {
        name: "White Belt — General", url: `${SITE}/courses/white-belt-online`,
        exact: ["six sigma white belt", "white belt certification", "six sigma white belt online", "six sigma white belt course"],
        phrase: ["six sigma white belt", "white belt certification"],
        heads: ["Six Sigma White Belt", "White Belt, Free Online", "CSSC Accredited Certificate",
                "Self-Paced Video Lessons", "Study On Your Schedule", "Six Sigma South Africa",
                "Start Today, No Cost", "Internationally Accredited"],
        descs: ["Self-paced online training with video lessons and knowledge checks. Free to start.",
                ACCRED, "Study anywhere in South Africa, on your own schedule.",
                "The first step on the Six Sigma belt path. Free, online, accredited."],
      },
    ],
  },
  {
    name: "SSSA | Methods | Search | ZA", status: "ENABLED", daily: 40, ceiling: 15,
    groups: [
      {
        name: "Yellow Belt", url: `${SITE}/courses/yellow-belt-classroom`,
        exact: ["six sigma yellow belt", "yellow belt certification", "six sigma yellow belt course", "yellow belt training"],
        phrase: ["six sigma yellow belt", "yellow belt certification"],
        heads: ["Six Sigma Yellow Belt", "Yellow Belt Certification", "Classroom or On-Site",
                "CSSC Accredited Training", "5 SA Venues Nationwide", "Johannesburg & Cape Town",
                "Six Sigma South Africa", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Practical Six Sigma training for people who improve real processes."],
      },
      {
        name: "5S", url: `${SITE}/courses/5s-classroom`,
        exact: ["5s training", "5s course", "5s certification", "5s lean training"],
        phrase: ["5s training", "5s course"],
        heads: ["5S Training in SA", "5S Certification", "Classroom or On-Site",
                "CSSC Accredited Training", "5 SA Venues Nationwide", "Six Sigma South Africa",
                "Workplace Organisation", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Sort, set, shine, standardise, sustain — taught on your own workplace."],
      },
      {
        name: "Root Cause Analysis", url: `${SITE}/courses/root-cause-analysis-classroom`,
        exact: ["root cause analysis training", "root cause analysis course", "rca training", "root cause analysis certification"],
        phrase: ["root cause analysis training", "root cause analysis course"],
        heads: ["Root Cause Analysis", "RCA Training in SA", "Classroom or On-Site",
                "CSSC Accredited Training", "5 SA Venues Nationwide", "Six Sigma South Africa",
                "Find the Real Cause", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Stop treating symptoms. Learn to find and fix what actually caused it."],
      },
      {
        name: "Kaizen", url: `${SITE}/courses/kaizen-classroom`,
        exact: ["kaizen training", "kaizen course", "kaizen certification", "continuous improvement training"],
        phrase: ["kaizen training", "kaizen course"],
        heads: ["Kaizen Training in SA", "Kaizen Certification", "Continuous Improvement",
                "CSSC Accredited Training", "Classroom or On-Site", "Six Sigma South Africa",
                "5 SA Venues Nationwide", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Build a continuous improvement habit that outlives the project."],
      },
    ],
  },
  {
    // Held. Green and Black feed the project requirement, and project completion
    // is currently 7.7%. Enable at Gate 1 in the 90-day plan, not before.
    name: "SSSA | Belts | Search | ZA", status: "PAUSED", daily: 80, ceiling: 20,
    groups: [
      {
        name: "Lean Green Belt", url: `${SITE}/courses/lean-green-belt-classroom`,
        exact: ["lean six sigma green belt", "lean green belt certification", "lean six sigma certification"],
        phrase: ["lean six sigma green belt", "lean six sigma certification"],
        heads: ["Lean Six Sigma Green Belt", "Green Belt Certification", "Classroom or On-Site",
                "CSSC Accredited Training", "5 SA Venues Nationwide", "Six Sigma South Africa",
                "Johannesburg & Cape Town", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Lead improvement projects with the tools and the evidence to prove them."],
      },
      {
        name: "DMAIC Green Belt", url: `${SITE}/courses/dmaic-green-belt-classroom`,
        exact: ["dmaic green belt", "six sigma green belt", "green belt certification", "six sigma green belt course"],
        phrase: ["six sigma green belt", "dmaic green belt"],
        heads: ["DMAIC Green Belt", "Six Sigma Green Belt", "Green Belt Certification",
                "CSSC Accredited Training", "Classroom or On-Site", "5 SA Venues Nationwide",
                "Six Sigma South Africa", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Define, measure, analyse, improve, control — applied to a real process."],
      },
      {
        name: "DMAIC Black Belt", url: `${SITE}/courses/dmaic-black-belt-classroom`,
        exact: ["six sigma black belt", "black belt certification", "dmaic black belt", "six sigma black belt course"],
        phrase: ["six sigma black belt", "black belt certification"],
        heads: ["Six Sigma Black Belt", "Black Belt Certification", "DMAIC Black Belt",
                "CSSC Accredited Training", "Classroom or On-Site", "5 SA Venues Nationwide",
                "Six Sigma South Africa", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "The senior improvement qualification, taught by practitioners."],
      },
      {
        name: "Lean Black Belt", url: `${SITE}/courses/lean-black-belt-classroom`,
        exact: ["lean six sigma black belt", "lean black belt certification", "lean black belt course"],
        phrase: ["lean six sigma black belt", "lean black belt"],
        heads: ["Lean Six Sigma Black Belt", "Lean Black Belt", "Black Belt Certification",
                "CSSC Accredited Training", "Classroom or On-Site", "Six Sigma South Africa",
                "5 SA Venues Nationwide", "Internationally Accredited"],
        descs: [VENUES, ONSITE, ACCRED, "Lean and Six Sigma together, at the level that changes an operation."],
      },
    ],
  },
];

const res = (t: string, id: string) => `customers/${CID}/${t}/${id}`;
const id = (rn: string) => rn.split("/").pop()!;

/** Fails loudly rather than silently truncating — a clipped headline is a bad ad. */
function check() {
  const bad: string[] = [];
  for (const c of CAMPAIGNS) for (const g of c.groups) {
    for (const h of g.heads) {
      if (h.length > 30) bad.push(`headline ${h.length}: ${h}`);
      if (/\d{3}[\s-]?\d{3}[\s-]?\d{4}|\b0\d{2}\s?\d{3}\s?\d{4}\b/.test(h)) bad.push(`phone number in headline: ${h}`);
    }
    for (const d of g.descs) if (/\d{3}[\s-]?\d{3}[\s-]?\d{4}|\b0\d{2}\s?\d{3}\s?\d{4}\b/.test(d)) bad.push(`phone number in description: ${d}`);
    for (const d of g.descs) if (d.length > 90) bad.push(`description ${d.length}: ${d}`);
    if (g.heads.length < 3) bad.push(`${g.name}: needs 3+ headlines`);
    if (g.descs.length < 2) bad.push(`${g.name}: needs 2+ descriptions`);
  }
  if (bad.length) { console.error("\n  ✖ copy does not fit:\n    " + bad.join("\n    ") + "\n"); process.exit(1); }
}

async function main() {
  check();
  console.log(`\n  ${APPLY ? "APPLYING" : "DRY RUN — pass --apply to write"}\n`);

  // REMOVED campaigns are still returned by GAQL; a deleted build must not
  // block a rebuild.
  const existing = (await query(
    CID,
    `SELECT campaign.name FROM campaign WHERE campaign.name LIKE 'SSSA%' AND campaign.status != 'REMOVED'`,
  )) as any[];
  if (existing.length) {
    console.log(`  ✖ ${existing.length} SSSA campaign(s) already exist. Refusing to duplicate.\n`);
    process.exit(1);
  }

  for (const c of CAMPAIGNS) {
    console.log(`  ${c.status === "ENABLED" ? "▶" : "⏸"} ${c.name}  R${c.daily}/day  cap R${c.ceiling}`);

    const budget = (await mutate(CID, "campaignBudgets", [{
      create: { name: `${c.name} budget`, amountMicros: String(c.daily * 1e6), deliveryMethod: "STANDARD", explicitlyShared: false },
    }], !APPLY)) as any;
    const budgetId = APPLY ? id(budget.results[0].resourceName) : "";
    if (!APPLY) {
      // Everything below needs the budget's real id. Report the plan instead of
      // firing validations that can only fail on a placeholder reference.
      for (const g of c.groups) {
        console.log(`      ${g.name.padEnd(24)} ${g.exact.length + g.phrase.length} keywords, ${g.heads.length} headlines, ${g.descs.length} descriptions`);
        console.log(`      ${"".padEnd(24)} -> ${g.url.replace("https://www.", "")}`);
      }
      console.log();
      continue;
    }

    const camp = (await mutate(CID, "campaigns", [{
      create: {
        name: c.name,
        status: c.status,
        advertisingChannelType: "SEARCH",
        campaignBudget: res("campaignBudgets", budgetId),
        // Maximize Clicks with a ceiling: no conversion history to bid against yet.
        targetSpend: { cpcBidCeilingMicros: String(c.ceiling * 1e6) },
        // Required on create since the EU political advertising rules landed.
        containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: true,
          targetContentNetwork: false,   // the 88% lesson
          targetPartnerSearchNetwork: false,
        },
      },
    }], !APPLY)) as any;
    const campId = APPLY ? id(camp.results[0].resourceName) : "0";

    if (APPLY) {
      await mutate(CID, "campaignCriteria", [
        { create: { campaign: res("campaigns", campId), location: { geoTargetConstant: `geoTargetConstants/${GEO_ZA}` } } },
        { create: { campaign: res("campaigns", campId), language: { languageConstant: `languageConstants/${LANG_EN}` } } },
      ], false);

      for (const set of NEGATIVE_SETS) {
        await mutate(CID, "campaignSharedSets", [
          { create: { campaign: res("campaigns", campId), sharedSet: res("sharedSets", set) } },
        ], false).catch((e: Error) => console.log(`      ! negatives: ${e.message.slice(0, 70)}`));
      }

      await mutate(CID, "conversionGoalCampaignConfigs", [{
        updateMask: "goalConfigLevel,customConversionGoal",
        update: {
          resourceName: `customers/${CID}/conversionGoalCampaignConfigs/${campId}`,
          goalConfigLevel: "CAMPAIGN",
          customConversionGoal: res("customConversionGoals", SSSA_GOAL),
        },
      }], false).catch((e: Error) => console.log(`      ! goal: ${e.message.slice(0, 70)}`));
    }

    for (const g of c.groups) {
      const ag = (await mutate(CID, "adGroups", [{
        create: { name: g.name, campaign: res("campaigns", campId), status: "ENABLED", type: "SEARCH_STANDARD" },
      }], !APPLY)) as any;
      const agId = APPLY ? id(ag.results[0].resourceName) : "0";

      const kw = [
        ...g.exact.map((t) => ({ text: t, matchType: "EXACT" })),
        ...g.phrase.map((t) => ({ text: t, matchType: "PHRASE" })),
      ];
      await mutate(CID, "adGroupCriteria", kw.map((k) => ({
        create: { adGroup: res("adGroups", agId), status: "ENABLED", keyword: k },
      })), !APPLY);

      await mutate(CID, "adGroupAds", [{
        create: {
          adGroup: res("adGroups", agId),
          status: "ENABLED",
          ad: {
            finalUrls: [g.url],
            responsiveSearchAd: {
              headlines: g.heads.map((t) => ({ text: t })),
              descriptions: g.descs.map((t) => ({ text: t })),
            },
          },
        },
      }], !APPLY);

      console.log(`      ${g.name.padEnd(24)} ${kw.length} keywords, ${g.heads.length} headlines, ${g.descs.length} descriptions`);
    }
    console.log();
  }
}

main().catch((e) => { console.error(`\n  ✖ ${e.message}\n`); process.exit(1); });
