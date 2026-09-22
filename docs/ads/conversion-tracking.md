# Conversion tracking

## Why this exists

The Six Sigma account spent **ZAR 66,383 in 90 days with zero conversions
recorded**, on **Maximize Conversions** bidding. That combination is the worst
case: you are asking Google to optimise toward conversions while giving it no
conversion signal, so it spends the budget with no idea what a good click looks
like. 93.7% of search spend went to terms with nothing to do with Six Sigma.

This is installed on 2kosystems.com so that never happens here. **The same fix
is needed on the Six Sigma site** — see the bottom of this file.

## What is tracked

| Action | Fires when | Value |
|---|---|---|
| `enquiry` | Contact form submits successfully | ZAR 2,500 |
| `scope` | A scope resolves in the builder, once per visitor | ZAR 400 |
| `brief` | The scope brief is emailed | ZAR 250 |

The values are **expected value**, not price. They let Google optimise toward
the action closest to revenue rather than the one that happens most often. An
enquiry is worth more than a scope build, so bidding should chase enquiries.

## It is off until you switch it on

Nothing loads and nothing is sent while `NEXT_PUBLIC_GADS_ID` is unset. No
third-party script reaches the site until you actually start advertising.

## Switching it on

1. Google Ads → **Goals → Conversions → New conversion action → Website**
2. Create three actions: `Enquiry`, `Scope built`, `Brief emailed`
3. For each, choose **Use Google tag** and copy the conversion **label**
4. Set the Worker vars:

```bash
npx wrangler secret put NEXT_PUBLIC_GADS_ID
```

Then `NEXT_PUBLIC_GADS_LABEL_ENQUIRY`, `..._SCOPE`, `..._BRIEF` the same way.

> These are `NEXT_PUBLIC_` so they are inlined at build time. Redeploy after
> setting them, or they will not appear in the bundle.

5. Redeploy, submit a test enquiry, and confirm it appears in Google Ads within
   a few hours.

## Attribution

`gclid`, `wbraid`, `gbraid` and the `utm_*` parameters are captured on landing
and held for the session, so a conversion three pages later still attributes to
the ad that paid for the visit. Without that, only same-page conversions
attribute and search ads look far worse than they are.

The values are passed through to the internal notification email under **Came
from**, so every enquiry tells you which campaign and search term produced it.
That is what lets you tell a ZAR 2,000 cost-per-enquiry that converts from one
that does not.

## Then do the same on Six Sigma

Nothing on that account can be optimised until it has this. In order:

1. Install a conversion action on the Six Sigma site — enrolment enquiry at
   minimum, a booking or payment if one exists
2. Only then let **Maximize Conversions** bidding run; until then switch those
   campaigns to **Maximize Clicks** or manual CPC, which at least do what they
   say
3. Pause `PMax: Six Sigma South Africa - Remarketing` (ZAR 22,109, no signal)
   until step 1 is done

Apply the negative keyword list at the same time — see `negative-keywords.md`.
