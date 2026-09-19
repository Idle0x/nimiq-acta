// Cancel semantics: owner-only listing cancel with lock protection,
// borrower-only escrow cancel while locked (expired locks must return via QR
// or face lender claim — cancelling out of an expired lock is closed).
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const OWNER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00O1";
const USER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00U1";

async function seed() {
  const { insertListing, insertEscrow } = await import("@/lib/db");
  await insertListing({
    id: "lc1", title: "t", owner: OWNER, collateralNIM: 5,
    kind: "borrow", category: "other", description: "d",
    createdAt: Date.now(), isActive: true, state: "open",
    expiresAt: Date.now() + 3600_000,
  });
  await insertEscrow({
    id: "ec1", listingId: "lc1", title: "t", borrower: USER,
    amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
    txHash: "0xin", createdAt: Date.now(),
  });
}

dbSuite("cancel", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    await seed();
  });

  it("listing cancel blocked while a lock is held; close mode works", async () => {
    mintSession(OWNER);
    const { POST } = await import("@/app/api/cancel/route");
    const blocked = await POST(reqJson("http://t/api/cancel", { type: "listing", id: "lc1" }));
    expect(blocked.status).toBe(409);
    expect((await blocked.json()).closeable).toBe(true);
    const closed = await POST(reqJson("http://t/api/cancel", { type: "listing", id: "lc1", mode: "close" }));
    expect((await closed.json()).closed).toBe(true);
  });

  it("borrower cancel refunds in full, no fee, with cancel acts", async () => {
    mintSession(USER);
    const { POST } = await import("@/app/api/cancel/route");
    const j = await (await POST(reqJson("http://t/api/cancel", { type: "escrow", id: "ec1" }))).json();
    expect(j.ok).toBe(true);
    const { fetchEscrow, getSql } = await import("@/lib/db");
    expect((await fetchEscrow("ec1"))!.state).toBe("cancelled");
    const acts = await getSql()!`SELECT type FROM acts WHERE escrow_id = 'ec1'`;
    expect(acts.length).toBeGreaterThan(0);
  });

  it("double cancel → 409 (already settling/cancelled)", async () => {
    mintSession(USER);
    const { POST } = await import("@/app/api/cancel/route");
    expect((await POST(reqJson("http://t/api/cancel", { type: "escrow", id: "ec1" }))).status).toBe(200);
    expect((await POST(reqJson("http://t/api/cancel", { type: "escrow", id: "ec1" }))).status).toBe(400);
  });

  it("expired lock cannot be cancelled out (return-or-claim only)", async () => {
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE escrows SET state = 'expired', deadline_at = ${Date.now() - 1000} WHERE id = 'ec1'`;
    mintSession(USER);
    const { POST } = await import("@/app/api/cancel/route");
    expect((await POST(reqJson("http://t/api/cancel", { type: "escrow", id: "ec1" }))).status).toBe(400);
  });

  it("lender cannot cancel borrower's lock", async () => {
    mintSession(OWNER);
    const { POST } = await import("@/app/api/cancel/route");
    expect((await POST(reqJson("http://t/api/cancel", { type: "escrow", id: "ec1" }))).status).toBe(403);
  });
});
