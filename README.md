# Acta

> **Money moves when reality changes.**

Acta is a proof-of-action protocol for Nimiq Pay: escrowed borrowing and funded bounties that settle only when a verifier — an AI judge, a cryptographic QR signature, GPS coordinates, or the sponsor's own signature — confirms the act happened. The act can be anywhere: a livestream, a Discord server, a Telegram channel, a live event, or a street corner. Collateral and rewards move as real NIM transactions; every settlement carries a transaction hash.

[Live demo](https://nimiq-acta.vercel.app) · [Demo video](https://youtu.be/eLxVdYTx0Lo) · Built on [Nimiq Pay](https://www.nimiq.com)

> **Network:** The deployed demo runs on **Nimiq Testnet (Albatross PoS)**. Every address and transaction hash in this document is real, live, and verifiable on the explorer at [nim.re/explorer](https://nim.re/explorer).

---

## Contents

- [What Acta is](#what-acta-is)
- [Why](#why)
- [Watch it work](#watch-it-work)
- [Verify it yourself](#verify-it-yourself)
- [The protocol loop](#the-protocol-loop)
- [The four oracles](#the-four-oracles)
- [Feature tour](#feature-tour)
- [Nimiq integration](#nimiq-integration)
- [Architecture](#architecture)
- [Security model](#security-model)
- [Where to look (judging criteria map)](#where-to-look-judging-criteria-map)
- [Automated test suite](#automated-test-suite)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Running Acta](#running-acta)
- [Using Acta](#using-acta)
- [Limitations (disclosed, not hidden)](#limitations-disclosed-not-hidden)
- [Production path](#production-path)
- [License](#license)

---

## What Acta is

Acta turns the Nimiq Pay wallet into a trust engine for any community that pays strangers for outcomes — online or on the street. Three things define it:

1. **A generalized act pipeline.** Every interaction in the app — returning a borrowed drill, completing a photo bounty, scanning a hidden QR token, checking in at a coordinate, getting a human approval — is the same shape: `act → oracle → payout`. One append-only [`acts`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/db.ts#L105-L121) ledger records every settled act and powers trust, streaks, stamps, the leaderboard, and the activity feed.
2. **Four oracle types.** Cryptographic ([Ed25519 QR signatures](https://github.com/Idle0x/nimiq-acta/blob/main/lib/qr.ts#L41-L89)), AI vision (a judged photo via [Qwen3.6](https://github.com/Idle0x/nimiq-acta/blob/main/lib/vision.ts#L28-L57)), geolocation ([GPS radius + accuracy](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/geo/route.ts#L10-L48)), and human escrow (a [sponsor signature](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/manual_approve/route.ts#L30-L105)). Sponsors configure which oracle judges their contract, and PhotoProof criteria are inserted into the model's prompt verbatim.
3. **A self-sustaining treasury.** Every settled payout deducts a `0.0011 NIM` settlement fee (`0.001 NIM` retained in the [`ESCROW_VAULT`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/escrow.ts#L85-L91) protocol vault, `0.0001 NIM` network validator fee). The vault funds milestone drips and referral rewards, and its balance is read live from the chain — the treasury card reconciles with the explorer to the luna.

---

## Why

Every community that pays strangers for outcomes hits the same wall: a streamer running a giveaway, a Discord server posting a quest, a creator commissioning work, a neighbor lending a drill. Nobody trusts screenshots, and escrow usually just means trusting a platform instead. Acta replaces both kinds of trust with verification. Collateral is locked on-chain by the participant's own wallet; rewards are funded by the sponsor before a challenge goes live; release requires proof, not politeness. The platform never holds user keys, and every fund movement carries a transaction hash.

---

## Watch it work

A 60-second recorded demo is the fastest way to see the whole protocol: [Watch the Demo Video](https://youtu.be/eLxVdYTx0Lo) (full script in [`docs/DEMO.md`](docs/DEMO.md)). What to watch for:

1. **Native Nimiq Pay signing:** The wallet initiates locks and claims directly through the `@nimiq/mini-app-sdk`.
2. **Multi-oracle verification:** Proofs are evaluated in real time (AI vision analysis, Ed25519 QR handshake, Haversine GPS check-in).
3. **Immediate on-chain settlement:** Vault releases funds with public transaction hashes confirmed on Albatross PoS.

The climax of the demo is deliberately cryptographic rather than AI: a signature verifying beats a model agreeing.

---

## Verify it yourself

Nothing below requires trusting this document — click through:

| Claim | How to check | Verifiable Link |
|---|---|---|
| **The vault is real and holds NIM** | Open the vault address on the explorer — balance matches the app's treasury card live | [`NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT`](https://nim.re/explorer/address/NQ86%20845N%20NUJ3%2088U4%202V9E%20DEDF%20XV8Y%20CFES%208RKT) |
| **Locks and fundings are real user transactions** | Sample bounty funding transaction: signed by sponsor's address, value deposited to the vault | [Tx `a5ed98...584f`](https://nim.re/explorer/tx/a5ed98a35e3cb18de44b77ccb924cd086c597fa6c0c2dc4d9e73b7e8fdb9584f) (25 NIM) |
| **Payouts and settlements are real** | Sample settlement payout: vault → solver/completer, linked from app receipt and inbox | [Tx `582e0d...9dae`](https://nim.re/explorer/tx/582e0d97be7fb72c927168f6b1cc5f4ef7e4ed5727ff6f437c8d757a6fb49dae) (1 NIM) |
| **The oracle actually judges** | Submit a wrong photo to any PhotoProof bounty — the verdict reasons cite the sponsor's criteria; an unparseable or busy oracle returns a retryable 502 error, never a fake verdict | Verified in [`lib/vision.ts#L28-L57`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/vision.ts#L28-L57) |
| **Sessions cannot be forged** | Session cookies are HMAC-SHA256 signed; modifying the address payload invalidates the signature | Verified in [`lib/session.ts#L25-L48`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/session.ts#L25-L48) (see [`docs/SECURITY.md`](docs/SECURITY.md)) |

---

## The protocol loop

```text
┌──────────┐    ┌───────────────┐    ┌───────────┐    ┌────────────┐
│   ACT    │ →  │    ORACLE     │ →  │   VAULT   │ →  │ ACT LEDGER │
│ anywhere │    │  verifies     │    │  moves    │    │  records   │
│          │    │  proof        │    │  NIM      │    │  forever   │
└──────────┘    └───────────────┘    └───────────┘    └────────────┘
```

---

## The four oracles

| Oracle | Proof it verifies | How | AI role | Code Implementation |
|---|---|---|---|---|
| **PhotoProof** | A photo proves the task was done | Vision model ([Qwen3.6](https://github.com/Idle0x/nimiq-acta/blob/main/lib/vision.ts#L3-L12) via Hetzner Inference) judges the image strictly against the sponsor's written criteria | Non-negotiable judge | [`lib/vision.ts#L28-L57`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/vision.ts#L28-L57) |
| **ScanQuest** | A signed token the sponsor issued was presented | Ed25519-signed payload `{listingId, amount, nonce, exp}`; the sponsor drops the QR wherever the challenge lives — a livestream frame, a Discord channel, a website, an event, a street corner. The server verifies the signature, consumes the nonce, flips state atomically | Optional scene check: a photo of the scene must also pass, so a shared token stops working | [`lib/qr.ts#L41-L89`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/qr.ts#L41-L89) & [`app/api/bounty/scanquest/route.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/scanquest/route.ts) |
| **CheckIn** | The participant is at the coordinates — for the challenges that genuinely need a place | HTML5 geolocation: within radius, accuracy < 50m, inside the time window | Optional photo-at-location for a second witness | [`app/api/bounty/geo/route.ts#L10-L70`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/geo/route.ts#L10-L70) |
| **Venture** | An open-ended task with creator-defined completion — an essay, a recording, a riddle solved before 5pm, joining an AMA, finding something on Discord | The contract states what proof counts: text, a file, a recording, code, an external action, or creator approval | Optional pre-screen: the AI scores submissions against the sponsor's criteria and recommends — the creator still signs the release | [`app/api/bounty/submit/route.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/submit/route.ts) |
| **Creator-verified** | The sponsor accepts the work | The sponsor signs the release from their approval inbox; unreviewed submissions auto-refund after 48h | Optional pre-screen: the AI scores each submission and recommends approve/reject — the human still signs | [`app/api/bounty/manual_approve/route.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/bounty/manual_approve/route.ts) |

A contract names its oracle and its rules at creation. An accepter reads the full contract — requirements, deadline, refund behavior, who may accept — before signing anything.

---

## Feature tour

- **Borrowing.** The in-person act type: lend any item by listing it with a collateral amount. The borrower locks discounted collateral from their own wallet via [`sendBasicTransaction`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/nimiq.ts#L61-L89); returning the item and scanning the lender's cryptographic Return Code releases the funds back, minus the network fee. Trust reduces collateral requirements.
- **Bounties & challenges.** Anyone, anywhere can fund a challenge, and anyone, anywhere can complete it: a livestream drop, a Discord scavenger hunt, a Telegram riddle, a photo bounty, a location check-in, a commissioned piece of work. The reward locks in the vault at creation; whoever passes the oracle is paid from it. Challenge types: PhotoProof, ScanQuest, CheckIn, and Venture (creator-defined completion).
- **Contracts, not listings.** Every listing carries a structured contract: the sponsor's criteria, completion deadline, open-for window, minimum trust to accept, and oracle configuration. Every accepted escrow shows a live progress timeline with a countdown — and auto-refunds past its deadline.
- **Trust Score v2.** Server-computed, transparent, Sybil-resistant: `0.35 completion + 0.25 volume (log-scaled) + 0.20 tenure (≤90 days) + 0.10 oracle diversity + 0.10 community`. The Passport shows the five components and exactly how the score was earned ([`lib/trust.ts#L34-L55`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/trust.ts#L34-L55)). It discounts collateral and gates who may accept high-trust contracts.
- **Milestones, stamps, streaks, leaderboard.** First connection, first lock, first settled act, first bounty, first listing, first referral — each drips treasury NIM once ([`lib/milestones.ts#L6-L12`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/milestones.ts#L6-L12)). Settled acts mint collectible stamps. Streaks count settled acts in a rolling 7-day window, never app opens. The leaderboard is computed from the act ledger.
- **Profiles.** Every address renders a deterministic identicon derived from itself ([`lib/identicon.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/identicon.ts)) — no uploads, no storage — alongside its tier, act count, settled volume, and recent record.
- **Inbox.** Every meaningful event writes a line: accepted, proof submitted, verdict, settled (with tx link), cancelled, expired-and-refunded, milestone earned, referral joined.
- **Referrals.** Share a personal link; when the friend's first act settles, the treasury pays **10 NIM** to each side, recorded in the ledger ([`lib/settle.ts#L133-L167`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/settle.ts#L133-L167) & [`app/api/auth/verify/route.ts#L72-L93`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/auth/verify/route.ts#L72-L93)).
- **Treasury.** Fees in, community rewards out, balance live from chain, address linkable on the explorer.

---

## Nimiq integration

Acta is a native Nimiq Pay Mini App built on [`@nimiq/mini-app-sdk`](https://www.npmjs.com/package/@nimiq/mini-app-sdk), and Nimiq primitives do the security-critical work everywhere. The test: remove `window.nimiq` and the app cannot authenticate a session, lock collateral, fund a bounty, or release a payout — every flow terminates at an SDK call.

| SDK / chain primitive | Where it is used | Code Reference |
|---|---|---|
| `init()`, `listAccounts()` | Provider bootstrap with timeout + read-only fallback mode; account discovery | [`lib/nimiq.ts#L31-L59`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/nimiq.ts#L31-L59) |
| `sendBasicTransaction()` | Borrowers lock collateral and sponsors fund bounties from their own wallets into the vault — client-side, real transactions | [`lib/nimiq.ts#L61-L89`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/nimiq.ts#L61-L89) |
| `sign()` | Session authentication: the user signs a server nonce once; the server derives the Nimiq address from the verified public key | [`app/api/auth/verify/route.ts#L35-L65`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/auth/verify/route.ts#L35-L65) |
| Ed25519 (`@noble/ed25519` + `@nimiq/core`) | Return-QR and ScanQuest token signatures; address derivation binds every session to a keypair the user controls | [`lib/qr.ts#L3-L39`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/qr.ts#L3-L39) |
| `@nimiq/core` (server) | The vault hot wallet builds, signs, and broadcasts payouts over RPC; balance checks before every send; serialized payout queue | [`lib/backend-nimiq.ts#L87-L136`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/backend-nimiq.ts#L87-L136) |
| Albatross RPC | Live vault balance for the treasury card; explorer links on every receipt | [`lib/backend-nimiq.ts#L20-L33`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/backend-nimiq.ts#L20-L33) & [`lib/escrow.ts#L111-L120`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/escrow.ts#L111-L120) |
| On-chain receipts | Every escrow stores `tx_hash_in` and `tx_hash_out`; every settled act links its transaction | [`lib/db.ts#L91-L93`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/db.ts#L91-L93) & [`lib/db.ts#L115-L116`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/db.ts#L115-L116) |

Fees are the network minimum (`0.0001 NIM`). Escrow payouts are server-gated by the vault key today — a deliberate hackathon-scope decision, disclosed below — while every lock and funding transaction is a real, user-signed chain transaction.

---

## Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                  Nimiq Pay webview (Mini App)              │
│   init · listAccounts · sign · sendBasicTransaction        │
│   UI: the engraved ledger (Next.js 16, React 19, Tailwind) │
└──────────────────────────┬─────────────────────────────────┘
                           │ session cookie (HMAC-signed)
┌──────────────────────────▼─────────────────────────────────┐
│                 Next.js route handlers (Vercel)            │
│  auth · escrows · listings · bounties · inbox · referral   │
│  oracles: vision (Qwen3.6) · QR (Ed25519) · geo · creator  │
│  idempotency keys · consumed nonces · atomic state flips   │
└──────────┬───────────────────────────────┬─────────────────┘
           │                               │
┌──────────▼───────────┐      ┌────────────▼───────────────┐
│  Neon Postgres        │      │  Vault hot wallet          │
│  listings · escrows · │      │  @nimiq/core → RPC         │
│  acts · users · nonces│      │  serialized payouts        │
│  notifications · refs │      └────────────┬───────────────┘
└───────────────────────┘                   │
┌───────────────────────────────────────────▼───────────────┐
│              Nimiq Albatross (via RPC)                    │
│     locks · payouts · treasury balance · receipts         │
└───────────────────────────────────────────────────────────┘
```

The [`acts`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/db.ts#L105-L121) table is the single source of truth: append-only, one row per settled act, powering trust, streaks, stamps, feed, and leaderboard. Escrow state transitions are conditional SQL (`UPDATE … WHERE state='locked' RETURNING`), so double-submits and races resolve to one winner.

The full threat model — every attack we considered, its mitigation, and what remains — is detailed in [`docs/SECURITY.md`](docs/SECURITY.md).

---

## Security model

- **Sessions are HMAC-signed server-side.** Base64 is not a signature ([`lib/session.ts#L9-L23`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/session.ts#L9-L23)).
- **Identity is derived, not declared:** the session address comes directly from the verified Ed25519 public key ([`app/api/auth/verify/route.ts#L48-L60`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/auth/verify/route.ts#L48-L60)).
- **Auth nonces are single-use** with a 2-minute TTL, deleted on consumption in PostgreSQL ([`app/api/auth/verify/route.ts#L22-L34`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/auth/verify/route.ts#L22-L34)).
- **Release keys are lender-bound:** only the listing owner may bind an escrow's release public key, and only once ([`app/api/escrows/route.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/escrows/route.ts)).
- **Replay protection:** QR and ScanQuest nonces are consumed in the database; tokens are bound to escrow ID, amount, and chain, with a 10-minute expiry ([`lib/qr.ts#L41-L54`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/qr.ts#L41-L54) & [`lib/db.ts#L123`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/db.ts#L123)).
- **Payout-before-state:** money moves first; the atomic state flip happens after. A failed flip after a successful payout is retryable, never stranded ([`lib/settle.ts#L60-L95`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/settle.ts#L60-L95)).
- **Idempotency:** clients send an `Idempotency-Key` header per action; retries and double-taps return the original cached result ([`lib/idempotency.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/idempotency.ts)).
- **Expiry is enforced:** an hourly cron expires open listings — refunding sponsors — and auto-refunds escrows past deadline, notifying both parties ([`app/api/cron/expire/route.ts`](https://github.com/Idle0x/nimiq-acta/blob/main/app/api/cron/expire/route.ts)).
- **Honest hot wallet:** the vault key lives in an environment variable on the server. Users trust the backend to disburse on verified proof; every disbursement is a public transaction on Albatross ([`lib/backend-nimiq.ts#L87-L136`](https://github.com/Idle0x/nimiq-acta/blob/main/lib/backend-nimiq.ts#L87-L136)).

---

## Where to look (judging criteria map)

| Criterion | Evidence |
|---|---|
| **Core Feature** | [The protocol loop](#the-protocol-loop) and the [demo video](https://youtu.be/eLxVdYTx0Lo): lock → scan → release is one live flow with real transactions |
| **Originality** | One pipeline, four oracle types ([the four oracles](#the-four-oracles)); new act types are configuration, not new architecture |
| **Real Need** | [Why](#why) — trustless local borrowing and guaranteed bounty payouts without platform custody |
| **Completeness** | Contracts with deadlines and refunds, inbox, passport dashboard with listings/activity/collection, profiles, referrals, treasury card |
| **Error Handling** | Oracle errors are retryable 502s (never fake verdicts); wallet rejection gets its own message; init timeout falls back to read-only mode; every async view has a skeleton |
| **Speed** | Skeleton states, optimistic updates, server-cached session checks, engraved UI with zero blocking fetches on tab switch |
| **Stability** | Idempotent actions, atomic state transitions, cron-driven expiry, 154 automated tests across 24 suites (63 unit/UI + 91 database integration) — see [Automated test suite](#automated-test-suite) and [`docs/SECURITY.md`](docs/SECURITY.md) |
| **Target Audience** | Three-screen onboarding; contracts written in plain language; every screen explains itself in one marginalia line |
| **Repeat Value** | Trust score that lowers collateral, settled-act streaks, collectible stamps, leaderboard, treasury-funded milestones, referrals |

---

## Automated test suite

Acta includes an automated test suite of **154 tests across 24 files** (63 offline unit/UI tests and 91 real database integration tests) verifying money math, cryptographic nonces, concurrency races, and state machines.

```text
Test Files  24 passed (24)
     Tests  154 passed (154)
```

- **63 Offline Unit & UI tests** (`tests/unit/`, `tests/ui/`): deterministic, fast, zero-dependency suites:
  - **Ed25519 & QR signatures** ([`tests/unit/lib/qr.test.ts`](tests/unit/lib/qr.test.ts)): signature generation, verification, tamper resistance, expiry windows, and single-use nonce uniqueness.
  - **Escrow & money math** ([`tests/unit/lib/escrow-math.test.ts`](tests/unit/lib/escrow-math.test.ts)): whole and fractional NIM conversions, fee rounding, and collateral ratios.
  - **Contract engine** ([`tests/unit/lib/contract.test.ts`](tests/unit/lib/contract.test.ts)): contract schema validation, oracle routing, and 48-hour auto-refund logic.
  - **Vision oracle** ([`tests/unit/lib/vision.test.ts`](tests/unit/lib/vision.test.ts)): prompt construction, verdict parsing, retryable `OracleError` (502) propagation, and rate limit throttling.
  - **Vault backend** ([`tests/unit/lib/backend-nimiq.test.ts`](tests/unit/lib/backend-nimiq.test.ts)): balance threshold checks, serialized payout queues, and simulated development fallbacks.
  - **Session management** ([`tests/unit/lib/session.test.ts`](tests/unit/lib/session.test.ts)): HMAC-SHA256 cookie signing, tamper rejection, expiry checks, and address derivation.
  - **UI components** ([`tests/ui/manual-verify.test.tsx`](tests/ui/manual-verify.test.tsx)): manual verification guards, QR rendering states, and visual feedback payoffs.

- **91 Real Postgres Database integration tests** (`tests/db/`): route and protocol tests executed against real PostgreSQL (via Neon serverless):
  - **Fractional column storage** ([`tests/db/columns.test.ts`](tests/db/columns.test.ts)): verifies `DOUBLE PRECISION` columns preserve fractional NIM amounts and fee decimals without rounding truncation.
  - **The `settleAct` pipeline** ([`tests/db/settle.test.ts`](tests/db/settle.test.ts)): atomic ordering (`claim → payout → finalize → act`), state restoration on payout failure, double-settle rejection, and concurrent settlement isolation.
  - **Bounty double-claim races** ([`tests/db/double-spend.test.ts`](tests/db/double-spend.test.ts)): verifies that concurrent submissions to the same bounty award exactly one payout, locking out race conditions before money moves.
  - **Treasury drips & milestones** ([`tests/db/drips-race.test.ts`](tests/db/drips-race.test.ts), [`tests/db/economy.test.ts`](tests/db/economy.test.ts)): atomic sweeper claiming, dead-lettering of failed drips, welcome bonuses awarded on settlement rather than login, and recurring milestone multiples.
  - **Inbound funding gate** ([`tests/db/inbound.test.ts`](tests/db/inbound.test.ts)): rejects fabricated transaction hashes, enforces minimum locked value, and verifies on-chain transaction proofs.
  - **QR borrow-return settlement** ([`tests/db/qr-settle.test.ts`](tests/db/qr-settle.test.ts)): cryptographic token exchange, lender-key binding, replay attack prevention, and luna-precise amount matching.
  - **Authentication & session derivation** ([`tests/db/auth.test.ts`](tests/db/auth.test.ts)): Ed25519 challenge-response handshake, single-use nonce consumption, and referral link binding.
  - **Spoof regression guards** ([`tests/db/spoof-regression.test.ts`](tests/db/spoof-regression.test.ts)): unauthenticated mutation rejection, cross-account action prevention, and inbox privacy enforcement.
  - **Trust Score v2** ([`tests/db/trust.test.ts`](tests/db/trust.test.ts)): verifies exact mathematical computation across completion, volume, tenure, and diversity metrics against a live database.
  - **Cron & expiry** ([`tests/db/cron.test.ts`](tests/db/cron.test.ts)): automated deadline enforcement, cancellation mechanics, and lender-claim grace windows.

---

## Tech stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 16 (App Router, React 19), Tailwind CSS 4, TypeScript |
| **Wallet / Chain** | [`@nimiq/mini-app-sdk`](https://www.npmjs.com/package/@nimiq/mini-app-sdk), [`@nimiq/core`](https://www.npmjs.com/package/@nimiq/core), Albatross RPC |
| **Crypto** | [`@noble/ed25519`](https://www.npmjs.com/package/@noble/ed25519), [`@noble/hashes`](https://www.npmjs.com/package/@noble/hashes) |
| **Database** | [Neon Postgres](https://neon.tech) (serverless) |
| **AI Oracle** | Qwen3.6 vision via Hetzner Inference (OpenAI-compatible API) |
| **QR Handshake** | `html5-qrcode`, `react-qr-code`, `qrcode.react` |
| **Testing & CI** | Vitest, Testing Library, GitHub Actions CI |
| **Deploy** | Vercel + scheduled cron |

---

## Repository layout

```text
.github/
  workflows/ci.yml          GitHub Actions CI: typecheck, test suite, production build
app/
  page.tsx                  presentation and marketing landing page
  app/page.tsx              the core Mini App: tabs, wallet state, all user flows
  globals.css               the engraved-ledger design system
  api/                      route handlers (auth, escrows, listings,
                            bounty/*, inbox, referral, cron/expire, …)
components/                 AppChrome, RadarFeed, ListingCard, CreateListing,
                            ListingDetailSheet, ContractTimeline,
                            PassportDashboard, Inbox, Stamps, ReferralSheet,
                            Feedback (toasts + payoff ceremony), …
lib/
  nimiq.ts                  Nimiq Pay Mini App SDK client hook
  backend-nimiq.ts          vault keypair, serialized payouts, balance reads
  vision.ts                 oracle: verify, scene check, pre-screen
  qr.ts                     Ed25519 token signing and verification
  session.ts                HMAC-SHA256 session cookies
  contract.ts               contract model + protocol definitions
  identicon.ts              address-derived SVG avatars
  db.ts, trust.ts, milestones.ts, escrow.ts, settle.ts, notify.ts, idempotency.ts
tests/                      automated test suite (154 tests across 24 files)
  unit/lib/                 offline unit suites: math, qr, session, vision, vault
  ui/                       component rendering and interaction tests
  db/                       real PostgreSQL integration: settle, inbound, auth, trust
  helpers/                  deterministic mocks, session minting, DB reset utilities
docs/
  SECURITY.md               threat model: attack → mitigation → residual
  DEMO.md                   the 60-second script + recording walkthrough
scripts/                    init-db + migrations (v2–v9)
```

---

## Running Acta

Requirements: Node 20+, a Neon (or any PostgreSQL) database, a Nimiq vault seed phrase, and a Hetzner Inference key for the vision oracle.

```bash
git clone https://github.com/Idle0x/nimiq-acta.git
cd nimiq-acta
npm install
npm run dev
```

### Running the tests

```bash
# Run unit & UI tests (offline, 0 keys / 0 DB required)
npm run test:unit

# Run real database integration tests (requires DATABASE_URL_TEST)
DATABASE_URL_TEST="postgresql://..." npm run test:db

# Run full test suite (154 tests)
DATABASE_URL_TEST="postgresql://..." npm test
```

### Environment variables

| Variable | Purpose | Default / Description |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | `postgresql://...` |
| `DATABASE_URL_TEST` | Test database connection string (used by test runner & CI) | `postgresql://...` |
| `ENCRYPTION_KEY` | HMAC secret for session cookies (32+ chars) | Any strong 32-character secret |
| `VAULT_SEED_PHRASE` | Vault hot-wallet mnemonic (holds escrowed + treasury NIM) | BIP-39 mnemonic seed phrase |
| `NEXT_PUBLIC_VAULT_ADDRESS` | Public address of the protocol vault | `NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT` |
| `OPENAI_API_KEY` | API key for multimodal inference | Hetzner Inference API token |
| `OPENAI_BASE_URL` | Base endpoint for vision model | `https://inference.hetzner.com/api/v1` |
| `VISION_MODEL` | Vision model identifier | `Qwen/Qwen3.6-35B-A3B-FP8` |
| `NIMIQ_RPC_URL` | Albatross RPC endpoint | `https://rpc.nimiqwatch.com` |
| `NIMIQ_NETWORK_ID` | Nimiq Network ID | `24` (Albatross Testnet) |
| `CRON_SECRET` | Bearer token guarding `/api/cron/expire` | Custom secret string |

Deploy to Vercel, configure the environment variables, and the hourly expiry cron will be configured automatically by `vercel.json`. For development, fund the vault with testnet NIM and connect Nimiq Pay's testnet.

---

## Using Acta

### Borrow an item
1. **Radar →** Open a listing → **Review Contract**: sponsor record, rules, your collateral position.
2. **Accept & lock →** Sign once in Nimiq Pay. The Active tab shows the lock, its tx hash, and a countdown.
3. **Return the item;** the lender scans your cryptographic Return Code.
4. **Collateral returns** minus the network fee; the act ledger records it; your trust ring updates.

### Run a bounty
1. **Radar →** Accept & lock on a challenge.
2. **Submit proof** specified in the contract: a photo, an Ed25519 QR scan, a GPS check-in, text, or a file.
3. **The oracle judges** against the sponsor's criteria — on pass the vault pays out with an on-chain tx hash; on fail nothing moves and nothing is lost.

### Sponsor a challenge
1. **Create →** Pick the oracle type → write the criteria the proof must show → set deadlines and eligibility.
2. **The reward locks** directly from your wallet into the vault at creation.
3. **Submissions arrive** in your inbox; approve with one signature, or let the AI pre-screen recommend.

---

## Limitations (disclosed, not hidden)

1. **Hot-wallet escrow.** Escrow payouts are disbursed by a backend vault key upon oracle verification, pending Nimiq HTLC/smart-contract support for multi-sig programmatic release. All locks and fundings are on-chain user transactions; all payouts are public transactions.
2. **GPS spoofing.** CheckIn uses HTML5 geolocation. The optional photo-at-location witness raises the bar; a hardened anti-spoofing SDK belongs in production.
3. **AI judgment.** The vision oracle can be fooled by screens or recycled images; criteria-strict prompting and the fail-closed default (`pass=false` on doubt) mitigate, not eliminate. Unparseable replies are surfaced as retryable errors, never recorded as verdicts.
4. **Rate limits.** Vision throughput is bounded by the inference plan (10 req/60s); the app throttles and reports retry-after instead of queueing silently.
5. **Server-gated release keys.** Lender/creator release keys are generated and stored server-side (encrypted at rest). Self-custodial release is the production direction.
6. **Scope.** USDT/stablecoin collateral and atomic swaps are architecturally anticipated — the pipeline doesn't care what moves — but not shipped in this build.

---

## Production path

On-chain escrow via Nimiq HTLCs with timelocked refunds; hardened device attestation for geo; live-camera-only vision pipelines; Cashlink-denominated referral rewards; stablecoin bounties through the OASIS bridge. The act pipeline — oracle registry, conditional state machine, append-only ledger — is deliberately asset-agnostic: each is a new act type, not a new architecture.

---

## License

MIT — see [`LICENSE`](LICENSE).
