import Link from "next/link";
import Nav from "@/components/cinema/Nav";
import Footer from "@/components/cinema/Footer";

/**
 * Root not-found. Unmatched URLs never enter the (site) route group, so this
 * has to carry the shell itself rather than inherit it.
 */
const LINKS = [
  { href: "/systems", label: "What we build", note: "The six operational layers" },
  { href: "/pricing", label: "Pricing", note: "Every price, published" },
  { href: "/get-off-excel", label: "Get Off Excel", note: "One spreadsheet, four weeks" },
  { href: "/contact", label: "Contact", note: "Book a process review" },
];

export default function NotFound() {
  return (
    <div data-k>
      <Nav />
      <main>
        <section className="relative isolate overflow-hidden">
          <div className="k-glow -z-10" style={{ top: "-220px" }} aria-hidden="true" />
          <div className="k-shell flex min-h-[80svh] flex-col justify-center py-24">
            <p className="k-mono k-mono--ember">Error 404</p>
            <h1 className="k-state mt-6 max-w-[18ch]">
              That page is not where it used to be.
            </h1>
            <p className="k-lead k-measure mt-6">
              The site was rebuilt and a few addresses moved. The old ones redirect
              automatically, so if you have landed here the page has most likely
              been retired rather than relocated.
            </p>

            <div className="mt-12 grid gap-px overflow-hidden rounded-[10px] border border-[var(--hair)] sm:grid-cols-2">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-[var(--panel)] p-5 transition-colors duration-300 hover:bg-[var(--panel-2)]"
                >
                  <p className="text-[14px] font-medium tracking-[-0.015em]">
                    {link.label}
                  </p>
                  <p className="k-mono mt-1.5">{link.note}</p>
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/" className="k-btn k-btn--solid">
                Back to the homepage
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
