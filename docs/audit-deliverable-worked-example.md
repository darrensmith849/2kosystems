# Worked Example — Process Audit

> ⚠️ **FICTIONAL. Internal training reference only.** "Kolobeng Resources" is not a real
> client and every figure here is invented to demonstrate the standard. Never send this to
> a client, and never reuse these numbers in a real audit.

This shows what a completed [audit deliverable](audit-deliverable-template.md) looks like at
the quality bar we hold. Note particularly: the specificity of the evidence, the visible
arithmetic, the stated limitations, and the single recommendation.

---

# Process Audit
## Kolobeng Resources (Pty) Ltd

| | |
|---|---|
| **Prepared for** | M. Dlamini, Group Operations Director |
| **Scope** | Maintenance request and approval workflow |
| **Sites / divisions covered** | Four operating sites (North, Central, East, Plant) |
| **Fieldwork dates** | 4–6 August 2026 |
| **Prepared by** | 2KO Systems |
| **Date issued** | 12 August 2026 |
| **Status** | Final |

---

## 1. Executive summary

**What we looked at.** The maintenance request workflow across all four sites, from the
moment a fault is raised to the moment work is authorised — based on nine interviews, three
timed end-to-end walkthroughs, and twelve months of request data from the maintenance
tracker.

**What we found.** Maintenance approvals take a median of 3.2 days, of which roughly 25
minutes is actual work. The remaining time is waiting, because there is no queue: requests
are sent to individuals by WhatsApp and email, so nothing is visibly outstanding and nobody
is accountable for a stalled request. The same request is typed out three times — on paper,
into a site spreadsheet, and again into the ERP — and the three copies disagree often enough
that month-end reporting is rebuilt by hand rather than exported.

### The three findings

| # | Finding | Estimated annual cost | Confidence |
|---|---|---|---|
| F1 | No approval queue — requests wait unseen and are chased manually | R240,000 – R320,000 | Measured |
| F2 | Same request captured three times, copies drift apart | R100,000 – R150,000 | Estimated |
| F3 | Month-end and audit reporting rebuilt by hand every cycle | R95,000 – R135,000 | Estimated |
| | **Total** | **R435,000 – R605,000** | |

Beyond cost: 31% of sampled requests had no traceable approver. In an audit or a Section 54
investigation, those requests cannot be shown to have been authorised at all.

### What we recommend

**Maintenance Approval Queue — North and Central sites** — a single shared queue where every
request has a named owner, a visible age, and an automatic escalation when it stalls.

| | |
|---|---|
| Addresses | F1, and the traceability gap |
| Fixed price | R145,000 |
| Timebox | 8 weeks from data access being granted |
| Success measured as | Median approval turnaround, currently **3.2 days**, target **under 8 working hours** |
| Decision required by | 5 September 2026 |

We recommend starting here because it is self-contained: it needs no ERP integration to
prove value, it covers the two sites with the highest request volume, and the measurement is
unambiguous because the timestamps already exist in the current tracker.

---

## 2. Scope and method

**In scope.** Maintenance request raising, routing, approval and authorisation across four
sites.

**Explicitly out of scope.** Procurement and purchase-order issue (handled in the ERP by
Finance, and we saw no evidence of a problem there); contractor onboarding; the planned
maintenance schedule itself, which is a planning question rather than a workflow one.

**People we spoke to.**

| Role | Level | Time | Observed / Interviewed |
|---|---|---|---|
| Site foreman (North) | Operator | 90 min | Observed work + interview |
| Site foreman (Central) | Operator | 45 min | Interview |
| Site administrator (× 4) | Operator | 45 min each | Observed work |
| Maintenance manager | Supervisor | 60 min | Interview |
| Group Operations Director | Owner | 45 min | Interview |
| Financial accountant | Owner | 30 min | Interview |

**Systems and artifacts reviewed.** `Maintenance_Tracker_North_v14.xlsx` (and the three site
equivalents); the printed *Maintenance Request* pad (form MR-02); the "North Maintenance"
WhatsApp group, 4 July – 4 August; the ERP maintenance module; the August board pack
maintenance section; the FY2025 external audit finding letter.

**Volume basis.** 4,081 requests across twelve months (Aug 2025 – Jul 2026), exported from
the four site trackers. Monthly mean 340, range 291–402.

**Basis of cost estimates.** Loaded-cost rates confirmed by the financial accountant on
6 August 2026. See Section 5.

**Limitations.** We had read-only access to the ERP and could not verify how many requests
are subsequently amended after authorisation. The fieldwork window falls outside the
shutdown period, when volumes roughly double — so if anything the annual figures are
conservative. We did not visit the East or Plant sites in person; those findings rest on
interviews and their tracker data, and are marked accordingly.

---

## 3. Current state

### 3.1 Maintenance request → approval

**Trigger.** A fault is identified by a foreman or reported by an operator on shift.

**Path today.**

| # | Step | Who | Lives in | Working time | Waiting time |
|---|---|---|---|---|---|
| 1 | Fault written on MR-02 pad | Foreman | Paper | 5 min | — |
| 2 | Pad collected at end of shift | Site admin | Paper | — | up to 12 hrs |
| 3 | Retyped into site tracker | Site admin | `..._v14.xlsx` | 8 min | — |
| 4 | Photographed, sent to manager | Site admin | WhatsApp | 2 min | — |
| 5 | **Waits to be noticed** | — | — | — | **1–4 days** |
| 6 | Approved by reply message | Maintenance mgr | WhatsApp | 3 min | — |
| 7 | Approval typed back into tracker | Site admin | `..._v14.xlsx` | 4 min | — |
| 8 | Re-keyed into ERP for PO | Site admin | ERP | 6 min | — |
| | **Total** | | | **28 min** | **3.2 days median** |

**Where it breaks.** Step 5. A request sitting in a WhatsApp thread is invisible the moment
another message arrives above it. The maintenance manager described scrolling back through
threads on Monday mornings to find what he had missed, which is a detection method, not a
process. Site admins have built their own workaround: a personal reminder list of what they
are still chasing, kept separately from the tracker. Three of the four admins showed us one.
None of the four knew the others did the same.

**What nobody owns.** When a request stalls, no one is accountable. We asked all nine
interviewees who is responsible for a request that has been waiting four days. We received
five different answers, and two people said it depends on who notices.

**Ratio worth noting.** 28 minutes of working time against 3.2 days of elapsed time — the
process is **98.8% waiting**.

---

## 4. Findings

### F1 — No approval queue; requests wait unseen and are chased manually

| | |
|---|---|
| Process | Maintenance request → approval |
| Severity | High |
| Evidence | Observed |
| Confidence | Measured |

**What happens today.** Request MR-4471 was raised at North site at 07:40 on 14 March and
approved at 11:20 on 17 March. The approval itself took three minutes. The site admin sent
four follow-up messages during those three days, at 15:10 on the 14th, 08:05 and 16:30 on
the 15th, and 09:15 on the 17th. This is not an outlier: across the twelve-month export, the
median gap between submission and approval is 3.2 days and the 90th percentile is 6.1 days,
while every approval action we observed took under five minutes.

**Why it costs.** No queue → nothing is visibly outstanding → the only way to know a request
is stuck is for someone to remember it → admins chase by message → managers process requests
in the order they are chased rather than by urgency → foremen escalate verbally to be heard,
which trains everyone to escalate everything.

**What it costs.**

```
Site admin chasing:
340 requests/month × 12 min avoidable follow-up = 68 hrs/month
68 × R185/hr = R12,580/month

Foreman re-raising and following up:
340 requests/month × 6 min = 34 hrs/month
34 × R320/hr = R10,880/month

Combined: R23,460/month → R281,520/year
Range: R240,000 – R320,000/yr (varies with request volume, 291–402/month)
```

**Risk beyond cost.** In a 200-request sample, 62 (31%) had no identifiable approver — the
approval was verbal, or the WhatsApp message was in a thread nobody exported. The FY2025
external audit letter raised this. It has not been resolved.

**What fixing it looks like.** Every request in one shared queue, with a named owner, a
visible age, and an automatic escalation when it passes a threshold. Approval recorded
against a person and a timestamp at the moment it happens, not retyped afterwards.

**Effort band.** Small (6–8 weeks for two sites).

**Dependencies.** Agreement on who owns each request category, and an escalation threshold
signed off by the Operations Director.

---

### F2 — The same request is captured three times and the copies drift apart

| | |
|---|---|
| Process | Maintenance request → approval |
| Severity | Medium |
| Evidence | Observed |
| Confidence | Estimated |

**What happens today.** Each request is written on paper, typed into the site tracker, and
re-keyed into the ERP — three times, by two different people, with no validation between
them. Comparing 120 tracker rows against their ERP counterparts, 9 disagreed on cost centre
and 4 on the equipment ID.

**Why it costs.** Triple capture consumes time directly, and the disagreements consume more:
each mismatch surfaces at month-end and has to be traced back through the paper pad to
determine which copy is right.

**What it costs.**

```
Re-keying:
340 requests/month × 8 min = 45.3 hrs/month × R185/hr = R8,387/month

Reconciling mismatches (observed rate 10.8%, rounded to 7% to stay conservative
because some mismatches are never detected and therefore never cost anything):
24 requests/month × 25 min = 10 hrs/month × R185/hr = R1,850/month

Combined: R10,237/month → R122,844/year
Range: R100,000 – R150,000/yr
```

**Risk beyond cost.** Cost-centre mismatches mean maintenance spend is misattributed between
sites. The board pack site comparison is therefore unreliable, though we did not quantify by
how much.

**What fixing it looks like.** Capture once, at the point the fault is found, and let every
downstream view read from that single record.

**Effort band.** Medium (integration with the ERP required).

**Dependencies.** ERP write access, which IT indicated requires vendor involvement.

---

### F3 — Month-end and audit reporting is rebuilt by hand every cycle

| | |
|---|---|
| Process | Maintenance reporting |
| Severity | Medium |
| Evidence | Reported, with artifacts sighted |
| Confidence | Estimated |

**What happens today.** Each site admin spends roughly six hours per month assembling the
site's maintenance summary by copying from the tracker into a report template. The
maintenance manager then spends around five hours consolidating the four into one pack. For
the FY2025 external audit, two people spent three days each reconstructing the approval
history for the sampled requests, because the approvals lived in WhatsApp.

**Why it costs.** The tracker is not trusted as a source, because of F2, so the report is
rebuilt rather than exported. Rebuilding is manual, and manual work at month-end is done
under time pressure.

**What it costs.**

```
Site reporting:  4 admins × 6 hrs/month = 24 hrs × R185/hr = R4,440/month → R53,280/yr
Consolidation:   5 hrs/month × R520/hr                     = R2,600/month → R31,200/yr
Audit support:   2 events/yr × 48 hrs × R280/hr blended                   → R26,880/yr

Total: R111,360/year
Range: R95,000 – R135,000/yr
```

**Risk beyond cost.** Audit preparation is currently dependent on two individuals'
recollection of where things were filed.

**What fixing it looks like.** If approvals are captured in one place with timestamps, the
report becomes an export rather than a reconstruction, and audit support becomes a filter
rather than a search.

**Effort band.** Small — but only worth doing after F1, since it depends on the data F1
produces.

**Dependencies.** F1 in production for at least one full reporting cycle.

---

## 5. Cost of the current state

| # | Finding | Hours/yr | Cost/yr (low) | Cost/yr (high) | Confidence |
|---|---|---|---|---|---|
| F1 | No approval queue | 1,224 | R240,000 | R320,000 | Measured |
| F2 | Triple capture | 664 | R100,000 | R150,000 | Estimated |
| F3 | Manual reporting | 444 | R95,000 | R135,000 | Estimated |
| | **Total** | **2,332** | **R435,000** | **R605,000** | |

**Rates used.**

| Role | Loaded cost/hour | Source |
|---|---|---|
| Site administrator | R185 | Client-confirmed, 6 Aug 2026 |
| Site foreman | R320 | Client-confirmed, 6 Aug 2026 |
| Maintenance manager | R520 | Client-confirmed, 6 Aug 2026 |

Loaded cost is total cost of employment divided by productive hours, per the financial
accountant's own model — not salary divided by hours.

**Assumptions.**

1. Monthly request volume averages 340, based on the twelve-month export. Shutdown periods
   are excluded, making the figures conservative.
2. Avoidable follow-up time of 12 minutes per request is derived from the three timed
   walkthroughs plus the message counts in the sampled WhatsApp threads. It is not
   self-reported.
3. The mismatch rate is rounded down from the observed 10.8% to 7%, on the basis that
   undetected mismatches cost nothing until they are found.
4. East and Plant site figures are extrapolated from North and Central. Those two sites
   account for 61% of volume, so 39% of the total rests on extrapolation.
5. No allowance is made for delayed maintenance causing equipment downtime. This is likely
   to be the largest cost of all, and we have deliberately excluded it because we cannot
   evidence it.

---

## 6. Recommendation

### Maintenance Approval Queue — North and Central sites

**The problem it addresses.** F1: requests wait an average of 3.2 days in a process that
contains 28 minutes of work, because nothing makes a waiting request visible.

**What we will build.**

- A shared queue showing every open request, its age, and its named owner
- Mobile capture at the point the fault is found, replacing the MR-02 pad
- One-tap approval that records approver and timestamp automatically
- Automatic escalation to the Operations Director when a request passes 24 working hours
- A live view for the maintenance manager across both sites

**What we will not build in the pilot.** No ERP integration — requests will still be re-keyed
for PO issue at this stage. No East or Plant site rollout. No planned-maintenance scheduling.
No contractor access. No historical data migration; the queue starts empty on go-live.

**Commercials.**

| | |
|---|---|
| Fixed price | R145,000 |
| Timebox | 8 weeks |
| Payment | 50% on commencement, 50% on go-live |
| Starts | Within two weeks of tracker data access being granted |

**How success is judged.**

| Metric | Baseline today | Target at pilot end | How measured |
|---|---|---|---|
| Median approval turnaround | 3.2 days | Under 8 working hours | System timestamps |
| Requests with identifiable approver | 69% | 100% | System record |
| Admin follow-up messages per request | 2.4 | Under 0.5 | Sampled, 2 weeks |

Baselines above are taken from the twelve-month export and the August sample, and are agreed
in writing before work begins.

**At the end of the pilot** Kolobeng chooses to proceed to full rollout, move to a retainer,
or stop. All three are acceptable and the pilot price does not change.

---

## 7. Beyond the pilot

| Phase | What | Addresses | Prerequisite | Indicative effort |
|---|---|---|---|---|
| 1 | Approval queue, North + Central | F1 | — | 8 weeks |
| 2 | Rollout to East + Plant | F1 | Phase 1 in production 4 weeks | 3 weeks |
| 3 | Automated reporting and audit export | F3 | One full reporting cycle on the new queue | 4 weeks |
| 4 | ERP integration, single capture | F2 | ERP write access confirmed with vendor | 8–10 weeks |

Prices beyond the pilot are indicative and re-quoted at the point of decision.

---

## 8. What we need from you

| # | Need | From whom | By when |
|---|---|---|---|
| 1 | Decision on the pilot | M. Dlamini | 5 Sep 2026 |
| 2 | Read access to the four site trackers | IT | Before commencement |
| 3 | Escalation threshold and owner per request category, signed off | Operations | Week 1 |
| 4 | Maintenance manager available ~2 hrs/week | Maintenance | Weeks 1–8 |
| 5 | Baselines in Section 6 agreed in writing | M. Dlamini | Before commencement |

---

## 9. Assumptions, limitations and confidence

**This audit is based on** nine interviews across six roles, three timed process
walkthroughs, twelve months of request data, and review of eleven operational artifacts,
conducted 4–6 August 2026.

**We are confident about** F1. It rests on system timestamps and direct observation rather
than on what anyone told us, and the pattern is consistent across all four sites.

**We are less confident about** the East and Plant components of every figure, which are
extrapolated from the two sites we visited, and about F3, where the hours are self-reported
by the people who do the work.

**What would change our view.** If the ERP holds amendment history showing that a
meaningful share of approved requests are subsequently changed, F2 is materially larger than
stated. We asked for this and could not obtain it within the fieldwork window. We would also
revise upward if downtime attributable to approval delay could be evidenced — we suspect it
exceeds all three findings combined, but we will not put a number on it without data.

**Seasonality.** Fieldwork fell outside the shutdown period, when volumes roughly double. The
annual figures are therefore understated rather than overstated.

---

*Prepared by 2KO Systems, the systems and automation arm of the 2KO group.*
*Fictional worked example — internal training reference. Not a real client engagement.*
