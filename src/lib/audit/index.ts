import { parseReport, num, str, windowDays } from "./parse.ts";
import { RULES, candidateSpend } from "./rules.ts";
import { computeWaste, scoreCategories } from "./score.ts";
import type { AuditResult, Config, Ctx, Finding, Report, ReportKind, Skipped } from "./types.ts";

export const DEFAULT_CONFIG: Config = {
  currency: "ZAR",
  recoveryFactor: 0.75,
  windowDays: 90,
  brandTerms: [],
  bucketsOn: [],
  bucketsOff: [],
  minMonthlySpend: 10_000,
};

export function loadReports(files: { name: string; text: string }[]): {
  reports: Partial<Record<ReportKind, Report>>;
  unrecognised: string[];
} {
  const reports: Partial<Record<ReportKind, Report>> = {};
  const unrecognised: string[] = [];
  for (const file of files) {
    const report = parseReport(file.text);
    if (!report) unrecognised.push(file.name);
    else reports[report.kind] = report;
  }
  return { reports, unrecognised };
}

function totalSpend(reports: Partial<Record<ReportKind, Report>>): number {
  const campaign = reports.campaign;
  if (campaign) {
    const account = campaign.totals.find((t) =>
      Object.values(t).some((v) => typeof v === "string" && v.includes("Total: Account")),
    );
    if (account) return num(account, "cost");
    return campaign.rows.reduce((t, r) => t + num(r, "cost"), 0);
  }
  const terms = reports.search_terms;
  if (terms) return terms.rows.reduce((t, r) => t + num(r, "cost"), 0);
  return 0;
}

export function runAudit(
  reports: Partial<Record<ReportKind, Report>>,
  overrides: Partial<Config> = {},
): AuditResult {
  const window = Object.values(reports).find((r) => r?.window)?.window ?? null;

  const config: Config = {
    ...DEFAULT_CONFIG,
    ...overrides,
    windowDays: overrides.windowDays ?? windowDays(window),
  };

  const ctx: Ctx = { config, reports, totalSpend: totalSpend(reports) };

  const findings: Finding[] = [];
  const skipped: Skipped[] = [];
  const assessedIds = new Set<string>();

  // Pass one: everything that does not depend on conversion data.
  for (const rule of RULES.filter((r) => !r.needsMeasurement)) {
    if (!rule.requires.every((k) => reports[k])) {
      skipped.push({ id: rule.id, category: rule.category, title: rule.title, reason: rule.unavailable });
      continue;
    }
    assessedIds.add(rule.id);
    const result = rule.evaluate(ctx);
    if (result) findings.push(...(Array.isArray(result) ? result : [result]));
  }

  // Rules that read conversion data are meaningless without tracking: every
  // campaign trivially shows zero, so they would all fire and all be noise.
  const measurementBroken = findings.some((f) => f.category === "A" && f.severity === "C");

  for (const rule of RULES.filter((r) => r.needsMeasurement)) {
    if (measurementBroken) {
      skipped.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        reason: "Held back until conversion tracking exists — with none installed this rule fires on everything and means nothing.",
      });
      continue;
    }
    if (!rule.requires.every((k) => reports[k])) {
      skipped.push({ id: rule.id, category: rule.category, title: rule.title, reason: rule.unavailable });
      continue;
    }
    assessedIds.add(rule.id);
    const result = rule.evaluate(ctx);
    if (result) findings.push(...(Array.isArray(result) ? result : [result]));
  }

  const order = { C: 0, H: 1, M: 2, L: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || b.spendAtRisk - a.spendAtRisk);

  const searchSpend = (reports.campaign?.rows ?? [])
    .filter((r) => str(r, "campaign_type").toLowerCase() === "search")
    .reduce((t, r) => t + num(r, "cost"), 0);
  const disclosed = (reports.search_terms?.rows ?? [])
    .filter((r) => str(r, "campaign_type").toLowerCase() === "search")
    .reduce((t, r) => t + num(r, "cost"), 0);
  const disclosure =
    reports.search_terms && searchSpend > 0
      ? { searchSpend, disclosed, gap: Math.max(0, searchSpend - disclosed) }
      : null;

  const waste = computeWaste(ctx, findings);
  if (reports.search_terms) waste.candidates = candidateSpend(ctx);

  return {
    window,
    currency: config.currency,
    totalSpend: ctx.totalSpend,
    findings,
    skipped,
    waste,
    disclosure,
    score: scoreCategories(findings, RULES, assessedIds, ctx.totalSpend),
  };
}

export { renderReport } from "./report.ts";
export type { AuditResult, Config } from "./types.ts";
export { str, num };
export type { Report };
