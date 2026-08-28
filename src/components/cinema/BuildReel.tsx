"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The build reel.
 *
 * A browser frame in which four genuinely different things get built, one
 * after another. The point is not "here is a website" — it is that the same
 * hands produce a trades one-pager, a law firm, a shop and a logistics portal,
 * and that none of them shares a layout with the others.
 *
 * That distinction is the whole reason this exists. One frame with the text
 * swapped is a template, and reads as one. Four different structures is the
 * only honest way to show range on a page with no portfolio yet.
 *
 * Pure CSS transitions on opacity and transform, no libraries, and it stops
 * running when scrolled out of view or when the visitor has asked for reduced
 * motion — this sits on the page we pay per click for, so it may not cost
 * anything to load.
 */

type Phase = 0 | 1 | 2 | 3; // typing · loading · resolving · live

type Build = {
  domain: string;
  kind: "trades" | "legal" | "shop" | "portal";
  accent: string;
  label: string;
  headline: string;
  cta: string;
  bits: string[];
};

const BUILDS: Build[] = [
  {
    domain: "harveys-plumbing.co.za",
    kind: "trades",
    accent: "#e8a33d",
    label: "One-pager · trades",
    headline: "Burst pipe? We answer.",
    cta: "Call now",
    bits: ["Emergencies", "Geysers", "Leak detection"],
  },
  {
    domain: "mbeki-attorneys.co.za",
    kind: "legal",
    accent: "#8fa6d8",
    label: "Eight pages · professional services",
    headline: "Considered counsel, plainly put.",
    cta: "Request a consultation",
    bits: ["Commercial", "Labour", "Estates", "Property"],
  },
  {
    domain: "kalaharicoffee.co.za",
    kind: "shop",
    accent: "#4fae6a",
    label: "Online shop · payments",
    headline: "Roasted Thursday. With you Friday.",
    cta: "Add to cart",
    bits: ["R180", "R240", "R320"],
  },
  {
    domain: "portal.veldtlogistics.co.za",
    kind: "portal",
    accent: "#6a8cff",
    label: "Client portal · logins and data",
    headline: "Every load, every status, one screen.",
    cta: "Sign in",
    bits: ["In transit", "At depot", "Delivered", "Held"],
  },
];

/** Phase durations in ms. The hold on "live" is what makes it read as finished. */
const TIMING: Record<Phase, number> = { 0: 1100, 1: 1500, 2: 900, 3: 2300 };

export default function BuildReel() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Only run while on screen. A reel animating in a scrolled-past section is
  // pure battery cost on a phone, which is where most of this traffic lands.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => {
      if (phase === 3) {
        setIndex((i) => (i + 1) % BUILDS.length);
        setPhase(0);
      } else {
        setPhase((p) => (p + 1) as Phase);
      }
    }, TIMING[phase]);
    return () => clearTimeout(id);
  }, [active, phase, index]);

  const build = BUILDS[index];
  const built = phase >= 2;

  return (
    <div className="k-reel" ref={ref} style={{ ["--reel" as string]: build.accent }}>
      <div className="k-reel-frame">
        {/* --------------------------------------------------- browser chrome */}
        <div className="k-reel-bar">
          <span className="k-reel-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="k-reel-url">
            <span key={`${index}-url`} className="k-reel-typing">
              {build.domain}
            </span>
          </span>
          <span className={`k-reel-badge${phase === 3 ? " is-on" : ""}`}>Live</span>
          <span className={`k-reel-prog${phase === 1 ? " is-running" : ""}`} aria-hidden />
        </div>

        {/* --------------------------------------------------------- viewport */}
        <div className="k-reel-view" aria-hidden>
          {/* Skeleton, shown while loading and faded out once content resolves */}
          <div className={`k-reel-skel${built ? " is-done" : ""}`}>
            <span className="k-sk k-sk--nav" />
            <span className="k-sk k-sk--h" />
            <span className="k-sk k-sk--p" />
            <span className="k-sk k-sk--block" />
            <span className="k-sk k-sk--c" />
            <span className="k-sk k-sk--c" />
            <span className="k-sk k-sk--c" />
          </div>

          <div
            key={`${index}-site`}
            className={`k-reel-site k-reel-site--${build.kind}${built ? " is-in" : ""}`}
          >
            <Site build={build} />
          </div>
        </div>
      </div>

      <p className="k-reel-caption">
        <span className="k-reel-caption-label">{build.label}</span>
        <span className="k-reel-caption-note">
          Four different builds. Not one template with the words changed.
        </span>
      </p>
    </div>
  );
}

/** Each kind gets its own structure — that difference is the entire argument. */
function Site({ build }: { build: Build }) {
  const nav = (
    <div className="k-rs-nav">
      <span className="k-rs-mark" />
      <span className="k-rs-links">
        <i />
        <i />
        <i />
      </span>
      <span className="k-rs-cta">{build.cta}</span>
    </div>
  );

  if (build.kind === "trades") {
    return (
      <>
        {nav}
        <div className="k-rs-body k-rs-trades">
          <h4 className="k-rs-h">{build.headline}</h4>
          <span className="k-rs-phone">{build.cta} · 24/7</span>
          <div className="k-rs-strip">
            {build.bits.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (build.kind === "legal") {
    return (
      <>
        {nav}
        <div className="k-rs-body k-rs-legal">
          <h4 className="k-rs-h k-rs-h--serif">{build.headline}</h4>
          <div className="k-rs-cols">
            <span className="k-rs-line" />
            <span className="k-rs-line" />
            <span className="k-rs-line k-rs-line--short" />
          </div>
          <div className="k-rs-people">
            {build.bits.map((b) => (
              <span key={b}>
                <i />
                {b}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (build.kind === "shop") {
    return (
      <>
        {nav}
        <div className="k-rs-body k-rs-shop">
          <h4 className="k-rs-h">{build.headline}</h4>
          <div className="k-rs-grid">
            {build.bits.map((b) => (
              <span key={b} className="k-rs-prod">
                <i />
                <em>{b}</em>
                <b>{build.cta}</b>
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="k-rs-portal">
      <aside className="k-rs-side">
        <span className="k-rs-mark" />
        <i />
        <i />
        <i />
        <i />
      </aside>
      <div className="k-rs-main">
        <h4 className="k-rs-h k-rs-h--sm">{build.headline}</h4>
        <div className="k-rs-table">
          {build.bits.map((b, i) => (
            <span key={b} className="k-rs-row">
              <i />
              <em data-state={i}>{b}</em>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
