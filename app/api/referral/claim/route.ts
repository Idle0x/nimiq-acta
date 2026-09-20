import { NextResponse } from "next/server";
import { getSql, ensureDbSchema, getMemStore } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { rewardReferralPair } from "@/lib/settle";

export async function POST(req: Request) {
  let address = await getSessionAddress();
  let code: string | undefined;

  try {
    const body = await req.json();
    if (!address && body.address) address = String(body.address);
    if (body.code) code = String(body.code).trim();
  } catch {
    // ignore parse error
  }

  if (!address) {
    return NextResponse.json({ error: "Not authenticated. Please connect your wallet first." }, { status: 401 });
  }

  if (!code) {
    return NextResponse.json({ error: "Referral code is required." }, { status: 400 });
  }

  const sql = getSql();

  if (!sql) {
    const { memReferrals, memReferralSettlements } = getMemStore();
    // Case-insensitive match on code
    let referral: { id: string; referrer: string; code: string; createdAt: number } | undefined;
    for (const r of memReferrals.values()) {
      if (r.code.toLowerCase() === code.toLowerCase()) {
        referral = r;
        break;
      }
    }

    if (!referral) {
      return NextResponse.json({ error: "Invalid referral code. Please check and try again." }, { status: 404 });
    }

    if (referral.referrer.toLowerCase() === address.toLowerCase()) {
      return NextResponse.json({ error: "You cannot claim your own referral code." }, { status: 400 });
    }

    if (memReferralSettlements.has(address)) {
      return NextResponse.json({ error: "You have already claimed a referral bonus." }, { status: 400 });
    }

    memReferralSettlements.set(address, {
      referralId: referral.id,
      referee: address,
      settledAt: Date.now(),
    });

    const result = await rewardReferralPair(referral.id, referral.referrer, address);
    return NextResponse.json({
      ok: true,
      rewardNIM: 10,
      referrer: referral.referrer,
      paidReferrer: result.paidReferrer,
      paidReferee: result.paidReferee,
      message: "10 NIM referral reward successfully granted to both you and your friend!",
    });
  }

  try {
    await ensureDbSchema();
    const rows = await sql`
      SELECT id, referrer, code FROM referrals 
      WHERE LOWER(code) = LOWER(${code}) 
      LIMIT 1
    `;
    const referral = rows[0] as { id: string; referrer: string; code: string } | undefined;

    if (!referral) {
      return NextResponse.json({ error: "Invalid referral code. Please check and try again." }, { status: 404 });
    }

    if (referral.referrer.toLowerCase() === address.toLowerCase()) {
      return NextResponse.json({ error: "You cannot claim your own referral code." }, { status: 400 });
    }

    // Check if already claimed
    const existingSettlement = await sql`
      SELECT referral_id FROM referral_settlements WHERE referee = ${address} LIMIT 1
    `;
    if (existingSettlement.length > 0) {
      return NextResponse.json({ error: "You have already claimed a referral bonus." }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO referral_settlements (referral_id, referee, settled_at)
      VALUES (${referral.id}, ${address}, ${Date.now()})
      ON CONFLICT (referee) DO NOTHING
      RETURNING referee
    `;

    if (inserted.length === 0) {
      return NextResponse.json({ error: "You have already claimed a referral bonus." }, { status: 400 });
    }

    // Immediately drip 10 NIM to both referrer and referee!
    const result = await rewardReferralPair(referral.id, referral.referrer, address);

    return NextResponse.json({
      ok: true,
      rewardNIM: 10,
      referrer: referral.referrer,
      paidReferrer: result.paidReferrer,
      paidReferee: result.paidReferee,
      message: "10 NIM referral reward successfully granted to both you and your friend!",
    });
  } catch (err: any) {
    console.error("Referral claim error:", err);
    return NextResponse.json({ error: "Failed to claim referral reward: " + (err?.message || "Internal error") }, { status: 500 });
  }
}
