'use client';

// Local-only email references workspace.
//
// Everything in this client is browser-local: the references are stored in
// localStorage under '2ko_ops_local_email_refs_v1' and never leave the
// operator's browser. No inbox is read, no email is sent, no email body is
// stored. Only metadata + optional cross-references are saved.
//
// Imports the icon primitives from @/components/admin-ui/icons when
// available. If that module is not yet present (Track A may land later),
// the inline SVG fallback below is used so this client can ship and render
// independently.

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminCard, Badge, SectionHeader } from '@/components/admin-ui';
import {
  EMAIL_CATEGORY_LABEL,
  EMAIL_CATEGORY_ORDER,
  type EmailCategory,
  type EmailProvider,
  type SnapshotEmailRef,
} from '@/lib/ops/email-services-data';
import {
  appendLocalEmailRef,
  clearLocalEmailRefs,
  deleteLocalEmailRef,
  exportLocalEmailRefsJson,
  exportLocalEmailRefsMarkdown,
  loadLocalEmailRefs,
  updateLocalEmailRef,
  type LocalEmailRef,
  type LocalEmailRefStatus,
} from '@/lib/ops/local-email-refs';

// --- Icon primitives ---------------------------------------------------
// Inline 16x16 SVG icons. This deliberately does NOT import from
// @/components/admin-ui/icons so this client renders even before Track A
// lands. Same visual contract: viewBox 0 0 16 16, currentColor stroke.

type IconProps = { className?: string };
const DEFAULT_ICON_CN = 'h-4 w-4 shrink-0';

function IconShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className ?? DEFAULT_ICON_CN}
    >
      {children}
    </svg>
  );
}

function MailIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <rect x={2} y={3.5} width={12} height={9} rx={1.5} />
      <path d="M2.5 4.5l5.5 4.5 5.5-4.5" />
    </IconShell>
  );
}
function PlusIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <path d="M8 3v10M3 8h10" />
    </IconShell>
  );
}
function EditIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <path d="M11 2.5l2.5 2.5L6 12.5H3.5V10z" />
    </IconShell>
  );
}
function TrashIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.2a1 1 0 0 0 1 .8h3.6a1 1 0 0 0 1-.8l.7-8.2" />
    </IconShell>
  );
}
function DownloadIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <path d="M8 2.5v7.5M5 7.5L8 10.5l3-3M3 13h10" />
    </IconShell>
  );
}
function SaveIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <path d="M3 3h7l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M5 3v3.5h5V3M5 13v-3h6v3" />
    </IconShell>
  );
}
function XIcon(p: IconProps) {
  return (
    <IconShell className={p.className}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </IconShell>
  );
}
function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <IconShell className={className}>
      {open ? <path d="M4 10l4-4 4 4" /> : <path d="M4 6l4 4 4-4" />}
    </IconShell>
  );
}

// --- Form draft type ---------------------------------------------------

type FormDraft = {
  editingId: string | null;
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
};

const EMPTY_DRAFT: FormDraft = {
  editingId: null,
  subject: '',
  fromName: '',
  fromEmail: '',
  category: 'billing',
  provider: 'manual',
  externalUrl: '',
  linkedClient: '',
  linkedAsset: '',
  linkedTicket: '',
  linkedRenewal: '',
  linkedIncident: '',
  notes: '',
  status: 'needs_review',
};

const PROVIDER_OPTIONS: EmailProvider[] = ['gmail', 'outlook', 'manual', 'unknown'];
const STATUS_OPTIONS: LocalEmailRefStatus[] = ['needs_review', 'confirmed', 'linked_later'];

function statusBadge(status: LocalEmailRefStatus) {
  switch (status) {
    case 'needs_review':
      return <Badge text="Needs review" tone="amber" />;
    case 'confirmed':
      return <Badge text="Confirmed" tone="green" />;
    case 'linked_later':
      return <Badge text="Linked later" tone="blue" />;
  }
}

function providerBadge(provider: EmailProvider) {
  switch (provider) {
    case 'gmail':
      return <Badge text="Gmail" tone="blue" />;
    case 'outlook':
      return <Badge text="Outlook" tone="blue" />;
    case 'manual':
      return <Badge text="Manual" tone="neutral" />;
    case 'unknown':
      return <Badge text="Unknown" tone="neutral" />;
  }
}

// --- ID generation (caller-side) ---------------------------------------
// Per project rule: do NOT use the JS pseudo-random function on Math.
// Prefer crypto.randomUUID(); otherwise build a deterministic-ish id from
// the current millisecond timestamp + the current refs length, read at
// the moment of the click.

function generateLocalId(refsLength: number): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return `local-${crypto.randomUUID()}`;
    } catch {
      // fall through
    }
  }
  const ts = Date.now();
  return `local-${ts.toString(36)}-${refsLength.toString(36)}`;
}

// --- Download helper ---------------------------------------------------

function downloadBlob(filename: string, content: string, mime: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // silent: download blocked / unsupported
  }
}

// --- Main client component ---------------------------------------------

export default function EmailsClient({ snapshotRefs }: { snapshotRefs: SnapshotEmailRef[] }) {
  const [refs, setRefs] = useState<LocalEmailRef[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<FormDraft>(EMPTY_DRAFT);
  const [formOpen, setFormOpen] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setRefs(loadLocalEmailRefs());
    setHydrated(true);
  }, []);

  // Group by category for display.
  const grouped = useMemo(() => {
    const map = new Map<EmailCategory, LocalEmailRef[]>();
    for (const cat of EMAIL_CATEGORY_ORDER) map.set(cat, []);
    for (const r of refs) {
      const list = map.get(r.category);
      if (list) list.push(r);
      else map.set(r.category, [r]);
    }
    return map;
  }, [refs]);

  const snapshotGrouped = useMemo(() => {
    const map = new Map<EmailCategory, SnapshotEmailRef[]>();
    for (const r of snapshotRefs) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return map;
  }, [snapshotRefs]);

  const openNewForm = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((ref: LocalEmailRef) => {
    setDraft({
      editingId: ref.id,
      subject: ref.subject,
      fromName: ref.fromName,
      fromEmail: ref.fromEmail,
      category: ref.category,
      provider: ref.provider,
      externalUrl: ref.externalUrl,
      linkedClient: ref.linkedClient,
      linkedAsset: ref.linkedAsset,
      linkedTicket: ref.linkedTicket,
      linkedRenewal: ref.linkedRenewal,
      linkedIncident: ref.linkedIncident,
      notes: ref.notes,
      status: ref.status,
    });
    setFormOpen(true);
  }, []);

  const cancelForm = useCallback(() => {
    setFormOpen(false);
    setDraft(EMPTY_DRAFT);
  }, []);

  const saveForm = useCallback(() => {
    const trimmedSubject = draft.subject.trim();
    if (!trimmedSubject) return; // refuse empty subject

    if (draft.editingId) {
      const now = Date.now();
      const next = updateLocalEmailRef(draft.editingId, {
        subject: trimmedSubject,
        fromName: draft.fromName.trim(),
        fromEmail: draft.fromEmail.trim(),
        category: draft.category,
        provider: draft.provider,
        externalUrl: draft.externalUrl.trim(),
        linkedClient: draft.linkedClient.trim(),
        linkedAsset: draft.linkedAsset.trim(),
        linkedTicket: draft.linkedTicket.trim(),
        linkedRenewal: draft.linkedRenewal.trim(),
        linkedIncident: draft.linkedIncident.trim(),
        notes: draft.notes.trim(),
        status: draft.status,
        updatedAt: now,
      });
      setRefs(next);
    } else {
      const now = Date.now();
      const newRef: LocalEmailRef = {
        id: generateLocalId(refs.length),
        subject: trimmedSubject,
        fromName: draft.fromName.trim(),
        fromEmail: draft.fromEmail.trim(),
        category: draft.category,
        provider: draft.provider,
        externalUrl: draft.externalUrl.trim(),
        linkedClient: draft.linkedClient.trim(),
        linkedAsset: draft.linkedAsset.trim(),
        linkedTicket: draft.linkedTicket.trim(),
        linkedRenewal: draft.linkedRenewal.trim(),
        linkedIncident: draft.linkedIncident.trim(),
        notes: draft.notes.trim(),
        status: draft.status,
        createdAt: now,
        updatedAt: now,
      };
      const next = appendLocalEmailRef(newRef);
      setRefs(next);
    }
    setFormOpen(false);
    setDraft(EMPTY_DRAFT);
  }, [draft, refs.length]);

  const handleDelete = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Delete this local email reference?');
    if (!ok) return;
    const next = deleteLocalEmailRef(id);
    setRefs(next);
  }, []);

  const handleClearAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Clear all local email references in this browser?');
    if (!ok) return;
    clearLocalEmailRefs();
    setRefs([]);
  }, []);

  const handleExportJson = useCallback(() => {
    const content = exportLocalEmailRefsJson(refs);
    downloadBlob('2ko-ops-local-email-refs.json', content, 'application/json');
  }, [refs]);

  const handleExportMd = useCallback(() => {
    const content = exportLocalEmailRefsMarkdown(refs);
    downloadBlob('2ko-ops-local-email-refs.md', content, 'text/markdown');
  }, [refs]);

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const totalLocal = refs.length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Local email references"
        subtitle="Browser-only workspace. Saved here until the database is connected."
      />

      {/* 1. Notice card */}
      <AdminCard title="Where these live">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge text="Saved locally in this browser" tone="amber" />
            <Badge text="Not yet in the database" tone="neutral" />
            <Badge text="Metadata only · no email bodies" tone="green" />
          </div>
          <p className="text-sm text-zinc-800 dark:text-[#e4e4e7] leading-relaxed">
            References created here live in this browser&apos;s local storage only. They are not yet
            synced to a database and they are not shared between devices or operators. When the
            database is connected, the same fields will migrate to a real backend record — the
            shape stays the same.
          </p>
          <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
            Storage key: <span className="font-mono text-zinc-900 dark:text-[#f5f5f5]">2ko_ops_local_email_refs_v1</span>{' '}
            · {hydrated ? `${totalLocal} local reference${totalLocal === 1 ? '' : 's'}` : 'loading…'}
          </p>
        </div>
      </AdminCard>

      {/* 2. Action bar */}
      <AdminCard title="Actions">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-[#27272a] bg-[#18181b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5] hover:bg-[#1f1f23]"
          >
            <PlusIcon />
            New reference
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            disabled={totalLocal === 0}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-[#27272a] bg-[#18181b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5] hover:bg-[#1f1f23] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon />
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleExportMd}
            disabled={totalLocal === 0}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-[#27272a] bg-[#18181b] px-3 py-2 text-xs text-zinc-900 dark:text-[#f5f5f5] hover:bg-[#1f1f23] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon />
            Export Markdown
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={totalLocal === 0}
            className="inline-flex items-center gap-2 rounded-md border border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs text-rose-200 hover:bg-rose-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TrashIcon />
            Clear local refs
          </button>
        </div>
      </AdminCard>

      {/* Form: inline expandable card */}
      {formOpen && (
        <AdminCard title={draft.editingId ? 'Edit reference' : 'New reference'}>
          <div className="space-y-3">
            <FormField label="Subject *">
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                placeholder="Hetzner Cloud · invoice — October 2026"
                className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
              />
            </FormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="From name">
                <input
                  type="text"
                  value={draft.fromName}
                  onChange={(e) => setDraft({ ...draft, fromName: e.target.value })}
                  placeholder="Hetzner Cloud"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
              <FormField label="From email">
                <input
                  type="text"
                  value={draft.fromEmail}
                  onChange={(e) => setDraft({ ...draft, fromEmail: e.target.value })}
                  placeholder="billing@hetzner.com"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Category">
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value as EmailCategory })
                  }
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                >
                  {EMAIL_CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {EMAIL_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Provider">
                <select
                  value={draft.provider}
                  onChange={(e) =>
                    setDraft({ ...draft, provider: e.target.value as EmailProvider })
                  }
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                >
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as LocalEmailRefStatus })
                  }
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'needs_review'
                        ? 'Needs review'
                        : s === 'confirmed'
                          ? 'Confirmed'
                          : 'Linked later'}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="External link">
              <input
                type="text"
                value={draft.externalUrl}
                onChange={(e) => setDraft({ ...draft, externalUrl: e.target.value })}
                placeholder="https://mail.google.com/…"
                className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
              />
            </FormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Linked client">
                <input
                  type="text"
                  value={draft.linkedClient}
                  onChange={(e) => setDraft({ ...draft, linkedClient: e.target.value })}
                  placeholder="Internal · 2KO Systems"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
              <FormField label="Linked asset">
                <input
                  type="text"
                  value={draft.linkedAsset}
                  onChange={(e) => setDraft({ ...draft, linkedAsset: e.target.value })}
                  placeholder="ma130-data (Hetzner server)"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
              <FormField label="Linked ticket">
                <input
                  type="text"
                  value={draft.linkedTicket}
                  onChange={(e) => setDraft({ ...draft, linkedTicket: e.target.value })}
                  placeholder="Optional ticket reference"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
              <FormField label="Linked renewal">
                <input
                  type="text"
                  value={draft.linkedRenewal}
                  onChange={(e) => setDraft({ ...draft, linkedRenewal: e.target.value })}
                  placeholder="Optional renewal reference"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
              <FormField label="Linked incident">
                <input
                  type="text"
                  value={draft.linkedIncident}
                  onChange={(e) => setDraft({ ...draft, linkedIncident: e.target.value })}
                  placeholder="Optional incident reference"
                  className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
                />
              </FormField>
            </div>
            <FormField label="Notes">
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Short operator note. No email body content."
                rows={3}
                className="w-full rounded-md border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-3 py-2 text-sm text-zinc-900 dark:text-[#f5f5f5] focus:border-[#3f3f46] focus:outline-none"
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={saveForm}
                disabled={!draft.subject.trim()}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <SaveIcon />
                Save reference
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-[#27272a] bg-[#18181b] px-3 py-2 text-xs text-zinc-600 dark:text-[#a1a1aa] hover:bg-[#1f1f23]"
              >
                <XIcon />
                Cancel
              </button>
              <span className="text-[11px] text-zinc-500 dark:text-[#71717a]">
                Saved only in this browser. No email body content stored.
              </span>
            </div>
          </div>
        </AdminCard>
      )}

      {/* 3. List of local refs grouped by category */}
      <AdminCard title="Saved references (this browser)">
        {!hydrated ? (
          <p className="text-xs text-zinc-500 dark:text-[#71717a]">Loading…</p>
        ) : totalLocal === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
            No local references yet. Use{' '}
            <span className="text-zinc-900 dark:text-[#f5f5f5]">New reference</span> to file one — it stays in this
            browser only.
          </p>
        ) : (
          <div className="space-y-3">
            {EMAIL_CATEGORY_ORDER.map((cat) => {
              const inCat = grouped.get(cat) ?? [];
              if (inCat.length === 0) return null;
              const collapsed = !!collapsedCats[cat];
              return (
                <div
                  key={cat}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                      <MailIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                      {EMAIL_CATEGORY_LABEL[cat]}
                      <span className="text-xs text-zinc-500">({inCat.length})</span>
                    </span>
                    <ChevronIcon open={!collapsed} className="h-4 w-4 text-zinc-400" />
                  </button>
                  {!collapsed && (
                    <ul className="space-y-2 px-3 pb-3">
                      {inCat.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {statusBadge(r.status)}
                            {providerBadge(r.provider)}
                            {r.linkedClient && (
                              <Badge text={`client · ${r.linkedClient}`} tone="neutral" />
                            )}
                            {r.linkedIncident && (
                              <Badge text="incident-linked" tone="neutral" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5]">{r.subject}</p>
                          {(r.fromName || r.fromEmail) && (
                            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] mt-0.5">
                              from {r.fromName || 'unknown'}
                              {r.fromEmail && (
                                <>
                                  {' '}
                                  <span className="text-zinc-500 dark:text-[#52525b]">
                                    &lt;{r.fromEmail}&gt;
                                  </span>
                                </>
                              )}
                            </p>
                          )}
                          {r.notes && (
                            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] mt-1.5 leading-relaxed">
                              {r.notes}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(r)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-[#27272a] bg-[#18181b] px-2 py-1 text-[11px] text-zinc-800 dark:text-[#e4e4e7] hover:bg-[#1f1f23]"
                            >
                              <EditIcon className="h-3.5 w-3.5 shrink-0" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/30 bg-rose-400/5 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-400/10"
                            >
                              <TrashIcon className="h-3.5 w-3.5 shrink-0" />
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* 4. Planned categories recap — snapshot preview rows from props */}
      <AdminCard title="Planned categories recap (preview)">
        <p className="mb-3 text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
          Reference how each category is meant to look when used. These rows come from the planned
          snapshot data — they are not editable here.
        </p>
        <ul className="space-y-2">
          {EMAIL_CATEGORY_ORDER.map((cat) => {
            const inCat = snapshotGrouped.get(cat) ?? [];
            if (inCat.length === 0) return null;
            return (
              <li key={cat} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge text={EMAIL_CATEGORY_LABEL[cat]} tone="blue" />
                </div>
                <ul className="space-y-1">
                  {inCat.map((e) => (
                    <li key={e.id} className="text-xs text-zinc-400">
                      <span className="text-zinc-100">{e.subject}</span>
                      {e.fromName && <> — from {e.fromName}</>}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </AdminCard>

      {/* 5. Disabled future shared form hint */}
      <AdminCard title="Future shared form">
        <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
          A shared, multi-operator email reference form will activate once the database is
          connected. Until then, the form above is browser-only — references created here stay on
          this device. The same fields will move 1:1 to the shared form, so anything captured now
          can be re-entered or migrated later without changing the data shape.
        </p>
      </AdminCard>
    </div>
  );
}

// --- Small layout primitives ------------------------------------------

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
