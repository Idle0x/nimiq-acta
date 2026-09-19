import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSql, ensureDbSchema, getMemStore } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

function buildLink(req: Request, code: string) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/?ref=${code}`;
}

export async function GET(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  if (!sql) {
    const { memReferrals } = getMemStore();
    const existing = memReferrals.get(address);
    const code = existing?.code ?? `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}7a`;
    return NextResponse.json({ code, link: buildLink(req, code) });
  }
  try {
    await ensureDbSchema();
    const rows = await sql`SELECT code FROM referrals WHERE referrer = ${address} LIMIT 1`;
    const code = (rows[0]?.code as string) ?? null;
    return NextResponse.json({ code, link: code ? buildLink(req, code) : null });
  } catch (err) {
    console.error("Referral GET error:", err);
    return NextResponse.json({ error: "Referral lookup failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Session-only (see check-in). The code below persists; on DB error we 500
  // instead of returning an unpersisted code that silently eats referrals.
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();

  if (!sql) {
    const { memReferrals } = getMemStore();
    let existing = memReferrals.get(address);
    if (!existing) {
      const code = `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}${crypto.randomBytes(2).toString("hex")}`;
      existing = { id: crypto.randomUUID(), referrer: address, code, createdAt: Date.now() };
      memReferrals.set(address, existing);
    }
    return NextResponse.json({ code: existing.code, link: buildLink(req, existing.code) });
  }

  try {
    await ensureDbSchema();
    const existing = await sql`SELECT code FROM referrals WHERE referrer = ${address} LIMIT 1`;
    let code = existing[0]?.code as string | undefined;
    if (!code) {
      // 2 random bytes collide eventually — retry instead of 500ing.
      for (let attempt = 0; attempt < 5; attempt++) {
        code = `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}${crypto.randomBytes(2).toString("hex")}`;
        try {
          await sql`INSERT INTO referrals (id, referrer, code, created_at) VALUES (${crypto.randomUUID()}, ${address}, ${code}, ${Date.now()})`;
          break;
        } catch {
          code = undefined;
          const raced = await sql`SELECT code FROM referrals WHERE referrer = ${address} LIMIT 1`;
          if (raced[0]?.code) {
            code = raced[0].code as string;
            break;
          }
          if (attempt === 4) throw new Error("Referral code collision");
        }
      }
    }
    if (!code) throw new Error("Referral code creation failed");
    return NextResponse.json({ code, link: buildLink(req, code) });
  } catch (err) {
    console.error("Referral POST error:", err);
    return NextResponse.json({ error: "Referral creation failed" }, { status: 500 });
  }
}
