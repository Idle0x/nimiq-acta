-- Acta migration v9: NIM amounts off INTEGER (fractional writes fail on Postgres).
-- Run: psql $DATABASE_URL -f scripts/migrate-v9.sql (or paste into Neon SQL editor)
-- Context: listings/escrows/acts store NIM like 2.5 / 0.0011 but the columns are
-- INTEGER, so every fractional lock/settlement fee errors AFTER the on-chain
-- broadcast. DOUBLE PRECISION preserves existing whole-number rows exactly.

ALTER TABLE listings ALTER COLUMN collateral_nim TYPE DOUBLE PRECISION USING collateral_nim::double precision;
ALTER TABLE listings ALTER COLUMN yield_nim TYPE DOUBLE PRECISION USING yield_nim::double precision;
ALTER TABLE escrows ALTER COLUMN amount_nim TYPE DOUBLE PRECISION USING amount_nim::double precision;
ALTER TABLE escrows ALTER COLUMN fee_nim TYPE DOUBLE PRECISION USING fee_nim::double precision;
ALTER TABLE escrows ALTER COLUMN yield_nim TYPE DOUBLE PRECISION USING yield_nim::double precision;
ALTER TABLE acts ALTER COLUMN amount_nim TYPE DOUBLE PRECISION USING amount_nim::double precision;
ALTER TABLE acts ALTER COLUMN fee_nim TYPE DOUBLE PRECISION USING fee_nim::double precision;
ALTER TABLE users ALTER COLUMN total_volume_nim TYPE DOUBLE PRECISION USING total_volume_nim::double precision;
