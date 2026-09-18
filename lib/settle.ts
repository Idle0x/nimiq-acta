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
    RETURNING tx_hash, title
  `;
  if (res.length === 0) return false;
  const txHash = (res[0] as any).tx_hash;
  const title = (res[0] as any).title || "listing";
  if (txHash) {
    try {
      await executeVaultPayout(refundTo, amountNIM, 0.0001, `Acta: Refund for cancelled "${title}"`);
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
  payout: { to: string; amountNIM: number; feeNIM: number; message: string },
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
    txHashOut = await executeVaultPayout(payout.to, payout.amountNIM, payout.feeNIM, payout.message);
  } catch (e) {
    await unclaim();
    throw e;
  }
  // 2. State transitions only after a confirmed broadcast.
  await finalize();
  // 3. The act is recorded last; insertAct also recomputes trust.
  await insertAct({ ...act, txHashOut, settledAt: Date.now() });
  // 4. Referral drip: the actor's FIRST settled act pays their referrer.
  //    Best-effort — a treasury hiccup must never fail a settlement.
  // 5. Sweep the retry queue and award first-settlement milestone.
  import("./milestones").then((m) => {
    m.checkAndAwardMilestone(act.actorAddress, "FIRST_SETTLED").catch(() => {});
    m.awardRecurring(act.actorAddress, "settle").catch(() => {});
    m.processPendingDrips().catch(() => {});
  });
  return { ok: true, txHashOut };
}

const REFERRAL_REWARD_NIM = 10;

/** Pays 10 NIM to referrer AND referee on the referee's first settled act. Once ever. */
export async function settleReferralReward(referee: string): Promise<void> {
  const { getSql } = await import("./db");
  const sql = getSql();
  if (!sql) return;
  const settled = await sql`
    SELECT referral_id, referee FROM referral_settlements WHERE referee = ${referee} LIMIT 1
  `;
  if (settled.length === 0) return;
  const referralId = (settled[0] as any).referral_id as string;
  const ref = await sql`SELECT referrer FROM referrals WHERE id = ${referralId} LIMIT 1`;
  const referrer = (ref[0] as any)?.referrer as string | undefined;
  if (!referrer) return;
  // Per-side idempotency: a half-paid pair resumes where it stopped.
  const paidRows = await sql`
    SELECT proof_json->>'side' AS side FROM acts
    WHERE type = 'referral' AND proof_json->>'referral_id' = ${referralId}
  `;
  const paidSides = new Set((paidRows as unknown as Record<string, unknown>[]).map((r) => String(r.side)));
  const { notify } = await import("./notify");
  const { dripTreasury } = await import("./milestones");
  for (const [to, side] of [[referrer, "referrer"], [referee, "referee"]] as const) {
    if (paidSides.has(side)) continue;
    const msg = side === "referrer"
      ? `Acta Referral: Friend first settlement reward (+10 NIM)`
      : `Acta Referral: Welcome referral reward (+10 NIM)`;
    const tx = await dripTreasury(to, REFERRAL_REWARD_NIM, {
      type: "referral",
      proof: { referral_id: referralId, side },
      refId: `${referralId}:${side}`,
      message: msg,
    });
    if (tx) {
      await notify(to, "referral", "Referral reward settled",
        `10 NIM from the treasury — ${side === "referrer" ? "your friend settled their first act" : "your first act settled"}.`,
        `https://www.nimiqwatch.com/transaction/${tx}`);
    }
  }
}
