-- People who have contacted the estate, one row each.
--
-- Replaces the Brevo contact upsert that sixsigmasouthafrica.co.za used to
-- make. Cloudflare Email Sending sends; it has no contact store, so the list
-- either disappeared or came here. It came here.
--
-- Distinct from `enquiries`: that table is one row per submission and never
-- changes; this is one row per person, updated each time they come back. The
-- questions are different — "what came in on Tuesday" versus "who is this and
-- how many times have they asked".
--
-- The Brevo attributes it carried (FIRSTNAME, LASTNAME, COMPANY,
-- LAST_ENQUIRY_*, INDUSTRY, SMS/PHONE) map onto real columns here rather than
-- a bag of strings, because we control the schema now.
--
-- Personal information, same as `enquiries`, reachable only through /internal.

CREATE TABLE IF NOT EXISTS contacts (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL,
  site          TEXT NOT NULL,             -- host they first came through

  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  company       TEXT,
  industry      TEXT,

  -- The most recent enquiry's shape, so a rep opening the record sees what
  -- this person last asked about without joining.
  last_subject        TEXT,
  last_source_page    TEXT,
  last_course_topic   TEXT,
  last_course_mode    TEXT,
  last_delegates      TEXT,
  last_preferred_city TEXT,

  enquiry_count INTEGER NOT NULL DEFAULT 1,
  first_seen    TEXT NOT NULL,             -- ISO 8601, UTC
  last_seen     TEXT NOT NULL
);

-- One row per person per site. The same address enquiring on two brands is two
-- relationships, not one — Six Sigma South Africa and 2KO are different
-- businesses to the person on the other end.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email_site ON contacts (email, site);
CREATE INDEX IF NOT EXISTS idx_contacts_last_seen ON contacts (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_company   ON contacts (company);
