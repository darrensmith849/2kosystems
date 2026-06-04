'use client';

import { useMemo, useState } from 'react';
import { AdminCard, Badge } from '@/components/admin-ui';

// Track C — ServicesClient
//
// Client-side filtering, summary tiles, and JSON/Markdown export for the
// Services catalogue. The server page passes SNAPSHOT_SERVICES in via props so
// this component does not import from the 'server-only' module.
//
// Plain-business wording — we say "provider API keys" instead of "tokens".
// No network calls, no DB writes, no credentials displayed.

// --- Types (mirror SnapshotService from email-services-data.ts) ---------
// Mirrored locally so this client file does not pull in 'server-only'. The
// shape must stay aligned with email-services-data.ts.

type ServiceCategory =
  | 'infrastructure'
  | 'dns'
  | 'runtime'
  | 'source_control'
  | 'email_sending'
  | 'workspace_email'
  | 'monitoring'
  | 'registrar'
  | 'analytics'
  | 'ai'
  | 'support_saas'
  | 'other';

type ServiceStatus = 'active' | 'planned' | 'needs_review' | 'blocked';

type ServiceBlocker =
  | 'db'
  | 'human_decision'
  | 'token'
  | 'subscription'
  | 'approval'
  | 'none';

export type ServicesClientService = {
  id: string;
  name: string;
  provider: string;
  category: ServiceCategory;
  linkedScope: string;
  billingOwner: string;
  cadence: string;
  status: ServiceStatus;
  blockers: ServiceBlocker[];
  notes: string;
};

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  infrastructure: 'Infrastructure',
  dns: 'DNS / CDN',
  runtime: 'Runtime',
  source_control: 'Source control',
  email_sending: 'Transactional email',
  workspace_email: 'Workspace email',
  monitoring: 'Monitoring',
  registrar: 'Registrar',
  analytics: 'Analytics',
  ai: 'AI',
  support_saas: 'Support SaaS',
  other: 'Other',
};

const CATEGORY_ORDER: ServiceCategory[] = [
  'infrastructure',
  'dns',
  'runtime',
  'source_control',
  'email_sending',
  'workspace_email',
  'monitoring',
  'registrar',
  'analytics',
  'ai',
  'support_saas',
  'other',
];

const STATUS_LABEL: Record<ServiceStatus, string> = {
  active: 'Active',
  planned: 'Planned',
  needs_review: 'Needs review',
  blocked: 'Blocked',
};

const STATUS_TONE: Record<ServiceStatus, 'green' | 'blue' | 'amber' | 'rose'> = {
  active: 'green',
  planned: 'blue',
  needs_review: 'amber',
  blocked: 'rose',
};

// Plain-business label for the "token" blocker.
const BLOCKER_LABEL: Record<ServiceBlocker, string> = {
  db: 'Database',
  human_decision: 'Operator decision',
  token: 'Provider API key',
  subscription: 'Subscription',
  approval: 'Approval',
  none: 'None',
};

// --- Filter types -------------------------------------------------------

type StatusFilter = 'all' | ServiceStatus;
type CategoryFilter = 'all' | ServiceCategory;
type BillingFilter = 'all' | 'known' | 'needs_review';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'blocked', label: 'Blocked' },
];

const BILLING_FILTERS: { value: BillingFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'known', label: 'Owner known' },
  { value: 'needs_review', label: 'Needs review' },
];

function isMissingOwner(billingOwner: string): boolean {
  return /needs review|unknown/i.test(billingOwner);
}

// --- Tiny inline-SVG icons ---------------------------------------------
// Fallback inline SVGs so this client does not depend on Track A's icon
// module being merged first. Sized 14x14 / 12x12 for compact admin density.

function IconBase({
  d,
  className = 'h-3.5 w-3.5 shrink-0',
}: {
  d: string;
  className?: string;
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
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

function CategoryIcon({ category, className }: { category: ServiceCategory; className?: string }) {
  // Single-glyph hint per category; intentionally minimal.
  const d: Record<ServiceCategory, string> = {
    infrastructure: 'M2 4h12v4H2zM2 8h12v4H2zM5 6h.01M5 10h.01',
    dns: 'M8 2v12M2 8h12M3.5 4.5a8 8 0 0 1 9 0M3.5 11.5a8 8 0 0 0 9 0',
    runtime: 'M3 3h10v10H3zM6 6l4 2-4 2z',
    source_control: 'M5 3v6a2 2 0 0 0 2 2h2M5 11a1.5 1.5 0 1 1 0 .01M11 5a1.5 1.5 0 1 1 0 .01M11 11a1.5 1.5 0 1 1 0 .01',
    email_sending: 'M2 4h12v8H2zM2 4l6 5 6-5',
    workspace_email: 'M2 4h12v8H2zM2 4l6 5 6-5',
    monitoring: 'M2 8h3l2-4 2 8 2-4h3',
    registrar: 'M3 13V5l5-3 5 3v8M6 13V9h4v4',
    analytics: 'M2 13V3M2 13h12M5 11V7M8 11V4M11 11V8',
    ai: 'M8 2v2M8 12v2M2 8h2M12 8h2M4 4l1.5 1.5M10.5 10.5L12 12M4 12l1.5-1.5M10.5 5.5L12 4M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    support_saas: 'M3 13a5 5 0 0 1 10 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    other: 'M5 8h6M8 5v6',
  };
  return <IconBase d={d[category]} className={className} />;
}

function IconDownload({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <IconBase d="M8 2v8M5 7l3 3 3-3M3 13h10" className={className} />;
}

function IconFilter({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <IconBase d="M2 4h12l-4.5 5v4l-3 1V9z" className={className} />;
}

// --- Export download helpers -------------------------------------------

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
    // silent — blob downloads can be blocked in private mode
  }
}

function exportServicesAsJson(rows: ServicesClientService[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      total: rows.length,
      services: rows,
    },
    null,
    2,
  );
}

function exportServicesAsMarkdown(rows: ServicesClientService[]): string {
  const lines: string[] = [];
  lines.push('# 2KO Ops — Services catalogue');
  lines.push('');
  lines.push(`_${rows.length} services in current view._`);
  lines.push('');
  if (rows.length === 0) {
    lines.push('_No services match the current filters._');
    return lines.join('\n');
  }
  for (const s of rows) {
    lines.push(`## ${s.name}`);
    lines.push('');
    lines.push(`- Provider: ${s.provider}`);
    lines.push(`- Category: ${CATEGORY_LABEL[s.category]}`);
    lines.push(`- Status: ${STATUS_LABEL[s.status]}`);
    lines.push(`- Linked scope: ${s.linkedScope}`);
    lines.push(`- Billing owner: ${s.billingOwner}`);
    lines.push(`- Cadence: ${s.cadence}`);
    const blockers = s.blockers.filter((b) => b !== 'none');
    if (blockers.length > 0) {
      lines.push(`- Blockers: ${blockers.map((b) => BLOCKER_LABEL[b]).join(', ')}`);
    }
    if (s.notes) lines.push(`- Notes: ${s.notes}`);
    lines.push('');
  }
  return lines.join('\n');
}

// --- Summary tile -------------------------------------------------------

type Tone = 'neutral' | 'green' | 'amber' | 'rose' | 'blue';

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  const ring =
    tone === 'green'
      ? 'border-emerald-400/30 bg-emerald-400/5'
      : tone === 'amber'
        ? 'border-amber-400/30 bg-amber-400/5'
        : tone === 'rose'
          ? 'border-rose-400/30 bg-rose-400/5'
          : tone === 'blue'
            ? 'border-sky-400/30 bg-sky-400/5'
            : 'border-[#27272a] bg-[#0e0e10]';
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[#f5f5f5]">{value}</p>
    </div>
  );
}

// --- Chip rows ---------------------------------------------------------

function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a] inline-flex items-center gap-1">
        <IconFilter />
        {label}
      </span>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              active
                ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
                : 'border-[#27272a] bg-[#0e0e10] text-[#a1a1aa] hover:text-[#e4e4e7] hover:border-[#3f3f46]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// --- Component ----------------------------------------------------------

export default function ServicesClient({ services }: { services: ServicesClientService[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [billingFilter, setBillingFilter] = useState<BillingFilter>('all');

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (billingFilter === 'known' && isMissingOwner(s.billingOwner)) return false;
      if (billingFilter === 'needs_review' && !isMissingOwner(s.billingOwner)) return false;
      return true;
    });
  }, [services, statusFilter, categoryFilter, billingFilter]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((s) => s.status === 'active').length;
    const needsReview = filtered.filter(
      (s) => s.status === 'needs_review' || s.status === 'blocked',
    ).length;
    const missingOwner = filtered.filter((s) => isMissingOwner(s.billingOwner)).length;
    return { total, active, needsReview, missingOwner };
  }, [filtered]);

  const categoryOptions: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...CATEGORY_ORDER.map((c) => ({ value: c as CategoryFilter, label: CATEGORY_LABEL[c] })),
  ];

  function onExportJson() {
    triggerDownload(
      '2ko-ops-services.json',
      exportServicesAsJson(filtered),
      'application/json',
    );
  }

  function onExportMarkdown() {
    triggerDownload(
      '2ko-ops-services.md',
      exportServicesAsMarkdown(filtered),
      'text/markdown',
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter chip rows */}
      <AdminCard title="Filter services">
        <div className="space-y-3">
          <ChipRow<StatusFilter>
            label="Status"
            value={statusFilter}
            options={STATUS_FILTERS}
            onChange={setStatusFilter}
          />
          <ChipRow<CategoryFilter>
            label="Category"
            value={categoryFilter}
            options={categoryOptions}
            onChange={setCategoryFilter}
          />
          <ChipRow<BillingFilter>
            label="Billing owner"
            value={billingFilter}
            options={BILLING_FILTERS}
            onChange={setBillingFilter}
          />
        </div>
      </AdminCard>

      {/* Summary tiles for current filter view */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryTile label="In view" value={summary.total} tone="neutral" />
        <SummaryTile label="Active" value={summary.active} tone="green" />
        <SummaryTile label="Needs review" value={summary.needsReview} tone="amber" />
        <SummaryTile label="Missing billing owner" value={summary.missingOwner} tone="amber" />
      </div>

      {/* Export buttons */}
      <AdminCard
        title="Export current view"
        action={
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#71717a]">
            {filtered.length} services
          </span>
        }
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#e4e4e7] hover:border-emerald-400/40 hover:text-emerald-200 transition-colors"
          >
            <IconDownload />
            Export JSON
          </button>
          <button
            type="button"
            onClick={onExportMarkdown}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0e0e10] px-3 py-1.5 text-xs text-[#e4e4e7] hover:border-emerald-400/40 hover:text-emerald-200 transition-colors"
          >
            <IconDownload />
            Export Markdown
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[#71717a] leading-relaxed">
          Exports the services currently matching the filters above. No credentials or provider
          API keys are included — labels only.
        </p>
      </AdminCard>

      {/* Filtered service cards */}
      <AdminCard title="Filtered services">
        {filtered.length === 0 ? (
          <p className="text-xs text-[#71717a]">No services match the current filters.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((s) => {
              const blockers = s.blockers.filter((b) => b !== 'none');
              const ownerMissing = isMissingOwner(s.billingOwner);
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-[#1c1c1e] bg-[#0e0e10] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#27272a] bg-[#111113] text-[#a1a1aa]">
                      <CategoryIcon category={s.category} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-[#f5f5f5]">{s.name}</p>
                        <Badge text={STATUS_LABEL[s.status]} tone={STATUS_TONE[s.status]} />
                        <Badge text={CATEGORY_LABEL[s.category]} tone="neutral" />
                        {ownerMissing && (
                          <Badge text="Owner needs review" tone="amber" />
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[140px_1fr] text-xs">
                        <span className="text-[#71717a]">Provider</span>
                        <span className="text-[#e4e4e7]">{s.provider}</span>

                        <span className="text-[#71717a]">Linked scope</span>
                        <span className="text-[#e4e4e7]">{s.linkedScope}</span>

                        <span className="text-[#71717a]">Billing owner</span>
                        <span className="text-[#e4e4e7]">{s.billingOwner}</span>

                        <span className="text-[#71717a]">Cadence</span>
                        <span className="text-[#e4e4e7]">{s.cadence}</span>

                        {blockers.length > 0 && (
                          <>
                            <span className="text-[#71717a]">Blockers</span>
                            <span className="text-[#e4e4e7]">
                              {blockers.map((b) => BLOCKER_LABEL[b]).join(', ')}
                            </span>
                          </>
                        )}

                        <span className="text-[#71717a]">Notes</span>
                        <span className="text-[#a1a1aa] leading-relaxed">{s.notes}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
