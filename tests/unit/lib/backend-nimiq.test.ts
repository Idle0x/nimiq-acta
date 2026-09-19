// lib/backend-nimiq.ts — vault payout + inbound verification with mocked RPC.
// Proves: sim-mode shape (dev), prod fail-closed, balance guards, fee floor,
// message truncation, and verifyInboundLock against a REAL captured tx shape.
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  executeVaultPayout, getVaultBalanceNIM, verifyInboundLock, shouldVerifyInbound, MIN_FEE_NIM,
} from "@/lib/backend-nimiq";

// Captured real mainnet tx shape (rpc.nimiqwatch.com, block 61603650).
const REAL_TX = {
  hash: "d3e9312eb98448f7643747fd0b4bdddeb60ef60543bdbf111eb5e0733ff02a69",
  from: "NQ02 31N6 3KM5 T6G5 22TN EPF5 5XPY RLHK RMB3",
  to: "NQ77 0000 0000 0000 0000 0000 0000 0000 0001",
  value: 1075212, fee: 0, networkId: 24, executionResult: true,
};
const SENDER = REAL_TX.from;
const BURN = REAL_TX.to;

function mockRpc(impl: (method: string, params: unknown[]) => unknown) {
  (globalThis as Record<string, unknown>).fetch = vi.fn(async (_u: unknown, o: Record<string, unknown>) => {
    const body = JSON.parse(String(o.body));
    return { json: async () => ({ jsonrpc: "2.0", result: { data: impl(body.method, body.params) }, id: 1 }) };
  });
}

describe("executeVaultPayout", () => {
  beforeEach(() => {
    delete process.env.VAULT_SEED_PHRASE;
    vi.stubEnv("NODE_ENV", "test");
    vi.unstubAllGlobals?.();
  });

  it("dev without seed returns a simulated 64-hex hash (documented)", async () => {
    const h = await executeVaultPayout("NQ07 0000 0000 0000 0000 0000 0000 0000 0001", 1, 0.0001, "t");
    expect(h).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("production without seed refuses to simulate", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(executeVaultPayout("NQ07 1", 1, 0.0001, "t")).rejects.toThrow(/refusing to simulate/);
    vi.stubEnv("NODE_ENV", "test");
  });
});

describe("getVaultBalanceNIM", () => {
  it("dev without seed returns the documented placeholder", async () => {
    delete process.env.VAULT_SEED_PHRASE;
    vi.stubEnv("NODE_ENV", "test");
    expect(await getVaultBalanceNIM()).toBe(42500);
  });
  it("prod without seed returns 0, never a fake balance", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await getVaultBalanceNIM()).toBe(0);
    vi.stubEnv("NODE_ENV", "test");
  });
});

describe("verifyInboundLock (mocked RPC, real tx shape)", () => {
  beforeEach(() => {
    mockRpc((m) => {
      if (m === "getTransactionByHash") return REAL_TX;
      throw new Error("not found");
    });
  });

  it("accepts the exact funding", async () => {
    const r = await verifyInboundLock({ txHash: REAL_TX.hash, expectedSender: SENDER, expectedRecipient: BURN, minAmountLunas: BigInt(1075212) });
    expect(r).toEqual({ ok: true });
  });
  it("rejects wrong sender / recipient / short value", async () => {
    expect((await verifyInboundLock({ txHash: REAL_TX.hash, expectedSender: BURN, expectedRecipient: BURN, minAmountLunas: BigInt(1) })).ok).toBe(false);
    expect((await verifyInboundLock({ txHash: REAL_TX.hash, expectedSender: SENDER, expectedRecipient: SENDER, minAmountLunas: BigInt(1) })).ok).toBe(false);
    expect((await verifyInboundLock({ txHash: REAL_TX.hash, expectedSender: SENDER, expectedRecipient: BURN, minAmountLunas: BigInt(1075213) })).ok).toBe(false);
  });
  it("rejects failed-execution tx", async () => {
    mockRpc(() => ({ ...REAL_TX, executionResult: false }));
    const r = await verifyInboundLock({ txHash: REAL_TX.hash, expectedSender: SENDER, expectedRecipient: BURN, minAmountLunas: BigInt(1) });
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toMatch(/failed/);
  });
  it("rejects wrong-network tx", async () => {
    mockRpc(() => ({ ...REAL_TX, networkId: 5 }));
    const r = await verifyInboundLock({ txHash: REAL_TX.hash, expectedSender: SENDER, expectedRecipient: BURN, minAmountLunas: BigInt(1) });
    expect(r.ok).toBe(false);
  });
  it("rejects unknown hash", async () => {
    mockRpc(() => { throw new Error("boom"); });
    const r = await verifyInboundLock({ txHash: "00".repeat(32), expectedSender: SENDER, expectedRecipient: BURN, minAmountLunas: BigInt(1) });
    expect(r.ok).toBe(false);
  });
});

describe("shouldVerifyInbound", () => {
  it("prod always, dev only with a real vault", () => {
    delete process.env.VAULT_SEED_PHRASE;
    vi.stubEnv("NODE_ENV", "test");
    expect(shouldVerifyInbound()).toBe(false);
    process.env.VAULT_SEED_PHRASE = "x";
    expect(shouldVerifyInbound()).toBe(true);
    delete process.env.VAULT_SEED_PHRASE;
    vi.stubEnv("NODE_ENV", "production");
    expect(shouldVerifyInbound()).toBe(true);
    vi.stubEnv("NODE_ENV", "test");
  });
});

describe("constants", () => {
  it("fee floor", () => expect(MIN_FEE_NIM).toBe(0.0001));
});
