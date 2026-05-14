'use client';

import { useState } from 'react';
import type { LocalAgentJob, LocalStatus } from '../utils/types';
import { LOCAL_STATUSES } from '../utils/types';
import { LocalHistoryItem } from './LocalHistoryItem';
import { LocalImportExport } from './LocalImportExport';
import {
  applyFilters,
  hasActiveFilters,
  DEFAULT_FILTERS,
  type FilterState,
  type SortField,
} from '../utils/filters';
import { statusLabel } from '../utils/formatters';

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'createdAt', label: 'Date created' },
  { value: 'leadScore', label: 'Lead score' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'localStatus', label: 'Status' },
  { value: 'localFollowUpDate', label: 'Follow-up date' },
];

export function LocalHistoryPanel({
  items,
  onReload,
  onDelete,
  onUpdate,
  onClear,
  onImport,
}: {
  items: LocalAgentJob[];
  onReload: (item: LocalAgentJob) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<LocalAgentJob, 'localStatus' | 'localFollowUpDate' | 'localAdminNote'>>,
  ) => void;
  onClear: () => void;
  onImport: (items: LocalAgentJob[], mode: 'merge' | 'replace') => void;
}) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filtered = applyFilters(items, filters);
  const activeFilters = hasActiveFilters(filters);

  function setFilter<K extends keyof FilterState>(k: K, v: FilterState[K]) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  function toggleSortDir() {
    setFilters((f) => ({ ...f, sortDir: f.sortDir === 'desc' ? 'asc' : 'desc' }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] px-5 py-3 flex items-center gap-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3f3f46]">
          Local history
        </p>
        <span className="text-xs text-[#3f3f46]">— no analyses this session</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1c1c1e] bg-[#0d0d0f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717a]">
            Local history
          </p>
          <span className="text-[10px] font-mono text-[#3f3f46] border border-[#27272a] rounded-full px-2 py-0.5">
            {items.length}
          </span>
          {activeFilters && filtered.length !== items.length && (
            <span className="text-[10px] font-mono text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5">
              {filtered.length} shown
            </span>
          )}
          <span className="text-[#3f3f46] text-[10px]">{open ? '▲' : '▼'}</span>
        </button>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-[#3f3f46] hidden sm:block">
            Browser only — not saved to backend
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-[#3f3f46] hover:text-rose-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#1c1c1e]">
          {/* Filter bar */}
          <div className="px-5 py-3 border-b border-[#1c1c1e] space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilter('query', e.target.value)}
                placeholder="Search…"
                className="rounded-lg border border-[#27272a] bg-[#111113] px-2.5 py-1 text-xs text-[#f5f5f5] placeholder:text-[#3f3f46] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors w-40"
              />

              {/* Status filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value as LocalStatus | '')}
                className="rounded-lg border border-[#27272a] bg-[#111113] px-2 py-1 text-xs text-[#a1a1aa] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              >
                <option value="">All statuses</option>
                {LOCAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>

              {/* Temperature filter */}
              <select
                value={filters.temperature}
                onChange={(e) => setFilter('temperature', e.target.value)}
                className="rounded-lg border border-[#27272a] bg-[#111113] px-2 py-1 text-xs text-[#a1a1aa] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              >
                <option value="">All temps</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>

              {/* Min score */}
              <select
                value={filters.minScore}
                onChange={(e) => setFilter('minScore', Number(e.target.value))}
                className="rounded-lg border border-[#27272a] bg-[#111113] px-2 py-1 text-xs text-[#a1a1aa] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              >
                <option value={0}>Any score</option>
                <option value={31}>≥ 31</option>
                <option value={61}>≥ 61</option>
                <option value={81}>≥ 81</option>
              </select>

              {/* Follow-up filter */}
              <select
                value={filters.followUpFilter}
                onChange={(e) =>
                  setFilter(
                    'followUpFilter',
                    e.target.value as FilterState['followUpFilter'],
                  )
                }
                className="rounded-lg border border-[#27272a] bg-[#111113] px-2 py-1 text-xs text-[#a1a1aa] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              >
                <option value="all">All follow-ups</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="upcoming">Upcoming</option>
                <option value="none">No date set</option>
              </select>

              {/* Sort */}
              <select
                value={filters.sortField}
                onChange={(e) => setFilter('sortField', e.target.value as SortField)}
                className="rounded-lg border border-[#27272a] bg-[#111113] px-2 py-1 text-xs text-[#a1a1aa] focus:border-[#0f7b3a]/50 focus:outline-none transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={toggleSortDir}
                title={filters.sortDir === 'desc' ? 'Descending' : 'Ascending'}
                className="text-[11px] text-[#71717a] hover:text-[#f5f5f5] border border-[#27272a] rounded-lg px-2 py-1 transition-colors"
              >
                {filters.sortDir === 'desc' ? '↓' : '↑'}
              </button>

              {activeFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="px-5 py-2 text-[10px] text-[#3f3f46] border-b border-[#1c1c1e]">
            Temporary browser history — cleared when browser storage is cleared.
          </p>

          {/* Items */}
          {filtered.length === 0 ? (
            <p className="px-5 py-4 text-xs text-[#3f3f46]">No items match the current filters.</p>
          ) : (
            <div>
              {filtered.map((item) => (
                <LocalHistoryItem
                  key={item.id}
                  item={item}
                  onReload={onReload}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}

          {/* Import/Export */}
          <LocalImportExport items={items} onImport={onImport} />
        </div>
      )}
    </div>
  );
}
