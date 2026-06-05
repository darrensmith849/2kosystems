import { isDbConfigured } from '@/lib/db/client';

// Top-of-page status pill shown while the production database is not
// connected. Slim single-line bar with an amber accent dot for distinction
// from the (emerald-dot) SnapshotBanner.

export default function NotConnectedBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
      <span>
        Setup pending · Live editing will be enabled after the database is connected. Add and edit actions are currently disabled.
      </span>
    </div>
  );
}
