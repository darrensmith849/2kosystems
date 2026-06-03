// Saved-workspace local-state module. Types + constants + browser-safe
// localStorage helpers shared by Phase C client components. No 'server-only'
// because these types/constants are imported across both server and client
// modules; only the helpers touch window/localStorage at runtime.

export const SAVED_SEARCHES_KEY = '2ko_ops_saved_searches_v1';
export const SAVED_QUESTIONS_KEY = '2ko_ops_saved_questions_v1';
export const REVIEW_SESSION_KEY = '2ko_ops_review_session_v1';

export type SavedSearch = {
  id: string;
  name: string;
  q: string;
  types?: string[];
  sources?: string[];
  blockedBy?: string[];
  createdAt: string;
};

export type SavedQuestion = {
  id: string;
  name: string;
  question: string;
  category?: string;
  createdAt: string;
};

export type ReviewSession = {
  reviewerName: string;
  startedAt: string;
  localNotes: string;
};

// --- Storage helpers ----------------------------------------------------
// All helpers are browser-safe: they no-op (or return safe defaults) when
// window / localStorage is unavailable, and swallow JSON or quota errors.

export function loadSaved<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function persistSaved<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // silent: storage may be full, disabled, or in a private window
  }
}

export function loadObject<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function persistObject<T>(key: string, value: T | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // silent
  }
}

// --- Deterministic ID helper -------------------------------------------
// Pure-deterministic: same name in always yields same id. No time / random.

export function makeIdFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const firstCode = name.length > 0 ? name.charCodeAt(0) : 0;
  const suffix = (name.length * 31 + firstCode).toString(36);
  const base = slug.length > 0 ? slug : 'item';
  return `saved-${base}-${suffix}`;
}
