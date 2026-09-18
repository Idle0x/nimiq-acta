import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

function buildLink(req: Request, code: string) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/?ref=${code}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = (await getSessionAddress()) || url.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  if (!sql) {
    const { getMemStore } = await import("@/lib/db");
    const { memReferrals } = getMemStore();
    const existing = memReferrals.get(address);
    const code = existing?.code ?? `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}7a`;
    return NextResponse.json({ code, link: buildLink(req, code) });
  }
  const rows = await sql`SELECT code FROM referrals WHERE referrer = ${address} LIMIT 1`;
  const code = (rows[0]?.code as string) ?? null;
  return NextResponse.json({ code, link: code ? buildLink(req, code) : null });
}

export async function POST(req: Request) {
  let address = await getSessionAddress();
  if (!address) {
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body?.address && typeof body.address === "string") address = body.address;
    } catch { /* ignore */ }
  }
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();

  if (!sql) {
    const { getMemStore } = await import("@/lib/db");
    const { memReferrals } = getMemStore();
    let existing = memReferrals.get(address);
    if (!existing) {
      const code = `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}${crypto.randomBytes(2).toString("hex")}`;
      existing = { id: crypto.randomUUID(), referrer: address, code, createdAt: Date.now() };
      memReferrals.set(address, existing);
    }
    return NextResponse.json({ code: existing.code, link: buildLink(req, existing.code) });
  }

  const existing = await sql`SELECT code FROM referrals WHERE referrer = ${address} LIMIT 1`;
  let code = existing[0]?.code as string | undefined;
  if (!code) {
    code = `${address.replace(/[^A-Z0-9]/gi, "").slice(2, 8)}${crypto.randomBytes(2).toString("hex")}`;
    await sql`INSERT INTO referrals (id, referrer, code, created_at) VALUES (${crypto.randomUUID()}, ${address}, ${code}, ${Date.now()})`;
  }
  return NextResponse.json({ code, link: buildLink(req, code) });
}
