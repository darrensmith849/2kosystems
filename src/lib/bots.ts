/**
 * AI bot policy constants.
 *
 * Distinguishes between live-retrieval assistant bots (which produce citations
 * back to your site in answer engines) and training-data crawlers (which feed
 * base models — useful long-term but also fuel competitor scrapers).
 *
 * Default 2KO policy:
 *   - Allow assistant retrievers explicitly (they drive conversions).
 *   - Allow major search-engine bots (Bing powers ChatGPT search + Copilot).
 *   - Block Common Crawl (training data with low citation ROI for B2B).
 *
 * Each consuming site can override by passing different arrays into
 * the robots.ts factory.
 */

/**
 * Bots that live-retrieve URLs to cite in answer-engine results.
 * Allowing these is the primary lever for AI-search citation visibility.
 */
export const ASSISTANT_RETRIEVAL_BOTS = [
  "GPTBot", // OpenAI training crawler (also drives some retrieval — allowing it has both effects)
  "OAI-SearchBot", // ChatGPT search live crawler
  "ChatGPT-User", // ChatGPT browsing tool (per-message live fetch)
  "PerplexityBot", // Perplexity indexing
  "Perplexity-User", // Perplexity live fetch on user query
  "ClaudeBot", // Anthropic training + search indexing
  "Claude-User", // Claude browsing tool (per-message live fetch)
  "Claude-SearchBot", // Claude search live crawler
  "Google-Extended", // Google Gemini / AI Overviews training opt-in
  "Applebot-Extended", // Apple Intelligence opt-in
] as const;

/** Major search-engine bots that should always be allowed. */
export const SEARCH_ENGINE_BOTS = [
  "Bingbot", // Powers ChatGPT search, Copilot, DuckDuckGo
  "Googlebot", // Google Search + AI Overviews
] as const;

/**
 * Crawlers we deliberately block.
 *
 * CCBot (Common Crawl) feeds base-model training data. For a commercial B2B
 * training provider the citation ROI is low while the downside (competitor
 * scraping, content farms) is high. Reassess in 12 months.
 */
export const BLOCKED_BOTS = ["CCBot"] as const;

export type BotName =
  | (typeof ASSISTANT_RETRIEVAL_BOTS)[number]
  | (typeof SEARCH_ENGINE_BOTS)[number]
  | (typeof BLOCKED_BOTS)[number];
