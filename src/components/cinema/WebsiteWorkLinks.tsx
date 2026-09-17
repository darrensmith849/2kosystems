import type { Example } from "@/lib/websites";

export default function WebsiteWorkLinks({ examples }: { examples: Example[] }) {
  return (
    <details className="lwa-live-work">
      <summary>
        Prefer to inspect a live build? <span>View text links only</span>
      </summary>
      <ul>
        {examples.map((example) => (
          <li key={example.url}>
            <a href={example.url} target="_blank" rel="noopener noreferrer">
              {example.name} ↗
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
