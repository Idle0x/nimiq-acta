import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, atomicReleaseListing, insertAct, hasDb, getLenderKey, consumeNonce } from "@/lib/db";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { newId } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const parts = token.split('.');
    if (parts.length !== 3) return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
    const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    
    const listingId = payload.escrowId; // we reused escrowId field for listingId
    const listing = await fetchListing(listingId);
    if (!listing || listing.kind !== "bounty_qr") {
      return NextResponse.json({ error: "Invalid listing" }, { status: 404 });
    }

    const creatorKey = await getLenderKey(listing.owner);
    if (!creatorKey) return NextResponse.json({ error: "Creator keys missing" }, { status: 400 });

    const verified = await verifyReturn(token, creatorKey.publicKeyHex);
    if (!verified) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    const fresh = await consumeNonce(verified.nonce);
    if (!fresh) return NextResponse.json({ error: "QR code already used" }, { status: 400 });

    const released = await atomicReleaseListing(listing.id);
    if (!released) return NextResponse.json({ error: "Bounty already completed" }, { status: 400 });

    let txHashOut = "0x" + Date.now().toString(16);
    try {
      txHashOut = await executeVaultPayout(address, listing.collateralNIM, 0.0001);
    } catch (e) {
      console.error("ScanQuest payout failed:", e);
      return NextResponse.json({ error: "Failed to broadcast bounty reward" }, { status: 500 });
    }

    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "scanquest",
      oracle: "qr_sig",
      listingId: listing.id,
      amountNIM: listing.collateralNIM,
      feeNIM: 0.0001,
      proofJson: { nonce: verified.nonce },
      txHashOut,
      createdAt: listing.createdAt,
      settledAt: Date.now()
    });

    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});

    return NextResponse.json({ ok: true, txHashOut });
  } catch (err) {
    console.error("ScanQuest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
