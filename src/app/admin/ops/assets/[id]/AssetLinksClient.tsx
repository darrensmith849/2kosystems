'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCard, Badge, EmptyState } from '@/components/admin-ui';
import type { AssetLink } from '@/lib/db/schema/assets';

const KINDS = [
  { kind: 'github_repo', label: 'GitHub repo' },
  { kind: 'vercel_project', label: 'Vercel project' },
  { kind: 'cloudflare_zone', label: 'Cloudflare zone' },
  { kind: 'cloudflare_pages', label: 'Cloudflare Pages project' },
  { kind: 'hetzner_server', label: 'Hetzner server' },
  { kind: 'domain', label: 'Domain' },
] as const;

type Candidate = { ref: string; label: string; detail?: string };

const KIND_TONES: Record<string, 'green' | 'amber' | 'rose' | 'blue' | 'neutral'> = {
  github_repo: 'blue', vercel_project: 'amber', cloudflare_zone: 'green',
  cloudflare_pages: 'green', hetzner_server: 'rose', domain: 'neutral',
};

export default function AssetLinksClient({
  assetId,
  initialLinks,
}: {
  assetId: string;
  initialLinks: AssetLink[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<typeof KINDS[number]['kind']>('github_repo');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [chosenRef, setChosenRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/ops/assets/${assetId}/links?candidates=${kind}`);
        if (!res.ok) {
          setCandidates([]);
          return;
        }
        const data = (await res.json()) as { candidates?: Candidate[] };
        if (!cancelled) setCandidates(data.candidates ?? []);
        setChosenRef('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [assetId, kind]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!chosenRef) return;
    setBusy('add');
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/assets/${assetId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, externalRef: chosenRef }),
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
      setBusy(null);
    }
  }

  async function handleDelete(linkId: string) {
    setBusy(linkId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ops/asset-links/${linkId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <AdminCard title={`Add link · ${initialLinks.length} current`}>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as never)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5]"
            disabled={busy !== null}
          >
            {KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>{k.label}</option>
            ))}
          </select>
          <select
            value={chosenRef}
            onChange={(e) => setChosenRef(e.target.value)}
            className="rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] md:col-span-1"
            disabled={busy !== null || loading || candidates.length === 0}
          >
            <option value="">
              {loading ? 'Loading…' : candidates.length === 0 ? 'No candidates — sync first' : '— pick one —'}
            </option>
            {candidates.map((c) => (
              <option key={c.ref} value={c.ref}>
                {c.label}{c.detail ? ` (${c.detail})` : ''}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy !== null || !chosenRef}
            className="rounded-full bg-[#0f7b3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {busy === 'add' ? 'Linking…' : 'Add link'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        <p className="mt-3 text-[11px] text-[#52525b]">
          Candidates are populated from the relevant sync tables. If nothing shows, run that provider&apos;s sync first.
        </p>
      </AdminCard>

      <div>
        <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717a] mb-3">Current links</h3>
        {initialLinks.length === 0 ? (
          <EmptyState
            title="No links yet"
            hint="Use the form above to attach this asset to a repo, project, zone, server, or domain."
          />
        ) : (
          <div className="rounded-2xl border border-[#27272a] bg-[#111113]">
            <ul>
              {initialLinks.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#1c1c1e] last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge text={l.kind.replace(/_/g, ' ')} tone={KIND_TONES[l.kind] ?? 'neutral'} />
                    <span className="text-xs font-mono text-[#e4e4e7] truncate">{l.externalRef}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(l.id)}
                    disabled={busy === l.id}
                    className="shrink-0 text-[11px] text-rose-300 hover:text-rose-200 border border-rose-400/30 hover:border-rose-400/50 rounded-full px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {busy === l.id ? 'Removing…' : 'Unlink'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
