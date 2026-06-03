import { checkOpsGate } from '@/lib/ops/auth';
import OpsLoginGate from './OpsLoginGate';
import OperatorPicker from './OperatorPicker';
import OpsTopNav from './OpsTopNav';

export const metadata = {
  title: 'Ops Dashboard — 2KO Systems',
  robots: { index: false, follow: false },
};

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const gate = await checkOpsGate();
  if (gate.kind === 'unauth') return <OpsLoginGate />;
  if (gate.kind === 'no_operator') return <OperatorPicker />;
  return (
    <div className="min-h-screen flex flex-col">
      <OpsTopNav operatorSlug={gate.operatorSlug} />
      <main className="flex-1 px-6 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
    </div>
  );
}
