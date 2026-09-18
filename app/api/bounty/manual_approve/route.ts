import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb, getSql, consumeNonce } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM, SETTLE_FEE_NIM } from "@/lib/escrow";
import { awardRecurring } from "@/lib/milestones";

// Creator-as-oracle approval. Covers both 'bounty_manual' (creator scans the
// completer's QR) and 'bounty_venture' (creator approves a stored submission).
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { listingId, completerAddress, decision } = (await req.json()) as {
      listingId?: string;
      completerAddress?: string;
      decision?: string;
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
    if (completerAddress === address) {
      return NextResponse.json({ error: "You cannot approve your own submission" }, { status: 403 });
    }

    // Reject path: release nothing, record the verdict, notify the completer.
    if (decision === "reject") {
      const sql = getSql()!;
      const rej = await sql`
        UPDATE venture_submissions SET status = 'rejected'
        WHERE listing_id = ${listingId} AND completer = ${completerAddress} AND status = 'pending'
        RETURNING id
      `;
      if (rej.length === 0) {
        return NextResponse.json({ error: "No pending submission from this completer" }, { status: 400 });
      }
      try {
        await sql`UPDATE escrows SET progress = 'awaiting_proof' WHERE listing_id = ${listingId} AND (borrower = ${completerAddress} OR completer = ${completerAddress}) AND state = 'locked'`;
      } catch { /* informational */ }
      const { notify } = await import("@/lib/notify");
      await notify(completerAddress, "info", "Submission not approved",
        `"${listing.title}" — the sponsor passed this time. Your lock still stands; refine and resubmit.`, "/active");
      return NextResponse.json({ ok: true, rejected: true });
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
      {
        to: completerAddress,
        amountNIM: listing.collateralNIM - SETTLE_FEE_NIM,
        feeNIM: SETTLE_FEE_NIM,
        message: `Acta: Approved reward for "${listing.title}"`,
      },
      () => claimListing(listingId),
      () => finalizeListing(listingId),
      () => unclaimListing(listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    awardRecurring(completerAddress, "settle").catch(() => {});
    awardRecurring(completerAddress, "bounty").catch(() => {});
    try {
      await getSql()!`UPDATE escrows SET progress = 'settled' WHERE listing_id = ${listingId} AND state = 'released'`;
    } catch { /* informational */ }
    const { notify } = await import("@/lib/notify");
    await notify(completerAddress, "payout", "Submission approved",
      `"${listing.title}" was approved by the sponsor. ${listing.collateralNIM.toLocaleString()} NIM paid out.`,
      `https://www.nimiqwatch.com/transaction/${result.txHashOut}`);
    await notify(address, "released", "You approved a submission",
      `Reward for "${listing.title}" released to ${completerAddress.slice(0, 12)}...`);
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  } catch (err) {
    console.error("Manual approve error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
