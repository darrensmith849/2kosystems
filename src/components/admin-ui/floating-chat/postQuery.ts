// Thin fetch wrapper for the assistant endpoint.
// Sends question + mode + optional pageContext. The route's Zod schema is
// .strict(), so the corresponding API change accepts (and ignores) the
// pageContext field. If the schema bump has not landed yet, callers can pass
// includePageContext: false to keep the request safe.

import type { AssistantAnswer, PageContext } from './chatTypes';

const ENDPOINT = '/api/admin/ops/assistant/query';

export type PostQueryOptions = {
  /**
   * Page context (route + section title) sent to the API. Used by the server
   * to add a single grounding line to the user message. Pass undefined to
   * omit. Safe to send even if the schema does not yet accept it — extra
   * fields will trigger a 400 only on .strict() schemas, so the API edit MUST
   * land before the widget is shipped.
   */
  pageContext?: PageContext;
  /**
   * Defaults to 'ai_if_available'. Pass 'search_only' to bypass AI.
   */
  mode?: 'ai_if_available' | 'search_only';
  /**
   * AbortSignal for cancelling in-flight requests on unmount.
   */
  signal?: AbortSignal;
};

export async function postQuery(
  question: string,
  options: PostQueryOptions = {},
): Promise<AssistantAnswer> {
  const { pageContext, mode = 'ai_if_available', signal } = options;

  const body: Record<string, unknown> = { question, mode };
  if (pageContext) body.pageContext = pageContext;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) detail = data.error;
    } catch {
      /* keep status-line detail */
    }
    throw new Error(detail);
  }

  return (await res.json()) as AssistantAnswer;
}
