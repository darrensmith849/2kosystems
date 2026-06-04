// Local-only email references store.
//
// Pure TS module — NO 'use client'. Types + constants + browser-safe
// localStorage helpers for the /admin/ops/emails workspace.
//
// This is a strictly browser-local CRUD store. The database is not yet
// connected; references live only in the operator's current browser
// (localStorage). When the live database goes online, the same shape
// migrates 1:1 to a real backend record.
//
// CALLER OWNS ID GENERATION.
//   The lib never invents ids on its own. The client component supplies
//   the id when calling appendLocalEmailRef(). This keeps id strategy
//   (UUID, timestamp+counter, etc.) controlled at the call-site and the
//   library deterministic.
//
// SSR safety: every helper that touches window/localStorage guards on
// `typeof window === 'undefined'` and swallows JSON / quota errors so a
// server import never throws.
//
// Privacy stance (mirrors the live page): no inbox is read, no email
// body is stored. Operators record metadata only — subject, sender,
// category, optional external link, optional cross-references.

import type { EmailCategory, EmailProvider } from './email-services-data';

export const LOCAL_EMAIL_REFS_KEY = '2ko_ops_local_email_refs_v1';

export type LocalEmailRefStatus = 'needs_review' | 'confirmed' | 'linked_later';

export type LocalEmailRef = {
  id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  category: EmailCategory;
  provider: EmailProvider;
  externalUrl: string;
  linkedClient: string;
  linkedAsset: string;
  linkedTicket: string;
  linkedRenewal: string;
  linkedIncident: string;
  notes: string;
  status: LocalEmailRefStatus;
  createdAt: number; // ms epoch
  updatedAt: number; // ms epoch
};

// --- Storage helpers ----------------------------------------------------
// Browser-safe: no-op (or return safe defaults) when window / localStorage
// is unavailable, and swallow JSON or quota errors silently.

export function loadLocalEmailRefs(): LocalEmailRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_EMAIL_REFS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Best-effort shape guard: keep entries that at least have an id + subject.
    return (parsed as unknown[]).filter(
      (r): r is LocalEmailRef =>
        !!r &&
        typeof r === 'object' &&
        typeof (r as { id?: unknown }).id === 'string' &&
        typeof (r as { subject?: unknown }).subject === 'string',
    );
  } catch {
    return [];
  }
}

export function persistLocalEmailRefs(refs: LocalEmailRef[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_EMAIL_REFS_KEY, JSON.stringify(refs));
  } catch {
    // silent: storage may be full, disabled, or in a private window
  }
}

export function appendLocalEmailRef(ref: LocalEmailRef): LocalEmailRef[] {
  const current = loadLocalEmailRefs();
  const next = [...current, ref];
  persistLocalEmailRefs(next);
  return next;
}

export function updateLocalEmailRef(
  id: string,
  patch: Partial<Omit<LocalEmailRef, 'id' | 'createdAt'>>,
): LocalEmailRef[] {
  const current = loadLocalEmailRefs();
  const next = current.map((r) =>
    r.id === id ? { ...r, ...patch, id: r.id, createdAt: r.createdAt } : r,
  );
  persistLocalEmailRefs(next);
  return next;
}

export function deleteLocalEmailRef(id: string): LocalEmailRef[] {
  const current = loadLocalEmailRefs();
  const next = current.filter((r) => r.id !== id);
  persistLocalEmailRefs(next);
  return next;
}

export function clearLocalEmailRefs(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LOCAL_EMAIL_REFS_KEY);
  } catch {
    // silent
  }
}

// --- Export helpers ----------------------------------------------------

export function exportLocalEmailRefsJson(refs: LocalEmailRef[]): string {
  return JSON.stringify(refs, null, 2);
}

const CATEGORY_LABEL_FOR_EXPORT: Record<EmailCategory, string> = {
  billing: 'Billing / invoices',
  domain_renewal: 'Domain renewals',
  hosting_renewal: 'Hosting renewals',
  supplier_notice: 'Supplier notices',
  client_support: 'Client support',
  change_request: 'Change requests',
  client_approval: 'Client approvals',
  incident_comms: 'Incident communications',
  quote_proposal: 'Quotes / proposals',
  internal_handover: 'Internal handover',
};

const CATEGORY_ORDER_FOR_EXPORT: EmailCategory[] = [
  'billing',
  'domain_renewal',
  'hosting_renewal',
  'supplier_notice',
  'client_support',
  'change_request',
  'client_approval',
  'incident_comms',
  'quote_proposal',
  'internal_handover',
];

function statusLabel(s: LocalEmailRefStatus): string {
  switch (s) {
    case 'needs_review':
      return 'Needs review';
    case 'confirmed':
      return 'Confirmed';
    case 'linked_later':
      return 'Linked later';
  }
}

export function exportLocalEmailRefsMarkdown(refs: LocalEmailRef[]): string {
  const lines: string[] = [];
  lines.push('# Local email references');
  lines.push('');
  lines.push(
    'Saved locally in this browser only. Not yet in the database. Metadata only — no email bodies.',
  );
  lines.push('');

  if (refs.length === 0) {
    lines.push('_No local references yet._');
    lines.push('');
    return lines.join('\n');
  }

  for (const cat of CATEGORY_ORDER_FOR_EXPORT) {
    const inCat = refs.filter((r) => r.category === cat);
    if (inCat.length === 0) continue;
    lines.push(`## ${CATEGORY_LABEL_FOR_EXPORT[cat]}`);
    lines.push('');
    for (const r of inCat) {
      const sender = r.fromEmail ? `${r.fromName} <${r.fromEmail}>` : r.fromName;
      const head = `- **${r.subject}** — ${sender || 'unknown sender'} _(${statusLabel(r.status)} · ${r.provider})_`;
      lines.push(head);
      const sub: string[] = [];
      if (r.externalUrl) sub.push(`  - Link: ${r.externalUrl}`);
      if (r.linkedClient) sub.push(`  - Client: ${r.linkedClient}`);
      if (r.linkedAsset) sub.push(`  - Asset: ${r.linkedAsset}`);
      if (r.linkedTicket) sub.push(`  - Ticket: ${r.linkedTicket}`);
      if (r.linkedRenewal) sub.push(`  - Renewal: ${r.linkedRenewal}`);
      if (r.linkedIncident) sub.push(`  - Incident: ${r.linkedIncident}`);
      if (r.notes) sub.push(`  - Notes: ${r.notes}`);
      lines.push(...sub);
    }
    lines.push('');
  }

  // Any refs whose category somehow falls outside the known order go in an "Other" bucket.
  const known = new Set(CATEGORY_ORDER_FOR_EXPORT);
  const orphans = refs.filter((r) => !known.has(r.category));
  if (orphans.length > 0) {
    lines.push('## Other');
    lines.push('');
    for (const r of orphans) {
      const sender = r.fromEmail ? `${r.fromName} <${r.fromEmail}>` : r.fromName;
      lines.push(
        `- **${r.subject}** — ${sender || 'unknown sender'} _(${statusLabel(r.status)} · ${r.provider})_`,
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}
