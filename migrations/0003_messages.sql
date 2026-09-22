-- Every outbound email the group sends, across every business, whoever sent it.
--
-- The point is a birds-eye view, so this is deliberately provider-agnostic.
-- Cloudflare sends write here directly; Brevo sends arrive via its event
-- webhook. That matters more than it sounds: SA Private Schools can stay on
-- Brevo and still appear on the dashboard beside Sigmafy and Six Sigma, so the
-- view does not wait on a migration nobody has decided to do.
--
-- Two tables rather than one. `messages` is the thing sent and its current
-- state; `message_events` is append-only history. The dashboard reads the
-- first and never aggregates the second on page load, which is why the
-- counters are denormalised onto the message.
--
-- Personal information — recipient addresses, and the fact that a named person
-- opened something at a time from an IP. POPIA applies; it is reachable only
-- through /internal and it needs a retention rule before it grows.

CREATE TABLE IF NOT EXISTS messages (
  id            TEXT PRIMARY KEY,          -- also the tracking id in pixel/click URLs
  sent_at       TEXT NOT NULL,             -- ISO 8601, UTC
  site          TEXT NOT NULL,             -- sending host, the "which business" column
  provider      TEXT NOT NULL,             -- cloudflare | brevo | other
  provider_id   TEXT,                      -- the provider's own message id, when it gives one

  from_address  TEXT NOT NULL,
  from_name     TEXT,
  to_address    TEXT NOT NULL,
  subject       TEXT,

  -- A stable slug for the template, so "Welcome to Class" can be counted as a
  -- kind of message rather than 268 unrelated rows.
  template      TEXT,
  kind          TEXT,                      -- transactional | notification | marketing

  -- Links back into the estate's own records where one exists.
  enquiry_id    TEXT,
  contact_email TEXT,

  status        TEXT NOT NULL DEFAULT 'sent',  -- sent | delivered | bounced | failed | complained
  failed_reason TEXT,

  -- Denormalised so a list view is one query. first_* answers "did this land";
  -- *_count answers "how much".
  delivered_at  TEXT,
  first_open_at TEXT,
  open_count    INTEGER NOT NULL DEFAULT 0,
  first_click_at TEXT,
  click_count   INTEGER NOT NULL DEFAULT 0,

  meta          TEXT                       -- JSON, for whatever a sender wants to keep
);

CREATE INDEX IF NOT EXISTS idx_messages_sent      ON messages (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_site      ON messages (site, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_to        ON messages (to_address, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status    ON messages (status, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_template  ON messages (template, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_provider  ON messages (provider, provider_id);

CREATE TABLE IF NOT EXISTS message_events (
  id          TEXT PRIMARY KEY,
  message_id  TEXT NOT NULL,
  event       TEXT NOT NULL,   -- sent|delivered|open|click|bounce|complaint|unsubscribe|failed
  -- Where the claim came from, because they are not equally trustworthy. An
  -- `open` from a pixel is weak evidence; a `click` from our own redirect is
  -- strong; a `bounce` from the provider is authoritative.
  source      TEXT NOT NULL,   -- pixel | redirect | cloudflare | brevo
  occurred_at TEXT NOT NULL,

  url         TEXT,            -- clicks only: where they went
  ip          TEXT,
  user_agent  TEXT,
  -- Apple Mail Privacy Protection pre-fetches every image in every message,
  -- so a large share of "opens" are machines. Flagged at write time rather
  -- than guessed at read time, so the dashboard can show honest numbers.
  likely_proxy INTEGER NOT NULL DEFAULT 0,
  detail      TEXT             -- JSON
);

CREATE INDEX IF NOT EXISTS idx_events_message ON message_events (message_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_kind    ON message_events (event, occurred_at DESC);
