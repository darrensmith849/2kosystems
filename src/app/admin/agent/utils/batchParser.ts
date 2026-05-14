import type { BatchItem } from './batchInboxStorage';

export interface ParseResult {
  items: BatchItem[];
  format: 'json' | 'text' | 'error';
  error?: string;
}

function makeId() {
  return `bi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function parseJsonArray(text: string): ParseResult {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return { items: [], format: 'error', error: 'JSON must be an array of objects.' };

    const items: BatchItem[] = parsed.map((raw: Record<string, unknown>) => ({
      id: makeId(),
      createdAt: Date.now(),
      message: String(raw.message ?? raw.body ?? raw.Body ?? raw.Message ?? ''),
      subject: String(raw.subject ?? raw.Subject ?? raw.title ?? ''),
      senderName: String(raw.senderName ?? raw.name ?? raw.sender ?? raw.from ?? ''),
      senderEmail: String(raw.senderEmail ?? raw.email ?? raw.Email ?? ''),
      senderPhone: String(raw.senderPhone ?? raw.phone ?? raw.Phone ?? ''),
      source: String(raw.source ?? 'batch_import'),
      status: 'queued' as const,
    }));

    const valid = items.filter((i) => i.message.trim().length > 0);
    if (valid.length === 0) return { items: [], format: 'error', error: 'No items with a message field found.' };
    return { items: valid, format: 'json' };
  } catch {
    return { items: [], format: 'error', error: 'Could not parse JSON.' };
  }
}

function parsePlainText(text: string): ParseResult {
  // Split on --- or ### on their own line
  const blocks = text.split(/^(?:---|###)\s*$/m).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return { items: [], format: 'error', error: 'No blocks found.' };

  const items: BatchItem[] = blocks.map((block) => {
    const lines = block.split('\n');
    // First short line (≤80 chars) becomes the subject if there are multiple lines
    let subject = '';
    let messageLines = lines;
    if (lines.length > 1 && lines[0].length <= 80) {
      subject = lines[0].trim();
      messageLines = lines.slice(1);
    }
    return {
      id: makeId(),
      createdAt: Date.now(),
      subject,
      message: messageLines.join('\n').trim(),
      senderName: '',
      senderEmail: '',
      senderPhone: '',
      source: 'batch_import',
      status: 'queued' as const,
    };
  });

  const valid = items.filter((i) => i.message.length > 0);
  if (valid.length === 0) return { items: [], format: 'error', error: 'No messages found in blocks.' };
  return { items: valid, format: 'text' };
}

export function parseBatchInput(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { items: [], format: 'error', error: 'Input is empty.' };
  if (trimmed.startsWith('[')) return parseJsonArray(trimmed);
  return parsePlainText(trimmed);
}
