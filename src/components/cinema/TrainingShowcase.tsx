import Link from "next/link";

const LIVE_CALENDAR = "https://portal.sigmafy.co/public/training";

export function CourseFinder() {
  const courses = [
    ["GREEN BELT", "DMAIC Green Belt", "Lead a complete improvement project", "Classroom · Virtual · Online", "5-day instructor pathway"],
    ["YELLOW BELT", "Six Sigma Yellow Belt", "Contribute confidently to improvement teams", "Classroom · Virtual · Online", "2-day instructor pathway"],
    ["BLACK BELT", "DMAIC Black Belt", "Lead complex cross-functional programmes", "Classroom · Virtual", "Advanced practitioner pathway"],
  ];

  return (
    <figure className="course-finder">
      <header><div className="course-search"><span>⌕</span> Search courses, belt levels or locations…</div><div className="course-month"><button type="button" aria-label="Previous month">←</button><strong>Upcoming programmes</strong><button type="button" aria-label="Next month">→</button></div></header>
      <div className="course-filters"><span data-active="true">Cards</span><span>List</span><span>Calendar</span><i /><span>All belt levels</span><span>All delivery modes</span></div>
      <div className="course-grid">{courses.map(([belt, name, line, formats, duration], index) => <article key={belt}><div><span data-tone={index === 1 ? "yellow" : index === 2 ? "black" : "green"}>{belt}</span><small>CSSC USA · ACCREDITED</small></div><h3>{name}</h3><p>{line}</p><dl><div><dt>Delivery</dt><dd>{formats}</dd></div><div><dt>Structure</dt><dd>{duration}</dd></div></dl><footer><span>LIVE DATES ON SIGMAFY</span><Link href={LIVE_CALENDAR}>View schedule →</Link></footer></article>)}</div>
      <figcaption>Course finder concept · live dates and availability open on Sigmafy</figcaption>
    </figure>
  );
}

export function TrainerReview() {
  return (
    <figure className="trainer-review">
      <header><span className="learn-dots" aria-hidden="true"><i /><i /><i /></span><span>TRAINER REVIEW · MEASUREMENT PLAN</span><b>REVIEW 1 OF 2</b></header>
      <div className="review-stage">
        <aside><span>SUBMISSION</span><strong>Measure phase<br />deliverable</strong><dl><div><dt>Delegate</dt><dd>N. Mokoena</dd></div><div><dt>Submitted</dt><dd>08:14 today</dd></div><div><dt>Attachments</dt><dd>2 files</dd></div><div><dt>Attempt</dt><dd>01</dd></div></dl><i>AI ASSISTED · TRAINER DECIDES</i></aside>
        <main><div className="review-title"><div><span>RUBRIC · TOPIC 2.4</span><h3>Measurement plan</h3></div><strong>3 / 4 criteria met</strong></div><div className="review-rubric">{[["01", "Defines the operational measure", "MET"], ["02", "Names the source and owner", "MET"], ["03", "Sets the collection frequency", "MET"], ["04", "Connects the measure to the CTQ", "REVISE"]].map(([n, item, state]) => <div key={n}><span>{n}</span><p>{item}</p><strong data-state={state}>{state === "MET" ? "✓ MET" : "↻ REVISE"}</strong></div>)}</div><div className="review-note"><span>TRAINER NOTE</span><p>Your process boundary and data source are clear. Add the CTQ definition used in the charter, then explain why this collection frequency will expose the variation you need to investigate.</p><small>Sizwe Dlamini · Master Black Belt · 08:42</small></div><footer><button type="button">Return for revision</button><button type="button">Approve after change</button></footer></main>
      </div>
      <figcaption><span>ILLUSTRATIVE TRAINER REVIEW</span><span>AI CAN STRUCTURE FEEDBACK · A TRAINER RETAINS SIGN-OFF</span></figcaption>
    </figure>
  );
}
