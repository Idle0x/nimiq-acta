const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1].replace(/"/g, '');
const sql = neon(env);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      trust_score INTEGER DEFAULT 0,
      total_volume_nim INTEGER DEFAULT 0,
      items_completed INTEGER DEFAULT 0,
      joined_at BIGINT
    );
  `;
  console.log("Users table OK");

  // We add 'duration_days' and 'reward_yield_nim' to listings
  try {
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 1`;
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS reward_yield_nim INTEGER DEFAULT 0`;
    await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;
    console.log("Listings altered");
  } catch(e) { console.error(e); }

  // We add 'resolved_at' and 'borrower_pubkey' to escrows, and a 'yield_nim' field
  try {
    await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS resolved_at BIGINT`;
    await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS yield_nim INTEGER DEFAULT 0`;
  } catch(e) { console.error(e); }
  console.log("Escrows altered");
}
main().catch(console.error);
