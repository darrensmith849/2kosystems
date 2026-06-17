import type { Metadata } from 'next';

// Private client-facing onboarding link. Deliberately NOT under the (public)
// route group, so it gets none of the marketing Header/Footer/Chat chrome, and
// it is never indexed.
export const metadata: Metadata = {
  title: 'Project Onboarding — 2KO Systems',
  robots: { index: false, follow: false },
};

export default function QuestionnaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-2)] text-[var(--color-fg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-[64px] max-w-3xl items-center px-5">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--accent-deep)]">
            2KO<span className="text-[var(--accent)]"> Systems</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">{children}</main>
      <footer className="mx-auto max-w-3xl px-5 pb-12 pt-4 text-center text-xs text-[var(--color-fg-meta)]">
        © 2KO Systems · This is a private onboarding link prepared for you.
      </footer>
    </div>
  );
}
