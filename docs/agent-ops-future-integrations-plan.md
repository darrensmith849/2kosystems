# Agent Ops — Future Integrations Plan

**Status:** Contracts written, all implementations disabled.  
**Prerequisite:** Admin approval workflow in DB must be live before any integration is enabled.

---

## Guiding constraints

1. **No auto-send, ever.** Every outbound action requires explicit admin approval.
2. **requiresApproval is an invariant.** All `AgentAction` types hard-code `requiresApproval: true`. It is not a runtime flag.
3. **Disabled by default.** `DisabledIntegrationExecutor` returns `{ status: 'disabled' }` for every action type. Replacing it requires a code change, not just a config flag.
4. **One integration at a time.** Enable and test each integration in isolation before enabling the next.

---

## Integration roadmap

### 1. Email reply drafts (Brevo / Resend)

**Action type:** `send_email_draft`  
**Trigger:** Admin clicks "Send approved draft" in the Workflow tab.  
**Prerequisites:**
- DB persistence live (Phase 2)
- Approval workflow UI built
- `BREVO_API_KEY` or `RESEND_API_KEY` provisioned
- Admin explicitly approves the specific draft

**Implementation path:**
```
src/lib/agent-integrations/emailExecutor.ts   ← implements AgentJobRepository interface
src/app/api/admin/agent/send-draft/route.ts   ← POST, session + approval check
```

**Never implement:**
- Auto-reply on analysis complete
- Scheduled reply without per-send approval

---

### 2. WhatsApp draft messages (Twilio)

**Action type:** `send_whatsapp_draft`  
**Trigger:** Admin clicks "Send WhatsApp" in Workflow tab.  
**Prerequisites:**
- Twilio account with WhatsApp sender approved
- DB approval record required before execution
- Phone number in E.164 format validated

**Implementation path:**
```
src/lib/agent-integrations/whatsappExecutor.ts
src/app/api/admin/agent/send-whatsapp/route.ts
```

---

### 3. CRM contact creation (HubSpot / Pipedrive)

**Action type:** `create_crm_contact`  
**Trigger:** Admin clicks "Create CRM contact" on a qualified lead.  
**Prerequisites:**
- CRM API key provisioned
- Deduplication logic (check by email first)
- Approved by admin per job

**Implementation path:**
```
src/lib/agent-integrations/crmExecutor.ts
src/app/api/admin/agent/crm-action/route.ts
```

---

### 4. Internal Slack alerts (high-value leads)

**Action type:** `send_internal_alert`  
**Trigger:** Agent scores lead ≥ 80 AND admin confirms send in Diagnostics/Alerts.  
**Prerequisites:**
- Slack webhook URL provisioned
- Admin reviews alert content before it sends

**Note:** Internal alerts are lower risk than client-facing sends, but still require approval to avoid alert fatigue.

---

## Security checklist before enabling any integration

- [ ] Admin approval record exists in DB before any `execute()` call
- [ ] Approval record includes `approvedBy` (admin identity) and `approvedAt` timestamp
- [ ] Action payload logged to audit table before and after execution
- [ ] Rate limiting on send endpoints (per job, per day)
- [ ] Idempotency key used for all send calls to prevent double-sends on retry
- [ ] `verify:agent-ops` still passes after adding the integration
- [ ] No `NEXT_PUBLIC_` env vars used for API keys
- [ ] Integration tested in mock mode before live credentials are added
