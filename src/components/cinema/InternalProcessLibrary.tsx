"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  internalProcessCategories,
  internalProcessCount,
  type InternalProcessStatus,
} from "@/lib/internal-processes";
import styles from "./InternalProcessLibrary.module.css";

const statusLabels: Record<InternalProcessStatus, string> = {
  live: "Live map",
  next: "Build next",
  planned: "Planned",
};

export default function InternalProcessLibrary() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const visibleCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return internalProcessCategories
      .filter((item) => category === "all" || item.id === category)
      .map((item) => ({
        ...item,
        processes: item.processes.filter((process) => {
          if (!needle) return true;
          return [process.code, process.title, process.description, process.owner, process.startsWith, process.endsWith]
            .join(" ")
            .toLowerCase()
            .includes(needle);
        }),
      }))
      .filter((item) => item.processes.length > 0);
  }, [category, query]);

  const visibleCount = visibleCategories.reduce((total, item) => total + item.processes.length, 0);
  const statusCounts = internalProcessCategories
    .flatMap((item) => item.processes)
    .reduce<Record<InternalProcessStatus, number>>(
      (counts, process) => ({ ...counts, [process.status]: counts[process.status] + 1 }),
      { live: 0, next: 0, planned: 0 },
    );

  function openCategory(id: string) {
    setCategory(id);
    window.requestAnimationFrame(() => document.getElementById("process-register")?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <main className={styles.library}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">2KO</Link>
        <span>INTERNAL · PROCESS LIBRARY</span>
        <div className={styles.topActions}>
          <strong>{internalProcessCount}</strong><span>REGISTERED PROCESSES</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>2KO OPERATING SYSTEM</span>
          <h1>One business.<br />Separate process maps.</h1>
        </div>
        <div className={styles.heroCopy}>
          <p>Each operating process has its own decision canvas. Handoffs connect the maps without forcing the entire company onto one unreadable diagram.</p>
          <div className={styles.heroConsole} aria-label="Process family overview">
            <header><span>PROCESS REGISTER</span><strong><i /> CONTROLLED</strong></header>
            <div className={styles.heroConsoleBody}>
              {internalProcessCategories.map((item) => (
                <button type="button" key={item.id} onClick={() => openCategory(item.id)}>
                  <span>{item.number}</span><strong>{item.title}</strong><small>{String(item.processes.length).padStart(2, "0")}</small>
                </button>
              ))}
            </div>
            <footer>
              <span>{String(statusCounts.live).padStart(2, "0")} LIVE</span>
              <span>{String(statusCounts.next).padStart(2, "0")} NEXT</span>
              <span>{String(statusCounts.planned).padStart(2, "0")} PLANNED</span>
            </footer>
          </div>
          <dl>
            <div><dt>{String(statusCounts.live).padStart(2, "0")}</dt><dd>Live canvases</dd></div>
            <div><dt>{String(statusCounts.next).padStart(2, "0")}</dt><dd>Next to build</dd></div>
            <div><dt>05</dt><dd>Process families</dd></div>
          </dl>
        </div>
      </section>

      <section className={styles.controls} aria-label="Process library filters">
        <label>
          <span>SEARCH</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Process, owner, start or outcome…" />
        </label>
        <div className={styles.filters}>
          <button type="button" data-active={category === "all"} onClick={() => setCategory("all")}>ALL</button>
          {internalProcessCategories.map((item) => (
            <button key={item.id} type="button" data-active={category === item.id} onClick={() => setCategory(item.id)}>
              {item.number} · {item.title}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.catalogue} id="process-register" aria-live="polite">
        <div className={styles.catalogueHeading}>
          <span>PROCESS REGISTER</span>
          <span>{String(visibleCount).padStart(2, "0")} SHOWN</span>
        </div>

        {visibleCategories.length ? visibleCategories.map((item) => (
          <section className={styles.category} key={item.id}>
            <header className={styles.categoryHeader}>
              <span>{item.number}</span>
              <div><h2>{item.title}</h2><p>{item.description}</p></div>
              <strong>{String(item.processes.length).padStart(2, "0")}</strong>
            </header>

            <div className={styles.processGrid}>
              {item.processes.map((process) => {
                const content = (
                  <>
                    <header>
                      <span>{process.code}</span>
                      <strong data-status={process.status}>{statusLabels[process.status]}</strong>
                    </header>
                    <h3>{process.title}</h3>
                    <p>{process.description}</p>
                    <dl>
                      <div><dt>OWNER</dt><dd>{process.owner}</dd></div>
                      <div><dt>STARTS</dt><dd>{process.startsWith}</dd></div>
                      <div><dt>ENDS</dt><dd>{process.endsWith}</dd></div>
                    </dl>
                    <footer>{process.href ? "OPEN DECISION CANVAS →" : process.status === "next" ? "NEXT CANVAS TO BUILD" : "AWAITING MAPPING"}</footer>
                  </>
                );

                return process.href ? (
                  <Link className={styles.processCard} data-status={process.status} href={process.href} key={process.code}>{content}</Link>
                ) : (
                  <article className={styles.processCard} data-status={process.status} key={process.code}>{content}</article>
                );
              })}
            </div>
          </section>
        )) : (
          <div className={styles.empty}><strong>No matching process.</strong><span>Change the category or search language.</span></div>
        )}
      </section>

      <footer className={styles.footer}>
        <span>STANDARD · FREE-SCROLL DECISION CANVAS</span>
        <span>OWNER · 2KO OPERATING SYSTEM</span>
        <span>INTERNAL · NOT PUBLIC-FACING</span>
      </footer>
    </main>
  );
}
