import Link from "next/link";

interface CTASectionProps {
  title: string;
  description: string;
  primaryCTA: string;
  primaryHref: string;
  secondaryCTA?: string;
  secondaryHref?: string;
}

export default function CTASection({
  title,
  description,
  primaryCTA,
  primaryHref,
  secondaryCTA,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center md:p-16">
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={primaryHref}
                className="rounded-full border border-accent-border bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent2 hover:text-black active:bg-accent-pressed"
              >
                {primaryCTA}
              </Link>
              {secondaryCTA && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-text transition-colors hover:border-accent/40 hover:bg-white/5"
                >
                  {secondaryCTA}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
