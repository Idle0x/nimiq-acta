-- ==========================================================
-- Acta: Re-include all missing tables and columns in Neon Postgres
-- Safe and idempotent: Uses IF NOT EXISTS everywhere.
-- ==========================================================

-- 1. Daily Check-ins & Streak Table
CREATE TABLE IF NOT EXISTS checkins (
  address TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  tx_hash TEXT,
  PRIMARY KEY (address, day)
);
CREATE INDEX IF NOT EXISTS idx_checkins_address ON checkins (address, day DESC);

-- 2. Pending Treasury Drips (Retry queue for payouts)
CREATE TABLE IF NOT EXISTS pending_drips (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  address TEXT NOT NULL,
  amount_nim DOUBLE PRECISION NOT NULL,
  ref_id TEXT NOT NULL,
  proof_json JSONB,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  UNIQUE (kind, address, ref_id)
);
CREATE INDEX IF NOT EXISTS idx_drips_created ON pending_drips (created_at);

-- 3. Authentication Nonces (Challenge-Response login)
CREATE TABLE IF NOT EXISTS auth_nonces (
  nonce TEXT PRIMARY KEY,
  created_at BIGINT NOT NULL
);

-- 4. Encrypted Lender Keys (QR return token verification)
CREATE TABLE IF NOT EXISTS lender_keys (
  owner_address TEXT PRIMARY KEY,
  public_key_hex TEXT NOT NULL,
  private_key_hex_encrypted TEXT NOT NULL
);

-- 5. Listing Reports (Community flagging)
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

-- 6. Ensure all required columns exist on listings, escrows, and venture_submissions
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contract JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS expires_at BIGINT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS require_location BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_lat DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_lng DOUBLE PRECISION;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'open';

ALTER TABLE escrows ADD COLUMN IF NOT EXISTS deadline_at BIGINT;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS progress TEXT NOT NULL DEFAULT 'awaiting_proof';
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS completer TEXT;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS tx_hash_in TEXT;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS tx_hash_out TEXT;
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS lender_pubkey TEXT;

ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS confidence INTEGER;
ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS reason TEXT;
