import Link from "next/link";
import VideoBackground from "@/components/VideoBackground";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
  /** Optional video src in /public to render behind the hero (color-matched). */
  videoSrc?: string;
  /** Optional poster image to pair with the video. */
  videoPoster?: string;
  /**
   * Color treatment for the optional video background.  Matches the recipes in
   * VideoBackground.tsx — keeps each page on-brand without manual tweaking.
   */
  videoTreatment?: "plexus" | "dashboard" | "binary" | "raw";
}

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryCTA,
  primaryHref,
  secondaryCTA,
  secondaryHref,
  videoSrc,
  videoPoster,
  videoTreatment = "plexus",
}: PageHeroProps) {
  return (
    <section
      data-page-hero="true"
      className="page-hero border-b border-border/60 bg-background"
    >
      {/* Optional color-matched video background, rendered below the gradient wash. */}
      {videoSrc ? (
        <VideoBackground
          src={videoSrc}
          poster={videoPoster}
          treatment={videoTreatment}
          overlay={0.55}
        />
      ) : null}

      {/* Background gradient — sits above the video and softens it toward the brand */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(15,123,58,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Inner content wrapper — centred by the .page-hero flex rule.       */}
      {/* Symmetric vertical padding (pt = pb) so CTA presence cannot shift   */}
      {/* the content baseline; pt-16 on top accounts for the fixed header.   */}
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-8 md:pt-20 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-accent-border bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-accent">
            {eyebrow}
          </span>
          <h1
            className="font-semibold leading-[1.05] text-text"
            style={{
              fontSize: "var(--text-display-lg)",
              letterSpacing: "var(--tracking-display)",
              textShadow: "0 2px 18px rgba(0,0,0,0.55)",
            }}
          >
            {title}
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl leading-relaxed text-text/90"
            style={{
              fontSize: "var(--text-headline)",
              letterSpacing: "var(--tracking-tight)",
              textShadow: "0 1px 10px rgba(0,0,0,0.6)",
            }}
          >
            {description}
          </p>

          {(primaryCTA || secondaryCTA) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {primaryCTA && primaryHref && (
                <Link
                  href={primaryHref}
                  className="rounded-full border border-accent-border bg-accent px-7 py-3.5 text-sm font-semibold tracking-[-0.005em] text-white shadow-[var(--shadow-card)] transition-all duration-200 hover:bg-accent2 hover:text-black active:bg-accent-pressed"
                >
                  {primaryCTA}
                </Link>
              )}
              {secondaryCTA && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-hover)] px-7 py-3.5 text-sm font-semibold tracking-[-0.005em] text-text backdrop-blur transition-colors hover:border-accent/40 hover:bg-white/10"
                >
                  {secondaryCTA}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
