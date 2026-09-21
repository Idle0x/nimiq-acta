import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSql, ensureDbSchema, getMemStore } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

function buildLink(req: Request, code: string) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/?ref=${code}`;
}

export async function GET(req: Request) {
  let address = await getSessionAddress();
  if (!address) {
    const url = new URL(req.url);
    const queryAddr = url.searchParams.get("address");
    if (queryAddr) address = queryAddr;
  }
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sql = getSql();
  if (!sql) {
    const { memReferrals, memReferralSettlements, memUsers } = getMemStore();
    const existing = memReferrals.get(address);
    const code = existing?.code ?? `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}7a`;
    let count = 0;
    const referredUsers: Array<{
      referee: string;
      settledAt: number;
      trustScore: number;
      itemsCompleted: number;
    }> = [];
    if (existing) {
      for (const s of memReferralSettlements.values()) {
        if (s.referralId === existing.id) {
          count++;
          const u = memUsers?.get(s.referee);
          referredUsers.push({
            referee: s.referee,
            settledAt: s.settledAt,
            trustScore: u?.trustScore ?? 0,
            itemsCompleted: u?.itemsCompleted ?? 0,
          });
        }
      }
      referredUsers.sort((a, b) => b.settledAt - a.settledAt);
    }
    const alreadyClaimed = memReferralSettlements.has(address);
    return NextResponse.json({
      code,
      link: buildLink(req, code),
      count,
      earnedNIM: count * 10,
      alreadyClaimed,
      referredUsers,
    });
  }

  try {
    await ensureDbSchema();
    const refRows = await sql`SELECT id, code FROM referrals WHERE referrer = ${address} LIMIT 1`;
    const referralId = refRows[0]?.id as string | undefined;
    const code = (refRows[0]?.code as string) ?? null;

    let count = 0;
    let referredUsers: Array<{
      referee: string;
      settledAt: number;
      trustScore: number;
      itemsCompleted: number;
    }> = [];
    if (referralId) {
      const rows = await sql`
        SELECT 
          rs.referee, 
          rs.settled_at,
          COALESCE(u.trust_score, 0) AS trust_score,
          COALESCE(u.items_completed, 0) AS items_completed
        FROM referral_settlements rs
        LEFT JOIN users u ON u.address = rs.referee
        WHERE rs.referral_id = ${referralId}
        ORDER BY rs.settled_at DESC
      `;
      count = rows.length;
      referredUsers = rows.map((r: any) => ({
        referee: r.referee as string,
        settledAt: Number(r.settled_at),
        trustScore: Number(r.trust_score ?? 0),
        itemsCompleted: Number(r.items_completed ?? 0),
      }));
    }

    const claimedRes = await sql`
      SELECT rs.settled_at, r.code AS referrer_code
      FROM referral_settlements rs
      JOIN referrals r ON r.id = rs.referral_id
      WHERE rs.referee = ${address}
      LIMIT 1
    `;
    const alreadyClaimed = claimedRes.length > 0;
    const claimedReferrerCode = (claimedRes[0]?.referrer_code as string) ?? null;

    return NextResponse.json({
      code,
      link: code ? buildLink(req, code) : null,
      count,
      earnedNIM: count * 10,
      alreadyClaimed,
      claimedReferrerCode,
      referredUsers,
    });
  } catch (err) {
    console.error("Referral GET error:", err);
    return NextResponse.json({ error: "Referral lookup failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();

  if (!sql) {
    const { memReferrals, memReferralSettlements, memUsers } = getMemStore();
    let existing = memReferrals.get(address);
    if (!existing) {
      const code = `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}${crypto.randomBytes(2).toString("hex")}`.toUpperCase();
      existing = { id: crypto.randomUUID(), referrer: address, code, createdAt: Date.now() };
      memReferrals.set(address, existing);
    }
    let count = 0;
    const referredUsers: Array<{
      referee: string;
      settledAt: number;
      trustScore: number;
      itemsCompleted: number;
    }> = [];
    for (const s of memReferralSettlements.values()) {
      if (s.referralId === existing.id) {
        count++;
        const u = memUsers?.get(s.referee);
        referredUsers.push({
          referee: s.referee,
          settledAt: s.settledAt,
          trustScore: u?.trustScore ?? 0,
          itemsCompleted: u?.itemsCompleted ?? 0,
        });
      }
    }
    referredUsers.sort((a, b) => b.settledAt - a.settledAt);
    return NextResponse.json({
      code: existing.code,
      link: buildLink(req, existing.code),
      count,
      earnedNIM: count * 10,
      alreadyClaimed: memReferralSettlements.has(address),
      referredUsers,
    });
  }

  try {
    await ensureDbSchema();
    const existing = await sql`SELECT id, code FROM referrals WHERE referrer = ${address} LIMIT 1`;
    let referralId = existing[0]?.id as string | undefined;
    let code = existing[0]?.code as string | undefined;

    if (!code) {
      for (let attempt = 0; attempt < 5; attempt++) {
        code = `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}${crypto.randomBytes(2).toString("hex")}`.toUpperCase();
        referralId = crypto.randomUUID();
        try {
          await sql`INSERT INTO referrals (id, referrer, code, created_at) VALUES (${referralId}, ${address}, ${code}, ${Date.now()})`;
          break;
        } catch {
          code = undefined;
          const raced = await sql`SELECT id, code FROM referrals WHERE referrer = ${address} LIMIT 1`;
          if (raced[0]?.code) {
            code = raced[0].code as string;
            referralId = raced[0].id as string;
            break;
          }
          if (attempt === 4) throw new Error("Referral code collision");
        }
      }
    }
    if (!code) throw new Error("Referral code creation failed");

    let count = 0;
    let referredUsers: Array<{
      referee: string;
      settledAt: number;
      trustScore: number;
      itemsCompleted: number;
    }> = [];
    if (referralId) {
      const rows = await sql`
        SELECT 
          rs.referee, 
          rs.settled_at,
          COALESCE(u.trust_score, 0) AS trust_score,
          COALESCE(u.items_completed, 0) AS items_completed
        FROM referral_settlements rs
        LEFT JOIN users u ON u.address = rs.referee
        WHERE rs.referral_id = ${referralId}
        ORDER BY rs.settled_at DESC
      `;
      count = rows.length;
      referredUsers = rows.map((r: any) => ({
        referee: r.referee as string,
        settledAt: Number(r.settled_at),
        trustScore: Number(r.trust_score ?? 0),
        itemsCompleted: Number(r.items_completed ?? 0),
      }));
    }

    const claimedRes = await sql`
      SELECT rs.settled_at, r.code AS referrer_code
      FROM referral_settlements rs
      JOIN referrals r ON r.id = rs.referral_id
      WHERE rs.referee = ${address}
      LIMIT 1
    `;

    return NextResponse.json({
      code,
      link: buildLink(req, code),
      count,
      earnedNIM: count * 10,
      alreadyClaimed: claimedRes.length > 0,
      claimedReferrerCode: (claimedRes[0]?.referrer_code as string) ?? null,
      referredUsers,
    });
  } catch (err) {
    console.error("Referral POST error:", err);
    return NextResponse.json({ error: "Referral creation failed" }, { status: 500 });
  }
}
