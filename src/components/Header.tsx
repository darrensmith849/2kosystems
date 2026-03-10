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
  { href: "/get-started", label: "Get Started" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/2ko-logo.jpeg"
            alt="2KO Systems"
            width={140}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/get-started"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent2"
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
            className={`h-0.5 w-6 bg-text transition-all ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-text transition-all ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-text transition-all ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/98 px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-started"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-block rounded-full bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-accent2"
            >
              Book a Systems Audit
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
