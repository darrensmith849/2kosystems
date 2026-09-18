import DashboardNav from "@/components/dashboard/Nav";

/**
 * Shell for the estate dashboard: navigation down the left, content on the
 * right. Stacks on narrow screens, where the nav becomes a scrollable strip
 * above the content rather than a sidebar nobody can reach.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-16">
      <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
        <div className="mb-8 lg:mb-0">
          <DashboardNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
