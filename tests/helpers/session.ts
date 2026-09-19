// Test-only session minting: replicates lib/session.ts signing with the test
// secret so route tests exercise the REAL getSessionAddress verification
// (tamper/expiry/identity), not a stub.
import crypto from "crypto";

const COOKIE = "acta_session";
const SECRET = process.env.ENCRYPTION_KEY!;

function jar(): Map<string, string> {
  return (globalThis as Record<string, unknown>).__actaCookieJar as Map<string, string>;
}

export function mintSession(address: string, expOffsetMs = 7 * 24 * 3600 * 1000): string {
  const payload = JSON.stringify({ address, exp: Date.now() + expOffsetMs });
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  const value = Buffer.from(payload).toString("base64url") + "." + sig;
  jar().set(COOKIE, value);
  return value;
}

export function mintExpiredSession(address: string): string {
  return mintSession(address, -1000);
}

export function mintTamperedSession(address: string): string {
  const payload = JSON.stringify({ address, exp: Date.now() + 3600_000 });
  const value = Buffer.from(payload).toString("base64url") + ".AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  jar().set(COOKIE, value);
  return value;
}

export function clearSession() {
  jar().delete(COOKIE);
}
