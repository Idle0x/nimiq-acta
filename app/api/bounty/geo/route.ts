import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { getLenderKey, consumeNonce } from "@/lib/db";
import { checkAndAwardMilestone } from "@/lib/milestones";

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  try {
    const body = await req.json();
    if (!body.listingId || typeof body.lat !== "number" || typeof body.lng !== "number" || typeof body.accuracy !== "number") {
      return NextResponse.json({ error: "Missing location parameters" }, { status: 400 });
    }

    const listing = await fetchListing(body.listingId);
    if (!listing || listing.kind !== "bounty_venture") {
      return NextResponse.json({ error: "Invalid listing or not a Geo bounty" }, { status: 404 });
    }

    if (body.accuracy > 50) {
      return NextResponse.json({ pass: false, reason: "Location too inaccurate (>50m)" });
    }

    // If the creator pinned a target, enforce real proximity (haversine).
    const targetLat = (listing as any).targetLat;
    const targetLng = (listing as any).targetLng;
    if (targetLat != null && targetLng != null) {
      const dist = haversineM(body.lat, body.lng, targetLat, targetLng);
      if (dist > 150) {
        return NextResponse.json({ pass: false, reason: `You are ${Math.round(dist)}m from the target location` });
      }
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "bounty",
        oracle: "geo",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { lat: body.lat, lng: body.lng, accuracy: body.accuracy },
        createdAt: listing.createdAt,
      },
      { to: address, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(body.listingId),
      () => finalizeListing(body.listingId),
      () => unclaimListing(body.listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ pass: true, reason: "Verified location", txHashOut: result.txHashOut });
  } catch (err) {
    console.error("Geo Verify Route Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
