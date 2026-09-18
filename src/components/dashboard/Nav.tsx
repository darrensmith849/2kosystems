"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITES } from "@/lib/dashboard/sites";

/**
 * Left navigation for the estate dashboard.
 *
 * A client component only so it can read the pathname for the active state —
 * the alternative is threading an `active` prop through every page, and a
 * layout cannot work it out for itself. It imports nothing but the site list,
 * which is plain data, so no server code follows it into the bundle.
 *
 * Sites carry an SC marker where Search Console has query data. Eight of the
 * ten properties are not verified, so their drill-downs show traffic but no
 * keywords — better to say so here than to let someone click through and find
 * an empty panel.
 */

function Item({
  href, label, muted, marker,
}: {
  href: string;
  label: string;
  muted?: boolean;
  marker?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] leading-tight transition-colors ${
        active
          ? "bg-white/[0.08] font-medium text-white"
          : muted
            ? "text-[var(--warm-50)] hover:bg-white/[0.04] hover:text-white/80"
            : "text-white/70 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className="truncate">{label}</span>
      {marker && (
        <span
          title="Search Console data available"
          className="shrink-0 rounded bg-blue-400/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-blue-300"
        >
          SC
        </span>
      )}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-50)]">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function DashboardNav() {
  return (
    <nav className="lg:sticky lg:top-8 lg:self-start">
      <Group title="Estate">
        <Item href="/internal/dashboard" label="Overview" />
      </Group>

      {(["Six Sigma", "2KO", "Sigmafy"] as const).map((group) => (
        <Group key={group} title={group}>
          {SITES.filter((s) => s.group === group).map((s) => (
            <Item
              key={s.id}
              href={`/internal/dashboard/sites/${s.host}`}
              label={s.label}
              marker={s.search}
            />
          ))}
        </Group>
      ))}

      <Group title="Enquiries">
        <Item href="/internal/dashboard/enquiries" label="All enquiries" />
        <Item href="/internal/dashboard" label="Autoresponder" muted />
      </Group>
    </nav>
  );
}
