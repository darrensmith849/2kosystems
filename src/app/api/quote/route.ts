import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, sendRaw, notifyRecipients, escapeHtml } from "@/lib/email";
import { resolve, outcomeHeadline, QUESTIONS, type Answers } from "@/lib/quote";
import { RATES } from "@/lib/pricing";

const SITE = "https://www.2kosystems.com";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; answers?: Answers };
    const email = String(body.email ?? "").trim().toLowerCase();
    const answers = body.answers ?? {};

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    // Re-resolve server-side. The client's answer is never trusted to carry a
    // price — the outcome is recomputed from the same rules.
    const outcome = resolve(answers);
    if (!outcome) {
      return NextResponse.json({ ok: false, error: "That scope is incomplete." }, { status: 400 });
    }

    const head = outcomeHeadline(outcome);
    const chosen = QUESTIONS.map((q) => {
      const option = q.options.find((o) => o.value === answers[q.id]);
      return option ? { q: q.label, a: option.label } : null;
    }).filter(Boolean) as { q: string; a: string }[];

    const row = (k: string, v: string) =>
      `<tr><td style="padding:5px 0;color:#7c8079;font-size:13px;">${escapeHtml(k)}</td><td style="padding:5px 0;font-size:13px;text-align:right;">${escapeHtml(v)}</td></tr>`;

    const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#101311;">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e4e4e0;border-radius:10px;padding:28px;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">Scope brief</p>
<h1 style="margin:0 0 6px;font-size:22px;font-weight:600;">${escapeHtml(head.name)}</h1>
<p style="margin:0 0 20px;font-size:26px;font-weight:600;letter-spacing:-.02em;">${escapeHtml(head.price)}
<span style="font-size:13px;font-weight:400;color:#7c8079;">ex VAT · ${escapeHtml(head.timebox)}</span></p>

<p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">Why this</p>
<ul style="margin:0 0 20px;padding-left:18px;font-size:13px;line-height:1.65;color:#3f4642;">
${outcome.because.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
</ul>

<p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">What you told us</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
${chosen.map((c) => row(c.q, c.a)).join("")}
</table>

${
  outcome.kind === "product"
    ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7c8079;">Not included</p>
<ul style="margin:0 0 20px;padding-left:18px;font-size:13px;line-height:1.65;color:#7c8079;">
${outcome.product.excluded.slice(0, 5).map((e) => `<li>${escapeHtml(e)}</li>`).join("")}
</ul>`
    : ""
}

<p style="margin:0 0 20px;font-size:13px;line-height:1.65;color:#3f4642;">
This is indicative. A fixed price is confirmed after a scoping call, which is free and takes about
thirty minutes. If your version turns out to be bigger than this box, we say so then rather than
after the invoice. Out-of-scope work is ${escapeHtml(RATES.dayRate)} per day, quoted and approved before it starts.
</p>

<p style="margin:0 0 22px;">
<a href="${SITE}${head.href}" style="color:#0f6b34;font-weight:600;text-decoration:none;">Full scope →</a>
&nbsp;&nbsp;
<a href="${SITE}/contact" style="color:#0f6b34;font-weight:600;text-decoration:none;">Book a scoping call →</a>
</p>

<hr style="border:none;border-top:1px solid #e4e4e0;margin:0 0 16px;" />
<p style="margin:0;font-size:12px;color:#7c8079;">2KO Systems · Operational systems for South African industry<br />
<a href="${SITE}" style="color:#0f6b34;">2kosystems.com</a></p>
</div></body></html>`;

    const text = [
      `Scope brief — ${head.name}`,
      `${head.price} ex VAT · ${head.timebox}`,
      "",
      "Why this:",
      ...outcome.because.map((b) => `- ${b}`),
      "",
      "What you told us:",
      ...chosen.map((c) => `- ${c.q} ${c.a}`),
      "",
      `Indicative only. A fixed price is confirmed after a free scoping call. Out-of-scope work is ${RATES.dayRate} per day, quoted first.`,
      "",
      `${SITE}${head.href}`,
    ].join("\n");

    await sendRaw({
      to: email,
      subject: `Your scope brief — ${head.name}, ${head.price}`,
      html,
      text,
    });

    // Tell the team a scope was built. Best-effort: the visitor already has
    // their brief, so a failure here must not surface to them.
    try {
      await sendRaw({
        to: notifyRecipients(),
        subject: `Scope built — ${head.name} (${head.price}) · ${email}`,
        html: `<p><strong>${escapeHtml(email)}</strong> built a scope on the site.</p>
<p>Outcome: <strong>${escapeHtml(head.name)}</strong> — ${escapeHtml(head.price)}, ${escapeHtml(head.timebox)}</p>
<table style="border-collapse:collapse;">${chosen.map((c) => row(c.q, c.a)).join("")}</table>`,
        text: `${email} built a scope.\n\n${head.name} — ${head.price}, ${head.timebox}\n\n${chosen.map((c) => `${c.q} ${c.a}`).join("\n")}`,
        replyTo: email,
      });
    } catch (err) {
      console.error("quote notification failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/quote failed", error);
    return NextResponse.json({ ok: false, error: "Could not send that. Please try again." }, { status: 500 });
  }
}
