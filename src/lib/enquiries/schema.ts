/**
 * The shape of an enquiry, shared by the ingest endpoint and the dashboard.
 *
 * Deliberately permissive: every field except site and kind is optional,
 * because the three sites capture different things and a missing phone number
 * is not a reason to drop a lead on the floor. Validation rejects what cannot
 * be stored, not what is merely incomplete.
 */

export const KINDS = ["contact", "quote", "audit", "course"] as const;
export type EnquiryKind = (typeof KINDS)[number];

export const STATUSES = ["new", "responded", "closed"] as const;
export type EnquiryStatus = (typeof STATUSES)[number];

export type EnquiryInput = {
  site: string;
  kind: EnquiryKind;
  sourcePage?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  courseTopic?: string;
  courseMode?: string;
  delegates?: number;
  preferredCity?: string;
  industry?: string;
  utm?: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>>;
  referrer?: string;
  country?: string;
  userAgent?: string;
  /** Anything this schema does not name. Stored as JSON. */
  extra?: Record<string, unknown>;
};

export type EnquiryRow = {
  id: string;
  received_at: string;
  site: string;
  kind: string;
  source_page: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string | null;
  course_topic: string | null;
  course_mode: string | null;
  delegates: number | null;
  preferred_city: string | null;
  industry: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  country: string | null;
  user_agent: string | null;
  status: string;
  responded_at: string | null;
  response_kind: string | null;
  response_summary: string | null;
  extra: string | null;
};

/** Trim, collapse empties to null, and cap length so one bad POST cannot bloat a row. */
export function clean(v: unknown, max = 2000): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

export class InvalidEnquiry extends Error {}

/**
 * Narrow untrusted JSON to something storable. Throws only on what makes a row
 * meaningless: no site, an unknown kind, or no way at all to reach the person.
 */
export function validate(body: unknown): EnquiryInput {
  if (!body || typeof body !== "object") throw new InvalidEnquiry("Body must be an object.");
  const b = body as Record<string, unknown>;

  const site = clean(b.site, 255);
  if (!site) throw new InvalidEnquiry("site is required.");

  const kind = clean(b.kind, 32) ?? "contact";
  if (!(KINDS as readonly string[]).includes(kind)) {
    throw new InvalidEnquiry(`kind must be one of ${KINDS.join(", ")}.`);
  }

  const email = clean(b.email, 320);
  const phone = clean(b.phone, 64);
  if (!email && !phone) {
    throw new InvalidEnquiry("An enquiry needs an email address or a phone number.");
  }

  const utmIn = (b.utm ?? {}) as Record<string, unknown>;
  const delegates = Number(b.delegates);

  return {
    site,
    kind: kind as EnquiryKind,
    sourcePage: clean(b.sourcePage, 500) ?? undefined,
    name: clean(b.name, 200) ?? undefined,
    email: email ?? undefined,
    phone: phone ?? undefined,
    company: clean(b.company, 200) ?? undefined,
    subject: clean(b.subject, 300) ?? undefined,
    message: clean(b.message, 8000) ?? undefined,
    courseTopic: clean(b.courseTopic, 200) ?? undefined,
    courseMode: clean(b.courseMode, 64) ?? undefined,
    delegates: Number.isFinite(delegates) && delegates > 0 ? Math.floor(delegates) : undefined,
    preferredCity: clean(b.preferredCity, 120) ?? undefined,
    industry: clean(b.industry, 120) ?? undefined,
    utm: {
      source: clean(utmIn.source, 200) ?? undefined,
      medium: clean(utmIn.medium, 200) ?? undefined,
      campaign: clean(utmIn.campaign, 200) ?? undefined,
      term: clean(utmIn.term, 200) ?? undefined,
      content: clean(utmIn.content, 200) ?? undefined,
    },
    referrer: clean(b.referrer, 500) ?? undefined,
    country: clean(b.country, 8) ?? undefined,
    userAgent: clean(b.userAgent, 500) ?? undefined,
    extra: b.extra && typeof b.extra === "object" ? (b.extra as Record<string, unknown>) : undefined,
  };
}
