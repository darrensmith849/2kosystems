/**
 * Sigmafy is the source of truth for all leads/contacts captured across our
 * properties. This client POSTs to portal.sigmafy.co/api/v1/leads with the
 * shared bearer token (SIGMAFY_INGEST_TOKEN). Lead capture across the 2KO
 * Systems site (contact form + chat handoff) goes here. Transactional email
 * is sent separately through Cloudflare Email Service.
 */

export type SigmafyLeadPayload = {
  source: string;
  sourcePage?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject:
    | "course-enquiry"
    | "corporate-training"
    | "consultancy"
    | "partnership"
    | "newsletter"
    | "audit-request"
    | "general";
  message: string;
  utm?: Record<string, string> | null;
  userAgent?: string | null;
  receivedAt: string;
};

export type SigmafyLeadResponse = {
  id: string;
  created: boolean;
  contactId: string;
};

export class SigmafyLeadError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "SigmafyLeadError";
  }
}

export async function postSigmafyLead(
  payload: SigmafyLeadPayload,
): Promise<SigmafyLeadResponse> {
  const url = process.env.SIGMAFY_LEADS_URL;
  const token = process.env.SIGMAFY_INGEST_TOKEN;

  if (!url || !token) {
    throw new SigmafyLeadError(
      "Sigmafy lead ingest is not configured (SIGMAFY_LEADS_URL / SIGMAFY_INGEST_TOKEN missing)",
      0,
      null,
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new SigmafyLeadError(
      `Sigmafy lead POST failed: ${res.status}`,
      res.status,
      parsed,
    );
  }

  return parsed as SigmafyLeadResponse;
}
