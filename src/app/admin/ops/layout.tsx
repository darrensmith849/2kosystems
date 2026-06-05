import { checkOpsGate } from '@/lib/ops/auth';
import OpsLoginGate from './OpsLoginGate';
import OperatorPicker from './OperatorPicker';
import OpsSidebar from './components/OpsSidebar';
import OpsMobileBar from './components/OpsMobileBar';
import OpsTopBar from './components/OpsTopBar';
import { FloatingChat } from '@/components/admin-ui/floating-chat';
import { ThemeProvider } from '@/components/admin-ui/theme';

export const metadata = {
  title: 'Ops Dashboard — 2KO Systems',
  robots: { index: false, follow: false },
};

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const gate = await checkOpsGate();
  if (gate.kind === 'unauth') return <OpsLoginGate />;
  if (gate.kind === 'no_operator') return <OperatorPicker />;
  // Pre-paint theme init: runs BEFORE React hydrates. Every page load opens
  // in dark mode regardless of any previously-toggled preference. The in-page
  // ThemeToggle still flips the theme during the session, but the next page
  // load always reverts to dark.
  const themeInitScript = `(function(){try{var h=document.documentElement;h.setAttribute('data-theme','dark');h.classList.add('dark');localStorage.removeItem('2ko_ops_theme_v1');}catch(e){}})();`;
  return (
    <ThemeProvider>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0b] dark:text-zinc-100 transition-colors">
        <OpsMobileBar operatorSlug={gate.operatorSlug} />
        <OpsSidebar operatorSlug={gate.operatorSlug} />
        <div className="flex-1 min-w-0 flex flex-col">
          <OpsTopBar operatorSlug={gate.operatorSlug} />
          <main className="flex-1 min-w-0 px-6 py-6 max-w-[1400px] w-full mx-auto lg:mx-0">{children}</main>
        </div>
        <FloatingChat />
      </div>
    </ThemeProvider>
  );
}
