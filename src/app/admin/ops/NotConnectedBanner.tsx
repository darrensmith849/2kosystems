import { isDbConfigured } from '@/lib/db/client';

// Top-of-page notice shown while the database is not connected. Kept short —
// the per-page WaitingForDb card provides the contextual detail.

export default function NotConnectedBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/[0.05] px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-amber-300 font-medium">Setup pending</span>
      <span className="text-amber-200/40">·</span>
      <span className="text-amber-200/80">
        Live editing will be enabled after the Hetzner database is connected. Add and edit actions are currently disabled.
      </span>
    </div>
  );
}
