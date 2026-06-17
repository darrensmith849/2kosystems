'use client';

import { useState } from 'react';
import { SLA_CLAUSES, fillClause } from '@/lib/sla/template';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg'];

function formatMoney(amount: string, currency: string): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Turns the base64 PDF returned by the submit route into a client-side download
// (no server storage to fetch from).
function downloadBase64Pdf(base64: string, fileName: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function QuestionnaireForm({
  token,
  clientName,
  priceAmount,
  currency,
  paymentTerms,
}: {
  token: string;
  clientName: string;
  priceAmount: string;
  currency: string;
  paymentTerms: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [sla, setSla] = useState<{ base64: string; fileName: string } | null>(null);

  // Controlled fields
  const [businessName, setBusinessName] = useState(clientName);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [hasWebsite, setHasWebsite] = useState<'yes' | 'no' | ''>('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessAim, setBusinessAim] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [offering, setOffering] = useState('');
  const [catalogueSize, setCatalogueSize] = useState('');
  const [siteGoals, setSiteGoals] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'eft'>('cash');
  const [signedName, setSignedName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [terms, setTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Logo
  const [logo, setLogo] = useState<{ base64: string; contentType: string; name: string; dataUrl: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setLogo(null);
      return;
    }
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogo(null);
      setLogoError('Please upload a PNG or JPG image.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogo(null);
      setLogoError('That file is over 2 MB — please upload a smaller logo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : '';
      setLogo({ base64, contentType: file.type, name: file.name, dataUrl });
    };
    reader.onerror = () => setLogoError("Couldn't read that file — please try another.");
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setError(null);

    if (!businessName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError('Please fill in your business name, contact name and email.');
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setError("That email address doesn't look right.");
      setStatus('error');
      return;
    }
    if (!signedName.trim()) {
      setError('Please type your full name to sign.');
      setStatus('error');
      return;
    }
    if (!terms) {
      setError('Please tick the box to agree to the SLA and terms before sending.');
      setStatus('error');
      return;
    }

    const payload = {
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      hasExistingWebsite: hasWebsite === 'yes',
      existingWebsiteUrl: hasWebsite === 'yes' ? websiteUrl.trim() : '',
      businessAim: businessAim.trim(),
      businessType,
      offering: offering.trim(),
      catalogueSize,
      siteGoals: siteGoals.trim(),
      notes: notes.trim(),
      paymentMethod,
      termsAccepted: terms,
      signedName: signedName.trim(),
      idNumber: idNumber.trim(),
      logoBase64: logo?.base64 ?? '',
      logoContentType: logo?.contentType ?? '',
    };

    setStatus('submitting');
    try {
      const res = await fetch(`/api/q/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        warning?: string;
        pdfBase64?: string;
        fileName?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || "Couldn't send that through — please try again.");
        setStatus('error');
        return;
      }
      setSla(data.pdfBase64 ? { base64: data.pdfBase64, fileName: data.fileName ?? '2KO-SLA.pdf' } : null);
      setWarning(data.warning ?? null);
      setStatus('success');
    } catch {
      setError("Couldn't send that through — please check your connection and try again.");
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-8 text-center shadow-[var(--shadow-card)]">
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">All done — thank you!</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-fg-muted)]">
            We&apos;ve saved your details and generated your Service Level Agreement. A copy has been emailed to{' '}
            <strong>{contactEmail}</strong> and to the 2KO Systems team. You can download it below for your records.
          </p>
          {warning && (
            <p className="mx-auto mt-4 max-w-md rounded-lg border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {warning}
            </p>
          )}
          {sla && (
            <button
              type="button"
              onClick={() => downloadBase64Pdf(sla.base64, sla.fileName)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent2)]"
            >
              Download your SLA (PDF)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[var(--color-fg)]">Project onboarding</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
          Tell us about your business so we can build your website. It only takes a few minutes. When you&apos;re done,
          sign at the bottom and we&apos;ll email you a Service Level Agreement.
        </p>
      </div>

      {/* Company */}
      <Section title="Your business">
        <Grid>
          <Field label="Business / company name" required>
            <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </Field>
          <Field label="Contact name" required>
            <input className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} required />
          </Field>
        </Grid>
        <Grid>
          <Field label="Email" required>
            <input
              type="email"
              className={inputClass}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Phone (optional)">
            <input type="tel" className={inputClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </Field>
        </Grid>
        <Field label="What does your business do? What's its main aim?">
          <textarea
            className={inputClass}
            rows={3}
            value={businessAim}
            onChange={(e) => setBusinessAim(e.target.value)}
            placeholder="e.g. We're an estate agency helping buyers and sellers across Harare with residential and commercial property."
          />
        </Field>
      </Section>

      {/* What you offer */}
      <Section title="What you sell or offer">
        <Grid>
          <Field label="What does your business mainly offer?">
            <select className={inputClass} value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
              <option value="">Select…</option>
              <option value="Products (physical goods)">Products (physical goods)</option>
              <option value="Services">Services</option>
              <option value="Both products and services">Both products and services</option>
              <option value="Creative or artwork (art, design, media)">Creative / artwork (art, design, media)</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Roughly how many products/services will the site show?">
            <select className={inputClass} value={catalogueSize} onChange={(e) => setCatalogueSize(e.target.value)}>
              <option value="">Select…</option>
              <option value="Just a few (1–10)">Just a few (1–10)</option>
              <option value="A medium range (10–50)">A medium range (10–50)</option>
              <option value="A large catalogue (50+)">A large catalogue (50+)</option>
              <option value="Not applicable / services only">Not applicable / services only</option>
            </select>
          </Field>
        </Grid>
        <Field label="In one line, what do you sell or provide?">
          <input
            className={inputClass}
            value={offering}
            onChange={(e) => setOffering(e.target.value)}
            placeholder="e.g. Residential & commercial property sales and rentals."
          />
        </Field>
      </Section>

      {/* Website */}
      <Section title="Your website">
        <Field label="Do you already have a website?">
          <div className="flex gap-4 pt-1">
            <Radio name="hasWebsite" label="Yes" checked={hasWebsite === 'yes'} onChange={() => setHasWebsite('yes')} />
            <Radio name="hasWebsite" label="No / not yet" checked={hasWebsite === 'no'} onChange={() => setHasWebsite('no')} />
          </div>
        </Field>
        {hasWebsite === 'yes' && (
          <Field label="Current website address">
            <input
              className={inputClass}
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://"
            />
          </Field>
        )}
        <Field label="What would you like your new website to do for you?">
          <textarea
            className={inputClass}
            rows={3}
            value={siteGoals}
            onChange={(e) => setSiteGoals(e.target.value)}
            placeholder="e.g. Showcase our listings, let people enquire, and look professional and trustworthy."
          />
        </Field>
      </Section>

      {/* Logo */}
      <Section title="Your logo">
        <Field label="Upload your logo (PNG or JPG, max 2 MB)">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleLogoChange}
            className="block w-full text-sm text-[var(--color-fg-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[var(--accent2)]"
          />
          {logoError && <p className="mt-2 text-xs text-red-600">{logoError}</p>}
          {logo && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.dataUrl} alt="Logo preview" className="max-h-16 w-auto rounded border border-[var(--color-border)] bg-white p-1" />
              <span className="text-xs text-[var(--color-fg-muted)]">{logo.name}</span>
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--color-fg-meta)]">
            Don&apos;t have your logo to hand? You can skip this and email it to us later.
          </p>
        </Field>
        <Field label="Anything else we should know? (optional)">
          <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </Section>

      {/* Pricing & payment */}
      <Section title="Pricing & payment">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-[var(--color-fg-muted)]">Project fee</span>
            <span className="text-lg font-semibold text-[var(--color-fg)]">{formatMoney(priceAmount, currency)}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-fg-meta)]">Payment terms: {paymentTerms}.</p>
        </div>
        <Field label="How would you like to pay?">
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-4">
            <Radio name="payment" label="Cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
            <Radio
              name="payment"
              label="Bank transfer (EFT)"
              checked={paymentMethod === 'eft'}
              onChange={() => setPaymentMethod('eft')}
            />
          </div>
        </Field>
        {paymentMethod === 'eft' && (
          <p className="text-xs text-[var(--color-fg-meta)]">
            We&apos;ll send you our banking details by email once you submit.
          </p>
        )}
      </Section>

      {/* Sign */}
      <Section title="Agreement & signature">
        <button
          type="button"
          onClick={() => setShowTerms((s) => !s)}
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          {showTerms ? 'Hide' : 'Read'} the Service Level Agreement terms
        </button>
        {showTerms && (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-xs leading-relaxed text-[var(--color-fg-muted)]">
            {SLA_CLAUSES.map((c) => (
              <div key={c.title} className="mb-3 last:mb-0">
                <p className="font-semibold text-[var(--color-fg)]">{c.title}</p>
                <p className="mt-0.5">{fillClause(c.body, businessName || 'the client')}</p>
              </div>
            ))}
          </div>
        )}
        <Grid>
          <Field label="Type your full name to sign" required>
            <input
              className={inputClass}
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              placeholder="Full legal name"
            />
          </Field>
          <Field label="ID / passport number">
            <input
              className={inputClass}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="ID or passport number"
            />
          </Field>
        </Grid>
        <label className="flex items-start gap-3 text-sm text-[var(--color-fg-muted)]">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            I have read and agree to the 2KO Systems Service Level Agreement and Terms &amp; Conditions, and I confirm the
            information above is correct.
          </span>
        </label>
      </Section>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_-12px_rgba(22,163,74,0.55)] transition-all hover:bg-[var(--accent2)] active:scale-[0.99] disabled:opacity-60 sm:w-auto"
      >
        {status === 'submitting' ? 'Saving & sending…' : 'Save & send'}
      </button>
      <p className="text-xs text-[var(--color-fg-meta)]">
        When you click Save &amp; send, we generate your SLA and email it to you and the 2KO Systems team.
      </p>
    </form>
  );
}

/* ---------- small presentational helpers ---------- */

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-meta)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)]';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-fg-meta)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--color-fg)]">
        {label}
        {required && <span className="text-[var(--accent)]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Radio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-[var(--color-fg)]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}
