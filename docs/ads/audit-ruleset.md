# Google Ads Audit — rule set v1

Derived from the SixSigma remediation (CID 351-600-6867, Aug 2026). Every
rule below fired, or would have fired, on that account.

**Design constraint:** every rule must be either (a) answerable from the Ads
API with no human judgement, or (b) explicitly marked `MANUAL`. A rule that
needs an opinion doesn't belong in a productised audit.

**Qualification floor:** accounts under **R10,000/month** don't clear the fee.
Don't audit them.

---

## 1. The three-tier waste model

This is the commercial crux. Get it wrong and every invoice gets argued down.

| Tier | Definition | Client reaction |
|---|---|---|
| **Confirmed waste** | Spend on traffic that could never have bought, provable by pointing at the search term / geo / network | "…yeah, that's not us" |
| **Probable waste** | Spend with strong negative signal but no proof of intent mismatch | "maybe" |
| **Unmeasured** | Spend that may be fine but cannot be evaluated because nothing is tracked | argue-free, because you're not claiming it |

**Only Tier 1 goes in the headline number.** Tier 3 is the single biggest
number in most accounts and the temptation is to call it waste. Don't. The
moment you claim unmeasured spend as savings, the client says "so you're
guessing," and you've lost the room.

```
confirmed_waste_90d =
    spend_on_excluded_search_terms
  + spend_outside_serviceable_geography
  + spend_on_search_partners_or_display_at_>3x_search_CPA
  + spend_on_dead_final_urls

recoverable = confirmed_waste_90d × 0.75      # never 100%: negatives
                                               # always catch some good traffic
annualised  = recoverable × 4                  # flag seasonality explicitly
```

The `0.75` is defensible and should be stated out loud in the report. A
report claiming 100% recovery reads as a sales document.

### Reframe the outcome — do not sell "spend less"

Nobody wants a smaller ad budget. They want more leads for the same budget.

> "We are not going to cut your spend. We are going to move 43% of it off
> traffic that can never buy you anything and onto traffic that can."

Same arithmetic, opposite emotional register, and it protects the retainer:
"cut spend" is a one-off, "redirect spend" is ongoing.

---

## 2. Rules

Severity: **C**ritical / **H**igh / **M**edium / **L**ow.
`AUTO` = API-derivable. `MANUAL` = needs a look at the site.

### A. Measurement — weight 30

Everything downstream is uninterpretable until this passes.

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| A1 | No conversion actions configured | `conversion_action` count = 0 | C | AUTO |
| A2 | Tracking exists but dead | 0 conversions in 90d **and** spend > R15,000 | C | AUTO |
| A3 | No primary conversion action | all actions `primary_for_goal = false` | H | AUTO |
| A4 | Proxy conversions only | only actions are pageview / time-on-site / scroll | H | AUTO |
| A5 | No call tracking | business has a phone CTA but no call conversion action | H | MANUAL |
| A6 | GA4 not linked | no Analytics link on the account | M | AUTO |
| A7 | No click-ID capture | site does not persist `gclid` / `wbraid` / `gbraid` | M | MANUAL |
| A8 | Enhanced conversions off | available and not enabled | L | AUTO |

> A1+A2 together are the SixSigma finding: R66,383 over 90 days, zero
> conversions recorded, because nothing was ever installed.

### B. Bidding — weight 20

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| B1 | **Smart bidding on no signal** | strategy ∈ {MAXIMIZE_CONVERSIONS, MAXIMIZE_CONVERSION_VALUE, TARGET_CPA, TARGET_ROAS} **and** conversions(30d) < 15 | C | AUTO |
| B2 | tCPA never met | `target_cpa` set, actual CPA > 2× target for 60d | H | AUTO |
| B3 | Uncapped Maximize Clicks | strategy = MAXIMIZE_CLICKS, no `cpc_bid_ceiling`, spend > R10,000/mo | M | AUTO |
| B4 | In learning | bid strategy changed < 14d ago | — | AUTO |
| B5 | Mismatched portfolio | one portfolio strategy across campaigns whose CPAs differ > 3× | M | AUTO |

> **B1 is the highest-yield rule in the whole set.** It is extremely common,
> it is a single dropdown to fix, and the explanation lands instantly:
> *the algorithm is being told to optimise toward an outcome it cannot see.*
>
> B4 suppresses B1/B2 — never judge a strategy inside its learning period.

### C. Targeting — weight 20

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| C1 | Negative list absent | negative keywords < 20 across account | H | AUTO |
| C2 | No shared negative list | zero shared sets applied | M | AUTO |
| C3 | Match-type imbalance | broad > 60% of spend **and** exact+phrase < 20% | H | AUTO |
| C4 | **Excluded-term spend** | % of 90d spend on terms hitting the exclusion taxonomy (§3) | C | AUTO |
| C5 | Zero-conversion terms | terms with ≥ 20 clicks, 0 conv — *suppressed unless A passes* | H | AUTO |
| C6 | Self-competition | same keyword text active in > 1 ad group in the same campaign | M | AUTO |
| C7 | Ad-group dilution | > 20 active keywords in one ad group | M | AUTO |
| C8 | Dormant bloat | > 100 keywords with 0 impressions in 90d | L | AUTO |
| C9 | Remarketing list too small | list size below serving threshold | L | AUTO |

> SixSigma: 955 keywords across 3 ad groups, 4 negatives, broad at 95.4% of
> keyword spend. C1, C3, C7 and C8 all fired hard.
>
> **C3 does not mean "pause broad."** See §5 — order matters, and pausing
> broad before a replacement set exists takes traffic to zero.

### D. Structure — weight 10

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| D1 | **PMax without signal** | PMax campaign active, conversions(90d) = 0 | C | AUTO |
| D2 | PMax unbounded | PMax with no brand exclusions / negative list | H | AUTO |
| D3 | Search Partners / Display bleed | non-search share > 15% of a Search campaign's spend at > 3× CPA | H | AUTO |
| D4 | No ad rotation | ad group with < 2 enabled ads | M | AUTO |
| D5 | Poor ad strength | RSA `ad_strength` ∈ {POOR, AVERAGE} | M | AUTO |
| D6 | Missing extensions | no sitelinks, or no callouts | M | AUTO |
| D7 | Dead ad groups | 0 impressions in 90d | L | AUTO |

> SixSigma: `PMax: Six Sigma South Africa - Remarketing`, R22,109 over 90
> days, no conversion signal to steer on. D1 is nearly always pure Tier-1
> waste — PMax with no signal is spend without steering.

### E. Geography & schedule — weight 10

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| E1 | **Presence-or-interest targeting** | `positive_geo_target_type = PRESENCE_OR_INTEREST` | C | AUTO |
| E2 | Unserviceable geography | spend in locations outside stated service area | C | AUTO |
| E3 | Language over-targeting | targeted languages ⊄ site languages | M | AUTO |
| E4 | 24/7 schedule | ads serve outside business hours — *suppressed unless A passes* | L | AUTO |

> **E1 is the most under-appreciated rule for SA advertisers.** The default
> setting serves your ads to anyone *interested in* South Africa, anywhere on
> earth. Switching to Presence-only is one radio button and routinely removes
> 10–25% of spend with no loss of serviceable traffic. Near-pure Tier 1.

### F. Landing pages — weight 5

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| F1 | Dead final URL | non-200 response | C | AUTO |
| F2 | **Insecure landing page** | final URL scheme is `http://` | H | AUTO |
| F3 | Slow page | LCP > 4s on mobile | M | MANUAL |
| F4 | No CTA above fold | no form or tel: link in first viewport | H | MANUAL |
| F5 | Message mismatch | ad headline terms absent from LP `<h1>` | M | MANUAL |

> SixSigma final URLs are `http://www.sixsigmasouthafrica.co.za/…`. F2 fires.
> Every paid click lands on a page the browser flags as not secure.

### G. Budget — weight 5

| ID | Rule | Fires when | Sev | |
|---|---|---|---|---|
| G1 | Budget-limited winner | campaign `budget_lost_impression_share` > 20% while another underspends | H | AUTO |
| G2 | Budget in the worst campaign | > 40% of account spend in the worst-CPA campaign | H | AUTO |
| G3 | Zero-conversion concentration | > 50% of spend in campaigns with 0 conv — *suppressed unless A passes* | H | AUTO |

---

## 3. Exclusion taxonomy (drives C4)

Search-term tokens that mark traffic as unable to buy. Each bucket must be
switchable per client — `free` is fatal for a paid course, fine for a
freemium SaaS.

| Bucket | Tokens | Default |
|---|---|---|
| Employment | job, jobs, vacancy, salary, cv, resume, career, hiring, internship, learnership | ON |
| Free intent | free, gratis, no cost, trial, freeware, crack, torrent | ON |
| Research intent | what is, meaning, definition, wikipedia, pdf, ppt, sample, example, template, syllabus | ON |
| DIY | diy, how to make, tutorial, guide, self study, do it yourself | ON |
| Price-floor | cheap, cheapest, discount, bargain, second hand, used | REVIEW |
| Wrong geography | competitor cities/countries outside service area | ON |
| Competitor brands | *(per client)* | OFF unless conquest strategy is deliberate |
| Own brand | *(per client)* | REVIEW — brand traffic is usually cheap conversion, not waste |

Each bucket is validated against the client's own 90-day search terms
**before** it goes live, and the report states what each bucket would have
blocked. The SixSigma list ran to 69 negatives after that filtering.

---

## 4. Score

```
category_score = 100 − Σ(severity_penalty × spend_at_risk_share)
    penalties: C=40  H=25  M=10  L=4      (capped at 100 per category)

composite = Σ(category_score × weight) / 100
    A 30 · B 20 · C 20 · D 10 · E 10 · F 5 · G 5
```

| Composite | Grade | Meaning |
|---|---|---|
| 85–100 | A | Well run. Optimise at the margin. |
| 70–84 | B | Healthy with specific leaks. |
| 50–69 | C | Structurally sound, materially leaking. |
| 30–49 | D | Spending without steering. |
| 0–29 | F | The account cannot tell you whether it works. |

SixSigma at audit scored in the **F** band, driven almost entirely by
category A at weight 30.

---

## 5. Remediation order — fixed, not severity-ranked

This is the part most audits get wrong. The fixes are **dependent**. Ranking
by rand-value and working down actively causes damage.

1. **Install measurement** (A1–A5). Nothing else can be evaluated. No
   exceptions, no parallel tracks.
2. **Stop the unsteered spend** (D1, E1, E2, F1). E2 and F1 are Tier 1; D1 is
   Tier 3 but still urgent, because an unsteerable campaign cannot improve.
   None of these need history to justify — a dead URL is dead today.
3. **Take bidding off the false signal** (B1). Move to Maximise Clicks with a
   CPC cap until conversion data accumulates. Honest beats optimistic.
4. **Apply negatives** (C1, C4). Immediate, low-risk, reversible.
5. **Build the replacement keyword set** (C3). Exact + phrase drawn *only*
   from search terms the account has already paid for. No new intent.
6. **Wait 7–14 days.** The new set needs its own history.
7. **Then** restrict broad match.
8. **Then**, once conversions accumulate (≥ 15/campaign/30d), return to smart
   bidding.

> Steps 5–7 exist because of a mistake I nearly made on SixSigma: broad match
> was 95.4% of spend, and the plan said "pause broad." Doing it that day
> would have taken the campaign to roughly zero impressions, because the
> waste and the working traffic were in the same bucket. The replacement set
> has to be carrying load *before* the old one comes out.

---

## 6. Inputs

**Route A — API (preferred).** Read-only link to the client's account.
No developer token needed on their side; ours covers it. Zero API cost.

**Route B — CSV export.** For clients who won't link. Five exports, all from
the Ads UI, 90-day window:
`campaigns` · `keywords` · `search terms` · `ad groups` · `conversion actions`

Route B loses D5, F1–F2 and part of E. Report says so.

### GAQL starting points

Field names need verifying against the current API version before this ships.

```sql
-- A1/A2: does measurement exist, and is it alive
SELECT conversion_action.name, conversion_action.status,
       conversion_action.primary_for_goal, metrics.all_conversions
FROM conversion_action

-- B1: smart bidding without signal
SELECT campaign.name, campaign.bidding_strategy_type,
       metrics.conversions, metrics.cost_micros
FROM campaign
WHERE segments.date DURING LAST_30_DAYS

-- C3/C4: match-type split and excluded-term spend
SELECT search_term_view.search_term, segments.keyword.info.match_type,
       metrics.clicks, metrics.cost_micros
FROM search_term_view
WHERE segments.date DURING LAST_90_DAYS

-- E1: presence vs presence-or-interest
SELECT campaign.name,
       campaign.geo_target_type_setting.positive_geo_target_type
FROM campaign

-- D3: network bleed
SELECT campaign.name, campaign.network_settings.target_content_network,
       campaign.network_settings.target_partner_search_network,
       segments.ad_network_type, metrics.cost_micros, metrics.conversions
FROM campaign
WHERE segments.date DURING LAST_90_DAYS
```

---

## 7. Report shape

One page. Six blocks, in this order:

1. **The number.** Confirmed waste, 90 days, and annualised. One figure, set large.
2. **The one-line diagnosis.** *"Your account has spent R66,383 in 90 days and cannot tell you whether a single person contacted you."*
3. **Findings**, ranked by rand at risk, each with the rule ID, the evidence, and the fix.
4. **Remediation order** — §5, as a numbered sequence with a timeline.
5. **Price to fix.** Published, fixed, on the page. No "contact us for a proposal."
6. **What we cannot tell you yet.** The Tier-3 number, named as unmeasured rather than wasted, with what it would take to find out.

Block 6 is the differentiator. Every agency's free audit is six pages of
everything-is-broken. Stating plainly what you *don't* know is the thing that
makes blocks 1–3 credible.

---

## 8. Open questions before this generalises

- **n=1.** Every threshold here is calibrated against one account. Ten audits
  minimum before any of these numbers are load-bearing.
- Are the C4 buckets right for non-training verticals? Untested outside education.
- Is 0.75 the right recovery factor? Guess, not a measurement. Needs the
  before/after on SixSigma to calibrate — which we'll have by mid-September.
- What proportion of R10k+/month SA accounts actually fail A1? If it's 60%+,
  B1 alone carries the business. If it's 15%, the pitch needs rebuilding
  around C and E.
