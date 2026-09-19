import * as crypto from "crypto";
import { cookies } from "next/headers";

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

export async function setSession(address: string): Promise<void> {
  const payload = JSON.stringify({ address, exp: Date.now() + TTL_MS });
  const value = Buffer.from(payload).toString("base64url") + "." + hmac(payload);
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function getSessionAddress(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
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

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
