# Acta — Money moves when reality changes

> A verifiable proof-of-action protocol for Nimiq Pay that locks NIM for peer-to-peer borrowing and AI-verified real-world bounties.

## What It Does

Acta turns Nimiq Pay into a neighborhood trust engine. Borrow a drill from your neighbor by locking NIM as collateral — when you return it, they scan a cryptographic QR code to release your funds. Spot a broken bench in the park? Snap a photo, verify your location, and collect the bounty. Every completed action builds your Trust Score, which permanently reduces your future collateral requirements.

**Two core flows:**
- **Borrow:** Lock NIM collateral, get the item, return it, scan the lender's QR, get your NIM back minus a 50 NIM micro-fee.
- **GeoBounty:** Accept a task, go to the location, take a photo. An AI vision oracle verifies the proof. You earn NIM.

## How It Uses Nimiq

Acta is a native Nimiq Pay Mini App. It uses the injected `window.nimiq` provider exclusively:
- `sendBasicTransaction()` locks collateral into the escrow vault
- `sendBasicTransactionWithData()` embeds escrow metadata on-chain
- `sign()` provides cryptographic message signing for proof verification
- `requestDeviceIdentifier()` enables per-device trust scoring and anti-spam
- `isConsensusEstablished()` / `getBlockNumber()` display real-time chain status
- `getHostLanguage()` matches the host wallet's locale

## Tech Stack

- **Frontend:** Next.js 16 (React 19) + TailwindCSS 4 + TypeScript
- **Crypto Oracle:** Ed25519 QR handshake (`@noble/ed25519`) for borrowing returns
- **AI Oracle:** Hetzner Inference (Qwen3.6 Vision) for bounty photo verification
- **Backend:** Next.js Route Handlers + Neon Postgres (serverless)
- **Icons:** lucide-react | **QR:** html5-qrcode + qrcode.react

## Disclosed Limitations

1. **GPS Spoofing:** Uses standard HTML5 geolocation. Production requires a hardened anti-spoofing SDK.
2. **AI Hallucinations:** Vision oracle can theoretically be tricked by secondary screens. Production requires live-camera-only capture.
3. **Asset Volatility:** Uses native NIM. Production would bridge USDC/USDT for stable collateral.
4. **Escrow Vault:** Backend-managed address, not a true HTLC smart contract.

## Local Development

```bash
git clone https://github.com/your-org/acta.git
cd acta
npm install
cp .env.example .env.local  # Add your keys
npm run dev
# Open in Nimiq Pay simulator or browser at http://localhost:3000
```

## License

MIT
