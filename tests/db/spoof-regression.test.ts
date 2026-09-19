// Spoof regression: every identity fallback removed in the fix must STAY
// removed. Each test documents an attack that works on the old code.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const VICTIM = "NQ07 0000 0000 0000 0000 0000 0000 0000 00V1";
const ATTACKER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00A1";

dbSuite("spoof regression", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
  });

  it("escrows POST with body.address but no session → 401", async () => {
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", { type: "listing", address: VICTIM, payload: {} }));
    expect(r.status).toBe(401);
  });

  it("check-in as someone else → 401 (treasury bleed closed)", async () => {
    const { POST } = await import("@/app/api/checkin/route");
    // The spoof body must be IGNORED — only the signed session counts.
    const spoofed = new Request("http://t/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: VICTIM }),
    });
    const r = await POST(spoofed);
    expect(r.status).toBe(401);
  });

  it("referral mint for someone else → 401", async () => {
    const { POST } = await import("@/app/api/referral/route");
    const r = await POST(reqJson("http://t/api/referral", { address: VICTIM }));
    expect(r.status).toBe(401);
  });

  it("qr/generate for a foreign escrow → 403 even with a valid session", async () => {
    const { insertListing, insertEscrow } = await import("@/lib/db");
    await insertListing({
      id: "ls1", title: "t", owner: VICTIM, collateralNIM: 5,
      kind: "borrow", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open",
      expiresAt: Date.now() + 3600_000,
    });
    await insertEscrow({
      id: "es1", listingId: "ls1", title: "t", borrower: ATTACKER,
      amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
      txHash: "0xin", createdAt: Date.now(),
    });
    mintSession(ATTACKER);
    const { POST } = await import("@/app/api/qr/generate/route");
    const r = await POST(reqJson("http://t/api/qr/generate", { escrowId: "es1", amount: 5, chain: "nimiq" }));
    expect(r.status).toBe(403);
  });

  it("cancel of a foreign listing → 403", async () => {
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lc1", title: "t", owner: VICTIM, collateralNIM: 5,
      kind: "borrow", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open",
      expiresAt: Date.now() + 3600_000,
    });
    mintSession(ATTACKER);
    const { POST } = await import("@/app/api/cancel/route");
    const r = await POST(reqJson("http://t/api/cancel", { type: "listing", id: "lc1" }));
    expect(r.status).toBe(403);
  });

  it("attacker session cannot read victim inbox", async () => {
    mintSession(ATTACKER);
    const { GET } = await import("@/app/api/inbox/route");
    const j = await (await GET()).json();
    expect(j.notifications).toEqual([]);
  });
});
