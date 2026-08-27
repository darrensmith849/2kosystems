/**
 * Generates the 2KO Systems search campaign as Google Ads Editor import files.
 *
 *   node scripts/build-ads.ts
 *
 * Every setting here is a direct answer to a rule that fired in the SixSigma
 * audit (docs/ads/audit-ruleset.md). Exact and phrase only, presence-only geo,
 * search network only, no smart bidding until there is a conversion signal,
 * and a negative list on day one rather than after R66,000.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { RATES, TIMEBOX } from "../src/lib/pricing.ts";

const SITE = "https://2kosystems.com";
const CAMPAIGN = "2KOS | Systems | Search | ZA";
const OUT = "docs/ads/2kosystems";

const LIMITS = { headline: 30, description: 90, path: 15, sitelink: 25, sitelinkDesc: 35, callout: 25 };

type AdGroup = {
  name: string;
  url: string;
  path1: string;
  path2: string;
  headlines: string[];
  descriptions: string[];
  exact: string[];
  phrase: string[];
};

/** Shared closing line. The free scope builder is the cheapest conversion on the site. */
const SCOPE_CTA = "Build your own scope and see the price in minutes. No forms, no discovery call.";

const GROUPS: AdGroup[] = [
  {
    name: "Job cards",
    url: `${SITE}/systems/job-card-system`,
    path1: "systems",
    path2: "job-cards",
    headlines: [
      `Job Card System: ${RATES.jobCard}`,
      "Fixed Price. Five Weeks.",
      "Get Job Cards Off Paper",
      "Built for SA Field Teams",
      "The Price Is on the Site",
      "No Sales Call for a Price",
      "Capture On Site, Not Later",
      "Proof, Costing, Sign-Off",
      "Job Card Software in SA",
      "Know What the Job Cost",
      "Live in Five Weeks",
      "Nothing Retyped or Lost",
      "Build Your Scope Free",
      "Work Orders and Scheduling",
      "One System. Fixed Scope.",
    ],
    descriptions: [
      `Raise, assign, schedule and close out work with proof captured on site. ${RATES.jobCard}.`,
      "The job got done. The paperwork is still in the bakkie. Fixed price, published up front.",
      "Labour, parts and travel on one job. Know the margin before month-end, not after it.",
      SCOPE_CTA,
    ],
    exact: [
      "job card system", "job card software", "job card app", "work order system",
      "work order software", "job card system south africa", "field service software",
      "work order management system", "job card management system",
    ],
    phrase: ["job card system", "job card software", "work order system", "field service management software"],
  },
  {
    name: "SHEQ incidents",
    url: `${SITE}/systems/sheq-incident-reporting`,
    path1: "systems",
    path2: "sheq",
    headlines: [
      `SHEQ Incidents: ${RATES.sheq}`,
      "Fixed Price. Six Weeks.",
      "Incident Reporting System",
      "Close Out Every Action",
      "Audit-Ready in Six Weeks",
      "Built for SA Industry",
      "The Price Is on the Site",
      "Root Cause, Not Just Logs",
      "CAPA With Owners and Dates",
      "Stop Rebuilding Audit Packs",
      "Section 54 Evidence Ready",
      "Near Misses Actually Logged",
      "Off the SHEQ Spreadsheet",
      "No Sales Call for a Price",
      "One System. Fixed Scope.",
    ],
    descriptions: [
      "Incident capture, investigation, corrective actions and regulator-ready reporting.",
      `The incident was reported. The corrective action was not. ${RATES.sheq}, ${TIMEBOX.sheq}.`,
      "Show every action from the last inspection closed out, on demand. Not from a folder.",
      SCOPE_CTA,
    ],
    exact: [
      "incident reporting system", "incident management system", "sheq software",
      "safety incident reporting software", "incident reporting software south africa",
      "sheq management system", "safety management system", "capa software",
    ],
    phrase: ["incident reporting system", "sheq management system", "safety management software", "incident management software"],
  },
  {
    name: "Contractor compliance",
    url: `${SITE}/systems/contractor-compliance`,
    path1: "systems",
    path2: "contractors",
    headlines: [
      "Contractor Compliance: R95k",
      "Fixed Price. Five Weeks.",
      "Expiries That Alert You",
      "Site Access, Controlled",
      "Medicals and Inductions",
      "Who Was On Site, and When",
      "The Price Is on the Site",
      "Onboard a Crew in a Day",
      "No More Gate Guesswork",
      "One Contractor Register",
      "Built for SA Operations",
      "Induct Once, Not Each Visit",
      "Audit-Ready Contractor Files",
      "No Sales Call for a Price",
      "Live in Five Weeks",
    ],
    descriptions: [
      `Onboarding, medicals, inductions, expiry alerts and site access approval. ${RATES.contractor}.`,
      "He is on site. His induction expired on Tuesday. Fixed price, five weeks, published.",
      "Answer who was on site on the 14th with evidence, in seconds rather than in days.",
      SCOPE_CTA,
    ],
    exact: [
      "contractor management system", "contractor compliance software",
      "contractor management software", "site access control system",
      "induction tracking system", "contractor compliance system",
      "contractor management system south africa",
    ],
    phrase: ["contractor management system", "contractor compliance", "site induction software", "contractor management software"],
  },
  {
    name: "Stock and assets",
    url: `${SITE}/systems/stock-and-asset-register`,
    path1: "systems",
    path2: "assets",
    headlines: [
      `Asset Register: ${RATES.assetRegister}`,
      "Fixed Price. Four Weeks.",
      "One Register, One Truth",
      "Know Where Every Asset Is",
      "Counts That Reconcile",
      "Stock and Asset Tracking",
      "The Price Is on the Site",
      "Off the Stock Spreadsheet",
      "Insurance Schedule Current",
      "Track What Moved and Who",
      "Built for SA Operations",
      "Live in Four Weeks",
      "No Sales Call for a Price",
      "Depreciation Without Rework",
      "One System. Fixed Scope.",
    ],
    descriptions: [
      `One register for what you own, where it is and what moved. ${RATES.assetRegister}, ${TIMEBOX.assetRegister}.`,
      "The count says 40. The shelf says 31. Fixed price, published on the site up front.",
      "Stop ordering stock that is already on a shelf under a slightly different name.",
      SCOPE_CTA,
    ],
    exact: [
      "asset register software", "asset management system", "asset tracking system",
      "stock management system", "fixed asset register software", "stock control system",
      "asset register software south africa", "inventory management system south africa",
    ],
    phrase: ["asset register software", "asset tracking system", "stock control system", "fixed asset register"],
  },
  {
    name: "Excel replacement",
    url: `${SITE}/get-off-excel`,
    path1: "get-off-excel",
    path2: "",
    headlines: [
      `Get Off Excel: ${RATES.getOffExcel}`,
      "Fixed Price. Four Weeks.",
      "Replace the Spreadsheet",
      "One Version of the Truth",
      "From Spreadsheet to System",
      "The Price Is on the Site",
      "Built for SA Businesses",
      "No Sales Call for a Price",
      "Live in Four Weeks",
      "Keep the Logic, Lose Excel",
      "Nobody Owns That Formula",
      "Multi-User, No Conflicts",
      "Build Your Scope Free",
      "The Spreadsheet Outgrew You",
      "One System. Fixed Scope.",
    ],
    descriptions: [
      `The spreadsheet outgrew itself. Replace it with a system in four weeks, ${RATES.getOffExcel}.`,
      "Fixed price, published on the site. Scope agreed in week one and then held to.",
      "Multi-user, audited, backed up. Everything the spreadsheet stopped being able to do.",
      SCOPE_CTA,
    ],
    exact: [
      "excel replacement", "replace excel with database", "spreadsheet replacement",
      "excel to web application", "replace spreadsheets with software",
      "excel alternative for business", "move off spreadsheets",
    ],
    phrase: ["replace excel spreadsheet", "spreadsheet replacement software", "excel to database"],
  },
];

/**
 * Campaign-level negatives, applied before the first click rather than after
 * R66,000 of them. The training block matters most: this campaign shares an
 * account with a training brand, and "job card system training" is not a buyer.
 *
 * Deliberately NOT included: the bare word "job", which would block the entire
 * job cards ad group.
 */
const NEGATIVES: Record<string, string[]> = {
  "Training and education": [
    "course", "courses", "training", "certification", "certificate", "diploma",
    "degree", "learnership", "academy", "college", "university", "tutorial",
    "class", "classes", "learn", "study", "exam", "syllabus", "short course",
  ],
  "Free and DIY": [
    "free", "freeware", "open source", "opensource", "github", "crack", "torrent",
    "download", "template", "templates", "sample", "trial", "cheap", "cheapest",
  ],
  "Job seekers": [
    "jobs", "vacancy", "vacancies", "salary", "cv", "resume", "career", "careers",
    "hiring", "recruitment", "internship", "graduate programme",
  ],
  "Research intent": [
    "what is", "meaning", "definition", "wikipedia", "pdf", "ppt", "examples",
    "how does it work",
  ],
  "Wrong product": [
    "excel formula", "excel formulas", "excel tips", "excel shortcuts", "vba",
    "macro", "pivot table", "google sheets", "excel course", "microsoft excel",
  ],
  "Off-platform": [
    "sage", "pastel", "syspro", "sap", "odoo", "zoho", "quickbooks", "xero",
    "salesforce", "monday com", "app development company",
  ],
};

const SITELINKS = [
  { text: "Published Pricing", d1: "Every price on the site.", d2: "No discovery call first.", url: `${SITE}/pricing` },
  { text: "Free Scope Builder", d1: "Answer six questions.", d2: "Get a real price back.", url: `${SITE}/quote` },
  { text: "How We Work", d1: "Fixed scope, fixed price.", d2: "Agreed in week one.", url: `${SITE}/method` },
  { text: "All Systems", d1: "Four fixed-price systems.", d2: "Four to six weeks each.", url: `${SITE}/systems` },
];

const CALLOUTS = [
  "Fixed price", "Price published", "No lock-in", "4-6 week delivery",
  "South African built", "Scope agreed up front", "30 days support",
];

// ---------------------------------------------------------------- validation

const problems: string[] = [];
const check = (label: string, value: string, limit: number) => {
  if (value.length > limit) problems.push(`${label}: ${value.length}/${limit} — "${value}"`);
};

for (const g of GROUPS) {
  if (g.headlines.length < 15) problems.push(`${g.name}: only ${g.headlines.length} headlines, want 15`);
  if (new Set(g.headlines).size !== g.headlines.length) problems.push(`${g.name}: duplicate headlines`);
  g.headlines.forEach((h) => check(`${g.name} headline`, h, LIMITS.headline));
  g.descriptions.forEach((d) => check(`${g.name} description`, d, LIMITS.description));
  check(`${g.name} path1`, g.path1, LIMITS.path);
  check(`${g.name} path2`, g.path2, LIMITS.path);
}
SITELINKS.forEach((s) => {
  check("sitelink", s.text, LIMITS.sitelink);
  check("sitelink desc", s.d1, LIMITS.sitelinkDesc);
  check("sitelink desc", s.d2, LIMITS.sitelinkDesc);
});
CALLOUTS.forEach((c) => check("callout", c, LIMITS.callout));

// A negative that would block our own keywords is the expensive mistake here.
const allKeywords = GROUPS.flatMap((g) => [...g.exact, ...g.phrase]);
for (const [bucket, terms] of Object.entries(NEGATIVES)) {
  for (const n of terms) {
    const blocked = allKeywords.filter((k) => ` ${k} `.includes(` ${n} `));
    if (blocked.length) problems.push(`negative "${n}" (${bucket}) would block: ${blocked.join(", ")}`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  problems.forEach((p) => console.error(`  ${p}`));
  process.exit(1);
}

// ------------------------------------------------------------------- emitters

const csv = (rows: (string | number)[][]) =>
  rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(",")).join("\n") + "\n";

mkdirSync(OUT, { recursive: true });

writeFileSync(`${OUT}/1-campaign.csv`, csv([
  ["Campaign", "Campaign Type", "Status", "Budget", "Budget Type", "Bid Strategy Type",
   "Search Network", "Display Network", "Search Partners", "Languages", "Ad Rotation"],
  [CAMPAIGN, "Search", "Paused", 200, "Daily", "Maximize clicks",
   "Enabled", "Disabled", "Disabled", "en", "Optimize"],
]));

writeFileSync(`${OUT}/2-ad-groups.csv`, csv([
  ["Campaign", "Ad Group", "Status", "Max CPC"],
  ...GROUPS.map((g) => [CAMPAIGN, g.name, "Enabled", 25]),
]));

writeFileSync(`${OUT}/3-keywords.csv`, csv([
  ["Campaign", "Ad Group", "Keyword", "Match Type", "Status", "Final URL"],
  ...GROUPS.flatMap((g) => [
    ...g.exact.map((k) => [CAMPAIGN, g.name, k, "Exact", "Enabled", g.url]),
    ...g.phrase.map((k) => [CAMPAIGN, g.name, k, "Phrase", "Enabled", g.url]),
  ]),
]));

writeFileSync(`${OUT}/4-ads.csv`, csv([
  ["Campaign", "Ad Group", "Ad Type", "Status", "Final URL", "Path 1", "Path 2",
   ...Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`),
   ...Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`)],
  ...GROUPS.map((g) => [
    CAMPAIGN, g.name, "Responsive search ad", "Enabled", g.url, g.path1, g.path2,
    ...g.headlines, ...g.descriptions,
  ]),
]));

writeFileSync(`${OUT}/5-negatives.csv`, csv([
  ["Campaign", "Keyword", "Match Type"],
  ...Object.values(NEGATIVES).flat().map((n) => [CAMPAIGN, n, "Phrase"]),
]));

writeFileSync(`${OUT}/6-sitelinks.csv`, csv([
  ["Campaign", "Sitelink Text", "Description Line 1", "Description Line 2", "Final URL"],
  ...SITELINKS.map((s) => [CAMPAIGN, s.text, s.d1, s.d2, s.url]),
]));

writeFileSync(`${OUT}/7-callouts.csv`, csv([
  ["Campaign", "Callout Text"],
  ...CALLOUTS.map((c) => [CAMPAIGN, c]),
]));

const kw = GROUPS.reduce((t, g) => t + g.exact.length + g.phrase.length, 0);
console.log(`  ${GROUPS.length} ad groups · ${kw} keywords · ${GROUPS.length} RSAs · ${Object.values(NEGATIVES).flat().length} negatives`);
console.log(`  all copy within Google's character limits`);
console.log(`  written to ${OUT}/`);
