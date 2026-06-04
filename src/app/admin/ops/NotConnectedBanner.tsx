import { isDbConfigured } from '@/lib/db/client';

// Top-of-page status pill shown while the production database is not
// connected. Kept short — the per-page WaitingForDb card now renders the
// contextual bullet preview of upcoming columns underneath.

export default function NotConnectedBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.05] px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-amber-300 font-medium">Read-only preview</span>
      <span className="text-amber-200/40">·</span>
      <span className="text-amber-200/80">
        Live editing turns on once the production database is connected.
      </span>
    </div>
  );
}
