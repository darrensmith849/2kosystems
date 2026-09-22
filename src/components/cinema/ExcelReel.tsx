"use client";

import { useState } from "react";

type View = "register" | "approvals" | "reports";

const rows = [
  { id: "STK-1847", item: "Bearing 6205-2RS", site: "Store A", owner: "J. Mokoena", status: "Review", age: "4 min" },
  { id: "STK-1846", item: "Hydraulic hose ¾\"", site: "Store B", owner: "T. Dlamini", status: "Approved", age: "18 min" },
  { id: "STK-1845", item: "V-belt B52", site: "Store A", owner: "J. Mokoena", status: "Approved", age: "42 min" },
  { id: "STK-1844", item: "Gasket set — CAT", site: "Store B", owner: "D. Nkosi", status: "Exception", age: "1 hr" },
];

const spreadsheetRows = [
  ["Bearing 6205", "48", "Store A", "03/04/24"],
  ["Bearing 6205 2RS", "12 units", "store a", "4 Mar"],
  ["V-belt B52", "#REF!", "Store A", "45356"],
  ["Hyd. hose 3/4", "~30", "Store B", ""],
];

export default function ExcelReel() {
  const [view, setView] = useState<View>("register");

  return (
    <figure id="workspace-preview" className="gx-product">
      <div className="gx-product-bar">
        <div className="gx-window-dots" aria-hidden><i /><i /><i /></div>
        <span>Spreadsheet replacement · illustrative workspace</span>
        <span className="gx-live"><i /> Live system</span>
      </div>

      <div className="gx-product-stage">
        <section className="gx-source" aria-label="Spreadsheet before replacement">
          <div className="gx-source-top">
            <span className="gx-file-icon">X</span>
            <span><b>Stock Register Final_v3</b><small>USE_THIS_ONE.xlsx</small></span>
          </div>
          <div className="gx-sheet-wrap">
            <table className="gx-sheet">
              <thead><tr><th /><th>Item</th><th>Qty</th><th>Location</th><th>Last count</th></tr></thead>
              <tbody>
                {spreadsheetRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th>{rowIndex + 2}</th>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} data-fault={rowIndex > 0 && (cellIndex === 0 || cellIndex === 1 || cellIndex === 3) ? "true" : undefined}>{cell || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gx-source-alerts"><span>2 duplicates</span><span>3 date formats</span><span>#REF!</span></div>
          <div className="gx-locked"><i /> Locked for editing by D. Nkosi</div>
        </section>

        <div className="gx-transfer" aria-hidden><span>Clean</span><i>→</i><span>Structure</span></div>

        <section className="gx-app" aria-label="Central operations platform after replacement">
          <aside className="gx-app-side">
            <div className="gx-app-brand"><i>2</i><span>Northstar<br /><small>Operations</small></span></div>
            <nav aria-label="Illustrative workspace navigation">
              <button type="button" data-active={view === "register"} onClick={() => setView("register")}><i>R</i><span>Stock register</span></button>
              <button type="button" data-active={view === "approvals"} onClick={() => setView("approvals")}><i>A</i><span>Approvals</span><b>3</b></button>
              <button type="button"><i>E</i><span>Exceptions</span><b>2</b></button>
              <button type="button" data-active={view === "reports"} onClick={() => setView("reports")}><i>↗</i><span>Reports</span></button>
            </nav>
            <div className="gx-app-user"><span>JM</span><small>J. Mokoena<br /><b>Operations</b></small></div>
          </aside>

          <div className="gx-app-main">
            <header className="gx-app-head">
              <span>Operations / Inventory</span>
              <div><button type="button" aria-label="Search">⌕</button><span className="gx-avatars"><i>JM</i><i>DN</i><i>TD</i></span></div>
            </header>
            {view === "register" && <RegisterView />}
            {view === "approvals" && <ApprovalsView />}
            {view === "reports" && <ReportsView />}
          </div>
        </section>
      </div>

      <figcaption><span>One live set of records. No file lock. No version hunt.</span><span>Illustrative interface and records — not a client result.</span></figcaption>
    </figure>
  );
}

function RegisterView() {
  return (
    <div className="gx-view gx-register">
      <div className="gx-view-title"><div><small>LIVE REGISTER</small><h3>Stock records</h3></div><button type="button"><span>＋</span> New record</button></div>
      <div className="gx-metrics">
        <article><small>Total records</small><strong>1,847</strong><span>Across 2 stores</span></article>
        <article><small>Awaiting review</small><strong>03</strong><span>Oldest: 22 min</span></article>
        <article><small>Exceptions</small><strong>02</strong><span>Owners notified</span></article>
      </div>
      <div className="gx-tools"><span>⌕ Search records</span><span>All sites⌄</span><span>All statuses⌄</span><i>Updated now</i></div>
      <div className="gx-table-scroll">
        <table className="gx-record-table">
          <thead><tr><th>Record</th><th>Item</th><th>Site</th><th>Owner</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>{rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td><td><b>{row.item}</b></td><td>{row.site}</td><td>{row.owner}</td>
              <td><span data-status={row.status.toLowerCase()}><i />{row.status}</span></td><td>{row.age}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function ApprovalsView() {
  return (
    <div className="gx-view gx-approval-view">
      <div className="gx-view-title"><div><small>REVIEW QUEUE</small><h3>Three records need a decision</h3></div><span className="gx-sla"><i /> Within response target</span></div>
      <div className="gx-review-layout">
        <div className="gx-review-list">
          <button type="button" data-active="true"><span><b>STK-1847</b><small>Bearing 6205-2RS</small></span><em>Qty change</em></button>
          <button type="button"><span><b>STK-1839</b><small>Coolant concentrate</small></span><em>New item</em></button>
          <button type="button"><span><b>STK-1828</b><small>Cutting disc 230mm</small></span><em>Variance</em></button>
        </div>
        <article className="gx-review-card">
          <header><span>STK-1847</span><small>Submitted 4 minutes ago</small></header>
          <h4>Bearing 6205-2RS</h4>
          <dl><div><dt>Quantity</dt><dd><s>48</s> → <b>60</b></dd></div><div><dt>Reason</dt><dd>Duplicate stock merged</dd></div><div><dt>Submitted by</dt><dd>J. Mokoena · Store A</dd></div></dl>
          <footer><button type="button">Send back</button><button type="button">Approve change</button></footer>
        </article>
      </div>
    </div>
  );
}

function ReportsView() {
  const bars = [38, 54, 48, 72, 66, 84, 78, 92, 88, 96, 90, 98];
  return (
    <div className="gx-view gx-report-view">
      <div className="gx-view-title"><div><small>STANDARD REPORT</small><h3>Record quality</h3></div><button type="button">Export report ↗</button></div>
      <div className="gx-report-grid">
        <article className="gx-chart-card">
          <header><span>Validated first time</span><strong>94.8%</strong></header>
          <div className="gx-bars" aria-label="Illustrative twelve period bar chart">{bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
          <footer><span>Week 1</span><span>Week 12</span></footer>
        </article>
        <article className="gx-summary-card">
          <span><i data-tone="good" /> Accepted first time <b>1,751</b></span>
          <span><i data-tone="warn" /> Corrected at entry <b>91</b></span>
          <span><i data-tone="alert" /> Open exceptions <b>5</b></span>
          <small>Generated from the live register — no monthly copy-and-paste.</small>
        </article>
      </div>
    </div>
  );
}

export function ExcelWorkflowScenes() {
  return (
    <div className="gx-scenes">
      <article className="gx-scene gx-scene--capture">
        <div className="gx-scene-ui">
          <header><span>New stock record</span><i>Draft saved</i></header>
          <div className="gx-form-grid">
            <label><span>Item</span><b>Bearing 6205-2RS</b></label>
            <label data-invalid="true"><span>Quantity</span><b>12 units</b><em>Enter a whole number</em></label>
            <label><span>Location</span><b>Store A <i>⌄</i></b></label>
            <label><span>Counted by</span><b>J. Mokoena</b></label>
          </div>
          <footer><button type="button">Cancel</button><button type="button">Create record</button></footer>
        </div>
        <div className="gx-scene-copy"><span>01 · Capture</span><h3>Bad data stops at the door.</h3><p>Required fields, permitted values and business rules become part of the interface—not knowledge somebody has to remember.</p></div>
      </article>

      <article className="gx-scene gx-scene--route">
        <div className="gx-scene-ui">
          <header><span>Workflow rule</span><i data-on="true">On</i></header>
          <div className="gx-rule">
            <small>WHEN</small><p>Quantity changes by <b>more than 10%</b></p>
            <span>↓</span><small>THEN</small><p>Send to <b>Store manager</b> for approval</p>
            <span>↓</span><small>AND</small><p>Write decision to the <b>record history</b></p>
          </div>
        </div>
        <div className="gx-scene-copy"><span>02 · Route</span><h3>The process moves without chasing.</h3><p>Exceptions go to a named owner, decisions happen in one place and overdue work stays visible until it is resolved.</p></div>
      </article>
    </div>
  );
}

export function ExcelAuditScene() {
  return (
    <figure className="gx-audit-scene">
      <div className="gx-audit-record">
        <header><div><small>RECORD</small><strong>STK-1847</strong></div><span data-status="approved"><i />Approved</span></header>
        <div className="gx-audit-item"><span>Item</span><b>Bearing 6205-2RS</b></div>
        <div className="gx-audit-fields"><span><small>Quantity</small><b>60</b></span><span><small>Location</small><b>Store A</b></span><span><small>Owner</small><b>J. Mokoena</b></span></div>
      </div>
      <div className="gx-audit-line" aria-hidden><i /><i /><i /><i /></div>
      <ol className="gx-history">
        <li><time>14:06</time><i data-tone="good" /><div><b>Change approved</b><span>D. Nkosi approved quantity 48 → 60</span></div></li>
        <li><time>14:02</time><i data-tone="warn" /><div><b>Approval requested</b><span>Variance exceeded the 10% control</span></div></li>
        <li><time>14:02</time><i /><div><b>Duplicate merged</b><span>J. Mokoena combined two matching stock lines</span></div></li>
        <li><time>13:58</time><i /><div><b>Record validated</b><span>Required fields and location rules passed</span></div></li>
      </ol>
      <figcaption>Illustrative interface and records — not a client result.</figcaption>
    </figure>
  );
}
