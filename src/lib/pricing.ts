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
  review: "Half a day",
  audit: "2 weeks",
  auditExtended: "3–4 weeks",
  getOffExcel: "4 weeks",
  pilot: "4–6 weeks",
  buildPhase: "4–6 weeks per phase",
} as const;
