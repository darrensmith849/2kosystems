import Link from "next/link";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
  /** Kept on the prop signature so existing pages compile; videos no longer render on internal heroes in the light theme. */
  videoSrc?: string;
  videoPoster?: string;
  videoTreatment?: "plexus" | "dashboard" | "binary" | "raw";
}

/**
 * Internal-page hero — autotax-style.
 * Pure white background, eyebrow → display headline → muted subhead →
 * black + outlined pill CTAs.  No videos; the calm white surface is the
 * design statement.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  primaryCTA,
  primaryHref,
  secondaryCTA,
  secondaryHref,
}: PageHeroProps) {
  return (
    <section
      data-page-hero="true"
      className="relative isolate overflow-hidden bg-[var(--color-bg)]"
    >
      {/* Tinted green radial wash anchoring the top of the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(120% 65% at 50% 0%, var(--tint-accent-medium), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[340px] h-[260px]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, var(--tint-accent-soft), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center sm:pt-28 lg:px-10 lg:pt-32 lg:pb-24">
        <p
          className="reveal-up text-[12px] font-medium uppercase text-[var(--color-fg-muted)]"
          style={{ letterSpacing: "var(--tracking-eyebrow)" }}
        >
          {eyebrow}
        </p>

        <h1
          className="reveal-up reveal-stagger-1 mx-auto mt-6 max-w-4xl font-semibold text-[var(--color-fg)]"
          style={{
            fontSize: "var(--text-display-lg)",
            letterSpacing: "var(--tracking-display)",
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>

        <p
          className="reveal-up reveal-stagger-2 mx-auto mt-6 max-w-2xl text-[var(--color-fg-muted)]"
          style={{
            fontSize: "var(--text-headline)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>

        {(primaryCTA || secondaryCTA) && (
          <div className="reveal-up reveal-stagger-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryCTA && primaryHref && (
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-canvas-dark)] px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-white transition-all duration-200 hover:bg-[var(--color-canvas-dark-2)] active:scale-[0.98]"
              >
                {primaryCTA}
              </Link>
            )}
            {secondaryCTA && secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-[var(--color-fg)] transition-all duration-200 hover:bg-[var(--color-bg-2)] active:scale-[0.98]"
              >
                {secondaryCTA}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
