import { AdminCard, Badge } from '@/components/admin-ui';
import { previewSnapshotImport } from '@/lib/ops/snapshot-import';
import { listSnapshotDecisionItems } from '@/lib/ops/ops-snapshot-data';
import {
  validateSnapshot,
  VALIDATION_CATEGORY_LABEL,
  type Severity,
  type ValidationReport,
} from '@/lib/ops/snapshot-validation';

// Server component. Renders the "Import rehearsal" section on the Review page.
//
// This is a pure read over snapshot data + validateSnapshot — no DB calls,
// no API routes, no AI. It tells the operator what would happen if they
// hit "Save for real" right now, grouped into seven plain-language subsections.

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

  // Items that need provider tokens later — pulled from the SnapshotDecision
  // blockedBy field plus the readiness rows that came back blocked.
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

  // Missing relationships — orphan assets, orphan domains, orphan incidents.
  const orphanAssets = report.byCategory.assets_without_client;
  const orphanDomains = report.byCategory.domains_without_linked_asset;
  const orphanIncidents = report.byCategory.incidents_without_asset;
  const duplicateClients = report.byCategory.duplicate_client_names;

  return (
    <AdminCard title="Import rehearsal — what would happen now">
      <p className="mb-4 text-xs text-[#a1a1aa] leading-relaxed">
        A safe walk through what would land if you pressed &ldquo;Save for real&rdquo; right now.
        Nothing is changed. Every count comes from the snapshot data and a pure-function check —
        no database is read.
      </p>

      {/* 1. Import order */}
      <Section title="1. Import order">
        <ol className="space-y-1.5 text-xs text-[#e4e4e7]">
          {IMPORT_ORDER.map((label, i) => (
            <li key={label} className="flex gap-3">
              <span className="w-6 shrink-0 text-right font-mono text-[10px] text-[#52525b]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — confirm the order matches your expectation before running rehearsal.
        </p>
      </Section>

      {/* 2. Readiness by category */}
      <Section title="2. Readiness by category">
        <div className="overflow-x-auto rounded-xl border border-[#1c1c1e] bg-[#0a0a0b]">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-[#1c1c1e]">
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
                <tr key={g.category} className="border-b border-[#1c1c1e] last:border-0">
                  <td className="px-4 py-3 text-[#f5f5f5] font-medium">{g.category}</td>
                  <td className="px-4 py-3 text-[#e4e4e7] font-mono text-[11px]">
                    {g.snapshotCount}
                  </td>
                  <td className="px-4 py-3 text-emerald-300 font-mono text-[11px]">
                    {g.willInsert}
                  </td>
                  <td className="px-4 py-3 text-[#a1a1aa] font-mono text-[11px]">{g.willSkip}</td>
                  <td className="px-4 py-3">
                    <Badge
                      text={g.readiness.replace('_', ' ')}
                      tone={READINESS_TONE[g.readiness]}
                    />
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#a1a1aa] max-w-md">{g.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — read the &ldquo;Notes&rdquo; column for any category marked needs review.
        </p>
      </Section>

      {/* 3. Duplicate risks */}
      <Section title="3. Duplicate risks">
        {duplicateClients.length === 0 ? (
          <p className="text-xs text-emerald-300/80">No duplicate client names detected.</p>
        ) : (
          <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
            {duplicateClients.map((f) => (
              <li key={f.id} className="rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2">
                <p className="font-medium">{f.title}</p>
                {f.detail && <p className="mt-0.5 text-[11px] text-[#a1a1aa]">{f.detail}</p>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — pick the canonical row for each duplicate before saving for real.
        </p>
      </Section>

      {/* 4. Missing relationships */}
      <Section title="4. Missing relationships">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MissingTile
            label="Assets without a client"
            count={orphanAssets.length}
            example={orphanAssets[0]?.title}
          />
          <MissingTile
            label="Domains not linked to any asset"
            count={orphanDomains.length}
            example={orphanDomains[0]?.title}
          />
          <MissingTile
            label="Incidents without an affected asset"
            count={orphanIncidents.length}
            example={orphanIncidents[0]?.title}
          />
        </div>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — fix the highest-count box first before the live import.
        </p>
      </Section>

      {/* 5. Blocked items */}
      <Section title="5. Blocked items (waiting on something)">
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
          {tokenBlockedDecisions.length === 0 && sshBlockedDecisions.length === 0 && (
            <p className="text-xs text-emerald-300/80">
              No decisions are blocked on tokens or SSH right now.
            </p>
          )}
        </div>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — these unblock as the matching token / SSH key lands. Do not start them
          early.
        </p>
      </Section>

      {/* 6. Items needing human decision */}
      <Section title="6. Items needing human decision">
        {humanDecisionItems.length === 0 ? (
          <p className="text-xs text-emerald-300/80">No open decisions.</p>
        ) : (
          <>
            <p className="mb-2 text-xs text-[#a1a1aa]">
              {humanDecisionItems.length} total · {humanOnlyDecisions.length} can be picked right
              now without waiting for tokens / SSH.
            </p>
            <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
              {humanOnlyDecisions.slice(0, 6).map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2"
                >
                  <p className="font-medium">{d.title}</p>
                  <p className="mt-0.5 text-[11px] text-[#a1a1aa]">{d.recommendation}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — work the unblocked decisions on the Review session below.
        </p>
      </Section>

      {/* 7. What will be skipped */}
      <Section title="7. What will be skipped on import">
        <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
          <li className="rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2">
            <p className="font-medium">{skippedEmailRefs.length} placeholder email references</p>
            <p className="mt-0.5 text-[11px] text-[#a1a1aa]">
              Email references in snapshot are intentional placeholders. They are skipped until
              real Gmail / Outlook links land in the linking phase.
            </p>
          </li>
          <li className="rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2">
            <p className="font-medium">Placeholder contacts</p>
            <p className="mt-0.5 text-[11px] text-[#a1a1aa]">
              Contacts in snapshot are generic role placeholders. They stay read-only until the
              live Contacts table is populated.
            </p>
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — nothing to do today. These come back as real rows in the linking
          phase.
        </p>
      </Section>

      {/* 8. What needs DB / tokens later */}
      <Section title="8. What will need the database / a provider token later">
        <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
          <li className="flex gap-2">
            <Badge text={dbConfigured ? 'DB connected' : 'DB pending'} tone={dbConfigured ? 'green' : 'amber'} />
            <span>Save-for-real, sync runs, and decision-to-ticket bridge.</span>
          </li>
          <li className="flex gap-2">
            <Badge
              text={process.env.GITHUB_TOKEN ? 'GitHub OK' : 'GitHub pending'}
              tone={process.env.GITHUB_TOKEN ? 'green' : 'amber'}
            />
            <span>GitHub sync + repo cluster decisions (archive duplicates).</span>
          </li>
          <li className="flex gap-2">
            <Badge
              text={process.env.VERCEL_API_TOKEN ? 'Vercel OK' : 'Vercel pending'}
              tone={process.env.VERCEL_API_TOKEN ? 'green' : 'amber'}
            />
            <span>Vercel sync + dormant-project cleanup.</span>
          </li>
          <li className="flex gap-2">
            <Badge
              text={
                process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID
                  ? 'Cloudflare OK'
                  : 'Cloudflare pending'
              }
              tone={
                process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID
                  ? 'green'
                  : 'amber'
              }
            />
            <span>Cloudflare sync + DNS cleanup decisions.</span>
          </li>
          <li className="flex gap-2">
            <Badge
              text={process.env.HETZNER_API_TOKEN ? 'Hetzner OK' : 'Hetzner pending'}
              tone={process.env.HETZNER_API_TOKEN ? 'green' : 'amber'}
            />
            <span>Hetzner sync.</span>
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          Safe next action — add the missing tokens one at a time on the Activation page.
        </p>
      </Section>
    </AdminCard>
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
      <p className="mb-3 text-xs text-[#a1a1aa] leading-relaxed">
        A second pass that double-checks the snapshot for shape errors, orphan links, and
        placeholder rows. None of these block the rehearsal — they are guidance for the operator.
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
            <div key={k}>
              <p className="mb-2 text-xs font-medium text-[#f5f5f5]">
                {VALIDATION_CATEGORY_LABEL[k]}
                <span className="ml-2 font-mono text-[10px] text-[#71717a]">
                  ({report.byCategory[k].length})
                </span>
              </p>
              <ul className="space-y-1.5">
                {report.byCategory[k].slice(0, 10).map((f) => (
                  <li
                    key={f.id}
                    className="flex gap-3 rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2"
                  >
                    <Badge text={SEVERITY_LABEL[f.severity]} tone={SEVERITY_TONE[f.severity]} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#e4e4e7]">{f.title}</p>
                      {f.detail && (
                        <p className="mt-0.5 text-[11px] text-[#a1a1aa]">{f.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
                {report.byCategory[k].length > 10 && (
                  <li className="px-3 text-[11px] text-[#71717a]">
                    + {report.byCategory[k].length - 10} more
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  );
}

// --------------------------------------------------------------------------
// Small render helpers
// --------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
        {title}
      </p>
      {children}
    </div>
  );
}

function ThCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[#71717a]">
      {children}
    </th>
  );
}

function MissingTile({
  label,
  count,
  example,
}: {
  label: string;
  count: number;
  example?: string;
}) {
  const tone = count === 0 ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-amber-400/30 bg-amber-400/5';
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717a]">
        {label}
      </p>
      <p className="text-base font-semibold text-[#f5f5f5]">{count}</p>
      {example && count > 0 && (
        <p className="mt-1 text-[11px] text-[#a1a1aa]">e.g. {example}</p>
      )}
    </div>
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
    <div className="flex items-start gap-3 rounded-lg border border-[#1c1c1e] bg-[#0a0a0b] px-3 py-2">
      <Badge text={`${count}`} tone="amber" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#e4e4e7]">{label}</p>
        {example && <p className="mt-0.5 text-[11px] text-[#a1a1aa]">e.g. {example}</p>}
      </div>
    </div>
  );
}
