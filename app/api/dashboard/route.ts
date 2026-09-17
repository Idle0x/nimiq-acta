import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { fetchNimUsd } from "@/lib/price";
import { getSessionAddress } from "@/lib/session";
import { ESCROW_VAULT } from "@/lib/escrow";

export const dynamic = "force-dynamic";

// Real on-chain vault balance — the treasury card must reconcile with the
// chain, or it contradicts the product's entire thesis.
async function fetchVaultBalanceLunas(): Promise<number | null> {
  try {
    const res = await fetch(process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getAccountByAddress",
        params: [ESCROW_VAULT],
        id: 3,
      }),
      next: { revalidate: 30 },
    });
    const data = await res.json();
    const bal = data?.result?.data?.balance;
    if (bal == null) return null;
    return Number(bal); // lunas
  } catch {
    return null;
  }
}

export async function GET() {
  const price = await fetchNimUsd();
  const vaultBalanceNIM = await fetchVaultBalanceLunas().then(
    (l) => (l == null ? null : l / 100_000)
  );

  if (!hasDb()) {
    return NextResponse.json({
      price,
      vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM },
      stats: { tvl_nim: 0, volume_30d: 0, escrows_7d: 0, escrows_30d: 0, treasury_fees: 0, treasury_distributed: 0 },
      leaderboard: [],
      feed: [],
      error: "No DB connection",
    });
  }

  const sql = getSql()!;
  try {
    const address = await getSessionAddress();
    let userStats = null;
    if (address) {
      const userRes = await sql`
        SELECT trust_score, total_volume_nim, items_completed
        FROM users WHERE address = ${address}
      `;
      if (userRes.length > 0) {
        userStats = {
          trustScore: userRes[0].trust_score,
          totalVolumeNIM: userRes[0].total_volume_nim,
          itemsCompleted: userRes[0].items_completed,
        };
      }
    }

    const [
      tvlEscrowRes, tvlListingRes, vol30dRes,
      esc7dRes, esc30dRes, leaderboardRes, feedRes,
      feesRes, distrRes,
    ] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount_nim), 0) as tvl FROM escrows WHERE state IN ('locked','settling')`,
      sql`SELECT COALESCE(SUM(collateral_nim), 0) as tvl FROM listings WHERE state = 'open' AND kind LIKE 'bounty%'`,
      sql`SELECT COALESCE(SUM(amount_nim), 0) as vol FROM acts WHERE settled_at IS NOT NULL AND settled_at > ${Date.now() - 2592000000}`,
      sql`SELECT COUNT(*) as count FROM acts WHERE created_at > ${Date.now() - 604800000}`,
      sql`SELECT COUNT(*) as count FROM acts WHERE created_at > ${Date.now() - 2592000000}`,
      sql`SELECT address, trust_score, items_completed FROM users ORDER BY trust_score DESC, items_completed DESC LIMIT 10`,
      sql`SELECT id, actor_address, type, oracle, amount_nim, created_at, tx_hash_out, proof_json FROM acts ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT COALESCE(SUM(fee_nim), 0) as fees FROM acts WHERE settled_at IS NOT NULL`,
      sql`SELECT COALESCE(SUM(amount_nim), 0) as distr FROM acts WHERE type IN ('milestone','referral') AND settled_at IS NOT NULL`,
    ]);

    return NextResponse.json({
      price,
      user: userStats,
      vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM },
      stats: {
        tvl_nim: Number(tvlEscrowRes[0].tvl) + Number(tvlListingRes[0].tvl),
        volume_30d: Number(vol30dRes[0].vol),
        escrows_7d: Number(esc7dRes[0].count),
        escrows_30d: Number(esc30dRes[0].count),
        treasury_fees: Number(feesRes[0].fees),
        treasury_distributed: Number(distrRes[0].distr),
      },
      leaderboard: leaderboardRes.map((r: any) => ({
        address: r.address, trustScore: r.trust_score, itemsCompleted: r.items_completed,
      })),
      feed: feedRes.map((r: any) => ({
        id: r.id, actor: r.actor_address, type: r.type, oracle: r.oracle,
        amountNIM: r.amount_nim, createdAt: Number(r.created_at),
        txHash: r.tx_hash_out, proofJson: r.proof_json,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price, vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM }, error: "Stats query failed" }, { status: 500 });
  }
}
