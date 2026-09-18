import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb, getLenderKey, consumeNonce } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM, SETTLE_FEE_NIM } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { awardRecurring } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { token, imageUrl } = await req.json();
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

    if (listing.owner === address) {
      return NextResponse.json({ error: "You cannot win your own bounty" }, { status: 403 });
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

    // AI scene check: sponsor demands proof of PRESENCE, not just possession.
    // A token photographed off a screen somewhere else must not settle.
    const contract = ((listing as any).contract ?? null) as {
      criteria?: string; ai?: { presenceCheck?: boolean };
    } | null;
    let sceneVerdict: string | null = null;
    if (contract?.ai?.presenceCheck || imageUrl) {
      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json({ error: "This quest requires a photo of the scene — a bare scan is not enough" }, { status: 422 });
      }
      const { verifyScenePhoto, OracleError } = await import("@/lib/vision");
      try {
        const v = await verifyScenePhoto(String(listing.title), String(contract?.criteria ?? ""), imageUrl);
        if (!v.pass) return NextResponse.json({ error: `Scene check failed: ${v.reason}` }, { status: 422 });
        sceneVerdict = v.reason;
      } catch (e) {
        if (e instanceof OracleError) {
          return NextResponse.json({ error: (e as Error).message, retryable: true }, { status: 502 });
        }
        throw e;
      }
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "scanquest",
        oracle: "qr_sig",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { nonce: verified.nonce, scene: sceneVerdict },
        createdAt: listing.createdAt,
      },
      {
        to: address,
        amountNIM: listing.collateralNIM - SETTLE_FEE_NIM,
        feeNIM: SETTLE_FEE_NIM,
        message: `Acta: ScanQuest reward for "${listing.title}"`,
      },
      () => claimListing(listingId),
      () => finalizeListing(listingId),
      () => unclaimListing(listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    awardRecurring(address, "settle").catch(() => {});
    awardRecurring(address, "bounty").catch(() => {});
    try {
      const { getSql } = await import("@/lib/db");
      await getSql()!`UPDATE escrows SET progress = 'settled' WHERE listing_id = ${listingId} AND state = 'released'`;
    } catch { /* informational */ }
    const { notify } = await import("@/lib/notify");
    await notify(address, "payout", "ScanQuest settled",
      `${listing.collateralNIM.toLocaleString()} NIM paid out for "${listing.title}".`,
      `https://www.nimiqwatch.com/transaction/${result.txHashOut}`);
    await notify(listing.owner, "released", "Your ScanQuest was completed",
      `"${listing.title}" was verified by signed-QR proof and paid from the vault.`);
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  } catch (err) {
    console.error("ScanQuest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
