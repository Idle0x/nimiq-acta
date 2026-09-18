import { NextResponse } from "next/server";
import {
  fetchEscrows, fetchListings, fetchEscrow, fetchListing, hasDb,
  insertEscrow, insertListing, ensureDbSchema, getSql, consumeNonce,
} from "@/lib/db";
import type { Escrow, Listing } from "@/lib/escrow";
import { getSessionAddress } from "@/lib/session";
import { verifyReturn } from "@/lib/qr";
import { newId, SETTLE_FEE_NIM } from "@/lib/escrow";
import { awardRecurring, checkAndAwardMilestone } from "@/lib/milestones";
import { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } from "@/lib/settle";

if (hasDb()) {
  ensureDbSchema().catch(console.error);
}

export async function GET() {
  await ensureDbSchema();
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows });
}

export async function POST(req: Request) {
  await ensureDbSchema();
  let address = await getSessionAddress();
  const data = await req.json().catch(() => ({}));
  if (!address && data.address) address = data.address;
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const idemKey: string | undefined = req.headers.get("idempotency-key") ?? data.idempotencyKey;

  // ---- Escrow creation (borrow locks & bounty accepts) ----
  if (data.type === "escrow") {
    const e = data.payload as Escrow;
    if (sql) {
      // Listing must be live: closed/expired/completed listings accept nothing.
      const live = await sql`SELECT is_active, state FROM listings WHERE id = ${e.listingId} LIMIT 1`;
      if (!live[0] || !(live[0] as any).is_active || (live[0] as any).state !== "open") {
        const st = (live[0] as any)?.state;
        return NextResponse.json({ error: st === "closed" ? "Closed to new accepts" : "Listing is no longer open" }, { status: st === "closed" ? 403 : 410 });
      }
    // Server-side contract gate: never trust the client hide (minTrust).
    try {
      const lrows = await sql`SELECT contract FROM listings WHERE id = ${e.listingId} LIMIT 1`;
      const contract = (lrows[0] as any)?.contract as { minTrust?: number; deadlineHours?: number } | null;
      if (contract && typeof contract.minTrust === "number" && contract.minTrust > 0) {
        const urows = await sql`SELECT trust_score FROM users WHERE address = ${address} LIMIT 1`;
        const score = Number((urows[0] as any)?.trust_score ?? 0);
        if (score < contract.minTrust) {
          return NextResponse.json({ error: `This contract requires trust >= ${contract.minTrust}` }, { status: 403 });
        }
      }
      if (contract && typeof contract.deadlineHours === "number" && !(e as any).deadlineAt) {
        (e as any).deadlineAt = Date.now() + contract.deadlineHours * 3600 * 1000;
      }
    } catch { /* contract gate best-effort — never blocks on schema drift */ }
    if (!(e as any).progress) (e as any).progress = "awaiting_proof";

    const { MIN_COLLATERAL_NIM } = await import("@/lib/escrow");
    if (!(e.amountNIM >= MIN_COLLATERAL_NIM)) {
      return NextResponse.json({ error: `Minimum lock is ${MIN_COLLATERAL_NIM} NIM (dust guard)` }, { status: 400 });
    }

    // Anti-farm: nobody accepts their own listing — rewards require a counterparty.
    try {
      const own = await sql`SELECT owner FROM listings WHERE id = ${e.listingId} LIMIT 1`;
      if ((own[0] as any)?.owner === address) {
        return NextResponse.json({ error: "You cannot accept your own listing" }, { status: 403 });
      }
    } catch { /* best-effort */ }

      // Idempotency: a retried lock returns the already-recorded escrow.
      if (idemKey) {
        const existing = await sql`SELECT payload FROM idempotent_actions WHERE key = ${idemKey}`;
        if (existing.length > 0) {
          return NextResponse.json({ ok: true, existing: true, escrow: (existing[0] as any).payload });
        }
      }
    }

    await insertEscrow(e);
    if (sql && idemKey) {
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
    awardRecurring(address, "lock").catch(() => {});
    if (sql) {
      try {
        const { notify } = await import("@/lib/notify");
        const lrows = await sql`SELECT owner, title FROM listings WHERE id = ${e.listingId} LIMIT 1`;
        const owner = (lrows[0] as any)?.owner as string | undefined;
        const title = (lrows[0] as any)?.title ?? e.title;
        if (owner && owner !== address) {
          await notify(owner, "info", "Your listing was accepted",
            `"${title}" — ${e.amountNIM.toLocaleString()} NIM locked. Track progress in My Queue.`, "/active");
        }
        await notify(address, "info", "Contract accepted",
          `"${title}" — lock recorded. Submit proof before the deadline.`, "/active");
      } catch { /* notifications never block */ }
    }
    return NextResponse.json({ ok: true });
  }

  // ---- Listing creation ----
  if (data.type === "listing") {
    const listing = data.payload as Listing;
    const { MIN_COLLATERAL_NIM: MIN_COL } = await import("@/lib/escrow");
    if (!(listing.collateralNIM >= MIN_COL)) {
      return NextResponse.json({ error: `Minimum reward/collateral is ${MIN_COL} NIM (dust guard)` }, { status: 400 });
    }

    if (sql && idemKey) {
      const existing = await sql`SELECT payload FROM idempotent_actions WHERE key = ${idemKey}`;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, existing: true, listing: (existing[0] as any).payload });
      }
    }

    await insertListing({ ...listing, txHash: data.txHash });
    if (sql && idemKey) {
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
      checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    }
    checkAndAwardMilestone(address, "FIRST_LISTING").catch(() => {});
    awardRecurring(address, "listing").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad payload" }, { status: 400 });
}

export async function PATCH(req: Request) {
  let address = await getSessionAddress();
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    token?: string;
    lenderPubkey?: string;
    address?: string;
  };
  if (!address && body.address) address = body.address;
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const sql = getSql();

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
    if (sql) {
      const res = await sql`
        UPDATE escrows SET lender_pubkey = ${body.lenderPubkey}
        WHERE id = ${body.id} AND lender_pubkey IS NULL AND state = 'locked'
        RETURNING id
      `;
      if (res.length === 0) {
        return NextResponse.json({ error: "Release key already bound" }, { status: 409 });
      }
    } else {
      escrow.lenderPubkey = body.lenderPubkey;
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
      { to: escrow.borrower, amountNIM: escrow.amountNIM - SETTLE_FEE_NIM, feeNIM: SETTLE_FEE_NIM },
      () => claimEscrow(body.id!),
      () => finalizeEscrow(body.id!),
      () => unclaimEscrow(body.id!)
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    awardRecurring(address, "settle").catch(() => {});
    if (sql) {
      try {
        await sql`UPDATE escrows SET progress = 'settled' WHERE id = ${body.id!} AND state = 'released'`;
      } catch { /* informational */ }
    }
    try {
      const { notify } = await import("@/lib/notify");
      await notify(escrow.borrower, "released", "Collateral released",
        `${(escrow.amountNIM - escrow.feeNIM).toLocaleString()} NIM returned to your vault.`,
        `https://www.nimiqwatch.com/transaction/${result.txHashOut}`);
      if (sql) {
        const lrows = await sql`SELECT owner FROM listings WHERE id = ${escrow.listingId} LIMIT 1`;
        const owner = (lrows[0] as any)?.owner as string | undefined;
        if (owner && owner !== escrow.borrower) {
          await notify(owner, "released", "Item returned",
            `Collateral for "${escrow.title}" released.`, "/active");
        }
      }
    } catch { /* notifications never block settlement */ }
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  }

  return NextResponse.json({ error: "Invalid PATCH action" }, { status: 400 });
}
