"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { REQUESTS, type Request, type Status } from "@/lib/console-demo";

/**
 * A working operations console, embedded in the page.
 *
 * Not a screenshot and not a mock-up: the list filters, the selection changes,
 * approving a request moves it between views, updates the counts and writes a
 * new line to its audit trail — the same behaviour we build into the real
 * thing. Records are invented for the demo.
 */

/**
 * Deterministic thousands separator. `toLocaleString` resolves differently on
 * the server and in the browser, which produced a hydration mismatch — the
 * formatting has to be identical in both places.
 */
const rand = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const STATUS_META: Record<Status, { label: string; colour: string }> = {
  pending: { label: "Pending", colour: "var(--ember)" },
  escalated: { label: "Escalated", colour: "var(--alert)" },
  approved: { label: "Approved", colour: "var(--signal)" },
  declined: { label: "Declined", colour: "var(--warm-25)" },
};

const PRIORITY_BARS: Record<Request["priority"], number> = { urgent: 3, high: 2, normal: 1 };

type View = "queue" | "all" | "escalated";

const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: "queue", label: "My queue", hint: "Awaiting your decision" },
  { id: "escalated", label: "Escalated", hint: "Past threshold" },
  { id: "all", label: "All requests", hint: "Everything this week" },
];

function StatusDot({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ background: meta.colour }}
      aria-label={meta.label}
    />
  );
}

function PriorityGlyph({ priority }: { priority: Request["priority"] }) {
  const filled = PRIORITY_BARS[priority];
  return (
    <span className="flex items-end gap-[2px]" title={priority}>
      {[3, 6, 9].map((h, i) => (
        <span
          key={h}
          style={{
            width: 2.5,
            height: h,
            borderRadius: 1,
            background: i < filled ? "var(--warm-70)" : "var(--warm-25)",
          }}
        />
      ))}
    </span>
  );
}

export default function OpsConsole() {
  const [requests, setRequests] = useState<Request[]>(REQUESTS);
  const [view, setView] = useState<View>("queue");
  const [selectedId, setSelectedId] = useState<string>(REQUESTS[0].id);
  const [flash, setFlash] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (view === "queue") return requests.filter((r) => r.status === "pending" || r.status === "escalated");
    if (view === "escalated") return requests.filter((r) => r.status === "escalated");
    return requests;
  }, [requests, view]);

  const selected = requests.find((r) => r.id === selectedId) ?? visible[0] ?? requests[0];

  const counts = useMemo(
    () => ({
      queue: requests.filter((r) => r.status === "pending" || r.status === "escalated").length,
      escalated: requests.filter((r) => r.status === "escalated").length,
      all: requests.length,
    }),
    [requests],
  );

  const decide = useCallback(
    (id: string, decision: "approved" | "declined") => {
      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? {
                ...request,
                status: decision,
                trail: [
                  ...request.trail,
                  {
                    at: "Just now",
                    who: "You",
                    what:
                      decision === "approved"
                        ? `Approved${request.value ? ` · R${rand(request.value)}` : ""}`
                        : "Declined · reason required on the real thing",
                    tone: decision === "approved" ? ("good" as const) : ("bad" as const),
                  },
                  ...(decision === "approved"
                    ? [{ at: "Just now", who: "System", what: "Owner notified · action queued", tone: "good" as const }]
                    : []),
                ],
              }
            : request,
        ),
      );
      setFlash(decision === "approved" ? "Approved — audit trail updated" : "Declined — audit trail updated");
      window.setTimeout(() => setFlash(null), 2600);
    },
    [],
  );

  // Keyboard: A approves, D declines, J/K move through the list.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!selected) return;

      const decidable = selected.status === "pending" || selected.status === "escalated";
      if (event.key.toLowerCase() === "a" && decidable) decide(selected.id, "approved");
      if (event.key.toLowerCase() === "d" && decidable) decide(selected.id, "declined");
      if (["j", "k"].includes(event.key.toLowerCase())) {
        const i = visible.findIndex((r) => r.id === selected.id);
        const next = event.key.toLowerCase() === "j" ? i + 1 : i - 1;
        if (visible[next]) setSelectedId(visible[next].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, visible, decide]);

  const decidable = selected && (selected.status === "pending" || selected.status === "escalated");

  return (
    <div className="k-app">
      {/* ── Title bar ── */}
      <div className="k-app-bar">
        <div className="flex items-center gap-2">
          <span className="k-app-dot" style={{ background: "#e5534b" }} />
          <span className="k-app-dot" style={{ background: "#e8a33d" }} />
          <span className="k-app-dot" style={{ background: "#3fb950" }} />
        </div>
        <span className="k-mono">Rustenburg Operations · demo</span>
        <span className="k-mono hidden sm:inline">
          <kbd className="k-kbd">A</kbd> approve <kbd className="k-kbd">D</kbd> decline{" "}
          <kbd className="k-kbd">J</kbd>/<kbd className="k-kbd">K</kbd> move
        </span>
      </div>

      <div className="k-app-body">
        {/* ── Sidebar ── */}
        <aside className="k-app-side">
          <div className="flex h-[30px] items-center gap-2 px-1.5">
            <span className="k-app-mark">2K</span>
            <span className="text-[13px] font-medium">Rustenburg Ops</span>
          </div>

          <nav className="mt-2 flex flex-col gap-[1px]">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className="k-app-nav"
                data-active={view === item.id}
              >
                <span>{item.label}</span>
                <span className="k-mono tabular-nums">{counts[item.id]}</span>
              </button>
            ))}
          </nav>

          <p className="k-mono mt-5 px-1.5">Sites</p>
          <nav className="mt-1.5 flex flex-col gap-[1px]">
            {["Rustenburg", "Steelpoort", "Mokopane", "Central"].map((site) => (
              <span key={site} className="k-app-nav" data-static="true">
                <span>{site}</span>
                <span className="k-mono tabular-nums">
                  {requests.filter((r) => r.site === site).length}
                </span>
              </span>
            ))}
          </nav>

          <div className="mt-auto px-1.5 pb-2">
            <p className="k-mono">Avg. to decision</p>
            <p className="mt-1 text-[19px] font-medium tabular-nums tracking-[-0.02em]">4h 12m</p>
          </div>
        </aside>

        {/* ── List ── */}
        <div className="k-app-list">
          <div className="k-app-listhead">
            <span className="k-mono">{VIEWS.find((v) => v.id === view)?.hint}</span>
            <span className="k-mono tabular-nums">{visible.length}</span>
          </div>

          <ul className="flex flex-col">
            {visible.map((request) => (
              <li key={request.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(request.id)}
                  className="k-app-row"
                  data-selected={selected?.id === request.id}
                >
                  <StatusDot status={request.status} />
                  <span className="k-mono shrink-0 tabular-nums">{request.id}</span>
                  <span className="k-app-rowtitle">{request.title}</span>
                  <PriorityGlyph priority={request.priority} />
                  <span className="k-mono hidden shrink-0 tabular-nums sm:inline">{request.age}</span>
                </button>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-4 py-10 text-center">
                <p className="k-sm">Queue clear. Nothing is waiting on you.</p>
              </li>
            )}
          </ul>
        </div>

        {/* ── Detail ── */}
        <section className="k-app-detail">
          {selected && (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="k-mono tabular-nums">{selected.id}</span>
                <span
                  className="k-mono inline-flex items-center gap-1.5 rounded-md px-2 py-1"
                  style={{
                    color: STATUS_META[selected.status].colour,
                    border: `1px solid ${STATUS_META[selected.status].colour}`,
                  }}
                >
                  {STATUS_META[selected.status].label}
                </span>
              </div>

              <h3 className="mt-2.5 text-[15px] font-medium leading-snug tracking-[-0.015em]">
                {selected.title}
              </h3>
              <p className="k-sm mt-2.5 text-[12.5px]">{selected.detail}</p>

              <dl className="mt-4 flex flex-col gap-0">
                {[
                  ["Category", selected.category],
                  ["Site", selected.site],
                  ["Raised by", selected.raisedBy],
                  ["Value", selected.value ? `R${rand(selected.value)}` : "—"],
                  ["Age", selected.age],
                ].map(([label, value]) => (
                  <div key={label} className="flex h-[24px] items-center justify-between">
                    <dt className="k-mono">{label}</dt>
                    <dd className="text-[12.5px] tabular-nums" style={{ color: "var(--warm-70)" }}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="k-mono mt-5">Audit trail</p>
              <ol className="mt-2.5 flex flex-col gap-2">
                {selected.trail.map((entry, i) => (
                  <li key={i} className="flex gap-2.5 text-[11.5px] leading-relaxed">
                    <span className="k-mono shrink-0 tabular-nums" style={{ minWidth: 62 }}>
                      {entry.at}
                    </span>
                    <span
                      style={{
                        color:
                          entry.tone === "good"
                            ? "var(--signal)"
                            : entry.tone === "warn"
                              ? "var(--ember)"
                              : entry.tone === "bad"
                                ? "var(--alert)"
                                : "var(--warm-70)",
                      }}
                    >
                      <b style={{ color: "var(--warm-45)", fontWeight: 500 }}>{entry.who}</b> · {entry.what}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto pt-6">
                {decidable ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => decide(selected.id, "approved")}
                      className="k-app-btn k-app-btn--go"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(selected.id, "declined")}
                      className="k-app-btn"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <p className="k-mono">Closed · no action available</p>
                )}
                {flash && (
                  <p className="k-mono mt-3" style={{ color: "var(--signal)" }}>
                    {flash}
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
