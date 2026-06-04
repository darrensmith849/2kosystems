import Link from 'next/link';
import { AdminCard, SectionHeader, Badge } from '@/components/admin-ui';
import SnapshotBanner from '@/components/admin-ui/SnapshotBanner';
import { isSnapshotMode } from '@/lib/ops/snapshot-mode';
import { RUNBOOK_CATALOG } from '@/lib/ops/runbook-catalog';

export const dynamic = 'force-dynamic';

export default function RunbooksIndexPage() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Runbooks"
        subtitle="Operational guides for the team."
      />
      {isSnapshotMode() && <SnapshotBanner area="Runbooks" />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {RUNBOOK_CATALOG.map((rb) => (
          <AdminCard key={rb.slug} title={rb.slug}>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#f5f5f5]">{rb.title}</p>
                <p
                  className="mt-1 text-xs text-[#a1a1aa] leading-relaxed overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {rb.description}
                </p>
              </div>

              {rb.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rb.topics.map((t) => (
                    <Badge key={t} text={t} />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <code className="text-[10px] font-mono text-[#71717a] break-all">
                  {rb.path}
                </code>
                <Link
                  href={`/admin/ops/runbooks/${rb.slug}`}
                  className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors whitespace-nowrap"
                >
                  View →
                </Link>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
