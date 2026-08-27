import { num, str } from "./parse.ts";
import { BUCKETS, activeBuckets, candidateBuckets, classify } from "./taxonomy.ts";
import { deriveTheme, isOffTheme } from "./theme.ts";
import type { Theme } from "./theme.ts";
import type { Ctx, Finding, Row, Rule } from "./types.ts";

const SMART_BIDDING = [
  "maximize conversions",
  "maximize conversion value",
  "target cpa",
  "target roas",
  "maximise conversions",
];

const live = (ctx: Ctx): Row[] =>
  (ctx.reports.campaign?.rows ?? []).filter((r) => {
    const status = str(r, "campaign_status", "status").toLowerCase();
    return status === "enabled" || status.startsWith("eligible");
  });

const spendOf = (r: Row) => num(r, "cost");
const convOf = (r: Row) => num(r, "conversions");
const nameOf = (r: Row) => str(r, "campaign");

const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

// ---------------------------------------------------------------- A. Measurement

const A1: Rule = {
  id: "A1",
  category: "A",
  title: "No working conversion tracking",
  severity: "C",
  requires: ["campaign"],
  unavailable: "Needs the campaign report, or a conversion actions export for a direct read.",
  evaluate(ctx) {
    const flagged = live(ctx).filter((r) =>
      str(r, "status_reasons").toLowerCase().includes("conversion tracking setup is incomplete"),
    );
    if (!flagged.length) return null;
    const spend = flagged.reduce((t, r) => t + spendOf(r), 0);
    return {
      id: "A1",
      category: "A",
      title: "No working conversion tracking",
      severity: "C",
      tier: "unmeasured",
      spendAtRisk: spend,
      evidence: [
        `Google itself flags ${flagged.length} active campaign(s) with "conversion tracking setup is incomplete".`,
        ...flagged.map((r) => `${nameOf(r)} — ${ctx.config.currency} ${money(spendOf(r))} with no tracking installed`),
      ],
      fix: "Install a conversion action for every real outcome — form submit, phone call, WhatsApp click — and mark the ones that matter as primary. Nothing else in this report can be evaluated until this exists.",
    };
  },
};

const A2: Rule = {
  id: "A2",
  category: "A",
  title: "Spend with zero recorded conversions",
  severity: "C",
  requires: ["campaign"],
  unavailable: "Needs the campaign report.",
  evaluate(ctx) {
    const rows = live(ctx);
    const spend = rows.reduce((t, r) => t + spendOf(r), 0);
    const conv = rows.reduce((t, r) => t + convOf(r), 0);
    if (conv > 0 || spend < 15_000) return null;
    return {
      id: "A2",
      category: "A",
      title: "Spend with zero recorded conversions",
      severity: "C",
      tier: "unmeasured",
      spendAtRisk: spend,
      evidence: [
        `${ctx.config.currency} ${money(spend)} spent over ${ctx.config.windowDays} days.`,
        "Zero conversions recorded across every active campaign.",
        "This does not mean nothing happened. It means nothing was measured.",
      ],
      fix: "Install tracking, then let two weeks of data accumulate before judging any campaign.",
    };
  },
};

const A3: Rule = {
  id: "A3",
  category: "A",
  title: "No primary conversion action",
  severity: "H",
  requires: ["conversion_actions"],
  unavailable: "Needs a conversion actions export.",
  evaluate(ctx) {
    const rows = ctx.reports.conversion_actions?.rows ?? [];
    if (!rows.length) return null;
    const primary = rows.filter((r) =>
      ["primary", "yes", "true"].includes(str(r, "primary_for_goal", "goal", "action_optimization").toLowerCase()),
    );
    if (primary.length) return null;
    return {
      id: "A3",
      category: "A",
      title: "No primary conversion action",
      severity: "H",
      tier: "none",
      spendAtRisk: ctx.totalSpend,
      evidence: [`${rows.length} conversion action(s) exist, none marked primary.`],
      fix: "Mark the actions that represent real business outcomes as primary so bidding optimises toward them.",
    };
  },
};

const A6: Rule = {
  id: "A6",
  category: "A",
  title: "Analytics not linked",
  severity: "M",
  requires: ["conversion_actions"],
  unavailable: "Needs a conversion actions export, or account-level API access.",
  evaluate: () => null,
};

// ------------------------------------------------------------------- B. Bidding

const B1: Rule = {
  id: "B1",
  category: "B",
  title: "Smart bidding with no conversion signal",
  severity: "C",
  requires: ["campaign"],
  unavailable: "Needs the campaign report.",
  evaluate(ctx) {
    const scale = 30 / ctx.config.windowDays;
    const offenders = live(ctx).filter((r) => {
      const strategy = str(r, "bid_strategy_type").toLowerCase();
      if (!SMART_BIDDING.some((s) => strategy.includes(s))) return false;
      return convOf(r) * scale < 15;
    });
    if (!offenders.length) return null;
    const spend = offenders.reduce((t, r) => t + spendOf(r), 0);
    return {
      id: "B1",
      category: "B",
      title: "Smart bidding with no conversion signal",
      severity: "C",
      tier: "unmeasured",
      spendAtRisk: spend,
      evidence: [
        ...offenders.map(
          (r) =>
            `${nameOf(r)} — ${str(r, "bid_strategy_type")}, ${convOf(r).toFixed(0)} conversions in ${ctx.config.windowDays} days, ${ctx.config.currency} ${money(spendOf(r))} spent`,
        ),
        "Smart bidding needs roughly 15 conversions per campaign per 30 days before it can steer.",
      ],
      fix: "Switch to Maximise Clicks with a CPC ceiling until conversion data accumulates. The algorithm is currently being told to optimise toward an outcome it cannot see.",
    };
  },
};

const B2: Rule = {
  id: "B2",
  category: "B",
  title: "Target CPA never met",
  severity: "H",
  requires: ["campaign"],
  unavailable: "Needs the campaign report.",
  needsMeasurement: true,
  evaluate(ctx) {
    const offenders = live(ctx).filter((r) => {
      const target = num(r, "target_cpa");
      const actual = num(r, "cost_conv");
      return target > 0 && actual > target * 2;
    });
    if (!offenders.length) return null;
    return {
      id: "B2",
      category: "B",
      title: "Target CPA never met",
      severity: "H",
      tier: "probable",
      spendAtRisk: offenders.reduce((t, r) => t + spendOf(r), 0),
      evidence: offenders.map(
        (r) => `${nameOf(r)} — target ${money(num(r, "target_cpa"))}, actual ${money(num(r, "cost_conv"))}`,
      ),
      fix: "Raise the target toward reality or rebuild the targeting. A target the account has never hit suppresses delivery.",
    };
  },
};

const B3: Rule = {
  id: "B3",
  category: "B",
  title: "Uncapped Maximise Clicks",
  severity: "M",
  requires: ["campaign"],
  unavailable: "Needs the campaign report including a bid ceiling column.",
  evaluate(ctx) {
    const monthly = (r: Row) => (spendOf(r) / ctx.config.windowDays) * 30;
    const offenders = live(ctx).filter((r) => {
      const strategy = str(r, "bid_strategy_type").toLowerCase();
      return strategy.includes("maximize clicks") && !num(r, "max_cpc", "cpc_bid_ceiling") && monthly(r) > 10_000;
    });
    if (!offenders.length) return null;
    return {
      id: "B3",
      category: "B",
      title: "Uncapped Maximise Clicks",
      severity: "M",
      tier: "probable",
      spendAtRisk: offenders.reduce((t, r) => t + spendOf(r), 0),
      evidence: offenders.map((r) => `${nameOf(r)} — no CPC ceiling at ${money(monthly(r))}/month`),
      fix: "Set a maximum CPC so a single expensive auction cannot absorb the daily budget.",
    };
  },
};

// ----------------------------------------------------------------- C. Targeting

function matchGroup(matchType: string): "broad" | "phrase" | "exact" | "other" {
  const m = matchType.toLowerCase();
  if (m.includes("broad") || m.includes("ai max")) return "broad";
  if (m.includes("phrase")) return "phrase";
  if (m.includes("exact")) return "exact";
  return "other";
}

const C1: Rule = {
  id: "C1",
  category: "C",
  title: "No negative keyword list",
  severity: "H",
  requires: ["negatives"],
  unavailable: "Needs a negative keywords export.",
  evaluate(ctx) {
    const count = ctx.reports.negatives?.rows.length ?? 0;
    if (count >= 20) return null;
    return {
      id: "C1",
      category: "C",
      title: "No negative keyword list",
      severity: "H",
      tier: "none",
      spendAtRisk: ctx.totalSpend,
      evidence: [`${count} negative keyword(s) across the account.`],
      fix: "Build a validated negative list from the account's own search terms.",
    };
  },
};

const C3: Rule = {
  id: "C3",
  category: "C",
  title: "Match-type imbalance",
  severity: "H",
  requires: ["search_terms"],
  unavailable: "Needs the search terms report.",
  evaluate(ctx) {
    const rows = (ctx.reports.search_terms?.rows ?? []).filter(
      (r) => str(r, "campaign_type").toLowerCase() === "search",
    );
    if (!rows.length) return null;
    const split = { broad: 0, phrase: 0, exact: 0, other: 0 };
    for (const r of rows) split[matchGroup(str(r, "match_type"))] += num(r, "cost");
    const total = Object.values(split).reduce((a, b) => a + b, 0);
    if (total <= 0) return null;
    const broad = split.broad / total;
    const tight = (split.phrase + split.exact) / total;
    if (broad <= 0.6 || tight >= 0.2) return null;
    return {
      id: "C3",
      category: "C",
      title: "Match-type imbalance",
      severity: "H",
      tier: "none",
      spendAtRisk: 0,
      impactShare: broad,
      evidence: [
        `Broad and AI Max: ${pct(broad)} of search spend (${ctx.config.currency} ${money(split.broad)})`,
        `Phrase: ${pct(split.phrase / total)}`,
        `Exact: ${pct(split.exact / total)}`,
      ],
      fix: "Build an exact and phrase set from search terms the account has already paid for. Do not pause broad until that set has its own history — see the remediation order.",
    };
  },
};

const C4: Rule = {
  id: "C4",
  category: "C",
  title: "Spend on traffic that cannot buy",
  severity: "C",
  requires: ["search_terms"],
  unavailable: "Needs the search terms report.",
  evaluate(ctx) {
    const active = activeBuckets(ctx.config.bucketsOn, ctx.config.bucketsOff);
    const rows = ctx.reports.search_terms?.rows ?? [];
    const byBucket = new Map<string, { spend: number; terms: number; worst: [string, number][] }>();
    let total = 0;

    for (const r of rows) {
      const cost = num(r, "cost");
      if (cost <= 0) continue;
      const hit = classify(str(r, "search_term"), active, ctx.config.brandTerms);
      if (!hit) continue;
      const entry = byBucket.get(hit.bucket.name) ?? { spend: 0, terms: 0, worst: [] };
      entry.spend += cost;
      entry.terms += 1;
      entry.worst.push([str(r, "search_term"), cost]);
      byBucket.set(hit.bucket.name, entry);
      total += cost;
    }
    if (total <= 0) return null;

    const evidence: string[] = [];
    for (const [name, e] of [...byBucket].sort((a, b) => b[1].spend - a[1].spend)) {
      const label = BUCKETS.find((b) => b.name === name)?.label ?? name;
      const worst = e.worst.sort((a, b) => b[1] - a[1]).slice(0, 3);
      evidence.push(
        `${label} — ${ctx.config.currency} ${money(e.spend)} across ${e.terms} terms, e.g. ${worst
          .map(([t, c]) => `"${t}" (${money(c)})`)
          .join(", ")}`,
      );
    }
    const share = ctx.totalSpend ? total / ctx.totalSpend : 0;
    evidence.push(`${pct(share)} of total account spend went to traffic that could not have bought anything.`);

    return {
      id: "C4",
      category: "C",
      title: "Spend on traffic that cannot buy",
      severity: "C",
      tier: "confirmed",
      spendAtRisk: total,
      impactShare: (() => {
        const disclosed = rows.reduce((t, r) => t + num(r, "cost"), 0);
        return disclosed ? total / disclosed : undefined;
      })(),
      evidence,
      fix: "Apply the validated negative list at campaign level. Reversible, immediate, and it does not touch working traffic.",
    };
  },
};

const C5: Rule = {
  id: "C5",
  category: "C",
  title: "High-click, zero-conversion search terms",
  severity: "H",
  requires: ["search_terms"],
  unavailable: "Needs the search terms report.",
  needsMeasurement: true,
  evaluate(ctx) {
    const offenders = (ctx.reports.search_terms?.rows ?? []).filter(
      (r) => num(r, "clicks") >= 20 && num(r, "conversions") === 0,
    );
    if (!offenders.length) return null;
    const spend = offenders.reduce((t, r) => t + num(r, "cost"), 0);
    return {
      id: "C5",
      category: "C",
      title: "High-click, zero-conversion search terms",
      severity: "H",
      tier: "probable",
      spendAtRisk: spend,
      evidence: offenders
        .sort((a, b) => num(b, "cost") - num(a, "cost"))
        .slice(0, 8)
        .map((r) => `"${str(r, "search_term")}" — ${num(r, "clicks")} clicks, ${money(num(r, "cost"))}, 0 conversions`),
      fix: "Review each term individually. Twenty clicks with nothing to show is a strong signal, not proof.",
    };
  },
};

const C6: Rule = {
  id: "C6",
  category: "C",
  title: "Keywords competing with each other",
  severity: "M",
  requires: ["keywords"],
  unavailable: "Needs the keywords export.",
  evaluate(ctx) {
    const seen = new Map<string, Set<string>>();
    for (const r of ctx.reports.keywords?.rows ?? []) {
      const key = `${str(r, "campaign")}::${str(r, "keyword").toLowerCase()}::${str(r, "match_type")}`;
      const groups = seen.get(key) ?? new Set<string>();
      groups.add(str(r, "ad_group"));
      seen.set(key, groups);
    }
    const dupes = [...seen].filter(([, g]) => g.size > 1);
    if (!dupes.length) return null;
    return {
      id: "C6",
      category: "C",
      title: "Keywords competing with each other",
      severity: "M",
      tier: "none",
      spendAtRisk: 0,
      evidence: dupes.slice(0, 6).map(([k, g]) => `${k.split("::")[1]} appears in ${g.size} ad groups`),
      fix: "Keep one instance per campaign so the account is not bidding against itself.",
    };
  },
};

const C7: Rule = {
  id: "C7",
  category: "C",
  title: "Ad group dilution",
  severity: "M",
  requires: ["keywords"],
  unavailable: "Needs the keywords export.",
  evaluate(ctx) {
    const counts = new Map<string, number>();
    for (const r of ctx.reports.keywords?.rows ?? []) {
      if (str(r, "keyword_status", "status").toLowerCase() === "removed") continue;
      const key = `${str(r, "campaign")} > ${str(r, "ad_group")}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const fat = [...counts].filter(([, n]) => n > 20).sort((a, b) => b[1] - a[1]);
    if (!fat.length) return null;
    return {
      id: "C7",
      category: "C",
      title: "Ad group dilution",
      severity: "M",
      tier: "none",
      spendAtRisk: 0,
      evidence: fat.slice(0, 6).map(([k, n]) => `${k} — ${n} keywords`),
      fix: "Split into tightly themed ad groups so the ad can actually match the search.",
    };
  },
};

const C8: Rule = {
  id: "C8",
  category: "C",
  title: "Dormant keyword bloat",
  severity: "L",
  requires: ["keywords"],
  unavailable: "Needs the keywords export.",
  evaluate(ctx) {
    const dormant = (ctx.reports.keywords?.rows ?? []).filter((r) => num(r, "impr", "impressions") === 0);
    if (dormant.length <= 100) return null;
    return {
      id: "C8",
      category: "C",
      title: "Dormant keyword bloat",
      severity: "L",
      tier: "none",
      spendAtRisk: 0,
      evidence: [`${dormant.length} keywords with zero impressions over the window.`],
      fix: "Remove them. They add nothing and make the account impossible to read.",
    };
  },
};

/**
 * The account's own vocabulary, taken only from choices the advertiser made:
 * campaign names, ad group names, and terms they explicitly added as keywords.
 * Never from raw search terms, which would learn the waste along with the intent.
 */
export function themeOf(ctx: Ctx): Theme {
  const sources: string[] = [];
  for (const r of live(ctx)) sources.push(str(r, "campaign"));
  for (const r of ctx.reports.search_terms?.rows ?? []) {
    sources.push(str(r, "ad_group"));
    if (str(r, "added_excluded").toLowerCase() === "added") sources.push(str(r, "search_term"));
  }
  for (const r of ctx.reports.keywords?.rows ?? []) sources.push(str(r, "keyword"));
  return deriveTheme(sources.filter(Boolean));
}

const C4B: Rule = {
  id: "C4b",
  category: "C",
  title: "Spend on searches unrelated to what you sell",
  severity: "C",
  requires: ["search_terms"],
  unavailable: "Needs the search terms report.",
  evaluate(ctx) {
    const theme = themeOf(ctx);
    if (theme.distinctive.size < 2) return null;

    const active = activeBuckets(ctx.config.bucketsOn, ctx.config.bucketsOff);
    // The same term appears once per ad group it matched in. Aggregate, or the
    // evidence reads as though "iq academy" is two different problems.
    const byTerm = new Map<string, { term: string; cost: number; clicks: number }>();

    for (const r of ctx.reports.search_terms?.rows ?? []) {
      const cost = num(r, "cost");
      if (cost <= 0) continue;
      const term = str(r, "search_term");
      // Anything already counted by the taxonomy stays counted once, there.
      if (classify(term, active, ctx.config.brandTerms)) continue;
      if (!isOffTheme(term, theme, ctx.config.brandTerms)) continue;
      const entry = byTerm.get(term) ?? { term, cost: 0, clicks: 0 };
      entry.cost += cost;
      entry.clicks += num(r, "clicks");
      byTerm.set(term, entry);
    }
    const hits = [...byTerm.values()].sort((a, b) => b.cost - a.cost);
    if (!hits.length) return null;

    const spend = hits.reduce((t, h) => t + h.cost, 0);
    const disclosed = (ctx.reports.search_terms?.rows ?? []).reduce((t, r) => t + num(r, "cost"), 0);

    return {
      id: "C4b",
      category: "C",
      title: "Spend on searches unrelated to what you sell",
      severity: "C",
      tier: "confirmed",
      spendAtRisk: spend,
      impactShare: disclosed ? spend / disclosed : undefined,
      evidence: [
        `${pct(disclosed ? spend / disclosed : 0)} of disclosed search spend went to searches sharing no vocabulary with what this account sells.`,
        `Your account is about: ${[...theme.distinctive].slice(0, 10).join(", ")}.`,
        ...hits.slice(0, 12).map((h) => `"${h.term}" — ${ctx.config.currency} ${money(h.cost)}, ${h.clicks} clicks`),
        hits.length > 12 ? `…and ${hits.length - 12} more terms.` : "",
      ].filter(Boolean),
      fix: "Exclude these at campaign level. Each one is checkable in a second — you either sell to that search or you do not.",
    };
  },
};

// ----------------------------------------------------------------- D. Structure

const D1: Rule = {
  id: "D1",
  category: "D",
  title: "Performance Max running without a signal",
  severity: "C",
  requires: ["campaign"],
  unavailable: "Needs the campaign report.",
  evaluate(ctx) {
    const offenders = live(ctx).filter(
      (r) => str(r, "campaign_type").toLowerCase().includes("performance max") && convOf(r) === 0 && spendOf(r) > 0,
    );
    if (!offenders.length) return null;
    const spend = offenders.reduce((t, r) => t + spendOf(r), 0);
    return {
      id: "D1",
      category: "D",
      title: "Performance Max running without a signal",
      severity: "C",
      tier: "unmeasured",
      spendAtRisk: spend,
      evidence: offenders.map(
        (r) =>
          `${nameOf(r)} — ${ctx.config.currency} ${money(spendOf(r))}, ${money(num(r, "clicks"))} clicks, 0 conversions recorded`,
      ),
      fix: "Pause it until conversion tracking exists. Performance Max is entirely automated: with no conversion signal it is spend without steering. Whether those clicks were worth anything is unknowable today, which is the point.",
    };
  },
};

const D4: Rule = {
  id: "D4",
  category: "D",
  title: "No ad rotation",
  severity: "M",
  requires: ["ad_groups"],
  unavailable: "Needs an ads or ad groups export.",
  evaluate: () => null,
};

const D7: Rule = {
  id: "D7",
  category: "D",
  title: "Dead ad groups",
  severity: "L",
  requires: ["ad_groups"],
  unavailable: "Needs the ad groups export.",
  evaluate(ctx) {
    const dead = (ctx.reports.ad_groups?.rows ?? []).filter(
      (r) =>
        num(r, "impr", "impressions") === 0 &&
        str(r, "ad_group_status", "status").toLowerCase() === "enabled",
    );
    if (!dead.length) return null;
    return {
      id: "D7",
      category: "D",
      title: "Dead ad groups",
      severity: "L",
      tier: "none",
      spendAtRisk: 0,
      evidence: [`${dead.length} enabled ad group(s) with zero impressions.`],
      fix: "Pause or fix them. An enabled ad group serving nothing is usually a targeting or approval problem.",
    };
  },
};

// ---------------------------------------------------------------- E. Geography

const E1: Rule = {
  id: "E1",
  category: "E",
  title: "Presence-or-interest location targeting",
  severity: "C",
  requires: ["ad_groups"],
  unavailable:
    "Not exposed in any CSV export. Needs API access, or a screenshot of each campaign's location settings.",
  evaluate: () => null,
};

const E2: Rule = {
  id: "E2",
  category: "E",
  title: "Spend outside the serviceable area",
  severity: "C",
  requires: ["ad_groups"],
  unavailable: "Needs a geographic report export.",
  evaluate: () => null,
};

// ------------------------------------------------------------- F. Landing pages

const F2: Rule = {
  id: "F2",
  category: "F",
  title: "Insecure landing pages",
  severity: "H",
  requires: ["keywords"],
  unavailable: "Needs the keywords export with a Final URL column.",
  evaluate(ctx) {
    const urls = new Set<string>();
    for (const r of ctx.reports.keywords?.rows ?? []) {
      const url = str(r, "final_url", "final_urls");
      if (url.startsWith("http://")) urls.add(url);
    }
    if (!urls.size) return null;
    return {
      id: "F2",
      category: "F",
      title: "Insecure landing pages",
      severity: "H",
      tier: "none",
      spendAtRisk: 0,
      evidence: [...urls].slice(0, 5),
      fix: "Move the site to HTTPS and update the final URLs. Every paid click currently lands on a page the browser marks as not secure.",
    };
  },
};

// ------------------------------------------------------------------- G. Budget

const G1: Rule = {
  id: "G1",
  category: "G",
  title: "Budget-limited campaign",
  severity: "H",
  requires: ["campaign"],
  unavailable: "Needs the campaign report.",
  evaluate(ctx) {
    const limited = live(ctx).filter((r) => num(r, "search_lost_is_budget", "display_lost_is_budget") > 0.2);
    if (!limited.length) return null;
    return {
      id: "G1",
      category: "G",
      title: "Budget-limited campaign",
      severity: "H",
      tier: "none",
      spendAtRisk: 0,
      evidence: limited.map(
        (r) => `${nameOf(r)} — losing ${pct(num(r, "search_lost_is_budget"))} of impressions to budget`,
      ),
      fix: "Redirect budget from campaigns that cannot show a return. Fix waste before raising spend.",
    };
  },
};

const G3: Rule = {
  id: "G3",
  category: "G",
  title: "Spend concentrated in zero-conversion campaigns",
  severity: "H",
  requires: ["campaign"],
  unavailable: "Needs the campaign report.",
  needsMeasurement: true,
  evaluate(ctx) {
    const rows = live(ctx);
    const barren = rows.filter((r) => convOf(r) === 0);
    const spend = barren.reduce((t, r) => t + spendOf(r), 0);
    if (!ctx.totalSpend || spend / ctx.totalSpend <= 0.5) return null;
    return {
      id: "G3",
      category: "G",
      title: "Spend concentrated in zero-conversion campaigns",
      severity: "H",
      tier: "probable",
      spendAtRisk: spend,
      evidence: [`${pct(spend / ctx.totalSpend)} of spend sits in campaigns with no recorded conversions.`],
      fix: "Reallocate toward what demonstrably works.",
    };
  },
};

export const RULES: Rule[] = [
  A1, A2, A3, A6,
  B1, B2, B3,
  C1, C3, C4, C4B, C5, C6, C7, C8,
  D1, D4, D7,
  E1, E2,
  F2,
  G1, G3,
];

export function candidateSpend(ctx: Ctx) {
  const active = activeBuckets(ctx.config.bucketsOn, ctx.config.bucketsOff);
  const rows = ctx.reports.search_terms?.rows ?? [];
  const out: { bucket: string; spend: number; terms: number }[] = [];

  for (const bucket of candidateBuckets(active)) {
    const only = new Set([bucket.name]);
    let spend = 0;
    let terms = 0;
    for (const r of rows) {
      const cost = num(r, "cost");
      if (cost <= 0) continue;
      if (classify(str(r, "search_term"), only, ctx.config.brandTerms)) {
        spend += cost;
        terms += 1;
      }
    }
    if (spend > 0) out.push({ bucket: bucket.label, spend, terms });
  }
  return out.sort((a, b) => b.spend - a.spend);
}

export type { Finding };
