import { neon } from "@neondatabase/serverless";
import type { Escrow, Listing, UserProfile } from "./escrow";

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
      expires_at BIGINT,
      resolved_at BIGINT,
      lender_pubkey TEXT,
      description TEXT
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

export async function addTrustScore(address: string, volume: number) {
  const sql = getSql();
  if (!sql) return;
  // +5 trust points per completed escrow, cap at 100
  await sql`
    UPDATE users 
    SET 
      items_completed = items_completed + 1,
      total_volume_nim = total_volume_nim + ${volume},
      trust_score = LEAST(100, trust_score + 5)
    WHERE address = ${address}
  `;
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
    createdAt: r.created_at,
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
    createdAt: parseInt(r.created_at, 10),
    expiresAt: r.expires_at ? parseInt(r.expires_at, 10) : undefined,
    resolvedAt: r.resolved_at ? parseInt(r.resolved_at, 10) : undefined,
    lenderPubkey: r.lender_pubkey || undefined,
    description: r.description || undefined,
  }));
}

export async function insertEscrow(e: Escrow) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO escrows (
      id, listing_id, title, borrower, amount_nim, fee_nim, yield_nim, state, tx_hash, created_at, expires_at, description
    ) VALUES (
      ${e.id}, ${e.listingId}, ${e.title}, ${e.borrower}, ${e.amountNIM}, ${e.feeNIM}, ${e.yieldNIM || 0}, ${e.state}, ${e.txHash}, ${e.createdAt}, ${e.expiresAt || null}, ${e.description || null}
    )
  `;
}

export async function updateEscrowLenderKey(id: string, pubkey: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE escrows SET lender_pubkey = ${pubkey} WHERE id = ${id}`;
}

export async function resolveEscrow(id: string) {
  const sql = getSql();
  if (!sql) return;
  const now = Date.now();
  await sql`UPDATE escrows SET state = 'released', resolved_at = ${now} WHERE id = ${id}`;
}
