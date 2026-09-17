import { getSql } from "./db";
import { executeVaultPayout } from "./backend-nimiq";
import { newId } from "./escrow";
import { insertAct } from "./db";

// Normalized rewards as requested by user (scaled down x100)
export const MILESTONES = {
  FIRST_CONNECTION: { id: "ms_first_conn", rewardNIM: 10 },
  FIRST_LOCKED: { id: "ms_first_lock", rewardNIM: 0.15 },
  FIRST_SETTLED: { id: "ms_first_settle", rewardNIM: 0.25 },
  FIRST_BOUNTY: { id: "ms_first_bounty", rewardNIM: 0.25 },
  FIRST_LISTING: { id: "ms_first_listing", rewardNIM: 0.2 },
};

export async function checkAndAwardMilestone(address: string, milestoneKey: keyof typeof MILESTONES) {
  const sql = getSql();
  if (!sql) return;
  
  const milestone = MILESTONES[milestoneKey];
  
  // Check if this milestone has already been awarded to this address
  const existing = await sql`
    SELECT id FROM acts 
    WHERE actor_address = ${address} AND type = 'milestone' AND proof_json->>'milestone_id' = ${milestone.id}
    LIMIT 1
  `;
  if (existing.length > 0) return; // Already awarded

  try {
    // Attempt payout
    const txHashOut = await executeVaultPayout(address, milestone.rewardNIM, 0.0001); // 0 fee for treasury payouts? Or minimal fee 0.0001
    // We can use 0 for fee if vault covers it entirely, or 0.5 minimum if network demands. executeVaultPayout defaults to 0.5 fee, so reward must be greater.
    // Wait, if reward is 0.1 and fee is 0.5, we can't send!
    // Actually, executeVaultPayout takes (amount, fee). So total deducted from Vault is amount + fee. The user receives amount.
    
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "milestone",
      oracle: "system",
      amountNIM: milestone.rewardNIM,
      feeNIM: 0,
      proofJson: { milestone_id: milestone.id },
      txHashOut,
      createdAt: Date.now(),
      settledAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to award milestone:", err);
  }
}
