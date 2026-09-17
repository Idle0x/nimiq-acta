import { NextResponse } from "next/server";
import { cancelListing, cancelEscrow, fetchEscrow } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { executeVaultPayout } from "@/lib/backend-nimiq";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "listing") {
    await cancelListing(id);
    return NextResponse.json({ ok: true });
  } else if (type === "escrow") {
    const escrow = await fetchEscrow(id);
    if (!escrow || escrow.state !== "locked") {
       return NextResponse.json({ error: "Cannot cancel this contract" }, { status: 400 });
    }
    
    // Only the borrower/creator can cancel their own escrow/bounty
    if (escrow.borrower !== address) {
       return NextResponse.json({ error: "Not your contract" }, { status: 403 });
    }

    const cancelled = await cancelEscrow(id);
    if (!cancelled) return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });

    // Refund the vault collateral back to the creator
    try {
      await executeVaultPayout(address, escrow.amountNIM - escrow.feeNIM, escrow.feeNIM);
    } catch (e) {
      console.error("Refund failed:", e);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
