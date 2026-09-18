import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { verifyBountyPhoto, OracleError } from "@/lib/vision";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { SETTLE_FEE_NIM } from "@/lib/escrow";
import { notify } from "@/lib/notify";
import { beginIdempotent } from "@/lib/idempotency";

/**
 * PhotoProof oracle + settlement.
 * Order of operations (audit 2.4): ORACLE first -> PAYOUT -> ATOMIC state flip -> act -> notify.
 * Oracle errors are 502 (retryable). A FAIL is a real verdict and is recorded.
 *
 * Column names below follow the migrate scripts (snake_case). If your live schema
 * differs, adjust the two SELECT lists only — the logic stays identical.
 */
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const idemKey = req.headers.get("Idempotency-Key");
  const { listingId, imageUrl } = await req.json();
  if (!listingId || !imageUrl) {
    return NextResponse.json({ error: "listingId and imageUrl required" }, { status: 400 });
  }
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  const { replay } = await beginIdempotent(idemKey, "bounty_verify", { listingId });
  if (replay) return NextResponse.json(replay);

  const rows = await sql`SELECT * FROM listings WHERE id = ${listingId} LIMIT 1`;
  const l = rows[0] as Record<string, unknown> | undefined;
  if (!l) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (!l.is_active) return NextResponse.json({ error: "Bounty already completed" }, { status: 409 });

  if (String(l.owner) === address) {
    return NextResponse.json({ error: "You cannot win your own bounty" }, { status: 403 });
  }
  const contract = (l.contract ?? {}) as { criteria?: string };
  const amountNIM = Number(l.collateral_nim ?? l.collateralNIM ?? 0);

  // 1. Oracle — criteria go in verbatim. Errors are retryable, not verdicts.
  let verdict;
  try {
    verdict = await verifyBountyPhoto(String(l.title), String(contract.criteria ?? l.description ?? ""), imageUrl);
  } catch (e) {
    if (e instanceof OracleError) {
      return NextResponse.json({ error: e.message, retryable: true }, { status: 502 });
    }
    throw e;
  }

  if (!verdict.pass) {
    try {
      await sql`UPDATE escrows SET progress = 'awaiting_proof' WHERE listing_id = ${listingId} AND completer = ${address} AND state = 'locked'`;
    } catch { /* no escrow row — verdict still stands */ }
    return NextResponse.json({ pass: false, reason: verdict.reason, model: process.env.VISION_MODEL });
  }

  // 2. Payout first — money moves before any state claims it moved.
  const feeNIM = SETTLE_FEE_NIM;
  const txHash = await executeVaultPayout(address, amountNIM - feeNIM, feeNIM, `Acta: AI Vision reward for "${String(l.title)}"`);

  // 3. Atomic transitions. Listing flip is authoritative (bounties are funded
  // via the listing lock); the per-completer escrow row is best-effort.
  try {
    await sql`
      UPDATE escrows SET state = 'released', progress = 'verified', tx_hash_out = ${txHash}
      WHERE listing_id = ${listingId} AND completer = ${address} AND state = 'locked'
    `;
  } catch { /* no escrow row for direct listing locks — listing flip below still settles */ }
  const listingRows = await sql`UPDATE listings SET is_active = FALSE, state = 'complete' WHERE id = ${listingId} AND is_active = TRUE RETURNING id`;
  if (listingRows.length === 0) {
    return NextResponse.json({ pass: true, reason: verdict.reason, txHash, note: "already settled" });
  }

  // 4. Act + trust + notifications.
  const actId = crypto.randomUUID();
  await sql`
    INSERT INTO acts (id, actor_address, type, oracle, listing_id, amount_nim, fee_nim, proof_json, tx_hash_out, created_at, settled_at)
    VALUES (${actId}, ${address}, 'bounty', 'vision', ${listingId}, ${amountNIM}, ${feeNIM},
            ${JSON.stringify({ verdict: { reason: verdict.reason }, criteria: contract.criteria ?? null })},
            ${txHash}, ${Date.now()}, ${Date.now()})
  `;
  try {
    const { computeAndUpdateTrustScore } = await import("@/lib/trust");
    await computeAndUpdateTrustScore(address);
  } catch { /* trust update is best-effort, never blocks a settlement */ }
  // This route settles outside settleAct — fire the same post-settlement drips.
  const { awardRecurring } = await import("@/lib/milestones");
  awardRecurring(address, "settle").catch(() => {});
  awardRecurring(address, "bounty").catch(() => {});
  const { settleReferralReward } = await import("@/lib/settle");
  settleReferralReward(address).catch((e) => console.error("referral drip failed:", e));

  await notify(address, "payout", "Bounty settled",
    `${amountNIM.toLocaleString()} NIM paid out. The oracle agreed: "${verdict.reason}"`,
    `https://www.nimiqwatch.com/transaction/${txHash}`);
  await notify(String(l.owner), "released", "Your bounty was completed",
    `"${String(l.title)}" was verified by the AI oracle and paid from the vault.`);

  return NextResponse.json({ pass: true, reason: verdict.reason, txHash, amountNIM, feeNIM });
}
