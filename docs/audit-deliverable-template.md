# 2KO Process Audit — Deliverable Template

**Purpose.** This is the standard output of a 2KO Process Audit. It is the artifact that
travels: the person who commissions it is usually not the person who signs off a system
build, so this document has to survive being forwarded to a COO, an Ops Director, or
Finance without us in the room.

**Design rules — read before writing one.**

1. **Section 1 is the whole document.** Assume the executive reads one page. Everything
   after it is evidence for the claims made on that page.
2. **Every number shows its working.** A number without a calculation next to it reads as
   no number at all. See "Costing rules" below.
3. **Observed beats reported.** Mark each finding `Observed` (we watched it happen or saw
   the artifact) or `Reported` (someone told us). Never blur the two.
4. **Ranges, not hedges.** "R180k–R240k/yr" is credible. "Significant time savings,
   depending on workflow maturity" is not. If we genuinely cannot estimate, say
   `Not quantified` and say why.
5. **One recommendation, not a menu.** The audit ends in a single named pilot with a fixed
   price and a fixed timebox. A list of options moves the decision back to the client and
   the document dies in an inbox.
6. **No product names before Section 6.** Sections 1–5 are about their operation. The
   moment we sound like we are selling software, the diagnosis loses its authority.
7. **Length target: 8–14 pages.** Longer than that and it stops being forwarded.

**Effort budget.** One consultant-day of fieldwork, half a day of writing. If it takes
longer, the scope was drawn too wide — narrow it and re-scope rather than over-running.

---

## Before you write: fieldwork checklist

Do not start drafting until all of these are gathered. A finding that cannot be evidenced
gets cut, not softened.

- [ ] Processes in scope agreed **in writing** with the sponsor, with named out-of-scope items
- [ ] 4–8 people interviewed across at least two levels (someone who does the work, someone
      who owns the outcome)
- [ ] Copies of the actual artifacts: the spreadsheet, the form, the WhatsApp thread, the
      email template, the report someone rebuilds by hand
- [ ] At least one process walked end-to-end in real time, timestamped
- [ ] Volume data: how many of these per week/month, over what period, from what source
- [ ] Loaded cost rates for the roles involved, confirmed by the client (or our standard
      band used and flagged as an assumption)
- [ ] The sponsor's own stated definition of what "fixed" would look like

---

# Process Audit
## {{CLIENT_NAME}}

| | |
|---|---|
| **Prepared for** | {{SPONSOR_NAME}}, {{SPONSOR_ROLE}} |
| **Scope** | {{PROCESSES_IN_SCOPE}} |
| **Sites / divisions covered** | {{SITES}} |
| **Fieldwork dates** | {{FIELDWORK_DATES}} |
| **Prepared by** | {{CONSULTANT_NAME}}, 2KO Systems |
| **Date issued** | {{DATE}} |
| **Status** | Draft for client review / Final |

---

## 1. Executive summary

> **Write this last. One page. No jargon. If the reader stops here, they should still be
> able to make the decision.**

**What we looked at.** {{One sentence: which processes, which sites, over what period,
based on how many interviews.}}

**What we found.** {{Two or three sentences in plain operational language. Name the
mechanism, not the symptom — not "approvals are slow" but "approvals wait an average of
3.2 days because there is no queue: requests sit in individual inboxes with no owner and
no escalation."}}

### The three findings

| # | Finding | Estimated annual cost | Confidence |
|---|---|---|---|
| F1 | {{Short name}} | R{{X}} – R{{Y}} | Measured / Estimated / Indicative |
| F2 | {{Short name}} | R{{X}} – R{{Y}} | |
| F3 | {{Short name}} | R{{X}} – R{{Y}} | |
| | **Total** | **R{{X}} – R{{Y}}** | |

{{If any finding carries risk that is not primarily financial — compliance exposure, audit
failure, safety, customer attrition — state it here in one line. Risk gets attention that
cost does not.}}

### What we recommend

**{{PILOT_NAME}}** — {{one sentence on what it is}}.

| | |
|---|---|
| Addresses | {{F1}} |
| Fixed price | R{{PILOT_PRICE}} |
| Timebox | {{N}} weeks from {{start condition}} |
| Success measured as | {{single metric}}, currently **{{baseline}}**, target **{{target}}** |
| Decision required by | {{DATE}} |

We recommend starting here because {{highest value relative to lowest delivery risk / it is
self-contained / it does not require integration with {{system}} to prove value}}.

At the end of the pilot the client decides: proceed to full build, retain and extend, or
stop. There is no obligation attached to the pilot.

---

## 2. Scope and method

**In scope.** {{List the processes examined.}}

**Explicitly out of scope.** {{List what we did not look at, and why. This protects both
sides and signals rigour.}}

**People we spoke to.**

| Role | Level | Time | Observed / Interviewed |
|---|---|---|---|
| {{Role}} | {{Operator / Supervisor / Owner}} | {{duration}} | {{Observed work / Interview}} |

**Systems and artifacts reviewed.** {{ERP, spreadsheets by filename, forms, report packs,
message threads, existing SOPs. Be specific — naming the actual spreadsheet is what proves
we were really there.}}

**Volume basis.** {{Where the transaction counts came from and what period they cover.}}

**Basis of cost estimates.** See Section 5. Rates used are {{client-confirmed / 2KO standard
loaded-cost bands}} and are stated in full so any figure can be recalculated.

**Limitations.** {{What we could not see. Systems we had no access to. Seasonal effects the
fieldwork window may not represent. State these plainly — an audit that claims no
limitations is not believed.}}

---

## 3. Current state

> **One subsection per process in scope. Lead with the map, then the narrative. The map is
> what gets screenshotted into someone else's slide deck — make it standalone-legible.**

### 3.1 {{PROCESS_NAME}}

**Trigger.** {{What starts it.}}

**Path today.**

{{Step-by-step, showing handoffs and where each step lives. Format:}}

| # | Step | Who | Lives in | Working time | Waiting time |
|---|---|---|---|---|---|
| 1 | {{Request raised}} | {{Site foreman}} | {{Paper form}} | {{5 min}} | — |
| 2 | {{Retyped into tracker}} | {{Site admin}} | {{`Site_Tracker_v14.xlsx`}} | {{8 min}} | {{up to 1 day}} |
| 3 | {{Sent for approval}} | {{Site admin}} | {{WhatsApp}} | {{2 min}} | {{1–4 days}} |
| | **Total** | | | **{{X}} min** | **{{Y}} days**|

**Where it breaks.** {{Narrative. Name the specific point of failure and what people do to
work around it — the workaround is usually the real finding.}}

**What nobody owns.** {{Who is accountable when it stalls. Very often the answer is "no
one", and that sentence lands harder than any statistic.}}

**Ratio worth noting.** Working time {{X}} minutes against elapsed time {{Y}} days — the
process is {{Z}}% waiting. {{This single ratio is usually the most persuasive line in the
whole document. Include it wherever the data supports it.}}

---

## 4. Findings

> **One block per finding, in ranked order of annual cost. Use the exact same structure
> every time — consistency is what makes the register skimmable.**

### F{{N}} — {{FINDING_NAME}}

| | |
|---|---|
| Process | {{PROCESS}} |
| Severity | High / Medium / Low |
| Evidence | Observed / Reported |
| Confidence | Measured / Estimated / Indicative |

**What happens today.** {{Factual, specific, dated. "On 14 March, request #4471 was raised
at 07:40 and approved at 11:20 on 17 March. Three of the four days were spent waiting for
someone to notice the message." Specificity is the whole game — a generic finding reads as
a template, and a template reads as a sales document.}}

**Why it costs.** {{The mechanism. Not "this is inefficient" but the chain: no queue → no
visibility of what is waiting → chasing by phone → double handling → the tracker drifts out
of date → the monthly report has to be rebuilt from source.}}

**What it costs.**

```
{{Volume}}  requests/month
× {{Time}}  minutes of avoidable handling each
= {{X}}     hours/month
× R{{Rate}} loaded cost/hour ({{role}})
= R{{Y}}/month  →  R{{Z}}/year

Range: R{{low}} – R{{high}}/yr  (varies with {{driver}})
```

**Risk beyond cost.** {{Audit trail gaps, compliance exposure, safety, customer impact,
key-person dependency. Write "None identified" if that is the truth.}}

**What fixing it looks like.** {{Two or three sentences, mechanism-level, still no product
names. "A shared queue with an owner and an escalation rule on every request."}}

**Effort band.** {{Small (2–4 weeks) / Medium (6–10 weeks) / Large (3 months+)}}

**Dependencies.** {{What has to be true first — data access, an integration, a policy
decision, someone's sign-off.}}

---

## 5. Cost of the current state

**Summary.**

| # | Finding | Hours/yr | Cost/yr (low) | Cost/yr (high) | Confidence |
|---|---|---|---|---|---|
| F1 | | | R | R | |
| F2 | | | R | R | |
| F3 | | | R | R | |
| | **Total** | | **R** | **R** | |

**Rates used.**

| Role | Loaded cost/hour | Source |
|---|---|---|
| {{Role}} | R{{rate}} | {{Client-confirmed / 2KO standard band}} |

> Loaded cost = total cost of employment ÷ productive hours, not salary ÷ hours. State the
> method so the client's finance team can check it. If they dispute a rate, the calculation
> is transparent enough to re-run in front of them — which converts an objection into a
> collaboration.

**Assumptions.**

1. {{Each assumption, numbered, so any one can be challenged individually without
   invalidating the whole model.}}

**Costing rules (internal guidance — remove before issuing):**

- Count only *avoidable* time. Time spent doing the actual work stays, so exclude it.
- Prefer measured volumes over recalled ones. If someone says "about 200 a month", find the
  artifact that proves it before it goes in the table.
- Where a number is uncertain, widen the range rather than dropping the finding. A wide
  honest range survives scrutiny; a precise invented number does not survive one question.
- Never claim savings we cannot measure after the fact. Every figure here becomes the
  baseline we are held to in Section 6.
- Confidence labels: **Measured** (from system data or timed observation) · **Estimated**
  (from volumes × observed handling time) · **Indicative** (from interviews only).

---

## 6. Recommendation

### {{PILOT_NAME}}

**The problem it addresses.** {{Reference the finding by ID and restate it in one line.}}

**What we will build.**

- {{Specific capability}}
- {{Specific capability}}
- {{Specific capability}}

**What we will not build in the pilot.** {{Explicit. This is the single most important
paragraph for controlling scope, and clients trust it more than the inclusions list.}}

**Commercials.**

| | |
|---|---|
| Fixed price | R{{PRICE}} |
| Timebox | {{N}} weeks |
| Payment | {{terms}} |
| Starts | {{condition — e.g. within 2 weeks of access to X being granted}} |

**How success is judged.** Measured on {{metric}}, baseline recorded **before** any build
begins.

| Metric | Baseline today | Target at pilot end | How measured |
|---|---|---|---|
| {{e.g. median approval turnaround}} | {{3.2 days}} | {{under 8 working hours}} | {{system timestamps}} |

> The baseline is recorded jointly with the client and agreed in writing before work starts.
> Without it there is no case study at the end and no honest claim we can make afterwards.

**At the end of the pilot** the client chooses to proceed to build, move to a retainer, or
stop. All three are acceptable outcomes and the pilot price does not change.

---

## 7. Beyond the pilot

> **Sequenced, not a wishlist. Each item states what must be true before it makes sense —
> that is what distinguishes a roadmap from a quote.**

| Phase | What | Addresses | Prerequisite | Indicative effort |
|---|---|---|---|---|
| 1 | {{Pilot}} | F1 | — | {{N}} weeks |
| 2 | | F2 | {{Phase 1 in production for 4 weeks}} | |
| 3 | | F3 | {{Integration with {{system}} agreed}} | |

Prices beyond the pilot are indicative only and are re-quoted at the point of decision.

---

## 8. What we need from you

| # | Need | From whom | By when |
|---|---|---|---|
| 1 | {{Decision on the pilot}} | {{Sponsor}} | {{date}} |
| 2 | {{Access to {{system}} / export of {{data}}}} | {{IT}} | {{date}} |
| 3 | {{Named process owner available ~2 hrs/week}} | {{Ops}} | {{ongoing}} |
| 4 | {{Baseline measurement agreed and signed}} | {{Sponsor}} | {{before start}} |

{{Keep this short and unambiguous. A long list of client obligations reads as risk.}}

---

## 9. Assumptions, limitations and confidence

**This audit is based on** {{N}} interviews across {{N}} roles, {{N}} process walkthroughs,
and review of {{N}} operational artifacts, conducted {{dates}}.

**We are confident about** {{the findings marked Observed and Measured}}.

**We are less confident about** {{the Indicative figures, and why}}.

**What would change our view.** {{Specifically: what data, if we saw it, would move a
number materially. Naming this is a credibility multiplier — it demonstrates the estimates
are a model rather than a pitch.}}

**Seasonality / representativeness.** {{Whether the fieldwork window is typical.}}

---

## Appendix A — Interview notes
## Appendix B — Artifacts collected
## Appendix C — Calculation workings

{{Full workings for every figure in Section 5, so any number can be traced end to end.}}

---

*Prepared by 2KO Systems, the systems and automation arm of the 2KO group.*
*This document contains information confidential to {{CLIENT_NAME}}.*
