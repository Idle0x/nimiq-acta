import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { fetchNimUsd } from "@/lib/price";

export const dynamic = "force-dynamic";

export async function GET() {
  const price = await fetchNimUsd();
  
  if (!hasDb()) {
    return NextResponse.json({
      price,
      stats: { tvl_nim: 15000, volume_30d: 45000, escrows_7d: 12, escrows_30d: 48 },
      error: "No DB connection"
    });
  }

  const sql = getSql();
  if (!sql) return NextResponse.json({ price, stats: null });

  try {
    const [tvlRes, vol30dRes, esc7dRes, esc30dRes] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount_nim), 0) as tvl FROM escrows WHERE state = 'locked'`,
      sql`SELECT COALESCE(SUM(amount_nim), 0) as vol FROM escrows WHERE created_at > (extract(epoch from now()) * 1000 - 2592000000)`,
      sql`SELECT COUNT(*) as count FROM escrows WHERE created_at > (extract(epoch from now()) * 1000 - 604800000)`,
      sql`SELECT COUNT(*) as count FROM escrows WHERE created_at > (extract(epoch from now()) * 1000 - 2592000000)`
    ]);

    return NextResponse.json({
      price,
      stats: {
        tvl_nim: Number((tvlRes as any[])[0].tvl),
        volume_30d: Number((vol30dRes as any[])[0].vol),
        escrows_7d: Number((esc7dRes as any[])[0].count),
        escrows_30d: Number((esc30dRes as any[])[0].count)
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price, error: "Stats query failed" }, { status: 500 });
  }
}
