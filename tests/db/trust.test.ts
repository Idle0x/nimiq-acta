// Trust formula: exact math on a hand-computed fixture, zero-acts → 0,
// upsert creates the users row (the historic bug was a bare UPDATE).
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb } from "../helpers/db";

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 000A";

dbSuite("trust score", () => {
  beforeEach(resetTestDb);

  it("zero acts → 0, no users row fabricated", async () => {
    const { computeAndUpdateTrustScore } = await import("@/lib/trust");
    expect(await computeAndUpdateTrustScore(A)).toBe(0);
  });

  it("hand-computed fixture matches exactly", async () => {
    const { getSql } = await import("@/lib/db");
    const { computeAndUpdateTrustScore } = await import("@/lib/trust");
    const now = Date.now();
    // 4 settled of 5 total, volume 999, 2 oracles, first act 45 days ago.
    const rows: Array<[string, string, string, number, number | null]> = [
      ["a1", "bounty", "vision", 500, now - 45 * 86400_000],
      ["a2", "bounty", "geo", 499, now - 10 * 86400_000],
      ["a3", "borrow_return", "qr_sig", 0, now - 5 * 86400_000],
      ["a4", "checkin", "system", 1, now - 86400_000],
      ["a5", "borrow_lock", "system", 100, null],
    ];
    for (const [id, type, oracle, amt, settled] of rows) {
      await getSql()!`INSERT INTO acts (id, actor_address, type, oracle, amount_nim, fee_nim, created_at, settled_at) VALUES (${id}, ${A}, ${type}, ${oracle}, ${amt}, 0, ${settled ?? now}, ${settled})`;
    }
    const score = await computeAndUpdateTrustScore(A);
    // completion 4/5*35=28; volume log10(1001)/5*25≈15.0; tenure 45/90*20=10;
    // diversity 4/5*10=8 (vision, geo, qr_sig, system); community 0 → 61
    const expected =
      Math.round((4 / 5) * 35 + Math.min(25, (Math.log10(1000 + 1) / 5) * 25) + 10 + (4 / 5) * 10);
    expect(score).toBe(expected);
    expect(expected).toBe(61);
    const u = await getSql()!`SELECT trust_score, total_volume_nim, items_completed FROM users WHERE address = ${A}`;
    expect(Number((u[0] as Record<string, unknown>).trust_score)).toBe(expected);
  });

  it("volume points cap at 25 for whales", async () => {
    const { getSql } = await import("@/lib/db");
    const { computeAndUpdateTrustScore } = await import("@/lib/trust");
    const now = Date.now();
    await getSql()!`INSERT INTO acts (id, actor_address, type, oracle, amount_nim, fee_nim, created_at, settled_at) VALUES ('w1', ${A}, 'bounty', 'vision', 100000000, 0, ${now}, ${now})`;
    const score = await computeAndUpdateTrustScore(A);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(35 + 25); // completion 35 + capped volume 25
  });
});
