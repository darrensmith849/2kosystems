# Google Ads API access

**Status: APPROVED for Basic Access, 2026-08-30.** Two business days after
submission, not the five Google quoted.

| | |
|---|---|
| Manager account (MCC) | **2KO Group — 434-363-4049** |
| Linked sub-accounts | 2KO Africa (351-600-6867), Impart Agency (672-553-2284) |
| Developer token | **Basic Access — approved and activated 2026-08-30** |
| Daily quota | **15,000 operations.** Do not apply for Standard until usage genuinely exceeds this; Google only grants it against demonstrated need |
| Google Cloud project | `2ko-ads-api` · **number 41808878114** · Google Ads API enabled |
| Submitted | 2026-08-28 |

The token string itself lives in the API Center (Tools & Settings → Setup →
API Center) on the manager account. Treat it as a password: it goes in `.env`
as `GOOGLE_ADS_DEVELOPER_TOKEN` and is never committed.

**Keep the developer contact email current.** Google's approval mail is
explicit that this is their only route for reaching us about the token, and a
bounced address is how tokens get suspended without anyone noticing.

## OAuth setup — done 2026-09-07

| | |
|---|---|
| Consent screen | Configured. App name **2KO Group Ads Tools** |
| Branding | Home `https://www.2kosystems.com`, privacy `/privacy`, terms `/terms`, authorised domain `2kosystems.com` |
| OAuth client | **ads-cli**, type Desktop, on project 2ko-ads-api |
| Test user | darren.smith.210193@gmail.com |
| Publishing status | **In production** |

Publishing mattered more than it looks. Google, verbatim:

> A Google Cloud Platform project with an OAuth consent screen configured for
> an **external** user type and a publishing status of **"Testing"** is issued
> a **refresh token expiring in 7 days**, unless the only OAuth scopes
> requested are a subset of name, email address, and user profile.

`https://www.googleapis.com/auth/adwords` is not in that subset, and the
manager account is on gmail.com so there is no Workspace and no Internal
option. Left on Testing it works, and then stops a week later looking like a
broken script. In production, the refresh token persists.

The consent screen still shows an "unverified app" warning, which is expected
while only the owner uses it — click through Advanced. Verification is only
enforced past the 100-user cap.

`/terms` was built for this. It did not exist, and it was the one Branding
field the site could not already supply.

## What is left before the token can actually call anything

Approval unlocks the token; it does not by itself authenticate anything. Three
steps remain, and only the first needs Darren:

1. ~~Copy the token into `.env`~~ — done.
2. **OAuth client** on the `2ko-ads-api` Cloud project. As at 2026-09-07 the
   Google Auth Platform there is **not configured at all** — the Credentials
   page lists no OAuth clients — so this is: configure the consent screen,
   publish it (see the warning above), then create an OAuth 2.0 Client ID of
   type *Desktop app*. Yields a client ID and client secret.
3. **Refresh token**: run the OAuth flow once against that client to mint a
   refresh token. After this the three credentials together authenticate every
   call without further sign-in.

Brand verification is no longer needed as an accelerator — it existed to speed
the review, and the review is done.

## Why Basic Access is enough

Basic covers 15,000 operations a day. The audit tool reads campaign, keyword
and search-term data for accounts we manage; a full account pull is in the low
hundreds of operations. Standard is for platforms serving many external
advertisers, and applying without the usage to justify it is refused.

Internal-only agency tooling is also exempt from the Required Minimum
Functionality categories, which is what makes the audit product viable without
building a general-purpose Ads management interface.

---

## How it went (original blocker, now resolved)

The API Center does not exist on a standard Google Ads account. Checked on
2026-08-28 against every account on `darren.smith.210193@gmail.com`:

| Account | CID | Manager? |
|---|---|---|
| 2KO Africa | 351-600-6867 | No |
| Impart Agency | 672-553-2284 | No |
| 790security | 858-930-2650 | Cancelled |
| (unnamed) | 308-275-8060 | Cancelled |
| (unnamed) | 122-174-6117 | Cancelled |

Both live accounts return *"The API Center is only available to manager
accounts."* There is no manager account to apply from, so one has to be
created — and creating accounts is the one part of this I will not do on
your behalf. It takes about three minutes.

---

## Step 1 — create the manager account (you, ~3 min)

https://ads.google.com/home/tools/manager-accounts/ → **Create a manager account**

- Sign in as `darren.smith.210193@gmail.com` so it sits with the existing accounts
- Name: **2KO Group**. Not a personal name. When you later ask a prospect to
  grant access to their account, the invitation shows them this name and CID —
  "2KO Group" reads as the company whose site they just looked at, "Darren
  Smith" reads as a freelancer or a phishing attempt. It also has to match the
  company on the token application, and it sits above 2KO Africa, Impart Agency
  and any client accounts, so it wants the parent name rather than one brand
  underneath it. The name *can* be changed later, unlike the two settings below.
- Billing country: South Africa · Currency: ZAR · Time zone: Johannesburg
- Use it to: *manage other people's accounts*

Currency and time zone **cannot be changed afterwards**. Get them right.

## Step 2 — link the existing accounts

Inside the new manager account: **Accounts → + → Link existing account**, add
`351-600-6867` and `672-553-2284`. Google requires all active accounts to be
linked to the manager before it will grant Basic access.

## Step 3 — apply for the token

Manager account → **Admin → API Center**. Signing up grants **Test access**
immediately. Test access only reaches *test* accounts, so it cannot read
2KO Africa — you then apply in the same screen for **Basic access**, which is
the one that matters.

| Level | Reaches | Ops/day |
|---|---|---|
| Test | Test accounts only | 15,000 |
| **Basic** ← what we need | Real accounts | 15,000 |
| Standard | Real accounts | Unlimited |

15,000 operations a day is far more than the audit engine needs — a full
account pull is a few hundred.

---

## Answers to paste into the application

**Company** — 2KO Group (2KO Systems), South Africa
**Website** — https://2kosystems.com
**Contact** — darren@2kosystems.com

**How will you use the Google Ads API?**

> We manage our own Google Ads accounts and those of South African client
> businesses on their behalf, as an agency. The API is used for two things.
>
> First, internal reporting and account hygiene across our own accounts:
> pulling campaign, keyword and search-term reports, applying negative keyword
> lists, and monitoring bid strategy and conversion tracking configuration.
>
> Second, a diagnostic audit we run for prospective clients. With the account
> owner's permission we read campaign, keyword, search-term, geographic and
> conversion-action data, score it against a fixed published rule set, and
> deliver a written report identifying wasted spend and misconfiguration. The
> client receives a document. They do not log into anything we operate, and no
> Google Ads data is exposed to any third party.

**Who uses the tool?** — 2KO staff only. Clients receive reports, not access.

**Type of tool** — Internal-only. We use the API to manage accounts we or our
clients own, as their agency. There is no external-facing platform.

---

## Why the classification matters

Google's [Required Minimum Functionality](https://developers.google.com/google-ads/api/docs/rmf)
rules bite differently by tool type:

| Tool type | RMF applies |
|---|---|
| Full-service platform (clients log in and manage their own accounts) | All three categories |
| Reporting-only (a dashboard you give clients) | Reporting functionality |
| **Internal-only (agency use)** | **Exempt from all of it** |

The audit business is **internal-only**: we run the audit, the client gets a
document, nobody logs into anything. That exempts it from RMF entirely, which
would otherwise force a long list of features into a tool that only needs to
read and score.

The classification has to stay true. The day we hand clients a login to a live
dashboard, it becomes a reporting-only tool and Reporting RMF applies — every
report we show must then display Google's full required field set.

---

## When the token arrives

Basic access is typically reviewed within a few business days. Then:

1. Put the token in `.env` as `GOOGLE_ADS_DEVELOPER_TOKEN` — **this one is a
   real secret**, unlike the conversion IDs in `.env.production`. It does not
   get committed.
2. Create an OAuth client (Desktop app) in Google Cloud Console and generate a
   refresh token for `darren.smith.210193@gmail.com`.
3. Point the audit engine's Route A at it. `src/lib/audit/` already accepts
   reports by kind, so the API path only has to produce the same row shapes the
   CSV parser emits — see the GAQL starting points in
   [audit-ruleset.md](audit-ruleset.md#6-inputs).

That last step is what turns the audit from "email me five CSV exports" into
"connect your account, get the number in ninety seconds" — which is the version
that works as a demo on the site.
