import { NextResponse } from "next/server";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import * as Nimiq from "@nimiq/core";
import crypto from "crypto";
import { getSql, ensureDbSchema, getMemStore } from "@/lib/db";
import { setSession } from "@/lib/session";
import { notify } from "@/lib/notify";

// noble ed25519 v3 (installed 3.2.0) requires sha512 injection via `hashes`.
(ed as any).hashes.sha512 = sha512;

function parseBytes(val: unknown, expectedLen: number): Uint8Array | null {
  if (!val) return null;
  if (val instanceof Uint8Array && val.length === expectedLen) return val;
  if (Array.isArray(val) && val.length === expectedLen) return Uint8Array.from(val);
  if (typeof val === "object" && val !== null) {
    const vals = Object.values(val);
    if (vals.length === expectedLen && typeof vals[0] === "number") {
      return Uint8Array.from(vals as number[]);
    }
  }
  if (typeof val === "string") {
    const clean = val.trim().replace(/^0x/, "");
    // Try hex
    if (/^[0-9a-fA-F]+$/.test(clean) && clean.length === expectedLen * 2) {
      try {
        const b = Buffer.from(clean, "hex");
        if (b.length === expectedLen) return Uint8Array.from(b);
      } catch {}
    }
    // Try base64
    try {
      const b = Buffer.from(clean, "base64");
      if (b.length === expectedLen) {
        return Uint8Array.from(b);
      }
    } catch {}
  }
  return null;
}

export async function POST(req: Request) {
  await ensureDbSchema();
  let body: { publicKey?: unknown; signature?: unknown; nonce?: string; ref?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { publicKey, signature, nonce, ref } = body;
  if (!publicKey || !signature || !nonce) {
    return NextResponse.json({ error: "publicKey, signature and nonce are required" }, { status: 400 });
  }

  const pkBytes = parseBytes(publicKey, 32);
  const sigBytes = parseBytes(signature, 64);
  if (!pkBytes || !sigBytes) {
    return NextResponse.json({ error: "Malformed key material" }, { status: 400 });
  }

  const sql = getSql();
  if (sql) {
    const used = await sql`DELETE FROM auth_nonces WHERE nonce = ${nonce} RETURNING nonce`;
    if (used.length === 0) {
      return NextResponse.json({ error: "Nonce unknown or already used" }, { status: 401 });
    }
  }

  const fullText = `Acta login\n\nNonce: ${nonce}`;
  const MSG_PREFIX = "\x16Nimiq Signed Message:\n";

  const candidates: Uint8Array[] = [];
  for (const text of [fullText, String(nonce)]) {
    // 1. Standard Nimiq Keyguard message format: MSG_PREFIX + text.length + text, SHA256 hashed
    const p1 = MSG_PREFIX + text.length + text;
    candidates.push(Uint8Array.from(crypto.createHash("sha256").update(Buffer.from(p1, "utf8")).digest()));

    // 2. Standard Nimiq with UTF-8 byte length (if different from character length)
    const byteLen = Buffer.byteLength(text, "utf8");
    if (byteLen !== text.length) {
      const p2 = MSG_PREFIX + byteLen + text;
      candidates.push(Uint8Array.from(crypto.createHash("sha256").update(Buffer.from(p2, "utf8")).digest()));
    }

    // 3. Prefix without length, SHA256 hashed
    const p3 = MSG_PREFIX + text;
    candidates.push(Uint8Array.from(crypto.createHash("sha256").update(Buffer.from(p3, "utf8")).digest()));

    // 4. Raw SHA256 of text
    candidates.push(Uint8Array.from(crypto.createHash("sha256").update(Buffer.from(text, "utf8")).digest()));

    // 5. Raw UTF-8 bytes
    candidates.push(new TextEncoder().encode(text));
  }

  let ok = false;
  for (const candidate of candidates) {
    try {
      if (await (ed as any).verifyAsync(sigBytes, candidate, pkBytes)) {
        ok = true;
        break;
      }
    } catch {
      // continue checking other candidates
    }
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

    // Referral settlement: a friend arrived with ?ref=CODE — pay both immediately!
    if (ref && typeof ref === "string") {
      try {
        const rows = await sql`SELECT * FROM referrals WHERE LOWER(code) = LOWER(${ref.trim()}) LIMIT 1`;
        const referral = rows[0];
        if (referral && referral.referrer !== address) {
          const inserted = await sql`
            INSERT INTO referral_settlements (referral_id, referee, settled_at)
            VALUES (${referral.id}, ${address}, ${Date.now()})
            ON CONFLICT (referee) DO NOTHING
            RETURNING referee
          `;
          if (inserted.length > 0) {
            const { rewardReferralPair } = await import("@/lib/settle");
            await rewardReferralPair(referral.id as string, referral.referrer as string, address);
          }
        }
      } catch (err) {
        console.error("Referral instant reward on auth failed:", err);
      }
    }
  } else if (!sql && ref && typeof ref === "string") {
    try {
      const { memReferrals, memReferralSettlements } = getMemStore();
      let referral: { id: string; referrer: string; code: string } | undefined;
      for (const r of memReferrals.values()) {
        if (r.code.toLowerCase() === ref.trim().toLowerCase()) {
          referral = r;
          break;
        }
      }
      if (referral && referral.referrer.toLowerCase() !== address.toLowerCase()) {
        if (!memReferralSettlements.has(address)) {
          memReferralSettlements.set(address, {
            referralId: referral.id,
            referee: address,
            settledAt: Date.now(),
          });
          const { rewardReferralPair } = await import("@/lib/settle");
          await rewardReferralPair(referral.id, referral.referrer, address);
        }
      }
    } catch {}
  }

  const token = await setSession(address);
  // No milestone drip here: the welcome reward fires on first SETTLEMENT
  // (settleAct), never on login — logins are free, settlements are not.
  // The token is ALSO returned in the body: Nimiq Pay loads the app in a
  // cross-origin iframe where third-party cookies can be blocked, so the
  // client persists it (localStorage) and sends it as
  // `Authorization: Bearer <token>` on every /api call.
  return NextResponse.json({ address, token });
}
