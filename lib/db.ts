import { neon } from "@neondatabase/serverless";
import { SEED_LISTINGS, type Escrow, type Listing } from "@/lib/escrow";

type SqlFn = ReturnType<typeof neon>;

let client: SqlFn | null = null;

export function getSql(): SqlFn | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!client) client = neon(url);
  return client;
}

export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

type ListingRow = {
  id: string;
  title: string;
  owner: string;
  collateral_nim: number;
  distance_km: number;
  kind: "borrow" | "bounty";
  description?: string | null;
  category?: string | null;
  created_by?: string | null;
};

type EscrowRow = {
  id: string;
  listing_id: string;
  title: string;
  borrower: string;
  amount_nim: number;
  fee_nim: number;
  state: "locked" | "released";
  tx_hash: string;
  created_at: number;
  lender_pubkey: string | null;
  expires_at?: number | null;
  description?: string | null;
};

function toListing(r: ListingRow): Listing {
  return {
    id: r.id,
    title: r.title,
    owner: r.owner,
    collateralNIM: r.collateral_nim,
    distanceKm: r.distance_km,
    kind: r.kind,
    description: r.description ?? undefined,
    category: r.category as Listing["category"] ?? undefined,
    createdBy: r.created_by ?? undefined,
  };
}

function toEscrow(r: EscrowRow): Escrow {
  return {
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    state: r.state,
    txHash: r.tx_hash,
    createdAt: Number(r.created_at),
    lenderPubkey: r.lender_pubkey ?? undefined,
    expiresAt: r.expires_at ? Number(r.expires_at) : undefined,
    description: r.description ?? undefined,
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const sql = getSql();
  if (!sql) return SEED_LISTINGS;
  try {
    const rows = (await sql`select * from listings order by distance_km asc`) as ListingRow[];
    if (rows.length === 0) return SEED_LISTINGS;
    return rows.map(toListing);
  } catch {
    return SEED_LISTINGS;
  }
}

export async function fetchEscrows(): Promise<Escrow[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows =
      (await sql`select * from escrows order by created_at desc limit 100`) as EscrowRow[];
    return rows.map(toEscrow);
  } catch {
    return [];
  }
}

export async function insertEscrow(e: Escrow): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`
    insert into escrows (
      id, listing_id, title, borrower, amount_nim, fee_nim, state, tx_hash, created_at, lender_pubkey, expires_at, description
    )
    values (
      ${e.id}, ${e.listingId}, ${e.title}, ${e.borrower}, ${e.amountNIM}, ${e.feeNIM}, ${e.state}, ${e.txHash}, ${e.createdAt}, ${e.lenderPubkey ?? null}, ${e.expiresAt ?? null}, ${e.description ?? null}
    )
    on conflict (id) do nothing
  `;
}

export async function insertListing(l: Listing): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`
    insert into listings (
      id, title, owner, collateral_nim, distance_km, kind, description, category, created_by
    )
    values (
      ${l.id}, ${l.title}, ${l.owner}, ${l.collateralNIM}, ${l.distanceKm}, ${l.kind}, ${l.description ?? null}, ${l.category ?? null}, ${l.createdBy ?? null}
    )
    on conflict (id) do nothing
  `;
}

export async function setEscrowReleased(id: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`update escrows set state = 'released' where id = ${id}`;
}

export async function setEscrowLenderKey(id: string, pubkey: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`update escrows set lender_pubkey = ${pubkey} where id = ${id}`;
}
