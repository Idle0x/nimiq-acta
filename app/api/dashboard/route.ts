import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { fetchNimUsd } from "@/lib/price";
import { getSessionAddress } from "@/lib/session";
import { ESCROW_VAULT } from "@/lib/escrow";

export const dynamic = "force-dynamic";

// Real on-chain vault balance — the treasury card reconciles with the
// chain directly via getAccountByAddress.
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = (await getSessionAddress()) || url.searchParams.get("address");
  const price = await fetchNimUsd();
  const vaultBalanceNIM = await fetchVaultBalanceLunas().then(
    (l) => (l == null ? 0 : l / 100_000)
  );

  if (!hasDb()) {
    const { getMemStore } = await import("@/lib/db");
    const { memListings, memEscrows, memActs, memUsers } = getMemStore();
    const tvl = memEscrows.filter(e => e.state === 'locked' || (e as any).state === 'settling').reduce((s, e) => s + e.amountNIM, 0)
      + memListings.filter(l => l.isActive && l.kind.startsWith("bounty")).reduce((s, l) => s + l.collateralNIM, 0);
    const volume30d = memActs.filter(a => a.settledAt && a.settledAt > Date.now() - 2592000000).reduce((s, a) => s + a.amountNIM, 0);
    const escrows7d = memActs.filter(a => a.createdAt > Date.now() - 604800000).length;
    const escrows30d = memActs.filter(a => a.createdAt > Date.now() - 2592000000).length;
    const treasuryFees = memActs.reduce((s, a) => s + (a.feeNIM || 0), 0);
    const treasuryDistr = memActs.filter(a => a.type === 'milestone' || a.type === 'referral').reduce((s, a) => s + a.amountNIM, 0);
    const leaderboard = Array.from(memUsers.values()).map(u => ({ address: u.address, trustScore: u.trustScore, itemsCompleted: u.itemsCompleted }));
    const feed = memActs.map(a => ({
      id: a.id,
      actor: a.actorAddress,
      type: a.type,
      oracle: a.oracle,
      amountNIM: a.amountNIM,
      createdAt: a.createdAt,
      txHash: a.txHashOut || a.txHashIn || null,
      proofJson: a.proofJson,
    }));
    const memUser = address ? memUsers.get(address) : null;
    const userStats = memUser ? {
      trustScore: memUser.trustScore,
      totalVolumeNIM: memUser.totalVolumeNIM,
      itemsCompleted: memUser.itemsCompleted,
    } : null;

    return NextResponse.json({
      price,
      user: userStats,
      vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM },
      stats: {
        tvl_nim: tvl,
        volume_30d: volume30d,
        escrows_7d: escrows7d,
        escrows_30d: escrows30d,
        treasury_fees: treasuryFees,
        treasury_distributed: treasuryDistr,
      },
      leaderboard,
      feed,
    });
  }

  const sql = getSql()!;
  try {
    let userStats = null;
    if (address) {
      const userRes = await sql`
        SELECT trust_score, total_volume_nim, items_completed
        FROM users WHERE address = ${address}
      `;
      if (userRes.length > 0) {
        userStats = {
          trustScore: Number(userRes[0].trust_score ?? 0),
          totalVolumeNIM: Number(userRes[0].total_volume_nim ?? 0),
          itemsCompleted: Number(userRes[0].items_completed ?? 0),
        };
      } else {
        try {
          const { computeAndUpdateTrustScore } = await import("@/lib/trust");
          const score = await computeAndUpdateTrustScore(address);
          userStats = {
            trustScore: score,
            totalVolumeNIM: 0,
            itemsCompleted: 0,
          };
        } catch {
          userStats = { trustScore: 0, totalVolumeNIM: 0, itemsCompleted: 0 };
        }
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

    const liveLeaderboard = leaderboardRes.map((r: any) => ({
      address: r.address, trustScore: r.trust_score, itemsCompleted: r.items_completed,
    }));
    const liveFeed = feedRes.map((r: any) => ({
      id: r.id, actor: r.actor_address, type: r.type, oracle: r.oracle,
      amountNIM: r.amount_nim, createdAt: Number(r.created_at),
      txHash: r.tx_hash_out, proofJson: r.proof_json,
    }));

    return NextResponse.json({
      price,
      user: userStats,
      vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM },
      stats: {
        tvl_nim: Number(tvlEscrowRes[0].tvl) + Number(tvlListingRes[0].tvl) || 0,
        volume_30d: Number(vol30dRes[0].vol) || 0,
        escrows_7d: Number(esc7dRes[0].count) || 0,
        escrows_30d: Number(esc30dRes[0].count) || 0,
        treasury_fees: Number(feesRes[0].fees) || 0,
        treasury_distributed: Number(distrRes[0].distr) || 0,
      },
      leaderboard: liveLeaderboard,
      feed: liveFeed,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price, vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM }, error: "Stats query failed" }, { status: 500 });
  }
}
