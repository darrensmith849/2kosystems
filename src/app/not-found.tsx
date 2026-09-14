import Link from "next/link";
import { headers } from "next/headers";
import Nav from "@/components/cinema/Nav";
import Footer from "@/components/cinema/Footer";
import { REQUESTED_PATH } from "@/lib/site";
import { retiredLine } from "@/lib/legacy-redirects";

/**
 * Root not-found. Unmatched URLs never enter the (site) route group, so this
 * has to carry the shell itself rather than inherit it.
 *
 * It answers with a 404 even for addresses we know exactly why somebody asked
 * for. That is deliberate. A 200-status "no longer available" page is read as a
 * soft 404 by search engines whatever it says, so it leaves the index anyway —
 * and while it is there it competes for queries 2KO cannot serve, which is
 * worse than not ranking at all. The status code tells the crawler to drop the
 * address; the page still gets to talk to the person who arrived.
 */
export default async function NotFound() {
  const path = (await headers()).get(REQUESTED_PATH) ?? "";
  const retired = retiredLine(path);

  // Four entries either way, so the two-column grid below never leaves a hole.
  const links = retired?.links ?? [
    { href: "/systems", label: "What we build", note: "The six operational layers" },
    { href: "/pricing", label: "Pricing", note: "Every price, published" },
    { href: "/get-off-excel", label: "Get Off Excel", note: "One spreadsheet, four weeks" },
    { href: "/contact", label: "Contact", note: "Book a process review" },
  ];

  return (
    <div data-k>
      <Nav />
      <main>
        <section className="relative isolate overflow-hidden">
          <div className="k-glow -z-10" style={{ top: "-220px" }} aria-hidden="true" />
          <div className="k-shell flex min-h-[80svh] flex-col justify-center py-24">
            <p className="k-mono k-mono--ember">
              {retired ? "No longer offered" : "Error 404"}
            </p>

            {retired ? (
              <>
                <h1 className="k-state mt-6 max-w-[20ch]">
                  We stopped offering {retired.subject}.
                </h1>
                <p className="k-lead k-measure mt-6">{retired.line}</p>
                <p className="k-lead k-measure mt-4 text-[var(--warm-70)]">
                  What 2KO does now is improve how operations run, build the systems
                  that hold the improvement, and train the people running them.
                </p>
              </>
            ) : (
              <>
                <h1 className="k-state mt-6 max-w-[18ch]">
                  That page is not where it used to be.
                </h1>
                <p className="k-lead k-measure mt-6">
                  The site was rebuilt and a few addresses moved. The old ones
                  redirect automatically, so if you have landed here the page has
                  most likely been retired rather than relocated.
                </p>
              </>
            )}

            <div className="mt-12 grid gap-px overflow-hidden rounded-[10px] border border-[var(--hair)] sm:grid-cols-2">
              {links.map((link) => (
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
