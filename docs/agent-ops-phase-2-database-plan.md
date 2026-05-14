# 2KO Systems — Agent Ops Phase 2: Database Plan

## Overview

Phase 2 introduces persistent server-side storage via Railway PostgreSQL. All existing localStorage data can be migrated via the existing JSON export available in the Export tab.

## Suggested `agent_jobs` Table

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |
| business_key | varchar(50) | e.g. `two_ko_systems` |
| input_payload | jsonb | Sanitised enquiry form fields |
| output_payload | jsonb | Full AgentOutput |
| sender_name | varchar(255) | Denormalised |
| sender_email | varchar(255) | Denormalised |
| lead_score | integer | Denormalised |
| enquiry_type | varchar(100) | Denormalised |
| status | enum | `new` / `needs_review` / `draft_ready` / `replied` / `waiting_for_response` / `follow_up_due` / `qualified` / `unqualified` / `archived` |
| follow_up_date | date | Nullable |
| admin_note | text | Nullable |
| approved_by | varchar(255) | Future multi-user |
| approved_at | timestamptz | Nullable |

## Approval/Status Workflow

1. Analysis runs → status = `needs_review`
2. Admin reviews in workflow board → status updated manually
3. Reply drafted → status = `draft_ready`
4. Admin manually sends reply → status = `replied`
5. No auto-send at any stage

## Audit Log Strategy

Separate `agent_job_events` table:

| Column | Type |
|---|---|
| id | uuid |
| job_id | uuid (FK) |
| event_type | varchar(100) |
| changed_by | varchar(255) |
| changed_at | timestamptz |
| old_value | jsonb |
| new_value | jsonb |

## Follow-up Tracking

- `follow_up_date` stored on each job
- Dashboard view filtered by `follow_up_date <= today`
- No automated reminders in Phase 2 — manual only

## Migration from localStorage

1. Export JSON from admin console Export tab
2. Parse exported array
3. Insert into `agent_jobs` via migration script
4. Verify counts match
5. Clear localStorage after confirmed migration

## Railway Environment Assumptions

- PostgreSQL database provisioned on Railway
- `DATABASE_URL` set in Vercel environment
- Connection pooling via `pg` or `postgres.js`
- No ORM required for Phase 2 — raw SQL or lightweight query builder

## No-Auto-Send Rules (enforced at DB level)

- `autoSent` column always `FALSE` — enforced by DB constraint
- `productionActionTaken` column always `FALSE` — enforced by DB constraint
- No triggers that send messages
- No webhooks to external services from DB

## Risks and Safeguards

- localStorage migration is one-way — keep export as backup
- Multi-user access requires session scoping per user
- Raw SQL requires parameterised queries to prevent injection
- `DATABASE_URL` must never be exposed client-side
- Railway free tier has limits — monitor usage
