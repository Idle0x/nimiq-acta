import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { getMemStore } from "@/lib/db";
import { rewardReferralPair } from "@/lib/settle";

describe("Referral System & Rewards", () => {
  const REFERRER = "NQ01 1111 1111 1111 1111 1111 1111 1111 1111";
  const REFEREE = "NQ02 2222 2222 2222 2222 2222 2222 2222 2222";
  const savedDbUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    const { memActs, memReferrals, memReferralSettlements } = getMemStore();
    memActs.length = 0;
    memReferrals.clear();
    memReferralSettlements.clear();
  });

  afterAll(() => {
    if (savedDbUrl) {
      process.env.DATABASE_URL = savedDbUrl;
    }
  });

  it("immediately rewards both referrer and referee with 10 NIM upon referral", async () => {
    const refId = "ref_test_123";
    const res = await rewardReferralPair(refId, REFERRER, REFEREE);
    expect(res.paidReferrer).toBe(true);
    expect(res.paidReferee).toBe(true);

    const { memActs } = getMemStore();
    const referralActs = memActs.filter((a) => a.type === "referral");
    expect(referralActs.length).toBe(2);

    const referrerAct = referralActs.find((a) => a.actorAddress === REFERRER);
    const refereeAct = referralActs.find((a) => a.actorAddress === REFEREE);

    expect(referrerAct).toBeDefined();
    expect(referrerAct!.amountNIM).toBe(10);
    expect((referrerAct!.proofJson as any)?.side).toBe("referrer");

    expect(refereeAct).toBeDefined();
    expect(refereeAct!.amountNIM).toBe(10);
    expect((refereeAct!.proofJson as any)?.side).toBe("referee");
  });

  it("is idempotent and will not double reward", async () => {
    const refId = "ref_test_idem";
    const first = await rewardReferralPair(refId, REFERRER, REFEREE);
    expect(first.paidReferrer).toBe(true);
    expect(first.paidReferee).toBe(true);

    const second = await rewardReferralPair(refId, REFERRER, REFEREE);
    expect(second.paidReferrer).toBe(false);
    expect(second.paidReferee).toBe(false);

    const { memActs } = getMemStore();
    const referralActs = memActs.filter((a) => a.type === "referral");
    expect(referralActs.length).toBe(2);
  });

  it("returns compact list of referred users via /api/referral", async () => {
    const { memReferrals, memReferralSettlements, memUsers } = getMemStore();
    const refId = "ref_test_lookup";
    memReferrals.set(REFERRER, {
      id: refId,
      referrer: REFERRER,
      code: "TEST10",
      createdAt: Date.now(),
    });
    memReferralSettlements.set(REFEREE, {
      referralId: refId,
      referee: REFEREE,
      settledAt: Date.now(),
    });
    memUsers.set(REFEREE, {
      address: REFEREE,
      trustScore: 42,
      totalVolumeNIM: 100,
      itemsCompleted: 3,
      joinedAt: Date.now(),
    });

    const { GET } = await import("@/app/api/referral/route");
    const req = new Request(`http://localhost:3000/api/referral?address=${encodeURIComponent(REFERRER)}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.code).toBe("TEST10");
    expect(data.count).toBe(1);
    expect(Array.isArray(data.referredUsers)).toBe(true);
    expect(data.referredUsers.length).toBe(1);
    expect(data.referredUsers[0].referee).toBe(REFEREE);
    expect(data.referredUsers[0].trustScore).toBe(42);
    expect(data.referredUsers[0].itemsCompleted).toBe(3);
  });
});
