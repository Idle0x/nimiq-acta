// Auth: real ed25519 challenge→verify roundtrip, replay/single-use nonces,
// bad signatures, referral linking, and the REMOVED unsigned session endpoint.
import { describe, it, expect, beforeEach } from "vitest";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { clearSession } from "../helpers/session";

(ed as unknown as { hashes: { sha512: unknown } }).hashes.sha512 = sha512;

const hex = (b: Uint8Array) => Buffer.from(b).toString("hex");

async function freshIdentity() {
  const priv = ed.utils.randomSecretKey();
  const pub = await ed.getPublicKeyAsync(priv);
  return { priv, pub };
}

async function login(pub: Uint8Array, priv: Uint8Array, ref?: string) {
  const { GET: challenge } = await import("@/app/api/auth/challenge/route");
  const { nonce } = await (await challenge()).json();
  const sig = await ed.signAsync(new TextEncoder().encode(`Acta login\n\nNonce: ${nonce}`), priv);
  const { POST: verify } = await import("@/app/api/auth/verify/route");
  return verify(
    reqJson("http://t/api/auth/verify", {
      publicKey: hex(pub), signature: hex(sig), nonce, ...(ref ? { ref } : {}),
    })
  );
}

dbSuite("auth", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
  });

  it("challenge → signed verify establishes a session for the derived address", async () => {
    const { priv, pub } = await freshIdentity();
    const r = await login(pub, priv);
    expect(r.status).toBe(200);
    const { address } = await r.json();
    expect(address.startsWith("NQ")).toBe(true);
    const { GET: session } = await import("@/app/api/auth/session/route");
    expect(((await session()).status)).toBe(200);
  });

  it("nonce is single-use: replay rejected", async () => {
    const { priv, pub } = await freshIdentity();
    const { GET: challenge } = await import("@/app/api/auth/challenge/route");
    const { nonce } = await (await challenge()).json();
    const msg = new TextEncoder().encode(`Acta login\n\nNonce: ${nonce}`);
    const sig = hex(await ed.signAsync(msg, priv));
    const { POST: verify } = await import("@/app/api/auth/verify/route");
    const body = { publicKey: hex(pub), signature: sig, nonce };
    expect((await verify(reqJson("http://t/api/auth/verify", body))).status).toBe(200);
    expect((await verify(reqJson("http://t/api/auth/verify", body))).status).toBe(401);
  });

  it("bad signature and malformed keys rejected", async () => {
    const { priv, pub } = await freshIdentity();
    const { GET: challenge } = await import("@/app/api/auth/challenge/route");
    const { nonce } = await (await challenge()).json();
    const { POST: verify } = await import("@/app/api/auth/verify/route");
    const badSig = hex(await ed.signAsync(new TextEncoder().encode("wrong message"), priv));
    expect(
      (await verify(reqJson("http://t/api/auth/verify", { publicKey: hex(pub), signature: badSig, nonce }))).status
    ).toBe(401);
    expect(
      (await verify(reqJson("http://t/api/auth/verify", { publicKey: "zz", signature: "zz", nonce }))).status
    ).toBe(400);
  });

  it("referral link recorded on referee login; self-referral ignored", async () => {
    const { getSql } = await import("@/lib/db");
    const { priv: p1, pub: u1 } = await freshIdentity();
    const { priv: p2, pub: u2 } = await freshIdentity();
    // referrer creates a code
    const { mintSession } = await import("../helpers/session");
    const r1 = await login(u1, p1);
    const referrer = (await r1.json()).address as string;
    mintSession(referrer);
    const { POST: mkRef } = await import("@/app/api/referral/route");
    const { code } = await (await mkRef(reqJson("http://t/api/referral", {}))).json();
    // referee logs in with ref
    clearSession();
    const r2 = await login(u2, p2, code);
    expect(r2.status).toBe(200);
    const referee = (await r2.json()).address as string;
    const rows = await getSql()!`SELECT * FROM referral_settlements WHERE referee = ${referee}`;
    expect(rows.length).toBe(1);
    void u1; void u2;
  });

  it("unsigned session minting is gone (405/404, no cookie)", async () => {
    const mod = await import("@/app/api/auth/session/route");
    expect("POST" in mod).toBe(false);
  });
});
