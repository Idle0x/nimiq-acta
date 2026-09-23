import { NextResponse } from "next/server";
import {
  fetchEscrows, fetchListings, fetchEscrow, fetchListing, hasDb,
  insertEscrow, insertListing, ensureDbSchema, getSql, consumeNonce,
} from "@/lib/db";
import type { Escrow, Listing } from "@/lib/escrow";
import { getSessionAddress } from "@/lib/session";
import { verifyReturn } from "@/lib/qr";
import { newId, SETTLE_FEE_NIM, explorerTxUrl, sameLunas, ESCROW_VAULT } from "@/lib/escrow";
import { verifyInboundLock, shouldVerifyInbound } from "@/lib/backend-nimiq";
import { awardRecurring, checkAndAwardMilestone } from "@/lib/milestones";
import { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } from "@/lib/settle";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

if (hasDb()) {
  ensureDbSchema().catch(console.error);
}

let lastReconcile = 0;
async function maybeReconcileListings() {
  const now = Date.now();
  if (now - lastReconcile < 15000) return; // at most once every 15s
  lastReconcile = now;
  try {
    const rpc = process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
    const vault = (process.env.NEXT_PUBLIC_VAULT_ADDRESS || "NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT").replace(/\s+/g, "").toUpperCase();
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTransactionsByAddress",
        params: [vault, 30, null],
        id: 999,
      }),
      signal: AbortSignal.timeout(3500),
    }).then((r) => r.json()).catch(() => null);

    const txs = Array.isArray(res?.result?.data) ? res.result.data : [];
    if (txs.length === 0) return;

    const existingListings = await fetchListings();
    const existingHashes = new Set(
      existingListings.map((l) => (l.txHash || "").replace(/^0x/, "").toLowerCase()).filter(Boolean)
    );

    for (const tx of txs) {
      if (tx.executionResult === false) continue;
      const to = String(tx.to || "").replace(/\s+/g, "").toUpperCase();
      if (to !== vault) continue;
      const cleanHash = String(tx.hash || "").replace(/^0x/, "").toLowerCase();
      if (existingHashes.has(cleanHash)) continue;

      const hex = tx.recipientData || "";
      let memo = "";
      try {
        memo = Buffer.from(hex, "hex").toString("utf8");
      } catch {}

      if (!memo.startsWith("Acta:")) continue;

      const from = String(tx.from || "");
      const valueNIM = Number(tx.value || 0) / 100_000;
      if (valueNIM <= 0) continue;

      let kind: import("@/lib/escrow").ListingKind = "bounty";
      let borrowMode: "rent" | "lend" | undefined = undefined;
      let title = memo.replace(/^Acta:\s*/, "");

      if (memo.includes("Rent Request")) {
        kind = "borrow";
        borrowMode = "rent";
        const match = memo.match(/"([^"]+)"/);
        title = match ? match[1] : title;
      } else if (memo.includes("Bounty")) {
        kind = "bounty";
        const match = memo.match(/"([^"]+)"/);
        title = match ? match[1] : title;
      }

      const listing: Listing = {
        id: "list_" + cleanHash.slice(0, 12),
        title: title || "Funded Community Bounty",
        owner: from,
        collateralNIM: valueNIM,
        yieldNIM: 0,
        durationDays: 7,
        kind,
        category: "other",
        description: `Funded on-chain via Nimiq transaction ${cleanHash.slice(0, 10)}... Verified in vault escrow.`,
        createdAt: tx.timestamp || Date.now(),
        isActive: true,
        txHash: cleanHash,
        ...(borrowMode ? { borrowMode } : {}),
      };

      await insertListing(listing);
      existingHashes.add(cleanHash);
    }
  } catch (err) {
    console.warn("Reconcile inbound vault listings error (non-blocking):", err);
  }
}

export async function GET() {
  await ensureDbSchema();
  await maybeReconcileListings().catch(() => {});
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows });
}

export async function POST(req: Request) {
  await ensureDbSchema();
  // Identity comes ONLY from the signed session cookie. Client-supplied
  // addresses are never trusted (they made every route impersonable).
  const address = await getSessionAddress();
  const data = await req.json().catch(() => ({}));
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const idemKey: string | undefined = req.headers.get("idempotency-key") ?? data.idempotencyKey;

  // ---- Escrow creation (borrow locks & bounty accepts) ----
  if (data.type === "escrow") {
    const e = data.payload as Escrow;
    let isBounty = false;
    if (sql) {
      // Listing must be live: closed/expired/completed listings accept nothing.
      const live = await sql`SELECT is_active, state, kind, collateral_nim, tx_hash, owner, borrow_mode FROM listings WHERE id = ${e.listingId} LIMIT 1`;
      if (!live[0] || !(live[0] as any).is_active || (live[0] as any).state !== "open") {
        const st = (live[0] as any)?.state;
        return NextResponse.json({ error: st === "closed" ? "Closed to new accepts" : "Listing is no longer open" }, { status: st === "closed" ? 403 : 410 });
      }
      isBounty = String((live[0] as any)?.kind ?? "").startsWith("bounty");
      const isBorrowRent = String((live[0] as any)?.kind ?? "") === "borrow" && (live[0] as any)?.borrow_mode === "rent";
      if (isBounty || isBorrowRent) {
        // For bounties and rental requests, the deposit was funded upfront by the sponsor/requester at creation.
        e.amountNIM = Number((live[0] as any).collateral_nim);
        if (!e.txHash || e.txHash.startsWith("0x")) {
          e.txHash = (live[0] as any).tx_hash || e.txHash || "0x" + Date.now().toString(16);
        }
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
      const own = (live[0] as any)?.owner;
      if (own === address) {
        return NextResponse.json({ error: "You cannot accept your own listing" }, { status: 403 });
      }
    } catch { /* best-effort */ }

      // Funding proof: for borrow escrows where someone is renting from a lender, the borrower locks collateral.
      // For bounties and rental requests, funding was already deposited and verified on-chain at listing creation.
      if (!isBounty && !isBorrowRent) {
        if (!e.txHash) {
          return NextResponse.json({ error: "Lock transaction hash required" }, { status: 400 });
        }
        if (shouldVerifyInbound()) {
          const proof = await verifyInboundLock({
            txHash: e.txHash,
            expectedSender: address,
            expectedRecipient: ESCROW_VAULT,
            minAmountLunas: BigInt(Math.round(e.amountNIM * 100_000)),
          });
          if (!proof.ok) {
            return NextResponse.json({ error: `Lock not funded: ${proof.error}` }, { status: 400 });
          }
        }
      }

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
    // Bounties and borrow rental requests are funded at creation: the funding tx must be real,
    // from the sponsor/requester, to the vault. (Lending offers lock nothing until accepted.)
    const isBorrowRent = listing.kind === "borrow" && (listing as any).borrowMode === "rent";
    if (listing.kind.startsWith("bounty") || isBorrowRent) {
      if (!data.txHash) {
        return NextResponse.json({
          error: isBorrowRent ? "Rental request collateral transaction required" : "Bounty funding transaction required",
        }, { status: 400 });
      }
      if (shouldVerifyInbound()) {
        const { verifyInboundLock: verify } = await import("@/lib/backend-nimiq");
        const proof = await verify({
          txHash: data.txHash,
          expectedSender: address,
          expectedRecipient: ESCROW_VAULT,
          minAmountLunas: BigInt(Math.round(listing.collateralNIM * 100_000)),
        });
        if (!proof.ok) {
          return NextResponse.json({ error: `Deposit not funded: ${proof.error}` }, { status: 400 });
        }
      }
    }
    // Server-side expiry default so listings can never lock funds forever.
    if (!listing.expiresAt) {
      listing.expiresAt = Date.now() + 168 * 3600 * 1000;
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
  // Session-only identity (see POST).
  const address = await getSessionAddress();
  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    token?: string;
    lenderPubkey?: string;
    address?: string;
  };
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
    // Late returns still settle: an expired escrow whose item comes back
    // releases to the borrower; only the lender-claim window ends that.
    if (!escrow || (escrow.state !== "locked" && escrow.state !== "expired")) {
      return NextResponse.json({ error: "Invalid escrow state" }, { status: 400 });
    }
    if (!escrow.lenderPubkey) {
      const subjectListing = await fetchListing(escrow.listingId);
      if (subjectListing) {
        const { getLenderKey } = await import("@/lib/db");
        const lKey = await getLenderKey(subjectListing.owner);
        if (lKey) {
          escrow.lenderPubkey = lKey.publicKeyHex;
          if (sql) {
            await sql`UPDATE escrows SET lender_pubkey = ${lKey.publicKeyHex} WHERE id = ${escrow.id}`;
          }
        }
      }
    }
    if (!escrow.lenderPubkey) {
      return NextResponse.json({ error: "Lender public key not registered" }, { status: 400 });
    }

    const payload = await verifyReturn(body.token, escrow.lenderPubkey);
    if (!payload) {
      return NextResponse.json({ error: "Invalid QR signature or expired" }, { status: 400 });
    }
    // Bind the token to THIS escrow: id + amount must match what was signed.
    // Amounts compare as integer lunas — float strict-equality breaks on 2.5.
    if (payload.escrowId !== body.id) {
      return NextResponse.json({ error: "Token does not match this escrow" }, { status: 400 });
    }
    if (!sameLunas(payload.amount, escrow.amountNIM)) {
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
      {
        to: escrow.borrower,
        amountNIM: escrow.amountNIM - SETTLE_FEE_NIM,
        feeNIM: SETTLE_FEE_NIM,
        message: `Acta: Returned "${escrow.title}" — collateral released`,
      },
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
        `${(escrow.amountNIM - SETTLE_FEE_NIM).toLocaleString()} NIM returned to your vault.`,
        explorerTxUrl(result.txHashOut));
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
