import { AdminCard, Badge } from '@/components/admin-ui';
import { previewSnapshotImport } from '@/lib/ops/snapshot-import';
import { listSnapshotDecisionItems } from '@/lib/ops/ops-snapshot-data';
import {
  validateSnapshot,
  VALIDATION_CATEGORY_LABEL,
  type Severity,
  type ValidationReport,
} from '@/lib/ops/snapshot-validation';

// Server component. Renders the "Import rehearsal" section on the Review page,
// now split into four small AdminCards with clear plain-language headings:
//
//   - What I've reviewed locally  (import order + readiness overview)
//   - Needs human decision        (open snapshot decisions)
//   - Will be skipped             (placeholder email refs + placeholder contacts)
//   - Blocked until DB            (DB / provider / SSH dependencies)
//
// Pure read over snapshot data + validateSnapshot — no DB calls, no API routes.

const IMPORT_ORDER: string[] = [
  'Divisions',
  'Clients',
  'Assets',
  'Tickets',
  'Renewals',
  'Incidents',
  'Audit findings',
  'GitHub repos (needs sync after import)',
  'Vercel projects (needs sync after import)',
  'Cloudflare zones (needs sync after import)',
  'Hetzner servers (needs sync after import)',
  'Domains (needs registrar entry)',
  'Email references (skipped — placeholders)',
  'Services (snapshot read-only today)',
  'Contacts (snapshot read-only today)',
  'Review decisions → tickets (run last, after import)',
];

const SEVERITY_TONE: Record<Severity, 'rose' | 'amber' | 'blue'> = {
  error: 'rose',
  warn: 'amber',
  info: 'blue',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  error: 'Error',
  warn: 'Warning',
  info: 'Info',
};

const READINESS_TONE = {
  ready: 'green',
  needs_review: 'amber',
  blocked: 'rose',
} as const;

export default async function ImportRehearsalCard() {
  const { groups, dbConfigured } = await previewSnapshotImport();
  const decisions = listSnapshotDecisionItems();
  const report = validateSnapshot();

  // Items that need human decision — every snapshot decision until resolved.
  const humanDecisionItems = decisions;

  // Items that will be skipped on import — placeholder email refs.
  const skippedEmailRefs = report.byCategory.email_refs_placeholders;

  // Items that need provider tokens later.
  const tokenBlockedDecisions = decisions.filter((d) =>
    d.blockedBy.some(
      (b) =>
        b === 'github_token' ||
        b === 'vercel_token' ||
        b === 'cloudflare_token' ||
        b === 'hetzner_token'
    )
  );

  // Items that need SSH later.
  const sshBlockedDecisions = decisions.filter((d) => d.blockedBy.includes('ssh'));

  // Items that don't block on anything operational ("needs human decision only").
  const humanOnlyDecisions = decisions.filter(
    (d) => d.blockedBy.length === 0 || (d.blockedBy.length === 1 && d.blockedBy[0] === 'none')
  );

  // Counts for the four card summaries.
  const reviewedCount = groups.length;
  const needsHumanCount = humanDecisionItems.length;
  const willSkipCount = skippedEmailRefs.length + 1; // placeholders block

  // Credential presence — friendly labels, matches Activation's pre-flight card.
  const githubPresent = Boolean(process.env.GITHUB_TOKEN);
  const vercelPresent = Boolean(process.env.VERCEL_API_TOKEN);
  const cloudflarePresent = Boolean(
    process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID
  );
  const hetznerPresent = Boolean(process.env.HETZNER_API_TOKEN);

  const credentialBullets: Array<{ label: string; present: boolean; note: string }> = [
    {
      label: 'Production database',
      present: dbConfigured,
      note: 'Save-for-real, sync runs, and the decision-to-ticket bridge all need this.',
    },
    {
      label: 'GitHub access',
      present: githubPresent,
      note: 'GitHub sync + repo cluster decisions (archive duplicates).',
    },
    {
      label: 'Vercel access',
      present: vercelPresent,
      note: 'Vercel sync + dormant-project cleanup.',
    },
    {
      label: 'Cloudflare access',
      present: cloudflarePresent,
      note: 'Cloudflare sync + DNS cleanup decisions.',
    },
    {
      label: 'Hetzner access',
      present: hetznerPresent,
      note: 'Hetzner sync.',
    },
  ];

  // Total "blocked until DB" count — credentials missing + decisions waiting on tokens or SSH.
  const credentialsMissingCount = credentialBullets.filter((c) => !c.present).length;
  const blockedCount =
    credentialsMissingCount + tokenBlockedDecisions.length + sshBlockedDecisions.length;

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-[#a1a1aa]">
        A dry run of the import — read-only, never writes to the production database.
      </p>

      {/* Card 1 — What I've reviewed locally */}
      <AdminCard
        title={`What I've reviewed locally · ${reviewedCount}`}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">
              Import order
            </p>
            <ol className="space-y-1.5 text-xs text-zinc-800 dark:text-[#e4e4e7]">
              {IMPORT_ORDER.map((label, i) => (
                <li key={label} className="flex gap-3">
                  <span className="w-6 shrink-0 text-right font-mono text-[10px] text-zinc-500 dark:text-[#52525b]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">
              Readiness by category
            </p>
            {groups.length <= 6 ? (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b]">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 dark:border-[#1c1c1e]">
                    <tr>
                      <ThCell>Category</ThCell>
                      <ThCell>Snapshot</ThCell>
                      <ThCell>Will save</ThCell>
                      <ThCell>Will skip</ThCell>
                      <ThCell>Readiness</ThCell>
                      <ThCell>Notes</ThCell>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => (
                      <tr key={g.category} className="border-b border-zinc-200 dark:border-[#1c1c1e] last:border-0">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-[#f5f5f5]">{g.category}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-800 dark:text-[#e4e4e7]">
                          {g.snapshotCount}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-emerald-300">
                          {g.willInsert}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-600 dark:text-[#a1a1aa]">
                          {g.willSkip}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            text={g.readiness.replace('_', ' ')}
                            tone={READINESS_TONE[g.readiness]}
                          />
                        </td>
                        <td className="max-w-md px-4 py-3 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">{g.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="space-y-2">
                {groups.map((g) => (
                  <li
                    key={g.category}
                    className="rounded-xl border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-zinc-900 dark:text-[#f5f5f5]">{g.category}</span>
                      <Badge
                        text={g.readiness.replace('_', ' ')}
                        tone={READINESS_TONE[g.readiness]}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">
                      <span className="text-zinc-800 dark:text-[#e4e4e7]">{g.snapshotCount}</span> in snapshot ·{' '}
                      <span className="text-emerald-300">{g.willInsert}</span> will save ·{' '}
                      <span className="text-zinc-600 dark:text-[#a1a1aa]">{g.willSkip}</span> will skip
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">{g.notes}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[11px] text-emerald-300/70">
            Safe next action — confirm the order matches your expectation, then read the
            &ldquo;Notes&rdquo; column for any category marked needs review.
          </p>
        </div>
      </AdminCard>

      {/* Card 2 — Needs human decision */}
      <AdminCard title={`Needs human decision · ${needsHumanCount}`}>
        {needsHumanCount === 0 ? (
          <p className="text-xs text-emerald-300/80">
            No open decisions — nothing waiting for you to call.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa]">
              {needsHumanCount} total · {humanOnlyDecisions.length} can be picked right now without
              waiting on tokens or SSH.
            </p>
            {humanOnlyDecisions.length === 0 ? (
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa]">
                Every open decision is waiting on a token or SSH key — see the Blocked until DB
                card.
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-zinc-800 dark:text-[#e4e4e7]">
                {humanOnlyDecisions.slice(0, 8).map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2"
                  >
                    <p className="font-medium">{d.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">{d.recommendation}</p>
                  </li>
                ))}
                {humanOnlyDecisions.length > 8 && (
                  <li className="px-3 text-[11px] text-zinc-500 dark:text-[#71717a]">
                    + {humanOnlyDecisions.length - 8} more on the Review session below.
                  </li>
                )}
              </ul>
            )}
            <p className="text-[11px] text-emerald-300/70">
              Safe next action — work the unblocked decisions on the Review session below.
            </p>
          </div>
        )}
      </AdminCard>

      {/* Card 3 — Will be skipped */}
      <AdminCard title={`Will be skipped · ${willSkipCount}`}>
        <div className="space-y-3">
          <ul className="space-y-2 text-xs text-zinc-800 dark:text-[#e4e4e7]">
            <li className="rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2">
              <p className="font-medium">
                {skippedEmailRefs.length} placeholder email reference
                {skippedEmailRefs.length === 1 ? '' : 's'}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">
                Email references in the saved sample data are intentional placeholders. They are
                skipped until real Gmail / Outlook links land in the linking phase.
              </p>
            </li>
            <li className="rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2">
              <p className="font-medium">Placeholder contacts</p>
              <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">
                Contacts in the saved sample data are generic role placeholders. They stay
                read-only until the live Contacts table is populated.
              </p>
            </li>
          </ul>
          <p className="text-[11px] text-emerald-300/70">
            Safe next action — nothing to do today. These come back as real rows in the linking
            phase.
          </p>
        </div>
      </AdminCard>

      {/* Card 4 — Blocked until DB */}
      <AdminCard title={`Blocked until DB · ${blockedCount}`}>
        <div className="space-y-4">
          {tokenBlockedDecisions.length === 0 && sshBlockedDecisions.length === 0 ? (
            <p className="text-xs text-emerald-300/80">
              No decisions are blocked on tokens or SSH right now.
            </p>
          ) : (
            <div className="space-y-2">
              {tokenBlockedDecisions.length > 0 && (
                <BlockedRow
                  label="Waiting on a provider token"
                  count={tokenBlockedDecisions.length}
                  example={tokenBlockedDecisions[0]?.title}
                />
              )}
              {sshBlockedDecisions.length > 0 && (
                <BlockedRow
                  label="Waiting on SSH access"
                  count={sshBlockedDecisions.length}
                  example={sshBlockedDecisions[0]?.title}
                />
              )}
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">
              Credentials still missing
            </p>
            <ul className="space-y-2 text-xs text-zinc-800 dark:text-[#e4e4e7]">
              {credentialBullets.map((c) => (
                <li
                  key={c.label}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-zinc-900 dark:text-[#f5f5f5]">{c.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">{c.note}</p>
                  </div>
                  <Badge
                    text={c.present ? 'present' : 'missing'}
                    tone={c.present ? 'green' : 'amber'}
                  />
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-emerald-300/70">
            Safe next action — add the missing credentials one at a time on the Activation page.
            These unblock automatically as each token lands.
          </p>
        </div>
      </AdminCard>
    </div>
  );
}

// --------------------------------------------------------------------------
// Validation findings — separate exported component used below the rehearsal.
// --------------------------------------------------------------------------

export function ValidationFindingsCard({ report }: { report: ValidationReport }) {
  const categories = (Object.keys(report.byCategory) as (keyof typeof report.byCategory)[]).filter(
    (k) => report.byCategory[k].length > 0
  );
  return (
    <AdminCard title="Validation findings">
      <p className="mb-3 text-xs leading-relaxed text-zinc-600 dark:text-[#a1a1aa]">
        A second pass that double-checks the saved sample data for shape errors, orphan links, and
        placeholder rows. None of these block the rehearsal — they are guidance for you.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge text={`${report.bySeverity.error} errors`} tone="rose" />
        <Badge text={`${report.bySeverity.warn} warnings`} tone="amber" />
        <Badge text={`${report.bySeverity.info} info`} tone="blue" />
      </div>
      {categories.length === 0 ? (
        <p className="text-xs text-emerald-300/80">No findings.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((k) => (
            <ValidationCategoryBlock
              key={k}
              label={VALIDATION_CATEGORY_LABEL[k]}
              findings={report.byCategory[k]}
            />
          ))}
        </div>
      )}
    </AdminCard>
  );
}

// ValidationCategoryBlock is a client subcomponent that lets the user expand
// past the default 10-row preview inline, without leaving the page.
function ValidationCategoryBlock({
  label,
  findings,
}: {
  label: string;
  findings: ReadonlyArray<{
    id: string;
    severity: Severity;
    title: string;
    detail?: string;
  }>;
}) {
  return (
    <ValidationCategoryBlockClient label={label} findings={findings as Finding[]} />
  );
}

type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail?: string;
};

function ValidationCategoryBlockClient({
  label,
  findings,
}: {
  label: string;
  findings: Finding[];
}) {
  // This component is rendered on the server too — the "Show all" toggle is a
  // pure anchor + details/summary so no client JS is required.
  const total = findings.length;
  const preview = findings.slice(0, 10);
  const rest = findings.slice(10);

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-zinc-900 dark:text-[#f5f5f5]">
        {label}
        <span className="ml-2 font-mono text-[10px] text-zinc-500 dark:text-[#71717a]">({total})</span>
      </p>
      <ul className="space-y-1.5">
        {preview.map((f) => (
          <li
            key={f.id}
            className="flex gap-3 rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2"
          >
            <Badge text={SEVERITY_LABEL[f.severity]} tone={SEVERITY_TONE[f.severity]} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{f.title}</p>
              {f.detail && <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">{f.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer list-none rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-300/80 hover:text-emerald-200">
            Show all {total}
          </summary>
          <ul className="mt-2 space-y-1.5">
            {rest.map((f) => (
              <li
                key={f.id}
                className="flex gap-3 rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2"
              >
                <Badge text={SEVERITY_LABEL[f.severity]} tone={SEVERITY_TONE[f.severity]} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{f.title}</p>
                  {f.detail && <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">{f.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Small render helpers
// --------------------------------------------------------------------------

function ThCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-[#71717a]">
      {children}
    </th>
  );
}

function BlockedRow({
  label,
  count,
  example,
}: {
  label: string;
  count: number;
  example?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] px-3 py-2">
      <Badge text={`${count}`} tone="amber" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{label}</p>
        {example && <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-[#a1a1aa]">e.g. {example}</p>}
      </div>
    </div>
  );
}
