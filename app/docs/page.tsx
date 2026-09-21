"use client";

import { useState, useEffect } from "react";
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
import SourceLink, { GitHubIcon } from "@/components/docs/SourceLink";
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
    <div className="min-h-screen flex flex-col bg-[#12100c] text-[var(--ink)] antialiased overflow-x-hidden">
      {/* Search Modal */}
      <DocsSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-[var(--line)] bg-[#12100c]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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
            href="https://github.com/Idle0x/nimiq-acta"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-[var(--line)] text-xs text-[var(--ink2)] hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition-colors"
            title="Browse Acta GitHub Repository"
          >
            <GitHubIcon size={14} />
            <span className="font-mono text-[11px]">GitHub</span>
          </a>

          <a
            href="/app"
            className="press px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            Launch App <ArrowUpRight size={12} />
          </a>
        </div>
      </header>

      {/* Main Balanced Three-Column Layout */}
      <div className="flex-1 flex w-full max-w-[90rem] mx-auto min-w-0">
        {/* Left Sticky Sidebar */}
        <DocsSidebar
          activeAnchor={activeAnchor}
          onOpenSearch={() => setSearchOpen(true)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Center Main Documentation Article */}
        <main className="flex-1 min-w-0 max-w-4xl px-4 sm:px-8 lg:px-12 py-10">
          <div className="space-y-16 w-full max-w-full min-w-0">
            {/* Title / Hero Banner */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--gold)] mb-3 flex-wrap">
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
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[var(--line)] text-xs text-[var(--ink3)]">
                <span>Vault: <code className="font-mono text-[var(--gold)]">NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT</code></span>
                <span>·</span>
                <span>Fee: <code className="font-mono text-[var(--ink)]">0.0011 NIM</code></span>
                <span>·</span>
                <span>Inference: <code className="font-mono text-[var(--sky)]">Qwen 3.6 (Hetzner)</code></span>
                <SourceLink path="lib/vault.ts" label="lib/vault.ts" compact />
              </div>
            </div>

            {/* =========================================================================
                SECTION 1: PROTOCOL FOUNDATIONS
            ========================================================================= */}
            <section className="space-y-8 pt-6 border-t border-[var(--line)] min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-2">
                  <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 1</span>
                  <h2 id="doctrine" className="font-display text-3xl font-bold text-[var(--ink)]">
                    § 1. Protocol Doctrine & Foundations
                  </h2>
                </div>
                <SourceLink path="lib/escrow.ts" label="lib/escrow.ts" compact />
              </div>

              {/* 1.1 Doctrine */}
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 1.1 The Doctrine of Proof-of-Action
                  </h3>
                  <SourceLink path="lib/contract.ts" label="lib/contract.ts" compact />
                </div>
                <blockquote className="p-4 rounded-2xl bg-black/30 border-l-4 border-[var(--gold)] text-sm italic text-[var(--ink)] leading-relaxed">
                  &quot;Traditional distributed ledgers excel at recording the transfer of digital abstractions within their closed state machines. Acta connects blockchain consensus directly with reality: money moves when physical deeds or verified digital deliverables occur.&quot;
                </blockquote>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  On traditional blockchains, escrows are hampered by high transaction gas ($2–$15 per state update on EVM chains), slow block times (12–15 seconds), and opaque dispute systems. Acta leverages the <strong>Nimiq Proof-of-Stake (Albatross)</strong> consensus engine to achieve <strong>sub-second micro-blocks</strong> and deterministic finality with micro-fees of <strong>0.0001 NIM</strong>.
                </p>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Because transaction costs on Nimiq are negligible, micro-covenants become viable: lending a power tool for two hours, sponsoring a neighborhood park cleanup, placing an unforgeable cryptographic proximity token at a secret location, or commissioning a global open-source bug fix.
                </p>
              </div>

              {/* 1.2 Traditional Failure */}
              <div id="traditional-failure" className="space-y-4 min-w-0">
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
              <div id="local-vs-global" className="space-y-4 min-w-0">
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
              <div id="tradeoffs" className="space-y-4 min-w-0">
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
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--verdigris)] block mb-1">
                    <strong className="text-[var(--verdigris)] block mb-1">GPS Accuracy Bounds</strong>
                    Geofenced covenants enforce a 50-metre radius and an accuracy bound (&le; 50 metres) via HTML5 Geolocation to prevent location spoofing.
                  </div>
                </div>
              </div>

              {/* 1.5 Fees */}
              <div id="fees" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 1.5 Network Economy & Fee Schedule
                  </h3>
                  <SourceLink path="lib/escrow-math.ts" label="lib/escrow-math.ts" compact />
                </div>
                <div className="overflow-x-auto w-full max-w-full">
                  <table className="w-full text-xs text-left border border-[var(--line)] rounded-xl overflow-hidden">
                    <thead className="bg-black/40 text-[var(--gold)] uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Operation</th>
                        <th className="p-3">Protocol Fee</th>
                        <th className="p-3">Nimiq Gas</th>
                        <th className="p-3">Recipient</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]/50 text-[var(--ink2)]">
                      <tr>
                        <td className="p-3 font-medium text-[var(--ink)]">Available Listing Creation</td>
                        <td className="p-3 font-mono text-[var(--verdigris)]">0.0000 NIM</td>
                        <td className="p-3 font-mono">0.0000 NIM</td>
                        <td className="p-3">Off-chain Radar listing</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[var(--ink)]">Bounty / Rent Creation</td>
                        <td className="p-3 font-mono">0.0000 NIM</td>
                        <td className="p-3 font-mono">0.0001 NIM</td>
                        <td className="p-3">Nimiq Validators</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[var(--ink)]">Covenant Acceptance (Lock)</td>
                        <td className="p-3 font-mono">0.0000 NIM</td>
                        <td className="p-3 font-mono">0.0001 NIM</td>
                        <td className="p-3">Nimiq Validators</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[var(--ink)]">Vault Payout Settlement</td>
                        <td className="p-3 font-mono text-[var(--gold)]">0.0010 NIM</td>
                        <td className="p-3 font-mono">0.0001 NIM</td>
                        <td className="p-3">Community Treasury & Validators</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[var(--ink)]">Cancellation / Refund</td>
                        <td className="p-3 font-mono text-[var(--verdigris)]">0.0000 NIM</td>
                        <td className="p-3 font-mono">0.0001 NIM</td>
                        <td className="p-3">Full Principal Returned</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 2: NIMIQ LEDGER & CONSENSUS
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)] min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-2">
                  <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 2</span>
                  <h2 id="albatross" className="font-display text-3xl font-bold text-[var(--ink)]">
                    § 2. The Nimiq Ledger & Micro-Consensus
                  </h2>
                </div>
                <SourceLink path="lib/backend-nimiq.ts" label="lib/backend-nimiq.ts" compact />
              </div>

              {/* 2.1 Albatross */}
              <div className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 2.1 The Nimiq PoS Albatross Engine
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Acta runs atop Nimiq&apos;s second-generation consensus mechanism: <strong>Albatross</strong>. Albatross is a state-of-the-art, optimistic Proof-of-Stake algorithm capable of achieving thousands of transactions per second with <strong>sub-second micro-blocks</strong>.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/30 border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--ink3)] block">FINALITY TIME</span>
                    <strong className="text-base text-[var(--gold)]">&lt; 1 Second</strong>
                    <span className="text-[11px] text-[var(--ink3)] block mt-1">Instant micro-blocks</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--ink3)] block">BASE NETWORK FEE</span>
                    <strong className="text-base text-[var(--verdigris)]">0.0001 NIM</strong>
                    <span className="text-[11px] text-[var(--ink3)] block mt-1">Micro-penny economics</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--ink3)] block">NATIVE CRYPTOGRAPHY</span>
                    <strong className="text-base text-[var(--sky)]">Ed25519 & BLS</strong>
                    <span className="text-[11px] text-[var(--ink3)] block mt-1">Single-use signed QR tokens</span>
                  </div>
                </div>
              </div>

              {/* 2.2 Mini-App */}
              <div id="miniapp" className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 2.2 Embedded Nimiq Pay Mini-App Sandbox
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Acta detects when executed inside the official <strong>Nimiq Pay</strong> mobile application via the injected global bridge (<code className="font-mono text-[var(--gold)]">window.nimiq</code>).
                </p>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] text-xs text-[var(--ink2)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--gold)] font-mono text-xs font-semibold">
                    <Lock size={13} /> Zero-Redirect Native Keyguard
                  </div>
                  <p className="leading-relaxed">
                    Inside Nimiq Pay, transactions are signed natively inside the secure hardware enclave of the phone without redirecting to an external browser tab. If loaded in Chrome, Safari, or desktop browsers, Acta smoothly falls back to the standard Nimiq Hub pop-up and local key storage.
                  </p>
                </div>
              </div>

              {/* 2.3 Vault */}
              <div id="vault" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 2.3 Autonomous Vault & Hot Reserve
                  </h3>
                  <SourceLink path="lib/vault.ts" label="lib/vault.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  All covenant collateral and bounty funds are held by the autonomous protocol address:
                </p>
                <div className="p-3.5 rounded-xl bg-black/50 border border-[var(--gold)]/30 font-mono text-xs text-[var(--gold)] flex items-center justify-between overflow-x-auto">
                  <span>NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT</span>
                  <span className="caps text-[9px] px-2 py-0.5 rounded bg-[var(--gold)]/20 font-bold shrink-0 ml-2">HOT VAULT</span>
                </div>
                <p className="text-[13px] text-[var(--ink2)] leading-relaxed">
                  The vault operates non-custodially: funds can only be disbursed when cryptographic proof (signed QR, geofence coordinate, AI verdict, or sponsor signature) is verified by the backend engine.
                </p>
              </div>

              {/* 2.4 Zero-Cron */}
              <div id="zero-cron" className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 2.4 Zero-Cron Settlement Architecture
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] text-xs text-[var(--ink2)] space-y-2">
                  <p className="leading-relaxed">
                    Most Web3 apps rely on background crons (e.g. cron-job.org or daily server crons) to detect timeouts. <strong>Acta is 100% zero-cron.</strong>
                  </p>
                  <p className="leading-relaxed">
                    State transitions occur lazily: when a user loads Radar (<code className="font-mono text-[var(--gold)]">GET /api/listings</code>), any expired task (<code className="font-mono text-[var(--gold)]">expires_at &lt; NOW()</code>) is dynamically marked inactive in the query, instantly vanishing from the active radar container with zero background scheduler dependency.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 3: COVENANT ARCHETYPES
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)] min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-2">
                  <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 3</span>
                  <h2 id="cov-borrow" className="font-display text-3xl font-bold text-[var(--ink)]">
                    § 3. The 6 Smart Covenant Archetypes
                  </h2>
                </div>
                <SourceLink path="components/ListingDetailSheet.tsx" label="components/ListingDetailSheet.tsx" compact />
              </div>

              {/* 3.1 Equipment Loan */}
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 3.1 Equipment Loan / Borrowing Covenants
                  </h3>
                  <SourceLink path="app/api/listings/route.ts" label="app/api/listings/route.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Borrow high-value physical hardware (camera gear, power tools, drones, measurement instruments) with zero centralized paperwork. Collateral is locked securely into the autonomous vault and returned instantly upon scanning the owner&apos;s cryptographic return QR code.
                </p>

                {/* 3.1.1 Available vs Rent */}
                <div id="borrow-modes" className="p-4 rounded-2xl bg-black/30 border border-[var(--gold)]/30 space-y-3">
                  <span className="caps text-[9px] font-bold text-[var(--gold)] block">
                    § 3.1.1 Fundamental Distinction: &quot;Available&quot; vs. &quot;Rent&quot; Modes
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-[var(--line)]/50 space-y-1">
                      <strong className="text-[var(--gold)] block">Mode A: &quot;List as Available&quot; (Lender)</strong>
                      <p className="text-[var(--ink2)] leading-relaxed">
                        The sponsor owns the item and offers it to the community. <strong>No transaction is broadcast upon listing</strong>; no funds are deducted from the sponsor. Only when a borrower accepts is collateral locked into the vault.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-[var(--line)]/50 space-y-1">
                      <strong className="text-[var(--sky)] block">Mode B: &quot;Rent an Item&quot; (Borrower)</strong>
                      <p className="text-[var(--ink2)] leading-relaxed">
                        The sponsor is seeking to borrow equipment and puts up rental reward/collateral. <strong>An on-chain transaction is broadcast upon listing</strong> to lock the reward into the vault escrow upfront.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3.2 Vision */}
              <div id="cov-vision" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 3.2 Vision Oracle Verification (Qwen 3.6 on Hetzner)
                  </h3>
                  <SourceLink path="lib/vision.ts" label="lib/vision.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Photo bounties are judged by an autonomous multi-modal AI vision model: <strong>Qwen 3.6 35B FP8 running on dedicated Hetzner cloud inference</strong> (<code className="font-mono text-xs text-[var(--gold)]">https://inference.hetzner.com/api/v1</code>).
                </p>
                <div className="p-4 rounded-2xl bg-black/20 border border-[var(--line)] text-xs text-[var(--ink2)] space-y-2">
                  <strong className="text-[var(--ink)] block">Sceptical Truth Policy</strong>
                  <p className="leading-relaxed">
                    The vision oracle prompt instructs the model: <em>&quot;You are a sceptical verification oracle for an escrow payment system. If you are in doubt, pass must be false.&quot;</em> It checks scene lighting, required components, absence of screen mockups, and adherence to sponsor criteria.
                  </p>
                </div>
              </div>

              {/* 3.3 ScanQuest */}
              <div id="cov-scanquest" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 3.3 ScanQuest Cryptographic Handshake (Ed25519 QR)
                  </h3>
                  <SourceLink path="lib/qr.ts" label="lib/qr.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Physical proximity transfers and return receipts rely on ephemeral Ed25519-signed payloads.
                </p>
                <ul className="space-y-1.5 text-xs text-[var(--ink2)] list-disc list-inside">
                  <li>Single-use cryptographic nonce burned in database upon redemption to guarantee zero replay attacks.</li>
                  <li>10-minute expiry window (<code className="font-mono text-[var(--gold)]">exp = Date.now() + 600000</code>).</li>
                  <li>Full WebRTC camera scanner with automatic fallback to native file upload.</li>
                </ul>
              </div>

              {/* 3.4 Geofence */}
              <div id="cov-geo" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 3.4 Geolocation Geofence Attestation (GPS)
                  </h3>
                  <SourceLink path="app/api/bounty/geo/route.ts" label="app/api/bounty/geo/route.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  For regional bounties (street cleanups, physical checkpoints, event attendance), Acta verifies physical presence using the <strong>Haversine Great-Circle formula</strong>:
                </p>
                <div className="p-3.5 rounded-xl bg-black/40 border border-[var(--line)] font-mono text-xs text-[var(--gold2)] overflow-x-auto whitespace-pre">
                  distance &le; 50m AND gpsAccuracy &le; 50m
                </div>
              </div>

              {/* 3.5 In-Person */}
              <div id="cov-manual" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 3.5 In-Person / Creator Attestation
                  </h3>
                  <SourceLink path="app/api/bounty/manual_approve/route.ts" label="app/api/bounty/manual_approve/route.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Custom commissions where an algorithmic or AI oracle cannot evaluate subjective nuance. The challenger submits proof in Inbox, and the sponsor clicks <strong>&quot;Approve &amp; Release Vault Funds&quot;</strong>, broadcasting the release transaction sub-second.
                </p>
              </div>

              {/* 3.6 Online Ventures */}
              <div id="cov-venture" className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 3.6 Online Ventures &amp; Digital Bounties (100% Global)
                </h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-[var(--line)] text-xs text-[var(--ink2)] space-y-2">
                  <p className="leading-relaxed">
                    Acta is global-first. A sponsor in Tokyo can deploy a 500 NIM bounty for resolving a GitHub issue, auditing a smart contract, designing a 3D icon, or writing technical documentation.
                  </p>
                  <p className="leading-relaxed">
                    A developer in Buenos Aires or Berlin can accept the covenant, submit deliverables (PR URL, design link, or SHA256 checksum), and trigger autonomous payout upon sponsor signature or AI prescreen verdict.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 4: STATE MACHINE & LIFECYCLE
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)] min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-2">
                  <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 4</span>
                  <h2 id="toggles" className="font-display text-3xl font-bold text-[var(--ink)]">
                    § 4. Contract Lifecycle &amp; State Machine
                  </h2>
                </div>
                <SourceLink path="components/ContractToggles.tsx" label="components/ContractToggles.tsx" compact />
              </div>

              {/* 4.1 The 4 Toggles */}
              <div className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                  § 4.1 The 4 Contract Toggles
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  In the active dashboard, covenants are partitioned into 4 distinct views:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--gold)]/30">
                    <strong className="text-[var(--gold)] block text-sm mb-1">1. In Progress</strong>
                    Active covenants where funds are locked in the vault and custody or task deadlines are ticking down.
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--verdigris)]/30">
                    <strong className="text-[var(--verdigris)] block text-sm mb-1">2. Awaiting Me</strong>
                    Covenants that require immediate action from the current user (generate QR, submit proof, or approve deliverable).
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--sky)]/30">
                    <strong className="text-[var(--sky)] block text-sm mb-1">3. Settled</strong>
                    Immutable register of completed covenants. Displays on-chain transaction hash (<code className="font-mono text-[10px]">txHashOut</code>), verified oracle stamp, and Nimiq explorer links.
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-[var(--wax)]/30">
                    <strong className="text-[var(--wax)] block text-sm mb-1">4. Refunded</strong>
                    Cancelled listings, expired covenants, or mutually refunded transactions where 100% of vaulted funds returned to source without penalty.
                  </div>
                </div>
              </div>

              {/* 4.2 Badges */}
              <div id="badges" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 4.2 Dynamic Attention Badges &amp; Auto-Dismissal
                  </h3>
                  <SourceLink path="app/app/page.tsx" label="app/app/page.tsx" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  To eliminate notification noise, every toggle displays a dynamic numerical badge (<code className="font-mono text-[var(--gold)]">1</code>, <code className="font-mono text-[var(--gold)]">2</code>) indicating how many items require user attention. <strong>The badge automatically dismisses as soon as the user opens that tab</strong>, tracking view state locally in memory.
                </p>
              </div>

              {/* 4.3 State Machine Interactive Callout */}
              <div id="state-machine" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 4.3 Covenant State Machine Transitions
                  </h3>
                  <a
                    href="#tool-flow"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 transition-colors"
                  >
                    <span>Inspect Interactive Diagram in § 7.2 ↓</span>
                  </a>
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Every covenant transitions deterministically through 6 formal stages: <code className="font-mono text-[var(--verdigris)]">open</code> &rarr; <code className="font-mono text-[var(--gold)]">locked</code> &rarr; <code className="font-mono text-[var(--sky)]">settling</code> &rarr; <code className="font-mono text-[var(--verdigris)]">released</code> (or <code className="font-mono text-[var(--wax)]">disputed</code> / <code className="font-mono text-[var(--ink3)]">refunded</code>).
                </p>
              </div>

              {/* 4.4 Disputes & Grace */}
              <div id="disputes" className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 4.4 Unreturned Item Claims &amp; 48-Hour Grace Period
                </h3>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--wax)]/40 text-xs text-[var(--ink2)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--wax)] font-semibold">
                    <AlertCircle size={15} /> Default Protection Guarantee
                  </div>
                  <p className="leading-relaxed">
                    If an equipment loan deadline elapses without return, the covenant enters a dispute window. The borrower is granted a <strong>48-hour grace window</strong> (<code className="font-mono text-[var(--gold)]">LENDER_CLAIM_GRACE_MS</code>) to return the item.
                  </p>
                  <p className="leading-relaxed">
                    If the borrower still fails to return the item after the 48-hour grace period, the lender&apos;s <strong>&quot;Claim Collateral&quot;</strong> button unlocks. Invoking <code className="font-mono text-[var(--ink)]">POST /api/claim</code> seizes 100% of the vaulted collateral and transfers it directly to the lender&apos;s wallet.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 5: REPUTATION & PRIVILEGES
            ========================================================================= */}
            <section className="space-y-8 pt-10 border-t border-[var(--line)] min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-2">
                  <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 5</span>
                  <h2 id="trust-score" className="font-display text-3xl font-bold text-[var(--ink)]">
                    § 5. Reputation &amp; Sovereign Privileges
                  </h2>
                </div>
                <SourceLink path="lib/escrow-math.ts" label="lib/escrow-math.ts" compact />
              </div>

              {/* 5.1 Trust Score */}
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 5.1 The Algorithmic Trust Score Formula (0–100)
                  </h3>
                  <SourceLink path="lib/auth.ts" label="lib/auth.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Acta does not rely on subjective star ratings or easily gamed reviews. Trust is derived algorithmically from mathematical facts etched in the acts ledger:
                </p>

                <div className="p-4 rounded-2xl bg-black/40 border border-[var(--line)] font-mono text-xs text-[var(--gold2)] space-y-1.5 overflow-x-auto whitespace-pre max-w-full">
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
              <div id="discount-formula" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 5.2 Reputation as Buying Power (Collateral Discount)
                  </h3>
                  <a
                    href="#tool-calc"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 transition-colors"
                  >
                    <span>Simulate Discount Calculator in § 7.1 ↓</span>
                  </a>
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Trust score directly lowers required collateral locks for equipment borrowing:
                </p>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--gold)]/30 font-mono text-xs text-[var(--gold)] overflow-x-auto whitespace-pre">
                  discountRate = min(0.30, trustScore * 0.003) // Up to 30% discount at Trust 100
                </div>
              </div>

              {/* 5.3 Rites */}
              <div id="rites" className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 5.3 The 5 Sovereign Privileges / Rites
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <strong className="text-[var(--gold)] block mb-0.5">Rite I: Daily Vigil &amp; Continuous Streaks</strong>
                    Daily attendance attestation. Maintains continuous presence on the calendar and unlocks periodic treasury honorariums.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--verdigris)]">
                    <strong className="text-[var(--verdigris)] block mb-0.5">Rite II: Sovereign Proof Stamps</strong>
                    Cryptographic badges permanently minted onto the user&apos;s Acta Passport for every verified action.
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--sky)]">
                    <strong className="text-[var(--sky)] block mb-0.5">Rite III: Herald&apos;s Call &amp; Peer Covenants</strong>
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
              <div id="referrals" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--verdigris)]">
                    § 5.4 Instant Dual-Reward Referral System (10 NIM Each)
                  </h3>
                  <SourceLink path="lib/referral.ts" label="lib/referral.ts" compact />
                </div>
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
              <div id="milestones" className="space-y-4 min-w-0">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  § 5.5 Career Milestones &amp; Recurring Drips
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
            <section className="space-y-8 pt-10 border-t border-[var(--line)] min-w-0">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 6</span>
                <h2 id="api-auth" className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 6. Developer Reference &amp; REST API
                </h2>
              </div>

              {/* 6.1 Auth */}
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 6.1 Cryptographic Authentication &amp; Bearer Tokens
                  </h3>
                  <SourceLink path="app/api/auth/verify/route.ts" label="app/api/auth/verify/route.ts" compact />
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--ink2)]">
                  Clients authenticate by signing a single-use nonce challenge with their Nimiq Ed25519 keypair.
                </p>

                <CodeTabs
                  title="Authentication Flow (TypeScript & cURL)"
                  sourceFile="lib/auth.ts"
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
              <div id="api-listings" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 6.2 Listings API Endpoints
                  </h3>
                  <SourceLink path="app/api/listings/route.ts" label="app/api/listings/route.ts" compact />
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] min-w-0">
                    <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-bold">POST</span>
                      <span className="text-[var(--ink)] font-bold">/api/listings</span>
                    </div>
                    <p className="text-xs text-[var(--ink2)] mb-3">
                      Deploys a new covenant listing to Radar.
                    </p>
                    <CodeTabs
                      title="POST /api/listings Payload"
                      sourceFile="app/api/listings/route.ts"
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
              <div id="api-escrows" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 6.3 Escrows &amp; Custody API
                  </h3>
                  <SourceLink path="app/api/escrows/route.ts" label="app/api/escrows/route.ts" compact />
                </div>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] min-w-0">
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-bold">POST</span>
                    <span className="text-[var(--ink)] font-bold">/api/escrows</span>
                  </div>
                  <p className="text-xs text-[var(--ink2)] mb-3">
                    Locks funds into the autonomous vault when accepting an open covenant.
                  </p>
                  <CodeTabs
                    title="POST /api/escrows Payload"
                    sourceFile="app/api/escrows/route.ts"
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
              <div id="api-verification" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 6.4 Oracle Verification Endpoints
                  </h3>
                  <SourceLink path="lib/vision.ts" label="lib/vision.ts" compact />
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-mono font-bold text-[var(--gold)]">POST /api/bounty/verify</div>
                      <SourceLink path="app/api/bounty/verify/route.ts" label="route.ts" compact />
                    </div>
                    <p className="text-[var(--ink2)]">Streams base64 image buffer to Qwen 3.6 on Hetzner inference. On pass, triggers sub-second vault payout.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-mono font-bold text-[var(--verdigris)]">POST /api/bounty/scanquest</div>
                      <SourceLink path="app/api/bounty/scanquest/route.ts" label="route.ts" compact />
                    </div>
                    <p className="text-[var(--ink2)]">Verifies Ed25519 signature over single-use 10-minute token and consumes nonce to prevent replay.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-mono font-bold text-[var(--sky)]">POST /api/bounty/geo</div>
                      <SourceLink path="app/api/bounty/geo/route.ts" label="route.ts" compact />
                    </div>
                    <p className="text-[var(--ink2)]">Verifies Haversine distance (&le;50m) and GPS accuracy radius for location check-ins.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-[var(--line)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-mono font-bold text-[var(--ink)]">POST /api/bounty/manual_approve</div>
                      <SourceLink path="app/api/bounty/manual_approve/route.ts" label="route.ts" compact />
                    </div>
                    <p className="text-[var(--ink2)]">Sponsor signs approval in Inbox to disburse vaulted reward for custom commissions.</p>
                  </div>
                </div>
              </div>

              {/* 6.5 Referral Claim */}
              <div id="api-referral-claim" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--verdigris)]">
                    § 6.5 Referral Claim API (<code className="font-mono text-sm">POST /api/referral/claim</code>)
                  </h3>
                  <SourceLink path="app/api/referral/claim/route.ts" label="app/api/referral/claim/route.ts" compact />
                </div>
                <div className="p-4 rounded-2xl bg-black/30 border border-[var(--verdigris)]/30 min-w-0">
                  <p className="text-xs text-[var(--ink2)] mb-3">
                    Claims a peer referral code and immediately disburses 10 NIM to the referrer and 10 NIM to the referee directly from the treasury.
                  </p>
                  <CodeTabs
                    title="POST /api/referral/claim"
                    sourceFile="app/api/referral/claim/route.ts"
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
              <div id="api-types" className="space-y-4 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                    § 6.6 Core TypeScript Interfaces &amp; Schemas
                  </h3>
                  <SourceLink path="lib/contract.ts" label="lib/contract.ts" compact />
                </div>
                <CodeTabs
                  title="lib/escrow.ts & lib/contract.ts"
                  sourceFile="lib/escrow.ts"
                  snippets={[
                    {
                      label: "TypeScript",
                      language: "typescript",
                      code: `export type ListingKind = 
  | "borrow" 
  | "bounty" 
  | "bounty_venture" 
  | "bounty_qr" 
  | "bounty_manual" 
  | "bounty_geo";

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
                SECTION 7: INTERACTIVE SANDBOXES & TOOLING
            ========================================================================= */}
            <section className="space-y-12 pt-10 border-t border-[var(--line)] min-w-0">
              <div className="space-y-2">
                <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">Section 7</span>
                <h2 className="font-display text-3xl font-bold text-[var(--ink)]">
                  § 7. Interactive Sandboxes &amp; Tooling
                </h2>
                <p className="marginalia text-sm text-[var(--ink2)] max-w-2xl">
                  Inspect the live algorithmic and state models of Acta. Use these interactive testbeds to simulate collateral savings, audit state transitions, and test vision verdicts.
                </p>
              </div>

              {/* 7.1 Calculator */}
              <div id="tool-calc" className="space-y-4 min-w-0 pt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 7.1 Reputation &amp; Collateral Discount Calculator
                  </h3>
                  <SourceLink path="lib/escrow-math.ts" label="lib/escrow-math.ts" compact />
                </div>
                <TrustCalculator />
              </div>

              {/* 7.2 State Machine Flow */}
              <div id="tool-flow" className="space-y-4 min-w-0 pt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 7.2 Covenant State Machine Flow Navigator
                  </h3>
                  <SourceLink path="lib/escrow.ts" label="lib/escrow.ts" compact />
                </div>
                <StateMachineFlow />
              </div>

              {/* 7.3 Oracle Simulator */}
              <div id="tool-oracle" className="space-y-4 min-w-0 pt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)]">
                    § 7.3 Autonomous Oracle Test Playground
                  </h3>
                  <SourceLink path="lib/vision.ts" label="lib/vision.ts" compact />
                </div>
                <OracleSimulator />
              </div>

              {/* Bottom CTA */}
              <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
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
