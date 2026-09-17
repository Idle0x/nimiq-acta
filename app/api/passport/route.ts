import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb()) return NextResponse.json({ error: "No DB connection" }, { status: 500 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB Error" }, { status: 500 });

  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Re-calculate or fetch Trust Breakdown logic natively here so we can return the breakdown
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
    const communityStats = await sql`
      SELECT COUNT(DISTINCT e.id) as community_acts
      FROM escrows e
      JOIN listings l ON e.listing_id = l.id
      WHERE l.owner = ${address} AND e.state = 'released'
    `;

    let breakdown = { completion: 0, volume: 0, tenure: 0, diversity: 0, community: 0, total: 0 };
    if (actStats && actStats.length > 0 && Number(actStats[0].total_acts) > 0) {
      const stats = actStats[0];
      const totalActs = Number(stats.total_acts);
      const settledActs = Number(stats.settled_acts);
      const volumeNim = Number(stats.total_volume_nim);
      const distinctOracles = Number(stats.distinct_oracles);
      const firstActTime = Number(stats.first_act_time);

      const completionRatio = totalActs > 0 ? settledActs / totalActs : 0;
      const completionPoints = completionRatio * 35;
      const volumeLog = Math.log10(volumeNim + 1);
      const volumePoints = Math.min(25, (volumeLog / 5) * 25);
      const daysSinceFirstAct = (Date.now() - firstActTime) / (1000 * 60 * 60 * 24);
      const tenurePoints = Math.min(20, (daysSinceFirstAct / 90) * 20);
      const diversityPoints = Math.min(10, (distinctOracles / 5) * 10);
      const communityActs = Number(communityStats[0]?.community_acts || 0);
      const communityPoints = Math.min(10, (communityActs / 10) * 10);

      breakdown = {
        completion: Math.round(completionPoints),
        volume: Math.round(volumePoints),
        tenure: Math.round(tenurePoints),
        diversity: Math.round(diversityPoints),
        community: Math.round(communityPoints),
        total: Math.max(0, Math.min(100, Math.round(completionPoints + volumePoints + tenurePoints + diversityPoints + communityPoints)))
      };
    }

    // 2. Fetch recent settled acts for stamps (last 6 distinct types/oracles to make stamps)
    const stampsRes = await sql`
      SELECT id, type, oracle, created_at, amount_nim 
      FROM acts 
      WHERE actor_address = ${address} AND settled_at IS NOT NULL
      ORDER BY settled_at DESC LIMIT 6
    `;
    
    // 3. Compute Streak (acts settled per day in last 7 days)
    const streakRes = await sql`
      SELECT COUNT(*) as count, date_trunc('day', to_timestamp(settled_at / 1000)) as day 
      FROM acts 
      WHERE actor_address = ${address} AND settled_at > (extract(epoch from now()) * 1000 - 604800000)
      GROUP BY day ORDER BY day DESC
    `;
    
    // 4. Milestones
    const milestonesRes = await sql`
      SELECT proof_json->>'milestone_id' as m_id, created_at
      FROM acts 
      WHERE actor_address = ${address} AND type = 'milestone'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      breakdown,
      stamps: stampsRes,
      streak: streakRes,
      milestones: milestonesRes
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch passport data" }, { status: 500 });
  }
}
