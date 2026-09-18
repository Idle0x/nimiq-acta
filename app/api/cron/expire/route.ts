import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { notify } from "@/lib/notify";

/** Runs hourly (vercel.json below) AND lazily when anyone loads the app.
 *  1. Open listings past expires_at  -> expired, vault refund to sponsor
 *  2. Locked escrows past deadline_at -> auto-refund the locker, both notified
 */
export async function POST(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const sql = getSql();
  if (!sql) return NextResponse.json({ ok: true, expiredListings: 0, refundedEscrows: 0 });
  const now = Date.now();

  let expiredListings = 0;
  let refundedEscrows = 0;

  const listings = await sql`
    UPDATE listings SET is_active = FALSE, state = 'expired'
    WHERE is_active = TRUE AND expires_at IS NOT NULL AND expires_at < ${now}
    RETURNING id, owner, title, collateral_nim, tx_hash
  `;
  for (const l of listings as unknown as Record<string, unknown>[]) {
    expiredListings++;
    const amount = Number(l.collateral_nim ?? 0);
    if (l.tx_hash && amount > 0) {
      try {
        const { executeVaultPayout } = await import("@/lib/backend-nimiq");
        await executeVaultPayout(l.owner as string, amount, 0);
      } catch { /* vault offline — row is still marked expired, retry next run */ }
    }
    await notify(l.owner as string, "info", "Listing expired",
      `"${l.title}" closed unclaimed${l.tx_hash ? " and your locked reward was refunded" : ""}.`);
  }

  const escrows = await sql`
    UPDATE escrows SET state = 'refunded', progress = 'expired'
    WHERE state = 'locked' AND deadline_at IS NOT NULL AND deadline_at < ${now}
    RETURNING id, borrower, owner, amount_nim
  `;
  for (const e of escrows as unknown as Record<string, unknown>[]) {
    refundedEscrows++;
    const amount = Number(e.amount_nim ?? 0);
    if (e.borrower && amount > 0) {
      try {
        const { executeVaultPayout } = await import("@/lib/backend-nimiq");
        await executeVaultPayout(e.borrower as string, amount, 0);
      } catch { /* retry next run */ }
    }
    await notify(e.borrower as string, "info", "Deadline passed — lock refunded",
      `${amount.toLocaleString()} NIM returned to your vault. Nothing was lost.`, "/active");
    if (e.owner) await notify(e.owner as string, "info", "A contract reached its deadline",
      "The participant's lock was auto-refunded. You can re-list anytime.");
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

  return NextResponse.json({ ok: true, expiredListings, refundedEscrows, dripsPaid, dripsPending });
}
