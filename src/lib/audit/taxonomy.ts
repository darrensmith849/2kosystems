/**
 * Exclusion taxonomy — docs/ads/audit-ruleset.md §3.
 *
 * `on`     counts toward confirmed waste.
 * `review` is reported as a candidate exclusion needing the client's sign-off,
 *          and is deliberately kept out of the headline number.
 * `off`    is only evaluated when switched on for a specific client.
 *
 * Every bucket must be switchable: `free` is fatal for a paid course and
 * perfectly fine for a freemium product.
 */
export type Bucket = {
  name: string;
  label: string;
  default: "on" | "review" | "off";
  /** Matched on word boundaries against the lowercased search term. */
  patterns: string[];
  note?: string;
};

export const BUCKETS: Bucket[] = [
  {
    name: "employment",
    label: "Job seekers",
    default: "on",
    patterns: [
      "job", "jobs", "vacancy", "vacancies", "salary", "salaries", "cv",
      "resume", "career", "careers", "hiring", "recruitment", "internship",
      "learnership", "apprenticeship", "employment", "work from home",
    ],
  },
  {
    name: "free",
    label: "Free intent",
    default: "on",
    patterns: [
      "free", "gratis", "no cost", "freeware", "crack", "cracked", "torrent",
      "for free", "free download",
    ],
    note: "Switch off for freemium products.",
  },
  {
    name: "research",
    label: "Research intent",
    default: "on",
    patterns: [
      "what is", "what are", "meaning", "definition", "define", "wikipedia",
      "wiki", "pdf", "ppt", "powerpoint", "sample", "example", "examples",
      "template", "syllabus", "curriculum vitae", "explained", "history of",
    ],
  },
  {
    name: "diy",
    label: "Do-it-yourself",
    default: "on",
    patterns: [
      "diy", "do it yourself", "how to make", "how to build", "tutorial",
      "self study", "self taught", "step by step",
    ],
  },
  {
    name: "price_floor",
    label: "Price-floor shoppers",
    default: "review",
    patterns: ["cheap", "cheapest", "discount", "bargain", "second hand", "used", "affordable"],
    note: "Sometimes legitimate demand. Confirm before excluding.",
  },
  {
    name: "rival_institutions",
    label: "Other institutions by name",
    default: "review",
    patterns: [
      "academy", "college", "institute", "institution", "university",
      "school of", "skills centre", "skills center", "training centre",
      "training center", "graduate",
    ],
    note:
      "Someone searching a named competitor is rarely persuadable at click cost. " +
      "High-yield for training providers, but validate the list before it goes live.",
  },
  {
    name: "brand_confusion",
    label: "Unrelated brands",
    default: "off",
    patterns: [],
    note: "Populate per client from the search terms report.",
  },
];

export type BucketHit = { bucket: Bucket; pattern: string };

const cache = new Map<string, RegExp>();

function matcher(pattern: string): RegExp {
  let re = cache.get(pattern);
  if (!re) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
    cache.set(pattern, re);
  }
  return re;
}

export function classify(
  term: string,
  active: Set<string>,
  brandTerms: string[],
): BucketHit | null {
  const t = ` ${term.toLowerCase().trim()} `;
  // Brand traffic is usually the cheapest conversion in the account, never waste.
  if (brandTerms.some((b) => b && t.includes(b.toLowerCase()))) return null;

  for (const bucket of BUCKETS) {
    if (!active.has(bucket.name)) continue;
    for (const pattern of bucket.patterns) {
      if (matcher(pattern).test(t)) return { bucket, pattern };
    }
  }
  return null;
}

export function activeBuckets(on: string[], off: string[]): Set<string> {
  const set = new Set<string>();
  for (const b of BUCKETS) if (b.default === "on") set.add(b.name);
  for (const name of on) set.add(name);
  for (const name of off) set.delete(name);
  return set;
}

/** Buckets not counted in the headline number, evaluated so we can price them. */
export function candidateBuckets(active: Set<string>): Bucket[] {
  return BUCKETS.filter((b) => !active.has(b.name) && b.patterns.length > 0);
}
