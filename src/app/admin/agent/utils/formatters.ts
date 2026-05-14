import type { LocalStatus } from './types';

export function slug(s: string): string {
  return s.replace(/_/g, ' ');
}

export function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function scoreColor(n: number): string {
  if (n >= 81) return 'text-emerald-400';
  if (n >= 61) return 'text-green-400';
  if (n >= 31) return 'text-amber-400';
  return 'text-rose-400';
}

export function scoreLabel(n: number): string {
  if (n >= 81) return 'Priority lead';
  if (n >= 61) return 'Strong lead';
  if (n >= 31) return 'Possible lead';
  return 'Low fit';
}

export function tempColor(t: string): string {
  if (t === 'hot') return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
  if (t === 'warm') return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
  return 'text-[#71717a] border-[#27272a] bg-transparent';
}

export function urgencyColor(u: string): string {
  if (u === 'high') return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
  if (u === 'medium') return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
  return 'text-[#71717a] border-[#27272a] bg-transparent';
}

export function fitColor(v: string): string {
  if (v === 'high') return 'text-green-400';
  if (v === 'medium') return 'text-amber-400';
  return 'text-rose-400';
}

export function statusLabel(s: LocalStatus): string {
  const map: Record<LocalStatus, string> = {
    new: 'New',
    needs_review: 'Needs review',
    draft_ready: 'Draft ready',
    replied: 'Replied',
    waiting_for_response: 'Waiting',
    follow_up_due: 'Follow-up due',
    qualified: 'Qualified',
    unqualified: 'Unqualified',
    archived: 'Archived',
  };
  return map[s] ?? s;
}

export function statusColor(s: LocalStatus): string {
  switch (s) {
    case 'new': return 'text-[#71717a] border-[#27272a] bg-transparent';
    case 'needs_review': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
    case 'draft_ready': return 'text-green-400 border-green-400/30 bg-green-400/5';
    case 'replied': return 'text-sky-400 border-sky-400/30 bg-sky-400/5';
    case 'waiting_for_response': return 'text-purple-400 border-purple-400/30 bg-purple-400/5';
    case 'follow_up_due': return 'text-orange-400 border-orange-400/30 bg-orange-400/5';
    case 'qualified': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
    case 'unqualified': return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
    case 'archived': return 'text-[#3f3f46] border-[#1c1c1e] bg-transparent';
  }
}

export function followUpLabel(dateStr: string | null): { text: string; color: string } | null {
  if (!dateStr) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr < today) return { text: 'Overdue', color: 'text-rose-400' };
  if (dateStr === today) return { text: 'Due today', color: 'text-amber-400' };
  return { text: 'Upcoming', color: 'text-sky-400' };
}
