import { isDbConfigured } from '@/lib/db/client';

// Server component shown at the top of any page that depends on DB connectivity.
// It surfaces the no-DB state without breaking page rendering.

export default function NotConnectedBanner() {
  if (isDbConfigured()) return null;
  return (
    <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 text-xs text-amber-200">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300/80 mb-2">
        Waiting for Hetzner DATABASE_URL
      </p>
      <p className="leading-relaxed">
        Production activates after next week&apos;s Hetzner DB migration. For local dev set{' '}
        <code className="text-amber-300">DATABASE_URL</code> in{' '}
        <code className="text-amber-300">.env.local</code> (see{' '}
        <code className="text-amber-300">docs/runbooks/ops-local-dev.md</code>). Mutations return 503 until then.
      </p>
      <p className="mt-2 text-[11px] text-amber-200/80">
        Migration runbook: <code className="text-amber-300">docs/runbooks/ops-db-setup.md</code>
      </p>
    </div>
  );
}
