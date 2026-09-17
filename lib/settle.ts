import { getSql, insertAct } from "./db";
import { executeVaultPayout } from "./backend-nimiq";
import type { Act } from "./escrow";

// ---------- Escrows: locked -> settling -> released|locked ----------

export async function claimEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock mode
  const res = await sql`
    UPDATE escrows SET state = 'settling'
    WHERE id = ${id} AND state = 'locked'
    RETURNING id
  `;
  return res.length > 0;
}

export async function finalizeEscrow(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    UPDATE escrows SET state = 'released', resolved_at = ${Date.now()}
    WHERE id = ${id} AND state = 'settling'
  `;
}

export async function unclaimEscrow(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE escrows SET state = 'locked' WHERE id = ${id} AND state = 'settling'`;
}

// ---------- Listings: open -> settling -> complete|open ----------
// Also flips is_active=false at claim time so the claimed bounty
// vanishes from Radar immediately (no double-completion from the UI).

export async function claimListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  const res = await sql`
    UPDATE listings SET state = 'settling', is_active = FALSE
    WHERE id = ${id} AND state = 'open'
    RETURNING id
  `;
  return res.length > 0;
}

export async function finalizeListing(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE listings SET state = 'complete' WHERE id = ${id} AND state = 'settling'`;
}

export async function unclaimListing(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    UPDATE listings SET state = 'open', is_active = TRUE
    WHERE id = ${id} AND state = 'settling'
  `;
}

export async function cancelListingWithRefund(
  id: string,
  refundTo: string,
  amountNIM: number
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  // Claim for cancellation; if it was funded, refund before completing.
  const res = await sql`
    UPDATE listings SET state = 'settling', is_active = FALSE
    WHERE id = ${id} AND state = 'open'
    RETURNING tx_hash
  `;
  if (res.length === 0) return false;
  const txHash = (res[0] as any).tx_hash;
  if (txHash) {
    try {
      await executeVaultPayout(refundTo, amountNIM, 0.0001);
    } catch (e) {
      await unclaimListing(id);
      throw e;
    }
  }
  await sql`UPDATE listings SET state = 'cancelled' WHERE id = ${id}`;
  return true;
}

// ---------- The one true settlement pipeline ----------

export async function settleAct(
  act: Omit<Act, "txHashOut" | "settledAt">,
  payout: { to: string; amountNIM: number; feeNIM: number },
  claim: () => Promise<boolean>,
  finalize: () => Promise<void>,
  unclaim: () => Promise<void>
): Promise<{ ok: true; txHashOut: string } | { ok: false; error: string }> {
  if (!(await claim())) {
    return { ok: false, error: "Already settled or claimed" };
  }
  let txHashOut: string;
  try {
    // 1. Money moves FIRST. If this throws, the row returns to its
    //    previous state and the whole operation is safely retryable.
    txHashOut = await executeVaultPayout(payout.to, payout.amountNIM, payout.feeNIM);
  } catch (e) {
    await unclaim();
    throw e;
  }
  // 2. State transitions only after a confirmed broadcast.
  await finalize();
  // 3. The act is recorded last; insertAct also recomputes trust.
  await insertAct({ ...act, txHashOut, settledAt: Date.now() });
  return { ok: true, txHashOut };
}
