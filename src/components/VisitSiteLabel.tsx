/**
 * Bottom-of-card call to action for the "2KO group" division cards.
 *
 * The cards are whole-card links, which isn't obvious on its own — this
 * gives visitors an explicit "this goes somewhere" cue. External cards
 * get the outbound arrow, the internal one a plain right arrow.
 *
 * Expects the parent link to carry the `group` class so the arrow can
 * nudge on hover.
 */
type Props = {
  label: string;
  /** Internal navigation — swaps the outbound arrow for a right arrow. */
  internal?: boolean;
};

export default function VisitSiteLabel({ label, internal }: Props) {
  return (
    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
      {label}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5"
      >
        {internal ? (
          <>
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </>
        ) : (
          <>
            <path d="M7 17L17 7" />
            <path d="M8 7h9v9" />
          </>
        )}
      </svg>
    </span>
  );
}
