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
  /** Managed retainer tiers, per month. */
  retainerCare: "R7,500",
  retainerImprove: "R18,500",
  retainerPartner: "R38,500",
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

export const TERMS = {
  /** Window in which an audit fee is credited against a commissioned pilot. */
  auditCreditDays: 60,
  /** Minimum retainer commitment before it goes month-to-month. */
  retainerMinMonths: 6,
  /** Discount for paying a retainer twelve months up front. */
  annualPrepayDiscount: "10%",
  /** Annual retainer escalation. */
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
