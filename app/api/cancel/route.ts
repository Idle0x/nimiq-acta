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

  const { type, id, mode } = (await req.json()) as { type?: string; id?: string; mode?: string };
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
    // Adult rule: a participant holding a lock cannot be stranded.
    // Cancel+refund only while nobody has accepted; otherwise close to new accepts.
    const sql = getSql()!;
    const held = await sql`SELECT id FROM escrows WHERE listing_id = ${id} AND state = 'locked' LIMIT 1`;
    const pending = await sql`SELECT id FROM venture_submissions WHERE listing_id = ${id} AND status = 'pending' LIMIT 1`;
    if (held.length > 0 || pending.length > 0) {
      if (mode === "close") {
        await sql`UPDATE listings SET is_active = FALSE, state = 'closed' WHERE id = ${id} AND state = 'open'`;
        const { notify } = await import("@/lib/notify");
        await notify(address, "info", "Listing closed to new accepts",
          `"${listing.title}" takes no new participants. Active contracts run to completion.`);
        return NextResponse.json({ ok: true, closed: true });
      }
      return NextResponse.json({ error: "Someone holds an active lock — cancel is disabled. Close to new accepts instead.", closeable: true }, { status: 409 });
    }
    try {
      const ok = await cancelListingWithRefund(id, address, listing.collateralNIM);
      if (!ok) return NextResponse.json({ error: "Could not cancel listing" }, { status: 400 });
      const { notify } = await import("@/lib/notify");
      await notify(address, "info", "Listing cancelled",
        `"${listing.title}" closed${listing.txHash ? " and your locked reward was refunded in full" : ""}.`);
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
  try {
    const { notify } = await import("@/lib/notify");
    await notify(address, "info", "Contract cancelled",
      `"${escrow.title}" — ${escrow.amountNIM.toLocaleString()} NIM refunded in full. No fee charged.`, "/active");
    const lrows = await getSql()!`SELECT owner FROM listings WHERE id = ${escrow.listingId} LIMIT 1`;
    const owner = (lrows[0] as any)?.owner as string | undefined;
    if (owner && owner !== address) {
      await notify(owner, "info", "A contract was cancelled",
        `"${escrow.title}" was cancelled by the participant and refunded in full.`);
    }
  } catch { /* notifications never block */ }

  return NextResponse.json({ ok: true });
}
