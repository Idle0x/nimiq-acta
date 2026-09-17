import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
ed.hashes.sha512 = sha512;
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  try {
    const { address, publicKeyHex, signatureHex, nonce } = await req.json();
    const msg = new TextEncoder().encode(nonce);
    const pub = Uint8Array.from(Buffer.from(publicKeyHex, "hex"));
    const sig = Uint8Array.from(Buffer.from(signatureHex, "hex"));
    const isValid = await ed.verifyAsync(sig, msg, pub);
    if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    
    // Background milestone trigger
    checkAndAwardMilestone(address, "FIRST_CONNECTION").catch(() => {});

    await setSession(address);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Auth failed" }, { status: 400 });
  }
}
