# Agent Profile Contract

A **business profile** is a self-contained module that tells the orchestrator how to analyse enquiries for a specific business. Adding a new profile does not require changes to the orchestrator, safety layer, or admin console.

---

## Required interface

Every profile must export an object that satisfies `BusinessProfile` from `@/lib/agent-core/types`:

```ts
export interface BusinessProfile {
  key: string;                                          // unique slug, e.g. 'sa_private_schools'
  name: string;                                         // human-readable, e.g. 'SA Private Schools'
  buildSystemPrompt: (input: EnquiryInput) => string;   // returns the full system prompt
  buildUserPrompt: (input: EnquiryInput) => string;     // returns the user-turn message
}
```

---

## Recommended file structure

```
src/lib/agent-profiles/<profile-key>/
  index.ts        ← exports the BusinessProfile object
  config.ts       ← static metadata (name, key, businessContext, etc.)
  prompts.ts      ← buildSystemPrompt(), buildUserPrompt()
  scoring.ts      ← score adjustment logic (optional, imported by prompts)
  tone.ts         ← reply tone and style guidelines (optional, imported by prompts)
```

---

## Registration

Add the profile to `src/lib/agent-profiles/index.ts`:

```ts
import { twoKoSystemsProfile } from './two-ko-systems';
import { saPrivateSchoolsProfile } from './sa-private-schools';   // new

export const PROFILES: Record<string, BusinessProfile> = {
  two_ko_systems: twoKoSystemsProfile,
  sa_private_schools: saPrivateSchoolsProfile,                    // new
};
```

The orchestrator uses `input.businessKey` to look up the profile at runtime.

---

## What a profile controls

| Concern | Where |
|---|---|
| Business context and positioning | `config.ts` |
| Routing logic and enquiry types | `prompts.ts` (system prompt section) |
| Lead scoring weights | `scoring.ts` / `prompts.ts` |
| Reply tone and format | `tone.ts` / `prompts.ts` |
| Offer recommendations | `prompts.ts` (recommended offer guide) |

---

## What a profile does NOT control

- Safety enforcement (always in `agent-core/safety.ts`)
- Output schema (always `AgentOutput` from `agent-core/types.ts`)
- Storage, auth, or routing (always in the admin console)

---

## Testing a new profile

1. Add a built-in test case for the new profile in `testCases.ts` with `isBuiltIn: true`.
2. In Quality Lab, run the test case in mock mode first.
3. Switch to live mode and run again once an API key is configured.
4. Check that safety fields are all correct (4 hard assertions always pass).
5. Confirm `route.business` matches the new profile key.

---

## Planned profiles (stub only — README files exist)

| Profile key | Business | Status |
|---|---|---|
| `two_ko_systems` | 2KO Systems | Live |
| `sa_private_schools` | SA Private Schools | Planned |
| `six_sigma_south_africa` | Six Sigma South Africa | Planned |
| `vemia` | Vemia | Planned |
