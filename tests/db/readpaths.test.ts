// Read paths: shape contracts + zero-fallbacks + honesty defaults.
// Guards the UI against silent shape drift (the app swallows fetch errors,
// so a shape change renders as blank UI, not an error).
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 000A";

dbSuite("read paths", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
  });

  it("/api/me shape for a fresh user", async () => {
    mintSession(A);
    const { GET } = await import("@/app/api/me/route");
    const j = await (await GET(new Request("http://t/api/me"))).json();
    expect(j.address).toBe(A);
    expect(j.trustScore).toBe(0);
    expect(j.escrows).toEqual({ inProgress: [], awaitingMe: [], settled: [], refunded: [] });
    expect(j.totals).toEqual({ settledCount: 0, settledVolume: 0 });
  });

  it("/api/me buckets: expired is actionable (inProgress), refunded is cancelled-only", async () => {
    const { insertListing, insertEscrow, getSql } = await import("@/lib/db");
    await insertListing({
      id: "l", title: "t", owner: A, collateralNIM: 5,
      kind: "borrow", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open",
    });
    for (const [id, state] of [["e1", "locked"], ["e2", "expired"], ["e3", "cancelled"]] as const) {
      await insertEscrow({
        id, listingId: "l", title: "t", borrower: A,
        amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0, state,
        txHash: "0x", createdAt: Date.now(),
      });
    }
    void getSql;
    mintSession(A);
    const { GET } = await import("@/app/api/me/route");
    const j = await (await GET(new Request("http://t/api/me"))).json();
    expect(j.escrows.inProgress.map((e: { id: string }) => e.id).sort()).toEqual(["e1", "e2"]);
    expect(j.escrows.refunded.map((e: { id: string }) => e.id)).toEqual(["e3"]);
  });

  it("/api/passport zero-fallback for strangers", async () => {
    const { GET } = await import("@/app/api/passport/route");
    const j = await (await GET(new Request("http://t/api/passport?address=" + A))).json();
    expect(j.breakdown.total).toBe(0);
    expect(j.stamps).toEqual([]);
    expect(j.milestones).toEqual([]);
  });

  it("/api/listings/[id] 404s unknown ids", async () => {
    const { GET } = await import("@/app/api/listings/[id]/route");
    const r = await GET(new Request("http://t/api/listings/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(r.status).toBe(404);
  });

  it("/api/dashboard always returns price + vault shape", async () => {
    const { GET } = await import("@/app/api/dashboard/route");
    const j = await (await GET(new Request("http://t/api/dashboard"))).json();
    expect(typeof j.price).toBe("number");
    expect(j.vault.address).toBeTruthy();
  });

  it("/api/reports validates reason enum", async () => {
    mintSession(A);
    const { POST } = await import("@/app/api/reports/route");
    const post = (b: unknown) =>
      POST(new Request("http://t/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }));
    expect((await post({ listingId: "x", reason: "bogus" })).status).toBe(400);
  });
});
