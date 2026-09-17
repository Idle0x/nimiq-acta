import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb, getSql, consumeNonce } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

// Creator-as-oracle approval. Covers both 'bounty_manual' (creator scans the
// completer's QR) and 'bounty_venture' (creator approves a stored submission).
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { listingId, completerAddress } = (await req.json()) as {
      listingId?: string;
      completerAddress?: string;
    };
    if (!listingId || !completerAddress) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const listing = await fetchListing(listingId);
    if (!listing || (listing.kind !== "bounty_manual" && listing.kind !== "bounty_venture")) {
      return NextResponse.json({ error: "Invalid listing" }, { status: 404 });
    }
    if (listing.owner !== address) {
      return NextResponse.json({ error: "Only the creator can approve" }, { status: 403 });
    }

    // For Venture: only approve an actual stored pending submission.
    if (listing.kind === "bounty_venture") {
      const sql = getSql()!;
      const sub = await sql`
        UPDATE venture_submissions SET status = 'approved'
        WHERE listing_id = ${listingId} AND completer = ${completerAddress} AND status = 'pending'
        RETURNING id
      `;
      if (sub.length === 0) {
        return NextResponse.json({ error: "No pending submission from this completer" }, { status: 400 });
      }
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: completerAddress,
        type: "bounty",
        oracle: "creator",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { approver: address },
        createdAt: listing.createdAt,
      },
      { to: completerAddress, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(listingId),
      () => finalizeListing(listingId),
      () => unclaimListing(listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    checkAndAwardMilestone(completerAddress, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  } catch (err) {
    console.error("Manual approve error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
