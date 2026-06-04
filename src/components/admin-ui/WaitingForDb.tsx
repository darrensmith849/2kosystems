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
      <div className="mb-4 rounded-2xl border border-[#27272a] border-l-4 border-l-amber-400/60 bg-[#111113] p-4">
        <p className="text-sm text-[#e4e4e7] leading-relaxed">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-[#27272a] bg-[#111113] px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
        What will be available
      </p>
      <ul className="space-y-1">
        {whatYouWillSee!.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-xs text-[#a1a1aa] leading-relaxed"
          >
            <span aria-hidden="true" className="text-[#52525b] mt-[1px]">
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
