"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The systems reel.
 *
 * /systems opens with "Six layers. One operation." and then describes the six
 * separately, which leaves the reader to take the second sentence on trust.
 * This makes the argument instead: one request — a conveyor belt replacement —
 * carried through every layer, so the layers are visibly the same job rather
 * than six products.
 *
 * Deliberately not the OpsConsole on the homepage: that one is a queue you
 * click. This is a single record moving, with a vertical rail, so the two read
 * as different things rather than the same demo twice.
 *
 * Same discipline as the other reels: stops when off screen, never starts under
 * prefers-reduced-motion.
 */

type Layer = {
  n: string;
  name: string;
  doing: string;
  kind: "approvals" | "capture" | "escalation" | "reporting" | "portals" | "intelligence";
};

/** Numbered as the page numbers them, so the reel and the sections agree. */
const LAYERS: Layer[] = [
  { n: "01", name: "Approvals", doing: "Chain derived from your delegation rules", kind: "approvals" },
  { n: "02", name: "Capture", doing: "Validated where the work happens", kind: "capture" },
  { n: "03", name: "Escalation", doing: "Fires the day the number moves", kind: "escalation" },
  { n: "04", name: "Reporting", doing: "The pack builds itself", kind: "reporting" },
  { n: "05", name: "Portals", doing: "Their slice, and only theirs", kind: "portals" },
  { n: "06", name: "Intelligence", doing: "The pattern nobody had time to see", kind: "intelligence" },
];

const DWELL = 3200;
const SWAP = 170;

/** The one record every layer is looking at. Invented, like all of it. */
const REQ = { id: "REQ-4471", title: "Conveyor belt replacement · Plant 2", value: "R84,000" };

export default function LayerReel() {
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(true);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    if (live) {
      const id = setTimeout(() => setLive(false), DWELL);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % LAYERS.length);
      setLive(true);
    }, SWAP);
    return () => clearTimeout(id);
  }, [active, live, index]);

  const layer = LAYERS[index];

  return (
    <div className="k-layer" ref={ref}>
      <div className="k-reel-frame">
        {/* --------------------------------------------------- the record */}
        <div className="k-layer-head">
          <span className="k-layer-id">{REQ.id}</span>
          <span className="k-layer-title">{REQ.title}</span>
          <span className="k-layer-value">{REQ.value}</span>
        </div>

        <div className="k-layer-body">
          {/* ------------------------------------------------- the rail */}
          <ol className="k-layer-rail">
            {LAYERS.map((l, i) => (
              <li key={l.n} data-state={i === index ? "on" : "off"}>
                <span className="k-layer-n">{l.n}</span>
                <span className="k-layer-name">{l.name}</span>
              </li>
            ))}
          </ol>

          {/* ------------------------------------------------ the panel */}
          <div className="k-layer-view" aria-hidden>
            <div key={index} className={`k-layer-card${live ? " is-in" : ""}`}>
              <p className="k-layer-doing">{layer.doing}</p>
              <Stage kind={layer.kind} />
            </div>
          </div>
        </div>
      </div>

      <p className="k-reel-caption">
        <span className="k-reel-caption-label">One request · six layers</span>
        <span className="k-reel-caption-note">
          Illustrative. The same record, seen by each layer in turn — no client&rsquo;s data.
        </span>
      </p>
    </div>
  );
}

function Stage({ kind }: { kind: Layer["kind"] }) {
  if (kind === "approvals") {
    return (
      <ul className="k-ly-chain">
        <li data-s="done">
          <b>Supervisor</b>
          <i>Approved · 14:02</i>
        </li>
        <li data-s="done">
          <b>Area Manager</b>
          <i>Approved · 15:41</i>
        </li>
        <li data-s="now">
          <b>Finance</b>
          <i>Required over R50,000</i>
        </li>
        <li data-s="off">
          <b>Director</b>
          <i>Not required at this value</i>
        </li>
      </ul>
    );
  }

  if (kind === "capture") {
    return (
      <ul className="k-ly-fields">
        <li data-ok="1">
          <b>Asset</b>
          <i>CNV-2-014</i>
        </li>
        <li data-ok="1">
          <b>Downtime</b>
          <i>4.5 hrs</i>
        </li>
        <li data-ok="0">
          <b>Belt length</b>
          <i>1400 m — out of range, rejected on entry</i>
        </li>
        <li data-ok="1">
          <b>Photo</b>
          <i>Attached offline · synced 16:20</i>
        </li>
      </ul>
    );
  }

  if (kind === "escalation") {
    return (
      <div className="k-ly-esc">
        <div className="k-ly-timer">
          <span className="k-ly-timer-fill" />
        </div>
        <ul className="k-ly-events">
          <li>
            <em>16:41</em> Sat unactioned for 48 hrs
          </li>
          <li data-hot="1">
            <em>16:41</em> Escalated to Plant Manager
          </li>
          <li>
            <em>16:41</em> History attached automatically
          </li>
        </ul>
      </div>
    );
  }

  if (kind === "reporting") {
    return (
      <div className="k-ly-report">
        <ul className="k-ly-rows">
          <li>
            <b>Downtime this month</b>
            <i>18.5 hrs</i>
          </li>
          <li>
            <b>Against target</b>
            <i data-warn="1">+31%</i>
          </li>
          <li>
            <b>Approvals over threshold</b>
            <i>6</i>
          </li>
          <li>
            <b>Median time to approve</b>
            <i>4.2 hrs</i>
          </li>
        </ul>
        <p className="k-ly-note">Assembled from the records above. Nobody typed it.</p>
      </div>
    );
  }

  if (kind === "portals") {
    return (
      <div className="k-ly-portal">
        <p className="k-ly-who">Signed in · Contractor · Meridian Belting</p>
        <ul className="k-ly-rows">
          <li>
            <b>REQ-4471</b>
            <i>Awaiting your quote</i>
          </li>
          <li>
            <b>REQ-4402</b>
            <i>Completed · invoice paid</i>
          </li>
          <li data-hidden="1">
            <b>REQ-4468</b>
            <i>Not visible to this account</i>
          </li>
        </ul>
        <p className="k-ly-note">Row-level, not a filter on a shared screen.</p>
      </div>
    );
  }

  return (
    <div className="k-ly-intel">
      <p className="k-ly-find">
        Third belt failure this quarter — all on the <b>same 40 m section</b>.
      </p>
      <ul className="k-ly-rows">
        <li>
          <b>Replacement cost to date</b>
          <i>R241,000</i>
        </li>
        <li>
          <b>Alignment last checked</b>
          <i data-warn="1">19 months ago</i>
        </li>
      </ul>
      <p className="k-ly-note">Nobody had time to notice. The system did.</p>
    </div>
  );
}
