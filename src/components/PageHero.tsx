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
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
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

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {description}
          </p>

          {(primaryCTA || secondaryCTA) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {primaryCTA && primaryHref && (
                <Link
                  href={primaryHref}
                  className="rounded-full border border-accent-border bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent2 hover:text-black active:bg-accent-pressed"
                >
                  {primaryCTA}
                </Link>
              )}
              {secondaryCTA && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text transition-colors hover:border-accent/40 hover:bg-white/5"
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
