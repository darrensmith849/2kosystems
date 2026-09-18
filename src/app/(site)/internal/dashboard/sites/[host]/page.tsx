import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { accessToken } from "@/lib/dashboard/ga";
import { siteByHost, siteDetail, split, type Breakdown } from "@/lib/dashboard/site-detail";
import { searchDetail, searchSiteFor, type SearchDetail } from "@/lib/dashboard/gsc";
import { StatCard, BarList, Panel } from "@/components/dashboard/Charts";

/**
 * One site, in depth.
 *
 * Everything the overview cannot show for ten properties at once: where the
 * traffic comes from, what it lands on, who it is, and — for the two hosts
 * verified in Search Console — what people searched and how the position has
 * moved over ninety days.
 *
 * Panels fail independently. A property that errors does not take Search
 * Console with it, and a site with no search data says so rather than
 * rendering an empty chart that reads like zero traffic.
 */
export const dynamic = "force-dynamic";

const num = (n: number) => n.toLocaleString("en-ZA");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>;
}): Promise<Metadata> {
  const { host } = await params;
  const site = siteByHost(decodeURIComponent(host));
  return {
    title: site ? `${site.label} — Estate Dashboard` : "Site — Estate Dashboard",
    robots: { index: false, follow: false, nocache: true },
  };
}

function Demographic({
  title, rows, note,
}: {
  title: string;
  rows: Breakdown[];
  note: string;
}) {
  const { known, coverage, total } = split(rows);
  if (!total) {
    return (
      <Panel title={title}>
        <p className="text-[13px] leading-relaxed text-[var(--warm-50)]">
          No data. This needs Google Signals switched on for the property, and Google withholds
          it below a disclosure threshold.
        </p>
      </Panel>
    );
  }
  return (
    <Panel title={title} note={`${note} · ${pct(coverage)} identified`}>
      <BarList rows={known.map((r) => ({ label: r.label, value: r.users }))} tone="#c084fc" />
      {coverage < 0.5 && (
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--warm-50)]">
          Most visitors are unidentified, so read this as a shape rather than a count.
        </p>
      )}
    </Panel>
  );
}

/**
 * A page URL as a label. The path alone is not enough: Search Console reports
 * every origin separately, and this estate is indexed on apex *and* www, and
 * over http *and* https. Stripping the origin turns several distinct URLs into
 * the same repeated label, which hides the duplication instead of showing it.
 *
 * So only the canonical origin is stripped. Everything else keeps whatever
 * makes it different — a host, a scheme, or both.
 */
function pageLabel(url: string, canonicalHost: string) {
  try {
    const u = new URL(url);
    const path = u.pathname + u.search;
    if (u.host === canonicalHost && u.protocol === "https:") return path;
    const prefix = u.protocol === "https:" ? u.host : `${u.protocol}//${u.host}`;
    return `${prefix}${path}`;
  } catch {
    return url;
  }
}

function SearchSection({ s, canonicalHost }: { s: SearchDetail; canonicalHost: string }) {
  if (s.error) {
    return (
      <Panel title="Search">
        <p className="text-[13px] leading-relaxed text-amber-400">{s.error}</p>
      </Panel>
    );
  }
  // Position is better when lower, so the sparkline is inverted to keep "up
  // means good" true for every chart on the page.
  const positions = s.daily.map((d) => -d.position);
  const first = s.daily.slice(0, 14);
  const last = s.daily.slice(-14);
  const avg = (rows: typeof s.daily) =>
    rows.length ? rows.reduce((a, d) => a + d.position, 0) / rows.length : 0;
  const drift = first.length && last.length ? avg(first) - avg(last) : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clicks · 90 days" value={num(s.clicks)} tone="#60a5fa"
          spark={s.daily.map((d) => d.clicks)} />
        <StatCard label="Impressions · 90 days" value={num(s.impressions)} tone="#60a5fa"
          spark={s.daily.map((d) => d.impressions)} />
        <StatCard label="CTR" value={pct(s.ctr)} tone="#60a5fa" />
        <StatCard
          label="Average position"
          value={s.position.toFixed(1)}
          tone="#60a5fa"
          spark={positions}
          delta={
            Math.abs(drift) < 0.3
              ? { label: "steady", positive: true }
              : { label: `${drift > 0 ? "▲" : "▼"} ${Math.abs(drift).toFixed(1)}`, positive: drift > 0 }
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top queries" note="90 days, by clicks">
          <BarList
            rows={s.queries.slice(0, 15).map((q) => ({ label: q.query, value: q.clicks }))}
            tone="#60a5fa"
            sub={(_, i) => {
              const q = s.queries[i];
              return `${num(q.impressions)} impressions · ${pct(q.ctr)} · position ${q.position.toFixed(1)}`;
            }}
          />
        </Panel>
        <Panel title="Top pages" note="90 days, by clicks">
          <BarList
            rows={s.pages.map((p) => ({
              label: pageLabel(p.query, canonicalHost),
              value: p.clicks,
            }))}
            tone="#60a5fa"
            sub={(_, i) => {
              const p = s.pages[i];
              return `${num(p.impressions)} impressions · position ${p.position.toFixed(1)}`;
            }}
          />
        </Panel>
      </div>
    </>
  );
}

export default async function SitePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const site = siteByHost(decodeURIComponent(host));
  if (!site) notFound();

  // One token for both APIs, and the two fetches overlap rather than queue.
  let detail = null;
  let search: SearchDetail | null = null;
  let failure: string | null = null;
  const searchSite = searchSiteFor(site.host);

  try {
    const token = await accessToken();
    [detail, search] = await Promise.all([
      siteDetail(site, token),
      searchSite ? searchDetail(token, searchSite) : Promise.resolve(null),
    ]);
  } catch (e) {
    failure = e instanceof Error ? e.message : String(e);
  }

  const rate = detail && detail.sessions28 ? detail.engaged28 / detail.sessions28 : null;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-50)]">
            {site.group}
          </p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.02em]">{site.label}</h1>
          <p className="mt-1 text-[13px] text-[var(--warm-50)]">
            {site.host} · property {site.id} · {site.mid}
          </p>
        </div>
        <a
          href={`https://${site.host}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-white/15 px-3 py-2 text-[12px] text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          Open site ↗
        </a>
      </div>

      {(failure || detail?.error) && (
        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-[14px] text-amber-300">
          {failure ?? detail?.error}
        </div>
      )}

      {detail && !detail.error && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users · 28 days" value={num(detail.users28)}
              spark={detail.daily.map((d) => d.users)} />
            <StatCard label="Engaged sessions · 28 days" value={num(detail.engaged28)}
              spark={detail.daily.map((d) => d.engaged)} tone="#34d399" />
            <StatCard label="Sessions · 28 days" value={num(detail.sessions28)} />
            <StatCard
              label="Engagement rate"
              value={rate === null ? "—" : pct(rate)}
              tone={rate !== null && rate < 0.1 ? "#fbbf24" : "#34d399"}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Where they come from" note="Source / medium, 28 days">
              <BarList rows={detail.sources.map((r) => ({ label: r.label, value: r.users }))} />
            </Panel>
            <Panel title="What they land on" note="Landing page, 28 days">
              <BarList rows={detail.landing.map((r) => ({ label: r.label, value: r.users }))} />
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Demographic title="Age" rows={detail.age} note="28 days" />
            <Demographic title="Gender" rows={detail.gender} note="28 days" />
            <Panel title="Cities" note="28 days">
              <BarList rows={detail.cities.map((r) => ({ label: r.label, value: r.users }))} />
            </Panel>
          </div>
        </>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-[15px] font-semibold tracking-[-0.01em]">Search</h2>
        {search ? (
          <SearchSection s={search} canonicalHost={site.host} />
        ) : (
          <Panel title="No Search Console data">
            <p className="text-[13px] leading-relaxed text-[var(--warm-50)]">
              {site.host} is not a verified Search Console property, so there are no queries or
              positions for it. Verifying the domain takes a DNS record and backfills 16 months of
              history the moment it is done.
            </p>
          </Panel>
        )}
      </section>
    </>
  );
}
