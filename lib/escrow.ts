export type ListingCategory = "tools" | "transport" | "electronics" | "sports" | "household" | "other" | "photo" | "delivery" | "survey" | "cleanup";
export type ListingKind = "borrow" | "bounty" | "bounty_venture" | "bounty_qr" | "bounty_manual" | "bounty_geo";
export type OracleType = "qr_sig" | "vision" | "geo" | "creator" | "system";

export type Act = {
  id: string;
  actorAddress: string;
  type: ActType;
  oracle: OracleType;
  listingId?: string;
  escrowId?: string;
  amountNIM: number;
  feeNIM: number;
  proofJson?: any;
  txHashIn?: string;
  txHashOut?: string;
  createdAt: number;
  settledAt?: number;
  idempotencyKey?: string;
};

export type LenderKey = {
  ownerAddress: string;
  publicKeyHex: string;
  privateKeyHexEncrypted: string;
};

export type EscrowState = "locked" | "settling" | "released" | "cancelled" | "disputed" | "expired";
export type ListingState = "open" | "settling" | "complete" | "cancelled" | "closed";
export type ActType =
  | "borrow_lock" | "borrow_return" | "bounty" | "checkin" | "scanquest"
  | "creator" | "milestone" | "referral";

export type Listing = {
  id: string;
  title: string;
  owner: string;
  collateralNIM: number;
  yieldNIM?: number;
  durationDays?: number;
  kind: ListingKind;
  category: ListingCategory;
  description: string;
  createdAt: number;
  isActive: boolean;
  state?: ListingState;
  txHash?: string;
  targetLat?: number;
  targetLng?: number;
  requireLocation?: boolean;
  contract?: import("./contract").ListingContract | null;
  expiresAt?: number | null;
};

export type Escrow = {
  id: string;
  listingId: string;
  title: string;
  borrower: string; // the one locking funds
  owner?: string;
  completer?: string;
  amountNIM: number;
  feeNIM: number;
  yieldNIM: number;
  state: EscrowState;
  txHash: string;
  txHashOut?: string | null;
  createdAt: number;
  lenderPubkey?: string;
  expiresAt?: number;
  deadlineAt?: number | null;
  progress?: string;
  resolvedAt?: number;
  description?: string;
};

export type UserProfile = {
  address: string;
  trustScore: number;
  totalVolumeNIM: number;
  itemsCompleted: number;
  joinedAt: number;
};

export const ESCROW_VAULT = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT";
export const MICRO_FEE_NIM = 0.0001;
export const MIN_NETWORK_FEE_NIM = 0.0001;
/** Retained by the vault on every settlement (user receives gross minus fees). */
export const VAULT_FEE_NIM = 0.001;
/** Total taken from a settlement payout (vault retention + network). */
export const SETTLE_FEE_NIM = VAULT_FEE_NIM + MIN_NETWORK_FEE_NIM;
/** Dust guard: nothing locks below this. */
export const MIN_COLLATERAL_NIM = 0.01;
/** Grace after an escrow deadline before the lender may claim an unreturned lock. */
export const LENDER_CLAIM_GRACE_MS = 48 * 3600 * 1000;

// Trust score -> collateral discount. 0..100 maps to 0..30% off, floor 70%.
// Rounded to whole lunas (never whole NIM — sub-NIM locks are first-class),
// floored at the dust guard so a discount can never push a lock below minimum.
export function discountedCollateral(baseNIM: number, trustScore: number) {
  const clamped = Math.max(0, Math.min(100, trustScore));
  const factor = 1 - clamped * 0.003;
  const raw = baseNIM * Math.max(0.7, factor);
  return Math.max(Math.round(raw * 100_000) / 100_000, MIN_COLLATERAL_NIM);
}

/** Compare NIM amounts the way money should be compared: as integer lunas. */
export function sameLunas(a: number, b: number): boolean {
  return Math.round(a * 100_000) === Math.round(b * 100_000);
}

export function newId(prefix: string): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(36))
    .join("")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function explorerTxUrl(txHash?: string | null): string {
  if (!txHash) return "https://nim.re/explorer";
  const clean = txHash.replace(/^0x/, "").trim();
  return `https://nim.re/explorer/tx/${clean}`;
}

export function explorerAddressUrl(address?: string | null): string {
  if (!address) return "https://nim.re/explorer";
  return `https://nim.re/explorer/address/${encodeURIComponent(address.trim())}`;
}
