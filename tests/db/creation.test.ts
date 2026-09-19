// Escrow/listing creation gates: dust, liveness, minTrust, self-accept,
// idempotent replay, and the lender-key bind (once-only, lender-only).
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const OWNER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00O1";
const USER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00U1";

async function seedOpen(id: string, contract: unknown = null) {
  const { insertListing } = await import("@/lib/db");
  await insertListing({
    id, title: "t", owner: OWNER, collateralNIM: 5,
    kind: "borrow", category: "other", description: "d",
    createdAt: Date.now(), isActive: true, state: "open",
    contract: contract as never, expiresAt: Date.now() + 3600_000,
  });
}

function escrowPayload(over: Record<string, unknown> = {}) {
  return {
    id: `e-${Math.random().toString(36).slice(2)}`, listingId: "lg1", title: "t",
    borrower: USER, amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0,
    state: "locked", txHash: "0xin", createdAt: Date.now(), ...over,
  };
}

dbSuite("creation gates", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    await seedOpen("lg1");
  });

  it("dust lock rejected", async () => {
    mintSession(USER);
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", { type: "escrow", payload: escrowPayload({ amountNIM: 0.001 }) }));
    expect(r.status).toBe(400);
  });

  it("accept on closed/completed listing rejected", async () => {
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE listings SET is_active = FALSE, state = 'complete' WHERE id = 'lg1'`;
    mintSession(USER);
    const { POST } = await import("@/app/api/escrows/route");
    expect((await POST(reqJson("http://t/api/escrows", { type: "escrow", payload: escrowPayload() }))).status).toBe(410);
  });

  it("minTrust gate enforced server-side", async () => {
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE listings SET contract = '{"minTrust": 60}' WHERE id = 'lg1'`;
    mintSession(USER);
    const { POST } = await import("@/app/api/escrows/route");
    expect((await POST(reqJson("http://t/api/escrows", { type: "escrow", payload: escrowPayload() }))).status).toBe(403);
  });

  it("self-accept rejected", async () => {
    mintSession(OWNER);
    const { POST } = await import("@/app/api/escrows/route");
    expect((await POST(reqJson("http://t/api/escrows", { type: "escrow", payload: escrowPayload({ borrower: OWNER }) }))).status).toBe(403);
  });

  it("idempotent replay returns the recorded escrow, no duplicate", async () => {
    mintSession(USER);
    const { POST } = await import("@/app/api/escrows/route");
    const key = "idem-key-1";
    const body = { type: "escrow", payload: escrowPayload({ id: "eidem" }), idempotencyKey: key };
    const r1 = await (await POST(reqJson("http://t/api/escrows", body, { "idempotency-key": key }))).json();
    expect(r1.ok).toBe(true);
    const r2 = await (await POST(reqJson("http://t/api/escrows", body, { "idempotency-key": key }))).json();
    expect(r2.existing).toBe(true);
    const { getSql } = await import("@/lib/db");
    const rows = await getSql()!`SELECT id FROM escrows WHERE listing_id = 'lg1'`;
    expect(rows.length).toBe(1);
  });

  it("lender-key bind: lender-only, once-only", async () => {
    const { insertEscrow } = await import("@/lib/db");
    await insertEscrow({ ...escrowPayload({ id: "eb1" }), borrower: USER } as never);
    const { PATCH } = await import("@/app/api/escrows/route");
    mintSession(USER);
    expect((await PATCH(reqJson("http://t/api/escrows", { id: "eb1", lenderPubkey: "aa" }))).status).toBe(403);
    mintSession(OWNER);
    expect((await PATCH(reqJson("http://t/api/escrows", { id: "eb1", lenderPubkey: "aa" }))).status).toBe(200);
    expect((await PATCH(reqJson("http://t/api/escrows", { id: "eb1", lenderPubkey: "bb" }))).status).toBe(409);
  });

  it("borrow listing creation stores server-side expiry default", async () => {
    mintSession(OWNER);
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", {
      type: "listing",
      payload: {
        id: "lnew", title: "t", owner: OWNER, collateralNIM: 5,
        kind: "borrow", category: "other", description: "d",
        createdAt: Date.now(), isActive: true, state: "open",
      },
    }));
    expect(r.status).toBe(200);
    const { fetchListing } = await import("@/lib/db");
    expect((await fetchListing("lnew"))!.expiresAt).toBeGreaterThan(Date.now());
  });
});
