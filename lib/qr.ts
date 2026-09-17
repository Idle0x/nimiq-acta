// Ed25519 QR handshake oracle (Borrowing).
// Payload: base64url(JSON { escrowId, lender, nonce, exp }) + "." + base64url(signature)
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";

// noble ed25519 v3 requires async sha512 injection per docs
ed.hashes.sha512 = sha512;

export type ReturnPayload = {
  escrowId: string;
  lender: string;
  amount: number;
  chain: string;
  nonce: string;
  exp: number;
};

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function generateLenderKeypair() {
  const priv = ed.utils.randomSecretKey();
  const pub = await ed.getPublicKeyAsync(priv);
  return {
    privateKeyHex: Buffer.from(priv).toString("hex"),
    publicKeyHex: Buffer.from(pub).toString("hex"),
  };
}

export function createReturnPayload(escrowId: string, amount: number, chain: string): ReturnPayload {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return {
    escrowId,
    amount,
    chain,
    lender: "lender-device",
    nonce,
    exp: Date.now() + 1000 * 60 * 10,
  };
}

export async function signReturn(
  payload: ReturnPayload,
  privateKeyHex: string
): Promise<string> {
  const msg = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await ed.signAsync(
    msg,
    Uint8Array.from(Buffer.from(privateKeyHex, "hex"))
  );
  return `${b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))}.${b64urlEncode(sig)}`;
}

export async function verifyReturn(
  token: string,
  publicKeyHex: string
): Promise<ReturnPayload | null> {
  try {
    const [b, s] = token.split(".");
    if (!b || !s) return null;
    const msgBytes = b64urlDecode(b);
    const sigBytes = b64urlDecode(s);
    const ok = await ed.verifyAsync(
      sigBytes,
      msgBytes,
      Uint8Array.from(Buffer.from(publicKeyHex, "hex"))
    );
    if (!ok) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(msgBytes)
    ) as ReturnPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
