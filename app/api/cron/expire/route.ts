import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { notify } from "@/lib/notify";

const SUBMISSION_TTL_MS = 48 * 3600 * 1000;

/** Runs hourly via vercel.json cron AND NOT from the frontend.
 *  GET is the Vercel-cron entrypoint (crons send headerless GETs): it is open
 *  by construction — every branch below only touches past-due rows, pays only
 *  rightful parties, and retries idempotently, so an early/extra trigger is
 *  harmless. POST is the manual entrypoint and enforces CRON_SECRET when set.
 *  1. Open listings past expires_at with NO live activity -> expired, sponsor
 *     refunded if funded. Listings with locked escrows or pending submissions
 *     are SKIPPED (refunding under active participants strands them).
 *  2. Locked escrows past deadline_at -> 'expired' (NOT auto-refunded: the
 *     lender's claim window opens, the borrower can still return late via QR).
 *  3. Venture submissions pending >48h -> 'expired', both sides notified.
 *  4. Sweep the treasury retry queue.
 */
export async function GET() {
  return runExpiry();
}

export async function POST(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET must be set in production — refusing open expiry runs" },
      { status: 403 }
    );
  }
  return runExpiry();
}

async function runExpiry() {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({
      ok: true, expiredListings: 0, expiredEscrows: 0,
      expiredSubmissions: 0, dripsPaid: 0, dripsPending: 0,
    });
  }
  const now = Date.now();

  let expiredListings = 0;
  let expiredEscrows = 0;
  let expiredSubmissions = 0;

  const listings = await sql`
    UPDATE listings SET is_active = FALSE, state = 'expired'
    WHERE is_active = TRUE AND expires_at IS NOT NULL AND expires_at < ${now}
    RETURNING id, owner, title, collateral_nim, tx_hash
  `;
  for (const l of listings as unknown as Record<string, unknown>[]) {
    const id = String(l.id);
    // Never refund under live participants: locks or pending reviews hold it open.
    const held = await sql`SELECT id FROM escrows WHERE listing_id = ${id} AND state IN ('locked', 'settling') LIMIT 1`;
    const pending = await sql`SELECT id FROM venture_submissions WHERE listing_id = ${id} AND status = 'pending' LIMIT 1`;
    if ((held as unknown[]).length > 0 || (pending as unknown[]).length > 0) {
      await sql`UPDATE listings SET is_active = TRUE, state = 'open' WHERE id = ${id}`;
      await notify(l.owner as string, "info", "Listing expiry held",
        `"${l.title}" passed its expiry with active participants — it stays open until contracts settle. Close it to new accepts when ready.`);
      continue;
    }
    expiredListings++;
    const amount = Number(l.collateral_nim ?? 0);
    if (l.tx_hash && amount > 0) {
      try {
        const { executeVaultPayout } = await import("@/lib/backend-nimiq");
        await executeVaultPayout(l.owner as string, amount, 0, `Acta: Expired listing refund for "${(l.title as string) || "listing"}"`);
      } catch { /* vault offline — row is still marked expired, retry next run */ }
    }
    await notify(l.owner as string, "info", "Listing expired",
      `"${l.title}" closed unclaimed${l.tx_hash ? " and your locked reward was refunded" : ""}.`);
  }

  // Deadline passed: open the lender-claim window, do NOT auto-refund.
  // Auto-refunding the borrower here paid out participants who never returned
  // the item and left lenders with zero recourse.
  const escrows = await sql`
    UPDATE escrows SET state = 'expired', progress = 'expired'
    WHERE state = 'locked' AND deadline_at IS NOT NULL AND deadline_at < ${now}
    RETURNING id, borrower, owner, amount_nim, title
  `;
  for (const e of escrows as unknown as Record<string, unknown>[]) {
    expiredEscrows++;
    const amount = Number(e.amount_nim ?? 0);
    await notify(e.borrower as string, "info", "Deadline passed — return now",
      `${amount.toLocaleString()} NIM is still yours IF the item comes back: have the lender show the return QR. After 48h the lender may claim the lock.`, "/active");
    if (e.owner) await notify(e.owner as string, "info", "A contract reached its deadline",
      `The participant's lock is held past deadline. If the item never comes back, you may claim the lock after 48h.`);
  }

  // Stale venture submissions expire; the completer may resubmit, the sponsor
  // is nudged, and listing-level funds still refund at listing expiry.
  const stale = await sql`
    UPDATE venture_submissions SET status = 'expired'
    WHERE status = 'pending' AND created_at < ${now - SUBMISSION_TTL_MS}
    RETURNING id, listing_id, completer
  `;
  for (const s of stale as unknown as Record<string, unknown>[]) {
    expiredSubmissions++;
    try {
      const ls = await sql`SELECT owner, title FROM listings WHERE id = ${s.listing_id} LIMIT 1`;
      const owner = (ls[0] as Record<string, unknown> | undefined)?.owner as string | undefined;
      const title = (ls[0] as Record<string, unknown> | undefined)?.title as string | undefined;
      if (owner) await notify(owner, "info", "A submission expired unreviewed",
        `Proof for "${title ?? "your challenge"}" sat 48h without review and was released. Review faster to keep hunters engaged.`);
      await notify(s.completer as string, "info", "Submission expired unreviewed",
        `Your proof for "${title ?? "a challenge"}" was never reviewed and was released — you may submit fresh proof.`);
    } catch { /* notifications never block */ }
  }

  // Sweep the treasury retry queue: past drip failures get paid now.
  let dripsPaid = 0;
  let dripsPending = 0;
  try {
    const { processPendingDrips } = await import("@/lib/milestones");
    const r = await processPendingDrips(25);
    dripsPaid = r.paid;
    dripsPending = r.pending;
  } catch { /* retry next run */ }

  return NextResponse.json({ ok: true, expiredListings, expiredEscrows, expiredSubmissions, dripsPaid, dripsPending });
}
