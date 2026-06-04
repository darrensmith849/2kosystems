// Browser-only Local Contact Drafts module.
//
// Mirrors the established pattern from src/lib/ops/saved-workspace-local-state.ts:
//   * No 'server-only' (types/constants are imported into client components).
//   * All helpers are SSR-safe — they no-op (or return safe defaults) when
//     window / localStorage is unavailable, and swallow JSON / quota errors.
//   * The library NEVER generates ids on its own. Callers MUST supply ids.
//   * No use of the JS pseudo-random function on the Math global — ids are
//     created by callers (preferring crypto.randomUUID, falling back to a
//     timestamp + counter pattern).
//
// Storage key is versioned (v1) so we can ship a v2 migration later without
// silently overwriting existing browser-local drafts.

// NOTE — ContactRole is mirrored locally here (not imported from
// email-services-data.ts) because that module declares `'server-only'`. The
// union must stay aligned by hand with email-services-data.ts.
export type ContactRole =
  | 'client_owner'
  | 'billing_contact'
  | 'technical_contact'
  | 'supplier_support'
  | 'internal_owner'
  | 'approval_contact';

export const CONTACT_ROLE_LABEL_LOCAL: Record<ContactRole, string> = {
  client_owner: 'Client owner',
  billing_contact: 'Billing contact',
  technical_contact: 'Technical contact',
  supplier_support: 'Supplier support',
  internal_owner: 'Internal owner',
  approval_contact: 'Approval contact',
};

export const CONTACT_ROLES_REQUIRED: ContactRole[] = [
  'internal_owner',
  'client_owner',
  'billing_contact',
  'technical_contact',
  'supplier_support',
  'approval_contact',
];

export const LOCAL_CONTACT_DRAFTS_KEY = '2ko_ops_local_contact_drafts_v1';

export type LocalContactDraftStatus = 'needs_review' | 'confirmed' | 'placeholder';

export type LocalContactDraft = {
  id: string;
  name: string;
  organisation: string;
  role: ContactRole;
  email?: string;
  phone?: string;
  linkedClient: string;
  linkedAsset: string;
  notes: string;
  status: LocalContactDraftStatus;
  createdAt: number;
  updatedAt: number;
};

export const LOCAL_CONTACT_DRAFT_STATUS_LABEL: Record<LocalContactDraftStatus, string> = {
  needs_review: 'Needs review',
  confirmed: 'Confirmed (local)',
  placeholder: 'Placeholder',
};

// --- Storage helpers ----------------------------------------------------

export function loadLocalContactDrafts(): LocalContactDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CONTACT_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLocalContactDraft);
  } catch {
    return [];
  }
}

export function persistLocalContactDrafts(items: LocalContactDraft[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_CONTACT_DRAFTS_KEY, JSON.stringify(items));
  } catch {
    // silent — quota / disabled / private mode
  }
}

export function appendLocalContactDraft(
  items: LocalContactDraft[],
  draft: LocalContactDraft,
): LocalContactDraft[] {
  const next = [draft, ...items.filter((it) => it.id !== draft.id)];
  persistLocalContactDrafts(next);
  return next;
}

export function updateLocalContactDraft(
  items: LocalContactDraft[],
  id: string,
  patch: Partial<Omit<LocalContactDraft, 'id' | 'createdAt'>>,
  nowMs: number,
): LocalContactDraft[] {
  let touched = false;
  const next = items.map((it) => {
    if (it.id !== id) return it;
    touched = true;
    return { ...it, ...patch, updatedAt: nowMs };
  });
  if (touched) persistLocalContactDrafts(next);
  return next;
}

export function deleteLocalContactDraft(
  items: LocalContactDraft[],
  id: string,
): LocalContactDraft[] {
  const next = items.filter((it) => it.id !== id);
  if (next.length !== items.length) persistLocalContactDrafts(next);
  return next;
}

export function clearLocalContactDrafts(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LOCAL_CONTACT_DRAFTS_KEY);
  } catch {
    // silent
  }
}

// --- Exports ------------------------------------------------------------

export function exportLocalContactDraftsAsJson(items: LocalContactDraft[]): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), drafts: items }, null, 2);
}

export function exportLocalContactDraftsAsMarkdown(items: LocalContactDraft[]): string {
  const lines: string[] = [];
  lines.push('# 2KO Ops — Local contact drafts (browser-only)');
  lines.push('');
  lines.push(
    'These drafts are saved locally in your browser only. They are not in the database.',
  );
  lines.push('');
  if (items.length === 0) {
    lines.push('_No drafts yet._');
    return lines.join('\n');
  }
  for (const it of items) {
    lines.push(`## ${it.name || '(unnamed contact)'}`);
    lines.push('');
    lines.push(`- Organisation: ${it.organisation || '—'}`);
    lines.push(`- Role: ${it.role}`);
    lines.push(`- Status: ${LOCAL_CONTACT_DRAFT_STATUS_LABEL[it.status]}`);
    if (it.email) lines.push(`- Email: ${it.email}`);
    if (it.phone) lines.push(`- Phone: ${it.phone}`);
    if (it.linkedClient) lines.push(`- Linked client: ${it.linkedClient}`);
    if (it.linkedAsset) lines.push(`- Linked asset: ${it.linkedAsset}`);
    if (it.notes) {
      lines.push(`- Notes: ${it.notes}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// --- Type guard ---------------------------------------------------------

function isLocalContactDraft(value: unknown): value is LocalContactDraft {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.organisation === 'string' &&
    typeof v.role === 'string' &&
    typeof v.linkedClient === 'string' &&
    typeof v.linkedAsset === 'string' &&
    typeof v.notes === 'string' &&
    typeof v.status === 'string' &&
    typeof v.createdAt === 'number' &&
    typeof v.updatedAt === 'number'
  );
}
