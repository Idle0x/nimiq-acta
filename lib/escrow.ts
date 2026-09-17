export type Listing = {
  id: string;
  title: string;
  owner: string;
  collateralNIM: number;
  distanceKm: number;
  kind: "borrow" | "bounty";
  description?: string;
  category?: "tools" | "transport" | "electronics" | "sports" | "household" | "other" | "photo" | "delivery" | "survey" | "cleanup";
  createdBy?: string;
};

export type EscrowState = "locked" | "released";

export type Escrow = {
  id: string;
  listingId: string;
  title: string;
  borrower: string;
  amountNIM: number;
  feeNIM: number;
  state: EscrowState;
  txHash: string;
  createdAt: number;
  lenderPubkey?: string;
  expiresAt?: number;
  description?: string;
};

export const ESCROW_VAULT = "NQ07 ACTA ESCROW VAULT 0000";
export const MICRO_FEE_NIM = 50;

export const SEED_LISTINGS: Listing[] = [
  { id: "drill-01", title: "Bosch Drill 18V", owner: "Mara · 0.4km", collateralNIM: 5000, distanceKm: 0.4, kind: "borrow", category: "tools", description: "Heavy duty 18V cordless drill with 2 batteries." },
  { id: "bike-02", title: "City Bike (weekend)", owner: "Jonas · 0.9km", collateralNIM: 8000, distanceKm: 0.9, kind: "borrow", category: "transport", description: "Standard city bike, 3 gears. Comes with lock." },
  { id: "bounty-01", title: "Photo: broken bench @ park", owner: "City DAO · 0.2km", collateralNIM: 250, distanceKm: 0.2, kind: "bounty", category: "photo", description: "Take a clear picture of the broken bench near the fountain for our repair request." },
  { id: "bounty-02", title: "Flyer drop: 20 houses", owner: "Cafe Nord · 1.1km", collateralNIM: 400, distanceKm: 1.1, kind: "bounty", category: "delivery", description: "Deliver 20 opening flyers to houses on Nord Street." },
  { id: "tent-01", title: "Camping Tent 4-person", owner: "Alex · 2.5km", collateralNIM: 6000, distanceKm: 2.5, kind: "borrow", category: "sports", description: "Spacious 4-person tent, easy setup." },
  { id: "bounty-03", title: "Clean graffiti off bridge wall", owner: "Local Gov · 1.5km", collateralNIM: 800, distanceKm: 1.5, kind: "bounty", category: "cleanup", description: "Remove tags from the south bridge pillar." },
];

// Trust score -> collateral discount. 0..100 maps to 0..30% off, floor 70%.
export function discountedCollateral(baseNIM: number, trustScore: number) {
  const clamped = Math.max(0, Math.min(100, trustScore));
  const factor = 1 - clamped * 0.003;
  return Math.max(Math.round(baseNIM * Math.max(0.7, factor)), 1);
}

const KEY = "acta.escrows.v1";

export function newEscrowId(): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(36))
    .join("")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
  return `esc-${Date.now().toString(36)}-${rand}`;
}

export function loadEscrows(): Escrow[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Escrow[];
  } catch {
    return [];
  }
}

export function saveEscrows(list: Escrow[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors in demo
  }
}
