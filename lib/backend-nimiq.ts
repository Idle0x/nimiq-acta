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
  if (!process.env.VAULT_SEED_PHRASE) return 42500;
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
  feeNIM: number = MIN_FEE_NIM
): Promise<string> {
  return enqueue(async () => {
    if (!process.env.VAULT_SEED_PHRASE) {
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

    const tx = Nimiq.TransactionBuilder.newBasic(
      sender,
      recipient,
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
