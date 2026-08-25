"use client";

import { useState, type FormEvent } from "react";
import { RATES } from "@/lib/pricing";

type State = "idle" | "sending" | "sent" | "error";

/**
 * Posts to the same /api/contact endpoint the current site uses, so enquiries
 * land in the existing Brevo pipeline rather than a second inbox.
 */
export default function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget));

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
        return;
      }
      setState("sent");
    } catch {
      setError("Could not reach the server. Please try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="k-card">
        <span className="k-mono k-mono--ember">Received</span>
        <p className="k-sub mt-4">Thank you — that has landed.</p>
        <p className="k-sm mt-3">
          Someone will come back to you within one business day. If it is urgent,
          call the number on this page rather than waiting on email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          <input name="firstName" required className="k-field" placeholder="Thabo" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Last name *</span>
          <input name="lastName" required className="k-field" placeholder="Nkosi" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="k-mono">Work email *</span>
          <input type="email" name="email" required className="k-field" placeholder="you@company.co.za" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Company *</span>
          <input name="company" required className="k-field" placeholder="Company (Pty) Ltd" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="k-mono">Phone</span>
          <input name="phone" className="k-field" placeholder="+27 …" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="k-mono">Website</span>
          <input name="website" className="k-field" placeholder="company.co.za" />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="k-mono">The process that keeps going wrong</span>
        <textarea
          name="message"
          rows={5}
          className="k-field"
          placeholder="Which process, roughly how many people touch it, and what happens when it goes wrong."
        />
      </label>

      {error && (
        <p className="k-sm" style={{ color: "var(--ember)" }}>
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-5">
        <button type="submit" disabled={state === "sending"} className="k-btn k-btn--solid disabled:opacity-60">
          {state === "sending" ? "Sending…" : `Book a ${RATES.review} process review`}
        </button>
        <span className="k-mono">One business day · no mailing list</span>
      </div>
    </form>
  );
}
