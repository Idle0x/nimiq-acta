import * as Nimiq from "@nimiq/core";

export async function executeVaultPayout(
  recipientAddress: string,
  amountNIM: number,
  feeNIM: number = 0.5
): Promise<string> {
  const seedPhrase = process.env.VAULT_SEED_PHRASE;
  const rpcUrl = process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
  const networkId = parseInt(process.env.NIMIQ_NETWORK_ID || "24", 10);

  if (!seedPhrase) {
    throw new Error("Backend Vault Seed Phrase not configured in environment.");
  }

  // 1. Derive KeyPair
  const entropy = Nimiq.MnemonicUtils.mnemonicToEntropy(seedPhrase).serialize();
  const extPrivKey = Nimiq.ExtendedPrivateKey.generateMasterKey(entropy);
  const privKey = extPrivKey.derivePath("m/44'/242'/0'/0'").privateKey;
  const keyPair = Nimiq.KeyPair.derive(privKey);
  const sender = keyPair.publicKey.toAddress();

  // 2. Fetch current block height for validity_start_height
  const rpcRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getBlockNumber",
      params: [],
      id: 1,
    }),
  });
  const rpcData = await rpcRes.json();
  if (!rpcData || !rpcData.result || typeof rpcData.result.data !== "number") {
    throw new Error("Failed to fetch block number from RPC");
  }
  const blockHeight = rpcData.result.data;

  // 3. Construct and Sign Transaction
  const recipient = Nimiq.Address.fromUserFriendlyAddress(recipientAddress);
  const valueLunas = BigInt(Math.round(amountNIM * 100_000));
  const feeLunas = BigInt(Math.round(feeNIM * 100_000));

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

  // 4. Broadcast via RPC
  const broadcastRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "sendRawTransaction",
      params: [txHex],
      id: 2,
    }),
  });
  const broadcastData = await broadcastRes.json();

  if (broadcastData.error) {
    throw new Error(`RPC Broadcast Error: ${broadcastData.error.message || JSON.stringify(broadcastData.error)}`);
  }

  return broadcastData.result?.data || tx.hash();
}
