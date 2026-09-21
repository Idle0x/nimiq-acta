"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Coins, Percent, Info } from "lucide-react";
import SourceLink from "./SourceLink";

export default function TrustCalculator() {
  const [collateral, setCollateral] = useState<number>(1000);
  const [trustScore, setTrustScore] = useState<number>(65);

  // Math from lib/escrow-math.ts
  const discountRate = Math.min(0.30, trustScore * 0.003); // 0 to 30%
  const discountPercent = Math.round(discountRate * 1000) / 10; // e.g. 19.5%
  const discountAmount = Math.round(collateral * discountRate * 100) / 100;
  const requiredLock = Math.max(0.01, Math.round((collateral - discountAmount) * 100) / 100);
  
  const settleFee = 0.0011;
  const netReturn = Math.max(0, Math.round((requiredLock - settleFee) * 10000) / 10000);

  const tier =
    trustScore >= 85
      ? { name: "Grandmaster", color: "text-[#BEB0D8]", bg: "bg-[#BEB0D8]/10", border: "border-[#BEB0D8]/30" }
      : trustScore >= 60
      ? { name: "Sovereign", color: "text-[var(--gold)]", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/30" }
      : trustScore >= 30
      ? { name: "Proven", color: "text-[var(--verdigris)]", bg: "bg-[var(--verdigris)]/10", border: "border-[var(--verdigris)]/30" }
      : { name: "Novice", color: "text-[var(--ink3)]", bg: "bg-white/5", border: "border-white/10" };

  return (
    <div className="w-full max-w-full min-w-0 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7 my-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">
              Interactive Simulator
            </span>
            <span className={`caps text-[9px] px-2 py-0.5 rounded-full font-bold border ${tier.color} ${tier.bg} ${tier.border}`}>
              {tier.name} Tier
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Reputation & Collateral Discount Calculator
          </h3>
          <p className="marginalia text-xs mt-1 text-[var(--ink2)] max-w-xl">
            Simulate how your historical on-chain integrity lowers required vault collateral across equipment covenants.
          </p>
        </div>
        <SourceLink path="lib/escrow-math.ts" label="lib/escrow-math.ts" compact />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mt-6 min-w-0">
        {/* Sliders Area */}
        <div className="lg:col-span-6 space-y-6 min-w-0">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Coins size={14} className="text-[var(--gold)]" /> Item Value / Gross Collateral
              </label>
              <span className="font-mono text-sm font-bold text-[var(--gold)]">
                {collateral.toLocaleString()} NIM
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={25000}
              step={10}
              value={collateral}
              onChange={(e) => setCollateral(Number(e.target.value))}
              className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--gold)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--ink3)] mt-1">
              <span>10 NIM (Micro)</span>
              <span>10,000 NIM (Camera)</span>
              <span>25,000 NIM (Drone)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Percent size={14} className="text-[var(--verdigris)]" /> Participant Trust Score (0–100)
              </label>
              <span className="font-mono text-sm font-bold text-[var(--verdigris)]">
                {trustScore} / 100
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={trustScore}
              onChange={(e) => setTrustScore(Number(e.target.value))}
              className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--verdigris)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--ink3)] mt-1">
              <span>0 (New)</span>
              <span>30 (Proven)</span>
              <span>60 (Sovereign)</span>
              <span>100 (Max)</span>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-black/30 border border-[var(--line)] text-xs space-y-2">
            <div className="flex items-center gap-2 font-mono text-[var(--gold)] text-[11px] font-semibold">
              <Info size={13} /> Collateral Formula (lib/escrow-math.ts)
            </div>
            <p className="text-[var(--ink2)] leading-relaxed text-[11.5px]">
              Every trust point earns <strong>0.3% discount</strong> up to the <strong>30% ceiling</strong>:
            </p>
            <div className="p-2 rounded-lg bg-black/50 font-mono text-[11px] text-[var(--gold2)] overflow-x-auto whitespace-pre">
              discountRate = min(0.30, trustScore * 0.003)
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 rounded-2xl bg-black/40 border border-[var(--line)] relative min-w-0">
          <div className="space-y-4">
            <span className="caps text-[9px] text-[var(--ink3)] tracking-widest block">
              Vault Custody Breakdown
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[var(--ink2)]">
                <span>Standard Escrow Lock:</span>
                <span className="font-mono text-[var(--ink)] line-through">{collateral} NIM</span>
              </div>
              <div className="flex justify-between text-[var(--verdigris)]">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> Trust Discount ({discountPercent}%):
                </span>
                <span className="font-mono font-bold">−{discountAmount} NIM</span>
              </div>
              <div className="pt-2 border-t border-[var(--line)] flex justify-between items-baseline">
                <span className="font-semibold text-[var(--ink)]">Actual NIM Required to Lock:</span>
                <span className="font-mono text-xl font-bold text-[var(--gold)]">
                  {requiredLock} NIM
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--line)] space-y-2 text-[11px] text-[var(--ink3)]">
              <div className="flex justify-between">
                <span>Vault Retention (0.001 NIM) + Gas (0.0001 NIM):</span>
                <span className="font-mono text-[var(--ink2)]">{settleFee} NIM</span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--verdigris)]">
                <span>Net Returned to Challenger on Completion:</span>
                <span className="font-mono">{netReturn} NIM</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs">
            <span className="text-[var(--ink2)]">Liquidity Saved Upfront:</span>
            <span className="font-mono font-bold text-[var(--verdigris)] px-2.5 py-1 rounded-lg bg-[var(--verdigris)]/10 border border-[var(--verdigris)]/30">
              +{discountAmount} NIM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
