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
    <div className="k-app k-ops">
      {/* ── Title bar ── */}
      <div className="k-app-bar">
        <div className="flex items-center gap-2">
          <span className="k-app-dot" style={{ background: "#e5534b" }} />
          <span className="k-app-dot" style={{ background: "#d9a95a" }} />
          <span className="k-app-dot" style={{ background: "#3fb950" }} />
        </div>
        <span className="k-mono">Approval control · Rustenburg Operations</span>
        <span className="k-mono hidden sm:inline">
          <kbd className="k-kbd">A</kbd> approve <kbd className="k-kbd">D</kbd> decline{" "}
          <kbd className="k-kbd">J</kbd>/<kbd className="k-kbd">K</kbd> move
        </span>
      </div>

      <div className="k-app-body">
        {/* ── Sidebar ── */}
        <aside className="k-app-side">
          <div className="k-ops-brand">
            <span className="k-app-mark">2K</span>
            <span>Operations OS<small>Decision workspace</small></span>
          </div>

          <p className="k-mono mt-5 px-1.5">Workspace</p>
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

          <div className="k-ops-sidecard">
            <div><span>CONTROL HEALTH</span><b>On target</b></div>
            <strong>4h 12m</strong>
            <p>Average decision time</p>
            <i><span style={{ width: "72%" }} /></i>
            <small>Target · under 6 hours</small>
          </div>
        </aside>

        {/* ── List ── */}
        <div className="k-app-list">
          {/* Headline numbers, so the shape of the day reads before any text does */}
          <div className="k-ops-metrics">
            <div className="k-tile">
              <p className="k-mono">Awaiting you</p>
              <p className="k-num mt-1 text-[20px] leading-none">{String(counts.queue).padStart(2, "0")}</p>
              <span>1 past threshold</span>
            </div>
            <div className="k-tile">
              <p className="k-mono">Value pending</p>
              <p className="k-num mt-1 text-[20px] leading-none">R{rand(pendingValue)}</p>
              <span>3 financial decisions</span>
            </div>
            <div className="k-tile">
              <p className="k-mono">Avg. decision</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="k-num text-[20px] leading-none">4h 12m</span>
                <span className="k-ops-target"><i /><b>6h</b></span>
              </div>
              <span data-tone="good">↓ 38% this quarter</span>
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
              <span data-tone="good">92% within target</span>
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
                  <span className="k-app-rowtitle"><span>{request.title}</span><small>{request.category} · {request.age}</small></span>
                  <span className="k-pips hidden sm:inline-flex" title="Approval progress">
                    {request.chain.map((step, i) => (
                      <span key={i} className="k-pip" data-state={step.state} />
                    ))}
                  </span>
                  <span className="k-ops-row-age hidden lg:inline-flex" data-state={request.status}>{request.age}</span>
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

          {selected && (
            <div className="k-ops-brief">
              <article>
                <header><span>DECISION BRIEF</span><b>{selected.id}</b></header>
                <p>{selected.detail}</p>
                <div className="k-ops-brief-facts">
                  <span><small>Age</small><b>{selected.age}</b></span>
                  <span><small>Owner</small><b>{selected.owner}</b></span>
                  <span><small>Evidence</small><b>{selected.trail.length} events</b></span>
                </div>
              </article>
              <article className="k-ops-path">
                <header><span>CONTROL PATH</span><b data-tone="live">LIVE</b></header>
                <div><span data-state="done"><i>✓</i><small>Trigger</small></span><em>→</em><span data-state="done"><i>✓</i><small>Policy check</small></span><em>→</em><span data-state="active"><i>03</i><small>Human decision</small></span><em>→</em><span><i>04</i><small>Record</small></span></div>
                <p>Consequential decisions stay with an authorised person. The system carries the context and records the action.</p>
              </article>
            </div>
          )}
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

              <p className="k-ops-detail-title">
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
              <div className="k-ops-section-label"><span>Approval chain</span><b>{selected.chain.filter((c) => c.state === "done").length}/{selected.chain.length} cleared</b></div>
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
              <div className="k-ops-chain-roles">
                {selected.chain.map((step, index) => <span key={`${step.role}-${index}`}>{step.role}</span>)}
              </div>

              {/* A single request has elapsed time, not a trend. Show its control state directly. */}
              <div className="k-ops-section-label"><span>Time control</span><b>{selected.age} open</b></div>
              <div className="k-ops-time-control" data-state={selected.status}>
                <div><i /><span /></div>
                <p><span>Raised</span><b>{selected.status === "escalated" ? "Threshold exceeded" : selected.status === "pending" ? "Within target" : "Closed"}</b><span>6h target</span></p>
              </div>

              <div className="k-ops-section-label"><span>Audit activity</span><b>{selected.trail.length} events</b></div>
              <ol className="k-ops-audit">
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
