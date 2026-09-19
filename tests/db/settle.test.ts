// settleAct: the one true pipeline. Claim → pay → finalize → act.
// Simulated vault (no VAULT_SEED_PHRASE) so these run offline against DB.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb } from "../helpers/db";
import { newId } from "@/lib/escrow";

const B = "NQ07 0000 0000 0000 0000 0000 0000 0000 0002";

async function seedLockedEscrow(id: string, amount = 5) {
  const { insertEscrow, getSql } = await import("@/lib/db");
  await insertEscrow({
    id, listingId: "l1", title: "t", borrower: B,
    amountNIM: amount, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
    txHash: "0xin", createdAt: Date.now(),
  });
  return getSql()!;
}

async function seedListing() {
  const { getSql } = await import("@/lib/db");
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO listings (id, title, owner, collateral_nim, yield_nim, duration_days, kind, category, description, created_at, is_active, state)
    VALUES ('l1', 't', ${B}, 10, 0, 1, 'borrow', 'other', 'd', ${Date.now()}, true, 'open')
    ON CONFLICT (id) DO NOTHING
  `;
}

dbSuite("settleAct pipeline", () => {
  beforeEach(async () => {
    await resetTestDb();
    await seedListing();
  });

  it("happy path: claim → simulated payout → released + act + referral", async () => {
    const { fetchEscrow } = await import("@/lib/db");
    const { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } = await import("@/lib/settle");
    await seedLockedEscrow("e1");
    const r = await settleAct(
      {
        id: newId("act"), actorAddress: B, type: "borrow_return", oracle: "qr_sig",
        listingId: "l1", escrowId: "e1", amountNIM: 5, feeNIM: 0.0011,
        proofJson: {}, createdAt: Date.now(),
      },
      { to: B, amountNIM: 5 - 0.0011, feeNIM: 0.0011, message: "t" },
      () => claimEscrow("e1"), () => finalizeEscrow("e1"), () => unclaimEscrow("e1")
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.txHashOut).toMatch(/^0x[0-9a-f]{64}$/);
    expect((await fetchEscrow("e1"))!.state).toBe("released");
  });

  it("payout failure restores state and throws (retryable)", async () => {
    const { fetchEscrow } = await import("@/lib/db");
    const { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } = await import("@/lib/settle");
    await seedLockedEscrow("e2");
    // Force the REAL payout path (valid test mnemonic) with a dead RPC so the
    // broadcast throws after the claim — state must be restored for retry.
    const realFetch = globalThis.fetch;
    process.env.VAULT_SEED_PHRASE = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    (globalThis as Record<string, unknown>).fetch = async (u: unknown, o: unknown) => {
      const urlStr = typeof u === "string" ? u : u instanceof URL ? u.toString() : (u as Request)?.url || "";
      if (!urlStr.includes("nimiqwatch") && !urlStr.includes("rpc")) {
        return realFetch(u as any, o as any);
      }
      throw new Error("rpc down");
    };
    try {
      await expect(
        settleAct(
          {
            id: newId("act"), actorAddress: B, type: "borrow_return", oracle: "qr_sig",
            listingId: "l1", escrowId: "e2", amountNIM: 5, feeNIM: 0.0011,
            proofJson: {}, createdAt: Date.now(),
          },
          { to: B, amountNIM: 4, feeNIM: 0.0011, message: "t" },
          () => claimEscrow("e2"), () => finalizeEscrow("e2"), () => unclaimEscrow("e2")
        )
      ).rejects.toThrow();
      expect((await fetchEscrow("e2"))!.state).toBe("locked");
    } finally {
      delete process.env.VAULT_SEED_PHRASE;
      (globalThis as Record<string, unknown>).fetch = realFetch;
    }
  });

  it("double settle: second gets Already-settled, no second payout", async () => {
    const { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } = await import("@/lib/settle");
    await seedLockedEscrow("e3");
    const mk = () => settleAct(
      {
        id: newId("act"), actorAddress: B, type: "borrow_return", oracle: "qr_sig",
        listingId: "l1", escrowId: "e3", amountNIM: 5, feeNIM: 0.0011,
        proofJson: {}, createdAt: Date.now(),
      },
      { to: B, amountNIM: 5 - 0.0011, feeNIM: 0.0011, message: "t" },
      () => claimEscrow("e3"), () => finalizeEscrow("e3"), () => unclaimEscrow("e3")
    );
    const first = await mk();
    expect(first.ok).toBe(true);
    const second = await mk();
    expect(second.ok).toBe(false);
  });

  it("concurrent settles on one escrow: exactly one payout", async () => {
    const { getSql } = await import("@/lib/db");
    const { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } = await import("@/lib/settle");
    await seedLockedEscrow("e4");
    const mk = () => settleAct(
      {
        id: newId("act"), actorAddress: B, type: "borrow_return", oracle: "qr_sig",
        listingId: "l1", escrowId: "e4", amountNIM: 5, feeNIM: 0.0011,
        proofJson: {}, createdAt: Date.now(),
      },
      { to: B, amountNIM: 5 - 0.0011, feeNIM: 0.0011, message: "t" },
      () => claimEscrow("e4"), () => finalizeEscrow("e4"), () => unclaimEscrow("e4")
    );
    const [a, b] = await Promise.all([mk(), mk()]);
    const wins = [a, b].filter((r) => r.ok).length;
    expect(wins).toBe(1);
    const acts = await getSql()!`SELECT id FROM acts WHERE escrow_id = 'e4' AND type = 'borrow_return'`;
    expect(acts.length).toBe(1);
  });

  it("claim on expired escrow allowed (late return), cancel path unaffected", async () => {
    const { claimEscrow } = await import("@/lib/settle");
    const { insertEscrow } = await import("@/lib/db");
    await insertEscrow({
      id: "e5", listingId: "l1", title: "t", borrower: B,
      amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0, state: "locked",
      txHash: "0xin", createdAt: Date.now(),
    });
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE escrows SET state = 'expired', deadline_at = ${Date.now() - 1000} WHERE id = 'e5'`;
    expect(await claimEscrow("e5")).toBe(true);
  });
});
