import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Rise from "@/components/cinema/Rise";
import BuildReel from "@/components/cinema/BuildReel";
import ClientStrip from "@/components/cinema/ClientStrip";
import { WEB_TIERS, tierBySlug } from "@/lib/websites";
import { RATES, TERMS } from "@/lib/pricing";
import TierIcon from "@/components/cinema/TierIcon";
import Crossover from "@/components/cinema/Crossover";

/**
 * One page per website tier.
 *
 * Each is a landing page for a different search intent — "one page website",
 * "business website design", "ecommerce website south africa", "custom web
 * development" — rather than a brochure hierarchy. Realistically only Business
 * and Commerce will earn much traffic; the other two exist so the set is
 * complete and the ads have somewhere honest to point.
 *
 * The reel on each page runs that tier's own build, so a visitor asking about
 * a shop watches a shop being built rather than a general showreel.
 */

export function generateStaticParams() {
  return WEB_TIERS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tier = tierBySlug(slug);
  if (!tier) return {};
  return {
    title: `${tier.name} Websites — ${tier.price}`,
    description: `${tier.line} ${tier.price} ex VAT, live in ${tier.time}. Built by the 2KO Group. Prices published, no discovery call needed.`,
    alternates: { canonical: `/websites/${tier.slug}` },
  };
}

export default async function TierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tier = tierBySlug(slug);
  if (!tier) notFound();

  const others = WEB_TIERS.filter((t) => t.slug !== tier.slug);

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="k-hero-web">
        <div className="k-web-aurora" aria-hidden />
        <div className="k-shell k-hero-web-inner">
          <Rise>
            <p className="k-mono k-mono--ember">
              <Link href="/websites" className="k-link">
                WEBSITES
              </Link>{" "}
              · {tier.name.toUpperCase()}
            </p>
          </Rise>
          <Rise step={1}>
            <TierIcon slug={tier.slug} className="k-tier-icon--hero" />
            <h1 className="k-web-h1">{tier.line}</h1>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-web-lead">{tier.intro}</p>
          </Rise>
          <Rise step={3}>
            <div className="k-web-cta">
              <Link href="/contact" className="k-btn k-btn--solid">
                Start a {tier.name} project
              </Link>
              <Link href="#examples" className="k-btn k-btn--ghost">
                See the work
              </Link>
            </div>
          </Rise>
          <Rise step={3}>
            <BuildReel only={[tier.reel]} />
          </Rise>
          <Rise step={3}>
            <div className="k-web-facts">
              <div>
                <strong>{tier.price}</strong>
                <span>ex VAT</span>
              </div>
              <div>
                <strong>{tier.time}</strong>
                <span>to live</span>
              </div>
              <div>
                <strong>{tier.examples.length}</strong>
                <span>examples below</span>
              </div>
              <div>
                <strong>Fixed</strong>
                <span>against week-one scope</span>
              </div>
            </div>
          </Rise>
        </div>
      </section>

      <ClientStrip />

      {/* ------------------------------------------------------- examples */}
      <section id="examples" className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — THE WORK</p>
            <h2 className="k-title k-web-h2">Built, live, and clickable.</h2>
            <p className="k-lead k-measure">
              Every one of these is running right now. Open them, poke at them on your phone, and
              judge for yourself — that is worth more than anything we could write here.
            </p>
          </Rise>
          <div className="k-work-grid">
            {tier.examples.map((e, i) => (
              <Rise key={e.url} step={((i % 2) + 1) as 1 | 2}>
                <a className="k-work" href={e.url} target="_blank" rel="noopener noreferrer">
                  <span className="k-work-shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/work/${e.shot}.webp`}
                      alt={`The ${e.name} website`}
                      width={760}
                      height={475}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="k-work-body">
                    <h3 className="k-sub">{e.name}</h3>
                    <p className="k-sm">{e.line}</p>
                    <span className="k-work-domain">{e.domain} ↗</span>
                  </span>
                </a>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- what's in */}
      <section className="k-band k-band--panel">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">02 — WHAT {tier.name.toUpperCase()} INCLUDES</p>
            <h2 className="k-title k-web-h2">
              {tier.price} · {tier.time}
            </h2>
            <p className="k-lead k-measure">{tier.for}</p>
          </Rise>
          <div className="k-web-tiers k-web-tiers--three">
            <Rise step={1}>
              <article className="k-web-tier k-web-tier--lead">
                <h3 className="k-web-tier-name">In every {tier.name} build</h3>
                <ul className="k-web-list">
                  {tier.has.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </article>
            </Rise>
            <Rise step={2}>
              <article className="k-web-tier">
                <h3 className="k-web-tier-name">When this is the wrong one</h3>
                <p className="k-sm k-web-tier-for">{tier.notThis}</p>
                <ul className="k-web-list">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link href={`/websites/${o.slug}`} className="k-link">
                        {o.name} — {o.price}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            </Rise>
            <Rise step={3}>
              <article className="k-web-tier">
                <h3 className="k-web-tier-name">Afterwards</h3>
                <p className="k-sm k-web-tier-for">
                  The site is yours outright. Care keeps it patched, backed up and online from{" "}
                  {RATES.careBasic} a month — and {TERMS.postLaunchSupportDays} days of support come
                  with every build whether you take a plan or not.
                </p>
                <ul className="k-web-list">
                  <li>Hosting, domain and SSL</li>
                  <li>Daily backups and security patching</li>
                  <li>You edit your own content</li>
                </ul>
              </article>
            </Rise>
          </div>
        </div>
      </section>

      {/* Only Bespoke sits on the seam, so only Bespoke carries the ladder.
          On the other three it would be a price list for work they are not
          buying. */}
      {tier.slug === "bespoke" && <Crossover here="Bespoke" />}

      {/* ------------------------------------------------------------- cta */}
      <section className="k-band k-web-close">
        <div className="k-shell">
          <Rise>
            <h2 className="k-state k-web-close-h">
              {tier.name} is {tier.price}. Now you know.
            </h2>
            <p className="k-lead k-measure">
              Send us the address of your current site, or tell us what you need. We will tell you
              which of the four this actually is — including when it is a cheaper one than you asked
              about.
            </p>
            <div className="k-web-cta">
              <Link href="/contact" className="k-btn k-btn--solid">
                Start a project
              </Link>
              <Link href="/websites" className="k-btn k-btn--ghost">
                Compare all four
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
