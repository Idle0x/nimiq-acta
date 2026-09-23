import * as Nimiq from "@nimiq/core";

/** Network minimum fee. Never charge 0 (some nodes reject it), never 0.5 (looks like a bug). */
export const MIN_FEE_NIM = 0.0001;

/**
 * Payouts are serialized through a single queue: Nimiq accounts use sequential
 * nonces, so two concurrent settlements would collide and one would fail after
 * funds logic already ran. One at a time, always.
 * NOTE: per-instance on serverless. If you scale beyond one instance, move the
 * lock to Postgres (pg_advisory_xact_lock) — see UX_NOTES.
 */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const next = queue.then(job, job);
  queue = next.catch(() => {});
  return next;
}

function rpcUrl() {
  return process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
}

async function rpcCall(method: string, params: unknown[]): Promise<any> {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: Date.now() % 100000 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`RPC ${method}: ${data.error.message || JSON.stringify(data.error)}`);
  return data.result?.data;
}

function deriveVaultKeyPair(): Nimiq.KeyPair {
  const seedPhrase = process.env.VAULT_SEED_PHRASE;
  if (!seedPhrase) throw new Error("Backend Vault Seed Phrase not configured in environment.");

  let extPrivKey: Nimiq.ExtendedPrivateKey;
  try {
    extPrivKey = Nimiq.MnemonicUtils.mnemonicToExtendedPrivateKey(seedPhrase.trim());
  } catch {
    const entropy = Nimiq.MnemonicUtils.mnemonicToEntropy(seedPhrase.trim()).serialize();
    extPrivKey = Nimiq.ExtendedPrivateKey.generateMasterKey(entropy);
  }

  const expectedAddr = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
  const cleanExpected = expectedAddr ? expectedAddr.replace(/\s+/g, "").toUpperCase() : null;

  const candidatePaths = [
    "m/44'/242'/0'/0'",
    "m/44'/242'/0'",
    "m/44'/242'/0'/0",
    "m/44'/242'/0'/0/0",
  ];

  if (cleanExpected) {
    for (const path of candidatePaths) {
      try {
        const privKey = extPrivKey.derivePath(path).privateKey;
        const kp = Nimiq.KeyPair.derive(privKey);
        if (kp.publicKey.toAddress().toUserFriendlyAddress().replace(/\s+/g, "").toUpperCase() === cleanExpected) {
          return kp;
        }
      } catch {}
    }
  }

  const defaultPriv = extPrivKey.derivePath("m/44'/242'/0'/0'").privateKey;
  return Nimiq.KeyPair.derive(defaultPriv);
}

/** Live vault balance in NIM — used by the dashboard so the treasury card reconciles with the chain. */
export async function getVaultBalanceNIM(): Promise<number> {
  if (!process.env.VAULT_SEED_PHRASE) {
    // Dev only: a placeholder so the treasury card renders. Never a real number.
    if (process.env.NODE_ENV === "production") return 0;
    return 42500;
  }
  try {
    const sender = deriveVaultKeyPair().publicKey.toAddress().toUserFriendlyAddress();
    const balanceLunas = BigInt((await rpcCall("getAccountByAddress", [sender]))?.balance ?? "0");
    return Number(balanceLunas) / 100_000;
  } catch {
    return 0;
  }
}

export async function executeVaultPayout(
  recipientAddress: string,
  amountNIM: number,
  feeNIM: number = MIN_FEE_NIM,
  message: string = "Acta Protocol: Settlement Release"
): Promise<string> {
  return enqueue(async () => {
    if (!process.env.VAULT_SEED_PHRASE) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("VAULT_SEED_PHRASE not configured — refusing to simulate a settlement in production.");
      }
      console.warn("VAULT_SEED_PHRASE not set — simulating vault payout for dev/testing");
      return "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    const keyPair = deriveVaultKeyPair();
    const sender = keyPair.publicKey.toAddress();
    const networkId = parseInt(process.env.NIMIQ_NETWORK_ID || "24", 10);

    const recipient = Nimiq.Address.fromString(recipientAddress.trim());
    const valueLunas = BigInt(Math.round(amountNIM * 100_000));
    const feeLunas = BigInt(Math.round(Math.max(feeNIM, MIN_FEE_NIM) * 100_000));

    // Fail fast with a clear reason instead of broadcasting a doomed transaction.
    const balanceLunas = BigInt((await rpcCall("getAccountByAddress", [sender.toUserFriendlyAddress()]))?.balance ?? "0");
    if (balanceLunas < valueLunas + feeLunas) {
      throw new Error(
        `Vault balance ${(Number(balanceLunas) / 100_000).toFixed(4)} NIM < payout ${amountNIM} NIM + fee`
      );
    }

    const blockHeight = await rpcCall("getBlockNumber", []);
    if (typeof blockHeight !== "number") throw new Error("Failed to fetch block number from RPC");

    const rawMsg = message?.trim() || "Acta Protocol: Settlement Release";
    const encoder = new TextEncoder();
    let msgBytes = encoder.encode(rawMsg);
    if (msgBytes.length > 64) {
      const decoder = new TextDecoder("utf-8");
      msgBytes = encoder.encode(decoder.decode(msgBytes.subarray(0, 64)).replace(/\uFFFD/g, ""));
    }
    const tx = Nimiq.TransactionBuilder.newBasicWithData(
      sender,
      recipient,
      msgBytes,
      valueLunas,
      feeLunas,
      blockHeight,
      networkId
    );
    tx.sign(keyPair, undefined as any);
    const txHex = tx.toHex();

    const txHash = await rpcCall("sendRawTransaction", [txHex]);
    // CRITICAL: a failed broadcast must NEVER resolve with a hash — the old code did,
    // which recorded settlements for payments that never happened.
    if (typeof txHash !== "string" || txHash.length === 0) {
      throw new Error(`Broadcast returned no transaction hash for ${recipientAddress}`);
    }
    return txHash;
  });
}

/**
 * Whether inbound funding must be proven on-chain before recording.
 * Always in production. In dev, only when a real vault is configured —
 * simulated-vault dev mode has no chain to prove against.
 */
export function shouldVerifyInbound(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  return !!process.env.VAULT_SEED_PHRASE;
}

/**
 * Inbound funding verification (read-only RPC, no keys needed).
 * Before the protocol records a lock or a funded bounty, it MUST prove the
 * funder actually moved the money: the tx must exist on-chain, come FROM the
 * claimed locker, go TO the vault, and carry at least the expected lunas.
 * Without this, anyone can register client-asserted funding and the treasury
 * later pays out against money that never arrived.
 */
export async function verifyInboundLock(args: {
  txHash: string;
  expectedSender: string;
  expectedRecipient: string;
  minAmountLunas: bigint;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  let rawHash = args.txHash;
  if (typeof rawHash === "object" && rawHash !== null) {
    rawHash = (rawHash as any).hash || (rawHash as any).transactionHash || (rawHash as any).id || "";
  }
  const cleanHash = String(rawHash || "").trim().replace(/^0x/, "");
  if (!cleanHash) return { ok: false, error: "Missing lock transaction hash" };

  let tx: unknown = null;
  const maxAttempts = 6;
  const delays = [800, 1200, 1500, 2000, 2500, 3000];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      tx = await rpcCall("getTransactionByHash", [cleanHash]);
      if (tx && typeof tx === "object") break;
    } catch {
      // fresh transaction still propagating in mempool / block forging
    }

    // Fallback: check recent vault transactions via getTransactionsByAddress
    if (args.expectedRecipient) {
      try {
        const cleanVault = args.expectedRecipient.replace(/\s+/g, "").toUpperCase();
        const recentTxs = await rpcCall("getTransactionsByAddress", [cleanVault, 25, null]);
        if (Array.isArray(recentTxs)) {
          const match = recentTxs.find((item: any) => {
            const h = String(item?.hash || item?.transactionHash || "").replace(/^0x/, "").toLowerCase();
            return h === cleanHash.toLowerCase();
          });
          if (match) {
            tx = match;
            break;
          }
        }
      } catch {
        // non-blocking fallback
      }
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }

  if (!tx || typeof tx !== "object") {
    return { ok: false, error: "Lock transaction not confirmed on-chain yet (propagating)" };
  }

  const t = tx as Record<string, unknown>;
  const norm = (a: unknown) => String(a ?? "").replace(/\s+/g, "").toUpperCase();
  // Nimiq RPC shape: { hash, from, to, value (lunas, number), networkId,
  // executionResult }. Aliases kept for RPC-shape drift.
  const sender = norm(t.sender ?? t.from);
  const recipient = norm(t.recipient ?? t.to);
  const hash = norm(t.hash ?? t.transactionHash ?? cleanHash);
  if (hash !== norm(cleanHash)) {
    return { ok: false, error: "Lock transaction hash mismatch" };
  }
  if (t.executionResult === false) {
    return { ok: false, error: "Lock transaction failed on-chain" };
  }
  const expectedNetwork = parseInt(process.env.NIMIQ_NETWORK_ID || "24", 10);
  if (typeof t.networkId === "number" && t.networkId !== expectedNetwork) {
    return { ok: false, error: "Lock transaction is on the wrong network" };
  }
  if (sender !== norm(args.expectedSender)) {
    return { ok: false, error: "Lock transaction was not sent by the locker" };
  }
  if (recipient !== norm(args.expectedRecipient)) {
    return { ok: false, error: "Lock transaction did not pay the protocol vault" };
  }
  let valueLunas = BigInt(0);
  try {
    valueLunas = BigInt((t.value ?? t.amount ?? 0) as string | number | bigint);
  } catch {
    return { ok: false, error: "Lock transaction value unreadable" };
  }
  if (valueLunas < args.minAmountLunas) {
    return { ok: false, error: "Lock transaction value below the locked amount" };
  }
  return { ok: true };
}
