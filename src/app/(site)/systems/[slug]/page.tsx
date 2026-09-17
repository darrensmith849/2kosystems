import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { completePageMetadata } from "@/lib/siteMetadata";
import Rise from "@/components/cinema/Rise";
import PageHero from "@/components/cinema/PageHero";
import JobCardProductPage from "@/components/cinema/JobCardProductPage";
import Photo from "@/components/cinema/Photo";
import { Panel, QueueRows, Pill, PipelineFlow } from "@/components/cinema/instruments";
import { PRODUCTS, getProduct } from "@/lib/products";
import { RATES, TERMS } from "@/lib/pricing";

const PRODUCT_PHOTOS: Record<string, { src: string; eyebrow: string; title: string; body: string; align?: "right" }> = {
  "sheq-incident-reporting": {
    src: "/imagery/systems/products/sheq-v1.webp",
    eyebrow: "EVIDENCE AT THE SCENE",
    title: "Capture the incident while the evidence is still on site.",
    body: "The report, physical context, accountable owner and corrective action begin together—without turning safety judgement into a software decision.",
    align: "right",
  },
  "contractor-compliance": {
    src: "/imagery/systems/products/contractor-v1.webp",
    eyebrow: "FROM GATE TO WORKFACE",
    title: "One verified route into compliant work.",
    body: "Credentials, induction, PPE requirements and expiry rules become a visible process before the contractor enters the site.",
  },
  "stock-and-asset-register": {
    src: "/imagery/systems/products/stock-v1.webp",
    eyebrow: "THE PHYSICAL RECORD",
    title: "Know what moved, who issued it and where the asset belongs.",
    body: "The store, maintenance team and asset owner share one traceable record from receipt to issue, return and verification.",
    align: "right",
  },
};

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

  const title = `${product.name} — ${product.price}, ${product.timebox}`;

  return completePageMetadata({
    title,
    description: product.metaDescription,
    alternates: { canonical: `/systems/${product.slug}` },
  });
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
    brand: { "@type": "Brand", name: "2KO" },
    offers: {
      "@type": "Offer",
      price: product.price.replace(/[^0-9]/g, ""),
      priceCurrency: "ZAR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      url: `${SITE_URL}/systems/${product.slug}`,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Systems", item: `${SITE_URL}/systems` },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  const others = PRODUCTS.filter((p) => p.slug !== product.slug);
  const productPhoto = PRODUCT_PHOTOS[product.slug];

  if (product.slug === "job-card-system") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <JobCardProductPage product={product} others={others} />
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Visible breadcrumb — Google prefers markup it can see corroborated */}
      <nav aria-label="Breadcrumb" className="k-shell pt-28 lg:pt-32">
        <ol className="k-mono flex flex-wrap items-center gap-2">
          <li><Link href="/systems" className="hover:text-[var(--warm)]">Systems</Link></li>
          <li aria-hidden="true">/</li>
          <li style={{ color: "var(--warm-70)" }}>{product.name}</li>
        </ol>
      </nav>

      {/* ═══ OPENING ═══ */}
      <PageHero
        eyebrow={`FIXED PRICE · FIXED SCOPE · ${product.timebox.toUpperCase()}`}
        title={product.headline}
        titleClass="max-w-[17ch]"
        lead={
          <>
            {product.summary} {product.price} ex VAT, agreed up front, with the scope
            written down before we start.
          </>
        }
        ctas={[
          { href: `/contact?interest=${product.slug}`, label: "Book a free scoping call" },
          { href: "#scope", label: "What’s included", ghost: true },
        ]}
        facts={[
          { value: product.price, label: "ex VAT, fixed" },
          { value: product.timebox, label: "to go-live" },
          { value: `${TERMS.postLaunchSupportDays} days`, label: "support included" },
          { value: "Yours", label: "code and data, day one" },
        ]}
      >
        <div className="mt-14">
          <PipelineFlow stages={product.stages} />
        </div>
      </PageHero>

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

      {productPhoto && (
        <section className="pd-photo" data-align={productPhoto.align ?? "left"}>
          <Rise variant="settle" className="pd-photo__media"><Photo src={productPhoto.src} sizes="100vw" position="center" /></Rise>
          <div className="pd-photo__shade" aria-hidden="true" />
          <div className="k-shell pd-photo__copy"><Rise><p className="k-mono k-mono--ember">{productPhoto.eyebrow}</p></Rise><Rise step={1}><h2>{productPhoto.title}</h2></Rise><Rise step={2}><p className="image-chapter-lead">{productPhoto.body}</p></Rise></div>
        </section>
      )}

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
                  No site visit needed. A call and a look at how you run it now
                  is enough to scope this. If your version is bigger than the box
                  we say so then, and that conversation costs nothing.
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
            <Link href={`/contact?interest=${product.slug}`} className="k-btn k-btn--solid">
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
