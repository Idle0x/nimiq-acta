"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Hash, ArrowRight, FileText, Code2, ShieldCheck, Layers, Cpu } from "lucide-react";

export interface SearchItem {
  title: string;
  section: string;
  anchor: string;
  tag: string;
  category: "doctrine" | "architecture" | "covenants" | "lifecycle" | "reputation" | "api" | "interactive";
}

const SEARCH_ITEMS: SearchItem[] = [
  // § 1
  { title: "The Doctrine of Proof-of-Action", section: "§ 1.1", anchor: "doctrine", tag: "Philosophy", category: "doctrine" },
  { title: "Traditional Escrow & Gig Platform Failure Modes", section: "§ 1.2", anchor: "traditional-failure", tag: "Doctrine", category: "doctrine" },
  { title: "Local Proximity vs. Global Remote Deeds", section: "§ 1.3", anchor: "local-vs-global", tag: "Scope", category: "doctrine" },
  { title: "Protocol Guarantees, Tradeoffs & Compromises", section: "§ 1.4", anchor: "tradeoffs", tag: "Architecture", category: "doctrine" },
  { title: "Network Economy & Fee Schedule (0.0011 NIM)", section: "§ 1.5", anchor: "fees", tag: "Economics", category: "doctrine" },

  // § 2
  { title: "Nimiq PoS Albatross Consensus Engine", section: "§ 2.1", anchor: "albatross", tag: "Blockchain", category: "architecture" },
  { title: "Nimiq Pay Mini-App Sandbox (window.nimiq)", section: "§ 2.2", anchor: "miniapp", tag: "Integration", category: "architecture" },
  { title: "The Autonomous Vault (NQ86...8RKT) & Queue", section: "§ 2.3", anchor: "vault", tag: "Security", category: "architecture" },
  { title: "Zero-Cron Architecture & Lazy Evaluation", section: "§ 2.4", anchor: "zero-cron", tag: "Backend", category: "architecture" },

  // § 3
  { title: "Equipment Custody & Rental (borrow)", section: "§ 3.1", anchor: "cov-borrow", tag: "Covenant", category: "covenants" },
  { title: "Available vs Rent Dual Modes", section: "§ 3.1.1", anchor: "borrow-modes", tag: "Covenant", category: "covenants" },
  { title: "Vision Oracle Photo Quest (bounty / Qwen 3.6)", section: "§ 3.2", anchor: "cov-vision", tag: "Oracle", category: "covenants" },
  { title: "ScanQuest Proximity Handshake (Ed25519 QR)", section: "§ 3.3", anchor: "cov-scanquest", tag: "Oracle", category: "covenants" },
  { title: "Geolocation Geofence Attestation (GPS)", section: "§ 3.4", anchor: "cov-geo", tag: "Oracle", category: "covenants" },
  { title: "In-Person Attestation & AI Pre-screening", section: "§ 3.5", anchor: "cov-manual", tag: "Oracle", category: "covenants" },
  { title: "Online Ventures & Worldwide Bounties", section: "§ 3.6", anchor: "cov-venture", tag: "Global", category: "covenants" },

  // § 4
  { title: "The 4 Contract Toggles & Attention Badges", section: "§ 4.1", anchor: "toggles", tag: "UI & UX", category: "lifecycle" },
  { title: "Dynamic Badge Dismissal & Counterparty Logic", section: "§ 4.2", anchor: "badges", tag: "UI & UX", category: "lifecycle" },
  { title: "Covenant State Transitions & Deadlines", section: "§ 4.3", anchor: "state-machine", tag: "State", category: "lifecycle" },
  { title: "Unreturned Custody & 48h Grace Period", section: "§ 4.4", anchor: "disputes", tag: "Resolution", category: "lifecycle" },

  // § 5
  { title: "Algorithmic Trust Score Formula (0–100)", section: "§ 5.1", anchor: "trust-score", tag: "Reputation", category: "reputation" },
  { title: "Collateral Discount Buying Power (up to 30%)", section: "§ 5.2", anchor: "discount-formula", tag: "Reputation", category: "reputation" },
  { title: "The 5 Sovereign Privileges / Rites", section: "§ 5.3", anchor: "rites", tag: "Treasury", category: "reputation" },
  { title: "Instant Dual Referral Reward (10 NIM)", section: "§ 5.4", anchor: "referrals", tag: "Treasury", category: "reputation" },
  { title: "Autonomous Milestone Drips & Recurring Grants", section: "§ 5.5", anchor: "milestones", tag: "Treasury", category: "reputation" },

  // § 6
  { title: "Cryptographic Auth & Bearer Tokens", section: "§ 6.1", anchor: "api-auth", tag: "API", category: "api" },
  { title: "Listings Endpoints (GET, POST /api/listings)", section: "§ 6.2", anchor: "api-listings", tag: "API", category: "api" },
  { title: "Escrows & Custody Endpoints (/api/escrows)", section: "§ 6.3", anchor: "api-escrows", tag: "API", category: "api" },
  { title: "Oracle Verification Endpoints (/api/bounty/*)", section: "§ 6.4", anchor: "api-verification", tag: "API", category: "api" },
  { title: "Referral Claim Endpoint (/api/referral/claim)", section: "§ 6.5", anchor: "api-referral-claim", tag: "API", category: "api" },
  { title: "TypeScript Types & Contract JSON Schemas", section: "§ 6.6", anchor: "api-types", tag: "API", category: "api" },

  // § 7
  { title: "Interactive Trust & Discount Calculator", section: "§ 7.1", anchor: "tool-calc", tag: "Interactive", category: "interactive" },
  { title: "Interactive Covenant Lifecycle Diagram", section: "§ 7.2", anchor: "tool-flow", tag: "Interactive", category: "interactive" },
  { title: "Interactive Oracle Test Playground", section: "§ 7.3", anchor: "tool-oracle", tag: "Interactive", category: "interactive" },
];

export default function DocsSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIdx(0);
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else open = true;
      }
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.tag.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS.slice(0, 10);

  function handleSelect(anchor: string) {
    onClose();
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = anchor;
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="plate w-full max-w-2xl rounded-3xl border border-[var(--gold)]/40 bg-[#12100c] shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--line)] bg-[#171410]">
          <Search size={18} className="text-[var(--gold)] mr-3 flex-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIdx((prev) => Math.min(filtered.length - 1, prev + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIdx((prev) => Math.max(0, prev - 1));
              } else if (e.key === "Enter" && filtered[selectedIdx]) {
                e.preventDefault();
                handleSelect(filtered[selectedIdx].anchor);
              }
            }}
            placeholder="Search documentation, oracles, APIs, formulas..."
            className="w-full bg-transparent text-[var(--ink)] placeholder:text-[var(--ink3)] outline-none text-sm font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[var(--ink3)] hover:text-[var(--ink)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[var(--line)]/30">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--ink3)]">
              No matching documentation sections found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.anchor}
                onClick={() => handleSelect(item.anchor)}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                  selectedIdx === idx
                    ? "bg-[color-mix(in_srgb,var(--surface)_80%,var(--gold)_20%)] text-[var(--ink)] border border-[var(--gold)]/30"
                    : "text-[var(--ink2)] hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--gold)] font-bold">
                    {item.section}
                  </span>
                  <div>
                    <h5 className="text-sm font-semibold text-[var(--ink)]">
                      {item.title}
                    </h5>
                    <span className="text-[10.5px] font-mono text-[var(--ink3)]">
                      #{item.anchor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="caps text-[9px] px-2 py-0.5 rounded-full border border-[var(--line)] bg-black/40 text-[var(--ink3)]">
                    {item.tag}
                  </span>
                  <ArrowRight size={13} className="text-[var(--gold)] opacity-70" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0e0c0a] border-t border-[var(--line)]/50 flex items-center justify-between text-[11px] text-[var(--ink3)] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[var(--gold)]">Acta MMXXVI</span>
        </div>
      </div>
    </div>
  );
}
