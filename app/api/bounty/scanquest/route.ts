import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb, getLenderKey, consumeNonce } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const parts = token.split(".");
    if (parts.length !== 2) return NextResponse.json({ error: "Invalid token format" }, { status: 400 });

    const b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    const listingId: string = payload.escrowId; // field reused as subject id

    const listing = await fetchListing(listingId);
    if (!listing || listing.kind !== "bounty_qr") {
      return NextResponse.json({ error: "Invalid listing" }, { status: 404 });
    }

    const creatorKey = await getLenderKey(listing.owner);
    if (!creatorKey) return NextResponse.json({ error: "Creator keys missing" }, { status: 400 });

    const verified = await verifyReturn(token, creatorKey.publicKeyHex);
    if (!verified) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    if (verified.escrowId !== listingId) {
      return NextResponse.json({ error: "Token does not match this quest" }, { status: 400 });
    }

    const fresh = await consumeNonce(verified.nonce);
    if (!fresh) return NextResponse.json({ error: "QR code already used" }, { status: 400 });

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "scanquest",
        oracle: "qr_sig",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { nonce: verified.nonce },
        createdAt: listing.createdAt,
      },
      { to: address, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(listingId),
      () => finalizeListing(listingId),
      () => unclaimListing(listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  } catch (err) {
    console.error("ScanQuest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
