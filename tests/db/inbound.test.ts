// Inbound funding verification at the route layer: fabricated lock hashes
// must be rejected once verification is active. Exercises shouldVerifyInbound
// by setting a (valid, offline) vault seed + mocked RPC.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";
import { ESCROW_VAULT } from "@/lib/escrow";

const SPONSOR = "NQ02 31N6 3KM5 T6G5 22TN EPF5 5XPY RLHK RMB3";
const REAL_TX = {
  hash: "d3e9312eb98448f7643747fd0b4bdddeb60ef60543bdbf111eb5e0733ff02a69",
  from: SPONSOR, to: ESCROW_VAULT, value: 1075212, fee: 0, networkId: 24, executionResult: true,
};
const SEED = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

function mockLockRpc(tx: unknown) {
  const currentFetch = globalThis.fetch;
  (globalThis as Record<string, unknown>).fetch = vi.fn(async (u: unknown, o: Record<string, unknown>) => {
    const urlStr = typeof u === "string" ? u : u instanceof URL ? u.toString() : (u as Request)?.url || "";
    if (!urlStr.includes("nimiqwatch") && !urlStr.includes("rpc")) {
      return (globalThis as any).__realFetch ? (globalThis as any).__realFetch(u, o) : fetch(u as any, o as any);
    }
    const body = typeof o?.body === "string" ? JSON.parse(o.body) : {};
    if (body.method === "getTransactionByHash") {
      if (tx === null) throw new Error("not found");
      return { json: async () => ({ jsonrpc: "2.0", result: { data: tx }, id: 1 }) };
    }
    throw new Error("rpc down in test");
  });
}

dbSuite("inbound funding gate", () => {
  const realFetch = globalThis.fetch;
  (globalThis as any).__realFetch = realFetch;
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    process.env.VAULT_SEED_PHRASE = SEED; // activates shouldVerifyInbound in test env
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lg1", title: "t", owner: SPONSOR, collateralNIM: 10,
      kind: "borrow", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open",
      expiresAt: Date.now() + 3600_000,
    });
  });
  afterEach(() => {
    delete process.env.VAULT_SEED_PHRASE;
    (globalThis as Record<string, unknown>).fetch = realFetch;
  });

  it("fabricated lock hash rejected, no row recorded", async () => {
    mockLockRpc(null);
    const OTHER = "NQ07 0000 0000 0000 0000 0000 0000 0000 000Z";
    mintSession(OTHER);
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", {
      type: "escrow",
      payload: {
        id: "efake", listingId: "lg1", title: "t", borrower: OTHER,
        amountNIM: 10, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
        txHash: "00".repeat(32), createdAt: Date.now(),
      },
    }));
    expect(r.status).toBe(400);
    const { fetchEscrow } = await import("@/lib/db");
    expect(await fetchEscrow("efake")).toBeNull();
  });

  it("real on-chain lock accepted", async () => {
    mockLockRpc(REAL_TX);
    mintSession(SPONSOR);
    // lg1 owner is SPONSOR — accept must come from someone else
    const OTHER = "NQ07 0000 0000 0000 0000 0000 0000 0000 000Z";
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE listings SET owner = 'someone-else' WHERE id = 'lg1'`;
    const tx2 = { ...REAL_TX, from: OTHER };
    mockLockRpc(tx2);
    mintSession(OTHER);
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", {
      type: "escrow",
      payload: {
        id: "ereal", listingId: "lg1", title: "t", borrower: OTHER,
        amountNIM: 10, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
        txHash: REAL_TX.hash, createdAt: Date.now(),
      },
    }));
    expect(r.status).toBe(200);
    const { fetchEscrow } = await import("@/lib/db");
    expect((await fetchEscrow("ereal"))!.txHash).toBe(REAL_TX.hash);
  });

  it("underfunded bounty rejected on value", async () => {
    mockLockRpc({ ...REAL_TX, from: SPONSOR, to: ESCROW_VAULT, value: 100 });
    mintSession(SPONSOR);
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", {
      type: "listing",
      payload: {
        id: "lbad", title: "t", owner: SPONSOR, collateralNIM: 10,
        kind: "bounty", category: "other", description: "d",
        createdAt: Date.now(), isActive: true, state: "open",
      },
      txHash: REAL_TX.hash,
    }));
    const j = await r.json();
    expect(r.status).toBe(400);
    expect(j.error).toMatch(/below the locked amount/);
  });

  it("funded bounty accepted when chain proves it", async () => {
    mockLockRpc({ ...REAL_TX, from: SPONSOR, to: ESCROW_VAULT, value: 2000000 });
    mintSession(SPONSOR);
    const { POST } = await import("@/app/api/escrows/route");
    const r = await POST(reqJson("http://t/api/escrows", {
      type: "listing",
      payload: {
        id: "lgood", title: "t", owner: SPONSOR, collateralNIM: 10,
        kind: "bounty", category: "other", description: "d",
        createdAt: Date.now(), isActive: true, state: "open",
      },
      txHash: REAL_TX.hash,
    }));
    expect(r.status).toBe(200);
    const { fetchListing } = await import("@/lib/db");
    expect((await fetchListing("lgood"))!.txHash).toBe(REAL_TX.hash);
  });
});
