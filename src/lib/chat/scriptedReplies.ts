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
    label: "What does 2KO do?",
    reply:
      "2KO improves operational processes, builds capability through Six Sigma South Africa, automates repeatable work through 2KO Systems and measures whether the result holds with Sigmafy. The right starting point depends on the constraint—not on which service is easiest to sell.",
  },
  {
    intent: "how-pricing-works",
    label: "How does pricing work?",
    reply:
      "A Half-Day Process Review is R7,500 and a standard Process and Automation Opportunity Audit is R24,500, both ex VAT. A Workflow Automation Pilot starts at R145,000. Each step has a written scope, and you can stop when you have the answer you need.",
  },
  {
    intent: "start-smaller",
    label: "Can we start smaller?",
    reply:
      "Yes. If the constraint is unclear, start with one half-day Process Review. If the process is already agreed, a focused pilot can prove one measurable workflow before a larger build. The smallest useful step should still leave you with a defensible decision.",
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
