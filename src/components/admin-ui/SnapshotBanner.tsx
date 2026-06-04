import { isDbConfigured } from '@/lib/db/client';

// Compact preview-mode notice shown only when the database is not connected.
// Restrained emerald accent so it reads as deliberate state, not failure.

export default function SnapshotBanner({
  area = 'This section',
}: { area?: string }) {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] px-4 py-2.5 text-xs text-emerald-200/90 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-emerald-300/90 font-medium">Preview mode</span>
      <span className="text-emerald-200/40">·</span>
      <span className="text-emerald-200/80">
        {area} is showing saved discovery data. Editing will be available after the database is connected.
      </span>
    </div>
  );
}
