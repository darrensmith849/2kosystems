import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Rise from "@/components/cinema/Rise";
import { Panel, QueueRows, Pill, PipelineFlow } from "@/components/cinema/instruments";
import { PRODUCTS, getProduct } from "@/lib/products";
import { RATES } from "@/lib/pricing";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} — ${product.price}, ${product.timebox}`,
    description: product.metaDescription,
    alternates: { canonical: `/systems/${product.slug}` },
    openGraph: {
      title: `${product.name} | 2KO Systems`,
      description: product.metaDescription,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription,
    brand: { "@type": "Brand", name: "2KO Systems" },
    offers: {
      "@type": "Offer",
      price: product.price.replace(/[^0-9]/g, ""),
      priceCurrency: "ZAR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      url: `https://www.2kosystems.com/systems/${product.slug}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const others = PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ═══ OPENING ═══ */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 lg:pt-40">
        <div className="k-glow -z-10" style={{ top: "40px" }} aria-hidden="true" />
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">
              Fixed price · Fixed scope · {product.timebox}
            </p>
          </Rise>
          <Rise step={1}>
            <h1 className="k-hero mt-6 max-w-[20ch]">{product.headline}</h1>
          </Rise>
          <Rise step={2}>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <p className="k-lead max-w-[54ch]">
                {product.summary} {product.price} ex VAT, agreed up front, with the
                scope written down before we start.
              </p>
              <div className="flex shrink-0 gap-3">
                <Link href="/contact" className="k-btn k-btn--solid">
                  Book a free scoping call
                </Link>
                <Link href="#scope" className="k-btn k-btn--ghost">
                  What&rsquo;s included
                </Link>
              </div>
            </div>
          </Rise>

          <Rise step={3} className="mt-14">
            <PipelineFlow stages={product.stages} />
          </Rise>
        </div>
      </section>

      {/* ═══ SYMPTOMS ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell">
          <Rise>
            <p className="k-mono">01 — Sound familiar?</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[24ch]">
              You are probably here because one of these happened this week.
            </h2>
          </Rise>
          <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {product.symptoms.map((symptom, i) => (
              <Rise key={symptom.t} step={(i % 3) as 0 | 1 | 2}>
                <div style={{ borderTop: "1px solid var(--hair-2)" }} className="pt-5">
                  <h3 className="text-[15px] font-medium tracking-[-0.015em]">
                    {symptom.t}
                  </h3>
                  <p className="k-sm mt-2.5">{symptom.d}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICE ═══ */}
      <section className="k-band">
        <div className="k-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <div>
            <Rise>
              <p className="k-mono k-mono--ember">02 — The whole price</p>
            </Rise>
            <Rise step={1}>
              <p className="k-num mt-6 text-[clamp(48px,7vw,92px)] leading-none">
                {product.price}
              </p>
            </Rise>
            <Rise step={2}>
              <p className="k-mono mt-4">
                ex VAT · {product.timebox} · fixed scope · no surprises
              </p>
            </Rise>
            <Rise step={3}>
              <p className="k-lead k-measure mt-6">
                Not an estimate and not billed by the hour. It is what the work
                costs, agreed before we begin. If we under-estimated the build,
                that is ours to carry.
              </p>
            </Rise>
          </div>
          <Rise step={1}>
            <Panel label="Terms" meta="Fixed">
              <QueueRows
                rows={[
                  { label: "On signature", value: "50%" },
                  { label: "On go-live", value: "50%" },
                  { label: "Scope changes", value: `${RATES.dayRate}/day`, tone: "warn" },
                  { label: "Applied retrospectively", value: "Never", tone: "good" },
                ]}
              />
              <div className="k-hairline mt-4 pt-3">
                <p className="k-mono">
                  If your version is bigger than this we say so at scoping, and
                  that conversation costs nothing.
                </p>
              </div>
            </Panel>
          </Rise>
        </div>
      </section>

      {/* ═══ SCOPE ═══ */}
      <section id="scope" className="k-band k-band--2 scroll-mt-20">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">03 — The scope box</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[26ch]">
              Exactly what the price buys — and what it does not.
            </h2>
          </Rise>
          <Rise step={2}>
            <p className="k-lead k-measure mt-5">
              Both lists are published in the same size type, because the second
              one is the reason the first can be a fixed price.
            </p>
          </Rise>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Rise>
              <Panel label={`Included in ${product.price}`} meta={`${product.included.length} items`}>
                <ul className="flex flex-col gap-2.5">
                  {product.included.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-[1.5]">
                      <span style={{ color: "var(--signal)" }}>—</span>
                      <span style={{ color: "var(--warm-70)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Rise>
            <Rise step={1}>
              <Panel label="Not included — quoted separately" meta={`${product.excluded.length} items`}>
                <ul className="flex flex-col gap-2.5">
                  {product.excluded.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-[1.5]">
                      <span style={{ color: "var(--warm-25)" }}>—</span>
                      <span style={{ color: "var(--warm-45)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="k-hairline mt-4 pt-3">
                  <p className="k-mono">
                    Real work we do — it changes the shape and the risk, so it
                    gets its own scope and its own price.
                  </p>
                </div>
              </Panel>
            </Rise>
          </div>
        </div>
      </section>

      {/* ═══ OUTCOMES ═══ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">04 — After go-live</p>
          </Rise>
          <Rise step={1}>
            <h2 className="k-title mt-6 max-w-[22ch]">
              What actually changes on the Monday.
            </h2>
          </Rise>
          <Rise step={2}>
            <div className="mt-8 flex flex-wrap gap-2">
              {product.outcomes.map((outcome, i) => (
                <Pill key={outcome} tone={i === 0 ? "good" : i === 3 ? "warn" : "neutral"}>
                  {outcome}
                </Pill>
              ))}
            </div>
          </Rise>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell max-w-4xl">
          <Rise>
            <p className="k-mono k-mono--ember">05 — Before you sign anything</p>
          </Rise>
          <div className="mt-12">
            {product.faqs.map((faq, i) => (
              <Rise key={faq.q}>
                <div
                  className="k-row"
                  style={i === 0 ? { borderTop: "1px solid var(--hair-2)" } : undefined}
                >
                  <h3 className="k-sub text-[17px]">{faq.q}</h3>
                  <p className="k-sm mt-2.5">{faq.a}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OTHER PRODUCTS ═══ */}
      <section className="k-band">
        <div className="k-shell">
          <Rise>
            <p className="k-mono k-mono--ember">Also ready to build</p>
          </Rise>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other, i) => (
              <Rise key={other.slug} step={(i % 3) as 0 | 1 | 2}>
                <Link href={`/systems/${other.slug}`} className="k-card block h-full">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-medium tracking-[-0.015em]">
                      {other.name}
                    </span>
                    <span className="k-num text-[14px]">{other.price}</span>
                  </div>
                  <p className="k-sm mt-3">{other.summary}</p>
                  <p className="k-mono mt-4">{other.timebox}</p>
                </Link>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSE ═══ */}
      <section className="k-band k-band--2">
        <div className="k-shell grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Rise>
              <p className="k-mono">Start</p>
            </Rise>
            <Rise step={1}>
              <h2 className="k-title mt-6 max-w-[24ch]">
                Tell us how you run it now. We will tell you what it takes.
              </h2>
            </Rise>
            <Rise step={2}>
              <p className="k-lead k-measure mt-5">
                A scoping call costs nothing and takes about thirty minutes. You
                will leave it knowing whether {product.price} covers your process
                — or what would.
              </p>
            </Rise>
          </div>
          <Rise step={3} className="flex flex-col gap-3">
            <Link href="/contact" className="k-btn k-btn--solid">
              Book a free scoping call
            </Link>
            <Link href="/pricing" className="k-btn k-btn--ghost">
              See the full price list
            </Link>
          </Rise>
        </div>
      </section>
    </>
  );
}
