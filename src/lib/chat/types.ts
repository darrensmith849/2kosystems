/**
 * Shared types for the 2KO Systems site chat widget.
 */

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  /** Plain text content. Scripted intents are static strings. */
  content: string;
  /** ISO timestamp when the message was added. */
  createdAt: string;
  /** Optional intent label for scripted replies (so we can render them visually if needed). */
  intent?: ScriptedIntent | "free-form";
};

export type Lead = {
  name: string;
  email: string;
  phone?: string;
};

export type ScriptedIntent =
  | "what-do-you-build"
  | "how-pricing-works"
  | "start-smaller"
  | "talk-to-human";

/** Server payload sent from the client to /api/chat (free-form turns only). */
export type ChatRequestBody = {
  /** Last 12 turns max — see CHAT_TURN_WINDOW. */
  messages: { role: "user" | "assistant"; content: string }[];
  lead?: Lead | null;
  /** The page the user is currently on, for context. */
  pagePath?: string;
};

export type ChatResponseBody =
  | { ok: true; reply: string; intent?: string }
  | { ok: false; error: string };

export type HandoffRequestBody = {
  lead: Lead;
  transcript: ChatMessage[];
  pagePath?: string;
  requestedHuman: boolean;
  detectedIntent?: string;
  /** ISO timestamp when handoff was triggered. */
  timestamp: string;
};

export type HandoffResponseBody = { ok: true } | { ok: false; error: string };
