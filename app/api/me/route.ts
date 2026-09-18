import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

function num(r: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = r[k];
    if (v !== null && v !== undefined && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = (await getSessionAddress()) || url.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  if (!sql) {
    const { getMemMe } = await import("@/lib/db");
    return NextResponse.json(getMemMe(address));
  }
  const now = Date.now();

  const [users, escrows, listings, acts, subs] = await Promise.all([
    sql`SELECT trust_score, joined_at FROM users WHERE address = ${address} LIMIT 1`,
    sql`SELECT * FROM escrows WHERE borrower = ${address} OR owner = ${address} OR completer = ${address} ORDER BY created_at DESC LIMIT 100`,
    sql`SELECT * FROM listings WHERE owner = ${address} ORDER BY created_at DESC LIMIT 100`,
    sql`SELECT * FROM acts WHERE actor_address = ${address} ORDER BY created_at DESC LIMIT 100`,
    sql`SELECT s.id, s.listing_id, s.completer, s.created_at, l.title FROM venture_submissions s JOIN listings l ON l.id = s.listing_id WHERE l.owner = ${address} AND s.status = 'pending'`,
  ]);

  const u = (users[0] ?? {}) as Record<string, unknown>;
  const es = escrows as unknown as Record<string, unknown>[];
  const ls = listings as unknown as Record<string, unknown>[];
  const ac = acts as unknown as Record<string, unknown>[];

  const escrowRow = (e: Record<string, unknown>) => ({
    id: e.id as string,
    listingId: e.listing_id ?? e.listingId,
    state: e.state,
    progress: (e.progress as string) ?? "awaiting_proof",
    amountNIM: num(e, "amount_nim", "amountNIM"),
    role: e.borrower === address ? "borrower" : e.completer === address ? "completer" : "counterparty",
    createdAt: Number(e.created_at ?? now),
    deadlineAt: e.deadline_at ? Number(e.deadline_at) : null,
    txIn: e.tx_hash_in ?? e.txHash ?? null,
    txOut: e.tx_hash_out ?? null,
  });

  const inProgress = es.filter((e) => e.state === "locked").map(escrowRow);
  const settled = es.filter((e) => e.state === "released").map(escrowRow);
  const refunded = es.filter((e) => e.state === "refunded" || e.state === "expired").map(escrowRow);

  const listRow = (l: Record<string, unknown>) => ({
    id: l.id as string,
    title: l.title,
    kind: l.kind,
    collateralNIM: num(l, "collateral_nim", "collateralNIM"),
    state: l.state ?? (l.is_active ? "open" : "complete"),
    createdAt: Number(l.created_at ?? now),
    expiresAt: l.expires_at ? Number(l.expires_at) : null,
  });
  const myActive = ls.filter((l) => l.is_active && (!l.expires_at || Number(l.expires_at) > now)).map(listRow);
  const myExpired = ls.filter((l) => l.is_active && l.expires_at && Number(l.expires_at) <= now).map(listRow);
  const myPast = ls.filter((l) => !l.is_active).map(listRow);

  // rolling 7-day streak from SETTLED acts only (not logins — that clones Duolingo)
  const day = 24 * 3600 * 1000;
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = now - (6 - i) * day;
    return {
      day: start,
      settled: ac.filter((a) => Number(a.created_at) >= start && Number(a.created_at) < start + day).length,
    };
  });

  return NextResponse.json({
    address,
    trustScore: num(u, "trust_score", "trustScore"),
    joinedAt: u.joined_at ? Number(u.joined_at) : null,
    streak: { current: week.filter((d) => d.settled > 0).length, week },
    escrows: { inProgress, awaitingMe: subs as unknown[], settled, refunded },
    listings: { active: myActive, expired: myExpired, past: myPast },
    acts: ac.slice(0, 20).map((a) => ({
      id: a.id, type: a.type, oracle: a.oracle,
      amountNIM: num(a, "amount_nim", "amountNIM"),
      txHash: a.tx_hash_out ?? a.txHash ?? null,
      createdAt: Number(a.created_at),
    })),
    totals: {
      settledCount: ac.length,
      settledVolume: ac.reduce((s, a) => s + num(a, "amount_nim", "amountNIM"), 0),
    },
  });
}
