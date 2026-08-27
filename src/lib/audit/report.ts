import { BUCKETS } from "./taxonomy.ts";
import type { AuditResult } from "./types.ts";

const SEVERITY: Record<string, string> = {
  C: "Critical",
  H: "High",
  M: "Medium",
  L: "Low",
};

const TIER: Record<string, string> = {
  confirmed: "confirmed waste",
  probable: "probable waste",
  unmeasured: "unmeasured",
  none: "no direct spend",
};

/** Remediation order is fixed by dependency, not ranked by value. §5 of the rule set. */
const ORDER = [
  ["Install measurement", "A1–A5", "Nothing else can be evaluated. No parallel tracks."],
  ["Stop the unsteered spend", "D1, E1, E2, F1", "Needs no history to justify — a dead URL is dead today."],
  ["Take bidding off the false signal", "B1", "Maximise Clicks with a CPC cap until data accumulates."],
  ["Apply negatives", "C1, C4", "Immediate, low-risk, reversible."],
  ["Build the replacement keyword set", "C3", "Exact and phrase from terms already paid for. No new intent."],
  ["Wait 7–14 days", "—", "The new set needs its own history before it can carry load."],
  ["Then restrict broad match", "C3", "Only once the replacement is serving."],
  ["Then return to smart bidding", "B1", "Once conversions reach roughly 15 per campaign per 30 days."],
];

export function renderReport(result: AuditResult): string {
  const cur = result.currency;
  const money = (n: number) =>
    `${cur} ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  const out: string[] = [];

  out.push("# Google Ads audit");
  out.push("");
  out.push(`Window: **${result.window ?? "unknown"}**  ·  Total spend: **${money(result.totalSpend)}**`);
  out.push("");

  // 1. The number
  out.push("## What this is costing you");
  out.push("");
  out.push(`### ${money(result.waste.annualised)} a year`);
  out.push("");
  out.push(
    `${money(result.waste.confirmed)} of confirmed waste over the window, ` +
      `recovered at ${Math.round((result.waste.recoverable / (result.waste.confirmed || 1)) * 100)}% ` +
      `and annualised. Negatives always catch some legitimate traffic, so the recovery ` +
      `factor is deliberately below 100%. Seasonality is not modelled.`,
  );
  out.push("");
  out.push("| Tier | Over the window | What it means |");
  out.push("|---|---:|---|");
  out.push(`| Confirmed waste | ${money(result.waste.confirmed)} | Traffic that could never have bought from you |`);
  out.push(`| Probable waste | ${money(result.waste.probable)} | Strong negative signal, not proof |`);
  out.push(`| Unmeasured | ${money(result.waste.unmeasured)} | May be working. Nobody can currently tell |`);
  out.push("");

  const candidateTotal = result.waste.candidates.reduce((t, c) => t + c.spend, 0);
  if (candidateTotal > 0) {
    const withCandidates =
      (result.waste.confirmed + candidateTotal) * 0.75 * (365 / 90);
    out.push(
      `A further **${money(candidateTotal)}** sits in categories only you can rule on ` +
        `(see below). Approve those and the annual figure becomes **${money(withCandidates)}**.`,
    );
    out.push("");
  }

  if (result.disclosure && result.disclosure.gap > 0) {
    const rate = result.disclosure.disclosed
      ? result.waste.confirmed / result.disclosure.disclosed
      : 0;
    out.push(
      `**One caveat, stated up front.** Google discloses only ` +
        `${money(result.disclosure.disclosed)} of your ${money(result.disclosure.searchSpend)} ` +
        `search spend at search-term level; ${money(result.disclosure.gap)} is withheld as ` +
        `low-volume. Everything above is measured on the disclosed portion only. If the ` +
        `withheld ${Math.round((result.disclosure.gap / result.disclosure.searchSpend) * 100)}% ` +
        `behaves the same way — likely, since it is the same broad matching — the true figure ` +
        `is roughly ${money(rate * result.disclosure.gap)} higher over the window. ` +
        `We have not put that in the headline, because we cannot prove it.`,
    );
    out.push("");
  }

  out.push(
    "> We are not proposing you spend less. We are proposing you move the confirmed " +
      "portion off traffic that cannot buy and onto traffic that can.",
  );
  out.push("");

  // 2. Diagnosis
  const headline = result.findings[0];
  if (headline) {
    out.push("## The short version");
    out.push("");
    out.push(`**${headline.title}.** ${headline.evidence[0] ?? ""}`);
    out.push("");
  }

  // 3. Findings
  out.push(`## Findings (${result.findings.length})`);
  out.push("");
  out.push(
    `Account grade: **${result.score.grade}** — ${result.score.composite}/100, computed across ` +
      `${Math.round(result.score.coverage * 100)}% of the weighted rule set.`,
  );
  out.push("");
  out.push("| Category | Score | Rules assessed |");
  out.push("|---|---:|---:|");
  for (const c of result.score.categories) {
    out.push(`| ${c.label} (${c.weight}%) | ${c.score === null ? "not assessed" : c.score} | ${c.assessed}/${c.total} |`);
  }
  out.push("");

  for (const f of result.findings) {
    out.push(`### ${f.id} · ${f.title}`);
    out.push("");
    out.push(
      `**${SEVERITY[f.severity]}**` +
        (f.spendAtRisk > 0 ? ` · ${money(f.spendAtRisk)} at risk · ${TIER[f.tier]}` : ` · ${TIER[f.tier]}`),
    );
    out.push("");
    for (const line of f.evidence) out.push(`- ${line}`);
    out.push("");
    out.push(`**Fix.** ${f.fix}`);
    out.push("");
  }

  // Candidate exclusions
  if (result.waste.candidates.length) {
    out.push("## Candidate exclusions — needs your sign-off");
    out.push("");
    out.push(
      "Deliberately excluded from the number above, because only you can say whether " +
        "this traffic is worth having.",
    );
    out.push("");
    out.push("| Bucket | Spend | Terms | Why it is not counted |");
    out.push("|---|---:|---:|---|");
    for (const c of result.waste.candidates) {
      const note = BUCKETS.find((b) => b.label === c.bucket)?.note ?? "";
      out.push(`| ${c.bucket} | ${money(c.spend)} | ${c.terms} | ${note} |`);
    }
    out.push("");
  }

  // 4. Order
  out.push("## Order of work");
  out.push("");
  out.push("These fixes are dependent. Doing them by value rather than by order causes damage.");
  out.push("");
  out.push("| # | Step | Rules | Why here |");
  out.push("|---|---|---|---|");
  ORDER.forEach(([step, rules, why], i) => out.push(`| ${i + 1} | ${step} | ${rules} | ${why} |`));
  out.push("");

  // 6. Honesty block
  out.push("## What this audit cannot tell you");
  out.push("");
  if (result.skipped.length) {
    out.push("| Rule | Not assessed because |");
    out.push("|---|---|");
    for (const s of result.skipped) out.push(`| ${s.id} · ${s.title} | ${s.reason} |`);
  } else {
    out.push("Every rule in the set was assessed.");
  }
  out.push("");
  return out.join("\n");
}
