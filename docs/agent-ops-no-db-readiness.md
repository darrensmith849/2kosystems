# 2KO Systems — Agent Ops Console: No-Database Readiness Guide

## What Exists Now

The Agent Ops Console (Phase 1A–1M) is a private admin tool for 2KO Systems staff. It provides:

- **Analyse tab** — paste an enquiry, run it through the agent, get a lead classification, suggested reply, internal notes, and safety audit. All output is draft-only.
- **Workflow tab** — local history of all analyses this session, with status tracking, follow-up dates, admin notes, filtering, and sorting.
- **Quality Lab tab** — run built-in and custom test cases through the agent and check output against expected values. Useful for verifying mock mode and live mode behaviour.
- **Batch Inbox tab** — queue multiple enquiries for batch processing. Analyse one at a time, save to workflow history.
- **Export tab** — export workflow history as JSON, import JSON backups, build and download handover reports as Markdown.
- **Diagnostics tab** — load environment diagnostics (env var status, runtime mode), run a live readiness test, view security confirmation checklist.
- **Help tab** — quick start guide, about panel, safety checklist.

All data is stored in browser localStorage. No database, no Railway connection, no backend persistence.

## Access

URL: `/admin/agent` (do not share publicly)

Auth: Password login → HMAC-SHA256 session token → HttpOnly cookie → 8h expiry

The admin login page is at `/admin/agent`. The session is protected by `AGENT_ADMIN_UI_PASSWORD` (login credential) and `AGENT_ADMIN_API_KEY` (API proxy protection). Both are required.

## Required Env Vars

| Variable | Purpose | Required |
|---|---|---|
| AGENT_ADMIN_UI_PASSWORD | Login credential | Always |
| AGENT_ADMIN_API_KEY | Protects /api/admin/agent/analyse | Always |
| AGENT_MOCK_MODE | `true` = mock; `false`/unset = live | Always |
| ANTHROPIC_API_KEY | Claude API | Live mode only |
| AGENT_MODEL | Model override; defaults to `claude-sonnet-4-6` | Optional |
| AI_PROVIDER | Provider override; defaults to `anthropic` | Optional |

## Mock Mode

When `AGENT_MOCK_MODE=true`, no LLM calls are made. Deterministic mock responses are returned based on keyword detection in the message and subject. Safe for UI testing without API costs.

Use the Diagnostics tab to confirm mock mode is active before running tests.

## Live LLM Mode

Set `AGENT_MOCK_MODE=false` and `ANTHROPIC_API_KEY` in Vercel. Use the Diagnostics tab to verify configuration, then run the live readiness test to confirm end-to-end connectivity before using the console for real enquiries.

## localStorage Only (temporary)

The following is stored only in the browser localStorage:

- Analysis history (last 10 items)
- Workflow status, follow-up dates, admin notes
- Quality Lab custom test cases and test runs
- Batch Inbox queue
- Tab state, panel open/close state

**This data will be lost if browser storage is cleared or a different browser/device is used. Export JSON backups regularly.**

## What Is Not Yet Built

- Database persistence
- Multi-user support
- Server-side history
- Email / WhatsApp / CRM integration
- Public contact form auto-analysis
- Calendar integration
- Proposal sending

## Safety Guarantees

- `humanReviewRequired` is always `true`
- `approvalStatus` is always `"draft"`
- `autoSent` is always `false`
- `productionActionTaken` is always `false`
- Copy/download only — nothing is ever sent automatically

## Manual Test Checklist

- [ ] Log in at /admin/agent
- [ ] Check Diagnostics tab — confirm env var status
- [ ] Run a Quality Lab test case
- [ ] Paste a test enquiry in the Analyse tab
- [ ] Check the suggested reply has `[DRAFT — DO NOT SEND WITHOUT REVIEW]`
- [ ] Check safety panel shows `humanReviewRequired: true`
- [ ] Export workflow history as JSON backup
- [ ] If live mode: run live readiness test from Diagnostics tab

## Phase 2 Database Plan

See `docs/agent-ops-phase-2-database-plan.md`
