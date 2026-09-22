/**
 * Lightweight analytics hooks. No third-party dependency in v1.
 * If/when an analytics tool (PostHog, GA4) is added, wire it in here once
 * and every event will start flowing without changes elsewhere.
 */

export type ChatEvent =
  | "chat_opened"
  | "chat_closed"
  | "quick_reply_clicked"
  | "lead_details_submitted"
  | "audit_intent_detected"
  | "human_handoff_requested"
  | "handoff_submitted"
  | "turn_cap_reached";

type EventProps = Record<string, string | number | boolean | undefined | null>;

export function trackChatEvent(event: ChatEvent, props?: EventProps) {
  if (typeof window === "undefined") return;

  // No-op stub. If window-level analytics exist, dispatch to them here.
  // Wired so future PostHog / GA4 / Segment integration is one-line.
  type WindowWithAnalytics = Window & {
    posthog?: { capture: (name: string, props?: EventProps) => void };
    gtag?: (cmd: string, name: string, props?: EventProps) => void;
  };

  const w = window as WindowWithAnalytics;
  if (w.posthog?.capture) {
    w.posthog.capture(event, props);
  } else if (w.gtag) {
    w.gtag("event", event, props);
  } else if (process.env.NODE_ENV !== "production") {
    // Console-safe debug echo in dev.
    console.debug("[chat-analytics]", event, props ?? {});
  }
}
