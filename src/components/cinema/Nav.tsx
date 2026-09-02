"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WEB_TIERS } from "@/lib/websites";
import { CATALOGUE } from "@/lib/products";

/** A sub-item is anything with a destination, a name and a published price. */
type Child = { href: string; name: string; price: string; line: string };
type NavLink = { href: string; label: string; children?: Child[] };

const links: NavLink[] = [
  {
    href: "/websites",
    label: "Websites",
    children: WEB_TIERS.map((t) => ({
      href: `/websites/${t.slug}`,
      name: t.name,
      price: t.price,
      line: t.line,
    })),
  },
  {
    // CATALOGUE already carries Get Off Excel plus the four productised
    // systems, so the menu cannot drift from the pages it points at.
    href: "/systems",
    label: "Systems",
    children: CATALOGUE.map((c) => ({
      href: c.href,
      name: c.name,
      price: c.price,
      line: c.summary,
    })),
  },
  { href: "/method", label: "Method" },
  { href: "/pricing", label: "Pricing" },
  { href: "/quote", label: "Get a quote" },
  { href: "/sectors", label: "Sectors" },
  { href: "/studio", label: "Studio" },
];

/**
 * Full-width bar aligned to the same container as page content, so the header
 * and the app frame below it share one set of edges.
 */
export default function Nav() {
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const barRef = useRef<HTMLElement>(null);
  const path = usePathname();

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that only opens on hover is unusable by keyboard and on a phone, so
  // it opens on focus too — which then needs Escape and outside-click to close
  // it again.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onDown = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <header className="k-topbar" data-lifted={lifted} ref={barRef}>
      <div className="k-shell flex h-[58px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ember)" }} />
          <span className="text-[15px] font-medium tracking-[-0.015em]">2KO Systems</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) =>
            link.children ? (
              <div
                key={link.href}
                className="k-navgroup"
                onMouseEnter={() => setOpen(link.href)}
                onMouseLeave={() => setOpen(null)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
                }}
              >
                <Link
                  href={link.href}
                  className="k-navlink k-navlink--parent"
                  data-active={path.startsWith(link.href)}
                  aria-expanded={open === link.href}
                  aria-haspopup="true"
                  onClick={() => setOpen(null)}
                  onFocus={() => setOpen(link.href)}
                >
                  {link.label}
                  <span className="k-navcaret" aria-hidden />
                </Link>

                <div className="k-navmenu" data-open={open === link.href}>
                  {link.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="k-navitem"
                      aria-current={path === c.href ? "page" : undefined}
                      onClick={() => setOpen(null)}
                    >
                      <span className="k-navitem-top">
                        <span className="k-navitem-name">{c.name}</span>
                        <span className="k-navitem-price">{c.price}</span>
                      </span>
                      <span className="k-navitem-line">{c.line}</span>
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
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <Link href="/contact" className="k-btn k-btn--solid h-8 px-4 text-[13px]">
          Start a project
        </Link>
      </div>
    </header>
  );
}
