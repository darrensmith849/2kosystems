"use client";

import { useState, type FormEvent } from "react";

/* "What would your business email look like?" Type the business name (or
   the website you already have) and see which addresses could be yours. */

type Result = { domain: string; status: "free" | "taken" | "unknown"; mail: string | null };

export default function EmailTry() {
  const [name, setName] = useState("");
  const [first, setFirst] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  const local = (first.trim().toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g) ?? []).join("") || "hello";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/kos/domain-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || "Couldn't check just now.");
      setResults(out.results);
    } catch (err) {
      setResults(null);
      setError(err instanceof Error ? err.message : "Couldn't check just now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ks-emailtry">
      <form className="ks-form" onSubmit={onSubmit}>
        <div className="ks-form-2">
          <label>
            <span>Business name, or the website you have</span>
            <input className="k-field" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Studio Thandi" />
          </label>
          <label>
            <span>Your first name (optional)</span>
            <input className="k-field" value={first} maxLength={30} onChange={(e) => setFirst(e.target.value)} placeholder="Thandi" />
          </label>
        </div>
        <button className="k-btn k-btn--solid" type="submit" disabled={busy || name.trim().length < 3} style={{ justifySelf: "start" }}>
          {busy ? "Checking…" : "Show me my address"}
        </button>
        {error ? <p className="ks-form-msg" data-tone="error" role="alert">{error}</p> : null}
      </form>

      <div className="ks-emailtry-out" aria-live="polite">
        {results ? (
          results.map((r) => (
            <div key={r.domain} className="ks-emailtry-row" data-status={r.status}>
              <span className="ks-emailtry-addr">
                {local}@{r.domain}
              </span>
              <span className="ks-emailtry-note">
                {r.status === "free"
                  ? "Looks free. We can buy it for you."
                  : r.status === "taken"
                    ? r.mail
                      ? `In use, with email on ${r.mail}. If it's yours, we can set it up properly.`
                      : "In use. If it's yours, we can add email to it."
                    : "Couldn't tell. We'll check by hand."}
              </span>
            </div>
          ))
        ) : (
          <div className="ks-emailtry-row ks-emailtry-row--ghost">
            <span className="ks-emailtry-addr">{local}@yourbusiness.co.za</span>
            <span className="ks-emailtry-note">Type your business name to see what yours could be.</span>
          </div>
        )}
        <p className="ks-chatdemo-note">
          We check public records. A name can look free and still be reserved, so we confirm before buying anything.
        </p>
      </div>
    </div>
  );
}
