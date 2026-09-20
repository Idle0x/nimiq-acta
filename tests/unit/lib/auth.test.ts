import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import * as Nimiq from "@nimiq/core";
import { toHex, normalizeAddress, getSessionToken, saveSessionToken, authHeaders } from "@/lib/auth-client";

(ed as any).hashes.sha512 = sha512;

describe("Nimiq Authentication & Key Formats", () => {
  const kp = Nimiq.KeyPair.generate();
  const pkBytes = kp.publicKey.serialize();
  const hex = (b: Uint8Array) => Buffer.from(b).toString("hex");

  beforeEach(() => {
    saveSessionToken(null);
  });

  it("normalizes Nimiq addresses regardless of whitespace and casing", () => {
    const raw = "NQ07 0000 0000 0000 0000 0000 0000 0000";
    const noSpace = "NQ070000000000000000000000000000";
    const lower = "nq07 0000 0000 0000 0000 0000 0000 0000";
    expect(normalizeAddress(raw)).toBe("NQ070000000000000000000000000000");
    expect(normalizeAddress(raw)).toBe(normalizeAddress(noSpace));
    expect(normalizeAddress(raw)).toBe(normalizeAddress(lower));
  });

  it("toHex properly converts Uint8Array, number arrays, hex with 0x, and base64", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(toHex(bytes)).toBe("deadbeef");
    expect(toHex([0xde, 0xad, 0xbe, 0xef])).toBe("deadbeef");
    expect(toHex("0xDEADBEEF")).toBe("deadbeef");
    expect(toHex("deadbeef")).toBe("deadbeef");
    const b64 = Buffer.from("deadbeef", "hex").toString("base64");
    expect(toHex(b64)).toBe("deadbeef");
  });

  it("stores and retrieves session tokens and sets authHeaders", () => {
    expect(getSessionToken()).toBeNull();
    saveSessionToken("test-jwt-token-xyz");
    expect(getSessionToken()).toBe("test-jwt-token-xyz");
    const headers = authHeaders({ "X-Custom": "val" }) as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-jwt-token-xyz");
    expect(headers["X-Custom"]).toBe("val");
  });

  it("verifies Nimiq Keyguard standard message format (MSG_PREFIX + length + text, SHA256 hashed)", async () => {
    const nonce = "a1b2c3d4e5f67890";
    const fullText = `Acta login\n\nNonce: ${nonce}`;
    const MSG_PREFIX = "\x16Nimiq Signed Message:\n";
    const formatted = MSG_PREFIX + fullText.length + fullText;
    const hashed = crypto.createHash("sha256").update(Buffer.from(formatted, "utf8")).digest();

    // Sign the hash as Nimiq Keyguard / Hub / Pay does
    const sig = kp.sign(hashed);
    const sigBytes = sig.serialize();

    const { POST: verifyRoute } = await import("@/app/api/auth/verify/route");
    const req = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: hex(pkBytes),
        signature: hex(sigBytes),
        nonce,
      }),
    });

    const res = await verifyRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.address).toBe(kp.publicKey.toAddress().toUserFriendlyAddress());
    expect(body.token).toBeTruthy();
  });

  it("verifies raw UTF-8 signed message format", async () => {
    const nonce = "f0e1d2c3b4a59687";
    const fullText = `Acta login\n\nNonce: ${nonce}`;
    const rawBytes = new TextEncoder().encode(fullText);

    const sig = kp.sign(rawBytes);
    const sigBytes = sig.serialize();

    const { POST: verifyRoute } = await import("@/app/api/auth/verify/route");
    const req = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: hex(pkBytes),
        signature: hex(sigBytes),
        nonce,
      }),
    });

    const res = await verifyRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.address).toBe(kp.publicKey.toAddress().toUserFriendlyAddress());
    expect(body.token).toBeTruthy();
  });

  it("verifies base64 encoded public key and signature", async () => {
    const nonce = "1122334455667788";
    const fullText = `Acta login\n\nNonce: ${nonce}`;
    const MSG_PREFIX = "\x16Nimiq Signed Message:\n";
    const formatted = MSG_PREFIX + fullText.length + fullText;
    const hashed = crypto.createHash("sha256").update(Buffer.from(formatted, "utf8")).digest();

    const sig = kp.sign(hashed);
    const sigB64 = Buffer.from(sig.serialize()).toString("base64");
    const pkB64 = Buffer.from(pkBytes).toString("base64");

    const { POST: verifyRoute } = await import("@/app/api/auth/verify/route");
    const req = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: pkB64,
        signature: sigB64,
        nonce,
      }),
    });

    const res = await verifyRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.address).toBe(kp.publicKey.toAddress().toUserFriendlyAddress());
  });

  it("rejects invalid signature and malformed key material", async () => {
    const nonce = "9988776655443322";
    const { POST: verifyRoute } = await import("@/app/api/auth/verify/route");

    // Invalid signature (wrong message signed)
    const wrongSig = kp.sign(new TextEncoder().encode("something else")).serialize();
    const resBad = await verifyRoute(new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: hex(pkBytes),
        signature: hex(wrongSig),
        nonce,
      }),
    }));
    expect(resBad.status).toBe(401);

    // Malformed key material (wrong length)
    const resMalformed = await verifyRoute(new Request("http://localhost/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: "deadbeef",
        signature: "deadbeef",
        nonce,
      }),
    }));
    expect(resMalformed.status).toBe(400);
  });
});
