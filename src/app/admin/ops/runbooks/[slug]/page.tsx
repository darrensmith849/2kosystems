import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionHeader } from '@/components/admin-ui';
import { findRunbook } from '@/lib/ops/runbook-catalog';

export const dynamic = 'force-dynamic';

// Whitelist: only files inside docs/runbooks/ or docs/migration/ are readable.
function isAllowedPath(relPath: string): boolean {
  const normalized = path.normalize(relPath);
  if (normalized.includes('..')) return false;
  return (
    normalized.startsWith('docs/runbooks/') ||
    normalized.startsWith('docs/migration/')
  );
}

function readRunbook(relPath: string): string | null {
  if (!isAllowedPath(relPath)) return null;
  try {
    const abs = path.join(process.cwd(), relPath);
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

// ---------- inline markdown parser ----------
// Intentionally minimal — no third-party deps. Renders the subset of Markdown
// used by these runbooks: headings, lists, paragraphs, inline code, code
// blocks, bold, italic, links. Tables/images fall through as raw text.

type InlineNode = string | { kind: 'el'; tag: string; props: Record<string, unknown>; children: InlineNode[] };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Parse inline markdown (code, bold, italic, links) into React-renderable nodes.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let i = 0;

  // Tokenization order: inline code, then links, then bold, then italic.
  // Use a single-pass regex with alternation so the first match wins.
  const pattern = /(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(_([^_]+)_)/;

  while (rest.length > 0) {
    const m = rest.match(pattern);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) {
      out.push(rest.slice(0, m.index));
    }
    if (m[1]) {
      // inline code
      out.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="font-mono text-[0.85em] text-emerald-200 bg-white dark:bg-[#0a0a0b] border border-zinc-200 dark:border-[#1c1c1e] rounded px-1 py-0.5"
        >
          {m[2]}
        </code>
      );
    } else if (m[3]) {
      // link
      const label = m[4];
      const url = m[5];
      const isExternal = /^https?:\/\//i.test(url);
      out.push(
        <a
          key={`${keyPrefix}-a-${i++}`}
          href={url}
          {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
        >
          {label}
        </a>
      );
    } else if (m[6]) {
      // bold
      out.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-zinc-900 dark:text-[#f5f5f5]">
          {m[7]}
        </strong>
      );
    } else if (m[8]) {
      // italic
      out.push(
        <em key={`${keyPrefix}-i-${i++}`} className="italic text-zinc-800 dark:text-[#e4e4e7]">
          {m[9]}
        </em>
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }

  return out;
}

type Block =
  | { kind: 'h1' | 'h2' | 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'pre'; lang: string; text: string }
  | { kind: 'raw'; text: string };

function parseMarkdown(src: string): Block[] {
  const lines = src.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      // skip closing fence
      if (i < lines.length) i++;
      blocks.push({ kind: 'pre', lang, text: buf.join('\n') });
      continue;
    }

    // Headings
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length as 1 | 2 | 3;
      blocks.push({ kind: (`h${level}` as 'h1' | 'h2' | 'h3'), text: h[2] });
      i++;
      continue;
    }

    // Bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    // Blank line -> paragraph boundary
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // Tables / images / blockquotes / anything else: render raw line(s) as a
    // paragraph that preserves the source. Group consecutive non-empty,
    // non-special lines into one paragraph.
    const buf: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    const joined = buf.join(' ');
    // Treat as paragraph (inline parsing handles links/code/bold/italic).
    // Tables and images simply pass through their raw line text.
    if (joined.startsWith('|') || joined.startsWith('![')) {
      blocks.push({ kind: 'raw', text: joined });
    } else {
      blocks.push({ kind: 'p', text: joined });
    }
  }

  return blocks;
}

function renderBlock(block: Block, idx: number): React.ReactNode {
  const key = `b-${idx}`;
  switch (block.kind) {
    case 'h1':
      return (
        <h1 key={key} className="text-xl font-semibold text-zinc-900 dark:text-[#f5f5f5] mt-6 mb-3">
          {renderInline(block.text, key)}
        </h1>
      );
    case 'h2':
      return (
        <h2 key={key} className="text-base font-semibold text-zinc-900 dark:text-[#f5f5f5] mt-6 mb-2">
          {renderInline(block.text, key)}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={key} className="text-sm font-semibold text-zinc-800 dark:text-[#e4e4e7] mt-4 mb-2">
          {renderInline(block.text, key)}
        </h3>
      );
    case 'p':
      return (
        <p key={key} className="text-sm text-[#d4d4d8] leading-relaxed my-2">
          {renderInline(block.text, key)}
        </p>
      );
    case 'ul':
      return (
        <ul key={key} className="list-disc pl-5 my-2 space-y-1 text-sm text-[#d4d4d8]">
          {block.items.map((item, j) => (
            <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="list-decimal pl-5 my-2 space-y-1 text-sm text-[#d4d4d8]">
          {block.items.map((item, j) => (
            <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
          ))}
        </ol>
      );
    case 'pre':
      return (
        <pre
          key={key}
          className="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#1c1c1e] bg-white dark:bg-[#0a0a0b] p-4"
        >
          <code className="font-mono text-[12px] leading-relaxed text-zinc-800 dark:text-[#e4e4e7] whitespace-pre">
            {block.text}
          </code>
        </pre>
      );
    case 'raw':
      return (
        <p key={key} className="text-xs font-mono text-zinc-600 dark:text-[#a1a1aa] my-2 whitespace-pre-wrap break-words">
          {block.text}
        </p>
      );
  }
}

export default async function RunbookViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findRunbook(slug);
  if (!entry) notFound();

  const raw = readRunbook(entry.path);
  if (raw === null) notFound();

  // Suppress unused-warn for escapeHtml — kept for future-proofing if we
  // need to render unparsed segments verbatim. Referenced here so TS lints
  // do not flag it. (No-op at runtime.)
  void escapeHtml;

  const blocks = parseMarkdown(raw);

  return (
    <div className="space-y-5">
      <SectionHeader
        title={entry.title}
        subtitle={
          <Link
            href="/admin/ops/runbooks"
            className="text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            ← back to Runbooks
          </Link>
        }
      />

      <div className="rounded-2xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#111113] p-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 dark:text-[#71717a] mb-4">
          {entry.path}
        </p>
        <article className="max-w-none">
          {blocks.map((b, idx) => renderBlock(b, idx))}
        </article>
      </div>
    </div>
  );
}
