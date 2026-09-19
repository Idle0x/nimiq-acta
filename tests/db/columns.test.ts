// THE proof test: NIM columns must accept fractional values.
// History: listings/escrows/acts stored NIM as INTEGER, so any fractional
// lock or settlement fee errored AFTER the on-chain broadcast. These tests
// fail on the old schema and pass on DOUBLE PRECISION (migrate-v9).
// Requires DATABASE_URL_TEST (real Postgres — type coercion is the SUT).
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, hasTestDb, resetTestDb } from "../helpers/db";

dbSuite("fractional NIM storage", () => {
  beforeEach(resetTestDb);

  it("escrow row keeps 2.5 NIM + 0.0001 fee exactly", async () => {
    const { insertListing, insertEscrow, fetchEscrow } = await import("@/lib/db");
    await insertListing({
      id: "l", title: "t", owner: "NQ07 1", collateralNIM: 10,
      kind: "borrow", category: "other", description: "d", createdAt: Date.now(), isActive: true,
    });
    await insertEscrow({
      id: "esc-frac", listingId: "l", title: "t", borrower: "NQ07 1",
      amountNIM: 2.5, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
      txHash: "0xabc", createdAt: Date.now(),
    });
    const e = await fetchEscrow("esc-frac");
    expect(e!.amountNIM).toBeCloseTo(2.5, 6);
    expect(e!.feeNIM).toBeCloseTo(0.0001, 6);
  });

  it("act row keeps 0.0011 settlement fee", async () => {
    const { insertAct, getSql } = await import("@/lib/db");
    await insertAct({
      id: "act-frac", actorAddress: "NQ07 1", type: "bounty", oracle: "vision",
      listingId: "l", amountNIM: 9.9989, feeNIM: 0.0011,
      txHashOut: "0x1", createdAt: Date.now(), settledAt: Date.now(),
    });
    const rows = await getSql()!`SELECT amount_nim, fee_nim FROM acts WHERE id = 'act-frac'`;
    expect(Number((rows[0] as Record<string, unknown>).amount_nim)).toBeCloseTo(9.9989, 4);
    expect(Number((rows[0] as Record<string, unknown>).fee_nim)).toBeCloseTo(0.0011, 6);
  });

  it("listing keeps fractional collateral; users keeps fractional volume", async () => {
    const { insertListing, fetchListing, getSql } = await import("@/lib/db");
    await insertListing({
      id: "list-frac", title: "t", owner: "NQ07 1", collateralNIM: 0.05,
      kind: "borrow", category: "other", description: "d", createdAt: Date.now(), isActive: true,
    });
    expect((await fetchListing("list-frac"))!.collateralNIM).toBeCloseTo(0.05, 6);
    await getSql()!`INSERT INTO users (address, total_volume_nim) VALUES ('NQ07 1', 123.456)`;
    const u = await getSql()!`SELECT total_volume_nim FROM users WHERE address = 'NQ07 1'`;
    expect(Number((u[0] as Record<string, unknown>).total_volume_nim)).toBeCloseTo(123.456, 3);
  });

  it("schema itself is DOUBLE PRECISION (guards migration regressions)", async () => {
    if (!hasTestDb) return;
    const { getSql } = await import("@/lib/db");
    const rows = (await getSql()!`
      SELECT table_name, column_name, data_type FROM information_schema.columns
      WHERE table_name IN ('listings','escrows','acts','users')
        AND column_name IN ('collateral_nim','amount_nim','fee_nim','total_volume_nim')
    `) as unknown as Record<string, unknown>[];
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(String(r.data_type)).toBe("double precision");
    }
  });
});
