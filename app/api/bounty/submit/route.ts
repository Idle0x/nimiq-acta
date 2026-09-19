import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { notify } from "@/lib/notify";

// Completer submits proof for a creator-verified (Venture/Request) challenge.
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { listingId, proof } = await req.json();
  if (!listingId || !proof || typeof proof !== "string" || proof.length > 2000) {
    return NextResponse.json({ error: "listingId and proof (≤2000 chars) required" }, { status: 400 });
  }
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
  const target = await sql`SELECT owner, kind, state FROM listings WHERE id = ${listingId} LIMIT 1`;
  if (target.length === 0) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  const tKind = String((target[0] as Record<string, unknown> | undefined)?.kind ?? "");
  if (tKind !== "bounty_venture" && tKind !== "bounty_manual") {
    return NextResponse.json({ error: "Text-proof submissions are only for creator-verified challenges" }, { status: 400 });
  }
  if (String((target[0] as Record<string, unknown> | undefined)?.owner) === address) {
    return NextResponse.json({ error: "You cannot submit to your own challenge" }, { status: 403 });
  }

  const id = crypto.randomUUID();
  const inserted = await sql`
    INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status)
    VALUES (${id}, ${listingId}, ${address}, ${proof}, ${Date.now()}, 'pending')
    ON CONFLICT (listing_id, completer, status) DO NOTHING
    RETURNING id
  `;
  if (inserted.length === 0) {
    return NextResponse.json({ error: "You already have a pending submission for this challenge" }, { status: 409 });
  }
  try {
    await sql`UPDATE escrows SET progress = 'submitted' WHERE listing_id = ${listingId} AND (borrower = ${address} OR completer = ${address}) AND state = 'locked'`;
  } catch { /* progress is informational */ }
  const listings = await sql`SELECT owner, title, contract FROM listings WHERE id = ${listingId} LIMIT 1`;
  const contract = ((listings[0] as any)?.contract ?? null) as {
    criteria?: string; ai?: { preScreen?: boolean };
  } | null;
  // AI pre-screen: recommends, never decides. Best-effort — submission always lands.
  let rec: { recommendation: string; confidence: number; reason: string } | null = null;
  if (contract?.ai?.preScreen !== false) {
    try {
      const { preScreenSubmission } = await import("@/lib/vision");
      const v = await preScreenSubmission(String(contract?.criteria ?? ""), proof);
      rec = { recommendation: v.recommendation, confidence: v.confidence, reason: v.reason };
      await sql`UPDATE venture_submissions SET recommendation = ${v.recommendation}, confidence = ${v.confidence}, reason = ${v.reason} WHERE id = ${id}`;
    } catch {
      // oracle offline — creator reviews unaided
    }
  }
  if (listings[0]) {
    await notify(listings[0].owner as string, "submission", "New submission awaiting approval",
      rec ? `Proof for "${listings[0].title}". AI recommends ${rec.recommendation} (${rec.confidence}%). Review in Active.`
          : `Someone submitted proof for "${listings[0].title}". Review it in Active → Awaiting approval.`,
      "/active");
  }
  return NextResponse.json({ ok: true, id, preScreen: rec });
}

// Creator views pending submissions for their listings.
export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ submissions: [] });
  const rows = await sql`
    SELECT s.id, s.listing_id, s.completer, s.proof, s.created_at,
           s.recommendation, s.confidence, s.reason, l.*
    FROM venture_submissions s
    JOIN listings l ON l.id = s.listing_id
    WHERE l.owner = ${address} AND s.status = 'pending'
    ORDER BY s.created_at DESC
  `;
  const submissions = rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    listingId: r.listing_id,
    completer: r.completer,
    proof: r.proof,
    recommendation: r.recommendation ?? null,
    confidence: r.confidence != null ? Number(r.confidence) : null,
    reason: r.reason ?? null,
    createdAt: Number(r.created_at),
    title: r.title,
    collateralNIM: Number((r.collateral_nim as number) ?? (r.collateralNIM as number) ?? 0),
  }));
  return NextResponse.json({ submissions });
}
