import DashboardNav from "@/components/dashboard/Nav";

/**
 * Shell for the estate dashboard.
 *
 * Deliberately outside the `(site)` route group, so it does not inherit the
 * marketing header and footer. Route groups do not affect URLs, so the path is
 * unchanged — but a fixed sidebar and a sticky marketing nav cannot share a
 * screen, and this is a tool rather than a page of the website.
 *
 * The sidebar is fixed at 240px from `lg` up and off-canvas below it, so the
 * content is offset by that width only where the sidebar occupies it.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // `data-k` is what scopes the design system's custom properties in
  // system.css. The marketing layout carries it; this one is outside that
  // tree, so without it every var() on this page resolves to nothing.
  return (
    <div data-k className="min-h-screen bg-[var(--black)] text-[var(--warm)]">
      <DashboardNav />
      <div className="lg:pl-[240px]">
        {/* pt-20 clears the mobile bar; lg drops it, since the bar is hidden. */}
        <main className="mx-auto max-w-[1400px] px-5 pb-16 pt-20 sm:px-8 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
