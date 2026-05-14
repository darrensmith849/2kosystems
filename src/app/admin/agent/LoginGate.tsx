'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginGate() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Invalid password');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#71717a] mb-3">
            2KO Systems
          </p>
          <h1 className="text-xl font-semibold text-[#f5f5f5]">Agent Ops</h1>
          <p className="mt-1.5 text-sm text-[#71717a]">Internal access only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#27272a] bg-[#111113] p-6"
        >
          <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-[#71717a] mb-2">
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0b] px-3.5 py-2.5 text-sm text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors mb-5"
            placeholder="••••••••••••"
            autoFocus
            autoComplete="current-password"
            disabled={loading}
          />

          {error && (
            <p className="mb-4 text-sm text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full rounded-full bg-[#0f7b3a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B8C4C8] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-[#3f3f46]">
          Private internal tool. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  );
}
