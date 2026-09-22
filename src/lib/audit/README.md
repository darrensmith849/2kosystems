# Audit engine

Implements [docs/ads/audit-ruleset.md](../../../docs/ads/audit-ruleset.md).

```bash
npm run audit -- "Campaign report.csv" "Search terms report.csv" --brand "2ko" --out report.md
```

Report kinds are detected from CSV headers, so filenames don't matter. Anything
missing degrades to a "not assessed" row rather than a wrong answer.

| File | Does |
|---|---|
| `parse.ts` | Google's export format — 2-line preamble, `Total:` rows, `" --"` nulls, `"1,234"` numbers |
| `taxonomy.ts` | Exclusion buckets (§3). `on` counts as waste, `review` becomes a candidate needing sign-off |
| `theme.ts` | Derives what the account sells from the advertiser's own choices, so off-theme spend is catchable without a hand-built competitor list |
| `rules.ts` | The rules. Each declares `requires` so missing inputs skip rather than guess |
| `score.ts` | Weighted composite (§4) and the three-tier waste model (§1) |
| `report.ts` | Six-block client report (§7) |

## Two things to preserve if you change this

**Tiers must not double-count.** A1, B1 and D1 all flag overlapping rands.
`computeWaste` derives `unmeasured` from the campaign report directly and
clamps each tier against what's left, rather than summing findings.

**Only confirmed waste reaches the headline.** Everything else is reported
under its own label. Overclaiming here is what gets an invoice argued down.
