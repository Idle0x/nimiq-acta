// lib/qr.ts — the Ed25519 return-token oracle. Every rejection path matters:
// a token that verifies wrongly pays real treasury money.
import { describe, it, expect } from "vitest";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import {
  generateLenderKeypair, createReturnPayload, signReturn, verifyReturn,
} from "@/lib/qr";

(ed as unknown as { hashes: { sha512: unknown } }).hashes.sha512 = sha512;

describe("qr oracle", () => {
  it("sign → verify roundtrip preserves escrow binding", async () => {
    const kp = await generateLenderKeypair();
    const p = createReturnPayload("esc-1", 2.5, "nimiq");
    const back = await verifyReturn(await signReturn(p, kp.privateKeyHex), kp.publicKeyHex);
    expect(back).not.toBeNull();
    expect(back!.escrowId).toBe("esc-1");
    expect(back!.amount).toBe(2.5);
    expect(back!.nonce).toBe(p.nonce);
  });

  it("rejects bit-flipped payload", async () => {
    const kp = await generateLenderKeypair();
    const p = createReturnPayload("esc-1", 2.5, "nimiq");
    const token = await signReturn(p, kp.privateKeyHex);
    const [b, s] = token.split(".");
    const raw = JSON.parse(Buffer.from(b, "base64url").toString());
    raw.amount = 999;
    const forged = Buffer.from(JSON.stringify(raw)).toString("base64url") + "." + s;
    expect(await verifyReturn(forged, kp.publicKeyHex)).toBeNull();
  });

  it("rejects wrong lender key", async () => {
    const a = await generateLenderKeypair();
    const b = await generateLenderKeypair();
    const token = await signReturn(createReturnPayload("e", 1, "n"), a.privateKeyHex);
    expect(await verifyReturn(token, b.publicKeyHex)).toBeNull();
  });

  it("rejects malformed and empty tokens", async () => {
    const kp = await generateLenderKeypair();
    expect(await verifyReturn("garbage", kp.publicKeyHex)).toBeNull();
    expect(await verifyReturn("", kp.publicKeyHex)).toBeNull();
    expect(await verifyReturn("a.b.c", kp.publicKeyHex)).toBeNull();
  });

  it("rejects expired tokens", async () => {
    const kp = await generateLenderKeypair();
    const p = { ...createReturnPayload("e", 1, "n"), exp: Date.now() - 1000 };
    const msg = new TextEncoder().encode(JSON.stringify(p));
    const sig = await ed.signAsync(msg, Uint8Array.from(Buffer.from(kp.privateKeyHex, "hex")));
    const b64 = (by: Uint8Array) => Buffer.from(by).toString("base64url");
    const token = `${b64(new TextEncoder().encode(JSON.stringify(p)))}.${b64(sig)}`;
    expect(await verifyReturn(token, kp.publicKeyHex)).toBeNull();
  });

  it("accepts tokens near the expiry boundary", async () => {
    const kp = await generateLenderKeypair();
    const p = { ...createReturnPayload("e", 1, "n"), exp: Date.now() + 60_000 };
    const msg = new TextEncoder().encode(JSON.stringify(p));
    const sig = await ed.signAsync(msg, Uint8Array.from(Buffer.from(kp.privateKeyHex, "hex")));
    const b64 = (by: Uint8Array) => Buffer.from(by).toString("base64url");
    const token = `${b64(new TextEncoder().encode(JSON.stringify(p)))}.${b64(sig)}`;
    expect(await verifyReturn(token, kp.publicKeyHex)).not.toBeNull();
  });

  it("mints 500 unique nonces", () => {
    const s = new Set(Array.from({ length: 500 }, () => createReturnPayload("e", 1, "n").nonce));
    expect(s.size).toBe(500);
  });

  it("keypair hex shapes", async () => {
    const kp = await generateLenderKeypair();
    expect(kp.privateKeyHex).toMatch(/^[0-9a-f]{64}$/);
    expect(kp.publicKeyHex).toMatch(/^[0-9a-f]{64}$/);
  });
});
