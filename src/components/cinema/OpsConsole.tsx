"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { REQUESTS, type Request, type Status, type Step } from "@/lib/console-demo";

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

/** Deterministic avatar colour — same person, same colour, every render. */
const AVATAR_COLOURS = ["#4ec97c", "#e0a34a", "#6a8cff", "#d98cc4", "#59c8c3", "#c9b45a"];
function avatarColour(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_COLOURS[hash % AVATAR_COLOURS.length];
}
function initials(name: string) {
  const parts = name.replace(/\./g, " ").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, size = "md", state }: { name: string; size?: "md" | "sm"; state?: Step["state"] }) {
  const waiting = state === "waiting";
  return (
    <span
      className={`k-avatar${size === "sm" ? " k-avatar--sm" : ""}${waiting ? " k-avatar--waiting" : ""}${state === "active" ? " k-avatar--active" : ""}`}
      style={{ background: avatarColour(name) }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

/** Twelve-week trend, drawn small enough to sit inside a list row. */
function MiniTrend({ points, tone = "signal" }: { points: number[]; tone?: "signal" | "ember" }) {
  const w = 64;
  const h = 18;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * w).toFixed(1)},${(h - ((p - min) / span) * (h - 3) - 1.5).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" className="shrink-0">
      <path d={d} fill="none" stroke={tone === "ember" ? "var(--ember)" : "var(--signal)"} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

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

  /** Rand still waiting on a decision, and how many cleared this session. */
  const pendingValue = useMemo(
    () =>
      requests
        .filter((r) => r.status === "pending" || r.status === "escalated")
        .reduce((total, r) => total + r.value, 0),
    [requests],
  );

  const cleared = useMemo(
    () => 27 + requests.filter((r) => r.status === "approved").length - 1,
    [requests],
  );

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
          {/* Headline numbers, so the shape of the day reads before any text does */}
          <div className="flex border-b border-[var(--hair)]">
            <div className="k-tile">
              <p className="k-mono">Awaiting you</p>
              <p className="k-num mt-1 text-[20px] leading-none">{counts.queue}</p>
            </div>
            <div className="k-tile">
              <p className="k-mono">Value pending</p>
              <p className="k-num mt-1 text-[20px] leading-none">R{rand(pendingValue)}</p>
            </div>
            <div className="k-tile">
              <p className="k-mono">Avg. decision</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="k-num text-[20px] leading-none">4h 12m</span>
                <MiniTrend points={[52, 47, 44, 46, 38, 34, 31, 27, 24, 22, 19, 17]} />
              </div>
            </div>
            <div className="k-tile hidden sm:block">
              <p className="k-mono">Cleared today</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="k-num text-[20px] leading-none" style={{ color: "var(--signal)" }}>
                  {cleared}
                </span>
                <div className="k-bar-track flex-1">
                  <div className="k-bar-fill" style={{ width: `${Math.min(cleared * 3, 100)}%`, background: "var(--signal)" }} />
                </div>
              </div>
            </div>
          </div>

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
                  <Avatar name={request.raisedBy} size="sm" />
                  <span className="k-app-rowtitle">{request.title}</span>
                  <span className="k-pips hidden sm:inline-flex" title="Approval progress">
                    {request.chain.map((step, i) => (
                      <span key={i} className="k-pip" data-state={step.state} />
                    ))}
                  </span>
                  <span className="hidden lg:block">
                    <MiniTrend points={request.trend} tone={request.status === "escalated" ? "ember" : "signal"} />
                  </span>
                  <PriorityGlyph priority={request.priority} />
                  <span className="k-mono hidden w-[52px] shrink-0 text-right tabular-nums sm:inline">
                    {request.value ? `R${Math.round(request.value / 1000)}k` : "—"}
                  </span>
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

              <p className="mt-2.5 text-[15px] font-medium leading-snug tracking-[-0.015em]">
                {selected.title}
              </p>

              {/* The number first, before any prose */}
              {selected.value > 0 && (
                <p className="k-num mt-4 text-[30px] leading-none">R{rand(selected.value)}</p>
              )}
              <p className="k-mono mt-1.5">
                {selected.category} · {selected.site}
              </p>

              {/* Who still has to touch it, and how far along it is */}
              <p className="k-mono mt-5">Approval chain</p>
              <div className="k-chain mt-2.5">
                {selected.chain.map((step, i) => (
                  <Fragment key={`${step.who}-${i}`}>
                    {i > 0 && (
                      <span
                        className="k-chain-link"
                        data-done={selected.chain[i - 1].state === "done"}
                      />
                    )}
                    <Avatar name={step.who} state={step.state} />
                  </Fragment>
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                <span className="k-mono">{selected.raisedBy} raised</span>
                <span className="k-mono">
                  {selected.chain.filter((c) => c.state === "done").length}/
                  {selected.chain.length} cleared
                </span>
              </div>

              {/* Trend on the metric this request moves */}
              <p className="k-mono mt-5">Twelve-week trend</p>
              <div className="mt-2">
                <MiniTrend
                  points={selected.trend}
                  tone={selected.status === "escalated" ? "ember" : "signal"}
                />
              </div>

              <p className="k-mono mt-5">Activity</p>
              <ol className="mt-2.5 flex flex-col gap-2">
                {selected.trail.slice(-3).map((entry, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11.5px] leading-[1.4]">
                    <span
                      className="mt-[5px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
                      style={{
                        background:
                          entry.tone === "good"
                            ? "var(--signal)"
                            : entry.tone === "warn"
                              ? "var(--ember)"
                              : entry.tone === "bad"
                                ? "var(--alert)"
                                : "var(--warm-25)",
                      }}
                    />
                    <span style={{ color: "var(--warm-70)" }}>{entry.what}</span>
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
