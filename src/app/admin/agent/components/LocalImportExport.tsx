'use client';

import { useRef, useState } from 'react';
import type { LocalAgentJob } from '../utils/types';
import { validateImportPayload } from '../utils/storage';
import { downloadFile } from '../utils/exportUtils';
import { recordBackupTimestamp } from '../utils/localBackupMetadata';

export function LocalImportExport({
  items,
  onImport,
}: {
  items: LocalAgentJob[];
  onImport: (items: LocalAgentJob[], mode: 'merge' | 'replace') => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<LocalAgentJob[] | null>(null);

  function handleExport() {
    const store = { schemaVersion: 1, items };
    downloadFile(
      JSON.stringify(store, null, 2),
      `2ko-history-export-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    );
    recordBackupTimestamp();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const validated = validateImportPayload(raw);
        if (!validated) {
          setImportError('Invalid file — expected a 2KO history export (schemaVersion: 1).');
          return;
        }
        setPendingItems(validated);
      } catch {
        setImportError('Could not parse file — make sure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleImport(mode: 'merge' | 'replace') {
    if (!pendingItems) return;
    onImport(pendingItems, mode);
    setImportSuccess(
      `${pendingItems.length} item${pendingItems.length !== 1 ? 's' : ''} imported (${mode}).`,
    );
    setPendingItems(null);
  }

  return (
    <div className="px-5 py-3 border-t border-[#1c1c1e] space-y-2">
      <p className="text-[10px] text-[#3f3f46]">
        Local history is stored only in this browser. Clearing browser data removes it. Not shared with other admins. Not saved to the 2KO backend. Export a backup before clearing browser data or switching devices.
      </p>
      <div className="flex flex-wrap items-center gap-3">
      <p className="text-[10px] font-mono text-[#3f3f46]">Export / Import</p>
      <button
        type="button"
        onClick={handleExport}
        disabled={items.length === 0}
        className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ↓ Export history
      </button>
      <label className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] transition-colors border border-[#27272a] hover:border-[#3f3f46] rounded-full px-3 py-1 cursor-pointer">
        ↑ Import
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {importError && (
        <span className="text-[11px] text-rose-400">{importError}</span>
      )}
      {importSuccess && (
        <span className="text-[11px] text-[#4ade80]">{importSuccess}</span>
      )}

      {pendingItems && (
        <div className="w-full flex items-center gap-3 mt-1">
          <span className="text-[11px] text-[#a1a1aa]">
            Found {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} —
          </span>
          <button
            type="button"
            onClick={() => handleImport('merge')}
            className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] rounded-full px-3 py-1 transition-colors"
          >
            Merge with existing
          </button>
          <button
            type="button"
            onClick={() => handleImport('replace')}
            className="text-[11px] text-rose-400 hover:text-rose-300 border border-rose-400/30 rounded-full px-3 py-1 transition-colors"
          >
            Replace all
          </button>
          <button
            type="button"
            onClick={() => setPendingItems(null)}
            className="text-[11px] text-[#3f3f46] hover:text-[#71717a] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
