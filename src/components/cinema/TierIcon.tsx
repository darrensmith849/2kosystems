/**
 * Tier icons.
 *
 * One line drawing per tier, inline so there is no request and no library, and
 * stroked in currentColor so each picks up whatever the card is using. Kept to
 * a single idea each — one page, several pages, a bag, a bracket — because
 * four detailed marks in a row of four cards is noise, not signal.
 */

const PATHS: Record<string, React.ReactNode> = {
  // One page, scrolling.
  launch: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <path d="M9.5 7h5M9.5 10.5h5M9.5 14h3" />
    </>
  ),
  // Several pages behind a browser bar.
  business: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="M2.5 9h19M7 4.5v15" />
    </>
  ),
  // A bag.
  commerce: (
    <>
      <path d="M4.5 7.5h15l-1.2 13a1.5 1.5 0 0 1-1.5 1.35H7.2a1.5 1.5 0 0 1-1.5-1.35Z" />
      <path d="M8.75 7.5V5.75a3.25 3.25 0 0 1 6.5 0V7.5" />
    </>
  ),
  // Angle brackets: it stops being a page and starts being software.
  bespoke: (
    <>
      <path d="M8.5 8 4 12l4.5 4M15.5 8 20 12l-4.5 4" />
      <path d="M13.4 5.5 10.6 18.5" />
    </>
  ),
};

export default function TierIcon({ slug, className = "" }: { slug: string; className?: string }) {
  const d = PATHS[slug];
  if (!d) return null;
  return (
    <svg
      className={`k-tier-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d}
    </svg>
  );
}
