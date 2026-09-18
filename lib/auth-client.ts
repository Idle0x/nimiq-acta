// Cached auth: ping session first so the wallet signature sheet appears
// once per session, not once per action. Message format MUST match
// app/api/auth/verify (Acta login + nonce) — server derives the address
// from the verified pubkey and never trusts client-supplied addresses.
"use client";

let cachedFor: string | null = null;

function toHex(v: unknown): string {
  if (typeof v === "string") return v.replace(/^0x/, "");
  return Array.from(v as Uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function ensureAuthed(
  address: string | undefined,
  signMessage: (msg: string) => Promise<{ publicKey: unknown; signature: unknown }>
): Promise<boolean> {
  if (!address) return false;
  if (cachedFor === address) return true;

  const probe = await fetch("/api/auth/session", { cache: "no-store" }).catch(() => null);
  if (probe && probe.ok) {
    cachedFor = address;
    return true;
  }

  try {
    const chal = await fetch("/api/auth/challenge");
    const { nonce } = await chal.json();
    const message = `Acta login\n\nNonce: ${nonce}`;
    const sig = await signMessage(message);

    let ref: string | null = null;
    try {
      ref = new URLSearchParams(window.location.search).get("ref");
    } catch { /* non-browser */ }

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: toHex(sig.publicKey),
        signature: toHex(sig.signature),
        nonce,
        ...(ref ? { ref } : {}),
      }),
    });
    if (res.ok) {
      cachedFor = address;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
