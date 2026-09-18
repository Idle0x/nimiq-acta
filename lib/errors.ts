// Human errors: raw chain/vault/db failures become sentences that say
// whose fault it is and what to do. Never leak key material or internals.

export function humanize(input: unknown): string {
  const raw = input instanceof Error ? input.message : String(input ?? "");
  const s = raw.toLowerCase();
  const has = (...ks: string[]) => ks.some((k) => s.includes(k));
  if (has("vault balance", "insufficient funds", "vault < payout", "doomed transaction")) {
    return "The protocol vault is empty — the operator must fund it before anyone can be paid. Your proof and lock are safe; retry after funding.";
  }
  if (has("vault seed phrase", "seed phrase not configured")) {
    return "Payouts are not configured on this deployment (vault key missing). Contact the operator.";
  }
  if (has("no db", "db unavailable", "database", "neon", "fetch failed", "networkerror", "failed to fetch")) {
    return "The database is unreachable — your funds on-chain are untouched. Check connection and retry.";
  }
  if (has("openai_api_key", "vision", "oracle busy", "429", "502", "unparseable oracle")) {
    return "The AI oracle is unavailable or busy — nothing was judged, nothing moved. Wait a minute and retry.";
  }
  if (has("broadcast", "rpc", "block number", "no transaction hash")) {
    return "The Nimiq network rejected the broadcast — no funds moved. Retry; persistent failure means node trouble, not your wallet.";
  }
  if (has("invalid signature", "malformed key", "sign")) {
    return "Signature rejected — reconnect Nimiq Pay and sign again.";
  }
  if (has("nonce", "expired", "challenge")) {
    return "Your login challenge expired — sign in again and retry the action.";
  }
  if (has("unauthorized", "not authenticated", "401")) {
    return "Sign in with Nimiq Pay first — one signature, then act.";
  }
  if (has("closed to new accepts")) {
    return "This listing is closed to new accepts — active contracts still run their course.";
  }
  if (has("no longer open", "already settled", "already completed", "already used")) {
    return "Too late — this already settled or closed. Nothing was charged.";
  }
  if (has("trust >=", "trust >=", "requires trust")) {
    return raw; // already human (states the threshold)
  }
  return raw || "Something failed — nothing moved. Retry once before worrying.";
}
