import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, getSql, hasDb } from "@/lib/db";
import { newId } from "@/lib/escrow";

// Completer-side: stores a Venture proof for creator review.
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const { listingId, proof } = (await req.json()) as { listingId?: string; proof?: string };
  if (!listingId || !proof || proof.trim().length < 3) {
    return NextResponse.json({ error: "listingId and proof required" }, { status: 400 });
  }
  if (proof.length > 2000) {
    return NextResponse.json({ error: "Proof too long (2KB cap)" }, { status: 413 });
  }

  const listing = await fetchListing(listingId);
  if (!listing || listing.kind !== "bounty_venture" || !listing.isActive) {
    return NextResponse.json({ error: "Invalid or inactive Venture bounty" }, { status: 400 });
  }

  const sql = getSql()!;
  // One pending submission per completer per bounty.
  await sql`
    INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status)
    VALUES (${newId("vs")}, ${listingId}, ${address}, ${proof.trim()}, ${Date.now()}, 'pending')
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

// Creator-side: lists pending submissions for listings they own.
export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ submissions: [] });

  const sql = getSql()!;
  const rows = await sql`
    SELECT s.id, s.listing_id, s.completer, s.proof, s.created_at, l.title
    FROM venture_submissions s
    JOIN listings l ON l.id = s.listing_id
    WHERE l.owner = ${address} AND s.status = 'pending'
    ORDER BY s.created_at DESC
    LIMIT 50
  `;
  return NextResponse.json({
    submissions: rows.map((r: any) => ({
      id: r.id,
      listingId: r.listing_id,
      completer: r.completer,
      proof: r.proof,
      title: r.title,
      createdAt: Number(r.created_at),
    })),
  });
}
