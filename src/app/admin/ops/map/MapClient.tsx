'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminCard, Badge, EmptyState, Row } from '@/components/admin-ui';
import type { IndexItem, IndexItemType } from '@/lib/ops/ops-knowledge-index';
import { BLOCKED_BY_LABEL, labelFor } from '@/lib/ops/labels';

// ---------------------------------------------------------------- Types

type ProviderKey = 'all' | 'vercel' | 'hetzner' | 'cloudflare' | 'github';
type StatusKey = 'all' | 'needs_review' | 'unmapped';
type BlockedByKey =
  | 'all'
  | 'db'
  | 'ssh'
  | 'github_token'
  | 'vercel_token'
  | 'cloudflare_token'
  | 'hetzner_token'
  | 'human';

// Lineage shape: for each client we collect every IndexItem that hangs off it
// via IndexItem.relations.clientId (or — for assets — also via the asset itself
// being linked elsewhere through relations.assetId).
type ClientLineage = {
  client: IndexItem;
  assets: IndexItem[];
  repos: IndexItem[];
  vercel: IndexItem[];
  hetzner: IndexItem[];
  cloudflare: IndexItem[];
  domains: IndexItem[];
  tickets: IndexItem[];
  renewals: IndexItem[];
  incidents: IndexItem[];
};

const PROVIDER_TYPE: Record<Exclude<ProviderKey, 'all'>, IndexItemType> = {
  vercel: 'vercel_project',
  hetzner: 'hetzner_server',
  cloudflare: 'cloudflare_zone',
  github: 'github_repo',
};

// ---------------------------------------------------------------- Helpers

function buildLineage(items: IndexItem[]): {
  divisions: IndexItem[];
  clients: IndexItem[];
  lineageByClient: Map<string, ClientLineage>;
  unmappedAssets: IndexItem[];
  providerlessRepos: IndexItem[];
  providerlessVercel: IndexItem[];
  providerlessHetzner: IndexItem[];
  providerlessCloudflare: IndexItem[];
  providerlessDomains: IndexItem[];
} {
  const divisions = items.filter((i) => i.type === 'division');
  const clients = items.filter((i) => i.type === 'client');

  const lineageByClient = new Map<string, ClientLineage>();
  for (const c of clients) {
    lineageByClient.set(c.id, {
      client: c,
      assets: [],
      repos: [],
      vercel: [],
      hetzner: [],
      cloudflare: [],
      domains: [],
      tickets: [],
      renewals: [],
      incidents: [],
    });
  }

  const unmappedAssets: IndexItem[] = [];

  for (const it of items) {
    const cid = it.relations?.clientId;
    if (it.type === 'asset') {
      if (cid && lineageByClient.has(cid)) lineageByClient.get(cid)!.assets.push(it);
      else unmappedAssets.push(it);
    } else if (cid && lineageByClient.has(cid)) {
      const bucket = lineageByClient.get(cid)!;
      switch (it.type) {
        case 'github_repo':
          bucket.repos.push(it);
          break;
        case 'vercel_project':
          bucket.vercel.push(it);
          break;
        case 'hetzner_server':
          bucket.hetzner.push(it);
          break;
        case 'cloudflare_zone':
          bucket.cloudflare.push(it);
          break;
        case 'domain':
          bucket.domains.push(it);
          break;
        case 'ticket':
          bucket.tickets.push(it);
          break;
        case 'renewal':
          bucket.renewals.push(it);
          break;
        case 'incident':
          bucket.incidents.push(it);
          break;
      }
    }
  }

  // Provider items WITHOUT a clientId in their relations — surfaced under
  // "Unmapped" so the operator can spot orphans.
  const providerlessRepos = items.filter((i) => i.type === 'github_repo' && !i.relations?.clientId);
  const providerlessVercel = items.filter((i) => i.type === 'vercel_project' && !i.relations?.clientId);
  const providerlessHetzner = items.filter((i) => i.type === 'hetzner_server' && !i.relations?.clientId);
  const providerlessCloudflare = items.filter((i) => i.type === 'cloudflare_zone' && !i.relations?.clientId);
  const providerlessDomains = items.filter((i) => i.type === 'domain' && !i.relations?.clientId);

  return {
    divisions,
    clients,
    lineageByClient,
    unmappedAssets,
    providerlessRepos,
    providerlessVercel,
    providerlessHetzner,
    providerlessCloudflare,
    providerlessDomains,
  };
}

function lineageProviderCount(l: ClientLineage, p: Exclude<ProviderKey, 'all'>): number {
  switch (p) {
    case 'vercel':
      return l.vercel.length;
    case 'hetzner':
      return l.hetzner.length;
    case 'cloudflare':
      return l.cloudflare.length;
    case 'github':
      return l.repos.length;
  }
}

function isNeedsReview(it: IndexItem): boolean {
  return it.confidence === 'needs_review';
}

function isUnmapped(it: IndexItem): boolean {
  return (it.tags ?? []).includes('unmapped');
}

// ---------------------------------------------------------------- Chip

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full border px-2.5 py-0.5 text-[11px] font-mono transition-colors ' +
        (active
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
          : 'border-zinc-200 dark:border-[#27272a] text-zinc-600 dark:text-[#a1a1aa] hover:border-[#3f3f46] hover:text-zinc-900 dark:text-[#f5f5f5]')
      }
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Badge group

function BadgeGroup({
  label,
  items,
  tone,
  onPick,
  emptyLabel = 'none',
}: {
  label: string;
  items: IndexItem[];
  tone: 'green' | 'amber' | 'blue' | 'rose' | 'neutral';
  onPick: (item: IndexItem) => void;
  emptyLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">
        {label} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-[11px] text-zinc-500 dark:text-[#52525b] font-mono">{emptyLabel}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <button
              key={`${it.type}::${it.id}`}
              type="button"
              onClick={() => onPick(it)}
              className="inline-flex"
              title={it.subtitle ?? it.title}
            >
              <Badge text={it.title} tone={tone} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Lineage card

function ClientLineageCard({
  lineage,
  onPickAsset,
  onPickClient,
  onPickItem,
  expanded,
}: {
  lineage: ClientLineage;
  onPickAsset: (id: string) => void;
  onPickClient: (id: string) => void;
  onPickItem: (item: IndexItem) => void;
  expanded?: boolean;
}) {
  const c = lineage.client;
  return (
    <AdminCard
      title={c.subtitle ? `${c.subtitle}` : 'Client'}
      action={
        c.confidence === 'needs_review' ? (
          <Badge text="Needs review" tone="amber" />
        ) : c.confidence === 'confirmed' ? (
          <Badge text="Confirmed" tone="green" />
        ) : c.confidence === 'likely' ? (
          <Badge text="Likely" tone="blue" />
        ) : null
      }
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => onPickClient(c.id)}
              className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5] hover:text-emerald-300 transition-colors text-left"
            >
              {c.title}
            </button>
            {c.url && (
              <Link
                href={c.url}
                className="ml-2 text-[10px] font-mono text-zinc-500 dark:text-[#52525b] hover:text-emerald-300"
              >
                open
              </Link>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Badge text={`${lineage.tickets.length} tickets`} />
            <Badge text={`${lineage.renewals.length} renewals`} />
            <Badge text={`${lineage.incidents.length} incidents`} />
          </div>
        </div>

        <BadgeGroup label="Assets" items={lineage.assets} tone="green" onPick={(it) => onPickAsset(it.id)} />
        <BadgeGroup label="Repos" items={lineage.repos} tone="neutral" onPick={onPickItem} />
        <BadgeGroup label="Vercel" items={lineage.vercel} tone="blue" onPick={onPickItem} />
        <BadgeGroup label="Hetzner" items={lineage.hetzner} tone="amber" onPick={onPickItem} />
        {expanded && (
          <>
            <BadgeGroup label="Cloudflare" items={lineage.cloudflare} tone="neutral" onPick={onPickItem} />
            <BadgeGroup label="Domains" items={lineage.domains} tone="neutral" onPick={onPickItem} />
            <BadgeGroup label="Tickets" items={lineage.tickets} tone="rose" onPick={onPickItem} />
            <BadgeGroup label="Renewals" items={lineage.renewals} tone="amber" onPick={onPickItem} />
            <BadgeGroup label="Incidents" items={lineage.incidents} tone="rose" onPick={onPickItem} />
          </>
        )}
      </div>
    </AdminCard>
  );
}

// ---------------------------------------------------------------- Detail panels

function AssetDetail({
  asset,
  lineage,
  onPickItem,
}: {
  asset: IndexItem;
  lineage: ClientLineage | null;
  onPickItem: (item: IndexItem) => void;
}) {
  return (
    <AdminCard
      title="Selected asset"
      action={asset.confidence ? <Badge text={asset.confidence === 'needs_review' ? 'Needs review' : asset.confidence === 'confirmed' ? 'Confirmed' : 'Likely'} tone={asset.confidence === 'needs_review' ? 'amber' : asset.confidence === 'confirmed' ? 'green' : 'blue'} /> : null}
    >
      <div className="space-y-3">
        <div>
          {asset.url ? (
            <Link href={asset.url} className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5] hover:text-emerald-300">
              {asset.title}
            </Link>
          ) : (
            <p className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5]">{asset.title}</p>
          )}
          <p className="mt-0.5 text-[11px] font-mono text-zinc-500 dark:text-[#71717a]">
            {asset.type}
            {asset.subtitle ? ` · ${asset.subtitle}` : ''}
            {asset.status ? ` · ${asset.status}` : ''}
          </p>
        </div>
        <div className="space-y-0">
          <Row label="Body" value={<span className="text-xs text-zinc-600 dark:text-[#a1a1aa]">{asset.body}</span>} />
          {asset.tags.length > 0 && (
            <Row
              label="Tags"
              value={
                <div className="flex flex-wrap gap-1">
                  {asset.tags.slice(0, 12).map((t) => (
                    <span key={t} className="text-[10px] font-mono text-zinc-500 dark:text-[#71717a] border border-zinc-200 dark:border-[#27272a] rounded-full px-1.5 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
              }
            />
          )}
        </div>
        {lineage && (
          <div className="space-y-3 border-t border-zinc-200 dark:border-[#1c1c1e] pt-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a]">
              Linked through {lineage.client.title}
            </p>
            <BadgeGroup label="Repos" items={lineage.repos} tone="neutral" onPick={onPickItem} />
            <BadgeGroup label="Vercel" items={lineage.vercel} tone="blue" onPick={onPickItem} />
            <BadgeGroup label="Hetzner" items={lineage.hetzner} tone="amber" onPick={onPickItem} />
            <BadgeGroup label="Tickets" items={lineage.tickets} tone="rose" onPick={onPickItem} />
            <BadgeGroup label="Renewals" items={lineage.renewals} tone="amber" onPick={onPickItem} />
            <BadgeGroup label="Incidents" items={lineage.incidents} tone="rose" onPick={onPickItem} />
          </div>
        )}
      </div>
    </AdminCard>
  );
}

function ClientDetail({ lineage }: { lineage: ClientLineage }) {
  const c = lineage.client;
  return (
    <AdminCard title="Selected client">
      <div className="space-y-2">
        {c.url ? (
          <Link href={c.url} className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5] hover:text-emerald-300">
            {c.title}
          </Link>
        ) : (
          <p className="text-sm font-medium text-zinc-900 dark:text-[#f5f5f5]">{c.title}</p>
        )}
        <p className="text-[11px] font-mono text-zinc-500 dark:text-[#71717a]">
          {c.subtitle ?? 'client'}
          {c.status ? ` · ${c.status}` : ''}
        </p>
        <div className="pt-2 space-y-0">
          <Row label="Assets" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.assets.length}</span>} />
          <Row label="Repos" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.repos.length}</span>} />
          <Row label="Vercel" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.vercel.length}</span>} />
          <Row label="Hetzner" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.hetzner.length}</span>} />
          <Row label="Cloudflare" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.cloudflare.length}</span>} />
          <Row label="Domains" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.domains.length}</span>} />
          <Row label="Tickets" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.tickets.length}</span>} />
          <Row label="Renewals" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.renewals.length}</span>} />
          <Row label="Incidents" value={<span className="text-xs text-zinc-800 dark:text-[#e4e4e7]">{lineage.incidents.length}</span>} />
        </div>
        {c.body && <p className="pt-2 text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">{c.body}</p>}
      </div>
    </AdminCard>
  );
}

// ---------------------------------------------------------------- Main

export default function MapClient({ initialItems }: { initialItems: IndexItem[] }) {
  const lineageData = useMemo(() => buildLineage(initialItems), [initialItems]);
  const { divisions, lineageByClient, unmappedAssets } = lineageData;

  const [selectedDivisionCode, setSelectedDivisionCode] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>('all');
  const [selectedBlockedBy, setSelectedBlockedBy] = useState<BlockedByKey>('all');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  function pickClient(id: string) {
    setSelectedClientId(id);
    setSelectedAssetId(null);
  }
  function pickAsset(id: string) {
    setSelectedAssetId(id);
    const asset = initialItems.find((i) => i.type === 'asset' && i.id === id);
    if (asset?.relations?.clientId) setSelectedClientId(asset.relations.clientId);
  }
  function pickItem(it: IndexItem) {
    if (it.type === 'asset') pickAsset(it.id);
    else if (it.type === 'client') pickClient(it.id);
    // For other types we leave selection alone — the badge is informational.
  }

  // Filter the visible lineages based on division/provider/status/blockedBy.
  const visibleLineages = useMemo<ClientLineage[]>(() => {
    const out: ClientLineage[] = [];
    for (const lineage of lineageByClient.values()) {
      const c = lineage.client;
      if (selectedDivisionCode !== 'all' && c.relations?.divisionCode !== selectedDivisionCode) continue;

      if (selectedProvider !== 'all') {
        if (lineageProviderCount(lineage, selectedProvider) === 0) continue;
      }

      if (selectedStatus === 'needs_review') {
        const any =
          isNeedsReview(c) ||
          lineage.assets.some(isNeedsReview);
        if (!any) continue;
      } else if (selectedStatus === 'unmapped') {
        const any = isUnmapped(c) || lineage.assets.some(isUnmapped);
        if (!any) continue;
      }

      if (selectedBlockedBy !== 'all') {
        const allChildren = [
          c,
          ...lineage.assets,
          ...lineage.repos,
          ...lineage.vercel,
          ...lineage.hetzner,
          ...lineage.cloudflare,
          ...lineage.domains,
          ...lineage.tickets,
          ...lineage.renewals,
          ...lineage.incidents,
        ];
        const hit = allChildren.some((it) => (it.blockedBy ?? []).includes(selectedBlockedBy));
        if (!hit) continue;
      }

      out.push(lineage);
    }
    out.sort((a, b) => a.client.title.localeCompare(b.client.title));
    return out;
  }, [lineageByClient, selectedDivisionCode, selectedProvider, selectedStatus, selectedBlockedBy]);

  const selectedAsset = useMemo(
    () => (selectedAssetId ? initialItems.find((i) => i.type === 'asset' && i.id === selectedAssetId) ?? null : null),
    [initialItems, selectedAssetId],
  );
  const selectedAssetLineage = selectedAsset?.relations?.clientId
    ? lineageByClient.get(selectedAsset.relations.clientId) ?? null
    : null;
  const selectedClientLineage = selectedClientId ? lineageByClient.get(selectedClientId) ?? null : null;
  const expandedLineage = selectedClientLineage;

  return (
    <div className="grid gap-5 lg:grid-cols-[14rem_1fr_22rem]">
      {/* -------------------- Left: Filters -------------------- */}
      <aside className="space-y-4">
        <AdminCard title="Division">
          <div className="flex flex-wrap gap-1.5">
            <Chip
              active={selectedDivisionCode === 'all'}
              onClick={() => setSelectedDivisionCode('all')}
            >
              All
            </Chip>
            {divisions.map((d) => {
              const code = d.relations?.divisionCode ?? d.subtitle ?? d.id;
              return (
                <Chip
                  key={d.id}
                  active={selectedDivisionCode === code}
                  onClick={() => setSelectedDivisionCode(code)}
                >
                  {d.subtitle ?? d.title}
                </Chip>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard title="Provider">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'vercel', 'hetzner', 'cloudflare', 'github'] as ProviderKey[]).map((p) => {
              const label =
                p === 'all'
                  ? 'All'
                  : p === 'github'
                  ? 'GitHub'
                  : p[0].toUpperCase() + p.slice(1);
              return (
                <Chip key={p} active={selectedProvider === p} onClick={() => setSelectedProvider(p)}>
                  {label}
                </Chip>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard title="Status">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'needs_review', 'unmapped'] as StatusKey[]).map((s) => {
              const label =
                s === 'all' ? 'All' : s === 'needs_review' ? 'Needs review' : 'Unlinked';
              return (
                <Chip key={s} active={selectedStatus === s} onClick={() => setSelectedStatus(s)}>
                  {label}
                </Chip>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard title="Waiting on">
          <select
            value={selectedBlockedBy}
            onChange={(e) => setSelectedBlockedBy(e.target.value as BlockedByKey)}
            className="w-full rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#0a0a0b] px-2.5 py-2 text-xs text-zinc-800 dark:text-[#e4e4e7] focus:border-emerald-400/40 focus:outline-none"
          >
            <option value="all">Anything</option>
            <option value="db">{labelFor(BLOCKED_BY_LABEL, 'db')}</option>
            <option value="ssh">{labelFor(BLOCKED_BY_LABEL, 'ssh')}</option>
            <option value="github_token">{labelFor(BLOCKED_BY_LABEL, 'github_token')}</option>
            <option value="vercel_token">{labelFor(BLOCKED_BY_LABEL, 'vercel_token')}</option>
            <option value="cloudflare_token">{labelFor(BLOCKED_BY_LABEL, 'cloudflare_token')}</option>
            <option value="hetzner_token">{labelFor(BLOCKED_BY_LABEL, 'hetzner_token')}</option>
            <option value="human">{labelFor(BLOCKED_BY_LABEL, 'human')}</option>
          </select>
        </AdminCard>

        {(selectedDivisionCode !== 'all' ||
          selectedProvider !== 'all' ||
          selectedStatus !== 'all' ||
          selectedBlockedBy !== 'all' ||
          selectedClientId ||
          selectedAssetId) && (
          <button
            type="button"
            onClick={() => {
              setSelectedDivisionCode('all');
              setSelectedProvider('all');
              setSelectedStatus('all');
              setSelectedBlockedBy('all');
              setSelectedClientId(null);
              setSelectedAssetId(null);
            }}
            className="w-full rounded-full border border-zinc-200 dark:border-[#27272a] hover:border-[#3f3f46] px-3 py-1.5 text-[11px] font-mono text-zinc-500 dark:text-[#71717a] hover:text-zinc-900 dark:text-[#f5f5f5] transition-colors"
          >
            Reset all
          </button>
        )}
      </aside>

      {/* -------------------- Centre: Lineages -------------------- */}
      <section className="space-y-4">
        {selectedClientId && expandedLineage ? (
          <ClientLineageCard
            lineage={expandedLineage}
            onPickAsset={pickAsset}
            onPickClient={pickClient}
            onPickItem={pickItem}
            expanded
          />
        ) : visibleLineages.length === 0 ? (
          <EmptyState
            title="No clients match these filters"
            hint="Try clearing the division, provider, status, or blocked-by filters."
          />
        ) : (
          visibleLineages.map((l) => (
            <ClientLineageCard
              key={l.client.id}
              lineage={l}
              onPickAsset={pickAsset}
              onPickClient={pickClient}
              onPickItem={pickItem}
            />
          ))
        )}

        {!selectedClientId && (unmappedAssets.length > 0 || lineageData.providerlessVercel.length > 0) && (
          <AdminCard title="Not yet linked to a client">
            <div className="space-y-3">
              <BadgeGroup label="Assets" items={unmappedAssets} tone="amber" onPick={(it) => pickAsset(it.id)} />
              <BadgeGroup label="Vercel projects" items={lineageData.providerlessVercel} tone="amber" onPick={pickItem} />
              <BadgeGroup label="Hetzner servers" items={lineageData.providerlessHetzner} tone="amber" onPick={pickItem} />
              <BadgeGroup label="Cloudflare zones" items={lineageData.providerlessCloudflare} tone="amber" onPick={pickItem} />
              <BadgeGroup label="Domains" items={lineageData.providerlessDomains} tone="amber" onPick={pickItem} />
              <BadgeGroup label="Repos" items={lineageData.providerlessRepos} tone="amber" onPick={pickItem} />
            </div>
          </AdminCard>
        )}
      </section>

      {/* -------------------- Right: Detail -------------------- */}
      <aside className="space-y-4">
        {selectedAsset ? (
          <AssetDetail asset={selectedAsset} lineage={selectedAssetLineage} onPickItem={pickItem} />
        ) : selectedClientLineage ? (
          <ClientDetail lineage={selectedClientLineage} />
        ) : (
          <EmptyState
            title="Nothing selected"
            hint="Select a client or asset on the left to see what's connected to it."
          />
        )}
      </aside>
    </div>
  );
}
