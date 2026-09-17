# Acta — Money moves when reality changes

> A verifiable proof-of-action protocol for Nimiq Pay that locks NIM for peer-to-peer borrowing and real-world bounties.

## What It Does

Acta turns Nimiq Pay into a zero-trust neighborhood economy. Borrow a drill from your neighbor by locking NIM as collateral. When you return it, they scan a cryptographic QR code on your phone to instantly release your locked funds back to you. 

Beyond borrowing, Acta scales into community micro-work with **Bounties**. Creators can fund challenges that pay out automatically when solvers prove reality:
- **ScanQuest:** Discover and scan a cryptographically signed QR token hidden in the physical world.
- **CheckIn (Geo):** Physically visit a GPS coordinate to unlock funds.
- **PhotoProof:** Snap a picture and let advanced AI (Qwen3.6 Vision) verify it.
- **CreatorVerified:** Perform custom labor and get a manual sign-off via QR scan.

Every verified action builds your transparent on-chain **Trust Score**, which persistently reduces your future collateral requirements, and drips real rewards from the community treasury.

### The 25-Second Demo Script
1. Open Acta in Nimiq Pay. Admire the live **Treasury TVL** and global Activity Feed.
2. Tap the **Map Toggle** stub to see how geospatial bounding will work.
3. Tap **New** -> **ScanQuest**. Fund the bounty with NIM directly via `sendBasicTransaction()`.
4. As the creator, tap **Show Quest QR** to generate a cryptographic signature.
5. As a solver, tap the **QR Scanner** on your dashboard and scan the screen. 
6. Watch the backend verify the signature and instantly pay out the reward!

## How It Uses Nimiq

Acta is a native Nimiq Pay Mini App, leveraging the `window.nimiq` provider:
- `sendBasicTransaction()` — Locks collateral or funds bounties.
- `sendBasicTransactionWithData()` — Embeds protocol metadata.
- `sign()` — Provides cryptographic proof for zero-trust state changes.
- `requestDeviceIdentifier()` — Powers anti-sybil trust scoring.

## Disclosed Limitations (Hackathon Build)

1. **GPS Spoofing:** Uses HTML5 geolocation. Production requires a hardened anti-spoofing SDK.
2. **AI Hallucinations:** Vision oracle could be tricked by screens. Production requires live-camera-only pipelines.
3. **Asset Volatility:** Uses native NIM. While we investigated Nimiq Pay's OASIS/Polygon bridge for USDT stablecoin collateral, the Mini-App SDK currently only supports native NIM transaction triggers.
4. **Escrow Vault:** Backend-managed payout wallet, pending true HTLC smart contracts.

## Submission Checklist
- [x] MIT LICENSE file
- [x] .gitignore excludes secrets
- [x] Public GitHub repo
- [x] Live deployment URL (Vercel)
- [x] README.md with 250-word description
- [ ] Demo video

## License
MIT
