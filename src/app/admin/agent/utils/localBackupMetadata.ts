const BACKUP_KEY = '2ko_agent_ops_last_backup_at';

export function recordBackupTimestamp(): void {
  try {
    localStorage.setItem(BACKUP_KEY, new Date().toISOString());
  } catch {}
}

export function getLastBackupTimestamp(): string | null {
  try {
    return localStorage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}

export function formatBackupAge(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
