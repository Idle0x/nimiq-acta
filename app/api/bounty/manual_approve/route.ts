import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, atomicReleaseListing, insertAct, hasDb } from "@/lib/db";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { newId } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { listingId, completerAddress } = await req.json();
    if (!listingId || !completerAddress) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const listing = await fetchListing(listingId);
    if (!listing || listing.kind !== "bounty_manual") {
      return NextResponse.json({ error: "Invalid listing" }, { status: 404 });
    }

    if (listing.owner !== address) {
      return NextResponse.json({ error: "Only the creator can approve this bounty" }, { status: 403 });
    }

    const released = await atomicReleaseListing(listing.id);
    if (!released) return NextResponse.json({ error: "Bounty already completed" }, { status: 400 });

    let txHashOut = "0x" + Date.now().toString(16);
    try {
      txHashOut = await executeVaultPayout(completerAddress, listing.collateralNIM, 0.0001);
    } catch (e) {
      console.error("Manual payout failed:", e);
      return NextResponse.json({ error: "Failed to broadcast bounty reward" }, { status: 500 });
    }

    await insertAct({
      id: newId("act"),
      actorAddress: completerAddress,
      type: "bounty",
      oracle: "creator",
      listingId: listing.id,
      amountNIM: listing.collateralNIM,
      feeNIM: 0.0001,
      proofJson: { approver: address },
      txHashOut,
      createdAt: listing.createdAt,
      settledAt: Date.now()
    });

    checkAndAwardMilestone(completerAddress, "FIRST_BOUNTY").catch(() => {});

    return NextResponse.json({ ok: true, txHashOut });
  } catch (err) {
    console.error("Manual approve error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
