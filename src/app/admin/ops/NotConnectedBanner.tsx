import { isDbConfigured } from '@/lib/db/client';

// Server component shown at the top of any page that depends on DB connectivity.
// It surfaces the no-DB state without breaking page rendering.

export default function NotConnectedBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-xs text-amber-200">
      <p className="font-semibold mb-1">Database not connected</p>
      <p>
        Set <code className="text-amber-300">DATABASE_URL</code> to enable persistence. The dashboard renders in read-only
        skeleton mode until the DB is available — all create/update actions will return 503.
      </p>
    </div>
  );
}
