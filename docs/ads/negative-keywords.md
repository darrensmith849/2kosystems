# Six Sigma account — negative keyword list

Generated from the 90-day search terms report (2026-05-30 → 2026-08-27),
2,876 search terms, ZAR 16,952 of search spend.

Every entry below was tested against the report first: the "kills" column is
how much *legitimate Six Sigma spend* each negative would have blocked. Almost
all are zero. Nothing here is guesswork.

**Add these as a shared negative keyword list, applied to every campaign.**
Tools → Shared library → Negative keyword lists → create → apply to all.

---

## 1. Competitor and institution names — PHRASE match

Biggest single leak. `iq academy` alone cost **ZAR 3,965** in 90 days.
Collateral damage: **ZAR 0.00** across every one of these.

```
"iq academy"
"mancosa"
"stadio"
"rosebank college"
"regenesys"
"oxbridge"
"boston college"
"damelin"
"milpark"
"regent business school"
"abethu"
"accelerate management school"
"unisa"
"varsity college"
"belgium campus"
"tuks"
```

## 2. Institution-type words — PHRASE match

These catch the long tail of colleges you haven't listed yet.
Combined saving: **ZAR 7,353**. Combined damage: **ZAR 1.38**.

```
"academy"
"college"
"university"
"school"
"institute"
"campus"
"distance learning"
```

> Note: `academy` alone saves ZAR 4,779 and costs ZAR 0.06. Add it.

## 3. Free, funded and accreditation-body searches — PHRASE match

People looking for funding or checking accreditation bodies, not buying.
Saving: **ZAR 1,585**.

```
"free"
"seta"
"merseta"
"qcto"
"nqf"
"bursary"
"learnership"
"internship"
"funded"
"sponsorship"
```

## 4. Job seekers — PHRASE match

```
"jobs"
"job"
"vacancy"
"vacancies"
"salary"
"cv"
"resume"
"hiring"
"recruitment"
```

## 5. Navigational / research intent — PHRASE match

Someone finding an address is not someone buying a course.
Saving: **ZAR 1,380**.

```
"near me"
"contact details"
"contact number"
"address"
"opening hours"
"login"
"portal"
"student portal"
"what is"
"meaning"
"definition"
"wikipedia"
"pdf"
"download"
"template"
"example"
```

## 6. Unrelated training categories — PHRASE match

```
"first aid"
"forklift"
"welding"
"plumbing"
"electrician"
"driving"
"pmi"
"prince2"
"scrum"
"cipd"
"payroll"
```

---

## What this list does NOT fix

Negatives are a patch. **The actual problem is match type.**

Broad match is **80.4% of spend** (ZAR 13,634 of 16,952). Exact match is
**4.6%** (ZAR 779). Your exact-match Six Sigma terms cost **ZAR 0.48–0.56 per
click**; `iq academy` on broad match cost **ZAR 25.74 per click** — fifty times
more for traffic that will never buy.

Even with every negative above, broad match will keep finding new ways to spend
money on things you did not ask for. The list buys time; the match-type change
is the fix.

**Do all four, in this order:**

1. Add this negative list to every campaign
2. Pause all broad match keywords; keep exact and phrase
3. Install conversion tracking (see conversion-tracking.md) — nothing can be
   optimised until this exists
4. Pause `PMax: Six Sigma South Africa - Remarketing` until step 3 is done —
   ZAR 22,109 spent, zero conversion signal to optimise against

## Do not add these

`training`, `course`, `courses`, `classes`, `online`, `business`,
`management`, `certification`, `johannesburg`, `pretoria`, `cape town`,
`durban`, `south africa`.

They appear in the waste, but they also appear in every term you actually
want. Blocking them would cost more than it saves. Match type handles these,
not negatives.
