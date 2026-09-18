import type { Metadata } from "next";
import { trafficBySite, dashboardConfigured, type SiteTraffic } from "@/lib/dashboard/ga";
import { searchBySite, type SearchSummary } from "@/lib/dashboard/gsc";
import { StatCard, BarList, Panel, Sparkline } from "@/components/dashboard/Charts";

/**
 * Internal estate dashboard.
 *
 * Ten GA4 properties across three accounts plus two Search Console properties,
 * on one screen. force-dynamic because the point is current numbers, and there
 * is no KV binding on this Worker to cache into.
 *
 * Every panel degrades on its own: a property that errors shows its error, and
 * Search Console failing does not take the traffic panels with it. A zero and
 * a failure look identical otherwise, and this estate has produced plenty of
 * both.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estate Dashboard",
  description: "Traffic, search and enquiries across every 2KO property.",
  robots: { index: false, follow: false, nocache: true },
};

const num = (n: number) => n.toLocaleString("en-ZA");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/** Last 7 days against the prior 7-day average. Null when too small to mean anything. */
function weekDelta(users7: number, users28: number) {
  const prior = (users28 - users7) / 3;
  if (prior < 5) return null;
  const change = Math.round(((users7 - prior) / prior) * 100);
  if (Math.abs(change) < 10) return { label: "steady", positive: true };
  return { label: `${change > 0 ? "+" : ""}${change}%`, positive: change > 0 };
}

function SiteRow({ s }: { s: SiteTraffic }) {
  const d = s.error ? null : weekDelta(s.users7, s.users28);
  return (
    <tr className="border-t border-white/[0.07]">
      <td className="py-3 pr-4">
        <div className="text-[14px] font-medium">{s.label}</div>
        <div className="text-[11px] text-[var(--warm-50)]">{s.host}</div>
      </td>
      {s.error ? (
        <td colSpan={5} className="py-3 text-[12px] text-amber-400">{s.error}</td>
      ) : (
        <>
          <td className="py-3 w-[110px]">
            {s.daily.length > 1 ? <Sparkline values={s.daily} width={100} height={26} /> : <span className="text-[11px] text-[var(--warm-50)]">—</span>}
          </td>
          <td className="py-3 text-right tabular-nums text-[14px]">{num(s.users7)}</td>
          <td className="py-3 text-right tabular-nums text-[14px]">{num(s.users28)}</td>
          <td className="py-3 text-right tabular-nums text-[14px]">{num(s.users90)}</td>
          <td className={`py-3 pl-4 text-right text-[12px] tabular-nums ${d ? (d.positive ? "text-emerald-400" : "text-amber-400") : "text-[var(--warm-50)]"}`}>
            {d?.label ?? "—"}
          </td>
        </>
      )}
    </tr>
  );
}

function SearchPanel({ s }: { s: SearchSummary }) {
  if (s.error) {
    // Some of these errors end in the URL that fixes them. Make it clickable.
    const [text, href] = s.error.split(/(https?:\/\/\S+)/).filter(Boolean);
    return (
      <Panel title={`Search — ${s.site.label}`}>
        <p className="text-[13px] leading-relaxed text-amber-400">
          {text}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-amber-300"
            >
              open Google Cloud console
            </a>
          )}
        </p>
      </Panel>
    );
  }
  return (
    <Panel
      title={`Search — ${s.site.label}`}
      note={`${num(s.clicks)} clicks from ${num(s.impressions)} impressions · ${pct(s.ctr)} CTR · avg position ${s.position.toFixed(1)}`}
    >
      {s.daily.length > 1 && (
        <div className="mb-5">
          <Sparkline values={s.daily.map((d) => d.clicks)} width={420} height={44} tone="#60a5fa" />
        </div>
      )}
      <BarList
        rows={s.topQueries.map((q) => ({ label: q.query, value: q.clicks }))}
        tone="#60a5fa"
        sub={(_, i) => {
          const q = s.topQueries[i];
          return `${num(q.impressions)} impressions · position ${q.position.toFixed(1)}`;
        }}
      />
    </Panel>
  );
}

export default async function DashboardPage() {
  if (!dashboardConfigured()) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-24">
        <h1 className="text-[28px] font-semibold">Estate dashboard</h1>
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--warm-70)]">
          Analytics credentials are not set on this Worker. Run{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">npm run cf:secrets</code> and redeploy.
        </p>
      </main>
    );
  }

  let sites: SiteTraffic[] = [];
  let search: SearchSummary[] = [];
  let failure: string | null = null;

  try {
    const { token, sites: rows } = await trafficBySite();
    sites = rows;
    // Reuses the access token from the traffic call rather than exchanging
    // again, and never takes the page down if Search Console is unavailable.
    search = await searchBySite(token);
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  const ok = sites.filter((s) => !s.error);
  const total7 = ok.reduce((a, s) => a + s.users7, 0);
  const total28 = ok.reduce((a, s) => a + s.users28, 0);
  const leads28 = ok.reduce((a, s) => a + s.leads, 0);
  const silent = ok.filter((s) => s.users28 === 0);
  const searchOk = search.filter((s) => !s.error);
  const searchClicks = searchOk.reduce((a, s) => a + s.clicks, 0);

  // Daily totals across the estate, for the headline sparkline. Properties
  // report different day counts, so align on the longest series.
  const span = Math.max(0, ...ok.map((s) => s.daily.length));
  const estateDaily = Array.from({ length: span }, (_, i) =>
    ok.reduce((a, s) => a + (s.daily[s.daily.length - span + i] ?? 0), 0),
  );

  return (
    <main className="mx-auto max-w-[1240px] px-6 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-50)]">Internal</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.02em]">Estate dashboard</h1>
        </div>
        <p className="text-[12px] text-[var(--warm-50)]">
          Live from the GA4 and Search Console APIs · {new Date().toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      {failure && (
        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-[14px] text-amber-300">
          {failure}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users · 28 days" value={num(total28)} delta={weekDelta(total7, total28)} spark={estateDaily} />
        <StatCard label="Users · 7 days" value={num(total7)} />
        <StatCard label="Enquiries · 28 days" value={num(leads28)} tone="#34d399" />
        <StatCard label="Search clicks · 28 days" value={num(searchClicks)} tone="#60a5fa" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {search.map((s) => (
          <SearchPanel key={s.site.host} s={s} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Enquiries by site" note="generate_lead events, last 28 days">
          <BarList
            rows={ok.filter((s) => s.leads > 0).map((s) => ({ label: s.label, value: s.leads }))}
            tone="#34d399"
          />
          {ok.every((s) => s.leads === 0) && (
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--warm-50)]">
              Only sites firing a <code>generate_lead</code> event appear here.
            </p>
          )}
        </Panel>

        <Panel title="Busiest sites" note="Active users, last 28 days" wide>
          <BarList rows={ok.slice(0, 8).map((s) => ({ label: s.label, value: s.users28 }))} />
        </Panel>
      </div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Every property</h2>
          <p className="text-[12px] text-[var(--warm-50)]">
            {silent.length} of {ok.length} reporting nothing
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.1em] text-[var(--warm-50)]">
                <th className="text-left font-semibold">Site</th>
                <th className="text-left font-semibold">28-day trend</th>
                <th className="text-right font-semibold">7d</th>
                <th className="text-right font-semibold">28d</th>
                <th className="text-right font-semibold">90d</th>
                <th className="pl-4 text-right font-semibold">Week</th>
              </tr>
            </thead>
            <tbody>
              {(["Six Sigma", "2KO", "Sigmafy"] as const).map((group) => {
                const rows = sites.filter((s) => s.group === group);
                if (!rows.length) return null;
                return (
                  <tr key={group}>
                    <td colSpan={6} className="p-0">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <th colSpan={6} className="pt-6 pb-1 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-50)]">
                              {group}
                            </th>
                          </tr>
                          {rows.map((s) => <SiteRow key={s.id} s={s} />)}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-[var(--warm-50)]">
          Week compares the last 7 days against the prior 7-day average, hidden where the numbers are too small to mean
          anything. Identical figures across 7d, 28d and 90d mean the property only started reporting recently. Search
          Console lags roughly two days. Google Ads and Sigmafy panels are not here yet.
        </p>
      </section>
    </main>
  );
}
