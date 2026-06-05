import { isDbConfigured } from '@/lib/db/client';

// Compact bullet-preview card showing which columns / features will light up
// once the production database is connected. The page-level
// NotConnectedBanner already owns the page-top status pill, so this card
// stops at the bullet list and renders nothing when no bullets are supplied
// — that avoids the title/subtitle duplication the old version had with the
// banner.
//
// Backwards-compatible: the `area` and `description` props are still
// accepted. If `whatYouWillSee` is empty AND `description` is set, we keep
// the old prose subtitle so any pages that haven't been updated yet still
// render something useful.

export default function WaitingForDb({
  area,
  description,
  whatYouWillSee,
}: {
  area: string;
  description?: string;
  whatYouWillSee?: string[];
}) {
  if (isDbConfigured()) return null;

  const hasBullets = Boolean(whatYouWillSee && whatYouWillSee.length > 0);

  // Nothing to say and no explicit description — render nothing so the
  // page-top NotConnectedBanner is the only chrome shown.
  if (!hasBullets && !description) return null;

  if (!hasBullets && description) {
    // Legacy fallback for callers that pass a description but no bullets.
    return (
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4 transition-colors">
        <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] px-4 py-3 transition-colors">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        What will be available
      </p>
      <ul className="space-y-1">
        {whatYouWillSee!.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            <span aria-hidden="true" className="text-zinc-500 mt-[1px]">
              ·
            </span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
      {/* area is intentionally accepted but no longer rendered as a title —
          the page-top NotConnectedBanner owns the page identity. */}
      <span className="sr-only">{area}</span>
    </div>
  );
}
