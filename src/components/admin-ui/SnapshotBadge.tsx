// Small inline chip rendered next to entity names when the row is saved
// discovery data rather than a live database row. Sentence case "preview".

export default function SnapshotBadge() {
  return (
    <span className="ml-2 inline-block align-middle rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300 transition-colors">
      preview
    </span>
  );
}
