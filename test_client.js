require('fake-indexeddb/auto');
const { ClientConfiguration, Client } = require('@nimiq/core');
(async () => {
  const config = new ClientConfiguration();
  config.network("main-albatross");
  try {
    const client = await Client.create(config.build());
    const block = await client.getBlockNumber();
    console.log("Block number:", block);
    process.exit(0);
  } catch(e) {
    console.error("Error:", e);
    process.exit(1);
  }
})();
