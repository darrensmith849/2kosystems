/**
 * Cloudflare Email Sending quota.
 *
 * The estate moved off Brevo onto Cloudflare Email Sending, which caps sending
 * per day — and the cap is **per account, not per domain**. Verified 2026-09-18
 * by reading three onboarded domains at once: sigmafy.co, 2ko.co.za and
 * 2kosystems.com all reported the same `13 / 200`.
 *
 * That matters more than it sounds. Sigmafy alone measured a 208/day peak over
 * the preceding month, so one busy day there exhausts the allowance for every
 * other domain too — including the enquiry forms on 2ko.co.za and
 * sixsigmauk.com. A ceiling nobody can see is the kind of thing this dashboard
 * exists to stop.
 */

const API = "https://api.cloudflare.com/client/v4";

export type EmailQuota = {
  sent: number;
  limit: number;
  overQuota: boolean;
  /** ISO timestamp when the daily counter resets. */
  resetsAt: string | null;
  error: string | null;
};

type QuotaResponse = {
  success?: boolean;
  errors?: { code?: number; message?: string }[];
  result?: {
    quota?: { value?: number; unit?: string };
    usage?: { sent?: number; over_quota?: boolean; resets_at?: string };
  };
};

export async function emailQuota(): Promise<EmailQuota> {
  const empty: EmailQuota = {
    sent: 0, limit: 0, overQuota: false, resetsAt: null, error: null,
  };

  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_EMAIL_TOKEN;
  if (!account || !token) {
    return { ...empty, error: "CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_EMAIL_TOKEN are not set on this Worker." };
  }

  try {
    const res = await fetch(`${API}/accounts/${account}/email/sending/limits`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as QuotaResponse;

    if (!res.ok || body.success !== true) {
      const detail = (body.errors ?? [])
        .map((e) => `${e.code ?? "?"}: ${e.message ?? "unknown"}`)
        .join("; ");
      return { ...empty, error: `${res.status} ${detail || res.statusText}` };
    }

    return {
      sent: body.result?.usage?.sent ?? 0,
      limit: body.result?.quota?.value ?? 0,
      overQuota: body.result?.usage?.over_quota ?? false,
      resetsAt: body.result?.usage?.resets_at ?? null,
      error: null,
    };
  } catch (e) {
    return { ...empty, error: e instanceof Error ? e.message : String(e) };
  }
}

/** How close the estate is to being cut off, 0–1. */
export function quotaUse(q: EmailQuota): number | null {
  return q.limit > 0 ? q.sent / q.limit : null;
}

/** Hours until the counter resets, for the "you are stuck until" line. */
export function hoursUntilReset(q: EmailQuota): number | null {
  if (!q.resetsAt) return null;
  const ms = new Date(q.resetsAt).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.max(0, ms / 3_600_000) : null;
}
