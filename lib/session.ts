import * as crypto from "crypto";
import { cookies, headers } from "next/headers";

const COOKIE = "acta_session";
const TTL_MS = 7 * 24 * 3600 * 1000;
function getSecret(): string {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ENCRYPTION_KEY &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    throw new Error("ENCRYPTION_KEY must be set in production (32+ random chars). Refusing to start.");
  }
  return process.env.ENCRYPTION_KEY || "acta_dev_only_secret_change_before_deploy!!";
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function buildSessionToken(address: string): string {
  const payload = JSON.stringify({ address, exp: Date.now() + TTL_MS });
  return Buffer.from(payload).toString("base64url") + "." + hmac(payload);
}

export function verifySessionToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const raw = token.replace(/^Bearer\s+/i, "").trim();
  const idx = raw.lastIndexOf(".");
  if (idx <= 0) return null;
  const payloadB64 = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString();
  } catch {
    return null;
  }
  const expected = Buffer.from(hmac(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed.address !== "string" || parsed.exp <= Date.now()) return null;
    return parsed.address;
  } catch {
    return null;
  }
}

export async function setSession(address: string): Promise<string> {
  const value = buildSessionToken(address);
  try {
    (await cookies()).set(COOKIE, value, {
      httpOnly: true,
      // Nimiq Pay loads the mini app in a cross-origin iframe. SameSite=Lax
      // cookies are treated as third-party there and silently dropped, so the
      // session never sticks and every mutating route 401s. SameSite=None +
      // Secure is required for the cookie to survive in the iframe.
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: TTL_MS / 1000,
    } as { httpOnly: boolean; secure: boolean; sameSite: "none"; path: string; maxAge: number });
  } catch {
    // cookies() might not be mutable in some execution contexts
  }
  return value;
}

export async function getSessionAddress(): Promise<string | null> {
  // 1. Authorization: Bearer <token> fallback (safest for cross-origin iframes in Nimiq Pay)
  try {
    const auth = (await headers()).get("authorization");
    const fromHeader = verifySessionToken(auth);
    if (fromHeader) return fromHeader;
  } catch {
    // headers() might throw in certain testing environments
  }

  // 2. Cookie (normal browsers + environments where third-party cookies are allowed)
  try {
    const raw = (await cookies()).get(COOKIE)?.value;
    const fromCookie = verifySessionToken(raw);
    if (fromCookie) return fromCookie;
  } catch {
    // cookies() might throw in certain testing environments
  }

  return null;
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
