"use client";

import { useEffect, useState } from "react";

// One example process, followed from the problem to a bespoke system whose
// result holds. The build is the centre; Six Sigma is what frames it.
const before = {
  hours: 149,
  display: "6.2 days",
  touches: 9,
  line: "Invoices wait in inboxes, suppliers chase and late-payment fees pile up.",
};

const moves = [
  {
    verb: "Measure",
    after: "Baseline measured. Now we know where the time goes.",
    by: "Six Sigma baseline",
    did: "Timed 200 invoices. Most of the 6.2 days is waiting in approvers' inboxes.",
    hours: 149,
    display: "6.2 days",
    readout: "6.2 days · baseline",
    touches: 9,
  },
  {
    verb: "Fix",
    after: "After fixing the process. No software yet.",
    by: "Process first",
    did: "Cut 11 hand-offs to 4 and gave every invoice one owner, before any code.",
    hours: 74,
    display: "3.1 days",
    readout: "3.1 days",
    touches: 5,
  },
  {
    verb: "Build",
    after: "After the bespoke system went live.",
    by: "2KO Systems",
    did: "A bespoke approval system: matched invoices route themselves and exceptions go straight to the right person.",
    hours: 18,
    display: "18 hours",
    readout: "18 hours",
    touches: 1,
  },
  {
    verb: "Prove",
    after: "Measured every week. The gain is holding.",
    by: "Sigmafy",
    did: "Tracked weekly against the baseline. Still 18 hours after 90 days.",
    hours: 18,
    display: "18 hours",
    readout: "18 hours · holding",
    touches: 1,
  },
] as const;

// -1 is the starting problem; 0–3 are the four moves.
const STEP_MS = 3800;

export default function GroupOperatingSystem() {
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Reduced motion: no autoplay; the steps stay clickable.
    if (!auto || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Hold on the finished result a little longer before starting again.
    const delay = step === moves.length - 1 ? STEP_MS * 1.6 : STEP_MS;
    const timer = window.setTimeout(() => setStep((s) => (s >= moves.length - 1 ? -1 : s + 1)), delay);
    return () => window.clearTimeout(timer);
  }, [step, auto, paused]);

  const now = step < 0 ? before : moves[step];
  const holding = step === moves.length - 1;

  const choose = (index: number) => {
    setAuto(false);
    setStep(index);
  };

  return (
    <div
      className="gos-wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="gos-window">
        <div className="gos-topbar">
          <span className="gos-lights" aria-hidden="true"><i /><i /><i /></span>
          <span>ONE PROCESS · ONE BESPOKE SYSTEM</span>
          <span className="gos-tag">EXAMPLE</span>
        </div>

        <div className="gos-result" aria-live="polite">
          <div className="gos-result-copy">
            <span>SUPPLIER INVOICE APPROVAL · TIME TO APPROVE</span>
            <strong data-state={step <= 0 ? "before" : holding ? "holding" : "moving"}>{now.display}</strong>
            <p>
              {step < 0 ? (
                before.line
              ) : (
                <>
                  Was <b>{before.display}</b>.{" "}
                  {moves[step].after}
                </>
              )}
            </p>
          </div>

          <div className="gos-meter">
            <div className="gos-meter-row">
              <small>Approval time</small>
              <div className="gos-track">
                <i className="gos-ghost" />
                <i className="gos-fill" data-state={step <= 0 ? "before" : "after"} style={{ width: `${(now.hours / before.hours) * 100}%` }} />
              </div>
            </div>
            <div className="gos-meter-row">
              <small>People touching each invoice</small>
              <div className="gos-dots" aria-label={`${now.touches} of ${before.touches}`}>
                {Array.from({ length: before.touches }, (_, i) => (
                  <i key={i} data-on={i < now.touches} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <ol className="gos-moves">
          {moves.map((move, index) => (
            <li key={move.verb} data-build={move.verb === "Build"}>
              <button
                type="button"
                data-state={index === step ? "now" : index < step ? "done" : "next"}
                aria-current={index === step ? "step" : undefined}
                onClick={() => choose(index)}
              >
                <span className="gos-move-head">
                  <em>0{index + 1}</em>
                  <strong>{move.verb}</strong>
                  {move.verb === "Build" && <span className="gos-move-flag">THE SYSTEM</span>}
                  <i aria-hidden="true">{index < step ? "✓" : ""}</i>
                </span>
                <small>{move.by}</small>
                <span className="gos-move-did">{move.did}</span>
                <b>{move.readout}</b>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="gos-caption"><span>ILLUSTRATIVE EXAMPLE OF A 2KO ENGAGEMENT</span><span>EXAMPLE VALUES · NOT A CLIENT RESULT</span></div>
    </div>
  );
}
