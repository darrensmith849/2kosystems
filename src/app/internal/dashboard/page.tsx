import type { Metadata } from "next";
import {
  trafficBySite,
  dashboardConfigured,
  engagementRate,
  looksAutomated,
  type SiteTraffic,
} from "@/lib/dashboard/ga";
import { searchBySite, type SearchSummary } from "@/lib/dashboard/gsc";
import { emailQuota, quotaUse, hoursUntilReset, type EmailQuota } from "@/lib/dashboard/email-quota";
import { stamp } from "@/lib/dashboard/when";
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
  const rate = engagementRate(s);
  const automated = looksAutomated(s);
  return (
    <tr className="border-t border-white/[0.07]">
      <td className="py-3 pr-4">
        <div className="text-[14px] font-medium">{s.label}</div>
        <div className="text-[11px] text-[var(--warm-45)]">{s.host}</div>
      </td>
      {s.error ? (
        <td colSpan={6} className="py-3 text-[12px] text-amber-400">{s.error}</td>
      ) : (
        <>
          <td className="py-3">
            {s.daily.length > 1 ? <Sparkline values={s.daily} width={100} height={26} /> : <span className="text-[11px] text-[var(--warm-45)]">—</span>}
          </td>
          <td className="py-3 text-right tabular-nums text-[14px]">{num(s.users7)}</td>
          <td className="py-3 text-right tabular-nums text-[14px]">{num(s.users28)}</td>
          <td className="py-3 text-right tabular-nums text-[14px]">{num(s.users90)}</td>
          <td className="py-3 text-right tabular-nums text-[14px]">
            {num(s.engaged28)}
            {rate !== null && (
              <div className={`text-[11px] ${automated ? "text-amber-400" : "text-[var(--warm-45)]"}`}>
                {automated && "⚠ "}
                {pct(rate)}
              </div>
            )}
          </td>
          <td className={`py-3 pl-4 text-right text-[12px] tabular-nums ${d ? (d.positive ? "text-emerald-400" : "text-amber-400") : "text-[var(--warm-45)]"}`}>
            {d?.label ?? "—"}
          </td>
        </>
      )}
    </tr>
  );
}

/**
 * Email sending headroom.
 *
 * The cap is per ACCOUNT, so this one number governs every domain at once —
 * Sigmafy's transactional mail, 2ko.co.za's enquiries and sixsigmauk.com's
 * alike. Sigmafy on its own peaked at 208/day in the month before it moved,
 * which is why this sits on the overview rather than buried on a site page.
 */
function QuotaPanel({ q }: { q: EmailQuota }) {
  if (q.error) {
    return (
      <Panel title="Email sending quota">
        <p className="text-[13px] leading-relaxed text-amber-400">{q.error}</p>
      </Panel>
    );
  }

  const use = quotaUse(q);
  const hours = hoursUntilReset(q);
  // Amber well before the cliff: at 75% a single busy hour can finish it.
  const tone = q.overQuota || (use ?? 0) >= 1 ? "#f87171" : (use ?? 0) >= 0.75 ? "#fbbf24" : "#34d399";

  return (
    <Panel
      title="Email sending quota"
      note={`Cloudflare, account-wide${hours !== null ? ` · resets in ${hours.toFixed(1)}h` : ""}`}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[30px] font-semibold leading-none tabular-nums" style={{ color: tone }}>
          {num(q.sent)}
        </span>
        <span className="text-[15px] text-[var(--warm-45)]">/ {num(q.limit)} today</span>
      </div>
      <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${Math.min(100, Math.max(1.5, (use ?? 0) * 100))}%`, background: tone }}
        />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--warm-45)]">
        {q.overQuota
          ? "Quota exhausted — sends are being refused across every domain until the reset."
          : "One counter for the whole account. Sigmafy, 2KO and the UK site all draw on it, so a busy day on one stops the others."}
      </p>
    </Panel>
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

  // Cloudflare's quota is a different API on a different credential, so it runs
  // alongside rather than inside the analytics try — neither can take the other
  // down.
  const quotaPromise = emailQuota();

  try {
    const { token, sites: rows } = await trafficBySite();
    sites = rows;
    // Reuses the access token from the traffic call rather than exchanging
    // again, and never takes the page down if Search Console is unavailable.
    search = await searchBySite(token);
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  const quota = await quotaPromise;

  const ok = sites.filter((s) => !s.error);
  const total7 = ok.reduce((a, s) => a + s.users7, 0);
  const total28 = ok.reduce((a, s) => a + s.users28, 0);
  const engaged28 = ok.reduce((a, s) => a + s.engaged28, 0);
  const flooded = ok.filter(looksAutomated);
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
  const estateEngaged = Array.from({ length: span }, (_, i) =>
    ok.reduce((a, s) => a + (s.dailyEngaged[s.dailyEngaged.length - span + i] ?? 0), 0),
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-45)]">Internal</p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.02em]">Estate dashboard</h1>
        </div>
        <p className="text-[12px] text-[var(--warm-45)]">
          Live from the GA4 and Search Console APIs · {stamp(new Date())}
        </p>
      </div>

      {failure && (
        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-[14px] text-amber-300">
          {failure}
        </div>
      )}

      {flooded.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
          <p className="text-[13px] font-semibold text-amber-300">
            Automated traffic on {flooded.map((s) => s.label).join(", ")}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-200/80">
            Real session volume, almost none of it engaged. Read the engaged column, not the user counts — GA4 cannot
            filter this retrospectively, so the raw figures stay inflated for as long as the flood runs.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Engaged sessions · 28 days" value={num(engaged28)} spark={estateEngaged} />
        <StatCard label="Users · 28 days" value={num(total28)} delta={weekDelta(total7, total28)} spark={estateDaily} />
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
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--warm-45)]">
              Only sites firing a <code>generate_lead</code> event appear here.
            </p>
          )}
        </Panel>

        <QuotaPanel q={quota} />

        <Panel title="Busiest sites" note="Engaged sessions, last 28 days">
          <BarList rows={ok.slice(0, 8).map((s) => ({ label: s.label, value: s.engaged28 }))} />
        </Panel>
      </div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Every property</h2>
          <p className="text-[12px] text-[var(--warm-45)]">
            {silent.length} of {ok.length} reporting nothing
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed">
            {/* Pinned widths. Without these the columns size to content, so a
                property with a six-figure number widens its own column and the
                groups stop lining up with each other. */}
            <colgroup>
              <col />
              <col className="w-[120px]" />
              <col className="w-[80px]" />
              <col className="w-[80px]" />
              <col className="w-[80px]" />
              <col className="w-[104px]" />
              <col className="w-[80px]" />
            </colgroup>
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.1em] text-[var(--warm-45)]">
                <th className="text-left font-semibold">Site</th>
                <th className="text-left font-semibold">28-day trend</th>
                <th className="text-right font-semibold">7d</th>
                <th className="text-right font-semibold">28d</th>
                <th className="text-right font-semibold">90d</th>
                <th className="text-right font-semibold">Engaged 28d</th>
                <th className="pl-4 text-right font-semibold">Week</th>
              </tr>
            </thead>
            {/* One tbody per group rather than a nested table per group. A
                nested table computes its own column widths, which is why the
                three groups used to sit at three different alignments. */}
            {(["Six Sigma", "2KO", "Sigmafy"] as const).map((group) => {
              const rows = sites.filter((s) => s.group === group);
              if (!rows.length) return null;
              return (
                <tbody key={group}>
                  <tr>
                    <th colSpan={7} className="pt-6 pb-1 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-45)]">
                      {group}
                    </th>
                  </tr>
                  {rows.map((s) => <SiteRow key={s.id} s={s} />)}
                </tbody>
              );
            })}
          </table>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-[var(--warm-45)]">
          Engaged 28d counts sessions lasting over 10 seconds, converting, or reaching a second page, with the share of
          all sessions below it. It is the figure to trust: automated traffic inflates users and leaves engagement
          untouched. Below 10% on real volume is flagged. Week compares the last 7 days against the prior 7-day average,
          hidden where the numbers are too small to mean anything. Identical figures across 7d, 28d and 90d mean the property only started reporting recently. Search
          Console lags roughly two days. Google Ads and Sigmafy panels are not here yet.
        </p>
      </section>
    </>
  );
}
