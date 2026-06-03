import 'server-only';
import { isDbConfigured } from '@/lib/db/client';

// Snapshot mode is active when there is no DATABASE_URL. While active, list
// services return the discovery-derived static snapshot instead of empty
// arrays, and pages disable create/edit forms.

export function isSnapshotMode(): boolean {
  return !isDbConfigured();
}
