import type { ScriptedIntent } from "./types";

/**
 * Scripted replies for the four quick-reply chips.
 * These never call the LLM endpoint — zero token cost.
 */

export type QuickReply = {
  intent: ScriptedIntent;
  label: string;
  /** If undefined, clicking triggers a special action (e.g. handoff). */
  reply?: string;
};

export const QUICK_REPLIES: QuickReply[] = [
  {
    intent: "what-do-you-build",
    label: "What do you build?",
    reply:
      "2KO Systems builds custom operational software, workflow automation, internal tools, client portals, dashboards, and AI-assisted systems for businesses that are still relying too heavily on spreadsheets, manual admin, WhatsApp, email, or disconnected tools. The usual starting point is a Systems Audit so we can map the process before quoting a build.",
  },
  {
    intent: "how-pricing-works",
    label: "How does pricing work?",
    reply:
      "Pricing is scoped around the workflow, complexity, integrations, users, and the level of automation needed. We usually frame work in three steps: a Systems Audit, a focused Proof-of-Value Pilot, and then a fuller Core System Build. The audit is where we lock down the real number instead of guessing publicly.",
  },
  {
    intent: "start-smaller",
    label: "Can we start smaller?",
    reply:
      "Yes — that is often the smartest path. Instead of jumping straight into a full build, many clients start with a focused pilot around one painful workflow. It lowers risk, proves value quickly, and if the bigger system goes ahead later, the pilot thinking and assets can inform the full build.",
  },
  {
    intent: "talk-to-human",
    label: "Talk to a real person",
    // No reply — UI handles this by triggering the handoff flow.
  },
];

export function findScriptedReply(intent: ScriptedIntent): QuickReply | undefined {
  return QUICK_REPLIES.find((r) => r.intent === intent);
}
