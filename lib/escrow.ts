export type ListingCategory = "tools" | "transport" | "electronics" | "sports" | "household" | "other" | "photo" | "delivery" | "survey" | "cleanup";
export type ListingKind = "borrow" | "bounty";
export type EscrowState = "locked" | "released" | "cancelled";

export type Listing = {
  id: string;
  title: string;
  owner: string; // the creator/lender Nimiq address
  collateralNIM: number;
  yieldNIM?: number; // Lenders can demand a yield fee
  durationDays?: number; // Required commitment
  kind: ListingKind;
  category: ListingCategory;
  description: string;
  createdAt: number;
  isActive: boolean;
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

export const ESCROW_VAULT = "NQ07 ACTA ESCROW VAULT 0000";
export const MICRO_FEE_NIM = 50;

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
