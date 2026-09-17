import { neon } from "@neondatabase/serverless";
import type { Escrow, Listing, UserProfile, Act, LenderKey } from "./escrow";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function hasDb() {
  return !!process.env.DATABASE_URL;
}

export async function initDbSchema() {
  const sql = getSql();
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      trust_score INTEGER DEFAULT 0,
      total_volume_nim INTEGER DEFAULT 0,
      items_completed INTEGER DEFAULT 0,
      joined_at BIGINT
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      owner TEXT NOT NULL,
      collateral_nim INTEGER NOT NULL,
      yield_nim INTEGER DEFAULT 0,
      duration_days INTEGER DEFAULT 1,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at BIGINT,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS escrows (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      title TEXT NOT NULL,
      borrower TEXT NOT NULL,
      amount_nim INTEGER NOT NULL,
      fee_nim INTEGER NOT NULL,
      yield_nim INTEGER DEFAULT 0,
      state TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      lender_pubkey TEXT,
      expires_at BIGINT,
      resolved_at BIGINT,
      description TEXT
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS acts (
      id TEXT PRIMARY KEY,
      actor_address TEXT NOT NULL,
      type TEXT NOT NULL,
      oracle TEXT NOT NULL,
      listing_id TEXT,
      escrow_id TEXT,
      amount_nim INTEGER NOT NULL,
      fee_nim INTEGER NOT NULL,
      proof_json JSONB,
      tx_hash_in TEXT,
      tx_hash_out TEXT,
      created_at BIGINT NOT NULL,
      settled_at BIGINT,
      idempotency_key TEXT UNIQUE
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS consumed_nonces (
      nonce TEXT PRIMARY KEY,
      consumed_at BIGINT NOT NULL
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lender_keys (
      owner_address TEXT PRIMARY KEY,
      public_key_hex TEXT NOT NULL,
      private_key_hex_encrypted TEXT NOT NULL
    );
  `;
}

// -- Users --
export async function ensureUser(address: string): Promise<UserProfile> {
  const sql = getSql();
  if (!sql) return { address, trustScore: 0, totalVolumeNIM: 0, itemsCompleted: 0, joinedAt: Date.now() };
  
  const res = await sql`SELECT * FROM users WHERE address = ${address}`;
  if (res.length > 0) {
    const row = res[0] as any;
    return {
      address: row.address,
      trustScore: row.trust_score,
      totalVolumeNIM: row.total_volume_nim,
      itemsCompleted: row.items_completed,
      joinedAt: row.joined_at
    };
  }
  
  const joined = Date.now();
  await sql`INSERT INTO users (address, joined_at) VALUES (${address}, ${joined})`;
  return { address, trustScore: 0, totalVolumeNIM: 0, itemsCompleted: 0, joinedAt: joined };
}

// -- Lender Keys --
export async function getLenderKey(address: string): Promise<LenderKey | null> {
  const sql = getSql();
  if (!sql) return null;
  const res = await sql`SELECT * FROM lender_keys WHERE owner_address = ${address}`;
  if (res.length > 0) {
    return {
      ownerAddress: res[0].owner_address,
      publicKeyHex: res[0].public_key_hex,
      privateKeyHexEncrypted: res[0].private_key_hex_encrypted
    };
  }
  return null;
}

export async function setLenderKey(key: LenderKey) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO lender_keys (owner_address, public_key_hex, private_key_hex_encrypted)
    VALUES (${key.ownerAddress}, ${key.publicKeyHex}, ${key.privateKeyHexEncrypted})
    ON CONFLICT (owner_address) DO UPDATE SET
      public_key_hex = EXCLUDED.public_key_hex,
      private_key_hex_encrypted = EXCLUDED.private_key_hex_encrypted
  `;
}

// -- Nonces --
export async function consumeNonce(nonce: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock mode
  try {
    await sql`INSERT INTO consumed_nonces (nonce, consumed_at) VALUES (${nonce}, ${Date.now()})`;
    return true;
  } catch (e) {
    return false; // Constraint violation = already consumed
  }
}

import { computeAndUpdateTrustScore } from "./trust";

// -- Acts --
export async function insertAct(act: Act) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO acts (
      id, actor_address, type, oracle, listing_id, escrow_id, amount_nim, fee_nim, proof_json, tx_hash_in, tx_hash_out, created_at, settled_at, idempotency_key
    ) VALUES (
      ${act.id}, ${act.actorAddress}, ${act.type}, ${act.oracle}, ${act.listingId || null}, ${act.escrowId || null}, ${act.amountNIM}, ${act.feeNIM}, ${act.proofJson ? JSON.stringify(act.proofJson) : null}, ${act.txHashIn || null}, ${act.txHashOut || null}, ${act.createdAt}, ${act.settledAt || null}, ${act.idempotencyKey || null}
    )
  `;
  // After inserting an act, update the user's trust score.
  // We do it asynchronously in the background.
  computeAndUpdateTrustScore(act.actorAddress).catch(console.error);
}

// -- Listings --
export async function fetchListings(): Promise<Listing[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`SELECT * FROM listings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 50`;
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    owner: r.owner,
    collateralNIM: r.collateral_nim,
    yieldNIM: r.yield_nim,
    durationDays: r.duration_days,
    kind: r.kind,
    category: r.category,
    description: r.description,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    isActive: r.is_active
  }));
}

export async function insertListing(l: Listing) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO listings (
      id, title, owner, collateral_nim, yield_nim, duration_days, kind, category, description, created_at, is_active
    ) VALUES (
      ${l.id}, ${l.title}, ${l.owner}, ${l.collateralNIM}, ${l.yieldNIM || 0}, ${l.durationDays || 1}, ${l.kind}, ${l.category}, ${l.description}, ${l.createdAt}, ${l.isActive}
    )
  `;
}

// -- Escrows --
export async function fetchEscrows(): Promise<Escrow[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`SELECT * FROM escrows ORDER BY created_at DESC LIMIT 100`;
  return rows.map((r: any) => ({
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    yieldNIM: r.yield_nim,
    state: r.state,
    txHash: r.tx_hash,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    lenderPubkey: r.lender_pubkey && r.lender_pubkey !== 'null' ? r.lender_pubkey : undefined,
    expiresAt: r.expires_at && r.expires_at !== 'null' ? parseInt(r.expires_at, 10) : undefined,
    resolvedAt: r.resolved_at && r.resolved_at !== 'null' ? parseInt(r.resolved_at, 10) : undefined,
    description: r.description && r.description !== 'null' ? r.description : undefined,
  }));
}

export async function insertEscrow(e: Escrow) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO escrows (
      id, listing_id, title, borrower, amount_nim, fee_nim, yield_nim, state, tx_hash, created_at, lender_pubkey, expires_at, description
    ) VALUES (
      ${e.id}, ${e.listingId}, ${e.title}, ${e.borrower}, ${e.amountNIM}, ${e.feeNIM}, ${e.yieldNIM || 0}, ${e.state}, ${e.txHash}, ${e.createdAt}, ${e.lenderPubkey || null}, ${e.expiresAt || null}, ${e.description || null}
    )
  `;
}

export async function fetchEscrow(id: string): Promise<Escrow | null> {
  const sql = getSql();
  if (!sql) return null;
  const res = await sql`SELECT * FROM escrows WHERE id = ${id}`;
  if (res.length === 0) return null;
  const r = res[0] as any;
  return {
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    yieldNIM: r.yield_nim,
    state: r.state,
    txHash: r.tx_hash,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    lenderPubkey: r.lender_pubkey && r.lender_pubkey !== 'null' ? r.lender_pubkey : undefined,
    expiresAt: r.expires_at && r.expires_at !== 'null' ? parseInt(r.expires_at, 10) : undefined,
    resolvedAt: r.resolved_at && r.resolved_at !== 'null' ? parseInt(r.resolved_at, 10) : undefined,
    description: r.description && r.description !== 'null' ? r.description : undefined,
  };
}

export async function atomicReleaseEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock
  const now = Date.now();
  const res = await sql`
    UPDATE escrows 
    SET state = 'released', resolved_at = ${now} 
    WHERE id = ${id} AND state = 'locked'
    RETURNING id
  `;
  return res.length > 0;
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const sql = getSql();
  if (!sql) return null;
  const res = await sql`SELECT * FROM listings WHERE id = ${id}`;
  if (res.length === 0) return null;
  const r = res[0] as any;
  return {
    id: r.id,
    title: r.title,
    owner: r.owner,
    collateralNIM: r.collateral_nim,
    yieldNIM: r.yield_nim,
    durationDays: r.duration_days,
    kind: r.kind,
    category: r.category,
    description: r.description,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    isActive: r.is_active
  };
}

export async function atomicReleaseListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  const res = await sql`
    UPDATE listings 
    SET is_active = FALSE 
    WHERE id = ${id} AND is_active = TRUE
    RETURNING id
  `;
  return res.length > 0;
}
