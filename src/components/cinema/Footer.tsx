import Link from "next/link";
import { RATES } from "@/lib/pricing";

const columns = [
  {
    heading: "Systems",
    links: [
      { href: "/systems", label: "What we build" },
      { href: "/get-off-excel", label: `Get Off Excel — ${RATES.getOffExcel}` },
      { href: "/sectors", label: "Sectors" },
    ],
  },
  {
    heading: "Working together",
    links: [
      { href: "/method", label: "Method" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/studio", label: "Studio" },
      { href: "https://www.2ko.co.za", label: "Part of the 2KO group" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="k-band" style={{ borderTop: "1px solid var(--hair)" }}>
      <div className="k-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ember)" }} />
              <span className="text-[16px] font-semibold tracking-[-0.02em]">2KO Systems</span>
            </div>
            <p className="k-sm mt-4 max-w-[34ch]">
              Operational systems for heavy South African industry. Fixed scope,
              published prices, and code you own from day one.
            </p>
            <Link href="/contact" className="k-btn k-btn--ghost mt-6">
              Start a project
            </Link>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="k-mono">{column.heading}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-[var(--warm-70)] transition-colors duration-500 hover:text-[var(--warm)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-5 pt-5"
          style={{ borderTop: "1px solid var(--hair)" }}
        >
          <span className="k-mono">© 2KO Systems · South Africa</span>
          <span className="k-mono">Prices ex VAT · Invoiced in rand</span>
        </div>
      </div>
    </footer>
  );
}
