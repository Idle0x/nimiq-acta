// Run: npx tsx scripts/migrate-v3.ts   (or add "migrate": "tsx scripts/migrate-v3.ts")
import { getSql } from "../lib/db";

async function run() {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");
  console.log("Acta migration v3...");

  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS idem_key TEXT UNIQUE`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS idem_key TEXT UNIQUE`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS tx_hash TEXT`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'open'`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_lat DOUBLE PRECISION`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_lng DOUBLE PRECISION`;

  await sql`
    CREATE TABLE IF NOT EXISTS auth_nonces (
      nonce TEXT PRIMARY KEY,
      created_at BIGINT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS venture_submissions (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      completer TEXT NOT NULL,
      proof TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      UNIQUE (listing_id, completer, status)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS idempotent_actions (
      key TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;

  // Backfill: existing active listings are 'open', everything else 'complete'
  await sql`UPDATE listings SET state = 'open' WHERE is_active = TRUE AND state = 'open'`;
  await sql`UPDATE listings SET state = 'complete' WHERE is_active = FALSE AND state = 'open'`;

  console.log("Migration v3 complete.");
}
run().catch((e) => { console.error(e); process.exit(1); });
