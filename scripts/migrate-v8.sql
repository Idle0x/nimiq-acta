-- Acta migration v8: treasury retry queue + daily check-ins
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
CREATE TABLE IF NOT EXISTS checkins (
  address TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  tx_hash TEXT,
  PRIMARY KEY (address, day)
);
CREATE INDEX IF NOT EXISTS idx_checkins_address ON checkins (address, day DESC);
