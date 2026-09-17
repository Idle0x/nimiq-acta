const Nimiq = require('@nimiq/core');
const seed = Nimiq.MnemonicUtils.mnemonicToEntropy("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art").serialize();
const extPrivKey = Nimiq.ExtendedPrivateKey.generateMasterKey(seed);
const privKey = extPrivKey.derivePath("m/44'/242'/0'/0'").privateKey;
const keyPair = Nimiq.KeyPair.derive(privKey);
const sender = keyPair.publicKey.toAddress();
const recipient = Nimiq.Address.fromUserFriendlyAddress("NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT");
try {
  let tx = Nimiq.TransactionBuilder.newBasic(sender, recipient, BigInt(1000), BigInt(10), 61846762, 24);
  tx.sign(keyPair, undefined);
  console.log("Success tx hash:", tx.hash());
} catch (e) {
  console.log("Error:", e.message);
}
