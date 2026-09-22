# Google Ads — applied changes

Account: **2KO Africa**, CID `351-600-6867`
Campaign: **SixSigma** (Search)

## 2026-08-27

### 1. Negative keyword list applied — done

69 negatives added at **campaign level**, phrase match, on `SixSigma`.
Source list: [negative-keywords.md](negative-keywords.md).

Pre-existing negatives (left alone, they sit at ad-group level): `bmgi`,
`Free`, `mastergrade`, `Sgs`.

### 2. Broad match — NOT paused, deliberately

The plan called for pausing broad match at this point. On inspection that
would have taken the campaign to roughly zero traffic:

| Match type | Spend (90d) | Share |
|---|---|---|
| Broad | R16,173 | 95.4% |
| Exact | R779 | 4.6% |

All 955 keywords were effectively broad, and the top performers are
genuinely on-intent (`6 sigma course` — 227 clicks; `six sigma courses
south africa` — 183 clicks). Pausing broad before a replacement set exists
would have removed the traffic along with the waste.

### 3. Exact + phrase keywords added — done

44 keywords added to ad group `SixSigma > Six Sigma`, all built from search
terms the account has **already paid for and converted attention on** — 204
qualifying Six Sigma search terms, 1,093 clicks, R1,054 spend, R0.96 avg CPC.

- 12 phrase match
- 32 exact match

No expansion into new intent; same terms, tighter containers.

Keyword count went 955 → 999. New keywords sit at *Pending / Under review*,
which is normal for a bulk add and clears within a few hours.

## Next, in order

1. **Wait ~1 week** (to ~2026-09-03) so the exact/phrase set accumulates its
   own history and can be judged on its own numbers.
2. **Then pause broad match** on `SixSigma`, with exact/phrase carrying the
   traffic. Compare clicks and CPC week-over-week before and after.
3. **Move the campaign off Maximize Conversions.** It is currently bidding
   toward a conversion signal that does not exist — 0 conversions in 90 days
   because nothing is tracked. Until step 4 lands, Maximise Clicks with a CPC
   cap is honest; Maximise Conversions is not.
4. **Install conversion tracking** on sixsigmasouthafrica.co.za. See
   [conversion-tracking.md](conversion-tracking.md). Nothing above can be
   evaluated properly until this exists.
5. **Pause `PMax: Six Sigma South Africa - Remarketing`.** R22,109 spent over
   90 days with no conversion signal to optimise against. PMax without
   conversion data is spend without steering.
