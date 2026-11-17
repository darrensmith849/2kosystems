"use client";

import { useEffect, useState } from "react";

// One example organisation, followed from a handful of experts to a programme
// where every belt climbs on Sigmafy. Reuses the hero window's styles.
const before = {
  trained: 0,
  display: "4 experts",
  projects: 0,
  line: "Improvement depends on a handful of people and a slide deck.",
};

const levels = [
  {
    verb: "Everyone",
    after: "Everyone has the basics, and logs the problems they see.",
    by: "White Belt",
    did: "Every person learns in a hands-on simulation, then spots waste in their own work.",
    trained: 96,
    display: "10,000 trained",
    readout: "10,000 people",
    projects: 1,
  },
  {
    verb: "Teams",
    after: "Teams run small fixes and join the bigger projects.",
    by: "Yellow Belt",
    did: "Team members finish a guided mini-project and support a project lead.",
    trained: 97,
    display: "300 Yellow Belts",
    readout: "300 people",
    projects: 3,
  },
  {
    verb: "Project leads",
    after: "Real projects, checked as they are written and signed off by our trainers.",
    by: "Green Belt",
    did: "Leads run full DMAIC projects on Sigmafy, with the right tool at each step.",
    trained: 98,
    display: "100 projects",
    readout: "100 projects",
    projects: 6,
  },
  {
    verb: "Experts",
    after: "Your own experts now coach the next wave. Every result is measured.",
    by: "Black Belt",
    did: "Black Belts lead the hardest problems and coach Green Belts, with our sign-off.",
    trained: 100,
    display: "20 Black Belts",
    readout: "20 people · coaching",
    projects: 9,
  },
] as const;

// -1 is the starting point; 0–3 are the four belts.
const STEP_MS = 3800;

export default function DeploymentClimb() {
  const [step, setStep] = useState(-1);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Reduced motion: no autoplay; the steps stay clickable.
    if (!auto || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Hold on the finished programme a little longer before starting again.
    const delay = step === levels.length - 1 ? STEP_MS * 1.6 : STEP_MS;
    const timer = window.setTimeout(() => setStep((s) => (s >= levels.length - 1 ? -1 : s + 1)), delay);
    return () => window.clearTimeout(timer);
  }, [step, auto, paused]);

  const now = step < 0 ? before : levels[step];
  const holding = step === levels.length - 1;

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
          <span>ONE ORGANISATION · ONE DEPLOYMENT</span>
          <span className="gos-tag">EXAMPLE</span>
        </div>

        {/* Announce only steps the visitor picks, not the autoplay loop. */}
        <div className="gos-result" aria-live={auto ? "off" : "polite"}>
          <div className="gos-result-copy">
            <span>LEAN SIX SIGMA DEPLOYMENT · ON SIGMAFY</span>
            <strong data-state={step < 0 ? "before" : holding ? "holding" : "moving"}>{now.display}</strong>
            <p>
              {step < 0 ? (
                before.line
              ) : (
                <>
                  Was <b>{before.display}</b>.{" "}
                  {levels[step].after}
                </>
              )}
            </p>
          </div>

          <div className="gos-meter">
            <div className="gos-meter-row">
              <small>Staff trained</small>
              <div className="gos-track">
                <i className="gos-ghost" />
                <i className="gos-fill" data-state={step < 0 ? "before" : "after"} style={{ width: `${now.trained}%` }} />
              </div>
            </div>
            <div className="gos-meter-row">
              <small>Projects running</small>
              <div className="gos-dots" aria-label={`${now.projects} of 9`}>
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} data-on={i < now.projects} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <ol className="gos-moves">
          {levels.map((level, index) => (
            <li key={level.verb} data-build={level.by === "Green Belt"}>
              <button
                type="button"
                data-state={index === step ? "now" : index < step ? "done" : "next"}
                aria-current={index === step ? "step" : undefined}
                onClick={() => choose(index)}
              >
                <span className="gos-move-head">
                  <em>0{index + 1}</em>
                  <strong>{level.verb}</strong>
                  {level.by === "Green Belt" && <span className="gos-move-flag">THE PROJECTS</span>}
                  <i aria-hidden="true">{index < step ? "✓" : ""}</i>
                </span>
                <small>{level.by}</small>
                <span className="gos-move-did">{level.did}</span>
                <b>{level.readout}</b>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="gos-caption"><span>ILLUSTRATIVE EXAMPLE OF A 2KO DEPLOYMENT</span><span>EXAMPLE VALUES · NOT A CLIENT RESULT</span></div>
    </div>
  );
}
