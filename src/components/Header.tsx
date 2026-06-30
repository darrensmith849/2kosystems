"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/solutions", label: "Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-topbar-bg)]"
      style={{
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        backdropFilter: "saturate(180%) blur(20px)",
        height: "var(--topbar-h)",
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Brand — invert the existing white logo so it renders black on the light header */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/2ko-logo.png"
            alt="2KO Systems"
            width={140}
            height={40}
            className="h-7 w-auto"
            style={{ filter: "brightness(0)" }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] tracking-[-0.005em] text-[var(--color-fg)]/80 transition-colors hover:text-[var(--color-fg)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold tracking-[-0.005em] text-white shadow-[0_8px_20px_-10px_rgba(22,163,74,0.6)] transition-all duration-200 hover:bg-[var(--accent2)] active:scale-[0.98]"
          >
            Book a Systems Audit
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-6 bg-[var(--color-fg)] transition-all ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-[var(--color-fg)] transition-all ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-[var(--color-fg)] transition-all ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t border-[var(--color-border-subtle)] bg-[var(--color-topbar-bg)] px-6 pb-6 md:hidden"
          style={{
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            backdropFilter: "saturate(180%) blur(20px)",
          }}
        >
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[15px] tracking-[-0.005em] text-[var(--color-fg)]/85 transition-colors hover:text-[var(--color-fg)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-block rounded-full bg-[var(--accent)] px-5 py-2.5 text-center text-[13px] font-semibold tracking-[-0.005em] text-white transition-colors hover:bg-[var(--accent2)]"
            >
              Book a Systems Audit
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
