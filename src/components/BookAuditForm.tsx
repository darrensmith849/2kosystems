"use client";

import { useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  website: string;
  message: string;
  honeypot: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  phone: "",
  website: "",
  message: "",
  honeypot: "",
};

export default function BookAuditForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/book-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccess("Thanks — your request has been sent.");
      setForm(initialState);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="First name"
          value={form.firstName}
          onChange={(v) => updateField("firstName", v)}
          required
        />
        <Field
          label="Last name"
          value={form.lastName}
          onChange={(v) => updateField("lastName", v)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => updateField("email", v)}
          required
        />
        <Field
          label="Company"
          value={form.company}
          onChange={(v) => updateField("company", v)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => updateField("phone", v)}
        />
        <Field
          label="Website"
          value={form.website}
          onChange={(v) => updateField("website", v)}
        />
      </div>

      <div className="hidden">
        <Field
          label="Leave this empty"
          value={form.honeypot}
          onChange={(v) => updateField("honeypot", v)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Tell us about the workflow you want to improve
        </label>
        <textarea
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
          placeholder="Example: approvals, reporting, manual admin, onboarding, field operations, travel workflows..."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Book a Systems Audit"}
        </button>

        {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
      />
    </div>
  );
}
