# Six Sigma — why the account reports zero conversions

**Investigated 2026-09-11 against the live API and the GA4 console.**

## What is being spent

90 days, 13 June – 10 September 2026, account **2KO Africa (351-600-6867)**:

| Campaign | Status | Bidding | Spend | Clicks | Conv |
|---|---|---|---|---|---|
| SixSigma (Search) | ENABLED | Maximize Conversions | **R48,204** | 11,219 | 0 |
| PMax: Six Sigma South Africa – Remarketing | ENABLED | Maximize Conversions | **R22,091** | 22,435 | 0 |
| 30 others | removed / paused | — | R0 | 0 | 0 |

**R70,295 · 33,654 clicks · R2.09 per click · ~R23,400/month.**

Zero is not only `metrics.conversions`. `all_conversions` (which includes
secondary actions), `view_through_conversions` and `phone_calls` are all 0.0
as well, so this is not a case of conversions being recorded but excluded
from bidding.

## Why it is zero — three independent breaks

Any one of these alone would produce a clean zero.

**1. No Google Ads conversion tag on the site.** sixsigmasouthafrica.co.za
loads `gtag/js?id=G-NLFDVKD836` and nothing else — no `AW-` conversion ID, no
`gtag()` conversion calls, no GTM container.

**2. The GA4 property wired to Ads is not the one the site reports to.**

| | |
|---|---|
| Measurement ID on the website | **G-NLFDVKD836** |
| Measurement ID of *Six Sigma South Africa – GA4* (property 284730270), the property linked to Ads | **G-V1Z8XDLVBR** |

That property's stream shows *"No data received in past 48 hours"* and GA4
warns *"Data collection isn't active for your website."* It has never had the
traffic, because the site sends to a different property.

**3. The conversion action is hidden anyway.** In the Ads account,
`Six Sigma South Africa - GA4 (web) purchase` is **HIDDEN**, and
`Website sale` is **REMOVED**. The enabled primary actions are calls, local
actions and Android installs — none of which record a website enquiry.

## What this does and does not prove

It does **not** show the ads produced nothing. It shows **Google measured
nothing, and could not have measured anything**. Those 33,654 clicks may well
have produced enquiries, phone calls placed from the website, or enrolments —
all of it invisible, and unrecoverable retrospectively from the Ads account.

What it does prove is that **Maximize Conversions has been bidding with no
signal for at least 90 days**. That strategy optimises toward conversion data;
there is none, so the spend is unsteered by design.

## Done 2026-09-11

Two conversion actions created on **2KO Africa (351-600-6867)** via the API.
Note the Ads conversion ID is shared with 2kosystems.com — same Ads account,
told apart by label:

| Action | send_to |
|---|---|
| SSSA Enquiry | `AW-1006361911/p4UGCLvviPQcELe6798D` |
| SSSA Phone Click | `AW-1006361911/DcjTCL7viPQcELe6798D` |

No default conversion value is set. Course prices vary and an invented figure
is worse than none; add one when enrolment values are known.

## Site change — written, not applied

The site is `~/sixsigma2026` (Next.js, now on Cloudflare). Two small edits:

1. `src/app/layout.tsx` — `gtag.js` is already present via `GoogleAnalytics`,
   but configured only for the GA4 stream. An Ads conversion needs its own
   `gtag('config','AW-1006361911')` or `send_to` silently does nothing.
2. `src/components/ContactForm.tsx` — the success path already fires a GA4
   `generate_lead`; add a `conversion` event beside it. Direct, so it does not
   depend on the GA4→Ads import that was broken.

**Held as a patch rather than applied:** that repo has 21 modified files and
~14 untracked directories of unrelated in-progress SEO work — a new
`src/seo-kit/`, entity `sameAs` bindings with a `TODO (user-supplied)`, and a
phone-number change. The live site rebuilds from this repo, so committing
across that WIP would ship it half-finished.

    cd ~/sixsigma2026 && patch -p0 < ~/sixsigma2026-ads-conversion.patch

Apply when the SEO work is ready to go out, or on a clean branch.

## Still to do



1. **Pause the PMax remarketing.** R22,091 for 22,435 clicks at R0.98 with no
   measurable outcome and no way to steer it without conversion data.
2. **Move SixSigma off Maximize Conversions** to Maximise Clicks with a CPC
   ceiling, or Manual CPC, until there is data to bid on.
3. **Fix the measurement.** Either point the site at G-V1Z8XDLVBR, or relink
   Ads to whichever property owns G-NLFDVKD836 — then unhide the conversion
   action. Adding a direct `AW-` tag on the enquiry form is more robust than
   relying on the GA4 import.
4. **Only then** return to Maximize Conversions, once 15–30 real conversions
   have accumulated.

## Open question

Which GA4 property owns **G-NLFDVKD836** — it holds the traffic history that
could answer whether the ads ever worked. It is not in the *2ko Africa*
account under this login; property 362489648 returns "Missing permissions".
The **Six Sigma Websites** account (210547976) is the likely home.
