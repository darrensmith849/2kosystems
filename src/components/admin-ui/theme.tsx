'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// Theme system for /admin/ops. Sets a `data-theme` attribute on the local
// dashboard root, OR toggles a `.dark` class on the root. Both selectors are
// matched by the Tailwind `dark:` custom-variant set in globals.css.
//
// Preference is persisted to localStorage; the default on first load is
// 'dark' (matches the current dashboard look). System preference can be
// honored via the 'system' option.

export type Theme = 'light' | 'dark';
export type ThemePref = 'light' | 'dark' | 'system';

const STORAGE_KEY = '2ko_ops_theme_v1';

const ThemeContext = createContext<{
  theme: Theme;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  cycle: () => void;
}>({
  theme: 'dark',
  pref: 'dark',
  setPref: () => undefined,
  cycle: () => undefined,
});

function readPref(): ThemePref {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* silent */
  }
  return 'dark';
}

function resolveTheme(pref: ThemePref): Theme {
  if (pref === 'light' || pref === 'dark') return pref;
  if (typeof window === 'undefined') return 'dark';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  html.classList.toggle('dark', theme === 'dark');
}

export function ThemeProvider({
  children,
  defaultPref = 'dark',
}: {
  children: ReactNode;
  defaultPref?: ThemePref;
}) {
  const [pref, setPrefState] = useState<ThemePref>(defaultPref);
  const [theme, setTheme] = useState<Theme>(defaultPref === 'light' ? 'light' : 'dark');

  // Hydrate from localStorage + resolve.
  useEffect(() => {
    const stored = readPref();
    setPrefState(stored);
    const resolved = resolveTheme(stored);
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for system preference changes when pref === 'system'.
  useEffect(() => {
    if (pref !== 'system') return;
    if (typeof window === 'undefined') return;
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }
    function onChange() {
      const t = resolveTheme('system');
      setTheme(t);
      applyTheme(t);
    }
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    try {
      window.localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* silent */
    }
    const t = resolveTheme(p);
    setTheme(t);
    applyTheme(t);
  }, []);

  const cycle = useCallback(() => {
    setPref(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setPref]);

  return (
    <ThemeContext.Provider value={{ theme, pref, setPref, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Small icon-only toggle button. Renders the sun icon when current theme is
// dark (clicking will switch to light) and the moon icon otherwise.
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, cycle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={cycle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        'inline-flex h-7 w-7 items-center justify-center rounded-md ' +
        'border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 ' +
        'dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-zinc-300 ' +
        'transition-colors ' +
        className
      }
    >
      {isDark ? (
        // Sun (switch to light)
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon (switch to dark)
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
