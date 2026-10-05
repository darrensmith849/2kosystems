/**
 * The information-operations instrument: one request moving through its
 * owner with its context attached. Illustrative, not any client's data.
 * Deliberately photo-free and translucent so the section's own photograph
 * stays the image — the card is the interface laid over it.
 */

const stages = [
  { n: "01", label: "Enter", note: "08:12 · logged", state: "done" },
  { n: "02", label: "Resolve", note: "Case lead · now", state: "active" },
  { n: "03", label: "Record", note: "Evidence kept", state: "next" },
] as const;

const context = [
  ["ID documents", true],
  ["Signed mandate", true],
  ["Risk note", true],
  ["Call summary", false],
] as const;

export default function ServiceFlowCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/45 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="k-mono k-mono--ember">Service flow · Live pattern</p>
        <span className="flex items-center gap-2 rounded-full border border-[var(--signal)]/40 bg-[var(--signal)]/10 px-3 py-1.5 k-mono text-[var(--signal)]">
          <span className="k-dot" aria-hidden="true" />
          Visible
        </span>
      </div>

      <p className="k-mono mt-7">REQ-4471 · Client onboarding</p>
      <h3 className="k-sub mt-2 max-w-[24ch]">One request. One owner. The full context moves with it.</h3>

      <ol className="relative mt-9 grid grid-cols-3 gap-3">
        <span className="absolute left-[16.6%] right-[16.6%] top-[18px] h-px bg-[var(--hair-2)]" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[var(--signal)] to-[var(--ember)]" />
          <span className="k-token" />
        </span>
        {stages.map((s) => (
          <li key={s.n} className="relative flex flex-col items-center text-center">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-black k-num text-[13px]"
              style={{
                borderColor: s.state === "done" ? "var(--signal)" : s.state === "active" ? "var(--ember)" : "var(--hair-2)",
                color: s.state === "done" ? "var(--signal)" : s.state === "active" ? "var(--ember)" : "var(--warm-70)",
                boxShadow: s.state === "active" ? "0 0 18px rgba(217,169,90,.45)" : undefined,
              }}
            >
              {s.state === "done" ? "✓" : s.n}
            </span>
            <span className="k-mono mt-3 block text-[var(--warm)]">{s.label}</span>
            <span className="k-mono mt-1 block">{s.note}</span>
          </li>
        ))}
      </ol>

      <div className="mt-9 border-t border-[var(--hair)] pt-6">
        <p className="k-mono">Context attached · 3 of 4</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {context.map(([item, held]) => (
            <span
              key={item}
              className="rounded-full border px-3 py-1.5 k-mono"
              style={{
                borderColor: held ? "rgba(78,201,124,.35)" : "var(--hair)",
                color: held ? "var(--warm)" : "var(--warm-70)",
              }}
            >
              {held ? "✓ " : "○ "}
              {item}
            </span>
          ))}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-white/10 border-t border-[var(--hair)] pt-5 text-center">
        {[
          ["Owner", "1"],
          ["Handoffs", "2"],
          ["Context lost", "0"],
        ].map(([label, value], i) => (
          <div key={label} className="flex flex-col-reverse">
            <dt className="k-mono mt-1">{label}</dt>
            <dd className="k-num text-[20px]" style={{ color: i === 2 ? "var(--signal)" : "var(--warm)" }}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
