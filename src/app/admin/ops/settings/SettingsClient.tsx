'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard } from '@/components/admin-ui';

export default function SettingsClient() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(endpoint: string, label: string) {
    setBusy(label);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setMessage(JSON.stringify(data));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminCard title="Day-1 seeding & importers">
      <div className="space-y-3">
        <Action
          label="Seed divisions + Vercel teams"
          hint="Inserts the 2KO Africa division hierarchy and the two Vercel teams. Idempotent."
          busy={busy === 'seed-foundational'}
          onClick={() => run('/api/admin/ops/db/seed', 'seed-foundational')}
        />
        <Action
          label="Seed known operational findings"
          hint="Inserts the ~10 issues from the discovery audit (sixsigma2026 on Vercel, stranded zones, etc.). Idempotent."
          busy={busy === 'seed-findings'}
          onClick={() => run('/api/admin/ops/findings/seed', 'seed-findings')}
        />
        <Action
          label="Import infra-handover/INVENTORY.md"
          hint="Fetches the live INVENTORY.md from GitHub and seeds domains found there. Requires GITHUB_TOKEN."
          busy={busy === 'import-inventory'}
          onClick={() => run('/api/admin/ops/inventory-md/import', 'import-inventory')}
        />
        {message && <p className="text-xs text-emerald-300 font-mono mt-2 break-all">{message}</p>}
        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
      </div>
    </AdminCard>
  );
}

function Action({
  label,
  hint,
  busy,
  onClick,
}: {
  label: string;
  hint: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#1c1c1e] pb-3 last:border-0 last:pb-0">
      <div className="flex-1">
        <p className="text-sm text-[#f5f5f5]">{label}</p>
        <p className="text-xs text-[#71717a] mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="shrink-0 rounded-full border border-[#27272a] hover:border-[#3f3f46] px-3 py-1 text-[11px] font-mono text-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {busy ? 'Running…' : 'Run'}
      </button>
    </div>
  );
}
