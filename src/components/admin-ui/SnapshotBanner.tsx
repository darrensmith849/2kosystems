import { isDbConfigured } from '@/lib/db/client';

// Compact top-of-page banner shown only in snapshot mode. Read-only emerald
// accent so it doesn't look like an error — snapshot mode is a deliberate
// state, not a failure.

export default function SnapshotBanner({
  area = 'this section',
}: { area?: string }) {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] px-4 py-2.5 text-[11px] leading-relaxed text-emerald-200/90 flex items-center gap-3">
      <span className="font-mono uppercase tracking-[0.15em] text-[10px] text-emerald-300/80">
        Read-only snapshot
      </span>
      <span className="text-emerald-200/70">·</span>
      <span>
        {area} is showing the discovery snapshot. Editing activates after Hetzner Postgres connects (see <code className="text-emerald-300/90">docs/runbooks/ops-db-setup.md</code>).
      </span>
    </div>
  );
}
