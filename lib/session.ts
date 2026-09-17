import { cookies } from "next/headers";
import * as crypto from "crypto";

const COOKIE = "acta_session";
// Reuse the existing 32-byte secret. Set ENCRYPTION_KEY in env (it already is).
const SECRET = process.env.ENCRYPTION_KEY || "fallback_secret_length_32_bytes_xyz";
const TTL_MS = 1000 * 60 * 60 * 24 * 7;

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export async function setSession(address: string) {
  const payload = JSON.stringify({ address, exp: Date.now() + TTL_MS });
  const value = `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
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
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const payloadB64 = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(payload);
    return typeof p.address === "string" && p.exp > Date.now() ? p.address : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
