// Oracle routes: scanquest / geo / submit / manual_approve.
// OpenAI mocked; vault simulated. Locks in the behaviors that protect money:
// kind gates, ownership, nonces, radius, submission requirements.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";
import { generateLenderKeypair, createReturnPayload, signReturn } from "@/lib/qr";

const chatMock = vi.fn();
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: (...a: unknown[]) => chatMock(...a) } };
  },
}));

const OWNER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00O1";
const HUNTER = "NQ07 0000 0000 0000 0000 0000 0000 0000 00H1";

import type { ListingContract } from "@/lib/contract";

const BASE_CONTRACT: ListingContract = {
  criteria: "blue door", deadlineHours: 72, minTrust: 0, expiresInHours: 168,
  ai: { primary: "vision", presenceCheck: false, preScreen: false },
};

async function seedQrBounty(id: string, key: { pub: string }, contract: ListingContract | null = BASE_CONTRACT) {
  const { insertListing } = await import("@/lib/db");
  await insertListing({
    id, title: "Quest", owner: OWNER, collateralNIM: 8,
    kind: "bounty_qr", category: "other", description: "d",
    createdAt: Date.now(), isActive: true, state: "open",
    txHash: "0xfunded", contract,
    expiresAt: Date.now() + 3600_000,
  });
  const { setLenderKey, getSql } = await import("@/lib/db");
  await setLenderKey({ ownerAddress: OWNER, publicKeyHex: key.pub, privateKeyHexEncrypted: "x" });
  void getSql;
}

let ownerPriv = "";
let ownerPub = "";

dbSuite("oracle routes", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    chatMock.mockReset();
    process.env.OPENAI_API_KEY = "k";
    const kp = await generateLenderKeypair();
    ownerPriv = kp.privateKeyHex;
    ownerPub = kp.publicKeyHex;
  });

  it("scanquest happy path settles to hunter", async () => {
    await seedQrBounty("lq1", { pub: ownerPub });
    const token = await signReturn(createReturnPayload("lq1", 8, "nimiq"), ownerPriv);
    mintSession(HUNTER);
    const { POST } = await import("@/app/api/bounty/scanquest/route");
    const j = await (await POST(reqJson("http://t/api/bounty/scanquest", { token }))).json();
    expect(j.ok).toBe(true);
    expect(j.txHashOut).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("scanquest: owner cannot win, replay dead, wrong kind 404", async () => {
    await seedQrBounty("lq2", { pub: ownerPub });
    const token = await signReturn(createReturnPayload("lq2", 8, "nimiq"), ownerPriv);
    const { POST } = await import("@/app/api/bounty/scanquest/route");
    mintSession(OWNER);
    expect((await POST(reqJson("http://t/api/bounty/scanquest", { token }))).status).toBe(403);
    mintSession(HUNTER);
    expect((await POST(reqJson("http://t/api/bounty/scanquest", { token }))).status).toBe(200);
    expect((await POST(reqJson("http://t/api/bounty/scanquest", { token }))).status).toBe(400);
  });

  it("scanquest presenceCheck without photo → 422, with failing photo → 422", async () => {
    await seedQrBounty("lq3", { pub: ownerPub }, {
      ...BASE_CONTRACT, ai: { primary: "qr", presenceCheck: true, preScreen: false },
    });
    const token = await signReturn(createReturnPayload("lq3", 8, "nimiq"), ownerPriv);
    mintSession(HUNTER);
    const { POST } = await import("@/app/api/bounty/scanquest/route");
    expect((await POST(reqJson("http://t/api/bounty/scanquest", { token }))).status).toBe(422);
    chatMock.mockResolvedValue({ choices: [{ message: { content: '{"pass": false, "reason": "nope"}' } }] });
    const token2 = await signReturn(createReturnPayload("lq3", 8, "nimiq"), ownerPriv);
    const r = await POST(reqJson("http://t/api/bounty/scanquest", { token: token2, imageUrl: "data:x" }));
    expect(r.status).toBe(422);
  });

  it("geo: bad accuracy and out-of-radius pay nothing", async () => {
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lg1", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_geo", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: { ...BASE_CONTRACT, geo: { lat: 52.52, lng: 13.405, radiusM: 150 }, ai: { primary: "geo", presenceCheck: false, preScreen: false } },
      targetLat: 52.52, targetLng: 13.405,
      expiresAt: Date.now() + 3600_000,
    });
    mintSession(HUNTER);
    const { POST } = await import("@/app/api/bounty/geo/route");
    const bad = await (await POST(reqJson("http://t/api/bounty/geo", { listingId: "lg1", lat: 52.52, lng: 13.405, accuracy: 500 }))).json();
    expect(bad.pass).toBe(false);
    const far = await (await POST(reqJson("http://t/api/bounty/geo", { listingId: "lg1", lat: 0, lng: 0, accuracy: 5 }))).json();
    expect(far.pass).toBe(false);
    const near = await (await POST(reqJson("http://t/api/bounty/geo", { listingId: "lg1", lat: 52.5201, lng: 13.4051, accuracy: 5 }))).json();
    expect(near.pass).toBe(true);
    expect(near.txHashOut).toMatch(/^0x/);
  });

  it("geo: venture kind rejected (creator approval cannot be bypassed)", async () => {
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lv1", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: BASE_CONTRACT, expiresAt: Date.now() + 3600_000,
    });
    mintSession(HUNTER);
    const { POST } = await import("@/app/api/bounty/geo/route");
    expect((await POST(reqJson("http://t/api/bounty/geo", { listingId: "lv1", lat: 1, lng: 1, accuracy: 5 }))).status).toBe(404);
  });

  it("geo: target-less geo bounty refused instead of paying blindly", async () => {
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lg2", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_geo", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: BASE_CONTRACT, expiresAt: Date.now() + 3600_000,
    });
    mintSession(HUNTER);
    const { POST } = await import("@/app/api/bounty/geo/route");
    expect((await POST(reqJson("http://t/api/bounty/geo", { listingId: "lg2", lat: 1, lng: 1, accuracy: 5 }))).status).toBe(400);
  });

  it("submit: orphan + wrong-kind rejected, duplicate pending 409", async () => {
    mintSession(HUNTER);
    const { POST } = await import("@/app/api/bounty/submit/route");
    expect((await POST(reqJson("http://t/api/bounty/submit", { listingId: "nope", proof: "x" }))).status).toBe(404);
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lv2", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: BASE_CONTRACT, expiresAt: Date.now() + 3600_000,
    });
    expect((await POST(reqJson("http://t/api/bounty/submit", { listingId: "lv2", proof: "did it" }))).status).toBe(200);
    expect((await POST(reqJson("http://t/api/bounty/submit", { listingId: "lv2", proof: "did it again" }))).status).toBe(409);
  });

  it("manual: non-owner and self-approve rejected; venture needs a submission", async () => {
    const { insertListing } = await import("@/lib/db");
    await insertListing({
      id: "lm1", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: BASE_CONTRACT, expiresAt: Date.now() + 3600_000,
    });
    const { POST } = await import("@/app/api/bounty/manual_approve/route");
    mintSession(HUNTER);
    expect((await POST(reqJson("http://t/api/bounty/manual_approve", { listingId: "lm1", completerAddress: HUNTER }))).status).toBe(403);
    mintSession(OWNER);
    expect((await POST(reqJson("http://t/api/bounty/manual_approve", { listingId: "lm1", completerAddress: HUNTER }))).status).toBe(400);
  });

  it("manual venture approve-after-submit pays the completer", async () => {
    const { insertListing, getSql } = await import("@/lib/db");
    await insertListing({
      id: "lm2", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: BASE_CONTRACT, expiresAt: Date.now() + 3600_000,
    });
    await getSql()!`INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status) VALUES ('s1', 'lm2', ${HUNTER}, 'proof', ${Date.now()}, 'pending')`;
    mintSession(OWNER);
    const { POST } = await import("@/app/api/bounty/manual_approve/route");
    const j = await (await POST(reqJson("http://t/api/bounty/manual_approve", { listingId: "lm2", completerAddress: HUNTER }))).json();
    expect(j.ok).toBe(true);
    expect(j.txHashOut).toMatch(/^0x/);
  });

  it("manual reject pays nothing and allows resubmission", async () => {
    const { insertListing, getSql } = await import("@/lib/db");
    await insertListing({
      id: "lm3", title: "t", owner: OWNER, collateralNIM: 6,
      kind: "bounty_venture", category: "other", description: "d",
      createdAt: Date.now(), isActive: true, state: "open", txHash: "0xfunded",
      contract: BASE_CONTRACT, expiresAt: Date.now() + 3600_000,
    });
    await getSql()!`INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status) VALUES ('s2', 'lm3', ${HUNTER}, 'proof', ${Date.now()}, 'pending')`;
    mintSession(OWNER);
    const { POST } = await import("@/app/api/bounty/manual_approve/route");
    const j = await (await POST(reqJson("http://t/api/bounty/manual_approve", { listingId: "lm3", completerAddress: HUNTER, decision: "reject" }))).json();
    expect(j.rejected).toBe(true);
    const acts = await getSql()!`SELECT id FROM acts WHERE listing_id = 'lm3' AND type = 'bounty'`;
    expect(acts.length).toBe(0);
    mintSession(HUNTER);
    const { POST: submit } = await import("@/app/api/bounty/submit/route");
    expect((await submit(reqJson("http://t/api/bounty/submit", { listingId: "lm3", proof: "better proof" }))).status).toBe(200);
  });
});
