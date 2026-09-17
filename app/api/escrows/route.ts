import { NextResponse } from "next/server";
import { fetchEscrows, fetchListings, hasDb, insertEscrow, insertListing, initDbSchema, atomicReleaseEscrow, fetchEscrow, consumeNonce, insertAct } from "@/lib/db";
import type { Escrow, Listing, Act } from "@/lib/escrow";
import { getSessionAddress } from "@/lib/session";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { verifyReturn } from "@/lib/qr";
import { newId } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

if (hasDb()) {
  initDbSchema().catch(console.error);
}

export async function GET(req: Request) {
  if (!hasDb()) return NextResponse.json({ listings: [], escrows: [] });
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows });
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });
  const data = await req.json();

  if (data.type === "escrow") {
    await insertEscrow(data.payload as Escrow);
    // Real implementation would log an 'act' here for the initial lock!
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "borrow_lock",
      oracle: "system",
      listingId: data.payload.listingId,
      escrowId: data.payload.id,
      amountNIM: data.payload.amountNIM,
      feeNIM: data.payload.feeNIM,
      txHashIn: data.payload.txHash,
      createdAt: Date.now()
    });
    checkAndAwardMilestone(address, "FIRST_LOCKED").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  if (data.type === "listing") {
    await insertListing(data.payload as Listing);
    checkAndAwardMilestone(address, "FIRST_LISTING").catch(() => {});
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "bad payload" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = (await req.json()) as { id?: string; token?: string; lenderPubkey?: string };
  if (!body.id || !hasDb()) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (body.lenderPubkey) {
    const sql = getSql();
    if (sql) {
      await sql`UPDATE escrows SET lender_pubkey = ${body.lenderPubkey} WHERE id = ${body.id}`;
      return NextResponse.json({ ok: true });
    }
  }

  if (body.token) {
    const escrow = await fetchEscrow(body.id);
    if (!escrow || escrow.state !== "locked") {
      return NextResponse.json({ error: "Invalid escrow state" }, { status: 400 });
    }
    if (!escrow.lenderPubkey) {
      return NextResponse.json({ error: "Lender public key not registered" }, { status: 400 });
    }
    const payload = await verifyReturn(body.token, escrow.lenderPubkey);
    if (!payload) return NextResponse.json({ error: "Invalid QR signature or expired" }, { status: 400 });
    
    // Check nonce
    const isFresh = await consumeNonce(payload.nonce);
    if (!isFresh) return NextResponse.json({ error: "QR code already used (replay protection)" }, { status: 400 });
    
    // Atomic release
    const released = await atomicReleaseEscrow(body.id);
    if (!released) return NextResponse.json({ error: "Already released" }, { status: 400 });

    // Real production payout via backend hot wallet
    let txHashOut = "0x" + Date.now().toString(16);
    try {
      txHashOut = await executeVaultPayout(escrow.borrower, escrow.amountNIM - escrow.feeNIM, escrow.feeNIM);
    } catch (e) {
      console.error("Payout broadcast failed:", e);
      return NextResponse.json({ error: "Failed to broadcast release transaction" }, { status: 500 });
    }

    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "borrow_return",
      oracle: "qr_sig",
      listingId: escrow.listingId,
      escrowId: escrow.id,
      amountNIM: escrow.amountNIM,
      feeNIM: escrow.feeNIM,
      proofJson: { nonce: payload.nonce },
      txHashOut,
      createdAt: escrow.createdAt,
      settledAt: Date.now()
    });

    checkAndAwardMilestone(address, "FIRST_SETTLED").catch(() => {});

    return NextResponse.json({ ok: true, txHashOut });
  }

  return NextResponse.json({ error: "Invalid PATCH action" }, { status: 400 });
}
