import { isDbConfigured } from '@/lib/db/client';

// Per-page contextual card explaining what this area will surface once the
// database is connected. Renders nothing when the DB is already configured.
//
// Restrained — a hint, not a hero. The technical details (env var names,
// runbook paths) live on Settings / Health / Activation; this card stays
// business-friendly.

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

  const subtitle = description ?? `Live ${area.toLowerCase()} will be available once the database is connected.`;

  return (
    <div className="mb-6 rounded-2xl border border-[#27272a] border-l-4 border-l-amber-400/60 bg-[#111113] p-5">
      <p className="text-xs text-amber-300/90 mb-2 font-medium">
        Waiting for database connection
      </p>
      <p className="text-sm text-[#e4e4e7] leading-relaxed">
        {subtitle}
      </p>

      {whatYouWillSee && whatYouWillSee.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[#71717a] mb-2">
            What will be available:
          </p>
          <ul className="space-y-1.5">
            {whatYouWillSee.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-[#a1a1aa] leading-relaxed">
                <span aria-hidden="true" className="text-[#52525b] mt-[1px]">·</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
