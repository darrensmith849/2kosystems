import type { ReactNode } from "react";

/**
 * What each phase hands you.
 *
 * The reel in the hero shows what *happens* during a phase. If these sections
 * showed the same thing again the page would say everything twice, so they show
 * the other half: the artefact you actually receive for the money. A memo, a
 * costed finding, a demo log, a phase ledger, a service record.
 *
 * That is also the question the page was failing to answer. "Half-Day Process
 * Review, R7,500" followed by four bullets does not tell anyone what lands in
 * their inbox on the Friday.
 *
 * Static by design. There are already three moving reels on the site and a
 * fourth animation five times down one page would be noise, not cinema — these
 * reveal on scroll with the rest of the content and then hold still.
 */

export type ArtefactKind = "memo" | "findings" | "pilot" | "phases" | "service";

export default function PhaseArtefact({ kind }: { kind: ArtefactKind }) {
  if (kind === "memo") return <Memo />;
  if (kind === "findings") return <Findings />;
  if (kind === "pilot") return <Pilot />;
  if (kind === "phases") return <Phases />;
  return <Service />;
}

function Sheet({ label, meta, children }: { label: string; meta: string; children: ReactNode }) {
  return (
    <div className="k-art">
      <div className="k-art-head">
        <span className="k-art-label">{label}</span>
        <span className="k-art-meta">{meta}</span>
      </div>
      <div className="k-art-body">{children}</div>
    </div>
  );
}

/** Define — the memo. Three or four pages, and a recommendation you can act on. */
function Memo() {
  return (
    <Sheet label="What lands in your inbox" meta="3–4 pages">
      <p className="k-art-doc-title">Process Review · Goods receiving, gate to GRN</p>
      <div className="k-art-lines" aria-hidden>
        <i style={{ width: "94%" }} />
        <i style={{ width: "88%" }} />
        <i style={{ width: "96%" }} />
        <i style={{ width: "62%" }} />
      </div>
      <ul className="k-art-rows">
        <li>
          <b>What is actually broken</b>
          <i>Named, bounded, in writing</i>
        </li>
        <li>
          <b>Current control method</b>
          <i>Recorded as found, not as described</i>
        </li>
      </ul>
      <p className="k-art-stamp" data-tone="go">
        Recommendation · Build — one workflow, scoped
      </p>
      <p className="k-art-foot">
        The other outcome is <b>do not build</b>, and we have written that one too.
      </p>
    </Sheet>
  );
}

/** Measure — findings, each costed with the arithmetic left visible. */
function Findings() {
  const items = [
    {
      n: "01",
      title: "Re-keying deliveries into the finance system",
      sum: "14 hrs/wk × R180/hr × 46 wks",
      cost: "R115,920",
      tag: "Observed",
    },
    {
      n: "02",
      title: "GRNs raised late, holding up supplier payment",
      sum: "31% of 640 GRNs × R340 admin recovery",
      cost: "R67,456",
      tag: "Observed",
    },
    {
      n: "03",
      title: "Stock written off after reconciliation failures",
      sum: "Finance estimate, not counted by us",
      cost: "R228,000",
      tag: "Reported",
    },
  ];
  return (
    <Sheet label="Three findings, each costed" meta="8–14 pages">
      <ul className="k-art-find">
        {items.map((f) => (
          <li key={f.n}>
            <span className="k-art-find-n">{f.n}</span>
            <span className="k-art-find-main">
              <b>{f.title}</b>
              <i>{f.sum}</i>
            </span>
            <span className="k-art-find-cost">{f.cost}</span>
            <span className="k-art-tag" data-tag={f.tag.toLowerCase()}>
              {f.tag}
            </span>
          </li>
        ))}
      </ul>
      <p className="k-art-foot">
        <b>Observed</b> means we watched it. <b>Reported</b> means someone told us, and we
        say so rather than blur the two into one number.
      </p>
    </Sheet>
  );
}

/** Analyse & Improve — the demo log. Working software from week two. */
function Pilot() {
  const weeks = [
    { w: "Week 1", what: "Success criteria agreed and signed", state: "done" },
    { w: "Week 2", what: "Working software, demoed on your data", state: "done" },
    { w: "Week 3", what: "Capture live with two supervisors", state: "done" },
    { w: "Week 4", what: "Approval thresholds switched on", state: "now" },
    { w: "Week 5", what: "Measured against the criteria", state: "next" },
    { w: "Week 6", what: "Go / no-go on the Core Build", state: "next" },
  ];
  return (
    <Sheet label="What you see, and when" meta="Weekly demos">
      <ul className="k-art-weeks">
        {weeks.map((k) => (
          <li key={k.w} data-s={k.state}>
            <b>{k.w}</b>
            <i>{k.what}</i>
          </li>
        ))}
      </ul>
      <p className="k-art-foot">
        Nothing is thrown away at the end. The pilot <b>is</b> the first phase of the
        build, which is why the code and the documentation are yours from week one.
      </p>
    </Sheet>
  );
}

/** Control — the phase ledger, and the phase we deliberately have not quoted. */
function Phases() {
  return (
    <Sheet label="Quoted in sequence, never all at once" meta="Fixed per phase">
      <ul className="k-art-ledger">
        <li data-s="done">
          <b>Phase 1 · Capture and approvals</b>
          <i>Shipped · fixed price held</i>
          <em>R385,000</em>
        </li>
        <li data-s="now">
          <b>Phase 2 · Escalation and reporting</b>
          <i>Quoted now that Phase 1 has shipped</i>
          <em>R310,000</em>
        </li>
        <li data-s="open">
          <b>Phase 3 · Contractor portal</b>
          <i>Not quoted — nobody can scope it yet</i>
          <em>—</em>
        </li>
      </ul>
      <p className="k-art-foot">
        You are never asked to commit to a number for work that cannot honestly be
        scoped. That is the whole reason it is phased.
      </p>
    </Sheet>
  );
}

/** Sustain — the service record. Optional, and never a condition of anything. */
function Service() {
  return (
    <Sheet label="The month, as recorded" meta="Optional">
      <ul className="k-art-log">
        <li>
          <em>02:00 daily</em> Backup completed · restore tested 04 Mar
        </li>
        <li>
          <em>11 Mar</em> Security patches applied · no downtime
        </li>
        <li data-hot="1">
          <em>18 Mar</em> Incident raised 09:14 · acknowledged 09:31
        </li>
        <li>
          <em>18 Mar</em> Resolved 11:02 · inside SLA
        </li>
        <li>
          <em>31 Mar</em> Uptime 99.97% · report issued
        </li>
      </ul>
      <p className="k-art-foot">
        Never a condition of anything we build. The system is designed to be operated
        without us, and you can take this in-house whenever you like.
      </p>
    </Sheet>
  );
}
