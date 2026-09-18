-- Acta migration v4: inbox + referrals + act indexes
-- Run: psql $DATABASE_URL -f scripts/migrate-v4.sql   (or paste into Neon SQL editor)

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_address ON notifications (address, created_at DESC);

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS referral_settlements (
  referral_id TEXT NOT NULL REFERENCES referrals(id),
  referee TEXT UNIQUE NOT NULL,
  settled_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_acts_actor ON acts (actor_address);
CREATE INDEX IF NOT EXISTS idx_acts_created ON acts (created_at DESC);
