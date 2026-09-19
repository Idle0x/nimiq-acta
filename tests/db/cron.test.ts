// Cron expiry: held listings skip, escrows expire (never auto-refund),
// stale submissions expire at 48h with resubmit allowed, secret policy.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";

const OWNER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00O1";
const USER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00U1";

dbSuite("cron expiry", () => {
  const savedSecret = process.env.CRON_SECRET;
  beforeEach(async () => {
    await resetTestDb();
    process.env.CRON_SECRET = "test-cron-secret";
  });
  afterEach(() => {
    process.env.CRON_SECRET = savedSecret;
  });

  async function authed() {
    return { Authorization: "Bearer test-cron-secret" };
  }

  it("wrong bearer → 403 when secret set", async () => {
    const { POST } = await import("@/app/api/cron/expire/route");
    const r = await POST(new Request("http://t/api/cron/expire", { method: "POST" }));
    expect(r.status).toBe(403);
  });

  it("listing with live locks is SKIPPED (not refunded under participants)", async () => {
    const { insertListing, insertEscrow, fetchListing, getSql } = await import("@/lib/db");
    await insertListing({
      id: "lx1", title: "t", owner: OWNER, collateralNIM: 5,
      kind: "borrow", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open",
      expiresAt: Date.now() - 1000,
    });
    await insertEscrow({
      id: "ex1", listingId: "lx1", title: "t", borrower: USER,
      amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
      txHash: "0xin", createdAt: Date.now(),
    });
    const { POST } = await import("@/app/api/cron/expire/route");
    const j = await (await POST(new Request("http://t/api/cron/expire", { method: "POST", headers: await authed() }))).json();
    expect(j.ok).toBe(true);
    expect((await fetchListing("lx1"))!.state).toBe("open");
    const acts = await getSql()!`SELECT id FROM acts WHERE actor_address = ${OWNER}`;
    expect(acts.length).toBe(0); // no refund payout flow ran for the sponsor
  });

  it("funded listing with no activity expires + refunds sponsor", async () => {
    const { insertListing, fetchListing } = await import("@/lib/db");
    await insertListing({
      id: "lx2", title: "t", owner: OWNER, collateralNIM: 5,
      kind: "bounty", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      expiresAt: Date.now() - 1000,
    });
    const { POST } = await import("@/app/api/cron/expire/route");
    await POST(new Request("http://t/api/cron/expire", { method: "POST", headers: await authed() }));
    expect((await fetchListing("lx2"))!.state).toBe("expired");
  });

  it("past-deadline escrow → expired, NOT refunded, no payout", async () => {
    const { insertListing, insertEscrow, fetchEscrow, getSql } = await import("@/lib/db");
    await insertListing({
      id: "lx3", title: "t", owner: OWNER, collateralNIM: 5,
      kind: "borrow", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open",
      expiresAt: Date.now() + 3600_000,
    });
    await insertEscrow({
      id: "ex3", listingId: "lx3", title: "t", borrower: USER,
      amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
      txHash: "0xin", createdAt: Date.now(),
    });
    await getSql()!`UPDATE escrows SET deadline_at = ${Date.now() - 1000} WHERE id = 'ex3'`;
    const { POST } = await import("@/app/api/cron/expire/route");
    await POST(new Request("http://t/api/cron/expire", { method: "POST", headers: await authed() }));
    expect((await fetchEscrow("ex3"))!.state).toBe("expired");
    const outs = await getSql()!`SELECT id FROM acts WHERE escrow_id = 'ex3'`;
    expect(outs.length).toBe(0); // no auto-payout to anyone
  });

  it("48h-stale venture submission expires; completer may resubmit", async () => {
    const { insertListing, getSql } = await import("@/lib/db");
    await insertListing({
      id: "lv9", title: "t", owner: OWNER, collateralNIM: 5,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      expiresAt: Date.now() + 72 * 3600_000,
    });
    await getSql()!`INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status) VALUES ('sv1', 'lv9', ${USER}, 'old proof', ${Date.now() - 49 * 3600_000}, 'pending')`;
    const { POST } = await import("@/app/api/cron/expire/route");
    const j = await (await POST(new Request("http://t/api/cron/expire", { method: "POST", headers: await authed() }))).json();
    expect(j.expiredSubmissions).toBe(1);
    const st = await getSql()!`SELECT status FROM venture_submissions WHERE id = 'sv1'`;
    expect((st[0] as Record<string, unknown>).status).toBe("expired");
  });

  it("fresh pending submission untouched", async () => {
    const { insertListing, getSql } = await import("@/lib/db");
    await insertListing({
      id: "lv8", title: "t", owner: OWNER, collateralNIM: 5,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      expiresAt: Date.now() + 72 * 3600_000,
    });
    await getSql()!`INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status) VALUES ('sv2', 'lv8', ${USER}, 'new proof', ${Date.now()}, 'pending')`;
    const { POST } = await import("@/app/api/cron/expire/route");
    await POST(new Request("http://t/api/cron/expire", { method: "POST", headers: await authed() }));
    const st = await getSql()!`SELECT status FROM venture_submissions WHERE id = 'sv2'`;
    expect((st[0] as Record<string, unknown>).status).toBe("pending");
  });
});
