import { describe, it, expect, beforeEach } from "vitest";
import { getMemStore } from "@/lib/db";
import { rewardReferralPair } from "@/lib/settle";

describe("Referral System & Rewards", () => {
  const REFERRER = "NQ01 1111 1111 1111 1111 1111 1111 1111 1111";
  const REFEREE = "NQ02 2222 2222 2222 2222 2222 2222 2222 2222";

  beforeEach(() => {
    const { memActs, memReferrals, memReferralSettlements } = getMemStore();
    memActs.length = 0;
    memReferrals.clear();
    memReferralSettlements.clear();
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
});
