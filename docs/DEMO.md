# Acta Demo Walkthrough & Video Guide

This guide details the walkthrough featured in the [Acta Demo Video](https://youtu.be/eLxVdYTx0Lo).

---

## Walkthrough

### Identity & The Vault
1. **Launch Acta Mini App:** Open the app within Nimiq Pay or test environment.
2. **Cryptographic Sign-In:** The app prompts a signature challenge via `window.nimiq.sign()`. The server derives the Nimiq address directly from the verified Ed25519 public key.
3. **Live Treasury Reconciliation:** Inspect the Treasury Card. The on-chain vault address (`NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT`) balance matches the Albatross block explorer down to the luna.

### Escrowed Borrowing Flow
1. **Radar Feed Discovery:** Select a physical item (e.g., Heavy-Duty Rotary Hammer Drill or Camera Lens).
2. **Review Structured Contract:** View required collateral (discounted by borrower's Trust Score v2), duration, and settlement rules.
3. **Lock Collateral on Chain:** Click **Borrow & Lock Collateral**. Confirm the native `sendBasicTransaction()` prompt in Nimiq Pay. The collateral locks directly into the protocol vault with an on-chain transaction hash (`tx_hash_in`).
4. **Physical Return & Cryptographic Handshake:** When returning the item, the lender generates a single-use Ed25519-signed Return Code.
5. **Release & Settlement:** The borrower scans the Return Code. The signature verifies, the nonce is consumed, and the vault immediately broadcasts the collateral refund transaction (`tx_hash_out`).

### Multi-Oracle Bounties
1. **ScanQuest:** Solve a scavenger hunt by scanning an Ed25519-signed QR drop.
2. **CheckIn (Geo):** Arrive at a designated geographic landmark; verify GPS coordinates within radius and <50m accuracy (with optional photo scene witness).
3. **PhotoProof (Vision):** Snap an image for a verification challenge. The multimodal AI judge evaluates the photo strictly against the sponsor's criteria verbatim.

### Reputation & Settlement Receipts
1. **Passport Dashboard:** View the updated Trust Score v2 radar breakdown across completion, volume, tenure, oracle diversity, and community participation.
2. **Receipts & History:** Open the settlement notification in the Inbox; click through the transaction link directly to [nim.re/explorer](https://nim.re/explorer).
3. **Collectible Stamps:** View newly minted on-chain activity stamps commemorating the completed act.

---

## Verifiable Artifacts

- **Live Mini App:** [https://nimiq-acta.vercel.app](https://nimiq-acta.vercel.app)
- **Demo Video:** [https://youtu.be/eLxVdYTx0Lo](https://youtu.be/eLxVdYTx0Lo)
- **Vault Address:** [NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT](https://nim.re/explorer/address/NQ86%20845N%20NUJ3%2088U4%202V9E%20DEDF%20XV8Y%20CFES%208RKT)
