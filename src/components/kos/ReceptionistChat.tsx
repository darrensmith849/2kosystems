"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import TurnstileWidget from "@/components/cinema/TurnstileWidget";

/* Talk to the Receptionist. It answers as a sample salon, or as your own
   business if you tell it a few things. Labelled a demo throughout: nothing
   is really booked, and it only says what it was told. */

type Turn = { role: "user" | "assistant"; text: string };

const SUGGEST = ["How much is a cut and colour?", "Can I come in on Saturday?", "Do you do nails?", "Where do I park?"];
const MAX_TURNS = 8;

export default function ReceptionistChat({ partnerName }: { partnerName?: string }) {
  const [mode, setMode] = useState<"sample" | "own">("sample");
  const [ownName, setOwnName] = useState("");
  const [ownFacts, setOwnFacts] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<string | null>(null);
  const [check, setCheck] = useState("");
  const [needCheck, setNeedCheck] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const own = mode === "own";
  const ownReady = ownName.trim().length >= 2 && ownFacts.trim().length >= 20;
  const name = own ? ownName.trim() || "Your business" : "Studio Thandi";
  const used = turns.filter((t) => t.role === "user").length;
  const done = used >= MAX_TURNS;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  function restart(next: "sample" | "own" = mode) {
    setMode(next);
    setTurns([]);
    setError(null);
  }

  async function send(message: string) {
    const clean = message.trim().slice(0, 500);
    if (!clean || busy || done) return;
    if (own && !ownReady) {
      setError("Add your business name and a few facts first.");
      return;
    }
    const next: Turn[] = [...turns, { role: "user", text: clean }];
    setTurns(next);
    setText("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/kos/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket,
          turnstile: check || undefined,
          business: own ? { name: ownName, facts: ownFacts } : null,
          messages: next,
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.status === 403 && out.error === "check") {
        setNeedCheck(true);
        setTurns(turns);
        setText(clean);
        setError(out.message ?? "Please complete the quick check first.");
        return;
      }
      if (!res.ok || !out.ok) throw new Error(out.error || "The demo couldn't answer just now.");
      setTicket(out.ticket ?? null);
      setNeedCheck(false);
      setTurns([...next, { role: "assistant", text: out.reply }]);
    } catch (err) {
      setTurns(turns);
      setText(clean);
      setError(err instanceof Error ? err.message : "The demo couldn't answer just now.");
      setResetKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  return (
    <div className="ks-chatdemo">
      <div className="ks-chatdemo-side">
        <div className="ks-chatdemo-modes" role="tablist" aria-label="Who it answers as">
          <button type="button" role="tab" aria-selected={!own} onClick={() => restart("sample")}>
            A sample salon
          </button>
          <button type="button" role="tab" aria-selected={own} onClick={() => restart("own")}>
            {partnerName ? "Your business" : "Your own business"}
          </button>
        </div>

        {own ? (
          <div className="ks-form ks-chatdemo-own">
            <label>
              <span>Business name</span>
              <input className="k-field" value={ownName} maxLength={60} onChange={(e) => { setOwnName(e.target.value); setTurns([]); }} placeholder="Mo's Plumbing" />
            </label>
            <label>
              <span>A few facts: what you do, prices, hours, area</span>
              <textarea
                className="k-field"
                value={ownFacts}
                maxLength={1500}
                rows={6}
                onChange={(e) => { setOwnFacts(e.target.value); setTurns([]); }}
                placeholder={"Plumber in Durban North. Call-out R450, then R380 an hour.\nOpen Mon–Fri 7:00–17:00, emergencies on weekends.\nWe don't do gas installations."}
              />
            </label>
            <p className="k-sm">It will only say what you write here. Ask it something you didn&apos;t write and watch it hand over.</p>
          </div>
        ) : (
          <div className="ks-chatdemo-about">
            <p className="k-mono k-mono--ember">Studio Thandi</p>
            <p className="k-sm">
              A made-up hair salon in Somerset West, with real-looking prices, hours and open times. Ask it anything a
              customer would. Try asking for something it doesn&apos;t do.
            </p>
          </div>
        )}
        <p className="ks-chatdemo-note">Demo. Nothing is really booked. Please don&apos;t type personal details.</p>
      </div>

      <div className="ks-phone ks-chatdemo-phone">
        <div className="ks-phone-bar">
          <span className="ks-avatar">{(name.charAt(0) || "?").toUpperCase()}</span>
          <span className="ks-phone-who">
            <b>{name}</b>
            <small>{busy ? "typing…" : "online"}</small>
          </span>
        </div>
        <div className="ks-chat ks-chatdemo-list" ref={listRef} aria-live="polite">
          {turns.length === 0 ? (
            <div className="ks-chatdemo-start">
              <p>Send a message the way a customer would.</p>
              <div className="ks-chatdemo-suggest">
                {(own ? ["What do you charge?", "Are you open on Saturday?", "Can I book for tomorrow?"] : SUGGEST).map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)} disabled={busy || (own && !ownReady)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {turns.map((t, i) => (
            <p key={i} className={`ks-msg ${t.role === "user" ? "ks-msg--in" : "ks-msg--out"}`} data-on="true">
              {t.text}
            </p>
          ))}
          {busy ? (
            <p className="ks-msg ks-msg--out ks-chatdemo-typing" data-on="true" aria-label="typing">
              <i />
              <i />
              <i />
            </p>
          ) : null}
        </div>
        {needCheck ? (
          <div className="ks-chatdemo-check">
            <TurnstileWidget compact onToken={setCheck} resetKey={resetKey} />
          </div>
        ) : null}
        {error ? <p className="ks-chatdemo-error" role="alert">{error}</p> : null}
        {done ? (
          <div className="ks-chatdemo-done">
            <span>That&apos;s the end of this demo chat.</span>
            <button type="button" onClick={() => restart()}>Start again</button>
          </div>
        ) : (
          <form className="ks-chatdemo-input" onSubmit={onSubmit}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              placeholder="Type a message"
              aria-label="Your message"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !text.trim()} aria-label="Send">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
