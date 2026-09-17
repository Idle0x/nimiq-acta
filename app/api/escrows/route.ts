import { NextResponse } from "next/server";
import {
  fetchEscrows,
  fetchListings,
  hasDb,
  insertEscrow,
  updateEscrowLenderKey,
  resolveEscrow,
  insertListing,
  initDbSchema
} from "@/lib/db";
import type { Escrow, Listing } from "@/lib/escrow";

// Try initializing DB schema on boot (Neon will ignore if tables exist)
if (hasDb()) {
  initDbSchema().catch(console.error);
}

export async function GET() {
  if (!hasDb()) {
    return NextResponse.json({ listings: [], escrows: [], shared: false });
  }
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows, shared: true });
}

export async function POST(req: Request) {
  const data = await req.json();
  
  if (!hasDb()) {
    return NextResponse.json({ error: "No DB" }, { status: 500 });
  }

  // Handle both Listing and Escrow creation on the same endpoint for simplicity, or separate?
  if (data.type === "listing") {
    await insertListing(data.payload as Listing);
    return NextResponse.json({ ok: true });
  } else if (data.type === "escrow") {
    await insertEscrow(data.payload as Escrow);
    return NextResponse.json({ ok: true });
  }
  
  return NextResponse.json({ error: "bad payload" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id?: string; lenderPubkey?: string; state?: string };
  if (!body.id || !hasDb()) return NextResponse.json({ error: "id required" }, { status: 400 });
  
  if (body.lenderPubkey) await updateEscrowLenderKey(body.id, body.lenderPubkey);
  if (body.state === "released") await resolveEscrow(body.id);
  
  return NextResponse.json({ ok: true, shared: true });
}
