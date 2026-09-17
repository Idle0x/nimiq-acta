import { NextResponse } from "next/server";
import { fetchEscrow, fetchListing, cancelEscrow, hasDb } from "@/lib/db";
import { cancelListingWithRefund, claimEscrow, unclaimEscrow } from "@/lib/settle";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { getSessionAddress } from "@/lib/session";
import { insertAct, getSql } from "@/lib/db";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const { type, id } = (await req.json()) as { type?: string; id?: string };
  if (!id || (type !== "listing" && type !== "escrow")) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
  }

  // ---- Cancel a listing: only the owner; funded bounties are refunded ----
  if (type === "listing") {
    const listing = await fetchListing(id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.owner !== address) {
      return NextResponse.json({ error: "Not your listing" }, { status: 403 });
    }
    if (listing.state && listing.state !== "open") {
      return NextResponse.json({ error: "Listing already claimed or closed" }, { status: 400 });
    }
    try {
      const ok = await cancelListingWithRefund(id, address, listing.collateralNIM);
      if (!ok) return NextResponse.json({ error: "Could not cancel listing" }, { status: 400 });
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Listing refund failed:", e);
      return NextResponse.json({ error: "Refund broadcast failed — listing unchanged" }, { status: 500 });
    }
  }

  // ---- Cancel an escrow: only the borrower; full refund, no fee on cancel ----
  const escrow = await fetchEscrow(id);
  if (!escrow || escrow.state !== "locked") {
    return NextResponse.json({ error: "Cannot cancel this contract" }, { status: 400 });
  }
  if (escrow.borrower !== address) {
    return NextResponse.json({ error: "Not your contract" }, { status: 403 });
  }

  // Claim so two cancels can't race, then refund in full.
  if (!(await claimEscrow(id))) {
    return NextResponse.json({ error: "Contract is being settled" }, { status: 409 });
  }
  try {
    await executeVaultPayout(address, escrow.amountNIM, MIN_NETWORK_FEE_NIM);
  } catch (e) {
    await unclaimEscrow(id);
    console.error("Refund failed:", e);
    return NextResponse.json({ error: "Refund broadcast failed" }, { status: 500 });
  }
  await cancelEscrow(id); // marks 'cancelled'

  // Close out the open lock act so it doesn't drag the completion ratio down.
  const sql = getSql();
  if (sql) {
    await sql`
      UPDATE acts SET settled_at = ${Date.now()}, fee_nim = 0
      WHERE escrow_id = ${id} AND type = 'borrow_lock' AND settled_at IS NULL
    `;
  }
  await insertAct({
    id: newId("act"),
    actorAddress: address,
    type: "borrow_lock",
    oracle: "system",
    listingId: escrow.listingId,
    escrowId: escrow.id,
    amountNIM: 0,
    feeNIM: 0,
    proofJson: { cancelled: true, refundTx: true },
    createdAt: Date.now(),
    settledAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
