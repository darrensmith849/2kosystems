# Google Ads API access — application pack

**Status as at 2026-08-28: submitted, pending Google review.**

| | |
|---|---|
| Manager account (MCC) | **2KO Group — 434-363-4049** |
| Linked sub-accounts | 2KO Africa (351-600-6867), Impart Agency (672-553-2284) |
| Developer token | Created. Access level **Explorer** |
| Google Cloud project | `ko-ads-api` · **number 41808878114** · Google Ads API enabled |
| Basic Access application | **Submitted and acknowledged by Google, 2026-08-28** |
| Expected decision | Initial review within ~5 business days |

Google may come back asking for more detail rather than deciding outright, so
watch **darren@2kosystems.com** — that is the address on the application, and
an unanswered request stalls the whole thing.

**Optional accelerator.** Google offers to expedite the review if you complete
[brand verification](https://developers.google.com/google-ads/api/docs/api-policy/brand-verification)
on the Cloud project. That means configuring the OAuth consent screen and
verifying ownership of 2kosystems.com. Worth doing regardless, because the
OAuth consent screen is needed anyway to generate the refresh token once the
token is approved — but it is not required, and the standard five-day review
already fits inside the week.

The developer token itself lives in the API Center under *View token*. It is a
**real secret** — unlike the conversion IDs in `.env.production`, it does not
get committed. Put it in `.env` as `GOOGLE_ADS_DEVELOPER_TOKEN`.

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
