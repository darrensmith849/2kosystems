"use client";

import { useState, type FormEvent } from "react";
import TurnstileWidget, { verifyTurnstileToken } from "@/components/cinema/TurnstileWidget";
import { PRODUCTS } from "@/lib/kos/catalogue";

type State = "idle" | "sending" | "sent" | "error";

export default function ApplyForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!(await verifyTurnstileToken(token))) {
      setError("Please complete the security check and try again.");
      setState("error");
      setReset((value) => value + 1);
      return;
    }

    setState("sending");
    const form = new FormData(event.currentTarget);
    const data = {
      ...Object.fromEntries(form),
      products: form.getAll("products"),
      sourcePage: window.location.pathname,
    };

    try {
      const response = await fetch("/api/kos/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({ ok: false }));
      if (!response.ok || !result.ok) throw new Error(result.error || "Could not send that. Please try again.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that. Please try again.");
      setState("error");
      setReset((value) => value + 1);
    }
  }

  if (state === "sent") {
    return (
      <div className="ks-done" role="status">
        <p className="k-mono k-mono--ember">Thank you</p>
        <h2 className="k-title" style={{ marginTop: 10 }}>
          We&apos;ve got it.
        </h2>
        <p className="k-lead" style={{ marginTop: 10 }}>
          We&apos;ll call you within two working days. Look out for an email from us too.
        </p>
      </div>
    );
  }

  return (
    <form className="ks-form" onSubmit={onSubmit} noValidate={false}>
      <div className="ks-form-2">
        <label>
          <span>Your name</span>
          <input className="k-field" name="name" required autoComplete="name" />
        </label>
        <label>
          <span>Business name</span>
          <input className="k-field" name="company" required autoComplete="organization" />
        </label>
        <label>
          <span>Email</span>
          <input className="k-field" name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          <span>Phone or WhatsApp</span>
          <input className="k-field" name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <div className="ks-form-2">
        <label>
          <span>What do you do?</span>
          <select className="k-field" name="kind" defaultValue="" required>
            <option value="" disabled>
              Choose one
            </option>
            <option>Marketing agency</option>
            <option>Web designer</option>
            <option>Consultant or bookkeeper</option>
            <option>IT support</option>
            <option>Something else</option>
          </select>
        </label>
        <label>
          <span>How many small-business clients?</span>
          <select className="k-field" name="clients" defaultValue="" required>
            <option value="" disabled>
              Choose one
            </option>
            <option>1 to 10</option>
            <option>11 to 50</option>
            <option>51 to 200</option>
            <option>More than 200</option>
          </select>
        </label>
      </div>
      <fieldset>
        <span className="k-sm" style={{ display: "block", marginBottom: 8, fontSize: 12.5 }}>
          What would you sell? (pick any)
        </span>
        <div className="ks-checks">
          {PRODUCTS.map((p) => (
            <label key={p.key}>
              <input type="checkbox" name="products" value={p.name} /> {p.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span>Your website (if you have one)</span>
        <input className="k-field" name="website" type="url" placeholder="https://" autoComplete="url" />
      </label>
      <label>
        <span>Anything else? (optional)</span>
        <textarea className="k-field" name="message" maxLength={2000} />
      </label>
      <label className="ks-hp" aria-hidden="true">
        Leave this empty
        <input name="honeypot" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="ks-consent">
        <input type="checkbox" name="consent" value="yes" required />
        <span>You can contact me about becoming a partner. (We don&apos;t share your details.)</span>
      </label>
      <TurnstileWidget onToken={setToken} resetKey={reset} />
      {error ? (
        <p className="ks-form-msg" data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="k-btn k-btn--solid" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
