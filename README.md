# Acta — Money moves when reality changes

> A verifiable proof-of-action protocol for Nimiq Pay that locks NIM for peer-to-peer borrowing and real-world bounties.

## What It Does

Acta turns Nimiq Pay into a zero-trust neighborhood economy. Borrow a drill from your neighbor by locking NIM as collateral. When you return it, they scan a cryptographic QR code on your phone to instantly release your locked funds back to you. 

Beyond borrowing, Acta scales into community micro-work with **Bounties**. Creators can fund challenges that pay out automatically when solvers prove reality through our **Four Oracles**:
- **ScanQuest (QR):** Discover and scan a cryptographically signed QR token hidden in the physical world.
- **CheckIn (Geo):** Physically visit a GPS coordinate to unlock funds.
- **PhotoProof (Vision):** Snap a picture and let advanced AI (Qwen3.6 Vision) verify it.
- **Request / Venture (Creator):** Perform custom work, submit proof, and get the sponsor's signed approval (AI pre-screen recommends; the human signs the release). Optional AI scene checks backstop QR/Geo proofs against sharing and spoofing.

Every verified action builds your transparent on-chain **Trust Score v2**, which persistently reduces your future collateral requirements.

### Treasury Mechanics
A 0.0011 NIM settlement fee applies on every payout (0.001 retained by the treasury so rewards self-sustain, 0.0001 network). Cancel and expiry refunds are always full — no fee. Minimum lock is 0.01 NIM. These fees accumulate in the global **Treasury Vault**. Over time, the protocol distributes these collected funds to highly trusted participants, creating a cyclic token economy.

## How It Uses Nimiq

Acta is a native Nimiq Pay Mini App, leveraging the `window.nimiq` provider:
- `sendBasicTransaction()` — Locks collateral or funds bounties.
- `sign()` — Provides cryptographic proof for zero-trust state changes.

## Disclosed Limitations (Hackathon Build)

1. **GPS Spoofing:** Uses HTML5 geolocation. Production requires a hardened anti-spoofing SDK.
2. **AI Hallucinations:** Vision oracle could be tricked by screens. Production requires live-camera-only pipelines.
3. **Asset Volatility:** Uses native NIM. While we investigated Nimiq Pay's OASIS/Polygon bridge for USDT stablecoin collateral, the Mini-App SDK currently only supports native NIM transaction triggers.
4. **Hot-Wallet Escrow:** Escrow payouts are currently managed by a backend hot-wallet. This requires trusting the Acta backend to disburse funds correctly upon oracle verification, pending true HTLC/Smart Contract support on Nimiq for multi-sig programmatic release.

## Submission Checklist
- [x] MIT LICENSE file
- [x] .gitignore excludes secrets
- [x] Public GitHub repo
- [x] Live deployment URL (Vercel)
- [x] README.md with 250-word description
- [ ] Demo video

## License
MIT
