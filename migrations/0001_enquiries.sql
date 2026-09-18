-- Enquiries across the estate.
--
-- Before this table there was nowhere for an enquiry to live. Every site
-- emailed and forgot: 2ko.co.za posted to Sigmafy, sixsigmauk.com sent mail,
-- and sixsigmasouthafrica.co.za silently posted nowhere at all because its
-- code read SIGMAFY_API_URL while its Worker only carried an ingest token.
-- One row per enquiry, written by whichever site took it.
--
-- This holds personal information — names, email addresses, phone numbers.
-- It is reachable only through /internal, which the Proxy gates and which
-- fails closed when credentials are unset. Anything built on top of this
-- inherits that obligation.

CREATE TABLE IF NOT EXISTS enquiries (
  id            TEXT PRIMARY KEY,
  received_at   TEXT NOT NULL,             -- ISO 8601, UTC
  site          TEXT NOT NULL,             -- host that took it
  kind          TEXT NOT NULL,             -- contact | quote | audit | course
  source_page   TEXT,

  name          TEXT,
  email         TEXT,
  phone         TEXT,
  company       TEXT,

  subject       TEXT,
  message       TEXT,

  -- Course enquiries carry more. Null everywhere else.
  course_topic    TEXT,
  course_mode     TEXT,
  delegates       INTEGER,
  preferred_city  TEXT,
  industry        TEXT,

  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT,

  referrer      TEXT,
  country       TEXT,
  user_agent    TEXT,

  -- Reply tracking. The autoresponder writes here; so does a human marking
  -- one handled. Kept on the enquiry rather than a separate table because the
  -- question this answers is "did this person get a reply", not "how many
  -- messages were exchanged".
  status          TEXT NOT NULL DEFAULT 'new',  -- new | responded | closed
  responded_at    TEXT,
  response_kind   TEXT,                          -- auto | human
  response_summary TEXT,

  -- Whatever the sending site had that this schema does not, kept as JSON so
  -- a new field on one form is not a migration.
  extra         TEXT
);

-- The dashboard reads newest-first, filtered by site and by status.
CREATE INDEX IF NOT EXISTS idx_enquiries_received ON enquiries (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_site     ON enquiries (site, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status   ON enquiries (status, received_at DESC);

-- Deduplication. A retried POST must not create a second row, so senders pass
-- a stable key derived from the submission.
CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiries_dedupe ON enquiries (site, email, received_at);
