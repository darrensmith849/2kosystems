// Small inline chip rendered next to entity names in tables when those rows
// are sourced from the static snapshot instead of the live DB.

export default function SnapshotBadge() {
  return (
    <span className="ml-2 inline-block text-[9px] font-mono uppercase tracking-[0.15em] text-emerald-300/80 border border-emerald-400/30 rounded-full px-1.5 py-0.5 align-middle">
      snapshot
    </span>
  );
}
