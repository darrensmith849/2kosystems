'use client';

import { useEffect, useState } from 'react';
import { HISTORY_KEY } from '../utils/storage';
import { TEST_RUNS_KEY } from '../utils/qualityLabStorage';
import { BATCH_INBOX_KEY } from '../utils/batchInboxStorage';
import { getLastBackupTimestamp, formatBackupAge } from '../utils/localBackupMetadata';

interface StorageSection {
  label: string;
  key: string;
  count: number;
  sizeBytes: number;
}

function bytesToKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function getSectionInfo(key: string): { count: number; sizeBytes: number } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { count: 0, sizeBytes: 0 };
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : (parsed?.items ?? []);
    return { count: Array.isArray(items) ? items.length : 0, sizeBytes: new Blob([raw]).size };
  } catch {
    return { count: 0, sizeBytes: 0 };
  }
}

export function LocalStorageHealthPanel() {
  const [sections, setSections] = useState<StorageSection[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    const defs = [
      { label: 'Workflow history', key: HISTORY_KEY },
      { label: 'Quality Lab runs', key: TEST_RUNS_KEY },
      { label: 'Batch inbox', key: BATCH_INBOX_KEY },
    ];

    const built = defs.map(({ label, key }) => ({ label, key, ...getSectionInfo(key) }));
    setSections(built);
    setTotalBytes(built.reduce((acc, s) => acc + s.sizeBytes, 0));
    setLastBackup(getLastBackupTimestamp());
  }, []);

  const backupWarning = !lastBackup || (Date.now() - new Date(lastBackup).getTime() > 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-5 space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a] mb-1">Local Storage Health</p>
        <p className="text-xs text-[#3f3f46]">All agent data lives in this browser only — not synced, not backed up automatically.</p>
      </div>

      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.key} className="flex items-center justify-between py-1.5 border-b border-[#1c1c1e] last:border-0">
            <span className="text-xs text-[#a1a1aa]">{s.label}</span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono text-[#71717a]">{s.count} item{s.count !== 1 ? 's' : ''}</span>
              <span className="text-[11px] font-mono text-[#3f3f46] w-16 text-right">{bytesToKb(s.sizeBytes)}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-mono text-[#3f3f46]">Total</span>
          <span className="text-[11px] font-mono text-[#71717a]">{bytesToKb(totalBytes)}</span>
        </div>
      </div>

      <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[11px] ${
        backupWarning
          ? 'border-amber-400/25 bg-amber-400/5 text-amber-400'
          : 'border-[#1c1c1e] bg-[#0d0d0f] text-[#71717a]'
      }`}>
        <span className="shrink-0 mt-0.5">{backupWarning ? '⚠' : '✓'}</span>
        <span>
          {lastBackup
            ? `Last export: ${formatBackupAge(lastBackup)} (${new Date(lastBackup).toLocaleDateString()})`
            : 'No export recorded in this browser.'}
          {backupWarning && ' — export a backup before clearing browser data.'}
        </span>
      </div>
    </div>
  );
}
