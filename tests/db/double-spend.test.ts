// bounty/verify double-claim: the historic bug paid BEFORE the listing flip,
// so two concurrent oracle passes both got paid. Claim-first must allow
// exactly one payout. OpenAI mocked to pass; vault simulated (no seed).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const chatMock = vi.fn();
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: (...a: unknown[]) => chatMock(...a) } };
  },
}));

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 000A";
const B = "NQ07 0000 0000 0000 0000 0000 0000 0000 000B";
const OWNER = "NQ07 0000 0000 0000 0000 0000 0000 0000 000C";

async function seedBounty(id: string, collateral = 10) {
  const { insertListing } = await import("@/lib/db");
  await insertListing({
    id, title: "task", owner: OWNER, collateralNIM: collateral,
    kind: "bounty", category: "other", description: "d",
    createdAt: Date.now(), isActive: true, state: "open",
    txHash: "0xfunded", contract: { criteria: "c", deadlineHours: 72, minTrust: 0, expiresInHours: 168, ai: { primary: "vision", presenceCheck: false, preScreen: false } },
    expiresAt: Date.now() + 3600_000,
  });
}

function postVerify(addr: string, listingId: string) {
  mintSession(addr);
  return import("@/app/api/bounty/verify/route").then((m) =>
    m.POST(reqJson("http://t/api/bounty/verify", { listingId, imageUrl: "data:image/png;base64,AAA" }, { "Idempotency-Key": `${addr}-${listingId}-${Math.random()}` }))
  );
}

dbSuite("bounty double-claim", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    chatMock.mockReset();
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"pass": true, "reason": "ok"}' } }] });
    process.env.OPENAI_API_KEY = "k";
  });

  it("concurrent same-user double submit: exactly one payout", async () => {
    await seedBounty("lb1");
    const [r1, r2] = await Promise.all([postVerify(A, "lb1"), postVerify(A, "lb1")]);
    const j1 = await r1.json();
    const j2 = await r2.json();
    const paid = [j1, j2].filter((j) => j.txHash);
    expect(paid.length).toBe(1);
    expect([j1, j2].some((j) => j.note === "already settled" || j.error === "Bounty already completed")).toBe(true);
  });

  it("sequential second claimer gets already-settled with no payout", async () => {
    await seedBounty("lb2");
    const first = await (await postVerify(A, "lb2")).json();
    expect(first.txHash).toBeTruthy();
    const second = await (await postVerify(B, "lb2")).json();
    expect(second.txHash).toBeFalsy();
  });

  it("owner cannot win own bounty", async () => {
    await seedBounty("lb3");
    mintSession(OWNER);
    const { POST } = await import("@/app/api/bounty/verify/route");
    const r = await POST(reqJson("http://t/api/bounty/verify", { listingId: "lb3", imageUrl: "x" }));
    expect(r.status).toBe(403);
  });

  it("oracle fail pays nothing and leaves bounty open", async () => {
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"pass": false, "reason": "nope"}' } }] });
    await seedBounty("lb4");
    mintSession(A);
    const { POST } = await import("@/app/api/bounty/verify/route");
    const j = await (await POST(reqJson("http://t/api/bounty/verify", { listingId: "lb4", imageUrl: "x" }))).json();
    expect(j.pass).toBe(false);
    expect(j.txHash).toBeFalsy();
    const { fetchListing } = await import("@/lib/db");
    expect((await fetchListing("lb4"))!.state).toBe("open");
  });

  it("oracle error is 502 retryable with no payout and no flip", async () => {
    chatMock.mockRejectedValue(new Error("down"));
    await seedBounty("lb5");
    mintSession(A);
    const { POST } = await import("@/app/api/bounty/verify/route");
    const r = await POST(reqJson("http://t/api/bounty/verify", { listingId: "lb5", imageUrl: "x" }));
    expect(r.status).toBe(502);
    const { fetchListing } = await import("@/lib/db");
    expect((await fetchListing("lb5"))!.state).toBe("open");
  });
});
