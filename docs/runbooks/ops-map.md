# /admin/ops — Asset map

> See also: [`ops-command-centre.md`](./ops-command-centre.md) (front door),
> [`ops-search.md`](./ops-search.md) (the same index, queried differently),
> and [`ops-assistant.md`](./ops-assistant.md).

## What the map is

`/admin/ops/map` is a relationship explorer over the ops knowledge index.
It groups every `IndexItem` by the client it relates to and renders nested
lists of repos, Vercel projects, Hetzner servers, Cloudflare zones,
domains, tickets, renewals, and incidents under each client. It is a
**deliberate text/tree view, not a graph drawing** — no graph library, no
canvas, no SVG layout engine. Everything reachable from a client is one
click away from its row.

The page is server-rendered (`page.tsx` calls `buildIndex()`), then handed
to `MapClient.tsx` which owns filters and grouping in the browser. Nothing
on this page mutates data.

## Filters

`MapClient` exposes three filters, applied client-side over the same
in-memory `IndexItem[]`:

| Filter | Values | Behaviour |
|---|---|---|
| `provider` | `all`, `vercel`, `hetzner`, `cloudflare`, `github` | Restricts the per-client buckets to a single provider type (mapped via `PROVIDER_TYPE`). |
| `status` | `all`, `needs_review`, `unmapped` | `needs_review` keeps items whose `confidence === 'needs_review'`. `unmapped` shows the providerless lanes (items whose `relations.clientId` is missing or unknown). |
| `blockedBy` | `all`, `db`, `ssh`, `github_token`, `vercel_token`, `cloudflare_token`, `hetzner_token`, `human` | Keeps items whose `blockedBy` array contains the chosen key. |

All three filters compose. Selecting `provider=vercel` +
`status=unmapped` shows just the providerless Vercel lane.

## Data shape

Every node on the map is an `IndexItem` (see
`src/lib/ops/ops-knowledge-index.ts`):

```ts
type IndexItem = {
  id: string;
  type: 'division' | 'client' | 'asset' | 'github_repo'
      | 'vercel_project' | 'hetzner_server' | 'cloudflare_zone'
      | 'domain' | 'ticket' | 'renewal' | 'incident'
      | 'audit_finding' | 'review_decision' | 'import_readiness'
      | 'activation_step' | 'runbook';
  title: string;
  subtitle?: string;
  body: string;
  tags: string[];
  source: 'snapshot' | 'db' | 'docs' | 'readiness';
  url?: string;
  status?: string;
  confidence?: 'confirmed' | 'likely' | 'needs_review' | 'unknown';
  blockedBy?: string[];
  relations?: {
    clientId?: string;
    divisionCode?: string;
    assetId?: string;
  };
};
```

The map cares almost exclusively about the `relations` object. Everything
else is rendered as labels and badges.

## How relationships are derived

The `buildIndex()` indexer stamps `relations` per type:

- **client** → `relations.divisionCode` from the client's tagged division.
- **asset** → `relations.clientId`, `relations.assetId = self`. Unmapped
  assets carry no `clientId`.
- **github_repo / vercel_project** → `relations.clientId` resolved by
  snapshot-side ownership tagging. Repos in a `github_org` shared across
  multiple clients fall through with no `clientId`.
- **hetzner_server / cloudflare_zone / domain** → `relations.clientId`
  when the snapshot row links them to a single owning client; otherwise
  they land in the providerless lane.
- **ticket / renewal / incident** → `relations.clientId` and (when
  applicable) `relations.assetId` from the source row.

`MapClient.buildLineage()` walks the array once: clients seed buckets,
every other item gets dropped into its `relations.clientId` bucket (or the
matching providerless lane). Assets without a client become
`unmappedAssets`. Tickets / renewals / incidents follow the asset's
`clientId` if they have one, the asset's owner client otherwise.

## Examples

Four traversals you can run by sight:

1. **Division → clients** — pick a division row in the index; every client
   with `relations.divisionCode === <code>` is one of its members.
2. **Client → assets → tickets** — a client's `assets[]` bucket lists
   every asset whose `relations.clientId === client.id`. The same client's
   `tickets[]` bucket lists every ticket with the same `clientId`. Cross-
   reference `ticket.relations.assetId` to land back on a specific asset.
3. **Vercel project → unmapped lane → review queue** — toggle
   `status=unmapped` + `provider=vercel`. Every row that lands here is a
   candidate for a `cluster: 'unmapped_vercel'` decision on
   `/admin/ops/review`.
4. **Hetzner server → assets → repos** — `provider=hetzner` shows servers
   per client; from any client's lineage, `assets[]` reveals which assets
   live on that server (asset rows carry their host in `tags`), and
   `repos[]` reveals which repos deploy to them (repo rows carry deploy
   targets in `tags`).

## Without DB

The index is built from `SNAPSHOT_*` constants plus `RUNBOOKS` plus
`ACTIVATION_STEPS`. Every item carries `source: 'snapshot' | 'docs' |
'readiness'`. `SnapshotBanner` shows at the top of the page. Traversals
work normally — they just describe the snapshot.

## With DB

`dbItems()` emits live rows with `source: 'db'` for every indexed table.
The merge in `buildIndex()` drops snapshot rows whose `(type,
lowercase title)` collides with a live row, so the map shows live rows in
preference. The lineage layout is identical; only the source tags change.
