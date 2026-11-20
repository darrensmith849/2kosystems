/**
 * Single source of truth for every published price on the site.
 *
 * The pricing page and the Get Off Excel product page both read from here,
 * so a rate change is one edit and the two pages can never disagree. All
 * figures are ex VAT, in South African rand.
 */

export const RATES = {
  /** Half-day on site, 3–4 page memo. The cheapest way in. */
  review: "R7,500",
  /** Standard Process Audit: 1 day fieldwork, half a day writing. */
  audit: "R24,500",
  /** Multi-site or multi-process audit. */
  auditExtended: "R48,000",
  /** Productised spreadsheet replacement. */
  getOffExcel: "R79,500",
  /** One workflow, fixed scope, rolls forward into the build. */
  pilotFrom: "R145,000",
  /** Phased custom build. */
  buildFrom: "R350,000",
  buildTo: "R1.2m",
  /** Proactive care and bounded monthly improvement for one production system. */
  retainerCare: "R25,000",
  /** Ongoing operation and planned evolution of one production system. */
  managedSystems: "R65,000",
  /** Integrated Improvement Partnerships, per month. */
  partnershipProgramme: "R125,000",
  partnershipOperational: "R225,000",
  partnershipTransformation: "R395,000",
  /** One-off mobilisation before the annual operating cadence begins. */
  mobilisationProgramme: "R150,000",
  mobilisationOperational: "R250,000",
  /** Productised systems — fixed scope, published price. */
  jobCard: "R95,000",
  sheq: "R120,000",
  contractor: "R95,000",
  assetRegister: "R79,500",
  /* ---------- Websites ----------
     A different market from the systems work: smaller, faster, decided in days
     rather than months. Priced to sit above a freelancer and below an agency,
     which is exactly where the 2KO Group name does the work.

     Set against delivery cost rather than market feel. At roughly R4,000/day
     fully loaded, Business at its old R24,500 was a six-day build returning
     about 2% — and, next to a strip of blue-chip logos, it read as cheap. */
  /** ~1.5 days. Thin margin on purpose: this one is the hook for a care plan. */
  siteLaunch: "R9,500",
  siteBusiness: "R39,500",
  siteCommerceFrom: "R58,000",
  /** Above Job Card System at R95,000 would be odd; below R75,000 undercuts it. */
  siteBespokeFrom: "R75,000",

  /* ---------- Website care ----------
     Care deliberately excludes changes. The moment small edits are bundled into
     the base tier, forty clients become a support queue and the whole model
     stops working. Self-service is a build decision, not a retainer feature. */
  careBasic: "R450",
  /** Includes an hour. At the R1,250 hourly below, the old R1,200 sold that hour at a loss. */
  carePlus: "R1,850",
  carePartner: "R3,950",
  /** Out-of-scope and change-request work. */
  dayRate: "R9,500",
  hourlyRate: "R1,250",
} as const;

/**
 * Standalone Sigmafy Statistics subscriptions are listed in US dollars on the
 * specialist product. Keep them separate from RATES, which is deliberately the
 * South African rand price book for 2KO services and partnerships.
 */
export const SIGMAFY_RATES = {
  free: "$0",
  practitioner: "$49",
  team: "$199",
} as const;

export const TERMS = {
  /** Window in which an audit fee is credited against a commissioned pilot. */
  auditCreditDays: 60,
  /** Minimum production-system Care commitment before it goes month-to-month. */
  careMinMonths: 6,
  /** Managed Systems is an annual operating relationship beginning at go-live. */
  managedSystemsMinMonths: 12,
  /** Integrated Improvement Partnerships are annual operating agreements. */
  partnershipMinMonths: 12,
  /** Annual service and partnership escalation. */
  escalation: "CPI + 2%",
  /** Margin on AI usage and third-party licences billed through at cost. */
  passthroughMargin: "15%",
  /** Free support window after go-live on fixed-price products. */
  postLaunchSupportDays: 30,
  /**
   * Ceiling we hold ourselves to when proposing a pilot: it should cost less
   * than this share of the annual value of the problem it fixes.
   */
  pilotValueRatio: "25%",
} as const;

export const TIMEBOX = {
  siteLaunch: "1 week",
  siteBusiness: "3 weeks",
  siteCommerce: "5 weeks",
  siteBespoke: "6 weeks",
  review: "Half a day",
  audit: "2 weeks",
  auditExtended: "3–4 weeks",
  getOffExcel: "4 weeks",
  jobCard: "5 weeks",
  sheq: "6 weeks",
  contractor: "5 weeks",
  assetRegister: "4 weeks",
  pilot: "4–6 weeks",
  buildPhase: "4–6 weeks per phase",
} as const;

/* ---------- Deployments ----------
   A deployment is priced per year by tier (delegates who start a belt) and by
   how the people learn: the recommended mix, or one format for everyone.
   Every tier is priced bottom-up from the rates below, so the column a buyer
   reads always adds up from the rows above it. Rand, ex VAT, per year. */

export type DeliveryFormat = "online" | "hybrid" | "virtual" | "onsite";
export type DeploymentMode = "mix" | DeliveryFormat;
type Belts<T> = { yellow: T; green: T; black: T };

/**
 * Pre-paid belt prices per format. Online, live virtual and on-site are
 * Sigmafy's own prices from Sales › Pricing in the portal (sf_belt_levels),
 * the figures the Email Agent quotes, copied on 19 Nov 2026 — when the portal
 * prices change, change them here too. Hybrid is not in the portal yet: it is
 * set between online and live virtual until it is priced there.
 */
export const BELT_PRICES: Record<DeliveryFormat, Belts<number>> = {
  online: { yellow: 5000, green: 16995, black: 26000 },
  hybrid: { yellow: 5600, green: 18500, black: 29500 },
  virtual: { yellow: 6500, green: 20500, black: 34500 },
  onsite: { yellow: 8400, green: 24000, black: 40500 },
};

/**
 * Discount off the belt price per format, by tier (Pilot to Group). The more
 * live trainer time a format needs, the lower its ceiling: online costs almost
 * nothing per extra person, so it takes by far the deepest discount; on-site
 * costs a trainer for every cohort.
 */
export const FORMAT_DISCOUNTS: Record<DeliveryFormat, Belts<readonly number[]>> = {
  online: { yellow: [0, 0.25, 0.45, 0.65, 0.75], green: [0, 0.2, 0.35, 0.5, 0.65], black: [0, 0.15, 0.25, 0.4, 0.55] },
  hybrid: { yellow: [0, 0.15, 0.3, 0.45, 0.55], green: [0, 0.1, 0.2, 0.3, 0.4], black: [0, 0.1, 0.15, 0.25, 0.3] },
  virtual: { yellow: [0, 0.1, 0.15, 0.25, 0.3], green: [0, 0.1, 0.15, 0.25, 0.3], black: [0, 0.05, 0.1, 0.2, 0.25] },
  onsite: { yellow: [0, 0.05, 0.1, 0.15, 0.15], green: [0, 0.05, 0.1, 0.15, 0.15], black: [0, 0.05, 0.1, 0.15, 0.15] },
};

export const DEPLOYMENT_MODES: Record<DeploymentMode, { name: string; tagline: string; belts: Belts<DeliveryFormat>; coachingDaysPerMonth: readonly number[]; liveTime: string; travelAtCost: boolean }> = {
  mix: { name: "Mix by belt", tagline: "The right format for each belt", belts: { yellow: "online", green: "hybrid", black: "virtual" }, coachingDaysPerMonth: [1, 3, 6, 12, 40], liveTime: "Hybrid for Green, live days for Black", travelAtCost: false },
  // Black Belts always get live check-ins: an online-only deal must not
  // produce Black Belts who never trained with a person.
  online: { name: "Fully online", tagline: "No live sessions; Black Belt stays hybrid", belts: { yellow: "online", green: "online", black: "hybrid" }, coachingDaysPerMonth: [0, 0, 0, 0, 0], liveTime: "None, except Black Belt check-ins", travelAtCost: false },
  hybrid: { name: "Hybrid", tagline: "Recorded, with live check-ins", belts: { yellow: "hybrid", green: "hybrid", black: "hybrid" }, coachingDaysPerMonth: [1, 2, 3, 6, 20], liveTime: "3 × 10 min each training day", travelAtCost: false },
  virtual: { name: "Live virtual", tagline: "A trainer live, online", belts: { yellow: "virtual", green: "virtual", black: "virtual" }, coachingDaysPerMonth: [2, 4, 8, 16, 60], liveTime: "Full training days, live online", travelAtCost: false },
  onsite: { name: "On-site", tagline: "A trainer in your building", belts: { yellow: "onsite", green: "onsite", black: "onsite" }, coachingDaysPerMonth: [2, 4, 8, 16, 60], liveTime: "Full training days, in person", travelAtCost: true },
};

export const COACHING_DAY_RATE = 9500;

export type DeploymentTier = {
  id: string;
  name: string;
  /** Delegates who start a belt in the year. */
  cap: number;
  places: Belts<number>;
  /** Sigmafy licence per delegate per year. */
  licencePerDelegate: number;
  report: string;
  programmeLead: boolean;
  trainTheTrainer: boolean;
  industrySimulation: boolean;
  singleSignOn: boolean;
};

export const DEPLOYMENT_TIERS: readonly DeploymentTier[] = [
  { id: "pilot", name: "Pilot", cap: 100, places: { yellow: 15, green: 10, black: 1 }, licencePerDelegate: 250, report: "Quarterly", programmeLead: false, trainTheTrainer: false, industrySimulation: false, singleSignOn: false },
  { id: "programme", name: "Programme", cap: 500, places: { yellow: 75, green: 25, black: 2 }, licencePerDelegate: 200, report: "Quarterly", programmeLead: false, trainTheTrainer: false, industrySimulation: false, singleSignOn: false },
  { id: "division", name: "Division", cap: 1000, places: { yellow: 150, green: 40, black: 4 }, licencePerDelegate: 180, report: "Monthly", programmeLead: true, trainTheTrainer: true, industrySimulation: false, singleSignOn: false },
  { id: "enterprise", name: "Enterprise", cap: 10000, places: { yellow: 1500, green: 200, black: 20 }, licencePerDelegate: 150, report: "Monthly", programmeLead: true, trainTheTrainer: true, industrySimulation: true, singleSignOn: true },
  { id: "group", name: "Group", cap: 50000, places: { yellow: 7500, green: 600, black: 60 }, licencePerDelegate: 100, report: "Monthly + live", programmeLead: true, trainTheTrainer: true, industrySimulation: true, singleSignOn: true },
];

/**
 * Savings per finished project, deliberately set below published medians, and
 * the share of projects assumed to finish. Yellow and White Belt savings are
 * left out because no reliable published figure exists for them.
 */
export const SAVINGS_BASIS = {
  greenProject: 500_000,
  blackProject: 2_000_000,
  /** Our own cautious assumption: no published completion rate was found. */
  completionRate: 0.5,
  sources: [
    { label: "iSixSigma Black Belt survey: median hard savings of $187,500 a project (about R3.3m). We count R2m.", href: "https://www.isixsigma.com/press-releases/ignoring-six-sigma-can-cost-you-money-black-belts-deliver-188k-hard-financial-savings-project/" },
    { label: "The Lean Six Sigma Company, 200 completed projects: median Green Belt saving of £36,700 (about R850,000). We count R500,000.", href: "https://www.theleansixsigmacompany.com/uk/library/lean-six-sigma-roi-200-projects/" },
  ],
} as const;

export type DeploymentPrice = {
  discount: Belts<number>;
  coachingDaysPerMonth: number;
  belts: number;
  coaching: number;
  licences: number;
  total: number;
  perDelegate: number;
  savingsLow: number;
  savingsLikely: number;
};

export function priceDeploymentTier(tier: DeploymentTier, tierIndex: number, mode: DeploymentMode): DeploymentPrice {
  const formats = DEPLOYMENT_MODES[mode].belts;
  const discount = {
    yellow: FORMAT_DISCOUNTS[formats.yellow].yellow[tierIndex],
    green: FORMAT_DISCOUNTS[formats.green].green[tierIndex],
    black: FORMAT_DISCOUNTS[formats.black].black[tierIndex],
  };
  const belts =
    tier.places.yellow * BELT_PRICES[formats.yellow].yellow * (1 - discount.yellow) +
    tier.places.green * BELT_PRICES[formats.green].green * (1 - discount.green) +
    tier.places.black * BELT_PRICES[formats.black].black * (1 - discount.black);
  const coachingDaysPerMonth = DEPLOYMENT_MODES[mode].coachingDaysPerMonth[tierIndex];
  const coaching = coachingDaysPerMonth * 12 * COACHING_DAY_RATE;
  const licences = tier.cap * tier.licencePerDelegate;
  const total = belts + coaching + licences;
  const savingsLikely =
    tier.places.green * SAVINGS_BASIS.completionRate * SAVINGS_BASIS.greenProject +
    tier.places.black * SAVINGS_BASIS.completionRate * SAVINGS_BASIS.blackProject;

  return { discount, coachingDaysPerMonth, belts, coaching, licences, total, perDelegate: total / tier.cap, savingsLow: savingsLikely / 2, savingsLikely };
}
