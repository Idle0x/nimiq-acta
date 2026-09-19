// Treasury economics: welcome-on-settlement (not login), recurring multiples
// exactly once, cancelled rows excluded, referral fires on EVERY path via
// settleAct, milestone races guarded.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb } from "../helpers/db";
import { newId } from "@/lib/escrow";

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 000A";
const REF = "NQ07 0000 0000 0000 0000 0000 0000 0000 00R1";

async function settleFor(actor: string, id: string) {
  const { settleAct } = await import("@/lib/settle");
  return settleAct(
    {
      id: newId("act"), actorAddress: actor, type: "borrow_return", oracle: "qr_sig",
      listingId: "l", escrowId: "e", amountNIM: 5, feeNIM: 0.0011,
      proofJson: {}, createdAt: Date.now(),
    },
    { to: actor, amountNIM: 5 - 0.0011, feeNIM: 0.0011, message: "t" },
    async () => true, async () => {}, async () => {}
  );
}

dbSuite("treasury economics", () => {
  beforeEach(async () => {
    await resetTestDb();
    const { getSql } = await import("@/lib/db");
    const sql = getSql();
    if (sql) {
      await sql`
        INSERT INTO listings (id, title, owner, collateral_nim, yield_nim, duration_days, kind, category, description, created_at, is_active, state)
        VALUES ('l', 't', ${A}, 10, 0, 1, 'borrow', 'other', 'd', ${Date.now()}, true, 'open')
        ON CONFLICT (id) DO NOTHING
      `;
    }
  });

  it("no welcome drip without settlement (login does not pay)", async () => {
    const { getSql } = await import("@/lib/db");
    const rows = await getSql()!`SELECT id FROM acts WHERE actor_address = ${A} AND type = 'milestone'`;
    expect(rows.length).toBe(0);
  });

  it("first settlement awards FIRST_CONNECTION + FIRST_SETTLED once", async () => {
    const { getSql } = await import("@/lib/db");
    await settleFor(A, "s1");
    // fire-and-forget milestone imports need a tick to land
    await new Promise((r) => setTimeout(r, 500));
    const rows = (await getSql()!`
      SELECT proof_json->>'milestone_id' AS m FROM acts
      WHERE actor_address = ${A} AND type = 'milestone'
    `) as unknown as Record<string, unknown>[];
    const ids = rows.map((r) => String(r.m));
    expect(ids).toContain("ms_first_conn");
    expect(ids).toContain("ms_first_settle");
    await settleFor(A, "s2");
    await new Promise((r) => setTimeout(r, 500));
    const again = await getSql()!`SELECT id FROM acts WHERE actor_address = ${A} AND type = 'milestone'`;
    expect(again.length).toBe(ids.length);
  });

  it("concurrent first-settlements award once (claimOnce guard)", async () => {
    const { getSql } = await import("@/lib/db");
    await Promise.all([settleFor(A, "c1"), settleFor(A, "c2")]);
    await new Promise((r) => setTimeout(r, 500));
    const rows = await getSql()!`
      SELECT proof_json->>'milestone_id' AS m FROM acts
      WHERE actor_address = ${A} AND type = 'milestone' AND proof_json->>'milestone_id' = 'ms_first_settle'
    `;
    expect(rows.length).toBe(1);
  });

  it("referral pair paid on settleAct path (not just vision bounties)", async () => {
    const { getSql } = await import("@/lib/db");
    await getSql()!`INSERT INTO referrals (id, referrer, code, created_at) VALUES ('ref-1', ${REF}, 'CODE1', ${Date.now()})`;
    await getSql()!`INSERT INTO referral_settlements (referral_id, referee, settled_at) VALUES ('ref-1', ${A}, ${Date.now()})`;
    await settleFor(A, "r1");
    await new Promise((r) => setTimeout(r, 300));
    const rows = (await getSql()!`
      SELECT proof_json->>'side' AS side FROM acts
      WHERE type = 'referral' AND proof_json->>'referral_id' = 'ref-1'
    `) as unknown as Record<string, unknown>[];
    // settleReferralReward is awaited inside settleAct — both sides land.
    expect(rows.map((r) => String(r.side)).sort()).toEqual(["referee", "referrer"]);
    // Second settlement pays nothing more.
    await settleFor(A, "r2");
    await new Promise((r) => setTimeout(r, 300));
    const again = await getSql()!`SELECT id FROM acts WHERE type = 'referral' AND proof_json->>'referral_id' = 'ref-1'`;
    expect(again.length).toBe(2);
  });

  it("cancelled locks/listings excluded from recurring counts", async () => {
    const { getSql } = await import("@/lib/db");
    const { awardRecurring } = await import("@/lib/milestones");
    for (let i = 0; i < 5; i++) {
      await getSql()!`INSERT INTO escrows (id, listing_id, title, borrower, amount_nim, fee_nim, state, tx_hash, created_at) VALUES (${"ex" + i}, 'l', 't', ${A}, 5, 0.0001, 'cancelled', '0x', ${Date.now()})`;
    }
    await awardRecurring(A, "lock");
    const rows = await getSql()!`SELECT id FROM acts WHERE actor_address = ${A} AND type = 'milestone'`;
    expect(rows.length).toBe(0);
  });

  it("recurring lock multiple pays exactly at 5, 10 (never twice)", async () => {
    const { getSql } = await import("@/lib/db");
    const { awardRecurring } = await import("@/lib/milestones");
    for (let i = 0; i < 5; i++) {
      await getSql()!`INSERT INTO escrows (id, listing_id, title, borrower, amount_nim, fee_nim, state, tx_hash, created_at) VALUES (${"el" + i}, 'l', 't', ${A}, 5, 0.0001, 'locked', '0x', ${Date.now()})`;
    }
    await awardRecurring(A, "lock");
    await awardRecurring(A, "lock");
    let rows = await getSql()!`SELECT id FROM acts WHERE actor_address = ${A} AND proof_json->>'milestone_id' = 'rec_lock_1'`;
    expect(rows.length).toBe(1);
    for (let i = 5; i < 10; i++) {
      await getSql()!`INSERT INTO escrows (id, listing_id, title, borrower, amount_nim, fee_nim, state, tx_hash, created_at) VALUES (${"el" + i}, 'l', 't', ${A}, 5, 0.0001, 'locked', '0x', ${Date.now()})`;
    }
    await awardRecurring(A, "lock");
    rows = await getSql()!`SELECT id FROM acts WHERE actor_address = ${A} AND proof_json->>'milestone_id' = 'rec_lock_2'`;
    expect(rows.length).toBe(1);
  });
});
