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
  // Existing pages still pass primaryHref="/get-started"; route those CTAs to
  // /contact so every "Book a Systems Audit" button on the site lands the
  // visitor on the contact form.
  const resolvedPrimaryHref =
    primaryHref === "/get-started" ? "/contact" : primaryHref;

  return (
    <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <div
          className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center md:p-16"
          style={{ boxShadow: "var(--shadow-popover)" }}
        >
          {/* Quiet accent wash, autotax-style focal point */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 65%)",
            }}
          />

          <div className="relative z-10">
            <h2
              className="font-semibold text-[var(--color-fg)]"
              style={{
                fontSize: "var(--text-display-md)",
                letterSpacing: "var(--tracking-display)",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl text-[var(--color-fg-muted)]"
              style={{
                fontSize: "var(--text-headline)",
                letterSpacing: "var(--tracking-tight)",
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={resolvedPrimaryHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold tracking-[-0.005em] text-white shadow-[0_8px_24px_-12px_rgba(22,163,74,0.55)] transition-all duration-200 hover:bg-[var(--accent2)] active:scale-[0.98]"
              >
                {primaryCTA}
              </Link>
              {secondaryCTA && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-[var(--color-fg)] transition-all duration-200 hover:bg-[var(--color-bg-2)] active:scale-[0.98]"
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
