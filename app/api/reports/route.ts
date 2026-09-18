import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

const REASONS = ["scam", "unfunded", "abusive", "miscategorized", "other"] as const;

// Flag-for-review: anyone signed in may report any listing once.
// Reports never mutate the listing — they land in the review queue.
// (Abuse answer: reputation + review, never third-party deletion.)

/** Submit a report. Idempotent per (listing, reporter). */
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
  let body: { listingId?: string; reason?: string; detail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { listingId, reason, detail } = body;
  if (!listingId || !reason || !(REASONS as readonly string[]).includes(reason)) {
    return NextResponse.json({ error: `listingId and reason (${REASONS.join("|")}) required` }, { status: 400 });
  }
  if (detail && detail.length > 500) {
    return NextResponse.json({ error: "detail ≤ 500 chars" }, { status: 400 });
  }
  const exists = await sql`SELECT id FROM listings WHERE id = ${listingId} LIMIT 1`;
  if (exists.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (typeof detail === "string" && detail.trim()) {
    await sql`
      INSERT INTO reports (id, listing_id, reporter, reason, detail, created_at)
      VALUES (${crypto.randomUUID()}, ${listingId}, ${address}, ${reason}, ${detail.trim()}, ${Date.now()})
      ON CONFLICT (listing_id, reporter) DO UPDATE SET reason = EXCLUDED.reason, detail = EXCLUDED.detail, created_at = EXCLUDED.created_at
    `;
  } else {
    await sql`
      INSERT INTO reports (id, listing_id, reporter, reason, detail, created_at)
      VALUES (${crypto.randomUUID()}, ${listingId}, ${address}, ${reason}, NULL, ${Date.now()})
      ON CONFLICT (listing_id, reporter) DO NOTHING
    `;
  }
  return NextResponse.json({ ok: true });
}

/** Report count for a listing (shown to its sponsor) + own report status for the viewer. */
export async function GET(req: Request) {
  const address = await getSessionAddress();
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });
  const [countRows, mineRows] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM reports WHERE listing_id = ${listingId}`,
    address
      ? sql`SELECT reason FROM reports WHERE listing_id = ${listingId} AND reporter = ${address} LIMIT 1`
      : Promise.resolve([] as unknown[]),
  ]);
  const recent = await sql`SELECT reason, created_at FROM reports WHERE listing_id = ${listingId} ORDER BY created_at DESC LIMIT 10`;
  const breakdown: Record<string, number> = {};
  for (const r of recent as unknown as Record<string, unknown>[]) {
    const k = String(r.reason ?? "other");
    breakdown[k] = (breakdown[k] ?? 0) + 1;
  }
  return NextResponse.json({
    count: Number((countRows[0] as any)?.n ?? 0),
    mine: (mineRows[0] as any)?.reason ?? null,
    breakdown,
  });
}
