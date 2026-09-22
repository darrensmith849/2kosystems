import { RATES, TERMS } from "@/lib/pricing";

/**
 * Sponsor Reviews.
 *
 * One private page per company, showing that company its own submitted
 * improvement projects and which of their control plans depend on a person
 * remembering. This is "route 1" from the internal audit: the data goes back
 * to the party it belongs to, so there is no purpose-limitation problem.
 *
 * Tokens are unguessable and pages are noindexed. Nothing here is public.
 */

export type ControlType = "manual" | "systemic";

export type Project = {
  name: string;
  year: string;
  /**
   * The ROLE that ran the project, never the person.
   *
   * Naming an individual turns company operational data into personal
   * information, and it also tells a sponsor which of their employees'
   * improvements decayed — which is a bad thing to do in an email whose
   * purpose is goodwill. Roles carry the same weight and neither risk.
   */
  leadRole: string;
  /** What the sponsor's own team costed the problem at, in rand. */
  value: number;
  /** The control method written into their own control plan. */
  control: string;
  type: ControlType;
  /** Our read on whether the gain is still there. */
  note: string;
};

export type Review = {
  token: string;
  /**
   * Set once the sponsor has said yes to being sent this. The page refuses to
   * render without it, so a review cannot be published by accident.
   */
  permissionGranted: boolean;
  company: string;
  sponsor: string;
  sponsorRole: string;
  cohort: string;
  projects: Project[];
};

export const REVIEWS: Review[] = [
  {
    // Illustrative example. Fictional company, invented projects.
    token: "sample-marula",
    permissionGranted: true,
    company: "Marula Minerals",
    sponsor: "Nomsa Khumalo",
    sponsorRole: "Operations Director",
    cohort: "Green Belt cohorts, 2024–2025",
    projects: [
      {
        name: "Changeover time on the secondary crusher",
        year: "2024",
        leadRole: "the section engineer",
        value: 486000,
        control: "Weekly supervisor check against a printed standard",
        type: "manual",
        note: "Depends on the supervisor doing the walk. No record of the last twelve weeks.",
      },
      {
        name: "Contractor induction backlog",
        year: "2024",
        leadRole: "the SHEQ officer",
        value: 312000,
        control: "Spreadsheet of expiry dates, reviewed monthly",
        type: "manual",
        note: "One file, one owner. Expiries are only caught if the review happens.",
      },
      {
        name: "Reagent consumption variance",
        year: "2025",
        leadRole: "the process metallurgist",
        value: 274000,
        control: "Automated dosing with an alarm on drift",
        type: "systemic",
        note: "Built into the plant. This one holds without anyone watching.",
      },
      {
        name: "Shift handover completeness",
        year: "2025",
        leadRole: "the shift superintendent",
        value: 198000,
        control: "Handover book countersigned by the incoming supervisor",
        type: "manual",
        note: "A book. Not searchable, not auditable, and only as good as the last shift.",
      },
      {
        name: "Weighbridge reconciliation",
        year: "2025",
        leadRole: "the logistics coordinator",
        value: 156000,
        control: "Month-end manual reconciliation against dispatch notes",
        type: "manual",
        note: "Finds the variance four weeks after it happened, which is too late to act on.",
      },
      {
        name: "Planned maintenance compliance",
        year: "2025",
        leadRole: "the maintenance planner",
        value: 220000,
        control: "CMMS schedule with automatic work order generation",
        type: "systemic",
        note: "Already in a system. No action needed.",
      },
    ],
  },
];

export function getReview(token: string) {
  return REVIEWS.find((r) => r.token === token);
}

export function reviewTotals(review: Review) {
  const total = review.projects.reduce((sum, p) => sum + p.value, 0);
  const manual = review.projects.filter((p) => p.type === "manual");
  const atRisk = manual.reduce((sum, p) => sum + p.value, 0);
  return {
    total,
    atRisk,
    manualCount: manual.length,
    projectCount: review.projects.length,
    /** Share of the costed value sitting behind a human control. */
    pct: Math.round((atRisk / total) * 100),
    largest: manual.slice().sort((a, b) => b.value - a.value)[0],
    reviewPrice: RATES.review,
  };
}

/**
 * What we should actually recommend for the biggest manual item.
 *
 * We publish a rule: a pilot should cost under 25% of the annual value of the
 * problem it fixes. That rule has to bind us, including when it says no. If the
 * cheapest pilot breaches the ceiling, the honest recommendation is a Process
 * Review to size the problem properly — not a build we cannot justify.
 */
export function recommendation(review: Review) {
  const t = reviewTotals(review);
  const problem = t.largest.value;
  const pilotFrom = Number(RATES.pilotFrom.replace(/[^0-9]/g, ""));
  const ceiling = Number(TERMS.pilotValueRatio.replace(/[^0-9]/g, ""));
  const pct = Math.round((pilotFrom / problem) * 100);
  const clears = pct <= ceiling;

  return {
    problem,
    pilotFrom,
    pct,
    ceiling,
    clears,
    /** The largest pilot that would still satisfy our own rule. */
    maxJustifiable: Math.floor((problem * ceiling) / 100),
  };
}

export const rand = (n: number) => "R" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
