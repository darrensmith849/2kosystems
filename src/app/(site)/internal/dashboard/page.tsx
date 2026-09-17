import type { Metadata } from "next";
import { trafficBySite, dashboardConfigured, type SiteTraffic } from "@/lib/dashboard/ga";

/**
 * Internal traffic dashboard.
 *
 * Every site in the estate on one screen, which until now meant opening ten
 * GA4 properties across three accounts — most named for domains they do not
 * track.
 *
 * force-dynamic because the whole point is current numbers; the ten property
 * queries run in parallel and the Data API is the slow part, not us. Sits
 * under /internal, which the Proxy protects and robots excludes.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estate Dashboard",
  description: "Traffic across every 2KO, Six Sigma and Sigmafy property.",
  robots: { index: false, follow: false, nocache: true },
};

const num = (n: number) => n.toLocaleString("en-ZA");

/** Percentage change of the last 7 days against the prior 7-day average. */
function trend(site: SiteTraffic): { label: string; tone: string } | null {
  if (site.error || site.users28 === 0) return null;
  const priorWeekly = (site.users28 - site.users7) / 3;
  if (priorWeekly < 5) return null; // too small to mean anything
  const pct = Math.round(((site.users7 - priorWeekly) / priorWeekly) * 100);
  if (Math.abs(pct) < 10) return { label: "steady", tone: "text-[var(--warm-50)]" };
  return {
    label: `${pct > 0 ? "+" : ""}${pct}%`,
    tone: pct > 0 ? "text-emerald-400" : "text-amber-400",
  };
}

function Group({ name, rows }: { name: string; rows: SiteTraffic[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      <tr>
        <th
          colSpan={5}
          className="pt-8 pb-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-50)]"
        >
          {name}
        </th>
      </tr>
      {rows.map((s) => {
        const t = trend(s);
        return (
          <tr key={s.id} className="border-t border-white/10">
            <td className="py-3 pr-4">
              <div className="text-[15px] font-medium">{s.label}</div>
              <div className="text-[12px] text-[var(--warm-50)]">{s.host}</div>
            </td>
            {s.error ? (
              <td colSpan={4} className="py-3 text-[13px] text-amber-400">
                {s.error}
              </td>
            ) : (
              <>
                <td className="py-3 text-right tabular-nums">{num(s.users7)}</td>
                <td className="py-3 text-right tabular-nums">{num(s.users28)}</td>
                <td className="py-3 text-right tabular-nums">{num(s.users90)}</td>
                <td className={`py-3 pl-4 text-right text-[13px] ${t?.tone ?? "text-[var(--warm-50)]"}`}>
                  {t?.label ?? "—"}
                </td>
              </>
            )}
          </tr>
        );
      })}
    </>
  );
}

export default async function DashboardPage() {
  if (!dashboardConfigured()) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-24">
        <h1 className="text-[28px] font-semibold">Estate dashboard</h1>
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--warm-70)]">
          Analytics credentials are not set on this Worker, so there is nothing
          to show. Set them once and this page fills in:
        </p>
        <pre className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-5 text-[13px]">
{`npx wrangler secret put GOOGLE_ADS_CLIENT_ID
npx wrangler secret put GOOGLE_ADS_CLIENT_SECRET
npx wrangler secret put GOOGLE_ANALYTICS_REFRESH_TOKEN`}
        </pre>
        <p className="mt-5 text-[13px] text-[var(--warm-50)]">
          The values are the ones already in your local .env. The refresh token
          is minted by <code>npm run ga:auth</code>.
        </p>
      </main>
    );
  }

  let rows: SiteTraffic[] = [];
  let failure: string | null = null;
  try {
    rows = await trafficBySite();
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  const working = rows.filter((r) => !r.error);
  const total7 = working.reduce((a, r) => a + r.users7, 0);
  const total28 = working.reduce((a, r) => a + r.users28, 0);
  const silent = working.filter((r) => r.users28 === 0);

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-50)]">
        Internal
      </p>
      <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.02em]">
        Estate dashboard
      </h1>
      <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-[var(--warm-70)]">
        Active users across every tagged property. Figures come straight from
        the GA4 Data API each time this page loads.
      </p>

      {failure ? (
        <div className="mt-10 rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-[14px] text-amber-300">
          {failure}
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 p-5">
              <div className="text-[12px] uppercase tracking-wider text-[var(--warm-50)]">
                Users, last 7 days
              </div>
              <div className="mt-2 text-[28px] font-semibold tabular-nums">{num(total7)}</div>
            </div>
            <div className="rounded-xl border border-white/10 p-5">
              <div className="text-[12px] uppercase tracking-wider text-[var(--warm-50)]">
                Users, last 28 days
              </div>
              <div className="mt-2 text-[28px] font-semibold tabular-nums">{num(total28)}</div>
            </div>
            <div className="rounded-xl border border-white/10 p-5">
              <div className="text-[12px] uppercase tracking-wider text-[var(--warm-50)]">
                Reporting nothing
              </div>
              <div className="mt-2 text-[28px] font-semibold tabular-nums">
                {silent.length} <span className="text-[15px] font-normal text-[var(--warm-50)]">of {working.length}</span>
              </div>
            </div>
          </div>

          <table className="mt-6 w-full text-[14px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.1em] text-[var(--warm-50)]">
                <th className="text-left font-semibold">Site</th>
                <th className="text-right font-semibold">7d</th>
                <th className="text-right font-semibold">28d</th>
                <th className="text-right font-semibold">90d</th>
                <th className="pl-4 text-right font-semibold">Week</th>
              </tr>
            </thead>
            <tbody>
              <Group name="Six Sigma" rows={rows.filter((r) => r.group === "Six Sigma")} />
              <Group name="2KO" rows={rows.filter((r) => r.group === "2KO")} />
              <Group name="Sigmafy" rows={rows.filter((r) => r.group === "Sigmafy")} />
            </tbody>
          </table>

          <p className="mt-8 text-[12px] leading-relaxed text-[var(--warm-50)]">
            Week compares the last 7 days against the prior 7-day average, and
            is hidden where the numbers are too small to mean anything.
            Search Console, Google Ads and Sigmafy panels are not here yet.
          </p>
        </>
      )}
    </main>
  );
}
