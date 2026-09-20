// Cached auth: ping session first so the wallet signature sheet appears
// once per session, not once per action. Message format MUST match
// app/api/auth/verify (Acta login + nonce) — server derives the address
// from the verified pubkey and never trusts client-supplied addresses.
"use client";

let cachedFor: string | null = null;

const TOKEN_KEY = "acta_session_token";

function toHex(v: unknown): string {
  if (typeof v === "string") return v.replace(/^0x/, "");
  return Array.from(v as Uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveSessionToken(t: string | null | undefined) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
  } catch { /* private mode */ }
}

/** Headers that carry the iframe-safe bearer fallback (see lib/session.ts). */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const t = getSessionToken();
  if (!t) return extra ?? {};
  const h: Record<string, string> = { Authorization: `Bearer ${t}` };
  if (extra) {
    if (extra instanceof Headers) extra.forEach((v, k) => { h[k] = v; });
    else if (Array.isArray(extra)) for (const [k, v] of extra) h[k] = v;
    else Object.assign(h, extra);
  }
  return h;
}

/** Same-origin fetch that always sends cookies AND the bearer fallback. */
export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
    headers: authHeaders(init?.headers as HeadersInit | undefined) as HeadersInit,
  });
}

let patchInstalled = false;
/**
 * Global safety net: auto-attach cookies + bearer token to EVERY /api fetch,
 * including components that still call plain fetch(). Call once on app mount.
 */
export function installAuthFetchPatch() {
  if (patchInstalled) return;
  try {
    const orig = globalThis.fetch;
    if ((orig as unknown as { __actaPatched?: boolean }).__actaPatched) return;
    const patched = (async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : (input as Request).url;
        if (typeof url === "string" && url.includes("/api/")) {
          const t = getSessionToken();
          const headers = new Headers(
            (input instanceof Request ? input.headers : init?.headers) as HeadersInit | undefined
          );
          if (t && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${t}`);
          if (input instanceof Request) {
            return orig(new Request(input, { headers, credentials: "include" }), init);
          }
          return orig(input, { ...init, credentials: "include", headers });
        }
      } catch { /* fall through to plain fetch */ }
      return orig(input as RequestInfo, init);
    }) as typeof fetch;
    (patched as unknown as { __actaPatched?: boolean }).__actaPatched = true;
    globalThis.fetch = patched;
    patchInstalled = true;
  } catch { /* non-browser */ }
}

export async function ensureAuthed(
  address: string | undefined,
  signMessage: (msg: string) => Promise<{ publicKey: unknown; signature: unknown }>
): Promise<boolean> {
  if (!address) return false;
  if (cachedFor === address) return true;

  const probe = await apiFetch("/api/auth/session", { cache: "no-store" }).catch(() => null);
  if (probe && probe.ok) {
    // The session must belong to THIS address — a stale session for a
    // different account must re-auth, not silently act as the wrong identity.
    try {
      const who = ((await probe.json()) as { address?: string })?.address;
      if (who === address) {
        cachedFor = address;
        return true;
      }
    } catch {
      cachedFor = address;
      return true;
    }
  }

  try {
    const chal = await apiFetch("/api/auth/challenge");
    const { nonce } = await chal.json();
    const message = `Acta login\n\nNonce: ${nonce}`;
    const sig = await signMessage(message);

    let ref: string | null = null;
    try {
      ref = new URLSearchParams(window.location.search).get("ref");
    } catch { /* non-browser */ }

    const res = await apiFetch("/api/auth/verify", {
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
      try {
        const data = (await res.json()) as { address?: string; token?: string };
        saveSessionToken(data.token);
      } catch { /* body already consumed? still authed */ }
      cachedFor = address;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
