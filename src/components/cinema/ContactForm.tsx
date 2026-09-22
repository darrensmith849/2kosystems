"use client";

import { useRef, useState, type FormEvent } from "react";
import { track, trackEvent, attribution } from "@/lib/analytics";
import TurnstileWidget, { verifyTurnstileToken } from "@/components/cinema/TurnstileWidget";

type State = "idle" | "sending" | "sent" | "error";
type Receipt = { reference: string; responseTarget: string };

const partnershipInterests = new Set([
  "improvement-programme",
  "operational-excellence",
  "transformation-office",
  "outcome-partnership",
]);

/**
 * Posts to the same /api/contact endpoint the current site uses, so enquiries
 * land in the same pipeline as every other enquiry.
 */
export default function ContactForm({ initialInterest = "" }: { initialInterest?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [interest, setInterest] = useState(initialInterest);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const started = useRef(false);
  const partnershipMode = partnershipInterests.has(interest);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);

    if (!(await verifyTurnstileToken(turnstileToken))) {
      setError("Please complete the security check and try again.");
      setState("error");
      setTurnstileReset((value) => value + 1);
      return;
    }

    setState("sending");

    const formData = new FormData(form);
    const data = {
      ...Object.fromEntries(formData),
      // Which ad, if any, paid for this visit.
      attribution: attribution(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        setState("error");
        setTurnstileReset((value) => value + 1);
        return;
      }
      track("enquiry");
      trackEvent("enquiry_submit", {
        offer: String(formData.get("interest") || "not-sure"),
      });
      setReceipt({
        reference: String(result.reference ?? ""),
        responseTarget: String(result.responseTarget ?? "Within one business day"),
      });
      setState("sent");
    } catch {
      setError("Could not reach the server. Please try again.");
      setState("error");
      setTurnstileReset((value) => value + 1);
    }
  }

  if (state === "sent") {
    return (
      <div className="k-card">
        <span className="k-mono k-mono--ember">Received</span>
        <p className="k-sub mt-4">Thank you — that has landed.</p>
        {receipt?.reference && (
          <p className="k-mono k-mono--ember mt-4">REFERENCE · {receipt.reference}</p>
        )}
        <p className="k-sm mt-3">
          {partnershipMode
            ? "We will review the operating brief and respond within one business day with the appropriate qualification conversation."
            : "We will review the process and respond within one business day with the appropriate next step. If the right answer is that nothing should be built, we will say so."}
        </p>
        <p className="k-mono mt-5">Human review · {receipt?.responseTarget ?? "Within one business day"}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocusCapture={() => {
        if (!started.current) {
          started.current = true;
          trackEvent("form_start", { form: "process enquiry" });
        }
      }}
      className="flex flex-col gap-4"
    >
      {/* Honeypot — real people never fill this in */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="k-mono">First name *</span>
          <input name="firstName" required maxLength={100} className="k-field" placeholder="Thabo" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Last name *</span>
          <input name="lastName" required maxLength={100} className="k-field" placeholder="Nkosi" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="k-mono">Work email *</span>
          <input type="email" name="email" required maxLength={254} className="k-field" placeholder="you@company.co.za" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Company *</span>
          <input name="company" required maxLength={180} className="k-field" placeholder="Company (Pty) Ltd" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="k-mono">Phone</span>
          <input name="phone" maxLength={80} className="k-field" placeholder="+27 …" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Site or region</span>
          <input name="siteRegion" maxLength={180} className="k-field" placeholder="Johannesburg · Gauteng" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="k-mono">Likely starting point</span>
          <select
            name="interest"
            className="k-field"
            value={interest}
            onChange={(event) => {
              setInterest(event.target.value);
              trackEvent("service_interest", { offer: event.target.value || "not-sure" });
            }}
          >
            <option value="">Not sure yet</option>
            <option value="process-review">Half-Day Process Review</option>
            <option value="audit">Process &amp; Automation Audit</option>
            <option value="automation">Process Automation</option>
            <option value="systems-automation">Systems &amp; Automation</option>
            <option value="training">Six Sigma &amp; Company Training</option>
            <option value="sigmafy">Sigmafy &amp; Statistical Tools</option>
            <option value="get-off-excel">Get Off Excel</option>
            <option value="job-card-system">Job Card System</option>
            <option value="sheq-incident-reporting">SHEQ Incident Reporting</option>
            <option value="contractor-compliance">Contractor Compliance Register</option>
            <option value="stock-and-asset-register">Stock &amp; Asset Register</option>
            <option value="website-project">Website Project</option>
            <option value="care">System Care</option>
            <option value="managed-systems">Managed Systems Partnership</option>
            <option value="improvement-programme">Improvement Programme</option>
            <option value="operational-excellence">Operational Excellence Partner</option>
            <option value="transformation-office">Transformation Office</option>
            <option value="outcome-partnership">Outcome Partnership</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Current process state</span>
          <select name="processState" className="k-field" defaultValue="">
            <option value="">Choose the closest fit</option>
            <option value="unclear">People describe it differently</option>
            <option value="agreed-manual">Agreed, but mostly manual</option>
            <option value="system-fragmented">System-supported, but fragmented</option>
            <option value="live-needs-improvement">Live and needs continuous improvement</option>
          </select>
        </label>
      </div>

      {partnershipMode && (
        <fieldset className="mt-2 overflow-hidden rounded-2xl border border-[rgba(232,142,74,.45)] bg-[linear-gradient(145deg,rgba(232,142,74,.08),rgba(0,0,0,.18)_58%)]">
          <legend className="sr-only">Partnership qualification</legend>
          <div className="flex flex-col gap-3 border-b border-[var(--hair-2)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><p className="k-mono k-mono--ember">PARTNERSHIP QUALIFICATION</p><h3 className="k-sub mt-2">Five signals for a useful first conversation.</h3></div>
            <span className="self-start rounded-full border border-[var(--hair-2)] px-3 py-1.5 font-[var(--mono)] text-[9px] uppercase tracking-[.12em] text-[var(--warm-45)]">Annual operating model</span>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <label className="flex flex-col gap-2">
              <span className="k-mono">01 · Executive sponsorship *</span>
              <select name="sponsorStatus" className="k-field" required defaultValue="">
                <option value="">Choose the closest fit</option>
                <option value="named">A sponsor is named and involved</option>
                <option value="engaged">An executive is engaged; role not confirmed</option>
                <option value="needed">Sponsorship still needs to be established</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="k-mono">02 · Active workstreams *</span>
              <select name="workstreamCount" className="k-field" required defaultValue="">
                <option value="">Choose the intended scope</option>
                <option value="1">One priority workstream</option>
                <option value="2">Two connected workstreams</option>
                <option value="3-5">Three to five workstreams</option>
                <option value="mapping">Still being mapped</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="k-mono">03 · Training population *</span>
              <select name="trainingPopulation" className="k-field" required defaultValue="">
                <option value="">Estimate the annual population</option>
                <option value="under-25">Fewer than 25 people</option>
                <option value="25-75">25–75 people</option>
                <option value="76-250">76–250 people</option>
                <option value="250-plus">More than 250 people</option>
                <option value="unknown">Not yet known</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="k-mono">04 · Baseline and data *</span>
              <select name="dataReadiness" className="k-field" required defaultValue="">
                <option value="">Describe the evidence position</option>
                <option value="baseline-live">Baseline and live measures exist</option>
                <option value="sources-exist">Data sources exist; baseline needs work</option>
                <option value="manual">Mostly manual or fragmented records</option>
                <option value="unknown">Evidence position is unknown</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="k-mono">05 · Decision window *</span>
              <select name="decisionTiming" className="k-field" required defaultValue="">
                <option value="">Choose the likely start window</option>
                <option value="0-3-months">Within 3 months</option>
                <option value="3-6-months">3–6 months</option>
                <option value="6-12-months">6–12 months</option>
                <option value="exploring">Exploring the model</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-4 border-t border-[var(--hair-2)]" aria-hidden="true">
            {["Improve", "Train", "Automate", "Measure"].map((lever, index) => <span key={lever} className="border-r border-[var(--hair)] px-2 py-3 text-center font-[var(--mono)] text-[8px] uppercase tracking-[.1em] text-[var(--warm-45)] last:border-r-0"><i className="mr-1 text-[var(--ember)] not-italic">0{index + 1}</i>{lever}</span>)}
          </div>
        </fieldset>
      )}

      <label className="flex flex-col gap-2">
        <span className="k-mono">{partnershipMode ? "The operating result you need to create *" : "The process that keeps going wrong *"}</span>
        <textarea
          name="message"
          required
          maxLength={4_000}
          rows={5}
          className="k-field"
          placeholder={partnershipMode ? "What must improve, why it matters now, and what would make the first year successful." : "Which process, roughly how many people touch it, and what happens when it goes wrong."}
        />
      </label>

      <p className="k-sm rounded-lg border border-[var(--hair-2)] bg-[var(--panel)] p-4">
        Please do not include employee records, medical details, passwords,
        customer data or other sensitive operational information. A short process
        description is enough for the first conversation.
      </p>

      <label className="flex items-start gap-3 text-[13px] text-[var(--warm-70)]">
        <input type="checkbox" name="consent" value="yes" required className="mt-1 accent-[var(--ember)]" />
        <span>I agree that 2KO may contact me about this enquiry. My details will not be added to a marketing list.</span>
      </label>

      <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />

      {error && (
        <p className="k-sm" style={{ color: "var(--ember)" }}>
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-5">
        <button type="submit" disabled={state === "sending" || !turnstileToken} className="k-btn k-btn--solid disabled:opacity-60">
          {state === "sending" ? "Sending…" : partnershipMode ? "Send the partnership brief" : "Send the process brief"}
        </button>
        <span className="k-mono">One business day · no mailing list</span>
      </div>
    </form>
  );
}
