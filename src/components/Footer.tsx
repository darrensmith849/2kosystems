import Image from "next/image";
import Link from "next/link";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const solutionLinks = [
  { href: "/solutions#workflow-automation", label: "Workflow Automation" },
  { href: "/solutions#portals", label: "Client & Staff Portals" },
  { href: "/solutions#approvals", label: "Approvals & Governance" },
  { href: "/solutions#dashboards", label: "Dashboards & Reporting" },
  { href: "/solutions#knowledge", label: "SOP & Knowledge Copilots" },
  { href: "/solutions#ai", label: "AI-Assisted Operations" },
];

const industryLinks = [
  { href: "/industries#mining", label: "Mining" },
  { href: "/industries#agriculture", label: "Agriculture" },
  { href: "/industries#logistics", label: "Logistics" },
  { href: "/industries#industrial", label: "Industrial Services" },
  { href: "/industries#compliance", label: "Compliance" },
  { href: "/industries#multi-branch", label: "Multi-Branch" },
];

const locationLinks = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
];

export default function Footer() {
  return (
    <footer
      className="relative isolate overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--color-hero-block) 0%, var(--color-hero-block-2) 100%)",
      }}
    >
      {/* Six Sigma-style stippled dot pattern matches the hero canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Top highlight band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-10 lg:px-10 lg:pt-24">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-12">
          {/* ---------- Brand block ---------- */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/2ko-logo.png"
                alt="2KO Systems"
                width={150}
                height={42}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/75">
              Custom operational systems and intelligent automation for
              established businesses across South Africa.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-white/85">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Part of the 2KO Group
            </span>
          </div>

          {/* ---------- Site column ---------- */}
          <div>
            <h4
              className="mb-5 text-[11px] font-semibold uppercase text-white/95"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Site
            </h4>
            <ul className="flex flex-col gap-3">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Solutions column ---------- */}
          <div>
            <h4
              className="mb-5 text-[11px] font-semibold uppercase text-white/95"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Solutions
            </h4>
            <ul className="flex flex-col gap-3">
              {solutionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Industries column ---------- */}
          <div>
            <h4
              className="mb-5 text-[11px] font-semibold uppercase text-white/95"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Industries
            </h4>
            <ul className="flex flex-col gap-3">
              {industryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Get in Touch + Locations ---------- */}
          <div>
            <h4
              className="mb-5 text-[11px] font-semibold uppercase text-white/95"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Locations
            </h4>
            <ul className="mb-7 flex flex-col gap-3">
              {locationLinks.map((city) => (
                <li
                  key={city}
                  className="text-[14px] text-white/80"
                >
                  {city}
                </li>
              ))}
            </ul>

            <h4
              className="mb-4 text-[11px] font-semibold uppercase text-white/95"
              style={{ letterSpacing: "var(--tracking-eyebrow)" }}
            >
              Get in Touch
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="tel:+27215270065"
                  className="text-[14px] font-medium text-[var(--accent-highlight)] transition-colors hover:text-white"
                >
                  021 527 0065
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@2ko.co.za"
                  className="text-[14px] font-medium text-[var(--accent-highlight)] transition-colors hover:text-white"
                >
                  info@2ko.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------- Bottom strip ---------- */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row">
          <p className="text-[12px] text-white/65">
            &copy; {new Date().getFullYear()} 2KO Systems&trade; — 2KO Africa CC.
            All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[12px]">
            <Link
              href="/privacy"
              className="text-white/65 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <span className="text-white/65">
              Custom Operational Systems · South Africa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
