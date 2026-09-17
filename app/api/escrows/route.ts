import { NextResponse } from "next/server";
import {
  fetchEscrows, fetchListings, fetchEscrow, fetchListing, hasDb,
  insertEscrow, insertListing, initDbSchema, getSql, consumeNonce,
} from "@/lib/db";
import type { Escrow, Listing } from "@/lib/escrow";
import { getSessionAddress } from "@/lib/session";
import { verifyReturn } from "@/lib/qr";
import { newId } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";
import { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } from "@/lib/settle";

if (hasDb()) {
  initDbSchema().catch(console.error);
}

export async function GET() {
  if (!hasDb()) return NextResponse.json({ listings: [], escrows: [] });
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows });
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });
  const data = await req.json();
  const idemKey: string | undefined = req.headers.get("idempotency-key") ?? data.idempotencyKey;

  // ---- Escrow creation (borrow locks & bounty accepts) ----
  if (data.type === "escrow") {
    const e = data.payload as Escrow;
    const sql = getSql()!;

    // Idempotency: a retried lock returns the already-recorded escrow.
    if (idemKey) {
      const existing = await sql`SELECT payload FROM idempotent_actions WHERE key = ${idemKey}`;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, existing: true, escrow: (existing[0] as any).payload });
      }
    }

    await insertEscrow(e);
    if (idemKey) {
      await sql`
        INSERT INTO idempotent_actions (key, kind, payload, created_at)
        VALUES (${idemKey}, 'escrow', ${JSON.stringify(e)}, ${Date.now()})
        ON CONFLICT (key) DO NOTHING
      `;
    }

    const { insertAct } = await import("@/lib/db");
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "borrow_lock",
      oracle: "system",
      listingId: e.listingId,
      escrowId: e.id,
      amountNIM: e.amountNIM,
      feeNIM: e.feeNIM,
      txHashIn: e.txHash,
      createdAt: Date.now(),
      idempotencyKey: idemKey,
    });
    checkAndAwardMilestone(address, "FIRST_LOCKED").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  // ---- Listing creation ----
  if (data.type === "listing") {
    const listing = data.payload as Listing;
    const sql = getSql()!;

    if (idemKey) {
      const existing = await sql`SELECT payload FROM idempotent_actions WHERE key = ${idemKey}`;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, existing: true, listing: (existing[0] as any).payload });
      }
    }

    await insertListing({ ...listing, txHash: data.txHash });
    if (idemKey) {
      await sql`
        INSERT INTO idempotent_actions (key, kind, payload, created_at)
        VALUES (${idemKey}, 'listing', ${JSON.stringify(listing)}, ${Date.now()})
        ON CONFLICT (key) DO NOTHING
      `;
    }

    if (listing.kind.startsWith("bounty") && data.txHash) {
      const { insertAct } = await import("@/lib/db");
      await insertAct({
        id: newId("act"),
        actorAddress: address,
        type: "creator",
        oracle: "system",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: 0,
        txHashIn: data.txHash,
        createdAt: Date.now(),
        idempotencyKey: idemKey,
      });
    }
    checkAndAwardMilestone(address, "FIRST_LISTING").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad payload" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const body = (await req.json()) as {
    id?: string;
    token?: string;
    lenderPubkey?: string;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // ---- Bind the release key: LENDER ONLY, ONCE ONLY ----
  if (body.lenderPubkey) {
    const escrow = await fetchEscrow(body.id);
    if (!escrow) return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    const listing = await fetchListing(escrow.listingId);
    if (!listing || listing.owner !== address) {
      return NextResponse.json({ error: "Only the lender may bind the release key" }, { status: 403 });
    }
    if (escrow.state !== "locked") {
      return NextResponse.json({ error: "Escrow is not locked" }, { status: 400 });
    }
    const sql = getSql()!;
    const res = await sql`
      UPDATE escrows SET lender_pubkey = ${body.lenderPubkey}
      WHERE id = ${body.id} AND lender_pubkey IS NULL AND state = 'locked'
      RETURNING id
    `;
    if (res.length === 0) {
      return NextResponse.json({ error: "Release key already bound" }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  // ---- Cryptographic release via signed QR token ----
  if (body.token) {
    const escrow = await fetchEscrow(body.id);
    if (!escrow || escrow.state !== "locked") {
      return NextResponse.json({ error: "Invalid escrow state" }, { status: 400 });
    }
    if (!escrow.lenderPubkey) {
      return NextResponse.json({ error: "Lender public key not registered" }, { status: 400 });
    }

    const payload = await verifyReturn(body.token, escrow.lenderPubkey);
    if (!payload) {
      return NextResponse.json({ error: "Invalid QR signature or expired" }, { status: 400 });
    }
    // Bind the token to THIS escrow: id + amount must match what was signed.
    if (payload.escrowId !== body.id) {
      return NextResponse.json({ error: "Token does not match this escrow" }, { status: 400 });
    }
    if (payload.amount !== escrow.amountNIM) {
      return NextResponse.json({ error: "Token amount mismatch" }, { status: 400 });
    }

    const fresh = await consumeNonce(payload.nonce);
    if (!fresh) {
      return NextResponse.json({ error: "QR code already used (replay protection)" }, { status: 400 });
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "borrow_return",
        oracle: "qr_sig",
        listingId: escrow.listingId,
        escrowId: escrow.id,
        amountNIM: escrow.amountNIM,
        feeNIM: escrow.feeNIM,
        proofJson: { nonce: payload.nonce },
        createdAt: escrow.createdAt,
      },
      { to: escrow.borrower, amountNIM: escrow.amountNIM - escrow.feeNIM, feeNIM: escrow.feeNIM },
      () => claimEscrow(body.id!),
      () => finalizeEscrow(body.id!),
      () => unclaimEscrow(body.id!)
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    checkAndAwardMilestone(address, "FIRST_SETTLED").catch(() => {});
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  }

  return NextResponse.json({ error: "Invalid PATCH action" }, { status: 400 });
}
