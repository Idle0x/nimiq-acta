// Cached auth: ping session first so the wallet signature sheet appears
// once per session, not once per action. Message format MUST match
// app/api/auth/verify (Acta login + nonce) — server derives the address
// from the verified pubkey and never trusts client-supplied addresses.
"use client";

let cachedFor: string | null = null;
const TOKEN_KEY = "acta_session_token";

export function normalizeAddress(addr?: string | null): string {
  return addr ? addr.replace(/\s+/g, "").toUpperCase() : "";
}

export function toHex(v: unknown): string {
  if (!v) return "";
  if (v instanceof Uint8Array) {
    return Array.from(v).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  if (Array.isArray(v)) {
    return v.map((b) => Number(b).toString(16).padStart(2, "0")).join("");
  }
  if (typeof v === "object" && v !== null) {
    const vals = Object.values(v);
    if (vals.length > 0 && typeof vals[0] === "number") {
      return vals.map((b) => Number(b).toString(16).padStart(2, "0")).join("");
    }
  }
  if (typeof v === "string") {
    const clean = v.trim().replace(/^0x/, "");
    if (/^[0-9a-fA-F]+$/.test(clean) && clean.length % 2 === 0) {
      return clean.toLowerCase();
    }
    try {
      if (typeof atob === "function") {
        const bin = atob(clean);
        return Array.from(bin)
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("");
      }
    } catch {}
    return clean.toLowerCase();
  }
  return String(v);
}

let memoryToken: string | null = null;

export function getSessionToken(): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
  } catch {}
  return memoryToken;
}

export function saveSessionToken(t: string | null | undefined) {
  memoryToken = t ?? null;
  try {
    if (typeof localStorage !== "undefined") {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    }
  } catch { /* private mode */ }
}

export function clearSessionToken() {
  cachedFor = null;
  memoryToken = null;
  saveSessionToken(null);
}

/** Headers that carry the iframe-safe bearer fallback (see lib/session.ts). */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const t = getSessionToken();
  const h: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
  if (extra) {
    if (extra instanceof Headers) extra.forEach((v, k) => { h[k] = v; });
    else if (Array.isArray(extra)) for (const [k, v] of extra) h[k] = v;
    else Object.assign(h, extra);
  }
  return h;
}

/** Same-origin fetch that always sends cookies AND the bearer fallback. */
export function apiFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (input instanceof Request) {
    const headers = new Headers(input.headers);
    const t = getSessionToken();
    if (t && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${t}`);
    }
    return fetch(new Request(input, { ...init, headers, credentials: "include" }));
  }
  return fetch(input, {
    ...init,
    credentials: "include",
    headers: authHeaders(init?.headers as HeadersInit | undefined) as HeadersInit,
  });
}

let patchInstalled = false;
/**
 * Global safety net: auto-attach cookies + bearer token to EVERY /api fetch,
 * including components that still call plain fetch().
 */
export function installAuthFetchPatch() {
  if (patchInstalled || typeof window === "undefined") return;
  try {
    const orig = globalThis.fetch;
    if (!orig || (orig as unknown as { __actaPatched?: boolean }).__actaPatched) return;
    const patched = (async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        let url = "";
        if (typeof input === "string") {
          url = input;
        } else if (input instanceof URL) {
          url = input.pathname + input.search;
        } else if (input && typeof input === "object" && "url" in input) {
          url = (input as Request).url;
        }

        if (typeof url === "string" && (url.startsWith("/api/") || url.includes("/api/"))) {
          const t = getSessionToken();
          if (t) {
            if (input instanceof Request) {
              const headers = new Headers(input.headers);
              if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${t}`);
              return orig(new Request(input, { ...init, headers, credentials: "include" }));
            }
            const headers = new Headers(init?.headers);
            if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${t}`);
            return orig(input, { ...init, credentials: "include", headers });
          }
        }
      } catch { /* fall through to plain fetch */ }
      return orig(input as RequestInfo, init);
    }) as typeof fetch;
    (patched as unknown as { __actaPatched?: boolean }).__actaPatched = true;
    globalThis.fetch = patched;
    patchInstalled = true;
  } catch { /* non-browser */ }
}

// Auto-install fetch patch immediately on client bundle load
if (typeof window !== "undefined") {
  installAuthFetchPatch();
}

async function claimPendingReferral(addr?: string) {
  try {
    if (typeof window === "undefined") return;
    const urlRef = new URLSearchParams(window.location.search).get("ref");
    const storedRef = localStorage.getItem("acta_ref");
    const code = urlRef || storedRef;
    if (code) {
      await apiFetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, address: addr }),
      }).catch(() => {});
      localStorage.removeItem("acta_ref");
    }
  } catch {}
}

export async function ensureAuthed(
  address: string | undefined,
  signMessage: (msg: string) => Promise<{ publicKey: unknown; signature: unknown }>
): Promise<boolean> {
  if (!address) return false;
  const normAddr = normalizeAddress(address);
  if (!normAddr) return false;

  if (cachedFor && normalizeAddress(cachedFor) === normAddr) {
    return true;
  }

  // 1. Session probe first — avoids re-signing on every action.
  const probe = await apiFetch("/api/auth/session", { cache: "no-store" }).catch(() => null);
  if (probe && probe.ok) {
    // The session must belong to THIS address — a stale session for a
    // different account must re-auth, not silently act as the wrong identity.
    try {
      const who = ((await probe.json()) as { address?: string })?.address;
      if (normalizeAddress(who) === normAddr) {
        cachedFor = address;
        claimPendingReferral(address);
        return true;
      }
    } catch {
      cachedFor = address;
      claimPendingReferral(address);
      return true;
    }
  }

  try {
    const chal = await apiFetch("/api/auth/challenge");
    if (!chal.ok) return false;
    const { nonce } = await chal.json();
    const message = `Acta login\n\nNonce: ${nonce}`;
    const sigRes = await signMessage(message);

    const pk = (sigRes as any)?.publicKey ?? (sigRes as any)?.signerPublicKey ?? (sigRes as any)?.pubKey;
    const sig = (sigRes as any)?.signature ?? (sigRes as any)?.sig;
    if (!pk || !sig) return false;

    let ref: string | null = null;
    try {
      ref = new URLSearchParams(window.location.search).get("ref");
      if (!ref) ref = localStorage.getItem("acta_ref");
      else localStorage.setItem("acta_ref", ref);
    } catch { /* non-browser */ }

    const res = await apiFetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: toHex(pk),
        signature: toHex(sig),
        nonce,
        ...(ref ? { ref } : {}),
      }),
    });
    if (res.ok) {
      try {
        const data = (await res.json()) as { address?: string; token?: string };
        if (data?.token) {
          saveSessionToken(data.token);
        }
      } catch { /* body already consumed? still authed */ }
      try { localStorage.removeItem("acta_ref"); } catch {}
      cachedFor = address;
      claimPendingReferral(address);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
