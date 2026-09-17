"use client";

import { useState } from "react";

const views = {
  learning: {
    label: "Learning",
    eyebrow: "CONTINUE LEARNING",
    title: "Cause & Effect Analysis",
    copy: "Analyse · Topic 3.2 · 18 minutes",
  },
  feedback: {
    label: "Feedback",
    eyebrow: "TRAINER FEEDBACK",
    title: "Measurement plan reviewed",
    copy: "One revision requested · returned 08:42",
  },
  certificate: {
    label: "Certificate",
    eyebrow: "CERTIFICATION PATH",
    title: "4 requirements remaining",
    copy: "Coursework, exam, project and trainer sign-off",
  },
} as const;

type View = keyof typeof views;

const modules = [
  ["D", "Define", "3 lessons", "100"],
  ["M", "Measure", "4 lessons · 1 quiz", "100"],
  ["A", "Analyse", "5 lessons · 2 quizzes", "72"],
  ["I", "Improve", "4 lessons", "28"],
  ["C", "Control", "3 lessons · exam", "0"],
];

export default function TrainingCommandCentre() {
  const [active, setActive] = useState<View>("learning");
  const view = views[active];

  return (
    <figure className="learn-console">
      <header className="learn-bar">
        <span className="learn-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>SIX SIGMA SOUTH AFRICA · LEARNER WORKSPACE</span>
        <span className="learn-sync"><i /> PROGRESS SAVED</span>
      </header>

      <div className="learn-stage">
        <aside className="learn-side">
          <div className="learn-brand"><span>6σ</span><div><strong>Naledi Mokoena</strong><small>Green Belt · Cohort 24</small></div></div>
          <p>MY PROGRAMME</p>
          <nav aria-label="Learner workspace view">
            {(Object.keys(views) as View[]).map((key, index) => (
              <button key={key} type="button" data-active={active === key} onClick={() => setActive(key)}><i>0{index + 1}</i>{views[key].label}{key === "feedback" && <b>1</b>}</button>
            ))}
          </nav>
          <div className="learn-side-foot"><span>OVERALL PROGRESS</span><strong>68%</strong><i><b /></i><small>8 of 12 weeks complete</small></div>
        </aside>

        <main className="learn-main" aria-live="polite">
          <header className="learn-head"><div><span>LEAN SIX SIGMA · GREEN BELT</span><h3>Welcome back, Naledi.</h3></div><div className="learn-session"><span>NEXT LIVE SESSION</span><strong>Tue · 09:00</strong></div></header>

          <section className="learn-continue">
            <div><span>{view.eyebrow}</span><h4>{view.title}</h4><p>{view.copy}</p><button type="button">{active === "learning" ? "Resume lesson" : active === "feedback" ? "Open feedback" : "View requirements"} <i>→</i></button></div>
            <div className="learn-lesson-art" data-view={active} aria-hidden="true"><span>{active === "learning" ? "A" : active === "feedback" ? "✓" : "6σ"}</span><i /><i /><i /></div>
          </section>

          <section className="learn-curriculum">
            <header><div><span>YOUR LEARNING PATH</span><strong>DMAIC curriculum</strong></div><small>19 lessons · 4 quizzes · 1 exam</small></header>
            <div>{modules.map(([code, name, detail, progress]) => (
              <article key={code} data-current={code === "A"}><i>{code}</i><div><strong>{name}</strong><small>{detail}</small></div><span><b style={{ width: `${progress}%` }} /></span><em>{progress}%</em></article>
            ))}</div>
          </section>
        </main>

        <aside className="learn-right">
          <article className="learn-trainer"><header><span>YOUR TRAINER</span><i>LIVE</i></header><div><b>SD</b><span><strong>Sizwe Dlamini</strong><small>Master Black Belt</small></span></div><p>“Your process boundary is clear. Tighten the link between the CTQ and the measurement plan.”</p><button type="button">Open trainer feedback</button></article>
          <article className="learn-upcoming"><header><span>UP NEXT</span><small>2 items</small></header><div><i>14</i><span><strong>Analyse workshop</strong><small>Tuesday · Live virtual</small></span></div><div><i>17</i><span><strong>Quiz · Root cause</strong><small>Friday · 30 minutes</small></span></div></article>
          <article className="learn-award"><i>◎</i><div><span>CERTIFICATE PATH</span><strong>Course + exam + project</strong><small>Trainer sign-off required</small></div></article>
        </aside>
      </div>
      <figcaption><span>ILLUSTRATIVE 2KO LEARNER WORKSPACE</span><span>EXAMPLE LEARNER, COURSE AND PROGRESS · NOT A CLIENT RECORD</span></figcaption>
    </figure>
  );
}
