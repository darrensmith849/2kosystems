'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminCard, Badge } from '@/components/admin-ui';
import {
  CONTACT_ROLES_REQUIRED,
  CONTACT_ROLE_LABEL_LOCAL,
  LOCAL_CONTACT_DRAFT_STATUS_LABEL,
  appendLocalContactDraft,
  clearLocalContactDrafts,
  deleteLocalContactDraft,
  exportLocalContactDraftsAsJson,
  exportLocalContactDraftsAsMarkdown,
  loadLocalContactDrafts,
  updateLocalContactDraft,
  type ContactRole,
  type LocalContactDraft,
  type LocalContactDraftStatus,
} from '@/lib/ops/local-contact-drafts';

// Track C — ContactsClient
//
// Browser-local CRUD for contact drafts + a required-roles-by-area checklist.
// Mirrors the Emails LocalEmailRef workspace: add / edit / delete / clear /
// export JSON + Markdown, with a clear "saved locally in this browser" notice.
//
// We DO NOT auto-fill real personal details. New drafts start blank and the
// operator types in whatever placeholder or pseudo-anonymous label they want.
//
// Ids: prefer crypto.randomUUID(); fall back to a timestamp-with-counter
// pattern. We DO NOT use the JS pseudo-random function on the Math global.

// --- Snapshot contact shape (mirrored, no 'server-only' import) ---------

export type ContactsClientSnapshot = {
  id: string;
  name: string;
  organisation: string;
  role: ContactRole;
  notes: string;
};

// --- ID generation (no Math-random) ------------------------------------

let idCounter = 0;

function generateDraftId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return `draft-${crypto.randomUUID()}`;
    } catch {
      // fall through to timestamp + counter
    }
  }
  idCounter = (idCounter + 1) % 1_000_000;
  const ts = Date.now().toString(36);
  const seq = idCounter.toString(36).padStart(4, '0');
  return `draft-${ts}-${seq}`;
}

// --- Tiny inline-SVG icons ---------------------------------------------

function IconBase({ d, className = 'h-3.5 w-3.5 shrink-0' }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return <IconBase d="M8 3v10M3 8h10" className={className} />;
}
function IconEdit({ className }: { className?: string }) {
  return <IconBase d="M3 13h3l7-7-3-3-7 7zM10 4l2 2" className={className} />;
}
function IconTrash({ className }: { className?: string }) {
  return <IconBase d="M3 5h10M6 5V3h4v2M5 5l1 8h4l1-8" className={className} />;
}
function IconDownload({ className }: { className?: string }) {
  return <IconBase d="M8 2v8M5 7l3 3 3-3M3 13h10" className={className} />;
}
function IconSave({ className }: { className?: string }) {
  return <IconBase d="M3 3h8l2 2v8H3zM5 3v4h6V3M5 13v-3h6v3" className={className} />;
}
function IconX({ className }: { className?: string }) {
  return <IconBase d="M4 4l8 8M12 4l-8 8" className={className} />;
}
function IconCheck({ className }: { className?: string }) {
  return <IconBase d="M3 8.5l3 3 7-7" className={className} />;
}
function IconAlert({ className }: { className?: string }) {
  return <IconBase d="M8 2l6 11H2zM8 6v3M8 11v.01" className={className} />;
}

// --- Download helper ---------------------------------------------------

function triggerDownload(filename: string, content: string, mime: string): void {
  if (typeof window === 'undefined') return;
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch {
    // silent
  }
}

// --- Form state --------------------------------------------------------

type DraftFormState = {
  name: string;
  organisation: string;
  role: ContactRole;
  email: string;
  phone: string;
  linkedClient: string;
  linkedAsset: string;
  notes: string;
  status: LocalContactDraftStatus;
};

function emptyForm(): DraftFormState {
  return {
    name: '',
    organisation: '',
    role: 'client_owner',
    email: '',
    phone: '',
    linkedClient: '',
    linkedAsset: '',
    notes: '',
    status: 'needs_review',
  };
}

function draftToForm(d: LocalContactDraft): DraftFormState {
  return {
    name: d.name,
    organisation: d.organisation,
    role: d.role,
    email: d.email ?? '',
    phone: d.phone ?? '',
    linkedClient: d.linkedClient,
    linkedAsset: d.linkedAsset,
    notes: d.notes,
    status: d.status,
  };
}

function formToDraft(form: DraftFormState, id: string, createdAt: number, nowMs: number): LocalContactDraft {
  return {
    id,
    name: form.name.trim(),
    organisation: form.organisation.trim(),
    role: form.role,
    email: form.email.trim() ? form.email.trim() : undefined,
    phone: form.phone.trim() ? form.phone.trim() : undefined,
    linkedClient: form.linkedClient.trim(),
    linkedAsset: form.linkedAsset.trim(),
    notes: form.notes.trim(),
    status: form.status,
    createdAt,
    updatedAt: nowMs,
  };
}

// --- Component ---------------------------------------------------------

export default function ContactsClient({
  snapshotContacts,
}: {
  snapshotContacts: ContactsClientSnapshot[];
}) {
  const [hydrated, setHydrated] = useState(false);
  const [drafts, setDrafts] = useState<LocalContactDraft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftFormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setDrafts(loadLocalContactDrafts());
    setHydrated(true);
  }, []);

  const isEditing = editingId !== null;

  // --- Required roles checklist -----------------------------------------
  // A role is "covered" if at least one snapshot placeholder OR one local
  // draft exists for it.

  const coverageByRole = useMemo(() => {
    const map: Record<ContactRole, { snapshot: number; drafts: number }> = {
      client_owner: { snapshot: 0, drafts: 0 },
      billing_contact: { snapshot: 0, drafts: 0 },
      technical_contact: { snapshot: 0, drafts: 0 },
      supplier_support: { snapshot: 0, drafts: 0 },
      internal_owner: { snapshot: 0, drafts: 0 },
      approval_contact: { snapshot: 0, drafts: 0 },
    };
    for (const c of snapshotContacts) {
      if (map[c.role]) map[c.role].snapshot += 1;
    }
    for (const d of drafts) {
      if (map[d.role]) map[d.role].drafts += 1;
    }
    return map;
  }, [snapshotContacts, drafts]);

  const missingRoles = CONTACT_ROLES_REQUIRED.filter((role) => {
    const c = coverageByRole[role];
    return c.snapshot + c.drafts === 0;
  });

  // --- CRUD handlers ----------------------------------------------------

  const handleStartAdd = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }, []);

  const handleStartEdit = useCallback((draft: LocalContactDraft) => {
    setEditingId(draft.id);
    setForm(draftToForm(draft));
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const now = Date.now();
    if (!form.name.trim() && !form.organisation.trim()) {
      // Reject empty drafts silently — require at least a name or organisation
      // before persisting so the local store doesn't fill with blank rows.
      return;
    }
    if (isEditing && editingId) {
      setDrafts((prev) =>
        updateLocalContactDraft(
          prev,
          editingId,
          {
            name: form.name.trim(),
            organisation: form.organisation.trim(),
            role: form.role,
            email: form.email.trim() ? form.email.trim() : undefined,
            phone: form.phone.trim() ? form.phone.trim() : undefined,
            linkedClient: form.linkedClient.trim(),
            linkedAsset: form.linkedAsset.trim(),
            notes: form.notes.trim(),
            status: form.status,
          },
          now,
        ),
      );
    } else {
      const id = generateDraftId();
      const draft = formToDraft(form, id, now, now);
      setDrafts((prev) => appendLocalContactDraft(prev, draft));
    }
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(false);
  }, [form, isEditing, editingId]);

  const handleDelete = useCallback((id: string) => {
    setDrafts((prev) => deleteLocalContactDraft(prev, id));
    setEditingId((cur) => (cur === id ? null : cur));
  }, []);

  const handleClearAll = useCallback(() => {
    clearLocalContactDrafts();
    setDrafts([]);
    setConfirmClear(false);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleExportJson = useCallback(() => {
    triggerDownload(
      '2ko-ops-local-contact-drafts.json',
      exportLocalContactDraftsAsJson(drafts),
      'application/json',
    );
  }, [drafts]);

  const handleExportMd = useCallback(() => {
    triggerDownload(
      '2ko-ops-local-contact-drafts.md',
      exportLocalContactDraftsAsMarkdown(drafts),
      'text/markdown',
    );
  }, [drafts]);

  // --- Render -----------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* Required roles checklist */}
      <AdminCard
        title="Required roles by area"
        action={
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#71717a]">
            {CONTACT_ROLES_REQUIRED.length - missingRoles.length}/{CONTACT_ROLES_REQUIRED.length} covered
          </span>
        }
      >
        <p className="mb-3 text-xs text-[#a1a1aa] leading-relaxed">
          Each row shows whether at least one placeholder or local draft exists for that role.
          A "covered" row only means the role is represented in this preview — not that real
          personal details have been entered.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CONTACT_ROLES_REQUIRED.map((role) => {
            const c = coverageByRole[role];
            const covered = c.snapshot + c.drafts > 0;
            return (
              <li
                key={role}
                className="flex items-center gap-2 rounded-xl border border-[#1c1c1e] bg-[#0e0e10] px-3 py-2"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    covered
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                      : 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  }`}
                >
                  {covered ? <IconCheck className="h-3 w-3" /> : <IconAlert className="h-3 w-3" />}
                </span>
                <span className="flex-1 text-sm text-[#e4e4e7]">
                  {CONTACT_ROLE_LABEL_LOCAL[role]}
                </span>
                <span className="font-mono text-[10px] text-[#71717a]">
                  {c.snapshot} placeholder{c.snapshot === 1 ? '' : 's'}
                  {hydrated && c.drafts > 0 ? ` · ${c.drafts} draft${c.drafts === 1 ? '' : 's'}` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </AdminCard>

      {/* Missing-contact list */}
      <AdminCard title="Missing contact roles">
        {missingRoles.length === 0 ? (
          <p className="text-xs text-[#71717a]">
            All required roles have at least one placeholder or local draft.
          </p>
        ) : (
          <ul className="space-y-2">
            {missingRoles.map((role) => (
              <li
                key={role}
                className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-sm text-amber-200"
              >
                <IconAlert className="h-3.5 w-3.5" />
                <span>{CONTACT_ROLE_LABEL_LOCAL[role]} — no placeholder or draft yet</span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {/* Local drafts workspace */}
      <AdminCard
        title="Local contact drafts"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#71717a]">
              {hydrated ? `${drafts.length} saved` : 'loading…'}
            </span>
          </div>
        }
      >
        <p className="mb-3 rounded-lg border border-dashed border-sky-400/30 bg-sky-400/5 px-3 py-2 text-[11px] text-sky-200 leading-relaxed">
          Saved locally in this browser — not yet in the database. Drafts never leave your
          machine until you export them.
        </p>

        {!showForm && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-400/15 transition-colors"
            >
              <IconPlus />
              Add draft contact
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              disabled={!hydrated || drafts.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#e4e4e7] hover:border-emerald-400/40 hover:text-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDownload />
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleExportMd}
              disabled={!hydrated || drafts.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#e4e4e7] hover:border-emerald-400/40 hover:text-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDownload />
              Export Markdown
            </button>
            {drafts.length > 0 && (
              confirmClear ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-[11px] text-amber-300">Clear all drafts?</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/15 transition-colors"
                  >
                    <IconTrash />
                    Yes, clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#3f3f46] transition-colors"
                  >
                    <IconX />
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-rose-400/40 hover:text-rose-200 transition-colors"
                >
                  <IconTrash />
                  Clear all
                </button>
              )
            )}
          </div>
        )}

        {showForm && (
          <DraftForm
            form={form}
            setForm={setForm}
            isEditing={isEditing}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        )}

        {/* List */}
        {hydrated && drafts.length === 0 && !showForm && (
          <p className="text-xs text-[#71717a]">
            No drafts yet. Click "Add draft contact" to capture a placeholder for review.
          </p>
        )}

        {hydrated && drafts.length > 0 && (
          <ul className="space-y-2">
            {drafts.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-3"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="text-sm font-medium text-[#f5f5f5]">
                    {d.name || '(unnamed)'}
                  </p>
                  <Badge text={CONTACT_ROLE_LABEL_LOCAL[d.role]} tone="blue" />
                  <Badge
                    text={LOCAL_CONTACT_DRAFT_STATUS_LABEL[d.status]}
                    tone={
                      d.status === 'confirmed'
                        ? 'green'
                        : d.status === 'placeholder'
                          ? 'neutral'
                          : 'amber'
                    }
                  />
                </div>
                <p className="text-xs text-[#a1a1aa]">
                  {d.organisation || '—'}
                </p>
                {(d.email || d.phone) && (
                  <p className="mt-1 font-mono text-[11px] text-[#a1a1aa]">
                    {d.email ?? ''}
                    {d.email && d.phone ? ' · ' : ''}
                    {d.phone ?? ''}
                  </p>
                )}
                {(d.linkedClient || d.linkedAsset) && (
                  <p className="mt-1 text-[11px] text-[#71717a]">
                    {d.linkedClient && <>Client: {d.linkedClient}</>}
                    {d.linkedClient && d.linkedAsset ? ' · ' : ''}
                    {d.linkedAsset && <>Asset: {d.linkedAsset}</>}
                  </p>
                )}
                {d.notes && (
                  <p className="mt-1.5 text-xs text-[#a1a1aa] leading-relaxed">{d.notes}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(d)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-2.5 py-1 text-[11px] text-[#a1a1aa] hover:border-emerald-400/40 hover:text-emerald-200 transition-colors"
                  >
                    <IconEdit />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-2.5 py-1 text-[11px] text-[#a1a1aa] hover:border-rose-400/40 hover:text-rose-200 transition-colors"
                  >
                    <IconTrash />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}

// --- Draft form sub-component -----------------------------------------

function DraftForm({
  form,
  setForm,
  isEditing,
  onCancel,
  onSubmit,
}: {
  form: DraftFormState;
  setForm: (next: DraftFormState) => void;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const canSave = form.name.trim().length > 0 || form.organisation.trim().length > 0;
  return (
    <div className="mb-4 rounded-xl border border-[#27272a] bg-[#0a0a0b] p-4 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
        {isEditing ? 'Edit draft' : 'New draft'}
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Internal billing, Acme client owner"
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
          />
        </Field>
        <Field label="Organisation">
          <input
            type="text"
            value={form.organisation}
            onChange={(e) => setForm({ ...form, organisation: e.target.value })}
            placeholder="e.g. 2KO Systems, Acme Ltd"
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
          />
        </Field>
        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as ContactRole })}
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] focus:border-emerald-400/40 focus:outline-none"
          >
            {CONTACT_ROLES_REQUIRED.map((r) => (
              <option key={r} value={r}>
                {CONTACT_ROLE_LABEL_LOCAL[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as LocalContactDraftStatus })
            }
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] focus:border-emerald-400/40 focus:outline-none"
          >
            <option value="needs_review">Needs review</option>
            <option value="confirmed">Confirmed (local)</option>
            <option value="placeholder">Placeholder</option>
          </select>
        </Field>
        <Field label="Email (optional)">
          <input
            type="text"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="optional"
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
          />
        </Field>
        <Field label="Phone (optional)">
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="optional"
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
          />
        </Field>
        <Field label="Linked client">
          <input
            type="text"
            value={form.linkedClient}
            onChange={(e) => setForm({ ...form, linkedClient: e.target.value })}
            placeholder="e.g. Impart Agency"
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
          />
        </Field>
        <Field label="Linked asset">
          <input
            type="text"
            value={form.linkedAsset}
            onChange={(e) => setForm({ ...form, linkedAsset: e.target.value })}
            placeholder="e.g. ma130-apps"
            className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Why this contact matters, what to confirm, etc."
          rows={3}
          className="w-full rounded-md border border-[#27272a] bg-[#0e0e10] px-2.5 py-1.5 text-xs text-[#f5f5f5] placeholder:text-[#52525b] focus:border-emerald-400/40 focus:outline-none"
        />
      </Field>
      <p className="text-[11px] text-[#71717a]">
        Avoid entering real personal email addresses or phone numbers here unless you intend to
        export and hand them off — drafts live only in this browser.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSave}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-400/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconSave />
          {isEditing ? 'Save changes' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#3f3f46] transition-colors"
        >
          <IconX />
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-[#71717a]">
        {label}
      </span>
      {children}
    </label>
  );
}
