// Drop-in cached auth for the client. Replaces the ensureAuth callback in
// app/page.tsx — pings the session endpoint first so the wallet signature
// sheet only appears once per session, not once per action.
"use client";

let cachedFor: string | null = null;

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
    const sig = await signMessage(nonce);

    const toHex = (v: unknown) =>
      typeof v === "string"
        ? v.replace(/^0x/, "")
        : "0x" +
          Array.from(v as Uint8Array)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKeyHex: toHex(sig.publicKey),
        signatureHex: toHex(sig.signature),
        nonce,
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
