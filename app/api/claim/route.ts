import { NextResponse } from "next/server";
import { fetchEscrow, fetchListing } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { newId, SETTLE_FEE_NIM, LENDER_CLAIM_GRACE_MS, explorerTxUrl } from "@/lib/escrow";
import { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } from "@/lib/settle";

// Lender claim: the other half of the borrow protocol. If the deadline passed
// 48h+ ago and the item never came back (no QR settle), the lender — never the
// borrower, never a stranger — may claim the lock minus the settlement fee.
// The borrower can still pre-empt by returning late via QR any time before.
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { escrowId } = (await req.json().catch(() => ({}))) as { escrowId?: string };
  if (!escrowId) return NextResponse.json({ error: "escrowId required" }, { status: 400 });

  const escrow = await fetchEscrow(escrowId);
  if (!escrow || escrow.state !== "expired") {
    return NextResponse.json({ error: "No claimable lock (only deadline-expired contracts qualify)" }, { status: 400 });
  }
  const listing = await fetchListing(escrow.listingId);
  if (!listing || listing.owner !== address) {
    return NextResponse.json({ error: "Only the lender may claim" }, { status: 403 });
  }
  const deadline = escrow.deadlineAt ?? 0;
  if (!(deadline > 0) || Date.now() - deadline < LENDER_CLAIM_GRACE_MS) {
    return NextResponse.json({ error: "Lender claim window opens 48h after the deadline" }, { status: 400 });
  }

  const result = await settleAct(
    {
      id: newId("act"),
      actorAddress: address,
      type: "borrow_return",
      oracle: "system",
      listingId: escrow.listingId,
      escrowId: escrow.id,
      amountNIM: escrow.amountNIM,
      feeNIM: SETTLE_FEE_NIM,
      proofJson: { lenderClaim: true, deadlineAt: deadline },
      createdAt: escrow.createdAt,
    },
    {
      to: address,
      amountNIM: escrow.amountNIM - SETTLE_FEE_NIM,
      feeNIM: SETTLE_FEE_NIM,
      message: `Acta: Lender claim for unreturned "${escrow.title}"`,
    },
    () => claimEscrow(escrowId),
    () => finalizeEscrow(escrowId),
    () => unclaimEscrow(escrowId)
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  try {
    const { notify } = await import("@/lib/notify");
    await notify(escrow.borrower, "released", "Lock claimed by lender",
      `The deadline passed 48h+ ago with no return — "${escrow.title}" collateral went to the lender.`, "/active");
  } catch { /* notifications never block settlement */ }
  return NextResponse.json({ ok: true, txHashOut: result.txHashOut, explorer: explorerTxUrl(result.txHashOut) });
}
