"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Child = { href: string; name: string; line: string; external?: boolean };
type NavLink = { href: string; label: string; children?: Child[] };

const serviceLinks: Child[] = [
  {
    href: "/process-review",
    name: "Process Improvement",
    line: "Find the constraint, redesign the work and verify the gain.",
  },
  {
    href: "/systems",
    name: "Systems & Automation",
    line: "Build the workflow, controls and operating record.",
  },
  {
    href: "/automation",
    name: "Process Automation",
    line: "Automate repeatable work with explicit controls and human authority.",
  },
  {
    href: "/training",
    name: "Training",
    line: "Accredited Six Sigma capability through Six Sigma South Africa.",
  },
  {
    href: "/sigmafy",
    name: "Sigmafy",
    line: "Statistical tools and a visible improvement evidence layer.",
  },
  {
    href: "/managed-improvement",
    name: "Improvement Partnerships",
    line: "One accountable relationship across process, people and systems.",
  },
];

const links: NavLink[] = [
  { href: "/services", label: "What we do", children: serviceLinks },
  { href: "/method", label: "Method" },
  { href: "/results", label: "Results" },
  { href: "/sectors", label: "Sectors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/studio", label: "About" },
];

export default function Nav() {
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const path = usePathname();

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open && !mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    const onDown = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, mobileOpen]);

  const servicesActive = ["/process-review", "/audit", "/automation", "/systems", "/training", "/sigmafy", "/managed-improvement"].some((href) =>
    path.startsWith(href),
  );

  return (
    <header className="k-topbar" data-lifted={lifted || mobileOpen} ref={barRef}>
      <div className="k-shell flex h-[58px] items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="2KO home"
          onClick={() => {
            setOpen(null);
            setMobileOpen(false);
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ember)" }} />
          <span className="text-[15px] font-medium tracking-[-0.015em]">2KO</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {links.map((link) =>
            link.children ? (
              <div
                key={link.href}
                className="k-navgroup"
                onMouseEnter={() => setOpen(link.href)}
                onMouseLeave={() => setOpen(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null);
                }}
              >
                <button
                  type="button"
                  className="k-navlink k-navlink--parent"
                  data-active={servicesActive}
                  aria-expanded={open === link.href}
                  aria-controls="services-menu"
                  onClick={() => setOpen(open === link.href ? null : link.href)}
                  onFocus={() => setOpen(link.href)}
                >
                  {link.label}
                  <span className="k-navcaret" aria-hidden />
                </button>

                <div id="services-menu" className="k-navmenu" data-open={open === link.href}>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="k-navitem"
                      aria-current={path === child.href || path.startsWith(`${child.href}/`) ? "page" : undefined}
                      onClick={() => setOpen(null)}
                      target={child.external ? "_blank" : undefined}
                      rel={child.external ? "noreferrer" : undefined}
                    >
                      <span className="k-navitem-name">{child.name}</span>
                      <span className="k-navitem-line">{child.line}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="k-navlink"
                data-active={path.startsWith(link.href)}
                onClick={() => {
                  setOpen(null);
                  setMobileOpen(false);
                }}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="k-btn k-btn--solid k-nav-cta h-8 px-4 text-[13px]"
            onClick={() => {
              setOpen(null);
              setMobileOpen(false);
            }}
          >
            Bring us the process
          </Link>
          <button
            type="button"
            className="k-menu-button lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className="k-mobile-nav lg:hidden"
        data-open={mobileOpen}
        aria-label="Mobile navigation"
      >
        <div className="k-shell py-5">
          <p className="k-mono k-mono--ember">What we do</p>
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            {serviceLinks.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="k-mobile-navitem"
                aria-current={path === child.href || path.startsWith(`${child.href}/`) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                target={child.external ? "_blank" : undefined}
                rel={child.external ? "noreferrer" : undefined}
              >
                <strong>{child.name}</strong>
                <span>{child.line}</span>
              </Link>
            ))}
          </div>
          <div className="k-hairline mt-4 grid grid-cols-2 gap-1 pt-4 sm:grid-cols-3">
            {links.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="k-mobile-navlink"
                aria-current={path === link.href || path.startsWith(`${link.href}/`) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/contact" className="k-btn k-btn--solid mt-4 w-full sm:hidden" onClick={() => setMobileOpen(false)}>
            Bring us the process
          </Link>
        </div>
      </nav>
    </header>
  );
}
