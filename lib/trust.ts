import { getSql } from "./db";

export async function computeAndUpdateTrustScore(address: string): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;

  try {
    // 1. Completion (settled acts / total acts entered, weighted)
    const actStats = await sql`
      SELECT 
        COUNT(*) as total_acts,
        SUM(CASE WHEN settled_at IS NOT NULL THEN 1 ELSE 0 END) as settled_acts,
        SUM(CASE WHEN settled_at IS NOT NULL THEN amount_nim ELSE 0 END) as total_volume_nim,
        MIN(created_at) as first_act_time,
        COUNT(DISTINCT oracle) as distinct_oracles
      FROM acts 
      WHERE actor_address = ${address}
    `;

    if (!actStats || actStats.length === 0 || actStats[0].total_acts == 0) {
      return 0;
    }

    const stats = actStats[0] as any;
    const totalActs = Number(stats.total_acts);
    const settledActs = Number(stats.settled_acts);
    const volumeNim = Number(stats.total_volume_nim);
    const distinctOracles = Number(stats.distinct_oracles);
    const firstActTime = Number(stats.first_act_time);

    // Completion score: up to 35 points
    const completionRatio = totalActs > 0 ? settledActs / totalActs : 0;
    const completionPoints = completionRatio * 35;

    // Volume score: log-scaled NIM settled, capped at 25 points. Let's say log10(100,000 NIM) = 5. So (log10(volume + 1) / 5) * 25
    const volumeLog = Math.log10(volumeNim + 1);
    const volumePoints = Math.min(25, (volumeLog / 5) * 25);

    // Tenure score: days since first act, capped at 90 days. 20 points max.
    const daysSinceFirstAct = (Date.now() - firstActTime) / (1000 * 60 * 60 * 24);
    const tenurePoints = Math.min(20, (daysSinceFirstAct / 90) * 20);

    // Diversity score: distinct oracle types used, 5 max. 10 points max.
    const diversityPoints = Math.min(10, (distinctOracles / 5) * 10);

    // Community score: created listings that settled (we skip referrals since not fully implemented yet)
    // For now, we'll check how many listings created by this user resulted in an escrow that was released.
    const communityStats = await sql`
      SELECT COUNT(DISTINCT e.id) as community_acts
      FROM escrows e
      JOIN listings l ON e.listing_id = l.id
      WHERE l.owner = ${address} AND e.state = 'released'
    `;
    const communityActs = Number((communityStats[0] as any).community_acts || 0);
    const communityPoints = Math.min(10, (communityActs / 10) * 10);

    const totalScore = Math.round(completionPoints + volumePoints + tenurePoints + diversityPoints + communityPoints);
    const finalScore = Math.max(0, Math.min(100, totalScore));

    // Update the database
    await sql`
      UPDATE users 
      SET trust_score = ${finalScore}, total_volume_nim = ${volumeNim}, items_completed = ${settledActs}
      WHERE address = ${address}
    `;

    return finalScore;
  } catch (e) {
    console.error("Failed to compute trust score:", e);
    return 0;
  }
}
