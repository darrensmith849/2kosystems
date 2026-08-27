export type Severity = "C" | "H" | "M" | "L";

export type Category = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/**
 * The three-tier waste model. Only `confirmed` reaches the headline number —
 * see docs/ads/audit-ruleset.md §1. Claiming unmeasured spend as savings is
 * what gets an invoice argued down.
 */
export type WasteTier = "confirmed" | "probable" | "unmeasured" | "none";

export type ReportKind =
  | "campaign"
  | "search_terms"
  | "keywords"
  | "ad_groups"
  | "conversion_actions"
  | "negatives";

export type Row = Record<string, string | number | null>;

export type Report = {
  kind: ReportKind;
  title: string;
  window: string | null;
  headers: string[];
  rows: Row[];
  totals: Row[];
};

export type Finding = {
  id: string;
  category: Category;
  title: string;
  severity: Severity;
  tier: WasteTier;
  /** Spend over the report window that this finding puts at risk, in account currency. */
  spendAtRisk: number;
  /**
   * Share of the spend this rule can actually see, 0–1. A targeting rule reads
   * only disclosed search spend, so scoring it against total account spend
   * would understate it. Falls back to spendAtRisk / totalSpend.
   */
  impactShare?: number;
  evidence: string[];
  fix: string;
};

export type Skipped = {
  id: string;
  category: Category;
  title: string;
  reason: string;
};

export type Config = {
  currency: string;
  /** Recovery factor applied to confirmed waste. Never 1.0 — negatives always catch some good traffic. */
  recoveryFactor: number;
  /** Days covered by the exports, used to annualise. */
  windowDays: number;
  /** Client's own brand terms — never counted as waste. */
  brandTerms: string[];
  /** Buckets switched on beyond their default. */
  bucketsOn: string[];
  /** Buckets switched off beyond their default. */
  bucketsOff: string[];
  minMonthlySpend: number;
};

export type Ctx = {
  config: Config;
  reports: Partial<Record<ReportKind, Report>>;
  /** Total account cost across the window, from the campaign report if present. */
  totalSpend: number;
};

export type Rule = {
  id: string;
  category: Category;
  title: string;
  severity: Severity;
  requires: ReportKind[];
  /** Why this rule cannot run when its inputs are missing. Shown in the report. */
  unavailable: string;
  /**
   * Rules that read conversion data are meaningless in an account with no
   * tracking — every campaign trivially has zero. These are held back until
   * measurement passes rather than reported as findings.
   */
  needsMeasurement?: boolean;
  evaluate: (ctx: Ctx) => Finding | Finding[] | null;
};

export type CategoryScore = {
  category: Category;
  label: string;
  weight: number;
  score: number | null;
  assessed: number;
  total: number;
};

export type AuditResult = {
  window: string | null;
  currency: string;
  totalSpend: number;
  findings: Finding[];
  skipped: Skipped[];
  waste: {
    confirmed: number;
    probable: number;
    unmeasured: number;
    recoverable: number;
    annualised: number;
    candidates: { bucket: string; spend: number; terms: number }[];
  };
  /**
   * Google withholds low-volume search terms. A large gap means most of the
   * spend cannot be inspected at all — worth stating rather than glossing over.
   */
  disclosure: { searchSpend: number; disclosed: number; gap: number } | null;
  score: {
    composite: number;
    grade: string;
    coverage: number;
    categories: CategoryScore[];
  };
};
