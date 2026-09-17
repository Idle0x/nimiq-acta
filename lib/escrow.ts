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
export type ListingState = "open" | "settling" | "complete" | "cancelled";
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
};

export type Escrow = {
  id: string;
  listingId: string;
  title: string;
  borrower: string; // the one locking funds
  amountNIM: number;
  feeNIM: number;
  yieldNIM: number;
  state: EscrowState;
  txHash: string;
  createdAt: number;
  lenderPubkey?: string;
  expiresAt?: number;
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
export const MICRO_FEE_NIM = 0.5;
export const MIN_NETWORK_FEE_NIM = 0.0001;

// Trust score -> collateral discount. 0..100 maps to 0..30% off, floor 70%.
export function discountedCollateral(baseNIM: number, trustScore: number) {
  const clamped = Math.max(0, Math.min(100, trustScore));
  const factor = 1 - clamped * 0.003;
  return Math.max(Math.round(baseNIM * Math.max(0.7, factor)), 1);
}

export function newId(prefix: string): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(36))
    .join("")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
