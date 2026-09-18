-- Acta migration v7: listing reports (flag-for-review)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  reporter TEXT NOT NULL,
  reason TEXT NOT NULL,
  detail TEXT,
  created_at BIGINT NOT NULL,
  UNIQUE (listing_id, reporter)
);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports (listing_id);
