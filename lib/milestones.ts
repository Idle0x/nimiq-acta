import { getSql, insertAct } from "./db";
import { executeVaultPayout } from "./backend-nimiq";
import { newId } from "./escrow";

// One-time welcome. Everything else below recurs forever, slowly.
// FIRST_CONNECTION used to fire at login — free identities farmed it, so it
// now fires on the actor's first SETTLED act (funds moved, proof verified).
// Login only records referral links; money moves only for participation.
export const MILESTONES = {
  FIRST_CONNECTION: { id: "ms_first_conn", rewardNIM: 10 },
  FIRST_LOCKED: { id: "ms_first_lock", rewardNIM: 1 },
  FIRST_SETTLED: { id: "ms_first_settle", rewardNIM: 1 },
  FIRST_BOUNTY: { id: "ms_first_bounty", rewardNIM: 1 },
  FIRST_LISTING: { id: "ms_first_listing", rewardNIM: 1 },
};

// Recurring drip rules: every Nth event pays 1 NIM. Slow by design —
// a trickle for staying active, never a faucet worth farming
// (self-dealing is blocked at accept/settle time, and minimums apply).
export const RECURRING = {
  lock: { every: 5, rewardNIM: 1 },
  listing: { every: 3, rewardNIM: 1 },
  settle: { every: 3, rewardNIM: 1 },
  bounty: { every: 3, rewardNIM: 1 },
} as const;

export type RecurKind = keyof typeof RECURRING;

/**
 * Once-ever guard against concurrent double-awards (two logins/settles racing
 * past the acts check at the same time). First claimant wins; losers stop.
 * Fail-open if the guard table is missing — the acts check remains as backstop.
 */
async function claimOnce(key: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  try {
    const r = await sql`
      INSERT INTO idempotent_actions (key, kind, payload, created_at)
      VALUES (${key}, 'milestone-guard', ${JSON.stringify({})}, ${Date.now()})
      ON CONFLICT (key) DO NOTHING
      RETURNING key
    `;
    return r.length > 0;
  } catch {
    return true;
  }
}

/**
 * Treasury drip with a persistent retry tail. On vault failure the drip is
 * queued in pending_drips (deduped) instead of lost, and retried on every
 * future settlement plus the hourly cron — a treasury hiccup delays a
 * reward, it never deletes one.
 */
export async function dripTreasury(
  address: string,
  amountNIM: number,
  opts: {
    type: "milestone" | "referral" | "checkin";
    proof: Record<string, unknown>;
    refId: string;
    message: string;
  }
): Promise<string | null> {
  const sql = getSql();
  const msg = opts.message || (
    opts.type === "checkin" ? `Acta: Daily check-in reward (+${amountNIM} NIM)` :
    opts.type === "referral" ? `Acta Referral: Friend settlement reward (+${amountNIM} NIM)` :
    `Acta Milestone: ${opts.refId.replace("ms_", "").replace(/_/g, " ")} (+${amountNIM} NIM)`
  );
  if (!sql) {
    const txHashOut = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: opts.type,
      oracle: "system",
      amountNIM,
      feeNIM: 0,
      proofJson: { ...opts.proof, message: msg },
      txHashOut,
      createdAt: Date.now(),
      settledAt: Date.now(),
    });
    return txHashOut;
  }
  try {
    const txHashOut = await executeVaultPayout(address, amountNIM, 0.0001, msg);
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: opts.type,
      oracle: "system",
      amountNIM,
      feeNIM: 0,
      proofJson: { ...opts.proof, message: msg },
      txHashOut,
      createdAt: Date.now(),
      settledAt: Date.now(),
    });
    return txHashOut;
  } catch (err) {
    console.error(`treasury drip (${opts.type}) failed, queued for retry:`, err);
    try {
      await sql`
        INSERT INTO pending_drips (id, kind, address, amount_nim, ref_id, proof_json, attempts, created_at)
        VALUES (${newId("drip")}, ${opts.type}, ${address}, ${amountNIM}, ${opts.refId}, ${JSON.stringify({ ...opts.proof, message: msg })}, 0, ${Date.now()})
        ON CONFLICT (kind, address, ref_id) DO NOTHING
      `;
    } catch {
      // queue write failed too — the next trigger recomputes from acts anyway
    }
    return null;
  }
}

/** Pay out everything waiting in the retry queue, oldest first. */
export async function processPendingDrips(limit = 10): Promise<{ paid: number; pending: number }> {
  const sql = getSql();
  if (!sql) return { paid: 0, pending: 0 };
  let paid = 0;
  try {
    const rows = await sql`
      SELECT * FROM pending_drips WHERE attempts < 10 ORDER BY created_at ASC LIMIT ${limit}
    `;
    for (const r of rows as unknown as Record<string, unknown>[]) {
      const id = String(r.id);
      const address = String(r.address);
      const amount = Number(r.amount_nim ?? 0);
      const kind = String(r.kind) as "milestone" | "referral" | "checkin";
      let proof: Record<string, unknown> = {};
      try {
        proof = JSON.parse(String(r.proof_json ?? "{}"));
      } catch {
        proof = {};
      }
      // Atomic claim: concurrent sweepers race here; exactly one wins.
      // attempts >= 10 rows are dead-lettered (operator reviews, never auto-paid).
      const cur = Number(r.attempts ?? 0);
      const claimed = await sql`
        UPDATE pending_drips SET attempts = 99 WHERE id = ${id} AND attempts = ${cur} RETURNING id
      `;
      if (claimed.length === 0) continue;
      try {
        const retryMsg = (proof as any)?.message || `Acta Treasury: ${kind} reward (+${amount} NIM)`;
        const tx = await executeVaultPayout(address, amount, 0.0001, retryMsg);
        await insertAct({
          id: newId("act"),
          actorAddress: address,
          type: kind,
          oracle: "system",
          amountNIM: amount,
          feeNIM: 0,
          proofJson: proof,
          txHashOut: tx,
          createdAt: Date.now(),
          settledAt: Date.now(),
        });
        await sql`DELETE FROM pending_drips WHERE id = ${id}`;
        paid++;
      } catch (e) {
        console.error("pending drip retry failed:", e);
        await sql`UPDATE pending_drips SET attempts = ${cur + 1} WHERE id = ${id}`;
      }
    }
    const left = await sql`SELECT COUNT(*)::int AS n FROM pending_drips`;
    return { paid, pending: Number((left[0] as any)?.n ?? 0) };
  } catch {
    return { paid, pending: 0 };
  }
}

export async function checkAndAwardMilestone(address: string, milestoneKey: keyof typeof MILESTONES) {
  const sql = getSql();
  if (!sql) return;

  const milestone = MILESTONES[milestoneKey];
  if (!(await claimOnce(`ms:${address}:${milestone.id}`))) return; // lost the race

  // Check if this milestone has already been awarded to this address
  const existing = await sql`
    SELECT id FROM acts
    WHERE actor_address = ${address} AND type = 'milestone' AND proof_json->>'milestone_id' = ${milestone.id}
    LIMIT 1
  `;
  if (existing.length > 0) return; // Already awarded

  const label = milestoneKey.replace(/_/g, " ");
  await dripTreasury(address, milestone.rewardNIM, {
    type: "milestone",
    proof: { milestone_id: milestone.id },
    refId: milestone.id,
    message: `Acta Milestone: ${label} (+${milestone.rewardNIM} NIM)`,
  });
}

/** Recurring drip: pays 1 NIM at every Nth event of a kind. Once per multiple, forever. */
export async function awardRecurring(address: string, kind: RecurKind) {
  const sql = getSql();
  if (!sql) return;
  const rule = RECURRING[kind];

  let count = 0;
  try {
    if (kind === "lock") {
      // Cancelled locks never counted — otherwise lock→cancel×5 prints 1 NIM.
      const r = await sql`SELECT COUNT(*)::int AS n FROM escrows WHERE borrower = ${address} AND state != 'cancelled'`;
      count = Number((r[0] as any)?.n ?? 0);
    } else if (kind === "listing") {
      // Cancelled listings never counted — creation alone must not mint.
      const r = await sql`SELECT COUNT(*)::int AS n FROM listings WHERE owner = ${address} AND state != 'cancelled'`;
      count = Number((r[0] as any)?.n ?? 0);
    } else if (kind === "settle") {
      const r = await sql`
        SELECT COUNT(*)::int AS n FROM acts
        WHERE actor_address = ${address} AND settled_at IS NOT NULL
          AND type IN ('borrow_return', 'bounty', 'scanquest', 'checkin', 'creator')
      `;
      count = Number((r[0] as any)?.n ?? 0);
    } else {
      const r = await sql`
        SELECT COUNT(*)::int AS n FROM acts
        WHERE actor_address = ${address} AND settled_at IS NOT NULL
          AND type IN ('bounty', 'scanquest')
      `;
      count = Number((r[0] as any)?.n ?? 0);
    }
  } catch {
    return;
  }

  const n = Math.floor(count / rule.every);
  if (n < 1) return;
  const milestoneId = `rec_${kind}_${n}`;
  if (!(await claimOnce(`rec:${address}:${milestoneId}`))) return; // lost the race
  const existing = await sql`
    SELECT id FROM acts
    WHERE actor_address = ${address} AND type = 'milestone' AND proof_json->>'milestone_id' = ${milestoneId}
    LIMIT 1
  `;
  if (existing.length > 0) return; // this multiple already paid

  await dripTreasury(address, rule.rewardNIM, {
    type: "milestone",
    proof: { milestone_id: milestoneId, rule: kind, every: rule.every, n, count },
    refId: milestoneId,
    message: `Acta Activity Reward: ${rule.every * n}th ${kind} (+${rule.rewardNIM} NIM)`,
  });
}
