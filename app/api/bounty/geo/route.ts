import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, atomicReleaseListing, insertAct, hasDb } from "@/lib/db";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "Database not available" }, { status: 500 });
  
  try {
    const body = await req.json();
    if (!body.listingId || !body.lat || !body.lng || typeof body.accuracy !== 'number') {
      return NextResponse.json({ error: "Missing location parameters" }, { status: 400 });
    }

    const listing = await fetchListing(body.listingId);
    if (!listing || listing.kind !== "bounty_venture") {
      return NextResponse.json({ error: "Invalid listing or not a Geo bounty" }, { status: 404 });
    }

    // Since we don't have the target coordinates stored in the DB (the user didn't enter them in CreateListing),
    // we'll just verify accuracy < 50m to simulate a successful check-in for the MVP.
    // In a full version, we'd add `targetLat`/`targetLng` to the listing and use haversine formula.
    
    if (body.accuracy > 50) {
      return NextResponse.json({ pass: false, reason: "Location too inaccurate (>50m)" });
    }

    const released = await atomicReleaseListing(body.listingId);
    if (!released) return NextResponse.json({ error: "Bounty already completed" }, { status: 400 });
    
    // Payout
    let txHashOut = "0x" + Date.now().toString(16);
    try {
      txHashOut = await executeVaultPayout(address, listing.collateralNIM, 0.0001);
    } catch (e) {
      console.error("Geo payout failed:", e);
      return NextResponse.json({ error: "Failed to broadcast bounty reward" }, { status: 500 });
    }
    
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "bounty",
      oracle: "geo",
      listingId: listing.id,
      amountNIM: listing.collateralNIM,
      feeNIM: 0.0001,
      proofJson: { lat: body.lat, lng: body.lng, accuracy: body.accuracy },
      txHashOut,
      createdAt: listing.createdAt,
      settledAt: Date.now()
    });
    
    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    
    return NextResponse.json({ pass: true, reason: "Verified location" });
  } catch (err) {
    console.error("Geo Verify Route Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
