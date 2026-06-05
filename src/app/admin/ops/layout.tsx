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
  // Pre-paint theme init: runs in the document head BEFORE React hydrates so
  // there is no flash of light mode on first paint. Reads the same localStorage
  // key the ThemeProvider uses ('2ko_ops_theme_v1') and applies the matching
  // class to <html>. Default = dark when no preference is stored.
  const themeInitScript = `(function(){try{var p=localStorage.getItem('2ko_ops_theme_v1');var t;if(p==='light'){t='light'}else if(p==='dark'){t='dark'}else if(p==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}else{t='dark'}var h=document.documentElement;h.setAttribute('data-theme',t);if(t==='dark'){h.classList.add('dark')}else{h.classList.remove('dark')}}catch(e){var h=document.documentElement;h.setAttribute('data-theme','dark');h.classList.add('dark')}})();`;
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
