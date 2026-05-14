import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';
import AgentConsole from './AgentConsole';
import LoginGate from './LoginGate';

export const metadata = {
  title: 'Agent Ops — 2KO Systems',
  robots: { index: false, follow: false },
};

export default async function AdminAgentPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthed = token ? verifyAdminSessionToken(token) : false;

  return isAuthed ? <AgentConsole /> : <LoginGate />;
}
