/**
 * Chat widget guardrails and tunables. Centralised so cost limits and UX
 * caps can be reviewed in one place.
 */

/** Total user-turn cap per browser session. After this, bot insists on agent handoff. */
export const CHAT_TURN_CAP = 25;

/** Max turns sent to the model on each /api/chat call (older turns are dropped). */
export const CHAT_TURN_WINDOW = 12;

/** Anthropic max_tokens per reply. */
export const CHAT_MAX_TOKENS = 400;

/** Number of useful bot answers before the bot naturally requests contact details. */
export const CONTACT_NUDGE_AFTER_BOT_ANSWERS = 1;

/** Keys for sessionStorage persistence. */
export const STORAGE_KEYS = {
  messages: "2ko-chat-messages",
  lead: "2ko-chat-lead",
  open: "2ko-chat-open",
  contactNudgeShown: "2ko-chat-contact-nudge-shown",
} as const;

/** Anthropic model. Haiku is fast, cheap and more than capable for FAQ + triage. */
export const ANTHROPIC_MODEL = "claude-haiku-4-5";
