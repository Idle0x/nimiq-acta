-- Acta Complete Database Reset
-- Run this in the Neon SQL console or with: psql $DATABASE_URL -f scripts/reset-db.sql
-- WARNING: This empties all tables to return the database to a 100% pristine clean state.

TRUNCATE TABLE 
  acts,
  checkins,
  escrows,
  listings,
  notifications,
  pending_drips,
  referral_settlements,
  referrals,
  reports,
  users,
  venture_submissions,
  idempotent_actions,
  consumed_nonces
CASCADE;
