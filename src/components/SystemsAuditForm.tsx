"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const INDUSTRIES = [
  "Mining",
  "Agriculture",
  "Logistics & Fleet",
  "Industrial / Technical Services",
  "Compliance / Audit-heavy",
  "Multi-branch Operations",
  "Training & Accreditation",
  "Other",
];

const URGENCY = [
  { value: "exploring", label: "Exploring (no deadline)" },
  { value: "this-quarter", label: "This quarter" },
  { value: "this-month", label: "This month" },
  { value: "asap", label: "Urgent (asap)" },
];

const NEXT_STEP = [
  { value: "audit", label: "Systems Opportunity Audit" },
  { value: "pilot", label: "Proof-of-Value Pilot" },
  { value: "unsure", label: "Not sure yet — guide me" },
];

/**
 * Visible audit-request form that does NOT depend on the chat widget.
 * Posts to the existing /api/book-audit Brevo endpoint. The endpoint
 * accepts firstName/lastName/email/company/phone/website/message, so
 * the rich qualifying fields are concatenated into the message body
 * with clear labels for the team picking up the lead.
 */
export default function SystemsAuditForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    // Capture the form element synchronously — React nulls out
    // e.currentTarget after the handler returns, so any reference
    // we want to use after the await must be cached now.
    const formEl = e.currentTarget;
    const f = new FormData(formEl);

    const firstName = String(f.get("firstName") || "").trim();
    const lastName = String(f.get("lastName") || "").trim();
    const email = String(f.get("email") || "").trim().toLowerCase();
    const company = String(f.get("company") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    const industry = String(f.get("industry") || "").trim();
    const workflow = String(f.get("workflow") || "").trim();
    const current = String(f.get("current") || "").trim();
    const urgency = String(f.get("urgency") || "").trim();
    const nextStep = String(f.get("nextStep") || "").trim();
    const honeypot = String(f.get("hp") || "").trim();

    if (!firstName || !lastName || !email || !company) {
      setErrorMessage("Please fill in name, email and company.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("That email doesn't look right.");
      setStatus("error");
      return;
    }

    const messageLines = [
      industry ? `Industry: ${industry}` : null,
      urgency ? `Urgency: ${urgency}` : null,
      nextStep ? `Preferred next step: ${nextStep}` : null,
      "",
      "Workflow / operational problem to fix:",
      workflow || "—",
      "",
      "How they handle this currently:",
      current || "—",
    ]
      .filter((line) => line !== null)
      .join("\n");

    const payload = {
      firstName,
      lastName,
      email,
      company,
      phone,
      website: "",
      message: messageLines,
      honeypot,
    };

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/book-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setErrorMessage(data.error || "Couldn't send that through — please try again.");
        setStatus("error");
      } else {
        setStatus("success");
        // Reset the cached form element — e.currentTarget is null
        // by the time this async branch runs.
        formEl.reset();
      }
    } catch {
      setErrorMessage("Couldn't send that through — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-8 text-center">
        <p className="text-base font-semibold text-text">
          Request received.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A member of the 2KO Systems team will review what you&apos;ve shared and reach out within one business day to schedule the next step.
        </p>
        <p className="mt-4 text-xs text-muted2">
          Prefer email?{" "}
          <a href="mailto:darren@2kosystems.com" className="text-accent transition-colors hover:text-accent2">
            darren@2kosystems.com
          </a>
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full truncate rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-text placeholder:text-muted2 focus:border-accent/60 focus:outline-none";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {/* Identity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>First name</label>
          <input id="firstName" name="firstName" type="text" autoComplete="given-name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last name</label>
          <input id="lastName" name="lastName" type="text" autoComplete="family-name" required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>Company</label>
          <input id="company" name="company" type="text" autoComplete="organization" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="industry" className={labelClass}>Industry</label>
          <select id="industry" name="industry" defaultValue="" className={inputClass}>
            <option value="" disabled>Select an industry…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Qualifying questions */}
      <div>
        <label htmlFor="workflow" className={labelClass}>What workflow or operational problem do you want to fix?</label>
        <textarea
          id="workflow"
          name="workflow"
          rows={3}
          placeholder="e.g. Maintenance approval requests bouncing across email and WhatsApp; no clear audit trail."
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="current" className={labelClass}>How are you handling this currently?</label>
        <textarea
          id="current"
          name="current"
          rows={3}
          placeholder="e.g. Spreadsheets, paper forms, branch admins consolidating manually each week."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="urgency" className={labelClass}>How urgent is this?</label>
          <select id="urgency" name="urgency" defaultValue="" className={inputClass}>
            <option value="" disabled>Select urgency…</option>
            {URGENCY.map((u) => (
              <option key={u.value} value={u.label}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nextStep" className={labelClass}>Preferred next step</label>
          <select id="nextStep" name="nextStep" defaultValue="" className={inputClass}>
            <option value="" disabled>Select…</option>
            {NEXT_STEP.map((n) => (
              <option key={n.value} value={n.label}>{n.label}</option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex items-center justify-center rounded-full border border-accent-border bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent2 hover:text-black disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Request a Systems Audit"}
      </button>

      <p className="text-xs text-muted2">
        Prefer email?{" "}
        <a href="mailto:darren@2kosystems.com" className="text-accent transition-colors hover:text-accent2">
          darren@2kosystems.com
        </a>
      </p>
    </form>
  );
}
