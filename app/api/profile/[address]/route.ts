import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ address: string }> }) {
  const { address } = await ctx.params;
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  const [users, acts] = await Promise.all([
    sql`SELECT trust_score, joined_at FROM users WHERE address = ${address} LIMIT 1`,
    sql`SELECT id, type, oracle, amount_nim, created_at FROM acts WHERE actor_address = ${address} ORDER BY created_at DESC LIMIT 12`,
  ]);
  const u = (users[0] ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => { const n = Number(v); return Number.isNaN(n) ? 0 : n; };

  return NextResponse.json({
    address,
    trustScore: num(u.trust_score ?? u.trustScore),
    joinedAt: u.joined_at ? Number(u.joined_at) : null,
    actsCount: (acts as unknown[]).length,
    settledVolume: (acts as unknown as Record<string, unknown>[]).reduce(
      (s, a) => s + num(a.amount_nim ?? a.amountNIM), 0),
    recentActs: (acts as unknown as Record<string, unknown>[]).map((a) => ({
      id: a.id, type: a.type, oracle: a.oracle,
      amountNIM: num(a.amount_nim ?? a.amountNIM),
      createdAt: Number(a.created_at),
    })),
  });
}
