// Common shape every integration client returns so the UI can render a
// "Not connected" panel uniformly without each integration having a special
// case in the page code.

export type IntegrationConnectivity =
  | { status: 'connected'; checkedAt: string }
  | { status: 'not_connected'; reason: 'missing_token' | 'missing_env' | 'unauthorized' | 'error'; detail?: string; checkedAt: string };

export function notConnected(
  reason: 'missing_token' | 'missing_env' | 'unauthorized' | 'error',
  detail?: string,
): IntegrationConnectivity {
  return { status: 'not_connected', reason, detail, checkedAt: new Date().toISOString() };
}

export function connected(): IntegrationConnectivity {
  return { status: 'connected', checkedAt: new Date().toISOString() };
}
