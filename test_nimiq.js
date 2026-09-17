const Nimiq = require('@nimiq/core');
(async () => {
  await Nimiq.WasmHelper.doImport();
  // Generate a random wallet to see its properties
  const wallet = await Nimiq.Wallet.generate();
  console.log('Address:', wallet.address.toUserFriendlyAddress());
  console.log('Private Key Hex:', wallet.keyPair.privateKey.toHex());
})();
