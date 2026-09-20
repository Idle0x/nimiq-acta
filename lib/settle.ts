import { getSql, insertAct } from "./db";
import { executeVaultPayout } from "./backend-nimiq";
import { type Act, explorerTxUrl } from "./escrow";

// ---------- Escrows: locked -> settling -> released|locked ----------

export async function claimEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock mode
  const res = await sql`
    UPDATE escrows SET state = 'settling'
    WHERE id = ${id} AND state IN ('locked', 'expired')
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
  const now = Date.now();
  // Restore the pre-claim state: past-deadline rows go back to expired
  // (the lender-claim window), the rest to locked.
  await sql`
    UPDATE escrows
    SET state = CASE WHEN deadline_at IS NOT NULL AND deadline_at < ${now} THEN 'expired' ELSE 'locked' END
    WHERE id = ${id} AND state = 'settling'
  `;
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
  //    Idempotent per side (settleReferralReward skips paid sides), so every
  //    settlement path funnels through here instead of a single route.
  await settleReferralReward(act.actorAddress).catch((e) => console.error("referral drip failed:", e));
  // 5. Sweep the retry queue and award first-settlement milestone.
  import("./milestones").then((m) => {
    m.checkAndAwardMilestone(act.actorAddress, "FIRST_CONNECTION").catch(() => {});
    m.checkAndAwardMilestone(act.actorAddress, "FIRST_SETTLED").catch(() => {});
    m.awardRecurring(act.actorAddress, "settle").catch(() => {});
    m.processPendingDrips().catch(() => {});
  });
  return { ok: true, txHashOut };
}

const REFERRAL_REWARD_NIM = 10;

/** Pays 10 NIM to both referrer and referee immediately. Idempotent per side. */
export async function rewardReferralPair(
  referralId: string,
  referrer: string,
  referee: string
): Promise<{ paidReferrer: boolean; paidReferee: boolean }> {
  const { getSql, getMemStore } = await import("./db");
  const { notify } = await import("./notify");
  const { dripTreasury } = await import("./milestones");
  const sql = getSql();

  let paidSides = new Set<string>();
  if (sql) {
    const paidRows = await sql`
      SELECT proof_json->>'side' AS side FROM acts
      WHERE type = 'referral' AND proof_json->>'referral_id' = ${referralId}
    `;
    paidSides = new Set((paidRows as unknown as Record<string, unknown>[]).map((r) => String(r.side)));
  } else {
    const { memActs } = getMemStore();
    for (const a of memActs) {
      if (a.type === "referral" && (a.proofJson as any)?.referral_id === referralId) {
        paidSides.add((a.proofJson as any)?.side);
      }
    }
  }

  let paidReferrer = false;
  let paidReferee = false;

  for (const [to, side] of [[referrer, "referrer"], [referee, "referee"]] as const) {
    if (paidSides.has(side)) continue;
    const msg = side === "referrer"
      ? `Acta Referral: Friend referral reward (+${REFERRAL_REWARD_NIM} NIM)`
      : `Acta Referral: Welcome referral reward (+${REFERRAL_REWARD_NIM} NIM)`;

    const tx = await dripTreasury(to, REFERRAL_REWARD_NIM, {
      type: "referral",
      proof: { referral_id: referralId, side },
      refId: `${referralId}:${side}`,
      message: msg,
    });

    if (side === "referrer") paidReferrer = true;
    if (side === "referee") paidReferee = true;

    await notify(
      to,
      "referral",
      "Referral reward settled",
      `10 NIM from the treasury — ${side === "referrer" ? "a friend joined through your referral!" : "welcome reward for joining via referral!"}.`,
      tx ? explorerTxUrl(tx) : undefined
    ).catch(() => {});
  }

  return { paidReferrer, paidReferee };
}

/** Pays 10 NIM to referrer AND referee on the referee's first settled act (fallback / idempotent sweep). Once ever. */
export async function settleReferralReward(referee: string): Promise<void> {
  const { getSql, getMemStore } = await import("./db");
  const sql = getSql();
  let referralId: string | null = null;
  let referrer: string | null = null;

  if (sql) {
    const settled = await sql`
      SELECT referral_id, referee FROM referral_settlements WHERE referee = ${referee} LIMIT 1
    `;
    if (settled.length === 0) return;
    referralId = (settled[0] as any).referral_id as string;
    const ref = await sql`SELECT referrer FROM referrals WHERE id = ${referralId} LIMIT 1`;
    referrer = (ref[0] as any)?.referrer as string | undefined ?? null;
  } else {
    const { memReferralSettlements, memReferrals } = getMemStore();
    const settled = memReferralSettlements.get(referee);
    if (!settled) return;
    referralId = settled.referralId;
    for (const r of memReferrals.values()) {
      if (r.id === referralId) {
        referrer = r.referrer;
        break;
      }
    }
  }

  if (!referralId || !referrer) return;
  await rewardReferralPair(referralId, referrer, referee);
}
