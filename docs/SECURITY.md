# Acta Security Model & Threat Assessment

Acta enforces proof-of-action verification between untrusted parties. The protocol assumes that clients, networks, and participants may attempt to spoof proofs, forge sessions, replay tokens, or race condition payouts.

Below is the comprehensive threat model, mitigation architecture, and residual risk disclosure.

---

## Threat Matrix

| Attack Vector | Potential Impact | Architectural Mitigation | Residual Risk | Code Reference |
|---|---|---|---|---|
| **Session Forgery** | Attacker impersonates another Nimiq address | Session cookies are signed server-side using HMAC-SHA256 (`ENCRYPTION_KEY`). Address is derived from verified Ed25519 pubkey, not client input. Verified using `crypto.timingSafeEqual`. | Server secret compromise would permit cookie forgery. Mitigated by rotation support. | [`lib/session.ts#L9-L48`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/session.ts#L9-L48) |
| **Address Spoofing** | Attacker claims ownership of an arbitrary NQ address | The login endpoint requires signing a random challenge. The backend derives the address directly from the verified Ed25519 public key using `@nimiq/core`. Client-declared addresses are rejected. | None under Ed25519 hardness. | [`app/api/auth/verify/route.ts#L35-L65`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/auth/verify/route.ts#L35-L65) |
| **Auth Nonce Replay** | Attacker intercepts and replays a signed auth challenge | Nonces are generated with a 2-minute TTL in PostgreSQL and deleted immediately upon first consumption. | Clock skew > 2 minutes on unsynchronized nodes. | [`lib/db.ts#L133-L134`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/db.ts#L133-L134) |
| **QR / ScanQuest Token Replay** | QR token copied and reused by multiple parties | Cryptographic tokens include a random 96-bit nonce, listing ID, and 10-minute expiry timestamp. Nonces are recorded in `consumed_nonces` inside an atomic transaction. | Token shared within the 10-minute active window before initial scan. Mitigated by optional scene photo verification. | [`lib/qr.ts#L41-L89`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/qr.ts#L41-L89) |
| **Double Payout Race Condition** | Concurrent submissions attempt to claim the same bounty | State changes use conditional SQL (`UPDATE ... WHERE state = 'open' RETURNING ...`). Only one worker acquires the row lock; all concurrent requests fail. | None under PostgreSQL row-level locking. | [`lib/settle.ts#L18-L45`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/settle.ts#L18-L45) |
| **Idempotency Duplication** | Network retries cause double payouts or locks | Requests carry an `Idempotency-Key` header stored in `idempotent_actions`. Duplicate requests replay the cached response without re-executing transactions. | Storage retention limits. | [`lib/idempotency.ts#L1-L35`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/idempotency.ts#L1-L35) |
| **Nonce Collisions on Chain** | Concurrent settlements from vault hot-wallet collide | Payout transactions pass through a FIFO serialization queue in the Node.js process, preventing sequence/nonce collisions on Albatross. | Multiple serverless instances requires central distributed locking (e.g. `pg_advisory_xact_lock`). | [`lib/backend-nimiq.ts#L13-L18`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/backend-nimiq.ts#L13-L18) |
| **Oracle Hallucination / Bypass** | Submitting irrelevant or generated photos to drain bounties | System prompt enforces strict alignment against sponsor's criteria verbatim. Model defaults to `pass=false` on any doubt. Unparseable replies yield 502 retryable errors, never recorded verdicts. | Sophisticated adversarial physical presentation or high-res screen displays. Addressed in production roadmap via live hardware camera attestation. | [`lib/vision.ts#L28-L57`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/vision.ts#L28-L57) |
| **GPS Location Spoofing** | Solver fakes HTML5 Geolocation coordinates | Geolocation requires accuracy < 50m and distance within radius. Optional photo-at-location presence check backstops GPS with visual scene validation. | Rooted mobile devices faking browser geolocation APIs. Production requires hardware attestation SDK. | [`app/api/bounty/geo/route.ts#L46-L70`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/geo/route.ts#L46-L70) |
| **Hot Wallet Key Compromise** | Server environment access compromises vault funds | The vault hot-wallet key is isolated in server environment variables. Holds only operating float; deposits and locks are verifiable on-chain. | Server host compromise. Mitigated long-term by transitioning to native Nimiq HTLCs. | [`lib/backend-nimiq.ts#L35-L65`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/backend-nimiq.ts#L35-L65) |

---

## Core Security Primitives

### 1. Cryptographic Handshake (Borrowing & ScanQuest)
Returning a borrowed item or solving a physical QR quest relies on `@noble/ed25519`. The lender or creator creates an ephemeral keypair:
```typescript
const payload = { escrowId, amount, chain: "nimiq-albatross", nonce, exp };
const signature = await ed.signAsync(new TextEncoder().encode(JSON.stringify(payload)), privKey);
```
Verification checks the signature against the registered lender public key and verifies that the nonce has never been consumed in PostgreSQL.

### 2. Ed25519 Wallet Authentication
Rather than trusting a client-sent address string, the client signs an ephemeral challenge string:
```typescript
const isValid = Nimiq.Signature.deserialize(sigBytes).verify(pubKey, messageBytes);
const derivedAddress = pubKey.toAddress().toUserFriendlyAddress();
```
The authenticated user session is cryptographically bound to the private key held in Nimiq Pay.

### 3. Fail-Closed Oracle Architecture
Oracles never fail open. If the vision endpoint times out, returns malformed JSON, or exceeds rate limits, the handler responds with HTTP 502 and `retryable: true`. No state changes occur, no fees are deducted, and no payout is released until valid verification is achieved.
