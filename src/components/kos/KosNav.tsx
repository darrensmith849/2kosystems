"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PRODUCTS } from "@/lib/kos/catalogue";

const LINKS = [
  ...PRODUCTS.map((p) => ({ href: `/${p.key}`, label: p.name })),
  { href: "/earn", label: "How you earn" },
  { href: "/try", label: "Try it" },
  { href: "/faq", label: "Questions" },
];

export function KosBrand() {
  return (
    <Link href="/" className="ks-brand" aria-label="2KO Systems home">
      <span className="ks-brand-dot" />
      <span className="ks-brand-mark">2KO</span>
      <span className="ks-brand-word">Systems</span>
    </Link>
  );
}

export default function KosNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="ks-top">
      <div className="k-shell">
        <div className="ks-top-in">
          <KosBrand />
          <nav className="ks-links" aria-label="Main">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ks-top-cta">
            <Link href="/apply" className="k-btn k-btn--solid">
              Become a partner
            </Link>
          </div>
          <button type="button" className="ks-menu-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
        <nav className="ks-panel" data-open={open} aria-label="Main, mobile" onClick={() => setOpen(false)}>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/apply" className="k-btn k-btn--solid">
            Become a partner
          </Link>
        </nav>
      </div>
    </header>
  );
}
