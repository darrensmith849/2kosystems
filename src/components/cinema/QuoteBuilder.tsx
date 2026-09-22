"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { QUESTIONS, resolve, outcomeHeadline, type Answers } from "@/lib/quote";
import { RATES } from "@/lib/pricing";
import { track, attribution } from "@/lib/analytics";
import TurnstileWidget, { verifyTurnstileToken } from "@/components/cinema/TurnstileWidget";

/**
 * Structured scope builder.
 *
 * Buttons rather than free text on purpose: a conversational flow that ends in
 * a rand figure is where a tool invents a commitment nobody can honour. Every
 * path here lands on a price already published elsewhere on the site, or
 * refuses to quote and says why.
 *
 * The price is never gated. The emailed brief is.
 */
export default function QuoteBuilder() {
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  const outcome = useMemo(() => resolve(answers), [answers]);

  // Once per visitor, on the first complete scope. Changing an answer
  // afterwards must not log a second conversion.
  const scopeLogged = useRef(false);
  useEffect(() => {
    if (outcome && !scopeLogged.current) {
      scopeLogged.current = true;
      track("scope");
    }
  }, [outcome]);
  const answered = QUESTIONS.filter((q) => answers[q.id]).length;
  const headline = outcome ? outcomeHeadline(outcome) : null;

  function choose(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setState("idle");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!(await verifyTurnstileToken(turnstileToken))) {
      setError("Please complete the security check and try again.");
      setState("error");
      setTurnstileReset((value) => value + 1);
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers, attribution: attribution() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not send that. Please try again.");
        setState("error");
        setTurnstileReset((value) => value + 1);
        return;
      }
      track("brief");
      setState("sent");
    } catch {
      setError("Could not reach the server. Please try again.");
      setState("error");
      setTurnstileReset((value) => value + 1);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      {/* ── Questions ── */}
      <div className="k-app">
        <div className="k-app-bar">
          <span className="k-mono">Scope builder</span>
          <span className="k-mono tabular-nums">
            {answered} / {QUESTIONS.length}
          </span>
        </div>

        <div className="p-5 lg:p-7">
          {QUESTIONS.map((question, i) => {
            const locked = i > 0 && !answers[QUESTIONS[i - 1].id];
            return (
              <fieldset
                key={question.id}
                disabled={locked}
                className="pb-7"
                style={{ opacity: locked ? 0.35 : 1, transition: "opacity 400ms var(--ease)" }}
              >
                <legend className="k-mono">
                  {String(i + 1).padStart(2, "0")} — {question.label}
                </legend>
                {question.help && <p className="k-sm mt-2">{question.help}</p>}

                <div className="mt-4 flex flex-col gap-2">
                  {question.options.map((option) => {
                    const active = answers[question.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(question.id, option.value)}
                        className="k-choice"
                        data-active={active}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="k-choice-dot" data-active={active} />
                          <span>{option.label}</span>
                        </span>
                        {option.note && <span className="k-mono">{option.note}</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      {/* ── Live result ── */}
      <div className="lg:sticky lg:top-24">
        <div className="k-card">
          <div className="flex items-center justify-between">
            <span className="k-mono">Your scope</span>
            <span className="k-dot" />
          </div>

          {!outcome && (
            <div className="mt-5">
              <p className="k-sm">
                Answer the questions and this assembles as you go. Whatever it
                lands on, you see the price here — no email required for that.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="flex items-center gap-2.5">
                    <span className="k-choice-dot" data-active={Boolean(answers[q.id])} />
                    <span
                      className="text-[12.5px]"
                      style={{ color: answers[q.id] ? "var(--warm)" : "var(--warm-25)" }}
                    >
                      {q.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outcome && headline && (
            <div className="mt-5">
              <p
                className="k-mono"
                style={{ color: outcome.kind === "pilot" || outcome.kind === "review" ? "var(--ember)" : "var(--signal)" }}
              >
                {outcome.kind === "pilot"
                  ? "Not a fixed-price product"
                  : outcome.kind === "review"
                    ? "Start one step earlier"
                    : "Fixed price, published scope"}
              </p>

              <h3 className="k-sub mt-3">{headline.name}</h3>
              <p className="k-num mt-3 text-[30px] leading-none">{headline.price}</p>
              <p className="k-mono mt-2">ex VAT · {headline.timebox}</p>

              <div className="k-hairline mt-5 pt-4">
                <p className="k-mono">Why</p>
                <ul className="mt-2.5 flex flex-col gap-2">
                  {outcome.because.map((reason) => (
                    <li key={reason} className="flex gap-2.5 text-[12.5px] leading-[1.5]">
                      <span
                        style={{
                          color:
                            outcome.kind === "pilot" || outcome.kind === "review"
                              ? "var(--ember)"
                              : "var(--signal)",
                        }}
                      >
                        —
                      </span>
                      <span style={{ color: "var(--warm-70)" }}>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {outcome.kind === "product" && (
                <div className="k-hairline mt-4 pt-4">
                  <p className="k-mono">Included</p>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {outcome.product.included.slice(0, 5).map((item) => (
                      <li key={item} className="flex gap-2.5 text-[12px] leading-[1.45]">
                        <span style={{ color: "var(--signal)" }}>—</span>
                        <span style={{ color: "var(--warm-70)" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="k-mono mt-3">
                    + {outcome.product.included.length - 5} more · {outcome.product.excluded.length} exclusions
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2">
                <Link href={headline.href} className="k-btn k-btn--ghost w-full">
                  See the full scope
                </Link>
                <Link href="/contact" className="k-btn k-btn--solid w-full">
                  Book a free scoping call
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── The brief. The only thing behind an email. ── */}
        {outcome && (
          <div className="k-card mt-4">
            {state === "sent" ? (
              <>
                <span className="k-mono" style={{ color: "var(--signal)" }}>
                  Sent
                </span>
                <p className="k-sm mt-3">
                  The brief is on its way to {email}. It is written to be forwarded
                  — scope, price, exclusions and what happens next, on one page.
                </p>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                <span className="k-mono">Send yourself the brief</span>
                <p className="k-sm mt-2.5">
                  A one-page summary of this scope you can forward to whoever signs
                  it off. You already have the price — this is just the paperwork.
                </p>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.co.za"
                  className="k-field mt-4"
                />
                <div className="mt-4">
                  <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
                </div>
                {error && (
                  <p className="k-mono mt-2" style={{ color: "var(--alert)" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={state === "sending" || !turnstileToken}
                  className="k-btn k-btn--ghost mt-3 w-full disabled:opacity-60"
                >
                  {state === "sending" ? "Sending…" : "Email me the brief"}
                </button>
                <p className="k-mono mt-3">
                  One email. No list. No sequence.
                </p>
              </form>
            )}
          </div>
        )}

        <p className="k-mono mt-4 leading-[1.6]">
          Indicative only. A fixed price is confirmed after a scoping call — and
          if your version is bigger than the box, we say so then rather than after
          the invoice. Out-of-scope work is {RATES.dayRate} per day, quoted first.
        </p>
      </div>
    </div>
  );
}
