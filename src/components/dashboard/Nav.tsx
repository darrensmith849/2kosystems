"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITES, type DashboardSite } from "@/lib/dashboard/sites";
import {
  OverviewIcon, InboxIcon, BotIcon, SearchIcon, MenuIcon, CloseIcon,
} from "./icons";

/**
 * Fixed sidebar for the estate dashboard.
 *
 * A client component for three reasons: the active route, the mobile drawer,
 * and closing that drawer on navigation. It imports only the site list, which
 * is plain data, so no server code follows it into the bundle.
 *
 * Section links get an icon; sites get a monogram tinted by group. Ten
 * identical globes would carry no information — the monogram at least tells
 * you which site you are looking at while your eye is still moving.
 */

const GROUP_TINT: Record<DashboardSite["group"], string> = {
  "Six Sigma": "bg-emerald-400/15 text-emerald-300",
  "2KO": "bg-[var(--ember)]/15 text-[var(--ember)]",
  Sigmafy: "bg-violet-400/15 text-violet-300",
};

/** Initials from a label: "Six Sigma South Africa" → "SS", "2KO" → "2K". */
function monogram(label: string) {
  const words = label.replace(/[^\w\s/]/g, " ").split(/[\s/]+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function Row({
  href, label, icon, badge, muted, onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  muted?: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] leading-tight transition-colors ${
        active
          ? "bg-white/[0.09] font-medium text-white"
          : muted
            ? "text-[var(--warm-45)] hover:bg-white/[0.04]"
            : "text-white/65 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
      {badge && <span className="ml-auto shrink-0">{badge}</span>}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Panel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.07] px-4">
        <span className="h-2 w-2 rounded-full bg-[var(--ember)]" />
        <span className="text-[13px] font-semibold tracking-[-0.01em]">Estate</span>
        {/* Hidden below lg, where the drawer's close button occupies this corner. */}
        <span className="ml-auto hidden text-[10px] uppercase tracking-[0.1em] text-white/35 lg:inline">
          2KO
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
        <Section title="Estate">
          <Row
            href="/internal/dashboard"
            label="Overview"
            icon={<OverviewIcon className="h-4 w-4" />}
            onNavigate={onNavigate}
          />
          <Row
            href="/internal/dashboard/enquiries"
            label="Enquiries"
            icon={<InboxIcon className="h-4 w-4" />}
            onNavigate={onNavigate}
          />
          <Row
            href="/internal/dashboard"
            label="Autoresponder"
            icon={<BotIcon className="h-4 w-4" />}
            muted
            onNavigate={onNavigate}
          />
        </Section>

        {(["Six Sigma", "2KO", "Sigmafy"] as const).map((group) => (
          <Section key={group} title={group}>
            {SITES.filter((s) => s.group === group).map((s) => (
              <Row
                key={s.id}
                href={`/internal/dashboard/sites/${s.host}`}
                label={s.label}
                onNavigate={onNavigate}
                icon={
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-[5px] text-[9px] font-bold tracking-tight ${GROUP_TINT[s.group]}`}
                  >
                    {monogram(s.label)}
                  </span>
                }
                badge={
                  s.search ? (
                    <SearchIcon className="h-3.5 w-3.5 text-blue-300/70" />
                  ) : undefined
                }
              />
            ))}
          </Section>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/[0.07] px-4 py-3 text-[10px] leading-relaxed text-white/30">
        <SearchIcon className="mr-1 inline h-3 w-3 align-[-1px]" />
        marks the sites with Search Console data
      </div>
    </div>
  );
}

export default function DashboardNav() {
  const [open, setOpen] = useState(false);

  // The drawer closes from each link's own onNavigate rather than from an
  // effect watching the pathname — closing it is a consequence of the tap, not
  // of the route changing, and doing it in the handler keeps the state change
  // out of render.
  //
  // A fixed drawer over the page should not leave the page scrolling behind it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {/* Mobile bar. The sidebar is off-canvas below lg. */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-[var(--black-2)]/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="-ml-1 rounded-lg p-1.5 text-white/70 hover:bg-white/[0.06] hover:text-white"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="text-[13px] font-semibold tracking-[-0.01em]">Estate</span>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] border-r border-white/[0.07] bg-[var(--black-2)] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
          className="absolute right-3 top-4 rounded-lg p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white lg:hidden"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <Panel onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
