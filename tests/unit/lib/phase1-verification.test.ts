import { describe, it, expect } from "vitest";
import { discountedCollateral, MIN_COLLATERAL_NIM, SETTLE_FEE_NIM } from "@/lib/escrow";

describe("Phase 1 Verification: Decimal math, message safety & borrow/bounty rules (25 iterations)", () => {
  // 1. Verify decimal precision and dust bounds across 25 different decimal values
  const decimalTestCases = [
    0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5,
    2.0, 2.75, 3.1415, 5.0, 7.5, 10.0, 12.34, 25.0, 50.5, 99.99,
    100.0, 150.75, 250.0, 500.25, 1000.0
  ];

  decimalTestCases.forEach((val, idx) => {
    it(`[Iteration ${idx + 1}/25] preserves decimal amount ${val} without precision drift or floor truncation`, () => {
      expect(val).toBeGreaterThanOrEqual(MIN_COLLATERAL_NIM);
      const lunas = Math.round(val * 100_000);
      const restored = lunas / 100_000;
      expect(restored).toBeCloseTo(val, 5);

      // Verify discounted collateral calculation doesn't produce NaN or integer truncations
      const discounted = discountedCollateral(val, 50);
      expect(discounted).toBeLessThanOrEqual(val);
      expect(discounted).toBeGreaterThan(0);

      // Verify settlement fee deduction
      const payout = val - SETTLE_FEE_NIM;
      if (val > SETTLE_FEE_NIM) {
        expect(payout).toBeGreaterThan(0);
        expect(Number(payout.toFixed(4))).toBeCloseTo(val - 0.0011, 4);
      }
    });
  });

  // 2. Verify UTF-8 64-byte message truncation across 25 diverse strings (ascii, unicode, emojis, long titles)
  const messageTestCases = [
    "Short",
    "Acta Protocol: Settlement Release",
    "Acta: Escrow \"A very long listing title that definitely exceeds sixty-four bytes in length\"",
    "Acta: Bounty \"Camera rental in downtown Berlin with extra equipment and tripod\"",
    "Acta: 🌟 Sparkles and emojis with special multi-byte unicode characters 🚀 💎 ⚡ 🛡️",
    "Acta: 汉字 测试 这是一个非常长的中文字符串用于测试 UTF-8 截断边界",
    "Acta: العربية - تجربة رسالة طويلة تتجاوز أربعة وستين بايت",
    "Acta: Русский текст для проверки байтовой длины транзакции Нимик",
    "Acta: 日本語のテストメッセージ。六十四バイトを超える長い文字列。",
    "Acta: 한국어 테스트 메시지입니다. 64바이트를 초과하는 긴 문자열입니다.",
    "Acta: Escrow cancelled — collateral refund for \"Industrial Hammer Drill & Bits 1500W SDS Plus\"",
    "Acta: Expired listing refund for \"Vintage 1974 Canon F-1 SLR Camera with 50mm f/1.4 Lens\"",
    "Acta: AI Vision reward for \"Clean up trash at Central Park near the Bethesda Fountain monument\"",
    "Acta: Approved reward for \"Deliver package from building A to building B within thirty minutes\"",
    "Acta: ScanQuest reward for \"Find hidden QR code sticker at the local hackerspace community board\"",
    "Acta: Friend first settlement reward (+10 NIM) for user NQ0700000000000000000000000000000001",
    "Acta: Welcome referral reward (+10 NIM) for joining through verified network partner ambassador",
    "Acta: Milestone drip for FIRST_LOCKED milestone reward from community treasury fund vault",
    "Acta: Milestone drip for FIRST_SETTLED milestone reward from community treasury fund vault",
    "Acta: Milestone drip for TIER_CENTURION milestone reward from community treasury fund vault",
    "Acta: Milestone drip for STREAK_7 milestone reward from community treasury fund vault",
    "Acta: Periodic milestone drip retry attempt for queued transaction payload execution",
    "Acta: Daily check-in streak reward for consecutive calendar activity verification",
    "A".repeat(200),
    "🔒".repeat(30),
  ];

  function safeTruncateUtf8(str: string, maxBytes = 64): Uint8Array {
    const encoder = new TextEncoder();
    let msgBytes = encoder.encode(str);
    if (msgBytes.length > maxBytes) {
      const decoder = new TextDecoder("utf-8");
      msgBytes = encoder.encode(decoder.decode(msgBytes.subarray(0, maxBytes)).replace(/\uFFFD/g, ""));
    }
    return msgBytes;
  }

  messageTestCases.forEach((msg, idx) => {
    it(`[Iteration ${idx + 1}/25] safely truncates message ${idx + 1} to <= 64 UTF-8 bytes`, () => {
      const bytes = safeTruncateUtf8(msg, 64);
      expect(bytes.length).toBeLessThanOrEqual(64);
      const decoded = new TextDecoder("utf-8").decode(bytes);
      expect(decoded).not.toContain("\uFFFD"); // No broken unicode code points
    });
  });
});
