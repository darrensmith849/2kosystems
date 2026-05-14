import Link from "next/link";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
  /** Kept on the prop signature so existing pages compile. */
  videoSrc?: string;
  videoPoster?: string;
  videoTreatment?: "plexus" | "dashboard" | "binary" | "raw";
}

/**
 * Internal-page hero — Six Sigma-style green canvas.
 * Same saturated deep-green background + stippled dot pattern as the
 * home hero so every page opens on the same brand colour. Eyebrow uses
 * the on-dark rule, headline is centred and white, primary CTA stays
 * green (consistent with the header), secondary is an outlined-on-green
 * pill.
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
      className="relative isolate overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, #0c7a39 0%, var(--color-hero-block) 45%, var(--color-hero-block-2) 100%)",
      }}
    >
      {/* Six Sigma-style stippled dot pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Soft top-centre highlight to give the canvas depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:pt-24 lg:px-10 lg:pt-28 lg:pb-20">
        <span className="reveal-up eyebrow-rule on-dark mx-auto">
          {eyebrow}
        </span>

        <h1
          className="reveal-up reveal-stagger-1 mx-auto mt-6 max-w-4xl font-semibold text-white"
          style={{
            fontSize: "clamp(36px, 4.4vw, 60px)",
            letterSpacing: "var(--tracking-display)",
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>

        <p
          className="reveal-up reveal-stagger-2 mx-auto mt-6 max-w-2xl text-white/85"
          style={{
            fontSize: "clamp(15px, 1.15vw, 17px)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>

        {(primaryCTA || secondaryCTA) && (
          <div className="reveal-up reveal-stagger-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primaryCTA && primaryHref && (
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold tracking-[-0.005em] text-white shadow-[0_8px_24px_-12px_rgba(10,53,23,0.6)] transition-all duration-200 hover:bg-white hover:text-[var(--accent-deep)] active:scale-[0.98]"
              >
                {primaryCTA}
              </Link>
            )}
            {secondaryCTA && secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-white backdrop-blur transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
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
