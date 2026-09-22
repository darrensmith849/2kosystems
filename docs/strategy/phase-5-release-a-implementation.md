# Phase 5 Release A — Implementation Record

## Status

Implemented and verified locally on 12 September 2026. Not deployed.

## What changed

### Strategic front door

- Repositioned the homepage around process improvement, automation and sustained operational control.
- Made the intervention logic explicit: improve the process, equip the people, automate repetition and systemise control.
- Added a visible Diagnose–Measure–Improve–Train–Automate–Systemise–Sustain lifecycle.
- Replaced unverified outcome-style marketing with an evidence standard and clearly labelled illustrative workflow.

### Offers and routes

- Added `/process-review` for the Half-Day Process Review.
- Added `/audit` for the Process and Automation Opportunity Audit.
- Added `/managed-improvement` as the dedicated recurring process-performance service page.
- Added `/automation` as the dedicated process-automation capability page, separating rules-based automation, intelligence-assisted work and accountable human decisions.
- Rebuilt `/sectors` around process fit, retained four deep industrial translations and added nine adjacent sectors in three operating families without implying domain-professional authority.
- Added `/results` as a public evidence record with a publication gate, evidence taxonomy, case-record template and transparent verification queue; no unverified outcome was promoted as a result.
- Reframed `/systems` as Systems and Automation, with process design before platform selection and a clear human-decision boundary.
- Rebuilt `/pricing` around diagnostic, implementation and sustain categories.
- Presented Care, Managed Improvement and Continuous Improvement Partner as distinct ongoing relationships with approved public entry prices.
- Added an evidence-led commercial progression to `/pricing`, showing how commitment increases from diagnosis to proof to sustained improvement.
- Consolidated every operational offer and public price into one commercial catalogue, with consistent diagnostic, product, custom-build and retainer structures.

### Navigation and conversion journey

- Reworked the global navigation around Services, Method, Results, Sectors, Pricing and About.
- Moved Website Services to a secondary footer position.
- Changed the primary call to action to “Bring us the process”.
- Added contextual service-interest links and preselection on the enquiry form.
- Added process-state, process-description, consent and attribution fields to the contact journey and delivery payload.
- Rebuilt `/contact` around a visible Send–Fit–Decide handoff while preserving a calm, accessible process-brief form.
- Added distinct enquiry routing for Care, Managed Improvement, Continuous Improvement Partner and Outcome Partnership.
- Added a distinct Process Automation enquiry route that preselects the correct interest on the process brief.

### Measurement and trust

- Added typed events for call-to-action clicks, form starts, service interest, enquiry submission and completed journeys.
- Added first-landing-page and UTM attribution capture.
- Updated structured data, metadata and the sitemap for the new positioning and routes.
- Clarified that existing client logos include wider 2KO Group relationships and are not all Systems implementations.
- Updated the assistant’s knowledge and scripted responses to match the new offer structure and avoid quoting withdrawn retainer prices.

## Verification completed

- Source lint passed with `npx eslint src`.
- Production build passed with `npm run build`.
- Desktop and mobile layouts were checked, including the 360×800 mobile gate.
- Desktop and mobile navigation were opened and checked.
- The Process Review and Opportunity Audit routes were checked.
- Managed Improvement enquiry links were confirmed to preselect the correct starting point.
- Process Automation enquiry links were confirmed to preselect the correct starting point.
- Pricing and Contact were checked against the cinematic commercial-page standard.
- Tested pages had no horizontal overflow.
- A clean production browser session produced no console warnings or errors.

## Decisions still required before Release B

1. Confirm delivery capacity and service-level limits for Managed Improvement and Continuous Improvement Partner retainers.
2. Complete at least one publishable Systems case study against the agreed evidence standard.
3. Confirm the production analytics identifiers and validate events after deployment.

## Recommended next step

Complete the evidence pack for the first Results story so the public index can move from verification status to a measured case with a baseline, comparison period, sustained period, attribution note and publication permission.
