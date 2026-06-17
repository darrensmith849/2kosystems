'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RevokeButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    if (busy) return;
    if (!window.confirm('Revoke this link? The client will no longer be able to open or submit it.')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/questionnaires/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-rose-400">{error}</span>}
      <button
        type="button"
        onClick={handleRevoke}
        disabled={busy}
        className="rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/15 disabled:opacity-40 transition-colors"
      >
        {busy ? 'Revoking…' : 'Revoke link'}
      </button>
    </span>
  );
}
