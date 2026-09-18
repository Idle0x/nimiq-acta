# ACTA — Integration Bible (drop-in package)

This package contains **complete replacement files** and **surgical patch blocks**.
Status is marked for every item from the audit: `[FILE]` = paste the included file,
`[BLOCK]` = apply the code block below to your existing file, `[CLEAN]` = delete/rename.

---

## 0. Install order

1. `scripts/migrate-v4.sql` → run in Neon SQL editor (adds `notifications`, `referrals`, `referral_settlements`, act indexes).
2. `app/globals.css` → **replace** your current one. It defines every class your existing
   components already use (`plate`, `seal`, `press`, `floaty`, `caps`, `figure`, `marginalia`,
   `rule`, `animate-*`, `btn-press`, `card`) plus the new system.
3. Layout fonts — add to `app/layout.tsx`:
   ```tsx
   import { Fraunces, Newsreader, Space_Grotesk } from "next/font/google";
   const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
   const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
   const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });
   // <html className={`${grotesk.variable} ${display.variable} ${serif.variable}`}>
   ```
4. Security files (section 2). 5. UI components (section 4). 6. Cleanup (section 5).

**Send me to finish the job:** `app/page.tsx`, `app/layout.tsx`, your current `app/globals.css`,
`lib/nimiq.ts`, `lib/escrow.ts`, `lib/db.ts`, `lib/qr.ts`, `lib/backend-nimiq.ts`, `lib/trust.ts`,
`lib/milestones.ts`, `app/api/dashboard/route.ts`, `app/api/escrows/route.ts`, the bounty routes,
`app/api/qr/generate/route.ts`, `components/TreasuryCard.tsx`, `components/SuccessPayoff.tsx`,
`components/TrustRing.tsx`, `components/Toast.tsx`, `components/ErrorBoundary.tsx` tail of
`components/PassportDetails.tsx` (your dump truncated mid-file). With those I wire every mount point myself.

---

## 1. The purple empty space `[BLOCK]`

Your screenshot header is an older layout; the gap comes from a spacer/hero div (or
`justify-center` on a `min-h-screen` flex column) above the header. Fix:
- Render `<AppHeader/>` (`components/AppChrome.tsx`) as the **first child** of your root flex column.
- Delete any `h-*` spacer, hero, or `pt-24`/`mt-16` div above it. The header already applies
  `pt-[max(0.6rem,env(safe-area-inset-top))]` — that is the only top padding allowed.
- The page container must be `flex min-h-dvh flex-col` **without** `justify-center`.

---

## 2. Security criticals (judge-pokes-API class)

### 2.1 Sessions are forgeable → `[FILE]` `lib/session.ts`
HMAC-SHA256 signed cookie, timing-safe compare, 7-day expiry. Set `ENCRYPTION_KEY` in env
(32+ chars) — the dev fallback keeps localhost working but must not ship.

### 2.2 Auth never proved the address → `[FILE]` `app/api/auth/verify/route.ts`
- Address is **derived from the verified Ed25519 pubkey** via `@nimiq/core` — client-supplied address is ignored.
- **Nonce consumption**: single-use, 2-minute TTL, deleted on use.
- **User upsert**: `INSERT ... ON CONFLICT DO NOTHING` so first-time users actually get a `users` row (trust score persists).
- **Referral settlement**: accepts optional `ref` code; on the referee's first verified session it records
  `referral_settlements`, notifies both users, and calls `awardMilestone('ms_first_referral')` if your milestones lib exposes it.
- Note: the signed message is `Acta login\n\nNonce: ${nonce}` — if your client `sign()` uses a different
  format, change this one string in both places.

### 2.3 `lenderPubkey` PATCH re-opens escrow theft → `[BLOCK]` in `PATCH /api/escrows`
