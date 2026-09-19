// lib/contract.ts —kind→oracle routing, fee copy, and the protocol promises
// shown to users (including the 48h submission-expiry promise).
import { describe, it, expect } from "vitest";
import { oracleForKind, protocolNotes, hoursLabel, DEFAULT_CONTRACT } from "@/lib/contract";

describe("oracleForKind", () => {
  it.each([
    ["bounty_qr", "qr"], ["bounty_geo", "geo"],
    ["bounty_manual", "creator"], ["bounty_venture", "creator"],
    ["bounty", "vision"], ["borrow", "vision"], ["anything-else", "vision"],
  ])("%s → %s", (kind, oracle) => expect(oracleForKind(kind)).toBe(oracle));
});

describe("protocolNotes", () => {
  it("borrow notes mention vault custody + lender claim path", () => {
    const notes = protocolNotes({ kind: "borrow", collateralNIM: 5 }).join(" ");
    expect(notes).toMatch(/vault/);
    expect(notes).toMatch(/lender may claim/);
  });
  it("venture notes promise 48h submission expiry (implemented in cron)", () => {
    const notes = protocolNotes({ kind: "bounty_venture", collateralNIM: 5 }).join(" ");
    expect(notes).toMatch(/48h/);
    expect(notes).not.toMatch(/auto-refund the sponsor/);
  });
  it("states the exact settlement fee", () => {
    const notes = protocolNotes({ kind: "borrow", collateralNIM: 5 }).join(" ");
    expect(notes).toMatch(/0\.0011/);
  });
  it("minTrust + expiry lines appear when contracted", () => {
    const notes = protocolNotes(
      { kind: "borrow", collateralNIM: 5 },
      { minTrust: 30, deadlineHours: 72, expiresInHours: 168 } as never
    ).join(" ");
    expect(notes).toMatch(/trust ≥ 30/);
    expect(notes).toMatch(/Open for 1 week/);
  });
});

describe("hoursLabel", () => {
  it("branches", () => {
    expect(hoursLabel(5)).toBe("5 hours");
    expect(hoursLabel(24)).toBe("1 day");
    expect(hoursLabel(168)).toBe("1 week");
    expect(hoursLabel(336)).toBe("2 weeks");
    expect(hoursLabel(30)).toBe("30 hours");
  });
});

describe("DEFAULT_CONTRACT", () => {
  it("sane defaults", () => {
    expect(DEFAULT_CONTRACT.deadlineHours).toBe(72);
    expect(DEFAULT_CONTRACT.minTrust).toBe(0);
    expect(DEFAULT_CONTRACT.ai.primary).toBe("vision");
  });
});
