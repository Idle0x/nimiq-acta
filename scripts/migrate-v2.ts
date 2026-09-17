import { getSql, initDbSchema } from "../lib/db";

async function runMigration() {
  console.log("Starting DB migration...");
  const sql = getSql();
  if (!sql) {
    console.error("No DATABASE_URL found.");
    return;
  }

  // 1. Add missing columns to existing tables
  console.log("Patching listings table...");
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS yield_nim INTEGER DEFAULT 0`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other'`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at BIGINT`;

  console.log("Patching escrows table...");
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS expires_at BIGINT`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS description TEXT`;

  // 2. Create the missing new tables (acts, lender_keys, consumed_nonces)
  console.log("Creating new V2 tables...");
  await initDbSchema();

  console.log("Migration complete!");
}

runMigration().catch(console.error);
