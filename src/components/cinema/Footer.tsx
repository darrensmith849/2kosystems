import Link from "next/link";

const columns = [
  {
    heading: "Improve",
    links: [
      { href: "/process-review", label: "Process Review" },
      { href: "/audit", label: "Opportunity Audit" },
      { href: "/method", label: "The 2KO method" },
      { href: "/results", label: "Results & evidence" },
    ],
  },
  {
    heading: "Build",
    links: [
      { href: "/automation", label: "Process Automation" },
      { href: "/systems", label: "Operational Systems" },
      { href: "/managed-improvement", label: "Improvement Partnerships" },
      { href: "/pricing", label: "Pricing & terms" },
    ],
  },
  {
    heading: "Learn & measure",
    links: [
      { href: "/training", label: "Training & capability" },
      { href: "/sigmafy", label: "Sigmafy statistics" },
      { href: "/sectors", label: "Sectors" },
      { href: "/studio", label: "About 2KO" },
      { href: "/websites", label: "Website services" },
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
              <span className="text-[16px] font-semibold tracking-[-0.02em]">2KO</span>
            </div>
            <p className="k-sm mt-4 max-w-[34ch]">
              Improve the process, train the people, build the system and measure
              whether the result holds.
            </p>
            <Link href="/contact" className="k-btn k-btn--ghost mt-6">
              Bring us the process
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
          <span className="k-mono">© 2KO · South Africa and Africa</span>
          <span className="k-mono"><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · Prices ex VAT</span>
        </div>
      </div>
    </footer>
  );
}
