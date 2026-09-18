-- Acta migration v5: contracts, deadlines, progress
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contract JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS expires_at BIGINT;     -- listing stops accepting
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS deadline_at BIGINT;     -- accepted work must complete by
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS progress TEXT NOT NULL DEFAULT 'awaiting_proof';
-- progress: awaiting_proof | submitted | settled | refunded | expired
CREATE INDEX IF NOT EXISTS idx_escrows_deadline ON escrows (deadline_at) WHERE state = 'locked';
CREATE INDEX IF NOT EXISTS idx_listings_expiry ON listings (expires_at) WHERE is_active = TRUE;
