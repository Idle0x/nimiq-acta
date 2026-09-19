// pending_drips: concurrent sweeps must pay once; poison rows dead-letter.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb } from "../helpers/db";

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 000A";

dbSuite("drip queue", () => {
  beforeEach(resetTestDb);

  it("concurrent sweeps pay a drip exactly once", async () => {
    const { getSql } = await import("@/lib/db");
    const { processPendingDrips } = await import("@/lib/milestones");
    await getSql()!`
      INSERT INTO pending_drips (id, kind, address, amount_nim, ref_id, proof_json, attempts, created_at)
      VALUES ('drip-1', 'checkin', ${A}, 1, 'checkin:2026-01-01', '{}', 0, ${Date.now()})
    `;
    const [r1, r2] = await Promise.all([processPendingDrips(10), processPendingDrips(10)]);
    expect(r1.paid + r2.paid).toBe(1);
    const acts = await getSql()!`SELECT id FROM acts WHERE proof_json->>'message' LIKE '%2026-01-01%' OR (type='checkin' AND actor_address=${A})`;
    expect(acts.length).toBe(1);
  });

  it("poison rows stop after 10 attempts (dead-letter, never auto-paid)", async () => {
    const { getSql } = await import("@/lib/db");
    const { processPendingDrips } = await import("@/lib/milestones");
    await getSql()!`
      INSERT INTO pending_drips (id, kind, address, amount_nim, ref_id, proof_json, attempts, created_at)
      VALUES ('drip-poison', 'checkin', 'NOT-AN-ADDRESS', 1, 'checkin:poison', '{}', 10, ${Date.now()})
    `;
    const r = await processPendingDrips(10);
    expect(r.paid).toBe(0);
    const left = await getSql()!`SELECT attempts FROM pending_drips WHERE id = 'drip-poison'`;
    expect(Number((left[0] as Record<string, unknown>).attempts)).toBe(10);
  });
});
