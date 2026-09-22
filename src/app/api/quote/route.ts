import { NextRequest, NextResponse } from "next/server";
import {
  isValidEmail,
  sendRaw,
  notifyRecipients,
  escapeHtml,
  renderBrandedEmail,
  renderEmailButton,
  renderEmailDetailRows,
  renderEmailStatusPanel,
} from "@/lib/email";
import { resolve, outcomeHeadline, QUESTIONS, type Answers } from "@/lib/quote";
import { RATES } from "@/lib/pricing";
import { SITE_URL as SITE } from "@/lib/site";
import { apiErrorResponse, readProtectedJson } from "@/lib/api-protection";

export async function POST(req: NextRequest) {
  try {
    const body = await readProtectedJson<{ email?: string; answers?: Answers }>(req, {
      endpoint: "quote",
      limit: 12,
      windowMs: 10 * 60 * 1000,
    });
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

    const html = renderBrandedEmail({
      eyebrow: "Scope builder · indicative brief",
      title: head.name,
      intro: "A published starting point assembled from the five scope decisions you made on the 2KO site.",
      identityLabel: "2KO Scope Builder",
      identityMeta: "Published price · human confirmation",
      preheader: `${head.name} · ${head.price} ex VAT · ${head.timebox}`,
      accent: "ember",
      footer: "Sent because you asked the scope builder to email this brief",
      body: `
${renderEmailStatusPanel({
  label: "Published starting price",
  title: `${head.price} ex VAT · ${head.timebox}`,
  body: "The price becomes fixed once the boundary is confirmed in a free scoping call.",
  accent: "ember",
})}
<p style="margin:0 0 7px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Why this route</p>
<ul style="margin:0 0 28px;padding-left:20px;color:#b4b8bf;font-size:13px;line-height:1.75;">
${outcome.because.map((reason) => `<li style="padding-left:3px;">${escapeHtml(reason)}</li>`).join("")}
</ul>
<p style="margin:0 0 7px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">What you told us</p>
${renderEmailDetailRows(chosen.map((choice) => [choice.q, choice.a]))}
${outcome.kind === "product" ? `<div style="margin-top:28px;padding:19px 20px;border:1px solid #292c31;border-radius:8px;background:#0b0c0d;"><p style="margin:0 0 9px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Not included in this box</p><ul style="margin:0;padding-left:19px;color:#8a8f98;font-size:12px;line-height:1.75;">${outcome.product.excluded.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
<p style="margin:25px 0 0;color:#b4b8bf;font-size:13px;line-height:1.7;">If your version is bigger than this scope, we will say so before work begins. Out-of-scope work is ${escapeHtml(RATES.dayRate)} per day and is always quoted for approval first.</p>
${renderEmailButton("View the full scope", `${SITE}${head.href}`, "ember")}
<p style="margin:16px 0 0;color:#8a8f98;font-size:12px;line-height:1.6;"><a href="${SITE}/contact" style="color:#b4b8bf;text-decoration:underline;">Book the free scoping call</a> to confirm the boundary.</p>`,
    });

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
      const internalHtml = renderBrandedEmail({
        eyebrow: "Scope builder activity",
        title: `${email} built a ${head.name} scope`,
        intro: "The visitor has received their own copy. This is the internal follow-up record.",
        identityLabel: "2KO Scope Builder",
        identityMeta: "Commercial signal · follow-up required",
        preheader: `${head.name} · ${head.price} · ${email}`,
        accent: "info",
        footer: "Internal notification · verify fit before quoting",
        body: `
${renderEmailStatusPanel({
  label: "Indicative outcome",
  title: `${head.name} · ${head.price}`,
  body: `${head.timebox}. Confirm scope and fit with the visitor before treating this as a fixed quotation.`,
  accent: "info",
})}
<p style="margin:0 0 7px;color:#8a8f98;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;">Scope answers</p>
${renderEmailDetailRows([["Email", email], ...chosen.map((choice) => [choice.q, choice.a] as [string, string])])}
${renderEmailButton("Reply to visitor", `mailto:${email}`, "info")}`,
      });

      await sendRaw({
        to: notifyRecipients(),
        subject: `Scope built — ${head.name} (${head.price}) · ${email}`,
        html: internalHtml,
        text: `${email} built a scope.\n\n${head.name} — ${head.price}, ${head.timebox}\n\n${chosen.map((c) => `${c.q} ${c.a}`).join("\n")}`,
        replyTo: email,
      });
    } catch (err) {
      console.error("quote notification failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const guarded = apiErrorResponse(error);
    if (guarded) return guarded;
    console.error("/api/quote failed", error);
    return NextResponse.json({ ok: false, error: "Could not send that. Please try again." }, { status: 500 });
  }
}
