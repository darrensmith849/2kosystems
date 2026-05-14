'use client';

export type AdminTab = 'analyse' | 'workflow' | 'quality' | 'batch' | 'export' | 'help';

interface TabDef {
  id: AdminTab;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'analyse', label: 'Analyse' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'quality', label: 'Quality Lab' },
  { id: 'batch', label: 'Batch Inbox' },
  { id: 'export', label: 'Export' },
  { id: 'help', label: 'Help' },
];

const TAB_KEY = '2ko_agent_tab';

export function readSavedTab(): AdminTab {
  if (typeof window === 'undefined') return 'analyse';
  const saved = localStorage.getItem(TAB_KEY);
  if (saved && TABS.some((t) => t.id === saved)) return saved as AdminTab;
  return 'analyse';
}

export function saveTab(tab: AdminTab): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TAB_KEY, tab);
}

export function AdminTabs({
  active,
  onChange,
  counts,
}: {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  counts?: Partial<Record<AdminTab, number>>;
}) {
  return (
    <div className="flex items-end gap-0 border-b border-[#1c1c1e] overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? 'text-[#f5f5f5]'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            {tab.label}
            {count !== undefined && count > 0 && (
              <span className="ml-1.5 text-[9px] font-mono text-[#3f3f46] border border-[#27272a] rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-[#0f7b3a]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
