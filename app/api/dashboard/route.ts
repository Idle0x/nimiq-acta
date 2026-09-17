import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { fetchNimUsd } from "@/lib/price";
import { getSessionAddress } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const price = await fetchNimUsd();
  
  if (!hasDb()) {
    return NextResponse.json({
      price,
      stats: { tvl_nim: 15000, volume_30d: 45000, escrows_7d: 12, escrows_30d: 48 },
      leaderboard: [],
      feed: [],
      error: "No DB connection"
    });
  }

  const sql = getSql();
  if (!sql) return NextResponse.json({ price, stats: null });

  try {
    const address = await getSessionAddress();
    let userStats = null;
    
    if (address) {
      const userRes = await sql`SELECT trust_score, total_volume_nim, items_completed FROM users WHERE address = ${address}`;
      if (userRes && userRes.length > 0) {
        userStats = {
          trustScore: userRes[0].trust_score,
          totalVolumeNIM: userRes[0].total_volume_nim,
          itemsCompleted: userRes[0].items_completed
        };
      }
    }

    const [tvlRes, vol30dRes, esc7dRes, esc30dRes, leaderboardRes, feedRes] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount_nim), 0) as tvl FROM escrows WHERE state = 'locked'`,
      sql`SELECT COALESCE(SUM(amount_nim), 0) as vol FROM escrows WHERE created_at > (extract(epoch from now()) * 1000 - 2592000000)`,
      sql`SELECT COUNT(*) as count FROM escrows WHERE created_at > (extract(epoch from now()) * 1000 - 604800000)`,
      sql`SELECT COUNT(*) as count FROM escrows WHERE created_at > (extract(epoch from now()) * 1000 - 2592000000)`,
      sql`SELECT address, trust_score, items_completed FROM users ORDER BY trust_score DESC, items_completed DESC LIMIT 10`,
      sql`SELECT id, actor_address, type, oracle, amount_nim, created_at, tx_hash_out, proof_json FROM acts ORDER BY created_at DESC LIMIT 20`
    ]);

    return NextResponse.json({
      price,
      user: userStats,
      stats: {
        tvl_nim: Number((tvlRes as any[])[0].tvl),
        volume_30d: Number((vol30dRes as any[])[0].vol),
        escrows_7d: Number((esc7dRes as any[])[0].count),
        escrows_30d: Number((esc30dRes as any[])[0].count)
      },
      leaderboard: (leaderboardRes as any[]).map(r => ({
        address: r.address,
        trustScore: r.trust_score,
        itemsCompleted: r.items_completed
      })),
      feed: (feedRes as any[]).map(r => ({
        id: r.id,
        actor: r.actor_address,
        type: r.type,
        oracle: r.oracle,
        amountNIM: r.amount_nim,
        createdAt: Number(r.created_at),
        txHash: r.tx_hash_out,
        proofJson: r.proof_json
      }))
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price, error: "Stats query failed" }, { status: 500 });
  }
}
