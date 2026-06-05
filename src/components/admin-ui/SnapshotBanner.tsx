import { isDbConfigured } from '@/lib/db/client';

// Compact preview-mode notice shown only when the database is not connected.
// Slim single-line bar with a small emerald accent dot — the page already
// owns the heavy state, so this is a quiet contextual reminder.

export default function SnapshotBanner({
  area = 'This section',
}: { area?: string }) {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-zinc-300">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>
        Preview mode · {area} is showing saved sample data. Editing turns on once the production database is connected.
      </span>
    </div>
  );
}
