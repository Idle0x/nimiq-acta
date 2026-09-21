"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Cpu,
  Layers,
  RotateCcw,
  Shield,
  Code2,
  Sliders,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Menu,
  CheckCircle,
  Clock,
  Lock,
  Eye,
  MapPin,
  QrCode,
  Users,
  Coins,
  ShieldCheck,
  Award,
  Globe,
  HelpCircle,
  FileCode,
  Terminal,
  AlertCircle,
  Info,
} from "lucide-react";
import DocsSidebar, { DOC_SECTIONS } from "@/components/docs/DocsSidebar";
import DocsToc, { TocItem } from "@/components/docs/DocsToc";
import DocsSearch from "@/components/docs/DocsSearch";
import TrustCalculator from "@/components/docs/TrustCalculator";
import StateMachineFlow from "@/components/docs/StateMachineFlow";
import OracleSimulator from "@/components/docs/OracleSimulator";
import CodeTabs from "@/components/docs/CodeTabs";
import { Seal } from "@/components/Paper";

const TOC_HEADINGS: TocItem[] = [
  { id: "doctrine", label: "§ 1.1 Doctrine of Proof-of-Action", level: 2 },
  { id: "traditional-failure", label: "§ 1.2 Traditional Escrow Failure Modes", level: 2 },
  { id: "local-vs-global", label: "§ 1.3 Local Proximity vs Global Remote", level: 2 },
  { id: "tradeoffs", label: "§ 1.4 Guarantees, Tradeoffs & Limits", level: 2 },
  { id: "fees", label: "§ 1.5 Network Economy & Fee Schedule", level: 2 },
  { id: "albatross", label: "§ 2.1 Nimiq PoS Albatross Engine", level: 2 },
  { id: "miniapp", label: "§ 2.2 Nimiq Pay Mini-App Sandbox", level: 2 },
  { id: "vault", label: "§ 2.3 Autonomous Vault & Hot Reserve", level: 2 },
  { id: "zero-cron", label: "§ 2.4 Zero-Cron Architecture", level: 2 },
  { id: "cov-borrow", label: "§ 3.1 Equipment Loan / Borrowing", level: 2 },
  { id: "borrow-modes", label: "§ 3.1.1 Available vs Rent Modes", level: 3 },
  { id: "cov-vision", label: "§ 3.2 Vision Oracle (Qwen 3.6)", level: 2 },
  { id: "cov-scanquest", label: "§ 3.3 ScanQuest (Ed25519 QR)", level: 2 },
  { id: "cov-geo", label: "§ 3.4 Geolocation Geofence (GPS)", level: 2 },
  { id: "cov-manual", label: "§ 3.5 In-Person Attestation", level: 2 },
  { id: "cov-venture", label: "§ 3.6 Online Ventures (100% Global)", level: 2 },
  { id: "toggles", label: "§ 4.1 The 4 Contract Toggles", level: 2 },
  { id: "badges", label: "§ 4.2 Dynamic Attention Badges", level: 2 },
  { id: "state-machine", label: "§ 4.3 State Machine Transitions", level: 2 },
  { id: "disputes", label: "§ 4.4 Unreturned Custody & 48h Grace", level: 2 },
  { id: "trust-score", label: "§ 5.1 Algorithmic Trust Score (0–100)", level: 2 },
  { id: "discount-formula", label: "§ 5.2 Buying Power: Collateral Discount", level: 2 },
  { id: "rites", label: "§ 5.3 The 5 Sovereign Rites", level: 2 },
  { id: "referrals", label: "§ 5.4 Dual Referral Reward (10 NIM)", level: 2 },
  { id: "milestones", label: "§ 5.5 Milestones & Recurring Drips", level: 2 },
  { id: "api-auth", label: "§ 6.1 Cryptographic Auth & Tokens", level: 2 },
  { id: "api-listings", label: "§ 6.2 Listings API Endpoints", level: 2 },
  { id: "api-escrows", label: "§ 6.3 Escrows API Endpoints", level: 2 },
  { id: "api-verification", label: "§ 6.4 Oracle Verification Endpoints", level: 2 },
  { id: "api-referral-claim", label: "§ 6.5 Referral Claim Endpoint", level: 2 },
  { id: "api-types", label: "§ 6.6 TypeScript Types & JSON Schemas", level: 2 },
  { id: "tool-calc", label: "§ 7.1 Reputation Discount Calculator", level: 2 },
  { id: "tool-flow", label: "§ 7.2 Covenant State Machine Diagram", level: 2 },
  { id: "tool-oracle", label: "§ 7.3 Oracle Inspection Playground", level: 2 },
];

export default function DocsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string>("doctrine");

  // Scroll spy for active TOC heading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((e) => e.isIntersecting);
        if (visibleEntry) {
          setActiveAnchor(visibleEntry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
    );

    TOC_HEADINGS.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#12100c] text-[var(--ink)]">
      {/* Search Modal */}
      <DocsSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-[var(--line)] bg-[#12100c]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-white/5"
            aria-label="Open documentation navigation"
          >
            <Menu size={20} />
          </button>
          <a href="/" className="flex items-center gap-2.5">
            <Seal size={32} className="!text-xs">A</Seal>
            <span className="font-display text-lg font-bold tracking-wider text-[var(--ink)]">
              ACTA <span className="text-[var(--gold)] font-mono text-xs ml-1 font-normal">DOCS</span>
            </span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-black/40 border border-[var(--line)] text-xs text-[var(--ink3)] hover:border-[var(--gold)]/50 hover:text-[var(--ink2)] transition-colors w-64"
          >
            <span className="flex items-center gap-2">
              <Search size={14} className="text-[var(--gold)]" />
              <span>Search specification…</span>
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-[var(--line)]">
              ⌘K
            </kbd>
          </button>

          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--verdigris)]/10 border border-[var(--verdigris)]/30 text-[11px] text-[var(--verdigris)] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)] animate-pulse" />
            Nimiq PoS Albatross
          </span>

          <a
            href="/app"
            className="press px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            Launch App <ArrowUpRight size={12} />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6">
        {/* Left Navigation Sidebar */}
        <DocsSidebar
          activeAnchor={activeAnchor}
          onOpenSearch={() => setSearchOpen(true)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Center Main Documentation Article */}
        <main className="flex-1 min-w-0 lg:pl-72 xl:pr-10 py-10">
          <div className="max-w-3xl space-y-16">
            {/* Title / Hero Banner */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--gold)] mb-3">
                <span>PROTOCOL SPECIFICATION</span>
                <span>·</span>
                <span>VERSION 1.0</span>
                <span>·</span>
                <span className="text-[var(--verdigris)]">NIMIQ MAINNET</span>
              </div>
              <h1 className="h-display text-4xl sm:text-5xl font-extrabold text-[var(--ink)] leading-tight">
                The Proof-of-Action Protocol Specification
              </h1>
              <p className="marginalia text-base mt-4 leading-relaxed text-[var(--ink2)]">
                A formal architectural reference for decentralized smart covenants, sub-second escrow settlements, mathematical custody, and sceptical AI oracles on the Nimiq blockchain.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[var(--line)] text-xs text-[var(--ink3)]">
                <span>Vault: <code className="font-mono text-[var(--gold)]">NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT</code></span>
                <span>·</span>
                <span>Fee: <code className="font-mono text-[var(--ink)]">0.0011 NIM</code></span>
                <span>·</span>
                <span>Inference: <code className="font-mono text-[var(--sky)]">Qwen 3.6 (Hetzner)</code></span>
              </div>
            </div>

            {/* =========================================================================
                SECTION 1: PROTOCOL FOUNDATIONS
            ========================================================================= */}
            <section className="space-y-8 pt-6 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 1</span>
                <h2 id="doctrine" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 1. Protocol Doctrine & Foundations
                </h2>
              </div>

              {/* 1.1 Doctrine */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 1.1 The Doctrine of Proof-of-Action
                </h3>
                <blockquote className="p-4 rounded-2xl bg-black/30 border-l-4 border-[var(--gold)] text-sm italic text-[var(--ink)] leading-relaxed">
                  "Traditional distributed ledgers excel at recording the transfer of digital abstractions within their closed state machines. Acta connects blockchain consensus directly with reality: money moves when physical deeds or verified digital deliverables occur."
                </blockquote>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  On traditional blockchains, escrows are hampered by high transaction gas ($2–$15 per state update on EVM chains), slow block times (12–15 seconds), and opaque dispute systems. Acta leverages the <strong>Nimiq Proof-of-Stake (Albatross)</strong> consensus engine to achieve <strong>sub-second micro-blocks</strong> and deterministic finality with micro-fees of <strong>0.0001 NIM</strong>.
                </p>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Because transaction costs on Nimiq are negligible, micro-covenants become viable: lending a power tool for two hours, sponsoring a neighborhood park cleanup, placing an unforgeable cryptographic proximity token at a secret location, or commissioning a global open-source bug fix.
                </p>
              </div>

              {/* 1.2 Traditional Failure */}
              <div id="traditional-failure" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 1.2 Traditional Escrow Failure Modes vs. Acta
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--wax)]/30 text-xs text-[var(--ink2)] space-y-2">
                    <span className="caps text-[9px] text-[var(--wax)] font-bold block">Centralized Middlemen (Web2)</span>
                    <ul className="space-y-1.5 list-disc list-inside text-[12px]">
                      <li>Extract 15% to 30% commission from participants.</li>
                      <li>Arbitrary account freezes and custodial censorship.</li>
                      <li>Weeks of bureaucratic dispute arbitration.</li>
                      <li>User reputation is locked inside closed corporate silos.</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--verdigris)]/30 text-xs text-[var(--ink2)] space-y-2">
                    <span className="caps text-[9px] text-[var(--verdigris)] font-bold block">Acta Smart Covenants (Nimiq)</span>
                    <ul className="space-y-1.5 list-disc list-inside text-[12px]">
                      <li>Flat 0.001 NIM protocol fee retained by treasury.</li>
                      <li>Non-custodial vault holding funds autonomously on-chain.</li>
                      <li>Instant settlement upon cryptographic or AI oracle verdict.</li>
                      <li>Algorithmic trust score compounds into direct borrowing power.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 1.3 Local vs Global Remote */}
              <div id="local-vs-global" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 1.3 Local Proximity vs. Global Remote Deeds
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  A common misconception is that Acta only supports physical, in-person hardware handoffs between neighbors. <strong>This is only one subset of its capability.</strong> The protocol spans two complementary vectors:
                </p>
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-[var(--line)]">
                    <h4 className="text-sm font-bold text-[var(--gold)] flex items-center gap-2">
                      <MapPin size={15} /> Vector I: Physical Proximity & Regional Deeds
                    </h4>
                    <p className="text-[12.5px] text-[var(--ink2)] mt-1 leading-relaxed">
                      Equipment custody loans (cameras, e-bikes, tools), physical scavenger hunts (ScanQuest tokens), and geofenced real-world environmental tasks. Protected by Ed25519 single-use cryptographic QR handshakes and GPS bounds.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-[var(--line)]">
                    <h4 className="text-sm font-bold text-[var(--sky)] flex items-center gap-2">
                      <Globe size={15} /> Vector II: Global Remote & Digital Deeds
                    </h4>
                    <p className="text-[12.5px] text-[var(--ink2)] mt-1 leading-relaxed">
                      Online venture deliverables, open-source software contributions, graphic design tasks, translation bounties, and decentralized challenges worldwide. Anyone anywhere across the globe can accept, execute, and settle covenants with zero physical meeting required.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1.4 Tradeoffs */}
              <div id="tradeoffs" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 1.4 Guarantees, Tradeoffs & Constraints
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Acta does not compromise on architectural honesty. We disclose the real-world engineering constraints:
                </p>
                <div className="grid gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <strong className="text-[var(--gold)] block mb-1">Sceptical Vision AI Instruction</strong>
                    The vision oracle defaults to refusal whenever there is doubt. Challengers must ensure clear lighting and framed requirements. Transport timeouts (502 / 429) are treated as retryable errors, never recorded as failures.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <strong className="text-[var(--sky)] block mb-1">Sequential Nonce Serialization</strong>
                    Nimiq accounts utilize sequential transaction nonces. Concurrent payouts are serialized through a strict FIFO execution queue (`lib/backend-nimiq.ts`) to prevent nonce collision.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <strong className="text-[var(--verdigris)] block mb-1">GPS Accuracy Bounds</strong>
                    Geofenced covenants enforce a 50-metre radius and an accuracy bound (&le; 50 metres) via HTML5 Geolocation to prevent location spoofing.
                  </div>
                </div>
              </div>

              {/* 1.5 Fees */}
              <div id="fees" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 1.5 Network Economy & Fee Schedule
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                    <span className="text-[var(--ink3)]">Protocol Vault Retention Fee:</span>
                    <span className="text-[var(--gold)] font-bold">0.001 NIM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                    <span className="text-[var(--ink3)]">Nimiq Network Broadcast Gas Fee:</span>
                    <span className="text-[var(--ink)] font-bold">0.0001 NIM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                    <span className="text-[var(--ink3)]">Total Settle Fee (Deducted from gross):</span>
                    <span className="text-[var(--verdigris)] font-bold">0.0011 NIM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--line)]/50">
                    <span className="text-[var(--ink3)]">Dust Minimum Collateral Guard:</span>
                    <span className="text-[var(--ink)] font-bold">0.01 NIM</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--ink3)]">Unclaimed Listing Cancellation Penalty:</span>
                    <span className="text-[var(--verdigris)] font-bold">0.0000 NIM (100% Refund)</span>
                  </div>
                </div>
                <p className="text-[12.5px] text-[var(--ink3)]">
                  Protocol fees retained by the vault are not extracted as private profits; they accumulate in the autonomous Treasury reserve to fund career milestones, daily check-in streaks, and instant 10 NIM referral rewards.
                </p>
              </div>
            </section>

            {/* =========================================================================
                SECTION 2: BLOCKCHAIN ARCHITECTURE
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 2</span>
                <h2 id="albatross" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 2. Blockchain Architecture & Consensus
                </h2>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 2.1 The Nimiq PoS Albatross Engine
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Nimiq operates on the <strong>Albatross consensus protocol</strong>, a state-of-the-art Proof-of-Stake algorithm capable of generating micro-blocks in under one second. When an oracle verdict or return QR is submitted to Acta, settlement on Nimiq reaches finality virtually instantly.
                </p>
              </div>

              {/* 2.2 Mini-App */}
              <div id="miniapp" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 2.2 The Nimiq Pay Mini-App Runtime
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Acta does not force users to install browser extensions or configure custom RPC nodes. It operates as an embedded Mini-App within Nimiq Pay:
                </p>
                <ul className="space-y-2 text-xs text-[var(--ink2)] list-disc list-inside">
                  <li><strong>Native Wallet Invocations</strong>: Direct execution of <code className="font-mono text-[var(--gold)]">window.nimiq.sendBasicTransaction()</code> locks funds seamlessly straight from the user's wallet.</li>
                  <li><strong>Standalone Fallback</strong>: In standard browsers, Acta launches the Nimiq Keyguard cryptographic popup for signing challenges and transactions.</li>
                  <li><strong>Iframe Bearer Authentication</strong>: In mobile environments where third-party cookies are blocked, authenticated session tokens are stored in <code className="font-mono text-[var(--ink)]">localStorage</code> and attached as <code className="font-mono text-[var(--ink)]">Authorization: Bearer &lt;token&gt;</code> on every API request.</li>
                </ul>
              </div>

              {/* 2.3 Vault */}
              <div id="vault" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 2.3 Autonomous Vault (`NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  The protocol vault is an autonomous reserve address derived from a BIP44 master seed phrase (<code className="font-mono text-[var(--gold)]">m/44'/242'/0'/0'</code>). Payouts are signed and broadcasted by the backend settlement daemon (<code className="font-mono text-[var(--ink)]">lib/backend-nimiq.ts</code>) with user-friendly UTF-8 transaction payloads (e.g. <em>"Acta Protocol: Settlement Release"</em>).
                </p>
              </div>

              {/* 2.4 Zero-Cron */}
              <div id="zero-cron" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 2.4 Zero-Cron Architecture & Lazy Evaluation
                </h3>
                <div className="p-4 rounded-2xl bg-black/20 border border-[var(--line)] space-y-2 text-xs text-[var(--ink2)]">
                  <div className="flex items-center gap-2 text-[var(--gold)] font-semibold">
                    <Info size={14} /> Edge Serverless Optimization
                  </div>
                  <p className="leading-relaxed">
                    Background cron jobs that run once a day or sleep in memory are unreliable on edge platforms (Vercel, Cloudflare, Serverless). Acta eliminates scheduled crons entirely:
                  </p>
                  <p className="font-mono text-[11px] text-[var(--gold2)] bg-black/40 p-2.5 rounded-xl border border-[var(--line)]/50">
                    WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at &gt; $(Date.now()))
                  </p>
                  <p className="leading-relaxed">
                    Listing expiration is evaluated lazily in real-time during queries. Expired covenants disappear from Radar immediately when their countdown hits zero without waiting for any server daemon.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 3: THE 6 COVENANT ARCHETYPES
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 3</span>
                <h2 id="cov-borrow" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 3. The 6 Covenant Archetypes (Deep Dive)
                </h2>
              </div>

              {/* 3.1 Borrow / Lend */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)] flex items-center gap-2">
                  <Lock size={18} /> § 3.1 Equipment Custody & Rental (`borrow`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  For physical tool lending, electronics, and transport equipment. Operates under a dual-mode mechanism:
                </p>

                <div id="borrow-modes" className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/30 border border-[var(--gold)]/30 space-y-2 text-xs">
                    <span className="caps text-[9px] text-[var(--gold)] font-bold block">Mode A: List as Available (Lender)</span>
                    <p className="text-[var(--ink2)]">
                      Lender lists equipment with <strong>0 NIM deducted upfront</strong>. When a borrower accepts on Radar, the <em>borrower</em> locks collateral into the Vault.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/30 border border-[var(--sky)]/30 space-y-2 text-xs">
                    <span className="caps text-[9px] text-[var(--sky)] font-bold block">Mode B: Request to Rent (Borrower)</span>
                    <p className="text-[var(--ink2)]">
                      Requester seeks an item and <strong>locks collateral upfront into the Vault</strong> upon creation. When a lender accepts and fulfills custody, collateral unlocks on return.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/20 border border-[var(--line)] text-xs text-[var(--ink2)] space-y-2">
                  <span className="caps text-[9px] text-[var(--verdigris)] font-bold block">Return Handshake Mechanics</span>
                  <p className="leading-relaxed">
                    When custody ends, the lender generates a single-use 10-minute Return QR signed with their local key. When scanned by the borrower (or presented by borrower to lender), the vault unlocks collateral back to the borrower minus the 0.0011 NIM settle fee.
                  </p>
                </div>
              </div>

              {/* 3.2 Vision Oracle */}
              <div id="cov-vision" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--sky)] flex items-center gap-2">
                  <Eye size={18} /> § 3.2 Vision Oracle Photo Quests (`bounty`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Real-world and digital deeds verified by machine vision. The sponsor locks the bounty upfront in the Vault. The challenger submits high-resolution photo evidence.
                </p>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] text-xs space-y-3">
                  <div className="flex justify-between items-center text-[var(--gold)] font-mono">
                    <span>Model: Qwen/Qwen3.6-35B-A3B-FP8</span>
                    <span>Endpoint: inference.hetzner.com</span>
                  </div>
                  <p className="text-[var(--ink2)] leading-relaxed">
                    The vision oracle runs on Hetzner inference experiments via OpenAI-compatible endpoints with client-side rate budgeting (10 req/min). It is strictly instructed to reject screenshots, stock photos, and recycled images. Doubt defaults to refusal.
                  </p>
                </div>
              </div>

              {/* 3.3 ScanQuest */}
              <div id="cov-scanquest" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--verdigris)] flex items-center gap-2">
                  <QrCode size={18} /> § 3.3 ScanQuest Proximity Handshake (`bounty_qr`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Physical discovery quests, scavenger hunts, secret events, and conference checkpoints. The sponsor hides a cryptographically signed QR token in the physical world:
                </p>
                <div className="p-4 rounded-2xl bg-black/20 border border-[var(--line)] font-mono text-xs text-[var(--ink)] space-y-1">
                  <p className="text-[var(--gold2)]">// Ed25519 single-use signed payload (lib/qr.ts)</p>
                  <p>Payload: base64url(JSON {'{'} escrowId, lender, amount, chain, nonce, exp {'}'}) + "." + base64url(sig)</p>
                  <p className="text-[var(--ink3)]">// Nonce consumed permanently upon verify (zero replay attack possible)</p>
                </div>
              </div>

              {/* 3.4 Geofence */}
              <div id="cov-geo" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                  <MapPin size={18} /> § 3.4 Geolocation Geofence Attestation (`bounty_geo`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Physical presence verification at specific GPS coordinates. The challenger device samples its coordinates via HTML5 Geolocation. The server computes the spherical Haversine great-circle distance:
                </p>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] text-xs text-[var(--ink2)] font-mono">
                  distanceMetres &le; targetRadius AND deviceAccuracy &le; 50 metres
                </div>
                <p className="text-[12.5px] text-[var(--ink3)]">
                  Can be combined with an accompanying photo requirement (<code className="font-mono text-[var(--gold)]">ai.presenceCheck: true</code>) to ensure the challenger is physically there and not spoofing coordinates.
                </p>
              </div>

              {/* 3.5 In-Person Attest */}
              <div id="cov-manual" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)] flex items-center gap-2">
                  <Users size={18} /> § 3.5 In-Person Human Attestation (`bounty_manual`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Human-arbitrated covenants for specialized craftsmanship, bespoke commissions, or subjective tasks. Submissions appear in the sponsor's Inbox. The sponsor approves with one cryptographic signature to disburse the vaulted funds.
                </p>
                <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)] text-xs text-[var(--ink2)]">
                  <strong className="text-[var(--sky)] block mb-1">AI Pre-Screening Assistant</strong>
                  When enabled, Qwen 3.6 pre-evaluates the challenger's text submission and outputs an advisory recommendation (<code className="text-[var(--verdigris)]">approve</code>, <code className="text-[var(--wax)]">reject</code>, <code className="text-[var(--ink3)]">unsure</code>) with a confidence percentage (0–100) to help the sponsor decide quickly.
                </div>
              </div>

              {/* 3.6 Online Venture */}
              <div id="cov-venture" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--sky)] flex items-center gap-2">
                  <Globe size={18} /> § 3.6 Online Ventures & Global Remote Bounties (`bounty_venture`)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  <strong>100% boundaryless worldwide participation.</strong> Enables sponsors to fund remote engineering tasks, pull requests, logo design, bug bounties, article translations, or decentralized project deliverables.
                </p>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--sky)]/30 text-xs text-[var(--ink2)] space-y-2">
                  <span className="caps text-[9px] text-[var(--sky)] font-bold block">Worldwide Execution Lifecycle</span>
                  <p className="leading-relaxed">
                    A sponsor in Berlin locks 500 NIM in the vault for an open-source bug fix. A developer in Tokyo submits a GitHub PR URL. The sponsor reviews the code deliverable from their Inbox and signs the release. The 500 NIM transfers to the developer's wallet in less than one second.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 4: CONTRACT LIFECYCLE & STATE MACHINES
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 4</span>
                <h2 id="toggles" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 4. Contract Lifecycle & State Machines
                </h2>
              </div>

              {/* 4.1 Toggles */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 4.1 The 4 Contract Toggles Explained
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--gold)]/30">
                    <strong className="text-[var(--gold)] block text-sm mb-1">1. In Progress</strong>
                    Active escrows currently under custody, in execution, or awaiting return scan. Displays countdown timers and requirement dossiers.
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--sky)]/30">
                    <strong className="text-[var(--sky)] block text-sm mb-1">2. Awaiting Me</strong>
                    Action-required queue filtered specifically for the logged-in user: lenders waiting to scan a return, challengers waiting to submit, or sponsors reviewing deliverables.
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--verdigris)]/30">
                    <strong className="text-[var(--verdigris)] block text-sm mb-1">3. Settled</strong>
                    Immutable register of completed covenants. Displays on-chain transaction hash (<code className="font-mono text-[10px]">txHashOut</code>), verified oracle stamp, and Nimiq explorer links.
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--wax)]/30">
                    <strong className="text-[var(--wax)] block text-sm mb-1">4. Refunded</strong>
                    Cancelled listings, expired covenants, or mutually refunded transactions where 100% of vaulted funds returned to source without penalty.
                  </div>
                </div>
              </div>

              {/* 4.2 Badges */}
              <div id="badges" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 4.2 Dynamic Attention Badges & Auto-Dismissal
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  To eliminate notification noise, every toggle displays a dynamic numerical badge (<code className="font-mono text-[var(--gold)]">1</code>, <code className="font-mono text-[var(--gold)]">2</code>) indicating how many items require user attention. <strong>The badge automatically dismisses as soon as the user opens that tab</strong>, tracking view state locally in memory.
                </p>
              </div>

              {/* 4.3 State Machine Interactive */}
              <div id="state-machine" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 4.3 Covenant State Machine Navigator
                </h3>
                <StateMachineFlow />
              </div>

              {/* 4.4 Disputes & Grace */}
              <div id="disputes" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 4.4 Unreturned Item Claims & 48-Hour Grace Period
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--wax)]/40 text-xs text-[var(--ink2)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--wax)] font-semibold">
                    <AlertCircle size={15} /> Default Protection Guarantee
                  </div>
                  <p className="leading-relaxed">
                    If an equipment loan deadline elapses without return, the covenant enters a dispute window. The borrower is granted a <strong>48-hour grace window</strong> (<code className="font-mono text-[var(--gold)]">LENDER_CLAIM_GRACE_MS</code>) to return the item.
                  </p>
                  <p className="leading-relaxed">
                    If the borrower still fails to return the item after the 48-hour grace period, the lender's <strong>"Claim Collateral"</strong> button unlocks. Invoking <code className="font-mono text-[var(--ink)]">POST /api/claim</code> seizes 100% of the vaulted collateral and transfers it directly to the lender's wallet.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 5: REPUTATION & PRIVILEGES
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 5</span>
                <h2 id="trust-score" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 5. Reputation & Sovereign Privileges
                </h2>
              </div>

              {/* 5.1 Trust Score */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 5.1 The Algorithmic Trust Score Formula (0–100)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Acta does not rely on subjective star ratings or easily gamed reviews. Trust is derived algorithmically from mathematical facts etched in the acts ledger:
                </p>

                <div className="p-4 rounded-2xl bg-black/40 border border-[var(--line)] font-mono text-xs text-[var(--gold2)] space-y-1.5 overflow-x-auto">
                  <p>Trust Score = min(100, round(</p>
                  <p className="pl-4">  (settledActs / totalActs) * 35         // Completion Rate (35 pts)</p>
                  <p className="pl-4">+ min(25, (log10(volumeNIM + 1)/5) * 25) // Volume Weight (25 pts)</p>
                  <p className="pl-4">+ min(20, (tenureDays / 90) * 20)        // Account Tenure (20 pts)</p>
                  <p className="pl-4">+ min(10, (distinctOracles / 5) * 10)    // Oracle Diversity (10 pts)</p>
                  <p className="pl-4">+ min(10, (communityActs / 10) * 10)     // Sponsored Peer Acts (10 pts)</p>
                  <p>))</p>
                </div>
              </div>

              {/* 5.2 Buying Power */}
              <div id="discount-formula" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 5.2 Reputation as Buying Power (Collateral Discount)
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Trust score directly lowers required collateral locks for equipment borrowing:
                </p>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--gold)]/30 font-mono text-xs text-[var(--gold)]">
                  discountRate = min(0.30, trustScore * 0.003) // Up to 30% discount at Trust 100
                </div>

                {/* Interactive Calculator */}
                <TrustCalculator />
              </div>

              {/* 5.3 Rites */}
              <div id="rites" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 5.3 The 5 Sovereign Privileges / Rites
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <strong className="text-[var(--gold)] block mb-0.5">Rite I: Daily Vigil & Continuous Streaks</strong>
                    Daily attendance attestation. Maintains continuous presence on the calendar and unlocks periodic treasury honorariums.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--verdigris)]">
                    <strong className="text-[var(--verdigris)] block mb-0.5">Rite II: Sovereign Proof Stamps</strong>
                    Cryptographic badges permanently minted onto the user's Acta Passport for every verified action.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--sky)]">
                    <strong className="text-[var(--sky)] block mb-0.5">Rite III: Herald's Call & Peer Covenants</strong>
                    Mutual dual-reward onboarding covenants disbursed immediately from the protocol treasury.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--gold2)]">
                    <strong className="text-[var(--gold2)] block mb-0.5">Rite IV: Autonomous Milestone Drips</strong>
                    Career milestone grants for volume thresholds, clean tenure, and first-time achievements.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--ink2)]">
                    <strong className="text-[var(--ink)] block mb-0.5">Rite V: The Immutable Deed Scroll</strong>
                    Undeniable public ledger linking acts to cryptographic nonces and Nimiq block explorer URLs.
                  </div>
                </div>
              </div>

              {/* 5.4 Referrals */}
              <div id="referrals" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--verdigris)]">
                  § 5.4 Instant Dual-Reward Referral System (10 NIM Each)
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--verdigris)]/40 text-xs text-[var(--ink2)] space-y-2">
                  <p className="leading-relaxed">
                    Unlike traditional web apps that delay referral incentives for weeks, Acta rewards <strong>both the Referrer AND the Referee with 10 NIM immediately</strong> from the treasury when the referral is claimed or upon joining.
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Inviter earns 10 NIM credited directly to their wallet.</li>
                    <li>Invited peer earns 10 NIM welcome bonus credited directly to their wallet.</li>
                    <li>Can be claimed via unique URL (<code className="font-mono text-[var(--gold)]">/?ref=CODE</code>) or by entering the 6-character code in the Passport dashboard.</li>
                  </ul>
                </div>
              </div>

              {/* 5.5 Milestones */}
              <div id="milestones" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 5.5 Career Milestones & Recurring Drips
                </h3>
                <div className="p-4 rounded-2xl bg-black/20 border border-[var(--line)] text-xs space-y-2">
                  <p className="text-[var(--ink2)]">
                    The protocol fee treasury continuously redistributes accumulated fees through autonomous performance grants:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 pt-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-black/30 border border-[var(--line)]/40">
                      <span className="text-[var(--gold)]">FIRST_CONNECTION:</span> 10 NIM
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-[var(--line)]/40">
                      <span className="text-[var(--gold)]">FIRST_SETTLED:</span> 1 NIM
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-[var(--line)]/40">
                      <span className="text-[var(--gold)]">FIRST_BOUNTY:</span> 1 NIM
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-[var(--line)]/40">
                      <span className="text-[var(--gold)]">RECUR_SETTLE:</span> 1 NIM every 3rd settle
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 6: DEVELOPER REST API REFERENCE
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 6</span>
                <h2 id="api-auth" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 6. Developer Reference & REST API
                </h2>
              </div>

              {/* 6.1 Auth */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 6.1 Cryptographic Authentication & Bearer Tokens
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Clients authenticate by signing a single-use nonce challenge with their Nimiq Ed25519 keypair.
                </p>

                <CodeTabs
                  title="Authentication Flow (TypeScript)"
                  snippets={[
                    {
                      label: "TypeScript",
                      language: "typescript",
                      code: `// 1. Request challenge nonce
const { nonce } = await fetch('/api/auth/challenge').then(r => r.json());

// 2. Sign message via Nimiq Keyguard or window.nimiq
const message = \`Acta login\\n\\nNonce: \${nonce}\`;
const { publicKey, signature } = await signMessage(message);

// 3. Verify signature & establish session
const res = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publicKey, signature, nonce }),
});
const { address, token } = await res.json();
// Store token and transmit via Authorization: Bearer <token>`,
                    },
                    {
                      label: "cURL",
                      language: "bash",
                      code: `# Step 1: Obtain nonce
curl -X GET https://acta.app/api/auth/challenge

# Step 2: Verify signed challenge
curl -X POST https://acta.app/api/auth/verify \\
  -H "Content-Type: application/json" \\
  -d '{"publicKey":"...","signature":"...","nonce":"..."}'`,
                    },
                  ]}
                />
              </div>

              {/* 6.2 Listings API */}
              <div id="api-listings" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 6.2 Listings API Endpoints
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)]">
                    <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-bold">POST</span>
                      <span className="text-[var(--ink)] font-bold">/api/listings</span>
                    </div>
                    <p className="text-xs text-[var(--ink2)] mb-3">
                      Deploys a new covenant listing to Radar.
                    </p>
                    <CodeTabs
                      title="POST /api/listings Payload"
                      snippets={[
                        {
                          label: "JSON Body",
                          language: "json",
                          code: `{
  "title": "Sony Alpha A7 IV Camera Lens Kit",
  "collateralNIM": 2500,
  "durationDays": 3,
  "kind": "borrow",
  "category": "electronics",
  "borrowMode": "lend",
  "description": "Includes 24-70mm f/2.8 GM lens and 2 batteries.",
  "contract": {
    "criteria": "Return item clean with no lens scratches",
    "deadlineHours": 72,
    "minTrust": 15,
    "expiresInHours": 168,
    "ai": { "primary": "qr", "presenceCheck": false, "preScreen": false }
  }
}`,
                        },
                      ]}
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)]">
                    <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-[var(--verdigris)]/20 text-[var(--verdigris)] font-bold">GET</span>
                      <span className="text-[var(--ink)] font-bold">/api/listings</span>
                    </div>
                    <p className="text-xs text-[var(--ink2)]">
                      Fetches active listings from Radar. Filter with query params: <code className="font-mono text-[var(--gold)]">?filter=borrow|bounty|mine</code>. Excludes expired listings automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6.3 Escrows API */}
              <div id="api-escrows" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 6.3 Escrows & Custody API
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)]">
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-bold">POST</span>
                    <span className="text-[var(--ink)] font-bold">/api/escrows</span>
                  </div>
                  <p className="text-xs text-[var(--ink2)] mb-3">
                    Locks funds into the autonomous vault when accepting an open covenant.
                  </p>
                  <CodeTabs
                    title="POST /api/escrows Payload"
                    snippets={[
                      {
                        label: "JSON Body",
                        language: "json",
                        code: `{
  "listingId": "list_94a8f2e...",
  "txHash": "0x5a2d8e...",
  "lenderPubkey": "c982a4...",
  "idempotencyKey": "idem_e8a912..."
}`,
                      },
                    ]}
                  />
                </div>
              </div>

              {/* 6.4 Verification */}
              <div id="api-verification" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 6.4 Oracle Verification Endpoints
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="font-mono font-bold text-[var(--gold)] mb-1">POST /api/bounty/verify</div>
                    <p className="text-[var(--ink2)]">Streams base64 image buffer to Qwen 3.6 on Hetzner inference. On pass, triggers sub-second vault payout.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="font-mono font-bold text-[var(--verdigris)] mb-1">POST /api/bounty/scanquest</div>
                    <p className="text-[var(--ink2)]">Verifies Ed25519 signature over single-use 10-minute token and consumes nonce to prevent replay.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="font-mono font-bold text-[var(--sky)] mb-1">POST /api/bounty/geo</div>
                    <p className="text-[var(--ink2)]">Verifies Haversine distance (&le;50m) and GPS accuracy radius for location check-ins.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="font-mono font-bold text-[var(--ink)] mb-1">POST /api/bounty/manual_approve</div>
                    <p className="text-[var(--ink2)]">Sponsor signs approval in Inbox to disburse vaulted reward for custom commissions.</p>
                  </div>
                </div>
              </div>

              {/* 6.5 Referral Claim */}
              <div id="api-referral-claim" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--verdigris)]">
                  § 6.5 Referral Claim API (`POST /api/referral/claim`)
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--verdigris)]/30">
                  <p className="text-xs text-[var(--ink2)] mb-3">
                    Claims a peer referral code and immediately disburses 10 NIM to the referrer and 10 NIM to the referee directly from the treasury.
                  </p>
                  <CodeTabs
                    title="POST /api/referral/claim"
                    snippets={[
                      {
                        label: "Request & Response",
                        language: "json",
                        code: `// POST /api/referral/claim
{
  "code": "7A1F2C"
}

// 200 OK Response
{
  "ok": true,
  "rewardNIM": 10,
  "referrer": "NQ10 05XT YLN6 1H4P SEDE PY2A L9AF YAJ4 NRF5",
  "paidReferrer": true,
  "paidReferee": true,
  "message": "10 NIM referral reward successfully granted to both you and your friend!"
}`,
                      },
                    ]}
                  />
                </div>
              </div>

              {/* 6.6 Types */}
              <div id="api-types" className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 6.6 Core TypeScript Interfaces & Schemas
                </h3>
                <CodeTabs
                  title="lib/escrow.ts & lib/contract.ts"
                  snippets={[
                    {
                      label: "TypeScript",
                      language: "typescript",
                      code: `export type ListingKind = "borrow" | "bounty" | "bounty_venture" | "bounty_qr" | "bounty_manual" | "bounty_geo";
export type OracleType = "qr_sig" | "vision" | "geo" | "creator" | "system";
export type EscrowState = "locked" | "settling" | "released" | "cancelled" | "disputed" | "expired";

export interface ListingContract {
  criteria: string;                 // exact criteria evaluated by Qwen 3.6
  deadlineHours: number;            // completion window after accepting
  minTrust: number;                 // minimum trust score required to accept
  expiresInHours: number;           // radar listing lifespan
  geo?: { lat: number; lng: number; radiusM: number };
  ai: {
    primary: "vision" | "qr" | "geo" | "creator";
    presenceCheck: boolean;         // require accompanying scene photo
    preScreen: boolean;             // AI assistant score for manual review
  };
}`,
                    },
                  ]}
                />
              </div>
            </section>

            {/* =========================================================================
                SECTION 7: INTERACTIVE SANDBOXES
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)]">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 7</span>
                <h2 id="tool-oracle" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 7. Interactive Sandboxes & Tooling
                </h2>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 7.3 Autonomous Oracle Test Playground
                </h3>
                <OracleSimulator />
              </div>

              <div className="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-display text-lg font-bold text-[var(--ink)]">
                    Ready to participate in the Proof-of-Action protocol?
                  </h4>
                  <p className="marginalia text-xs mt-0.5 text-[var(--ink2)]">
                    Connect your Nimiq wallet, inspect open covenants on Radar, or mint your referral covenant.
                  </p>
                </div>
                <a href="/app" className="press px-6 py-3 rounded-xl text-xs font-bold whitespace-nowrap">
                  Launch Acta Application
                </a>
              </div>
            </section>
          </div>
        </main>

        {/* Right Sticky Table of Contents */}
        <DocsToc headings={TOC_HEADINGS} activeId={activeAnchor} />
      </div>
    </div>
  );
}
