import { NextResponse } from "next/server";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import * as Nimiq from "@nimiq/core";
import { getSql } from "@/lib/db";
import { setSession } from "@/lib/session";
import { notify } from "@/lib/notify";

// noble ed25519 v3 (installed 3.2.0) requires sha512 injection via `hashes`.
(ed as any).hashes.sha512 = sha512;

export async function POST(req: Request) {
  let body: { publicKey?: string; signature?: string; nonce?: string; ref?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { publicKey, signature, nonce, ref } = body;
  if (!publicKey || !signature || !nonce) {
    return NextResponse.json({ error: "publicKey, signature and nonce are required" }, { status: 400 });
  }

  let pkBytes: Uint8Array, sigBytes: Uint8Array;
  try {
    pkBytes = Uint8Array.from(Buffer.from(publicKey, "hex"));
    sigBytes = Uint8Array.from(Buffer.from(signature, "hex"));
  } catch {
    return NextResponse.json({ error: "Malformed key material" }, { status: 400 });
  }
  if (pkBytes.length !== 32 || sigBytes.length !== 64) {
    return NextResponse.json({ error: "Malformed key material" }, { status: 400 });
  }

  const sql = getSql();
  if (sql) {
    const used = await sql`DELETE FROM auth_nonces WHERE nonce = ${nonce} RETURNING nonce`;
    if (used.length === 0) {
      return NextResponse.json({ error: "Nonce unknown or already used" }, { status: 401 });
    }
  }

  const message = new TextEncoder().encode(`Acta login\n\nNonce: ${nonce}`);
  let ok = false;
  try {
    ok = await (ed as any).verifyAsync(sigBytes, message, pkBytes);
  } catch {
    ok = false;
  }
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Identity is DERIVED from the pubkey — the client-supplied address is never trusted.
  let address: string;
  try {
    address = new (Nimiq as any).PublicKey(pkBytes).toAddress().toUserFriendlyAddress();
  } catch {
    return NextResponse.json({ error: "Could not derive address" }, { status: 500 });
  }

  if (sql) {
    // Critical #4: upsert so first-time users actually get a users row (trust score persists)
    await sql`
      INSERT INTO users (address, joined_at) VALUES (${address}, ${Date.now()})
      ON CONFLICT (address) DO NOTHING
    `;

    // Referral settlement: a friend arrived with ?ref=CODE — pay both on their FIRST session.
    if (ref && typeof ref === "string") {
      try {
        const rows = await sql`SELECT * FROM referrals WHERE code = ${ref} LIMIT 1`;
        const referral = rows[0];
        if (referral && referral.referrer !== address) {
          const inserted = await sql`
            INSERT INTO referral_settlements (referral_id, referee, settled_at)
            VALUES (${referral.id}, ${address}, ${Date.now()})
            ON CONFLICT (referee) DO NOTHING
            RETURNING referee
          `;
          if (inserted.length > 0) {
            await notify(referral.referrer as string, "referral", "A friend joined via your link",
              "Their first act will settle your 30 NIM referral reward from the treasury.");
            await notify(address, "referral", "Welcome to Acta",
              "You joined via a referral link. Settle your first act to earn 30 NIM from the treasury.");
            // Reward lands at settlement time (settleReferralReward on the
            // referee's first settled act) — login only records the link.
          }
        }
      } catch {
        // referral tables may not exist yet — never block login
      }
    }
  }

  await setSession(address);
  const { checkAndAwardMilestone } = await import("@/lib/milestones");
  checkAndAwardMilestone(address, "FIRST_CONNECTION").catch(() => {});
  return NextResponse.json({ address });
}
