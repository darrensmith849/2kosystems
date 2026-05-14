# Agent Ops — Contact Form Dry Run Plan

**Status:** Adapter functions written (`contactFormAdapter.ts`), not wired to any route.  
**Goal:** Connect the public contact form to the agent pipeline without any auto-send or data persistence.

---

## Current state

The contact form at `/contact` (or equivalent) POSTs to a Next.js route that:
1. Validates the payload
2. Sends a notification via Brevo
3. Returns a success/error response

The agent pipeline is completely separate, admin-only, and not connected to the form.

---

## Dry-run wiring (safe to do in Phase 1)

A "dry run" means the form POST triggers agent analysis **in addition to** the existing Brevo send, but:
- The agent output is **not saved** to any DB
- The agent output is **not sent** to anyone
- The agent output is **logged server-side only** (stdout / Vercel logs)
- All safety fields are enforced as always

### Steps

1. **In the contact form API route**, import `mapContactFormToEnquiryInput` from `contactFormAdapter.ts`.
2. After the existing Brevo send succeeds, call `runOrchestrator(input)` with the mapped input.
3. Log the output: `console.log('[agent-dry-run]', JSON.stringify(output.route, null, 2))`.
4. Do not store the output. Do not send it anywhere. Do not return it to the client.
5. Deploy and test with a real enquiry. Review Vercel logs to confirm the agent is scoring correctly.

### Code sketch (do not merge until tested)

```ts
// In: src/app/api/contact/route.ts  (or equivalent)
import { mapContactFormToEnquiryInput } from '@/lib/agent-integrations/contactFormAdapter';
import { runOrchestrator } from '@/lib/agent-core';

// ... existing validation and Brevo send ...

// Dry run — no persistence, no send
try {
  const input = mapContactFormToEnquiryInput(body);
  const output = await runOrchestrator(input);
  console.log('[agent-dry-run] route:', output.route.business, '| score:', output.classification.leadScore);
} catch (err) {
  console.error('[agent-dry-run] failed:', err);
  // Never block the response on agent errors
}
```

---

## Audit form dry run

The `mapAuditFormToEnquiryInput()` function maps the systems audit form.  
Same approach: run after the primary handler succeeds, log only, never block.

---

## Phase 2: live wiring

Once DB persistence is live:
1. Replace the dry-run log with `repository.create(createInput)` followed by `repository.applyAnalysis(job.id, analysisUpdate)`.
2. Add the new job to the admin Batch Inbox so it appears in the Workflow tab.
3. Trigger an internal Slack alert if score ≥ configured threshold.
4. Admin reviews and approves before any reply is sent.

---

## What this never does

- Auto-replies to the sender
- Saves to any database (until Phase 2 is explicitly enabled)
- Returns agent output to the public client
- Logs full message body to persistent logs (PII concern — log summary only)
