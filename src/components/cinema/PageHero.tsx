import type { ReactNode } from "react";
import Link from "next/link";
import Rise from "@/components/cinema/Rise";

/**
 * The house hero.
 *
 * This exists because an audit of the eleven page heroes found three different
 * patterns and, on six pages, no treatment at all:
 *
 *   websites/*      k-web-h1 at 82px, aurora, two CTAs, a proof strip
 *   quote, excel    k-hero at 68px, k-glow, two CTAs
 *   the other six   k-state at 48px, flat black, nothing to click
 *
 * So the newest pages looked like a different company's site to the ones
 * selling the R95k–R1.2m work. The difference was never taste — it was that
 * the good hero lived as markup inside one page instead of as a component
 * anything could use. This is that component, so the standard is enforced by
 * default rather than remembered.
 *
 * `facts` is the strip that made the websites pages feel substantiated. Only
 * pass figures that are true and already published elsewhere on the site.
 */

type Cta = { href: string; label: string; ghost?: boolean };
type Fact = { value: string; label: string };

export default function PageHero({
  eyebrow,
  title,
  lead,
  ctas,
  facts,
  titleClass,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  ctas?: Cta[];
  facts?: Fact[];
  /** Optional measure, e.g. "max-w-[17ch]". Long titles need one at this size. */
  titleClass?: string;
  /** The hero visual — a reel, a diagram, a panel. */
  children?: ReactNode;
}) {
  return (
    <section className="k-hero-web">
      <div className="k-web-aurora" aria-hidden />
      <div className="k-shell k-hero-web-inner">
        <Rise>
          <p className="k-mono k-mono--ember">{eyebrow}</p>
        </Rise>
        <Rise step={1}>
          <h1 className={`k-web-h1${titleClass ? ` ${titleClass}` : ""}`}>{title}</h1>
        </Rise>
        {lead && (
          <Rise step={2}>
            <p className="k-lead k-web-lead">{lead}</p>
          </Rise>
        )}
        {ctas?.length ? (
          <Rise step={3}>
            <div className="k-web-cta">
              {ctas.map((c) => (
                <Link
                  key={c.href + c.label}
                  href={c.href}
                  className={`k-btn ${c.ghost ? "k-btn--ghost" : "k-btn--solid"}`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </Rise>
        ) : null}
        {children && <Rise step={3}>{children}</Rise>}
        {facts?.length ? (
          <Rise step={3}>
            <div className="k-web-facts">
              {facts.map((f) => (
                <div key={f.label}>
                  <strong>{f.value}</strong>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </Rise>
        ) : null}
      </div>
    </section>
  );
}
