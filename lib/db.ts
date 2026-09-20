import { neon } from "@neondatabase/serverless";
import type { Escrow, Listing, UserProfile, Act, LenderKey } from "./escrow";

export const SEED_LISTINGS: Listing[] = [];

// In-memory persistent state for local development or fallback
const memListings: Listing[] = [];
const memEscrows: Escrow[] = [];
const memActs: Act[] = [];
const memUsers: Map<string, UserProfile> = new Map();
const memCheckins: Map<string, Set<string>> = new Map();
const memLenderKeys: Map<string, LenderKey> = new Map();
const memNonces: Set<string> = new Set();
const memReferrals: Map<string, { id: string; referrer: string; code: string; createdAt: number }> = new Map();

export function getMemStore() {
  return { memListings, memEscrows, memActs, memUsers, memCheckins, memLenderKeys, memReferrals };
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function hasDb() {
  return !!process.env.DATABASE_URL;
}

let schemaInitPromise: Promise<void> | null = null;
export async function ensureDbSchema() {
  if (!process.env.DATABASE_URL) return;
  if (!schemaInitPromise) {
    schemaInitPromise = initDbSchema().catch((err) => {
      schemaInitPromise = null;
      console.error("DB schema init failed:", err);
    });
  }
  await schemaInitPromise;
}

export async function initDbSchema() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      trust_score INTEGER DEFAULT 0,
      total_volume_nim DOUBLE PRECISION DEFAULT 0,
      items_completed INTEGER DEFAULT 0,
      joined_at BIGINT
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      owner TEXT NOT NULL,
      collateral_nim DOUBLE PRECISION NOT NULL,
      yield_nim DOUBLE PRECISION DEFAULT 0,
      duration_days INTEGER DEFAULT 1,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at BIGINT,
      is_active BOOLEAN DEFAULT TRUE,
      idem_key TEXT UNIQUE,
      tx_hash TEXT,
      state TEXT NOT NULL DEFAULT 'open',
      target_lat DOUBLE PRECISION,
      target_lng DOUBLE PRECISION,
      require_location BOOLEAN DEFAULT FALSE,
      contract JSONB,
      expires_at BIGINT,
      borrow_mode TEXT
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS escrows (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      title TEXT NOT NULL,
      borrower TEXT NOT NULL,
      owner TEXT,
      completer TEXT,
      amount_nim DOUBLE PRECISION NOT NULL,
      fee_nim DOUBLE PRECISION NOT NULL,
      yield_nim DOUBLE PRECISION DEFAULT 0,
      state TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      tx_hash_in TEXT,
      tx_hash_out TEXT,
      created_at BIGINT NOT NULL,
      lender_pubkey TEXT,
      expires_at BIGINT,
      deadline_at BIGINT,
      progress TEXT NOT NULL DEFAULT 'awaiting_proof',
      resolved_at BIGINT,
      description TEXT,
      idem_key TEXT UNIQUE
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
      amount_nim DOUBLE PRECISION NOT NULL,
      fee_nim DOUBLE PRECISION NOT NULL,
      proof_json JSONB,
      tx_hash_in TEXT,
      tx_hash_out TEXT,
      created_at BIGINT NOT NULL,
      settled_at BIGINT,
      idempotency_key TEXT UNIQUE
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS consumed_nonces (nonce TEXT PRIMARY KEY, consumed_at BIGINT NOT NULL);
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lender_keys (
      owner_address TEXT PRIMARY KEY,
      public_key_hex TEXT NOT NULL,
      private_key_hex_encrypted TEXT NOT NULL
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS auth_nonces (nonce TEXT PRIMARY KEY, created_at BIGINT NOT NULL);
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS venture_submissions (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      completer TEXT NOT NULL,
      proof TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      recommendation TEXT,
      confidence INTEGER,
      reason TEXT,
      UNIQUE (listing_id, completer, status)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS idempotent_actions (
      key TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at BIGINT NOT NULL
    );
  `;
  // v4: inbox + referrals + act indexes
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      body TEXT,
      link TEXT,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at BIGINT NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_address ON notifications (address, created_at DESC);`;
  await sql`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrer TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      created_at BIGINT NOT NULL
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS referral_settlements (
      referral_id TEXT NOT NULL REFERENCES referrals(id),
      referee TEXT UNIQUE NOT NULL,
      settled_at BIGINT NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_acts_actor ON acts (actor_address);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_acts_created ON acts (created_at DESC);`;
  // v5: contracts, deadlines, progress (idempotent alters for existing DBs)
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS contract JSONB;`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS expires_at BIGINT;`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS require_location BOOLEAN DEFAULT FALSE;`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS borrow_mode TEXT;`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS deadline_at BIGINT;`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS progress TEXT NOT NULL DEFAULT 'awaiting_proof';`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS completer TEXT;`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS owner TEXT;`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS tx_hash_in TEXT;`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS tx_hash_out TEXT;`;
  await sql`CREATE INDEX IF NOT EXISTS idx_escrows_deadline ON escrows (deadline_at) WHERE state = 'locked';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_listings_expiry ON listings (expires_at) WHERE is_active = TRUE;`;
  await sql`ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS recommendation TEXT;`;
  await sql`ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS confidence INTEGER;`;
  await sql`ALTER TABLE venture_submissions ADD COLUMN IF NOT EXISTS reason TEXT;`;
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      reporter TEXT NOT NULL,
      reason TEXT NOT NULL,
      detail TEXT,
      created_at BIGINT NOT NULL,
      UNIQUE (listing_id, reporter)
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports (listing_id);`;
  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_drips_created ON pending_drips (created_at);`;
  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      address TEXT NOT NULL,
      day TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      tx_hash TEXT,
      PRIMARY KEY (address, day)
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_checkins_address ON checkins (address, day DESC);`;

  // Clean up any old seed listings/acts from earlier test runs
  try {
    await sql`DELETE FROM listings WHERE id LIKE 'list-seed-%'`;
    await sql`DELETE FROM acts WHERE id LIKE 'act-seed-%' OR id LIKE 'act-init-%'`;
  } catch {
    // best-effort cleanup
  }
}

export async function ensureUser(address: string): Promise<UserProfile> {
  const sql = getSql();
  if (!sql) {
    if (!memUsers.has(address)) {
      memUsers.set(address, { address, trustScore: 0, totalVolumeNIM: 0, itemsCompleted: 0, joinedAt: Date.now() });
    }
    return memUsers.get(address)!;
  }
  await sql`
    INSERT INTO users (address, joined_at)
    VALUES (${address}, ${Date.now()})
    ON CONFLICT (address) DO NOTHING
  `;
  const res = await sql`SELECT * FROM users WHERE address = ${address}`;
  const row = res[0] as any;
  return {
    address: row.address,
    trustScore: row.trust_score ?? 0,
    totalVolumeNIM: row.total_volume_nim ?? 0,
    itemsCompleted: row.items_completed ?? 0,
    joinedAt: row.joined_at ?? Date.now(),
  };
}

// -- Lender Keys --
export async function getLenderKey(address: string): Promise<LenderKey | null> {
  const sql = getSql();
  if (!sql) return memLenderKeys.get(address) || null;
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
  if (!sql) {
    memLenderKeys.set(key.ownerAddress, key);
    return;
  }
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
  if (!sql) {
    if (memNonces.has(nonce)) return false;
    memNonces.add(nonce);
    return true;
  }
  try {
    await sql`INSERT INTO consumed_nonces (nonce, consumed_at) VALUES (${nonce}, ${Date.now()})`;
    return true;
  } catch {
    return false; // Constraint violation = already consumed
  }
}

import { computeAndUpdateTrustScore } from "./trust";

// -- Acts --
export async function insertAct(act: Act) {
  const sql = getSql();
  if (!sql) {
    memActs.unshift(act);
    const u = memUsers.get(act.actorAddress);
    if (u) {
      u.itemsCompleted += 1;
      u.totalVolumeNIM += act.amountNIM;
      u.trustScore = Math.min(100, u.trustScore + 5);
    }
    return;
  }
  await sql`
    INSERT INTO acts (
      id, actor_address, type, oracle, listing_id, escrow_id, amount_nim, fee_nim, proof_json, tx_hash_in, tx_hash_out, created_at, settled_at, idempotency_key
    ) VALUES (
      ${act.id}, ${act.actorAddress}, ${act.type}, ${act.oracle}, ${act.listingId || null}, ${act.escrowId || null}, ${act.amountNIM}, ${act.feeNIM}, ${act.proofJson ? JSON.stringify(act.proofJson) : null}, ${act.txHashIn || null}, ${act.txHashOut || null}, ${act.createdAt}, ${act.settledAt || null}, ${act.idempotencyKey || null}
    )
  `;
  computeAndUpdateTrustScore(act.actorAddress).catch(console.error);
}

// -- Listings --
export async function fetchListings(): Promise<Listing[]> {
  const sql = getSql();
  const now = Date.now();
  if (!sql) {
    return memListings.filter(l => l.isActive && (!l.expiresAt || l.expiresAt > now));
  }
  const rows = await sql`
    SELECT * FROM listings 
    WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > ${now}) 
    ORDER BY created_at DESC LIMIT 50
  `;
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
    isActive: r.is_active,
    state: r.state,
    txHash: r.tx_hash,
    targetLat: r.target_lat,
    targetLng: r.target_lng,
    requireLocation: r.require_location ?? false,
    contract: r.contract ?? null,
    expiresAt: r.expires_at != null ? Number(r.expires_at) : null,
    borrowMode: r.borrow_mode ?? (r.contract?.borrowMode || null),
  }));
}

export async function insertListing(l: Listing) {
  const sql = getSql();
  if (!sql) {
    const idx = memListings.findIndex(x => x.id === l.id);
    if (idx >= 0) memListings[idx] = l;
    else memListings.unshift(l);
    return;
  }
  const contract = (l as any).contract ?? null;
  const expiresAt = (l as any).expiresAt ?? null;
  const requireLocation = (l as any).requireLocation ?? false;
  const borrowMode = (l as any).borrowMode ?? null;
  await sql`
    INSERT INTO listings (
      id, title, owner, collateral_nim, yield_nim, duration_days, kind, category, description, created_at, is_active, tx_hash, state, target_lat, target_lng, require_location, contract, expires_at, borrow_mode
    ) VALUES (
      ${l.id}, ${l.title}, ${l.owner}, ${l.collateralNIM}, ${l.yieldNIM || 0}, ${l.durationDays || 1}, ${l.kind}, ${l.category}, ${l.description}, ${l.createdAt}, ${l.isActive}, ${l.txHash || null}, ${l.state || 'open'}, ${l.targetLat || null}, ${l.targetLng || null}, ${requireLocation}, ${contract ? JSON.stringify(contract) : null}, ${expiresAt}, ${borrowMode}
    )
  `;
}

// -- Escrows --
export async function fetchEscrows(): Promise<Escrow[]> {
  const sql = getSql();
  if (!sql) return [...memEscrows];
  const rows = await sql`SELECT * FROM escrows ORDER BY created_at DESC LIMIT 100`;
  return rows.map((r: any) => ({
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    owner: r.owner ?? undefined,
    completer: r.completer ?? undefined,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    yieldNIM: r.yield_nim,
    state: r.state,
    txHash: r.tx_hash,
    txHashOut: r.tx_hash_out ?? undefined,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    lenderPubkey: r.lender_pubkey && r.lender_pubkey !== 'null' ? r.lender_pubkey : undefined,
    expiresAt: r.expires_at && r.expires_at !== 'null' ? parseInt(r.expires_at, 10) : undefined,
    deadlineAt: r.deadline_at != null ? Number(r.deadline_at) : undefined,
    progress: r.progress ?? 'awaiting_proof',
    resolvedAt: r.resolved_at && r.resolved_at !== 'null' ? parseInt(r.resolved_at, 10) : undefined,
    description: r.description && r.description !== 'null' ? r.description : undefined,
  }));
}

export async function insertEscrow(e: Escrow) {
  const sql = getSql();
  if (!sql) {
    const idx = memEscrows.findIndex(x => x.id === e.id);
    if (idx >= 0) memEscrows[idx] = e;
    else memEscrows.unshift(e);
    return;
  }
  await sql`
    INSERT INTO escrows (
      id, listing_id, title, borrower, owner, completer, amount_nim, fee_nim, yield_nim, state, tx_hash, tx_hash_in, created_at, lender_pubkey, expires_at, deadline_at, progress, description
    ) VALUES (
      ${e.id}, ${e.listingId}, ${e.title}, ${e.borrower}, ${(e as any).owner || null}, ${(e as any).completer || null}, ${e.amountNIM}, ${e.feeNIM}, ${e.yieldNIM || 0}, ${e.state}, ${e.txHash}, ${e.txHash}, ${e.createdAt}, ${e.lenderPubkey || null}, ${e.expiresAt || null}, ${(e as any).deadlineAt || null}, ${(e as any).progress || 'awaiting_proof'}, ${e.description || null}
    )
  `;
}

export async function fetchEscrow(id: string): Promise<Escrow | null> {
  const sql = getSql();
  if (!sql) return memEscrows.find(x => x.id === id) || null;
  const res = await sql`SELECT * FROM escrows WHERE id = ${id}`;
  if (res.length === 0) return null;
  const r = res[0] as any;
  return {
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    owner: r.owner ?? undefined,
    completer: r.completer ?? undefined,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    yieldNIM: r.yield_nim,
    state: r.state,
    txHash: r.tx_hash,
    txHashOut: r.tx_hash_out ?? undefined,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    lenderPubkey: r.lender_pubkey && r.lender_pubkey !== 'null' ? r.lender_pubkey : undefined,
    expiresAt: r.expires_at && r.expires_at !== 'null' ? parseInt(r.expires_at, 10) : undefined,
    deadlineAt: r.deadline_at != null ? Number(r.deadline_at) : undefined,
    progress: r.progress ?? 'awaiting_proof',
    resolvedAt: r.resolved_at && r.resolved_at !== 'null' ? parseInt(r.resolved_at, 10) : undefined,
    description: r.description && r.description !== 'null' ? r.description : undefined,
  };
}

export async function atomicReleaseEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    const e = memEscrows.find(x => x.id === id && x.state === 'locked');
    if (e) {
      e.state = 'released';
      e.resolvedAt = Date.now();
      return true;
    }
    return false;
  }
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
  if (!sql) return memListings.find(x => x.id === id) || null;
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
    isActive: r.is_active,
    state: r.state,
    txHash: r.tx_hash,
    targetLat: r.target_lat,
    targetLng: r.target_lng,
    requireLocation: r.require_location ?? false,
    contract: r.contract ?? null,
    expiresAt: r.expires_at != null ? Number(r.expires_at) : null,
    borrowMode: r.borrow_mode ?? (r.contract?.borrowMode || null),
  };
}

export async function atomicReleaseListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    const l = memListings.find(x => x.id === id && x.isActive);
    if (l) {
      l.isActive = false;
      l.state = 'complete';
      return true;
    }
    return false;
  }
  const res = await sql`
    UPDATE listings 
    SET is_active = FALSE 
    WHERE id = ${id} AND is_active = TRUE
    RETURNING id
  `;
  return res.length > 0;
}

export async function cancelListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    const l = memListings.find(x => x.id === id);
    if (l) {
      l.isActive = false;
      l.state = 'cancelled';
      return true;
    }
    return false;
  }
  const res = await sql`UPDATE listings SET is_active = FALSE WHERE id = ${id} RETURNING id`;
  return res.length > 0;
}

export async function cancelEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    const e = memEscrows.find(x => x.id === id && (x.state === 'locked' || (x.state as string) === 'settling'));
    if (e) {
      e.state = 'cancelled';
      e.resolvedAt = Date.now();
      return true;
    }
    return false;
  }
  const res = await sql`UPDATE escrows SET state = 'cancelled', resolved_at = ${Date.now()} WHERE id = ${id} AND state IN ('locked', 'settling') RETURNING id`;
  return res.length > 0;
}

export function getMemMe(address: string) {
  const u = memUsers.get(address) || { address, trustScore: 0, totalVolumeNIM: 0, itemsCompleted: 0, joinedAt: Date.now() };
  const inProgress = memEscrows.filter(e => (e.state === 'locked' || (e.state as string) === 'expired') && (e.borrower === address || e.completer === address));
  const settled = memEscrows.filter(e => e.state === 'released' && (e.borrower === address || e.completer === address));
  const refunded = memEscrows.filter(e => (e.state as string) === 'cancelled' && (e.borrower === address || e.completer === address));
  const myListings = memListings.filter(l => l.owner === address);
  const myActs = memActs.filter(a => a.actorAddress === address);

  const day = 24 * 3600 * 1000;
  const now = Date.now();
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = now - (6 - i) * day;
    return {
      day: start,
      settled: myActs.filter((a) => a.createdAt >= start && a.createdAt < start + day).length,
    };
  });

  return {
    address,
    trustScore: u.trustScore,
    joinedAt: u.joinedAt,
    streak: { current: week.filter(d => d.settled > 0).length, week },
    escrows: { inProgress, awaitingMe: [], settled, refunded },
    listings: {
      active: myListings.filter(l => l.isActive),
      expired: myListings.filter(l => !l.isActive && (l.state as string) === 'expired'),
      past: myListings.filter(l => !l.isActive && (l.state as string) !== 'expired'),
    },
    acts: myActs.slice(0, 20).map(a => ({
      id: a.id,
      type: a.type,
      oracle: a.oracle,
      amountNIM: a.amountNIM,
      txHash: a.txHashOut || a.txHashIn || null,
      createdAt: a.createdAt,
    })),
    totals: {
      settledCount: myActs.length,
      settledVolume: myActs.reduce((s, a) => s + a.amountNIM, 0),
    },
  };
}
