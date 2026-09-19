// lib/vision.ts — oracle semantics with a mocked OpenAI client.
// Core invariant: an ERROR is never a verdict (retryable 502 upstream);
// a FAIL is a recorded verdict. The no-key simulated pass is dev-only.
import { describe, it, expect, vi, beforeEach } from "vitest";

const chatMock = vi.fn();

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: (...a: unknown[]) => chatMock(...a) } };
  },
}));

import {
  verifyBountyPhoto, verifyScenePhoto, preScreenSubmission,
  OracleError, checkVisionBudget,
} from "@/lib/vision";

const IMG = "data:image/png;base64,AAA";

describe("verifyBountyPhoto", () => {
  beforeEach(() => {
    chatMock.mockReset();
    delete process.env.OPENAI_API_KEY;
    vi.stubEnv("NODE_ENV", "test");
  });

  it("passes through a strict pass", async () => {
    process.env.OPENAI_API_KEY = "k";
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"pass": true, "reason": "matches all criteria"}' } }] });
    const v = await verifyBountyPhoto("task", "criteria", IMG);
    expect(v).toEqual({ pass: true, reason: "matches all criteria" });
    const sent = chatMock.mock.calls[0][0];
    expect(JSON.stringify(sent)).toMatch(/criteria/);
  });

  it("false is a verdict, not an error", async () => {
    process.env.OPENAI_API_KEY = "k";
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"pass": false, "reason": "stock photo"}' } }] });
    const v = await verifyBountyPhoto("task", "criteria", IMG);
    expect(v.pass).toBe(false);
  });

  it("unparseable reply throws OracleError", async () => {
    process.env.OPENAI_API_KEY = "k";
    chatMock.mockResolvedValue({ choices: [{ message: { content: "no json here" } }] });
    await expect(verifyBountyPhoto("t", "c", IMG)).rejects.toBeInstanceOf(OracleError);
  });

  it("client failure throws OracleError (retryable upstream)", async () => {
    process.env.OPENAI_API_KEY = "k";
    chatMock.mockRejectedValue(new Error("timeout"));
    await expect(verifyBountyPhoto("t", "c", IMG)).rejects.toBeInstanceOf(OracleError);
  });

  it("no key in dev/test returns the DOCUMENTED simulated pass", async () => {
    const v = await verifyBountyPhoto("t", "c", IMG);
    expect(v.pass).toBe(true);
    expect(chatMock).not.toHaveBeenCalled();
  });

  it("no key in production throws OracleError instead of auto-passing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(verifyBountyPhoto("t", "c", IMG)).rejects.toBeInstanceOf(OracleError);
    vi.stubEnv("NODE_ENV", "test");
  });

  it("reason is truncated", async () => {
    process.env.OPENAI_API_KEY = "k";
    chatMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ pass: true, reason: "x".repeat(500) }) } }] });
    const v = await verifyBountyPhoto("t", "c", IMG);
    expect(v.reason.length).toBeLessThanOrEqual(140);
  });
});

describe("preScreenSubmission", () => {
  beforeEach(() => {
    chatMock.mockReset();
    process.env.OPENAI_API_KEY = "k";
    vi.stubEnv("NODE_ENV", "test");
  });

  it("maps approve/reject/unsure + clamps confidence", async () => {
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"recommendation": "approve", "confidence": 250, "reason": "ok"}' } }] });
    const r = await preScreenSubmission("crit", "proof");
    expect(r.recommendation).toBe("approve");
    expect(r.confidence).toBe(100);
  });

  it("unknown recommendation becomes unsure", async () => {
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"recommendation": "maybe", "confidence": 10, "reason": "meh"}' } }] });
    const r = await preScreenSubmission("crit", "proof");
    expect(r.recommendation).toBe("unsure");
  });
});

describe("verifyScenePhoto", () => {
  it("forwards title + criteria", async () => {
    process.env.OPENAI_API_KEY = "k";
    chatMock.mockReset();
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"pass": true, "reason": "scene matches"}' } }] });
    const v = await verifyScenePhoto("Fountain", "blue tiles", IMG);
    expect(v.pass).toBe(true);
    expect(JSON.stringify(chatMock.mock.calls[0][0])).toMatch(/Fountain/);
  });
});

describe("vision budget throttle (isolated module state)", () => {
  it("allows 9 calls per minute, then throws OracleError with retry hint", async () => {
    vi.resetModules();
    const fresh = await import("@/lib/vision");
    let oks = 0;
    for (let i = 0; i < 9; i++) {
      const b = fresh.checkVisionBudget();
      if (b.ok) oks++;
    }
    expect(oks).toBe(9);
    const tenth = fresh.checkVisionBudget();
    expect(tenth.ok).toBe(false);
    expect(tenth.retryAfterSec).toBeGreaterThan(0);
  });
});
