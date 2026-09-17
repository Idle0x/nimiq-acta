import { cookies } from "next/headers";
import * as crypto from "crypto";

const SESSION_KEY = "acta_session";
const JWT_SECRET = process.env.ENCRYPTION_KEY || "fallback_secret_length_32_bytes_xyz";

export async function getSessionAddress(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_KEY);
  if (!session) return null;
  try {
    const parsed = JSON.parse(Buffer.from(session.value, 'base64').toString('utf8'));
    if (parsed.exp < Date.now()) return null;
    return parsed.address;
  } catch {
    return null;
  }
}

export async function setSession(address: string) {
  const cookieStore = await cookies();
  const payload = {
    address,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };
  const val = Buffer.from(JSON.stringify(payload)).toString('base64');
  cookieStore.set(SESSION_KEY, val, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}
