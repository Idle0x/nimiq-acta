// lib/escrow.ts — money math. discountedCollateral used to round to WHOLE NIM
// with a 1 NIM floor (a 0.05 lock cost 1 NIM); sameLunas replaces float ===.
import { describe, it, expect } from "vitest";
import {
  discountedCollateral, sameLunas, newId, explorerTxUrl, explorerAddressUrl,
  MIN_COLLATERAL_NIM, SETTLE_FEE_NIM, LENDER_CLAIM_GRACE_MS, ESCROW_VAULT,
} from "@/lib/escrow";

describe("discountedCollateral", () => {
  it("0 trust = full price", () => expect(discountedCollateral(10, 0)).toBe(10));
  it("100 trust = 30% off", () => expect(discountedCollateral(100, 100)).toBe(70));
  it("clamps trust above 100 and below 0", () => {
    expect(discountedCollateral(10, 500)).toBe(7);
    expect(discountedCollateral(10, -20)).toBe(10);
  });
  it("keeps luna precision on sub-NIM locks", () => {
    expect(discountedCollateral(0.05, 100)).toBe(0.035);
    expect(discountedCollateral(2.5, 50)).toBe(2.125);
  });
  it("never drops below the dust guard", () => {
    expect(discountedCollateral(0.011, 100)).toBeGreaterThanOrEqual(MIN_COLLATERAL_NIM);
  });
});

describe("sameLunas", () => {
  it("equal values", () => expect(sameLunas(2.5, 2.5)).toBe(true));
  it("float dust differs", () => expect(sameLunas(2.5, 2.50001)).toBe(false));
  it("0.1+0.2 style artifacts match", () => expect(sameLunas(0.1 + 0.2, 0.3)).toBe(true));
});

describe("newId", () => {
  it("prefix + 500-unique", () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId("esc")));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id.startsWith("esc-")).toBe(true);
  });
});

describe("explorer links + constants", () => {
  it("tx url strips 0x", () => {
    expect(explorerTxUrl("0xabc")).toBe("https://nim.re/explorer/tx/abc");
    expect(explorerTxUrl(null)).toBe("https://nim.re/explorer");
  });
  it("address url encodes", () => {
    expect(explorerAddressUrl("NQ07 x")).toContain("NQ07%20x");
  });
  it("fee + grace constants sane", () => {
    expect(SETTLE_FEE_NIM).toBeCloseTo(0.0011, 6);
    expect(LENDER_CLAIM_GRACE_MS).toBe(48 * 3600 * 1000);
    expect(ESCROW_VAULT.replace(/\s/g, "").startsWith("NQ")).toBe(true);
  });
});
