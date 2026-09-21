"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Lock, RefreshCw, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import SourceLink from "./SourceLink";

interface StateStep {
  id: string;
  title: string;
  badge: string;
  color: string;
  vaultStatus: string;
  sponsorView: string;
  challengerView: string;
  dbChange: string;
  transitionTo: string;
}

const STATES: StateStep[] = [
  {
    id: "open",
    title: "1. Covenant Open",
    badge: "Open on Radar",
    color: "var(--verdigris)",
    vaultStatus: "0 NIM (Available mode) OR Collateral / Bounty locked in Vault (Rent / Bounty modes)",
    sponsorView: "Listed on Radar with real-time expiration countdown. Cancel button active (instant full refund).",
    challengerView: "Visible on Radar. Displays requirements, criteria, duration, and collateral requirements.",
    dbChange: "listings table: state = 'open', is_active = TRUE",
    transitionTo: "Counterparty accepts → transitions to 'locked'",
  },
  {
    id: "locked",
    title: "2. Accepted & Locked",
    badge: "In Progress",
    color: "var(--gold)",
    vaultStatus: "Full collateral + bounty locked in autonomous Vault (NQ86 845N...)",
    sponsorView: "Shows in 'In Progress' toggle. Lender keys primed. For Borrow: Return QR ready for generation.",
    challengerView: "Shows in 'In Progress' toggle. Active custody countdown or bounty challenge window begins.",
    dbChange: "escrows table: state = 'locked', progress = 'awaiting_proof', deadline_at = now + duration",
    transitionTo: "Proof submitted (QR / Vision / GPS / Deliverable) → transitions to 'settling'",
  },
  {
    id: "settling",
    title: "3. Oracle Evaluation",
    badge: "Settling",
    color: "var(--sky)",
    vaultStatus: "Vault queue serializes payout transaction (BIP44 derived hot wallet)",
    sponsorView: "Attention badge on 'Awaiting Me' if manual verification is required; otherwise automated.",
    challengerView: "Displays live oracle evaluation status (Qwen vision inspection / Ed25519 signature verification).",
    dbChange: "escrows table: state = 'settling'",
    transitionTo: "Oracle Pass → 'released' | Oracle Reject → retry 'awaiting_proof'",
  },
  {
    id: "released",
    title: "4. Autonomous Settlement",
    badge: "Settled Ledger",
    color: "var(--verdigris)",
    vaultStatus: "Disbursed sub-second via Nimiq PoS Albatross (minus 0.0011 NIM fee)",
    sponsorView: "Moves to 'Settled' toggle. Verified deed permanently written. Community trust points awarded.",
    challengerView: "Moves to 'Settled' toggle. Funds in wallet. Permanent Proof Stamp etched on Passport.",
    dbChange: "escrows table: state = 'released'; acts table: insert Act; users: update trustScore",
    transitionTo: "Terminal State — Final & Immutable",
  },
  {
    id: "disputed",
    title: "Alternative: Default / Claim",
    badge: "Dispute Window",
    color: "var(--wax)",
    vaultStatus: "Locked until deadline + 48h grace period elapses",
    sponsorView: "If unreturned after 48h grace, 'Claim Collateral' button activates to seize vaulted collateral.",
    challengerView: "Warning notification. Trust score degradation occurs if custody is abandoned.",
    dbChange: "escrows table: state = 'disputed'",
    transitionTo: "Claim invoked → funds paid to Lender OR mutual return agreed",
  },
  {
    id: "refunded",
    title: "Alternative: Expiration / Cancel",
    badge: "Refunded",
    color: "var(--ink3)",
    vaultStatus: "100% of vaulted funds unlocked and refunded to originator",
    sponsorView: "Moves to 'Refunded' toggle. Unfilled listing refunded with zero protocol fees.",
    challengerView: "No funds deducted. Record marked refunded.",
    dbChange: "listings/escrows table: state = 'refunded' | 'cancelled' | 'expired'",
    transitionTo: "Terminal State — Zero Protocol Penalty",
  },
];

export default function StateMachineFlow() {
  const [activeState, setActiveState] = useState<string>("locked");

  const cur = STATES.find((s) => s.id === activeState) || STATES[1];

  return (
    <div className="w-full max-w-full min-w-0 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7 my-6 shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold block mb-1">
            State Machine Architecture
          </span>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Covenant Lifecycle & Transitions
          </h3>
          <p className="marginalia text-xs mt-1 text-[var(--ink2)] max-w-xl">
            Select any lifecycle state below to inspect the deterministic cryptographic, database, and vault actions.
          </p>
        </div>
        <SourceLink path="lib/escrow.ts" label="lib/escrow.ts" compact />
      </div>

      {/* State Selection Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-6">
        {STATES.map((st) => {
          const isSelected = activeState === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveState(st.id)}
              className={`p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? "bg-[color-mix(in_srgb,var(--surface)_80%,var(--gold)_20%)] border-[var(--gold)] shadow-md"
                  : "bg-black/20 border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-white/5"
              }`}
            >
              <span className="text-[10px] font-mono block text-[var(--ink3)]">
                {st.badge}
              </span>
              <span className="text-xs font-bold font-display block text-[var(--ink)] mt-0.5">
                {st.title.split(". ")[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* State Detail Pane */}
      <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-black/40 border border-[var(--line)] space-y-5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)]/60 pb-4">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: cur.color }}
            />
            <h4 className="font-display text-lg font-bold text-[var(--ink)]">
              {cur.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink3)]">
            <span>Next:</span>
            <span className="text-[var(--gold)] font-medium">{cur.transitionTo}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-[var(--line)]/50 space-y-1">
            <strong className="text-[var(--gold)] block font-mono text-[11px] uppercase">
              Sponsor / Lender View
            </strong>
            <p className="text-[var(--ink2)] leading-relaxed">{cur.sponsorView}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-[var(--line)]/50 space-y-1">
            <strong className="text-[var(--verdigris)] block font-mono text-[11px] uppercase">
              Challenger / Borrower View
            </strong>
            <p className="text-[var(--ink2)] leading-relaxed">{cur.challengerView}</p>
          </div>
        </div>

        <div className="pt-2 grid sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/50 border border-[var(--line)]/40 overflow-hidden">
            <span className="text-[10px] text-[var(--ink3)] block mb-1">VAULT HOT RESERVE BEHAVIOR</span>
            <span className="text-[var(--gold2)] text-[11.5px] block break-words">{cur.vaultStatus}</span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-[var(--line)]/40 overflow-hidden">
            <span className="text-[10px] text-[var(--ink3)] block mb-1">POSTGRES DATABASE MUTATION</span>
            <span className="text-[var(--verdigris)] text-[11.5px] block break-words">{cur.dbChange}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
