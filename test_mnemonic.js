const { MnemonicUtils, ExtendedPrivateKey, KeyPair } = require('@nimiq/core');
const words = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art";
try {
  const entropy = MnemonicUtils.mnemonicToEntropy(words);
  const extPrivKey = ExtendedPrivateKey.generateMasterKey(entropy.serialize());
  const extPrivKeyDer = extPrivKey.derivePath("m/44'/242'/0'/0'");
  const privKey = extPrivKeyDer.privateKey;
  const keyPair = KeyPair.derive(privKey);
  console.log("Derived Address:", keyPair.publicKey.toAddress().toUserFriendlyAddress());
  console.log("Derived Private Key Hex:", privKey.toHex());
} catch(e) {
  console.error("Error:", e.message);
}
