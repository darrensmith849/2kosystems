"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      company: String(formData.get("company") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      website: "",
      message: String(formData.get("message") || "").trim(),
      honeypot: String(formData.get("hp") || "").trim(),
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.company) {
      setErrorMessage("Please fill in name, email and company.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setErrorMessage("That email doesn't look right.");
      setStatus("error");
      return;
    }

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
        e.currentTarget.reset();
      }
    } catch {
      setErrorMessage("Couldn't send that through — please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-6 text-center">
        <p className="text-base font-semibold text-text">Thanks — your message is in.</p>
        <p className="mt-2 text-sm text-muted">
          A member of the 2KO Systems team will reach out within one business day.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-text placeholder:text-muted2 focus:border-accent/60 focus:outline-none";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted2";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" />

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

      <div>
        <label htmlFor="email" className={labelClass}>Work email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>Company</label>
          <input id="company" name="company" type="text" autoComplete="organization" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us about the workflow or system you'd like to discuss."
          className={inputClass}
        />
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex items-center justify-center rounded-full border border-accent-border bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent2 hover:text-black disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      <p className="text-xs text-muted2">
        Prefer email? <a href="mailto:darren@2kosystems.com" className="text-accent transition-colors hover:text-accent2">darren@2kosystems.com</a>
      </p>
    </form>
  );
}
