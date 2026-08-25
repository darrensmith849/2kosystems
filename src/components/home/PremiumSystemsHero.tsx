import Image from "next/image";
import Link from "next/link";
import OpsPanel from "@/components/home/OpsPanel";

/**
 * Full-bleed photographic hero.
 *
 * One image, given the whole viewport, with the headline set inside it and a
 * single floating instrument panel as the counterweight. The previous version
 * was a two-column green canvas carrying a phone mockup and two callout cards;
 * three competing focal points meant none of them landed. The phone composition
 * is recoverable from git history if it is ever wanted back.
 *
 * The photograph is an aerial of an open-pit operation — deliberately abstract
 * and unattributable, so it sets the register without implying it is a client
 * site.
 */
export default function PremiumSystemsHero() {
  return (
    <section className="relative isolate flex min-h-[88vh] flex-col overflow-hidden text-white">
      {/* ---------- Photograph ---------- */}
      <Image
        src="/imagery/home/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: "58% 45%" }}
      />

      {/* Grade: a light push toward the brand green so the photograph belongs to
          the palette. Kept low — the ochres and the quarry texture have to
          survive, or there is no photograph left to look at. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "var(--accent-deep)",
          mixBlendMode: "color",
          opacity: 0.32,
        }}
      />
      {/* Legibility. On narrow screens the copy spans the full width, so the
          scrim runs bottom-to-top and leaves the top of the frame as image. From
          lg up it weights to the left instead, keeping the right two-thirds of
          the photograph readable beside the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(6, 20, 11, 0.94) 0%, rgba(6, 20, 11, 0.86) 42%, rgba(6, 20, 11, 0.45) 72%, rgba(6, 20, 11, 0.15) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            "linear-gradient(100deg, rgba(6, 20, 11, 0.93) 0%, rgba(6, 20, 11, 0.78) 32%, rgba(6, 20, 11, 0.30) 62%, rgba(6, 20, 11, 0.12) 100%)",
        }}
      />
      {/* Soft vignette top and bottom to seat the chrome and the baseline strip. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6, 20, 11, 0.55) 0%, transparent 22%, transparent 68%, rgba(6, 20, 11, 0.72) 100%)",
        }}
      />

      {/* ---------- Content ---------- */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pt-32 pb-20 lg:px-10 lg:pt-40 lg:pb-10">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <span
              className="reveal-up font-mono text-[11px] uppercase text-white/70"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Custom operational systems · South Africa
            </span>

            <h1
              className="reveal-up reveal-stagger-1 mt-6 font-semibold text-white"
              style={{
                fontSize: "clamp(44px, 6.4vw, 86px)",
                letterSpacing: "var(--tracking-display)",
                lineHeight: 0.98,
              }}
            >
              Nothing gets forgotten.
              <br />
              Nobody has to remember.
            </h1>

            <p
              className="reveal-up reveal-stagger-2 mt-7 max-w-xl text-white/80"
              style={{
                fontSize: "clamp(15px, 1.15vw, 17px)",
                letterSpacing: "var(--tracking-tight)",
                lineHeight: 1.55,
              }}
            >
              We build the operational systems, approval flows, portals and
              dashboards that established South African businesses run on — so
              the work moves without anyone chasing it.
            </p>

            <div className="reveal-up reveal-stagger-3 mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold tracking-[-0.005em] text-white shadow-[0_8px_24px_-12px_rgba(6,20,11,0.8)] transition-all duration-200 hover:bg-white hover:text-[var(--accent-deep)] active:scale-[0.98]"
              >
                Book a Systems Audit
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3 text-[14px] font-medium tracking-[-0.005em] text-white backdrop-blur transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
              >
                See what it costs
              </Link>
            </div>
          </div>

          {/* ---------- Instrument panel ---------- */}
          <div className="reveal-up reveal-stagger-4 hidden justify-self-end lg:block">
            <OpsPanel />
          </div>
        </div>

        {/* ---------- Baseline strip ---------- */}
        <div className="mt-12 flex items-center justify-between gap-6 border-t border-white/15 pt-5 lg:mt-14">
          <span
            className="font-mono text-[10px] uppercase text-white/55"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            Scroll to see what we build
          </span>
          {/* Hidden on small screens, where the floating chat button sits in
              this corner and the two would overlap. */}
          <span
            className="hidden font-mono text-[10px] uppercase text-white/45 sm:inline"
            style={{ letterSpacing: "var(--tracking-eyebrow)" }}
          >
            No lock-in · You own the code
          </span>
        </div>
      </div>
    </section>
  );
}
