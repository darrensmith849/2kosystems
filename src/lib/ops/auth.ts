import 'server-only';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

// The existing admin session cookie gates both /admin/agent and /admin/ops.
// On top of that, /admin/ops needs to know WHICH operator is acting so every
// audit_log row records a person. The operator slug is stored in a separate
// cookie set after the operator picker.

export const OPERATOR_COOKIE_NAME = '2ko_ops_operator';

export async function isAdminAuthorised(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifyAdminSessionToken(token) : false;
}

export async function getCurrentOperatorSlug(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OPERATOR_COOKIE_NAME)?.value ?? null;
}

// Returns one of:
//   { kind: 'unauth' }     -> show LoginGate
//   { kind: 'no_operator' } -> show OperatorPicker
//   { kind: 'ok', operatorSlug }
export type OpsGate =
  | { kind: 'unauth' }
  | { kind: 'no_operator' }
  | { kind: 'ok'; operatorSlug: string };

export async function checkOpsGate(): Promise<OpsGate> {
  if (!(await isAdminAuthorised())) return { kind: 'unauth' };
  const op = await getCurrentOperatorSlug();
  if (!op) return { kind: 'no_operator' };
  return { kind: 'ok', operatorSlug: op };
}
