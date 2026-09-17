import { getSql } from "./db";

// NOTE: also replace `ensureUser` in lib/db.ts with the upsert version at
// the bottom of this file — first-time users currently never get a row,
// so their trust score never persists.

export async function computeAndUpdateTrustScore(address: string): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;

  try {
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

    if (!actStats || actStats.length === 0 || Number(actStats[0].total_acts) === 0) {
      return 0;
    }

    const stats = actStats[0] as any;
    const totalActs = Number(stats.total_acts);
    const settledActs = Number(stats.settled_acts);
    const volumeNim = Number(stats.total_volume_nim);
    const distinctOracles = Number(stats.distinct_oracles);
    const firstActTime = Number(stats.first_act_time);

    const completionPoints = (settledActs / totalActs) * 35;
    const volumePoints = Math.min(25, (Math.log10(volumeNim + 1) / 5) * 25);
    const daysSinceFirstAct = (Date.now() - firstActTime) / (1000 * 60 * 60 * 24);
    const tenurePoints = Math.min(20, (daysSinceFirstAct / 90) * 20);
    const diversityPoints = Math.min(10, (distinctOracles / 5) * 10);

    const communityStats = await sql`
      SELECT COUNT(DISTINCT e.id) as community_acts
      FROM escrows e
      JOIN listings l ON e.listing_id = l.id
      WHERE l.owner = ${address} AND e.state = 'released'
    `;
    const communityActs = Number((communityStats[0] as any).community_acts || 0);
    const communityPoints = Math.min(10, (communityActs / 10) * 10);

    const finalScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(completionPoints + volumePoints + tenurePoints + diversityPoints + communityPoints)
      )
    );

    // Upsert, not bare UPDATE — the row may not exist yet.
    await sql`
      INSERT INTO users (address, trust_score, total_volume_nim, items_completed, joined_at)
      VALUES (${address}, ${finalScore}, ${volumeNim}, ${settledActs}, ${Date.now()})
      ON CONFLICT (address) DO UPDATE SET
        trust_score = EXCLUDED.trust_score,
        total_volume_nim = EXCLUDED.total_volume_nim,
        items_completed = EXCLUDED.items_completed
    `;

    return finalScore;
  } catch (e) {
    console.error("Failed to compute trust score:", e);
    return 0;
  }
}
