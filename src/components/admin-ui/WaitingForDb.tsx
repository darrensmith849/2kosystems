import { isDbConfigured } from '@/lib/db/client';

// Server component. Per-page contextual card that explains exactly what the
// area will surface once DATABASE_URL is set. Renders nothing when the DB is
// already configured — the page's own data + EmptyState take over.
//
// Visual contract: dark card, amber left-accent. Restrained — this is a hint,
// not a hero. NotConnectedBanner (the global state line) still sits above it.

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

  const subtitle = description ?? `${area} will activate once DATABASE_URL is set.`;

  return (
    <div className="mb-6 rounded-2xl border border-[#27272a] border-l-4 border-l-amber-400/60 bg-[#111113] p-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300/80 mb-2">
        Waiting for Hetzner Postgres connection
      </p>
      <p className="text-sm text-[#e4e4e7] leading-relaxed">
        {subtitle}
      </p>

      {whatYouWillSee && whatYouWillSee.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-2">
            What activates after connection
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

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#a1a1aa]">
        <span className="text-[#71717a]">Required env var:</span>
        <code className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-[#27272a] bg-[#0a0a0b] text-amber-300">
          DATABASE_URL
        </code>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#71717a]">
        <span>Setup runbook:</span>
        <code className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-[#27272a] bg-[#0a0a0b] text-[#a1a1aa]">
          docs/runbooks/ops-db-setup.md
        </code>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#71717a]">
        <span>Local dev:</span>
        <code className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-[#27272a] bg-[#0a0a0b] text-[#a1a1aa]">
          docs/runbooks/ops-local-dev.md
        </code>
      </div>
    </div>
  );
}
