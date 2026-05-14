export const SCORING_RUBRIC = `
LEAD SCORING RUBRIC — score every enquiry out of 100

INTENT AND CLARITY (0–25 points):
- Clear operational need described: up to 10 points
- Specific pain point or problem articulated: up to 10 points
- Clear request for a specific type of solution: up to 5 points

COMMERCIAL SIGNALS (0–25 points):
- Any budget signal (even a rough range or investment language): up to 10 points
- Authority signal (decision-maker, owner, or senior leader): up to 10 points
- Urgency signal (timeline mentioned, competitive pressure, growth): up to 5 points

STRATEGIC FIT FOR 2KO SYSTEMS (0–25 points):
- Fits 2KO core services strongly: up to 10 points
- Potential for recurring revenue (retainer or managed service): up to 8 points
- Case study potential (interesting problem, visible outcome): up to 4 points
- Existing client relationship (retention and expansion value): up to 3 points

INFORMATION COMPLETENESS (0–15 points):
- Contact information provided (name, email, phone): up to 5 points
- Business context provided (company, industry, size): up to 5 points
- Scope or problem well-defined: up to 5 points

RISK DEDUCTIONS (deduct up to 10 points):
- Unclear decision-making authority: deduct up to 4 points
- No budget signal at all: deduct up to 3 points
- Vague or overly broad requirements: deduct up to 2 points
- Mismatch with 2KO services: deduct up to 1 point
- Supplier pitch, SEO brief, or spam: score 0–10 maximum

SCORE LABELS (include in your internal scoring but do not expose to the client):
- 0–30: Low fit / low intent
- 31–60: Possible lead
- 61–80: Strong lead
- 81–100: Priority lead

Scoring must be explainable internally. Never expose the score, labels, or scoring reasoning in the client-facing reply body.
`.trim();
