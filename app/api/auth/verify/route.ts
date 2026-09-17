import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { getSql, hasDb, ensureUser } from "@/lib/db";
import { checkAndAwardMilestone } from "@/lib/milestones";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
ed.hashes.sha512 = sha512;
import * as Nimiq from "@nimiq/core";

const NONCE_TTL_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { publicKeyHex, signatureHex, nonce } = (await req.json()) as {
      publicKeyHex?: string;
      signatureHex?: string;
      nonce?: string;
    };
    if (!publicKeyHex || !signatureHex || !nonce) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Consume the challenge nonce — single use, 5 min TTL, server-issued only.
    if (hasDb()) {
      const sql = getSql()!;
      const del = await sql`
        DELETE FROM auth_nonces
        WHERE nonce = ${nonce} AND created_at > ${Date.now() - NONCE_TTL_MS}
        RETURNING nonce
      `;
      if (del.length === 0) {
        return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 401 });
      }
    }

    // 2. Verify the Ed25519 signature over the nonce.
    const msg = new TextEncoder().encode(nonce);
    const pub = Uint8Array.from(Buffer.from(publicKeyHex.replace(/^0x/, ""), "hex"));
    const sig = Uint8Array.from(Buffer.from(signatureHex.replace(/^0x/, ""), "hex"));
    if (sig.length !== 64 || pub.length !== 32) {
      return NextResponse.json({ error: "Malformed key material" }, { status: 400 });
    }
    const isValid = await ed.verifyAsync(sig, msg, pub);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Identity = the Nimiq address DERIVED from the key that signed.
    //    Never trust a client-supplied address.
    let address: string;
    try {
      address = new Nimiq.PublicKey(pub).toAddress().toUserFriendlyAddress();
    } catch {
      address = new Nimiq.PublicKey(pub).toAddress().toUserFriendlyAddress();
    }

    // 4. Ensure the user row exists (upsert) so trust scores persist.
    await ensureUser(address);

    await setSession(address);
    checkAndAwardMilestone(address, "FIRST_CONNECTION").catch(() => {});
    return NextResponse.json({ ok: true, address });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 400 });
  }
}
