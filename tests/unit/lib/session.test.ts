// lib/session.ts — HMAC cookie sessions through the REAL verifier
// (next/headers is jar-mocked in setup; the crypto is untouched).
import { describe, it, expect } from "vitest";
import { getSessionAddress, setSession, clearSession } from "@/lib/session";
import { mintSession, mintExpiredSession, mintTamperedSession } from "../../helpers/session";

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 0001";

describe("sessions", () => {
  it("set → get roundtrip", async () => {
    await setSession(A);
    expect(await getSessionAddress()).toBe(A);
  });

  it("minted test sessions verify", async () => {
    mintSession(A);
    expect(await getSessionAddress()).toBe(A);
  });

  it("tampered payload rejected", async () => {
    mintTamperedSession(A);
    expect(await getSessionAddress()).toBeNull();
  });

  it("expired session rejected", async () => {
    mintExpiredSession(A);
    expect(await getSessionAddress()).toBeNull();
  });

  it("missing cookie → null", async () => {
    clearSession();
    expect(await getSessionAddress()).toBeNull();
  });

  it("wrong-secret signature rejected", async () => {
    // Forge with a different secret: must not verify under the test secret.
    const crypto = await import("crypto");
    const payload = JSON.stringify({ address: A, exp: Date.now() + 3600_000 });
    const sig = crypto.createHmac("sha256", "wrong-secret").update(payload).digest("base64url");
    const jar = (globalThis as Record<string, unknown>).__actaCookieJar as Map<string, string>;
    jar.set("acta_session", Buffer.from(payload).toString("base64url") + "." + sig);
    expect(await getSessionAddress()).toBeNull();
  });

  it("Authorization header bearer token verifies when cookies are absent", async () => {
    clearSession();
    const { buildSessionToken } = await import("@/lib/session");
    const token = buildSessionToken(A);
    const headers = (globalThis as Record<string, unknown>).__actaHeaders as Map<string, string>;
    headers.set("authorization", `Bearer ${token}`);
    expect(await getSessionAddress()).toBe(A);
    headers.clear();
  });

  it("verifySessionToken parses direct tokens, Bearer, and bearer prefixes with whitespace", async () => {
    const { buildSessionToken, verifySessionToken } = await import("@/lib/session");
    const token = buildSessionToken(A);
    expect(verifySessionToken(token)).toBe(A);
    expect(verifySessionToken(`Bearer ${token}`)).toBe(A);
    expect(verifySessionToken(`bearer   ${token}  `)).toBe(A);
    expect(verifySessionToken("invalid.token")).toBeNull();
  });
});
