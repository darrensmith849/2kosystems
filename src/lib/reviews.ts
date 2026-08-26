import { RATES } from "@/lib/pricing";

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
  lead: string;
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
    company: "Marula Minerals",
    sponsor: "Nomsa Khumalo",
    sponsorRole: "Operations Director",
    cohort: "Green Belt cohorts, 2024–2025",
    projects: [
      {
        name: "Changeover time on the secondary crusher",
        year: "2024",
        lead: "T. Nkosi",
        value: 486000,
        control: "Weekly supervisor check against a printed standard",
        type: "manual",
        note: "Depends on the supervisor doing the walk. No record of the last twelve weeks.",
      },
      {
        name: "Contractor induction backlog",
        year: "2024",
        lead: "P. Dlamini",
        value: 312000,
        control: "Spreadsheet of expiry dates, reviewed monthly",
        type: "manual",
        note: "One file, one owner. Expiries are only caught if the review happens.",
      },
      {
        name: "Reagent consumption variance",
        year: "2025",
        lead: "S. Mahlangu",
        value: 274000,
        control: "Automated dosing with an alarm on drift",
        type: "systemic",
        note: "Built into the plant. This one holds without anyone watching.",
      },
      {
        name: "Shift handover completeness",
        year: "2025",
        lead: "L. van Wyk",
        value: 198000,
        control: "Handover book countersigned by the incoming supervisor",
        type: "manual",
        note: "A book. Not searchable, not auditable, and only as good as the last shift.",
      },
      {
        name: "Weighbridge reconciliation",
        year: "2025",
        lead: "N. Pillay",
        value: 156000,
        control: "Month-end manual reconciliation against dispatch notes",
        type: "manual",
        note: "Finds the variance four weeks after it happened, which is too late to act on.",
      },
      {
        name: "Planned maintenance compliance",
        year: "2025",
        lead: "K. Botha",
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
    /** What a pilot on the largest manual item would cost against its value. */
    largest: manual.slice().sort((a, b) => b.value - a.value)[0],
    reviewPrice: RATES.review,
  };
}

export const rand = (n: number) => "R" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
