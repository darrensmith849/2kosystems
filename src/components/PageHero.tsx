import Link from "next/link";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCTA?: string;
  primaryHref?: string;
  secondaryCTA?: string;
  secondaryHref?: string;
}

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
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(52,146,90,0.08) 0%, transparent 70%)",
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
                  className="rounded-full border border-accent-border bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent2 active:bg-accent-pressed"
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
