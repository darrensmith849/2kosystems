# Audit — Sigmafy project submissions as a source of pitch signals

> ## ⚠️ SUPERSEDED IN PART — corrected 20 August 2026 after running against production
>
> The schema analysis below is accurate. **The premise is not.** Production holds only
> **5 project charters and 0 control plans** — the structured tool system
> (`sf_tool_outputs`) went live 12 May 2026 and holds just 54 rows in total.
>
> Queries Q2 and Q3 in Section 5 therefore return 5 rows and 0 rows respectively. Do not
> use them as written.
>
> The real corpus is **2,428 free-text solutions averaging 2,600 characters** (6.3M
> characters total) in `sf_proj_solutions.description`, across 247 projects at 59
> companies. The signal is very likely there, but it is prose, not queryable fields —
> extraction needs a language model over text, not SQL. See Section 9 for the corrected
> position.

**Question asked.** Can the projects learners submit through Sigmafy tell us which pitches
to make to which companies?

**Short answer.** Yes — structurally it is the strongest lead asset in the group, better
than the client list itself, because each submission is a named broken process with a rand
value the client wrote themselves. But two things block acting on it today: there is no real
data on this machine to audit, and there is a consent problem that has to be settled before
any of it is used for sales.

---

## 1. What I could and could not check

**Could not:** run the actual audit. The local database (`laravel_sigmafy_2`) holds
development seed data only — 5 projects, 8 solutions, **0 companies**, 0 tool outputs, and
faker content throughout (section titles like `vitae-nam-error`, topics about
photosynthesis). No production dump is present, and `.env` points only at `127.0.0.1`. So
nothing below is a finding about your real submissions; it is a finding about what the
system captures.

**Could:** audit the schema, which is the durable part. The three queries in Section 5 were
executed against the live schema and run clean — they return 0 rows here, and will return
your real corpus unchanged when pointed at production.

---

## 2. The asset

Every DMAIC project a learner submits carries a **Project Charter**
(`SolutionTypeEnum::ProjectCharter`), and the charter's fields are, almost exactly, a
qualified sales brief:

| Charter field | What it is in sales terms |
|---|---|
| `problem_statement` | A named broken process, quantified, at a named employer — written by an insider, not by us |
| `business_case` | Their own words on why it matters to the business |
| `estimated_savings` | **A rand figure the client's own employee attached to the problem** |
| `goal_statement` | The target they already committed to |
| `scope_in` / `scope_out` | Boundaries already drawn — most of a pilot scope |
| `sponsor` | **The executive who backed it** — usually the exact person who signs off a system build |
| `project_lead` / `team_members` | The internal champion, already trained in our method |
| `data_source`, `collection_period` | Evidence the numbers are real |

The charter is joined to a company through
`sf_projs → sf_class_id → sf_class_sf_company → sf_companies` (and there is a direct
`sf_company_sf_proj` pivot as well), so every problem statement is attributable to an
employer. `sf_projs.industry` and `SfIndustry` give the sector. Class pivots carry
`user_type = 'company_sponsor'` and `'company_admin'`, which is a named executive contact
already in a relationship with us.

This is the "mine your own back catalogue" idea from the earlier strategy note, except far
better than I assumed: we do not have to reconstruct which processes are broken from old
consulting notes. **The client documented it for us, quantified it, and named their own
sponsor**, as a condition of getting certified.

---

## 3. The signal map — which tool implies which pitch

The DMAIC tool set (`SolutionTypeEnum`) is effectively a pre-built taxonomy of software
opportunities. Each tool output implies a different pitch:

| Tool in the submission | What it evidences | Pitch it supports |
|---|---|---|
| `control_plan` | How they promised to *sustain* the fix — `control_method`, `measurement_method`, `frequency`, `reaction_plan` | **The strongest signal in the system.** Any control plan whose control method is manual (spreadsheet, checklist, supervisor sign-off, weekly review) is a system waiting to be built. The improvement decays the moment attention moves on — and everyone involved already knows it |
| `project_charter` | Problem, value, sponsor | The direct approach: "you costed this at R X and fixed it manually — we can make the fix permanent" |
| `process_map` / `sipoc` | The as-is workflow with handoffs | Workflow automation. The map is 80% of the current-state section of a Process Audit, already drawn |
| `fishbone` / `five_whys` | Root causes | Where the causes are *information* causes — no visibility, no ownership, data re-entry — the fix is software, not training |
| `fmea` | Failure modes with detection ratings | Poor detection scores are an alerting/monitoring build |
| `pareto_chart` / `control_chart` / `process_capability` | Where the pain concentrates, and drift over time | Dashboard and reporting builds; also proves which problem to attack first |
| `msa` / `msa_gage_rr` | Measurement reliability problems | Capture-at-source builds |

**The single best query to run first** is the control plan one (Q3). A manual control method
is an admission, in the client's own document, that the improvement depends on someone
remembering. That is the least arguable pitch we could ever make, and it is evidenced rather
than asserted.

---

## 4. What the corpus makes possible that a client list does not

1. **Pitch by named process, not by category.** Not "we build workflow systems" but "your
   Green Belt project on changeover time — the control plan is a weekly manual check."
2. **The rand value is pre-agreed.** We never have to argue the size of the problem. Their
   employee wrote the number and their sponsor approved it.
3. **The sponsor is the systems buyer.** This solves the buyer-mismatch problem in the
   earlier strategy note directly — the charter names them.
4. **Recency and decay are measurable.** A project completed 18 months ago whose control
   plan was manual has almost certainly regressed. That is a defensible reason to make
   contact, and a testable one.
5. **Sector patterns fall out for free.** Grouping problem statements by `industry` shows
   which pitches to build repeatable products around rather than one-off builds.

---

## 5. Queries to run against production

All three were executed against the live schema and are syntactically valid. They assume
single-row tools store their row at `$[0]` of the `structured_data` JSON array — true for
`project_charter`, which has `minRows() === 1`. Verify against one known project before
trusting the output at scale.

**Q1 — Which companies have the most completed projects (ranking the base)**

```sql
SELECT c.id AS company_id, c.name AS company,
       COUNT(DISTINCT p.id) AS projects,
       SUM(CASE WHEN p.status IN ('approved','completed') THEN 1 ELSE 0 END) AS completed,
       MAX(p.end_date) AS latest_project
FROM sf_projs p
JOIN sf_class_sf_company csc ON csc.sf_class_id = p.sf_class_id
JOIN sf_companies c ON c.id = csc.sf_company_id
WHERE p.is_preview = 0
GROUP BY c.id, c.name
ORDER BY completed DESC, projects DESC;
```

**Q2 — Every charter: the problem, the value, the sponsor**

```sql
SELECT p.id AS project_id, c.name AS company, p.industry, p.status,
       JSON_UNQUOTE(JSON_EXTRACT(t.structured_data, '$[0].project_title'))      AS project_title,
       JSON_UNQUOTE(JSON_EXTRACT(t.structured_data, '$[0].problem_statement'))  AS problem_statement,
       JSON_UNQUOTE(JSON_EXTRACT(t.structured_data, '$[0].estimated_savings'))  AS estimated_savings,
       JSON_UNQUOTE(JSON_EXTRACT(t.structured_data, '$[0].sponsor'))            AS sponsor,
       t.created_at
FROM sf_tool_outputs t
JOIN sf_projs p ON p.id = t.sf_proj_id
LEFT JOIN sf_class_sf_company csc ON csc.sf_class_id = p.sf_class_id
LEFT JOIN sf_companies c ON c.id = csc.sf_company_id
WHERE t.solution_type = 'project_charter' AND p.is_preview = 0
ORDER BY t.created_at DESC;
```

**Q3 — Control plans that depend on manual effort (the priority list)**

```sql
SELECT c.name AS company, p.id AS project_id,
       JSON_UNQUOTE(JSON_EXTRACT(row_data, '$.process_step'))       AS process_step,
       JSON_UNQUOTE(JSON_EXTRACT(row_data, '$.control_method'))     AS control_method,
       JSON_UNQUOTE(JSON_EXTRACT(row_data, '$.measurement_method')) AS measurement_method,
       JSON_UNQUOTE(JSON_EXTRACT(row_data, '$.frequency'))          AS frequency
FROM sf_tool_outputs t
JOIN JSON_TABLE(t.structured_data, '$[*]' COLUMNS (row_data JSON PATH '$')) AS jt
JOIN sf_projs p ON p.id = t.sf_proj_id
LEFT JOIN sf_class_sf_company csc ON csc.sf_class_id = p.sf_class_id
LEFT JOIN sf_companies c ON c.id = csc.sf_company_id
WHERE t.solution_type = 'control_plan' AND p.is_preview = 0;
```

Then filter `control_method` for manual language — spreadsheet, Excel, checklist, manual,
visual, sign-off, weekly review, audit. Those rows, ranked by the charter's
`estimated_savings`, are the pitch list.

**Caveat on `estimated_savings`:** it is a free-text field, so expect "R450 000",
"450k", "±R450,000 p.a." and "TBC" in the same column. Normalise before ranking, and treat
anything unparseable as unranked rather than zero.

---

## 6. A scoring model for ranking accounts

Once Q1–Q3 return real rows, rank companies on four factors rather than on savings alone:

| Factor | Why |
|---|---|
| Completed projects (volume) | Depth of relationship and number of shots on goal |
| Manual control methods (count) | Density of evidenced, decaying fixes |
| Total charter-estimated savings | Size of the prize, in their own numbers |
| Months since latest project | Decay likelihood — and a natural reason to make contact |

Work the top slice only. The rest gets the low-touch nurture, as before.

---

## 7. The blocker — settle this before anything else

**Learners submitted this data to get certified, not to be sold to.** It contains their
employer's operational and financial detail, supplied in a training context. Under POPIA,
purpose limitation applies: personal information collected for one purpose should not be
repurposed for another without a lawful basis. There may also be confidentiality terms in
the corporate training agreements that cover project content specifically — I have not seen
those contracts and cannot assess them.

I am not qualified to give the legal answer, and this needs one before the pitch list is
used. But three routes look materially safer than bulk outbound, in order of preference:

1. **Give it back to them.** Show the sponsor *their own* company's projects and control
   plans in a review, as a service they already paid for. The pitch then arises from a
   conversation about their own data rather than from us mining it. This is the strongest
   option commercially as well as legally — it is genuinely useful to them.
2. **Aggregate and anonymised for targeting.** Use the corpus to decide *which pitches and
   products to build* by sector, without naming individuals or quoting specific submissions
   outbound. Very low risk, still valuable.
3. **Consent at source.** Add an opt-in at project submission or class enrolment covering
   follow-up on implementation. Fixes it permanently, but only for future cohorts.

Route 1 is available immediately and needs no new consent, because the audience is the party
whose data it is.

What I would *not* do is generate a list of quoted problem statements and mail it outbound.
It is the fastest version and the one most likely to damage a training relationship worth
more than the systems pipeline it would generate.

---

## 8. Recommended next steps

1. Get a production read-replica or a sanitised export, and run Q1–Q3. Until then everything
   here is structural, not empirical.
2. Take the legal question on purpose limitation to whoever advises the group on POPIA.
3. Assuming route 1: build a **Sponsor Review** — a per-company report showing their
   projects, the estimated savings claimed, and which control plans depend on manual effort.
   That is a warm, welcome, fully consented conversation that ends naturally in a Process
   Audit.
4. Only then consider whether an outbound motion is worth the risk.

---

*Audit performed 20 August 2026 against `/Users/darrensmith/laravel-sigmafy` at commit a4c7c9b2,*
*schema-only. No production data was accessed.*

---

## 9. Correction — what production actually holds (20 August 2026)

Ran `ops/extract-pitch-signal.php` against production. Measured counts:

| | |
|---|---|
| Companies on the platform | 342 |
| Companies with at least one project | **59** |
| — with 3 or more projects | 57 |
| — with 5 or more projects | 50 |
| — largest single company | 139 projects |
| Projects (non-preview) | 239 (247 including preview) |
| Projects with no company link | 27 |
| **Project charters** | **5** |
| **Control plan rows** | **0** |
| All structured tool outputs | 54 (earliest 12 May 2026) |
| **Learner-written solutions** | **2,428** |
| — average length | 2,600 characters |
| — longest | 9,970 characters |
| — total volume | 6,313,192 characters |
| Solutions by year | 2024: 59 · 2025: 38 · **2026: 2,331** |

**What this changes.**

1. **The structured-charter thesis is dead for now.** `estimated_savings`, `sponsor`,
   `problem_statement` as queryable fields exist for five projects. Not a corpus.
2. **The real asset is prose.** 6.3M characters of learners describing workplace problems,
   in `sf_proj_solutions.description`. Extraction requires a language model reading text,
   not SQL against columns.
3. **The corpus is fresh, not stale.** 96% of all solutions were written in 2026. These are
   live problems at companies we are currently engaged with — materially better than the
   ageing back-catalogue this audit originally assumed.
4. **The addressable list is 59 companies, not several hundred.** But 50 have five or more
   projects and one has 139. Concentrated depth suits an account-based motion better than a
   broad list would.
5. **The privacy stakes go up, not down.** Structured fields could be dropped selectively.
   Free-text prose carries names, sites, product lines and financials inline, and cannot be
   reliably de-identified by regex. The sanitising approach in `ops/extract-pitch-signal.php`
   is not sufficient for the solutions table, and must not be reused for it unchanged.

**Consequence for Section 7 (the consent blocker).** It gets harder, not easier. Route 1 —
show each sponsor their own company's projects — remains the safest and is now clearly the
right first move, because it needs no bulk extraction of prose at all.
