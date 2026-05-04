import Link from "next/link";

const footerLinks = {
  solutions: [
    { href: "/solutions", label: "Overview" },
    { href: "/solutions#workflow-automation", label: "Workflow Automation" },
    { href: "/solutions#portals", label: "Client & Staff Portals" },
    { href: "/solutions#approvals", label: "Approvals & Governance" },
    { href: "/solutions#dashboards", label: "Dashboards & Reporting" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/case-studies", label: "Case Studies" },
    { href: "/how-we-work", label: "How We Work" },
    { href: "/industries", label: "Industries" },
    { href: "/contact", label: "Contact" },
    { href: "/get-started", label: "Get Started" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-[19px] font-semibold tracking-[var(--tracking-display)] text-text"
            >
              2KO <span className="text-accent">Systems</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Custom systems and intelligent automation for established businesses.
              Part of the 2KO group.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-muted2">
              Solutions
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.solutions.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-muted2">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border-subtle)] pt-8 sm:flex-row">
          <p className="text-xs text-muted2">
            &copy; {new Date().getFullYear()} 2KO Systems. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="text-xs text-muted2 transition-colors hover:text-text"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
