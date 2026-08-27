# Google Ads audit

Window: **May 30, 2026 - August 27, 2026**  ·  Total spend: **ZAR 66,383**

## What this is costing you

### ZAR 45,975 a year

ZAR 15,115 of confirmed waste over the window, recovered at 75% and annualised. Negatives always catch some legitimate traffic, so the recovery factor is deliberately below 100%. Seasonality is not modelled.

| Tier | Over the window | What it means |
|---|---:|---|
| Confirmed waste | ZAR 15,115 | Traffic that could never have bought from you |
| Probable waste | ZAR 0 | Strong negative signal, not proof |
| Unmeasured | ZAR 51,268 | May be working. Nobody can currently tell |

A further **ZAR 323** sits in categories only you can rule on (see below). Approve those and the annual figure becomes **ZAR 46,956**.

**One caveat, stated up front.** Google discloses only ZAR 16,951 of your ZAR 44,274 search spend at search-term level; ZAR 27,322 is withheld as low-volume. Everything above is measured on the disclosed portion only. If the withheld 62% behaves the same way — likely, since it is the same broad matching — the true figure is roughly ZAR 24,363 higher over the window. We have not put that in the headline, because we cannot prove it.

> We are not proposing you spend less. We are proposing you move the confirmed portion off traffic that cannot buy and onto traffic that can.

## The short version

**No working conversion tracking.** Google itself flags 2 active campaign(s) with "conversion tracking setup is incomplete".

## Findings (7)

Account grade: **D** — 46/100, computed across 42% of the weighted rule set.

| Category | Score | Rules assessed |
|---|---:|---:|
| Measurement (30%) | 20 | 2/4 |
| Bidding (20%) | 60 | 2/3 |
| Targeting (20%) | 36 | 3/8 |
| Structure (10%) | 87 | 1/3 |
| Geography (10%) | not assessed | 0/2 |
| Landing pages (5%) | not assessed | 0/1 |
| Budget (5%) | 100 | 1/2 |

### A1 · No working conversion tracking

**Critical** · ZAR 66,383 at risk · unmeasured

- Google itself flags 2 active campaign(s) with "conversion tracking setup is incomplete".
- SixSigma — ZAR 44,274 with no tracking installed
- PMax: Six Sigma South Africa - Remarketing — ZAR 22,109 with no tracking installed

**Fix.** Install a conversion action for every real outcome — form submit, phone call, WhatsApp click — and mark the ones that matter as primary. Nothing else in this report can be evaluated until this exists.

### A2 · Spend with zero recorded conversions

**Critical** · ZAR 66,383 at risk · unmeasured

- ZAR 66,383 spent over 90 days.
- Zero conversions recorded across every active campaign.
- This does not mean nothing happened. It means nothing was measured.

**Fix.** Install tracking, then let two weeks of data accumulate before judging any campaign.

### B1 · Smart bidding with no conversion signal

**Critical** · ZAR 66,383 at risk · unmeasured

- SixSigma — Maximize Conversions, 0 conversions in 90 days, ZAR 44,274 spent
- PMax: Six Sigma South Africa - Remarketing — Maximize Conversions, 0 conversions in 90 days, ZAR 22,109 spent
- Smart bidding needs roughly 15 conversions per campaign per 30 days before it can steer.

**Fix.** Switch to Maximise Clicks with a CPC ceiling until conversion data accumulates. The algorithm is currently being told to optimise toward an outcome it cannot see.

### D1 · Performance Max running without a signal

**Critical** · ZAR 22,109 at risk · unmeasured

- PMax: Six Sigma South Africa - Remarketing — ZAR 22,109, 20,058 clicks, 0 conversions recorded

**Fix.** Pause it until conversion tracking exists. Performance Max is entirely automated: with no conversion signal it is spend without steering. Whether those clicks were worth anything is unknowable today, which is the point.

### C4b · Spend on searches unrelated to what you sell

**Critical** · ZAR 14,444 at risk · confirmed waste

- 85.2% of disclosed search spend went to searches sharing no vocabulary with what this account sells.
- Your account is about: sixsigma, six, sigma, lean, green, belt, 5s, yellow, master, black.
- "iq academy" — ZAR 3,662, 143 clicks
- "regenesys" — ZAR 568, 22 clicks
- "stadio courses" — ZAR 429, 14 clicks
- "training classes near me" — ZAR 404, 36 clicks
- "abethu skills development training durban durban" — ZAR 329, 13 clicks
- "mancosa durban" — ZAR 291, 8 clicks
- "accelerate management school" — ZAR 287, 9 clicks
- "mancosa johannesburg office" — ZAR 266, 1 clicks
- "training programs near me" — ZAR 245, 24 clicks
- "regent business school" — ZAR 238, 3 clicks
- "qcto" — ZAR 235, 7 clicks
- "university of pretoria distance" — ZAR 229, 2 clicks
- …and 199 more terms.

**Fix.** Exclude these at campaign level. Each one is checkable in a second — you either sell to that search or you do not.

### C4 · Spend on traffic that cannot buy

**Critical** · ZAR 671 at risk · confirmed waste

- Free intent — ZAR 595 across 36 terms, e.g. "free training classes" (413), "free ecsa cpd courses" (20), "coursera free courses with certificates" (20)
- Job seekers — ZAR 76 across 4 terms, e.g. "csg learnership" (26), "training courses to get a job" (24), "training courses to get a job" (19)
- Research intent — ZAR 0 across 2 terms, e.g. "what is six sigma certification" (0), "what is six sigma" (0)
- 1.0% of total account spend went to traffic that could not have bought anything.

**Fix.** Apply the validated negative list at campaign level. Reversible, immediate, and it does not touch working traffic.

### C3 · Match-type imbalance

**High** · no direct spend

- Broad and AI Max: 93.7% of search spend (ZAR 15,880)
- Phrase: 1.6%
- Exact: 4.7%

**Fix.** Build an exact and phrase set from search terms the account has already paid for. Do not pause broad until that set has its own history — see the remediation order.

## Candidate exclusions — needs your sign-off

Deliberately excluded from the number above, because only you can say whether this traffic is worth having.

| Bucket | Spend | Terms | Why it is not counted |
|---|---:|---:|---|
| Other institutions by name | ZAR 323 | 12 | Someone searching a named competitor is rarely persuadable at click cost. High-yield for training providers, but validate the list before it goes live. |

## Order of work

These fixes are dependent. Doing them by value rather than by order causes damage.

| # | Step | Rules | Why here |
|---|---|---|---|
| 1 | Install measurement | A1–A5 | Nothing else can be evaluated. No parallel tracks. |
| 2 | Stop the unsteered spend | D1, E1, E2, F1 | Needs no history to justify — a dead URL is dead today. |
| 3 | Take bidding off the false signal | B1 | Maximise Clicks with a CPC cap until data accumulates. |
| 4 | Apply negatives | C1, C4 | Immediate, low-risk, reversible. |
| 5 | Build the replacement keyword set | C3 | Exact and phrase from terms already paid for. No new intent. |
| 6 | Wait 7–14 days | — | The new set needs its own history before it can carry load. |
| 7 | Then restrict broad match | C3 | Only once the replacement is serving. |
| 8 | Then return to smart bidding | B1 | Once conversions reach roughly 15 per campaign per 30 days. |

## What this audit cannot tell you

| Rule | Not assessed because |
|---|---|
| A3 · No primary conversion action | Needs a conversion actions export. |
| A6 · Analytics not linked | Needs a conversion actions export, or account-level API access. |
| C1 · No negative keyword list | Needs a negative keywords export. |
| C6 · Keywords competing with each other | Needs the keywords export. |
| C7 · Ad group dilution | Needs the keywords export. |
| C8 · Dormant keyword bloat | Needs the keywords export. |
| D4 · No ad rotation | Needs an ads or ad groups export. |
| D7 · Dead ad groups | Needs the ad groups export. |
| E1 · Presence-or-interest location targeting | Not exposed in any CSV export. Needs API access, or a screenshot of each campaign's location settings. |
| E2 · Spend outside the serviceable area | Needs a geographic report export. |
| F2 · Insecure landing pages | Needs the keywords export with a Final URL column. |
| B2 · Target CPA never met | Held back until conversion tracking exists — with none installed this rule fires on everything and means nothing. |
| C5 · High-click, zero-conversion search terms | Held back until conversion tracking exists — with none installed this rule fires on everything and means nothing. |
| G3 · Spend concentrated in zero-conversion campaigns | Held back until conversion tracking exists — with none installed this rule fires on everything and means nothing. |
