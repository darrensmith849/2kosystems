import { num, str } from "./parse.ts";
import type { AuditResult, CategoryScore, Category, Ctx, Finding, Rule } from "./types.ts";

const PENALTY: Record<Finding["severity"], number> = { C: 40, H: 25, M: 10, L: 4 };

export const WEIGHTS: { category: Category; label: string; weight: number }[] = [
  { category: "A", label: "Measurement", weight: 30 },
  { category: "B", label: "Bidding", weight: 20 },
  { category: "C", label: "Targeting", weight: 20 },
  { category: "D", label: "Structure", weight: 10 },
  { category: "E", label: "Geography", weight: 10 },
  { category: "F", label: "Landing pages", weight: 5 },
  { category: "G", label: "Budget", weight: 5 },
];

/**
 * A rule that fired always costs something, even when no spend can be pinned to
 * it directly — a keyword duplicated across ad groups has no line-item cost but
 * is still a defect. Hence the 0.15 floor and the 0.4 default for structural
 * findings. Both are judgement calls, not measurements.
 */
function impact(finding: Finding, totalSpend: number): number {
  if (typeof finding.impactShare === "number") {
    return Math.min(1, Math.max(0.15, finding.impactShare));
  }
  if (finding.spendAtRisk <= 0 || totalSpend <= 0) return 0.4;
  return Math.min(1, Math.max(0.15, finding.spendAtRisk / totalSpend));
}

export function scoreCategories(
  findings: Finding[],
  rules: Rule[],
  assessedIds: Set<string>,
  totalSpend: number,
): { categories: CategoryScore[]; composite: number; coverage: number; grade: string } {
  const categories: CategoryScore[] = WEIGHTS.map(({ category, label, weight }) => {
    const inCategory = rules.filter((r) => r.category === category);
    const assessed = inCategory.filter((r) => assessedIds.has(r.id)).length;
    if (!assessed) {
      return { category, label, weight, score: null, assessed: 0, total: inCategory.length };
    }
    const penalty = findings
      .filter((f) => f.category === category)
      .reduce((total, f) => total + PENALTY[f.severity] * impact(f, totalSpend), 0);
    return {
      category,
      label,
      weight,
      score: Math.max(0, Math.round(100 - penalty)),
      assessed,
      total: inCategory.length,
    };
  });

  // Renormalise across categories we could actually assess, so an unassessed
  // category neither flatters the score nor punishes it. A category is further
  // discounted by how much of it we could see: one clean rule out of three is
  // not evidence that the category is clean.
  const scored = categories.filter((c) => c.score !== null);
  const effective = (c: CategoryScore) => c.weight * (c.assessed / Math.max(1, c.total));
  const weighted = scored.reduce((t, c) => t + (c.score as number) * effective(c), 0);
  const available = scored.reduce((t, c) => t + effective(c), 0);
  const composite = available ? Math.round(weighted / available) : 0;
  const coverage = available / WEIGHTS.reduce((t, c) => t + c.weight, 0);

  const grade =
    composite >= 85 ? "A" : composite >= 70 ? "B" : composite >= 50 ? "C" : composite >= 30 ? "D" : "F";

  return { categories, composite, coverage, grade };
}

/**
 * Tiers must not double-count. Several rules flag the same rands — A2 covers the
 * whole account, B1 covers two campaigns inside it, D1 covers one of those. So
 * `unmeasured` is computed from the campaign report directly rather than summed
 * from findings, and every tier is clamped against what is left.
 */
export function computeWaste(ctx: Ctx, findings: Finding[]): AuditResult["waste"] {
  const total = ctx.totalSpend;

  const confirmed = Math.min(
    total,
    findings.filter((f) => f.tier === "confirmed").reduce((t, f) => t + f.spendAtRisk, 0),
  );

  const probable = Math.min(
    Math.max(0, total - confirmed),
    findings.filter((f) => f.tier === "probable").reduce((t, f) => t + f.spendAtRisk, 0),
  );

  const barren = (ctx.reports.campaign?.rows ?? [])
    .filter((r) => {
      const status = str(r, "campaign_status", "status").toLowerCase();
      const liveNow = status === "enabled" || status.startsWith("eligible");
      return liveNow && num(r, "conversions") === 0 && num(r, "cost") > 0;
    })
    .reduce((t, r) => t + num(r, "cost"), 0);

  const unmeasured = findings.some((f) => f.tier === "unmeasured")
    ? Math.max(0, Math.min(barren, total - confirmed - probable))
    : 0;

  const recoverable = confirmed * ctx.config.recoveryFactor;

  return {
    confirmed,
    probable,
    unmeasured,
    recoverable,
    annualised: recoverable * (365 / ctx.config.windowDays),
    candidates: [],
  };
}
