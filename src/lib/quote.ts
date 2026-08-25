import { PRODUCTS, type Product } from "@/lib/products";
import { RATES, TIMEBOX } from "@/lib/pricing";

/**
 * Scope builder rules.
 *
 * Deliberately deterministic: every path resolves to a price that is already
 * published somewhere on this site, or to a refusal. Nothing here invents a
 * figure, because an automated quote that anchors a number we cannot honour
 * is worse than no quote at all.
 */

export type Answer = string;
export type Answers = Record<string, Answer>;

export type Question = {
  id: string;
  label: string;
  help?: string;
  options: { value: string; label: string; note?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "domain",
    label: "What are you trying to fix?",
    help: "Pick the closest. If two apply, pick the one that costs you most.",
    options: [
      { value: "jobs", label: "Work in the field", note: "Job cards, work orders, callouts" },
      { value: "sheq", label: "Incidents and safety", note: "Reporting, investigations, corrective actions" },
      { value: "contractors", label: "Contractors on site", note: "Medicals, inductions, access" },
      { value: "stock", label: "What we own and where it is", note: "Stock, assets, movements, counts" },
      { value: "spreadsheet", label: "One spreadsheet that has outgrown itself", note: "Shared file, version chaos" },
      { value: "other", label: "Something else", note: "Approvals, portals, reporting, coordination" },
    ],
  },
  {
    id: "agreed",
    label: "Is everyone agreed on how the process actually works?",
    help: "Not how it is supposed to work — how it runs on a Tuesday.",
    options: [
      { value: "yes", label: "Yes, it is well understood" },
      { value: "mostly", label: "Mostly, with some grey areas" },
      { value: "no", label: "No, people would describe it differently" },
    ],
  },
  {
    id: "integration",
    label: "Does it need to read from or write to another system?",
    help: "Sage, Pastel, Syspro, Xero, an ERP, a payroll system.",
    options: [
      { value: "no", label: "No, it can stand on its own" },
      { value: "later", label: "Not at first, maybe later" },
      { value: "yes", label: "Yes, from day one" },
    ],
  },
  {
    id: "scope",
    label: "How many processes are in scope?",
    options: [
      { value: "one", label: "One" },
      { value: "few", label: "Two or three, connected" },
      { value: "many", label: "Several across the operation" },
    ],
  },
  {
    id: "roles",
    label: "How many distinct kinds of user?",
    help: "A kind of user is a group that sees different things — not headcount.",
    options: [
      { value: "upto3", label: "Three or fewer", note: "e.g. capturer, approver, viewer" },
      { value: "more", label: "More than three" },
    ],
  },
];

const BY_DOMAIN: Record<string, string | null> = {
  jobs: "job-card-system",
  sheq: "sheq-incident-reporting",
  contractors: "contractor-compliance",
  stock: "stock-and-asset-register",
  spreadsheet: "get-off-excel",
  other: null,
};

export type Outcome =
  | {
      kind: "product";
      product: Product;
      /** Why this one, in the visitor's own terms. */
      because: string[];
    }
  | {
      kind: "excel";
      price: string;
      timebox: string;
      because: string[];
    }
  | {
      kind: "pilot";
      priceFrom: string;
      timebox: string;
      /** Every reason it does not fit a fixed-price box. */
      because: string[];
    }
  | {
      kind: "review";
      price: string;
      timebox: string;
      because: string[];
    };

/**
 * Resolves answers to an outcome. Order matters: the disqualifiers are checked
 * before the happy path, so a fixed price is only ever offered when every box
 * is genuinely ticked.
 */
export function resolve(answers: Answers): Outcome | null {
  const { domain, agreed, integration, scope, roles } = answers;
  if (!domain || !agreed || !integration || !scope || !roles) return null;

  // A process nobody agrees on cannot be scoped, let alone priced.
  if (agreed === "no") {
    return {
      kind: "review",
      price: RATES.review,
      timebox: TIMEBOX.review,
      because: [
        "You told us people would describe the process differently.",
        "Automating a disputed process just makes the disagreement faster.",
        `A half day on site settles what the process actually is — and the ${RATES.review} comes off whatever you commission next.`,
      ],
    };
  }

  const blockers: string[] = [];
  if (integration === "yes") {
    blockers.push("It has to read from or write to another system from day one. Integration is where the risk sits, so it is scoped and priced on its own.");
  }
  if (scope === "many") {
    blockers.push("Several processes are in scope. More than one workflow means the problem is coordination, which is not a fixed-price box.");
  }
  if (scope === "few") {
    blockers.push("Two or three connected processes. Fixed-price products cover one.");
  }
  if (roles === "more") {
    blockers.push("More than three kinds of user. Beyond three roles the permission model stops being standard.");
  }
  if (domain === "other") {
    blockers.push("What you described does not map onto one of our fixed-price products, which means it should be shaped from scratch rather than forced into a box.");
  }

  if (blockers.length > 0) {
    return {
      kind: "pilot",
      priceFrom: RATES.pilotFrom,
      timebox: TIMEBOX.pilot,
      because: blockers,
    };
  }

  const slug = BY_DOMAIN[domain];

  if (slug === "get-off-excel") {
    return {
      kind: "excel",
      price: RATES.getOffExcel,
      timebox: TIMEBOX.getOffExcel,
      because: [
        "One spreadsheet, one process, three roles or fewer.",
        "No integration needed at the start.",
        "That is exactly the box Get Off Excel is drawn around.",
      ],
    };
  }

  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;

  return {
    kind: "product",
    product,
    because: [
      "One process, in scope, with three roles or fewer.",
      "No integration required on day one.",
      "The scope for this is already drawn, which is why the price is already published.",
    ],
  };
}

export function outcomeHeadline(outcome: Outcome) {
  switch (outcome.kind) {
    case "product":
      return { name: outcome.product.name, price: outcome.product.price, timebox: outcome.product.timebox, href: `/systems/${outcome.product.slug}` };
    case "excel":
      return { name: "Get Off Excel", price: outcome.price, timebox: outcome.timebox, href: "/get-off-excel" };
    case "pilot":
      return { name: "Proof-of-Value Pilot", price: `from ${outcome.priceFrom}`, timebox: outcome.timebox, href: "/method" };
    case "review":
      return { name: "Half-Day Process Review", price: outcome.price, timebox: outcome.timebox, href: "/method" };
  }
}
