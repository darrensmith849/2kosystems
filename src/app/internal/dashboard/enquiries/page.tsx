import type { Metadata } from "next";
import { listEnquiries, enquiryStats, NoDatabase } from "@/lib/enquiries/store";
import type { EnquiryStats } from "@/lib/enquiries/store";
import type { EnquiryRow } from "@/lib/enquiries/schema";
import { StatCard, BarList, Panel } from "@/components/dashboard/Charts";
import { SITES } from "@/lib/dashboard/sites";

/**
 * Every enquiry the estate has taken since it had somewhere to put them.
 *
 * GA4 can tell you 284 `generate_lead` events fired. It cannot tell you who,
 * about what, from which campaign, or whether anyone replied. This can, and it
 * is the only place in the estate that can.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enquiries — Estate Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

const num = (n: number) => n.toLocaleString("en-ZA");

const LABELS = new Map(SITES.map((s) => [s.host, s.label]));
const labelFor = (host: string) => LABELS.get(host) ?? host;

function when(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  const stamp = d.toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
  if (days === 0) return `Today · ${d.toLocaleTimeString("en-ZA", { timeStyle: "short" })}`;
  if (days === 1) return `Yesterday · ${d.toLocaleTimeString("en-ZA", { timeStyle: "short" })}`;
  return stamp;
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "new"
      ? "bg-amber-400/15 text-amber-300"
      : status === "responded"
        ? "bg-emerald-400/15 text-emerald-300"
        : "bg-white/10 text-[var(--warm-45)]";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${tone}`}>
      {status}
    </span>
  );
}

function Enquiry({ e }: { e: EnquiryRow }) {
  const campaign = [e.utm_source, e.utm_medium, e.utm_campaign].filter(Boolean).join(" / ");
  return (
    <li className="border-t border-white/[0.07] py-4 first:border-t-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] font-medium">{e.name ?? "(no name)"}</span>
          {e.company && <span className="text-[13px] text-[var(--warm-70)]">· {e.company}</span>}
          <StatusPill status={e.status} />
        </div>
        <span className="text-[11px] text-[var(--warm-45)]">{when(e.received_at)}</span>
      </div>

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--warm-45)]">
        <span>{labelFor(e.site)}</span>
        <span>·</span>
        <span>{e.kind}</span>
        {e.email && (
          <>
            <span>·</span>
            <a href={`mailto:${e.email}`} className="underline-offset-2 hover:text-white/80 hover:underline">
              {e.email}
            </a>
          </>
        )}
        {e.phone && (
          <>
            <span>·</span>
            <span>{e.phone}</span>
          </>
        )}
        {e.country && (
          <>
            <span>·</span>
            <span>{e.country}</span>
          </>
        )}
      </div>

      {(e.subject || e.message) && (
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[var(--warm-70)]">
          {e.subject && <span className="font-medium">{e.subject}. </span>}
          {e.message}
        </p>
      )}

      {(campaign || e.course_topic || e.source_page) && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--warm-45)]">
          {e.course_topic && <span>{e.course_topic}{e.course_mode ? ` · ${e.course_mode}` : ""}</span>}
          {campaign && <span>{campaign}</span>}
          {e.source_page && <span>{e.source_page}</span>}
        </div>
      )}
    </li>
  );
}

function Empty() {
  return (
    <Panel title="Nothing recorded yet">
      <div className="space-y-3 text-[13px] leading-relaxed text-[var(--warm-45)]">
        <p>
          The database exists and is empty, which is correct — it was created today and only counts
          enquiries submitted from here on. It does not backfill.
        </p>
        <p>
          Until each site is wired to post here, its enquiries continue to exist only as email.
          2ko.co.za writes directly; sixsigmasouthafrica.co.za and sixsigmauk.com post to{" "}
          <code className="text-[var(--warm-70)]">/api/enquiries</code> with the shared ingest token.
        </p>
      </div>
    </Panel>
  );
}

export default async function EnquiriesPage() {
  let rows: EnquiryRow[] = [];
  let stats: EnquiryStats | null = null;
  let failure: string | null = null;

  try {
    [rows, stats] = await Promise.all([listEnquiries({ limit: 100 }), enquiryStats()]);
  } catch (e) {
    failure =
      e instanceof NoDatabase
        ? "The enquiries database is not bound on this Worker. Deploy with the D1 binding in wrangler.jsonc."
        : e instanceof Error
          ? e.message
          : String(e);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--warm-45)]">
            Estate
          </p>
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.02em]">Enquiries</h1>
          <p className="mt-1 text-[13px] text-[var(--warm-45)]">
            Every enquiry the estate has taken, across all sites
          </p>
        </div>
      </div>

      {failure && (
        <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-[14px] text-amber-300">
          {failure}
        </div>
      )}

      {stats && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Last 28 days"
              value={num(stats.last28)}
              tone="#34d399"
              spark={stats.daily.map((d) => d.count)}
            />
            <StatCard label="Last 7 days" value={num(stats.last7)} tone="#34d399" />
            <StatCard
              label="Awaiting a reply"
              value={num(stats.awaiting)}
              tone={stats.awaiting > 0 ? "#fbbf24" : "#34d399"}
            />
            <StatCard label="All time" value={num(stats.total)} />
          </div>

          {stats.total > 0 && (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Panel title="By site" note="Last 28 days">
                <BarList
                  rows={stats.bySite.map((r) => ({ label: labelFor(r.site), value: r.count }))}
                  tone="#34d399"
                />
              </Panel>
              <Panel title="By type" note="Last 28 days">
                <BarList
                  rows={stats.byKind.map((r) => ({ label: r.kind, value: r.count }))}
                  tone="#34d399"
                />
              </Panel>
              <Panel title="Companies" note="Last 90 days, self-reported">
                <BarList
                  rows={stats.byCompany.map((r) => ({ label: r.company, value: r.count }))}
                  tone="#c084fc"
                />
              </Panel>
            </div>
          )}
        </>
      )}

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
          Latest{rows.length ? ` · ${rows.length}` : ""}
        </h2>
        {rows.length ? (
          <ul className="mt-2">
            {rows.map((e) => (
              <Enquiry key={e.id} e={e} />
            ))}
          </ul>
        ) : (
          !failure && <div className="mt-4"><Empty /></div>
        )}
      </section>
    </>
  );
}
