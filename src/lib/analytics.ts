/**
 * Conversion tracking.
 *
 * Written after finding the Six Sigma account had spent ZAR 66,383 in 90 days
 * with zero conversions recorded, on Maximize Conversions bidding. Without a
 * conversion signal the bidding algorithm optimises toward nothing, so the
 * budget is effectively spent at random. This exists so that never happens
 * here.
 *
 * Two IDs are needed, both set as public env vars at build time:
 *   NEXT_PUBLIC_GADS_ID          e.g. AW-1234567890
 *   NEXT_PUBLIC_GADS_LABEL_*     the conversion label per action
 *
 * With neither set, every call below is a no-op — the site works exactly as
 * now and nothing is sent anywhere.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? "";

/** One label per conversion action, created in Google Ads. */
const LABELS = {
  enquiry: process.env.NEXT_PUBLIC_GADS_LABEL_ENQUIRY ?? "",
  scope: process.env.NEXT_PUBLIC_GADS_LABEL_SCOPE ?? "",
  brief: process.env.NEXT_PUBLIC_GADS_LABEL_BRIEF ?? "",
} as const;

export type ConversionName = keyof typeof LABELS;

/**
 * Rand values so Google can optimise toward the valuable action rather than
 * the frequent one. These are the *expected* value of the action, not a price:
 * an enquiry is worth more than a scope build because it is closer to revenue.
 */
const VALUES: Record<ConversionName, number> = {
  enquiry: 2500,
  /** Scope built *and* an email handed over. A named lead, not a visitor. */
  brief: 1200,
  /** Scope completed anonymously. Real intent, but nobody to call. */
  scope: 300,
};

export function track(name: ConversionName, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const label = LABELS[name];
  if (!GADS_ID || !label || !window.gtag) return;

  window.gtag("event", "conversion", {
    send_to: `${GADS_ID}/${label}`,
    value: VALUES[name],
    currency: "ZAR",
    ...extra,
  });
}

/**
 * Captures the click identifier on landing and keeps it for the session, so a
 * conversion that happens three pages later still attributes to the ad that
 * paid for the visit. Without this, only same-page conversions attribute.
 */
export function captureClickId() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  for (const key of ["gclid", "wbraid", "gbraid", "utm_source", "utm_campaign", "utm_term"]) {
    const value = params.get(key);
    if (value) {
      try {
        sessionStorage.setItem(`k_${key}`, value);
      } catch {
        // Private browsing — attribution degrades, nothing breaks.
      }
    }
  }
}

/** Read back what brought them here, for the enquiry notification email. */
export function attribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  for (const key of ["gclid", "utm_source", "utm_campaign", "utm_term"]) {
    try {
      const value = sessionStorage.getItem(`k_${key}`);
      if (value) out[key] = value;
    } catch {
      // ignore
    }
  }
  return out;
}
