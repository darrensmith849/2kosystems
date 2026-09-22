# 2KO Systems — Phase 3 CTA and Measurement Framework

Status: Conversion and measurement brief; no analytics implementation completed  
Date: 12 September 2026

## 1. CTA principle

The visitor should be asked to describe the process problem, not prescribe the solution.

The primary site-wide CTA is:

> **Bring us the process**

The supporting line is:

> Tell us what keeps going wrong. We will tell you whether the right next step is process work, training, automation, a system—or nothing at all.

## 2. CTA hierarchy

### Primary conversion CTA

**Bring us the process**  
Destination: contact or starting-point journey.

Use in:

- navigation;
- homepage hero;
- footer;
- About;
- broad sector pages.

### Diagnostic CTA

**Book a Process Review**  
Destination: Process Review page or qualified booking path.

Use when the cause is unclear.

### Evidence CTA

**Quantify the opportunity**  
Destination: Process and Automation Audit.

Use when the buyer needs a financial or operational case.

### Pilot CTA

**Prove one workflow**  
Destination: Workflow Automation Pilot or contact path with pilot context.

Use on Systems, Automation and product pages.

### Retainer CTA

**Put one process on an improvement rhythm**  
Destination: Managed Improvement qualification path.

Use on Managed Improvement, relevant case studies and post-launch product sections.

### Evaluation CTAs

- See how improvement works.
- See results on record.
- Compare managed improvement options.
- Find your starting point.

These support evaluation and should not compete visually with the primary CTA.

## 3. Context preservation

Every CTA should preserve the source page and selected offer so the enquiry arrives with context.

Required context fields:

- source page;
- CTA label;
- offer or problem category;
- product or sector where relevant;
- campaign and advertising parameters where present;
- first landing page;
- referrer where available and permitted.

Do not ask the buyer to repeat information already expressed through the path they selected.

## 4. Starting-point form

### Step 1 — The process

- Which process is involved?
- What keeps going wrong?

### Step 2 — Frequency and consequence

- How often does it happen?
- What does it delay, cost or put at risk?

### Step 3 — Current method

- Where does the process live today: system, spreadsheet, paper, email, WhatsApp or combination?
- Is the process understood consistently by the people involved?

### Step 4 — Ownership and evidence

- Who owns the outcome?
- Is any baseline or transaction data available?

### Step 5 — Contact and routing

- name;
- work email;
- company;
- phone, optional;
- site or region;
- preferred next step, optional.

### Data warning

> Do not upload or paste confidential operational records, personal information, credentials, medical information or regulated data. We will arrange a controlled method if records are needed later.

## 5. Primary funnel events

| Event | Meaning |
| --- | --- |
| `primary_cta_click` | Visitor begins the process-problem journey |
| `starting_point_start` | First form or scope step viewed |
| `starting_point_complete` | Qualification journey completed |
| `contact_submit_success` | Enquiry accepted successfully |
| `process_review_interest` | Process Review selected |
| `audit_interest` | Opportunity Audit selected |
| `pilot_interest` | Workflow Automation Pilot selected |
| `managed_improvement_interest` | Retainer path selected |
| `pricing_view` | Pricing page viewed |
| `retainer_comparison_view` | Retainer comparison reached |
| `case_study_view` | Verified case study opened |
| `case_study_cta_click` | Case study creates a commercial action |
| `cross_group_training_click` | Visitor routed to training |
| `cross_group_sigmafy_click` | Visitor routed to Sigmafy |
| `website_service_click` | Visitor enters the separate website journey |

Event names are working definitions and should be reconciled with the existing analytics conventions before implementation.

## 6. Commercial outcome fields

Website analytics alone cannot show whether the repositioning works. Each enquiry should later be classified in the CRM or lead destination by:

- qualified or unqualified;
- primary process problem;
- buyer role;
- sector;
- recommended intervention;
- offer selected;
- estimated opportunity value;
- proposal issued;
- won or lost;
- reason lost;
- retainer attached;
- cross-group route.

## 7. Baseline metrics before launch

Capture at least four weeks of current-site data where possible:

- sessions by landing page;
- primary CTA click rate;
- Scope Builder starts and completions;
- contact-form submissions;
- qualified enquiries;
- source of qualified enquiries;
- pricing-page engagement;
- website-service versus systems-service lead mix;
- review, audit and build enquiries;
- current retainer enquiries;
- conversion from enquiry to booked conversation.

Without a baseline, the redesign cannot honestly be called an optimisation.

## 8. Post-launch success measures

### Site effectiveness

- increase in qualified enquiry rate;
- increase in Process Review and Audit selection;
- reduction in unsuitable generic website or software enquiries entering the Systems funnel;
- completion rate of the starting-point journey;
- case-study-assisted conversion;
- pricing-to-enquiry conversion.

### Commercial effectiveness

- audit-to-pilot conversion;
- pilot-to-build conversion;
- build-to-retainer attachment;
- managed recurring revenue;
- average retained gross margin;
- percentage of opportunities routed correctly between group divisions;
- sales cycle by offer;
- reasons for lost opportunities.

### Positioning effectiveness

Use post-enquiry interviews or a short form question to measure whether buyers describe 2KO as:

- a software developer;
- an automation provider;
- a process-improvement partner;
- a training company;
- an integrated improvement group.

The desired shift is from software developer toward process-improvement and automation partner without losing confidence in technical delivery.

## 9. Experiment roadmap

Run one meaningful test at a time.

Recommended sequence:

1. current hero versus process-optimisation hero;
2. Start a project versus Bring us the process;
3. generic contact form versus structured starting-point journey;
4. logo strip versus verified result proof;
5. pricing-led retainer section versus operating-cadence-led retainer section;
6. Systems navigation label versus Systems and Automation;
7. visible Websites navigation versus secondary placement.

Each test requires:

- hypothesis;
- primary measure;
- guardrail measure;
- minimum observation period or sample rule;
- result and decision record.

## 10. Measurement governance

- operational conversion events must be tested after every relevant release;
- no vanity metric should be marked as a primary conversion;
- phone, email and WhatsApp actions must be separated from confirmed enquiries;
- campaign parameters must survive the form journey;
- duplicate and test submissions must be filtered;
- consent and privacy disclosures must match actual tracking behaviour;
- a monthly website improvement review should mirror the client retainer cadence.

The 2KO website should itself demonstrate the operating principle being sold: establish a baseline, change one control, measure the result and keep improving it.

