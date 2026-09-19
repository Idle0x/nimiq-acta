// Lender claim (POST /api/claim): the missing half of borrowing.
// Only the lender, only expired locks, only 48h past deadline; borrower
// pre-empts by late return; double-claim impossible via claimEscrow.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const OWNER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00O1";
const USER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00U1";
const DAY = 3600_000 * 24;

async function seedExpired(escrowId: string, deadlineAgoMs: number) {
  const { insertListing, insertEscrow, getSql } = await import("@/lib/db");
  await insertListing({
    id: "lk1", title: "t", owner: OWNER, collateralNIM: 5,
    kind: "borrow", category: "other", description: "d",
    createdAt: Date.now(), isActive: true, state: "open",
    expiresAt: Date.now() + 3600_000,
  });
  await insertEscrow({
    id: escrowId, listingId: "lk1", title: "t", borrower: USER,
    owner: OWNER, amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0,
    state: "locked", txHash: "0xin", createdAt: Date.now(),
  });
  await getSql()!`UPDATE escrows SET state = 'expired', deadline_at = ${Date.now() - deadlineAgoMs} WHERE id = ${escrowId}`;
}

dbSuite("lender claim", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
  });

  it("happy path: lender paid minus fee, escrow released", async () => {
    await seedExpired("ek1", 49 * 3600_000);
    mintSession(OWNER);
    const { POST } = await import("@/app/api/claim/route");
    const j = await (await POST(reqJson("http://t/api/claim", { escrowId: "ek1" }))).json();
    expect(j.ok).toBe(true);
    expect(j.txHashOut).toMatch(/^0x/);
    const { fetchEscrow } = await import("@/lib/db");
    expect((await fetchEscrow("ek1"))!.state).toBe("released");
  });

  it("grace window: claim before 48h rejected", async () => {
    await seedExpired("ek2", 1 * 3600_000);
    mintSession(OWNER);
    const { POST } = await import("@/app/api/claim/route");
    expect((await POST(reqJson("http://t/api/claim", { escrowId: "ek2" }))).status).toBe(400);
  });

  it("borrower cannot claim; stranger cannot claim", async () => {
    await seedExpired("ek3", 49 * 3600_000);
    const { POST } = await import("@/app/api/claim/route");
    mintSession(USER);
    expect((await POST(reqJson("http://t/api/claim", { escrowId: "ek3" }))).status).toBe(403);
    mintSession("NQ07 0000 0000 0000 0000 0000 0000 0000 00X1");
    expect((await POST(reqJson("http://t/api/claim", { escrowId: "ek3" }))).status).toBe(403);
  });

  it("locked (non-expired) escrow not claimable", async () => {
    await seedExpired("ek4", 49 * 3600_000);
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE escrows SET state = 'locked' WHERE id = 'ek4'`;
    mintSession(OWNER);
    const { POST } = await import("@/app/api/claim/route");
    expect((await POST(reqJson("http://t/api/claim", { escrowId: "ek4" }))).status).toBe(400);
    void DAY;
  });

  it("second claim loses the race (already settled)", async () => {
    await seedExpired("ek5", 49 * 3600_000);
    mintSession(OWNER);
    const { POST } = await import("@/app/api/claim/route");
    expect(((await (await POST(reqJson("http://t/api/claim", { escrowId: "ek5" }))).json()).ok)).toBe(true);
    expect((await POST(reqJson("http://t/api/claim", { escrowId: "ek5" }))).status).toBe(400);
  });
});
