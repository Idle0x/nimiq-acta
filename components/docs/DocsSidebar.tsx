"use client";

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
  X,
} from "lucide-react";
import { Seal } from "@/components/Paper";

export interface NavSection {
  title: string;
  kicker: string;
  icon: any;
  items: { label: string; anchor: string; badge?: string }[];
}

export const DOC_SECTIONS: NavSection[] = [
  {
    title: "Protocol Foundations",
    kicker: "§ 1",
    icon: BookOpen,
    items: [
      { label: "Doctrine of Proof-of-Action", anchor: "doctrine" },
      { label: "Traditional Escrow Failure Modes", anchor: "traditional-failure" },
      { label: "Local Proximity vs Global Deeds", anchor: "local-vs-global" },
      { label: "Guarantees, Tradeoffs & Limits", anchor: "tradeoffs" },
      { label: "Network Economy & Fees", anchor: "fees" },
    ],
  },
  {
    title: "Blockchain Architecture",
    kicker: "§ 2",
    icon: Cpu,
    items: [
      { label: "Nimiq PoS Albatross Engine", anchor: "albatross" },
      { label: "Sub-Second Micro-Blocks", anchor: "settlement-speed" },
      { label: "Nimiq Pay Mini-App Sandbox", anchor: "miniapp" },
      { label: "Autonomous Vault (NQ86...)", anchor: "vault" },
      { label: "Zero-Cron Architecture", anchor: "zero-cron" },
    ],
  },
  {
    title: "The 6 Covenant Archetypes",
    kicker: "§ 3",
    icon: Layers,
    items: [
      { label: "Equipment Custody (Borrow)", anchor: "cov-borrow" },
      { label: "Available vs Rent Dual Modes", anchor: "borrow-modes" },
      { label: "Vision Oracle (Qwen 3.6)", anchor: "cov-vision" },
      { label: "ScanQuest Token (Ed25519 QR)", anchor: "cov-scanquest" },
      { label: "GPS Geofence Attestation", anchor: "cov-geo" },
      { label: "In-Person Verification", anchor: "cov-manual" },
      { label: "Online Ventures (100% Global)", anchor: "cov-venture" },
    ],
  },
  {
    title: "Lifecycle & State Machine",
    kicker: "§ 4",
    icon: RotateCcw,
    items: [
      { label: "The 4 Contract Toggles", anchor: "toggles" },
      { label: "Dynamic Attention Badges", anchor: "badges" },
      { label: "Covenant State Transitions", anchor: "state-machine" },
      { label: "Unreturned Custody & Grace", anchor: "disputes" },
      { label: "Counterparty Role Matrix", anchor: "roles" },
    ],
  },
  {
    title: "Reputation & Privileges",
    kicker: "§ 5",
    icon: Shield,
    items: [
      { label: "Trust Score Formula (0–100)", anchor: "trust-score" },
      { label: "Collateral Discount Scaling", anchor: "discount-formula" },
      { label: "The 5 Sovereign Rites", anchor: "rites" },
      { label: "Instant Dual Referral (10 NIM)", anchor: "referrals" },
      { label: "Career Milestones & Drips", anchor: "milestones" },
    ],
  },
  {
    title: "Developer REST API",
    kicker: "§ 6",
    icon: Code2,
    items: [
      { label: "Cryptographic Authentication", anchor: "api-auth" },
      { label: "Listings API (GET/POST)", anchor: "api-listings", badge: "REST" },
      { label: "Escrows API (GET/POST)", anchor: "api-escrows", badge: "REST" },
      { label: "Oracle Verification Endpoints", anchor: "api-verification", badge: "REST" },
      { label: "Referral Claim Endpoint", anchor: "api-referral-claim", badge: "POST" },
      { label: "TypeScript Types & Schemas", anchor: "api-types" },
    ],
  },
  {
    title: "Interactive Sandboxes",
    kicker: "§ 7",
    icon: Sliders,
    items: [
      { label: "Reputation & Discount Calculator", anchor: "tool-calc" },
      { label: "State Machine Simulator", anchor: "tool-flow" },
      { label: "Oracle Inspection Playground", anchor: "tool-oracle" },
    ],
  },
];

export default function DocsSidebar({
  activeAnchor,
  onOpenSearch,
  mobileOpen,
  onCloseMobile,
}: {
  activeAnchor: string;
  onOpenSearch: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const content = (
    <div className="flex flex-col h-full w-full">
      {/* Search trigger */}
      <div className="p-3 border-b border-[var(--line)]/50 shrink-0">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 border border-[var(--line)] text-xs text-[var(--ink3)] hover:border-[var(--gold)]/50 hover:text-[var(--ink2)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search size={14} className="text-[var(--gold)]" />
            <span>Search docs…</span>
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-[var(--line)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {DOC_SECTIONS.map((sec) => {
          return (
            <div key={sec.kicker} className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[var(--gold)]">
                <span className="caps text-[9px] font-bold tracking-wider font-mono">
                  {sec.kicker}
                </span>
                <span className="text-xs font-bold font-display tracking-wide text-[var(--ink)]">
                  {sec.title}
                </span>
              </div>
              <ul className="space-y-0.5">
                {sec.items.map((it) => {
                  const isActive = activeAnchor === it.anchor;
                  return (
                    <li key={it.anchor}>
                      <a
                        href={`#${it.anchor}`}
                        onClick={() => onCloseMobile?.()}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] transition-all ${
                          isActive
                            ? "bg-[color-mix(in_srgb,var(--surface)_75%,var(--gold)_25%)] text-[var(--gold)] font-semibold border-l-2 border-[var(--gold)] pl-3"
                            : "text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{it.label}</span>
                        {it.badge && (
                          <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-[var(--line)] text-[var(--ink3)]">
                            {it.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[var(--line)] bg-[#0d0b08] space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-[var(--ink3)]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)] animate-pulse" />
            Nimiq PoS Albatross
          </span>
          <span className="font-mono text-[9px]">v0.1.0</span>
        </div>
        <div className="flex gap-2">
          <a
            href="/app"
            className="press flex-1 flex items-center justify-center gap-1 py-2 text-[11.5px] font-bold rounded-lg"
          >
            Launch App <ArrowUpRight size={11} />
          </a>
          <a
            href="https://github.com/Idle0x/nimiq-acta"
            target="_blank"
            rel="noreferrer"
            className="ghost p-2 rounded-lg text-[var(--ink2)] hover:text-[var(--ink)]"
            title="GitHub Repository"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-[var(--line)] bg-[#100e0b] overflow-hidden">
        {content}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-[160] w-72 bg-[#100e0b] border-r border-[var(--line)] flex flex-col">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Seal size={30} className="!text-xs">A</Seal>
                <span className="font-display text-base font-bold text-[var(--ink)]">
                  ACTA DOCS
                </span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[var(--ink3)] hover:text-[var(--ink)] hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
