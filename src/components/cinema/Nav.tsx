"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/systems", label: "Systems" },
  { href: "/method", label: "Method" },
  { href: "/pricing", label: "Pricing" },
  { href: "/sectors", label: "Sectors" },
  { href: "/studio", label: "Studio" },
];

/**
 * Full-width bar aligned to the same container as page content, so the header
 * and the app frame below it share one set of edges.
 */
export default function Nav() {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="k-topbar" data-lifted={lifted}>
      <div className="k-shell flex h-[58px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ember)" }} />
          <span className="text-[15px] font-medium tracking-[-0.015em]">2KO Systems</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13.5px] text-[var(--warm-70)] transition-colors duration-300 hover:text-[var(--warm)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="k-btn k-btn--solid h-8 px-4 text-[13px]">
          Start a project
        </Link>
      </div>
    </header>
  );
}
