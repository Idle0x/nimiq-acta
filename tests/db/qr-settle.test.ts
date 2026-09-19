// QR borrow-return settlement end to end (vault simulated):
// happy release, replay/nonce, escrow binding, amount binding, expiry,
// double-settle, and lender-key ownership now enforced at mint time.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";
import { generateLenderKeypair, createReturnPayload, signReturn } from "@/lib/qr";

const LENDER = "NQ07 0000 0000 0000 0000 0000 0000 0000 000L";
const BORROWER = "NQ07 0000 0000 0000 0000 0000 0000 0000 000B";

let lenderPriv = "";
let lenderPub = "";

import * as crypto from "crypto";

function encryptForTest(text: string) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

async function seedAll() {
  const { insertListing, insertEscrow, setLenderKey } = await import("@/lib/db");
  const kp = await generateLenderKeypair();
  lenderPriv = kp.privateKeyHex;
  lenderPub = kp.publicKeyHex;
  await insertListing({
    id: "lq1", title: "Drill", owner: LENDER, collateralNIM: 5,
    kind: "borrow", category: "tools", description: "d",
    createdAt: Date.now(), isActive: true, state: "open",
    expiresAt: Date.now() + 3600_000,
  });
  await insertEscrow({
    id: "eq1", listingId: "lq1", title: "Drill", borrower: BORROWER,
    owner: LENDER, amountNIM: 5, feeNIM: 0.0001, yieldNIM: 0,
    state: "locked", txHash: "0xin", createdAt: Date.now(),
    lenderPubkey: lenderPub,
  });
  await setLenderKey({ ownerAddress: LENDER, publicKeyHex: lenderPub, privateKeyHexEncrypted: encryptForTest(lenderPriv) });
}

async function mint(escrowId: string, amount: number, key = lenderPriv) {
  return signReturn(createReturnPayload(escrowId, amount, "nimiq"), key);
}

dbSuite("qr borrow-return settlement", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    await seedAll();
  });

  it("happy path releases to borrower minus fee", async () => {
    mintSession(BORROWER);
    const { PATCH } = await import("@/app/api/escrows/route");
    const token = await mint("eq1", 5);
    const r = await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }));
    const j = await r.json();
    expect(j.ok).toBe(true);
    expect(j.txHashOut).toMatch(/^0x[0-9a-f]{64}$/);
    const { fetchEscrow } = await import("@/lib/db");
    expect((await fetchEscrow("eq1"))!.state).toBe("released");
  });

  it("replayed token rejected (nonce consumed)", async () => {
    mintSession(BORROWER);
    const { PATCH } = await import("@/app/api/escrows/route");
    const token = await mint("eq1", 5);
    expect(((await (await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }))).json()).ok)).toBe(true);
    const second = await (await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }))).json();
    expect(second.ok).toBeFalsy();
  });

  it("token for another escrow rejected", async () => {
    mintSession(BORROWER);
    const { PATCH } = await import("@/app/api/escrows/route");
    const token = await mint("eq-other", 5);
    const j = await (await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }))).json();
    expect(j.error).toMatch(/match this escrow/);
  });

  it("amount mismatch rejected (luna-precise)", async () => {
    mintSession(BORROWER);
    const { PATCH } = await import("@/app/api/escrows/route");
    const token = await mint("eq1", 4.5);
    const j = await (await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }))).json();
    expect(j.error).toMatch(/amount mismatch/);
  });

  it("expired token rejected", async () => {
    mintSession(BORROWER);
    const { PATCH } = await import("@/app/api/escrows/route");
    const ed = await import("@noble/ed25519");
    (ed as unknown as { hashes: { sha512: unknown } }).hashes.sha512 =
      (await import("@noble/hashes/sha2.js")).sha512;
    const payload = { ...createReturnPayload("eq1", 5, "nimiq"), exp: Date.now() - 1000 };
    const msg = new TextEncoder().encode(JSON.stringify(payload));
    const sig = await ed.signAsync(msg, Uint8Array.from(Buffer.from(lenderPriv, "hex")));
    const b64 = (by: Uint8Array) => Buffer.from(by).toString("base64url");
    const token = `${b64(new TextEncoder().encode(JSON.stringify(payload)))}.${b64(sig)}`;
    const j = await (await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }))).json();
    expect(j.error).toMatch(/Invalid QR signature or expired/);
  });

  it("settle without bound lender key rejected", async () => {
    const { getSql } = await import("@/lib/db");
    await getSql()!`UPDATE escrows SET lender_pubkey = NULL WHERE id = 'eq1'`;
    mintSession(BORROWER);
    const { PATCH } = await import("@/app/api/escrows/route");
    const token = await mint("eq1", 5);
    const j = await (await PATCH(reqJson("http://t/api/escrows", { id: "eq1", token }))).json();
    expect(j.error).toMatch(/not registered/);
  });

  it("qr/generate for foreign escrow → 403 (ownership binding)", async () => {
    mintSession(BORROWER);
    const { POST } = await import("@/app/api/qr/generate/route");
    const r = await POST(reqJson("http://t/api/qr/generate", { escrowId: "eq1", amount: 5, chain: "nimiq" }));
    expect(r.status).toBe(403);
  });

  it("qr/generate for own listing works", async () => {
    mintSession(LENDER);
    const { POST } = await import("@/app/api/qr/generate/route");
    const r = await POST(reqJson("http://t/api/qr/generate", { escrowId: "eq1", amount: 5, chain: "nimiq" }));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.token).toBeTruthy();
  });
});
