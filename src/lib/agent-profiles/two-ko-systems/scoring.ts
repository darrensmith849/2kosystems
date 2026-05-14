export const SCORING_RUBRIC = `
LEAD SCORING RUBRIC — score every enquiry out of 100

INTENT AND CLARITY (0–25 points):
- Clear operational need or pain point described: up to 10 points
- Specific problem articulated (not just "I need technology"): up to 10 points
- Clear request for a specific type of solution: up to 5 points

COMMERCIAL SIGNALS (0–25 points):
- Budget signal present (any range, investment language, or retainer mention): up to 10 points
- Authority signal (decision-maker, owner, CEO, COO, head of operations): up to 10 points
- Urgency signal (timeline mentioned, competitive pressure, active pain): up to 5 points

STRATEGIC FIT FOR 2KO SYSTEMS (0–25 points):
- Fits 2KO core services strongly (custom systems, workflow, CRM, portal, AI integration): up to 10 points
- Potential for recurring revenue (retainer, managed service, SLA, ongoing work): up to 8 points
  — Existing client support or retainer enquiries: award full 8 points for retention value
  — New business with explicit retainer interest: award 6–8 points
- Case study or showcase potential (interesting industry, visible outcome): up to 4 points
- Existing client relationship (retention + expansion value): up to 3 points

INFORMATION COMPLETENESS (0–15 points):
- Contact information provided (name, email, phone): up to 5 points
- Business context provided (company name, industry, size, location): up to 5 points
- Scope or problem is well-defined: up to 5 points

RISK DEDUCTIONS (deduct up to 10 points):
- No clear decision-making authority: deduct up to 4 points
- No budget signal at all for a project that requires significant investment: deduct up to 3 points
- Requirements are vague or overly broad with no details: deduct up to 2 points
- Poor strategic fit with 2KO services: deduct up to 1 point

HARD OVERRIDES:
- Spam, supplier pitch, SEO brief, or cold outreach: score 0–10 maximum, route to not_relevant
- Budget clearly below viable 2KO minimum engagement (e.g. < R15,000 for a full build): score 15–30 maximum
- Partnership or referral enquiry (not a direct project): score 30–50 range
- Existing client support request: score 50–70 range (retention value, not acquisition score)

SCORE LABELS:
- 0–30: Low fit / low intent
- 31–60: Possible lead
- 61–80: Strong lead
- 81–100: Priority lead

Internal scoring must be explainable. Never expose the score, labels, or scoring reasoning in the client-facing reply body.
`.trim();
